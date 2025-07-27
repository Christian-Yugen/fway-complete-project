import React, { createContext, useContext, useState, useEffect } from 'react'

const NotificationContext = createContext()

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(3) // Mock inicial

  // Mock notifications
  const mockNotifications = [
    {
      id: 1,
      type: 'message',
      title: 'Nova mensagem',
      message: 'Dr. João Silva enviou uma mensagem',
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 min atrás
      read: false,
      avatar: '/images/professionals/doctor1.jpg',
      professionalId: 1
    },
    {
      id: 2,
      type: 'appointment',
      title: 'Consulta confirmada',
      message: 'Sua consulta com Dra. Maria Santos foi confirmada para amanhã às 14:30',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2h atrás
      read: false,
      avatar: '/images/professionals/doctor2.jpg',
      professionalId: 2
    },
    {
      id: 3,
      type: 'reminder',
      title: 'Lembrete de medicamento',
      message: 'Hora de tomar seu medicamento prescrito pelo Dr. Carlos Oliveira',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4h atrás
      read: false,
      avatar: '/images/professionals/doctor3.jpg',
      professionalId: 3
    },
    {
      id: 4,
      type: 'message',
      title: 'Arquivo recebido',
      message: 'Enfª Ana Carolina enviou um arquivo',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 dia atrás
      read: true,
      avatar: '/images/professionals/nurse1.jpg',
      professionalId: 5
    }
  ]

  useEffect(() => {
    setNotifications(mockNotifications)
  }, [])

  const addNotification = (notification) => {
    const newNotification = {
      ...notification,
      id: Date.now(),
      timestamp: new Date(),
      read: false
    }
    setNotifications(prev => [newNotification, ...prev])
    setUnreadCount(prev => prev + 1)
  }

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true }
          : notif
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    )
    setUnreadCount(0)
  }

  const removeNotification = (notificationId) => {
    const notification = notifications.find(n => n.id === notificationId)
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId))
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'message': return '💬'
      case 'appointment': return '📅'
      case 'reminder': return '⏰'
      case 'file': return '📎'
      default: return '🔔'
    }
  }

  const formatTimeAgo = (timestamp) => {
    const now = new Date()
    const diff = now - timestamp
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return 'Agora'
    if (minutes < 60) return `${minutes} min atrás`
    if (hours < 24) return `${hours}h atrás`
    if (days === 1) return 'Ontem'
    return `${days} dias atrás`
  }

  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    getNotificationIcon,
    formatTimeAgo
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

