import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { motion } from 'framer-motion'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiMenu, FiX, FiUser, FiLogOut } = FiIcons

const Navbar = () => {
  const { user, signOut } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img 
              src="https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1751668137997-StraetgyPilot%20logo.png" 
              alt="JNW Consulting" 
              className="h-10 w-auto"
            />
            <span className="text-xl font-bold text-primary">StrategyPilot</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {user ? (
              <>
                <Link to="/dashboard" className="text-secondary hover:text-primary transition-colors">
                  Dashboard
                </Link>
                <Link to="/plans" className="text-secondary hover:text-primary transition-colors">
                  Strategic Plans
                </Link>
                <Link to="/subscription" className="text-secondary hover:text-primary transition-colors">
                  Subscription
                </Link>
                <Link to="/support" className="text-secondary hover:text-primary transition-colors">
                  Support
                </Link>
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-secondary hover:text-primary transition-colors">
                    <SafeIcon icon={FiUser} className="w-5 h-5" />
                    <span>Account</span>
                  </button>
                  <div className="absolute right-0 w-48 mt-2 py-2 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link to="/profile" className="block px-4 py-2 text-sm text-secondary hover:bg-gray-100">
                      Profile
                    </Link>
                    <button 
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-secondary hover:bg-gray-100"
                    >
                      <SafeIcon icon={FiLogOut} className="w-4 h-4 inline mr-2" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-secondary hover:text-primary transition-colors">
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-secondary hover:text-primary transition-colors"
            >
              <SafeIcon icon={isMenuOpen ? FiX : FiMenu} className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden bg-white border-t border-gray-200"
        >
          <div className="px-2 pt-2 pb-3 space-y-1">
            {user ? (
              <>
                <Link to="/dashboard" className="block px-3 py-2 text-secondary hover:text-primary transition-colors">
                  Dashboard
                </Link>
                <Link to="/plans" className="block px-3 py-2 text-secondary hover:text-primary transition-colors">
                  Strategic Plans
                </Link>
                <Link to="/subscription" className="block px-3 py-2 text-secondary hover:text-primary transition-colors">
                  Subscription
                </Link>
                <Link to="/support" className="block px-3 py-2 text-secondary hover:text-primary transition-colors">
                  Support
                </Link>
                <Link to="/profile" className="block px-3 py-2 text-secondary hover:text-primary transition-colors">
                  Profile
                </Link>
                <button 
                  onClick={handleSignOut}
                  className="block w-full text-left px-3 py-2 text-secondary hover:text-primary transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block px-3 py-2 text-secondary hover:text-primary transition-colors">
                  Login
                </Link>
                <Link to="/signup" className="block px-3 py-2 text-secondary hover:text-primary transition-colors">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </motion.div>
      )}
    </nav>
  )
}

export default Navbar