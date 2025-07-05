import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiTarget, FiTrendingUp, FiUsers, FiCheckCircle, FiArrowRight } = FiIcons

const Home = () => {
  const features = [
    {
      icon: FiTarget,
      title: "Strategic Planning",
      description: "Create comprehensive strategic plans with priorities, objectives, and actionable items."
    },
    {
      icon: FiTrendingUp,
      title: "Progress Tracking",
      description: "Monitor progress in real-time with detailed dashboards and status reports."
    },
    {
      icon: FiUsers,
      title: "Team Collaboration",
      description: "Assign tasks, share updates, and collaborate effectively across your organization."
    },
    {
      icon: FiCheckCircle,
      title: "Goal Achievement",
      description: "Stay on track with automated reminders and milestone tracking."
    }
  ]

  const pricingPlans = [
    {
      name: "Monthly",
      price: "$99",
      period: "per month",
      features: [
        "Unlimited strategic plans",
        "Team collaboration tools",
        "Progress tracking & reporting",
        "CSV import/export",
        "Email support",
        "7-day free trial"
      ]
    },
    {
      name: "Annual",
      price: "$89",
      period: "per month (billed annually)",
      features: [
        "All monthly features",
        "Priority support",
        "Advanced analytics",
        "Custom reporting",
        "2 months free",
        "7-day free trial"
      ],
      popular: true
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-secondary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-6xl font-bold mb-6"
            >
              Strategic Planning Made Simple
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto"
            >
              Transform your organization's vision into actionable results with our comprehensive strategic planning platform.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="space-x-4"
            >
              <Link 
                to="/signup" 
                className="bg-accent text-primary px-8 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors inline-flex items-center"
              >
                Start Free Trial
                <SafeIcon icon={FiArrowRight} className="ml-2 w-5 h-5" />
              </Link>
              <Link 
                to="/login" 
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary transition-colors"
              >
                Sign In
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Everything You Need for Strategic Success
            </h2>
            <p className="text-xl text-secondary max-w-2xl mx-auto">
              Our platform provides all the tools you need to create, track, and achieve your strategic goals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="bg-primary bg-opacity-10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <SafeIcon icon={feature.icon} className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-primary mb-2">{feature.title}</h3>
                <p className="text-secondary">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Choose Your Plan
            </h2>
            <p className="text-xl text-secondary max-w-2xl mx-auto">
              Start with a 7-day free trial. No credit card required.
            </p>
          </div>

          <div className="flex justify-center">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
              {pricingPlans.map((plan, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className={`bg-white rounded-lg shadow-lg p-8 ${
                    plan.popular ? 'ring-2 ring-accent transform scale-105' : ''
                  }`}
                >
                  {plan.popular && (
                    <div className="bg-accent text-primary px-3 py-1 rounded-full text-sm font-semibold mb-4 inline-block">
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-2xl font-bold text-primary mb-2">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-primary">{plan.price}</span>
                    <span className="text-secondary"> {plan.period}</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <SafeIcon icon={FiCheckCircle} className="w-5 h-5 text-accent mr-3" />
                        <span className="text-secondary">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/signup"
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors text-center block ${
                      plan.popular
                        ? 'bg-primary text-white hover:bg-opacity-90'
                        : 'bg-gray-100 text-primary hover:bg-gray-200'
                    }`}
                  >
                    Start Free Trial
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Nonprofit Pricing Notation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-center mt-8"
          >
            <p className="text-secondary text-sm">
              For discounted nonprofit pricing, contact{' '}
              <a 
                href="mailto:help@jnwconsulting.org" 
                className="text-primary hover:text-opacity-80 font-medium"
              >
                help@jnwconsulting.org
              </a>
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Strategic Planning?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join hundreds of organizations that have successfully implemented their strategic plans with our platform.
          </p>
          <Link 
            to="/signup" 
            className="bg-accent text-primary px-8 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors inline-flex items-center"
          >
            Get Started Today
            <SafeIcon icon={FiArrowRight} className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Home