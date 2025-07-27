// User geolocation service for real-time location tracking
class UserGeolocationService {
  constructor() {
    this.currentPosition = null
    this.watchId = null
    this.isWatching = false
    this.lastKnownPosition = null
    this.locationHistory = []
    this.subscribers = new Set()
    this.options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000 // 1 minute
    }
    
    // Load saved position from localStorage
    this.loadSavedPosition()
  }

  // Check if geolocation is supported
  isSupported() {
    return 'geolocation' in navigator
  }

  // Check if location permission is granted
  async checkPermission() {
    if (!('permissions' in navigator)) {
      return 'unsupported'
    }

    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' })
      return permission.state // 'granted', 'denied', or 'prompt'
    } catch (error) {
      console.error('Error checking geolocation permission:', error)
      return 'error'
    }
  }

  // Request location permission
  async requestPermission() {
    if (!this.isSupported()) {
      throw new Error('Geolocation is not supported by this browser')
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.updatePosition(position)
          resolve(this.formatPosition(position))
        },
        (error) => {
          reject(this.handleGeolocationError(error))
        },
        this.options
      )
    })
  }

  // Get current position (one-time)
  async getCurrentPosition(options = {}) {
    if (!this.isSupported()) {
      throw new Error('Geolocation is not supported by this browser')
    }

    const geoOptions = { ...this.options, ...options }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.updatePosition(position)
          resolve(this.formatPosition(position))
        },
        (error) => {
          // If fresh location fails, return last known position if available
          if (this.lastKnownPosition && options.fallbackToLast !== false) {
            console.warn('Using last known position due to error:', error.message)
            resolve(this.lastKnownPosition)
          } else {
            reject(this.handleGeolocationError(error))
          }
        },
        geoOptions
      )
    })
  }

  // Start watching position changes
  startWatching(options = {}) {
    if (!this.isSupported()) {
      throw new Error('Geolocation is not supported by this browser')
    }

    if (this.isWatching) {
      console.warn('Already watching position')
      return
    }

    const geoOptions = { ...this.options, ...options }

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        this.updatePosition(position)
        this.notifySubscribers('position_update', this.formatPosition(position))
      },
      (error) => {
        console.error('Geolocation watch error:', error)
        this.notifySubscribers('error', this.handleGeolocationError(error))
      },
      geoOptions
    )

    this.isWatching = true
    this.notifySubscribers('watch_started', { watchId: this.watchId })
  }

  // Stop watching position changes
  stopWatching() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId)
      this.watchId = null
      this.isWatching = false
      this.notifySubscribers('watch_stopped', {})
    }
  }

  // Update internal position data
  updatePosition(position) {
    const formattedPosition = this.formatPosition(position)
    
    this.currentPosition = position
    this.lastKnownPosition = formattedPosition
    
    // Add to history (keep last 10 positions)
    this.locationHistory.unshift({
      ...formattedPosition,
      timestamp: Date.now()
    })
    
    if (this.locationHistory.length > 10) {
      this.locationHistory = this.locationHistory.slice(0, 10)
    }

    // Save to localStorage
    this.savePosition(formattedPosition)
  }

  // Format position object
  formatPosition(position) {
    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      altitude: position.coords.altitude,
      altitudeAccuracy: position.coords.altitudeAccuracy,
      heading: position.coords.heading,
      speed: position.coords.speed,
      timestamp: position.timestamp,
      formatted: {
        lat: parseFloat(position.coords.latitude.toFixed(6)),
        lng: parseFloat(position.coords.longitude.toFixed(6))
      }
    }
  }

  // Handle geolocation errors
  handleGeolocationError(error) {
    const errorMessages = {
      1: 'Permissão de localização negada pelo usuário',
      2: 'Posição indisponível devido a falha interna',
      3: 'Timeout na obtenção da localização'
    }

    return {
      code: error.code,
      message: errorMessages[error.code] || error.message,
      originalError: error
    }
  }

  // Calculate distance between two points (Haversine formula)
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371 // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1)
    const dLng = this.toRadians(lng2 - lng1)
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2)
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c

    return {
      kilometers: Math.round(distance * 100) / 100,
      meters: Math.round(distance * 1000),
      formatted: distance < 1 ? 
        `${Math.round(distance * 1000)}m` : 
        `${Math.round(distance * 10) / 10}km`
    }
  }

  // Convert degrees to radians
  toRadians(degrees) {
    return degrees * (Math.PI / 180)
  }

  // Calculate bearing between two points
  calculateBearing(lat1, lng1, lat2, lng2) {
    const dLng = this.toRadians(lng2 - lng1)
    const lat1Rad = this.toRadians(lat1)
    const lat2Rad = this.toRadians(lat2)

    const y = Math.sin(dLng) * Math.cos(lat2Rad)
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - 
              Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng)

    const bearing = Math.atan2(y, x)
    return (this.toDegrees(bearing) + 360) % 360
  }

  // Convert radians to degrees
  toDegrees(radians) {
    return radians * (180 / Math.PI)
  }

  // Get compass direction from bearing
  getCompassDirection(bearing) {
    const directions = [
      'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
      'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'
    ]
    const index = Math.round(bearing / 22.5) % 16
    return directions[index]
  }

  // Find nearest professionals
  findNearestProfessionals(professionals, maxDistance = 10) {
    if (!this.lastKnownPosition) {
      throw new Error('User location not available')
    }

    const userLat = this.lastKnownPosition.latitude
    const userLng = this.lastKnownPosition.longitude

    return professionals
      .map(professional => {
        if (!professional.location || !professional.location.coordinates) {
          return null
        }

        const distance = this.calculateDistance(
          userLat,
          userLng,
          professional.location.coordinates.lat,
          professional.location.coordinates.lng
        )

        const bearing = this.calculateBearing(
          userLat,
          userLng,
          professional.location.coordinates.lat,
          professional.location.coordinates.lng
        )

        return {
          ...professional,
          distance,
          bearing,
          direction: this.getCompassDirection(bearing)
        }
      })
      .filter(professional => professional && professional.distance.kilometers <= maxDistance)
      .sort((a, b) => a.distance.kilometers - b.distance.kilometers)
  }

  // Check if user is within radius of a location
  isWithinRadius(targetLat, targetLng, radiusKm) {
    if (!this.lastKnownPosition) {
      return false
    }

    const distance = this.calculateDistance(
      this.lastKnownPosition.latitude,
      this.lastKnownPosition.longitude,
      targetLat,
      targetLng
    )

    return distance.kilometers <= radiusKm
  }

  // Get location accuracy status
  getAccuracyStatus() {
    if (!this.lastKnownPosition) {
      return 'unknown'
    }

    const accuracy = this.lastKnownPosition.accuracy

    if (accuracy <= 10) return 'excellent'
    if (accuracy <= 50) return 'good'
    if (accuracy <= 100) return 'fair'
    return 'poor'
  }

  // Get movement speed (if available)
  getMovementSpeed() {
    if (!this.lastKnownPosition || !this.lastKnownPosition.speed) {
      return null
    }

    const speedMs = this.lastKnownPosition.speed
    const speedKmh = speedMs * 3.6

    return {
      metersPerSecond: Math.round(speedMs * 100) / 100,
      kilometersPerHour: Math.round(speedKmh * 100) / 100,
      formatted: speedKmh < 1 ? 
        `${Math.round(speedMs * 100) / 100} m/s` : 
        `${Math.round(speedKmh)} km/h`
    }
  }

  // Save position to localStorage
  savePosition(position) {
    try {
      localStorage.setItem('fway_last_position', JSON.stringify({
        ...position,
        savedAt: Date.now()
      }))
    } catch (error) {
      console.error('Error saving position to localStorage:', error)
    }
  }

  // Load position from localStorage
  loadSavedPosition() {
    try {
      const saved = localStorage.getItem('fway_last_position')
      if (saved) {
        const position = JSON.parse(saved)
        // Only use if saved within last 24 hours
        if (Date.now() - position.savedAt < 24 * 60 * 60 * 1000) {
          this.lastKnownPosition = position
        }
      }
    } catch (error) {
      console.error('Error loading saved position:', error)
    }
  }

  // Subscribe to location updates
  subscribe(callback) {
    this.subscribers.add(callback)
    
    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback)
    }
  }

  // Notify all subscribers
  notifySubscribers(event, data) {
    this.subscribers.forEach(callback => {
      try {
        callback(event, data)
      } catch (error) {
        console.error('Error in location subscriber:', error)
      }
    })
  }

  // Get location history
  getLocationHistory() {
    return [...this.locationHistory]
  }

  // Clear location history
  clearLocationHistory() {
    this.locationHistory = []
  }

  // Get current position summary
  getCurrentPositionSummary() {
    if (!this.lastKnownPosition) {
      return null
    }

    return {
      coordinates: this.lastKnownPosition.formatted,
      accuracy: this.getAccuracyStatus(),
      timestamp: new Date(this.lastKnownPosition.timestamp).toLocaleString('pt-BR'),
      isWatching: this.isWatching,
      speed: this.getMovementSpeed()
    }
  }

  // Simulate location for testing
  simulateLocation(lat, lng, accuracy = 10) {
    const mockPosition = {
      coords: {
        latitude: lat,
        longitude: lng,
        accuracy,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null
      },
      timestamp: Date.now()
    }

    this.updatePosition(mockPosition)
    this.notifySubscribers('position_update', this.formatPosition(mockPosition))
  }

  // Cleanup
  destroy() {
    this.stopWatching()
    this.subscribers.clear()
    this.locationHistory = []
    this.currentPosition = null
    this.lastKnownPosition = null
  }
}

// Create singleton instance
const userGeolocationService = new UserGeolocationService()

export default userGeolocationService

// Export class for testing
export { UserGeolocationService }

