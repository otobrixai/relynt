import { z } from 'zod';

export const OrganizationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  created_at: z.string().datetime(),
});

export const OrganizationMemberSchema = z.object({
  organization_id: z.string().uuid(),
  user_id: z.string().uuid(),
  role: z.enum(['admin', 'member']),
  created_at: z.string().datetime(),
});

export const RiskLevelSchema = z.enum(['low', 'medium', 'high']);

export const AiAuditLogSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  actor_id: z.string().uuid(),
  action: z.string(),
  input_summary: z.string(),
  output_summary: z.string(),
  risk_level: RiskLevelSchema,
  metadata: z.record(z.unknown()), // JSONB
  created_at: z.string().datetime(),
});

export type Organization = z.infer<typeof OrganizationSchema>;
export type OrganizationMember = z.infer<typeof OrganizationMemberSchema>;
export type AiAuditLog = z.infer<typeof AiAuditLogSchema>;
export type RiskLevel = z.infer<typeof RiskLevelSchema>;
