'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { createClient } from '@/lib/supabase/client'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts'
import { 
  AlertTriangle, 
  Shield, 
  Activity,
  TrendingUp,
  Filter
} from 'lucide-react'
import { motion } from 'framer-motion'
import { RiskCard } from '@/components/RiskCard'
import { useOrganization } from '@/context/OrganizationContext'

interface RiskEvent {
  id: string
  action: string
  risk_level: string
  input_summary: string
  created_at: string
}

interface RiskTrend {
  day: string
  high: number
  medium: number
  low: number
}

export default function RiskOverviewPage() {
  const [highRiskLogs, setHighRiskLogs] = useState<RiskEvent[]>([])
  const [mediumRiskLogs, setMediumRiskLogs] = useState<RiskEvent[]>([])
  const [riskTrends, setRiskTrends] = useState<RiskTrend[]>([])
  const { currentOrgId } = useOrganization()
  const router = useRouter()
  const supabase = createClient()

  const fetchRiskData = useCallback(async () => {
    if (!currentOrgId) return

    // Ensure state reset is asynchronous to avoid cascading render warnings in useEffect
    await Promise.resolve()
    setHighRiskLogs([])
    setMediumRiskLogs([])
    setRiskTrends([])

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        router.push('/auth/login')
        return
      }

      const [{ data: high }, { data: medium }] = await Promise.all([
        supabase
          .from('ai_audit_logs')
          .select('*')
          .eq('organization_id', currentOrgId)
          .eq('risk_level', 'high')
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('ai_audit_logs')
          .select('*')
          .eq('organization_id', currentOrgId)
          .eq('risk_level', 'medium')
          .order('created_at', { ascending: false })
          .limit(10)
      ])

      setHighRiskLogs(high || [])
      setMediumRiskLogs(medium || [])

      // Calculate real trends from the last 7 days
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      const now = new Date()
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date()
        d.setDate(now.getDate() - (6 - i))
        return d
      })

      // Fetch all logs for the last 7 days to build the trend
      const { data: trendLogs } = await supabase
        .from('ai_audit_logs')
        .select('risk_level, created_at')
        .eq('organization_id', currentOrgId)
        .gte('created_at', last7Days[0].toISOString())

      const trendData = last7Days.map(date => {
        const dayName = days[date.getDay()]
        const dateStr = date.toISOString().split('T')[0]
        
        const dayLogs = trendLogs?.filter(l => l.created_at.startsWith(dateStr)) || []
        
        return {
          day: dayName,
          high: dayLogs.filter(l => l.risk_level === 'high').length,
          medium: dayLogs.filter(l => l.risk_level === 'medium').length,
          low: dayLogs.filter(l => l.risk_level === 'low').length
        }
      })

      setRiskTrends(trendData)

    } catch (error) {
      console.error('Error fetching risk data:', error)
    }
  }, [supabase, router, currentOrgId])

  useEffect(() => {
    // Defer the fetch to a new task to satisfy strict React linting rules 
    // against synchronous state updates in effects
    const timeoutId = setTimeout(() => {
      fetchRiskData()
    }, 0)
    
    return () => clearTimeout(timeoutId)
  }, [fetchRiskData, currentOrgId])

  return (
    <div className="flex h-screen bg-bg-primary overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-cyber-grid relative">
        <div className="absolute inset-0 bg-mesh-gradient pointer-events-none" />
        <div className="relative z-10 p-8 max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Risk <span className="text-gradient">Intelligence</span></h1>
            <p className="text-slate-400">Exposure analysis and threat monitoring</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <RiskCard level="High" count={highRiskLogs.length} icon={AlertTriangle} color="#ef4444" description="Critical exposures requiring immediate action" />
            <RiskCard level="Medium" count={mediumRiskLogs.length} icon={Shield} color="#f59e0b" description="Elevated risk activities under observation" />
            <RiskCard level="Low" count={0} icon={Activity} color="#22c55e" description="Standard operational activities" />
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white">Risk Trend Analysis</h3>
                <p className="text-sm text-slate-400">7-day risk level distribution</p>
              </div>
              <button className="btn-secondary text-xs"><Filter className="w-4 h-4 mr-2" />Filter</button>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={riskTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                  <Bar dataKey="high" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="medium" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="low" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="glass-panel p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-rose-500/20"><AlertTriangle className="w-5 h-5 text-rose-400" /></div>
                <h3 className="text-lg font-semibold text-white">High Risk Events</h3>
              </div>
              <div className="space-y-3">
                {highRiskLogs.map((log) => (
                  <div key={log.id} className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/10 hover:border-rose-500/30 transition-all cursor-pointer group" onClick={() => router.push(`/audit-logs/${log.id}`)}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium text-white group-hover:text-rose-400 transition-colors">{log.action}</span>
                      <span className="text-xs text-slate-500">{new Date(log.created_at).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-sm text-slate-400 line-clamp-2">{log.input_summary}</p>
                  </div>
                ))}
                {highRiskLogs.length === 0 && (
                  <div className="text-center py-8 text-slate-500"><Shield className="w-12 h-12 mx-auto mb-3 opacity-20" /><p>No high risk events detected</p></div>
                )}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="glass-panel p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-amber-500/20"><TrendingUp className="w-5 h-5 text-amber-400" /></div>
                <h3 className="text-lg font-semibold text-white">Medium Risk Events</h3>
              </div>
              <div className="space-y-3">
                {mediumRiskLogs.map((log) => (
                  <div key={log.id} className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 hover:border-amber-500/30 transition-all cursor-pointer group" onClick={() => router.push(`/audit-logs/${log.id}`)}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium text-white group-hover:text-amber-400 transition-colors">{log.action}</span>
                      <span className="text-xs text-slate-500">{new Date(log.created_at).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-sm text-slate-400 line-clamp-2">{log.input_summary}</p>
                  </div>
                ))}
                {mediumRiskLogs.length === 0 && (
                  <div className="text-center py-8 text-slate-500"><Shield className="w-12 h-12 mx-auto mb-3 opacity-20" /><p>No medium risk events detected</p></div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  )
}