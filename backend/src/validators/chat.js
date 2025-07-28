const Joi = require('joi');

// Validação de criação de conversa
const validateConversationCreation = (req, res, next) => {
  const schema = Joi.object({
    participantIds: Joi.array()
      .items(Joi.string().uuid())
      .min(1)
      .max(50)
      .required()
      .messages({
        'array.min': 'Deve ter pelo menos 1 participante',
        'array.max': 'Máximo de 50 participantes',
        'any.required': 'Lista de participantes é obrigatória'
      }),
    
    type: Joi.string()
      .valid('DIRECT', 'GROUP', 'BOOKING')
      .optional()
      .default('DIRECT')
      .messages({
        'any.only': 'Tipo deve ser DIRECT, GROUP ou BOOKING'
      }),
    
    title: Joi.string()
      .min(2)
      .max(100)
      .when('type', {
        is: 'GROUP',
        then: Joi.required(),
        otherwise: Joi.optional()
      })
      .messages({
        'string.min': 'Título deve ter pelo menos 2 caracteres',
        'string.max': 'Título deve ter no máximo 100 caracteres',
        'any.required': 'Título é obrigatório para grupos'
      }),
    
    bookingId: Joi.string()
      .uuid()
      .when('type', {
        is: 'BOOKING',
        then: Joi.required(),
        otherwise: Joi.forbidden()
      })
      .messages({
        'string.guid': 'ID do agendamento deve ser um UUID válido',
        'any.required': 'ID do agendamento é obrigatório para conversas de agendamento'
      }),
    
    description: Joi.string()
      .max(500)
      .optional()
      .allow('')
      .messages({
        'string.max': 'Descrição deve ter no máximo 500 caracteres'
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

// Validação de criação de mensagem
const validateMessageCreation = (req, res, next) => {
  const schema = Joi.object({
    content: Joi.string()
      .min(1)
      .max(4000)
      .when('type', {
        is: Joi.valid('TEXT', 'REPLY'),
        then: Joi.required(),
        otherwise: Joi.optional().allow('')
      })
      .messages({
        'string.min': 'Mensagem não pode estar vazia',
        'string.max': 'Mensagem deve ter no máximo 4000 caracteres',
        'any.required': 'Conteúdo é obrigatório para mensagens de texto'
      }),
    
    type: Joi.string()
      .valid('TEXT', 'IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT', 'FILE', 'LOCATION', 'CONTACT', 'REPLY')
      .optional()
      .default('TEXT')
      .messages({
        'any.only': 'Tipo deve ser TEXT, IMAGE, VIDEO, AUDIO, DOCUMENT, FILE, LOCATION, CONTACT ou REPLY'
      }),
    
    replyToId: Joi.string()
      .uuid()
      .when('type', {
        is: 'REPLY',
        then: Joi.required(),
        otherwise: Joi.optional()
      })
      .messages({
        'string.guid': 'ID da mensagem de resposta deve ser um UUID válido',
        'any.required': 'ID da mensagem original é obrigatório para respostas'
      }),
    
    metadata: Joi.object({
      location: Joi.object({
        latitude: Joi.number().min(-90).max(90).required(),
        longitude: Joi.number().min(-180).max(180).required(),
        address: Joi.string().max(200).optional()
      }).when('type', {
        is: 'LOCATION',
        then: Joi.required(),
        otherwise: Joi.forbidden()
      }),
      
      contact: Joi.object({
        name: Joi.string().min(2).max(100).required(),
        phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]{10,20}$/).optional(),
        email: Joi.string().email().optional()
      }).when('type', {
        is: 'CONTACT',
        then: Joi.required(),
        otherwise: Joi.forbidden()
      }),
      
      duration: Joi.number()
        .positive()
        .max(3600)
        .when('type', {
          is: 'AUDIO',
          then: Joi.optional(),
          otherwise: Joi.forbidden()
        })
        .messages({
          'number.max': 'Duração máxima de áudio é 1 hora'
        }),
      
      dimensions: Joi.object({
        width: Joi.number().positive().required(),
        height: Joi.number().positive().required()
      }).when('type', {
        is: Joi.valid('IMAGE', 'VIDEO'),
        then: Joi.optional(),
        otherwise: Joi.forbidden()
      })
    }).optional(),
    
    priority: Joi.string()
      .valid('LOW', 'NORMAL', 'HIGH', 'URGENT')
      .optional()
      .default('NORMAL')
      .messages({
        'any.only': 'Prioridade deve ser LOW, NORMAL, HIGH ou URGENT'
      }),
    
    expiresAt: Joi.date()
      .min('now')
      .optional()
      .messages({
        'date.min': 'Data de expiração deve ser no futuro'
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

// Validação de atualização de mensagem
const validateMessageUpdate = (req, res, next) => {
  const schema = Joi.object({
    content: Joi.string()
      .min(1)
      .max(4000)
      .required()
      .messages({
        'string.min': 'Mensagem não pode estar vazia',
        'string.max': 'Mensagem deve ter no máximo 4000 caracteres',
        'any.required': 'Conteúdo é obrigatório'
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

// Validação de busca de mensagens
const validateMessageSearch = (req, res, next) => {
  const schema = Joi.object({
    query: Joi.string()
      .min(2)
      .max(100)
      .required()
      .messages({
        'string.min': 'Busca deve ter pelo menos 2 caracteres',
        'string.max': 'Busca deve ter no máximo 100 caracteres',
        'any.required': 'Termo de busca é obrigatório'
      }),
    
    conversationId: Joi.string()
      .uuid()
      .optional()
      .messages({
        'string.guid': 'ID da conversa deve ser um UUID válido'
      }),
    
    type: Joi.string()
      .valid('TEXT', 'IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT', 'FILE')
      .optional(),
    
    senderId: Joi.string()
      .uuid()
      .optional()
      .messages({
        'string.guid': 'ID do remetente deve ser um UUID válido'
      }),
    
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
      .valid('createdAt', 'relevance')
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

// Validação de adição de participante
const validateAddParticipant = (req, res, next) => {
  const schema = Joi.object({
    userIds: Joi.array()
      .items(Joi.string().uuid())
      .min(1)
      .max(10)
      .required()
      .messages({
        'array.min': 'Deve adicionar pelo menos 1 usuário',
        'array.max': 'Máximo de 10 usuários por vez',
        'any.required': 'Lista de usuários é obrigatória'
      }),
    
    role: Joi.string()
      .valid('MEMBER', 'ADMIN')
      .optional()
      .default('MEMBER')
      .messages({
        'any.only': 'Papel deve ser MEMBER ou ADMIN'
      }),
    
    welcomeMessage: Joi.string()
      .max(500)
      .optional()
      .allow('')
      .messages({
        'string.max': 'Mensagem de boas-vindas deve ter no máximo 500 caracteres'
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

// Validação de atualização de participante
const validateUpdateParticipant = (req, res, next) => {
  const schema = Joi.object({
    role: Joi.string()
      .valid('MEMBER', 'ADMIN')
      .optional()
      .messages({
        'any.only': 'Papel deve ser MEMBER ou ADMIN'
      }),
    
    permissions: Joi.object({
      canSendMessages: Joi.boolean().optional(),
      canAddMembers: Joi.boolean().optional(),
      canRemoveMembers: Joi.boolean().optional(),
      canEditGroup: Joi.boolean().optional(),
      canDeleteMessages: Joi.boolean().optional()
    }).optional(),
    
    nickname: Joi.string()
      .min(2)
      .max(50)
      .optional()
      .allow('')
      .messages({
        'string.min': 'Apelido deve ter pelo menos 2 caracteres',
        'string.max': 'Apelido deve ter no máximo 50 caracteres'
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

// Validação de configurações de conversa
const validateConversationSettings = (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string()
      .min(2)
      .max(100)
      .optional()
      .messages({
        'string.min': 'Título deve ter pelo menos 2 caracteres',
        'string.max': 'Título deve ter no máximo 100 caracteres'
      }),
    
    description: Joi.string()
      .max(500)
      .optional()
      .allow('')
      .messages({
        'string.max': 'Descrição deve ter no máximo 500 caracteres'
      }),
    
    settings: Joi.object({
      allowMembersToAddOthers: Joi.boolean().optional(),
      allowMembersToEditGroup: Joi.boolean().optional(),
      onlyAdminsCanSend: Joi.boolean().optional(),
      disappearingMessages: Joi.object({
        enabled: Joi.boolean().required(),
        duration: Joi.number().integer().min(60).max(604800).when('enabled', {
          is: true,
          then: Joi.required(),
          otherwise: Joi.forbidden()
        })
      }).optional(),
      autoDeleteMedia: Joi.object({
        enabled: Joi.boolean().required(),
        afterDays: Joi.number().integer().min(1).max(365).when('enabled', {
          is: true,
          then: Joi.required(),
          otherwise: Joi.forbidden()
        })
      }).optional(),
      readReceipts: Joi.boolean().optional(),
      typingIndicators: Joi.boolean().optional()
    }).optional(),
    
    privacy: Joi.string()
      .valid('PUBLIC', 'PRIVATE', 'INVITE_ONLY')
      .optional()
      .messages({
        'any.only': 'Privacidade deve ser PUBLIC, PRIVATE ou INVITE_ONLY'
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

// Validação de reação a mensagem
const validateMessageReaction = (req, res, next) => {
  const schema = Joi.object({
    emoji: Joi.string()
      .pattern(/^[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]$/u)
      .required()
      .messages({
        'string.pattern.base': 'Deve ser um emoji válido',
        'any.required': 'Emoji é obrigatório'
      }),
    
    action: Joi.string()
      .valid('ADD', 'REMOVE')
      .optional()
      .default('ADD')
      .messages({
        'any.only': 'Ação deve ser ADD ou REMOVE'
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

// Validação de relatório de conversa
const validateConversationReport = (req, res, next) => {
  const schema = Joi.object({
    reason: Joi.string()
      .valid(
        'SPAM',
        'HARASSMENT',
        'INAPPROPRIATE_CONTENT',
        'FAKE_PROFILE',
        'SCAM',
        'VIOLENCE',
        'HATE_SPEECH',
        'OTHER'
      )
      .required()
      .messages({
        'any.only': 'Motivo deve ser uma das opções válidas',
        'any.required': 'Motivo é obrigatório'
      }),
    
    description: Joi.string()
      .min(10)
      .max(1000)
      .required()
      .messages({
        'string.min': 'Descrição deve ter pelo menos 10 caracteres',
        'string.max': 'Descrição deve ter no máximo 1000 caracteres',
        'any.required': 'Descrição é obrigatória'
      }),
    
    messageIds: Joi.array()
      .items(Joi.string().uuid())
      .max(10)
      .optional()
      .messages({
        'array.max': 'Máximo de 10 mensagens por relatório'
      }),
    
    evidence: Joi.array()
      .items(Joi.string().uri())
      .max(5)
      .optional()
      .messages({
        'array.max': 'Máximo de 5 evidências'
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

module.exports = {
  validateConversationCreation,
  validateMessageCreation,
  validateMessageUpdate,
  validateMessageSearch,
  validateAddParticipant,
  validateUpdateParticipant,
  validateConversationSettings,
  validateMessageReaction,
  validateConversationReport
};

