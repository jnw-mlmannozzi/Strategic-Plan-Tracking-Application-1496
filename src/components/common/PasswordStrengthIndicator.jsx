import React from 'react'
import { getPasswordStrength } from '../../utils/passwordPolicy'

const PasswordStrengthIndicator = ({ password }) => {
  if (!password) return null
  
  const { level, color } = getPasswordStrength(password)
  
  const getColorClass = () => {
    switch (color) {
      case 'red': return 'bg-red-500'
      case 'yellow': return 'bg-yellow-500'
      case 'green': return 'bg-green-500'
      default: return 'bg-gray-300'
    }
  }
  
  const getWidthClass = () => {
    switch (level) {
      case 'weak': return 'w-1/3'
      case 'medium': return 'w-2/3'
      case 'strong': return 'w-full'
      default: return 'w-0'
    }
  }
  
  return (
    <div className="mt-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Password Strength</span>
        <span className={`font-medium ${color === 'red' ? 'text-red-600' : color === 'yellow' ? 'text-yellow-600' : 'text-green-600'}`}>
          {level.charAt(0).toUpperCase() + level.slice(1)}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${getColorClass()} ${getWidthClass()}`}
        ></div>
      </div>
    </div>
  )
}

export default PasswordStrengthIndicator