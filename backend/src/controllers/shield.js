const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { cache } = require('../config/redis');
const shieldValidators = require('../validators/shield');
const { createNotification } = require('../services/notification/notificationService');
const { sendEmail } = require('../services/notification/emailService');

const router = express.Router();
const prisma = new PrismaClient();

// ===== FWAY SHIELD DASHBOARD =====

// @route   GET /api/shield/dashboard
// @desc    Obter dashboard do Shield
// @access  Private
router.get('/dashboard', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Buscar dados do usuário no Shield
  const [
    userShield,
    activeCoverages,
    recentClaims,
    riskScore,
    shieldLevel,
    totalProtection,
    savings
  ] = await Promise.all([
    prisma.userShield.findUnique({
      where: { userId },
      include: {
        coverages: {
          where: { isActive: true },
          include: { coverage: true }
        }
      }
    }),
    
    prisma.userCoverage.count({
      where: { 
        userId,
        isActive: true 
      }
    }),
    
    prisma.claim.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        coverage: {
          include: { coverage: true }
        }
      }
    }),
    
    calculateRiskScore(userId),
    calculateShieldLevel(userId),
    calculateTotalProtection(userId),
    calculateSavings(userId)
  ]);

  // Se não existe Shield para o usuário, criar
  if (!userShield) {
    const newUserShield = await prisma.userShield.create({
      data: {
        userId,
        riskScore: 85,
        shieldLevel: 'BRONZE',
        totalPoints: 0,
        isActive: true
      }
    });
  }

  // Insights da IA
  const aiInsights = await generateAIInsights(userId, riskScore);

  // Alertas ativos
  const activeAlerts = await getActiveAlerts(userId);

  const dashboard = {
    riskScore: riskScore || 85,
    shieldLevel: shieldLevel || 'BRONZE',
    activeCoverages,
    totalProtection,
    savings,
    recentClaims: recentClaims.map(claim => ({
      id: claim.id,
      type: claim.type,
      status: claim.status,
      amount: claim.amount,
      createdAt: claim.createdAt,
      coverageName: claim.coverage.coverage.name
    })),
    aiInsights,
    activeAlerts,
    performance: {
      claimsResolved: await prisma.claim.count({
        where: { userId, status: 'APPROVED' }
      }),
      averageResolutionTime: '3.2h',
      satisfactionRate: 94
    }
  };

  res.json({
    success: true,
    data: { dashboard }
  });
}));

// ===== RISK INTELLIGENCE =====

// @route   GET /api/shield/risk-intelligence
// @desc    Obter análise de risco com IA
// @access  Private
router.get('/risk-intelligence', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Calcular risk score atual
  const currentRiskScore = await calculateRiskScore(userId);
  
  // Histórico de risk score (últimos 6 meses)
  const riskHistory = await getRiskScoreHistory(userId);
  
  // Análise comportamental
  const behavioralAnalysis = await analyzeBehavioralPatterns(userId);
  
  // Insights preditivos
  const predictiveInsights = await generatePredictiveInsights(userId);
  
  // Fatores de risco
  const riskFactors = await analyzeRiskFactors(userId);

  const riskIntelligence = {
    currentScore: currentRiskScore,
    scoreHistory: riskHistory,
    confidence: 94.2,
    lastUpdated: new Date(),
    behavioralAnalysis,
    predictiveInsights,
    riskFactors,
    recommendations: await generateRiskRecommendations(userId, currentRiskScore)
  };

  res.json({
    success: true,
    data: { riskIntelligence }
  });
}));

// ===== COVERAGE MANAGER =====

// @route   GET /api/shield/coverages
// @desc    Listar coberturas do usuário
// @access  Private
router.get('/coverages', authenticateToken, asyncHandler(async (req, res) => {
  const { status, type, page = 1, limit = 20 } = req.query;
  const userId = req.user.id;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = {
    userId,
    ...(status && { status }),
    ...(type && { coverage: { type } })
  };

  const [userCoverages, total, availableModules] = await Promise.all([
    prisma.userCoverage.findMany({
      where,
      include: {
        coverage: true,
        claims: {
          orderBy: { createdAt: 'desc' },
          take: 3
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit)
    }),
    
    prisma.userCoverage.count({ where }),
    
    prisma.coverage.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    })
  ]);

  // Estatísticas
  const stats = {
    totalProtection: await calculateTotalProtection(userId),
    activeCoverages: await prisma.userCoverage.count({
      where: { userId, isActive: true }
    }),
    totalSavings: await calculateSavings(userId),
    claimsRate: await calculateClaimsRate(userId)
  };

  res.json({
    success: true,
    data: {
      coverages: userCoverages,
      availableModules,
      stats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  });
}));

// @route   POST /api/shield/coverages
// @desc    Criar nova cobertura
// @access  Private
router.post('/coverages', authenticateToken, shieldValidators.validateCoverageCreation, asyncHandler(async (req, res) => {
  const { coverageId, serviceValue, duration = 30 } = req.body;
  const userId = req.user.id;

  // Verificar se a cobertura existe
  const coverage = await prisma.coverage.findUnique({
    where: { id: coverageId }
  });

  if (!coverage) {
    throw new AppError('Cobertura não encontrada', 404);
  }

  // Verificar se usuário já tem esta cobertura ativa
  const existingCoverage = await prisma.userCoverage.findFirst({
    where: {
      userId,
      coverageId,
      isActive: true
    }
  });

  if (existingCoverage) {
    throw new AppError('Você já possui esta cobertura ativa', 400);
  }

  // Calcular prêmio baseado no valor do serviço e risk score
  const riskScore = await calculateRiskScore(userId);
  const premium = calculatePremium(serviceValue, coverage.baseRate, riskScore, duration);

  // Criar cobertura do usuário
  const userCoverage = await prisma.userCoverage.create({
    data: {
      userId,
      coverageId,
      serviceValue,
      premium,
      duration,
      startDate: new Date(),
      endDate: new Date(Date.now() + duration * 24 * 60 * 60 * 1000),
      isActive: true,
      status: 'ACTIVE'
    },
    include: {
      coverage: true
    }
  });

  // Criar notificação
  await createNotification({
    userId,
    type: 'COVERAGE_CREATED',
    title: 'Nova Cobertura Ativada',
    message: `Cobertura ${coverage.name} foi ativada com sucesso!`,
    data: { coverageId: userCoverage.id }
  });

  res.status(201).json({
    success: true,
    message: 'Cobertura criada com sucesso',
    data: { coverage: userCoverage }
  });
}));

// ===== CLAIMS CENTER =====

// @route   GET /api/shield/claims
// @desc    Listar sinistros do usuário
// @access  Private
router.get('/claims', authenticateToken, asyncHandler(async (req, res) => {
  const { status, type, page = 1, limit = 20 } = req.query;
  const userId = req.user.id;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = {
    userId,
    ...(status && { status }),
    ...(type && { type })
  };

  const [claims, total] = await Promise.all([
    prisma.claim.findMany({
      where,
      include: {
        coverage: {
          include: { coverage: true }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit)
    }),
    
    prisma.claim.count({ where })
  ]);

  // Estatísticas
  const stats = {
    totalClaims: total,
    approvedClaims: await prisma.claim.count({
      where: { userId, status: 'APPROVED' }
    }),
    pendingClaims: await prisma.claim.count({
      where: { userId, status: 'PENDING' }
    }),
    totalPayout: await prisma.claim.aggregate({
      where: { userId, status: 'APPROVED' },
      _sum: { amount: true }
    }).then(result => result._sum.amount || 0),
    averageResolutionTime: '3.2h',
    satisfactionRate: 94
  };

  res.json({
    success: true,
    data: {
      claims,
      stats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  });
}));

// @route   POST /api/shield/claims
// @desc    Criar novo sinistro com NLP
// @access  Private
router.post('/claims', authenticateToken, shieldValidators.validateClaimCreation, asyncHandler(async (req, res) => {
  const { coverageId, description, amount, attachments = [] } = req.body;
  const userId = req.user.id;

  // Verificar se a cobertura existe e está ativa
  const userCoverage = await prisma.userCoverage.findFirst({
    where: {
      id: coverageId,
      userId,
      isActive: true,
      endDate: { gte: new Date() }
    },
    include: { coverage: true }
  });

  if (!userCoverage) {
    throw new AppError('Cobertura não encontrada ou inativa', 404);
  }

  // Análise NLP da descrição
  const nlpAnalysis = await analyzeClaimWithNLP(description);

  // Determinar tipo de sinistro baseado na análise
  const claimType = determineClaimType(nlpAnalysis, userCoverage.coverage.type);

  // Calcular severidade
  const severity = calculateClaimSeverity(nlpAnalysis, amount, userCoverage.serviceValue);

  // Determinar se pode ser resolvido automaticamente
  const canAutoResolve = canAutoResolveClaim(nlpAnalysis, severity, amount, userCoverage);

  // Criar sinistro
  const claim = await prisma.claim.create({
    data: {
      userId,
      coverageId,
      type: claimType,
      description,
      amount,
      severity,
      status: canAutoResolve ? 'APPROVED' : 'PENDING',
      nlpAnalysis: JSON.stringify(nlpAnalysis),
      attachments: JSON.stringify(attachments),
      ...(canAutoResolve && {
        approvedAt: new Date(),
        approvedBy: 'SYSTEM_AI'
      })
    },
    include: {
      coverage: {
        include: { coverage: true }
      }
    }
  });

  // Se aprovado automaticamente, processar pagamento
  if (canAutoResolve) {
    await processAutomaticPayout(claim);
  }

  // Criar notificação
  await createNotification({
    userId,
    type: canAutoResolve ? 'CLAIM_APPROVED' : 'CLAIM_CREATED',
    title: canAutoResolve ? 'Sinistro Aprovado Automaticamente' : 'Sinistro Criado',
    message: canAutoResolve 
      ? `Seu sinistro foi aprovado automaticamente! Valor: R$ ${amount}`
      : 'Seu sinistro foi criado e está sendo analisado.',
    data: { claimId: claim.id },
    priority: canAutoResolve ? 'HIGH' : 'NORMAL'
  });

  res.status(201).json({
    success: true,
    message: canAutoResolve 
      ? 'Sinistro criado e aprovado automaticamente'
      : 'Sinistro criado com sucesso',
    data: { 
      claim,
      nlpAnalysis: {
        confidence: nlpAnalysis.confidence,
        sentiment: nlpAnalysis.sentiment,
        keywords: nlpAnalysis.keywords,
        autoResolved: canAutoResolve
      }
    }
  });
}));

// @route   POST /api/shield/claims/:id/messages
// @desc    Adicionar mensagem ao sinistro
// @access  Private
router.post('/claims/:id/messages', authenticateToken, shieldValidators.validateClaimMessage, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { content, type = 'TEXT' } = req.body;
  const userId = req.user.id;

  // Verificar se o sinistro existe e pertence ao usuário
  const claim = await prisma.claim.findFirst({
    where: { id, userId }
  });

  if (!claim) {
    throw new AppError('Sinistro não encontrado', 404);
  }

  // Análise NLP da mensagem
  const nlpAnalysis = await analyzeClaimWithNLP(content);

  // Criar mensagem
  const message = await prisma.claimMessage.create({
    data: {
      claimId: id,
      senderId: userId,
      content,
      type,
      nlpAnalysis: JSON.stringify(nlpAnalysis)
    }
  });

  // Atualizar sinistro com nova análise se necessário
  if (nlpAnalysis.confidence > 0.8) {
    await updateClaimAnalysis(id, nlpAnalysis);
  }

  res.status(201).json({
    success: true,
    message: 'Mensagem adicionada com sucesso',
    data: { 
      message,
      nlpFeedback: {
        confidence: nlpAnalysis.confidence,
        sentiment: nlpAnalysis.sentiment,
        suggestedActions: nlpAnalysis.suggestedActions
      }
    }
  });
}));

// ===== SHIELD REWARDS =====

// @route   GET /api/shield/rewards
// @desc    Obter sistema de recompensas
// @access  Private
router.get('/rewards', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const [userShield, userRewards, availableRewards, achievements, ranking] = await Promise.all([
    prisma.userShield.findUnique({
      where: { userId }
    }),
    
    prisma.userReward.findMany({
      where: { userId },
      include: { reward: true },
      orderBy: { earnedAt: 'desc' }
    }),
    
    prisma.reward.findMany({
      where: { isActive: true },
      orderBy: { pointsCost: 'asc' }
    }),
    
    getUserAchievements(userId),
    
    getShieldRanking(userId)
  ]);

  const currentLevel = userShield?.shieldLevel || 'BRONZE';
  const currentPoints = userShield?.totalPoints || 0;
  const nextLevel = getNextLevel(currentLevel);
  const pointsToNextLevel = getPointsToNextLevel(currentLevel, currentPoints);

  const rewards = {
    currentLevel,
    currentPoints,
    nextLevel,
    pointsToNextLevel,
    availableRewards: availableRewards.map(reward => ({
      ...reward,
      canRedeem: currentPoints >= reward.pointsCost,
      alreadyRedeemed: userRewards.some(ur => ur.rewardId === reward.id)
    })),
    earnedRewards: userRewards,
    achievements,
    ranking,
    streaks: await getUserStreaks(userId)
  };

  res.json({
    success: true,
    data: { rewards }
  });
}));

// @route   POST /api/shield/rewards/:id/redeem
// @desc    Resgatar recompensa
// @access  Private
router.post('/rewards/:id/redeem', authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  // Verificar recompensa
  const reward = await prisma.reward.findUnique({
    where: { id }
  });

  if (!reward || !reward.isActive) {
    throw new AppError('Recompensa não encontrada', 404);
  }

  // Verificar pontos do usuário
  const userShield = await prisma.userShield.findUnique({
    where: { userId }
  });

  if (!userShield || userShield.totalPoints < reward.pointsCost) {
    throw new AppError('Pontos insuficientes', 400);
  }

  // Verificar se já resgatou
  const existingRedemption = await prisma.userReward.findFirst({
    where: { userId, rewardId: id }
  });

  if (existingRedemption && !reward.isRepeatable) {
    throw new AppError('Recompensa já foi resgatada', 400);
  }

  // Resgatar recompensa
  const [userReward] = await prisma.$transaction([
    prisma.userReward.create({
      data: {
        userId,
        rewardId: id,
        pointsSpent: reward.pointsCost
      }
    }),
    
    prisma.userShield.update({
      where: { userId },
      data: {
        totalPoints: {
          decrement: reward.pointsCost
        }
      }
    })
  ]);

  // Aplicar benefício da recompensa
  await applyRewardBenefit(userId, reward);

  // Notificação
  await createNotification({
    userId,
    type: 'REWARD_REDEEMED',
    title: 'Recompensa Resgatada',
    message: `Você resgatou: ${reward.name}!`,
    data: { rewardId: id }
  });

  res.json({
    success: true,
    message: 'Recompensa resgatada com sucesso',
    data: { userReward }
  });
}));

// ===== FUNÇÕES AUXILIARES =====

// Calcular risk score com IA
async function calculateRiskScore(userId) {
  const factors = await prisma.$queryRaw`
    SELECT 
      COUNT(CASE WHEN b.status = 'COMPLETED' THEN 1 END) as completed_bookings,
      COUNT(CASE WHEN b.status = 'CANCELLED' THEN 1 END) as cancelled_bookings,
      COU
(Content truncated due to size limit. Use line ranges to read in chunks)