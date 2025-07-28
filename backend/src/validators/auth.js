const Joi = require('joi');

// Validação de registro
const validateRegister = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Email deve ter um formato válido',
        'any.required': 'Email é obrigatório'
      }),
    
    password: Joi.string()
      .min(8)
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])'))
      .required()
      .messages({
        'string.min': 'Senha deve ter pelo menos 8 caracteres',
        'string.pattern.base': 'Senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula, 1 número e 1 caractere especial',
        'any.required': 'Senha é obrigatória'
      }),
    
    confirmPassword: Joi.string()
      .valid(Joi.ref('password'))
      .required()
      .messages({
        'any.only': 'Confirmação de senha deve ser igual à senha',
        'any.required': 'Confirmação de senha é obrigatória'
      }),
    
    firstName: Joi.string()
      .min(2)
      .max(50)
      .required()
      .messages({
        'string.min': 'Nome deve ter pelo menos 2 caracteres',
        'string.max': 'Nome deve ter no máximo 50 caracteres',
        'any.required': 'Nome é obrigatório'
      }),
    
    lastName: Joi.string()
      .min(2)
      .max(50)
      .required()
      .messages({
        'string.min': 'Sobrenome deve ter pelo menos 2 caracteres',
        'string.max': 'Sobrenome deve ter no máximo 50 caracteres',
        'any.required': 'Sobrenome é obrigatório'
      }),
    
    phone: Joi.string()
      .pattern(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)
      .optional()
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
    
    acceptTerms: Joi.boolean()
      .valid(true)
      .required()
      .messages({
        'any.only': 'Você deve aceitar os termos de uso',
        'any.required': 'Aceitação dos termos é obrigatória'
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

// Validação de login
const validateLogin = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Email deve ter um formato válido',
        'any.required': 'Email é obrigatório'
      }),
    
    password: Joi.string()
      .required()
      .messages({
        'any.required': 'Senha é obrigatória'
      }),
    
    rememberMe: Joi.boolean().optional()
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

// Validação de esqueci a senha
const validateForgotPassword = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Email deve ter um formato válido',
        'any.required': 'Email é obrigatório'
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

// Validação de reset de senha
const validateResetPassword = (req, res, next) => {
  const schema = Joi.object({
    token: Joi.string()
      .required()
      .messages({
        'any.required': 'Token é obrigatório'
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

module.exports = {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateChangePassword
};

