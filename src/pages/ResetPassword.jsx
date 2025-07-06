import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiLock, FiAlertCircle, FiCheckCircle } = FiIcons

const ResetPassword = () => {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [validatingToken, setValidatingToken] = useState(true)
  const [sessionEstablished, setSessionEstablished] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const handlePasswordReset = async () => {
      try {
        console.log('🔄 Starting password reset validation...')
        console.log('📍 Current URL:', window.location.href)
        console.log('📍 Location search:', location.search)
        console.log('📍 Location hash:', location.hash)

        const { supabase } = await import('../lib/supabase')

        // Get parameters from URL
        const urlParams = new URLSearchParams(location.search)
        const hashParams = new URLSearchParams(location.hash.substring(1))

        // Get the token from URL parameters
        const token = urlParams.get('token') || hashParams.get('token')
        const type = urlParams.get('type') || hashParams.get('type')

        console.log('🔑 Extracted parameters:', {
          token: token ? 'present' : 'missing',
          type
        })

        if (!token) {
          console.log('❌ No token found in URL')
          setError('No reset token found in URL. Please use the link from your email.')
          setValidatingToken(false)
          return
        }

        if (type !== 'recovery') {
          console.log('❌ Invalid type:', type)
          setError('Invalid reset link type. Please use the link from your email.')
          setValidatingToken(false)
          return
        }

        console.log('🚀 Attempting to verify token...')
        
        // Try to verify the token and establish session
        const { data, error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'recovery'
        })

        if (verifyError) {
          console.error('❌ Token verification failed:', verifyError)
          setError('Invalid or expired reset link. Please request a new password reset.')
          setValidatingToken(false)
          return
        }

        console.log('✅ Token verified successfully:', data)
        setSessionEstablished(true)
        setValidatingToken(false)
      } catch (error) {
        console.error('💥 Password reset setup error:', error)
        setError('An error occurred while validating your reset link. Please try requesting a new password reset.')
        setValidatingToken(false)
      }
    }

    handlePasswordReset()
  }, [location])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      console.log('🔄 Updating password...')
      const { supabase } = await import('../lib/supabase')

      // Check if we have an active session
      const { data: currentSession } = await supabase.auth.getSession()
      console.log('📋 Current session:', currentSession.session ? 'Active' : 'None')

      if (!currentSession.session) {
        setError('No active session found. Please try clicking the reset link again.')
        setLoading(false)
        return
      }

      // Update the password
      const { data, error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        console.error('❌ Password update error:', error)
        throw error
      }

      console.log('✅ Password updated successfully')
      setSuccess(true)

      // Sign out the user to force them to log in with new password
      await supabase.auth.signOut()

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (error) {
      console.error('💥 Password update error:', error)
      if (error.message.includes('session_not_found')) {
        setError('Your session has expired. Please request a new password reset.')
      } else {
        setError(error.message || 'Failed to update password. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Show loading while validating token
  if (validatingToken) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full space-y-8 text-center"
        >
          <div>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-primary mb-2">Validating Reset Link</h2>
            <p className="text-secondary">Please wait while we verify your password reset request...</p>
          </div>
        </motion.div>
      </div>
    )
  }

  // Show success message
  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full space-y-8 text-center"
        >
          <div>
            <SafeIcon icon={FiCheckCircle} className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-primary mb-2">Password Reset Successful!</h2>
            <p className="text-secondary">
              Your password has been updated successfully. You will be redirected to the login page to sign in with your new password.
            </p>
          </div>
        </motion.div>
      </div>
    )
  }

  // Show error if token is invalid
  if (!sessionEstablished) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full space-y-8 text-center"
        >
          <div>
            <SafeIcon icon={FiAlertCircle} className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-primary mb-2">Invalid Reset Link</h2>
            <p className="text-secondary mb-4">{error}</p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/login')}
                className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors"
              >
                Back to Login
              </button>
              <button
                onClick={() => navigate('/login')}
                className="w-full px-6 py-3 border border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
              >
                Request New Reset Link
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-md w-full space-y-8"
      >
        <div>
          <img
            src="https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1751739429877-StraetgyPilot.png"
            alt="StrategyPilot"
            className="mx-auto h-12 w-auto"
          />
          <h2 className="mt-6 text-center text-3xl font-bold text-primary">
            Reset Your Password
          </h2>
          <p className="mt-2 text-center text-sm text-secondary">
            Enter your new password below
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
              <SafeIcon icon={FiAlertCircle} className="w-5 h-5 text-red-500 mr-2" />
              <div>
                <span className="text-red-700 font-medium">Error</span>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-secondary">
                New Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                  placeholder="Enter your new password (min 6 characters)"
                />
                <SafeIcon icon={FiLock} className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-secondary">
                Confirm New Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                  placeholder="Confirm your new password"
                />
                <SafeIcon icon={FiLock} className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating Password...' : 'Update Password'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default ResetPassword