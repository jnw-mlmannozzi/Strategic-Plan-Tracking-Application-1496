import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiMail, FiUsers, FiUserPlus, FiX } = FiIcons

const UserInviteForm = ({ isOpen, onClose, onInviteSent }) => {
  const { organization, membership } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    role: 'Member',
    teamId: ''
  })
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen && organization) {
      fetchTeams()
    }
  }, [isOpen, organization])

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('teams_mt')
        .select('*')
        .eq('organization_id', organization.id)
        .order('name')

      if (error) throw error
      setTeams(data || [])
      
      // Set default team to "Unassigned"
      const unassignedTeam = data?.find(t => t.name === 'Unassigned')
      if (unassignedTeam) {
        setFormData(prev => ({ ...prev, teamId: unassignedTeam.id }))
      }
    } catch (error) {
      console.error('Error fetching teams:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users_mt')
        .select('id')
        .eq('email', formData.email)
        .single()

      if (existingUser) {
        throw new Error('User with this email already exists')
      }

      // Generate invitation token
      const token = crypto.randomUUID()
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

      // Create invitation
      const { error: inviteError } = await supabase
        .from('invitations_mt')
        .insert([{
          organization_id: organization.id,
          team_id: formData.teamId || null,
          email: formData.email,
          role: formData.role,
          invited_by: membership.user_id,
          token: token,
          expires_at: expiresAt.toISOString()
        }])

      if (inviteError) throw inviteError

      // Send invitation email (would integrate with email service)
      const inviteLink = `${window.location.origin}/invite/${token}`
      console.log('Invitation link:', inviteLink)

      // For now, we'll show the link to the user
      alert(`Invitation sent! Share this link: ${inviteLink}`)

      setFormData({ email: '', role: 'Member', teamId: teams.find(t => t.name === 'Unassigned')?.id || '' })
      if (onInviteSent) onInviteSent()
      onClose()

    } catch (error) {
      console.error('Error sending invitation:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
            <SafeIcon icon={FiUserPlus} className="w-5 h-5" />
            Invite User
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <SafeIcon icon={FiX} className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="user@example.com"
                required
              />
              <SafeIcon icon={FiMail} className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="Member">Member</option>
              <option value="TeamAdmin">Team Administrator</option>
              {membership?.role === 'OrgAdmin' && (
                <option value="OrgAdmin">Organization Administrator</option>
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Team
            </label>
            <div className="relative">
              <select
                value={formData.teamId}
                onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}
                className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              >
                <option value="">Select a team</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
              <SafeIcon icon={FiUsers} className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-secondary hover:text-primary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send Invitation'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default UserInviteForm