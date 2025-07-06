import React, { useState } from 'react'
import { motion } from 'framer-motion'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiMail, FiHelpCircle, FiChevronDown, FiChevronUp, FiMessageCircle, FiBook } = FiIcons

const Support = () => {
  const [expandedFaq, setExpandedFaq] = useState(null)

  const faqs = [
    {
      question: "How do I create my first strategic plan?",
      answer: "To create your first strategic plan, navigate to the Strategic Plans page and click 'Add Plan'. You'll need to define your strategic priorities, then add defining objectives under each priority, and finally create action items with assigned users and due dates."
    },
    {
      question: "Can I import my existing strategic plan?",
      answer: "Yes! You can upload your strategic plan via CSV file. The CSV should include columns for Strategic Priority, Defining Objective, Action Item, Responsible Party, and Due Date. Go to Strategic Plans and click 'Upload CSV'."
    },
    {
      question: "How do I assign team members to action items?",
      answer: "When creating or editing an action item, you can select team members from the dropdown menu. Only users within your organization will be available for assignment. Team members will receive notifications about their assignments."
    },
    {
      question: "What's the difference between admin and regular users?",
      answer: "Admins can create and edit strategic plans, priorities, and objectives. They can also manage subscriptions and add users to the organization. Regular users can only edit action items assigned to them and view all other content."
    },
    {
      question: "How do I track progress on my strategic plan?",
      answer: "Use the Dashboard to view overall progress metrics. You can filter by month and toggle between status view and priority view. The system automatically calculates completion rates and identifies at-risk items."
    },
    {
      question: "Can I print status reports?",
      answer: "Yes, you can generate and print status reports from the Dashboard. The reports include progress metrics, completed items, and upcoming deadlines."
    },
    {
      question: "What happens if I miss a deadline?",
      answer: "Items past their due date will be marked as 'Overdue' in the system. You'll see these highlighted in red on your dashboard. You can still update the status and add progress notes even after the deadline."
    },
    {
      question: "How do I add new users to my organization?",
      answer: "Organization admins can invite new users by having them sign up with the same email domain. The first user to sign up with a domain becomes the admin for that organization."
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer: "Yes, you can cancel your subscription at any time. Your access will continue until the end of your current billing period. Contact us if you need assistance with cancellation."
    },
    {
      question: "Is there a mobile app available?",
      answer: "Currently, StrategyPilot is web-based and optimized for mobile browsers. A dedicated mobile app is in development and will be available soon."
    }
  ]

  const onboardingTips = [
    {
      title: "Start with Your Vision",
      description: "Begin by clearly defining your organization's vision and mission. This will guide all your strategic priorities."
    },
    {
      title: "Break Down Into Priorities",
      description: "Create 3-5 strategic priorities that align with your vision. These should be broad areas of focus for your organization."
    },
    {
      title: "Define Measurable Objectives",
      description: "Under each priority, create specific, measurable objectives that define success for that priority area."
    },
    {
      title: "Create Actionable Items",
      description: "Break down each objective into specific action items with clear owners and realistic deadlines."
    },
    {
      title: "Assign Responsible Parties",
      description: "Make sure every action item has a clear owner. This ensures accountability and progress tracking."
    },
    {
      title: "Set Realistic Timelines",
      description: "Strategic plans typically span 3 years. Set quarterly milestones to track progress and maintain momentum."
    },
    {
      title: "Regular Reviews",
      description: "Schedule monthly reviews to update progress, adjust timelines, and address any roadblocks."
    },
    {
      title: "Use the Dashboard",
      description: "Check your dashboard regularly to monitor overall progress and identify items that need attention."
    }
  ]

  const quickStartGuide = [
    {
      title: "Create Plan",
      description: "Start by creating your strategic plan with a clear name and description.",
      step: 1
    },
    {
      title: "Add Priorities",
      description: "Define 3-5 strategic priorities that align with your organization's goals.",
      step: 2
    },
    {
      title: "Track Progress",
      description: "Create objectives and action items, then watch your dashboard come alive with data.",
      step: 3
    }
  ]

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary">Support Center</h1>
          <p className="text-secondary mt-2">
            Get help with StrategyPilot and learn how to make the most of your strategic planning.
          </p>
        </div>

        {/* Contact Support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary text-white rounded-lg p-6 mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2">Need Personal Assistance?</h2>
              <p className="opacity-90">
                Our support team is here to help you succeed with your strategic planning.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <SafeIcon icon={FiMail} className="w-5 h-5" />
              <a
                href="mailto:help@jnwconsulting.org"
                className="text-accent hover:text-white transition-colors font-medium"
              >
                help@jnwconsulting.org
              </a>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* FAQ Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="flex items-center gap-2 mb-6">
                <SafeIcon icon={FiHelpCircle} className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold text-primary">Frequently Asked Questions</h2>
              </div>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => toggleFaq(index)}
                      className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-medium text-secondary">{faq.question}</span>
                      <SafeIcon
                        icon={expandedFaq === index ? FiChevronUp : FiChevronDown}
                        className="w-5 h-5 text-secondary"
                      />
                    </button>
                    {expandedFaq === index && (
                      <div className="px-4 pb-3 border-t border-gray-200">
                        <p className="text-gray-600 mt-2">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Onboarding Tips */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="flex items-center gap-2 mb-6">
                <SafeIcon icon={FiBook} className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold text-primary">Getting Started Guide</h2>
              </div>

              {/* Quick Start Guide from Dashboard */}
              <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                {quickStartGuide.map((tip, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white rounded-lg shadow-md p-6 border-l-4 border-primary"
                  >
                    <div className="flex items-center mb-3">
                      <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                        {tip.step}
                      </div>
                      <h3 className="text-lg font-semibold text-primary">{tip.title}</h3>
                    </div>
                    <p className="text-secondary text-sm">{tip.description}</p>
                  </motion.div>
                ))}
              </div>

              {/* Detailed Getting Started */}
              <div className="space-y-4">
                {onboardingTips.map((tip, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-secondary mb-1">{tip.title}</h3>
                      <p className="text-gray-600 text-sm">{tip.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <h3 className="text-lg font-semibold text-primary mb-4">Quick Links</h3>
              <div className="space-y-3">
                <a
                  href="#"
                  className="block p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <SafeIcon icon={FiBook} className="w-4 h-4 text-primary" />
                    <span className="text-secondary">User Guide</span>
                  </div>
                </a>
                <a
                  href="#"
                  className="block p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <SafeIcon icon={FiMessageCircle} className="w-4 h-4 text-primary" />
                    <span className="text-secondary">Video Tutorials</span>
                  </div>
                </a>
                <a
                  href="#"
                  className="block p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <SafeIcon icon={FiHelpCircle} className="w-4 h-4 text-primary" />
                    <span className="text-secondary">Best Practices</span>
                  </div>
                </a>
              </div>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <h3 className="text-lg font-semibold text-primary mb-4">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <SafeIcon icon={FiMail} className="w-4 h-4 text-primary" />
                  <span className="text-secondary">help@jnwconsulting.org</span>
                </div>
                <div className="text-sm text-gray-600">
                  <p>We typically respond within 24 hours during business days.</p>
                </div>
              </div>
            </motion.div>

            {/* Tips */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-accent bg-opacity-10 rounded-lg p-6"
            >
              <h3 className="text-lg font-semibold text-primary mb-4">💡 Pro Tip</h3>
              <p className="text-secondary text-sm">
                Use the AI chatbot in the bottom right corner for instant answers to common questions. It's available 24/7 and can help you get started quickly!
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Support