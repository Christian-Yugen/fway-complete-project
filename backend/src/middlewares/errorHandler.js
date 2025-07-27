const logger = require('../config/logger')

/**
 * Classe para erros personalizados da aplicação
 */
class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', isOperational = true) {
    super(message)
    
    this.statusCode = statusCode
    this.code = code
    this.isOperational = isOperational
    this.timestamp = new Date().toISOString()
    
    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * Middleware de tratamento de erros
 * Deve ser o último middleware da aplicação
 */
const errorHandler = (error, req, res, next) => {
  let err = { ...error }
  err.message = error.message

  // Log do erro
  logger.errorLog(error, req)

  // Erro de validação do Joi
  if (error.isJoi) {
    const message = 'Dados inválidos'
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }))
    
    return res.status(400).json({
      success: false,
      message,
      errors,
      code: 'VALIDATION_ERROR'
    })
  }

  // Erro de validação do Prisma
  if (error.code === 'P2002') {
    const field = error.meta?.target?.[0] || 'campo'
    const message = `${field} já está em uso`
    
    return res.status(400).json({
      success: false,
      message,
      code: 'DUPLICATE_FIELD'
    })
  }

  // Erro de registro não encontrado do Prisma
  if (error.code === 'P2025') {
    const message = 'Registro não encontrado'
    
    return res.status(404).json({
      success: false,
      message,
      code: 'NOT_FOUND'
    })
  }

  // Erro de conexão com banco de dados
  if (error.code === 'P1001') {
    const message = 'Não foi possível conectar ao banco de dados'
    
    return res.status(503).json({
      success: false,
      message,
      code: 'DATABASE_CONNECTION_ERROR'
    })
  }

  // Erro de sintaxe JSON
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    const message = 'JSON inválido'
    
    return res.status(400).json({
      success: false,
      message,
      code: 'INVALID_JSON'
    })
  }

  // Erro de arquivo muito grande
  if (error.code === 'LIMIT_FILE_SIZE') {
    const message = 'Arquivo muito grande'
    
    return res.status(413).json({
      success: false,
      message,
      code: 'FILE_TOO_LARGE'
    })
  }

  // Erro de tipo de arquivo não permitido
  if (error.code === 'INVALID_FILE_TYPE') {
    const message = 'Tipo de arquivo não permitido'
    
    return res.status(400).json({
      success: false,
      message,
      code: 'INVALID_FILE_TYPE'
    })
  }

  // Erro personalizado da aplicação
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      code: error.code,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    })
  }

  // Erro de JWT
  if (error.name === 'JsonWebTokenError') {
    const message = 'Token inválido'
    
    return res.status(401).json({
      success: false,
      message,
      code: 'INVALID_TOKEN'
    })
  }

  if (error.name === 'TokenExpiredError') {
    const message = 'Token expirado'
    
    return res.status(401).json({
      success: false,
      message,
      code: 'TOKEN_EXPIRED'
    })
  }

  // Erro de cast (MongoDB/Mongoose)
  if (error.name === 'CastError') {
    const message = 'ID inválido'
    
    return res.status(400).json({
      success: false,
      message,
      code: 'INVALID_ID'
    })
  }

  // Erro padrão do servidor
  const statusCode = error.statusCode || 500
  const message = error.message || 'Erro interno do servidor'
  const code = error.code || 'INTERNAL_ERROR'

  res.status(statusCode).json({
    success: false,
    message,
    code,
    ...(process.env.NODE_ENV === 'development' && {
      stack: error.stack,
      error: error
    })
  })
}

/**
 * Wrapper para funções async que automaticamente captura erros
 * @param {Function} fn - Função async
 * @returns {Function} Função com tratamento de erro
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

/**
 * Middleware para capturar erros 404
 */
const notFoundHandler = (req, res, next) => {
  const error = new AppError(
    `Rota ${req.originalUrl} não encontrada`,
    404,
    'ROUTE_NOT_FOUND'
  )
  next(error)
}

/**
 * Função para criar erros padronizados
 */
const createError = (message, statusCode = 500, code = 'INTERNAL_ERROR') => {
  return new AppError(message, statusCode, code)
}

/**
 * Erros comuns pré-definidos
 */
const errors = {
  // Autenticação e autorização
  UNAUTHORIZED: () => new AppError('Não autorizado', 401, 'UNAUTHORIZED'),
  FORBIDDEN: () => new AppError('Acesso negado', 403, 'FORBIDDEN'),
  TOKEN_EXPIRED: () => new AppError('Token expirado', 401, 'TOKEN_EXPIRED'),
  INVALID_TOKEN: () => new AppError('Token inválido', 401, 'INVALID_TOKEN'),
  
  // Recursos
  NOT_FOUND: (resource = 'Recurso') => new AppError(`${resource} não encontrado`, 404, 'NOT_FOUND'),
  ALREADY_EXISTS: (resource = 'Recurso') => new AppError(`${resource} já existe`, 409, 'ALREADY_EXISTS'),
  
  // Validação
  VALIDATION_ERROR: (message = 'Dados inválidos') => new AppError(message, 400, 'VALIDATION_ERROR'),
  INVALID_INPUT: (field) => new AppError(`${field} inválido`, 400, 'INVALID_INPUT'),
  REQUIRED_FIELD: (field) => new AppError(`${field} é obrigatório`, 400, 'REQUIRED_FIELD'),
  
  // Negócio
  BUSINESS_RULE: (message) => new AppError(message, 422, 'BUSINESS_RULE_VIOLATION'),
  OPERATION_NOT_ALLOWED: (message) => new AppError(message, 422, 'OPERATION_NOT_ALLOWED'),
  
  // Sistema
  INTERNAL_ERROR: (message = 'Erro interno do servidor') => new AppError(message, 500, 'INTERNAL_ERROR'),
  SERVICE_UNAVAILABLE: (service) => new AppError(`Serviço ${service} indisponível`, 503, 'SERVICE_UNAVAILABLE'),
  
  // Rate limiting
  RATE_LIMIT: () => new AppError('Muitas requisições - tente novamente mais tarde', 429, 'RATE_LIMIT_EXCEEDED'),
  
  // Upload
  FILE_TOO_LARGE: () => new AppError('Arquivo muito grande', 413, 'FILE_TOO_LARGE'),
  INVALID_FILE_TYPE: () => new AppError('Tipo de arquivo não permitido', 400, 'INVALID_FILE_TYPE'),
  
  // Email
  EMAIL_NOT_VERIFIED: () => new AppError('Email não verificado', 403, 'EMAIL_NOT_VERIFIED'),
  EMAIL_ALREADY_VERIFIED: () => new AppError('Email já verificado', 400, 'EMAIL_ALREADY_VERIFIED'),
  
  // Senha
  INVALID_PASSWORD: () => new AppError('Senha inválida', 400, 'INVALID_PASSWORD'),
  WEAK_PASSWORD: () => new AppError('Senha muito fraca', 400, 'WEAK_PASSWORD'),
  
  // Agendamento
  BOOKING_CONFLICT: () => new AppError('Conflito de agendamento', 409, 'BOOKING_CONFLICT'),
  BOOKING_NOT_AVAILABLE: () => new AppError('Horário não disponível', 422, 'BOOKING_NOT_AVAILABLE'),
  
  // Pagamento
  PAYMENT_FAILED: () => new AppError('Falha no pagamento', 402, 'PAYMENT_FAILED'),
  INSUFFICIENT_FUNDS: () => new AppError('Saldo insuficiente', 402, 'INSUFFICIENT_FUNDS')
}

module.exports = {
  AppError,
  errorHandler,
  asyncHandler,
  notFoundHandler,
  createError,
  errors
}

