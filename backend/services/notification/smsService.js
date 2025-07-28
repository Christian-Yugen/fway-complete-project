const twilio = require('twilio');

class SMSService {
  constructor() {
    this.client = null;
    this.initialized = false;
    this.init();
  }

  // Inicializar cliente Twilio
  init() {
    try {
      if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
        this.client = twilio(
          process.env.TWILIO_ACCOUNT_SID,
          process.env.TWILIO_AUTH_TOKEN
        );
        this.initialized = true;
        console.log('✅ SMS Service (Twilio) initialized successfully');
      } else {
        console.log('⚠️ SMS Service not initialized - missing Twilio credentials');
      }
    } catch (error) {
      console.error('❌ Error initializing SMS Service:', error);
    }
  }

  // Verificar se o serviço está disponível
  isAvailable() {
    return this.initialized && this.client;
  }

  // Formatar número de telefone brasileiro
  formatPhoneNumber(phone) {
    // Remove todos os caracteres não numéricos
    const cleaned = phone.replace(/\D/g, '');
    
    // Se tem 11 dígitos e começa com 11-99, adiciona +55
    if (cleaned.length === 11 && cleaned.startsWith('11')) {
      return `+55${cleaned}`;
    }
    
    // Se tem 10 dígitos, adiciona 9 e +55 (celular antigo)
    if (cleaned.length === 10) {
      return `+55${cleaned.substring(0, 2)}9${cleaned.substring(2)}`;
    }
    
    // Se já tem código do país
    if (cleaned.startsWith('55') && cleaned.length === 13) {
      return `+${cleaned}`;
    }
    
    // Retorna como está se não conseguir formatar
    return phone;
  }

  // Validar número de telefone
  isValidPhoneNumber(phone) {
    const cleaned = phone.replace(/\D/g, '');
    
    // Números brasileiros: 10, 11 ou 13 dígitos (com código do país)
    return cleaned.length >= 10 && cleaned.length <= 13;
  }

  // Enviar SMS simples
  async sendSMS(to, message) {
    try {
      if (!this.isAvailable()) {
        console.log('📱 SMS Service not available - simulating send');
        return {
          success: true,
          simulated: true,
          to,
          message,
          timestamp: new Date().toISOString()
        };
      }

      // Validar número
      if (!this.isValidPhoneNumber(to)) {
        throw new Error('Número de telefone inválido');
      }

      // Formatar número
      const formattedPhone = this.formatPhoneNumber(to);

      // Enviar SMS
      const result = await this.client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: formattedPhone
      });

      console.log(`✅ SMS sent successfully to ${formattedPhone}`);
      
      return {
        success: true,
        messageId: result.sid,
        to: formattedPhone,
        status: result.status,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Error sending SMS:', error);
      throw error;
    }
  }

  // Enviar SMS de verificação
  async sendVerificationSMS(phone, code) {
    const message = `Seu código de verificação Fway é: ${code}. Válido por 10 minutos. Não compartilhe este código.`;
    
    return await this.sendSMS(phone, message);
  }

  // Enviar SMS de agendamento
  async sendBookingReminderSMS(phone, bookingDetails) {
    const { professional, service, scheduledAt } = bookingDetails;
    const date = new Date(scheduledAt).toLocaleDateString('pt-BR');
    const time = new Date(scheduledAt).toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    const message = `🏥 Fway - Lembrete: Você tem consulta com ${professional} (${service}) em ${date} às ${time}. Para reagendar: fway.com`;
    
    return await this.sendSMS(phone, message);
  }

  // Enviar SMS de confirmação de agendamento
  async sendBookingConfirmationSMS(phone, bookingDetails) {
    const { professional, service, scheduledAt } = bookingDetails;
    const date = new Date(scheduledAt).toLocaleDateString('pt-BR');
    const time = new Date(scheduledAt).toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    const message = `✅ Fway - Agendamento confirmado! ${professional} - ${service} em ${date} às ${time}. Acesse: fway.com`;
    
    return await this.sendSMS(phone, message);
  }

  // Enviar SMS de cancelamento
  async sendBookingCancellationSMS(phone, bookingDetails) {
    const { professional, service, scheduledAt } = bookingDetails;
    const date = new Date(scheduledAt).toLocaleDateString('pt-BR');

    const message = `❌ Fway - Agendamento cancelado: ${professional} - ${service} em ${date}. Para reagendar: fway.com`;
    
    return await this.sendSMS(phone, message);
  }

  // Enviar SMS de pagamento
  async sendPaymentConfirmationSMS(phone, paymentDetails) {
    const { amount, service } = paymentDetails;
    const formattedAmount = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);

    const message = `💳 Fway - Pagamento confirmado! ${formattedAmount} para ${service}. Recibo disponível no app.`;
    
    return await this.sendSMS(phone, message);
  }

  // Enviar SMS de segurança
  async sendSecurityAlertSMS(phone, alertDetails) {
    const { type, timestamp } = alertDetails;
    const time = new Date(timestamp).toLocaleString('pt-BR');

    let message = '';
    
    switch (type) {
      case 'LOGIN':
        message = `🔐 Fway - Novo login detectado em ${time}. Se não foi você, altere sua senha imediatamente.`;
        break;
      case 'PASSWORD_CHANGE':
        message = `🔑 Fway - Senha alterada com sucesso em ${time}. Se não foi você, entre em contato conosco.`;
        break;
      case 'SUSPICIOUS_ACTIVITY':
        message = `⚠️ Fway - Atividade suspeita detectada. Sua conta foi temporariamente bloqueada. Contate o suporte.`;
        break;
      default:
        message = `🔒 Fway - Alerta de segurança. Verifique sua conta em fway.com`;
    }
    
    return await this.sendSMS(phone, message);
  }

  // Enviar SMS promocional
  async sendPromotionalSMS(phone, promoDetails) {
    const { title, discount, validUntil } = promoDetails;
    const date = new Date(validUntil).toLocaleDateString('pt-BR');

    const message = `🎉 Fway - ${title}! ${discount}% de desconto até ${date}. Use no app: fway.com`;
    
    return await this.sendSMS(phone, message);
  }

  // Obter status de entrega
  async getDeliveryStatus(messageId) {
    try {
      if (!this.isAvailable()) {
        return {
          success: true,
          simulated: true,
          status: 'delivered'
        };
      }

      const message = await this.client.messages(messageId).fetch();
      
      return {
        success: true,
        messageId: message.sid,
        status: message.status,
        errorCode: message.errorCode,
        errorMessage: message.errorMessage,
        dateCreated: message.dateCreated,
        dateSent: message.dateSent,
        dateUpdated: message.dateUpdated
      };

    } catch (error) {
      console.error('❌ Error getting delivery status:', error);
      throw error;
    }
  }

  // Listar mensagens enviadas
  async getMessageHistory(limit = 20, dateAfter = null) {
    try {
      if (!this.isAvailable()) {
        return {
          success: true,
          simulated: true,
          messages: []
        };
      }

      const options = { limit };
      if (dateAfter) {
        options.dateSentAfter = new Date(dateAfter);
      }

      const messages = await this.client.messages.list(options);
      
      return {
        success: true,
        messages: messages.map(msg => ({
          messageId: msg.sid,
          to: msg.to,
          from: msg.from,
          body: msg.body,
          status: msg.status,
          direction: msg.direction,
          errorCode: msg.errorCode,
          errorMessage: msg.errorMessage,
          dateCreated: msg.dateCreated,
          dateSent: msg.dateSent,
          dateUpdated: msg.dateUpdated
        }))
      };

    } catch (error) {
      console.error('❌ Error getting message history:', error);
      throw error;
    }
  }

  // Verificar saldo da conta
  async getAccountBalance() {
    try {
      if (!this.isAvailable()) {
        return {
          success: true,
          simulated: true,
          balance: 'N/A'
        };
      }

      const account = await this.client.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
      
      return {
        success: true,
        accountSid: account.sid,
        friendlyName: account.friendlyName,
        status: account.status,
        type: account.type
      };

    } catch (error) {
      console.error('❌ Error getting account balance:', error);
      throw error;
    }
  }

  // Validar webhook do Twilio
  validateWebhook(url, params, signature) {
    try {
      if (!this.isAvailable()) {
        return true; // Simular validação
      }

      return twilio.validateRequest(
        process.env.TWILIO_AUTH_TOKEN,
        signature,
        url,
        params
      );

    } catch (error) {
      console.error('❌ Error validating webhook:', error);
      return false;
    }
  }

  // Processar webhook de status
  processStatusWebhook(webhookData) {
    const {
      MessageSid: messageId,
      MessageStatus: status,
      To: to,
      From: from,
      ErrorCode: errorCode,
      ErrorMessage: errorMessage
    } = webhookData;

    console.log(`📱 SMS Status Update: ${messageId} -> ${status}`);

    return {
      messageId,
      status,
      to,
      from,
      errorCode,
      errorMessage,
      timestamp: new Date().toISOString()
    };
  }

  // Obter templates de SMS por tipo
  getSMSTemplate(type, data = {}) {
    const templates = {
      VERIFICATION: (code) => 
        `Seu código de verificação Fway é: ${code}. Válido por 10 minutos. Não compartilhe este código.`,
      
      BOOKING_REMINDER: ({ professional, service, date, time }) =>
        `🏥 Fway - Lembrete: Você tem consulta com ${professional} (${service}) em ${date} às ${time}. Para reagendar: fway.com`,
      
      BOOKING_CONFIRMATION: ({ professional, service, date, time }) =>
        `✅ Fway - Agendamento confirmado! ${professional} - ${service} em ${date} às ${time}. Acesse: fway.com`,
      
      BOOKING_CANCELLATION: ({ professional, service, date }) =>
        `❌ Fway - Agendamento cancelado: ${professional} - ${service} em ${date}. Para reagendar: fway.com`,
      
      PAYMENT_CONFIRMATION: ({ amount, service }) =>
        `💳 Fway - Pagamento confirmado! ${amount} para ${service}. Recibo disponível no app.`,
      
      SECURITY_LOGIN: ({ time }) =>
        `🔐 Fway - Novo login detectado em ${time}. Se não foi você, altere sua senha imediatamente.`,
      
      SECURITY_PASSWORD: ({ time }) =>
        `🔑 Fway - Senha alterada com sucesso em ${time}. Se não foi você, entre em contato conosco.`,
      
      PROMOTIONAL: ({ title, discount, date }) =>
        `🎉 Fway - ${title}! ${discount}% de desconto até ${date}. Use no app: fway.com`,
      
      SHIELD_CLAIM: ({ claimId, status }) =>
        `🛡️ Fway Shield - Solicitação ${claimId} ${status}. Detalhes no app: fway.com`
    };

    const template = templates[type];
    return template ? template(data) : null;
  }
}

module.exports = new SMSService();

