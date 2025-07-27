const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL
  }
  
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    }
    
    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }
  
  // Auth endpoints
  async googleAuth(token) {
    return this.request('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ token })
    })
  }
  
  async refreshToken(authHeaders) {
    return this.request('/auth/refresh', {
      method: 'POST',
      headers: authHeaders
    })
  }
  
  async getCurrentUser(authHeaders) {
    return this.request('/auth/me', {
      headers: authHeaders
    })
  }
  
  // User endpoints
  async getUserProfile(authHeaders) {
    return this.request('/users/profile', {
      headers: authHeaders
    })
  }
  
  async updateUserProfile(userData, authHeaders) {
    return this.request('/users/profile', {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify(userData)
    })
  }
  
  async updateUserLocation(location, authHeaders) {
    return this.request('/users/location', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(location)
    })
  }
  
  async getUserById(userId) {
    return this.request(`/users/${userId}`)
  }
  
  async getNearbyUsers(latitude, longitude, radius = 10) {
    return this.request(`/users/nearby?latitude=${latitude}&longitude=${longitude}&radius=${radius}`)
  }
  
  // Service endpoints
  async getServices(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    return this.request(`/services${queryString ? `?${queryString}` : ''}`)
  }
  
  async getServiceById(serviceId) {
    return this.request(`/services/${serviceId}`)
  }
  
  async createService(serviceData, authHeaders) {
    return this.request('/services', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(serviceData)
    })
  }
  
  async updateService(serviceId, serviceData, authHeaders) {
    return this.request(`/services/${serviceId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify(serviceData)
    })
  }
  
  async deleteService(serviceId, authHeaders) {
    return this.request(`/services/${serviceId}`, {
      method: 'DELETE',
      headers: authHeaders
    })
  }
  
  async getCategories() {
    return this.request('/services/categories')
  }
  
  async getMyServices(authHeaders) {
    return this.request('/services/my-services', {
      headers: authHeaders
    })
  }
  
  // Booking endpoints
  async createBooking(bookingData, authHeaders) {
    return this.request('/bookings', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(bookingData)
    })
  }
  
  async getBookings(params = {}, authHeaders) {
    const queryString = new URLSearchParams(params).toString()
    return this.request(`/bookings${queryString ? `?${queryString}` : ''}`, {
      headers: authHeaders
    })
  }
  
  async getBookingById(bookingId, authHeaders) {
    return this.request(`/bookings/${bookingId}`, {
      headers: authHeaders
    })
  }
  
  async updateBookingStatus(bookingId, status, authHeaders) {
    return this.request(`/bookings/${bookingId}/status`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ status })
    })
  }
  
  async getBookingMessages(bookingId, authHeaders) {
    return this.request(`/bookings/${bookingId}/messages`, {
      headers: authHeaders
    })
  }
  
  async sendMessage(bookingId, message, authHeaders) {
    return this.request(`/bookings/${bookingId}/messages`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ message })
    })
  }
  
  // Health check
  async healthCheck() {
    return this.request('/health')
  }
}

export default new ApiService()

