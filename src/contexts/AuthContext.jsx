import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { validatePassword } from '../utils/passwordPolicy'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [organization, setOrganization] = useState(null)
  const [membership, setMembership] = useState(null)
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [impersonating, setImpersonating] = useState(null)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUserData(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session)
        setUser(session?.user ?? null)
        if (session?.user) {
          fetchUserData(session.user.id)
        } else {
          resetUserData()
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const resetUserData = () => {
    setOrganization(null)
    setMembership(null)
    setTeams([])
    setImpersonating(null)
    setLoading(false)
  }

  const fetchUserData = async (userId) => {
    try {
      console.log('Fetching user data for:', userId)
      
      // Get user with organization and membership
      const { data: userData, error: userError } = await supabase
        .from('users_mt')
        .select(`
          *,
          organizations_mt(*),
          memberships_mt(
            *,
            teams_mt(*)
          )
        `)
        .eq('id', userId)
        .single()

      if (userError) {
        console.error('Error fetching user data:', userError)
        if (userError.code === 'PGRST116') {
          // User doesn't exist in users table, this is okay for new users
          console.log('User not found in users table, this is okay for new users')
          setLoading(false)
          return
        }
        throw userError
      }

      console.log('User data:', userData)
      
      setOrganization(userData.organizations_mt)
      
      // Set primary membership (first one or org admin if multiple)
      const primaryMembership = userData.memberships_mt?.find(m => m.role === 'OrgAdmin') || userData.memberships_mt?.[0]
      setMembership(primaryMembership)
      
      // Get all teams user belongs to
      const userTeams = userData.memberships_mt?.map(m => m.teams_mt).filter(Boolean) || []
      setTeams(userTeams)
      
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email, password, name, organizationName) => {
    try {
      console.log('Attempting to sign up:', { email, name, organizationName })
      
      // Validate password
      const passwordValidation = validatePassword(password)
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.errors.join('. '))
      }

      // First, try to sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            organization_name: organizationName
          }
        }
      })

      if (authError) {
        console.error('Supabase auth error:', authError)
        throw authError
      }

      console.log('Auth signup successful:', authData)

      // If user is created successfully, create profile immediately
      if (authData.user) {
        try {
          const domain = email.split('@')[1]
          
          // Check if organization exists
          const { data: existingOrg, error: orgSelectError } = await supabase
            .from('organizations_mt')
            .select('id')
            .eq('domain', domain)
            .single()

          let orgId
          let isFirstUser = false

          if (existingOrg && !orgSelectError) {
            orgId = existingOrg.id
            console.log('Using existing organization:', orgId)
          } else {
            // Create new organization
            console.log('Creating new organization:', organizationName)
            const { data: newOrg, error: orgError } = await supabase
              .from('organizations_mt')
              .insert([{
                name: organizationName,
                domain: domain,
                created_at: new Date().toISOString()
              }])
              .select()
              .single()

            if (orgError) {
              console.error('Error creating organization:', orgError)
              throw orgError
            }

            orgId = newOrg.id
            isFirstUser = true
            console.log('Created new organization:', orgId)
          }

          // Create user profile
          console.log('Creating user profile for:', authData.user.id)
          const { error: userError } = await supabase
            .from('users_mt')
            .insert([{
              id: authData.user.id,
              email: email,
              name: name,
              org_id: orgId,
              password_policy_compliant: true,
              created_at: new Date().toISOString()
            }])

          if (userError) {
            console.error('Error creating user profile:', userError)
            throw userError
          }

          // Get default "Unassigned" team
          const { data: defaultTeam } = await supabase
            .from('teams_mt')
            .select('id')
            .eq('organization_id', orgId)
            .eq('name', 'Unassigned')
            .single()

          // Create membership
          const { error: membershipError } = await supabase
            .from('memberships_mt')
            .insert([{
              user_id: authData.user.id,
              organization_id: orgId,
              team_id: defaultTeam?.id,
              role: isFirstUser ? 'OrgAdmin' : 'Member',
              created_at: new Date().toISOString()
            }])

          if (membershipError) {
            console.error('Error creating membership:', membershipError)
            throw membershipError
          }

          console.log('User profile and membership created successfully')

        } catch (profileError) {
          console.error('Error creating profile:', profileError)
          throw profileError
        }
      }

      return { data: authData, error: null }
    } catch (error) {
      console.error('Sign up error:', error)
      return { data: null, error }
    }
  }

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (!error && data.user) {
        // Update last login
        await supabase
          .from('users_mt')
          .update({ last_login: new Date().toISOString() })
          .eq('id', data.user.id)
      }
      
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const impersonateUser = async (targetUserId, organizationId) => {
    try {
      // Only support users can impersonate
      if (membership?.role !== 'Support') {
        throw new Error('Unauthorized: Only support users can impersonate')
      }

      // Create impersonation session
      const sessionToken = crypto.randomUUID()
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

      const { error: sessionError } = await supabase
        .from('impersonation_sessions_mt')
        .insert([{
          support_user_id: user.id,
          target_user_id: targetUserId,
          organization_id: organizationId,
          session_token: sessionToken,
          expires_at: expiresAt.toISOString()
        }])

      if (sessionError) throw sessionError

      // Get target user data
      const { data: targetUser } = await supabase
        .from('users_mt')
        .select('*')
        .eq('id', targetUserId)
        .single()

      setImpersonating({
        targetUser,
        supportUser: { id: user.id, email: user.email },
        sessionToken,
        expiresAt
      })

      // Fetch target user's data
      await fetchUserData(targetUserId)

    } catch (error) {
      console.error('Error impersonating user:', error)
      throw error
    }
  }

  const stopImpersonation = async () => {
    try {
      if (impersonating) {
        // Invalidate session
        await supabase
          .from('impersonation_sessions_mt')
          .delete()
          .eq('session_token', impersonating.sessionToken)

        // Return to support user
        await fetchUserData(impersonating.supportUser.id)
        setImpersonating(null)
      }
    } catch (error) {
      console.error('Error stopping impersonation:', error)
    }
  }

  const value = {
    user,
    organization,
    membership,
    teams,
    loading,
    impersonating,
    signUp,
    signIn,
    signOut,
    impersonateUser,
    stopImpersonation,
    fetchUserData,
    role: membership?.role,
    isOrgAdmin: membership?.role === 'OrgAdmin',
    isTeamAdmin: membership?.role === 'TeamAdmin',
    isSupport: membership?.role === 'Support'
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}