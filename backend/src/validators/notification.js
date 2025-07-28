const Joi = require('joi');

// Validação para criação de notificação
const validateNotificationCreation = (req, res, next) => {
  const schema = Joi.object({
    userId: Joi.string().uuid().required()
      .messages({
        'string.uuid': 'ID do usuário deve ser um UUID válido',
        'any.required': 'ID do usuário é obrigatório'
      }),
    
    type: Joi.string().valid(
      'BOOKING_CREATED',
      'BOOKING_CONFIRMED', 
      'BOOKING_CANCELLED',
      'BOOKING_REMINDER',
      'BOOKING_COMPLETED',
      'PAYMENT_RECEIVED',
      'PAYMENT_FAILED',
      'PAYMENT_REFUNDED',
      'SHIELD_CLAIM_CREATED',
      'SHIELD_CLAIM_APPROVED',
      'SHIELD_CLAIM_REJECTED',
      'SHIELD_COVERAGE_ACTIVATED',
      'CHAT_MESSAGE',
      'CHAT_NEW_CONVERSATION',
      'SYSTEM_ALERT',
      'SYSTEM_MAINTENANCE',
      'SYSTEM_UPDATE',
      'MARKETING_PROMOTION',
      'MARKETING_NEWSLETTER',
      'SECURITY_LOGIN',
      'SECURITY_PASSWORD_CHANGED',
      'AI_ANALYSIS_COMPLETE',
      'PROFESSIONAL_VERIFIED',
      'REVIEW_REQUEST',
      'SYSTEM_TEST'
    ).required()
      .messages({
        'any.only': 'Tipo de notificação inválido',
        'any.required': 'Tipo de notificação é obrigatório'
      }),
    
    title: Joi.string().min(1).max(100).required()
      .messages({
        'string.min': 'Título deve ter pelo menos 1 caractere',
        'string.max': 'Título deve ter no máximo 100 caracteres',
        'any.required': 'Título é obrigatório'
      }),
    
    message: Joi.string().min(1).max(500).required()
      .messages({
        'string.min': 'Mensagem deve ter pelo menos 1 caractere',
        'string.max': 'Mensagem deve ter no máximo 500 caracteres',
        'any.required': 'Mensagem é obrigatória'
      }),
    
    data: Joi.object().default({})
      .messages({
        'object.base': 'Dados devem ser um objeto válido'
      }),
    
    priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'URGENT').default('MEDIUM')
      .messages({
        'any.only': 'Prioridade deve ser LOW, MEDIUM, HIGH ou URGENT'
      }),
    
    channels: Joi.array().items(
      Joi.string().valid('IN_APP', 'EMAIL', 'SMS', 'PUSH')
    ).min(1).default(['IN_APP'])
      .messages({
        'array.min': 'Pelo menos um canal deve ser especificado',
        'any.only': 'Canal inválido. Use: IN_APP, EMAIL, SMS, PUSH'
      }),
    
    scheduledFor: Joi.date().min('now').optional()
      .messages({
        'date.min': 'Data de agendamento deve ser no futuro',
        'date.base': 'Data de agendamento inválida'
      }),
    
    expiresAt: Joi.date().min(Joi.ref('scheduledFor')).optional()
      .messages({
        'date.min': 'Data de expiração deve ser após o agendamento',
        'date.base': 'Data de expiração inválida'
      })
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }

  next();
};

// Validação para atualização de notificação
const validateNotificationUpdate = (req, res, next) => {
  const schema = Joi.object({
    read: Joi.boolean().optional()
      .messages({
        'boolean.base': 'Status de leitura deve ser verdadeiro ou falso'
      }),
    
    archived: Joi.boolean().optional()
      .messages({
        'boolean.base': 'Status de arquivamento deve ser verdadeiro ou falso'
      })
  }).min(1);

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }

  next();
};

// Validação para configurações de notificação
const validateNotificationSettings = (req, res, next) => {
  const schema = Joi.object({
    enabled: Joi.boolean().required()
      .messages({
        'boolean.base': 'Status geral deve ser verdadeiro ou falso',
        'any.required': 'Status geral é obrigatório'
      }),
    
    email: Joi.boolean().required()
      .messages({
        'boolean.base': 'Notificações por email devem ser verdadeiro ou falso',
        'any.required': 'Configuração de email é obrigatória'
      }),
    
    sms: Joi.boolean().required()
      .messages({
        'boolean.base': 'Notificações por SMS devem ser verdadeiro ou falso',
        'any.required': 'Configuração de SMS é obrigatória'
      }),
    
    push: Joi.boolean().required()
      .messages({
        'boolean.base': 'Push notifications devem ser verdadeiro ou falso',
        'any.required': 'Configuração de push é obrigatória'
      }),
    
    types: Joi.object({
      BOOKING: Joi.boolean().default(true),
      PAYMENT: Joi.boolean().default(true),
      SHIELD: Joi.boolean().default(true),
      CHAT: Joi.boolean().default(true),
      SYSTEM: Joi.boolean().default(true),
      MARKETING: Joi.boolean().default(false),
      SECURITY: Joi.boolean().default(true),
      AI: Joi.boolean().default(true)
    }).required()
      .messages({
        'object.base': 'Tipos de notificação devem ser um objeto válido',
        'any.required': 'Configuração de tipos é obrigatória'
      }),
    
    quietHours: Joi.object({
      enabled: Joi.boolean().default(false),
      startTime: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).when('enabled', {
        is: true,
        then: Joi.required()
      }),
      endTime: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).when('enabled', {
        is: true,
        then: Joi.required()
      })
    }).optional()
      .messages({
        'string.pattern.base': 'Horário deve estar no formato HH:MM',
        'any.required': 'Horário é obrigatório quando horário silencioso está ativado'
      }),
    
    frequency: Joi.object({
      email: Joi.string().valid('IMMEDIATE', 'HOURLY', 'DAILY', 'WEEKLY').default('IMMEDIATE'),
      sms: Joi.string().valid('IMMEDIATE', 'URGENT_ONLY').default('URGENT_ONLY'),
      push: Joi.string().valid('IMMEDIATE', 'HOURLY', 'DAILY').default('IMMEDIATE')
    }).optional()
      .messages({
        'any.only': 'Frequência inválida'
      })
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }

  next();
};

// Validação para busca de notificações
const validateNotificationSearch = (req, res, next) => {
  const schema = Joi.object({
    page: Joi.number().integer().min(1).default(1)
      .messages({
        'number.base': 'Página deve ser um número',
        'number.integer': 'Página deve ser um número inteiro',
        'number.min': 'Página deve ser maior que 0'
      }),
    
    limit: Joi.number().integer().min(1).max(100).default(20)
      .messages({
        'number.base': 'Limite deve ser um número',
        'number.integer': 'Limite deve ser um número inteiro',
        'number.min': 'Limite deve ser maior que 0',
        'number.max': 'Limite deve ser no máximo 100'
      }),
    
    type: Joi.string().valid(
      'BOOKING_CREATED',
      'BOOKING_CONFIRMED', 
      'BOOKING_CANCELLED',
      'BOOKING_REMINDER',
      'BOOKING_COMPLETED',
      'PAYMENT_RECEIVED',
      'PAYMENT_FAILED',
      'PAYMENT_REFUNDED',
      'SHIELD_CLAIM_CREATED',
      'SHIELD_CLAIM_APPROVED',
      'SHIELD_CLAIM_REJECTED',
      'SHIELD_COVERAGE_ACTIVATED',
      'CHAT_MESSAGE',
      'CHAT_NEW_CONVERSATION',
      'SYSTEM_ALERT',
      'SYSTEM_MAINTENANCE',
      'SYSTEM_UPDATE',
      'MARKETING_PROMOTION',
      'MARKETING_NEWSLETTER',
      'SECURITY_LOGIN',
      'SECURITY_PASSWORD_CHANGED',
      'AI_ANALYSIS_COMPLETE',
      'PROFESSIONAL_VERIFIED',
      'REVIEW_REQUEST',
      'SYSTEM_TEST'
    ).optional()
      .messages({
        'any.only': 'Tipo de notificação inválido'
      }),
    
    read: Joi.boolean().optional()
      .messages({
        'boolean.base': 'Status de leitura deve ser verdadeiro ou falso'
      }),
    
    priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'URGENT').optional()
      .messages({
        'any.only': 'Prioridade deve ser LOW, MEDIUM, HIGH ou URGENT'
      }),
    
    startDate: Joi.date().optional()
      .messages({
        'date.base': 'Data inicial inválida'
      }),
    
    endDate: Joi.date().min(Joi.ref('startDate')).optional()
      .messages({
        'date.base': 'Data final inválida',
        'date.min': 'Data final deve ser após a data inicial'
      }),
    
    search: Joi.string().max(100).optional()
      .messages({
        'string.max': 'Termo de busca deve ter no máximo 100 caracteres'
      })
  });

  const { error } = schema.validate(req.query);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Parâmetros de busca inválidos',
      errors: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }

  next();
};

// Validação para teste de notificação
const validateNotificationTest = (req, res, next) => {
  const schema = Joi.object({
    userId: Joi.string().uuid().optional()
      .messages({
        'string.uuid': 'ID do usuário deve ser um UUID válido'
      }),
    
    channels: Joi.array().items(
      Joi.string().valid('IN_APP', 'EMAIL', 'SMS', 'PUSH')
    ).min(1).default(['IN_APP'])
      .messages({
        'array.min': 'Pelo menos um canal deve ser especificado',
        'any.only': 'Canal inválido. Use: IN_APP, EMAIL, SMS, PUSH'
      }),
    
    message: Joi.string().max(500).optional()
      .messages({
        'string.max': 'Mensagem deve ter no máximo 500 caracteres'
      })
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }

  next();
};

// Validação para analytics
const validateNotificationAnalytics = (req, res, next) => {
  const schema = Joi.object({
    period: Joi.string().valid('24h', '7d', '30d', '90d').default('7d')
      .messages({
        'any.only': 'Período deve ser 24h, 7d, 30d ou 90d'
      }),
    
    type: Joi.string().valid(
      'BOOKING_CREATED',
      'BOOKING_CONFIRMED', 
      'BOOKING_CANCELLED',
      'BOOKING_REMINDER',
      'BOOKING_COMPLETED',
      'PAYMENT_RECEIVED',
      'PAYMENT_FAILED',
      'PAYMENT_REFUNDED',
      'SHIELD_CLAIM_CREATED',
      'SHIELD_CLAIM_APPROVED',
      'SHIELD_CLAIM_REJECTED',
      'SHIELD_COVERAGE_ACTIVATED',
      'CHAT_MESSAGE',
      'CHAT_NEW_CONVERSATION',
      'SYSTEM_ALERT',
      'SYSTEM_MAINTENANCE',
      'SYSTEM_UPDATE',
      'MARKETING_PROMOTION',
      'MARKETING_NEWSLETTER',
      'SECURITY_LOGIN',
      'SECURITY_PASSWORD_CHANGED',
      'AI_ANALYSIS_COMPLETE',
      'PROFESSIONAL_VERIFIED',
      'REVIEW_REQUEST',
      'SYSTEM_TEST'
    ).optional()
      .messages({
        'any.only': 'Tipo de notificação inválido'
      }),
    
    channel: Joi.string().valid('IN_APP', 'EMAIL', 'SMS', 'PUSH').optional()
      .messages({
        'any.only': 'Canal inválido. Use: IN_APP, EMAIL, SMS, PUSH'
      })
  });

  const { error } = schema.validate(req.query);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Parâmetros inválidos',
      errors: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }

  next();
};

module.exports = {
  validateNotificationCreation,
  validateNotificationUpdate,
  validateNotificationSettings,
  validateNotificationSearch,
  validateNotificationTest,
  validateNotificationAnalytics
};

