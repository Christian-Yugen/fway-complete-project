const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { authenticateToken, requireProfessional, requireAdmin, optionalAuth } = require('../middleware/auth');
const { cache } = require('../config/redis');
const professionalValidators = require('../validators/professional');
const uploadMiddleware = require('../middleware/upload');

const router = express.Router();
const prisma = new PrismaClient();

// @route   GET /api/professionals
// @desc    Listar profissionais
// @access  Public
router.get('/', optionalAuth, asyncHandler(async (req, res) => {
  const {
    search,
    specialty,
    city,
    state,
    isVerified = 'true',
    isAvailable = 'true',
    minRating,
    maxPrice,
    latitude,
    longitude,
    radius = 50, // km
    page = 1,
    limit = 20,
    sortBy = 'rating',
    sortOrder = 'desc'
  } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Construir filtros
  const where = {
    isVerified: isVerified === 'true',
    isAvailable: isAvailable === 'true',
    user: {
      isActive: true
    },
    ...(search && {
      OR: [
        {
          user: {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } }
            ]
          }
        },
        { specialties: { hasSome: [search] } }
      ]
    }),
    ...(specialty && { specialties: { has: specialty } }),
    ...(minRating && { rating: { gte: parseFloat(minRating) } }),
    ...(maxPrice && { consultationFee: { lte: parseFloat(maxPrice) } })
  };

  // Filtro por localização
  if (city || state) {
    where.locations = {
      some: {
        ...(city && { city: { contains: city, mode: 'insensitive' } }),
        ...(state && { state: { contains: state, mode: 'insensitive' } })
      }
    };
  }

  // Buscar profissionais
  const [professionals, total] = await Promise.all([
    prisma.professional.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        services: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            category: true,
            price: true,
            duration: true
          },
          take: 3
        },
        locations: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            city: true,
            state: true,
            latitude: true,
            longitude: true
          }
        },
        _count: {
          select: {
            bookings: {
              where: { status: 'COMPLETED' }
            }
          }
        }
      },
      orderBy: {
        ...(sortBy === 'rating' && { rating: sortOrder }),
        ...(sortBy === 'price' && { consultationFee: sortOrder }),
        ...(sortBy === 'experience' && { experience: sortOrder }),
        ...(sortBy === 'reviews' && { totalReviews: sortOrder })
      },
      skip,
      take: parseInt(limit)
    }),
    prisma.professional.count({ where })
  ]);

  // Calcular distância se coordenadas fornecidas
  if (latitude && longitude) {
    const userLat = parseFloat(latitude);
    const userLng = parseFloat(longitude);

    professionals.forEach(professional => {
      professional.locations.forEach(location => {
        if (location.latitude && location.longitude) {
          const distance = calculateDistance(
            userLat,
            userLng,
            parseFloat(location.latitude),
            parseFloat(location.longitude)
          );
          location.distance = Math.round(distance * 100) / 100; // 2 casas decimais
        }
      });
      
      // Ordenar localizações por distância
      professional.locations.sort((a, b) => (a.distance || 999) - (b.distance || 999));
    });

    // Filtrar por raio se especificado
    if (radius) {
      const filteredProfessionals = professionals.filter(professional =>
        professional.locations.some(location => 
          location.distance && location.distance <= parseFloat(radius)
        )
      );
      
      // Reordenar por distância se solicitado
      if (sortBy === 'distance') {
        filteredProfessionals.sort((a, b) => {
          const distanceA = Math.min(...a.locations.map(l => l.distance || 999));
          const distanceB = Math.min(...b.locations.map(l => l.distance || 999));
          return sortOrder === 'asc' ? distanceA - distanceB : distanceB - distanceA;
        });
      }
    }
  }

  res.json({
    success: true,
    data: {
      professionals,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
      filters: {
        search,
        specialty,
        city,
        state,
        minRating,
        maxPrice,
        radius: latitude && longitude ? radius : null
      }
    }
  });
}));

// @route   GET /api/professionals/:id
// @desc    Obter profissional específico
// @access  Public
router.get('/:id', optionalAuth, asyncHandler(async (req, res) => {
  const { id } = req.params;

  const professional = await prisma.professional.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
          profile: {
            select: {
              bio: true
            }
          }
        }
      },
      services: {
        where: { isActive: true },
        include: {
          _count: {
            select: {
              bookings: {
                where: { status: 'COMPLETED' }
              }
            }
          }
        }
      },
      locations: {
        where: { isActive: true }
      },
      workingHours: {
        where: { isActive: true },
        orderBy: { dayOfWeek: 'asc' }
      },
      bookings: {
        where: { 
          status: 'COMPLETED',
          review: { isNot: null }
        },
        include: {
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
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }
    }
  });

  if (!professional) {
    throw new AppError('Profissional não encontrado', 404);
  }

  if (!professional.isVerified) {
    throw new AppError('Profissional não verificado', 403);
  }

  // Calcular estatísticas
  const stats = {
    totalConsultations: professional.totalConsultations,
    averageRating: professional.rating,
    totalReviews: professional.totalReviews,
    responseTime: '< 2h', // Implementar lógica real
    completionRate: '98%' // Implementar lógica real
  };

  res.json({
    success: true,
    data: {
      professional: {
        ...professional,
        stats
      }
    }
  });
}));

// @route   GET /api/professionals/:id/availability
// @desc    Obter disponibilidade do profissional
// @access  Public
router.get('/:id/availability', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { date, days = 30 } = req.query;

  const professional = await prisma.professional.findUnique({
    where: { id },
    select: { id: true, isAvailable: true }
  });

  if (!professional) {
    throw new AppError('Profissional não encontrado', 404);
  }

  if (!professional.isAvailable) {
    throw new AppError('Profissional não disponível', 403);
  }

  const startDate = date ? new Date(date) : new Date();
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + parseInt(days));

  // Buscar horários de trabalho
  const workingHours = await prisma.workingHours.findMany({
    where: {
      professionalId: id,
      isActive: true
    },
    orderBy: { dayOfWeek: 'asc' }
  });

  // Buscar agendamentos existentes
  const existingBookings = await prisma.booking.findMany({
    where: {
      professionalId: id,
      scheduledAt: {
        gte: startDate,
        lte: endDate
      },
      status: {
        in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS']
      }
    },
    select: {
      scheduledAt: true,
      duration: true
    }
  });

  // Buscar bloqueios específicos
  const unavailableDates = await prisma.availability.findMany({
    where: {
      professionalId: id,
      date: {
        gte: startDate,
        lte: endDate
      },
      isAvailable: false
    },
    select: {
      date: true,
      startTime: true,
      endTime: true,
      reason: true
    }
  });

  // Gerar slots disponíveis
  const availableSlots = generateAvailableSlots(
    startDate,
    endDate,
    workingHours,
    existingBookings,
    unavailableDates
  );

  res.json({
    success: true,
    data: {
      professionalId: id,
      dateRange: {
        start: startDate,
        end: endDate
      },
      workingHours,
      availableSlots,
      unavailableDates
    }
  });
}));

// @route   POST /api/professionals/register
// @desc    Registrar como profissional
// @access  Private
router.post('/register', authenticateToken, professionalValidators.validateProfessionalRegistration, asyncHandler(async (req, res) => {
  const {
    licenseNumber,
    specialties,
    experience,
    education,
    certifications,
    languages,
    consultationFee,
    bio
  } = req.body;

  // Verificar se já é profissional
  const existingProfessional = await prisma.professional.findUnique({
    where: { userId: req.user.id }
  });

  if (existingProfessional) {
    throw new AppError('Usuário já está registrado como profissional', 400);
  }

  // Verificar se número de licença já existe
  const existingLicense = await prisma.professional.findUnique({
    where: { licenseNumber }
  });

  if (existingLicense) {
    throw new AppError('Número de licença já está em uso', 400);
  }

  // Criar perfil profissional
  const professional = await prisma.professional.create({
    data: {
      userId: req.user.id,
      licenseNumber,
      specialties,
      experience: parseInt(experience),
      education,
      certifications,
      languages,
      consultationFee: parseFloat(consultationFee)
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      }
    }
  });

  // Atualizar bio do usuário se fornecida
  if (bio) {
    await prisma.userProfile.upsert({
      where: { userId: req.user.id },
      create: { userId: req.user.id, bio },
      update: { bio }
    });
  }

  // Limpar cache do usuário
  await cache.del(`user:${req.user.id}`);

  res.status(201).json({
    success: true,
    message: 'Registro profissional enviado para verificação',
    data: { professional }
  });
}));

// @route   PUT /api/professionals/profile
// @desc    Atualizar perfil profissional
// @access  Private/Professional
router.put('/profile', authenticateToken, requireProfessional, professionalValidators.validateProfessionalUpdate, asyncHandler(async (req, res) => {
  const {
    specialties,
    experience,
    education,
    certifications,
    languages,
    consultationFee,
    isAvailable
  } = req.body;

  const updatedProfessional = await prisma.professional.update({
    where: { userId: req.user.id },
    data: {
      specialties,
      experience: experience ? parseInt(experience) : undefined,
      education,
      certifications,
      languages,
      consultationFee: consultationFee ? parseFloat(consultationFee) : undefined,
      isAvailable
    },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          avatar: true
        }
      }
    }
  });

  // Limpar cache
  await cache.del(`user:${req.user.id}`);

  res.json({
    success: true,
    message: 'Perfil profissional atualizado com sucesso',
    data: { professional: updatedProfessional }
  });
}));

// @route   POST /api/professionals/services
// @desc    Criar serviço
// @access  Private/Professional
router.post('/services', authenticateToken, requireProfessional, professionalValidators.validateService, asyncHandler(async (req, res) => {
  const {
    name,
    description,
    category,
    subcategory,
    duration,
    price,
    isOnline,
    isHomeVisit,
    requirements,
    tags
  } = req.body;

  const service = await prisma.service.create({
    data: {
      professionalId: req.user.professional.id,
      name,
      description,
      category,
      subcategory,
      duration: parseInt(duration),
      price: parseFloat(price),
      isOnline,
      isHomeVisit,
      requirements,
      tags
    }
  });

  res.status(201).json({
    success: true,
    message: 'Serviço criado com sucesso',
    data: { service }
  });
}));

// @route   PUT /api/professionals/services/:serviceId
// @desc    Atualizar serviço
// @access  Private/Professional
router.put('/services/:serviceId', authenticateToken, requireProfessional, professionalValidators.validateService, asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  const {
    name,
    description,
    category,
    subcategory,
    duration,
    price,
    isActive,
    isOnline,
    isHomeVisit,
    requirements,
    tags
  } = req.body;

  // Verificar se o serviço pertence ao profissional
  const existingService = await prisma.service.findFirst({
    where: {
      id: serviceId,
      professionalId: req.user.professional.id
    }
  });

  if (!existingService) {
    throw new AppError('Serviço não encontrado', 404);
  }

  const updatedService = await prisma.service.update({
    where: { id: serviceId },
    data: {
      name,
      description,
      category,
      subcategory,
      duration: duration ? parseInt(duration) : undefined,
      price: price ? parseFloat(price) : undefined,
      isActive,
      isOnline,
      isHomeVisit,
      requirements,
      tags
    }
  });

  res.json({
    success: true,
    message: 'Serviço atualizado com sucesso',
    data: { service: updatedService }
  });
}));

// @route   DELETE /api/professionals/services/:serviceId
// @desc    Remover serviço
// @access  Private/Professional
router.delete('/services/:serviceId', authenticateToken, requireProfessional, asyncHandler(async (req, res) => {
  const { serviceId } = req.params;

  // Verificar se o serviço pertence ao profissional
  const service = await prisma.service.findFirst({
    where: {
      id: serviceId,
      professionalId: req.user.professional.id
    }
  });

  if (!service) {
    throw new AppError('Serviço não encontrado', 404);
  }

  // Verificar se há agendamentos ativos
  const activeBookings = await prisma.booking.count({
    where: {
      serviceId,
      status: {
        in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS']
      }
    }
  });

  if (activeBookings > 0) {
    throw new AppError('Não é possível remover serviço com agendamentos ativos', 400);
  }

  await prisma.service.delete({
    where: { id: serviceId }
  });

  res.json({
    success: true,
    message: 'Serviço removido com sucesso'
  });
}));

// @route   POST /api/professionals/locations
// @desc    Adicionar localização
// @access  Private/Professional
router.post('/locations', authenticateToken, requireProfessional, professionalValidators.validateLocation, asyncHandler(async (req, res) => {
  const {
    name,
    type,
    street,
    number,
    complement,
    neighborhood,
    city,
    state,
    zipCode,
    latitude,
    longitude
  } = req.body;

  const location = await prisma.professionalLocation.create({
    data: {
      professionalId: req.user.professional.id,
      name,
      type,
      street,
      number,
      complement,
      neighborhood,
      city,
      state,
      zipCode,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude)
    }
  });

  res.status(201).json({
    success: true,
    message: 'Localização adicionada com sucesso',
    data: { location }
  });
}));

// @route   POST /api/professionals/working-hours
// @desc    Configurar horários de trabalho
// @access  Private/Professional
router.post('/working-hours', authenticateToken, requireProfessional, professionalValidators.validateWorkingHours, asyncHandler(async (req, res) => {
  const { workingHours } = req.body;

  // Remover horários existentes
  await prisma.workingHours.deleteMany({
    where: { professionalId: req.user.professional.id }
  });

  // Criar novos horários
  const createdHours = await prisma.workingHours.createMany({
    data: workingHours.map(hour => ({
      professionalId: req.user.professional.id,
      dayOfWeek: hour.dayOfWeek,
      startTime: new Date(`1970-01-01T${hour.startTime}:00Z`),
      endTime: new Date(`1970-01-01T${hour.endTime}:00Z`),
      isActive: hour.isActive
    }))
  });

  res.json({
    success: true,
    message: 'Horários de trabalho configurados com sucesso',
    data: { count: createdHours.count }
  });
}));

// ===== ROTAS ADMINISTRATIVAS =====

// @route   GET /api/professionals/admin/pending
// @desc    Listar profissionais pendentes de verificação
// @access  Private/Admin
router.get('/admin/pending', requireAdmin, asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [professionals, total] = await Promise.all([
    prisma.professional.findMany({
      where: { isVerified: false },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: 'asc' },
      skip,
      take: parseInt(limit)
    }),
    prisma.professional.count({ where: { isVerified: false } })
  ]);

  res.json({
    success: true,
    data: {
      professionals,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  });
}));

// @route   PUT /api/professionals/admin/:id/verify
// @desc    Verificar profissional
// @access  Private/Admin
router.put('/admin/:id/verify', requireAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isVerified, notes } = req.body;

  const professional = await prisma.professional.findUnique({
    where: { id },
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

  const updatedProfessional = await prisma.professional.update({
    where: { id },
    data: {
      isVerified,
      verifiedAt: isVerified ? new Date() : null
    }
  });

  // Enviar notificação para o profissional
  await prisma.notification.create({
    data: {
      userId: professional.userId,
      type: isVerified ? 'SYSTEM_UPDATE' : 'SYSTEM_UPDATE',
      title: isVerified ? 'Perfil Verificado!' : 'Verificação Pendente',
      message: isVerified 
        ? 'Seu perfil profissional foi verificado com sucesso!'
        : `Sua verificação precisa de ajustes: ${notes}`,
      priority: 'HIGH'
    }
  });

  res.json({
    success: true,
    message: `Profissional ${isVerified ? 'verificado' : 'rejeitado'} com sucesso`,
    data: { professional: updatedProfessional }
  });
}));

// Função auxiliar para calcular distância
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Função auxiliar para gerar slots disponíveis
function generateAvailableSlots(startDate, endDate, workingHours, existingBookings, unavailableDates) {
  const slots = [];
  const current = new Date(startDate);
  
  while (current <= endDate) {
    const dayOfWeek = current.getDay();
    const workingHour = workingHours.find(wh => wh.dayOfWeek === dayOfWeek);
    
    if (workingHour) {
      // Gerar slots de 30 minutos
      const startTime = new Date(current);
      const [startHour, startMinute] = workingHour.startTime.toTimeString().split(':');
      startTime.setHours(parseInt(startHour), parseInt(startMinute), 0, 0);
      
      const endTime = new Date(current);
      const [endHour, endMinute] = workingHour.endTime.toTimeString().split(':');
      endTime.setHours(parseInt(endHour), parseInt(endMinute), 0, 0);
      
      const slotDuration = 30; // minutos
      const currentSlot = new Date(startTime);
      
      while (currentSlot < endTime) {
        const slotEnd = new Date(currentSlot.getTime() + slotDuration * 60000);
        
        // Verificar se slot está disponível
        const isBooked = existingBookings.some(booking => {
          const bookingStart = new Date(booking.scheduledAt);
          const bookingEnd = new Date(bookingStart.getTime() + booking.duration * 60000);
          return currentSlot < bookingEnd && slotEnd > bookingStart;
        });
        
        const isUnavailable = unavailableDates.some(unavailable => {
          const unavailableDate = new Date(unavailable.date);
          return unavailableDate.toDateString() === current.toDateString();
        });
        
        if (!isBooked && !isUnavailable && currentSlot > new Date()) {
          slots.push({
            start: new Date(currentSlot),
            end: new Date(slotEnd),
            available: true
          });
        }
        
        currentSlot.setMinutes(currentSlot.getMinutes() + slotDuration);
      }
    }
    
    current.setDate(current.getDate() + 1);
  }
  
  return slots;
}

module.exports = router;

