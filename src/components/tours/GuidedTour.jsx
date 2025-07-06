import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiX, FiArrowLeft, FiArrowRight, FiCheckCircle } = FiIcons

const tourSteps = {
  OrgAdmin: [
    {
      id: 'welcome',
      title: 'Welcome to StrategyPilot!',
      content: 'As an Organization Administrator, you have full control over your organization\'s strategic planning. Let\'s walk through the key features.',
      target: null,
      position: 'center'
    },
    {
      id: 'dashboard',
      title: 'Your Dashboard',
      content: 'This is your command center. Monitor progress across all teams and strategic plans.',
      target: '[data-tour="dashboard"]',
      position: 'bottom'
    },
    {
      id: 'teams',
      title: 'Team Management',
      content: 'Create and manage teams within your organization. Assign users to teams and set team administrators.',
      target: '[data-tour="teams"]',
      position: 'bottom'
    },
    {
      id: 'users',
      title: 'User Invitations',
      content: 'Invite new users to your organization. You can assign them to specific teams and set their roles.',
      target: '[data-tour="users"]',
      position: 'bottom'
    },
    {
      id: 'subscription',
      title: 'Subscription Management',
      content: 'Manage your organization\'s subscription, view usage, and upgrade plans as needed.',
      target: '[data-tour="subscription"]',
      position: 'bottom'
    },
    {
      id: 'plans',
      title: 'Strategic Plans',
      content: 'Create organization-wide or team-specific strategic plans. Monitor progress and assign action items.',
      target: '[data-tour="plans"]',
      position: 'bottom'
    }
  ],
  TeamAdmin: [
    {
      id: 'welcome',
      title: 'Welcome Team Administrator!',
      content: 'You can manage your team members and create strategic plans for your team.',
      target: null,
      position: 'center'
    },
    {
      id: 'team-dashboard',
      title: 'Team Dashboard',
      content: 'View your team\'s progress and key metrics.',
      target: '[data-tour="dashboard"]',
      position: 'bottom'
    },
    {
      id: 'team-plans',
      title: 'Team Plans',
      content: 'Create and manage strategic plans specific to your team.',
      target: '[data-tour="plans"]',
      position: 'bottom'
    },
    {
      id: 'team-members',
      title: 'Team Members',
      content: 'View your team members and their assigned action items.',
      target: '[data-tour="team-members"]',
      position: 'bottom'
    }
  ],
  Member: [
    {
      id: 'welcome',
      title: 'Welcome to StrategyPilot!',
      content: 'You can view strategic plans and update your assigned action items.',
      target: null,
      position: 'center'
    },
    {
      id: 'my-tasks',
      title: 'Your Action Items',
      content: 'View and update progress on tasks assigned to you.',
      target: '[data-tour="my-tasks"]',
      position: 'bottom'
    },
    {
      id: 'plans-view',
      title: 'Strategic Plans',
      content: 'Browse strategic plans you have access to and see how your work contributes to larger objectives.',
      target: '[data-tour="plans"]',
      position: 'bottom'
    }
  ],
  Support: [
    {
      id: 'welcome',
      title: 'Support Dashboard',
      content: 'As a support user, you can assist customers by impersonating their accounts and viewing system-wide data.',
      target: null,
      position: 'center'
    },
    {
      id: 'impersonation',
      title: 'User Impersonation',
      content: 'Use the "Login As" feature to impersonate users for troubleshooting.',
      target: '[data-tour="impersonation"]',
      position: 'bottom'
    },
    {
      id: 'audit-logs',
      title: 'Audit Logs',
      content: 'View system-wide audit logs to track user actions and troubleshoot issues.',
      target: '[data-tour="audit-logs"]',
      position: 'bottom'
    }
  ]
}

const GuidedTour = ({ role, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const steps = tourSteps[role] || []

  useEffect(() => {
    // Check if user has completed tour
    const tourCompleted = localStorage.getItem(`tour-completed-${role}`)
    if (!tourCompleted && steps.length > 0) {
      setIsVisible(true)
    }
  }, [role, steps.length])

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    localStorage.setItem(`tour-completed-${role}`, 'true')
    setIsVisible(false)
    if (onComplete) onComplete()
  }

  const handleSkip = () => {
    handleComplete()
  }

  if (!isVisible || steps.length === 0) return null

  const currentStepData = steps[currentStep]

  const getPosition = () => {
    if (currentStepData.position === 'center') {
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 9999
      }
    }
    
    // For targeted elements, position relative to target
    const target = document.querySelector(currentStepData.target)
    if (target) {
      const rect = target.getBoundingClientRect()
      return {
        position: 'fixed',
        top: rect.bottom + 10,
        left: rect.left,
        zIndex: 9999
      }
    }
    
    return {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 9999
    }
  }

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-9998" />
      
      {/* Tour Step */}
      <AnimatePresence>
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-lg shadow-xl max-w-md p-6"
          style={getPosition()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-primary">
              {currentStepData.title}
            </h3>
            <button
              onClick={handleSkip}
              className="text-gray-500 hover:text-gray-700"
            >
              <SafeIcon icon={FiX} className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <p className="text-secondary mb-6">
            {currentStepData.content}
          </p>

          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SafeIcon icon={FiArrowLeft} className="w-4 h-4" />
              Previous
            </button>
            
            <div className="flex gap-2">
              <button
                onClick={handleSkip}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Skip Tour
              </button>
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90"
              >
                {currentStep === steps.length - 1 ? (
                  <>
                    <SafeIcon icon={FiCheckCircle} className="w-4 h-4" />
                    Complete
                  </>
                ) : (
                  <>
                    Next
                    <SafeIcon icon={FiArrowRight} className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  )
}

export default GuidedTour