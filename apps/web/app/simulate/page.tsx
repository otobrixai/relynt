//web/app/simulate/page.tsx

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { motion } from 'framer-motion'
import { Shield, AlertTriangle, Terminal, ArrowRight, Zap, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useOrganization } from '@/context/OrganizationContext'

export default function SimulateActionPage() {
  const [inputSummary, setInputSummary] = useState('')
  const [outputSummary, setOutputSummary] = useState('')
  const [action, setAction] = useState('ai_completion')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { currentOrgId } = useOrganization()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const response = await fetch('/api/simulate-ai-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organization_id: currentOrgId,
          action,
          input_summary: inputSummary,
          output_summary: outputSummary,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to log action')
      }

      // Success - redirect to audit logs
      router.push('/audit-logs')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-bg-primary overflow-hidden text-white">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto bg-cyber-grid relative">
        <div className="absolute inset-0 bg-mesh-gradient pointer-events-none" />
        <div className="relative z-10 p-8 max-w-7xl mx-auto">
          {/* Page Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
              <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Neural Simulation Engine</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Action <span className="text-gradient">Simulator</span>
            </h1>
            <p className="text-slate-400">
              Inject synthetic observational nodes into the governance ledger to test risk sensitivity
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="glass-panel p-8 border-white/5 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 opacity-[0.02]">
                  <Zap className="w-48 h-48 text-cyan-400" />
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-xl text-sm flex items-center gap-3"
                    >
                      <AlertTriangle className="w-5 h-5 shrink-0" />
                      {error}
                    </motion.div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="action" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                        Inference Vector
                      </label>
                      <select
                        id="action"
                        value={action}
                        onChange={(e) => setAction(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white appearance-none focus:border-cyan-500/50 outline-none transition-all"
                      >
                        <option value="ai_completion" className="bg-slate-900">AI Completion</option>
                        <option value="ai_chat" className="bg-slate-900">AI Chat Interaction</option>
                        <option value="ai_embedding" className="bg-slate-900">Neural Embedding</option>
                        <option value="ai_moderation" className="bg-slate-900">Dynamic Moderation</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="input" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex justify-between">
                      <span>Input Signal Context</span>
                      <span className="text-cyan-400/60 lowercase italic">Synthetic Stimulus</span>
                    </label>
                    <textarea
                      id="input"
                      rows={4}
                      value={inputSummary}
                      onChange={(e) => setInputSummary(e.target.value)}
                      placeholder="Enter the synthetic input stimulus..."
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:border-cyan-500/50 outline-none transition-all placeholder:text-slate-600 resize-none font-mono"
                    />
                    <div className="flex items-center gap-2 px-1 text-[10px] text-slate-500 italic">
                      <Info className="w-3 h-3 text-cyan-500/50" />
                      Pro Tip: Insert PII (PII123-45-XXXX) to trigger critical risk vectors.
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="output" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                      Inference Result Hash
                    </label>
                    <textarea
                      id="output"
                      rows={4}
                      value={outputSummary}
                      onChange={(e) => setOutputSummary(e.target.value)}
                      placeholder="Enter the synthetic model response..."
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:border-purple-500/50 outline-none transition-all placeholder:text-slate-600 resize-none font-mono"
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary flex-1 justify-center py-4 text-xs tracking-widest uppercase group"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          <span>Processing Signal...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 group-hover:fill-current transition-all" />
                          <span>Commit Observation</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => router.push('/audit-logs')}
                      className="px-8 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl text-xs font-black uppercase tracking-widest border border-white/10 transition-all"
                    >
                      Abort
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>

            <div className="space-y-6">
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-panel p-6 space-y-6 border-white/5"
              >
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Risk Detection Heuristics</h3>
                <div className="space-y-4">
                  {[
                    { level: 'high', label: 'CRITICAL', desc: 'SSN, Credentials, PII leaking in signal.', color: 'rose' },
                    { level: 'medium', label: 'ELEVATED', desc: 'Financial data or internal project IDs.', color: 'amber' },
                    { level: 'low', label: 'NOMINAL', desc: 'General chatter or public data vectors.', color: 'emerald' },
                  ].map((item) => (
                    <div key={item.level} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors group">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                        `bg-${item.color}-500/10 text-${item.color}-400`
                      )}>
                        <Shield className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn("text-[9px] font-black uppercase tracking-tighter", `text-${item.color}-400`)}>{item.label}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium leading-tight">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-6 rounded-4xl bg-linear-to-br from-slate-900 to-bg-primary border border-white/5 text-slate-400 relative overflow-hidden"
              >
                <div className="relative z-10 flex items-start gap-3">
                  <Terminal className="w-5 h-5 text-cyan-400 shrink-0" />
                  <div>
                    <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Simulation Mode</h4>
                    <p className="text-[10px] leading-relaxed italic">
                      All simulated actions are hashed with a <span className="text-cyan-400">test-mode-nonce</span> but are otherwise treated as legitimate observational nodes in the primary ledger.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
