import React, { createContext, useContext, useEffect } from 'react'
import useLocationStore from '../store/locationStore'

const LocationContext = createContext()

export const useLocation = () => {
  const context = useContext(LocationContext)
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider')
  }
  return context
}

export const LocationProvider = ({ children }) => {
  const {
    currentLocation,
    isLocationEnabled,
    locationError,
    getCurrentPosition,
    watchPosition,
    setLocationError
  } = useLocationStore()
  
  useEffect(() => {
    // Try to get location on app start
    getCurrentPosition().catch(error => {
      console.log('Location not available:', error)
    })
  }, [getCurrentPosition])
  
  const value = {
    currentLocation,
    isLocationEnabled,
    locationError,
    getCurrentPosition,
    watchPosition,
    setLocationError
  }
  
  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  )
}

