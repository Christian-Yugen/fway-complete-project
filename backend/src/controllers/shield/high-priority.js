const express = require('express');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

// ====================================
// 1. PRECIFICAÇÃO DINÂMICA
// ====================================

/**
 * POST /api/shield/calculate-premium
 * Calcula prêmio dinâmico baseado em fatores de risco e IA
 */
const calculatePremium = async (req, res) => {
  try {
    const { serviceType, userProfile, serviceDetails } = req.body;
    
    // Validação básica
    if (!serviceType || !userProfile) {
      return res.status(400).json({
        success: false,
        message: 'serviceType e userProfile são obrigatórios'
      });
    }

    // Buscar fatores de risco do usuário
    const userRiskFactors = await prisma.riskFactor.findMany({
      where: { userId: userProfile.userId || req.user?.id }
    });

    // Buscar perfil médico para contexto adicional
    const medicalProfile = await prisma.medicalProfile.findUnique({
      where: { userId: userProfile.userId || req.user?.id }
    });

    // Algoritmo de precificação dinâmica
    const basePremium = getBasePremium(serviceType);
    const riskMultiplier = calculateRiskMultiplier(userProfile, userRiskFactors, medicalProfile);
    const urgencyMultiplier = getUrgencyMultiplier(serviceDetails?.urgency || 'MEDIUM');
    const locationMultiplier = getLocationMultiplier(userProfile.location);
    const timeMultiplier = getTimeMultiplier(serviceDetails?.scheduledTime);
    
    const finalPremium = basePremium * riskMultiplier * urgencyMultiplier * locationMultiplier * timeMultiplier;

    // Calcular score de risco
    const riskScore = calculateRiskScore(userProfile, userRiskFactors, medicalProfile);

    // Salvar cálculo no histórico
    const premiumCalculation = await prisma.premiumCalculation.create({
      data: {
        userId: userProfile.userId || req.user?.id,
        serviceType,
        basePremium,
        riskMultiplier,
        urgencyMultiplier,
        locationMultiplier,
        timeMultiplier,
        finalPremium,
        riskScore,
        factors: {
          userProfile,
          serviceDetails,
          riskFactors: userRiskFactors,
          medicalProfile: medicalProfile ? {
            chronicConditions: medicalProfile.chronicConditions,
            allergies: medicalProfile.allergies,
            currentMedications: medicalProfile.currentMedications
          } : null
        }
      }
    });

    // Gerar insights epidemiológicos para a região
    const epidemiologicalInsights = await getEpidemiologicalInsights(userProfile.location);

    res.json({
      success: true,
      data: {
        calculationId: premiumCalculation.id,
        basePremium,
        finalPremium: Math.round(finalPremium * 100) / 100,
        riskMultiplier,
        urgencyMultiplier,
        locationMultiplier,
        timeMultiplier,
        breakdown: {
          basePrice: basePremium,
          riskAdjustment: (riskMultiplier - 1) * basePremium,
          urgencyAdjustment: (urgencyMultiplier - 1) * basePremium,
          locationAdjustment: (locationMultiplier - 1) * basePremium,
          timeAdjustment: (timeMultiplier - 1) * basePremium
        },
        riskScore,
        riskLevel: getRiskLevel(riskScore),
        factors: {
          age: userProfile.age,
          riskFactors: userRiskFactors.map(rf => rf.factor),
          location: userProfile.location,
          urgency: serviceDetails?.urgency,
          scheduledTime: serviceDetails?.scheduledTime
        },
        epidemiologicalContext: epidemiologicalInsights,
        recommendations: generatePricingRecommendations(riskScore, finalPremium, basePremium)
      }
    });

  } catch (error) {
    console.error('Erro ao calcular prêmio:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * GET /api/shield/risk-factors
 * Retorna fatores de risco configuráveis
 */
const getRiskFactors = async (req, res) => {
  try {
    const riskFactors = [
      // Fatores demográficos
      { id: 'age_over_60', name: 'Idade acima de 60 anos', multiplier: 1.3, category: 'demographic', description: 'Maior risco devido à idade avançada' },
      { id: 'age_over_70', name: 'Idade acima de 70 anos', multiplier: 1.5, category: 'demographic', description: 'Risco significativamente elevado' },
      
      // Fatores médicos
      { id: 'hypertension', name: 'Hipertensão', multiplier: 1.2, category: 'medical', description: 'Pressão arterial elevada' },
      { id: 'diabetes', name: 'Diabetes', multiplier: 1.4, category: 'medical', description: 'Diabetes tipo 1 ou 2' },
      { id: 'heart_disease', name: 'Doença cardíaca', multiplier: 1.6, category: 'medical', description: 'Histórico de problemas cardíacos' },
      { id: 'asthma', name: 'Asma', multiplier: 1.2, category: 'medical', description: 'Asma ou problemas respiratórios' },
      { id: 'obesity', name: 'Obesidade', multiplier: 1.3, category: 'medical', description: 'IMC acima de 30' },
      
      // Fatores de estilo de vida
      { id: 'smoking', name: 'Fumante', multiplier: 1.5, category: 'lifestyle', description: 'Tabagismo ativo' },
      { id: 'alcohol_abuse', name: 'Abuso de álcool', multiplier: 1.3, category: 'lifestyle', description: 'Consumo excessivo de álcool' },
      { id: 'sedentary', name: 'Sedentarismo', multiplier: 1.2, category: 'lifestyle', description: 'Falta de atividade física regular' },
      { id: 'high_stress', name: 'Alto nível de estresse', multiplier: 1.1, category: 'lifestyle', description: 'Estresse crônico ou trabalho de alto estresse' },
      
      // Fatores genéticos
      { id: 'family_history_heart', name: 'Histórico familiar cardíaco', multiplier: 1.2, category: 'genetic', description: 'Familiares com doenças cardíacas' },
      { id: 'family_history_cancer', name: 'Histórico familiar de câncer', multiplier: 1.2, category: 'genetic', description: 'Familiares com histórico de câncer' },
      { id: 'family_history_diabetes', name: 'Histórico familiar de diabetes', multiplier: 1.1, category: 'genetic', description: 'Familiares com diabetes' },
      
      // Fatores ocupacionais
      { id: 'high_risk_occupation', name: 'Ocupação de alto risco', multiplier: 1.4, category: 'occupational', description: 'Trabalho com exposição a riscos' },
      { id: 'healthcare_worker', name: 'Profissional de saúde', multiplier: 1.2, category: 'occupational', description: 'Exposição a patógenos' }
    ];

    // Buscar fatores de risco personalizados do usuário (se autenticado)
    let userSpecificFactors = [];
    if (req.user?.id) {
      userSpecificFactors = await prisma.riskFactor.findMany({
        where: { userId: req.user.id },
        select: {
          factor: true,
          severity: true,
          createdAt: true
        }
      });
    }

    res.json({
      success: true,
      data: {
        standardFactors: riskFactors,
        userFactors: userSpecificFactors,
        categories: {
          demographic: 'Fatores demográficos',
          medical: 'Condições médicas',
          lifestyle: 'Estilo de vida',
          genetic: 'Histórico familiar',
          occupational: 'Fatores ocupacionais'
        }
      }
    });

  } catch (error) {
    console.error('Erro ao buscar fatores de risco:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// ====================================
// 2. ATIVAÇÃO DE MICROSSEGUROS
// ====================================

/**
 * POST /api/shield/activate-coverage
 * Ativa microsseguro para uma transação específica
 */
const activateCoverage = async (req, res) => {
  try {
    const { coverageType, serviceId, premium, duration = 24, calculationId } = req.body;
    const userId = req.user?.id;

    if (!coverageType || !serviceId || !premium) {
      return res.status(400).json({
        success: false,
        message: 'coverageType, serviceId e premium são obrigatórios'
      });
    }

    // Buscar tipo de cobertura
    const coverageTypeData = await prisma.coverageType.findFirst({
      where: { name: coverageType }
    });

    if (!coverageTypeData) {
      return res.status(404).json({
        success: false,
        message: 'Tipo de cobertura não encontrado'
      });
    }

    // Verificar se já existe cobertura ativa para este serviço
    const existingCoverage = await prisma.coverage.findFirst({
      where: {
        userId,
        serviceId,
        status: 'ACTIVE'
      }
    });

    if (existingCoverage) {
      return res.status(409).json({
        success: false,
        message: 'Já existe uma cobertura ativa para este serviço'
      });
    }

    // Calcular data de expiração
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + duration);

    // Buscar dados do cálculo de prêmio (se fornecido)
    let calculationData = null;
    if (calculationId) {
      calculationData = await prisma.premiumCalculation.findUnique({
        where: { id: calculationId }
      });
    }

    // Criar cobertura
    const coverage = await prisma.coverage.create({
      data: {
        userId,
        serviceId,
        coverageTypeId: coverageTypeData.id,
        status: 'ACTIVE',
        premium,
        deductible: coverageTypeData.features?.deductible || 0,
        maxCoverage: coverageTypeData.features?.maxCoverage || 1000,
        activatedAt: new Date(),
        expiresAt,
        calculationId,
        activationDetails: {
          userAgent: req.get('User-Agent'),
          ipAddress: req.ip,
          timestamp: new Date().toISOString()
        }
      }
    });

    // Criar registro de transação
    const transaction = await prisma.shieldTransaction.create({
      data: {
        userId,
        coverageId: coverage.id,
        type: 'ACTIVATION',
        amount: premium,
        status: 'COMPLETED',
        description: `Ativação de microsseguro - ${coverageTypeData.name}`
      }
    });

    // Gerar número de apólice
    const policyNumber = generatePolicyNumber(coverage.id);

    // Atualizar cobertura com número da apólice
    await prisma.coverage.update({
      where: { id: coverage.id },
      data: { policyNumber }
    });

    res.json({
      success: true,
      data: {
        coverageId: coverage.id,
        policyNumber,
        status: coverage.status,
        premium: coverage.premium,
        activatedAt: coverage.activatedAt,
        expiresAt: coverage.expiresAt,
        transactionId: transaction.id,
        coverageDetails: {
          type: coverageTypeData.name,
          description: coverageTypeData.description,
          maxCoverage: coverage.maxCoverage,
          deductible: coverage.deductible,
          features: coverageTypeData.features
        },
        calculationData: calculationData ? {
          riskScore: calculationData.riskScore,
          riskMultiplier: calculationData.riskMultiplier
        } : null
      }
    });

  } catch (error) {
    console.error('Erro ao ativar cobertura:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// ====================================
// 3. DASHBOARD DE RISCO AVANÇADO
// ====================================

/**
 * GET /api/shield/risk-analysis/user/:userId
 * Retorna análise de risco detalhada do usuário
 */
const getUserRiskAnalysis = async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user?.id;

    // Verificar se o usuário pode acessar estes dados
    if (userId !== requestingUserId && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }

    // Buscar perfil médico do usuário
    const medicalProfile = await prisma.medicalProfile.findUnique({
      where: { userId }
    });

    // Buscar fatores de risco
    const riskFactors = await prisma.riskFactor.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    // Buscar histórico de coberturas
    const coverageHistory = await prisma.coverage.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { 
        coverageType: true,
        claims: {
          select: {
            id: true,
            status: true,
            amount: true,
            createdAt: true
          }
        }
      }
    });

    // Buscar histórico de cálculos de prêmio
    const premiumHistory = await prisma.premiumCalculation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    // Calcular score de risco atual
    const currentRiskScore = calculateRiskScore({ userId }, riskFactors, medicalProfile);
    const riskLevel = getRiskLevel(currentRiskScore);

    // Análise de tendências
    const riskTrend = calculateRiskTrend(premiumHistory);

    // Análise por categoria
    const categoryAnalysis = analyzeCategoricalRisk(riskFactors, medicalProfile);

    // Insights epidemiológicos
    const epidemiologicalInsights = await getEpidemiologicalInsights(
      medicalProfile?.location || 'SP'
    );

    // Recomendações personalizadas
    const recommendations = generateRiskRecommendations(
      currentRiskScore, 
      riskFactors, 
      medicalProfile,
      coverageHistory
    );

    res.json({
      success: true,
      data: {
        userId,
        riskScore: currentRiskScore,
        riskLevel,
        riskTrend,
        categoryAnalysis,
        factors: {
          medical: riskFactors.filter(rf => rf.category === 'medical'),
          lifestyle: riskFactors.filter(rf => rf.category === 'lifestyle'),
          demographic: riskFactors.filter(rf => rf.category === 'demographic'),
          genetic: riskFactors.filter(rf => rf.category === 'genetic'),
          occupational: riskFactors.filter(rf => rf.category === 'occupational')
        },
        medicalProfile: medicalProfile ? {
          bloodType: medicalProfile.bloodType,
          allergies: medicalProfile.allergies,
          chronicConditions: medicalProfile.chronicConditions,
          currentMedications: medicalProfile.currentMedications,
          lastUpdated: medicalProfile.updatedAt
        } : null,
        coverageHistory: coverageHistory.map(c => ({
          id: c.id,
          policyNumber: c.policyNumber,
          type: c.coverageType.name,
          status: c.status,
          premium: c.premium,
          activatedAt: c.activatedAt,
          expiresAt: c.expiresAt,
          claimsCount: c.claims.length,
          totalClaimed: c.claims.reduce((sum, claim) => sum + (claim.amount || 0), 0)
        })),
        premiumTrend: analyzePremiumTrend(premiumHistory),
        epidemiologicalInsights,
        recommendations,
        lastAnalysis: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Erro ao buscar análise de risco:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * GET /api/shield/epidemiological-insights
 * Retorna insights epidemiológicos agregados
 */
const getEpidemiologicalInsightsEndpoint = async (req, res) => {
  try {
    const { region, timeframe = '30d' } = req.query;

    const insights = await getEpidemiologicalInsights(region || 'SP', timeframe);

    res.json({
      success: true,
      data: insights
    });

  } catch (error) {
    console.error('Erro ao buscar insights epidemiológicos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// ====================================
// FUNÇÕES AUXILIARES
// ====================================

function getBasePremium(serviceType) {
  const basePrices = {
    'CONSULTATION': 25.00,
    'EXAM': 45.00,
    'PROCEDURE': 80.00,
    'EMERGENCY': 150.00,
    'SURGERY': 200.00,
    'HOSPITALIZATION': 300.00
  };
  return basePrices[serviceType] || 25.00;
}

function calculateRiskMultiplier(userProfile, riskFactors, medicalProfile) {
  let multiplier = 1.0;
  
  // Fator idade
  if (userProfile.age > 70) multiplier *= 1.5;
  else if (userProfile.age > 60) multiplier *= 1.3;
  else if (userProfile.age > 45) multiplier *= 1.1;
  
  // Fatores de risco médicos
  riskFactors.forEach(factor => {
    const severity = factor.severity || 1;
    switch (factor.factor) {
      case 'hypertension': multiplier *= (1.1 + severity * 0.1); break;
      case 'diabetes': multiplier *= (1.2 + severity * 0.2); break;
      case 'heart_disease': multiplier *= (1.3 + severity * 0.3); break;
      case 'smoking': multiplier *= (1.3 + severity * 0.2); break;
      case 'obesity': multiplier *= (1.2 + severity * 0.1); break;
      case 'asthma': multiplier *= (1.1 + severity * 0.1); break;
      default: multiplier *= (1.05 + severity * 0.05);
    }
  });

  // Fatores do perfil médico
  if (medicalProfile) {
    if (medicalProfile.chronicConditions?.length > 0) {
      multiplier *= (1.1 + medicalProfile.chronicConditions.length * 0.05);
    }
    if (medicalProfile.currentMedications?.length > 3) {
      multiplier *= 1.1;
    }
  }
  
  return Math.min(multiplier, 4.0); // Cap no multiplicador
}

function getUrgencyMultiplier(urgency) {
  const multipliers = {
    'LOW': 0.8,
    'MEDIUM': 1.0,
    'HIGH': 1.5,
    'EMERGENCY': 2.0,
    'CRITICAL': 2.5
  };
  return multipliers[urgency] || 1.0;
}

function getLocationMultiplier(location) {
  // Multiplicador baseado em dados epidemiológicos regionais
  const locationMultipliers = {
    'SP': 1.2, // São Paulo - alta densidade populacional
    'RJ': 1.15, // Rio de Janeiro
    'MG': 1.0, // Minas Gerais
    'RS': 0.95, // Rio Grande do Sul
    'PR': 1.0, // Paraná
    'SC': 0.9, // Santa Catarina
    'BA': 1.1, // Bahia
    'PE': 1.1, // Pernambuco
    'CE': 1.05, // Ceará
    'GO': 1.0 // Goiás
  };
  return locationMultipliers[location] || 1.0;
}

function getTimeMultiplier(scheduledTime) {
  if (!scheduledTime) return 1.0;
  
  const hour = new Date(scheduledTime).getHours();
  
  // Horários de pico têm multiplicador maior
  if (hour >= 18 || hour <= 6) return 1.2; // Noite/madrugada
  if (hour >= 12 && hour <= 14) return 1.1; // Horário de almoço
  
  return 1.0;
}

function calculateRiskScore(userProfile, riskFactors, medicalProfile) {
  let score = 0;
  
  // Base score por idade
  if (userProfile.age) {
    if (userProfile.age > 80) score += 40;
    else if (userProfile.age > 70) score += 30;
    else if (userProfile.age > 60) score += 20;
    else if (userProfile.age > 45) score += 10;
  }
  
  // Score por fatores de risco
  riskFactors.forEach(factor => {
    const severity = factor.severity || 1;
    switch (factor.factor) {
      case 'diabetes': score += 20 + (severity * 5); break;
      case 'heart_disease': score += 25 + (severity * 5); break;
      case 'hypertension': score += 15 + (severity * 3); break;
      case 'smoking': score += 20 + (severity * 3); break;
      case 'obesity': score += 15 + (severity * 3); break;
      case 'asthma': score += 10 + (severity * 2); break;
      case 'family_history_heart': score += 10; break;
      case 'family_history_cancer': score += 10; break;
      case 'high_risk_occupation': score += 15; break;
      default: score += 5 + severity;
    }
  });

  // Score baseado no perfil médico
  if (medicalProfile) {
    if (medicalProfile.chronicConditions?.length > 0) {
      score += medicalProfile.chronicConditions.length * 8;
    }
    if (medicalProfile.allergies?.length > 2) {
      score += 5;
    }
    if (medicalProfile.currentMedications?.length > 5) {
      score += 10;
    }
  }
  
  return Math.min(score, 100);
}

function getRiskLevel(score) {
  if (score >= 80) return 'CRITICAL';
  if (score >= 60) return 'HIGH';
  if (score >= 40) return 'MEDIUM';
  if (score >= 20) return 'LOW';
  return 'MINIMAL';
}

function calculateRiskTrend(premiumHistory) {
  if (premiumHistory.length < 2) {
    return {
      direction: 'stable',
      change: 0,
      period: '30d'
    };
  }

  const recent = premiumHistory.slice(0, 5);
  const older = premiumHistory.slice(5, 10);

  const recentAvg = recent.reduce((sum, p) => sum + p.riskScore, 0) / recent.length;
  const olderAvg = older.length > 0 ? older.reduce((sum, p) => sum + p.riskScore, 0) / older.length : recentAvg;

  const change = ((recentAvg - olderAvg) / olderAvg) * 100;

  return {
    direction: change > 5 ? 'increasing' : change < -5 ? 'decreasing' : 'stable',
    change: Math.round(change),
    period: '30d',
    recentAverage: Math.round(recentAvg),
    previousAverage: Math.round(olderAvg)
  };
}

function analyzeCategoricalRisk(riskFactors, medicalProfile) {
  const categories = {
    medical: { score: 0, factors: [], level: 'LOW' },
    lifestyle: { score: 0, factors: [], level: 'LOW' },
    genetic: { score: 0, factors: [], level: 'LOW' },
    occupational: { score: 0, factors: [], level: 'LOW' },
    demographic: { score: 0, factors: [], level: 'LOW' }
  };

  riskFactors.forEach(factor => {
    const category = factor.category || 'medical';
    if (categories[category]) {
      categories[category].factors.push(factor.factor);
      categories[category].score += getFactorScore(factor.factor, factor.severity || 1);
    }
  });

  // Determinar nível de risco por categoria
  Object.keys(categories).forEach(cat => {
    const score = categories[cat].score;
    categories[cat].level = score > 30 ? 'HIGH' : score > 15 ? 'MEDIUM' : 'LOW';
  });

  return categories;
}

function getFactorScore(factor, severity) {
  const baseScores = {
    'diabetes': 20,
    'heart_disease': 25,
    'hypertension': 15,
    'smoking': 20,
    'obesity': 15,
    'asthma': 10
  };
  
  return (baseScores[factor] || 5) * severity;
}

async function getEpidemiologicalInsights(region = 'SP', timeframe = '30d') {
  // Simulação de dados epidemiológicos
  // Em produção, estes dados viriam de fontes externas ou análises internas
  const insights = {
    region,
    timeframe,
    lastUpdated: new Date().toISOString(),
    trends: [
      {
        condition: 'Gripe/Resfriado',
        incidence: 15.2,
        trend: 'increasing',
        change: '+12%',
        riskLevel: 'medium',
        description: 'Aumento sazonal típico do período'
      },
      {
        condition: 'COVID-19',
        incidence: 3.8,
        trend: 'stable',
        change: '-2%',
        riskLevel: 'low',
        description: 'Níveis controlados com vacinação'
      },
      {
        condition: 'Dengue',
        incidence: 8.5,
        trend: 'increasing',
        change: '+25%',
        riskLevel: 'high',
        description: 'Período chuvoso favorece reprodução do mosquito'
      },
      {
        condition: 'Hipertensão',
        incidence: 32.3,
        trend: 'stable',
        change: '+1%',
        riskLevel: 'high',
        description: 'Prevalência alta na população adulta'
      }
    ],
    riskFactors: {
      seasonal: ['Mudanças climáticas', 'Período chuvoso', 'Baixa umidade'],
      environmental: ['Qualidade do ar', 'Poluição urbana', 'Alérgenos'],
      social: ['Aglomerações', 'Eventos públicos', 'Transporte público']
    },
    recommendations: [
      'Aumentar precauções contra dengue devido ao período chuvoso',
      'Manter vacinação em dia',
      'Evitar aglomerações em locais fechados',
      'Monitorar pressão arterial regularmente'
    ],
    alertLevel: 'MEDIUM'
  };

  return insights;
}

function generatePricingRecommendations(riskScore, finalPremium, basePremium) {
  const recommendations = [];
  
  const increase = ((finalPremium - basePremium) / basePremium) * 100;
  
  if (increase > 50) {
    recommendations.push({
      type: 'HIGH_PREMIUM',
      message: 'Prêmio elevado devido ao alto risco',
      suggestion: 'Considere melhorar fatores de risco modificáveis'
    });
  }
  
  if (riskScore > 60) {
    recommendations.push({
      type: 'HIGH_RISK',
      message: 'Score de risco elevado detectado',
      suggestion: 'Recomendamos consulta médica preventiva'
    });
  }
  
  if (recommendations.length === 0) {
    recommendations.push({
      type: 'GOOD_RISK',
      message: 'Perfil de risco favorável',
      suggestion: 'Continue mantendo hábitos saudáveis'
    });
  }
  
  return recommendations;
}

function generateRiskRecommendations(riskScore, riskFactors, medicalProfile, coverageHistory) {
  const recommendations = [];
  
  if (riskScore > 70) {
    recommendations.push({
      priority: 'HIGH',
      category: 'MEDICAL',
      title: 'Consulta médica urgente recomendada',
      description: 'Seu perfil de risco indica necessidade de avaliação médica',
      action: 'Agendar consulta nos próximos 7 dias'
    });
  }
  
  // Recomendações baseadas em fatores de risco
  riskFactors.forEach(factor => {
    switch (factor.factor) {
      case 'smoking':
        recommendations.push({
          priority: 'HIGH',
          category: 'LIFESTYLE',
          title: 'Programa de cessação do tabagismo',
          description: 'Parar de fumar pode reduzir significativamente seu risco',
          action: 'Procurar programa de apoio para parar de fumar'
        });
        break;
      case 'obesity':
        recommendations.push({
          priority: 'MEDIUM',
          category: 'LIFESTYLE',
          title: 'Programa de controle de peso',
          description: 'Manter peso saudável reduz múltiplos fatores de risco',
          action: 'Consultar nutricionista e iniciar atividade física'
        });
        break;
      case 'sedentary':
        recommendations.push({
          priority: 'MEDIUM',
          category: 'LIFESTYLE',
          title: 'Aumentar atividade física',
          description: 'Exercícios regulares melhoram a saúde geral',
          action: 'Iniciar com 30 minutos de caminhada diária'
        });
        break;
    }
  });
  
  // Recomendações baseadas no histórico de coberturas
  if (coverageHistory.length === 0) {
    recommendations.push({
      priority: 'LOW',
      category: 'INSURANCE',
      title: 'Considere cobertura regular',
      description: 'Histórico sem coberturas pode indicar necessidade de proteção',
      action: 'Avaliar opções de seguro saúde'
    });
  }
  
  return recommendations;
}

function analyzePremiumTrend(premiumHistory) {
  if (premiumHistory.length < 2) return null;
  
  const recent = premiumHistory.slice(0, 5);
  const avgPremium = recent.reduce((sum, p) => sum + p.finalPremium, 0) / recent.length;
  
  return {
    averagePremium: Math.round(avgPremium * 100) / 100,
    totalCalculations: premiumHistory.length,
    trend: 'stable' // Simplificado para este exemplo
  };
}

function generatePolicyNumber(coverageId) {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `FW${timestamp}${random}${coverageId.toString().padStart(3, '0')}`;
}

module.exports = {
  calculatePremium,
  getRiskFactors,
  activateCoverage,
  getUserRiskAnalysis,
  getEpidemiologicalInsightsEndpoint
};

