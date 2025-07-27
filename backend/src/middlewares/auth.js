const jwtUtils = require('../utils/jwt')
const { prisma } = require('../config/database')
const logger = require('../config/logger')

/**
 * Middleware de autenticação JWT
 * Verifica se o usuário está autenticado
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    const token = jwtUtils.extractTokenFromHeader(authHeader)

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acesso requerido',
        code: 'MISSING_TOKEN'
      })
    }

    // Verificar e decodificar o token
    const decoded = jwtUtils.verifyAccessToken(token)

    // Buscar usuário no banco para verificar se ainda existe e está ativo
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        firstName: true,
        lastName: true,
        emailVerified: true
      }
    })

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não encontrado',
        code: 'USER_NOT_FOUND'
      })
    }

    if (user.status !== 'ACTIVE') {
      return res.status(401).json({
        success: false,
        message: 'Conta de usuário inativa',
        code: 'ACCOUNT_INACTIVE'
      })
    }

    // Adicionar dados do usuário à requisição
    req.user = user
    req.token = token

    next()
  } catch (error) {
    logger.error('Authentication error:', error)

    if (error.message === 'Access token expired') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado',
        code: 'TOKEN_EXPIRED'
      })
    }

    if (error.message === 'Invalid access token') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido',
        code: 'INVALID_TOKEN'
      })
    }

    return res.status(401).json({
      success: false,
      message: 'Falha na autenticação',
      code: 'AUTHENTICATION_FAILED'
    })
  }
}

/**
 * Middleware para verificar se o usuário tem permissão (RBAC)
 * @param {string|Array} allowedRoles - Roles permitidas
 * @returns {Function} Middleware function
 */
const authorize = (allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não autenticado',
          code: 'NOT_AUTHENTICATED'
        })
      }

      // Converter para array se for string
      const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]

      // Verificar se o usuário tem uma das roles permitidas
      if (!roles.includes(req.user.role)) {
        logger.auditLog('ACCESS_DENIED', 'authorization', req.user.id, {
          requiredRoles: roles,
          userRole: req.user.role,
          resource: req.originalUrl
        })

        return res.status(403).json({
          success: false,
          message: 'Acesso negado - permissões insuficientes',
          code: 'INSUFFICIENT_PERMISSIONS'
        })
      }

      logger.auditLog('ACCESS_GRANTED', 'authorization', req.user.id, {
        userRole: req.user.role,
        resource: req.originalUrl
      })

      next()
    } catch (error) {
      logger.error('Authorization error:', error)
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      })
    }
  }
}

/**
 * Middleware para verificar se o usuário é admin
 */
const requireAdmin = authorize(['ADMIN'])

/**
 * Middleware para verificar se o usuário é profissional ou admin
 */
const requireProfessional = authorize(['PROFESSIONAL', 'ADMIN'])

/**
 * Middleware para verificar se o usuário pode acessar seus próprios dados
 * ou se é admin
 * @param {string} paramName - Nome do parâmetro que contém o ID do usuário
 * @returns {Function} Middleware function
 */
const requireOwnershipOrAdmin = (paramName = 'userId') => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não autenticado',
          code: 'NOT_AUTHENTICATED'
        })
      }

      const resourceUserId = req.params[paramName] || req.body[paramName]
      
      // Admin pode acessar qualquer recurso
      if (req.user.role === 'ADMIN') {
        return next()
      }

      // Usuário só pode acessar seus próprios recursos
      if (req.user.id !== resourceUserId) {
        logger.auditLog('OWNERSHIP_VIOLATION', 'authorization', req.user.id, {
          requestedUserId: resourceUserId,
          resource: req.originalUrl
        })

        return res.status(403).json({
          success: false,
          message: 'Acesso negado - você só pode acessar seus próprios dados',
          code: 'OWNERSHIP_REQUIRED'
        })
      }

      next()
    } catch (error) {
      logger.error('Ownership check error:', error)
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      })
    }
  }
}

/**
 * Middleware para verificar se o email foi verificado
 */
const requireEmailVerification = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
        code: 'NOT_AUTHENTICATED'
      })
    }

    if (!req.user.emailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Email não verificado - verifique seu email antes de continuar',
        code: 'EMAIL_NOT_VERIFIED'
      })
    }

    next()
  } catch (error) {
    logger.error('Email verification check error:', error)
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    })
  }
}

/**
 * Middleware opcional de autenticação
 * Adiciona dados do usuário se autenticado, mas não bloqueia se não estiver
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    const token = jwtUtils.extractTokenFromHeader(authHeader)

    if (!token) {
      return next()
    }

    // Tentar verificar o token
    const decoded = jwtUtils.verifyAccessToken(token)
    
    // Buscar usuário no banco
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        firstName: true,
        lastName: true,
        emailVerified: true
      }
    })

    if (user && user.status === 'ACTIVE') {
      req.user = user
      req.token = token
    }

    next()
  } catch (error) {
    // Em caso de erro, apenas continue sem autenticação
    logger.debug('Optional auth failed:', error.message)
    next()
  }
}

/**
 * Middleware para rate limiting baseado em usuário
 * @param {number} maxRequests - Máximo de requisições
 * @param {number} windowMs - Janela de tempo em ms
 * @returns {Function} Middleware function
 */
const userRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const userRequests = new Map()

  return (req, res, next) => {
    const userId = req.user?.id || req.ip
    const now = Date.now()
    const windowStart = now - windowMs

    // Limpar entradas antigas
    if (userRequests.has(userId)) {
      const requests = userRequests.get(userId).filter(time => time > windowStart)
      userRequests.set(userId, requests)
    } else {
      userRequests.set(userId, [])
    }

    const requests = userRequests.get(userId)

    if (requests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Muitas requisições - tente novamente mais tarde',
        code: 'RATE_LIMIT_EXCEEDED'
      })
    }

    requests.push(now)
    next()
  }
}

module.exports = {
  authenticate,
  authorize,
  requireAdmin,
  requireProfessional,
  requireOwnershipOrAdmin,
  requireEmailVerification,
  optionalAuth,
  userRateLimit,
  // Alias para compatibilidade
  isPrivate: authenticate
}

