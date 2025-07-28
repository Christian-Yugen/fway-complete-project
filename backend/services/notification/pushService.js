const admin = require('firebase-admin');

class PushService {
  constructor() {
    this.initialized = false;
    this.messaging = null;
    this.init();
  }

  // Inicializar Firebase Admin
  init() {
    try {
      if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        
        if (!admin.apps.length) {
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId: serviceAccount.project_id
          });
        }
        
        this.messaging = admin.messaging();
        this.initialized = true;
        console.log('✅ Push Service (Firebase) initialized successfully');
      } else {
        console.log('⚠️ Push Service not initialized - missing Firebase credentials');
      }
    } catch (error) {
      console.error('❌ Error initializing Push Service:', error);
    }
  }

  // Verificar se o serviço está disponível
  isAvailable() {
    return this.initialized && this.messaging;
  }

  // Enviar push notification para um dispositivo
  async sendToDevice(token, notification, data = {}) {
    try {
      if (!this.isAvailable()) {
        console.log('📱 Push Service not available - simulating send');
        return {
          success: true,
          simulated: true,
          token,
          notification,
          data,
          timestamp: new Date().toISOString()
        };
      }

      const message = {
        token,
        notification: {
          title: notification.title,
          body: notification.body,
          imageUrl: notification.imageUrl
        },
        data: {
          ...data,
          timestamp: new Date().toISOString()
        },
        android: {
          notification: {
            icon: 'ic_notification',
            color: '#3b82f6',
            sound: 'default',
            priority: 'high',
            channelId: 'fway_notifications'
          },
          data: {
            click_action: 'FLUTTER_NOTIFICATION_CLICK'
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
              'content-available': 1
            }
          }
        },
        webpush: {
          notification: {
            icon: '/icons/icon-192x192.png',
            badge: '/icons/badge-72x72.png',
            vibrate: [200, 100, 200],
            requireInteraction: true,
            actions: [
              {
                action: 'view',
                title: 'Ver',
                icon: '/icons/view-icon.png'
              },
              {
                action: 'dismiss',
                title: 'Dispensar',
                icon: '/icons/dismiss-icon.png'
              }
            ]
          },
          fcmOptions: {
            link: data.actionUrl || process.env.FRONTEND_URL
          }
        }
      };

      const response = await this.messaging.send(message);
      
      console.log(`✅ Push notification sent successfully: ${response}`);
      
      return {
        success: true,
        messageId: response,
        token,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Error sending push notification:', error);
      
      // Se o token é inválido, retornar erro específico
      if (error.code === 'messaging/registration-token-not-registered') {
        return {
          success: false,
          error: 'INVALID_TOKEN',
          message: 'Token de registro inválido ou expirado'
        };
      }
      
      throw error;
    }
  }

  // Enviar push notification para múltiplos dispositivos
  async sendToMultipleDevices(tokens, notification, data = {}) {
    try {
      if (!this.isAvailable()) {
        console.log('📱 Push Service not available - simulating multicast send');
        return {
          success: true,
          simulated: true,
          tokens,
          notification,
          data,
          timestamp: new Date().toISOString()
        };
      }

      const message = {
        tokens,
        notification: {
          title: notification.title,
          body: notification.body,
          imageUrl: notification.imageUrl
        },
        data: {
          ...data,
          timestamp: new Date().toISOString()
        },
        android: {
          notification: {
            icon: 'ic_notification',
            color: '#3b82f6',
            sound: 'default',
            priority: 'high',
            channelId: 'fway_notifications'
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1
            }
          }
        },
        webpush: {
          notification: {
            icon: '/icons/icon-192x192.png',
            badge: '/icons/badge-72x72.png'
          }
        }
      };

      const response = await this.messaging.sendMulticast(message);
      
      console.log(`✅ Multicast push notification sent: ${response.successCount}/${tokens.length} successful`);
      
      // Processar tokens inválidos
      const invalidTokens = [];
      if (response.failureCount > 0) {
        response.responses.forEach((resp, idx) => {
          if (!resp.success && resp.error?.code === 'messaging/registration-token-not-registered') {
            invalidTokens.push(tokens[idx]);
          }
        });
      }
      
      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount,
        invalidTokens,
        responses: response.responses,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Error sending multicast push notification:', error);
      throw error;
    }
  }

  // Enviar para tópico
  async sendToTopic(topic, notification, data = {}) {
    try {
      if (!this.isAvailable()) {
        console.log('📱 Push Service not available - simulating topic send');
        return {
          success: true,
          simulated: true,
          topic,
          notification,
          data,
          timestamp: new Date().toISOString()
        };
      }

      const message = {
        topic,
        notification: {
          title: notification.title,
          body: notification.body,
          imageUrl: notification.imageUrl
        },
        data: {
          ...data,
          timestamp: new Date().toISOString()
        },
        android: {
          notification: {
            icon: 'ic_notification',
            color: '#3b82f6',
            sound: 'default',
            priority: 'high',
            channelId: 'fway_notifications'
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1
            }
          }
        }
      };

      const response = await this.messaging.send(message);
      
      console.log(`✅ Topic push notification sent: ${response}`);
      
      return {
        success: true,
        messageId: response,
        topic,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Error sending topic push notification:', error);
      throw error;
    }
  }

  // Inscrever dispositivo em tópico
  async subscribeToTopic(tokens, topic) {
    try {
      if (!this.isAvailable()) {
        console.log('📱 Push Service not available - simulating topic subscription');
        return {
          success: true,
          simulated: true,
          tokens,
          topic,
          timestamp: new Date().toISOString()
        };
      }

      const response = await this.messaging.subscribeToTopic(tokens, topic);
      
      console.log(`✅ Subscribed to topic ${topic}: ${response.successCount}/${tokens.length} successful`);
      
      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount,
        errors: response.errors,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Error subscribing to topic:', error);
      throw error;
    }
  }

  // Desinscrever dispositivo de tópico
  async unsubscribeFromTopic(tokens, topic) {
    try {
      if (!this.isAvailable()) {
        console.log('📱 Push Service not available - simulating topic unsubscription');
        return {
          success: true,
          simulated: true,
          tokens,
          topic,
          timestamp: new Date().toISOString()
        };
      }

      const response = await this.messaging.unsubscribeFromTopic(tokens, topic);
      
      console.log(`✅ Unsubscribed from topic ${topic}: ${response.successCount}/${tokens.length} successful`);
      
      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount,
        errors: response.errors,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Error unsubscribing from topic:', error);
      throw error;
    }
  }

  // Validar token de registro
  async validateToken(token) {
    try {
      if (!this.isAvailable()) {
        return { valid: true, simulated: true };
      }

      // Tentar enviar uma mensagem de teste (dry run)
      const message = {
        token,
        notification: {
          title: 'Test',
          body: 'Test'
        },
        dryRun: true
      };

      await this.messaging.send(message);
      
      return { valid: true };

    } catch (error) {
      if (error.code === 'messaging/registration-token-not-registered') {
        return { valid: false, reason: 'Token não registrado ou expirado' };
      }
      
      return { valid: false, reason: error.message };
    }
  }

  // Obter templates de push notification por tipo
  getPushTemplate(type, data = {}) {
    const templates = {
      BOOKING_CREATED: {
        title: '📅 Agendamento Criado',
        body: `Seu agendamento com ${data.professional} foi criado para ${data.date}`,
        imageUrl: null
      },
      
      BOOKING_CONFIRMED: {
        title: '✅ Agendamento Confirmado',
        body: `${data.professional} confirmou seu agendamento para ${data.date}`,
        imageUrl: null
      },
      
      BOOKING_CANCELLED: {
        title: '❌ Agendamento Cancelado',
        body: `Seu agendamento com ${data.professional} foi cancelado`,
        imageUrl: null
      },
      
      BOOKING_REMINDER: {
        title: '⏰ Lembrete de Consulta',
        body: `Sua consulta com ${data.professional} é em ${data.timeUntil}`,
        imageUrl: null
      },
      
      PAYMENT_RECEIVED: {
        title: '💳 Pagamento Confirmado',
        body: `Pagamento de ${data.amount} confirmado para ${data.service}`,
        imageUrl: null
      },
      
      PAYMENT_FAILED: {
        title: '❌ Falha no Pagamento',
        body: `Não foi possível processar o pagamento de ${data.amount}`,
        imageUrl: null
      },
      
      SHIELD_CLAIM_APPROVED: {
        title: '🛡️ Solicitação Aprovada',
        body: `Sua solicitação Fway Shield foi aprovada! Valor: ${data.amount}`,
        imageUrl: null
      },
      
      SHIELD_CLAIM_REJECTED: {
        title: '🛡️ Solicitação Rejeitada',
        body: `Sua solicitação Fway Shield foi rejeitada. Veja os detalhes.`,
        imageUrl: null
      },
      
      CHAT_MESSAGE: {
        title: `💬 ${data.senderName}`,
        body: data.message,
        imageUrl: data.senderAvatar
      },
      
      CHAT_NEW_CONVERSATION: {
        title: '💬 Nova Conversa',
        body: `${data.senderName} iniciou uma conversa com você`,
        imageUrl: data.senderAvatar
      },
      
      SYSTEM_ALERT: {
        title: '🔔 Alerta do Sistema',
        body: data.message,
        imageUrl: null
      },
      
      SYSTEM_MAINTENANCE: {
        title: '🔧 Manutenção Programada',
        body: `Sistema em manutenção: ${data.startTime} - ${data.endTime}`,
        imageUrl: null
      },
      
      MARKETING_PROMOTION: {
        title: `🎉 ${data.title}`,
        body: data.description,
        imageUrl: data.imageUrl
      },
      
      SECURITY_LOGIN: {
        title: '🔐 Novo Login Detectado',
        body: `Login realizado em ${data.device} às ${data.time}`,
        imageUrl: null
      },
      
      AI_ANALYSIS_COMPLETE: {
        title: '🤖 Análise IA Concluída',
        body: `Sua análise de ${data.type} está pronta para visualização`,
        imageUrl: null
      },
      
      PROFESSIONAL_VERIFIED: {
        title: '✅ Profissional Verificado',
        body: `${data.professionalName} foi verificado e está disponível`,
        imageUrl: data.professionalAvatar
      },
      
      REVIEW_REQUEST: {
        title: '⭐ Avalie seu Atendimento',
        body: `Como foi sua experiência com ${data.professional}?`,
        imageUrl: null
      }
    };

    return templates[type] || {
      title: 'Fway',
      body: data.message || 'Você tem uma nova notificação',
      imageUrl: null
    };
  }

  // Criar dados personalizados para push
  createPushData(type, data = {}) {
    const baseData = {
      type,
      timestamp: new Date().toISOString(),
      actionUrl: data.actionUrl || process.env.FRONTEND_URL
    };

    switch (type) {
      case 'BOOKING_CREATED':
      case 'BOOKING_CONFIRMED':
      case 'BOOKING_CANCELLED':
      case 'BOOKING_REMINDER':
        return {
          ...baseData,
          bookingId: data.bookingId,
          professionalId: data.professionalId,
          actionUrl: `${process.env.FRONTEND_URL}/my-bookings/${data.bookingId}`
        };

      case 'PAYMENT_RECEIVED':
      case 'PAYMENT_FAILED':
        return {
          ...baseData,
          paymentId: data.paymentId,
          amount: data.amount,
          actionUrl: `${process.env.FRONTEND_URL}/payments/${data.paymentId}`
        };

      case 'SHIELD_CLAIM_APPROVED':
      case 'SHIELD_CLAIM_REJECTED':
        return {
          ...baseData,
          claimId: data.claimId,
          actionUrl: `${process.env.FRONTEND_URL}/shield/claims/${data.claimId}`
        };

      case 'CHAT_MESSAGE':
      case 'CHAT_NEW_CONVERSATION':
        return {
          ...baseData,
          conversationId: data.conversationId,
          senderId: data.senderId,
          actionUrl: `${process.env.FRONTEND_URL}/chat/${data.conversationId}`
        };

      default:
        return baseData;
    }
  }

  // Enviar notificação de agendamento
  async sendBookingNotification(userToken, type, bookingData) {
    const template = this.getPushTemplate(type, bookingData);
    const data = this.createPushData(type, bookingData);
    
    return await this.sendToDevice(userToken, template, data);
  }

  // Enviar notificação de pagamento
  async sendPaymentNotification(userToken, type, paymentData) {
    const template = this.getPushTemplate(type, paymentData);
    const data = this.createPushData(type, paymentData);
    
    return await this.sendToDevice(userToken, template, data);
  }

  // Enviar notificação de chat
  async sendChatNotification(userToken, type, chatData) {
    const template = this.getPushTemplate(type, chatData);
    const data = this.createPushData(type, chatData);
    
    return await this.sendToDevice(userToken, template, data);
  }

  // Enviar notificação promocional
  async sendPromotionalNotification(topic, promoData) {
    const template = this.getPushTemplate('MARKETING_PROMOTION', promoData);
    const data = this.createPushData('MARKETING_PROMOTION', promoData);
    
    return await this.sendToTopic(topic, template, data);
  }
}

module.exports = new PushService();

