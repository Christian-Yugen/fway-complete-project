const Joi = require('joi');

// Validação de mensagem de chat com IA
const validateChatMessage = (req, res, next) => {
  const schema = Joi.object({
    message: Joi.string()
      .min(1)
      .max(2000)
      .required()
      .messages({
        'string.min': 'Mensagem não pode estar vazia',
        'string.max': 'Mensagem deve ter no máximo 2000 caracteres',
        'any.required': 'Mensagem é obrigatória'
      }),
    
    context: Joi.object({
      type: Joi.string().valid('GENERAL', 'SYMPTOM', 'APPOINTMENT', 'MEDICATION', 'EMERGENCY').optional(),
      previousSymptoms: Joi.array().items(Joi.string()).max(10).optional(),
      currentMedications: Joi.array().items(Joi.string()).max(20).optional(),
      medicalHistory: Joi.array().items(Joi.string()).max(15).optional(),
      urgency: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'EMERGENCY').optional(),
      patientAge: Joi.number().integer().min(0).max(150).optional(),
      patientGender: Joi.string().valid('MALE', 'FEMALE', 'OTHER').optional()
    }).optional(),
    
    sessionId: Joi.string()
      .uuid()
      .optional()
      .messages({
        'string.guid': 'ID da sessão deve ser um UUID válido'
      }),
    
    language: Joi.string()
      .valid('pt-BR', 'en-US', 'es-ES')
      .optional()
      .default('pt-BR')
      .messages({
        'any.only': 'Idioma deve ser pt-BR, en-US ou es-ES'
      }),
    
    includeRecommendations: Joi.boolean()
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

// Validação de entrada para triagem
const validateTriageInput = (req, res, next) => {
  const schema = Joi.object({
    symptoms: Joi.array()
      .items(Joi.string().min(2).max(200))
      .min(1)
      .max(20)
      .required()
      .messages({
        'array.min': 'Deve informar pelo menos 1 sintoma',
        'array.max': 'Máximo de 20 sintomas',
        'any.required': 'Lista de sintomas é obrigatória'
      }),
    
    duration: Joi.object({
      value: Joi.number().positive().required(),
      unit: Joi.string().valid('MINUTES', 'HOURS', 'DAYS', 'WEEKS', 'MONTHS').required()
    }).required().messages({
      'any.required': 'Duração dos sintomas é obrigatória'
    }),
    
    severity: Joi.number()
      .integer()
      .min(1)
      .max(10)
      .required()
      .messages({
        'number.min': 'Severidade deve ser entre 1 e 10',
        'number.max': 'Severidade deve ser entre 1 e 10',
        'any.required': 'Severidade é obrigatória'
      }),
    
    age: Joi.number()
      .integer()
      .min(0)
      .max(150)
      .required()
      .messages({
        'number.min': 'Idade deve ser maior que 0',
        'number.max': 'Idade deve ser menor que 150',
        'any.required': 'Idade é obrigatória'
      }),
    
    gender: Joi.string()
      .valid('MALE', 'FEMALE', 'OTHER')
      .required()
      .messages({
        'any.only': 'Gênero deve ser MALE, FEMALE ou OTHER',
        'any.required': 'Gênero é obrigatório'
      }),
    
    medicalHistory: Joi.array()
      .items(Joi.object({
        condition: Joi.string().min(2).max(200).required(),
        diagnosed: Joi.date().max('now').optional(),
        status: Joi.string().valid('ACTIVE', 'RESOLVED', 'CHRONIC').optional(),
        medications: Joi.array().items(Joi.string()).max(10).optional()
      }))
      .max(15)
      .optional()
      .messages({
        'array.max': 'Máximo de 15 condições no histórico médico'
      }),
    
    currentMedications: Joi.array()
      .items(Joi.object({
        name: Joi.string().min(2).max(200).required(),
        dosage: Joi.string().max(100).optional(),
        frequency: Joi.string().max(100).optional(),
        startDate: Joi.date().max('now').optional()
      }))
      .max(20)
      .optional()
      .messages({
        'array.max': 'Máximo de 20 medicamentos atuais'
      }),
    
    allergies: Joi.array()
      .items(Joi.string().min(2).max(200))
      .max(10)
      .optional()
      .messages({
        'array.max': 'Máximo de 10 alergias'
      }),
    
    vitalSigns: Joi.object({
      temperature: Joi.number().min(30).max(45).optional(),
      bloodPressure: Joi.object({
        systolic: Joi.number().min(50).max(300).required(),
        diastolic: Joi.number().min(30).max(200).required()
      }).optional(),
      heartRate: Joi.number().min(30).max(250).optional(),
      respiratoryRate: Joi.number().min(5).max(60).optional(),
      oxygenSaturation: Joi.number().min(70).max(100).optional()
    }).optional(),
    
    location: Joi.object({
      latitude: Joi.number().min(-90).max(90).optional(),
      longitude: Joi.number().min(-180).max(180).optional(),
      address: Joi.string().max(300).optional()
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

// Validação de análise de sentimento
const validateSentimentAnalysis = (req, res, next) => {
  const schema = Joi.object({
    text: Joi.string()
      .min(1)
      .max(5000)
      .required()
      .messages({
        'string.min': 'Texto não pode estar vazio',
        'string.max': 'Texto deve ter no máximo 5000 caracteres',
        'any.required': 'Texto é obrigatório'
      }),
    
    context: Joi.object({
      source: Joi.string().valid('CHAT', 'REVIEW', 'FEEDBACK', 'COMPLAINT', 'SURVEY').optional(),
      category: Joi.string().valid('MEDICAL', 'SERVICE', 'GENERAL', 'SUPPORT').optional(),
      language: Joi.string().valid('pt-BR', 'en-US', 'es-ES').optional().default('pt-BR'),
      metadata: Joi.object().optional()
    }).optional(),
    
    includeEmotions: Joi.boolean()
      .optional()
      .default(false),
    
    includeKeywords: Joi.boolean()
      .optional()
      .default(true),
    
    confidenceThreshold: Joi.number()
      .min(0)
      .max(1)
      .optional()
      .default(0.5)
      .messages({
        'number.min': 'Limite de confiança deve ser entre 0 e 1',
        'number.max': 'Limite de confiança deve ser entre 0 e 1'
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

// Validação de extração NLP
const validateNLPExtraction = (req, res, next) => {
  const schema = Joi.object({
    text: Joi.string()
      .min(1)
      .max(10000)
      .required()
      .messages({
        'string.min': 'Texto não pode estar vazio',
        'string.max': 'Texto deve ter no máximo 10000 caracteres',
        'any.required': 'Texto é obrigatório'
      }),
    
    extractionType: Joi.string()
      .valid('ENTITIES', 'INTENT', 'KEYWORDS', 'SYMPTOMS', 'MEDICATIONS', 'ALL')
      .required()
      .messages({
        'any.only': 'Tipo deve ser ENTITIES, INTENT, KEYWORDS, SYMPTOMS, MEDICATIONS ou ALL',
        'any.required': 'Tipo de extração é obrigatório'
      }),
    
    language: Joi.string()
      .valid('pt-BR', 'en-US', 'es-ES')
      .optional()
      .default('pt-BR')
      .messages({
        'any.only': 'Idioma deve ser pt-BR, en-US ou es-ES'
      }),
    
    confidenceThreshold: Joi.number()
      .min(0)
      .max(1)
      .optional()
      .default(0.5)
      .messages({
        'number.min': 'Limite de confiança deve ser entre 0 e 1',
        'number.max': 'Limite de confiança deve ser entre 0 e 1'
      }),
    
    maxEntities: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .optional()
      .default(20)
      .messages({
        'number.min': 'Mínimo de 1 entidade',
        'number.max': 'Máximo de 100 entidades'
      }),
    
    includePositions: Joi.boolean()
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

// Validação de solicitação de recomendações
const validateRecommendationRequest = (req, res, next) => {
  const schema = Joi.object({
    type: Joi.string()
      .valid('PROFESSIONALS', 'SERVICES', 'TREATMENTS', 'MEDICATIONS', 'LIFESTYLE', 'PREVENTION')
      .required()
      .messages({
        'any.only': 'Tipo deve ser PROFESSIONALS, SERVICES, TREATMENTS, MEDICATIONS, LIFESTYLE ou PREVENTION',
        'any.required': 'Tipo de recomendação é obrigatório'
      }),
    
    preferences: Joi.object({
      location: Joi.object({
        latitude: Joi.number().min(-90).max(90).optional(),
        longitude: Joi.number().min(-180).max(180).optional(),
        radius: Joi.number().min(1).max(100).optional().default(10),
        city: Joi.string().max(100).optional(),
        state: Joi.string().max(100).optional()
      }).optional(),
      
      budget: Joi.object({
        min: Joi.number().min(0).optional(),
        max: Joi.number().min(0).optional(),
        currency: Joi.string().valid('BRL', 'USD').optional().default('BRL')
      }).optional(),
      
      availability: Joi.object({
        days: Joi.array().items(Joi.string().valid('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY')).optional(),
        timeSlots: Joi.array().items(Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)).optional(),
        urgency: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'EMERGENCY').optional()
      }).optional(),
      
      specialties: Joi.array()
        .items(Joi.string().max(100))
        .max(10)
        .optional()
        .messages({
          'array.max': 'Máximo de 10 especialidades'
        }),
      
      languages: Joi.array()
        .items(Joi.string().valid('pt-BR', 'en-US', 'es-ES'))
        .max(5)
        .optional()
        .messages({
          'array.max': 'Máximo de 5 idiomas'
        }),
      
      gender: Joi.string()
        .valid('MALE', 'FEMALE', 'ANY')
        .optional()
        .default('ANY')
        .messages({
          'any.only': 'Gênero deve ser MALE, FEMALE ou ANY'
        }),
      
      experience: Joi.object({
        minYears: Joi.number().integer().min(0).max(50).optional(),
        certifications: Joi.array().items(Joi.string()).max(10).optional()
      }).optional()
    }).optional(),
    
    context: Joi.object({
      symptoms: Joi.array().items(Joi.string()).max(20).optional(),
      medicalHistory: Joi.array().items(Joi.string()).max(15).optional(),
      currentTreatments: Joi.array().items(Joi.string()).max(10).optional(),
      allergies: Joi.array().items(Joi.string()).max(10).optional(),
      lifestyle: Joi.object({
        smokingStatus: Joi.string().valid('NEVER', 'FORMER', 'CURRENT').optional(),
        alcoholConsumption: Joi.string().valid('NONE', 'LIGHT', 'MODERATE', 'HEAVY').optional(),
        exerciseFrequency: Joi.string().valid('NONE', 'LIGHT', 'MODERATE', 'INTENSE').optional(),
        dietType: Joi.string().valid('REGULAR', 'VEGETARIAN', 'VEGAN', 'KETO', 'OTHER').optional()
      }).optional(),
      previousExperiences: Joi.array().items(Joi.object({
        professionalId: Joi.string().uuid().optional(),
        rating: Joi.number().min(1).max(5).optional(),
        feedback: Joi.string().max(500).optional()
      })).max(10).optional()
    }).optional(),
    
    maxResults: Joi.number()
      .integer()
      .min(1)
      .max(50)
      .optional()
      .default(10)
      .messages({
        'number.min': 'Mínimo de 1 resultado',
        'number.max': 'Máximo de 50 resultados'
      }),
    
    includeReasoning: Joi.boolean()
      .optional()
      .default(true),
    
    personalizeResults: Joi.boolean()
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

// Validação de avaliação de risco
const validateRiskAssessment = (req, res, next) => {
  const schema = Joi.object({
    factors: Joi.object({
      age: Joi.number().integer().min(0).max(150).required(),
      gender: Joi.string().valid('MALE', 'FEMALE', 'OTHER').required(),
      weight: Joi.number().min(1).max(500).optional(),
      height: Joi.number().min(30).max(300).optional(),
      bloodPressure: Joi.object({
        systolic: Joi.number().min(50).max(300).optional(),
        diastolic: Joi.number().min(30).max(200).optional()
      }).optional(),
      cholesterol: Joi.object({
        total: Joi.number().min(50).max(500).optional(),
        hdl: Joi.number().min(10).max(150).optional(),
        ldl: Joi.number().min(10).max(400).optional()
      }).optional(),
      bloodSugar: Joi.number().min(50).max(500).optional(),
      smokingStatus: Joi.string().valid('NEVER', 'FORMER', 'CURRENT').optional(),
      alcoholConsumption: Joi.string().valid('NONE', 'LIGHT', 'MODERATE', 'HEAVY').optional()
    }).required().messages({
      'any.required': 'Fatores de risco são obrigatórios'
    }),
    
    medicalHistory: Joi.array()
      .items(Joi.object({
        condition: Joi.string().min(2).max(200).required(),
        diagnosed: Joi.date().max('now').optional(),
        familyHistory: Joi.boolean().optional(),
        severity: Joi.string().valid('MILD', 'MODERATE', 'SEVERE').optional()
      }))
      .max(20)
      .optional()
      .messages({
        'array.max': 'Máximo de 20 condições no histórico médico'
      }),
    
    lifestyle: Joi.object({
      exerciseFrequency: Joi.string().valid('NONE', 'LIGHT', 'MODERATE', 'INTENSE').optional(),
      dietQuality: Joi.string().valid('POOR', 'FAIR', 'GOOD', 'EXCELLENT').optional(),
      sleepHours: Joi.number().min(0).max(24).optional(),
      stressLevel: Joi.number().integer().min(1).max(10).optional(),
      occupation: Joi.string().max(100).optional(),
      exposures: Joi.array().items(Joi.string()).max(10).optional()
    }).optional(),
    
    assessmentType: Joi.string()
      .valid('CARDIOVASCULAR', 'DIABETES', 'CANCER', 'GENERAL', 'CUSTOM')
      .optional()
      .default('GENERAL')
      .messages({
        'any.only': 'Tipo deve ser CARDIOVASCULAR, DIABETES, CANCER, GENERAL ou CUSTOM'
      }),
    
    timeHorizon: Joi.string()
      .valid('1_YEAR', '5_YEARS', '10_YEARS', 'LIFETIME')
      .optional()
      .default('10_YEARS')
      .messages({
        'any.only': 'Horizonte temporal deve ser 1_YEAR, 5_YEARS, 10_YEARS ou LIFETIME'
      }),
    
    includeRecommendations: Joi.boolean()
      .optional()
      .default(true),
    
    includePreventiveMeasures: Joi.boolean()
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

// Validação de interação medicamentosa
const validateDrugInteraction = (req, res, next) => {
  const schema = Joi.object({
    medications: Joi.array()
      .items(Joi.object({
        name: Joi.string().min(2).max(200).required(),
        dosage: Joi.string().max(100).optional(),
        frequency: Joi.string().max(100).optional(),
        route: Joi.string().valid('ORAL', 'TOPICAL', 'INJECTION', 'INHALATION', 'OTHER').optional(),
        startDate: Joi.date().max('now').optional(),
        activeIngredient: Joi.string().max(200).optional()
      }))
      .min(1)
      .max(30)
      .required()
      .messages({
        'array.min': 'Deve informar pelo menos 1 medicamento',
        'array.max': 'Máximo de 30 medicamentos',
        'any.required': 'Lista de medicamentos é obrigatória'
      }),
    
    newMedication: Joi.object({
      name: Joi.string().min(2).max(200).required(),
      dosage: Joi.string().max(100).optional(),
      frequency: Joi.string().max(100).optional(),
      route: Joi.string().valid('ORAL', 'TOPICAL', 'INJECTION', 'INHALATION', 'OTHER').optional(),
      activeIngredient: Joi.string().max(200).optional(),
      indication: Joi.string().max(300).optional()
    }).required().messages({
      'any.required': 'Novo medicamento é obrigatório'
    }),
    
    patientInfo: Joi.object({
      age: Joi.number().integer().min(0).max(150).optional(),
      weight: Joi.number().min(1).max(500).optional(),
      kidneyFunction: Joi.string().valid('NORMAL', 'MILD_IMPAIRMENT', 'MODERATE_IMPAIRMENT', 'SEVERE_IMPAIRMENT').optional(),
      liverFunction: Joi.string().valid('NORMAL', 'MILD_IMPAIRMENT', 'MODERATE_IMPAIRMENT', 'SEVERE_IMPAIRMENT').optional(),
      allergies: Joi.array().items(Joi.string()).max(10).optional(),
      conditions: Joi.array().items(Joi.string()).max(15).optional()
    }).optional(),
    
    checkSeverity: Joi.array()
      .items(Joi.string().valid('MINOR', 'MODERATE', 'MAJOR', 'CONTRAINDICATED'))
      .optional()
      .default(['MODERATE', 'MAJOR', 'CONTRAINDICATED'])
      .messages({
        'any.only': 'Severidade deve incluir MINOR, MODERATE, MAJOR ou CONTRAINDICATED'
      }),
    
    includeAlternatives: Joi.boolean()
      .optional()
      .default(true),
    
    includeFoodInteractions: Joi.boolean()
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

// Validação de verificador de sintomas
const validateSymptomChecker = (req, res, next) => {
  const schema = Joi.object({
    symptoms: Joi.array()
      .items(Joi.object({
        name: Joi.string().min(2).max(200).required(),
        severity: Joi.number().integer().min(1).max(10).required(),
        duration: Joi.object({
          value: Joi.number().positive().required(),
          unit: Joi.string().valid('MINUTES', 'HOURS', 'DAYS', 'WEEKS', 'MONTHS').required()
        }).required(),
        location: Joi.string().max(200).optional(),
        triggers: Joi.array().items(Joi.string()).max(10).optional(),
        relievingFactors: Joi.array().items(Joi.string()).max(10).optional(),
        associatedSymptoms: Joi.array().items(Joi.string()).max(10).optional()
      }))
      .min(1)
      .max(20)
      .required()
      .messages({
        'array.min': 'Deve informar pelo menos 1 sintoma',
        'array.max': 'Máximo de 20 sintomas',
        'any.required': 'Lista de sintomas é obrigatória'
      }),
    
    patientInfo: Joi.object({
      age: Joi.number().integer().min(0).max(150).required(),
      gender: Joi.string().valid('MALE', 'FEMALE', 'OTHER').required(),
      weight: Joi.number().min(1).max(500).optional(),
      height: Joi.number().min(30).max(300).optional(),
      medicalHistory: Joi.array().items(Joi.string()).max(15).optional(),
      currentMedications: Joi.array().items(Joi.string()).max(20).optional(),
      allergies: Joi.array().items(Joi.string()).max(10).optional(),
      familyHistory: Joi.array().items(Joi.string()).max(15).optional(),
      lifestyle: Joi.object({
        smokingStatus: Joi.string().valid('NEVER', 'FORMER', 'CURRENT').optional(),
        alcoholConsumption: Joi.string().valid('NONE', 'LIGHT', 'MODERATE', 'HEAVY').optional(),
        exerciseFrequency: Joi.string().valid('NONE', 'LIGHT', 'MODERATE', 'INTENSE').optional()
      }).optional()
    }).required().messages({
      'any.required': 'Informações do paciente são obrigatórias'
    }),
    
    duration: Joi.object({
      overall: Joi.object({
        value: Joi.number().positive().required(),
        unit: Joi.string().valid('MINUTES', 'HOURS', 'DAYS', 'WEEKS', 'MONTHS').required()
      }).required(),
      progression: Joi.string().valid('IMPROVING', 'STABLE', 'WORSENING', 'FLUCTUATING').optional()
    }).required().messages({
      'any.required': 'Duração geral dos sintomas é obrigatória'
    }),
    
    context: Joi.object({
      recentTravel: Joi.boolean().optional(),
      recentIllness: Joi.boolean().optional(),
      recentInjury: Joi.boolean().optional(),
      stressfulEvents: Joi.boolean().optional(),
      environmentalExposures: Joi.array().items(Joi.string()).max(10).optional(),
      recentMedicalProcedures: Joi.array().items(Joi.string()).max(5).optional()
    }).optional(),
    
    urgencyLevel: Joi.string()
      .valid('LOW', 'MEDIUM', 'HIGH', 'EMERGENCY')
      .optional(),
    
    includeRedFlags: Joi.boolean()
      .optional()
      .default(true),
    
    maxConditions: Joi.number()
      .integer()
      .min(1)
      .max(20)
      .optional()
      .default(10)
      .messages({
        'number.min': 'Mínimo de 1 condição',
        'number.max': 'Máximo de 20 condições'
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
  validateChatMessage,
  validateTriageInput,
  validateSentimentAnalysis,
  validateNLPExtraction,
  validateRecommendationRequest,
  validateRiskAssessment,
  validateDrugInteraction,
  validateSymptomChecker
};

