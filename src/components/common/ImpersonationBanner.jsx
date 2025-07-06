import React from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiAlertTriangle, FiLogOut } = FiIcons

const ImpersonationBanner = () => {
  const { impersonating, stopImpersonation } = useAuth()
  
  if (!impersonating) return null
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-yellow-500 text-yellow-900 px-4 py-3 relative z-50"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SafeIcon icon={FiAlertTriangle} className="w-5 h-5" />
          <span className="font-medium">
            Impersonating: {impersonating.targetUser.name} ({impersonating.targetUser.email})
          </span>
        </div>
        <button
          onClick={stopImpersonation}
          className="flex items-center gap-2 px-3 py-1 bg-yellow-600 text-yellow-100 rounded-lg hover:bg-yellow-700 transition-colors"
        >
          <SafeIcon icon={FiLogOut} className="w-4 h-4" />
          Return to my account
        </button>
      </div>
    </motion.div>
  )
}

export default ImpersonationBanner