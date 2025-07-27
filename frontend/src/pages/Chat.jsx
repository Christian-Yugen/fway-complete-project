import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { mockProfessionals } from '../data/mockData'

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

  // Mock data para conversas existentes
  const mockChats = [
    {
      id: 1,
      professionalId: 1,
      professional: mockProfessionals[0],
      lastMessage: "Obrigado pela consulta! Lembre-se de tomar o medicamento conforme prescrito.",
      lastMessageTime: "14:30",
      unreadCount: 0,
      isOnline: true,
      lastSeen: "Agora"
    },
    {
      id: 2,
      professionalId: 2,
      professional: mockProfessionals[1],
      lastMessage: "Os exames chegaram. Vou analisar e te retorno em breve.",
      lastMessageTime: "10:15",
      unreadCount: 2,
      isOnline: false,
      lastSeen: "2h atrás"
    },
    {
      id: 3,
      professionalId: 9,
      professional: mockProfessionals[8],
      lastMessage: "Ótimo progresso! Continue com os exercícios que passamos.",
      lastMessageTime: "Ontem",
      unreadCount: 0,
      isOnline: true,
      lastSeen: "5 min atrás"
    },
    {
      id: 4,
      professionalId: 5,
      professional: mockProfessionals[4],
      lastMessage: "Preciso que você venha para uma reavaliação na próxima semana.",
      lastMessageTime: "Ontem",
      unreadCount: 1,
      isOnline: false,
      lastSeen: "1h atrás"
    }
  ]

  // Mock messages para cada chat
  const mockMessages = {
    1: [
      {
        id: 1,
        senderId: 1,
        senderType: 'professional',
        content: "Olá! Como você está se sentindo após a consulta de ontem?",
        timestamp: "2024-06-16T09:00:00Z",
        type: 'text'
      },
      {
        id: 2,
        senderId: 'patient',
        senderType: 'patient',
        content: "Bom dia, doutor! Estou me sentindo melhor, obrigado.",
        timestamp: "2024-06-16T09:15:00Z",
        type: 'text'
      },
      {
        id: 3,
        senderId: 1,
        senderType: 'professional',
        content: "Que bom! Lembre-se de tomar o medicamento nos horários corretos.",
        timestamp: "2024-06-16T09:20:00Z",
        type: 'text'
      },
      {
        id: 4,
        senderId: 'patient',
        senderType: 'patient',
        content: "Claro! Tenho uma dúvida sobre a dosagem...",
        timestamp: "2024-06-16T14:25:00Z",
        type: 'text'
      },
      {
        id: 5,
        senderId: 1,
        senderType: 'professional',
        content: "Obrigado pela consulta! Lembre-se de tomar o medicamento conforme prescrito.",
        timestamp: "2024-06-16T14:30:00Z",
        type: 'text'
      }
    ],
    2: [
      {
        id: 1,
        senderId: 'patient',
        senderType: 'patient',
        content: "Dra. Maria, enviei os exames que você solicitou.",
        timestamp: "2024-06-16T08:00:00Z",
        type: 'text'
      },
      {
        id: 2,
        senderId: 'patient',
        senderType: 'patient',
        content: "exame_sangue.pdf",
        timestamp: "2024-06-16T08:01:00Z",
        type: 'file',
        fileName: 'exame_sangue.pdf',
        fileSize: '2.3 MB'
      },
      {
        id: 3,
        senderId: 2,
        senderType: 'professional',
        content: "Perfeito! Recebi os exames. Vou analisar e te retorno hoje ainda.",
        timestamp: "2024-06-16T10:15:00Z",
        type: 'text'
      },
      {
        id: 4,
        senderId: 2,
        senderType: 'professional',
        content: "Os exames chegaram. Vou analisar e te retorno em breve.",
        timestamp: "2024-06-16T10:15:00Z",
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

    // Simular resposta do profissional após 2 segundos
    setTimeout(() => {
      setIsTyping(true)
      setTimeout(() => {
        const responses = [
          "Entendi. Vou verificar isso para você.",
          "Obrigado pela informação. Isso é importante.",
          "Vou analisar e te retorno em breve.",
          "Perfeito! Continue assim.",
          "Isso é normal. Não se preocupe."
        ]
        
        const response = {
          id: Date.now() + 1,
          senderId: selectedChat.professionalId,
          senderType: 'professional',
          content: responses[Math.floor(Math.random() * responses.length)],
          timestamp: new Date().toISOString(),
          type: 'text'
        }

        setMessages(prev => ({
          ...prev,
          [selectedChat.id]: [...(prev[selectedChat.id] || []), response]
        }))
        setIsTyping(false)
      }, 2000)
    }, 2000)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (!file || !selectedChat) return

    const newMessage = {
      id: Date.now(),
      senderId: 'patient',
      senderType: 'patient',
      content: file.name,
      timestamp: new Date().toISOString(),
      type: 'file',
      fileName: file.name,
      fileSize: `${(file.size / 1024 / 1024).toFixed(1)} MB`
    }

    setMessages(prev => ({
      ...prev,
      [selectedChat.id]: [...(prev[selectedChat.id] || []), newMessage]
    }))

    setShowAttachments(false)
  }

  const getProfessionLabel = (profession) => {
    switch (profession) {
      case 'medico': return 'Dr(a).'
      case 'enfermeiro': return 'Enf.'
      case 'fisioterapeuta': return 'Dr(a).'
      default: return ''
    }
  }

  const currentMessages = selectedChat ? messages[selectedChat.id] || [] : []

  return (
    <div className="content-container">
      {/* Sidebar Esquerda - Perfil do Usuário */}
      <aside className="sidebar-left">
        <div className="card-professional profile-card">
          <div className="card-body">
            <div className="profile-avatar-large">
              <div className="profile-fallback">U</div>
            </div>
            <h3 className="profile-name">Usuário</h3>
            <p className="profile-title">Paciente</p>
            <div className="profile-stats">
              <div className="profile-stat">
                <span className="profile-stat-number">{mockChats.length}</span>
                <span className="profile-stat-label">Conversas</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat-number">{mockChats.filter(c => c.unreadCount > 0).length}</span>
                <span className="profile-stat-label">Não lidas</span>
              </div>
            </div>
          </div>
        </div>

        {/* Status de Atividade */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title">🟢 Status</h3>
          </div>
          <div className="card-body">
            <div className="flex items-center gap-sm">
              <div style={{
                width: '12px',
                height: '12px',
                backgroundColor: '#057642',
                borderRadius: '50%'
              }}></div>
              <span className="text-secondary">Online</span>
            </div>
            <p className="text-muted" style={{ marginTop: '8px' }}>
              Disponível para mensagens
            </p>
          </div>
        </div>

        {/* Acesso Rápido */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title">Acesso Rápido</h3>
          </div>
          <div className="card-body">
            <nav className="flex flex-col gap-sm">
              <button className="activity-action">
                <FileText size={16} /> Arquivos Compartilhados
              </button>
              <button className="activity-action">
                <Search size={16} /> Buscar Mensagens
              </button>
              <button className="activity-action">
                <Settings size={16} /> Configurações de Chat
              </button>
            </nav>
          </div>
        </div>
      </aside>

      {/* Conteúdo Principal - Chat */}
      <main className="content-main">
        <div className="card-professional" style={{ height: 'calc(100vh - 120px)' }}>
          <div style={{ display: 'flex', height: '100%' }}>
            {/* Lista de Conversas */}
            <div style={{ 
              width: '320px', 
              borderRight: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div className="card-header">
                <h3 className="card-title">Conversas</h3>
                <p className="card-subtitle">Seus chats com profissionais</p>
              </div>
              
              {/* Busca de Conversas */}
              <div style={{ padding: 'var(--spacing-md)' }}>
                <div className="search-professional">
                  <span className="search-icon"><Search size={16} /></span>
                  <input
                    type="text"
                    placeholder="Buscar conversas..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                  />
                </div>
              </div>

              {/* Lista de Chats */}
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {filteredChats.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => setSelectedChat(chat)}
                    style={{
                      padding: 'var(--spacing-md)',
                      borderBottom: '1px solid var(--border-light)',
                      cursor: 'pointer',
                      backgroundColor: selectedChat?.id === chat.id ? 'var(--primary-blue-light)' : 'transparent',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedChat?.id !== chat.id) {
                        e.target.style.backgroundColor = 'var(--background-tertiary)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedChat?.id !== chat.id) {
                        e.target.style.backgroundColor = 'transparent'
                      }
                    }}
                  >
                    <div className="flex gap-sm">
                      <div className="profile-avatar-medium" style={{ position: 'relative' }}>
                        {chat.professional.avatar ? (
                          <img 
                            src={chat.professional.avatar} 
                            alt={chat.professional.name}
                            className="profile-image"
                            onError={(e) => {
                              e.target.style.display = 'none'
                              e.target.nextSibling.style.display = 'flex'
                            }}
                          />
                        ) : null}
                        <div 
                          className="profile-fallback"
                          style={{ display: chat.professional.avatar ? 'none' : 'flex' }}
                        >
                          {chat.professional.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        {chat.isOnline && (
                          <div style={{
                            position: 'absolute',
                            bottom: '2px',
                            right: '2px',
                            width: '12px',
                            height: '12px',
                            backgroundColor: '#057642',
                            border: '2px solid white'
                          }}></div>
                        )}
                      </div>
                      
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="flex justify-between items-center">
                          <h4 className="professional-name">
                            {getProfessionLabel(chat.professional.profession)} {chat.professional.name}
                          </h4>
                          {chat.unreadCount > 0 && (
                            <span style={{
                              backgroundColor: 'var(--error-red)',
                              color: 'white',
                              fontSize: '10px',
                              fontWeight: 'bold',
                              padding: '2px 6px',
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
                        <p className="professional-specialty">{chat.professional.specialty}</p>
                        <p className="text-muted" style={{
                          fontSize: 'var(--font-size-sm)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {chat.lastMessage}
                        </p>
                        <div className="flex justify-between items-center" style={{ marginTop: '4px' }}>
                          <span className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>
                            {chat.lastMessageTime}
                          </span>
                          <span className={`text-muted ${chat.isOnline ? 'text-blue' : ''}`} style={{ fontSize: 'var(--font-size-xs)' }}>
                            {chat.isOnline ? '🟢 Online' : chat.lastSeen}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Área de Chat */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              {selectedChat ? (
                <>
                  {/* Header do Chat */}
                  <div className="card-header">
                    <div className="flex items-center gap-sm">
                      <div className="profile-avatar-small" style={{ position: 'relative' }}>
                        {selectedChat.professional.avatar ? (
                          <img 
                            src={selectedChat.professional.avatar} 
                            alt={selectedChat.professional.name}
                            className="profile-image"
                            onError={(e) => {
                              e.target.style.display = 'none'
                              e.target.nextSibling.style.display = 'flex'
                            }}
                          />
                        ) : null}
                        <div 
                          className="profile-fallback"
                          style={{ display: selectedChat.professional.avatar ? 'none' : 'flex' }}
                        >
                          {selectedChat.professional.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        {selectedChat.isOnline && (
                          <div style={{
                            position: 'absolute',
                            bottom: '0px',
                            right: '0px',
                            width: '8px',
                            height: '8px',
                            backgroundColor: '#057642',
                            border: '1px solid white'
                          }}></div>
                        )}
                      </div>
                      <div>
                        <h3 className="card-title">
                          {getProfessionLabel(selectedChat.professional.profession)} {selectedChat.professional.name}
                        </h3>
                        <p className="card-subtitle">
                          {selectedChat.professional.specialty} • {selectedChat.isOnline ? '🟢 Online' : selectedChat.lastSeen}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Mensagens */}
                  <div style={{ 
                    flex: 1, 
                    overflowY: 'auto', 
                    padding: 'var(--spacing-md)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--spacing-sm)'
                  }}>
                    {currentMessages.map((msg) => (
                      <div
                        key={msg.id}
                        style={{
                          display: 'flex',
                          justifyContent: msg.senderType === 'patient' ? 'flex-end' : 'flex-start'
                        }}
                      >
                        <div
                          style={{
                            maxWidth: '70%',
                            padding: 'var(--spacing-sm) var(--spacing-md)',
                            backgroundColor: msg.senderType === 'patient' ? 'var(--primary-blue)' : 'var(--background-tertiary)',
                            color: msg.senderType === 'patient' ? 'white' : 'var(--text-primary)',
                            marginBottom: 'var(--spacing-xs)'
                          }}
                        >
                          {msg.type === 'file' ? (
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                                <span>📎</span>
                                <span>{msg.fileName}</span>
                              </div>
                              <div style={{ fontSize: 'var(--font-size-xs)', opacity: 0.8 }}>
                                {msg.fileSize}
                              </div>
                            </div>
                          ) : (
                            <p style={{ margin: 0 }}>{msg.content}</p>
                          )}
                          <div style={{ 
                            fontSize: 'var(--font-size-xs)', 
                            opacity: 0.8, 
                            marginTop: '4px',
                            textAlign: 'right'
                          }}>
                            {formatTime(msg.timestamp)}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {isTyping && (
                      <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                        <div style={{
                          padding: 'var(--spacing-sm) var(--spacing-md)',
                          backgroundColor: 'var(--background-tertiary)',
                          color: 'var(--text-secondary)'
                        }}>
                          <span><MessageCircle size={16} /> Digitando...</span>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input de Mensagem */}
                  <div className="card-footer">
                    <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'flex-end' }}>
                      <div style={{ position: 'relative' }}>
                        <button
                          onClick={() => setShowAttachments(!showAttachments)}
                          className="btn-professional btn-outline"
                          style={{ padding: 'var(--spacing-sm)' }}
                        >
                          📎
                        </button>
                        
                        {showAttachments && (
                          <div style={{
                            position: 'absolute',
                            bottom: '100%',
                            left: 0,
                            backgroundColor: 'var(--background-primary)',
                            border: '1px solid var(--border-color)',
                            boxShadow: 'var(--shadow-md)',
                            padding: 'var(--spacing-sm)',
                            marginBottom: 'var(--spacing-xs)',
                            minWidth: '150px'
                          }}>
                            <button
                              onClick={() => fileInputRef.current?.click()}
                              className="activity-action"
                              style={{ width: '100%', textAlign: 'left' }}
                            >
                              <FileText size={16} /> Arquivo
                            </button>
                            <button
                              onClick={() => fileInputRef.current?.click()}
                              className="activity-action"
                              style={{ width: '100%', textAlign: 'left' }}
                            >
                              <Camera size={16} /> Foto
                            </button>
                            <button
                              onClick={() => fileInputRef.current?.click()}
                              className="activity-action"
                              style={{ width: '100%', textAlign: 'left' }}
                            >
                              <Stethoscope size={16} /> Exame
                            </button>
                          </div>
                        )}
                        
                        <input
                          ref={fileInputRef}
                          type="file"
                          onChange={handleFileUpload}
                          style={{ display: 'none' }}
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        />
                      </div>
                      
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Digite sua mensagem..."
                        style={{
                          flex: 1,
                          minHeight: '36px',
                          maxHeight: '100px',
                          padding: 'var(--spacing-sm)',
                          border: '1px solid var(--border-color)',
                          backgroundColor: 'var(--background-primary)',
                          resize: 'vertical',
                          fontFamily: 'inherit'
                        }}
                      />
                      
                      <button
                        onClick={handleSendMessage}
                        disabled={!message.trim()}
                        className="btn-professional btn-primary"
                        style={{ 
                          padding: 'var(--spacing-sm) var(--spacing-md)',
                          opacity: message.trim() ? 1 : 0.5
                        }}
                      >
                        Enviar
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  gap: 'var(--spacing-md)'
                }}>
                  <span style={{ fontSize: '48px' }}><MessageCircle size={16} /></span>
                  <h3 className="card-title">Selecione uma conversa</h3>
                  <p className="card-subtitle">Escolha um profissional para começar a conversar</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Sidebar Direita - Informações do Chat */}
      <aside className="sidebar-right">
        {selectedChat ? (
          <>
            {/* Informações do Profissional */}
            <div className="card-professional">
              <div className="card-header">
                <h3 className="card-title">Informações</h3>
              </div>
              <div className="card-body text-center">
                <div className="profile-avatar-large">
                  {selectedChat.professional.avatar ? (
                    <img 
                      src={selectedChat.professional.avatar} 
                      alt={selectedChat.professional.name}
                      className="profile-image"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'flex'
                      }}
                    />
                  ) : null}
                  <div 
                    className="profile-fallback"
                    style={{ display: selectedChat.professional.avatar ? 'none' : 'flex' }}
                  >
                    {selectedChat.professional.name.split(' ').map(n => n[0]).join('')}
                  </div>
                </div>
                <h3 className="profile-name">
                  {getProfessionLabel(selectedChat.professional.profession)} {selectedChat.professional.name}
                </h3>
                <p className="profile-title">{selectedChat.professional.specialty}</p>
                <p className="text-muted"><MapPin size={16} /> {selectedChat.professional.location}</p>
                
                <div className="flex gap-sm" style={{ marginTop: 'var(--spacing-md)' }}>
                  <button
                    onClick={() => navigate(`/professional/${selectedChat.professionalId}`)}
                    className="btn-professional btn-secondary btn-sm"
                  >
                    Ver Perfil
                  </button>
                  <button
                    onClick={() => navigate(`/booking/${selectedChat.professionalId}`)}
                    className="btn-professional btn-primary btn-sm"
                  >
                    Agendar
                  </button>
                </div>
              </div>
            </div>

            {/* Arquivos Compartilhados */}
            <div className="card-professional">
              <div className="card-header">
                <h3 className="card-title"><FileText size={16} /> Arquivos</h3>
              </div>
              <div className="card-body">
                <div className="flex flex-col gap-sm">
                  <div className="flex items-center gap-sm">
                    <span><File size={16} /></span>
                    <div className="flex-1">
                      <p className="font-bold">exame_sangue.pdf</p>
                      <p className="text-muted">2.3 MB • Hoje</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-sm">
                    <span><Camera size={16} /></span>
                    <div className="flex-1">
                      <p className="font-bold">raio_x_torax.jpg</p>
                      <p className="text-muted">1.8 MB • Ontem</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Conversas Recentes */}
            <div className="card-professional">
              <div className="card-header">
                <h3 className="card-title"><MessageCircle size={16} /> Conversas Recentes</h3>
              </div>
              <div className="card-body">
                <div className="flex flex-col gap-sm">
                  {mockChats.slice(0, 3).map((chat) => (
                    <div key={chat.id} className="flex items-center gap-sm">
                      <div className="profile-avatar-small">
                        <div className="profile-fallback">
                          {chat.professional.name.split(' ').map(n => n[0]).join('')}
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="professional-name">{chat.professional.name}</p>
                        <p className="professional-specialty">{chat.professional.specialty}</p>
                      </div>
                      {chat.unreadCount > 0 && (
                        <span style={{
                          backgroundColor: 'var(--error-red)',
                          color: 'white',
                          fontSize: '10px',
                          fontWeight: 'bold',
                          padding: '2px 6px',
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
                  ))}
                </div>
              </div>
            </div>

            {/* Dicas de Chat */}
            <div className="card-professional">
              <div className="card-header">
                <h3 className="card-title"><Lightbulb size={16} /> Dicas</h3>
              </div>
              <div className="card-body">
                <div className="flex flex-col gap-sm">
                  <p className="text-secondary">📎 Use anexos para enviar exames e documentos</p>
                  <p className="text-secondary"><Search size={16} /> Busque conversas pelo nome do profissional</p>
                  <p className="text-secondary">🟢 Veja quem está online em tempo real</p>
                  <p className="text-secondary"><Phone size={16} /> Receba notificações de novas mensagens</p>
                </div>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}

export default Chat

