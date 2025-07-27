const express = require('express')
const router = express.Router()

const { authenticate, requireProfessional, requireAdmin, optionalAuth } = require('../middlewares/auth')
const { validators, sanitize } = require('../middlewares/validation')
const { asyncHandler } = require('../middlewares/errorHandler')

// Middleware de sanitização para todas as rotas
router.use(sanitize)

/**
 * @swagger
 * tags:
 *   name: Professionals
 *   description: Gerenciamento de profissionais de saúde
 */

/**
 * @swagger
 * /api/professionals:
 *   get:
 *     summary: Listar profissionais
 *     tags: [Professionals]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Itens por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por nome ou especialização
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [DOCTOR, NURSE, PHYSIOTHERAPIST, PSYCHOLOGIST, NUTRITIONIST, OTHER]
 *         description: Filtrar por tipo
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filtrar por cidade
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: Filtrar por estado
 *       - in: query
 *         name: latitude
 *         schema:
 *           type: number
 *         description: Latitude para busca por proximidade
 *       - in: query
 *         name: longitude
 *         schema:
 *           type: number
 *         description: Longitude para busca por proximidade
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           maximum: 100
 *         description: Raio em km para busca por proximidade
 *     responses:
 *       200:
 *         description: Lista de profissionais
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     professionals:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Professional'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         pages:
 *                           type: integer
 */
router.get('/',
  optionalAuth,
  validators.validateSearch,
  asyncHandler(async (req, res) => {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      type, 
      city, 
      state, 
      latitude, 
      longitude, 
      radius = 10 
    } = req.query
    const { prisma } = require('../config/database')

    // Construir filtros
    const where = {
      isActive: true,
      isVerified: true
    }
    
    if (search) {
      where.OR = [
        { specialization: { contains: search, mode: 'insensitive' } },
        { user: {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } }
          ]
        }}
      ]
    }
    
    if (type) {
      where.type = type
    }
    
    if (city) {
      where.city = { contains: city, mode: 'insensitive' }
    }
    
    if (state) {
      where.state = state
    }

    // Calcular offset
    const offset = (page - 1) * limit

    // Buscar profissionais
    let professionals = await prisma.professional.findMany({
      where,
      include: {
        user: {
          select: {
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
            price: true,
            duration: true
          }
        },
        reviews: {
          select: {
            rating: true
          }
        }
      },
      skip: offset,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    })

    // Calcular distância se coordenadas fornecidas
    if (latitude && longitude) {
      professionals = professionals
        .map(prof => {
          if (prof.latitude && prof.longitude) {
            const distance = calculateDistance(
              parseFloat(latitude),
              parseFloat(longitude),
              prof.latitude,
              prof.longitude
            )
            return { ...prof, distance }
          }
          return prof
        })
        .filter(prof => !prof.distance || prof.distance <= radius)
        .sort((a, b) => (a.distance || 0) - (b.distance || 0))
    }

    // Calcular rating médio
    professionals = professionals.map(prof => {
      const ratings = prof.reviews.map(r => r.rating)
      const averageRating = ratings.length > 0 
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
        : 0
      
      return {
        ...prof,
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews: ratings.length,
        reviews: undefined // Remover reviews detalhadas
      }
    })

    const total = await prisma.professional.count({ where })
    const pages = Math.ceil(total / limit)

    res.json({
      success: true,
      data: {
        professionals,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages
        }
      }
    })
  })
)

/**
 * @swagger
 * /api/professionals/{id}:
 *   get:
 *     summary: Obter profissional por ID
 *     tags: [Professionals]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do profissional
 *     responses:
 *       200:
 *         description: Dados do profissional
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Professional'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/:id',
  optionalAuth,
  validators.validateId,
  asyncHandler(async (req, res) => {
    const { id } = req.params
    const { prisma } = require('../config/database')

    const professional = await prisma.professional.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            avatar: true,
            phone: true
          }
        },
        services: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            duration: true
          }
        },
        reviews: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    })

    if (!professional) {
      return res.status(404).json({
        success: false,
        message: 'Profissional não encontrado',
        code: 'NOT_FOUND'
      })
    }

    // Calcular rating médio
    const ratings = professional.reviews.map(r => r.rating)
    const averageRating = ratings.length > 0 
      ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
      : 0

    const result = {
      ...professional,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: ratings.length
    }

    res.json({
      success: true,
      data: result
    })
  })
)

/**
 * @swagger
 * /api/professionals:
 *   post:
 *     summary: Registrar como profissional
 *     tags: [Professionals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - specialization
 *               - license
 *               - experience
 *               - address
 *               - city
 *               - state
 *               - zipCode
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [DOCTOR, NURSE, PHYSIOTHERAPIST, PSYCHOLOGIST, NUTRITIONIST, OTHER]
 *                 example: DOCTOR
 *               specialization:
 *                 type: string
 *                 example: Cardiologia
 *               license:
 *                 type: string
 *                 example: CRM123456
 *               experience:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 50
 *                 example: 5
 *               address:
 *                 type: string
 *                 example: Rua das Flores, 123
 *               city:
 *                 type: string
 *                 example: São Paulo
 *               state:
 *                 type: string
 *                 example: SP
 *               zipCode:
 *                 type: string
 *                 example: 01234567
 *               consultationFee:
 *                 type: number
 *                 example: 150.00
 *               latitude:
 *                 type: number
 *                 example: -23.5505
 *               longitude:
 *                 type: number
 *                 example: -46.6333
 *     responses:
 *       201:
 *         description: Profissional registrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Profissional registrado com sucesso
 *                 data:
 *                   $ref: '#/components/schemas/Professional'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       409:
 *         description: Usuário já é profissional ou licença já existe
 */
router.post('/',
  authenticate,
  validators.registerProfessional,
  asyncHandler(async (req, res) => {
    const { prisma } = require('../config/database')
    const userId = req.user.id

    // Verificar se usuário já é profissional
    const existingProfessional = await prisma.professional.findUnique({
      where: { userId }
    })

    if (existingProfessional) {
      return res.status(409).json({
        success: false,
        message: 'Usuário já está registrado como profissional',
        code: 'ALREADY_PROFESSIONAL'
      })
    }

    // Verificar se licença já existe
    const existingLicense = await prisma.professional.findUnique({
      where: { license: req.body.license }
    })

    if (existingLicense) {
      return res.status(409).json({
        success: false,
        message: 'Licença já está em uso',
        code: 'LICENSE_EXISTS'
      })
    }

    // Criar profissional
    const professional = await prisma.professional.create({
      data: {
        userId,
        ...req.body
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            avatar: true
          }
        }
      }
    })

    // Atualizar role do usuário
    await prisma.user.update({
      where: { id: userId },
      data: { role: 'PROFESSIONAL' }
    })

    res.status(201).json({
      success: true,
      message: 'Profissional registrado com sucesso. Aguarde verificação.',
      data: professional
    })
  })
)

/**
 * @swagger
 * /api/professionals/{id}:
 *   put:
 *     summary: Atualizar dados do profissional
 *     tags: [Professionals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do profissional
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               specialization:
 *                 type: string
 *                 example: Cardiologia Pediátrica
 *               experience:
 *                 type: integer
 *                 example: 7
 *               address:
 *                 type: string
 *                 example: Rua Nova, 456
 *               city:
 *                 type: string
 *                 example: Rio de Janeiro
 *               state:
 *                 type: string
 *                 example: RJ
 *               zipCode:
 *                 type: string
 *                 example: 20000000
 *               consultationFee:
 *                 type: number
 *                 example: 200.00
 *               latitude:
 *                 type: number
 *                 example: -22.9068
 *               longitude:
 *                 type: number
 *                 example: -43.1729
 *     responses:
 *       200:
 *         description: Profissional atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Profissional atualizado com sucesso
 *                 data:
 *                   $ref: '#/components/schemas/Professional'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.put('/:id',
  authenticate,
  validators.validateId,
  asyncHandler(async (req, res) => {
    const { id } = req.params
    const { prisma } = require('../config/database')

    // Verificar se profissional existe
    const existingProfessional = await prisma.professional.findUnique({
      where: { id }
    })

    if (!existingProfessional) {
      return res.status(404).json({
        success: false,
        message: 'Profissional não encontrado',
        code: 'NOT_FOUND'
      })
    }

    // Verificar permissão (próprio profissional ou admin)
    if (existingProfessional.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado',
        code: 'FORBIDDEN'
      })
    }

    // Campos que podem ser atualizados
    const allowedFields = [
      'specialization', 'experience', 'address', 'city', 'state', 
      'zipCode', 'consultationFee', 'latitude', 'longitude', 'workingHours'
    ]

    const updateData = {}
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field]
      }
    })

    // Atualizar profissional
    const professional = await prisma.professional.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            avatar: true
          }
        }
      }
    })

    res.json({
      success: true,
      message: 'Profissional atualizado com sucesso',
      data: professional
    })
  })
)

// Função auxiliar para calcular distância entre coordenadas
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371 // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

module.exports = router

