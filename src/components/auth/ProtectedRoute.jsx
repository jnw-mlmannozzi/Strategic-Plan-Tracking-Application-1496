import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { hasRole } from '../../utils/roles'
import LoadingSpinner from '../common/LoadingSpinner'

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading, role } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return <Navigate to="/login" />
  }

  if (requiredRole && !hasRole(role, requiredRole)) {
    return <Navigate to="/dashboard" />
  }

  return children
}

export default ProtectedRoute