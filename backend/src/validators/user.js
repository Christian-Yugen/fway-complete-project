const Joi = require('joi');

// Validação de atualização de perfil
const validateUpdateProfile = (req, res, next) => {
  const schema = Joi.object({
    firstName: Joi.string()
      .min(2)
      .max(50)
      .optional()
      .messages({
        'string.min': 'Nome deve ter pelo menos 2 caracteres',
        'string.max': 'Nome deve ter no máximo 50 caracteres'
      }),
    
    lastName: Joi.string()
      .min(2)
      .max(50)
      .optional()
      .messages({
        'string.min': 'Sobrenome deve ter pelo menos 2 caracteres',
        'string.max': 'Sobrenome deve ter no máximo 50 caracteres'
      }),
    
    phone: Joi.string()
      .pattern(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)
      .optional()
      .allow('')
      .messages({
        'string.pattern.base': 'Telefone deve estar no formato (XX) XXXXX-XXXX'
      }),
    
    dateOfBirth: Joi.date()
      .max('now')
      .optional()
      .messages({
        'date.max': 'Data de nascimento não pode ser no futuro'
      }),
    
    gender: Joi.string()
      .valid('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY')
      .optional(),
    
    bio: Joi.string()
      .max(500)
      .optional()
      .allow('')
      .messages({
        'string.max': 'Bio deve ter no máximo 500 caracteres'
      }),
    
    preferences: Joi.object().optional(),
    
    healthConditions: Joi.array()
      .items(Joi.string())
      .optional(),
    
    allergies: Joi.array()
      .items(Joi.string())
      .optional(),
    
    medications: Joi.array()
      .items(Joi.string())
      .optional(),
    
    emergencyContact: Joi.string()
      .optional()
      .allow(''),
    
    insuranceInfo: Joi.object().optional()
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

// Validação de mudança de senha
const validateChangePassword = (req, res, next) => {
  const schema = Joi.object({
    currentPassword: Joi.string()
      .required()
      .messages({
        'any.required': 'Senha atual é obrigatória'
      }),
    
    newPassword: Joi.string()
      .min(8)
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])'))
      .required()
      .messages({
        'string.min': 'Nova senha deve ter pelo menos 8 caracteres',
        'string.pattern.base': 'Nova senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula, 1 número e 1 caractere especial',
        'any.required': 'Nova senha é obrigatória'
      }),
    
    confirmPassword: Joi.string()
      .valid(Joi.ref('newPassword'))
      .required()
      .messages({
        'any.only': 'Confirmação de senha deve ser igual à nova senha',
        'any.required': 'Confirmação de senha é obrigatória'
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

// Validação de endereço
const validateAddress = (req, res, next) => {
  const schema = Joi.object({
    type: Joi.string()
      .valid('HOME', 'WORK', 'OTHER')
      .required()
      .messages({
        'any.required': 'Tipo de endereço é obrigatório',
        'any.only': 'Tipo deve ser HOME, WORK ou OTHER'
      }),
    
    street: Joi.string()
      .min(5)
      .max(200)
      .required()
      .messages({
        'string.min': 'Rua deve ter pelo menos 5 caracteres',
        'string.max': 'Rua deve ter no máximo 200 caracteres',
        'any.required': 'Rua é obrigatória'
      }),
    
    number: Joi.string()
      .max(20)
      .required()
      .messages({
        'string.max': 'Número deve ter no máximo 20 caracteres',
        'any.required': 'Número é obrigatório'
      }),
    
    complement: Joi.string()
      .max(100)
      .optional()
      .allow('')
      .messages({
        'string.max': 'Complemento deve ter no máximo 100 caracteres'
      }),
    
    neighborhood: Joi.string()
      .min(2)
      .max(100)
      .required()
      .messages({
        'string.min': 'Bairro deve ter pelo menos 2 caracteres',
        'string.max': 'Bairro deve ter no máximo 100 caracteres',
        'any.required': 'Bairro é obrigatório'
      }),
    
    city: Joi.string()
      .min(2)
      .max(100)
      .required()
      .messages({
        'string.min': 'Cidade deve ter pelo menos 2 caracteres',
        'string.max': 'Cidade deve ter no máximo 100 caracteres',
        'any.required': 'Cidade é obrigatória'
      }),
    
    state: Joi.string()
      .length(2)
      .required()
      .messages({
        'string.length': 'Estado deve ter 2 caracteres (ex: SP)',
        'any.required': 'Estado é obrigatório'
      }),
    
    zipCode: Joi.string()
      .pattern(/^\d{5}-?\d{3}$/)
      .required()
      .messages({
        'string.pattern.base': 'CEP deve estar no formato XXXXX-XXX',
        'any.required': 'CEP é obrigatório'
      }),
    
    latitude: Joi.number()
      .min(-90)
      .max(90)
      .optional(),
    
    longitude: Joi.number()
      .min(-180)
      .max(180)
      .optional(),
    
    isDefault: Joi.boolean()
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

// Validação de contato de emergência
const validateEmergencyContact = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string()
      .min(2)
      .max(100)
      .required()
      .messages({
        'string.min': 'Nome deve ter pelo menos 2 caracteres',
        'string.max': 'Nome deve ter no máximo 100 caracteres',
        'any.required': 'Nome é obrigatório'
      }),
    
    relationship: Joi.string()
      .min(2)
      .max(50)
      .required()
      .messages({
        'string.min': 'Parentesco deve ter pelo menos 2 caracteres',
        'string.max': 'Parentesco deve ter no máximo 50 caracteres',
        'any.required': 'Parentesco é obrigatório'
      }),
    
    phone: Joi.string()
      .pattern(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)
      .required()
      .messages({
        'string.pattern.base': 'Telefone deve estar no formato (XX) XXXXX-XXXX',
        'any.required': 'Telefone é obrigatório'
      }),
    
    email: Joi.string()
      .email()
      .optional()
      .allow('')
      .messages({
        'string.email': 'Email deve ter um formato válido'
      }),
    
    isPrimary: Joi.boolean()
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

// Validação de exclusão de conta
const validateDeleteAccount = (req, res, next) => {
  const schema = Joi.object({
    password: Joi.string()
      .required()
      .messages({
        'any.required': 'Senha é obrigatória para confirmar a exclusão'
      }),
    
    reason: Joi.string()
      .max(500)
      .optional()
      .messages({
        'string.max': 'Motivo deve ter no máximo 500 caracteres'
      }),
    
    confirmDeletion: Joi.boolean()
      .valid(true)
      .required()
      .messages({
        'any.only': 'Você deve confirmar a exclusão da conta',
        'any.required': 'Confirmação de exclusão é obrigatória'
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

// Validação de busca de usuários (Admin)
const validateUserSearch = (req, res, next) => {
  const schema = Joi.object({
    search: Joi.string()
      .min(2)
      .max(100)
      .optional()
      .messages({
        'string.min': 'Busca deve ter pelo menos 2 caracteres',
        'string.max': 'Busca deve ter no máximo 100 caracteres'
      }),
    
    isActive: Joi.string()
      .valid('true', 'false')
      .optional(),
    
    isEmailVerified: Joi.string()
      .valid('true', 'false')
      .optional(),
    
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
      .valid('createdAt', 'firstName', 'lastName', 'email', 'lastLoginAt')
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

// Validação de atualização de status (Admin)
const validateStatusUpdate = (req, res, next) => {
  const schema = Joi.object({
    isActive: Joi.boolean()
      .required()
      .messages({
        'any.required': 'Status é obrigatório'
      }),
    
    reason: Joi.string()
      .max(500)
      .optional()
      .messages({
        'string.max': 'Motivo deve ter no máximo 500 caracteres'
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
  validateUpdateProfile,
  validateChangePassword,
  validateAddress,
  validateEmergencyContact,
  validateDeleteAccount,
  validateUserSearch,
  validateStatusUpdate
};

