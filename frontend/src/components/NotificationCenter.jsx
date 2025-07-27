import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Bell, 
  MessageCircle, 
  Calendar, 
  Clock, 
  Users,
  Check
} from 'lucide-react'

const NotificationCenter = () => {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'message',
      icon: <MessageCircle size={16} className="text-blue-500" />,
      title: 'Nova mensagem',
      message: 'Dr. João enviou uma mensagem',
      time: '5 min atrás',
      unread: true,
      action: () => navigate('/chat')
    },
    {
      id: 2,
      type: 'appointment',
      icon: <Calendar size={16} className="text-green-500" />,
      title: 'Consulta confirmada',
      message: 'Sua consulta com Dra. Maria Santos foi confirmada para amanhã às 14:00',
      time: '2h atrás',
      unread: true,
      action: () => navigate('/my-bookings')
    },
    {
      id: 3,
      type: 'reminder',
      icon: <Clock size={16} className="text-orange-500" />,
      title: 'Lembrete de medicação',
      message: 'Hora de tomar seu medicamento prescrito',
      time: '4h atrás',
      unread: false,
      action: () => {}
    },
    {
      id: 4,
      type: 'connection',
      icon: <Users size={16} className="text-purple-500" />,
      title: 'Nova conexão',
      message: 'Dr. Rafael Mendes aceitou sua solicitação de conexão',
      time: '1d atrás',
      unread: false,
      action: () => navigate('/network')
    }
  ])

  const unreadCount = notifications.filter(n => n.unread).length

  const handleNotificationClick = (notification) => {
    // Marcar como lida
    setNotifications(prev => 
      prev.map(n => 
        n.id === notification.id ? { ...n, unread: false } : n
      )
    )
    
    // Executar ação
    if (notification.action) {
      notification.action()
    }
    
    setIsOpen(false)
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, unread: false }))
    )
  }

  return (
    <div className="header-nav-item" style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="header-nav-item"
        style={{ border: 'none', background: 'none', cursor: 'pointer' }}
      >
        <span className="header-nav-icon">
          <Bell size={18} />
        </span>
        <span className="header-nav-text">Notificações</span>
        {unreadCount > 0 && (
          <span className="header-nav-badge">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Overlay para fechar ao clicar fora */}
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999
            }}
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown de notificações */}
          <div className="notifications-dropdown">
            <div className="notifications-header">
              <div className="flex justify-between items-center">
                <h3 className="notifications-title flex items-center gap-2">
                  <Bell size={18} />
                  Notificações
                </h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="btn-professional btn-outline btn-sm flex items-center gap-1"
                  >
                    <Check size={14} />
                    Marcar todas como lidas
                  </button>
                )}
              </div>
              <p className="card-subtitle">{unreadCount} não lidas</p>
            </div>
            
            <div className="notifications-list">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${notification.unread ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-content">
                    <div className="notification-icon">
                      {notification.icon}
                    </div>
                    <div className="notification-text">
                      <h4 className="notification-title">{notification.title}</h4>
                      <p className="notification-message">{notification.message}</p>
                      <span className="notification-time">{notification.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default NotificationCenter

