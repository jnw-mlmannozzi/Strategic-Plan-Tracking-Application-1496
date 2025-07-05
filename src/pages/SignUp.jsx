import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { motion } from 'framer-motion'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiMail, FiLock, FiUser, FiBuilding, FiAlertCircle, FiCheckCircle } = FiIcons

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organizationName: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validation
    if (!formData.name.trim()) {
      setError('Name is required')
      return
    }
    if (!formData.email.trim()) {
      setError('Email is required')
      return
    }
    if (!formData.organizationName.trim()) {
      setError('Organization name is required')
      return
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      console.log('Attempting to sign up:', { email: formData.email, name: formData.name })
      
      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            organization_name: formData.organizationName
          }
        }
      })

      if (authError) {
        console.error('Supabase auth error:', authError)
        throw authError
      }

      console.log('Auth signup result:', authData)

      if (authData.user) {
        // Check if email confirmation is required
        if (!authData.user.email_confirmed_at) {
          setSuccess('Account created successfully! Please check your email and click the confirmation link to activate your account.')
          // Show a link to sign in page
          setTimeout(() => {
            navigate('/login')
          }, 5000)
        } else {
          // Email confirmation disabled, create profile and go to dashboard
          await createUserProfile(authData.user, formData.name, formData.organizationName)
          setSuccess('Account created successfully! Redirecting to dashboard...')
          setTimeout(() => {
            navigate('/dashboard')
          }, 2000)
        }
      }
    } catch (error) {
      console.error('Sign up error:', error)
      if (error.message.includes('User already registered')) {
        setError('An account with this email already exists. Please try signing in instead.')
      } else if (error.message.includes('Password should be at least 6 characters')) {
        setError('Password must be at least 6 characters long')
      } else if (error.message.includes('Invalid email')) {
        setError('Please enter a valid email address')
      } else {
        setError(error.message || 'An error occurred during sign up. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const createUserProfile = async (user, name, organizationName) => {
    try {
      const domain = user.email.split('@')[1]
      
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
      console.log('Creating user profile for:', user.id)
      const { error: userError } = await supabase
        .from('users')
        .insert([{
          id: user.id,
          email: user.email,
          name: name,
          organization_id: orgId,
          role: existingOrg ? 'user' : 'admin',
          created_at: new Date().toISOString()
        }])

      if (userError) {
        console.error('Error creating user profile:', userError)
        // Don't throw here - the auth user was created successfully
      } else {
        console.log('User profile created successfully')
      }
    } catch (error) {
      console.error('Error creating profile:', error)
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
        <div>
          <img
            src="https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1751668137997-StraetgyPilot%20logo.png"
            alt="JNW Consulting"
            className="mx-auto h-12 w-auto"
          />
          <h2 className="mt-6 text-center text-3xl font-bold text-primary">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-secondary">
            Or{' '}
            <Link to="/login" className="font-medium text-primary hover:text-opacity-80">
              sign in to your existing account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
              <SafeIcon icon={FiAlertCircle} className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
              <SafeIcon icon={FiCheckCircle} className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-green-700">{success}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-secondary">
                Full Name
              </label>
              <div className="mt-1 relative">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                  placeholder="Enter your full name"
                />
                <SafeIcon icon={FiUser} className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label htmlFor="organizationName" className="block text-sm font-medium text-secondary">
                Organization Name
              </label>
              <div className="mt-1 relative">
                <input
                  id="organizationName"
                  name="organizationName"
                  type="text"
                  required
                  value={formData.organizationName}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                  placeholder="Enter your organization name"
                />
                <SafeIcon icon={FiBuilding} className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-secondary">
                Email address
              </label>
              <div className="mt-1 relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                  placeholder="Enter your email"
                />
                <SafeIcon icon={FiMail} className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-secondary">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                  placeholder="Enter your password (min 6 characters)"
                />
                <SafeIcon icon={FiLock} className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-secondary">
                Confirm Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                  placeholder="Confirm your password"
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
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </div>

          <div className="text-xs text-gray-500 text-center">
            By creating an account, you agree to our{' '}
            <Link to="/terms" className="text-primary hover:text-opacity-80">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-primary hover:text-opacity-80">
              Privacy Policy
            </Link>
          </div>
        </form>

        {success && (
          <div className="text-center">
            <p className="text-sm text-secondary mt-4">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-primary hover:text-opacity-80">
                Sign in here
              </Link>
            </p>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default SignUp