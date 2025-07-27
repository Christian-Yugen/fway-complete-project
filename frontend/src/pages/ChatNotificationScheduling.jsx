import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  MessageCircle,
  Bell,
  Calendar,
  Clock,
  Send,
  Phone,
  Video,
  Paperclip,
  Smile,
  Search,
  Filter,
  Settings,
  User,
  CheckCircle,
  AlertCircle,
  Volume2,
  VolumeX,
  Star,
  MoreVertical,
  Plus,
  Archive,
  Trash2,
  Edit,
  Eye,
  Users
} from 'lucide-react';
import { chatSystem, notificationSystem, schedulingSystem } from '../utils/uberFeatures';

const ChatNotificationScheduling = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('chat');
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [chats, setChats] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationFilter, setNotificationFilter] = useState('all');
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);

  // Carregar dados
  useEffect(() => {
    loadChatData();
    loadNotifications();
    loadAppointments();
  }, []);

  const loadChatData = () => {
    const mockChats = [
      {
        id: '1',
        name: 'Dr. João Silva',
        specialty: 'Cardiologia',
        avatar: '/api/placeholder/40/40',
        lastMessage: 'Obrigado pela consulta! Qualquer dúvida, estou à disposição.',
        timestamp: '2024-01-15T14:30:00',
        unread: 0,
        online: true,
        type: 'professional'
      },
      {
        id: '2',
        name: 'Maria Santos',
        specialty: 'Paciente',
        avatar: '/api/placeholder/40/40',
        lastMessage: 'Gostaria de agendar uma nova consulta para próxima semana.',
        timestamp: '2024-01-15T12:15:00',
        unread: 2,
        online: false,
        type: 'client'
      },
      {
        id: '3',
        name: 'Enf. Ana Costa',
        specialty: 'Enfermagem',
        avatar: '/api/placeholder/40/40',
        lastMessage: 'O atendimento domiciliar foi reagendado para amanhã às 14h.',
        timestamp: '2024-01-15T10:45:00',
        unread: 1,
        online: true,
        type: 'professional'
      }
    ];

    setChats(mockChats);
    if (!selectedChat && mockChats.length > 0) {
      setSelectedChat(mockChats[0]);
    }
  };

  const loadNotifications = () => {
    const mockNotifications = [
      {
        id: '1',
        type: 'appointment',
        title: 'Consulta Agendada',
        message: 'Nova consulta agendada com Dr. João Silva para amanhã às 14h.',
        timestamp: '2024-01-15T13:00:00',
        read: false,
        priority: 'high',
        action: 'view_appointment'
      },
      {
        id: '2',
        type: 'payment',
        title: 'Pagamento Recebido',
        message: 'Você recebeu R$ 250,00 pela consulta com Maria Santos.',
        timestamp: '2024-01-15T11:30:00',
        read: false,
        priority: 'medium',
        action: 'view_payment'
      },
      {
        id: '3',
        type: 'rating',
        title: 'Nova Avaliação',
        message: 'João Oliveira avaliou seu atendimento com 5 estrelas.',
        timestamp: '2024-01-15T09:15:00',
        read: true,
        priority: 'low',
        action: 'view_rating'
      },
      {
        id: '4',
        type: 'message',
        title: 'Nova Mensagem',
        message: 'Ana Costa enviou uma nova mensagem.',
        timestamp: '2024-01-14T16:20:00',
        read: true,
        priority: 'medium',
        action: 'open_chat'
      }
    ];

    setNotifications(mockNotifications);
  };

  const loadAppointments = () => {
    const mockAppointments = [
      {
        id: '1',
        title: 'Consulta Cardiológica',
        client: 'Maria Santos',
        date: '2024-01-16',
        time: '14:00',
        type: 'consultation',
        status: 'confirmed',
        location: 'Clínica',
        notes: 'Consulta de retorno - verificar exames'
      },
      {
        id: '2',
        title: 'Fisioterapia Domiciliar',
        client: 'João Oliveira',
        date: '2024-01-16',
        time: '16:30',
        type: 'homecare',
        status: 'pending',
        location: 'Residência do paciente',
        notes: 'Primeira sessão - avaliação inicial'
      },
      {
        id: '3',
        title: 'Enfermagem Home Care',
        client: 'Ana Silva',
        date: '2024-01-17',
        time: '09:00',
        type: 'nursing',
        status: 'confirmed',
        location: 'Residência do paciente',
        notes: 'Cuidados pós-operatórios'
      }
    ];

    setAppointments(mockAppointments);
  };

  const filteredChats = chats.filter(chat => 
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredNotifications = notifications.filter(notification => {
    if (notificationFilter !== 'all' && notification.type !== notificationFilter) return false;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="w-5 h-5 text-blue-600" />;
      case 'payment':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rating':
        return <Star className="w-5 h-5 text-yellow-600" />;
      case 'message':
        return <MessageCircle className="w-5 h-5 text-purple-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getAppointmentIcon = (type) => {
    switch (type) {
      case 'consultation':
        return <User className="w-5 h-5 text-blue-600" />;
      case 'homecare':
        return <Users className="w-5 h-5 text-green-600" />;
      case 'nursing':
        return <CheckCircle className="w-5 h-5 text-purple-600" />;
      default:
        return <Calendar className="w-5 h-5 text-gray-600" />;
    }
  };

  const sendMessage = () => {
    if (message.trim() && selectedChat) {
      // Simular envio de mensagem
      console.log('Enviando mensagem:', message);
      setMessage('');
    }
  };

  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  return (
    <div className="content-container">
      {/* Sidebar Esquerda - Lista de Chats/Notificações */}
      <aside className="sidebar-left">
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title">
              {activeTab === 'chat' ? (
                <>
                  <MessageCircle className="w-5 h-5" />
                  Conversas
                </>
              ) : activeTab === 'notifications' ? (
                <>
                  <Bell className="w-5 h-5" />
                  Notificações {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                </>
              ) : (
                <>
                  <Calendar className="w-5 h-5" />
                  Agendamentos
                </>
              )}
            </h3>
          </div>
          <div className="card-body">
            {/* Busca */}
            <div className="search-container">
              <Search className="search-icon w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  activeTab === 'chat' ? 'Buscar conversas...' :
                  activeTab === 'notifications' ? 'Buscar notificações...' :
                  'Buscar agendamentos...'
                }
                className="search-input"
              />
            </div>

            {/* Lista baseada na tab ativa */}
            {activeTab === 'chat' && (
              <div className="chat-list">
                {filteredChats.map((chat) => (
                  <ChatItem 
                    key={chat.id} 
                    chat={chat} 
                    isSelected={selectedChat?.id === chat.id}
                    onSelect={setSelectedChat}
                  />
                ))}
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="notification-filters">
                <div className="filter-buttons">
                  {[
                    { id: 'all', label: 'Todas' },
                    { id: 'appointment', label: 'Agendamentos' },
                    { id: 'payment', label: 'Pagamentos' },
                    { id: 'message', label: 'Mensagens' }
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setNotificationFilter(filter.id)}
                      className={`filter-button ${notificationFilter === filter.id ? 'active' : ''}`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="main-content">
        <div className="page-header">
          <h1 className="page-title">Comunicação e Agendamentos</h1>
          <p className="page-subtitle">Gerencie conversas, notificações e agendamentos</p>
        </div>

        {/* Tabs */}
        <div className="tabs-container">
          <div className="tabs-header">
            <button
              onClick={() => setActiveTab('chat')}
              className={`tab-button ${activeTab === 'chat' ? 'active' : ''}`}
            >
              <MessageCircle className="w-4 h-4" />
              Chat
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`tab-button ${activeTab === 'notifications' ? 'active' : ''}`}
            >
              <Bell className="w-4 h-4" />
              Notificações
              {unreadCount > 0 && <span className="tab-badge">{unreadCount}</span>}
            </button>
            <button
              onClick={() => setActiveTab('scheduling')}
              className={`tab-button ${activeTab === 'scheduling' ? 'active' : ''}`}
            >
              <Calendar className="w-4 h-4" />
              Agendamentos
            </button>
          </div>

          <div className="tabs-content">
            {activeTab === 'chat' && (
              <ChatTab 
                selectedChat={selectedChat}
                message={message}
                setMessage={setMessage}
                sendMessage={sendMessage}
              />
            )}

            {activeTab === 'notifications' && (
              <NotificationsTab 
                notifications={filteredNotifications}
                getNotificationIcon={getNotificationIcon}
                markAsRead={markNotificationAsRead}
              />
            )}

            {activeTab === 'scheduling' && (
              <SchedulingTab 
                appointments={appointments}
                getAppointmentIcon={getAppointmentIcon}
              />
            )}
          </div>
        </div>
      </main>

      {/* Sidebar Direita - Informações Contextuais */}
      <aside className="sidebar-right">
        {activeTab === 'chat' && selectedChat && (
          <div className="card-professional">
            <div className="card-header">
              <h3 className="card-title">Informações do Contato</h3>
            </div>
            <div className="card-body">
              <div className="contact-info">
                <div className="contact-avatar">
                  <User className="w-8 h-8" />
                </div>
                <h4>{selectedChat.name}</h4>
                <p>{selectedChat.specialty}</p>
                <div className={`contact-status ${selectedChat.online ? 'online' : 'offline'}`}>
                  {selectedChat.online ? 'Online' : 'Offline'}
                </div>
              </div>

              <div className="contact-actions">
                <button className="contact-action-btn">
                  <Phone className="w-4 h-4" />
                  Ligar
                </button>
                <button className="contact-action-btn">
                  <Video className="w-4 h-4" />
                  Videochamada
                </button>
                <button className="contact-action-btn">
                  <Calendar className="w-4 h-4" />
                  Agendar
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title">
              <Settings className="w-5 h-5" />
              Configurações
            </h3>
          </div>
          <div className="card-body">
            <div className="settings-list">
              <div className="setting-item">
                <div className="setting-info">
                  <h4>Notificações Push</h4>
                  <p>Receber notificações no dispositivo</p>
                </div>
                <button className="setting-toggle active">
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <h4>Som das Mensagens</h4>
                  <p>Reproduzir som ao receber mensagens</p>
                </div>
                <button className="setting-toggle">
                  <VolumeX className="w-4 h-4" />
                </button>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <h4>Lembrete de Agendamentos</h4>
                  <p>Notificar 30 min antes</p>
                </div>
                <button className="setting-toggle active">
                  <Bell className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

// Componente Item de Chat
const ChatItem = ({ chat, isSelected, onSelect }) => {
  return (
    <div 
      className={`chat-item ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(chat)}
    >
      <div className="chat-avatar">
        <User className="w-6 h-6" />
        {chat.online && <div className="online-indicator"></div>}
      </div>
      <div className="chat-info">
        <div className="chat-header">
          <h4>{chat.name}</h4>
          <span className="chat-time">
            {new Date(chat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <p className="chat-last-message">{chat.lastMessage}</p>
        <div className="chat-meta">
          <span className="chat-specialty">{chat.specialty}</span>
          {chat.unread > 0 && <span className="unread-badge">{chat.unread}</span>}
        </div>
      </div>
    </div>
  );
};

// Componente Tab Chat
const ChatTab = ({ selectedChat, message, setMessage, sendMessage }) => {
  if (!selectedChat) {
    return (
      <div className="empty-state">
        <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3>Selecione uma conversa</h3>
        <p>Escolha uma conversa na lista para começar</p>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-contact">
          <div className="chat-avatar">
            <User className="w-8 h-8" />
          </div>
          <div className="chat-contact-info">
            <h3>{selectedChat.name}</h3>
            <p>{selectedChat.online ? 'Online' : 'Offline'}</p>
          </div>
        </div>
        <div className="chat-actions">
          <button className="chat-action-btn">
            <Phone className="w-5 h-5" />
          </button>
          <button className="chat-action-btn">
            <Video className="w-5 h-5" />
          </button>
          <button className="chat-action-btn">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="chat-messages">
        <div className="message received">
          <div className="message-content">
            <p>Olá! Como posso ajudá-lo hoje?</p>
            <span className="message-time">14:30</span>
          </div>
        </div>
        <div className="message sent">
          <div className="message-content">
            <p>Gostaria de agendar uma consulta para próxima semana.</p>
            <span className="message-time">14:32</span>
          </div>
        </div>
        <div className="message received">
          <div className="message-content">
            <p>{selectedChat.lastMessage}</p>
            <span className="message-time">14:35</span>
          </div>
        </div>
      </div>

      <div className="chat-input">
        <button className="chat-input-btn">
          <Paperclip className="w-5 h-5" />
        </button>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Digite sua mensagem..."
          className="message-input"
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button className="chat-input-btn">
          <Smile className="w-5 h-5" />
        </button>
        <button 
          className="send-btn"
          onClick={sendMessage}
          disabled={!message.trim()}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

// Componente Tab Notificações
const NotificationsTab = ({ notifications, getNotificationIcon, markAsRead }) => {
  return (
    <div className="notifications-content">
      {notifications.length === 0 ? (
        <div className="empty-state">
          <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3>Nenhuma notificação</h3>
          <p>Suas notificações aparecerão aqui</p>
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.map((notification) => (
            <NotificationCard 
              key={notification.id}
              notification={notification}
              getIcon={getNotificationIcon}
              markAsRead={markAsRead}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Componente Tab Agendamentos
const SchedulingTab = ({ appointments, getAppointmentIcon }) => {
  return (
    <div className="scheduling-content">
      <div className="scheduling-header">
        <h3>Próximos Agendamentos</h3>
        <button className="btn-primary">
          <Plus className="w-4 h-4" />
          Novo Agendamento
        </button>
      </div>

      {appointments.length === 0 ? (
        <div className="empty-state">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3>Nenhum agendamento</h3>
          <p>Seus agendamentos aparecerão aqui</p>
        </div>
      ) : (
        <div className="appointments-list">
          {appointments.map((appointment) => (
            <AppointmentCard 
              key={appointment.id}
              appointment={appointment}
              getIcon={getAppointmentIcon}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Componente Card de Notificação
const NotificationCard = ({ notification, getIcon, markAsRead }) => {
  return (
    <div 
      className={`notification-card ${!notification.read ? 'unread' : ''}`}
      onClick={() => !notification.read && markAsRead(notification.id)}
    >
      <div className="notification-icon">
        {getIcon(notification.type)}
      </div>
      <div className="notification-content">
        <div className="notification-header">
          <h4>{notification.title}</h4>
          <span className="notification-time">
            {new Date(notification.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <p>{notification.message}</p>
        <div className={`notification-priority ${notification.priority}`}>
          {notification.priority === 'high' ? 'Alta' : 
           notification.priority === 'medium' ? 'Média' : 'Baixa'}
        </div>
      </div>
      {!notification.read && <div className="unread-dot"></div>}
    </div>
  );
};

// Componente Card de Agendamento
const AppointmentCard = ({ appointment, getIcon }) => {
  return (
    <div className="appointment-card">
      <div className="appointment-icon">
        {getIcon(appointment.type)}
      </div>
      <div className="appointment-content">
        <div className="appointment-header">
          <h4>{appointment.title}</h4>
          <span className={`appointment-status ${appointment.status}`}>
            {appointment.status === 'confirmed' ? 'Confirmado' : 
             appointment.status === 'pending' ? 'Pendente' : 'Cancelado'}
          </span>
        </div>
        <p className="appointment-client">{appointment.client}</p>
        <div className="appointment-details">
          <div className="appointment-datetime">
            <Calendar className="w-4 h-4" />
            <span>{new Date(appointment.date).toLocaleDateString()}</span>
            <Clock className="w-4 h-4" />
            <span>{appointment.time}</span>
          </div>
          <p className="appointment-location">{appointment.location}</p>
        </div>
        {appointment.notes && (
          <p className="appointment-notes">{appointment.notes}</p>
        )}
      </div>
      <div className="appointment-actions">
        <button className="btn-secondary btn-small">
          <Edit className="w-4 h-4" />
          Editar
        </button>
        <button className="btn-primary btn-small">
          <Eye className="w-4 h-4" />
          Ver
        </button>
      </div>
    </div>
  );
};

export default ChatNotificationScheduling;

