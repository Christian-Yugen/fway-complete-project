import { create } from 'zustand'

const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  
  login: (userData, accessToken) => {
    set({
      user: userData,
      token: accessToken,
      isAuthenticated: true
    })
    // Save to localStorage
    localStorage.setItem('fway-auth', JSON.stringify({
      user: userData,
      token: accessToken,
      isAuthenticated: true
    }))
  },
  
  logout: () => {
    set({
      user: null,
      token: null,
      isAuthenticated: false
    })
    // Remove from localStorage
    localStorage.removeItem('fway-auth')
  },
  
  updateUser: (userData) => {
    set(state => {
      const newState = {
        user: { ...state.user, ...userData }
      }
      // Update localStorage
      const authData = JSON.parse(localStorage.getItem('fway-auth') || '{}')
      localStorage.setItem('fway-auth', JSON.stringify({
        ...authData,
        user: newState.user
      }))
      return newState
    })
  },
  
  getAuthHeaders: () => {
    const token = get().token
    return token ? { Authorization: `Bearer ${token}` } : {}
  },
  
  // Initialize from localStorage
  initializeAuth: () => {
    try {
      const authData = localStorage.getItem('fway-auth')
      if (authData) {
        const { user, token, isAuthenticated } = JSON.parse(authData)
        set({ user, token, isAuthenticated })
      }
    } catch (error) {
      console.error('Error initializing auth:', error)
      localStorage.removeItem('fway-auth')
    }
  }
}))

export default useAuthStore
export { useAuthStore }

