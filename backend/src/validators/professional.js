const Joi = require('joi');

// Validação de registro profissional
const validateProfessionalRegistration = (req, res, next) => {
  const schema = Joi.object({
    licenseNumber: Joi.string()
      .min(5)
      .max(50)
      .required()
      .messages({
        'string.min': 'Número da licença deve ter pelo menos 5 caracteres',
        'string.max': 'Número da licença deve ter no máximo 50 caracteres',
        'any.required': 'Número da licença é obrigatório'
      }),
    
    specialties: Joi.array()
      .items(Joi.string().min(2).max(100))
      .min(1)
      .max(10)
      .required()
      .messages({
        'array.min': 'Pelo menos uma especialidade é obrigatória',
        'array.max': 'Máximo de 10 especialidades permitidas',
        'any.required': 'Especialidades são obrigatórias'
      }),
    
    experience: Joi.number()
      .integer()
      .min(0)
      .max(50)
      .required()
      .messages({
        'number.min': 'Experiência não pode ser negativa',
        'number.max': 'Experiência máxima de 50 anos',
        'any.required': 'Anos de experiência são obrigatórios'
      }),
    
    education: Joi.array()
      .items(Joi.object({
        institution: Joi.string().min(2).max(200).required(),
        degree: Joi.string().min(2).max(100).required(),
        field: Joi.string().min(2).max(100).required(),
        startYear: Joi.number().integer().min(1950).max(new Date().getFullYear()).required(),
        endYear: Joi.number().integer().min(1950).max(new Date().getFullYear()).required(),
        isCompleted: Joi.boolean().default(true)
      }))
      .min(1)
      .required()
      .messages({
        'array.min': 'Pelo menos uma formação é obrigatória',
        'any.required': 'Formação acadêmica é obrigatória'
      }),
    
    certifications: Joi.array()
      .items(Joi.object({
        name: Joi.string().min(2).max(200).required(),
        issuer: Joi.string().min(2).max(200).required(),
        issueDate: Joi.date().max('now').required(),
        expiryDate: Joi.date().greater(Joi.ref('issueDate')).optional(),
        credentialId: Joi.string().max(100).optional()
      }))
      .optional(),
    
    languages: Joi.array()
      .items(Joi.string().min(2).max(50))
      .min(1)
      .required()
      .messages({
        'array.min': 'Pelo menos um idioma é obrigatório',
        'any.required': 'Idiomas são obrigatórios'
      }),
    
    consultationFee: Joi.number()
      .positive()
      .max(10000)
      .required()
      .messages({
        'number.positive': 'Valor da consulta deve ser positivo',
        'number.max': 'Valor máximo da consulta é R$ 10.000',
        'any.required': 'Valor da consulta é obrigatório'
      }),
    
    bio: Joi.string()
      .max(1000)
      .optional()
      .messages({
        'string.max': 'Bio deve ter no máximo 1000 caracteres'
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

// Validação de atualização de perfil profissional
const validateProfessionalUpdate = (req, res, next) => {
  const schema = Joi.object({
    specialties: Joi.array()
      .items(Joi.string().min(2).max(100))
      .min(1)
      .max(10)
      .optional()
      .messages({
        'array.min': 'Pelo menos uma especialidade é obrigatória',
        'array.max': 'Máximo de 10 especialidades permitidas'
      }),
    
    experience: Joi.number()
      .integer()
      .min(0)
      .max(50)
      .optional()
      .messages({
        'number.min': 'Experiência não pode ser negativa',
        'number.max': 'Experiência máxima de 50 anos'
      }),
    
    education: Joi.array()
      .items(Joi.object({
        institution: Joi.string().min(2).max(200).required(),
        degree: Joi.string().min(2).max(100).required(),
        field: Joi.string().min(2).max(100).required(),
        startYear: Joi.number().integer().min(1950).max(new Date().getFullYear()).required(),
        endYear: Joi.number().integer().min(1950).max(new Date().getFullYear()).required(),
        isCompleted: Joi.boolean().default(true)
      }))
      .optional(),
    
    certifications: Joi.array()
      .items(Joi.object({
        name: Joi.string().min(2).max(200).required(),
        issuer: Joi.string().min(2).max(200).required(),
        issueDate: Joi.date().max('now').required(),
        expiryDate: Joi.date().greater(Joi.ref('issueDate')).optional(),
        credentialId: Joi.string().max(100).optional()
      }))
      .optional(),
    
    languages: Joi.array()
      .items(Joi.string().min(2).max(50))
      .optional(),
    
    consultationFee: Joi.number()
      .positive()
      .max(10000)
      .optional()
      .messages({
        'number.positive': 'Valor da consulta deve ser positivo',
        'number.max': 'Valor máximo da consulta é R$ 10.000'
      }),
    
    isAvailable: Joi.boolean()
      .optional()
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

// Validação de serviço
const validateService = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string()
      .min(3)
      .max(200)
      .required()
      .messages({
        'string.min': 'Nome do serviço deve ter pelo menos 3 caracteres',
        'string.max': 'Nome do serviço deve ter no máximo 200 caracteres',
        'any.required': 'Nome do serviço é obrigatório'
      }),
    
    description: Joi.string()
      .min(10)
      .max(2000)
      .required()
      .messages({
        'string.min': 'Descrição deve ter pelo menos 10 caracteres',
        'string.max': 'Descrição deve ter no máximo 2000 caracteres',
        'any.required': 'Descrição é obrigatória'
      }),
    
    category: Joi.string()
      .valid(
        'CONSULTATION',
        'THERAPY',
        'EXAMINATION',
        'PROCEDURE',
        'EMERGENCY',
        'PREVENTION',
        'REHABILITATION',
        'OTHER'
      )
      .required()
      .messages({
        'any.only': 'Categoria deve ser uma das opções válidas',
        'any.required': 'Categoria é obrigatória'
      }),
    
    subcategory: Joi.string()
      .min(2)
      .max(100)
      .optional()
      .messages({
        'string.min': 'Subcategoria deve ter pelo menos 2 caracteres',
        'string.max': 'Subcategoria deve ter no máximo 100 caracteres'
      }),
    
    duration: Joi.number()
      .integer()
      .min(15)
      .max(480)
      .required()
      .messages({
        'number.min': 'Duração mínima é 15 minutos',
        'number.max': 'Duração máxima é 8 horas (480 minutos)',
        'any.required': 'Duração é obrigatória'
      }),
    
    price: Joi.number()
      .positive()
      .max(10000)
      .required()
      .messages({
        'number.positive': 'Preço deve ser positivo',
        'number.max': 'Preço máximo é R$ 10.000',
        'any.required': 'Preço é obrigatório'
      }),
    
    isActive: Joi.boolean()
      .optional()
      .default(true),
    
    isOnline: Joi.boolean()
      .optional()
      .default(false),
    
    isHomeVisit: Joi.boolean()
      .optional()
      .default(false),
    
    requirements: Joi.array()
      .items(Joi.string().min(2).max(200))
      .optional(),
    
    tags: Joi.array()
      .items(Joi.string().min(2).max(50))
      .max(10)
      .optional()
      .messages({
        'array.max': 'Máximo de 10 tags permitidas'
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

// Validação de localização profissional
const validateLocation = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string()
      .min(2)
      .max(200)
      .required()
      .messages({
        'string.min': 'Nome da localização deve ter pelo menos 2 caracteres',
        'string.max': 'Nome da localização deve ter no máximo 200 caracteres',
        'any.required': 'Nome da localização é obrigatório'
      }),
    
    type: Joi.string()
      .valid('CLINIC', 'HOSPITAL', 'HOME_OFFICE', 'MOBILE', 'ONLINE')
      .required()
      .messages({
        'any.only': 'Tipo deve ser CLINIC, HOSPITAL, HOME_OFFICE, MOBILE ou ONLINE',
        'any.required': 'Tipo de localização é obrigatório'
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
      .required()
      .messages({
        'number.min': 'Latitude deve estar entre -90 e 90',
        'number.max': 'Latitude deve estar entre -90 e 90',
        'any.required': 'Latitude é obrigatória'
      }),
    
    longitude: Joi.number()
      .min(-180)
      .max(180)
      .required()
      .messages({
        'number.min': 'Longitude deve estar entre -180 e 180',
        'number.max': 'Longitude deve estar entre -180 e 180',
        'any.required': 'Longitude é obrigatória'
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

// Validação de horários de trabalho
const validateWorkingHours = (req, res, next) => {
  const schema = Joi.object({
    workingHours: Joi.array()
      .items(Joi.object({
        dayOfWeek: Joi.number()
          .integer()
          .min(0)
          .max(6)
          .required()
          .messages({
            'number.min': 'Dia da semana deve estar entre 0 (domingo) e 6 (sábado)',
            'number.max': 'Dia da semana deve estar entre 0 (domingo) e 6 (sábado)',
            'any.required': 'Dia da semana é obrigatório'
          }),
        
        startTime: Joi.string()
          .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
          .required()
          .messages({
            'string.pattern.base': 'Horário de início deve estar no formato HH:MM',
            'any.required': 'Horário de início é obrigatório'
          }),
        
        endTime: Joi.string()
          .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
          .required()
          .messages({
            'string.pattern.base': 'Horário de fim deve estar no formato HH:MM',
            'any.required': 'Horário de fim é obrigatório'
          }),
        
        isActive: Joi.boolean()
          .optional()
          .default(true)
      }))
      .min(1)
      .max(7)
      .required()
      .messages({
        'array.min': 'Pelo menos um horário de trabalho é obrigatório',
        'array.max': 'Máximo de 7 horários de trabalho (um por dia)',
        'any.required': 'Horários de trabalho são obrigatórios'
      })
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }

  // Validação adicional: horário de fim deve ser maior que horário de início
  const { workingHours } = req.body;
  for (const hour of workingHours) {
    const [startHour, startMinute] = hour.startTime.split(':').map(Number);
    const [endHour, endMinute] = hour.endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    
    if (endMinutes <= startMinutes) {
      return res.status(400).json({
        success: false,
        message: 'Horário de fim deve ser maior que horário de início'
      });
    }
  }
  
  next();
};

// Validação de disponibilidade específica
const validateAvailability = (req, res, next) => {
  const schema = Joi.object({
    date: Joi.date()
      .min('now')
      .required()
      .messages({
        'date.min': 'Data não pode ser no passado',
        'any.required': 'Data é obrigatória'
      }),
    
    startTime: Joi.string()
      .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .optional()
      .messages({
        'string.pattern.base': 'Horário de início deve estar no formato HH:MM'
      }),
    
    endTime: Joi.string()
      .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .optional()
      .messages({
        'string.pattern.base': 'Horário de fim deve estar no formato HH:MM'
      }),
    
    isAvailable: Joi.boolean()
      .required()
      .messages({
        'any.required': 'Status de disponibilidade é obrigatório'
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

// Validação de busca de profissionais
const validateProfessionalSearch = (req, res, next) => {
  const schema = Joi.object({
    search: Joi.string()
      .min(2)
      .max(100)
      .optional()
      .messages({
        'string.min': 'Busca deve ter pelo menos 2 caracteres',
        'string.max': 'Busca deve ter no máximo 100 caracteres'
      }),
    
    specialty: Joi.string()
      .min(2)
      .max(100)
      .optional(),
    
    city: Joi.string()
      .min(2)
      .max(100)
      .optional(),
    
    state: Joi.string()
      .length(2)
      .optional(),
    
    isVerified: Joi.string()
      .valid('true', 'false')
      .optional(),
    
    isAvailable: Joi.string()
      .valid('true', 'false')
      .optional(),
    
    minRating: Joi.number()
      .min(0)
      .max(5)
      .optional(),
    
    maxPrice: Joi.number()
      .positive()
      .max(10000)
      .optional(),
    
    latitude: Joi.number()
      .min(-90)
      .max(90)
      .optional(),
    
    longitude: Joi.number()
      .min(-180)
      .max(180)
      .optional(),
    
    radius: Joi.number()
      .positive()
      .max(1000)
      .optional()
      .default(50),
    
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
      .valid('rating', 'price', 'experience', 'reviews', 'distance')
      .optional()
      .default('rating'),
    
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
  validateProfessionalRegistration,
  validateProfessionalUpdate,
  validateService,
  validateLocation,
  validateWorkingHours,
  validateAvailability,
  validateProfessionalSearch
};

