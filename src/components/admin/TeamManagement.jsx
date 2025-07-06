import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiUsers, FiPlus, FiEdit, FiTrash2, FiUser } = FiIcons

const TeamManagement = () => {
  const { organization, membership } = useAuth()
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddTeam, setShowAddTeam] = useState(false)
  const [editingTeam, setEditingTeam] = useState(null)
  const [newTeam, setNewTeam] = useState({ name: '', description: '' })

  useEffect(() => {
    if (organization) {
      fetchTeams()
    }
  }, [organization])

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('teams_mt')
        .select(`
          *,
          memberships_mt(
            id,
            role,
            users_mt(id, name, email)
          )
        `)
        .eq('organization_id', organization.id)
        .order('name')

      if (error) throw error
      setTeams(data || [])
    } catch (error) {
      console.error('Error fetching teams:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTeam = async (e) => {
    e.preventDefault()
    try {
      const { error } = await supabase
        .from('teams_mt')
        .insert([{
          organization_id: organization.id,
          name: newTeam.name,
          description: newTeam.description
        }])

      if (error) throw error
      
      setNewTeam({ name: '', description: '' })
      setShowAddTeam(false)
      fetchTeams()
    } catch (error) {
      console.error('Error creating team:', error)
    }
  }

  const handleUpdateTeam = async (e) => {
    e.preventDefault()
    try {
      const { error } = await supabase
        .from('teams_mt')
        .update({
          name: editingTeam.name,
          description: editingTeam.description
        })
        .eq('id', editingTeam.id)

      if (error) throw error
      
      setEditingTeam(null)
      fetchTeams()
    } catch (error) {
      console.error('Error updating team:', error)
    }
  }

  const handleDeleteTeam = async (teamId) => {
    if (!confirm('Are you sure you want to delete this team? All members will be moved to the Unassigned team.')) {
      return
    }

    try {
      // Get the "Unassigned" team
      const { data: unassignedTeam } = await supabase
        .from('teams_mt')
        .select('id')
        .eq('organization_id', organization.id)
        .eq('name', 'Unassigned')
        .single()

      // Move all members to Unassigned team
      await supabase
        .from('memberships_mt')
        .update({ team_id: unassignedTeam.id })
        .eq('team_id', teamId)

      // Delete the team
      const { error } = await supabase
        .from('teams_mt')
        .delete()
        .eq('id', teamId)

      if (error) throw error
      fetchTeams()
    } catch (error) {
      console.error('Error deleting team:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary">Team Management</h2>
        {membership?.role === 'OrgAdmin' && (
          <button
            onClick={() => setShowAddTeam(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors"
          >
            <SafeIcon icon={FiPlus} className="w-4 h-4" />
            Add Team
          </button>
        )}
      </div>

      {/* Add Team Form */}
      {showAddTeam && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <h3 className="text-lg font-semibold text-primary mb-4">Create New Team</h3>
          <form onSubmit={handleCreateTeam} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Team Name
              </label>
              <input
                type="text"
                value={newTeam.name}
                onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Description
              </label>
              <textarea
                value={newTeam.description}
                onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                rows="3"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAddTeam(false)}
                className="px-4 py-2 text-secondary hover:text-primary transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors"
              >
                Create Team
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Teams List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => (
          <motion.div
            key={team.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            {editingTeam?.id === team.id ? (
              <form onSubmit={handleUpdateTeam} className="space-y-4">
                <input
                  type="text"
                  value={editingTeam.name}
                  onChange={(e) => setEditingTeam({ ...editingTeam, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
                <textarea
                  value={editingTeam.description || ''}
                  onChange={(e) => setEditingTeam({ ...editingTeam, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  rows="2"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingTeam(null)}
                    className="px-3 py-1 text-sm text-secondary hover:text-primary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 text-sm bg-primary text-white rounded hover:bg-opacity-90"
                  >
                    Save
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                    <SafeIcon icon={FiUsers} className="w-5 h-5" />
                    {team.name}
                  </h3>
                  {membership?.role === 'OrgAdmin' && team.name !== 'Unassigned' && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => setEditingTeam(team)}
                        className="p-1 text-gray-500 hover:text-primary"
                      >
                        <SafeIcon icon={FiEdit} className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTeam(team.id)}
                        className="p-1 text-gray-500 hover:text-red-600"
                      >
                        <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {team.description && (
                  <p className="text-secondary text-sm mb-4">{team.description}</p>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-secondary">Members</span>
                    <span className="font-medium">{team.memberships_mt?.length || 0}</span>
                  </div>
                  
                  {team.memberships_mt?.length > 0 && (
                    <div className="space-y-1">
                      {team.memberships_mt.slice(0, 3).map((membership) => (
                        <div key={membership.id} className="flex items-center gap-2 text-sm">
                          <SafeIcon icon={FiUser} className="w-3 h-3 text-gray-400" />
                          <span className="text-secondary">{membership.users_mt.name}</span>
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                            {membership.role}
                          </span>
                        </div>
                      ))}
                      {team.memberships_mt.length > 3 && (
                        <div className="text-xs text-gray-500">
                          +{team.memberships_mt.length - 3} more
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default TeamManagement