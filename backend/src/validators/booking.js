const Joi = require('joi');

// Validação de criação de agendamento
const validateBookingCreation = (req, res, next) => {
  const schema = Joi.object({
    professionalId: Joi.string()
      .uuid()
      .required()
      .messages({
        'string.guid': 'ID do profissional deve ser um UUID válido',
        'any.required': 'ID do profissional é obrigatório'
      }),
    
    serviceId: Joi.string()
      .uuid()
      .required()
      .messages({
        'string.guid': 'ID do serviço deve ser um UUID válido',
        'any.required': 'ID do serviço é obrigatório'
      }),
    
    scheduledAt: Joi.date()
      .min('now')
      .required()
      .messages({
        'date.min': 'Data do agendamento não pode ser no passado',
        'any.required': 'Data e hora do agendamento são obrigatórias'
      }),
    
    duration: Joi.number()
      .integer()
      .min(15)
      .max(480)
      .optional()
      .messages({
        'number.min': 'Duração mínima é 15 minutos',
        'number.max': 'Duração máxima é 8 horas (480 minutos)'
      }),
    
    type: Joi.string()
      .valid('IN_PERSON', 'ONLINE', 'HOME_VISIT')
      .required()
      .messages({
        'any.only': 'Tipo deve ser IN_PERSON, ONLINE ou HOME_VISIT',
        'any.required': 'Tipo de atendimento é obrigatório'
      }),
    
    location: Joi.object({
      type: Joi.string().valid('PROFESSIONAL_LOCATION', 'USER_ADDRESS', 'CUSTOM').required(),
      address: Joi.when('type', {
        is: 'CUSTOM',
        then: Joi.object({
          street: Joi.string().min(5).max(200).required(),
          number: Joi.string().max(20).required(),
          complement: Joi.string().max(100).optional().allow(''),
          neighborhood: Joi.string().min(2).max(100).required(),
          city: Joi.string().min(2).max(100).required(),
          state: Joi.string().length(2).required(),
          zipCode: Joi.string().pattern(/^\d{5}-?\d{3}$/).required()
        }).required(),
        otherwise: Joi.forbidden()
      }),
      professionalLocationId: Joi.when('type', {
        is: 'PROFESSIONAL_LOCATION',
        then: Joi.string().uuid().required(),
        otherwise: Joi.forbidden()
      }),
      userAddressId: Joi.when('type', {
        is: 'USER_ADDRESS',
        then: Joi.string().uuid().required(),
        otherwise: Joi.forbidden()
      })
    }).when('type', {
      is: Joi.valid('IN_PERSON', 'HOME_VISIT'),
      then: Joi.required(),
      otherwise: Joi.forbidden()
    }),
    
    notes: Joi.string()
      .max(1000)
      .optional()
      .allow('')
      .messages({
        'string.max': 'Observações devem ter no máximo 1000 caracteres'
      }),
    
    emergencyContact: Joi.object({
      name: Joi.string().min(2).max(100).required(),
      phone: Joi.string().pattern(/^\(\d{2}\)\s\d{4,5}-\d{4}$/).required(),
      relationship: Joi.string().min(2).max(50).required()
    }).optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  
  next();
};

// Validação de atualização de status
const validateStatusUpdate = (req, res, next) => {
  const schema = Joi.object({
    status: Joi.string()
      .valid('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')
      .required()
      .messages({
        'any.only': 'Status deve ser PENDING, CONFIRMED, IN_PROGRESS, COMPLETED ou CANCELLED',
        'any.required': 'Status é obrigatório'
      }),
    
    reason: Joi.string()
      .max(500)
      .when('status', {
        is: 'CANCELLED',
        then: Joi.optional(),
        otherwise: Joi.forbidden()
      })
      .messages({
        'string.max': 'Motivo deve ter no máximo 500 caracteres'
      }),
    
    notes: Joi.string()
      .max(1000)
      .optional()
      .allow('')
      .messages({
        'string.max': 'Observações devem ter no máximo 1000 caracteres'
      })
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  
  next();
};

// Validação de reagendamento
const validateReschedule = (req, res, next) => {
  const schema = Joi.object({
    newScheduledAt: Joi.date()
      .min('now')
      .required()
      .messages({
        'date.min': 'Nova data do agendamento não pode ser no passado',
        'any.required': 'Nova data e hora são obrigatórias'
      }),
    
    reason: Joi.string()
      .min(10)
      .max(500)
      .required()
      .messages({
        'string.min': 'Motivo deve ter pelo menos 10 caracteres',
        'string.max': 'Motivo deve ter no máximo 500 caracteres',
        'any.required': 'Motivo do reagendamento é obrigatório'
      })
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  
  next();
};

// Validação de mensagem no agendamento
const validateMessage = (req, res, next) => {
  const schema = Joi.object({
    content: Joi.string()
      .min(1)
      .max(2000)
      .required()
      .messages({
        'string.min': 'Mensagem não pode estar vazia',
        'string.max': 'Mensagem deve ter no máximo 2000 caracteres',
        'any.required': 'Conteúdo da mensagem é obrigatório'
      }),
    
    type: Joi.string()
      .valid('TEXT', 'IMAGE', 'DOCUMENT', 'AUDIO')
      .optional()
      .default('TEXT')
      .messages({
        'any.only': 'Tipo deve ser TEXT, IMAGE, DOCUMENT ou AUDIO'
      }),
    
    attachments: Joi.array()
      .items(Joi.object({
        filename: Joi.string().required(),
        url: Joi.string().uri().required(),
        size: Joi.number().positive().required(),
        mimeType: Joi.string().required()
      }))
      .max(5)
      .optional()
      .messages({
        'array.max': 'Máximo de 5 anexos por mensagem'
      })
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  
  next();
};

// Validação de busca de agendamentos
const validateBookingSearch = (req, res, next) => {
  const schema = Joi.object({
    status: Joi.string()
      .valid('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')
      .optional(),
    
    type: Joi.string()
      .valid('IN_PERSON', 'ONLINE', 'HOME_VISIT')
      .optional(),
    
    professionalId: Joi.string()
      .uuid()
      .optional(),
    
    userId: Joi.string()
      .uuid()
      .optional(),
    
    serviceId: Joi.string()
      .uuid()
      .optional(),
    
    startDate: Joi.date()
      .optional(),
    
    endDate: Joi.date()
      .min(Joi.ref('startDate'))
      .optional()
      .messages({
        'date.min': 'Data final deve ser maior que data inicial'
      }),
    
    page: Joi.number()
      .integer()
      .min(1)
      .optional()
      .default(1),
    
    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .optional()
      .default(20),
    
    sortBy: Joi.string()
      .valid('scheduledAt', 'createdAt', 'totalAmount', 'status')
      .optional()
      .default('scheduledAt'),
    
    sortOrder: Joi.string()
      .valid('asc', 'desc')
      .optional()
      .default('desc')
  });

  const { error } = schema.validate(req.query);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  
  next();
};

// Validação de avaliação de agendamento
const validateBookingReview = (req, res, next) => {
  const schema = Joi.object({
    rating: Joi.number()
      .integer()
      .min(1)
      .max(5)
      .required()
      .messages({
        'number.min': 'Avaliação deve ser entre 1 e 5 estrelas',
        'number.max': 'Avaliação deve ser entre 1 e 5 estrelas',
        'any.required': 'Avaliação é obrigatória'
      }),
    
    comment: Joi.string()
      .min(10)
      .max(1000)
      .optional()
      .allow('')
      .messages({
        'string.min': 'Comentário deve ter pelo menos 10 caracteres',
        'string.max': 'Comentário deve ter no máximo 1000 caracteres'
      }),
    
    categories: Joi.object({
      punctuality: Joi.number().integer().min(1).max(5).optional(),
      communication: Joi.number().integer().min(1).max(5).optional(),
      professionalism: Joi.number().integer().min(1).max(5).optional(),
      quality: Joi.number().integer().min(1).max(5).optional(),
      cleanliness: Joi.number().integer().min(1).max(5).optional()
    }).optional(),
    
    wouldRecommend: Joi.boolean()
      .optional(),
    
    tags: Joi.array()
      .items(Joi.string().min(2).max(50))
      .max(10)
      .optional()
      .messages({
        'array.max': 'Máximo de 10 tags permitidas'
      }),
    
    isAnonymous: Joi.boolean()
      .optional()
      .default(false)
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  
  next();
};

// Validação de disponibilidade
const validateAvailabilityCheck = (req, res, next) => {
  const schema = Joi.object({
    professionalId: Joi.string()
      .uuid()
      .required()
      .messages({
        'string.guid': 'ID do profissional deve ser um UUID válido',
        'any.required': 'ID do profissional é obrigatório'
      }),
    
    date: Joi.date()
      .min('now')
      .optional()
      .default(() => new Date(), 'data atual')
      .messages({
        'date.min': 'Data não pode ser no passado'
      }),
    
    days: Joi.number()
      .integer()
      .min(1)
      .max(90)
      .optional()
      .default(30)
      .messages({
        'number.min': 'Mínimo de 1 dia',
        'number.max': 'Máximo de 90 dias'
      }),
    
    duration: Joi.number()
      .integer()
      .min(15)
      .max(480)
      .optional()
      .default(60)
      .messages({
        'number.min': 'Duração mínima é 15 minutos',
        'number.max': 'Duração máxima é 8 horas (480 minutos)'
      })
  });

  const { error } = schema.validate(req.query);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  
  next();
};

// Validação de relatório de agendamentos
const validateBookingReport = (req, res, next) => {
  const schema = Joi.object({
    startDate: Joi.date()
      .required()
      .messages({
        'any.required': 'Data inicial é obrigatória'
      }),
    
    endDate: Joi.date()
      .min(Joi.ref('startDate'))
      .required()
      .messages({
        'date.min': 'Data final deve ser maior que data inicial',
        'any.required': 'Data final é obrigatória'
      }),
    
    professionalId: Joi.string()
      .uuid()
      .optional(),
    
    serviceCategory: Joi.string()
      .valid('CONSULTATION', 'THERAPY', 'EXAMINATION', 'PROCEDURE', 'EMERGENCY', 'PREVENTION', 'REHABILITATION', 'OTHER')
      .optional(),
    
    status: Joi.array()
      .items(Joi.string().valid('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'))
      .optional(),
    
    format: Joi.string()
      .valid('json', 'csv', 'pdf')
      .optional()
      .default('json'),
    
    groupBy: Joi.string()
      .valid('day', 'week', 'month', 'professional', 'service')
      .optional()
      .default('day')
  });

  const { error } = schema.validate(req.query);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  
  next();
};

module.exports = {
  validateBookingCreation,
  validateStatusUpdate,
  validateReschedule,
  validateMessage,
  validateBookingSearch,
  validateBookingReview,
  validateAvailabilityCheck,
  validateBookingReport
};

