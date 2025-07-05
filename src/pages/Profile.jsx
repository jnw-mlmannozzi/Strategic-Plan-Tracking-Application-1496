import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../config/supabase'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiUser, FiMail, FiBuilding, FiSave, FiAlertCircle, FiCheckCircle } = FiIcons

const Profile = () => {
  const { user, organization } = useAuth()
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    role: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user])

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error

      setProfile({
        name: data.name || '',
        email: data.email || '',
        role: data.role || ''
      })
    } catch (error) {
      console.error('Error fetching profile:', error)
      setMessage({ type: 'error', text: 'Failed to load profile information' })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setProfile(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage({ type: '', text: '' })

    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: profile.name,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) throw error

      setMessage({ type: 'success', text: 'Profile updated successfully!' })
    } catch (error) {
      console.error('Error updating profile:', error)
      setMessage({ type: 'error', text: 'Failed to update profile' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary">Profile Settings</h1>
          <p className="text-secondary mt-2">
            Manage your personal information and account settings.
          </p>
        </div>

        {/* Profile Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Message */}
            {message.text && (
              <div className={`p-4 rounded-lg flex items-center gap-2 ${
                message.type === 'success' 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                <SafeIcon 
                  icon={message.type === 'success' ? FiCheckCircle : FiAlertCircle} 
                  className="w-5 h-5" 
                />
                <span>{message.text}</span>
              </div>
            )}

            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold text-primary mb-4">Personal Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-secondary mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={profile.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                    <SafeIcon icon={FiUser} className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-secondary mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={profile.email}
                      disabled
                      className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                    <SafeIcon icon={FiMail} className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Email address cannot be changed. Contact support if needed.
                  </p>
                </div>
              </div>
            </div>

            {/* Organization Information */}
            <div>
              <h3 className="text-lg font-semibold text-primary mb-4">Organization Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="organization" className="block text-sm font-medium text-secondary mb-2">
                    Organization
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="organization"
                      value={organization?.name || ''}
                      disabled
                      className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                    <SafeIcon icon={FiBuilding} className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-secondary mb-2">
                    Role
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="role"
                      value={profile.role === 'admin' ? 'Administrator' : 'User'}
                      disabled
                      className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                    <SafeIcon icon={FiUser} className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <SafeIcon icon={FiSave} className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Account Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-8 bg-white rounded-lg shadow-md p-6"
        >
          <h3 className="text-lg font-semibold text-primary mb-4">Account Actions</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium text-secondary">Change Password</h4>
                <p className="text-sm text-gray-600">Update your account password</p>
              </div>
              <button className="px-4 py-2 border border-gray-300 text-secondary rounded-lg hover:bg-gray-50 transition-colors">
                Change Password
              </button>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium text-secondary">Two-Factor Authentication</h4>
                <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
              </div>
              <button className="px-4 py-2 border border-gray-300 text-secondary rounded-lg hover:bg-gray-50 transition-colors">
                Enable 2FA
              </button>
            </div>

            <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
              <div>
                <h4 className="font-medium text-red-700">Delete Account</h4>
                <p className="text-sm text-red-600">Permanently delete your account and all data</p>
              </div>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                Delete Account
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Profile