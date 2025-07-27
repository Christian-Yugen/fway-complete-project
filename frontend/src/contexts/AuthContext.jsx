import React, { createContext, useContext, useEffect } from 'react'
import useAuthStore from '../store/authStore'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const { user, token, isAuthenticated, login, logout, updateUser, initializeAuth } = useAuthStore()
  
  useEffect(() => {
    // Initialize auth from localStorage on app start
    initializeAuth()
  }, [initializeAuth])
  
  const value = {
    user,
    token,
    isAuthenticated,
    login,
    logout,
    updateUser
  }
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

