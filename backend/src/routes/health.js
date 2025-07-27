const express = require('express')
const router = express.Router()
const { prisma } = require('../config/database')
const { asyncHandler } = require('../middlewares/errorHandler')

/**
 * @swagger
 * tags:
 *   name: Health
 *   description: Monitoramento de saúde da aplicação
 */

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Verificar saúde da aplicação
 *     tags: [Health]
 *     security: []
 *     responses:
 *       200:
 *         description: Aplicação funcionando corretamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: healthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                   description: Tempo de atividade em segundos
 *                 environment:
 *                   type: string
 *                   example: development
 *                 version:
 *                   type: string
 *                   example: 1.0.0
 *                 services:
 *                   type: object
 *                   properties:
 *                     database:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           example: connected
 *                         responseTime:
 *                           type: number
 *                           description: Tempo de resposta em ms
 *       503:
 *         description: Serviço indisponível
 */
const healthCheck = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  
  // Verificar conexão com banco de dados
  let databaseStatus = 'disconnected'
  let databaseResponseTime = 0
  
  try {
    const dbStart = Date.now()
    await prisma.$queryRaw`SELECT 1`
    databaseResponseTime = Date.now() - dbStart
    databaseStatus = 'connected'
  } catch (error) {
    databaseStatus = 'error'
  }

  const health = {
    status: databaseStatus === 'connected' ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    services: {
      database: {
        status: databaseStatus,
        responseTime: databaseResponseTime
      }
    },
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      external: Math.round(process.memoryUsage().external / 1024 / 1024)
    },
    responseTime: Date.now() - startTime
  }

  const statusCode = health.status === 'healthy' ? 200 : 503
  res.status(statusCode).json(health)
})

/**
 * @swagger
 * /health/ready:
 *   get:
 *     summary: Verificar se a aplicação está pronta
 *     tags: [Health]
 *     security: []
 *     responses:
 *       200:
 *         description: Aplicação pronta para receber requisições
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ready
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       503:
 *         description: Aplicação não está pronta
 */
const readinessCheck = asyncHandler(async (req, res) => {
  // Verificar se todos os serviços essenciais estão funcionando
  let isReady = true
  const checks = {}

  // Verificar banco de dados
  try {
    await prisma.$queryRaw`SELECT 1`
    checks.database = 'ready'
  } catch (error) {
    checks.database = 'not_ready'
    isReady = false
  }

  const response = {
    status: isReady ? 'ready' : 'not_ready',
    timestamp: new Date().toISOString(),
    checks
  }

  const statusCode = isReady ? 200 : 503
  res.status(statusCode).json(response)
})

/**
 * @swagger
 * /health/live:
 *   get:
 *     summary: Verificar se a aplicação está viva
 *     tags: [Health]
 *     security: []
 *     responses:
 *       200:
 *         description: Aplicação está viva
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: alive
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 */
const livenessCheck = asyncHandler(async (req, res) => {
  res.json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

// Rotas
router.get('/', healthCheck)
router.get('/ready', readinessCheck)
router.get('/live', livenessCheck)

module.exports = router

