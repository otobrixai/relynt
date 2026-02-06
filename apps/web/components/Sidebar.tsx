'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { 
  Shield, 
  Settings, 
  LogOut, 
  Activity,
  Command,
  Database
} from 'lucide-react'
import { cn } from '@/lib/utils'
import OrganizationSwitcher from './OrganizationSwitcher'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Command },
  { name: 'Audit Logs', href: '/audit-logs', icon: Database },
  { name: 'Risk Overview', href: '/risk-overview', icon: Shield },
  { name: 'Simulate', href: '/simulate', icon: Activity },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Only imports needed
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <div className="w-72 h-screen bg-[#0f1629] border-r border-white/5 flex flex-col shrink-0 relative animate-fade-in">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-linear-to-b from-cyan-500/5 to-transparent pointer-events-none" />
      
      {/* Logo */}
      <div className="px-6 py-8 relative z-10">
        <div className="flex items-center gap-3 slide-in-left">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              Relynt
            </h1>
            <p className="text-[10px] text-cyan-400 uppercase tracking-widest font-medium">AI Governance</p>
          </div>
        </div>
      </div>
      {/* Organization Switcher */}
      <div className="px-4 py-4 relative z-40">
        <OrganizationSwitcher />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 relative z-10">
        <div className="space-y-1">
          {navigation.map((item, idx) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            
            return (
              <div key={item.name} style={{ animationDelay: `${idx * 50}ms` }} className="slide-in-left">
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                    isActive 
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  )}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-cyan-400 rounded-r-full shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
                  )}
                  <Icon className={cn(
                    "w-5 h-5 transition-colors",
                    isActive ? "text-cyan-400" : "text-slate-500 group-hover:text-white"
                  )} />
                  <span>{item.name}</span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)] animate-pulse" />
                  )}
                </Link>
              </div>
            )
          })}
        </div>

        {/* Stats Section */}
        <div className="mt-8 px-4 animate-fade-in" style={{ animationDelay: '300ms' }}>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">System Status</p>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">API Latency</span>
              <span className="text-emerald-400 font-mono">24ms</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Models Active</span>
              <span className="text-cyan-400 font-mono">3</span>
            </div>
            <div className="h-1 bg-slate-800 rounded-full overflow-hidden mt-2">
              <div className="h-full bg-linear-to-r from-cyan-500 to-blue-500 w-[85%] rounded-full animate-shimmer" />
            </div>
          </div>
        </div>
      </nav>

      {/* User & Settings */}
      <div className="mt-auto border-t border-white/5 p-4 relative z-10 bg-[#0f1629]">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-red-500/10 hover:border-red-500/20 border border-transparent transition-all group"
        >
          <LogOut className="w-5 h-5 group-hover:text-red-400 transition-colors" />
          <span>Terminate Session</span>
        </button>
      </div>
    </div>
  )
}