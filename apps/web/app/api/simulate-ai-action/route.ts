import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logAIAction } from '@/lib/audit/logger'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get user's first organization
    const { data: memberships, error: memberError } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .limit(1)
    
    if (memberError || !memberships || memberships.length === 0) {
      return NextResponse.json(
        { error: 'No organization found for user' },
        { status: 400 }
      )
    }
    
    const organizationId = memberships[0].organization_id
    
    // Parse request body
    const body = await request.json()
    const { action, input_summary, output_summary } = body
    
    if (!input_summary || !output_summary) {
      return NextResponse.json(
        { error: 'Input summary and output summary are required' },
        { status: 400 }
      )
    }
    
    // Log the AI action
    const logEntry = await logAIAction({
      organizationId,
      action: action || 'AI Completion',
      inputSummary: input_summary,
      outputSummary: output_summary,
      metadata: {
        model: 'gpt-4',
        latency_ms: Math.floor(Math.random() * 1000) + 500,
        tokens: Math.floor(Math.random() * 500) + 100,
      },
    })
    
    return NextResponse.json({ success: true, log: logEntry })
  } catch (error) {
    console.error('Error simulating AI action:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
