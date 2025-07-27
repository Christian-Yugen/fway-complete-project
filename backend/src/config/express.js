const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const compression = require('compression')
const rateLimit = require('express-rate-limit')
const morgan = require('morgan')
const path = require('path')

const logger = require('./logger')
const { errorHandler, notFoundHandler } = require('../middlewares/errorHandler')


// Importar rotas
const authRoutes = require('../routes/auth')
const userRoutes = require('../routes/user')
const professionalRoutes = require('../routes/professional')
const healthRoutes = require('../routes/health')

// Swagger (apenas em desenvolvimento)
let swaggerUi, specs
if (process.env.NODE_ENV === 'development' && process.env.SWAGGER_ENABLED === 'true') {
  swaggerUi = require('swagger-ui-express')
  specs = require('./swagger')
}

const configureExpress = () => {
  const app = express()

  // Trust proxy (importante para rate limiting e logs)
  app.set('trust proxy', 1)

  // Middleware de segurança
  app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"]
      }
    }
  }))

  // CORS
  const corsOptions = {
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  }
  app.use(cors(corsOptions))

  // Compressão
  app.use(compression())

  // Rate limiting
  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: {
      error: 'Muitas requisições deste IP, tente novamente em alguns minutos.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Função personalizada para gerar chave
    keyGenerator: (req) => {
      return req.ip || req.connection.remoteAddress
    }
  })
  app.use('/api/', limiter)

  // Parsing de JSON e URL encoded
  app.use(express.json({ limit: '10mb' }))
  app.use(express.urlencoded({ extended: true, limit: '10mb' }))

  // Logs HTTP
  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
  } else {
    app.use(morgan('combined', {
      stream: {
        write: (message) => logger.info(message.trim())
      }
    }))
  }

  // Middleware personalizado para logs
  app.use((req, res, next) => {
    const start = Date.now()
    
    res.on('finish', () => {
      const responseTime = Date.now() - start
      logger.httpLog(req, res, responseTime)
    })
    
    next()
  })

  // Servir arquivos estáticos
  app.use('/uploads', express.static(path.join(__dirname, '../../uploads')))

  // Health check (antes das rotas da API)
  if (process.env.HEALTH_CHECK_ENABLED === 'true') {
    const healthRoutes = require('../routes/health');
    app.use('/health', healthRoutes)
  }

  // Documentação Swagger (apenas em desenvolvimento)
  if (process.env.NODE_ENV === 'development' && process.env.SWAGGER_ENABLED === 'true' && swaggerUi && specs) {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Fway API Documentation'
    }))
    logger.info('📚 Swagger documentation available at /api-docs')
  }

  // Configurar rotas da API
  app.use('/api/auth', authRoutes)
  app.use('/api/users', userRoutes)
  app.use('/api/professionals', professionalRoutes)

  // Rota raiz
  app.get('/', (req, res) => {
    res.json({
      message: 'Fway Backend API',
      version: '1.0.0',
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      documentation: process.env.NODE_ENV === 'development' ? '/api-docs' : 'Not available in production'
    })
  })

  console.log('Tipo do notFoundHandler:', typeof notFoundHandler)
  // Middleware de rota não encontrada
  app.use(notFoundHandler)

  console.log('Tipo do errorHandler:', typeof errorHandler)

 
  // Middleware de tratamento de erros (deve ser o último)
  app.use(errorHandler)

  return app
}

module.exports = configureExpress

