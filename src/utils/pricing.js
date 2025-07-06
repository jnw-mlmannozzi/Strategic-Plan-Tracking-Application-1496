export const PRICING_PLANS = {
  STARTER: {
    id: 'starter',
    name: 'Starter',
    userLimit: 5,
    monthlyPrice: 4900, // $49.00 in cents
    annualPrice: 4990, // $499.90 in cents (monthly * 10.2)
    features: [
      'Up to 5 users',
      'Unlimited strategic plans',
      'Team collaboration',
      'Progress tracking',
      'Email support',
      '7-day free trial'
    ]
  },
  GROWTH: {
    id: 'growth',
    name: 'Growth',
    userLimit: 15,
    monthlyPrice: 9900, // $99.00 in cents
    annualPrice: 10599, // $105.99 in cents (monthly * 10.7)
    features: [
      'Up to 15 users',
      'All Starter features',
      'Advanced reporting',
      'CSV import/export',
      'Priority support',
      '7-day free trial'
    ]
  },
  ENTERPRISE: {
    id: 'enterprise',
    name: 'Enterprise',
    userLimit: null, // Unlimited base, but charges per user
    baseMonthlyPrice: 14900, // $149.00 in cents
    baseAnnualPrice: 159900, // $1,599.00 in cents
    perUserMonthlyPrice: 500, // $5.00 in cents per user over 16
    perUserAnnualPrice: 5400, // $54.00 in cents per user over 16 annually
    minUsers: 16,
    features: [
      '16+ users',
      'All Growth features',
      'Custom integrations',
      'Advanced analytics',
      'Dedicated support',
      'Custom training',
      '7-day free trial'
    ]
  }
}

export const NONPROFIT_DISCOUNT = 0.20 // 20% discount
export const ANNUAL_DISCOUNT = 0.15 // 15% discount on monthly pricing when billed annually

export const calculatePlanPrice = (planId, userCount, isAnnual = false, isNonprofit = false) => {
  const plan = PRICING_PLANS[planId.toUpperCase()]
  if (!plan) return null

  let price = 0

  if (plan.id === 'enterprise' && userCount > 16) {
    // Enterprise: base price + per-user overage
    price = isAnnual ? plan.baseAnnualPrice : plan.baseMonthlyPrice
    const overageUsers = userCount - 16
    const perUserPrice = isAnnual ? plan.perUserAnnualPrice : plan.perUserMonthlyPrice
    price += overageUsers * perUserPrice
  } else {
    // Starter/Growth: fixed price
    price = isAnnual ? plan.annualPrice : plan.monthlyPrice
  }

  // Apply nonprofit discount
  if (isNonprofit) {
    price = Math.round(price * (1 - NONPROFIT_DISCOUNT))
  }

  return price
}

export const getPlanByUserCount = (userCount) => {
  if (userCount <= 5) return PRICING_PLANS.STARTER
  if (userCount <= 15) return PRICING_PLANS.GROWTH
  return PRICING_PLANS.ENTERPRISE
}

export const shouldDowngradePlan = (currentPlanId, userCount) => {
  const currentPlan = PRICING_PLANS[currentPlanId.toUpperCase()]
  if (!currentPlan) return false

  if (currentPlan.id === 'growth' && userCount <= 5) return 'starter'
  if (currentPlan.id === 'enterprise' && userCount <= 15) return 'growth'
  
  return false
}

export const formatPrice = (priceInCents, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0
  }).format(priceInCents / 100)
}

export const getUsageWarning = (planId, userCount) => {
  const plan = PRICING_PLANS[planId.toUpperCase()]
  if (!plan) return null

  if (plan.id === 'growth' && userCount >= 12) {
    return {
      type: 'warning',
      message: `You're approaching your user limit (${userCount}/15). Consider upgrading to Enterprise.`,
      severity: userCount >= 14 ? 'high' : 'medium'
    }
  }

  return null
}