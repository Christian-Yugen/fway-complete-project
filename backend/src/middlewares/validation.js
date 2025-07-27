const Joi = require('joi')
const { AppError } = require('./errorHandler')

/**
 * Middleware de validação usando Joi
 * @param {Object} schema - Schema de validação Joi
 * @param {string} source - Fonte dos dados ('body', 'query', 'params')
 * @returns {Function} Middleware function
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const data = req[source]
    
    const { error, value } = schema.validate(data, {
      abortEarly: false, // Retorna todos os erros
      allowUnknown: false, // Não permite campos desconhecidos
      stripUnknown: true // Remove campos desconhecidos
    })

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }))

      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors,
        code: 'VALIDATION_ERROR'
      })
    }

    // Substituir os dados originais pelos dados validados e sanitizados
    req[source] = value
    next()
  }
}

/**
 * Schemas de validação comuns
 */
const commonSchemas = {
  // ID válido (CUID)
  id: Joi.string().pattern(/^c[a-z0-9]{24}$/).required().messages({
    'string.pattern.base': 'ID deve ser um CUID válido'
  }),

  // Email
  email: Joi.string().email().lowercase().required().messages({
    'string.email': 'Email deve ter um formato válido'
  }),

  // Senha
  password: Joi.string().min(8).max(128).required().messages({
    'string.min': 'Senha deve ter pelo menos 8 caracteres',
    'string.max': 'Senha deve ter no máximo 128 caracteres'
  }),

  // Nome
  name: Joi.string().min(2).max(50).trim().required().messages({
    'string.min': 'Nome deve ter pelo menos 2 caracteres',
    'string.max': 'Nome deve ter no máximo 50 caracteres'
  }),

  // Telefone brasileiro
  phone: Joi.string().pattern(/^\+55\d{10,11}$/).messages({
    'string.pattern.base': 'Telefone deve estar no formato +55XXXXXXXXXXX'
  }),

  // CPF
  cpf: Joi.string().pattern(/^\d{11}$/).messages({
    'string.pattern.base': 'CPF deve conter 11 dígitos'
  }),

  // CEP
  zipCode: Joi.string().pattern(/^\d{8}$/).messages({
    'string.pattern.base': 'CEP deve conter 8 dígitos'
  }),

  // Data de nascimento
  birthDate: Joi.date().max('now').messages({
    'date.max': 'Data de nascimento não pode ser no futuro'
  }),

  // Paginação
  pagination: {
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc')
  },

  // Coordenadas geográficas
  latitude: Joi.number().min(-90).max(90),
  longitude: Joi.number().min(-180).max(180)
}

/**
 * Schemas específicos para diferentes entidades
 */
const schemas = {
  // Registro de usuário
  userRegister: Joi.object({
    email: commonSchemas.email,
    password: commonSchemas.password,
    firstName: commonSchemas.name,
    lastName: commonSchemas.name,
    phone: commonSchemas.phone.optional(),
    birthDate: commonSchemas.birthDate.optional()
  }),

  // Login
  userLogin: Joi.object({
    email: commonSchemas.email,
    password: Joi.string().required()
  }),

  // Atualização de perfil
  userUpdate: Joi.object({
    firstName: commonSchemas.name.optional(),
    lastName: commonSchemas.name.optional(),
    phone: commonSchemas.phone.optional(),
    birthDate: commonSchemas.birthDate.optional()
  }),

  // Mudança de senha
  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: commonSchemas.password
  }),

  // Reset de senha
  resetPassword: Joi.object({
    token: Joi.string().required(),
    newPassword: commonSchemas.password
  }),

  // Registro de profissional
  professionalRegister: Joi.object({
    type: Joi.string().valid('DOCTOR', 'NURSE', 'PHYSIOTHERAPIST', 'PSYCHOLOGIST', 'NUTRITIONIST', 'OTHER').required(),
    specialization: Joi.string().min(2).max(100).required(),
    license: Joi.string().min(3).max(20).required(),
    experience: Joi.number().integer().min(0).max(50).required(),
    address: Joi.string().min(10).max(200).required(),
    city: Joi.string().min(2).max(50).required(),
    state: Joi.string().length(2).uppercase().required(),
    zipCode: commonSchemas.zipCode,
    consultationFee: Joi.number().positive().optional(),
    latitude: commonSchemas.latitude.optional(),
    longitude: commonSchemas.longitude.optional()
  }),

  // Criação de agendamento
  bookingCreate: Joi.object({
    professionalId: commonSchemas.id,
    serviceId: commonSchemas.id,
    scheduledAt: Joi.date().greater('now').required(),
    notes: Joi.string().max(500).optional()
  }),

  // Atualização de agendamento
  bookingUpdate: Joi.object({
    status: Joi.string().valid('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW').optional(),
    notes: Joi.string().max(500).optional()
  }),

  // Criação de serviço
  serviceCreate: Joi.object({
    name: Joi.string().min(3).max(100).required(),
    description: Joi.string().max(500).optional(),
    price: Joi.number().positive().required(),
    duration: Joi.number().integer().min(15).max(480).required() // 15 min a 8 horas
  }),

  // Avaliação
  reviewCreate: Joi.object({
    rating: Joi.number().integer().min(1).max(5).required(),
    comment: Joi.string().max(1000).optional()
  }),

  // Parâmetros de busca
  searchParams: Joi.object({
    q: Joi.string().min(2).max(100).optional(),
    type: Joi.string().optional(),
    city: Joi.string().optional(),
    state: Joi.string().length(2).uppercase().optional(),
    specialization: Joi.string().optional(),
    minPrice: Joi.number().positive().optional(),
    maxPrice: Joi.number().positive().optional(),
    latitude: commonSchemas.latitude.optional(),
    longitude: commonSchemas.longitude.optional(),
    radius: Joi.number().positive().max(100).optional(), // km
    ...commonSchemas.pagination
  }),

  // Parâmetros de ID
  idParams: Joi.object({
    id: commonSchemas.id
  }),

  // Query de paginação
  paginationQuery: Joi.object(commonSchemas.pagination)
}

/**
 * Validadores específicos para diferentes rotas
 */
const validators = {
  // Auth
  register: validate(schemas.userRegister),
  login: validate(schemas.userLogin),
  changePassword: validate(schemas.changePassword),
  resetPassword: validate(schemas.resetPassword),

  // User
  updateProfile: validate(schemas.userUpdate),
  
  // Professional
  registerProfessional: validate(schemas.professionalRegister),
  
  // Booking
  createBooking: validate(schemas.bookingCreate),
  updateBooking: validate(schemas.bookingUpdate),
  
  // Service
  createService: validate(schemas.serviceCreate),
  
  // Review
  createReview: validate(schemas.reviewCreate),
  
  // Common
  validateId: validate(schemas.idParams, 'params'),
  validatePagination: validate(schemas.paginationQuery, 'query'),
  validateSearch: validate(schemas.searchParams, 'query')
}

/**
 * Função para criar validador customizado
 * @param {Object} schema - Schema Joi
 * @param {string} source - Fonte dos dados
 * @returns {Function} Middleware de validação
 */
const createValidator = (schema, source = 'body') => {
  return validate(schema, source)
}

/**
 * Middleware para sanitizar dados de entrada
 */
const sanitize = (req, res, next) => {
  // Sanitizar strings removendo espaços extras
  const sanitizeObject = (obj) => {
    if (typeof obj === 'string') {
      return obj.trim()
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject)
    }
    
    if (obj && typeof obj === 'object') {
      const sanitized = {}
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeObject(value)
      }
      return sanitized
    }
    
    return obj
  }

  if (req.body) {
    req.body = sanitizeObject(req.body)
  }
  
  if (req.query) {
    req.query = sanitizeObject(req.query)
  }

  next()
}

module.exports = {
  validate,
  validators,
  schemas,
  commonSchemas,
  createValidator,
  sanitize
}

