'use client'

import { useState, useRef, useEffect } from 'react'
import { useOrganization } from '@/context/OrganizationContext'
import { ChevronDown, Globe, Check, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

export default function OrganizationSwitcher() {
  const { currentOrgId, setCurrentOrgId, organizations, loading } = useOrganization()
  const [isOpen, setIsOpen] = useState(false)
  const [isSwitching, setIsSwitching] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentOrg = organizations.find(o => o.id === currentOrgId)
  
  useEffect(() => {
    if (isOpen) {
      console.log('Switcher opened. Org count:', organizations.length)
      console.log('Current Org ID:', currentOrgId)
    }
  }, [isOpen, organizations, currentOrgId])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/5 animate-pulse">
        <Loader2 className="w-4 h-4 text-cyan-500 animate-spin" />
        <div className="h-4 w-24 bg-slate-800 rounded" />
      </div>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group",
          isOpen 
            ? "bg-cyan-500/10 border-cyan-500/30 ring-4 ring-cyan-500/5 shadow-glow" 
            : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20",
          "border"
        )}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div className={cn(
            "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors relative",
            isOpen ? "bg-cyan-500 text-white shadow-[0_0_10px_rgba(6,182,212,0.4)]" : "bg-slate-800 text-slate-400 group-hover:bg-slate-700"
          )}>
            {isSwitching ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Globe className="w-4 h-4" />
            )}
          </div>
          <div className="text-left overflow-hidden">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Active Boundary</p>
            <p className="text-sm font-bold text-white truncate max-w-[120px]">
              {currentOrg?.name || 'Select Entity'}
            </p>
          </div>
        </div>
        <ChevronDown className={cn(
          "w-4 h-4 text-slate-500 transition-transform duration-300 shrink-0",
          isOpen ? "rotate-180 text-cyan-400" : "group-hover:text-white"
        )} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 5, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", bounce: 0, duration: 0.2 }}
            className="absolute top-full left-0 right-0 z-100 mt-2 p-2 rounded-2xl border border-white/20 bg-bg-primary shadow-2xl shadow-cyan-500/40 ring-1 ring-white/10 opacity-100 pointer-events-auto"
          >
            <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
              {organizations.length > 0 ? (
                organizations.map((org) => (
                  <button
                    key={org.id}
                    onClick={async () => {
                      if (currentOrgId === org.id) {
                        setIsOpen(false)
                        return
                      }
                      
                      setIsSwitching(true)
                      setCurrentOrgId(org.id)
                      setIsOpen(false)
                      
                      // Auto-reset switching state after a short delay
                      setTimeout(() => setIsSwitching(false), 800)
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all text-sm group",
                      currentOrgId === org.id 
                        ? "bg-cyan-500/10 text-cyan-400" 
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className={cn(
                        "w-2 h-2 rounded-full shrink-0",
                        currentOrgId === org.id ? "bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]" : "bg-slate-700"
                      )} />
                      <span className="truncate font-bold tracking-tight">{org.name}</span>
                    </div>
                    {currentOrgId === org.id && (
                      <Check className="w-4 h-4 text-cyan-400" />
                    )}
                  </button>
                ))
              ) : (
                <div className="px-3 py-6 text-center">
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">No Entities Detected</p>
                  <p className="text-[11px] text-slate-500">Initialize a workspace to begin</p>
                </div>
              )}
            </div>
            
            <div className="mt-2 pt-2 border-t border-white/5 px-2">
              <button 
                onClick={() => {
                  window.location.href = '/settings?tab=general'
                  setIsOpen(false)
                }}
                className="w-full py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-cyan-400 transition-colors text-left"
              >
                + Provision New Entity
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
