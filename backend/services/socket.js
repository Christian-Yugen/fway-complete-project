const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

class SocketService {
  constructor() {
    this.io = null;
    this.prisma = null;
    this.connectedUsers = new Map(); // userId -> socketId
    this.userSockets = new Map(); // socketId -> userId
  }

  initialize(io, prisma) {
    this.io = io;
    this.prisma = prisma;
    this.setupSocketHandlers();
    console.log('✅ Socket.IO service initialized');
  }

  setupSocketHandlers() {
    this.io.use(this.authenticateSocket.bind(this));

    this.io.on('connection', (socket) => {
      console.log(`🔌 User connected: ${socket.userId} (${socket.id})`);
      
      // Armazenar conexão
      this.connectedUsers.set(socket.userId, socket.id);
      this.userSockets.set(socket.id, socket.userId);

      // Entrar em salas específicas do usuário
      socket.join(`user:${socket.userId}`);
      
      // Se for profissional, entrar na sala de profissionais
      if (socket.userProfessional) {
        socket.join(`professional:${socket.userProfessional.id}`);
      }

      // Handlers de eventos
      this.setupChatHandlers(socket);
      this.setupBookingHandlers(socket);
      this.setupNotificationHandlers(socket);
      this.setupShieldHandlers(socket);

      // Evento de desconexão
      socket.on('disconnect', () => {
        console.log(`🔌 User disconnected: ${socket.userId} (${socket.id})`);
        this.connectedUsers.delete(socket.userId);
        this.userSockets.delete(socket.id);
      });

      // Enviar status online
      this.broadcastUserStatus(socket.userId, 'online');
    });
  }

  // Middleware de autenticação para Socket.IO
  async authenticateSocket(socket, next) {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return next(new Error('Token de autenticação requerido'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const user = await this.prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          isActive: true,
          professional: {
            select: {
              id: true,
              isVerified: true,
              isAvailable: true
            }
          }
        }
      });

      if (!user || !user.isActive) {
        return next(new Error('Usuário não encontrado ou inativo'));
      }

      socket.userId = user.id;
      socket.userName = `${user.firstName} ${user.lastName}`;
      socket.userProfessional = user.professional;
      
      next();
    } catch (error) {
      next(new Error('Token inválido'));
    }
  }

  // Handlers de chat
  setupChatHandlers(socket) {
    // Entrar em uma conversa
    socket.on('chat:join', async (data) => {
      try {
        const { chatId } = data;
        
        // Verificar se o usuário tem acesso ao chat
        const chatParticipant = await this.prisma.chatParticipant.findFirst({
          where: {
            chatId,
            userId: socket.userId,
            isActive: true
          }
        });

        if (!chatParticipant) {
          socket.emit('error', { message: 'Acesso negado ao chat' });
          return;
        }

        socket.join(`chat:${chatId}`);
        socket.emit('chat:joined', { chatId });
        
        console.log(`💬 User ${socket.userId} joined chat ${chatId}`);
      } catch (error) {
        console.error('Error joining chat:', error);
        socket.emit('error', { message: 'Erro ao entrar no chat' });
      }
    });

    // Enviar mensagem
    socket.on('chat:message', async (data) => {
      try {
        const { chatId, content, type = 'TEXT', replyToId } = data;

        // Verificar acesso ao chat
        const chatParticipant = await this.prisma.chatParticipant.findFirst({
          where: {
            chatId,
            userId: socket.userId,
            isActive: true
          }
        });

        if (!chatParticipant) {
          socket.emit('error', { message: 'Acesso negado ao chat' });
          return;
        }

        // Criar mensagem
        const message = await this.prisma.message.create({
          data: {
            chatId,
            senderId: socket.userId,
            content,
            type,
            replyToId
          },
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true
              }
            },
            replyTo: {
              select: {
                id: true,
                content: true,
                sender: {
                  select: {
                    firstName: true,
                    lastName: true
                  }
                }
              }
            }
          }
        });

        // Atualizar último timestamp do chat
        await this.prisma.chat.update({
          where: { id: chatId },
          data: { lastMessageAt: new Date() }
        });

        // Enviar mensagem para todos os participantes do chat
        this.io.to(`chat:${chatId}`).emit('chat:message', {
          message,
          chatId
        });

        console.log(`💬 Message sent in chat ${chatId} by user ${socket.userId}`);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Erro ao enviar mensagem' });
      }
    });

    // Marcar mensagens como lidas
    socket.on('chat:mark_read', async (data) => {
      try {
        const { chatId, messageIds } = data;

        await this.prisma.message.updateMany({
          where: {
            id: { in: messageIds },
            chatId,
            senderId: { not: socket.userId }
          },
          data: { isRead: true }
        });

        // Notificar outros participantes
        socket.to(`chat:${chatId}`).emit('chat:messages_read', {
          chatId,
          messageIds,
          readBy: socket.userId
        });
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });

    // Indicador de digitação
    socket.on('chat:typing', (data) => {
      const { chatId, isTyping } = data;
      socket.to(`chat:${chatId}`).emit('chat:typing', {
        chatId,
        userId: socket.userId,
        userName: socket.userName,
        isTyping
      });
    });
  }

  // Handlers de agendamento
  setupBookingHandlers(socket) {
    // Atualização de status de agendamento
    socket.on('booking:status_update', async (data) => {
      try {
        const { bookingId, status } = data;

        // Verificar se o usuário tem permissão para atualizar
        const booking = await this.prisma.booking.findFirst({
          where: {
            id: bookingId,
            OR: [
              { userId: socket.userId },
              { professional: { userId: socket.userId } }
            ]
          },
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true }
            },
            professional: {
              select: { 
                id: true, 
                userId: true,
                user: {
                  select: { firstName: true, lastName: true }
                }
              }
            }
          }
        });

        if (!booking) {
          socket.emit('error', { message: 'Agendamento não encontrado' });
          return;
        }

        // Atualizar status
        const updatedBooking = await this.prisma.booking.update({
          where: { id: bookingId },
          data: { status }
        });

        // Notificar ambas as partes
        this.io.to(`user:${booking.userId}`).emit('booking:updated', {
          booking: updatedBooking,
          updatedBy: socket.userId
        });

        this.io.to(`user:${booking.professional.userId}`).emit('booking:updated', {
          booking: updatedBooking,
          updatedBy: socket.userId
        });

        console.log(`📅 Booking ${bookingId} status updated to ${status}`);
      } catch (error) {
        console.error('Error updating booking status:', error);
        socket.emit('error', { message: 'Erro ao atualizar agendamento' });
      }
    });
  }

  // Handlers de notificações
  setupNotificationHandlers(socket) {
    // Marcar notificação como lida
    socket.on('notification:mark_read', async (data) => {
      try {
        const { notificationId } = data;

        await this.prisma.notification.update({
          where: {
            id: notificationId,
            userId: socket.userId
          },
          data: { isRead: true }
        });

        socket.emit('notification:marked_read', { notificationId });
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    });
  }

  // Handlers do Fway Shield
  setupShieldHandlers(socket) {
    // Atualização de claim
    socket.on('shield:claim_update', async (data) => {
      try {
        const { claimId, status } = data;

        const claim = await this.prisma.shieldClaim.findFirst({
          where: {
            id: claimId,
            shieldProfile: {
              userId: socket.userId
            }
          }
        });

        if (!claim) {
          socket.emit('error', { message: 'Claim não encontrado' });
          return;
        }

        const updatedClaim = await this.prisma.shieldClaim.update({
          where: { id: claimId },
          data: { 
            status,
            resolvedAt: status === 'RESOLVED' ? new Date() : null
          }
        });

        socket.emit('shield:claim_updated', { claim: updatedClaim });
        
        console.log(`🛡️ Shield claim ${claimId} updated to ${status}`);
      } catch (error) {
        console.error('Error updating shield claim:', error);
        socket.emit('error', { message: 'Erro ao atualizar claim' });
      }
    });
  }

  // Métodos utilitários
  broadcastUserStatus(userId, status) {
    this.io.emit('user:status', { userId, status });
  }

  sendNotificationToUser(userId, notification) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit('notification:new', notification);
    }
  }

  sendMessageToUser(userId, event, data) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
    }
  }

  broadcastToRoom(room, event, data) {
    this.io.to(room).emit(event, data);
  }

  getConnectedUsers() {
    return Array.from(this.connectedUsers.keys());
  }

  isUserConnected(userId) {
    return this.connectedUsers.has(userId);
  }
}

module.exports = new SocketService();

