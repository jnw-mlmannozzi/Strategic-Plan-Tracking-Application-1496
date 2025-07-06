import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_key')

export const createCheckoutSession = async (planId, userCount, isAnnual, isNonprofit, organizationId) => {
  try {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        planId,
        userCount,
        isAnnual,
        isNonprofit,
        organizationId
      }),
    })

    const session = await response.json()
    
    if (!response.ok) {
      throw new Error(session.error || 'Failed to create checkout session')
    }

    const stripe = await stripePromise
    const { error } = await stripe.redirectToCheckout({
      sessionId: session.sessionId,
    })

    if (error) {
      throw error
    }

  } catch (error) {
    console.error('Error creating checkout session:', error)
    throw error
  }
}

export const createPortalSession = async (customerId) => {
  try {
    const response = await fetch('/api/create-portal-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ customerId }),
    })

    const session = await response.json()
    
    if (!response.ok) {
      throw new Error(session.error || 'Failed to create portal session')
    }

    window.location.href = session.url

  } catch (error) {
    console.error('Error creating portal session:', error)
    throw error
  }
}

export default stripePromise