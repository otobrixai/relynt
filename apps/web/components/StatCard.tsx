import { motion } from 'framer-motion'
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'

export interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: string
  trendUp?: boolean
  delay: number
  iconColor?: string
}

export const StatCard = ({ title, value, subtitle, icon: Icon, trend, trendUp, delay }: StatCardProps) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="metric-card glass-card-hover group"
  >
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 rounded-xl bg-white/5 border border-white/10 group-hover:border-cyan-500/30 transition-colors">
        <Icon className="w-6 h-6 text-cyan-400" />
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-sm ${trendUp ? 'text-emerald-400' : 'text-rose-400'}`}>
          {trendUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {trend}
        </div>
      )}
    </div>
    <h3 className="text-3xl font-bold text-white mb-1">{value}</h3>
    <p className="text-slate-400 text-sm">{title}</p>
    {subtitle && <p className="text-slate-500 text-xs mt-2">{subtitle}</p>}
  </motion.div>
)
