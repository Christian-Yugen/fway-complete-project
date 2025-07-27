import React, { useState, useEffect, useRef } from 'react'
import { Send, Paperclip, Smile, MoreVertical, Phone, Video, Info, Image, File, Mic, X } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

const ChatComponent = ({ 
  chatId, 
  recipientId, 
  recipientName, 
  recipientAvatar, 
  recipientStatus = 'offline',
  onClose,
  className = '' 
}) => {
  const { user } = useAuthStore()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [recipientTyping, setRecipientTyping] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showAttachments, setShowAttachments] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  useEffect(() => {
    if (chatId) {
      fetchMessages()
      // Simulate real-time updates
      const interval = setInterval(() => {
        // Simulate receiving messages
        if (Math.random() > 0.95) {
          receiveMessage()
        }
        // Simulate typing indicator
        if (Math.random() > 0.98) {
          setRecipientTyping(true)
          setTimeout(() => setRecipientTyping(false), 2000)
        }
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [chatId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchMessages = async () => {
    try {
      setLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const mockMessages = [
        {
          id: 1,
          senderId: recipientId,
          senderName: recipientName,
          content: 'Olá! Como posso ajudá-lo hoje?',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          type: 'text',
          status: 'read'
        },
        {
          id: 2,
          senderId: user?.id || 999,
          senderName: user?.name || 'Você',
          content: 'Gostaria de agendar uma consulta para esta semana.',
          timestamp: new Date(Date.now() - 3000000).toISOString(),
          type: 'text',
          status: 'read'
        },
        {
          id: 3,
          senderId: recipientId,
          senderName: recipientName,
          content: 'Claro! Tenho disponibilidade na quinta-feira às 14h ou na sexta às 10h. Qual horário prefere?',
          timestamp: new Date(Date.now() - 2400000).toISOString(),
          type: 'text',
          status: 'read'
        },
        {
          id: 4,
          senderId: user?.id || 999,
          senderName: user?.name || 'Você',
          content: 'Quinta-feira às 14h seria perfeito!',
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          type: 'text',
          status: 'delivered'
        },
        {
          id: 5,
          senderId: recipientId,
          senderName: recipientName,
          content: 'Excelente! Vou confirmar o agendamento. Você receberá uma notificação com os detalhes.',
          timestamp: new Date(Date.now() - 900000).toISOString(),
          type: 'text',
          status: 'read'
        }
      ]

      setMessages(mockMessages)
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const receiveMessage = () => {
    const responses = [
      'Entendi, vou verificar isso para você.',
      'Tem mais alguma dúvida?',
      'Perfeito! Fico à disposição.',
      'Vou enviar mais informações por email.',
      'Obrigado pelo contato!'
    ]

    const newMsg = {
      id: Date.now(),
      senderId: recipientId,
      senderName: recipientName,
      content: responses[Math.floor(Math.random() * responses.length)],
      timestamp: new Date().toISOString(),
      type: 'text',
      status: 'delivered'
    }

    setMessages(prev => [...prev, newMsg])
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    const message = {
      id: Date.now(),
      senderId: user?.id || 999,
      senderName: user?.name || 'Você',
      content: newMessage,
      timestamp: new Date().toISOString(),
      type: 'text',
      status: 'sending'
    }

    setMessages(prev => [...prev, message])
    setNewMessage('')

    // Simulate message delivery
    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === message.id ? { ...msg, status: 'delivered' } : msg
      ))
    }, 1000)

    // Simulate read receipt
    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === message.id ? { ...msg, status: 'read' } : msg
      ))
    }, 3000)
  }

  const handleTyping = (value) => {
    setNewMessage(value)
    setIsTyping(true)

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
    }, 1000)
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      const message = {
        id: Date.now(),
        senderId: user?.id || 999,
        senderName: user?.name || 'Você',
        content: file.name,
        timestamp: new Date().toISOString(),
        type: file.type.startsWith('image/') ? 'image' : 'file',
        fileUrl: URL.createObjectURL(file),
        fileSize: file.size,
        status: 'sending'
      }

      setMessages(prev => [...prev, message])
      setShowAttachments(false)

      // Simulate upload
      setTimeout(() => {
        setMessages(prev => prev.map(msg => 
          msg.id === message.id ? { ...msg, status: 'delivered' } : msg
        ))
      }, 2000)
    }
  }

  const handleVoiceRecord = () => {
    setIsRecording(!isRecording)
    if (!isRecording) {
      // Start recording
      setTimeout(() => {
        setIsRecording(false)
        const message = {
          id: Date.now(),
          senderId: user?.id || 999,
          senderName: user?.name || 'Você',
          content: 'Mensagem de voz',
          timestamp: new Date().toISOString(),
          type: 'voice',
          duration: '0:05',
          status: 'delivered'
        }
        setMessages(prev => [...prev, message])
      }, 3000)
    }
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sending':
        return <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />
      case 'delivered':
        return <span className="text-gray-400">✓</span>
      case 'read':
        return <span className="text-blue-500">✓✓</span>
      default:
        return null
    }
  }

  const MessageBubble = ({ message }) => {
    const isOwn = message.senderId === (user?.id || 999)
    
    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          isOwn 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-100 text-gray-900'
        }`}>
          {message.type === 'text' && (
            <p className="text-sm">{message.content}</p>
          )}
          
          {message.type === 'image' && (
            <div>
              <img 
                src={message.fileUrl} 
                alt="Shared image" 
                className="rounded-lg mb-2 max-w-full h-auto"
              />
              <p className="text-xs opacity-75">{message.content}</p>
            </div>
          )}
          
          {message.type === 'file' && (
            <div className="flex items-center space-x-2">
              <File className="w-4 h-4" />
              <div>
                <p className="text-sm">{message.content}</p>
                <p className="text-xs opacity-75">
                  {(message.fileSize / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
          )}
          
          {message.type === 'voice' && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Mic className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-1">
                  {[...Array(20)].map((_, i) => (
                    <div 
                      key={i} 
                      className="w-1 bg-white bg-opacity-60 rounded-full"
                      style={{ height: Math.random() * 20 + 5 }}
                    />
                  ))}
                </div>
                <p className="text-xs opacity-75 mt-1">{message.duration}</p>
              </div>
            </div>
          )}
          
          <div className={`flex items-center justify-between mt-1 ${
            isOwn ? 'text-blue-100' : 'text-gray-500'
          }`}>
            <span className="text-xs">{formatTime(message.timestamp)}</span>
            {isOwn && (
              <div className="ml-2">
                {getStatusIcon(message.status)}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex flex-col h-full bg-white ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              src={recipientAvatar}
              alt={recipientName}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
              recipientStatus === 'online' ? 'bg-green-500' : 'bg-gray-400'
            }`} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{recipientName}</h3>
            <p className="text-sm text-gray-500">
              {recipientTyping ? 'digitando...' : recipientStatus}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Phone className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Video className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Info className="w-5 h-5 text-gray-600" />
          </button>
          {onClose && (
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {recipientTyping && (
              <div className="flex justify-start mb-4">
                <div className="bg-gray-100 rounded-lg px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Attachments Menu */}
      {showAttachments && (
        <div className="border-t border-gray-200 p-4">
          <div className="grid grid-cols-4 gap-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center space-y-2 p-3 hover:bg-gray-50 rounded-lg"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Image className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-xs text-gray-600">Foto</span>
            </button>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center space-y-2 p-3 hover:bg-gray-50 rounded-lg"
            >
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <File className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-xs text-gray-600">Arquivo</span>
            </button>
            
            <button
              onClick={handleVoiceRecord}
              className="flex flex-col items-center space-y-2 p-3 hover:bg-gray-50 rounded-lg"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isRecording ? 'bg-red-100' : 'bg-purple-100'
              }`}>
                <Mic className={`w-5 h-5 ${isRecording ? 'text-red-600' : 'text-purple-600'}`} />
              </div>
              <span className="text-xs text-gray-600">
                {isRecording ? 'Gravando...' : 'Áudio'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAttachments(!showAttachments)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <Paperclip className="w-5 h-5 text-gray-600" />
          </button>
          
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => handleTyping(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Digite sua mensagem..."
              className="w-full px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full">
              <Smile className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/*"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  )
}

export default ChatComponent

