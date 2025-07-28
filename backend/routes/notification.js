const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();
const notificationService = require('../services/notification/notificationService');
const { authenticateToken } = require('../middleware/auth');
const { validateNotificationCreation, validateNotificationUpdate, validateNotificationSettings, validateNotificationSearch } = require('../validators/notification');

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

// Criar notificação (admin/sistema)
router.post('/', validateNotificationCreation, async (req, res, next) => {
  try {
    const notification = await notificationService.createNotification(req.body);
    
    res.status(201).json({
      success: true,
      data: notification,
      message: 'Notificação criada com sucesso'
    });
  } catch (error) {
    next(error);
  }
});

// Listar notificações do usuário
router.get('/', validateNotificationSearch, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      type: req.query.type,
      read: req.query.read !== undefined ? req.query.read === 'true' : undefined,
      priority: req.query.priority
    };

    const result = await notificationService.getUserNotifications(userId, options);
    
    res.json({
      success: true,
      data: result.notifications,
      pagination: result.pagination,
      message: 'Notificações listadas com sucesso'
    });
  } catch (error) {
    next(error);
  }
});

// Contar notificações não lidas
router.get('/unread-count', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const count = await notificationService.getUnreadCount(userId);
    
    res.json({
      success: true,
      data: { count },
      message: 'Contagem de não lidas obtida com sucesso'
    });
  } catch (error) {
    next(error);
  }
});

// Marcar notificação como lida
router.patch('/:id/read', async (req, res, next) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user.id;
    
    const result = await notificationService.markAsRead(notificationId, userId);
    
    res.json({
      success: true,
      data: result,
      message: 'Notificação marcada como lida'
    });
  } catch (error) {
    next(error);
  }
});

// Marcar todas como lidas
router.patch('/read-all', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await notificationService.markAllAsRead(userId);
    
    res.json({
      success: true,
      data: result,
      message: 'Todas as notificações marcadas como lidas'
    });
  } catch (error) {
    next(error);
  }
});

// Obter configurações de notificação
router.get('/settings', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const settings = await notificationService.getSettings(userId);
    
    res.json({
      success: true,
      data: settings,
      message: 'Configurações obtidas com sucesso'
    });
  } catch (error) {
    next(error);
  }
});

// Atualizar configurações de notificação
router.put('/settings', validateNotificationSettings, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const settings = await notificationService.updateSettings(userId, req.body);
    
    res.json({
      success: true,
      data: settings,
      message: 'Configurações atualizadas com sucesso'
    });
  } catch (error) {
    next(error);
  }
});

// Analytics de notificações (admin)
router.get('/analytics', async (req, res, next) => {
  try {
    // Verificar se é admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }

    const period = req.query.period || '7d';
    const analytics = await notificationService.getAnalytics(period);
    
    res.json({
      success: true,
      data: analytics,
      message: 'Analytics obtido com sucesso'
    });
  } catch (error) {
    next(error);
  }
});

// Processar notificações agendadas (sistema/cron)
router.post('/process-scheduled', async (req, res, next) => {
  try {
    // Verificar se é admin ou sistema
    if (req.user.role !== 'ADMIN' && req.user.role !== 'SYSTEM') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }

    const processed = await notificationService.processScheduledNotifications();
    
    res.json({
      success: true,
      data: { processed },
      message: `${processed} notificações processadas`
    });
  } catch (error) {
    next(error);
  }
});

// Limpar notificações antigas (sistema/cron)
router.delete('/cleanup', async (req, res, next) => {
  try {
    // Verificar se é admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }

    const deleted = await notificationService.cleanupOldNotifications();
    
    res.json({
      success: true,
      data: { deleted },
      message: `${deleted} notificações antigas removidas`
    });
  } catch (error) {
    next(error);
  }
});

// Obter notificação específica
router.get('/:id', async (req, res, next) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user.id;
    
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId: userId
      },
      select: {
        id: true,
        type: true,
        title: true,
        message: true,
        data: true,
        priority: true,
        channels: true,
        read: true,
        readAt: true,
        createdAt: true,
        scheduledFor: true,
        expiresAt: true
      }
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notificação não encontrada'
      });
    }
    
    res.json({
      success: true,
      data: notification,
      message: 'Notificação obtida com sucesso'
    });
  } catch (error) {
    next(error);
  }
});

// Deletar notificação
router.delete('/:id', async (req, res, next) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user.id;
    
    const deleted = await prisma.notification.deleteMany({
      where: {
        id: notificationId,
        userId: userId
      }
    });

    if (deleted.count === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notificação não encontrada'
      });
    }
    
    res.json({
      success: true,
      message: 'Notificação deletada com sucesso'
    });
  } catch (error) {
    next(error);
  }
});

// Enviar notificação de teste (admin)
router.post('/test', async (req, res, next) => {
  try {
    // Verificar se é admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }

    const testNotification = {
      userId: req.body.userId || req.user.id,
      type: 'SYSTEM_TEST',
      title: 'Notificação de Teste',
      message: 'Esta é uma notificação de teste do sistema Fway.',
      data: {
        test: true,
        timestamp: new Date().toISOString()
      },
      priority: 'LOW',
      channels: req.body.channels || ['IN_APP']
    };

    const notification = await notificationService.createNotification(testNotification);
    
    res.json({
      success: true,
      data: notification,
      message: 'Notificação de teste enviada com sucesso'
    });
  } catch (error) {
    next(error);
  }
});

// Estatísticas rápidas do usuário
router.get('/stats/summary', async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const [total, unread, today] = await Promise.all([
      prisma.notification.count({
        where: { userId }
      }),
      
      prisma.notification.count({
        where: { userId, read: false }
      }),
      
      prisma.notification.count({
        where: {
          userId,
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      })
    ]);
    
    res.json({
      success: true,
      data: {
        total,
        unread,
        today,
        readRate: total > 0 ? (((total - unread) / total) * 100).toFixed(2) : 0
      },
      message: 'Estatísticas obtidas com sucesso'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

