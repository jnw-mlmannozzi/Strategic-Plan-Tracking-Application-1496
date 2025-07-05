import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { motion } from 'framer-motion'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiCheckCircle, FiAlertCircle, FiLoader } = FiIcons

const EmailConfirmation = () => {
  const [status, setStatus] = useState('loading') // 'loading', 'success', 'error'
  const [message, setMessage] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Get the parameters from URL
        const urlParams = new URLSearchParams(location.search)
        const hashParams = new URLSearchParams(location.hash.substring(1))
        
        // Check for various confirmation parameters
        const token = urlParams.get('token')
        const tokenHash = urlParams.get('token_hash')
        const confirmationCode = urlParams.get('code') || hashParams.get('code')
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        const type = urlParams.get('type') || hashParams.get('type')

        console.log('Email confirmation params:', {
          token,
          tokenHash,
          confirmationCode,
          accessToken,
          refreshToken,
          type,
          search: location.search,
          hash: location.hash
        })

        // Handle different confirmation scenarios
        if (token && type === 'signup') {
          // Handle token-based confirmation
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'email'
          })

          if (error) {
            console.error('Error confirming email with token:', error)
            setStatus('error')
            setMessage('Failed to confirm email. The link may have expired or is invalid.')
            return
          }

          if (data.user) {
            await createUserProfileIfNeeded(data.user)
            setStatus('success')
            setMessage('Email confirmed successfully! Redirecting to dashboard...')
            setTimeout(() => {
              navigate('/dashboard')
            }, 2000)
          }
        } else if (tokenHash) {
          // Handle token_hash confirmation
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: 'email'
          })

          if (error) {
            console.error('Error confirming email with token_hash:', error)
            setStatus('error')
            setMessage('Failed to confirm email. The link may have expired or is invalid.')
            return
          }

          if (data.user) {
            await createUserProfileIfNeeded(data.user)
            setStatus('success')
            setMessage('Email confirmed successfully! Redirecting to dashboard...')
            setTimeout(() => {
              navigate('/dashboard')
            }, 2000)
          }
        } else if (confirmationCode) {
          // Handle code-based confirmation
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: confirmationCode,
            type: 'email'
          })

          if (error) {
            console.error('Error confirming email with code:', error)
            setStatus('error')
            setMessage('Failed to confirm email. The link may have expired or is invalid.')
            return
          }

          if (data.user) {
            await createUserProfileIfNeeded(data.user)
            setStatus('success')
            setMessage('Email confirmed successfully! Redirecting to dashboard...')
            setTimeout(() => {
              navigate('/dashboard')
            }, 2000)
          }
        } else if (type === 'signup' && accessToken && refreshToken) {
          // Handle direct session-based confirmation
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })

          if (error) {
            console.error('Error setting session:', error)
            setStatus('error')
            setMessage('Failed to confirm email. Please try again.')
            return
          }

          if (data.user) {
            await createUserProfileIfNeeded(data.user)
            setStatus('success')
            setMessage('Email confirmed successfully! Redirecting to dashboard...')
            setTimeout(() => {
              navigate('/dashboard')
            }, 2000)
          }
        } else {
          console.log('No valid confirmation parameters found')
          setStatus('error')
          setMessage('Invalid confirmation link. Please try signing up again.')
        }
      } catch (error) {
        console.error('Email confirmation error:', error)
        setStatus('error')
        setMessage('An error occurred during email confirmation. Please try again.')
      }
    }

    handleEmailConfirmation()
  }, [location.hash, location.search, navigate])

  const createUserProfileIfNeeded = async (user) => {
    try {
      // Check if user profile already exists
      const { data: existingUser, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (userError && userError.code === 'PGRST116') {
        // User doesn't exist in users table, create profile
        const domain = user.email.split('@')[1]
        const organizationName = user.user_metadata?.organization_name || 'My Organization'
        const name = user.user_metadata?.name || 'User'

        // Check if organization exists
        const { data: existingOrg, error: orgSelectError } = await supabase
          .from('organizations')
          .select('id')
          .eq('domain', domain)
          .single()

        let orgId

        if (existingOrg && !orgSelectError) {
          orgId = existingOrg.id
        } else {
          // Create new organization
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
        }

        // Create user profile
        const { error: userCreateError } = await supabase
          .from('users')
          .insert([{
            id: user.id,
            email: user.email,
            name: name,
            organization_id: orgId,
            role: existingOrg ? 'user' : 'admin',
            created_at: new Date().toISOString()
          }])

        if (userCreateError) {
          console.error('Error creating user profile:', userCreateError)
          throw userCreateError
        }
      }
    } catch (error) {
      console.error('Error creating profile:', error)
      // Don't throw here - email confirmation was successful
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-md w-full space-y-8"
      >
        <div className="text-center">
          <img 
            src="https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1751668137997-StraetgyPilot%20logo.png"
            alt="JNW Consulting"
            className="mx-auto h-12 w-auto"
          />
          <h2 className="mt-6 text-center text-3xl font-bold text-primary">
            Email Confirmation
          </h2>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            {status === 'loading' && (
              <div className="flex flex-col items-center">
                <SafeIcon icon={FiLoader} className="w-12 h-12 text-primary animate-spin mb-4" />
                <p className="text-secondary">Confirming your email...</p>
              </div>
            )}

            {status === 'success' && (
              <div className="flex flex-col items-center">
                <SafeIcon icon={FiCheckCircle} className="w-12 h-12 text-green-500 mb-4" />
                <p className="text-green-600 font-semibold mb-2">Success!</p>
                <p className="text-secondary">{message}</p>
              </div>
            )}

            {status === 'error' && (
              <div className="flex flex-col items-center">
                <SafeIcon icon={FiAlertCircle} className="w-12 h-12 text-red-500 mb-4" />
                <p className="text-red-600 font-semibold mb-2">Error</p>
                <p className="text-secondary mb-4">{message}</p>
                <button
                  onClick={() => navigate('/signup')}
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
                >
                  Back to Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default EmailConfirmation