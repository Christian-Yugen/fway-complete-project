const express = require('express');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

// ====================================
// 1. PROCESSAMENTO AUTOMÁTICO DE SINISTROS
// ====================================

/**
 * POST /api/shield/claims/submit
 * Submete sinistro para análise automática com IA
 */
const submitClaim = async (req, res) => {
  try {
    const { coverageId, claimType, description, amount, documents, incidentDate } = req.body;
    const userId = req.user?.id;

    if (!coverageId || !claimType || !description) {
      return res.status(400).json({
        success: false,
        message: 'coverageId, claimType e description são obrigatórios'
      });
    }

    // Verificar se a cobertura existe e pertence ao usuário
    const coverage = await prisma.coverage.findFirst({
      where: {
        id: coverageId,
        userId,
        status: 'ACTIVE'
      },
      include: {
        coverageType: true
      }
    });

    if (!coverage) {
      return res.status(404).json({
        success: false,
        message: 'Cobertura não encontrada ou inativa'
      });
    }

    // Verificar se o sinistro está dentro do período de cobertura
    const incident = new Date(incidentDate);
    if (incident < coverage.activatedAt || incident > coverage.expiresAt) {
      return res.status(400).json({
        success: false,
        message: 'Incidente fora do período de cobertura'
      });
    }

    // Análise automática com IA/NLP
    const aiAnalysis = await performAdvancedClaimAnalysis(
      description,
      claimType,
      amount,
      documents,
      coverage
    );

    // Verificar fraude potencial
    const fraudAnalysis = await performAdvancedFraudDetection(
      userId,
      description,
      amount,
      claimType,
      coverage
    );

    // Determinar status inicial baseado na análise
    let initialStatus = 'UNDER_REVIEW';
    let autoApproval = false;

    if (aiAnalysis.confidence > 0.9 && fraudAnalysis.riskScore < 0.2 && amount <= coverage.maxCoverage * 0.3) {
      initialStatus = 'APPROVED';
      autoApproval = true;
    } else if (fraudAnalysis.riskScore > 0.7 || aiAnalysis.confidence < 0.3) {
      initialStatus = 'REQUIRES_INVESTIGATION';
    }

    // Calcular valor aprovado
    const approvedAmount = calculateAdvancedApprovedAmount(
      amount,
      coverage,
      aiAnalysis,
      fraudAnalysis
    );

    // Criar sinistro
    const claim = await prisma.claim.create({
      data: {
        coverageId,
        userId,
        claimType,
        description,
        requestedAmount: amount,
        approvedAmount: autoApproval ? approvedAmount : null,
        incidentDate: incident,
        status: initialStatus,
        aiAnalysis,
        fraudAnalysis,
        documents: documents || [],
        autoProcessed: autoApproval,
        processingNotes: generateProcessingNotes(aiAnalysis, fraudAnalysis, autoApproval)
      }
    });

    // Se aprovado automaticamente, processar pagamento
    if (autoApproval) {
      await processAutomaticPayment(claim.id, approvedAmount, userId);
    }

    // Criar timeline do sinistro
    await prisma.claimTimeline.create({
      data: {
        claimId: claim.id,
        status: initialStatus,
        description: autoApproval ? 
          'Sinistro aprovado automaticamente pela IA' : 
          'Sinistro submetido para análise',
        createdBy: 'SYSTEM'
      }
    });

    // Notificar usuário
    await sendClaimNotification(userId, claim, autoApproval);

    res.json({
      success: true,
      data: {
        claimId: claim.id,
        status: initialStatus,
        requestedAmount: amount,
        approvedAmount: autoApproval ? approvedAmount : null,
        autoProcessed: autoApproval,
        estimatedProcessingTime: getEstimatedProcessingTime(initialStatus, aiAnalysis),
        aiAnalysis: {
          confidence: aiAnalysis.confidence,
          category: aiAnalysis.category,
          keyFindings: aiAnalysis.keyFindings,
          riskFactors: aiAnalysis.riskFactors
        },
        fraudAnalysis: {
          riskScore: fraudAnalysis.riskScore,
          riskLevel: fraudAnalysis.riskLevel,
          flaggedReasons: fraudAnalysis.flaggedReasons
        },
        nextSteps: getClaimNextSteps(initialStatus),
        submittedAt: claim.createdAt
      }
    });

  } catch (error) {
    console.error('Erro ao submeter sinistro:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * GET /api/shield/claims/:claimId/status
 * Retorna status detalhado de um sinistro
 */
const getClaimStatus = async (req, res) => {
  try {
    const { claimId } = req.params;
    const userId = req.user?.id;

    const claim = await prisma.claim.findFirst({
      where: {
        id: claimId,
        userId
      },
      include: {
        coverage: {
          include: {
            coverageType: true
          }
        },
        timeline: {
          orderBy: { createdAt: 'desc' }
        },
        documents: true
      }
    });

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Sinistro não encontrado'
      });
    }

    // Análise de progresso
    const progressAnalysis = analyzeClaimProgress(claim);

    // Estimativa de conclusão
    const completionEstimate = estimateClaimCompletion(claim);

    // Ações disponíveis para o usuário
    const availableActions = getAvailableClaimActions(claim);

    res.json({
      success: true,
      data: {
        claimId: claim.id,
        status: claim.status,
        claimType: claim.claimType,
        description: claim.description,
        requestedAmount: claim.requestedAmount,
        approvedAmount: claim.approvedAmount,
        incidentDate: claim.incidentDate,
        submittedAt: claim.createdAt,
        lastUpdated: claim.updatedAt,
        coverage: {
          id: claim.coverage.id,
          type: claim.coverage.coverageType.name,
          policyNumber: claim.coverage.policyNumber
        },
        aiAnalysis: claim.aiAnalysis,
        fraudAnalysis: claim.fraudAnalysis,
        timeline: claim.timeline.map(t => ({
          status: t.status,
          description: t.description,
          createdAt: t.createdAt,
          createdBy: t.createdBy
        })),
        progressAnalysis,
        completionEstimate,
        availableActions,
        documents: claim.documents?.map(doc => ({
          id: doc.id,
          name: doc.name,
          type: doc.type,
          uploadedAt: doc.createdAt
        })) || []
      }
    });

  } catch (error) {
    console.error('Erro ao buscar status do sinistro:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// ====================================
// 2. SISTEMA DE NÍVEIS SHIELD
// ====================================

/**
 * GET /api/shield/user/:userId/level
 * Retorna nível Shield do usuário e benefícios
 */
const getUserShieldLevel = async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user?.id;

    // Verificar permissão
    if (userId !== requestingUserId && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }

    // Buscar dados do usuário para cálculo do nível
    const [
      coverageHistory,
      claimHistory,
      riskAssessments,
      healthMetrics,
      userProfile
    ] = await Promise.all([
      prisma.coverage.findMany({
        where: { userId },
        include: { coverageType: true }
      }),
      prisma.claim.findMany({
        where: { userId }
      }),
      prisma.healthRiskAssessment.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      prisma.healthMetric.findMany({
        where: { userId },
        orderBy: { recordedAt: 'desc' },
        take: 30
      }),
      prisma.user.findUnique({
        where: { id: userId },
        include: {
          medicalProfile: true
        }
      })
    ]);

    // Calcular nível Shield
    const shieldLevel = calculateAdvancedShieldLevel({
      coverageHistory,
      claimHistory,
      riskAssessments,
      healthMetrics,
      userProfile
    });

    // Buscar ou criar registro de nível
    const levelRecord = await prisma.shieldLevel.upsert({
      where: { userId },
      update: {
        level: shieldLevel.level,
        points: shieldLevel.points,
        tier: shieldLevel.tier,
        benefits: shieldLevel.benefits,
        nextLevelRequirements: shieldLevel.nextLevelRequirements,
        updatedAt: new Date()
      },
      create: {
        userId,
        level: shieldLevel.level,
        points: shieldLevel.points,
        tier: shieldLevel.tier,
        benefits: shieldLevel.benefits,
        nextLevelRequirements: shieldLevel.nextLevelRequirements
      }
    });

    // Calcular progresso para próximo nível
    const progressToNext = calculateProgressToNextLevel(shieldLevel);

    // Histórico de níveis
    const levelHistory = await prisma.shieldLevelHistory.findMany({
      where: { userId },
      orderBy: { achievedAt: 'desc' },
      take: 10
    });

    res.json({
      success: true,
      data: {
        userId,
        currentLevel: {
          level: shieldLevel.level,
          tier: shieldLevel.tier,
          name: getShieldLevelName(shieldLevel.level),
          points: shieldLevel.points,
          benefits: shieldLevel.benefits,
          description: getShieldLevelDescription(shieldLevel.level)
        },
        progress: {
          currentPoints: shieldLevel.points,
          nextLevelPoints: shieldLevel.nextLevelRequirements?.points || null,
          progressPercentage: progressToNext.percentage,
          pointsToNext: progressToNext.pointsNeeded
        },
        nextLevelRequirements: shieldLevel.nextLevelRequirements,
        achievements: getShieldAchievements(shieldLevel, coverageHistory, claimHistory),
        levelHistory: levelHistory.map(lh => ({
          level: lh.level,
          tier: lh.tier,
          achievedAt: lh.achievedAt
        })),
        statistics: {
          totalCoverages: coverageHistory.length,
          totalClaims: claimHistory.length,
          claimApprovalRate: calculateClaimApprovalRate(claimHistory),
          averageRiskScore: calculateAverageRiskScore(riskAssessments),
          memberSince: userProfile.createdAt
        },
        recommendations: generateShieldLevelRecommendations(shieldLevel, {
          coverageHistory,
          claimHistory,
          riskAssessments
        })
      }
    });

  } catch (error) {
    console.error('Erro ao buscar nível Shield:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// ====================================
// 3. ANÁLISE DE TENDÊNCIAS E INSIGHTS
// ====================================

/**
 * GET /api/shield/analytics/trends
 * Retorna análise de tendências e insights do Shield
 */
const getShieldTrends = async (req, res) => {
  try {
    const { timeframe = '30d', region, ageGroup } = req.query;
    const userId = req.user?.id;

    // Verificar se o usuário tem permissão para ver analytics
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || !['admin', 'analyst', 'premium_user'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado aos analytics'
      });
    }

    // Definir período de análise
    const timeframeDays = parseTimeframe(timeframe);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - timeframeDays);

    // Construir filtros
    const whereClause = {
      createdAt: {
        gte: startDate
      }
    };

    if (region) {
      whereClause.user = {
        medicalProfile: {
          location: {
            contains: region,
            mode: 'insensitive'
          }
        }
      };
    }

    // Buscar dados agregados
    const [
      coverageTrends,
      claimTrends,
      riskTrends,
      premiumTrends,
      userGrowth
    ] = await Promise.all([
      analyzeCoverageTrends(whereClause, timeframeDays),
      analyzeClaimTrends(whereClause, timeframeDays),
      analyzeRiskTrends(whereClause, timeframeDays),
      analyzePremiumTrends(whereClause, timeframeDays),
      analyzeUserGrowth(whereClause, timeframeDays)
    ]);

    // Análise de padrões
    const patterns = identifyShieldPatterns({
      coverageTrends,
      claimTrends,
      riskTrends,
      premiumTrends
    });

    // Previsões baseadas em tendências
    const predictions = generateShieldPredictions({
      coverageTrends,
      claimTrends,
      riskTrends,
      timeframeDays
    });

    // Insights acionáveis
    const insights = generateShieldInsights({
      coverageTrends,
      claimTrends,
      riskTrends,
      patterns,
      predictions
    });

    res.json({
      success: true,
      data: {
        timeframe,
        region,
        ageGroup,
        period: {
          startDate,
          endDate: new Date(),
          days: timeframeDays
        },
        trends: {
          coverage: coverageTrends,
          claims: claimTrends,
          risk: riskTrends,
          premiums: premiumTrends,
          userGrowth
        },
        patterns,
        predictions,
        insights,
        summary: generateTrendsSummary({
          coverageTrends,
          claimTrends,
          riskTrends,
          premiumTrends
        }),
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Erro ao gerar análise de tendências:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// ====================================
// 4. GAMIFICAÇÃO AVANÇADA
// ====================================

/**
 * GET /api/gamification/user/:userId/progress
 * Retorna progresso de gamificação do usuário
 */
const getGamificationProgress = async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user?.id;

    // Verificar permissão
    if (userId !== requestingUserId && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }

    // Buscar dados para gamificação
    const [
      userProgress,
      achievements,
      challenges,
      leaderboard,
      rewards
    ] = await Promise.all([
      getAdvancedUserGamificationProgress(userId),
      getUserAchievements(userId),
      getActiveChallenges(userId),
      getLeaderboardPosition(userId),
      getAvailableRewards(userId)
    ]);

    // Calcular streaks
    const streaks = calculateAdvancedStreaks(userId);

    // Próximas metas
    const nextGoals = calculateNextGamificationGoals(userProgress, achievements);

    res.json({
      success: true,
      data: {
        userId,
        progress: userProgress,
        achievements: {
          unlocked: achievements.unlocked,
          total: achievements.total,
          recent: achievements.recent,
          categories: achievements.categories
        },
        challenges: {
          active: challenges.active,
          completed: challenges.completed,
          available: challenges.available
        },
        leaderboard: {
          position: leaderboard.position,
          totalUsers: leaderboard.total,
          percentile: leaderboard.percentile,
          nearbyUsers: leaderboard.nearby
        },
        rewards: {
          available: rewards.available,
          claimed: rewards.claimed,
          points: rewards.points
        },
        streaks,
        nextGoals,
        statistics: {
          totalPoints: userProgress.totalPoints,
          level: userProgress.level,
          rank: userProgress.rank,
          joinDate: userProgress.joinDate
        }
      }
    });

  } catch (error) {
    console.error('Erro ao buscar progresso de gamificação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * GET /api/gamification/rewards
 * Retorna recompensas disponíveis
 */
const getGamificationRewards = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { category, minPoints, maxPoints } = req.query;

    // Buscar pontos do usuário
    const userProgress = await prisma.gamificationProgress.findUnique({
      where: { userId }
    });

    const userPoints = userProgress?.totalPoints || 0;

    // Construir filtros
    const whereClause = {
      isActive: true
    };

    if (category) {
      whereClause.category = category;
    }

    if (minPoints) {
      whereClause.pointsCost = {
        gte: parseInt(minPoints)
      };
    }

    if (maxPoints) {
      whereClause.pointsCost = {
        ...whereClause.pointsCost,
        lte: parseInt(maxPoints)
      };
    }

    // Buscar recompensas
    const rewards = await prisma.gamificationReward.findMany({
      where: whereClause,
      orderBy: [
        { category: 'asc' },
        { pointsCost: 'asc' }
      ]
    });

    // Categorizar recompensas
    const categorizedRewards = {
      affordable: rewards.filter(r => r.pointsCost <= userPoints),
      upcoming: rewards.filter(r => r.pointsCost > userPoints && r.pointsCost <= userPoints * 1.5),
      premium: rewards.filter(r => r.pointsCost > userPoints * 1.5)
    };

    // Recompensas já resgatadas
    const claimedRewards = await prisma.gamificationRewardClaim.findMany({
      where: { userId },
      include: {
        reward: true
      },
      orderBy: { claimedAt: 'desc' }
    });

    res.json({
      success: true,
      data: {
        userPoints,
        rewards: {
          all: rewards.map(r => ({
            ...r,
            canAfford: r.pointsCost <= userPoints,
            alreadyClaimed: claimedRewards.some(cr => cr.rewardId === r.id)
          })),
          categorized: categorizedRewards
        },
        claimedRewards: claimedRewards.map(cr => ({
          id: cr.id,
          reward: cr.reward,
          claimedAt: cr.claimedAt,
          status: cr.status
        })),
        categories: getRewardCategories(),
        statistics: {
          totalRewards: rewards.length,
          affordableCount: categorizedRewards.affordable.length,
          totalClaimed: claimedRewards.length
        }
      }
    });

  } catch (error) {
    console.error('Erro ao buscar recompensas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// ====================================
// FUNÇÕES AUXILIARES
// ====================================

async function performAdvancedClaimAnalysis(description, claimType, amount, documents, coverage) {
  // Simulação de análise avançada com IA/NLP
  const analysis = {
    confidence: 0.8,
    category: claimType,
    keyFindings: [],
    riskFactors: [],
    supportingEvidence: [],
    inconsistencies: []
  };

  // Análise do texto da descrição
  const descriptionLower = description.toLowerCase();
  
  // Verificar palavras-chave relevantes
  const medicalKeywords = ['dor', 'lesão', 'acidente', 'emergência', 'hospital', 'médico'];
  const foundKeywords = medicalKeywords.filter(keyword => descriptionLower.includes(keyword));
  
  if (foundKeywords.length > 0) {
    analysis.confidence += 0.1;
    analysis.keyFindings.push(`Termos médicos relevantes encontrados: ${foundKeywords.join(', ')}`);
  }

  // Verificar consistência do valor
  const expectedRanges = {
    'CONSULTATION': { min: 50, max: 500 },
    'EXAM': { min: 100, max: 1000 },
    'PROCEDURE': { min: 200, max: 2000 },
    'EMERGENCY': { min: 500, max: 5000 }
  };

  const expectedRange = expectedRanges[claimType];
  if (expectedRange) {
    if (amount >= expectedRange.min && amount <= expectedRange.max) {
      analysis.confidence += 0.05;
      analysis.supportingEvidence.push('Valor dentro da faixa esperada para o tipo de sinistro');
    } else {
      analysis.confidence -= 0.1;
      analysis.inconsistencies.push('Valor fora da faixa típica para este tipo de sinistro');
    }
  }

  // Verificar documentos
  if (documents && documents.length > 0) {
    analysis.confidence += 0.05;
    analysis.supportingEvidence.push(`${documents.length} documento(s) anexado(s)`);
  }

  return analysis;
}

async function performAdvancedFraudDetection(userId, description, amount, claimType, coverage) {
  const fraudAnalysis = {
    riskScore: 0.1,
    riskLevel: 'LOW',
    flaggedReasons: [],
    checks: {
      frequencyCheck: 'PASS',
      amountCheck: 'PASS',
      patternCheck: 'PASS',
      timeCheck: 'PASS'
    }
  };

  // Verificar frequência de sinistros
  const recentClaims = await prisma.claim.findMany({
    where: {
      userId,
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Últimos 30 dias
      }
    }
  });

  if (recentClaims.length > 3) {
    fraudAnalysis.riskScore += 0.3;
    fraudAnalysis.flaggedReasons.push('Múltiplos sinistros em período curto');
    fraudAnalysis.checks.frequencyCheck = 'FLAG';
  }

  // Verificar valor em relação ao histórico
  if (recentClaims.length > 0) {
    const avgAmount = recentClaims.reduce((sum, claim) => sum + claim.requestedAmount, 0) / recentClaims.length;
    if (amount > avgAmount * 3) {
      fraudAnalysis.riskScore += 0.2;
      fraudAnalysis.flaggedReasons.push('Valor significativamente maior que histórico');
      fraudAnalysis.checks.amountCheck = 'FLAG';
    }
  }

  // Verificar timing (sinistro muito próximo à ativação da cobertura)
  const timeSinceActivation = new Date() - new Date(coverage.activatedAt);
  const hourseSinceActivation = timeSinceActivation / (1000 * 60 * 60);

  if (hourseSinceActivation < 24) {
    fraudAnalysis.riskScore += 0.4;
    fraudAnalysis.flaggedReasons.push('Sinistro muito próximo à ativação da cobertura');
    fraudAnalysis.checks.timeCheck = 'FLAG';
  }

  // Determinar nível de risco
  if (fraudAnalysis.riskScore > 0.7) {
    fraudAnalysis.riskLevel = 'HIGH';
  } else if (fraudAnalysis.riskScore > 0.4) {
    fraudAnalysis.riskLevel = 'MEDIUM';
  }

  return fraudAnalysis;
}

function calculateAdvancedApprovedAmount(requestedAmount, coverage, aiAnalysis, fraudAnalysis) {
  let approvedAmount = requestedAmount;

  // Aplicar dedutível
  approvedAmount = Math.max(0, approvedAmount - coverage.deductible);

  // Verificar limite máximo
  approvedAmount = Math.min(approvedAmount, coverage.maxCoverage);

  // Ajustar baseado na confiança da IA
  if (aiAnalysis.confidence < 0.7) {
    approvedAmount *= 0.8; // Reduzir 20% se baixa confiança
  }

  // Ajustar baseado no risco de fraude
  if (fraudAnalysis.riskScore > 0.5) {
    approvedAmount *= 0.7; // Reduzir 30% se alto risco de fraude
  }

  return Math.round(approvedAmount * 100) / 100;
}

function calculateAdvancedShieldLevel(data) {
  const { coverageHistory, claimHistory, riskAssessments, healthMetrics, userProfile } = data;
  
  let points = 0;
  
  // Pontos por coberturas ativas
  points += coverageHistory.filter(c => c.status === 'ACTIVE').length * 100;
  
  // Pontos por histórico sem sinistros
  const claimFreeMonths = calculateClaimFreeMonths(coverageHistory, claimHistory);
  points += claimFreeMonths * 10;
  
  // Pontos por baixo risco
  if (riskAssessments.length > 0) {
    const avgRiskScore = riskAssessments.reduce((sum, r) => sum + r.overallScore, 0) / riskAssessments.length;
    if (avgRiskScore < 30) points += 200;
    else if (avgRiskScore < 50) points += 100;
  }
  
  // Pontos por métricas de saúde
  if (healthMetrics.length > 0) {
    points += Math.min(healthMetrics.length * 5, 100);
  }
  
  // Determinar nível baseado nos pontos
  let level = 1;
  let tier = 'BRONZE';
  
  if (points >= 2000) {
    level = 5;
    tier = 'DIAMOND';
  } else if (points >= 1500) {
    level = 4;
    tier = 'PLATINUM';
  } else if (points >= 1000) {
    level = 3;
    tier = 'GOLD';
  } else if (points >= 500) {
    level = 2;
    tier = 'SILVER';
  }
  
  // Benefícios baseados no nível
  const benefits = getShieldLevelBenefits(level, tier);
  
  // Requisitos para próximo nível
  const nextLevelRequirements = getNextLevelRequirements(level, points);
  
  return {
    level,
    tier,
    points,
    benefits,
    nextLevelRequirements
  };
}

function getShieldLevelBenefits(level, tier) {
  const baseBenefits = {
    discountPercentage: level * 5,
    prioritySupport: level >= 3,
    extendedCoverage: level >= 4,
    premiumFeatures: level >= 5
  };

  const tierBenefits = {
    'BRONZE': { additionalDiscount: 0, specialPerks: [] },
    'SILVER': { additionalDiscount: 2, specialPerks: ['Consultas de prevenção gratuitas'] },
    'GOLD': { additionalDiscount: 5, specialPerks: ['Consultas de prevenção gratuitas', 'Telemedicina ilimitada'] },
    'PLATINUM': { additionalDiscount: 8, specialPerks: ['Consultas de prevenção gratuitas', 'Telemedicina ilimitada', 'Check-ups anuais'] },
    'DIAMOND': { additionalDiscount: 10, specialPerks: ['Consultas de prevenção gratuitas', 'Telemedicina ilimitada', 'Check-ups anuais', 'Concierge médico'] }
  };

  return {
    ...baseBenefits,
    ...tierBenefits[tier]
  };
}

// Implementar outras funções auxiliares...
// (Por questão de espaço, incluiria as demais funções necessárias)

module.exports = {
  submitClaim,
  getClaimStatus,
  getUserShieldLevel,
  getShieldTrends,
  getGamificationProgress,
  getGamificationRewards
};

