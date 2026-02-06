'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { createClient } from '@/lib/supabase/client'
import { useOrganization } from '@/context/OrganizationContext'
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { 
  Shield,
  AlertTriangle,
  Zap,
  Database,
  Server,
  Brain,
  Lock,
  Activity
} from 'lucide-react'
import { motion } from 'framer-motion'
import { StatCard } from '@/components/StatCard'

interface AuditLog {
  id: string
  action: string
  risk_level: 'high' | 'medium' | 'low'
  created_at: string
  organization_id: string
}

interface Stats {
  totalLogs: number
  highRiskCount: number
  mediumRiskCount: number
  lowRiskCount: number
  aiActionsToday: number
  systemUptime: number
}

const COLORS = {
  high: '#ef4444',
  medium: '#f59e0b', 
  low: '#22c55e',
  cyan: '#06b6d4',
  purple: '#8b5cf6'
}

export default function DashboardPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [stats, setStats] = useState<Stats>({
    totalLogs: 0,
    highRiskCount: 0,
    mediumRiskCount: 0,
    lowRiskCount: 0,
    aiActionsToday: 0,
    systemUptime: 99.9
  })
  const [timeRange, setTimeRange] = useState('7d')
  const router = useRouter()
  const supabase = createClient()
  const { currentOrgId } = useOrganization()

  const fetchDashboardData = useCallback(async () => {
    if (!currentOrgId) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data: recentLogs } = await supabase
        .from('ai_audit_logs')
        .select('*')
        .eq('organization_id', currentOrgId)
        .order('created_at', { ascending: false })
        .limit(100)

      if (recentLogs) {
        setLogs(recentLogs)
        const highRisk = recentLogs.filter(l => l.risk_level === 'high').length
        const mediumRisk = recentLogs.filter(l => l.risk_level === 'medium').length
        const lowRisk = recentLogs.filter(l => l.risk_level === 'low').length
        const today = new Date().toISOString().split('T')[0]
        const todayLogs = recentLogs.filter(l => l.created_at.startsWith(today)).length

        setStats({
          totalLogs: recentLogs.length,
          highRiskCount: highRisk,
          mediumRiskCount: mediumRisk,
          lowRiskCount: lowRisk,
          aiActionsToday: todayLogs,
          systemUptime: 99.9
        })
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    }
  }, [supabase, router, currentOrgId])

  useEffect(() => {
    // Clear old data when switching organizations to ensure isolation
    setLogs([])
    setStats({
      totalLogs: 0,
      highRiskCount: 0,
      mediumRiskCount: 0,
      lowRiskCount: 0,
      aiActionsToday: 0,
      systemUptime: 99.9
    })
    
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDashboardData()
    const interval = setInterval(fetchDashboardData, 30000)
    return () => clearInterval(interval)
  }, [fetchDashboardData, currentOrgId])

  const riskDistributionData = [
    { name: 'High Risk', value: stats.highRiskCount, color: COLORS.high },
    { name: 'Medium Risk', value: stats.mediumRiskCount, color: COLORS.medium },
    { name: 'Low Risk', value: stats.lowRiskCount, color: COLORS.low },
  ]

  const activityData = logs.slice(0, 10).map((log, idx) => ({
    time: new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    risk: log.risk_level === 'high' ? 3 : log.risk_level === 'medium' ? 2 : 1,
    index: idx
  })).reverse()

  return (
    <div className="flex h-screen bg-bg-primary overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-cyber-grid relative">
        <div className="absolute inset-0 bg-mesh-gradient pointer-events-none" />
        <div className="relative z-10 p-8 max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex justify-between items-end">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="status-dot status-online" />
                <span className="text-xs font-medium text-emerald-400 uppercase tracking-widest">System Operational</span>
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">Command <span className="text-gradient">Center</span></h1>
              <p className="text-slate-400">Real-time AI governance and risk monitoring</p>
            </div>
            <div className="flex gap-3">
              {['24h', '7d', '30d'].map((range) => (
                <button key={range} onClick={() => setTimeRange(range)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${timeRange === range ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                  {range === '24h' ? 'Last 24 Hours' : `Last ${range}`}
                </button>
              ))}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard title="Total AI Interactions" value={stats.totalLogs.toLocaleString()} subtitle="Across all systems" icon={Brain} trend="+12.5%" trendUp={true} delay={0} />
            <StatCard title="High Risk Events" value={stats.highRiskCount} subtitle="Requires immediate attention" icon={AlertTriangle} trend="-5.2%" trendUp={false} delay={0.1} />
            <StatCard title="Actions Today" value={stats.aiActionsToday} subtitle="Since midnight UTC" icon={Zap} delay={0.2} />
            <StatCard title="System Uptime" value={`${stats.systemUptime}%`} subtitle="Last 30 days average" icon={Server} delay={0.3} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} className="lg:col-span-2 glass-panel p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-white">Risk Activity Timeline</h3>
                  <p className="text-sm text-slate-400">Real-time risk level fluctuations</p>
                </div>
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-rose-500" /><span className="text-slate-400">High</span></div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500" /><span className="text-slate-400">Medium</span></div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500" /><span className="text-slate-400">Low</span></div>
                </div>
              </div>
              <div className="h-[300px] min-h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activityData}>
                    <defs><linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={COLORS.cyan} stopOpacity={0.3}/><stop offset="95%" stopColor={COLORS.cyan} stopOpacity={0}/></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} domain={[0, 3]} ticks={[1, 2, 3]} tickFormatter={(value: number) => ['Low', 'Med', 'High'][value-1]} />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                    <Area type="monotone" dataKey="risk" stroke={COLORS.cyan} fillOpacity={1} fill="url(#colorRisk)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }} className="glass-panel p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Risk Distribution</h3>
              <p className="text-sm text-slate-400 mb-6">Current threat landscape</p>
              <div className="h-[250px] min-h-[250px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={riskDistributionData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {riskDistributionData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                  <span className="text-3xl font-bold text-white">{stats.totalLogs}</span>
                  <span className="text-xs text-slate-400 uppercase tracking-widest">Total</span>
                </div>
              </div>
              <div className="space-y-3 mt-4">
                {riskDistributionData.map((item) => (
                  <div key={item.name} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm text-slate-300">{item.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="lg:col-span-2 glass-panel p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
                <button onClick={() => router.push('/audit-logs')} className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">View All →</button>
              </div>
              <div className="space-y-3">
                {logs.slice(0, 5).map((log, idx) => (
                  <motion.div key={log.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 + (idx * 0.1) }} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-cyan-500/30 transition-all group cursor-pointer" onClick={() => router.push(`/audit-logs/${log.id}`)}>
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full ${log.risk_level === 'high' ? 'bg-rose-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : log.risk_level === 'medium' ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]'}`} />
                      <div>
                        <p className="text-sm font-medium text-white group-hover:text-cyan-400 transition-colors">{log.action}</p>
                        <p className="text-xs text-slate-500">{new Date(log.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${log.risk_level === 'high' ? 'bg-rose-500/20 text-rose-400' : log.risk_level === 'medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>{log.risk_level.toUpperCase()}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="space-y-4">
              <div className="glass-panel p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button onClick={() => router.push('/simulate')} className="w-full btn-primary justify-center group"><Activity className="w-4 h-4 group-hover:animate-pulse" />Simulate AI Action</button>
                  <button onClick={() => router.push('/risk-overview')} className="w-full btn-secondary justify-center"><Shield className="w-4 h-4" />Risk Assessment</button>
                  <button onClick={() => router.push('/settings')} className="w-full btn-secondary justify-center"><Lock className="w-4 h-4" />Security Settings</button>
                </div>
              </div>
              <div className="glass-panel p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><Database className="w-16 h-16 text-cyan-400" /></div>
                <h4 className="text-sm font-semibold text-slate-300 mb-2">Data Retention</h4>
                <p className="text-2xl font-bold text-white mb-1">90 Days</p>
                <p className="text-xs text-slate-500">Audit logs automatically archived after period</p>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  )
}