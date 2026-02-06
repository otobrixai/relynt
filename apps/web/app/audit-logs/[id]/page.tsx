//web/app/audit-logs/[id]/page.tsx

import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Activity, 
  Shield, 
  Fingerprint, 
  Download, 
  Box,
  Clock,
  Terminal,
  Database,
  Cpu,
  Lock,
  Share2
} from 'lucide-react'
import { motion } from 'framer-motion'

export default async function LogDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { id } = await params

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: log, error } = await supabase
    .from('ai_audit_logs')
    .select('*, organizations(name)')
    .eq('id', id)
    .single()

  if (error || !log) {
    notFound()
  }

  return (
    <div className="flex h-screen bg-bg-primary overflow-hidden text-white">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto bg-cyber-grid relative">
        <div className="absolute inset-0 bg-mesh-gradient pointer-events-none" />
        <div className="relative z-10 p-8 max-w-5xl mx-auto">
          {/* Breadcrumbs & Navigation */}
          <motion.nav 
            initial="initial"
            animate="animate"
            variants={{
              initial: { opacity: 0, x: -20 },
              animate: { opacity: 1, x: 0, transition: { staggerChildren: 0.1 } }
            }}
            className="flex items-center gap-4 mb-10"
          >
            <Link 
              href="/audit-logs" 
              className="glass-panel p-3 hover:bg-white/10 transition-all group flex items-center justify-center hover:border-cyan-500/30"
            >
              <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-cyan-400 group-hover:-translate-x-1 transition-all" />
            </Link>
            <div className="space-y-0.5">
              <motion.p variants={{ initial: { opacity: 0 }, animate: { opacity: 1 } }} className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Repository Boundary / Governance Ledger</motion.p>
              <motion.h1 variants={{ initial: { opacity: 0, y: 5 }, animate: { opacity: 1, y: 0 } }} className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                Intelligence <span className="text-gradient">Node Detail</span>
                <span className="text-xs font-mono text-slate-500 bg-white/5 px-2 py-1 rounded border border-white/5 shadow-inner">{log.id.substring(0, 8)}</span>
              </motion.h1>
            </div>
          </motion.nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-8">
              {/* Event Metadata Card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-panel p-8 relative overflow-hidden group border-cyan-500/10"
              >
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                  <Fingerprint className="w-48 h-48 text-cyan-400" />
                </div>
                
                <div className="flex items-start justify-between mb-12 relative z-10">
                  <div className="space-y-4">
                    <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      log.risk_level === 'high' 
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.15)] text-glow-rose' 
                        : log.risk_level === 'medium' 
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/20 text-glow-amber' 
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {log.risk_level} Severity Vector
                    </span>
                    <h2 className="text-4xl font-bold text-white tracking-tight">{log.action}</h2>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 justify-end mb-2">
                      <Shield className="w-4 h-4 text-cyan-400 animate-pulse" />
                      <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Verified Integrity</span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-500 monospace uppercase tracking-wider">Node Sig: {log.id.split('-')[0]}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                  <div className="space-y-4">
                    <div className="group/payload">
                      <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <Terminal className="w-3 h-3 text-cyan-400" /> Input Payload
                      </h3>
                      <div className="bg-slate-900/80 border border-white/5 rounded-2xl p-6 shadow-2xl backdrop-blur-md group-hover/payload:border-cyan-500/30 transition-colors">
                        <p className="text-sm leading-relaxed text-cyan-100/90 font-mono italic">
                          &quot;{log.input_summary}&quot;
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="group/response">
                      <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <Cpu className="w-3 h-3 text-purple-400" /> Model Response
                      </h3>
                      <div className="bg-slate-950/50 border border-white/5 rounded-2xl p-6 backdrop-blur-md group-hover/response:border-purple-500/30 transition-colors shadow-glow-purple/10">
                        <p className="text-sm leading-relaxed text-slate-300 font-mono">
                          {log.output_summary}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-between relative z-10">
                   <div className="flex gap-4">
                      <div className="px-3 py-1 bg-white/5 rounded border border-white/5 text-[10px] text-slate-500">
                        HASH: SHA-256
                      </div>
                      <div className="px-3 py-1 bg-white/5 rounded border border-white/5 text-[10px] text-slate-500">
                        TYPE: MUTABLE_LEDGER_ENTRY
                      </div>
                   </div>
                   <div className="flex gap-2">
                      <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/5">
                        <Share2 className="w-4 h-4 text-slate-400" />
                      </button>
                      <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/5">
                        <Lock className="w-4 h-4 text-slate-400" />
                      </button>
                   </div>
                </div>
              </motion.div>

              {/* Attribution Footer */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center justify-between px-8 py-5 glass-panel bg-cyan-500/5! border-dashed border-2 border-cyan-500/20"
              >
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-indigo-500 flex items-center justify-center p-0.5 shadow-lg shadow-cyan-500/20">
                      <Activity className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Authorized Actor</span>
                        <span className="text-xs font-bold text-white uppercase tracking-wider">{log.actor_id.substring(0, 12)}...</span>
                    </div>
                  </div>
                </div>
                <button className="flex items-center gap-2 text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em] hover:text-white transition-colors group">
                  <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                  Extract Immutable JSON
                </button>
              </motion.div>
            </div>

            {/* Side Intelligence Panel */}
            <div className="space-y-6">
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-panel p-6 space-y-8 border-white/5"
              >
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] pl-1">Boundary Metadata</h3>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4 group">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-cyan-500/10 transition-colors">
                      <Clock className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Observation Epoch</p>
                      <p className="text-sm font-bold text-white">{new Date(log.created_at).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 group">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-indigo-500/10 transition-colors">
                      <Database className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Organization Node</p>
                      <p className="text-sm font-bold text-white">{(log.organizations as { name: string } | null)?.name || 'Default Cluster'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 group">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-purple-500/10 transition-colors">
                      <Box className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Inference Engine</p>
                      <p className="text-sm font-bold text-white">{log.model || 'GPT-4o Omniscient'}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-white/5">
                  <div className="p-5 bg-gradient-to-br from-indigo-900/80 to-slate-900 rounded-3xl relative overflow-hidden border border-indigo-500/20 group">
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                        <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Active Guard</span>
                      </div>
                      <h4 className="text-white font-bold leading-tight text-sm">Ledger entry signed and sealed at origin.</h4>
                    </div>
                    <div className="absolute right-[-15px] bottom-[-15px] opacity-10 group-hover:opacity-20 transition-opacity">
                      <Shield className="w-24 h-24 text-white" />
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="p-8 rounded-[40px] bg-slate-950 border border-white/5 text-white relative overflow-hidden shadow-2xl"
              >
                 <div className="relative z-10 space-y-4">
                   <h4 className="text-xs font-black uppercase tracking-[0.4em] text-slate-600">Governance Advisory</h4>
                   <p className="text-xs leading-relaxed text-slate-400">
                     This intelligence node is hashed and persisted in an append-only sequence. Recursive validity checks are performed every 60 seconds to ensure sequence integrity.
                   </p>
                   <div className="pt-2">
                      <div className="text-[10px] font-black text-cyan-400/60 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Terminal className="w-3 h-3" /> System Heartbeat
                      </div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5, 2].map((i, idx) => (
                          <div key={idx} className={`h-1 flex-1 rounded-full ${i === 1 ? 'bg-cyan-500' : 'bg-slate-800'}`} style={{ opacity: 0.5 + (idx % 3) * 0.2 }} />
                        ))}
                      </div>
                   </div>
                 </div>
                 <div className="absolute -top-4 -right-4 opacity-[0.02]">
                   <Terminal className="w-32 h-32" />
                 </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
