import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'
import Papa from 'papaparse'

const { FiPlus, FiUpload, FiEdit, FiTrash2, FiChevronDown, FiChevronRight, FiUser, FiCalendar, FiAlertCircle } = FiIcons

const StrategicPlans = () => {
  const { user, organization, isAdmin, loading: authLoading } = useAuth()
  const [plans, setPlans] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedPlans, setExpandedPlans] = useState({})
  const [showAddPlan, setShowAddPlan] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [newPlan, setNewPlan] = useState({ name: '', description: '' })

  useEffect(() => {
    console.log('StrategicPlans useEffect - Auth state:', { user: !!user, organization: !!organization, isAdmin, authLoading })
    
    if (authLoading) {
      console.log('Auth still loading, waiting...')
      return
    }

    if (!user) {
      console.log('No user found')
      setError('User not authenticated')
      setLoading(false)
      return
    }

    if (!organization) {
      console.log('No organization found for user')
      setError('No organization found. Please contact support.')
      setLoading(false)
      return
    }

    console.log('Fetching data for organization:', organization.id)
    fetchPlans()
    fetchUsers()
  }, [user, organization, isAdmin, authLoading])

  const fetchPlans = async () => {
    try {
      console.log('Fetching strategic plans for organization:', organization.id)
      
      const { data, error } = await supabase
        .from('strategic_plans')
        .select(`
          *,
          strategic_priorities (
            *,
            defining_objectives (
              *,
              action_items (
                *,
                users (name)
              )
            )
          )
        `)
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching plans:', error)
        throw error
      }

      console.log('Strategic plans fetched:', data)
      setPlans(data || [])
    } catch (error) {
      console.error('Error fetching plans:', error)
      setError(`Failed to load strategic plans: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      console.log('Fetching users for organization:', organization.id)
      
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email')
        .eq('organization_id', organization.id)

      if (error) {
        console.error('Error fetching users:', error)
        throw error
      }

      console.log('Users fetched:', data)
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      // Don't set error here as this is not critical for the main functionality
    }
  }

  const handleAddPlan = async () => {
    if (!newPlan.name.trim()) return

    try {
      console.log('Adding new plan:', newPlan)
      
      const { data, error } = await supabase
        .from('strategic_plans')
        .insert([{
          name: newPlan.name,
          description: newPlan.description,
          organization_id: organization.id,
          created_by: user.id
        }])
        .select()

      if (error) {
        console.error('Error adding plan:', error)
        throw error
      }

      console.log('Plan added successfully:', data)
      setPlans([data[0], ...plans])
      setNewPlan({ name: '', description: '' })
      setShowAddPlan(false)
    } catch (error) {
      console.error('Error adding plan:', error)
      setError(`Failed to create plan: ${error.message}`)
    }
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (!file) return

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        console.log('CSV data:', results.data)
        // Process CSV data and create strategic plan structure
        // This would need to be implemented based on your CSV format
      },
      error: (error) => {
        console.error('Error parsing CSV:', error)
      }
    })
  }

  const togglePlanExpansion = (planId) => {
    setExpandedPlans(prev => ({
      ...prev,
      [planId]: !prev[planId]
    }))
  }

  const updateActionItemStatus = async (itemId, newStatus) => {
    try {
      const { error } = await supabase
        .from('action_items')
        .update({ status: newStatus })
        .eq('id', itemId)

      if (error) throw error

      // Refresh plans to show updated status
      fetchPlans()
    } catch (error) {
      console.error('Error updating action item:', error)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'not_started':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Show loading spinner while auth is loading
  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Show error if there's an error
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <SafeIcon icon={FiAlertCircle} className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-primary mb-2">Error Loading Strategic Plans</h2>
          <p className="text-secondary mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null)
              setLoading(true)
              if (organization) {
                fetchPlans()
                fetchUsers()
              }
            }}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-primary">Strategic Plans</h1>
              <p className="text-secondary mt-2">
                Manage your organization's strategic initiatives and track progress.
              </p>
              {/* Debug info - remove in production */}
              <div className="text-xs text-gray-400 mt-1">
                User: {user?.email} | Org: {organization?.name} | Admin: {isAdmin ? 'Yes' : 'No'}
              </div>
            </div>
            <div className="flex gap-3">
              {isAdmin && (
                <>
                  <button
                    onClick={() => setShowUpload(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-opacity-90 transition-colors"
                  >
                    <SafeIcon icon={FiUpload} className="w-4 h-4" />
                    Upload CSV
                  </button>
                  <button
                    onClick={() => setShowAddPlan(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors"
                  >
                    <SafeIcon icon={FiPlus} className="w-4 h-4" />
                    Add Plan
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Add Plan Modal */}
        {showAddPlan && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
            >
              <h3 className="text-lg font-semibold text-primary mb-4">Add New Strategic Plan</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">Plan Name</label>
                  <input
                    type="text"
                    value={newPlan.name}
                    onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter plan name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">Description</label>
                  <textarea
                    value={newPlan.description}
                    onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    rows="3"
                    placeholder="Enter plan description"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowAddPlan(false)}
                  className="px-4 py-2 text-secondary hover:text-primary transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPlan}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors"
                >
                  Add Plan
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Upload Modal */}
        {showUpload && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
            >
              <h3 className="text-lg font-semibold text-primary mb-4">Upload Strategic Plan</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">CSV File</label>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div className="text-sm text-gray-600">
                  <p>CSV should include columns: Strategic Priority, Defining Objective, Action Item, Responsible Party, Due Date</p>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowUpload(false)}
                  className="px-4 py-2 text-secondary hover:text-primary transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowUpload(false)}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors"
                >
                  Upload
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Plans List */}
        <div className="space-y-6">
          {plans.length === 0 ? (
            <div className="text-center py-12">
              <div className="mb-4">
                <SafeIcon icon={FiPlus} className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-primary mb-2">No Strategic Plans Yet</h3>
                <p className="text-secondary text-lg">Get started by creating your first strategic plan.</p>
              </div>
              {isAdmin ? (
                <button
                  onClick={() => setShowAddPlan(true)}
                  className="mt-4 px-6 py-3 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors inline-flex items-center gap-2"
                >
                  <SafeIcon icon={FiPlus} className="w-5 h-5" />
                  Create Your First Plan
                </button>
              ) : (
                <p className="text-secondary text-sm mt-4">
                  Contact your organization administrator to create strategic plans.
                </p>
              )}
            </div>
          ) : (
            plans.map((plan) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => togglePlanExpansion(plan.id)}
                        className="text-primary hover:text-opacity-80 transition-colors"
                      >
                        <SafeIcon icon={expandedPlans[plan.id] ? FiChevronDown : FiChevronRight} className="w-5 h-5" />
                      </button>
                      <div>
                        <h3 className="text-xl font-semibold text-primary">{plan.name}</h3>
                        {plan.description && (
                          <p className="text-secondary mt-1">{plan.description}</p>
                        )}
                      </div>
                    </div>
                    {isAdmin && (
                      <div className="flex gap-2">
                        <button className="p-2 text-secondary hover:text-primary transition-colors">
                          <SafeIcon icon={FiEdit} className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-secondary hover:text-red-600 transition-colors">
                          <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {expandedPlans[plan.id] && (
                    <div className="mt-6 space-y-4">
                      {plan.strategic_priorities?.length > 0 ? (
                        plan.strategic_priorities.map((priority) => (
                          <div key={priority.id} className="border-l-4 border-primary pl-4">
                            <h4 className="font-semibold text-primary">{priority.name}</h4>
                            <p className="text-secondary text-sm mb-3">{priority.description}</p>
                            <div className="space-y-3">
                              {priority.defining_objectives?.map((objective) => (
                                <div key={objective.id} className="bg-gray-50 p-4 rounded-lg">
                                  <h5 className="font-medium text-secondary mb-2">{objective.name}</h5>
                                  <p className="text-sm text-gray-600 mb-3">{objective.description}</p>
                                  <div className="space-y-2">
                                    {objective.action_items?.map((item) => (
                                      <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded border">
                                        <div className="flex-1">
                                          <p className="font-medium text-secondary">{item.name}</p>
                                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                                            <div className="flex items-center gap-1">
                                              <SafeIcon icon={FiUser} className="w-3 h-3" />
                                              <span>{item.users?.name || 'Unassigned'}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                              <SafeIcon icon={FiCalendar} className="w-3 h-3" />
                                              <span>{new Date(item.due_date).toLocaleDateString()}</span>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <select
                                            value={item.status}
                                            onChange={(e) => updateActionItemStatus(item.id, e.target.value)}
                                            className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                          >
                                            <option value="not_started">Not Started</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="completed">Completed</option>
                                          </select>
                                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                                            {item.status.replace('_', ' ')}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <p>No strategic priorities defined yet.</p>
                          {isAdmin && (
                            <button className="mt-2 text-primary hover:text-opacity-80">
                              Add Strategic Priority
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default StrategicPlans