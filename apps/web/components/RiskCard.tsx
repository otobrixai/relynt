import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

export interface RiskCardProps {
  level: string
  count: number
  icon: LucideIcon
  color: string
  description: string
}

export const RiskCard = ({ level, count, icon: Icon, color, description }: RiskCardProps) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="glass-panel p-6 border-l-4"
    style={{ borderLeftColor: color }}
  >
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl bg-opacity-10`} style={{ backgroundColor: `${color}20` }}>
        <Icon className="w-6 h-6" style={{ color }} />
      </div>
      <span className="text-3xl font-bold text-white">{count}</span>
    </div>
    <h3 className="text-lg font-semibold text-white mb-1">{level} Risk</h3>
    <p className="text-sm text-slate-400">{description}</p>
  </motion.div>
)
