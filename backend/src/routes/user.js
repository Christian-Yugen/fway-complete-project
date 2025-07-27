const express = require('express')
const router = express.Router()

const { authenticate, requireOwnershipOrAdmin, requireAdmin } = require('../middlewares/auth')
const { validators, sanitize } = require('../middlewares/validation')
const { asyncHandler } = require('../middlewares/errorHandler')

// Middleware de sanitização para todas as rotas
router.use(sanitize)

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Gerenciamento de usuários
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Listar usuários (apenas admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
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
 *         description: Buscar por nome ou email
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [USER, ADMIN, PROFESSIONAL]
 *         description: Filtrar por role
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, SUSPENDED, PENDING_VERIFICATION]
 *         description: Filtrar por status
 *     responses:
 *       200:
 *         description: Lista de usuários
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
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
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
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get('/',
  authenticate,
  requireAdmin,
  validators.validatePagination,
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, search, role, status } = req.query
    const { prisma } = require('../config/database')

    // Construir filtros
    const where = {}
    
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (role) {
      where.role = role
    }
    
    if (status) {
      where.status = status
    }

    // Calcular offset
    const offset = (page - 1) * limit

    // Buscar usuários
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true
        },
        skip: offset,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ])

    const pages = Math.ceil(total / limit)

    res.json({
      success: true,
      data: {
        users,
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
 * /api/users/{id}:
 *   get:
 *     summary: Obter usuário por ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Dados do usuário
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/:id',
  authenticate,
  requireOwnershipOrAdmin('id'),
  validators.validateId,
  asyncHandler(async (req, res) => {
    const { id } = req.params
    const { prisma } = require('../config/database')

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        birthDate: true,
        role: true,
        status: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        profile: {
          select: {
            cpf: true,
            address: true,
            city: true,
            state: true,
            zipCode: true,
            country: true,
            language: true,
            timezone: true,
            emailNotifications: true,
            smsNotifications: true,
            pushNotifications: true
          }
        }
      }
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado',
        code: 'NOT_FOUND'
      })
    }

    res.json({
      success: true,
      data: user
    })
  })
)

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Atualizar usuário
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: João
 *               lastName:
 *                 type: string
 *                 example: Silva
 *               phone:
 *                 type: string
 *                 example: +5511999999999
 *               birthDate:
 *                 type: string
 *                 format: date
 *                 example: 1990-01-01
 *               profile:
 *                 type: object
 *                 properties:
 *                   cpf:
 *                     type: string
 *                     example: 12345678901
 *                   address:
 *                     type: string
 *                     example: Rua das Flores, 123
 *                   city:
 *                     type: string
 *                     example: São Paulo
 *                   state:
 *                     type: string
 *                     example: SP
 *                   zipCode:
 *                     type: string
 *                     example: 01234567
 *                   emailNotifications:
 *                     type: boolean
 *                     example: true
 *                   smsNotifications:
 *                     type: boolean
 *                     example: false
 *                   pushNotifications:
 *                     type: boolean
 *                     example: true
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
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
 *                   example: Usuário atualizado com sucesso
 *                 data:
 *                   $ref: '#/components/schemas/User'
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
  requireOwnershipOrAdmin('id'),
  validators.validateId,
  validators.updateProfile,
  asyncHandler(async (req, res) => {
    const { id } = req.params
    const { firstName, lastName, phone, birthDate, profile } = req.body
    const { prisma } = require('../config/database')

    // Verificar se usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado',
        code: 'NOT_FOUND'
      })
    }

    // Atualizar usuário
    const updateData = {}
    if (firstName !== undefined) updateData.firstName = firstName
    if (lastName !== undefined) updateData.lastName = lastName
    if (phone !== undefined) updateData.phone = phone
    if (birthDate !== undefined) updateData.birthDate = new Date(birthDate)

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        birthDate: true,
        role: true,
        status: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true
      }
    })

    // Atualizar perfil se fornecido
    if (profile) {
      await prisma.userProfile.upsert({
        where: { userId: id },
        update: profile,
        create: {
          userId: id,
          ...profile
        }
      })
    }

    res.json({
      success: true,
      message: 'Usuário atualizado com sucesso',
      data: user
    })
  })
)

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Deletar usuário (apenas admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Usuário deletado com sucesso
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
 *                   example: Usuário deletado com sucesso
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.delete('/:id',
  authenticate,
  requireAdmin,
  validators.validateId,
  asyncHandler(async (req, res) => {
    const { id } = req.params
    const { prisma } = require('../config/database')

    // Verificar se usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado',
        code: 'NOT_FOUND'
      })
    }

    // Não permitir deletar o próprio usuário admin
    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Não é possível deletar sua própria conta',
        code: 'CANNOT_DELETE_SELF'
      })
    }

    // Deletar usuário (cascade irá deletar relacionamentos)
    await prisma.user.delete({
      where: { id }
    })

    res.json({
      success: true,
      message: 'Usuário deletado com sucesso'
    })
  })
)

/**
 * @swagger
 * /api/users/{id}/status:
 *   patch:
 *     summary: Alterar status do usuário (apenas admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE, SUSPENDED, PENDING_VERIFICATION]
 *                 example: SUSPENDED
 *               reason:
 *                 type: string
 *                 example: Violação dos termos de uso
 *     responses:
 *       200:
 *         description: Status alterado com sucesso
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
 *                   example: Status do usuário alterado com sucesso
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.patch('/:id/status',
  authenticate,
  requireAdmin,
  validators.validateId,
  asyncHandler(async (req, res) => {
    const { id } = req.params
    const { status, reason } = req.body
    const { prisma } = require('../config/database')

    // Validar status
    const validStatuses = ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status inválido',
        code: 'INVALID_STATUS'
      })
    }

    // Verificar se usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado',
        code: 'NOT_FOUND'
      })
    }

    // Não permitir alterar status do próprio usuário admin
    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Não é possível alterar o status da sua própria conta',
        code: 'CANNOT_CHANGE_SELF_STATUS'
      })
    }

    // Atualizar status
    await prisma.user.update({
      where: { id },
      data: { status }
    })

    // Log de auditoria
    const logger = require('../config/logger')
    logger.auditLog('USER_STATUS_CHANGED', 'user', req.user.id, {
      targetUserId: id,
      oldStatus: existingUser.status,
      newStatus: status,
      reason
    })

    res.json({
      success: true,
      message: 'Status do usuário alterado com sucesso'
    })
  })
)

module.exports = router

