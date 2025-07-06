import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'
import TeamManagement from '../components/admin/TeamManagement'
import UserInviteForm from '../components/admin/UserInviteForm'
import ImpersonationPanel from '../components/support/ImpersonationPanel'
import GuidedTour from '../components/tours/GuidedTour'

const { FiUsers, FiUserPlus, FiSettings, FiBarChart3, FiCreditCard } = FiIcons

const AdminDashboard = () => {
  const { organization, membership, role } = useAuth()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTeams: 0,
    totalPlans: 0,
    activeUsers: 0
  })
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (organization) {
      fetchStats()
    }
  }, [organization])

  const fetchStats = async () => {
    try {
      const [usersRes, teamsRes, plansRes] = await Promise.all([
        supabase
          .from('users_mt')
          .select('id, last_login')
          .eq('org_id', organization.id),
        supabase
          .from('teams_mt')
          .select('id')
          .eq('organization_id', organization.id),
        supabase
          .from('strategic_plans_mt')
          .select('id')
          .eq('organization_id', organization.id)
      ])

      const totalUsers = usersRes.data?.length || 0
      const activeUsers = usersRes.data?.filter(user => {
        if (!user.last_login) return false
        const lastLogin = new Date(user.last_login)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        return lastLogin > thirtyDaysAgo
      }).length || 0

      setStats({
        totalUsers,
        totalTeams: teamsRes.data?.length || 0,
        totalPlans: plansRes.data?.length || 0,
        activeUsers
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: FiUsers,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      title: 'Active Users (30d)',
      value: stats.activeUsers,
      icon: FiBarChart3,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      title: 'Teams',
      value: stats.totalTeams,
      icon: FiUsers,
      color: 'bg-purple-500',
      textColor: 'text-purple-600'
    },
    {
      title: 'Strategic Plans',
      value: stats.totalPlans,
      icon: FiSettings,
      color: 'bg-orange-500',
      textColor: 'text-orange-600'
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8" data-tour="dashboard">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-primary">
                {role === 'Support' ? 'Support Dashboard' : 'Admin Dashboard'}
              </h1>
              <p className="text-secondary mt-2">
                {role === 'Support' 
                  ? 'Manage customer support and user assistance'
                  : 'Manage your organization, teams, and users'
                }
              </p>
            </div>
            {(role === 'OrgAdmin' || role === 'TeamAdmin') && (
              <button
                onClick={() => setShowInviteForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors"
                data-tour="users"
              >
                <SafeIcon icon={FiUserPlus} className="w-4 h-4" />
                Invite User
              </button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-secondary">{card.title}</p>
                  <p className={`text-2xl font-bold ${card.textColor}`}>{card.value}</p>
                </div>
                <div className={`${card.color} p-3 rounded-full`}>
                  <SafeIcon icon={card.icon} className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Support Features */}
        {role === 'Support' && (
          <div className="mb-8">
            <ImpersonationPanel />
          </div>
        )}

        {/* Team Management */}
        {(role === 'OrgAdmin' || role === 'TeamAdmin') && (
          <div data-tour="teams">
            <TeamManagement />
          </div>
        )}

        {/* Quick Actions */}
        {role === 'OrgAdmin' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                <SafeIcon icon={FiCreditCard} className="w-5 h-5" />
                Subscription Management
              </h3>
              <p className="text-secondary text-sm mb-4">
                Manage your organization's subscription, view usage, and upgrade plans.
              </p>
              <button
                onClick={() => window.location.href = '/subscription'}
                className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-opacity-90 transition-colors"
                data-tour="subscription"
              >
                Manage Subscription
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                <SafeIcon icon={FiSettings} className="w-5 h-5" />
                Organization Settings
              </h3>
              <p className="text-secondary text-sm mb-4">
                Configure organization-wide settings and preferences.
              </p>
              <button className="px-4 py-2 bg-muted text-white rounded-lg hover:bg-opacity-90 transition-colors">
                Organization Settings
              </button>
            </div>
          </motion.div>
        )}

        {/* User Invite Form */}
        <UserInviteForm
          isOpen={showInviteForm}
          onClose={() => setShowInviteForm(false)}
          onInviteSent={fetchStats}
        />

        {/* Guided Tour */}
        <GuidedTour role={role} />
      </div>
    </div>
  )
}

export default AdminDashboard