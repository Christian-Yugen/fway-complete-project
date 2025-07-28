import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';

export const useSocket = () => {
  const { user, isAuthenticated } = useAuth();
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Conectar ao Socket.IO
      socketRef.current = io('https://3003-izf361ybzyo0p2xol4jhn-fea79467.manusvm.computer', {
        auth: {
          token: localStorage.getItem('fway_token'),
          userId: user.id
        },
        transports: ['websocket', 'polling']
      });

      const socket = socketRef.current;

      // Event listeners
      socket.on('connect', () => {
        console.log('Socket conectado:', socket.id);
        setIsConnected(true);
      });

      socket.on('disconnect', () => {
        console.log('Socket desconectado');
        setIsConnected(false);
      });

      socket.on('connect_error', (error) => {
        console.error('Erro de conexão Socket:', error);
        setIsConnected(false);
      });

      // Usuários online
      socket.on('users:online', (users) => {
        setOnlineUsers(users);
      });

      socket.on('user:online', (userId) => {
        setOnlineUsers(prev => [...prev.filter(id => id !== userId), userId]);
      });

      socket.on('user:offline', (userId) => {
        setOnlineUsers(prev => prev.filter(id => id !== userId));
      });

      return () => {
        socket.disconnect();
        setIsConnected(false);
      };
    }
  }, [isAuthenticated, user]);

  // Entrar em sala
  const joinRoom = (roomId) => {
    if (socketRef.current) {
      socketRef.current.emit('join:room', roomId);
    }
  };

  // Sair de sala
  const leaveRoom = (roomId) => {
    if (socketRef.current) {
      socketRef.current.emit('leave:room', roomId);
    }
  };

  // Enviar mensagem
  const sendMessage = (conversationId, messageData) => {
    if (socketRef.current) {
      socketRef.current.emit('chat:message', {
        conversationId,
        ...messageData
      });
    }
  };

  // Indicador de digitação
  const sendTyping = (conversationId, isTyping) => {
    if (socketRef.current) {
      socketRef.current.emit('chat:typing', {
        conversationId,
        isTyping
      });
    }
  };

  // Marcar como lida
  const markMessageAsRead = (messageId) => {
    if (socketRef.current) {
      socketRef.current.emit('chat:read', { messageId });
    }
  };

  // Escutar eventos
  const on = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  };

  // Remover listener
  const off = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  };

  // Emitir evento
  const emit = (event, data) => {
    if (socketRef.current) {
      socketRef.current.emit(event, data);
    }
  };

  return {
    socket: socketRef.current,
    isConnected,
    onlineUsers,
    joinRoom,
    leaveRoom,
    sendMessage,
    sendTyping,
    markMessageAsRead,
    on,
    off,
    emit
  };
};

