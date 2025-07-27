// Chat service for real-time messaging with Socket.IO integration
import { io } from 'socket.io-client'

class ChatService {
  constructor() {
    this.socket = null
    this.isConnected = false
    this.currentUser = null
    this.messageHandlers = new Map()
    this.typingHandlers = new Map()
    this.statusHandlers = new Map()
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
  }

  // Initialize connection
  connect(user, token) {
    if (this.socket) {
      this.disconnect()
    }

    this.currentUser = user
    
    // Connect to Socket.IO server
    this.socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
      auth: {
        token: token,
        userId: user.id
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    })

    this.setupEventListeners()
    
    return new Promise((resolve, reject) => {
      this.socket.on('connect', () => {
        console.log('Connected to chat server')
        this.isConnected = true
        this.reconnectAttempts = 0
        resolve()
      })

      this.socket.on('connect_error', (error) => {
        console.error('Connection error:', error)
        this.isConnected = false
        reject(error)
      })
    })
  }

  // Disconnect from server
  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
    this.isConnected = false
    this.currentUser = null
    this.messageHandlers.clear()
    this.typingHandlers.clear()
    this.statusHandlers.clear()
  }

  // Setup event listeners
  setupEventListeners() {
    if (!this.socket) return

    // Connection events
    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from chat server:', reason)
      this.isConnected = false
      
      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect
        this.handleReconnection()
      }
    })

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('Reconnected to chat server after', attemptNumber, 'attempts')
      this.isConnected = true
      this.reconnectAttempts = 0
    })

    this.socket.on('reconnect_error', (error) => {
      console.error('Reconnection error:', error)
      this.reconnectAttempts++
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached')
        this.disconnect()
      }
    })

    // Message events
    this.socket.on('new_message', (data) => {
      this.handleNewMessage(data)
    })

    this.socket.on('message_status', (data) => {
      this.handleMessageStatus(data)
    })

    // Typing events
    this.socket.on('user_typing', (data) => {
      this.handleUserTyping(data)
    })

    this.socket.on('user_stopped_typing', (data) => {
      this.handleUserStoppedTyping(data)
    })

    // User status events
    this.socket.on('user_online', (data) => {
      this.handleUserStatusChange(data.userId, 'online')
    })

    this.socket.on('user_offline', (data) => {
      this.handleUserStatusChange(data.userId, 'offline')
    })

    // Room events
    this.socket.on('joined_room', (data) => {
      console.log('Joined chat room:', data.roomId)
    })

    this.socket.on('left_room', (data) => {
      console.log('Left chat room:', data.roomId)
    })

    // Error events
    this.socket.on('error', (error) => {
      console.error('Chat error:', error)
    })
  }

  // Handle reconnection
  handleReconnection() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        if (this.currentUser) {
          this.connect(this.currentUser, localStorage.getItem('authToken'))
        }
      }, Math.pow(2, this.reconnectAttempts) * 1000) // Exponential backoff
    }
  }

  // Join a chat room (appointment-based)
  joinRoom(appointmentId) {
    if (!this.socket || !this.isConnected) {
      console.error('Socket not connected')
      return false
    }

    this.socket.emit('join_room', {
      appointmentId: appointmentId,
      userId: this.currentUser.id
    })

    return true
  }

  // Leave a chat room
  leaveRoom(appointmentId) {
    if (!this.socket || !this.isConnected) {
      console.error('Socket not connected')
      return false
    }

    this.socket.emit('leave_room', {
      appointmentId: appointmentId,
      userId: this.currentUser.id
    })

    return true
  }

  // Send a message
  sendMessage(appointmentId, content, type = 'text', metadata = {}) {
    if (!this.socket || !this.isConnected) {
      console.error('Socket not connected')
      return false
    }

    const message = {
      appointmentId,
      senderId: this.currentUser.id,
      content,
      type,
      metadata,
      timestamp: new Date().toISOString()
    }

    this.socket.emit('send_message', message)
    return true
  }

  // Send typing indicator
  startTyping(appointmentId) {
    if (!this.socket || !this.isConnected) return false

    this.socket.emit('start_typing', {
      appointmentId,
      userId: this.currentUser.id
    })

    return true
  }

  // Stop typing indicator
  stopTyping(appointmentId) {
    if (!this.socket || !this.isConnected) return false

    this.socket.emit('stop_typing', {
      appointmentId,
      userId: this.currentUser.id
    })

    return true
  }

  // Mark message as read
  markAsRead(messageId, appointmentId) {
    if (!this.socket || !this.isConnected) return false

    this.socket.emit('mark_as_read', {
      messageId,
      appointmentId,
      userId: this.currentUser.id
    })

    return true
  }

  // Get chat history
  async getChatHistory(appointmentId, page = 1, limit = 50) {
    if (!this.socket || !this.isConnected) {
      throw new Error('Socket not connected')
    }

    return new Promise((resolve, reject) => {
      this.socket.emit('get_chat_history', {
        appointmentId,
        page,
        limit
      })

      this.socket.once('chat_history', (data) => {
        if (data.error) {
          reject(new Error(data.error))
        } else {
          resolve(data)
        }
      })

      // Timeout after 10 seconds
      setTimeout(() => {
        reject(new Error('Request timeout'))
      }, 10000)
    })
  }

  // Get online users
  async getOnlineUsers() {
    if (!this.socket || !this.isConnected) {
      throw new Error('Socket not connected')
    }

    return new Promise((resolve, reject) => {
      this.socket.emit('get_online_users')

      this.socket.once('online_users', (data) => {
        resolve(data.users || [])
      })

      setTimeout(() => {
        reject(new Error('Request timeout'))
      }, 5000)
    })
  }

  // Event handlers
  handleNewMessage(data) {
    const handlers = this.messageHandlers.get(data.appointmentId) || []
    handlers.forEach(handler => {
      try {
        handler(data)
      } catch (error) {
        console.error('Error in message handler:', error)
      }
    })
  }

  handleMessageStatus(data) {
    // Handle message delivery/read status updates
    const handlers = this.messageHandlers.get(data.appointmentId) || []
    handlers.forEach(handler => {
      try {
        handler({ type: 'status_update', ...data })
      } catch (error) {
        console.error('Error in status handler:', error)
      }
    })
  }

  handleUserTyping(data) {
    const handlers = this.typingHandlers.get(data.appointmentId) || []
    handlers.forEach(handler => {
      try {
        handler({ ...data, isTyping: true })
      } catch (error) {
        console.error('Error in typing handler:', error)
      }
    })
  }

  handleUserStoppedTyping(data) {
    const handlers = this.typingHandlers.get(data.appointmentId) || []
    handlers.forEach(handler => {
      try {
        handler({ ...data, isTyping: false })
      } catch (error) {
        console.error('Error in typing handler:', error)
      }
    })
  }

  handleUserStatusChange(userId, status) {
    const handlers = this.statusHandlers.get('global') || []
    handlers.forEach(handler => {
      try {
        handler({ userId, status })
      } catch (error) {
        console.error('Error in status handler:', error)
      }
    })
  }

  // Event subscription methods
  onMessage(appointmentId, handler) {
    if (!this.messageHandlers.has(appointmentId)) {
      this.messageHandlers.set(appointmentId, [])
    }
    this.messageHandlers.get(appointmentId).push(handler)

    // Return unsubscribe function
    return () => {
      const handlers = this.messageHandlers.get(appointmentId) || []
      const index = handlers.indexOf(handler)
      if (index > -1) {
        handlers.splice(index, 1)
      }
    }
  }

  onTyping(appointmentId, handler) {
    if (!this.typingHandlers.has(appointmentId)) {
      this.typingHandlers.set(appointmentId, [])
    }
    this.typingHandlers.get(appointmentId).push(handler)

    return () => {
      const handlers = this.typingHandlers.get(appointmentId) || []
      const index = handlers.indexOf(handler)
      if (index > -1) {
        handlers.splice(index, 1)
      }
    }
  }

  onUserStatus(handler) {
    if (!this.statusHandlers.has('global')) {
      this.statusHandlers.set('global', [])
    }
    this.statusHandlers.get('global').push(handler)

    return () => {
      const handlers = this.statusHandlers.get('global') || []
      const index = handlers.indexOf(handler)
      if (index > -1) {
        handlers.splice(index, 1)
      }
    }
  }

  // Utility methods
  isUserOnline(userId) {
    // This would typically check against a list of online users
    // For now, return a simulated status
    return Math.random() > 0.3 // 70% chance of being online
  }

  getConnectionStatus() {
    return {
      connected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts
    }
  }

  // File upload support
  async uploadFile(file, appointmentId, onProgress) {
    if (!this.socket || !this.isConnected) {
      throw new Error('Socket not connected')
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = () => {
        const fileData = {
          appointmentId,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          fileData: reader.result,
          senderId: this.currentUser.id
        }

        this.socket.emit('upload_file', fileData)

        this.socket.once('file_uploaded', (response) => {
          if (response.error) {
            reject(new Error(response.error))
          } else {
            resolve(response)
          }
        })

        // Simulate progress for demo
        if (onProgress) {
          let progress = 0
          const interval = setInterval(() => {
            progress += 10
            onProgress(progress)
            if (progress >= 100) {
              clearInterval(interval)
            }
          }, 100)
        }
      }

      reader.onerror = () => {
        reject(new Error('Failed to read file'))
      }

      reader.readAsDataURL(file)
    })
  }

  // Voice message support
  async sendVoiceMessage(audioBlob, appointmentId, duration) {
    if (!this.socket || !this.isConnected) {
      throw new Error('Socket not connected')
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = () => {
        const voiceData = {
          appointmentId,
          audioData: reader.result,
          duration,
          senderId: this.currentUser.id,
          type: 'voice'
        }

        this.socket.emit('send_voice_message', voiceData)

        this.socket.once('voice_message_sent', (response) => {
          if (response.error) {
            reject(new Error(response.error))
          } else {
            resolve(response)
          }
        })
      }

      reader.onerror = () => {
        reject(new Error('Failed to read audio file'))
      }

      reader.readAsDataURL(audioBlob)
    })
  }
}

// Create singleton instance
const chatService = new ChatService()

export default chatService

// Export for testing
export { ChatService }

