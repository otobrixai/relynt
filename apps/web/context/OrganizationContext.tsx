'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Organization {
  id: string
  name: string
  subscription_tier: 'starter' | 'professional' | 'enterprise'
}



interface OrganizationContextType {
  currentOrgId: string | null
  setCurrentOrgId: (id: string) => void
  organizations: Organization[]
  loading: boolean
  refreshOrganizations: () => Promise<void>
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined)

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const [currentOrgId, setCurrentOrgIdState] = useState<string | null>(null)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const refreshOrganizations = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const { data: memberships, error: mError } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)

      if (mError) {
        console.error('Membership fetch error:', mError)
        throw mError
      }

      console.log('User memberships found:', memberships?.length || 0)

      const orgIds = memberships?.map((m: { organization_id: string }) => m.organization_id) || []
      
      if (orgIds.length === 0) {
        console.warn('No organization memberships found for user:', user.id)
        setOrganizations([])
        setLoading(false)
        return
      }

      const { data: orgsData, error: oError } = await supabase
        .from('organizations')
        .select('id, name, subscription_tier')
        .in('id', orgIds)

      let orgs: Organization[] = []

      if (oError) {
        console.warn('Organization detail fetch fallback triggered. This is likely due to a missing subscription_tier column.', oError.message)
        // Fallback: Fetch without subscription_tier if the column doesn't exist yet
        const { data: fallbackOrgs, error: fError } = await supabase
          .from('organizations')
          .select('id, name')
          .in('id', orgIds)
        
        if (fError) {
          console.error('Failed to fetch fallback organizations:', fError)
          throw fError
        }

        orgs = fallbackOrgs?.map(o => ({
          id: o.id,
          name: o.name,
          subscription_tier: 'starter'
        })) || []
      } else {
        orgs = orgsData || []
      }
      
      setOrganizations(orgs)

      // Initialize current Org Id
      if (typeof window !== 'undefined') {
        const savedId = localStorage.getItem('relynt_current_org_id')
        if (savedId && orgs.some((o) => o.id === savedId)) {
          setCurrentOrgIdState(savedId)
        } else if (orgs.length > 0) {
          setCurrentOrgIdState(orgs[0].id)
          localStorage.setItem('relynt_current_org_id', orgs[0].id)
        }
      }
    } catch (err) {
      console.error('Failed to fetch organizations:', err)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const setCurrentOrgId = useCallback((id: string) => {
    console.log('Global Organization Switch Initiated. New ID:', id)
    setCurrentOrgIdState(id)
    if (typeof window !== 'undefined') {
      localStorage.setItem('relynt_current_org_id', id)
    }
  }, [])

  useEffect(() => {
    refreshOrganizations()
  }, [refreshOrganizations])

  return (
    <OrganizationContext.Provider value={{ currentOrgId, setCurrentOrgId, organizations, loading, refreshOrganizations }}>
      {children}
    </OrganizationContext.Provider>
  )
}

export function useOrganization() {
  const context = useContext(OrganizationContext)
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider')
  }
  return context
}
