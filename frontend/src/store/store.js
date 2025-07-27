// Unified store for the Fway PWA application
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import chatService from '../services/chatService'
import userGeolocationService from '../services/userGeolocation'
import googleMapsService from '../services/googleMaps'
import { mockUsers, mockServices, mockAppointments, mockMessages, mockNotifications } from '../data/mockData'

// Main application store
export const useAppStore = create(
  persist(
    (set, get) => ({
      // App state
      isLoading: false,
      error: null,
      theme: 'light',
      language: 'pt-BR',
      
      // User authentication
      user: null,
      isAuthenticated: false,
      authToken: null,
      
      // Location state
      userLocation: null,
      locationPermission: 'unknown',
      isLocationWatching: false,
      nearbyProfessionals: [],
      
      // Chat state
      conversations: [],
      activeConversation: null,
      unreadMessages: 0,
      isTyping: {},
      onlineUsers: new Set(),
      
      // Services and professionals
      services: mockServices,
      professionals: mockUsers.filter(user => user.type === 'professional'),
      categories: [],
      searchResults: [],
      searchQuery: '',
      searchFilters: {},
      
      // Appointments
      appointments: [],
      upcomingAppointments: [],
      appointmentHistory: [],
      
      // Notifications
      notifications: [],
      unreadNotifications: 0,
      notificationPreferences: {
        appointments: true,
        messages: true,
        promotions: false,
        system: true
      },
      
      // Social features
      posts: [],
      following: new Set(),
      followers: new Set(),
      
      // App settings
      settings: {
        notifications: true,
        location: true,
        darkMode: false,
        language: 'pt-BR',
        currency: 'BRL'
      },

      // Actions
      setLoading: (loading) => set({ isLoading: loading }),
      
      setError: (error) => set({ error }),
      
      clearError: () => set({ error: null }),

      // Authentication actions
      login: async (credentials) => {
        set({ isLoading: true, error: null })
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          // Mock authentication
          const user = mockUsers.find(u => u.email === credentials.email)
          if (!user) {
            throw new Error('Usuário não encontrado')
          }
          
          const token = 'mock-jwt-token-' + Date.now()
          
          set({
            user,
            isAuthenticated: true,
            authToken: token,
            isLoading: false
          })
          
          // Initialize services
          await get().initializeServices()
          
          return { user, token }
        } catch (error) {
          set({ error: error.message, isLoading: false })
          throw error
        }
      },

      logout: async () => {
        set({ isLoading: true })
        
        try {
          // Cleanup services
          chatService.disconnect()
          userGeolocationService.stopWatching()
          
          set({
            user: null,
            isAuthenticated: false,
            authToken: null,
            conversations: [],
            activeConversation: null,
            unreadMessages: 0,
            userLocation: null,
            isLocationWatching: false,
            isLoading: false
          })
        } catch (error) {
          set({ error: error.message, isLoading: false })
        }
      },

      // Initialize services after login
      initializeServices: async () => {
        const { user, authToken } = get()
        if (!user || !authToken) return

        try {
          // Initialize chat service
          await chatService.connect(user, authToken)
          
          // Request location permission
          if (userGeolocationService.isSupported()) {
            try {
              const position = await userGeolocationService.getCurrentPosition()
              set({ userLocation: position, locationPermission: 'granted' })
              
              // Start watching location
              userGeolocationService.startWatching()
              set({ isLocationWatching: true })
              
              // Find nearby professionals
              get().updateNearbyProfessionals()
            } catch (error) {
              console.warn('Location access denied:', error)
              set({ locationPermission: 'denied' })
            }
          }
          
          // Load user data
          get().loadUserAppointments()
          get().loadNotifications()
          
        } catch (error) {
          console.error('Error initializing services:', error)
          set({ error: 'Erro ao inicializar serviços' })
        }
      },

      // Location actions
      updateLocation: (location) => {
        set({ userLocation: location })
        get().updateNearbyProfessionals()
      },

      updateNearbyProfessionals: () => {
        const { userLocation, professionals } = get()
        if (!userLocation) return

        const nearby = userGeolocationService.findNearestProfessionals(
          professionals,
          10 // 10km radius
        )
        
        set({ nearbyProfessionals: nearby })
      },

      // Search actions
      searchServices: (query, filters = {}) => {
        const { services } = get()
        
        let results = services
        
        // Text search
        if (query) {
          results = results.filter(service =>
            service.title.toLowerCase().includes(query.toLowerCase()) ||
            service.description.toLowerCase().includes(query.toLowerCase()) ||
            service.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
          )
        }
        
        // Apply filters
        if (filters.category && filters.category !== 'all') {
          results = results.filter(service => 
            service.category.toLowerCase() === filters.category.toLowerCase()
          )
        }
        
        if (filters.priceRange) {
          results = results.filter(service =>
            service.price >= filters.priceRange[0] && 
            service.price <= filters.priceRange[1]
          )
        }
        
        if (filters.rating) {
          results = results.filter(service => service.rating >= filters.rating)
        }
        
        if (filters.homeService !== undefined) {
          results = results.filter(service => service.homeService === filters.homeService)
        }
        
        set({ 
          searchResults: results, 
          searchQuery: query, 
          searchFilters: filters 
        })
        
        return results
      },

      // Appointment actions
      loadUserAppointments: () => {
        const { user } = get()
        if (!user) return

        const userAppointments = mockAppointments.filter(
          apt => apt.patientId === user.id || apt.professionalId === user.id
        )
        
        const upcoming = userAppointments.filter(
          apt => new Date(apt.date) >= new Date() && apt.status !== 'cancelled'
        )
        
        const history = userAppointments.filter(
          apt => new Date(apt.date) < new Date() || apt.status === 'cancelled'
        )
        
        set({
          appointments: userAppointments,
          upcomingAppointments: upcoming,
          appointmentHistory: history
        })
      },

      createAppointment: async (appointmentData) => {
        set({ isLoading: true, error: null })
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          const newAppointment = {
            id: Date.now(),
            ...appointmentData,
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
          
          set(state => ({
            appointments: [...state.appointments, newAppointment],
            upcomingAppointments: [...state.upcomingAppointments, newAppointment],
            isLoading: false
          }))
          
          // Create notification
          get().addNotification({
            title: 'Agendamento Criado',
            message: 'Seu agendamento foi criado com sucesso',
            type: 'appointment'
          })
          
          return newAppointment
        } catch (error) {
          set({ error: error.message, isLoading: false })
          throw error
        }
      },

      updateAppointmentStatus: async (appointmentId, status) => {
        set({ isLoading: true, error: null })
        
        try {
          await new Promise(resolve => setTimeout(resolve, 500))
          
          set(state => ({
            appointments: state.appointments.map(apt =>
              apt.id === appointmentId 
                ? { ...apt, status, updatedAt: new Date().toISOString() }
                : apt
            ),
            upcomingAppointments: state.upcomingAppointments.map(apt =>
              apt.id === appointmentId 
                ? { ...apt, status, updatedAt: new Date().toISOString() }
                : apt
            ),
            isLoading: false
          }))
          
        } catch (error) {
          set({ error: error.message, isLoading: false })
          throw error
        }
      },

      // Chat actions
      loadConversations: () => {
        const { user, appointments } = get()
        if (!user) return

        const conversations = appointments.map(apt => {
          const messages = mockMessages.filter(msg => msg.appointmentId === apt.id)
          const lastMessage = messages[messages.length - 1]
          const unreadCount = messages.filter(msg => 
            msg.receiverId === user.id && msg.status !== 'read'
          ).length

          return {
            id: apt.id,
            appointment: apt,
            messages,
            lastMessage,
            unreadCount,
            participants: [apt.patientId, apt.professionalId]
          }
        })

        const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0)

        set({ 
          conversations,
          unreadMessages: totalUnread
        })
      },

      sendMessage: async (appointmentId, content, type = 'text') => {
        const { user } = get()
        if (!user) return

        try {
          const success = chatService.sendMessage(appointmentId, content, type)
          if (success) {
            // Message will be handled by chat service events
            return true
          }
          throw new Error('Failed to send message')
        } catch (error) {
          set({ error: error.message })
          throw error
        }
      },

      // Notification actions
      loadNotifications: () => {
        const { user } = get()
        if (!user) return

        const userNotifications = mockNotifications.filter(
          notif => notif.userId === user.id
        )
        
        const unreadCount = userNotifications.filter(notif => !notif.read).length
        
        set({
          notifications: userNotifications,
          unreadNotifications: unreadCount
        })
      },

      addNotification: (notification) => {
        const newNotification = {
          id: Date.now(),
          userId: get().user?.id,
          read: false,
          timestamp: new Date().toISOString(),
          ...notification
        }
        
        set(state => ({
          notifications: [newNotification, ...state.notifications],
          unreadNotifications: state.unreadNotifications + 1
        }))
      },

      markNotificationAsRead: (notificationId) => {
        set(state => ({
          notifications: state.notifications.map(notif =>
            notif.id === notificationId ? { ...notif, read: true } : notif
          ),
          unreadNotifications: Math.max(0, state.unreadNotifications - 1)
        }))
      },

      markAllNotificationsAsRead: () => {
        set(state => ({
          notifications: state.notifications.map(notif => ({ ...notif, read: true })),
          unreadNotifications: 0
        }))
      },

      // Social actions
      followProfessional: (professionalId) => {
        set(state => ({
          following: new Set([...state.following, professionalId])
        }))
      },

      unfollowProfessional: (professionalId) => {
        set(state => {
          const newFollowing = new Set(state.following)
          newFollowing.delete(professionalId)
          return { following: newFollowing }
        })
      },

      // Settings actions
      updateSettings: (newSettings) => {
        set(state => ({
          settings: { ...state.settings, ...newSettings }
        }))
      },

      updateNotificationPreferences: (preferences) => {
        set(state => ({
          notificationPreferences: { ...state.notificationPreferences, ...preferences }
        }))
      },

      // Theme actions
      setTheme: (theme) => {
        set({ theme })
        document.documentElement.setAttribute('data-theme', theme)
      },

      toggleTheme: () => {
        const { theme } = get()
        const newTheme = theme === 'light' ? 'dark' : 'light'
        get().setTheme(newTheme)
      },

      // Utility actions
      reset: () => {
        set({
          isLoading: false,
          error: null,
          user: null,
          isAuthenticated: false,
          authToken: null,
          userLocation: null,
          locationPermission: 'unknown',
          isLocationWatching: false,
          conversations: [],
          activeConversation: null,
          unreadMessages: 0,
          appointments: [],
          upcomingAppointments: [],
          appointmentHistory: [],
          notifications: [],
          unreadNotifications: 0,
          searchResults: [],
          searchQuery: '',
          searchFilters: {},
          nearbyProfessionals: []
        })
      }
    }),
    {
      name: 'fway-app-store',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        authToken: state.authToken,
        theme: state.theme,
        language: state.language,
        settings: state.settings,
        notificationPreferences: state.notificationPreferences,
        following: Array.from(state.following)
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Convert following array back to Set
          state.following = new Set(state.following || [])
          
          // Apply theme
          if (state.theme) {
            document.documentElement.setAttribute('data-theme', state.theme)
          }
          
          // Re-initialize services if user is authenticated
          if (state.isAuthenticated && state.user) {
            state.initializeServices()
          }
        }
      }
    }
  )
)

// Specialized stores for specific features

// Chat store
export const useChatStore = create((set, get) => ({
  activeChat: null,
  typingUsers: new Set(),
  connectionStatus: 'disconnected',
  
  setActiveChat: (chatId) => set({ activeChat: chatId }),
  
  addTypingUser: (userId) => set(state => ({
    typingUsers: new Set([...state.typingUsers, userId])
  })),
  
  removeTypingUser: (userId) => set(state => {
    const newTypingUsers = new Set(state.typingUsers)
    newTypingUsers.delete(userId)
    return { typingUsers: newTypingUsers }
  }),
  
  setConnectionStatus: (status) => set({ connectionStatus: status })
}))

// Location store
export const useLocationStore = create((set, get) => ({
  currentLocation: null,
  locationHistory: [],
  isTracking: false,
  accuracy: 'unknown',
  
  updateLocation: (location) => {
    set(state => ({
      currentLocation: location,
      locationHistory: [location, ...state.locationHistory.slice(0, 9)] // Keep last 10
    }))
  },
  
  startTracking: () => set({ isTracking: true }),
  stopTracking: () => set({ isTracking: false }),
  setAccuracy: (accuracy) => set({ accuracy })
}))

// Search store
export const useSearchStore = create((set, get) => ({
  recentSearches: [],
  popularSearches: [
    'cardiologista',
    'pediatra',
    'fisioterapeuta',
    'consulta domiciliar',
    'exames'
  ],
  searchHistory: [],
  
  addRecentSearch: (query) => {
    if (!query.trim()) return
    
    set(state => ({
      recentSearches: [
        query,
        ...state.recentSearches.filter(s => s !== query)
      ].slice(0, 10)
    }))
  },
  
  clearRecentSearches: () => set({ recentSearches: [] }),
  
  addToHistory: (search) => {
    set(state => ({
      searchHistory: [
        { ...search, timestamp: Date.now() },
        ...state.searchHistory
      ].slice(0, 50)
    }))
  }
}))

export default useAppStore

