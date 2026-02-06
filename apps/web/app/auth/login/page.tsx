//web/app/auth/login/page.tsx

'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

import { 
  Lock, 
  Mail, 
  ArrowRight, 
  ShieldCheck,
  Activity,
  Github
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-bg-primary text-white font-inter relative overflow-hidden flex items-center justify-center">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-cyber-grid pointer-events-none" />
      <div className="absolute inset-0 bg-mesh-gradient pointer-events-none" />
      
      <div className="w-full max-w-[440px] px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Logo/Branding */}
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 flex items-center justify-center mb-6 border border-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.15)] group relative">
               <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
               <ShieldCheck className="w-8 h-8 text-cyan-400 relative z-10" />
            </div>
            <h1 className="text-3xl font-black tracking-tight mb-2">RELYNT <span className="text-gradient">OPS</span></h1>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
              Secure Intelligence Portal
            </p>
          </div>

          <div className="glass-panel p-8 border-white/10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
              <Lock className="w-32 h-32 text-white" />
            </div>

            <form onSubmit={handleLogin} className="space-y-5 relative z-10">
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3"
                  >
                    <Activity className="w-4 h-4 text-rose-500 shrink-0" />
                    <p className="text-[11px] font-bold text-rose-400">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Security Principal</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                    <input
                      type="email"
                      placeholder="Email Address"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white outline-none focus:border-cyan-500/50 focus:bg-white/[0.07] transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Access Key</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white outline-none focus:border-cyan-500/50 focus:bg-white/[0.07] transition-all"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-4 mt-4 shadow-[0_0_20px_rgba(6,182,212,0.2)]"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span className="text-xs font-black uppercase tracking-widest">Verifying Identity...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-xs font-black uppercase tracking-widest">Access Boundary</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </button>

              <div className="pt-6 mt-6 border-t border-white/5">
                <p className="text-center text-xs text-slate-500 mb-4 font-medium uppercase tracking-tighter">Authorized Protocols Only</p>
                <button 
                  type="button"
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-300 transition-all"
                >
                  <Github className="w-4 h-4" />
                  GitHub Integration
                </button>
              </div>

              <div className="text-center mt-6">
                <a href="/auth/signup" className="text-[10px] font-black text-cyan-400 hover:text-cyan-300 uppercase tracking-widest transition-colors inline-flex items-center gap-2 group">
                  Initialize New Identity
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </a>
              </div>
            </form>
          </div>

          <p className="mt-8 text-center text-[9px] font-black text-slate-600 uppercase tracking-[0.4em]">
            &copy; 2026 Relynt Intelligence Operations.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
