import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'
import ReactECharts from 'echarts-for-react'
import { format, startOfMonth, endOfMonth } from 'date-fns'

const { FiTarget, FiClock, FiCheckCircle, FiAlertTriangle, FiCalendar, FiFilter, FiPlus, FiArrowRight } = FiIcons

const Dashboard = () => {
  const { user, organization } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    atRisk: 0,
    overdue: 0
  })
  const [viewMode, setViewMode] = useState('status') // 'status' or 'priority'
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'))
  const [loading, setLoading] = useState(true)
  const [hasPlans, setHasPlans] = useState(false)

  useEffect(() => {
    if (organization) {
      checkForPlans()
    } else {
      setLoading(false)
    }
  }, [organization, selectedMonth])

  const checkForPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('strategic_plans_mt')
        .select('id')
        .eq('organization_id', organization.id)
        .limit(1)

      if (error) throw error

      setHasPlans(data && data.length > 0)
    } catch (error) {
      console.error('Error checking for plans:', error)
    } finally {
      setLoading(false)
    }
  }

  const getChartOptions = () => {
    if (viewMode === 'status') {
      return {
        title: {
          text: 'Action Items by Status',
          left: 'center',
          textStyle: {
            color: '#556d70',
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          data: ['Completed', 'In Progress', 'At Risk', 'Overdue']
        },
        series: [
          {
            name: 'Status',
            type: 'pie',
            radius: '50%',
            data: [
              { value: stats.completed, name: 'Completed', itemStyle: { color: '#10b981' } },
              { value: stats.inProgress, name: 'In Progress', itemStyle: { color: '#3b82f6' } },
              { value: stats.atRisk, name: 'At Risk', itemStyle: { color: '#f59e0b' } },
              { value: stats.overdue, name: 'Overdue', itemStyle: { color: '#ef4444' } }
            ],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0,0,0,0.5)'
              }
            }
          }
        ]
      }
    } else {
      return {
        title: {
          text: 'Sample Data - Create Your First Plan',
          left: 'center',
          textStyle: {
            color: '#556d70',
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          data: ['Completed', 'Remaining']
        },
        xAxis: {
          type: 'category',
          data: ['High Priority', 'Medium Priority', 'Low Priority']
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: 'Completed',
            type: 'bar',
            stack: 'total',
            data: [0, 0, 0],
            itemStyle: { color: '#10b981' }
          },
          {
            name: 'Remaining',
            type: 'bar',
            stack: 'total',
            data: [0, 0, 0],
            itemStyle: { color: '#e5e7eb' }
          }
        ]
      }
    }
  }

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0

  const statCards = [
    {
      title: 'Total Items',
      value: stats.total,
      icon: FiTarget,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      title: 'Completed',
      value: stats.completed,
      icon: FiCheckCircle,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      title: 'In Progress',
      value: stats.inProgress,
      icon: FiClock,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      title: 'At Risk',
      value: stats.atRisk,
      icon: FiAlertTriangle,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Overdue',
      value: stats.overdue,
      icon: FiAlertTriangle,
      color: 'bg-red-500',
      textColor: 'text-red-600'
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
          <p className="text-secondary mt-2">
            Welcome back, {user?.email}! Here's your strategic planning overview.
          </p>
        </div>

        {/* Welcome Message for New Users */}
        {!hasPlans && (
          <div className="mb-8 bg-gradient-to-r from-primary to-secondary text-white rounded-lg p-8">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-4">
                  <SafeIcon icon={FiTarget} className="w-8 h-8 mr-3" />
                  <h2 className="text-2xl font-bold">Welcome to StrategyPilot!</h2>
                </div>
                <p className="text-lg mb-4 opacity-90">
                  Your account has been created successfully. Let's get started by creating your first strategic plan.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => navigate('/plans')}
                    className="bg-accent text-primary px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors inline-flex items-center justify-center"
                  >
                    <SafeIcon icon={FiPlus} className="w-5 h-5 mr-2" />
                    Create Your First Strategic Plan
                  </button>
                  <button
                    onClick={() => navigate('/support')}
                    className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary transition-colors inline-flex items-center justify-center"
                  >
                    Need Help Getting Started?
                  </button>
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <SafeIcon icon={FiTarget} className="w-12 h-12 text-white" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Controls - Only show if user has plans */}
        {hasPlans && (
          <div className="mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <SafeIcon icon={FiCalendar} className="w-5 h-5 text-secondary" />
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <SafeIcon icon={FiFilter} className="w-5 h-5 text-secondary" />
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="status">By Status</option>
                <option value="priority">Priority & Objective</option>
              </select>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
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

        {/* Completion Rate */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h3 className="text-lg font-semibold text-primary mb-4">Overall Completion Rate</h3>
            <div className="flex items-center">
              <div className="flex-1 bg-gray-200 rounded-full h-4 mr-4">
                <div
                  className="bg-green-500 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${completionRate}%` }}
                ></div>
              </div>
              <span className="text-2xl font-bold text-green-600">{completionRate}%</span>
            </div>
          </motion.div>
        </div>

        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <ReactECharts option={getChartOptions()} style={{ height: '400px' }} />
        </motion.div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h3 className="text-lg font-semibold text-primary mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/plans')}
                className="w-full text-left p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
              >
                <span>{hasPlans ? 'View All Strategic Plans' : 'Create Your First Plan'}</span>
                <SafeIcon icon={FiArrowRight} className="w-4 h-4 text-primary" />
              </button>
              <button
                onClick={() => navigate('/support')}
                className="w-full text-left p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
              >
                <span>Get Help & Support</span>
                <SafeIcon icon={FiArrowRight} className="w-4 h-4 text-primary" />
              </button>
              <button
                onClick={() => navigate('/subscription')}
                className="w-full text-left p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
              >
                <span>Manage Subscription</span>
                <SafeIcon icon={FiArrowRight} className="w-4 h-4 text-primary" />
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h3 className="text-lg font-semibold text-primary mb-4">Need Help?</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span>Check out our Support Center</span>
                <button
                  onClick={() => navigate('/support')}
                  className="text-primary hover:text-opacity-80"
                >
                  Visit
                </button>
              </div>
              <div className="flex justify-between items-center">
                <span>Contact support</span>
                <button
                  onClick={() => window.location.href = 'mailto:help@jnwconsulting.org'}
                  className="text-primary hover:text-opacity-80"
                >
                  Email
                </button>
              </div>
              <div className="flex justify-between items-center">
                <span>AI Chat Assistant</span>
                <button className="text-primary hover:text-opacity-80">Chat</button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard