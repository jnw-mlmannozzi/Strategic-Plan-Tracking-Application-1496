import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiUsers, FiSearch, FiLogIn } = FiIcons

const ImpersonationPanel = () => {
  const { impersonateUser } = useAuth()
  const [organizations, setOrganizations] = useState([])
  const [selectedOrg, setSelectedOrg] = useState('')
  const [users, setUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchOrganizations()
  }, [])

  useEffect(() => {
    if (selectedOrg) {
      fetchUsers()
    } else {
      setUsers([])
    }
  }, [selectedOrg])

  const fetchOrganizations = async () => {
    try {
      const { data, error } = await supabase
        .from('organizations_mt')
        .select('*')
        .order('name')

      if (error) throw error
      setOrganizations(data || [])
    } catch (error) {
      console.error('Error fetching organizations:', error)
    }
  }

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('users_mt')
        .select(`
          *,
          memberships_mt(
            role,
            teams_mt(name)
          )
        `)
        .eq('org_id', selectedOrg)
        .order('name')

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImpersonate = async (userId) => {
    try {
      await impersonateUser(userId, selectedOrg)
    } catch (error) {
      console.error('Error impersonating user:', error)
      alert('Failed to impersonate user: ' + error.message)
    }
  }

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="bg-white rounded-lg shadow-md p-6" data-tour="impersonation">
      <h2 className="text-2xl font-bold text-primary mb-6 flex items-center gap-2">
        <SafeIcon icon={FiUsers} className="w-6 h-6" />
        User Impersonation
      </h2>

      <div className="space-y-4">
        {/* Organization Selection */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-2">
            Select Organization
          </label>
          <select
            value={selectedOrg}
            onChange={(e) => setSelectedOrg(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">Choose an organization...</option>
            {organizations.map(org => (
              <option key={org.id} value={org.id}>
                {org.name} ({org.domain})
              </option>
            ))}
          </select>
        </div>

        {/* User Search */}
        {selectedOrg && (
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Search Users
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Search by name or email..."
              />
              <SafeIcon icon={FiSearch} className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>
          </div>
        )}

        {/* Users List */}
        {selectedOrg && (
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : filteredUsers.length > 0 ? (
              <div className="space-y-2">
                {filteredUsers.map(user => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-secondary">{user.name}</span>
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                          {user.memberships_mt?.[0]?.role || 'No Role'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">{user.email}</div>
                      {user.memberships_mt?.[0]?.teams_mt && (
                        <div className="text-xs text-gray-500">
                          Team: {user.memberships_mt[0].teams_mt.name}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleImpersonate(user.id)}
                      className="flex items-center gap-2 px-3 py-1 bg-yellow-500 text-yellow-900 rounded hover:bg-yellow-600 transition-colors"
                    >
                      <SafeIcon icon={FiLogIn} className="w-4 h-4" />
                      Login As
                    </button>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'No users found matching your search.' : 'No users found.'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ImpersonationPanel