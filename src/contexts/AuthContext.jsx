import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

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
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUserOrganization(session.user.id)
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
          fetchUserOrganization(session.user.id)
        } else {
          setOrganization(null)
          setIsAdmin(false)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserOrganization = async (userId) => {
    try {
      console.log('Fetching user organization for:', userId)
      const { data, error } = await supabase
        .from('users')
        .select('*, organizations(*)')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching user organization:', error)
        // If user doesn't exist in users table, that's okay for now
        if (error.code === 'PGRST116') {
          console.log('User not found in users table, this is okay for new users')
          setLoading(false)
          return
        }
        throw error
      }

      console.log('User organization data:', data)
      setOrganization(data.organizations)
      setIsAdmin(data.role === 'admin')
    } catch (error) {
      console.error('Error fetching user organization:', error)
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email, password, name, organizationName) => {
    try {
      console.log('Attempting to sign up:', { email, name, organizationName })
      
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
            .from('organizations')
            .select('id')
            .eq('domain', domain)
            .single()

          let orgId
          if (existingOrg && !orgSelectError) {
            orgId = existingOrg.id
            console.log('Using existing organization:', orgId)
          } else {
            // Create new organization
            console.log('Creating new organization:', organizationName)
            const { data: newOrg, error: orgError } = await supabase
              .from('organizations')
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
            console.log('Created new organization:', orgId)
          }

          // Create user profile
          console.log('Creating user profile for:', authData.user.id)
          const { error: userError } = await supabase
            .from('users')
            .insert([{
              id: authData.user.id,
              email: email,
              name: name,
              organization_id: orgId,
              role: existingOrg ? 'user' : 'admin',
              created_at: new Date().toISOString()
            }])

          if (userError) {
            console.error('Error creating user profile:', userError)
            // Don't throw here - the auth user was created successfully
            console.log('User profile creation failed, but auth user exists')
          } else {
            console.log('User profile created successfully')
          }
        } catch (profileError) {
          console.error('Error creating profile:', profileError)
          // Don't throw here - the auth user was created successfully
          console.log('Profile creation failed, but auth user exists')
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
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const value = {
    user,
    organization,
    isAdmin,
    loading,
    signUp,
    signIn,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}