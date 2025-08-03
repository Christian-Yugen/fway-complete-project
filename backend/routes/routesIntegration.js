const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');

// Importar controladores das APIs desenvolvidas
const {
  calculatePremium,
  getRiskFactors,
  activateCoverage,
  getUserRiskAnalysis,
  getEpidemiologicalInsightsEndpoint
} = require('../controllers/shield/fway-shield-apis-high-priority');

const {
  processChat,
  getChatHistory,
  advancedTriage
} = require('../controllers/brain/fway-brain-apis-high-priority');

const {
  matchProfessional,
  healthRiskAnalysis,
  getMedicalProfile,
  updateMedicalProfile,
  checkDrugInteractions,
  getPersonalizedRecommendations
} = require('../controllers/brain/fway-brain-apis-medium-priority');

const {
  submitClaim,
  getClaimStatus,
  getUserShieldLevel,
  getShieldTrends,
  getGamificationProgress,
  getGamificationRewards
} = require('../controllers/shield/fway-shield-apis-medium-priority');

// Middleware de autenticação
const authenticateToken = require('../middleware/auth');
const { validateUser, validateAdmin } = require('../middleware/roleValidation');

// ====================================
// CONFIGURAÇÃO DO ROUTER PRINCIPAL
// ====================================

const router = express.Router();

// Middleware de segurança
router.use(helmet());
router.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const createRateLimit = (windowMs, max, message) => rateLimit({
  windowMs,
  max,
  message: { success: false, message },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limits específicos
const generalLimit = createRateLimit(15 * 60 * 1000, 100, 'Muitas requisições. Tente novamente em 15 minutos.');
const aiLimit = createRateLimit(5 * 60 * 1000, 20, 'Limite de requisições de IA atingido. Tente novamente em 5 minutos.');
const premiumLimit = createRateLimit(1 * 60 * 1000, 10, 'Limite de cálculos de prêmio atingido. Tente novamente em 1 minuto.');

// Middleware de validação de erros
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors: errors.array()
    });
  }
  next();
};

// Middleware de logging
const logRequest = (req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
};

// Aplicar middlewares globais
router.use(logRequest);
router.use(generalLimit);

// ====================================
// ROTAS DO FWAY SHIELD (ALTA PRIORIDADE)
// ====================================

// Precificação Dinâmica
router.post('/api/shield/calculate-premium',
  premiumLimit,
  authenticateToken,
  [
    body('serviceType').isIn(['CONSULTATION', 'EXAM', 'PROCEDURE', 'EMERGENCY', 'SURGERY', 'HOSPITALIZATION'])
      .withMessage('Tipo de serviço inválido'),
    body('userProfile.age').isInt({ min: 0, max: 120 })
      .withMessage('Idade deve ser um número entre 0 e 120'),
    body('userProfile.location').optional().isLength({ min: 2, max: 2 })
      .withMessage('Localização deve ter 2 caracteres (código do estado)'),
    body('serviceDetails.urgency').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'EMERGENCY', 'CRITICAL'])
      .withMessage('Nível de urgência inválido')
  ],
  handleValidationErrors,
  calculatePremium
);

// Fatores de Risco
router.get('/api/shield/risk-factors',
  authenticateToken,
  getRiskFactors
);

// Ativação de Cobertura
router.post('/api/shield/activate-coverage',
  authenticateToken,
  [
    body('coverageType').notEmpty().withMessage('Tipo de cobertura é obrigatório'),
    body('serviceId').notEmpty().withMessage('ID do serviço é obrigatório'),
    body('premium').isFloat({ min: 0 }).withMessage('Prêmio deve ser um valor positivo'),
    body('duration').optional().isInt({ min: 1, max: 168 }).withMessage('Duração deve ser entre 1 e 168 horas')
  ],
  handleValidationErrors,
  activateCoverage
);

// Análise de Risco do Usuário
router.get('/api/shield/risk-analysis/user/:userId',
  authenticateToken,
  validateUser,
  getUserRiskAnalysis
);

// Insights Epidemiológicos
router.get('/api/shield/epidemiological-insights',
  authenticateToken,
  getEpidemiologicalInsightsEndpoint
);

// ====================================
// ROTAS DO FWAY BRAIN (ALTA PRIORIDADE)
// ====================================

// Chat Médico
router.post('/api/brain/chat',
  aiLimit,
  authenticateToken,
  [
    body('message').isLength({ min: 1, max: 1000 }).withMessage('Mensagem deve ter entre 1 e 1000 caracteres'),
    body('sessionId').optional().isLength({ min: 1, max: 100 }).withMessage('ID da sessão inválido')
  ],
  handleValidationErrors,
  processChat
);

// Histórico do Chat
router.get('/api/brain/chat/history/:userId',
  authenticateToken,
  validateUser,
  getChatHistory
);

// Triagem Avançada
router.post('/api/brain/triage',
  aiLimit,
  authenticateToken,
  [
    body('symptoms').isArray({ min: 1 }).withMessage('Pelo menos um sintoma deve ser informado'),
    body('symptoms.*').isString().withMessage('Sintomas devem ser strings válidas'),
    body('severity').optional().isInt({ min: 1, max: 10 }).withMessage('Severidade deve ser entre 1 e 10'),
    body('duration').optional().isIn(['acute', 'subacute', 'chronic', 'intermittent'])
      .withMessage('Duração inválida')
  ],
  handleValidationErrors,
  advancedTriage
);

// ====================================
// ROTAS DO FWAY BRAIN (MÉDIA PRIORIDADE)
// ====================================

// Matching de Profissionais
router.post('/api/brain/match-professional',
  authenticateToken,
  [
    body('specialty').notEmpty().withMessage('Especialidade é obrigatória'),
    body('location').optional().isLength({ min: 2 }).withMessage('Localização inválida'),
    body('urgency').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'EMERGENCY'])
      .withMessage('Urgência inválida')
  ],
  handleValidationErrors,
  matchProfessional
);

// Análise de Risco de Saúde
router.post('/api/brain/health-risk-analysis',
  authenticateToken,
  [
    body('factors').optional().isArray().withMessage('Fatores devem ser um array'),
    body('lifestyle').optional().isObject().withMessage('Lifestyle deve ser um objeto'),
    body('demographics').optional().isObject().withMessage('Demographics deve ser um objeto')
  ],
  handleValidationErrors,
  healthRiskAnalysis
);

// Perfil Médico
router.get('/api/users/:userId/medical-profile',
  authenticateToken,
  validateUser,
  getMedicalProfile
);

router.put('/api/users/:userId/medical-profile',
  authenticateToken,
  validateUser,
  [
    body('bloodType').optional().isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
      .withMessage('Tipo sanguíneo inválido'),
    body('allergies').optional().isArray().withMessage('Alergias devem ser um array'),
    body('chronicConditions').optional().isArray().withMessage('Condições crônicas devem ser um array'),
    body('currentMedications').optional().isArray().withMessage('Medicações atuais devem ser um array')
  ],
  handleValidationErrors,
  updateMedicalProfile
);

// Verificação de Interações Medicamentosas
router.post('/api/brain/drug-interactions',
  authenticateToken,
  [
    body('medications').isArray({ min: 1 }).withMessage('Pelo menos um medicamento deve ser informado'),
    body('medications.*').isString().withMessage('Medicamentos devem ser strings válidas')
  ],
  handleValidationErrors,
  checkDrugInteractions
);

// Recomendações Personalizadas
router.get('/api/brain/recommendations/user/:userId',
  authenticateToken,
  validateUser,
  getPersonalizedRecommendations
);

// ====================================
// ROTAS DO FWAY SHIELD (MÉDIA PRIORIDADE)
// ====================================

// Sinistros
router.post('/api/shield/claims/submit',
  authenticateToken,
  [
    body('coverageId').notEmpty().withMessage('ID da cobertura é obrigatório'),
    body('claimType').isIn(['CONSULTATION', 'EXAM', 'PROCEDURE', 'EMERGENCY', 'MEDICATION'])
      .withMessage('Tipo de sinistro inválido'),
    body('description').isLength({ min: 10, max: 1000 }).withMessage('Descrição deve ter entre 10 e 1000 caracteres'),
    body('amount').isFloat({ min: 0 }).withMessage('Valor deve ser positivo'),
    body('incidentDate').isISO8601().withMessage('Data do incidente inválida')
  ],
  handleValidationErrors,
  submitClaim
);

router.get('/api/shield/claims/:claimId/status',
  authenticateToken,
  getClaimStatus
);

// Sistema de Níveis Shield
router.get('/api/shield/user/:userId/level',
  authenticateToken,
  validateUser,
  getUserShieldLevel
);

// Analytics e Tendências
router.get('/api/shield/analytics/trends',
  authenticateToken,
  validateAdmin,
  getShieldTrends
);

// Gamificação
router.get('/api/gamification/user/:userId/progress',
  authenticateToken,
  validateUser,
  getGamificationProgress
);

router.get('/api/gamification/rewards',
  authenticateToken,
  getGamificationRewards
);

// ====================================
// ROTAS DE SAÚDE E MONITORAMENTO
// ====================================

// Health Check
router.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'FWAY API está funcionando',
    timestamp: new Date().toISOString(),
    version: process.env.API_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Status das APIs
router.get('/api/status', authenticateToken, async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    // Testar conexão com banco
    await prisma.$queryRaw`SELECT 1`;
    
    res.json({
      success: true,
      services: {
        database: 'healthy',
        shield: 'healthy',
        brain: 'healthy',
        gamification: 'healthy'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      services: {
        database: 'unhealthy',
        shield: 'unknown',
        brain: 'unknown',
        gamification: 'unknown'
      },
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Métricas (apenas para admins)
router.get('/api/metrics', authenticateToken, validateAdmin, async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const [
      totalUsers,
      activeCoverages,
      totalClaims,
      totalTriages,
      totalChats
    ] = await Promise.all([
      prisma.user.count(),
      prisma.coverage.count({ where: { status: 'ACTIVE' } }),
      prisma.claim.count(),
      prisma.triageResult.count(),
      prisma.aIInteraction.count()
    ]);

    res.json({
      success: true,
      metrics: {
        users: {
          total: totalUsers,
          active: totalUsers // Simplificado
        },
        shield: {
          activeCoverages,
          totalClaims,
          claimApprovalRate: 0.85 // Simulado
        },
        brain: {
          totalTriages,
          totalChats,
          averageConfidence: 0.87 // Simulado
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar métricas',
      error: error.message
    });
  }
});

// ====================================
// MIDDLEWARE DE TRATAMENTO DE ERROS
// ====================================

// Handler de erros 404
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint não encontrado',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Handler de erros globais
router.use((error, req, res, next) => {
  console.error('Erro na API:', error);
  
  // Erro de validação do Prisma
  if (error.code === 'P2002') {
    return res.status(409).json({
      success: false,
      message: 'Conflito: registro já existe',
      field: error.meta?.target
    });
  }
  
  // Erro de registro não encontrado
  if (error.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Registro não encontrado'
    });
  }
  
  // Erro de JWT
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
  
  // Erro de token expirado
  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expirado'
    });
  }
  
  // Erro genérico
  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    timestamp: new Date().toISOString()
  });
});

// ====================================
// CONFIGURAÇÃO DE DEPENDÊNCIAS
// ====================================

// Função para configurar dependências necessárias
const setupDependencies = () => {
  console.log('Configurando dependências do FWAY...');
  
  // Verificar variáveis de ambiente necessárias
  const requiredEnvVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'NODE_ENV'
  ];
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('Variáveis de ambiente faltando:', missingVars);
    process.exit(1);
  }
  
  console.log('✅ Dependências configuradas com sucesso');
};

// ====================================
// DOCUMENTAÇÃO DAS ROTAS
// ====================================

const routeDocumentation = {
  shield: {
    'POST /api/shield/calculate-premium': 'Calcula prêmio dinâmico baseado em fatores de risco',
    'GET /api/shield/risk-factors': 'Retorna fatores de risco configuráveis',
    'POST /api/shield/activate-coverage': 'Ativa microsseguro para uma transação',
    'GET /api/shield/risk-analysis/user/:userId': 'Análise de risco detalhada do usuário',
    'GET /api/shield/epidemiological-insights': 'Insights epidemiológicos regionais',
    'POST /api/shield/claims/submit': 'Submete sinistro para análise automática',
    'GET /api/shield/claims/:claimId/status': 'Status detalhado de um sinistro',
    'GET /api/shield/user/:userId/level': 'Nível Shield do usuário e benefícios',
    'GET /api/shield/analytics/trends': 'Análise de tendências e insights'
  },
  brain: {
    'POST /api/brain/chat': 'Processa mensagem do chat médico com IA',
    'GET /api/brain/chat/history/:userId': 'Histórico de conversas do chat',
    'POST /api/brain/triage': 'Triagem médica avançada com red flags',
    'POST /api/brain/match-professional': 'Matching inteligente de profissionais',
    'POST /api/brain/health-risk-analysis': 'Análise de risco de saúde por categorias',
    'GET /api/users/:userId/medical-profile': 'Perfil médico completo do usuário',
    'PUT /api/users/:userId/medical-profile': 'Atualiza perfil médico do usuário',
    'POST /api/brain/drug-interactions': 'Verifica interações medicamentosas',
    'GET /api/brain/recommendations/user/:userId': 'Recomendações personalizadas de IA'
  },
  gamification: {
    'GET /api/gamification/user/:userId/progress': 'Progresso de gamificação do usuário',
    'GET /api/gamification/rewards': 'Recompensas disponíveis'
  },
  system: {
    'GET /api/health': 'Health check da API',
    'GET /api/status': 'Status dos serviços',
    'GET /api/metrics': 'Métricas do sistema (admin only)'
  }
};

// Endpoint de documentação
router.get('/api/docs', (req, res) => {
  res.json({
    success: true,
    message: 'Documentação da API FWAY',
    version: process.env.API_VERSION || '1.0.0',
    routes: routeDocumentation,
    rateLimit: {
      general: '100 requests per 15 minutes',
      ai: '20 requests per 5 minutes',
      premium: '10 requests per minute'
    },
    authentication: 'Bearer token required for most endpoints',
    timestamp: new Date().toISOString()
  });
});

module.exports = {
  router,
  setupDependencies,
  routeDocumentation
};

