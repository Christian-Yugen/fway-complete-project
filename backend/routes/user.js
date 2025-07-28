const express = require('express');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { requireAdmin } = require('../middleware/auth');
const { cache } = require('../config/redis');
const userValidators = require('../validators/user');
const uploadMiddleware = require('../middleware/upload');

const router = express.Router();
const prisma = new PrismaClient();

// @route   GET /api/users/profile
// @desc    Obter perfil do usuário logado
// @access  Private
router.get('/profile', asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      avatar: true,
      dateOfBirth: true,
      gender: true,
      cpf: true,
      isEmailVerified: true,
      isPhoneVerified: true,
      lastLoginAt: true,
      createdAt: true,
      profile: {
        select: {
          bio: true,
          preferences: true,
          healthConditions: true,
          allergies: true,
          medications: true,
          emergencyContact: true,
          insuranceInfo: true
        }
      },
      professional: {
        select: {
          id: true,
          licenseNumber: true,
          specialties: true,
          experience: true,
          education: true,
          certifications: true,
          languages: true,
          consultationFee: true,
          isVerified: true,
          isAvailable: true,
          rating: true,
          totalReviews: true,
          totalConsultations: true,
          verifiedAt: true
        }
      },
      shieldProfile: {
        select: {
          id: true,
          currentLevel: true,
          totalPoints: true,
          riskScore: true,
          activeCoverages: true,
          totalProtection: true,
          monthlyPremium: true,
          claimsHistory: true
        }
      },
      addresses: {
        select: {
          id: true,
          type: true,
          street: true,
          number: true,
          complement: true,
          neighborhood: true,
          city: true,
          state: true,
          zipCode: true,
          isDefault: true
        }
      },
      emergencyContacts: {
        select: {
          id: true,
          name: true,
          relationship: true,
          phone: true,
          email: true,
          isPrimary: true
        }
      }
    }
  });

  if (!user) {
    throw new AppError('Usuário não encontrado', 404);
  }

  res.json({
    success: true,
    data: { user }
  });
}));

// @route   PUT /api/users/profile
// @desc    Atualizar perfil do usuário
// @access  Private
router.put('/profile', userValidators.validateUpdateProfile, asyncHandler(async (req, res) => {
  const {
    firstName,
    lastName,
    phone,
    dateOfBirth,
    gender,
    bio,
    preferences,
    healthConditions,
    allergies,
    medications,
    emergencyContact,
    insuranceInfo
  } = req.body;

  // Atualizar dados básicos do usuário
  const updatedUser = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      firstName,
      lastName,
      phone,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      gender,
      profile: {
        upsert: {
          create: {
            bio,
            preferences,
            healthConditions,
            allergies,
            medications,
            emergencyContact,
            insuranceInfo
          },
          update: {
            bio,
            preferences,
            healthConditions,
            allergies,
            medications,
            emergencyContact,
            insuranceInfo
          }
        }
      }
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      avatar: true,
      dateOfBirth: true,
      gender: true,
      profile: true
    }
  });

  // Limpar cache do usuário
  await cache.del(`user:${req.user.id}`);

  res.json({
    success: true,
    message: 'Perfil atualizado com sucesso',
    data: { user: updatedUser }
  });
}));

// @route   POST /api/users/avatar
// @desc    Upload de avatar do usuário
// @access  Private
router.post('/avatar', uploadMiddleware.single('avatar'), asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError('Arquivo de imagem é obrigatório', 400);
  }

  const avatarUrl = `/uploads/avatars/${req.file.filename}`;

  const updatedUser = await prisma.user.update({
    where: { id: req.user.id },
    data: { avatar: avatarUrl },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      avatar: true
    }
  });

  // Limpar cache do usuário
  await cache.del(`user:${req.user.id}`);

  res.json({
    success: true,
    message: 'Avatar atualizado com sucesso',
    data: { user: updatedUser }
  });
}));

// @route   PUT /api/users/password
// @desc    Alterar senha do usuário
// @access  Private
router.put('/password', userValidators.validateChangePassword, asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Buscar usuário com senha
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, password: true }
  });

  // Verificar senha atual
  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isCurrentPasswordValid) {
    throw new AppError('Senha atual incorreta', 400);
  }

  // Hash da nova senha
  const hashedNewPassword = await bcrypt.hash(newPassword, parseInt(process.env.BCRYPT_ROUNDS) || 12);

  // Atualizar senha
  await prisma.user.update({
    where: { id: req.user.id },
    data: { password: hashedNewPassword }
  });

  // Limpar cache e invalidar tokens
  await cache.del(`user:${req.user.id}`);
  await cache.del(`refresh:${req.user.id}`);

  res.json({
    success: true,
    message: 'Senha alterada com sucesso'
  });
}));

// @route   POST /api/users/addresses
// @desc    Adicionar endereço
// @access  Private
router.post('/addresses', userValidators.validateAddress, asyncHandler(async (req, res) => {
  const {
    type,
    street,
    number,
    complement,
    neighborhood,
    city,
    state,
    zipCode,
    latitude,
    longitude,
    isDefault
  } = req.body;

  // Se for endereço padrão, remover padrão dos outros
  if (isDefault) {
    await prisma.address.updateMany({
      where: { userId: req.user.id },
      data: { isDefault: false }
    });
  }

  const address = await prisma.address.create({
    data: {
      userId: req.user.id,
      type,
      street,
      number,
      complement,
      neighborhood,
      city,
      state,
      zipCode,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      isDefault
    }
  });

  res.status(201).json({
    success: true,
    message: 'Endereço adicionado com sucesso',
    data: { address }
  });
}));

// @route   PUT /api/users/addresses/:id
// @desc    Atualizar endereço
// @access  Private
router.put('/addresses/:id', userValidators.validateAddress, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    type,
    street,
    number,
    complement,
    neighborhood,
    city,
    state,
    zipCode,
    latitude,
    longitude,
    isDefault
  } = req.body;

  // Verificar se o endereço pertence ao usuário
  const existingAddress = await prisma.address.findFirst({
    where: { id, userId: req.user.id }
  });

  if (!existingAddress) {
    throw new AppError('Endereço não encontrado', 404);
  }

  // Se for endereço padrão, remover padrão dos outros
  if (isDefault) {
    await prisma.address.updateMany({
      where: { 
        userId: req.user.id,
        id: { not: id }
      },
      data: { isDefault: false }
    });
  }

  const updatedAddress = await prisma.address.update({
    where: { id },
    data: {
      type,
      street,
      number,
      complement,
      neighborhood,
      city,
      state,
      zipCode,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      isDefault
    }
  });

  res.json({
    success: true,
    message: 'Endereço atualizado com sucesso',
    data: { address: updatedAddress }
  });
}));

// @route   DELETE /api/users/addresses/:id
// @desc    Remover endereço
// @access  Private
router.delete('/addresses/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Verificar se o endereço pertence ao usuário
  const address = await prisma.address.findFirst({
    where: { id, userId: req.user.id }
  });

  if (!address) {
    throw new AppError('Endereço não encontrado', 404);
  }

  await prisma.address.delete({
    where: { id }
  });

  res.json({
    success: true,
    message: 'Endereço removido com sucesso'
  });
}));

// @route   POST /api/users/emergency-contacts
// @desc    Adicionar contato de emergência
// @access  Private
router.post('/emergency-contacts', userValidators.validateEmergencyContact, asyncHandler(async (req, res) => {
  const { name, relationship, phone, email, isPrimary } = req.body;

  // Se for contato primário, remover primário dos outros
  if (isPrimary) {
    await prisma.emergencyContact.updateMany({
      where: { userId: req.user.id },
      data: { isPrimary: false }
    });
  }

  const emergencyContact = await prisma.emergencyContact.create({
    data: {
      userId: req.user.id,
      name,
      relationship,
      phone,
      email,
      isPrimary
    }
  });

  res.status(201).json({
    success: true,
    message: 'Contato de emergência adicionado com sucesso',
    data: { emergencyContact }
  });
}));

// @route   PUT /api/users/emergency-contacts/:id
// @desc    Atualizar contato de emergência
// @access  Private
router.put('/emergency-contacts/:id', userValidators.validateEmergencyContact, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, relationship, phone, email, isPrimary } = req.body;

  // Verificar se o contato pertence ao usuário
  const existingContact = await prisma.emergencyContact.findFirst({
    where: { id, userId: req.user.id }
  });

  if (!existingContact) {
    throw new AppError('Contato de emergência não encontrado', 404);
  }

  // Se for contato primário, remover primário dos outros
  if (isPrimary) {
    await prisma.emergencyContact.updateMany({
      where: { 
        userId: req.user.id,
        id: { not: id }
      },
      data: { isPrimary: false }
    });
  }

  const updatedContact = await prisma.emergencyContact.update({
    where: { id },
    data: {
      name,
      relationship,
      phone,
      email,
      isPrimary
    }
  });

  res.json({
    success: true,
    message: 'Contato de emergência atualizado com sucesso',
    data: { emergencyContact: updatedContact }
  });
}));

// @route   DELETE /api/users/emergency-contacts/:id
// @desc    Remover contato de emergência
// @access  Private
router.delete('/emergency-contacts/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Verificar se o contato pertence ao usuário
  const contact = await prisma.emergencyContact.findFirst({
    where: { id, userId: req.user.id }
  });

  if (!contact) {
    throw new AppError('Contato de emergência não encontrado', 404);
  }

  await prisma.emergencyContact.delete({
    where: { id }
  });

  res.json({
    success: true,
    message: 'Contato de emergência removido com sucesso'
  });
}));

// @route   GET /api/users/bookings
// @desc    Listar agendamentos do usuário
// @access  Private
router.get('/bookings', asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = {
    userId: req.user.id,
    ...(status && { status })
  };

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      include: {
        professional: {
          select: {
            id: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                avatar: true
              }
            },
            specialties: true,
            rating: true
          }
        },
        service: {
          select: {
            id: true,
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
            method: true
          }
        }
      },
      orderBy: { scheduledAt: 'desc' },
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

// @route   GET /api/users/notifications
// @desc    Listar notificações do usuário
// @access  Private
router.get('/notifications', asyncHandler(async (req, res) => {
  const { isRead, page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = {
    userId: req.user.id,
    ...(isRead !== undefined && { isRead: isRead === 'true' })
  };

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit)
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({
      where: { userId: req.user.id, isRead: false }
    })
  ]);

  res.json({
    success: true,
    data: {
      notifications,
      unreadCount,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  });
}));

// @route   PUT /api/users/notifications/:id/read
// @desc    Marcar notificação como lida
// @access  Private
router.put('/notifications/:id/read', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const notification = await prisma.notification.findFirst({
    where: { id, userId: req.user.id }
  });

  if (!notification) {
    throw new AppError('Notificação não encontrada', 404);
  }

  const updatedNotification = await prisma.notification.update({
    where: { id },
    data: { isRead: true }
  });

  res.json({
    success: true,
    message: 'Notificação marcada como lida',
    data: { notification: updatedNotification }
  });
}));

// @route   PUT /api/users/notifications/read-all
// @desc    Marcar todas as notificações como lidas
// @access  Private
router.put('/notifications/read-all', asyncHandler(async (req, res) => {
  await prisma.notification.updateMany({
    where: { userId: req.user.id, isRead: false },
    data: { isRead: true }
  });

  res.json({
    success: true,
    message: 'Todas as notificações foram marcadas como lidas'
  });
}));

// @route   DELETE /api/users/account
// @desc    Desativar conta do usuário
// @access  Private
router.delete('/account', userValidators.validateDeleteAccount, asyncHandler(async (req, res) => {
  const { password, reason } = req.body;

  // Verificar senha
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { password: true }
  });

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AppError('Senha incorreta', 400);
  }

  // Desativar conta (soft delete)
  await prisma.user.update({
    where: { id: req.user.id },
    data: { 
      isActive: false,
      // Adicionar log de desativação se necessário
    }
  });

  // Limpar cache e tokens
  await cache.del(`user:${req.user.id}`);
  await cache.del(`refresh:${req.user.id}`);

  res.json({
    success: true,
    message: 'Conta desativada com sucesso'
  });
}));

// ===== ROTAS ADMINISTRATIVAS =====

// @route   GET /api/users
// @desc    Listar todos os usuários (Admin)
// @access  Private/Admin
router.get('/', requireAdmin, asyncHandler(async (req, res) => {
  const { 
    search, 
    isActive, 
    isEmailVerified, 
    page = 1, 
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = {
    ...(search && {
      OR: [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }),
    ...(isActive !== undefined && { isActive: isActive === 'true' }),
    ...(isEmailVerified !== undefined && { isEmailVerified: isEmailVerified === 'true' })
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        isActive: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        lastLoginAt: true,
        createdAt: true,
        professional: {
          select: {
            id: true,
            isVerified: true,
            specialties: true
          }
        }
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: parseInt(limit)
    }),
    prisma.user.count({ where })
  ]);

  res.json({
    success: true,
    data: {
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  });
}));

// @route   GET /api/users/:id
// @desc    Obter usuário específico (Admin)
// @access  Private/Admin
router.get('/:id', requireAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      profile: true,
      professional: true,
      shieldProfile: true,
      addresses: true,
      emergencyContacts: true,
      bookings: {
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          professional: {
            select: {
              user: {
                select: { firstName: true, lastName: true }
              }
            }
          }
        }
      },
      _count: {
        select: {
          bookings: true,
          reviews: true,
          notifications: true
        }
      }
    }
  });

  if (!user) {
    throw new AppError('Usuário não encontrado', 404);
  }

  // Remover senha da resposta
  const { password, ...userWithoutPassword } = user;

  res.json({
    success: true,
    data: { user: userWithoutPassword }
  });
}));

// @route   PUT /api/users/:id/status
// @desc    Alterar status do usuário (Admin)
// @access  Private/Admin
router.put('/:id/status', requireAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, firstName: true, lastName: true, email: true }
  });

  if (!user) {
    throw new AppError('Usuário não encontrado', 404);
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: { isActive },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      isActive: true
    }
  });

  // Limpar cache do usuário
  await cache.del(`user:${id}`);

  res.json({
    success: true,
    message: `Usuário ${isActive ? 'ativado' : 'desativado'} com sucesso`,
    data: { user: updatedUser }
  });
}));

module.exports = router;

