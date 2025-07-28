import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Send, Paperclip, Search, Phone, Video, MoreVertical, Smile, Lightbulb, MessageCircle, Clock, CheckCheck } from 'lucide-react'

const Chat = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [selectedChat, setSelectedChat] = useState(null)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState({})
  const [isTyping, setIsTyping] = useState(false)
  const [showAttachments, setShowAttachments] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)

  // Mock data simplificado para evitar erros
  const mockProfessionals = [
    {
      id: 1,
      name: 'Dr. João Silva',
      specialty: 'Cardiologia',
      avatar: null
    },
    {
      id: 2,
      name: 'Dra. Maria Santos',
      specialty: 'Pediatria',
      avatar: null
    }
  ]

  // Mock data para conversas existentes
  const mockChats = [
    {
      id: 1,
      professionalId: 1,
      professional: mockProfessionals[0],
      lastMessage: "Obrigado pela consulta!",
      lastMessageTime: "14:30",
      unreadCount: 0,
      isOnline: true,
      lastSeen: "Agora"
    },
    {
      id: 2,
      professionalId: 2,
      professional: mockProfessionals[1],
      lastMessage: "Os exames chegaram.",
      lastMessageTime: "10:15",
      unreadCount: 2,
      isOnline: false,
      lastSeen: "2h atrás"
    }
  ]

  const mockMessages = {
    1: [
      {
        id: 1,
        senderId: 'patient',
        senderType: 'patient',
        content: "Olá Dr. João, como está?",
        timestamp: "2024-06-16T14:00:00Z",
        type: 'text'
      },
      {
        id: 2,
        senderId: 1,
        senderType: 'professional',
        content: "Olá! Estou bem, obrigado. Como posso ajudá-lo hoje?",
        timestamp: "2024-06-16T14:30:00Z",
        type: 'text'
      }
    ]
  }

  const filteredChats = mockChats.filter(chat =>
    chat.professional.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.professional.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  )

  useEffect(() => {
    setMessages(mockMessages)
    
    // Verificar se há um usuário específico na URL
    const userId = searchParams.get('user')
    if (userId) {
      const chat = mockChats.find(c => c.professionalId === parseInt(userId))
      if (chat) {
        setSelectedChat(chat)
      }
    }
  }, [searchParams])

  useEffect(() => {
    scrollToBottom()
  }, [messages, selectedChat])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const handleSendMessage = () => {
    if (!message.trim() || !selectedChat) return

    const newMessage = {
      id: Date.now(),
      senderId: 'patient',
      senderType: 'patient',
      content: message,
      timestamp: new Date().toISOString(),
      type: 'text'
    }

    setMessages(prev => ({
      ...prev,
      [selectedChat.id]: [...(prev[selectedChat.id] || []), newMessage]
    }))

    setMessage('')
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="content-container">
      {/* Lista de Conversas */}
      <aside className="sidebar-left">
        <div className="card-professional">
          <div className="card-header">
            <h2 className="card-title flex items-center gap-2">
              <MessageCircle size={20} />
              Mensagens
            </h2>
          </div>
          <div className="card-body">
            {/* Busca */}
            <div className="search-professional mb-4">
              <span className="search-icon">
                <Search size={16} />
              </span>
              <input
                type="text"
                placeholder="Buscar conversas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            {/* Lista de Conversas */}
            <div className="flex flex-col gap-sm">
              {filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className={`chat-item ${selectedChat?.id === chat.id ? 'active' : ''}`}
                  style={{
                    padding: 'var(--spacing-sm)',
                    borderRadius: 'var(--border-radius)',
                    cursor: 'pointer',
                    border: selectedChat?.id === chat.id ? '2px solid var(--primary-blue)' : '1px solid var(--border-light)',
                    backgroundColor: selectedChat?.id === chat.id ? 'var(--background-light)' : 'white'
                  }}
                >
                  <div className="flex items-center gap-sm">
                    <div className="profile-avatar-small">
                      <div className="profile-fallback">
                        {chat.professional.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      {chat.isOnline && (
                        <div className="online-indicator"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <p className="professional-name">{chat.professional.name}</p>
                        <span className="text-muted text-xs">{chat.lastMessageTime}</span>
                      </div>
                      <p className="professional-specialty text-sm">{chat.professional.specialty}</p>
                      <p className="text-muted text-sm truncate">{chat.lastMessage}</p>
                    </div>
                    {chat.unreadCount > 0 && (
                      <span style={{
                        backgroundColor: 'var(--error-red)',
                        color: 'white',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        padding: '2px 6px',
                        borderRadius: '50%',
                        minWidth: '16px',
                        height: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Área de Chat */}
      <main className="content-main">
        {selectedChat ? (
          <div className="card-professional" style={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
            {/* Header do Chat */}
            <div className="card-header" style={{ borderBottom: '1px solid var(--border-light)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-sm">
                  <div className="profile-avatar-small">
                    <div className="profile-fallback">
                      {selectedChat.professional.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    {selectedChat.isOnline && (
                      <div className="online-indicator"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="professional-name">{selectedChat.professional.name}</h3>
                    <p className="professional-specialty">
                      {selectedChat.isOnline ? 'Online' : `Visto ${selectedChat.lastSeen}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-sm">
                  <button className="btn-professional btn-outline btn-sm">
                    <Phone size={16} />
                  </button>
                  <button className="btn-professional btn-outline btn-sm">
                    <Video size={16} />
                  </button>
                  <button className="btn-professional btn-outline btn-sm">
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Mensagens */}
            <div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: '400px' }}>
              {(messages[selectedChat.id] || []).map((msg) => (
                <div
                  key={msg.id}
                  className={`message ${msg.senderType === 'patient' ? 'sent' : 'received'}`}
                  style={{
                    display: 'flex',
                    justifyContent: msg.senderType === 'patient' ? 'flex-end' : 'flex-start',
                    marginBottom: 'var(--spacing-sm)'
                  }}
                >
                  <div
                    style={{
                      maxWidth: '70%',
                      padding: 'var(--spacing-sm)',
                      borderRadius: 'var(--border-radius)',
                      backgroundColor: msg.senderType === 'patient' ? 'var(--primary-blue)' : 'var(--background-light)',
                      color: msg.senderType === 'patient' ? 'white' : 'var(--text-primary)'
                    }}
                  >
                    <p>{msg.content}</p>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <span style={{ fontSize: '10px', opacity: 0.7 }}>
                        {formatTime(msg.timestamp)}
                      </span>
                      {msg.senderType === 'patient' && (
                        <CheckCheck size={12} style={{ opacity: 0.7 }} />
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="message received">
                  <div style={{
                    padding: 'var(--spacing-sm)',
                    borderRadius: 'var(--border-radius)',
                    backgroundColor: 'var(--background-light)',
                    color: 'var(--text-primary)'
                  }}>
                    <p>Digitando...</p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input de Mensagem */}
            <div className="card-body" style={{ borderTop: '1px solid var(--border-light)', padding: 'var(--spacing-sm)' }}>
              <div className="flex items-center gap-sm">
                <button 
                  className="btn-professional btn-outline btn-sm"
                  onClick={() => setShowAttachments(!showAttachments)}
                >
                  <Paperclip size={16} />
                </button>
                <div className="flex-1">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Digite sua mensagem..."
                    className="w-full p-2 border border-gray-300 rounded resize-none"
                    rows="1"
                    style={{ minHeight: '40px' }}
                  />
                </div>
                <button className="btn-professional btn-outline btn-sm">
                  <Smile size={16} />
                </button>
                <button 
                  onClick={handleSendMessage}
                  className="btn-professional btn-primary btn-sm"
                  disabled={!message.trim()}
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="card-professional">
            <div className="card-body text-center">
              <MessageCircle size={48} className="mx-auto mb-4 text-gray-400" />
              <h3 className="card-title">Selecione uma conversa</h3>
              <p className="card-subtitle">Escolha uma conversa da lista para começar a trocar mensagens</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default Chat
