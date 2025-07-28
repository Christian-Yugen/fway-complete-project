const { PrismaClient } = require('@prisma/client');
const redis = require('../../config/redis');
const emailService = require('./emailService');
const smsService = require('./smsService');
const pushService = require('./pushService');
const templateService = require('./templateService');
const socketService = require('../socket');

const prisma = new PrismaClient();

class NotificationService {
  // Criar notificação
  async createNotification(data) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId: data.userId,
          type: data.type,
          title: data.title,
          message: data.message,
          data: data.data || {},
          priority: data.priority || 'MEDIUM',
          channels: data.channels || ['IN_APP'],
          scheduledFor: data.scheduledFor,
          expiresAt: data.expiresAt
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              notificationSettings: true
            }
          }
        }
      });

      // Processar notificação imediatamente se não agendada
      if (!data.scheduledFor || new Date(data.scheduledFor) <= new Date()) {
        await this.processNotification(notification);
      }

      return notification;
    } catch (error) {
      console.error('Erro ao criar notificação:', error);
      throw error;
    }
  }

  // Processar notificação
  async processNotification(notification) {
    try {
      const { user, channels } = notification;
      const settings = user.notificationSettings || {};

      // Verificar se usuário permite notificações
      if (!settings.enabled) {
        await this.markAsSkipped(notification.id, 'User disabled notifications');
        return;
      }

      // Processar cada canal
      for (const channel of channels) {
        try {
          switch (channel) {
            case 'IN_APP':
              await this.sendInAppNotification(notification);
              break;
            case 'EMAIL':
              if (settings.email && user.email) {
                await this.sendEmailNotification(notification);
              }
              break;
            case 'SMS':
              if (settings.sms && user.phone) {
                await this.sendSMSNotification(notification);
              }
              break;
            case 'PUSH':
              if (settings.push) {
                await this.sendPushNotification(notification);
              }
              break;
          }
        } catch (channelError) {
          console.error(`Erro no canal ${channel}:`, channelError);
        }
      }

      // Marcar como enviada
      await this.markAsSent(notification.id);

    } catch (error) {
      console.error('Erro ao processar notificação:', error);
      await this.markAsFailed(notification.id, error.message);
    }
  }

  // Notificação in-app (Socket.IO)
  async sendInAppNotification(notification) {
    try {
      // Enviar via Socket.IO
      socketService.sendToUser(notification.userId, 'notification', {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        priority: notification.priority,
        createdAt: notification.createdAt
      });

      // Cache para recuperação rápida
      const cacheKey = `notifications:${notification.userId}`;
      await redis.lpush(cacheKey, JSON.stringify({
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        priority: notification.priority,
        createdAt: notification.createdAt,
        read: false
      }));

      // Manter apenas últimas 100 notificações
      await redis.ltrim(cacheKey, 0, 99);
      await redis.expire(cacheKey, 86400 * 30); // 30 dias

      console.log(`Notificação in-app enviada para usuário ${notification.userId}`);
    } catch (error) {
      console.error('Erro ao enviar notificação in-app:', error);
      throw error;
    }
  }

  // Notificação por email
  async sendEmailNotification(notification) {
    try {
      const { user } = notification;
      
      // Renderizar template
      const templateName = this.getEmailTemplate(notification.type);
      const templateData = {
        userName: user.name,
        title: notification.title,
        message: notification.message,
        ...notification.data
      };

      const htmlContent = await templateService.renderTemplate(templateName, templateData);
      
      const emailData = {
        to: user.email,
        subject: notification.title,
        html: htmlContent
      };

      await emailService.sendEmail(emailData);
      console.log(`Email enviado para ${user.email}`);
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      throw error;
    }
  }

  // Notificação por SMS
  async sendSMSNotification(notification) {
    try {
      const { user } = notification;
      
      // Obter template de SMS baseado no tipo
      let message;
      
      switch (notification.type) {
        case 'BOOKING_REMINDER':
          message = smsService.getSMSTemplate('BOOKING_REMINDER', {
            professional: notification.data.professional,
            service: notification.data.service,
            date: new Date(notification.data.scheduledAt).toLocaleDateString('pt-BR'),
            time: new Date(notification.data.scheduledAt).toLocaleTimeString('pt-BR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })
          });
          break;
          
        case 'BOOKING_CONFIRMED':
          message = smsService.getSMSTemplate('BOOKING_CONFIRMATION', {
            professional: notification.data.professional,
            service: notification.data.service,
            date: new Date(notification.data.scheduledAt).toLocaleDateString('pt-BR'),
            time: new Date(notification.data.scheduledAt).toLocaleTimeString('pt-BR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })
          });
          break;
          
        case 'BOOKING_CANCELLED':
          message = smsService.getSMSTemplate('BOOKING_CANCELLATION', {
            professional: notification.data.professional,
            service: notification.data.service,
            date: new Date(notification.data.scheduledAt).toLocaleDateString('pt-BR')
          });
          break;
          
        case 'PAYMENT_RECEIVED':
          message = smsService.getSMSTemplate('PAYMENT_CONFIRMATION', {
            amount: new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }).format(notification.data.amount),
            service: notification.data.service
          });
          break;
          
        case 'SECURITY_LOGIN':
          message = smsService.getSMSTemplate('SECURITY_LOGIN', {
            time: new Date().toLocaleString('pt-BR')
          });
          break;
          
        case 'SECURITY_PASSWORD_CHANGED':
          message = smsService.getSMSTemplate('SECURITY_PASSWORD', {
            time: new Date().toLocaleString('pt-BR')
          });
          break;
          
        default:
          // Usar mensagem padrão se não houver template específico
          message = `Fway: ${notification.message}`;
      }

      await smsService.sendSMS(user.phone, message);
      console.log(`SMS enviado para ${user.phone}`);
      
    } catch (error) {
      console.error('Erro ao enviar SMS:', error);
      throw error;
    }
  }

  // Push notification
  async sendPushNotification(notification) {
    try {
      const { user } = notification;
      
      // Obter token FCM do usuário (assumindo que está armazenado no perfil)
      const userProfile = await prisma.user.findUnique({
        where: { id: user.id },
        select: { fcmToken: true }
      });

      if (!userProfile?.fcmToken) {
        console.log(`Usuário ${user.id} não possui token FCM registrado`);
        return;
      }

      // Obter template de push notification
      const pushTemplate = pushService.getPushTemplate(notification.type, {
        professional: notification.data.professional,
        service: notification.data.service,
        date: notification.data.scheduledAt ? 
          new Date(notification.data.scheduledAt).toLocaleDateString('pt-BR') : null,
        timeUntil: notification.data.timeUntil,
        amount: notification.data.amount,
        senderName: notification.data.senderName,
        senderAvatar: notification.data.senderAvatar,
        message: notification.message,
        ...notification.data
      });

      // Criar dados personalizados
      const pushData = pushService.createPushData(notification.type, {
        notificationId: notification.id,
        bookingId: notification.data.bookingId,
        paymentId: notification.data.paymentId,
        claimId: notification.data.claimId,
        conversationId: notification.data.conversationId,
        senderId: notification.data.senderId,
        actionUrl: notification.data.actionUrl
      });

      await pushService.sendToDevice(userProfile.fcmToken, pushTemplate, pushData);
      console.log(`Push notification enviada para usuário ${user.id}`);
      
    } catch (error) {
      console.error('Erro ao enviar push notification:', error);
      
      // Se o token é inválido, remover do usuário
      if (error.message?.includes('INVALID_TOKEN')) {
        await prisma.user.update({
          where: { id: notification.userId },
          data: { fcmToken: null }
        });
        console.log(`Token FCM inválido removido do usuário ${notification.userId}`);
      }
      
      throw error;
    }
  }

  // Obter template de email por tipo
  getEmailTemplate(type) {
    const templates = {
      BOOKING_CREATED: 'booking-created',
      BOOKING_CONFIRMED: 'booking-confirmed',
      BOOKING_CANCELLED: 'booking-cancelled',
      BOOKING_REMINDER: 'booking-reminder',
      BOOKING_COMPLETED: 'booking-completed',
      PAYMENT_RECEIVED: 'payment-received',
      PAYMENT_FAILED: 'payment-failed',
      PAYMENT_REFUNDED: 'payment-received',
      SHIELD_CLAIM_CREATED: 'default',
      SHIELD_CLAIM_APPROVED: 'shield-claim-approved',
      SHIELD_CLAIM_REJECTED: 'shield-claim-rejected',
      SHIELD_COVERAGE_ACTIVATED: 'default',
      CHAT_MESSAGE: 'chat-message',
      CHAT_NEW_CONVERSATION: 'chat-message',
      SYSTEM_ALERT: 'system-alert',
      SYSTEM_MAINTENANCE: 'system-alert',
      SYSTEM_UPDATE: 'system-alert',
      MARKETING_PROMOTION: 'marketing',
      MARKETING_NEWSLETTER: 'marketing',
      SECURITY_LOGIN: 'security',
      SECURITY_PASSWORD_CHANGED: 'security',
      AI_ANALYSIS_COMPLETE: 'default',
      PROFESSIONAL_VERIFIED: 'default',
      REVIEW_REQUEST: 'default',
      SYSTEM_TEST: 'default'
    };
    
    return templates[type] || 'default';
  }

  // Marcar como enviada
  async markAsSent(notificationId) {
    await prisma.notification.update({
      where: { id: notificationId },
      data: {
        status: 'SENT',
        sentAt: new Date()
      }
    });
  }

  // Marcar como falhada
  async markAsFailed(notificationId, error) {
    await prisma.notification.update({
      where: { id: notificationId },
      data: {
        status: 'FAILED',
        error: error,
        sentAt: new Date()
      }
    });
  }

  // Marcar como ignorada
  async markAsSkipped(notificationId, reason) {
    await prisma.notification.update({
      where: { id: notificationId },
      data: {
        status: 'SKIPPED',
        error: reason,
        sentAt: new Date()
      }
    });
  }

  // Listar notificações do usuário
  async getUserNotifications(userId, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        type,
        read,
        priority
      } = options;

      const where = { userId };
      
      if (type) where.type = type;
      if (read !== undefined) where.read = read;
      if (priority) where.priority = priority;

      const notifications = await prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          type: true,
          title: true,
          message: true,
          data: true,
          priority: true,
          read: true,
          createdAt: true
        }
      });

      const total = await prisma.notification.count({ where });

      return {
        notifications,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Erro ao listar notificações:', error);
      throw error;
    }
  }

  // Marcar como lida
  async markAsRead(notificationId, userId) {
    try {
      const notification = await prisma.notification.updateMany({
        where: {
          id: notificationId,
          userId: userId
        },
        data: {
          read: true,
          readAt: new Date()
        }
      });

      // Atualizar cache
      const cacheKey = `notifications:${userId}`;
      const cached = await redis.lrange(cacheKey, 0, -1);
      
      for (let i = 0; i < cached.length; i++) {
        const item = JSON.parse(cached[i]);
        if (item.id === notificationId) {
          item.read = true;
          await redis.lset(cacheKey, i, JSON.stringify(item));
          break;
        }
      }

      return notification;
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
      throw error;
    }
  }

  // Marcar todas como lidas
  async markAllAsRead(userId) {
    try {
      await prisma.notification.updateMany({
        where: {
          userId: userId,
          read: false
        },
        data: {
          read: true,
          readAt: new Date()
        }
      });

      // Limpar cache
      const cacheKey = `notifications:${userId}`;
      await redis.del(cacheKey);

      return { success: true };
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
      throw error;
    }
  }

  // Contar não lidas
  async getUnreadCount(userId) {
    try {
      const count = await prisma.notification.count({
        where: {
          userId: userId,
          read: false
        }
      });

      return count;
    } catch (error) {
      console.error('Erro ao contar não lidas:', error);
      throw error;
    }
  }

  // Configurações de notificação
  async updateSettings(userId, settings) {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          notificationSettings: settings
        },
        select: {
          id: true,
          notificationSettings: true
        }
      });

      return user.notificationSettings;
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
      throw error;
    }
  }

  // Obter configurações
  async getSettings(userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          notificationSettings: true
        }
      });

      return user?.notificationSettings || {
        enabled: true,
        email: true,
        sms: false,
        push: true,
        types: {
          BOOKING: true,
          PAYMENT: true,
          SHIELD: true,
          CHAT: true,
          SYSTEM: true,
          MARKETING: false
        }
      };
    } catch (error) {
      console.error('Erro ao obter configurações:', error);
      throw error;
    }
  }

  // Processar notificações agendadas
  async processScheduledNotifications() {
    try {
      const now = new Date();
      
      const scheduled = await prisma.notification.findMany({
        where: {
          status: 'PENDING',
          scheduledFor: {
            lte: now
          }
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              notificationSettings: true
            }
          }
        },
        take: 100 // Processar até 100 por vez
      });

      for (const notification of scheduled) {
        await this.processNotification(notification);
      }

      console.log(`Processadas ${scheduled.length} notificações agendadas`);
      return scheduled.length;
    } catch (error) {
      console.error('Erro ao processar notificações agendadas:', error);
      throw error;
    }
  }

  // Limpar notificações antigas
  async cleanupOldNotifications() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const deleted = await prisma.notification.deleteMany({
        where: {
          createdAt: {
            lt: thirtyDaysAgo
          },
          read: true
        }
      });

      console.log(`Removidas ${deleted.count} notificações antigas`);
      return deleted.count;
    } catch (error) {
      console.error('Erro ao limpar notificações antigas:', error);
      throw error;
    }
  }

  // Analytics de notificações
  async getAnalytics(period = '7d') {
    try {
      const startDate = new Date();
      
      switch (period) {
        case '24h':
          startDate.setHours(startDate.getHours() - 24);
          break;
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(startDate.getDate() - 90);
          break;
      }

      const [total, sent, failed, pending, byType, byChannel] = await Promise.all([
        // Total de notificações
        prisma.notification.count({
          where: {
            createdAt: { gte: startDate }
          }
        }),
        
        // Enviadas com sucesso
        prisma.notification.count({
          where: {
            createdAt: { gte: startDate },
            status: 'SENT'
          }
        }),
        
        // Falhadas
        prisma.notification.count({
          where: {
            createdAt: { gte: startDate },
            status: 'FAILED'
          }
        }),
        
        // Pendentes
        prisma.notification.count({
          where: {
            createdAt: { gte: startDate },
            status: 'PENDING'
          }
        }),
        
        // Por tipo
        prisma.notification.groupBy({
          by: ['type'],
          where: {
            createdAt: { gte: startDate }
          },
          _count: true
        }),
        
        // Por canal (simulado)
        prisma.notification.findMany({
          where: {
            createdAt: { gte: startDate }
          },
          select: {
            channels: true
          }
        })
      ]);

      // Processar canais
      const channelStats = {};
      byChannel.forEach(notification => {
        notification.channels.forEach(channel => {
          channelStats[channel] = (channelStats[channel] || 0) + 1;
        });
      });

      return {
        period,
        total,
        sent,
        failed,
        pending,
        successRate: total > 0 ? ((sent / total) * 100).toFixed(2) : 0,
        byType: byType.reduce((acc, item) => {
          acc[item.type] = item._count;
          return acc;
        }, {}),
        byChannel: channelStats
      };
    } catch (error) {
      console.error('Erro ao obter analytics:', error);
      throw error;
    }
  }
}

module.exports = new NotificationService();

