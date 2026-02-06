import { createClient } from '@/lib/supabase/server'
import type { RiskLevel } from '@relynt/shared'

/**
 * Risk detection rules (deterministic, no AI)
 * These are simple pattern-based rules to classify risk levels
 */
function detectRiskLevel(input: string, output: string): RiskLevel {
  const combinedText = `${input} ${output}`.toLowerCase()
  
  // High risk patterns
  const highRiskPatterns = [
    /\b\d{3}-\d{2}-\d{4}\b/, // SSN
    /\b\d{16}\b/, // Credit card
    /password/i,
    /api[_-]?key/i,
    /secret/i,
    /private[_-]?key/i,
  ]
  
  for (const pattern of highRiskPatterns) {
    if (pattern.test(combinedText)) {
      return 'high'
    }
  }
  
  // Medium risk patterns
  const mediumRiskPatterns = [
    /\$\d+/,  // Dollar amounts
    /payment/i,
    /transaction/i,
    /invoice/i,
    /billing/i,
  ]
  
  for (const pattern of mediumRiskPatterns) {
    if (pattern.test(combinedText)) {
      return 'medium'
    }
  }
  
  return 'low'
}

interface LogAIActionParams {
  organizationId: string
  action: string
  inputSummary: string
  outputSummary: string
  metadata?: Record<string, unknown>
}

/**
 * Log an AI action to the audit trail
 * This is the CRITICAL function that ensures all AI decisions are tracked
 * 
 * SECURITY: This function enforces that logs are scoped to the user's organization
 * The RLS policies will prevent users from inserting logs for other organizations
 */
export async function logAIAction({
  organizationId,
  action,
  inputSummary,
  outputSummary,
  metadata = {},
}: LogAIActionParams) {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('User must be authenticated to log AI actions')
  }
  
  // Detect risk level based on content
  const riskLevel = detectRiskLevel(inputSummary, outputSummary)
  
  // Insert audit log
  // RLS policy will ensure this user can only insert logs for their own organizations
  const { data, error } = await supabase
    .from('ai_audit_logs')
    .insert({
      organization_id: organizationId,
      actor_id: user.id,
      action,
      input_summary: inputSummary,
      output_summary: outputSummary,
      risk_level: riskLevel,
      metadata,
    })
    .select()
    .single()
  
  if (error) {
    console.error('Failed to log AI action:', error)
    throw new Error(`Failed to log AI action: ${error.message}`)
  }
  
  return data
}

/**
 * Get audit logs for an organization
 * RLS policies ensure users can only see logs from their own organizations
 */
export async function getAuditLogs(organizationId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('ai_audit_logs')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Failed to fetch audit logs:', error)
    throw new Error(`Failed to fetch audit logs: ${error.message}`)
  }
  
  return data
}
