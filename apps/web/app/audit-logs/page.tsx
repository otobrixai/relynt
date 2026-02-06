//web/app/audit-logs/page.tsx

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import { 
  Activity
} from 'lucide-react'
import AuditLogsClient from './AuditLogsClient'

export default async function AuditLogsPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get user's first organization
  const { data: memberships } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .limit(1)

  if (!memberships || memberships.length === 0) {
    return (
      <div className="flex h-screen bg-bg-primary overflow-hidden text-white">
        <Sidebar />
        <main className="flex-1 flex flex-col items-center justify-center bg-cyber-grid relative">
          <div className="absolute inset-0 bg-mesh-gradient pointer-events-none" />
          <div className="relative z-10 glass-panel p-12 max-w-lg text-center border-dashed border-2 border-white/5">
            <Activity className="w-16 h-16 text-slate-800 mx-auto mb-6 animate-pulse" />
            <h2 className="text-2xl font-bold text-white mb-4">No Repository Cluster Found</h2>
            <p className="text-slate-500 mb-8 font-medium">Provision a security boundary to begin observational logging.</p>
            <Link href="/settings" className="btn-primary w-full justify-center">
              Initialize Organization
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const organizationId = memberships[0].organization_id

  // Fetch audit logs for the organization
  const { data: logs } = await supabase
    .from('ai_audit_logs')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="flex h-screen bg-bg-primary overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto bg-cyber-grid relative">
        <div className="absolute inset-0 bg-mesh-gradient pointer-events-none" />
        <AuditLogsClient initialLogs={logs || []} />
      </main>
    </div>
  )
}
