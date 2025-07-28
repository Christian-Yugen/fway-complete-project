const Joi = require('joi');

// Validação de adição de fundos à carteira
const validateAddFunds = (req, res, next) => {
  const schema = Joi.object({
    amount: Joi.number()
      .positive()
      .min(10)
      .max(10000)
      .required()
      .messages({
        'number.positive': 'Valor deve ser positivo',
        'number.min': 'Valor mínimo é R$ 10,00',
        'number.max': 'Valor máximo é R$ 10.000,00',
        'any.required': 'Valor é obrigatório'
      }),
    
    paymentMethodId: Joi.string()
      .required()
      .messages({
        'any.required': 'Método de pagamento é obrigatório'
      }),
    
    currency: Joi.string()
      .valid('BRL', 'USD')
      .optional()
      .default('BRL')
      .messages({
        'any.only': 'Moeda deve ser BRL ou USD'
      }),
    
    savePaymentMethod: Joi.boolean()
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

// Validação de saque da carteira
const validateWithdraw = (req, res, next) => {
  const schema = Joi.object({
    amount: Joi.number()
      .positive()
      .min(10)
      .max(50000)
      .required()
      .messages({
        'number.positive': 'Valor deve ser positivo',
        'number.min': 'Valor mínimo de saque é R$ 10,00',
        'number.max': 'Valor máximo de saque é R$ 50.000,00',
        'any.required': 'Valor é obrigatório'
      }),
    
    withdrawalMethod: Joi.string()
      .valid('PIX', 'BANK_TRANSFER')
      .required()
      .messages({
        'any.only': 'Método deve ser PIX ou BANK_TRANSFER',
        'any.required': 'Método de saque é obrigatório'
      }),
    
    pixKey: Joi.string()
      .when('withdrawalMethod', {
        is: 'PIX',
        then: Joi.required(),
        otherwise: Joi.forbidden()
      })
      .messages({
        'any.required': 'Chave PIX é obrigatória para saque via PIX'
      }),
    
    bankAccount: Joi.object({
      bank: Joi.string().min(3).max(50).required(),
      agency: Joi.string().pattern(/^\d{4}-?\d?$/).required(),
      account: Joi.string().pattern(/^\d{5,}-?\d$/).required(),
      accountType: Joi.string().valid('CHECKING', 'SAVINGS').required(),
      holderName: Joi.string().min(2).max(100).required(),
      holderDocument: Joi.string().pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/).required()
    }).when('withdrawalMethod', {
      is: 'BANK_TRANSFER',
      then: Joi.required(),
      otherwise: Joi.forbidden()
    }),
    
    description: Joi.string()
      .max(200)
      .optional()
      .allow('')
      .messages({
        'string.max': 'Descrição deve ter no máximo 200 caracteres'
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

// Validação de pagamento de agendamento
const validateBookingPayment = (req, res, next) => {
  const schema = Joi.object({
    paymentMethod: Joi.string()
      .valid('CREDIT_CARD', 'DEBIT_CARD', 'PIX', 'WALLET')
      .required()
      .messages({
        'any.only': 'Método deve ser CREDIT_CARD, DEBIT_CARD, PIX ou WALLET',
        'any.required': 'Método de pagamento é obrigatório'
      }),
    
    paymentMethodId: Joi.string()
      .when('paymentMethod', {
        is: Joi.valid('CREDIT_CARD', 'DEBIT_CARD'),
        then: Joi.required(),
        otherwise: Joi.optional()
      })
      .messages({
        'any.required': 'ID do método de pagamento é obrigatório para cartões'
      }),
    
    useWallet: Joi.boolean()
      .optional()
      .default(false),
    
    installments: Joi.number()
      .integer()
      .min(1)
      .max(12)
      .when('paymentMethod', {
        is: 'CREDIT_CARD',
        then: Joi.optional().default(1),
        otherwise: Joi.forbidden()
      })
      .messages({
        'number.min': 'Mínimo de 1 parcela',
        'number.max': 'Máximo de 12 parcelas'
      }),
    
    savePaymentMethod: Joi.boolean()
      .optional()
      .default(false),
    
    couponCode: Joi.string()
      .alphanum()
      .min(3)
      .max(20)
      .optional()
      .messages({
        'string.alphanum': 'Código do cupom deve conter apenas letras e números',
        'string.min': 'Código do cupom deve ter pelo menos 3 caracteres',
        'string.max': 'Código do cupom deve ter no máximo 20 caracteres'
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

// Validação de criação de escrow
const validateEscrowCreation = (req, res, next) => {
  const schema = Joi.object({
    bookingId: Joi.string()
      .uuid()
      .required()
      .messages({
        'string.guid': 'ID do agendamento deve ser um UUID válido',
        'any.required': 'ID do agendamento é obrigatório'
      }),
    
    amount: Joi.number()
      .positive()
      .max(100000)
      .required()
      .messages({
        'number.positive': 'Valor deve ser positivo',
        'number.max': 'Valor máximo é R$ 100.000,00',
        'any.required': 'Valor é obrigatório'
      }),
    
    terms: Joi.string()
      .min(20)
      .max(1000)
      .required()
      .messages({
        'string.min': 'Termos devem ter pelo menos 20 caracteres',
        'string.max': 'Termos devem ter no máximo 1000 caracteres',
        'any.required': 'Termos são obrigatórios'
      }),
    
    releaseConditions: Joi.object({
      autoRelease: Joi.boolean().optional().default(false),
      autoReleaseAfterDays: Joi.number().integer().min(1).max(30).optional(),
      requiresBothParties: Joi.boolean().optional().default(false),
      requiresServiceCompletion: Joi.boolean().optional().default(true),
      requiresClientApproval: Joi.boolean().optional().default(true),
      allowDisputeResolution: Joi.boolean().optional().default(true),
      customConditions: Joi.array().items(Joi.string().max(200)).max(5).optional()
    }).required(),
    
    expirationDays: Joi.number()
      .integer()
      .min(1)
      .max(90)
      .optional()
      .default(30)
      .messages({
        'number.min': 'Mínimo de 1 dia',
        'number.max': 'Máximo de 90 dias'
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

// Validação de liberação de escrow
const validateEscrowRelease = (req, res, next) => {
  const schema = Joi.object({
    reason: Joi.string()
      .valid(
        'SERVICE_COMPLETED',
        'CLIENT_APPROVED',
        'MUTUAL_AGREEMENT',
        'DISPUTE_RESOLVED',
        'AUTO_RELEASE',
        'ADMIN_RELEASE'
      )
      .required()
      .messages({
        'any.only': 'Motivo deve ser uma das opções válidas',
        'any.required': 'Motivo da liberação é obrigatório'
      }),
    
    evidence: Joi.object({
      serviceCompletionProof: Joi.array().items(Joi.string().uri()).max(10).optional(),
      clientApprovalScreenshot: Joi.string().uri().optional(),
      communicationLogs: Joi.array().items(Joi.string()).max(20).optional(),
      additionalDocuments: Joi.array().items(Joi.string().uri()).max(5).optional(),
      witnessStatements: Joi.array().items(Joi.object({
        name: Joi.string().min(2).max(100).required(),
        statement: Joi.string().max(500).required(),
        contact: Joi.string().optional()
      })).max(3).optional()
    }).optional(),
    
    notes: Joi.string()
      .max(1000)
      .optional()
      .allow('')
      .messages({
        'string.max': 'Observações devem ter no máximo 1000 caracteres'
      }),
    
    partialRelease: Joi.object({
      amount: Joi.number().positive().required(),
      reason: Joi.string().max(200).required()
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

// Validação de pagamento PIX
const validatePixPayment = (req, res, next) => {
  const schema = Joi.object({
    amount: Joi.number()
      .positive()
      .min(0.01)
      .max(100000)
      .required()
      .messages({
        'number.positive': 'Valor deve ser positivo',
        'number.min': 'Valor mínimo é R$ 0,01',
        'number.max': 'Valor máximo é R$ 100.000,00',
        'any.required': 'Valor é obrigatório'
      }),
    
    description: Joi.string()
      .min(5)
      .max(200)
      .required()
      .messages({
        'string.min': 'Descrição deve ter pelo menos 5 caracteres',
        'string.max': 'Descrição deve ter no máximo 200 caracteres',
        'any.required': 'Descrição é obrigatória'
      }),
    
    bookingId: Joi.string()
      .uuid()
      .optional()
      .messages({
        'string.guid': 'ID do agendamento deve ser um UUID válido'
      }),
    
    expirationMinutes: Joi.number()
      .integer()
      .min(5)
      .max(1440)
      .optional()
      .default(30)
      .messages({
        'number.min': 'Mínimo de 5 minutos',
        'number.max': 'Máximo de 24 horas (1440 minutos)'
      }),
    
    recipientInfo: Joi.object({
      name: Joi.string().min(2).max(100).optional(),
      document: Joi.string().pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/).optional()
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

// Validação de adição de cartão
const validateAddCard = (req, res, next) => {
  const schema = Joi.object({
    paymentMethodId: Joi.string()
      .required()
      .messages({
        'any.required': 'ID do método de pagamento é obrigatório'
      }),
    
    isDefault: Joi.boolean()
      .optional()
      .default(false),
    
    alias: Joi.string()
      .min(2)
      .max(50)
      .optional()
      .messages({
        'string.min': 'Apelido deve ter pelo menos 2 caracteres',
        'string.max': 'Apelido deve ter no máximo 50 caracteres'
      }),
    
    billingAddress: Joi.object({
      street: Joi.string().min(5).max(200).required(),
      number: Joi.string().max(20).required(),
      complement: Joi.string().max(100).optional().allow(''),
      neighborhood: Joi.string().min(2).max(100).required(),
      city: Joi.string().min(2).max(100).required(),
      state: Joi.string().length(2).required(),
      zipCode: Joi.string().pattern(/^\d{5}-?\d{3}$/).required(),
      country: Joi.string().length(2).optional().default('BR')
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

// Validação de adição de chave PIX
const validateAddPixKey = (req, res, next) => {
  const schema = Joi.object({
    key: Joi.string()
      .min(1)
      .max(77)
      .required()
      .messages({
        'string.min': 'Chave PIX não pode estar vazia',
        'string.max': 'Chave PIX deve ter no máximo 77 caracteres',
        'any.required': 'Chave PIX é obrigatória'
      }),
    
    type: Joi.string()
      .valid('CPF', 'CNPJ', 'EMAIL', 'PHONE', 'RANDOM')
      .required()
      .messages({
        'any.only': 'Tipo deve ser CPF, CNPJ, EMAIL, PHONE ou RANDOM',
        'any.required': 'Tipo da chave PIX é obrigatório'
      }),
    
    alias: Joi.string()
      .min(2)
      .max(50)
      .optional()
      .messages({
        'string.min': 'Apelido deve ter pelo menos 2 caracteres',
        'string.max': 'Apelido deve ter no máximo 50 caracteres'
      }),
    
    isDefault: Joi.boolean()
      .optional()
      .default(false),
    
    bankInfo: Joi.object({
      bank: Joi.string().min(3).max(50).required(),
      agency: Joi.string().pattern(/^\d{4}-?\d?$/).required(),
      account: Joi.string().pattern(/^\d{5,}-?\d$/).required()
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

// Validação de transferência
const validateTransfer = (req, res, next) => {
  const schema = Joi.object({
    recipientId: Joi.string()
      .uuid()
      .required()
      .messages({
        'string.guid': 'ID do destinatário deve ser um UUID válido',
        'any.required': 'ID do destinatário é obrigatório'
      }),
    
    amount: Joi.number()
      .positive()
      .min(1)
      .max(50000)
      .required()
      .messages({
        'number.positive': 'Valor deve ser positivo',
        'number.min': 'Valor mínimo é R$ 1,00',
        'number.max': 'Valor máximo é R$ 50.000,00',
        'any.required': 'Valor é obrigatório'
      }),
    
    description: Joi.string()
      .min(5)
      .max(200)
      .required()
      .messages({
        'string.min': 'Descrição deve ter pelo menos 5 caracteres',
        'string.max': 'Descrição deve ter no máximo 200 caracteres',
        'any.required': 'Descrição é obrigatória'
      }),
    
    transferType: Joi.string()
      .valid('INSTANT', 'SCHEDULED')
      .optional()
      .default('INSTANT')
      .messages({
        'any.only': 'Tipo deve ser INSTANT ou SCHEDULED'
      }),
    
    scheduledDate: Joi.date()
      .min('now')
      .when('transferType', {
        is: 'SCHEDULED',
        then: Joi.required(),
        otherwise: Joi.forbidden()
      })
      .messages({
        'date.min': 'Data agendada deve ser no futuro',
        'any.required': 'Data agendada é obrigatória para transferências agendadas'
      }),
    
    password: Joi.string()
      .min(6)
      .required()
      .messages({
        'string.min': 'Senha deve ter pelo menos 6 caracteres',
        'any.required': 'Senha é obrigatória para confirmar transferência'
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

// Validação de busca de transações
const validateTransactionSearch = (req, res, next) => {
  const schema = Joi.object({
    type: Joi.string()
      .valid('DEPOSIT', 'WITHDRAWAL', 'PAYMENT', 'TRANSFER', 'REFUND')
      .optional(),
    
    status: Joi.string()
      .valid('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED')
      .optional(),
    
    method: Joi.string()
      .valid('CREDIT_CARD', 'DEBIT_CARD', 'PIX', 'WALLET', 'BANK_TRANSFER')
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
      .valid('createdAt', 'amount', 'status', 'type')
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

module.exports = {
  validateAddFunds,
  validateWithdraw,
  validateBookingPayment,
  validateEscrowCreation,
  validateEscrowRelease,
  validatePixPayment,
  validateAddCard,
  validateAddPixKey,
  validateTransfer,
  validateTransactionSearch
};

