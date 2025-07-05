import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../config/supabase'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'
import stripePromise from '../config/stripe'

const { FiCreditCard, FiCheckCircle, FiAlertCircle } = FiIcons

const Subscription = () => {
  const { user, organization, isAdmin } = useAuth()
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)
  const [processingPayment, setProcessingPayment] = useState(false)

  useEffect(() => {
    if (organization && isAdmin) {
      fetchSubscription()
    } else {
      setLoading(false)
    }
  }, [organization, isAdmin])

  const fetchSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('organization_id', organization.id)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      
      setSubscription(data)
    } catch (error) {
      console.error('Error fetching subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribe = async (planType) => {
    setProcessingPayment(true)
    
    try {
      const stripe = await stripePromise
      
      // Create checkout session
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          planType,
          organizationId: organization.id,
          userId: user.id
        }
      })

      if (error) throw error

      // Redirect to Stripe Checkout
      const result = await stripe.redirectToCheckout({
        sessionId: data.sessionId
      })

      if (result.error) {
        throw new Error(result.error.message)
      }
    } catch (error) {
      console.error('Error creating subscription:', error)
      alert('Failed to create subscription. Please try again.')
    } finally {
      setProcessingPayment(false)
    }
  }

  const plans = [
    {
      id: 'monthly',
      name: 'Monthly',
      price: 99,
      interval: 'month',
      features: [
        'Unlimited strategic plans',
        'Team collaboration tools',
        'Progress tracking & reporting',
        'CSV import/export',
        'Email support',
        '7-day free trial'
      ]
    },
    {
      id: 'annual',
      name: 'Annual',
      price: 89,
      interval: 'month',
      billedAnnually: true,
      savings: 'Save $120/year',
      features: [
        'All monthly features',
        'Priority support',
        'Advanced analytics',
        'Custom reporting',
        '2 months free',
        '7-day free trial'
      ],
      popular: true
    },
    {
      id: 'nonprofit',
      name: 'Nonprofit',
      price: 49,
      interval: 'month',
      features: [
        'All standard features',
        'Special nonprofit pricing',
        'Dedicated support',
        'Impact tracking tools',
        'Grant reporting assistance',
        '7-day free trial'
      ]
    }
  ]

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <SafeIcon icon={FiAlertCircle} className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-primary mb-2">Access Restricted</h2>
          <p className="text-secondary">
            Only organization administrators can view and manage subscription information.
          </p>
        </div>
      </div>
    )
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary">Subscription</h1>
          <p className="text-secondary mt-2">
            Manage your organization's subscription and billing information.
          </p>
        </div>

        {/* Current Subscription */}
        {subscription && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-md p-6 mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-primary">Current Subscription</h3>
                <p className="text-secondary mt-1">
                  {subscription.plan_name} - ${subscription.amount}/month
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Status: <span className="font-medium">{subscription.status}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Next billing: {new Date(subscription.current_period_end).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <SafeIcon icon={FiCheckCircle} className="w-5 h-5 text-green-500" />
                <span className="text-green-600 font-medium">Active</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`bg-white rounded-lg shadow-lg p-8 relative ${
                plan.popular ? 'ring-2 ring-accent transform scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="bg-accent text-primary px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                </div>
              )}

              <div className="text-center">
                <h3 className="text-2xl font-bold text-primary mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-primary">${plan.price}</span>
                  <span className="text-secondary"> /{plan.interval}</span>
                  {plan.billedAnnually && (
                    <p className="text-sm text-green-600 font-medium mt-1">{plan.savings}</p>
                  )}
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <SafeIcon icon={FiCheckCircle} className="w-5 h-5 text-accent mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-secondary">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={processingPayment || (subscription && subscription.stripe_plan_id === plan.id)}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                  subscription && subscription.stripe_plan_id === plan.id
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : plan.popular
                    ? 'bg-primary text-white hover:bg-opacity-90'
                    : 'bg-gray-100 text-primary hover:bg-gray-200'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {processingPayment ? (
                  'Processing...'
                ) : subscription && subscription.stripe_plan_id === plan.id ? (
                  'Current Plan'
                ) : subscription ? (
                  'Switch Plan'
                ) : (
                  'Start Free Trial'
                )}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Billing Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 bg-white rounded-lg shadow-md p-6"
        >
          <h3 className="text-lg font-semibold text-primary mb-4">Billing Information</h3>
          
          {subscription ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">
                    Payment Method
                  </label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <SafeIcon icon={FiCreditCard} className="w-5 h-5 text-secondary" />
                    <span className="text-secondary">
                      **** **** **** {subscription.last4 || '****'}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">
                    Next Billing Date
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-secondary">
                      {subscription.current_period_end 
                        ? new Date(subscription.current_period_end).toLocaleDateString()
                        : 'N/A'
                      }
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-opacity-90 transition-colors">
                  Update Payment Method
                </button>
                <button className="px-4 py-2 border border-gray-300 text-secondary rounded-lg hover:bg-gray-50 transition-colors">
                  Download Invoice
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <SafeIcon icon={FiCreditCard} className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-secondary">
                No active subscription. Choose a plan above to get started.
              </p>
            </div>
          )}
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-12 bg-white rounded-lg shadow-md p-6"
        >
          <h3 className="text-lg font-semibold text-primary mb-4">Frequently Asked Questions</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-secondary mb-2">Can I cancel my subscription anytime?</h4>
              <p className="text-gray-600 text-sm">
                Yes, you can cancel your subscription at any time. Your access will continue until the end of your current billing period.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-secondary mb-2">What happens during the free trial?</h4>
              <p className="text-gray-600 text-sm">
                You get full access to all features for 7 days. Your card will only be charged after the trial period ends.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-secondary mb-2">How do I qualify for nonprofit pricing?</h4>
              <p className="text-gray-600 text-sm">
                Contact us at help@jnwconsulting.org with your nonprofit documentation for verification.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Subscription