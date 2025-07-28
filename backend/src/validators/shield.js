const Joi = require('joi');

// Validação de criação de cobertura
const validateCoverageCreation = (req, res, next) => {
  const schema = Joi.object({
    coverageId: Joi.string()
      .uuid()
      .required()
      .messages({
        'string.guid': 'ID da cobertura deve ser um UUID válido',
        'any.required': 'ID da cobertura é obrigatório'
      }),
    
    serviceValue: Joi.number()
      .positive()
      .max(100000)
      .required()
      .messages({
        'number.positive': 'Valor do serviço deve ser positivo',
        'number.max': 'Valor máximo do serviço é R$ 100.000',
        'any.required': 'Valor do serviço é obrigatório'
      }),
    
    duration: Joi.number()
      .integer()
      .min(1)
      .max(365)
      .optional()
      .default(30)
      .messages({
        'number.min': 'Duração mínima é 1 dia',
        'number.max': 'Duração máxima é 365 dias'
      }),
    
    customTerms: Joi.object({
      deductible: Joi.number().min(0).max(1000).optional(),
      maxCoverage: Joi.number().positive().max(100000).optional(),
      excludedRisks: Joi.array().items(Joi.string().max(100)).max(10).optional()
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

// Validação de criação de sinistro
const validateClaimCreation = (req, res, next) => {
  const schema = Joi.object({
    coverageId: Joi.string()
      .uuid()
      .required()
      .messages({
        'string.guid': 'ID da cobertura deve ser um UUID válido',
        'any.required': 'ID da cobertura é obrigatório'
      }),
    
    description: Joi.string()
      .min(20)
      .max(2000)
      .required()
      .messages({
        'string.min': 'Descrição deve ter pelo menos 20 caracteres',
        'string.max': 'Descrição deve ter no máximo 2000 caracteres',
        'any.required': 'Descrição do sinistro é obrigatória'
      }),
    
    amount: Joi.number()
      .positive()
      .max(100000)
      .required()
      .messages({
        'number.positive': 'Valor do sinistro deve ser positivo',
        'number.max': 'Valor máximo do sinistro é R$ 100.000',
        'any.required': 'Valor do sinistro é obrigatório'
      }),
    
    incidentDate: Joi.date()
      .max('now')
      .optional()
      .default(() => new Date(), 'data atual')
      .messages({
        'date.max': 'Data do incidente não pode ser no futuro'
      }),
    
    category: Joi.string()
      .valid(
        'CANCELLATION',
        'FRAUD',
        'DELAY',
        'QUALITY_ISSUE',
        'EMERGENCY',
        'TECHNICAL_PROBLEM',
        'OTHER'
      )
      .optional()
      .messages({
        'any.only': 'Categoria deve ser uma das opções válidas'
      }),
    
    attachments: Joi.array()
      .items(Joi.object({
        filename: Joi.string().max(255).required(),
        url: Joi.string().uri().required(),
        size: Joi.number().positive().max(10485760).required(), // 10MB
        mimeType: Joi.string().required()
      }))
      .max(10)
      .optional()
      .messages({
        'array.max': 'Máximo de 10 anexos por sinistro'
      }),
    
    witnesses: Joi.array()
      .items(Joi.object({
        name: Joi.string().min(2).max(100).required(),
        email: Joi.string().email().optional(),
        phone: Joi.string().pattern(/^\(\d{2}\)\s\d{4,5}-\d{4}$/).optional(),
        statement: Joi.string().max(1000).optional()
      }))
      .max(5)
      .optional()
      .messages({
        'array.max': 'Máximo de 5 testemunhas por sinistro'
      }),
    
    isUrgent: Joi.boolean()
      .optional()
      .default(false),
    
    preferredResolution: Joi.string()
      .valid('REFUND', 'REPLACEMENT', 'REPAIR', 'COMPENSATION', 'OTHER')
      .optional()
      .messages({
        'any.only': 'Resolução preferida deve ser uma das opções válidas'
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

// Validação de mensagem de sinistro
const validateClaimMessage = (req, res, next) => {
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
      .valid('TEXT', 'AUDIO', 'IMAGE', 'DOCUMENT')
      .optional()
      .default('TEXT')
      .messages({
        'any.only': 'Tipo deve ser TEXT, AUDIO, IMAGE ou DOCUMENT'
      }),
    
    attachments: Joi.array()
      .items(Joi.object({
        filename: Joi.string().max(255).required(),
        url: Joi.string().uri().required(),
        size: Joi.number().positive().max(10485760).required(),
        mimeType: Joi.string().required()
      }))
      .max(5)
      .optional()
      .messages({
        'array.max': 'Máximo de 5 anexos por mensagem'
      }),
    
    isInternal: Joi.boolean()
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

// Validação de atualização de sinistro
const validateClaimUpdate = (req, res, next) => {
  const schema = Joi.object({
    status: Joi.string()
      .valid('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CLOSED')
      .optional()
      .messages({
        'any.only': 'Status deve ser PENDING, UNDER_REVIEW, APPROVED, REJECTED ou CLOSED'
      }),
    
    reviewNotes: Joi.string()
      .max(1000)
      .when('status', {
        is: Joi.valid('APPROVED', 'REJECTED'),
        then: Joi.required(),
        otherwise: Joi.optional()
      })
      .messages({
        'string.max': 'Notas de revisão devem ter no máximo 1000 caracteres',
        'any.required': 'Notas de revisão são obrigatórias para aprovação/rejeição'
      }),
    
    approvedAmount: Joi.number()
      .positive()
      .max(100000)
      .when('status', {
        is: 'APPROVED',
        then: Joi.required(),
        otherwise: Joi.forbidden()
      })
      .messages({
        'number.positive': 'Valor aprovado deve ser positivo',
        'number.max': 'Valor máximo aprovado é R$ 100.000',
        'any.required': 'Valor aprovado é obrigatório para aprovação'
      }),
    
    rejectionReason: Joi.string()
      .valid(
        'INSUFFICIENT_EVIDENCE',
        'NOT_COVERED',
        'FRAUDULENT',
        'DUPLICATE',
        'EXPIRED_COVERAGE',
        'OTHER'
      )
      .when('status', {
        is: 'REJECTED',
        then: Joi.required(),
        otherwise: Joi.forbidden()
      })
      .messages({
        'any.only': 'Motivo de rejeição deve ser uma das opções válidas',
        'any.required': 'Motivo de rejeição é obrigatório para rejeição'
      }),
    
    priority: Joi.string()
      .valid('LOW', 'NORMAL', 'HIGH', 'URGENT')
      .optional()
      .messages({
        'any.only': 'Prioridade deve ser LOW, NORMAL, HIGH ou URGENT'
      }),
    
    assignedTo: Joi.string()
      .uuid()
      .optional()
      .messages({
        'string.guid': 'ID do responsável deve ser um UUID válido'
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

// Validação de busca de sinistros
const validateClaimSearch = (req, res, next) => {
  const schema = Joi.object({
    status: Joi.string()
      .valid('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CLOSED')
      .optional(),
    
    type: Joi.string()
      .valid(
        'CANCELLATION',
        'FRAUD',
        'DELAY',
        'QUALITY_ISSUE',
        'EMERGENCY',
        'TECHNICAL_PROBLEM',
        'OTHER'
      )
      .optional(),
    
    severity: Joi.string()
      .valid('LOW', 'MEDIUM', 'HIGH')
      .optional(),
    
    startDate: Joi.date()
      .optional(),
    
    endDate: Joi.date()
      .min(Joi.ref('startDate'))
      .optional()
      .messages({
        'date.min': 'Data final deve ser maior que data inicial'
      }),
    
    minAmount: Joi.number()
      .positive()
      .optional(),
    
    maxAmount: Joi.number()
      .positive()
      .min(Joi.ref('minAmount'))
      .optional()
      .messages({
        'number.min': 'Valor máximo deve ser maior que valor mínimo'
      }),
    
    search: Joi.string()
      .min(2)
      .max(100)
      .optional()
      .messages({
        'string.min': 'Busca deve ter pelo menos 2 caracteres',
        'string.max': 'Busca deve ter no máximo 100 caracteres'
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
      .valid('createdAt', 'amount', 'status', 'severity')
      .optional()
      .default('createdAt'),
    
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

// Validação de resgate de recompensa
const validateRewardRedemption = (req, res, next) => {
  const schema = Joi.object({
    rewardId: Joi.string()
      .uuid()
      .required()
      .messages({
        'string.guid': 'ID da recompensa deve ser um UUID válido',
        'any.required': 'ID da recompensa é obrigatório'
      }),
    
    deliveryAddress: Joi.object({
      street: Joi.string().min(5).max(200).required(),
      number: Joi.string().max(20).required(),
      complement: Joi.string().max(100).optional().allow(''),
      neighborhood: Joi.string().min(2).max(100).required(),
      city: Joi.string().min(2).max(100).required(),
      state: Joi.string().length(2).required(),
      zipCode: Joi.string().pattern(/^\d{5}-?\d{3}$/).required()
    }).optional(),
    
    notes: Joi.string()
      .max(500)
      .optional()
      .allow('')
      .messages({
        'string.max': 'Observações devem ter no máximo 500 caracteres'
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

// Validação de análise de risco
const validateRiskAnalysis = (req, res, next) => {
  const schema = Joi.object({
    userId: Joi.string()
      .uuid()
      .optional()
      .messages({
        'string.guid': 'ID do usuário deve ser um UUID válido'
      }),
    
    period: Joi.string()
      .valid('7d', '30d', '90d', '1y')
      .optional()
      .default('30d')
      .messages({
        'any.only': 'Período deve ser 7d, 30d, 90d ou 1y'
      }),
    
    includeHistory: Joi.boolean()
      .optional()
      .default(true),
    
    includePredictions: Joi.boolean()
      .optional()
      .default(true),
    
    includeRecommendations: Joi.boolean()
      .optional()
      .default(true)
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

// Validação de configuração de Shield
const validateShieldSettings = (req, res, next) => {
  const schema = Joi.object({
    autoApprovalLimit: Joi.number()
      .positive()
      .max(1000)
      .optional()
      .messages({
        'number.positive': 'Limite de aprovação automática deve ser positivo',
        'number.max': 'Limite máximo de aprovação automática é R$ 1.000'
      }),
    
    riskTolerance: Joi.string()
      .valid('LOW', 'MEDIUM', 'HIGH')
      .optional()
      .messages({
        'any.only': 'Tolerância ao risco deve ser LOW, MEDIUM ou HIGH'
      }),
    
    notificationPreferences: Joi.object({
      email: Joi.boolean().optional(),
      sms: Joi.boolean().optional(),
      push: Joi.boolean().optional(),
      frequency: Joi.string().valid('IMMEDIATE', 'DAILY', 'WEEKLY').optional()
    }).optional(),
    
    privacySettings: Joi.object({
      shareDataForAnalysis: Joi.boolean().optional(),
      allowPredictiveAnalysis: Joi.boolean().optional(),
      anonymizeData: Joi.boolean().optional()
    }).optional(),
    
    coveragePreferences: Joi.object({
      autoRenew: Joi.boolean().optional(),
      preferredDuration: Joi.number().integer().min(1).max(365).optional(),
      maxCoverageAmount: Joi.number().positive().max(100000).optional()
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

// Validação de relatório Shield
const validateShieldReport = (req, res, next) => {
  const schema = Joi.object({
    reportType: Joi.string()
      .valid('CLAIMS', 'COVERAGES', 'RISK_ANALYSIS', 'FINANCIAL', 'PERFORMANCE')
      .required()
      .messages({
        'any.only': 'Tipo de relatório deve ser CLAIMS, COVERAGES, RISK_ANALYSIS, FINANCIAL ou PERFORMANCE',
        'any.required': 'Tipo de relatório é obrigatório'
      }),
    
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
    
    format: Joi.string()
      .valid('json', 'csv', 'pdf', 'excel')
      .optional()
      .default('json')
      .messages({
        'any.only': 'Formato deve ser json, csv, pdf ou excel'
      }),
    
    filters: Joi.object({
      status: Joi.array().items(Joi.string()).optional(),
      type: Joi.array().items(Joi.string()).optional(),
      severity: Joi.array().items(Joi.string()).optional(),
      userId: Joi.string().uuid().optional(),
      coverageId: Joi.string().uuid().optional()
    }).optional(),
    
    groupBy: Joi.string()
      .valid('day', 'week', 'month', 'status', 'type', 'user')
      .optional()
      .default('day'),
    
    includeCharts: Joi.boolean()
      .optional()
      .default(false),
    
    includeSummary: Joi.boolean()
      .optional()
      .default(true)
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

module.exports = {
  validateCoverageCreation,
  validateClaimCreation,
  validateClaimMessage,
  validateClaimUpdate,
  validateClaimSearch,
  validateRewardRedemption,
  validateRiskAnalysis,
  validateShieldSettings,
  validateShieldReport
};

