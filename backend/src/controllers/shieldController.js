const { PrismaClient } = require('@prisma/client');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const dynamicPricingService = require('../services/shield/dynamicPricingService');
const { createNotification } = require('../services/notification/notificationService');
const { logger } = require('../config/logger');

const prisma = new PrismaClient();

class ShieldController {

  /**
   * Calcular prêmio dinâmico para um serviço
   * @route POST /api/shield/calculate-premium
   */
  calculatePremium = asyncHandler(async (req, res) => {
    const { coverageType, serviceValue, duration = 30, serviceId } = req.body;
    const userId = req.user.id;

    // Validações básicas
    if (!coverageType || !serviceValue) {
      throw new AppError('Tipo de cobertura e valor do serviço são obrigatórios', 400);
    }

    if (serviceValue <= 0) {
      throw new AppError('Valor do serviço deve ser maior que zero', 400);
    }

    // Buscar cobertura por tipo
    const coverage = await prisma.coverage.findFirst({
      where: { 
        type: coverageType,
        isActive: true 
      }
    });

    if (!coverage) {
      throw new AppError('Tipo de cobertura não encontrado', 404);
    }

    // Obter região do usuário
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId },
      select: { zipCode: true, city: true, state: true }
    });

    const region = userProfile?.state || 'SP'; // Default para SP se não encontrar

    // Calcular prêmio dinâmico
    const pricingResult = await dynamicPricingService.calculateDynamicPremium({
      userId,
      coverageId: coverage.id,
      serviceValue,
      duration,
      region
    });

    // Log da consulta de preço
    logger.info('Consulta de preço realizada', {
      userId,
      coverageType,
      serviceValue,
      premium: pricingResult.premium,
      approved: pricingResult.success
    });

    res.json({
      success: true,
      data: {
        coverage: {
          id: coverage.id,
          name: coverage.name,
          type: coverage.type,
          description: coverage.description
        },
        pricing: pricingResult,
        recommendation: this.generatePricingRecommendation(pricingResult)
      }
    });
  });

  /**
   * Ativar cobertura por transação
   * @route POST /api/shield/activate-coverage
   */
  activateCoverage = asyncHandler(async (req, res) => {
    const { coverageType, serviceId, serviceValue, duration = 30, autoActivate = false } = req.body;
    const userId = req.user.id;

    // Validações
    if (!coverageType || !serviceValue) {
      throw new AppError('Tipo de cobertura e valor do serviço são obrigatórios', 400);
    }

    // Buscar cobertura
    const coverage = await prisma.coverage.findFirst({
      where: { 
        type: coverageType,
        isActive: true 
      }
    });

    if (!coverage) {
      throw new AppError('Tipo de cobertura não encontrado', 404);
    }

    // Verificar se já existe cobertura ativa para este serviço
    if (serviceId) {
      const existingCoverage = await prisma.userCoverage.findFirst({
        where: {
          userId,
          serviceId,
          isActive: true,
          endDate: { gte: new Date() }
        }
      });

      if (existingCoverage) {
        throw new AppError('Já existe cobertura ativa para este serviço', 400);
      }
    }

    // Ativar cobertura com precificação dinâmica
    const result = await dynamicPricingService.activateTransactionCoverage({
      userId,
      coverageId: coverage.id,
      serviceId,
      serviceValue,
      duration
    });

    // Criar notificação
    await createNotification({
      userId,
      type: 'COVERAGE_ACTIVATED',
      title: 'Cobertura Ativada',
      message: `Cobertura ${coverage.name} ativada com sucesso! Prêmio: R$ ${result.pricing.premium}`,
      data: { 
        coverageId: result.coverage.id,
        premium: result.pricing.premium
      },
      priority: 'NORMAL'
    });

    // Log da ativação
    logger.info('Cobertura ativada', {
      userId,
      coverageId: result.coverage.id,
      serviceId,
      premium: result.pricing.premium,
      riskScore: result.pricing.riskScore
    });

    res.status(201).json({
      success: true,
      message: 'Cobertura ativada com sucesso',
      data: {
        coverage: result.coverage,
        pricing: result.pricing,
        nextSteps: this.generateNextSteps(result.coverage)
      }
    });
  });

  /**
   * Obter dashboard do Shield com análise de risco
   * @route GET /api/shield/dashboard
   */
  getDashboard = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    // Buscar ou criar Shield do usuário
    let userShield = await prisma.userShield.findUnique({
      where: { userId },
      include: {
        coverages: {
          where: { isActive: true },
          include: { coverage: true },
          orderBy: { createdAt: 'desc' }
        },
        claims: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: {
            coverage: {
              include: { coverage: true }
            }
          }
        },
        riskHistory: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!userShield) {
      userShield = await this.createDefaultUserShield(userId);
    }

    // Calcular estatísticas
    const stats = await this.calculateShieldStats(userId);

    // Gerar insights de IA
    const aiInsights = await this.generateAIInsights(userShield);

    // Alertas ativos
    const activeAlerts = await this.getActiveAlerts(userId);

    // Recomendações personalizadas
    const recommendations = await this.generatePersonalizedRecommendations(userShield);

    const dashboard = {
      userShield: {
        riskScore: userShield.riskScore,
        shieldLevel: userShield.shieldLevel,
        totalPoints: userShield.totalPoints,
        isActive: userShield.isActive
      },
      stats,
      activeCoverages: userShield.coverages,
      recentClaims: userShield.claims,
      riskTrend: this.analyzeRiskTrend(userShield.riskHistory),
      aiInsights,
      activeAlerts,
      recommendations,
      performance: {
        claimsResolved: stats.approvedClaims,
        averageResolutionTime: '2.4h',
        satisfactionRate: 96,
        savingsThisMonth: stats.estimatedSavings
      }
    };

    res.json({
      success: true,
      data: { dashboard }
    });
  });

  /**
   * Análise de risco inteligente
   * @route GET /api/shield/risk-analysis
   */
  getRiskAnalysis = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const userShield = await prisma.userShield.findUnique({
      where: { userId },
      include: {
        riskHistory: {
          orderBy: { createdAt: 'desc' },
          take: 30
        },
        claims: {
          where: {
            createdAt: { gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }
          }
        }
      }
    });

    if (!userShield) {
      throw new AppError('Shield do usuário não encontrado', 404);
    }

    // Análise comportamental
    const behavioralAnalysis = await this.analyzeBehavioralPatterns(userId);

    // Insights preditivos
    const predictiveInsights = await this.generatePredictiveInsights(userShield);

    // Fatores de risco detalhados
    const riskFactors = await this.analyzeDetailedRiskFactors(userShield);

    // Recomendações para redução de risco
    const riskReductions = await this.generateRiskReductionRecommendations(userShield);

    const riskAnalysis = {
      currentScore: userShield.riskScore,
      scoreHistory: userShield.riskHistory.map(h => ({
        score: h.riskScore,
        date: h.createdAt,
        trigger: h.trigger
      })),
      trend: this.calculateRiskTrend(userShield.riskHistory),
      confidence: 94.2,
      lastUpdated: new Date(),
      behavioralAnalysis,
      predictiveInsights,
      riskFactors,
      riskReductions,
      benchmarks: await this.getRiskBenchmarks(userShield.riskScore)
    };

    res.json({
      success: true,
      data: { riskAnalysis }
    });
  });

  /**
   * Criar sinistro com análise NLP
   * @route POST /api/shield/claims
   */
  createClaim = asyncHandler(async (req, res) => {
    const { coverageId, description, amount, attachments = [], urgency = 'NORMAL' } = req.body;
    const userId = req.user.id;

    // Validações
    if (!coverageId || !description || !amount) {
      throw new AppError('Cobertura, descrição e valor são obrigatórios', 400);
    }

    // Verificar cobertura
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
    const nlpAnalysis = await this.analyzeClaimWithNLP(description);

    // Determinar tipo e severidade
    const claimType = this.determineClaimType(nlpAnalysis, userCoverage.coverage.type);
    const severity = this.calculateClaimSeverity(nlpAnalysis, amount, userCoverage.serviceValue);

    // Verificar se pode ser resolvido automaticamente
    const canAutoResolve = this.canAutoResolveClaim(nlpAnalysis, severity, amount, userCoverage);

    // Criar sinistro
    const claim = await prisma.claim.create({
      data: {
        userId,
        userShieldId: userCoverage.userId,
        coverageId,
        type: claimType,
        description,
        amount,
        severity,
        status: canAutoResolve ? 'APPROVED' : 'PENDING',
        nlpAnalysis: JSON.stringify(nlpAnalysis),
        aiConfidence: nlpAnalysis.confidence,
        autoProcessed: canAutoResolve,
        attachments: JSON.stringify(attachments),
        ...(canAutoResolve && {
          approvedAt: new Date(),
          approvedBy: 'SYSTEM_AI',
          payoutAmount: amount
        })
      },
      include: {
        coverage: {
          include: { coverage: true }
        }
      }
    });

    // Processar pagamento automático se aprovado
    if (canAutoResolve) {
      await this.processAutomaticPayout(claim);
    }

    // Notificação
    await createNotification({
      userId,
      type: canAutoResolve ? 'CLAIM_APPROVED' : 'CLAIM_CREATED',
      title: canAutoResolve ? 'Sinistro Aprovado Automaticamente' : 'Sinistro Criado',
      message: canAutoResolve 
        ? `Seu sinistro foi aprovado automaticamente! Valor: R$ ${amount}`
        : 'Seu sinistro foi criado e está sendo analisado por nossa IA.',
      data: { claimId: claim.id },
      priority: canAutoResolve ? 'HIGH' : 'NORMAL'
    });

    // Log do sinistro
    logger.info('Sinistro criado', {
      userId,
      claimId: claim.id,
      amount,
      autoResolved: canAutoResolve,
      aiConfidence: nlpAnalysis.confidence
    });

    res.status(201).json({
      success: true,
      message: canAutoResolve 
        ? 'Sinistro criado e aprovado automaticamente pela IA'
        : 'Sinistro criado com sucesso',
      data: { 
        claim,
        aiAnalysis: {
          confidence: nlpAnalysis.confidence,
          sentiment: nlpAnalysis.sentiment,
          keywords: nlpAnalysis.keywords,
          autoResolved: canAutoResolve,
          estimatedResolutionTime: canAutoResolve ? 'Imediato' : '2-4 horas'
        }
      }
    });
  });

  // ===== MÉTODOS AUXILIARES =====

  async createDefaultUserShield(userId) {
    return await prisma.userShield.create({
      data: {
        userId,
        riskScore: 85.0,
        shieldLevel: 'BRONZE',
        totalPoints: 0,
        isActive: true
      },
      include: {
        coverages: true,
        claims: true,
        riskHistory: true
      }
    });
  }

  async calculateShieldStats(userId) {
    const [
      totalCoverages,
      activeCoverages,
      totalClaims,
      approvedClaims,
      totalPayout,
      totalPremiums
    ] = await Promise.all([
      prisma.userCoverage.count({ where: { userId } }),
      prisma.userCoverage.count({ where: { userId, isActive: true } }),
      prisma.claim.count({ where: { userId } }),
      prisma.claim.count({ where: { userId, status: 'APPROVED' } }),
      prisma.claim.aggregate({
        where: { userId, status: 'APPROVED' },
        _sum: { payoutAmount: true }
      }),
      prisma.userCoverage.aggregate({
        where: { userId },
        _sum: { premium: true }
      })
    ]);

    const totalPayoutValue = totalPayout._sum.payoutAmount || 0;
    const totalPremiumValue = totalPremiums._sum.premium || 0;
    const estimatedSavings = Math.max(0, totalPayoutValue - totalPremiumValue);

    return {
      totalCoverages,
      activeCoverages,
      totalClaims,
      approvedClaims,
      totalPayout: totalPayoutValue,
      totalPremiums: totalPremiumValue,
      estimatedSavings,
      claimsApprovalRate: totalClaims > 0 ? (approvedClaims / totalClaims) * 100 : 0
    };
  }

  generatePricingRecommendation(pricingResult) {
    const recommendations = [];

    if (!pricingResult.success) {
      recommendations.push({
        type: 'ERROR',
        message: 'Não foi possível calcular o prêmio para este serviço',
        action: 'Verifique o valor do serviço e tente novamente'
      });
      return recommendations;
    }

    if (pricingResult.riskScore > 90) {
      recommendations.push({
        type: 'WARNING',
        message: 'Seu score de risco está alto',
        action: 'Complete seu perfil e mantenha um bom histórico para reduzir o prêmio'
      });
    }

    if (pricingResult.breakdown.discountApplied > 0) {
      recommendations.push({
        type: 'SUCCESS',
        message: `Desconto de ${(pricingResult.breakdown.discountApplied * 100).toFixed(1)}% aplicado pelo seu nível Shield`,
        action: 'Continue acumulando pontos para aumentar seu nível'
      });
    }

    const premiumRatio = pricingResult.premium / pricingResult.coverage.maxCoverage;
    if (premiumRatio < 0.05) {
      recommendations.push({
        type: 'INFO',
        message: 'Excelente custo-benefício para esta cobertura',
        action: 'Recomendamos ativar a cobertura'
      });
    }

    return recommendations;
  }

  generateNextSteps(coverage) {
    return [
      {
        step: 1,
        title: 'Cobertura Ativada',
        description: 'Sua cobertura está ativa e pronta para uso',
        completed: true
      },
      {
        step: 2,
        title: 'Utilize o Serviço',
        description: 'Realize sua consulta ou procedimento com tranquilidade',
        completed: false
      },
      {
        step: 3,
        title: 'Suporte Disponível',
        description: 'Em caso de necessidade, abra um sinistro pelo app',
        completed: false
      }
    ];
  }

  async analyzeClaimWithNLP(description) {
    // Simulação de análise NLP - em produção, integrar com serviço real de NLP
    const keywords = this.extractKeywords(description);
    const sentiment = this.analyzeSentiment(description);
    const urgencyLevel = this.detectUrgency(description);
    const confidence = this.calculateNLPConfidence(description, keywords, sentiment);

    return {
      keywords,
      sentiment,
      urgencyLevel,
      confidence,
      suggestedActions: this.generateSuggestedActions(keywords, sentiment, urgencyLevel),
      fraudRisk: this.assessFraudRisk(description, keywords)
    };
  }

  extractKeywords(text) {
    // Palavras-chave relacionadas à saúde
    const healthKeywords = [
      'dor', 'febre', 'consulta', 'exame', 'emergência', 'urgente',
      'médico', 'hospital', 'clínica', 'tratamento', 'medicamento',
      'cirurgia', 'internação', 'ambulância'
    ];

    const words = text.toLowerCase().split(/\s+/);
    return healthKeywords.filter(keyword => 
      words.some(word => word.includes(keyword))
    );
  }

  analyzeSentiment(text) {
    // Análise básica de sentimento
    const positiveWords = ['bom', 'ótimo', 'excelente', 'satisfeito', 'melhor'];
    const negativeWords = ['ruim', 'péssimo', 'terrível', 'pior', 'insatisfeito', 'dor', 'problema'];

    const words = text.toLowerCase().split(/\s+/);
    const positiveCount = positiveWords.filter(word => words.includes(word)).length;
    const negativeCount = negativeWords.filter(word => words.includes(word)).length;

    if (negativeCount > positiveCount) return 'NEGATIVE';
    if (positiveCount > negativeCount) return 'POSITIVE';
    return 'NEUTRAL';
  }

  detectUrgency(text) {
    const urgentWords = ['urgente', 'emergência', 'grave', 'imediato', 'socorro'];
    const words = text.toLowerCase().split(/\s+/);
    
    return urgentWords.some(word => words.includes(word)) ? 'HIGH' : 'NORMAL';
  }

  calculateNLPConfidence(text, keywords, sentiment) {
    let confidence = 0.5; // Base

    // Aumentar confiança baseado no comprimento e detalhes
    if (text.length > 50) confidence += 0.2;
    if (keywords.length > 2) confidence += 0.2;
    if (sentiment !== 'NEUTRAL') confidence += 0.1;

    return Math.min(1.0, confidence);
  }

  generateSuggestedActions(keywords, sentiment, urgencyLevel) {
    const actions = [];

    if (urgencyLevel === 'HIGH') {
      actions.push('Priorizar análise do sinistro');
      actions.push('Contatar usuário em até 1 hora');
    }

    if (sentiment === 'NEGATIVE') {
      actions.push('Oferecer suporte adicional');
      actions.push('Acompanhar satisfação do usuário');
    }

    if (keywords.includes('emergência')) {
      actions.push('Verificar se foi atendimento de emergência');
      actions.push('Validar documentação médica');
    }

    return actions;
  }

  assessFraudRisk(description, keywords) {
    // Análise básica de risco de fraude
    let riskScore = 0;

    // Descrições muito vagas aumentam o risco
    if (description.length < 20) riskScore += 0.3;

    // Falta de palavras-chave específicas
    if (keywords.length === 0) riskScore += 0.2;

    // Valores muito altos sem justificativa
    const hasHighValueKeywords = keywords.some(k => 
      ['cirurgia', 'internação', 'emergência'].includes(k)
    );
    
    return {
      score: Math.min(1.0, riskScore),
      level: riskScore > 0.7 ? 'HIGH' : riskScore > 0.4 ? 'MEDIUM' : 'LOW'
    };
  }

  determineClaimType(nlpAnalysis, coverageType) {
    if (nlpAnalysis.keywords.includes('emergência')) return 'EMERGENCY';
    if (nlpAnalysis.keywords.includes('exame')) return 'EXAM';
    if (nlpAnalysis.keywords.includes('consulta')) return 'CONSULTATION';
    if (nlpAnalysis.keywords.includes('cirurgia')) return 'PROCEDURE';
    
    return coverageType; // Default para o tipo da cobertura
  }

  calculateClaimSeverity(nlpAnalysis, amount, serviceValue) {
    let severity = 'LOW';

    // Baseado no valor
    const valueRatio = amount / serviceValue;
    if (valueRatio > 0.8) severity = 'HIGH';
    else if (valueRatio > 0.5) severity = 'MEDIUM';

    // Baseado na análise NLP
    if (nlpAnalysis.urgencyLevel === 'HIGH') severity = 'HIGH';
    if (nlpAnalysis.keywords.includes('emergência')) severity = 'CRITICAL';

    return severity;
  }

  canAutoResolveClaim(nlpAnalysis, severity, amount, userCoverage) {
    // Critérios para resolução automática
    const conditions = [
      nlpAnalysis.confidence > 0.8,
      nlpAnalysis.fraudRisk.level === 'LOW',
      severity !== 'CRITICAL',
      amount <= userCoverage.serviceValue * 0.3, // Máximo 30% do valor do serviço
      amount <= 500 // Valor máximo para auto-resolução
    ];

    return conditions.every(condition => condition === true);
  }

  async processAutomaticPayout(claim) {
    // Simular processamento de pagamento automático
    logger.info('Processando pagamento automático', {
      claimId: claim.id,
      amount: claim.amount
    });

    // Atualizar claim com dados do pagamento
    await prisma.claim.update({
      where: { id: claim.id },
      data: {
        payoutDate: new Date(),
        payoutMethod: 'PIX_AUTO',
        status: 'PAID'
      }
    });

    return true;
  }

  analyzeRiskTrend(riskHistory) {
    if (!riskHistory || riskHistory.length < 2) {
      return { trend: 'STABLE', change: 0 };
    }

    const recent = riskHistory[0].riskScore;
    const previous = riskHistory[1].riskScore;
    const change = recent - previous;

    let trend = 'STABLE';
    if (change > 5) trend = 'INCREASING';
    else if (change < -5) trend = 'DECREASING';

    return { trend, change: Math.round(change * 10) / 10 };
  }

  async generateAIInsights(userShield) {
    // Insights baseados em IA - simulação
    const insights = [];

    if (userShield.riskScore < 70) {
      insights.push({
        type: 'POSITIVE',
        title: 'Excelente Perfil de Risco',
        message: 'Seu score de risco está muito bom! Continue assim para manter benefícios.',
        confidence: 0.95
      });
    }

    if (userShield.claims.length === 0) {
      insights.push({
        type: 'INFO',
        title: 'Histórico Limpo',
        message: 'Você ainda não teve sinistros. Isso é ótimo para seu score!',
        confidence: 1.0
      });
    }

    return insights;
  }

  async getActiveAlerts(userId) {
    // Alertas ativos - simulação
    const alerts = [];

    const expiringSoon = await prisma.userCoverage.count({
      where: {
        userId,
        isActive: true,
        endDate: {
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 dias
        }
      }
    });

    if (expiringSoon > 0) {
      alerts.push({
        type: 'WARNING',
        title: 'Coberturas Expirando',
        message: `Você tem ${expiringSoon} cobertura(s) expirando em breve`,
        action: 'Renovar coberturas'
      });
    }

    return alerts;
  }

  async generatePersonalizedRecommendations(userShield) {
    const recommendations = [];

    // Recomendação baseada no nível Shield
    if (userShield.shieldLevel === 'BRONZE') {
      recommendations.push({
        type: 'UPGRADE',
        title: 'Evolua para Silver',
        message: 'Complete mais ações para subir de nível e ter mais benefícios',
        points: 500 - userShield.totalPoints
      });
    }

    // Recomendação baseada no risk score
    if (userShield.riskScore > 85) {
      recommendations.push({
        type: 'IMPROVEMENT',
        title: 'Melhore seu Score',
        message: 'Complete seu perfil e mantenha bons hábitos para reduzir seu score de risco',
        impact: 'Prêmios mais baixos'
      });
    }

    return recommendations;
  }
}

module.exports = new ShieldController();