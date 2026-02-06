//web/app/settings/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { createClient } from '@/lib/supabase/client'
import { useOrganization } from '@/context/OrganizationContext'
import { User } from '@supabase/supabase-js'
import { cn } from '@/lib/utils'
import { 
  Loader2,
  Activity,
  Settings,
  Globe,
  Shield,
  CreditCard,
  Users,
  UserPlus,
  Trash2,
  Copy,
  CheckCircle,
  Database,
  Lock,
  PlusCircle
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Organization {
  id: string
  name: string
  created_at: string
  subscription_tier: 'starter' | 'professional' | 'enterprise'
}

interface TeamMember {
  user_id: string
  role: 'admin' | 'member'
  created_at: string
}

interface SecuritySettings {
  organization_id: string
  mfa_enforced: boolean
  audit_signing: boolean
  temporal_access: boolean
  region_locking: boolean
  updated_at: string
}

interface ApiKey {
  id: string
  organization_id: string
  name: string
  key_prefix: string
  created_at: string
  last_used_at: string | null
  revoked: boolean
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [allMembers, setAllMembers] = useState<TeamMember[]>([])
  const [userRole, setUserRole] = useState<string>('member')
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null)
  const [copying, setCopying] = useState(false)
  const [activeTab, setActiveTab] = useState<'general' | 'team' | 'security' | 'api' | 'billing'>('general')
  
  // Organization provisioning state
  const [orgName, setOrgName] = useState('')
  const [provisioning, setProvisioning] = useState(false)
  const [provisionError, setProvisionError] = useState<string | null>(null)
  
  // Security & API state
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings | null>(null)
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [generatingKey, setGeneratingKey] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [generatedKey, setGeneratedKey] = useState<string | null>(null)
  const [showKeyModal, setShowKeyModal] = useState(false)
  const { currentOrgId, organizations, refreshOrganizations } = useOrganization()
  const router = useRouter()
  const supabase = createClient()

  const handleUpgrade = async (tier: 'starter' | 'professional' | 'enterprise') => {
    if (!currentOrgId) return
    
    try {
      setLoading(true)
      const { error } = await supabase
        .from('organizations')
        .update({ subscription_tier: tier })
        .eq('id', currentOrgId)
      
      if (error) throw error
      
      // Refresh global context and local state
      await refreshOrganizations()
      if (currentOrg) {
        setCurrentOrg({ ...currentOrg, subscription_tier: tier })
      }
    } catch (err) {
      console.error('Upgrade failed:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      // If we don't have an ID yet, we can't fetch anything.
      // But we shouldn't wait for 'orgLoading' if we already have a currentOrgId from localStorage/Context
      if (!currentOrgId) return

      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (!authUser) {
          router.push('/auth/login')
          return
        }
        setUser(authUser)

        // Try to get the organization details even if the global list isn't ready
        // This makes the page much more resilient to context race conditions
        const orgData = organizations.find(o => o.id === currentOrgId)
        if (orgData) {
          setCurrentOrg(orgData as Organization)
        } else {
          // Fallback fetch for the specific org if not in the global list yet
          const { data: directOrg } = await supabase
            .from('organizations')
            .select('id, name, created_at, subscription_tier')
            .eq('id', currentOrgId)
            .single()
          
          if (directOrg) setCurrentOrg(directOrg as Organization)
        }

        // Parallelize fetching for better performance
        const [roleRes, membersRes, settingsRes, keysRes] = await Promise.all([
          supabase
            .from('organization_members')
            .select('role')
            .eq('organization_id', currentOrgId)
            .eq('user_id', authUser.id)
            .single(),
          supabase
            .from('organization_members')
            .select('user_id, role, created_at')
            .eq('organization_id', currentOrgId),
          supabase
            .from('security_settings')
            .select('*')
            .eq('organization_id', currentOrgId)
            .single(),
          supabase
            .from('api_keys')
            .select('*')
            .eq('organization_id', currentOrgId)
            .eq('revoked', false)
            .order('created_at', { ascending: false })
        ])
        
        setUserRole(roleRes.data?.role || 'member')
        setAllMembers(membersRes.data || [])
        setSecuritySettings(settingsRes.data)
        setApiKeys(keysRes.data || [])

      } catch (error) {
        console.error('Error fetching settings:', error)
      } finally {
        setLoading(false)
      }
    }

    // When the organization changes, we MUST reset the loading state and clear old data
    // to prevent showing "Org A" settings while "Org B" is loading.
    setLoading(true)
    setCurrentOrg(null)
    setSecuritySettings(null)
    setApiKeys([])
    setAllMembers([])
    fetchData()
  }, [supabase, router, currentOrgId, organizations])

  const handleCopyId = () => {
    if (currentOrg?.id) {
      navigator.clipboard.writeText(currentOrg.id)
      setCopying(true)
      setTimeout(() => setCopying(false), 2000)
    }
  }

  const handleProvisionOrg = async () => {
    if (!orgName.trim()) {
      setProvisionError('Organization name is required')
      return
    }

    setProvisioning(true)
    setProvisionError(null)

    try {
      const { error: rpcError } = await supabase.rpc('create_new_organization', {
        org_name: orgName.trim()
      })

      if (rpcError) throw rpcError

      // Refresh the page to load the new organization
      window.location.reload()
    } catch (err) {
      console.error('Failed to provision organization:', err)
      setProvisionError(err instanceof Error ? err.message : 'Failed to create organization')
    } finally {
      setProvisioning(false)
    }
  }

  const handleToggleSetting = async (key: string, value: boolean) => {
    if (!currentOrg) return

    try {
      const { error } = await supabase
        .from('security_settings')
        .update({ [key]: value })
        .eq('organization_id', currentOrg.id)

      if (error) throw error
      setSecuritySettings(prev => prev ? { ...prev, [key]: value } as SecuritySettings : null)
    } catch (err) {
      console.error('Failed to update setting:', err)
    }
  }

  const handleGenerateApiKey = async () => {
    if (!currentOrg || !newKeyName.trim()) return

    setGeneratingKey(true)
    try {
      // Generate a secure random key
      const buffer = new Uint8Array(32)
      window.crypto.getRandomValues(buffer)
      const rawKey = Array.from(buffer).map(b => b.toString(16).padStart(2, '0')).join('')
      const fullKey = `rlnt_live_${rawKey}`
      const keyPrefix = fullKey.substring(0, 12) // rlnt_live_...

      // In a real app, we would hash this with Argon2 on the server.
      // For this implementation, we'll store the hashed version (SHA-256 for now)
      const encoder = new TextEncoder()
      const data = encoder.encode(fullKey)
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const hashedKey = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

      const { data: keyData, error } = await supabase
        .from('api_keys')
        .insert({
          organization_id: currentOrg.id,
          name: newKeyName.trim(),
          key_prefix: keyPrefix,
          hashed_key: hashedKey
        })
        .select()
        .single()

      if (error) throw error

      setApiKeys([keyData, ...apiKeys])
      setGeneratedKey(fullKey)
      setShowKeyModal(true)
      setNewKeyName('')
    } catch (err) {
      console.error('Failed to generate key:', err)
    } finally {
      setGeneratingKey(false)
    }
  }

  const handleRevokeApiKey = async (id: string) => {
    try {
      const { error } = await supabase
        .from('api_keys')
        .update({ revoked: true })
        .eq('id', id)

      if (error) throw error
      setApiKeys(apiKeys.filter(k => k.id !== id))
    } catch (err) {
      console.error('Failed to revoke key:', err)
    }
  }

  if (loading && !currentOrg) {
    return (
      <div className="flex h-screen bg-bg-primary overflow-hidden text-white">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center bg-cyber-grid relative">
          <div className="absolute inset-0 bg-mesh-gradient pointer-events-none" />
          <div className="relative z-10 flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-cyan-500 animate-spin mb-4" />
            <p className="text-slate-500 text-sm font-black uppercase tracking-widest animate-shimmer">Synchronizing Security Boundary...</p>
          </div>
        </main>
      </div>
    )
  }

  // Only show the "Provision" screen if we are NOT loading and still have no organizations
  if (!loading && organizations.length === 0) {
    return (
      <div className="flex h-screen bg-bg-primary overflow-hidden text-white">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center p-10 bg-cyber-grid relative">
          <div className="absolute inset-0 bg-mesh-gradient pointer-events-none" />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative z-10 glass-panel max-w-lg w-full p-10 border-white/10"
          >
            <div className="w-20 h-20 bg-linear-to-br from-cyan-500/10 to-blue-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-cyan-500/20">
              <Shield className="w-10 h-10 text-cyan-400" />
            </div>
            <h2 className="text-3xl font-black text-white mb-3 tracking-tight text-center">Initialize <span className="text-gradient">Security Boundary</span></h2>
            <p className="text-slate-400 mb-8 leading-relaxed text-center text-sm">
              Provision your organization to begin auditing AI governance events
            </p>

            {provisionError && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-xl text-sm mb-6"
              >
                {provisionError}
              </motion.div>
            )}

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Organization Name</label>
                <input 
                  type="text" 
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="Acme Corp"
                  disabled={provisioning}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:border-cyan-500/50 transition-all disabled:opacity-50"
                />
              </div>

              <button 
                onClick={handleProvisionOrg}
                disabled={provisioning || !orgName.trim()}
                className="btn-primary w-full py-4 shadow-xl shadow-cyan-500/10 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {provisioning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Provisioning Boundary...</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    <span>Provision Organization</span>
                  </>
                )}
              </button>

              <button 
                onClick={() => router.push('/dashboard')} 
                className="btn-secondary w-full py-3 justify-center"
              >
                Return to Command Center
              </button>
            </div>
          </motion.div>
        </main>
      </div>
    )
  }

  const tabs = [
    { id: 'general', label: 'Organization', icon: Globe },
    { id: 'team', label: 'Team Members', icon: Users },
    { id: 'security', label: 'Intelligence Security', icon: Shield },
    { id: 'billing', label: 'Subscription', icon: CreditCard },
  ] as const

  return (
    <div className="flex h-screen bg-bg-primary overflow-hidden text-white">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-cyber-grid relative">
        <div className="absolute inset-0 bg-mesh-gradient pointer-events-none" />
        <div className="relative z-10 p-8 max-w-7xl mx-auto">
          <motion.header 
            initial="initial"
            animate="animate"
            variants={{
              initial: { opacity: 0, y: -10 },
              animate: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } }
            }}
            className="mb-8"
          >
            <motion.div variants={{ initial: { opacity: 0, x: -10 }, animate: { opacity: 1, x: 0 } }} className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)] animate-shimmer" />
              <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Configuration Boundary</span>
            </motion.div>
            <motion.h1 variants={{ initial: { opacity: 0, y: 5 }, animate: { opacity: 1, y: 0 } }} className="text-4xl font-bold text-white mb-2">System <span className="text-gradient">Settings</span></motion.h1>
            <motion.p variants={{ initial: { opacity: 0 }, animate: { opacity: 1 } }} className="text-slate-400">Manage organization identity, security protocols, and ledger access</motion.p>
          </motion.header>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="md:col-span-1 space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    activeTab === tab.id 
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' 
                      : 'text-slate-500 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  {activeTab === tab.id && <motion.div layoutId="active-tab" className="ml-auto w-1 h-4 bg-cyan-500 rounded-full" />}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="md:col-span-3">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="glass-panel p-8 border-white/5"
                >
                  {activeTab === 'general' && (
                    <div className="space-y-8">
                      <div>
                        <h2 className="text-xl font-bold text-white mb-2">Organization Identity</h2>
                        <p className="text-sm text-slate-400">Manage the core identity of your governance boundary</p>
                      </div>

                      {currentOrg ? (
                        <div className="space-y-6">
                           <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Entity Name</label>
                            <input 
                              type="text" 
                              value={currentOrg.name}
                              readOnly
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-cyan-500/50 transition-all"
                            />
                          </div>
                          
                          <div className="p-6 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center p-0.5">
                                <Database className="w-6 h-6 text-cyan-400" />
                              </div>
                              <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Boundary ID</p>
                                <p className="text-xs font-mono text-white">{currentOrg.id}</p>
                              </div>
                            </div>
                            <button onClick={handleCopyId} className="p-2 hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-white/10">
                              {copying ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-500" />}
                            </button>
                          </div>

                          <div className="pt-4 border-t border-white/5">
                             <h4 className="text-xs font-black text-rose-500 uppercase tracking-widest mb-4">Danger Zone</h4>
                             <button className="flex items-center gap-2 px-6 py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 rounded-xl text-xs font-black uppercase tracking-widest transition-all">
                                <Trash2 className="w-4 h-4" />
                                Terminate Organization
                             </button>
                          </div>

                          {userRole === 'admin' && (
                            <div className="pt-8 border-t border-white/5">
                              <div className="mb-6">
                                <h3 className="text-xl font-bold text-white mb-2">Boundary Expansion</h3>
                                <p className="text-sm text-slate-400">Add a new organization to your governance environment</p>
                              </div>
                              
                              <div className="space-y-4 max-w-md">
                                <div className="space-y-2">
                                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">New Entity Name</label>
                                  <input 
                                    type="text" 
                                    value={orgName}
                                    onChange={(e) => setOrgName(e.target.value)}
                                    placeholder="Enter entity name..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:border-cyan-500/50 transition-all"
                                  />
                                </div>
                                <button
                                  onClick={handleProvisionOrg}
                                  disabled={provisioning || !orgName.trim()}
                                  className="btn-primary py-3 px-6 shadow-[0_0_15px_rgba(6,182,212,0.2)] disabled:opacity-50"
                                >
                                  {provisioning ? (
                                    <>
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                      <span>Provisioning...</span>
                                    </>
                                  ) : (
                                    <>
                                      <PlusCircle className="w-4 h-4" />
                                      <span>Provision New Entity</span>
                                    </>
                                  )}
                                </button>
                                {provisionError && (
                                  <p className="text-xs text-rose-400 mt-2">{provisionError}</p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-24 bg-white/5 rounded-3xl border border-dashed border-white/10">
                          <Loader2 className="w-10 h-10 text-cyan-500 animate-spin mb-4" />
                          <p className="text-slate-500 text-sm font-bold tracking-widest uppercase">Initializing Stream...</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'team' && (
                    <div className="space-y-8">
                      <div className="flex justify-between items-center">
                        <div>
                          <h2 className="text-xl font-bold text-white mb-2">Team Boundary</h2>
                          <p className="text-sm text-slate-400">Authorized actors with access to the governance ledger</p>
                        </div>
                        {userRole === 'admin' && (
                          <button className="btn-primary py-2 px-4 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                            <UserPlus className="w-4 h-4" />
                            <span>Invite Actor</span>
                          </button>
                        )}
                      </div>

                      <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="border-b border-white/5 bg-white/5">
                              <th className="py-4 px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Actor</th>
                              <th className="py-4 px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Permission Level</th>
                              <th className="py-4 px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Operations</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {allMembers.map((member) => (
                              <tr key={member.user_id} className="group hover:bg-white/5 transition-colors">
                                <td className="py-5 px-6">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-linear-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-black text-[10px] text-white">
                                      {member.user_id.substring(0, 1).toUpperCase()}
                                    </div>
                                    <div>
                                      <p className="text-sm font-bold text-white">{member.user_id === user?.id ? 'You' : 'Access Token Actor'}</p>
                                      <p className="text-[10px] text-slate-500 uppercase">Actor Node ID: {member.user_id.substring(0, 8)}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-5 px-6">
                                  <span className="inline-flex items-center px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black text-white uppercase tracking-widest">
                                    {member.role === 'admin' ? 'Root Administrator' : 'Observational Actor'}
                                  </span>
                                </td>
                                <td className="py-5 px-6 text-right">
                                  {user?.id !== member.user_id && userRole === 'admin' && (
                                    <button className="p-2 hover:bg-rose-500/10 rounded-lg text-slate-500 hover:text-rose-400 transition-colors">
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {activeTab === 'security' && (
                    <div className="space-y-8">
                      <div>
                        <h2 className="text-xl font-bold text-white mb-2">Security Protocols</h2>
                        <p className="text-sm text-slate-400">Configure multi-factor authentication and session boundaries</p>
                      </div>
                      
                      {!securitySettings ? (
                        <div className="py-12 flex justify-center">
                          <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           {[
                             { id: 'mfa_enforced', title: '2FA Enforcement', desc: 'Require all root administrators to use hardware keys.', icon: Shield, active: securitySettings.mfa_enforced },
                             { id: 'audit_signing', title: 'Audit Trail Signature', desc: 'Digitally sign every ledger entry at origin.', icon: Lock, active: securitySettings.audit_signing },
                             { id: 'temporal_access', title: 'Temporal Session Access', desc: 'Expire sessions after 4 hours of inactivity.', icon: Activity, active: securitySettings.temporal_access },
                             { id: 'region_locking', title: 'Region Locking', desc: 'Restrict access to specific geofenced IP ranges.', icon: Globe, active: securitySettings.region_locking },
                           ].map((item, idx) => (
                             <div 
                               key={idx} 
                               onClick={() => handleToggleSetting(item.id, !item.active)}
                               className="p-6 rounded-3xl bg-white/5 border border-white/10 group hover:border-cyan-500/30 transition-all cursor-pointer"
                             >
                                <div className="flex justify-between items-start mb-4">
                                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${item.active ? 'bg-cyan-500/10 text-cyan-400' : 'bg-slate-800 text-slate-500'}`}>
                                     <item.icon className="w-5 h-5" />
                                  </div>
                                  <div className={`w-10 h-6 rounded-full p-1 transition-colors ${item.active ? 'bg-cyan-500/40' : 'bg-slate-800'}`}>
                                     <div className={`w-4 h-4 rounded-full shadow-lg transition-transform ${item.active ? 'bg-cyan-400 translate-x-4' : 'bg-slate-600'}`} />
                                  </div>
                                </div>
                                <h4 className="font-bold text-white mb-1">{item.title}</h4>
                                <p className="text-xs text-slate-500 leading-relaxed font-medium">{item.desc}</p>
                             </div>
                           ))}
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'api' && (
                    <div className="space-y-8">
                       <div className="flex justify-between items-center">
                        <div>
                          <h2 className="text-xl font-bold text-white mb-2">API Infrastructure</h2>
                          <p className="text-sm text-slate-400">Secure integration endpoints for external agent auditing</p>
                        </div>
                      </div>

                      {showKeyModal && generatedKey ? (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="p-8 rounded-[32px] bg-cyan-500/10 border border-cyan-500/30 space-y-4"
                        >
                          <div className="flex items-center gap-3 text-cyan-400 mb-2">
                            <CheckCircle className="w-5 h-5" />
                            <h4 className="font-bold">API Key Generated Successfully</h4>
                          </div>
                          <p className="text-xs text-slate-400">Copy this key now. For security, it will never be shown again.</p>
                          <div className="flex gap-2">
                            <code className="flex-1 bg-black/40 p-4 rounded-xl text-cyan-300 font-mono text-sm break-all border border-cyan-500/20">
                              {generatedKey}
                            </code>
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(generatedKey)
                                setCopying(true)
                                setTimeout(() => setCopying(false), 2000)
                              }}
                              className="btn-secondary h-auto px-4"
                            >
                              {copying ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </button>
                          </div>
                          <button 
                            onClick={() => {
                              setShowKeyModal(false)
                              setGeneratedKey(null)
                            }}
                            className="w-full btn-primary justify-center py-3 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border-cyan-500/30"
                          >
                            I have secured my key
                          </button>
                        </motion.div>
                      ) : (
                        <div className="space-y-6">
                           <div className="flex gap-3">
                            <input 
                              type="text" 
                              placeholder="Key Name (e.g. Production Logger)"
                              value={newKeyName}
                              onChange={(e) => setNewKeyName(e.target.value)}
                              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-500/50 outline-none transition-all"
                            />
                            <button 
                              onClick={handleGenerateApiKey}
                              disabled={generatingKey || !newKeyName.trim()}
                              className="btn-primary"
                            >
                              {generatingKey ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                              <span>Generate Key</span>
                            </button>
                          </div>

                          <div className="space-y-3">
                            {apiKeys.length > 0 ? (
                              apiKeys.map((key) => (
                                <div key={key.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between group hover:border-white/10 transition-all">
                                  <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
                                      <Lock className="w-5 h-5 text-slate-500" />
                                    </div>
                                    <div>
                                      <p className="text-sm font-bold text-white">{key.name}</p>
                                      <p className="text-[10px] font-mono text-slate-500 uppercase">{key.key_prefix}••••••••••••••••</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="text-[10px] text-slate-600 uppercase font-black mr-4">
                                      Created {new Date(key.created_at).toLocaleDateString()}
                                    </div>
                                    <button 
                                      onClick={() => handleRevokeApiKey(key.id)}
                                      className="p-2 hover:bg-rose-500/10 rounded-lg text-slate-500 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="p-12 rounded-[32px] bg-slate-950 border border-white/5 relative overflow-hidden group text-center">
                                <div className="relative z-10 flex flex-col items-center">
                                  <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mb-6">
                                    <Settings className="w-8 h-8 text-cyan-400" />
                                  </div>
                                  <h4 className="text-lg font-bold text-white mb-2">No Active API Keys</h4>
                                  <p className="text-sm text-slate-500 max-w-sm">No external system has been authorized to interact with this boundary via the REST API.</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'billing' && (
                    <div className="space-y-8">
                      <div>
                        <h2 className="text-xl font-bold text-white mb-2">Resource Allocation</h2>
                        <p className="text-sm text-slate-400">Subscription telemetry and resource usage monitoring</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className={cn(
                          "p-8 rounded-[32px] border relative overflow-hidden group transition-all",
                          currentOrg?.subscription_tier === 'enterprise' ? "bg-linear-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/30" : 
                          currentOrg?.subscription_tier === 'professional' ? "bg-linear-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/30" :
                          "bg-white/5 border-white/10"
                        )}>
                           <div className="relative z-10">
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-4">Current Allocation</span>
                              <h4 className="text-3xl font-black text-white tracking-tighter mb-1">
                                {currentOrg?.subscription_tier === 'enterprise' ? 'Enterprise Guard' : 
                                 currentOrg?.subscription_tier === 'professional' ? 'Professional Sentry' : 'Starter Node'}
                              </h4>
                              <p className="text-sm text-slate-400 mb-8">
                                {currentOrg?.subscription_tier === 'enterprise' ? 'Unlimited Nodes & Recursive Auditing' : 
                                 currentOrg?.subscription_tier === 'professional' ? '10 Active Nodes & 30-Day Retention' : '2 Active Nodes & 7-Day Retention'}
                              </p>
                              
                              <div className="space-y-2 mb-8">
                                <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                  <span>Usage Utilization</span>
                                  <span>{currentOrg?.subscription_tier === 'enterprise' ? '4%' : currentOrg?.subscription_tier === 'professional' ? '42%' : '85%'}</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                  <motion.div 
                                    initial={{ width: 0 }} 
                                    animate={{ width: currentOrg?.subscription_tier === 'enterprise' ? '4%' : currentOrg?.subscription_tier === 'professional' ? '42%' : '85%' }} 
                                    className={cn(
                                      "h-full shadow-[0_0_10px_rgba(6,182,212,0.5)]",
                                      currentOrg?.subscription_tier === 'starter' ? "bg-amber-500/50" : "bg-cyan-400"
                                    )} 
                                  />
                                </div>
                              </div>

                              {userRole === 'admin' && (
                                <div className="grid grid-cols-2 gap-2 mt-4">
                                  {['starter', 'professional', 'enterprise'].map((tier) => (
                                    tier !== currentOrg?.subscription_tier && (
                                      <button 
                                        key={tier}
                                        onClick={() => handleUpgrade(tier as 'starter' | 'professional' | 'enterprise')}
                                        className="py-2 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all"
                                      >
                                        {tier}
                                      </button>
                                    )
                                  ))}
                                </div>
                              )}
                           </div>
                        </div>

                        <div className="p-8 rounded-[32px] bg-white/5 border border-white/10 space-y-6">
                           <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Regional Node Status</h4>
                           <div className="space-y-4">
                              {[
                                { region: 'US-East (Origin)', status: 'Operational', latency: '4ms' },
                                { region: 'EU-Central', status: 'Operational', latency: '12ms' },
                                { region: 'AP-South', status: 'Operational', latency: '24ms' }
                              ].map((node, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/5">
                                   <div className="flex items-center gap-3">
                                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                      <span className="text-xs font-bold text-white">{node.region}</span>
                                   </div>
                                   <span className="text-[10px] font-mono text-slate-500 uppercase">{node.latency}</span>
                                </div>
                              ))}
                           </div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
