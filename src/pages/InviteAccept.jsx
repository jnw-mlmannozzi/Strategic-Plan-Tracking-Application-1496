import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { validatePassword } from '../utils/passwordPolicy'
import SafeIcon from '../common/SafeIcon'
import PasswordStrengthIndicator from '../components/common/PasswordStrengthIndicator'
import * as FiIcons from 'react-icons/fi'

const { FiUser, FiLock, FiMail, FiAlertCircle, FiCheckCircle } = FiIcons

const InviteAccept = () => {
  const { token } = useParams()
  const navigate = useNavigate()
  const [invitation, setInvitation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    confirmPassword: ''
  })

  useEffect(() => {
    if (token) {
      fetchInvitation()
    }
  }, [token])

  const fetchInvitation = async () => {
    try {
      const { data, error } = await supabase
        .from('invitations_mt')
        .select(`
          *,
          organizations_mt(name),
          teams_mt(name)
        `)
        .eq('token', token)
        .is('accepted_at', null)
        .single()

      if (error) throw error

      // Check if invitation is expired
      if (new Date(data.expires_at) < new Date()) {
        throw new Error('This invitation has expired')
      }

      setInvitation(data)
    } catch (error) {
      console.error('Error fetching invitation:', error)
      setError(error.message || 'Invalid or expired invitation')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      // Validate password
      const passwordValidation = validatePassword(formData.password)
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.errors.join('. '))
      }

      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match')
      }

      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: invitation.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name
          }
        }
      })

      if (authError) throw authError

      if (authData.user) {
        // Create user profile
        const { error: userError } = await supabase
          .from('users_mt')
          .insert([{
            id: authData.user.id,
            email: invitation.email,
            name: formData.name,
            org_id: invitation.organization_id,
            password_policy_compliant: true
          }])

        if (userError) throw userError

        // Create membership
        const { error: membershipError } = await supabase
          .from('memberships_mt')
          .insert([{
            user_id: authData.user.id,
            organization_id: invitation.organization_id,
            team_id: invitation.team_id,
            role: invitation.role
          }])

        if (membershipError) throw membershipError

        // Mark invitation as accepted
        await supabase
          .from('invitations_mt')
          .update({ accepted_at: new Date().toISOString() })
          .eq('id', invitation.id)

        // Redirect to dashboard
        navigate('/dashboard')
      }
    } catch (error) {
      console.error('Error accepting invitation:', error)
      setError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error && !invitation) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center"
        >
          <SafeIcon icon={FiAlertCircle} className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-primary mb-2">Invalid Invitation</h2>
          <p className="text-secondary mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors"
          >
            Go to Home
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8"
      >
        <div className="text-center">
          <img
            src="https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1751739429877-StraetgyPilot.png"
            alt="StrategyPilot"
            className="mx-auto h-12 w-auto"
          />
          <h2 className="mt-6 text-3xl font-bold text-primary">
            Accept Invitation
          </h2>
          <p className="mt-2 text-secondary">
            You've been invited to join <strong>{invitation?.organizations_mt.name}</strong>
            {invitation?.teams_mt && (
              <span> on the <strong>{invitation.teams_mt.name}</strong> team</span>
            )}
            {' '}as a <strong>{invitation?.role}</strong>
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center">
                <SafeIcon icon={FiAlertCircle} className="w-5 h-5 text-red-500 mr-2" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={invitation?.email || ''}
                  disabled
                  className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
                <SafeIcon icon={FiMail} className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your full name"
                  required
                />
                <SafeIcon icon={FiUser} className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Create a strong password"
                  required
                />
                <SafeIcon icon={FiLock} className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              </div>
              <PasswordStrengthIndicator password={formData.password} />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Confirm your password"
                  required
                />
                <SafeIcon icon={FiLock} className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2 px-4 bg-primary text-white rounded-lg hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Creating Account...' : 'Accept Invitation'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

export default InviteAccept