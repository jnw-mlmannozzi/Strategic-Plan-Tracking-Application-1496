import React from 'react'
import {HashRouter as Router, Routes, Route, useLocation} from 'react-router-dom'
import {AuthProvider} from './contexts/AuthContext'
import {motion} from 'framer-motion'

// Components
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AIChat from './components/common/AIChat'

// Pages
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import EmailConfirmation from './pages/EmailConfirmation'
import StrategicPlans from './pages/StrategicPlans'
import Subscription from './pages/Subscription'
import Support from './pages/Support'
import Profile from './pages/Profile'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'

// Component to handle root route with potential confirmation
const HomeOrConfirmation = () => {
  const location = useLocation()
  
  // Check URL parameters for confirmation
  const urlParams = new URLSearchParams(location.search)
  const hashParams = new URLSearchParams(location.hash.substring(1))
  
  // Check if this is an email confirmation
  const hasConfirmationCode = urlParams.get('token_hash') || 
                              urlParams.get('code') || 
                              hashParams.get('code') || 
                              hashParams.get('access_token') ||
                              urlParams.get('token')
  
  const confirmationType = urlParams.get('type') || hashParams.get('type')
  
  console.log('Checking confirmation params:', {
    hasConfirmationCode,
    confirmationType,
    search: location.search,
    hash: location.hash
  })
  
  if (hasConfirmationCode || confirmationType === 'signup') {
    return <EmailConfirmation />
  }
  
  return <Home />
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-background flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomeOrConfirmation />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/confirm" element={<EmailConfirmation />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/plans" 
                element={
                  <ProtectedRoute>
                    <StrategicPlans />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/subscription" 
                element={
                  <ProtectedRoute>
                    <Subscription />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/support" 
                element={
                  <ProtectedRoute>
                    <Support />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
          <Footer />
          <AIChat />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App