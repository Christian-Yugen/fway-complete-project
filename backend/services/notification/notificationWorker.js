const cron = require('node-cron');
const notificationService = require('./notificationService');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class NotificationWorker {
  constructor() {
    this.isRunning = false;
    this.jobs = new Map();
  }

  // Iniciar worker
  start() {
    if (this.isRunning) {
      console.log('⚠️ Notification Worker already running');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Starting Notification Worker...');

    // Processar notificações agendadas a cada minuto
    this.jobs.set('scheduled', cron.schedule('* * * * *', async () => {
      await this.processScheduledNotifications();
    }, {
      scheduled: false
    }));

    // Limpar notificações antigas diariamente às 2h
    this.jobs.set('cleanup', cron.schedule('0 2 * * *', async () => {
      await this.cleanupOldNotifications();
    }, {
      scheduled: false
    }));

    // Processar fila de notificações a cada 30 segundos
    this.jobs.set('queue', cron.schedule('*/30 * * * * *', async () => {
      await this.processNotificationQueue();
    }, {
      scheduled: false
    }));

    // Gerar relatórios de analytics semanalmente (domingo às 6h)
    this.jobs.set('analytics', cron.schedule('0 6 * * 0', async () => {
      await this.generateAnalyticsReport();
    }, {
      scheduled: false
    }));

    // Verificar saúde dos serviços a cada 5 minutos
    this.jobs.set('health', cron.schedule('*/5 * * * *', async () => {
      await this.checkServicesHealth();
    }, {
      scheduled: false
    }));

    // Iniciar todos os jobs
    this.jobs.forEach((job, name) => {
      job.start();
      console.log(`✅ Job '${name}' started`);
    });

    console.log('✅ Notification Worker started successfully');
  }

  // Parar worker
  stop() {
    if (!this.isRunning) {
      console.log('⚠️ Notification Worker not running');
      return;
    }

    this.isRunning = false;
    console.log('🛑 Stopping Notification Worker...');

    // Parar todos os jobs
    this.jobs.forEach((job, name) => {
      job.stop();
      console.log(`🛑 Job '${name}' stopped`);
    });

    this.jobs.clear();
    console.log('✅ Notification Worker stopped successfully');
  }

  // Processar notificações agendadas
  async processScheduledNotifications() {
    try {
      const processed = await notificationService.processScheduledNotifications();
      
      if (processed > 0) {
        console.log(`📅 Processed ${processed} scheduled notifications`);
      }
    } catch (error) {
      console.error('❌ Error processing scheduled notifications:', error);
    }
  }

  // Limpar notificações antigas
  async cleanupOldNotifications() {
    try {
      const deleted = await notificationService.cleanupOldNotifications();
      console.log(`🗑️ Cleaned up ${deleted} old notifications`);
    } catch (error) {
      console.error('❌ Error cleaning up old notifications:', error);
    }
  }

  // Processar fila de notificações pendentes
  async processNotificationQueue() {
    try {
      // Buscar notificações pendentes que falharam
      const failedNotifications = await prisma.notification.findMany({
        where: {
          status: 'FAILED',
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Últimas 24 horas
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
        take: 50 // Processar até 50 por vez
      });

      for (const notification of failedNotifications) {
        try {
          // Tentar reprocessar
          await notificationService.processNotification(notification);
          console.log(`🔄 Reprocessed failed notification ${notification.id}`);
        } catch (error) {
          console.error(`❌ Failed to reprocess notification ${notification.id}:`, error);
        }
      }

      if (failedNotifications.length > 0) {
        console.log(`🔄 Reprocessed ${failedNotifications.length} failed notifications`);
      }
    } catch (error) {
      console.error('❌ Error processing notification queue:', error);
    }
  }

  // Gerar relatório de analytics
  async generateAnalyticsReport() {
    try {
      console.log('📊 Generating weekly analytics report...');
      
      const analytics = await notificationService.getAnalytics('7d');
      
      // Salvar relatório no banco (opcional)
      await prisma.analyticsReport.create({
        data: {
          type: 'NOTIFICATION_WEEKLY',
          period: '7d',
          data: analytics,
          generatedAt: new Date()
        }
      }).catch(() => {
        // Ignorar erro se tabela não existir
        console.log('📊 Analytics report generated (not saved to DB)');
      });

      // Log do relatório
      console.log('📊 Weekly Notification Analytics:', {
        total: analytics.total,
        sent: analytics.sent,
        failed: analytics.failed,
        successRate: analytics.successRate + '%'
      });

      // Enviar relatório para admins (opcional)
      if (analytics.total > 0) {
        await this.sendAnalyticsToAdmins(analytics);
      }

    } catch (error) {
      console.error('❌ Error generating analytics report:', error);
    }
  }

  // Verificar saúde dos serviços
  async checkServicesHealth() {
    try {
      const smsService = require('./smsService');
      const pushService = require('./pushService');
      const emailService = require('./emailService');

      const health = {
        sms: smsService.isAvailable(),
        push: pushService.isAvailable(),
        email: await emailService.verifyConnection().catch(() => false),
        timestamp: new Date().toISOString()
      };

      // Log apenas se houver mudança no status
      const currentHealth = JSON.stringify(health);
      if (this.lastHealthCheck !== currentHealth) {
        console.log('🏥 Services Health Check:', health);
        this.lastHealthCheck = currentHealth;
      }

      // Alertar se algum serviço estiver indisponível
      const unavailableServices = Object.entries(health)
        .filter(([key, value]) => key !== 'timestamp' && !value)
        .map(([key]) => key);

      if (unavailableServices.length > 0) {
        console.warn(`⚠️ Services unavailable: ${unavailableServices.join(', ')}`);
        
        // Criar notificação para admins
        await this.notifyAdminsServiceDown(unavailableServices);
      }

    } catch (error) {
      console.error('❌ Error checking services health:', error);
    }
  }

  // Enviar analytics para admins
  async sendAnalyticsToAdmins(analytics) {
    try {
      const admins = await prisma.user.findMany({
        where: {
          role: 'ADMIN',
          notificationSettings: {
            path: ['types', 'SYSTEM'],
            equals: true
          }
        },
        select: { id: true }
      });

      for (const admin of admins) {
        await notificationService.createNotification({
          userId: admin.id,
          type: 'SYSTEM_ALERT',
          title: 'Relatório Semanal de Notificações',
          message: `Total: ${analytics.total} | Enviadas: ${analytics.sent} | Taxa de sucesso: ${analytics.successRate}%`,
          data: {
            analytics,
            actionUrl: `${process.env.FRONTEND_URL}/admin/analytics`
          },
          priority: 'LOW',
          channels: ['IN_APP', 'EMAIL']
        });
      }

    } catch (error) {
      console.error('❌ Error sending analytics to admins:', error);
    }
  }

  // Notificar admins sobre serviços indisponíveis
  async notifyAdminsServiceDown(unavailableServices) {
    try {
      const admins = await prisma.user.findMany({
        where: {
          role: 'ADMIN',
          notificationSettings: {
            path: ['types', 'SYSTEM'],
            equals: true
          }
        },
        select: { id: true }
      });

      for (const admin of admins) {
        await notificationService.createNotification({
          userId: admin.id,
          type: 'SYSTEM_ALERT',
          title: 'Serviços de Notificação Indisponíveis',
          message: `Os seguintes serviços estão indisponíveis: ${unavailableServices.join(', ')}`,
          data: {
            services: unavailableServices,
            actionUrl: `${process.env.FRONTEND_URL}/admin/services`
          },
          priority: 'HIGH',
          channels: ['IN_APP', 'EMAIL']
        });
      }

    } catch (error) {
      console.error('❌ Error notifying admins about service down:', error);
    }
  }

  // Agendar notificação personalizada
  scheduleCustomNotification(cronExpression, notificationData) {
    const jobId = `custom_${Date.now()}`;
    
    const job = cron.schedule(cronExpression, async () => {
      try {
        await notificationService.createNotification(notificationData);
        console.log(`📅 Custom notification sent: ${jobId}`);
      } catch (error) {
        console.error(`❌ Error sending custom notification ${jobId}:`, error);
      }
    }, {
      scheduled: false
    });

    this.jobs.set(jobId, job);
    job.start();

    console.log(`📅 Custom notification scheduled: ${jobId}`);
    return jobId;
  }

  // Cancelar job personalizado
  cancelCustomJob(jobId) {
    const job = this.jobs.get(jobId);
    if (job) {
      job.stop();
      this.jobs.delete(jobId);
      console.log(`🛑 Custom job cancelled: ${jobId}`);
      return true;
    }
    return false;
  }

  // Obter status do worker
  getStatus() {
    return {
      isRunning: this.isRunning,
      activeJobs: Array.from(this.jobs.keys()),
      uptime: this.isRunning ? Date.now() - this.startTime : 0
    };
  }

  // Processar notificação imediata
  async processImmediateNotification(notificationData) {
    try {
      const notification = await notificationService.createNotification(notificationData);
      console.log(`⚡ Immediate notification processed: ${notification.id}`);
      return notification;
    } catch (error) {
      console.error('❌ Error processing immediate notification:', error);
      throw error;
    }
  }

  // Agendar lembrete de agendamento
  async scheduleBookingReminder(bookingId, reminderTime) {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          user: true,
          professional: true,
          service: true
        }
      });

      if (!booking) {
        throw new Error('Agendamento não encontrado');
      }

      const reminderDate = new Date(reminderTime);
      
      await notificationService.createNotification({
        userId: booking.userId,
        type: 'BOOKING_REMINDER',
        title: 'Lembrete de Consulta',
        message: `Sua consulta com ${booking.professional.name} é em breve`,
        data: {
          bookingId: booking.id,
          professional: booking.professional.name,
          service: booking.service.name,
          scheduledAt: booking.scheduledAt,
          timeUntil: this.getTimeUntil(booking.scheduledAt),
          actionUrl: `${process.env.FRONTEND_URL}/my-bookings/${booking.id}`
        },
        priority: 'MEDIUM',
        channels: ['IN_APP', 'PUSH', 'SMS'],
        scheduledFor: reminderDate
      });

      console.log(`📅 Booking reminder scheduled for ${reminderDate}`);
    } catch (error) {
      console.error('❌ Error scheduling booking reminder:', error);
      throw error;
    }
  }

  // Calcular tempo até o agendamento
  getTimeUntil(scheduledAt) {
    const now = new Date();
    const scheduled = new Date(scheduledAt);
    const diffMs = scheduled.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'agora';
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}min`;
    } else {
      return `${diffMinutes} minutos`;
    }
  }
}

// Instância singleton
const notificationWorker = new NotificationWorker();

// Iniciar automaticamente se não estiver em modo de teste
if (process.env.NODE_ENV !== 'test') {
  notificationWorker.start();
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, stopping Notification Worker...');
  notificationWorker.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, stopping Notification Worker...');
  notificationWorker.stop();
  process.exit(0);
});

module.exports = notificationWorker;

