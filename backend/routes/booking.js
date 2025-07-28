const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { authenticateToken, requireProfessional, requireAdmin, optionalAuth } = require('../middleware/auth');
const { cache } = require('../config/redis');
const bookingValidators = require('../validators/booking');
const { sendEmail } = require('../services/notification/emailService');
const { createNotification } = require('../services/notification/notificationService');

const router = express.Router();
const prisma = new PrismaClient();

// @route   POST /api/bookings
// @desc    Criar agendamento
// @access  Private
router.post('/', authenticateToken, bookingValidators.validateBookingCreation, asyncHandler(async (req, res) => {
  const {
    professionalId,
    serviceId,
    scheduledAt,
    duration,
    type,
    location,
    notes,
    emergencyContact
  } = req.body;

  // Verificar se o profissional existe e está disponível
  const professional = await prisma.professional.findUnique({
    where: { id: professionalId },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true
        }
      }
    }
  });

  if (!professional) {
    throw new AppError('Profissional não encontrado', 404);
  }

  if (!professional.isVerified || !professional.isAvailable) {
    throw new AppError('Profissional não disponível para agendamentos', 400);
  }

  // Verificar se o serviço existe e pertence ao profissional
  const service = await prisma.service.findFirst({
    where: {
      id: serviceId,
      professionalId,
      isActive: true
    }
  });

  if (!service) {
    throw new AppError('Serviço não encontrado ou não disponível', 404);
  }

  // Verificar disponibilidade do horário
  const scheduledDate = new Date(scheduledAt);
  const endTime = new Date(scheduledDate.getTime() + (duration || service.duration) * 60000);

  const conflictingBooking = await prisma.booking.findFirst({
    where: {
      professionalId,
      status: {
        in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS']
      },
      OR: [
        {
          AND: [
            { scheduledAt: { lte: scheduledDate } },
            { 
              scheduledAt: { 
                gte: new Date(scheduledDate.getTime() - service.duration * 60000) 
              } 
            }
          ]
        },
        {
          AND: [
            { scheduledAt: { gte: scheduledDate } },
            { scheduledAt: { lt: endTime } }
          ]
        }
      ]
    }
  });

  if (conflictingBooking) {
    throw new AppError('Horário não disponível', 400);
  }

  // Verificar se não é agendamento no passado
  if (scheduledDate <= new Date()) {
    throw new AppError('Não é possível agendar para o passado', 400);
  }

  // Calcular preço total
  const totalAmount = service.price;

  // Criar agendamento
  const booking = await prisma.booking.create({
    data: {
      userId: req.user.id,
      professionalId,
      serviceId,
      scheduledAt: scheduledDate,
      duration: duration || service.duration,
      type,
      location,
      notes,
      emergencyContact,
      totalAmount,
      status: 'PENDING'
    },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          phone: true
        }
      },
      professional: {
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      },
      service: {
        select: {
          name: true,
          category: true,
          duration: true,
          price: true
        }
      }
    }
  });

  // Enviar notificações
  await Promise.all([
    // Notificação para o usuário
    createNotification({
      userId: req.user.id,
      type: 'BOOKING_CREATED',
      title: 'Agendamento Criado',
      message: `Seu agendamento com ${professional.user.firstName} ${professional.user.lastName} foi criado e está aguardando confirmação.`,
      data: { bookingId: booking.id }
    }),

    // Notificação para o profissional
    createNotification({
      userId: professional.userId,
      type: 'NEW_BOOKING',
      title: 'Novo Agendamento',
      message: `${booking.user.firstName} ${booking.user.lastName} solicitou um agendamento para ${service.name}.`,
      data: { bookingId: booking.id },
      priority: 'HIGH'
    }),

    // Email para o usuário
    sendEmail({
      to: booking.user.email,
      subject: 'Agendamento Criado - Fway',
      template: 'booking-created',
      data: {
        userName: `${booking.user.firstName} ${booking.user.lastName}`,
        professionalName: `${professional.user.firstName} ${professional.user.lastName}`,
        serviceName: service.name,
        scheduledAt: scheduledDate,
        bookingId: booking.id
      }
    }),

    // Email para o profissional
    sendEmail({
      to: professional.user.email,
      subject: 'Novo Agendamento - Fway',
      template: 'new-booking-professional',
      data: {
        professionalName: `${professional.user.firstName} ${professional.user.lastName}`,
        userName: `${booking.user.firstName} ${booking.user.lastName}`,
        serviceName: service.name,
        scheduledAt: scheduledDate,
        bookingId: booking.id
      }
    })
  ]);

  res.status(201).json({
    success: true,
    message: 'Agendamento criado com sucesso',
    data: { booking }
  });
}));

// @route   GET /api/bookings
// @desc    Listar agendamentos do usuário
// @access  Private
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
  const { 
    status, 
    type, 
    startDate, 
    endDate, 
    page = 1, 
    limit = 20,
    sortBy = 'scheduledAt',
    sortOrder = 'desc'
  } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = {
    userId: req.user.id,
    ...(status && { status }),
    ...(type && { type }),
    ...(startDate && endDate && {
      scheduledAt: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    })
  };

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      include: {
        professional: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          }
        },
        service: {
          select: {
            name: true,
            category: true,
            duration: true
          }
        },
        payment: {
          select: {
            id: true,
            amount: true,
            status: true,
            method: true,
            paidAt: true
          }
        },
        review: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true
          }
        }
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: parseInt(limit)
    }),
    prisma.booking.count({ where })
  ]);

  res.json({
    success: true,
    data: {
      bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  });
}));

// @route   GET /api/bookings/:id
// @desc    Obter agendamento específico
// @access  Private
router.get('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params;

  const booking = await prisma.booking.findFirst({
    where: {
      id,
      OR: [
        { userId: req.user.id },
        { professional: { userId: req.user.id } }
      ]
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          avatar: true
        }
      },
      professional: {
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              avatar: true
            }
          }
        }
      },
      service: true,
      payment: true,
      review: {
        include: {
          reviewer: {
            select: {
              firstName: true,
              lastName: true,
              avatar: true
            }
          }
        }
      },
      messages: {
        include: {
          sender: {
            select: {
              firstName: true,
              lastName: true,
              avatar: true
            }
          }
        },
        orderBy: { createdAt: 'asc' },
        take: 50
      }
    }
  });

  if (!booking) {
    throw new AppError('Agendamento não encontrado', 404);
  }

  res.json({
    success: true,
    data: { booking }
  });
}));

// @route   PUT /api/bookings/:id/status
// @desc    Atualizar status do agendamento
// @access  Private
router.put('/:id/status', authenticateToken, bookingValidators.validateStatusUpdate, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, reason } = req.body;

  // Buscar agendamento
  const booking = await prisma.booking.findFirst({
    where: {
      id,
      OR: [
        { userId: req.user.id },
        { professional: { userId: req.user.id } }
      ]
    },
    include: {
      user: true,
      professional: {
        include: { user: true }
      },
      service: true
    }
  });

  if (!booking) {
    throw new AppError('Agendamento não encontrado', 404);
  }

  // Validar transições de status
  const allowedTransitions = {
    PENDING: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['IN_PROGRESS', 'CANCELLED'],
    IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
    COMPLETED: [],
    CANCELLED: []
  };

  if (!allowedTransitions[booking.status].includes(status)) {
    throw new AppError(`Não é possível alterar status de ${booking.status} para ${status}`, 400);
  }

  // Verificar permissões
  const isProfessional = booking.professional.userId === req.user.id;
  const isUser = booking.userId === req.user.id;

  if (status === 'CONFIRMED' && !isProfessional) {
    throw new AppError('Apenas o profissional pode confirmar o agendamento', 403);
  }

  if (status === 'IN_PROGRESS' && !isProfessional) {
    throw new AppError('Apenas o profissional pode iniciar o atendimento', 403);
  }

  if (status === 'COMPLETED' && !isProfessional) {
    throw new AppError('Apenas o profissional pode finalizar o atendimento', 403);
  }

  // Atualizar status
  const updatedBooking = await prisma.booking.update({
    where: { id },
    data: {
      status,
      ...(status === 'CONFIRMED' && { confirmedAt: new Date() }),
      ...(status === 'IN_PROGRESS' && { startedAt: new Date() }),
      ...(status === 'COMPLETED' && { completedAt: new Date() }),
      ...(status === 'CANCELLED' && { 
        cancelledAt: new Date(),
        cancellationReason: reason
      })
    },
    include: {
      user: true,
      professional: {
        include: { user: true }
      },
      service: true
    }
  });

  // Criar notificações baseadas no status
  const notifications = [];
  
  if (status === 'CONFIRMED') {
    notifications.push(
      createNotification({
        userId: booking.userId,
        type: 'BOOKING_CONFIRMED',
        title: 'Agendamento Confirmado',
        message: `Seu agendamento com ${booking.professional.user.firstName} foi confirmado!`,
        data: { bookingId: booking.id },
        priority: 'HIGH'
      })
    );
  }

  if (status === 'CANCELLED') {
    const notificationUserId = isProfessional ? booking.userId : booking.professional.userId;
    const cancelledBy = isProfessional ? 'profissional' : 'paciente';
    
    notifications.push(
      createNotification({
        userId: notificationUserId,
        type: 'BOOKING_CANCELLED',
        title: 'Agendamento Cancelado',
        message: `Seu agendamento foi cancelado pelo ${cancelledBy}. ${reason ? `Motivo: ${reason}` : ''}`,
        data: { bookingId: booking.id },
        priority: 'HIGH'
      })
    );
  }

  if (status === 'COMPLETED') {
    notifications.push(
      createNotification({
        userId: booking.userId,
        type: 'BOOKING_COMPLETED',
        title: 'Atendimento Finalizado',
        message: 'Seu atendimento foi finalizado. Que tal avaliar o profissional?',
        data: { bookingId: booking.id }
      })
    );
  }

  await Promise.all(notifications);

  res.json({
    success: true,
    message: `Agendamento ${getStatusMessage(status)} com sucesso`,
    data: { booking: updatedBooking }
  });
}));

// @route   PUT /api/bookings/:id/reschedule
// @desc    Reagendar agendamento
// @access  Private
router.put('/:id/reschedule', authenticateToken, bookingValidators.validateReschedule, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { newScheduledAt, reason } = req.body;

  // Buscar agendamento
  const booking = await prisma.booking.findFirst({
    where: {
      id,
      userId: req.user.id,
      status: {
        in: ['PENDING', 'CONFIRMED']
      }
    },
    include: {
      professional: {
        include: { user: true }
      },
      service: true
    }
  });

  if (!booking) {
    throw new AppError('Agendamento não encontrado ou não pode ser reagendado', 404);
  }

  const newDate = new Date(newScheduledAt);
  const endTime = new Date(newDate.getTime() + booking.duration * 60000);

  // Verificar se não é no passado
  if (newDate <= new Date()) {
    throw new AppError('Não é possível reagendar para o passado', 400);
  }

  // Verificar disponibilidade do novo horário
  const conflictingBooking = await prisma.booking.findFirst({
    where: {
      professionalId: booking.professionalId,
      id: { not: id },
      status: {
        in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS']
      },
      OR: [
        {
          AND: [
            { scheduledAt: { lte: newDate } },
            { 
              scheduledAt: { 
                gte: new Date(newDate.getTime() - booking.duration * 60000) 
              } 
            }
          ]
        },
        {
          AND: [
            { scheduledAt: { gte: newDate } },
            { scheduledAt: { lt: endTime } }
          ]
        }
      ]
    }
  });

  if (conflictingBooking) {
    throw new AppError('Novo horário não disponível', 400);
  }

  // Atualizar agendamento
  const updatedBooking = await prisma.booking.update({
    where: { id },
    data: {
      scheduledAt: newDate,
      status: 'PENDING', // Volta para pendente para nova confirmação
      rescheduledAt: new Date(),
      rescheduleReason: reason
    },
    include: {
      user: true,
      professional: {
        include: { user: true }
      },
      service: true
    }
  });

  // Notificar profissional sobre reagendamento
  await createNotification({
    userId: booking.professional.userId,
    type: 'BOOKING_RESCHEDULED',
    title: 'Agendamento Reagendado',
    message: `${booking.user.firstName} reagendou o atendimento. Nova data: ${newDate.toLocaleString('pt-BR')}`,
    data: { bookingId: booking.id },
    priority: 'HIGH'
  });

  res.json({
    success: true,
    message: 'Agendamento reagendado com sucesso',
    data: { booking: updatedBooking }
  });
}));

// @route   POST /api/bookings/:id/messages
// @desc    Enviar mensagem no agendamento
// @access  Private
router.post('/:id/messages', authenticateToken, bookingValidators.validateMessage, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { content, type = 'TEXT' } = req.body;

  // Verificar se o agendamento existe e o usuário tem acesso
  const booking = await prisma.booking.findFirst({
    where: {
      id,
      OR: [
        { userId: req.user.id },
        { professional: { userId: req.user.id } }
      ]
    },
    include: {
      user: true,
      professional: {
        include: { user: true }
      }
    }
  });

  if (!booking) {
    throw new AppError('Agendamento não encontrado', 404);
  }

  // Criar mensagem
  const message = await prisma.bookingMessage.create({
    data: {
      bookingId: id,
      senderId: req.user.id,
      content,
      type
    },
    include: {
      sender: {
        select: {
          firstName: true,
          lastName: true,
          avatar: true
        }
      }
    }
  });

  // Notificar o outro participante
  const recipientId = booking.userId === req.user.id 
    ? booking.professional.userId 
    : booking.userId;

  await createNotification({
    userId: recipientId,
    type: 'NEW_MESSAGE',
    title: 'Nova Mensagem',
    message: `${message.sender.firstName} enviou uma mensagem sobre o agendamento`,
    data: { bookingId: booking.id, messageId: message.id }
  });

  res.status(201).json({
    success: true,
    message: 'Mensagem enviada com sucesso',
    data: { message }
  });
}));

// @route   GET /api/bookings/professional/schedule
// @desc    Obter agenda do profissional
// @access  Private/Professional
router.get('/professional/schedule', authenticateToken, requireProfessional, asyncHandler(async (req, res) => {
  const { 
    startDate, 
    endDate, 
    status,
    view = 'week' // week, month, day
  } = req.query;

  const start = startDate ? new Date(startDate) : new Date();
  const end = endDate ? new Date(endDate) : new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);

  const where = {
    professionalId: req.user.professional.id,
    scheduledAt: {
      gte: start,
      lte: end
    },
    ...(status && { status })
  };

  const bookings = await prisma.booking.findMany({
    where,
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          phone: true,
          avatar: true
        }
      },
      service: {
        select: {
          name: true,
          category: true,
          duration: true
        }
      }
    },
    orderBy: { scheduledAt: 'asc' }
  });

  // Agrupar por data se view for month
  let groupedBookings = bookings;
  if (view === 'month') {
    groupedBookings = bookings.reduce((acc, booking) => {
      const date = booking.scheduledAt.toISOString().split('T')[0];
      if (!acc[date]) acc[date] = [];
      acc[date].push(booking);
      return acc;
    }, {});
  }

  res.json({
    success: true,
    data: {
      bookings: groupedBookings,
      period: { start, end },
      view,
      summary: {
        total: bookings.length,
        confirmed: bookings.filter(b => b.status === 'CONFIRMED').length,
        pending: bookings.filter(b => b.status === 'PENDING').length,
        completed: bookings.filter(b => b.status === 'COMPLETED').length
      }
    }
  });
}));

// @route   GET /api/bookings/analytics
// @desc    Obter analytics de agendamentos
// @access  Private
router.get('/analytics', authenticateToken, asyncHandler(async (req, res) => {
  const { period = '30d' } = req.query;
  
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const userId = req.user.id;
  const isUserProfessional = req.user.professional?.id;

  const where = isUserProfessional 
    ? { professionalId: isUserProfessional }
    : { userId };

  const [
    totalBookings,
    completedBookings,
    cancelledBookings,
    totalRevenue,
    bookingsByStatus,
    bookingsByMonth
  ] = await Promise.all([
    prisma.booking.count({
      where: {
        ...where,
        createdAt: { gte: startDate }
      }
    }),
    
    prisma.booking.count({
      where: {
        ...where,
        status: 'COMPLETED',
        createdAt: { gte: startDate }
      }
    }),
    
    prisma.booking.count({
      where: {
        ...where,
        status: 'CANCELLED',
        createdAt: { gte: startDate }
      }
    }),
    
    prisma.booking.aggregate({
      where: {
        ...where,
        status: 'COMPLETED',
        createdAt: { gte: startDate }
      },
      _sum: { totalAmount: true }
    }),
    
    prisma.booking.groupBy({
      by: ['status'],
      where: {
        ...where,
        createdAt: { gte: startDate }
      },
      _count: true
    }),
    
    prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        COUNT(*) as count,
        SUM("totalAmount") as revenue
      FROM "Booking"
      WHERE ${isUserProfessional ? '"professionalId"' : '"userId"'} = ${isUserProfessional || userId}
        AND "createdAt" >= ${startDate}
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month
    `
  ]);

  const analytics = {
    summary: {
      totalBookings,
      completedBookings,
      cancelledBookings,
      completionRate: totalBookings > 0 ? (completedBookings / totalBookings * 100).toFixed(1) : 0,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      averageBookingValue: completedBookings > 0 
        ? ((totalRevenue._sum.totalAmount || 0) / completedBookings).toFixed(2)
        : 0
    },
    bookingsByStatus: bookingsByStatus.map(item => ({
      status: item.status,
      count: item._count,
      percentage: totalBookings > 0 ? (item._count / totalBookings * 100).toFixed(1) : 0
    })),
    monthlyTrend: bookingsByMonth.map(item => ({
      month: item.month,
      bookings: parseInt(item.count),
      revenue: parseFloat(item.revenue) || 0
    })),
    period: `${days} dias`
  };

  res.json({
    success: true,
    data: { analytics }
  });
}));

// ===== ROTAS ADMINISTRATIVAS =====

// @route   GET /api/bookings/admin/all
// @desc    Listar todos os agendamentos (Admin)
// @access  Private/Admin
router.get('/admin/all', requireAdmin, asyncHandler(async (req, res) => {
  const { 
    status, 
    professionalId, 
    userId,
    startDate,
    endDate,
    page = 1, 
    limit = 20 
  } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = {
    ...(status && { status }),
    ...(professionalId && { professionalId }),
    ...(userId && { userId }),
    ...(startDate && endDate && {
      scheduledAt: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    })
  };

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        professional: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        service: {
          select: {
            name: true,
            category: true
          }
        },
        payment: {
          select: {
            status: true,
            amount: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit)
    }),
    prisma.booking.count({ where })
  ]);

  res.json({
    success: true,
    data: {
      bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  });
}));

// Função auxiliar para mensagens de status
function getStatusMessage(status) {
  const messages = {
    CONFIRMED: 'confirmado',
    CANCELLED: 'cancelado',
    IN_PROGRESS: 'iniciado',
    COMPLETED: 'finalizado'
  };
  return messages[status] || 'atualizado';
}

module.exports = router;

