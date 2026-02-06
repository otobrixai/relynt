'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Activity, 
  TrendingUp,
  Search,
  Filter,
  ArrowRight,
  Terminal,
  Loader2
} from 'lucide-react'
import { useOrganization } from '@/context/OrganizationContext'
import { createClient } from '@/lib/supabase/client'
import { useEffect } from 'react'

interface AuditLog {
  id: string
  action: string
  input_summary: string
  output_summary: string
  risk_level: 'low' | 'medium' | 'high'
  metadata: Record<string, unknown> | null
  created_at: string
}

interface AuditLogsClientProps {
  initialLogs: AuditLog[]
}

export default function AuditLogsClient({ initialLogs }: AuditLogsClientProps) {
  const [logs, setLogs] = useState<AuditLog[]>(initialLogs)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [riskFilter, setRiskFilter] = useState('all')
  const { currentOrgId } = useOrganization()
  const supabase = createClient()

  useEffect(() => {
    const fetchLogs = async () => {
      if (!currentOrgId) return
      
      setLogs([])
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('ai_audit_logs')
          .select('*')
          .eq('organization_id', currentOrgId)
          .order('created_at', { ascending: false })
          .limit(100)

        if (error) throw error
        setLogs(data || [])
      } catch (err) {
        console.error('Failed to fetch logs:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchLogs()
  }, [currentOrgId, supabase])

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = 
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.input_summary.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesRisk = riskFilter === 'all' || log.risk_level === riskFilter

      return matchesSearch && matchesRisk
    })
  }, [logs, searchTerm, riskFilter])

  return (
    <div className="relative z-10 p-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <motion.header 
        initial="initial"
        animate="animate"
        variants={{
          initial: { opacity: 0, y: -20 },
          animate: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } }
        }}
        className="mb-8 flex justify-between items-end"
      >
        <div className="space-y-1">
        <motion.div variants={{ initial: { opacity: 0, x: -10 }, animate: { opacity: 1, x: 0 } }} className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)] animate-shimmer" />
            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Live Governance Stream</span>
        </motion.div>
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Audit <span className="text-gradient">Ledger</span>
          </h1>
          <p className="text-slate-400">
            Historical immutable logs and recursive security verification
          </p>
        </div>
        <Link href="/simulate" className="btn-primary group">
          <Activity className="w-4 h-4 group-hover:animate-pulse" />
          <span>Generate Signal</span>
        </Link>
      </motion.header>

      {/* Filtration Engine */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="glass-panel p-6 mb-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label htmlFor="risk-filter" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Risk Sensitivity</label>
            <div className="relative">
              <select 
                id="risk-filter" 
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white appearance-none focus:border-cyan-500/50 outline-none transition-all group-hover:border-cyan-500/30"
              >
                <option value="all" className="bg-bg-primary">All Tiers</option>
                <option value="high" className="bg-bg-primary">Critical Risk</option>
                <option value="medium" className="bg-bg-primary">Elevated Risk</option>
                <option value="low" className="bg-bg-primary">Standard Activity</option>
              </select>
              <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="date-filter" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Temporal Window</label>
            <div className="relative">
              <select id="date-filter" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white appearance-none focus:border-cyan-500/50 outline-none transition-all group-hover:border-cyan-500/30">
                <option value="all" className="bg-bg-primary">Full History</option>
                <option value="24h" className="bg-bg-primary">Observation: 24h</option>
                <option value="7d" className="bg-bg-primary">Observation: 7d</option>
                <option value="30d" className="bg-bg-primary">Observation: 30d</option>
              </select>
              <TrendingUp className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="search" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Pattern Search</label>
            <div className="relative">
              <input 
                type="text" 
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search logs..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-500/50 outline-none transition-all pr-10"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Audit Data Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-panel overflow-hidden relative"
      >
        {loading && (
          <div className="absolute inset-0 z-20 bg-bg-primary/50 backdrop-blur-sm flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="py-5 px-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Observation Time</th>
                <th className="py-5 px-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Action Vector</th>
                <th className="py-5 px-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Risk Status</th>
                <th className="py-5 px-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Input Context</th>
                <th className="py-5 px-6 text-right text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log, idx) => (
                  <motion.tr 
                    key={log.id} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + (idx * 0.03) }}
                    className="group hover:bg-cyan-500/5 transition-all glass-card-hover border-b border-white/5 last:border-0"
                  >
                    <td className="py-5 px-6">
                      <span className="text-xs font-medium text-slate-400 font-mono">
                        {new Date(log.created_at).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
                        <span className="text-sm font-semibold text-white group-hover:text-cyan-400 transition-colors">{log.action}</span>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        log.risk_level === 'high' 
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/20' 
                          : log.risk_level === 'medium' 
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/20' 
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {log.risk_level} Risk
                      </span>
                    </td>
                    <td className="py-5 px-6 max-w-xs">
                       <code className="text-[10px] bg-black/40 px-2 py-1 rounded text-slate-400 block truncate border border-white/5 group-hover:border-cyan-500/20 transition-colors">
                        {log.input_summary.substring(0, 40)}{log.input_summary.length > 40 ? '...' : ''}
                       </code>
                    </td>
                    <td className="py-5 px-6 text-right">
                      <Link 
                        href={`/audit-logs/${log.id}`}
                        className="btn-secondary text-xs py-1.5 px-3 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Inspect
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Link>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    <Terminal className="w-8 h-8 mx-auto mb-3 opacity-50" />
                    No provenance logs detected in this sector
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
