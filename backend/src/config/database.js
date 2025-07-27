const { PrismaClient } = require('@prisma/client')
const logger = require('./logger')

// Configuração do Prisma Client
const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query'
    },
    {
      emit: 'event',
      level: 'error'
    },
    {
      emit: 'event',
      level: 'info'
    },
    {
      emit: 'event',
      level: 'warn'
    }
  ]
})

// Log de queries em desenvolvimento
if (process.env.NODE_ENV === 'development') {
  prisma.$on('query', (e) => {
    logger.debug('Query: ' + e.query)
    logger.debug('Params: ' + e.params)
    logger.debug('Duration: ' + e.duration + 'ms')
  })
}

// Log de erros
prisma.$on('error', (e) => {
  logger.error('Database error:', e)
})

// Log de informações
prisma.$on('info', (e) => {
  logger.info('Database info:', e.message)
})

// Log de warnings
prisma.$on('warn', (e) => {
  logger.warn('Database warning:', e.message)
})

// Função para conectar ao banco
const connectDatabase = async () => {
  try {
    await prisma.$connect()
    logger.info('✅ Database connected successfully')
  } catch (error) {
    logger.error('❌ Database connection failed:', error)
    process.exit(1)
  }
}

// Função para desconectar do banco
const disconnectDatabase = async () => {
  try {
    await prisma.$disconnect()
    logger.info('✅ Database disconnected successfully')
  } catch (error) {
    logger.error('❌ Database disconnection failed:', error)
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('🔄 Graceful shutdown initiated...')
  await disconnectDatabase()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  logger.info('🔄 Graceful shutdown initiated...')
  await disconnectDatabase()
  process.exit(0)
})

module.exports = {
  prisma,
  connectDatabase,
  disconnectDatabase
}

