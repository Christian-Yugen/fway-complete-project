const { PrismaClient } = require('@prisma/client');
const { AppError } = require('../../middleware/errorHandler');
const { logger } = require('../../config/logger');

const prisma = new PrismaClient();

class DynamicPricingService {
  
  /**
   * Calcula o prêmio dinâmico para um microsseguro
   * @param {Object} params - Parâmetros para cálculo
   * @param {string} params.userId - ID do usuário
   * @param {string} params.coverageId - ID do tipo de cobertura
   * @param {number} params.serviceValue - Valor do serviço a ser coberto
   * @param {number} params.duration - Duração da cobertura em dias
   * @param {string} params.region - Região do usuário
   * @returns {Object} Resultado da precificação
   */
  async calculateDynamicPremium(params) {
    const { userId, coverageId, serviceValue, duration = 30, region } = params;
    
    try {
      // 1. Buscar dados necessários
      const [coverage, userShield, epidemiologicalData, actuarialModel] = await Promise.all([
        this.getCoverageDetails(coverageId),
        this.getUserShieldData(userId),
        this.getEpidemiologicalData(region),
        this.getActiveActuarialModel(coverageId)
      ]);

      // 2. Calcular fatores de risco
      const riskFactors = await this.calculateRiskFactors({
        userShield,
        epidemiologicalData,
        serviceValue,
        coverage,
        duration
      });

      // 3. Aplicar modelo atuarial
      const basePremium = this.calculateBasePremium(serviceValue, coverage.baseRate);
      const adjustedPremium = this.applyActuarialModel(basePremium, riskFactors, actuarialModel);

      // 4. Aplicar limites e descontos
      const finalPremium = this.applyLimitsAndDiscounts(adjustedPremium, coverage, userShield);

      // 5. Validar resultado
      const validation = this.validatePricing(finalPremium, serviceValue, coverage);

      // 6. Log da transação
      await this.logPricingTransaction({
        userId,
        coverageId,
        serviceValue,
        riskFactors,
        basePremium,
        adjustedPremium,
        finalPremium,
        validation,
        actuarialModel
      });

      return {
        success: validation.approved,
        premium: finalPremium,
        riskScore: riskFactors.overallRiskScore,
        factors: riskFactors,
        coverage: {
          maxCoverage: coverage.maxCoverage,
          deductible: coverage.deductible,
          duration
        },
        breakdown: {
          basePremium,
          riskMultiplier: riskFactors.riskMultiplier,
          regionalFactor: riskFactors.regionalFactor,
          seasonalFactor: riskFactors.seasonalFactor,
          discountApplied: riskFactors.discountApplied
        },
        validation
      };

    } catch (error) {
      logger.error('Erro no cálculo de precificação dinâmica:', error);
      throw new AppError('Erro interno no cálculo de precificação', 500);
    }
  }

  /**
   * Busca detalhes da cobertura
   */
  async getCoverageDetails(coverageId) {
    const coverage = await prisma.coverage.findUnique({
      where: { id: coverageId, isActive: true }
    });

    if (!coverage) {
      throw new AppError('Cobertura não encontrada ou inativa', 404);
    }

    return coverage;
  }

  /**
   * Busca dados do Shield do usuário
   */
  async getUserShieldData(userId) {
    let userShield = await prisma.userShield.findUnique({
      where: { userId },
      include: {
        riskHistory: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    // Se não existe, criar com valores padrão
    if (!userShield) {
      userShield = await prisma.userShield.create({
        data: {
          userId,
          riskScore: 85.0,
          shieldLevel: 'BRONZE',
          totalPoints: 0,
          isActive: true
        },
        include: {
          riskHistory: true
        }
      });
    }

    return userShield;
  }

  /**
   * Busca dados epidemiológicos da região
   */
  async getEpidemiologicalData(region) {
    const currentDate = new Date();
    const thirtyDaysAgo = new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    const epidemiologicalData = await prisma.epidemiologicalData.findMany({
      where: {
        region,
        periodEnd: { gte: thirtyDaysAgo },
        reliability: { gte: 0.7 }
      },
      orderBy: { createdAt: 'desc' }
    });

    return epidemiologicalData;
  }

  /**
   * Busca modelo atuarial ativo
   */
  async getActiveActuarialModel(coverageId) {
    const coverage = await prisma.coverage.findUnique({
      where: { id: coverageId }
    });

    const model = await prisma.actuarialModel.findFirst({
      where: {
        isActive: true,
        coverageTypes: { contains: coverage.type }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Modelo padrão se não encontrar específico
    return model || {
      name: 'DEFAULT_MODEL',
      parameters: JSON.stringify({
        riskWeight: 0.3,
        regionalWeight: 0.2,
        seasonalWeight: 0.1,
        experienceWeight: 0.4
      }),
      weights: JSON.stringify({
        age: 0.15,
        history: 0.25,
        region: 0.20,
        seasonal: 0.10,
        service: 0.30
      })
    };
  }

  /**
   * Calcula fatores de risco
   */
  async calculateRiskFactors({ userShield, epidemiologicalData, serviceValue, coverage, duration }) {
    // 1. Fator de risco individual (baseado no risk score do usuário)
    const individualRiskFactor = this.calculateIndividualRiskFactor(userShield.riskScore);

    // 2. Fator regional (baseado em dados epidemiológicos)
    const regionalFactor = this.calculateRegionalFactor(epidemiologicalData);

    // 3. Fator sazonal (baseado na época do ano)
    const seasonalFactor = this.calculateSeasonalFactor(new Date(), epidemiologicalData);

    // 4. Fator do serviço (baseado no valor e tipo do serviço)
    const serviceFactor = this.calculateServiceFactor(serviceValue, coverage);

    // 5. Fator de experiência (baseado no histórico do usuário)
    const experienceFactor = await this.calculateExperienceFactor(userShield);

    // 6. Multiplicador de risco geral
    const riskMultiplier = this.calculateOverallRiskMultiplier({
      individualRiskFactor,
      regionalFactor,
      seasonalFactor,
      serviceFactor,
      experienceFactor
    });

    // 7. Desconto por nível do Shield
    const discountApplied = this.calculateShieldLevelDiscount(userShield.shieldLevel);

    return {
      overallRiskScore: userShield.riskScore,
      individualRiskFactor,
      regionalFactor,
      seasonalFactor,
      serviceFactor,
      experienceFactor,
      riskMultiplier,
      discountApplied
    };
  }

  /**
   * Calcula fator de risco individual
   */
  calculateIndividualRiskFactor(riskScore) {
    // Risk score de 0-100, onde menor = menor risco
    // Converte para multiplicador de 0.5 a 2.0
    return 0.5 + (riskScore / 100) * 1.5;
  }

  /**
   * Calcula fator regional
   */
  calculateRegionalFactor(epidemiologicalData) {
    if (!epidemiologicalData || epidemiologicalData.length === 0) {
      return 1.0; // Fator neutro se não há dados
    }

    // Média ponderada da incidência regional
    const weightedIncidence = epidemiologicalData.reduce((acc, data) => {
      return acc + (data.incidence * data.reliability);
    }, 0) / epidemiologicalData.length;

    // Converte incidência para fator de 0.8 a 1.5
    return 0.8 + (weightedIncidence / 100) * 0.7;
  }

  /**
   * Calcula fator sazonal
   */
  calculateSeasonalFactor(currentDate, epidemiologicalData) {
    const month = currentDate.getMonth() + 1;
    
    // Fatores sazonais básicos (pode ser refinado com dados epidemiológicos)
    const seasonalFactors = {
      1: 1.2,  // Janeiro - alta temporada de doenças respiratórias
      2: 1.2,  // Fevereiro
      3: 1.1,  // Março
      4: 1.0,  // Abril
      5: 0.9,  // Maio
      6: 0.9,  // Junho
      7: 0.9,  // Julho
      8: 0.9,  // Agosto
      9: 1.0,  // Setembro
      10: 1.1, // Outubro
      11: 1.1, // Novembro
      12: 1.2  // Dezembro
    };

    return seasonalFactors[month] || 1.0;
  }

  /**
   * Calcula fator do serviço
   */
  calculateServiceFactor(serviceValue, coverage) {
    // Fator baseado na relação valor do serviço / cobertura máxima
    const valueRatio = serviceValue / coverage.maxCoverage;
    
    // Serviços de maior valor têm fator ligeiramente maior
    return 0.9 + (valueRatio * 0.3);
  }

  /**
   * Calcula fator de experiência
   */
  async calculateExperienceFactor(userShield) {
    // Buscar histórico de sinistros dos últimos 12 meses
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const recentClaims = await prisma.claim.count({
      where: {
        userShieldId: userShield.id,
        createdAt: { gte: twelveMonthsAgo }
      }
    });

    const approvedClaims = await prisma.claim.count({
      where: {
        userShieldId: userShield.id,
        createdAt: { gte: twelveMonthsAgo },
        status: 'APPROVED'
      }
    });

    // Usuários sem sinistros ou com poucos sinistros aprovados têm desconto
    if (recentClaims === 0) return 0.8; // 20% de desconto
    if (recentClaims <= 2 && approvedClaims <= 1) return 0.9; // 10% de desconto
    if (recentClaims > 5) return 1.3; // 30% de aumento
    
    return 1.0; // Fator neutro
  }

  /**
   * Calcula multiplicador de risco geral
   */
  calculateOverallRiskMultiplier(factors) {
    const {
      individualRiskFactor,
      regionalFactor,
      seasonalFactor,
      serviceFactor,
      experienceFactor
    } = factors;

    // Pesos para cada fator
    const weights = {
      individual: 0.4,
      regional: 0.2,
      seasonal: 0.1,
      service: 0.2,
      experience: 0.1
    };

    const weightedMultiplier = 
      (individualRiskFactor * weights.individual) +
      (regionalFactor * weights.regional) +
      (seasonalFactor * weights.seasonal) +
      (serviceFactor * weights.service) +
      (experienceFactor * weights.experience);

    // Limitar entre 0.5 e 3.0
    return Math.max(0.5, Math.min(3.0, weightedMultiplier));
  }

  /**
   * Calcula desconto por nível do Shield
   */
  calculateShieldLevelDiscount(shieldLevel) {
    const discounts = {
      'BRONZE': 0.0,   // Sem desconto
      'SILVER': 0.05,  // 5% de desconto
      'GOLD': 0.10,    // 10% de desconto
      'PLATINUM': 0.15 // 15% de desconto
    };

    return discounts[shieldLevel] || 0.0;
  }

  /**
   * Calcula prêmio base
   */
  calculateBasePremium(serviceValue, baseRate) {
    return serviceValue * (baseRate / 100);
  }

  /**
   * Aplica modelo atuarial
   */
  applyActuarialModel(basePremium, riskFactors, actuarialModel) {
    // Aplicar multiplicador de risco
    let adjustedPremium = basePremium * riskFactors.riskMultiplier;

    // Aplicar parâmetros específicos do modelo atuarial
    try {
      const parameters = JSON.parse(actuarialModel.parameters || '{}');
      
      if (parameters.riskWeight) {
        adjustedPremium *= (1 + (parameters.riskWeight * (riskFactors.overallRiskScore / 100)));
      }
      
      if (parameters.regionalWeight) {
        adjustedPremium *= (1 + (parameters.regionalWeight * (riskFactors.regionalFactor - 1)));
      }
      
    } catch (error) {
      logger.warn('Erro ao aplicar parâmetros do modelo atuarial:', error);
    }

    return adjustedPremium;
  }

  /**
   * Aplica limites e descontos
   */
  applyLimitsAndDiscounts(premium, coverage, userShield) {
    // Aplicar desconto do nível Shield
    const shieldDiscount = this.calculateShieldLevelDiscount(userShield.shieldLevel);
    let finalPremium = premium * (1 - shieldDiscount);

    // Aplicar limites mínimo e máximo
    finalPremium = Math.max(coverage.minPremium, finalPremium);
    finalPremium = Math.min(coverage.maxPremium, finalPremium);

    // Arredondar para 2 casas decimais
    return Math.round(finalPremium * 100) / 100;
  }

  /**
   * Valida a precificação
   */
  validatePricing(premium, serviceValue, coverage) {
    const validation = {
      approved: true,
      reasons: [],
      warnings: []
    };

    // Verificar se o prêmio não é muito alto em relação ao valor do serviço
    const premiumRatio = premium / serviceValue;
    if (premiumRatio > 0.5) { // Prêmio maior que 50% do valor do serviço
      validation.approved = false;
      validation.reasons.push('Prêmio muito alto em relação ao valor do serviço');
    }

    // Verificar se está dentro dos limites da cobertura
    if (premium < coverage.minPremium) {
      validation.warnings.push('Prêmio ajustado para o mínimo permitido');
    }

    if (premium > coverage.maxPremium) {
      validation.warnings.push('Prêmio ajustado para o máximo permitido');
    }

    // Verificar se o valor do serviço não excede a cobertura máxima
    if (serviceValue > coverage.maxCoverage) {
      validation.approved = false;
      validation.reasons.push('Valor do serviço excede a cobertura máxima');
    }

    return validation;
  }

  /**
   * Registra log da transação de precificação
   */
  async logPricingTransaction(data) {
    try {
      await prisma.dynamicPricingLog.create({
        data: {
          userId: data.userId,
          coverageId: data.coverageId,
          serviceValue: data.serviceValue,
          calculatedPremium: data.adjustedPremium,
          finalPremium: data.finalPremium,
          riskScore: data.riskFactors.overallRiskScore,
          baseRate: data.coverage?.baseRate || 0,
          riskMultiplier: data.riskFactors.riskMultiplier,
          regionalFactor: data.riskFactors.regionalFactor,
          seasonalFactor: data.riskFactors.seasonalFactor,
          discountApplied: data.riskFactors.discountApplied,
          epidemiologicalFactors: JSON.stringify(data.riskFactors),
          actuarialModelId: data.actuarialModel?.id,
          modelVersion: data.actuarialModel?.version,
          approved: data.validation.approved,
          reason: data.validation.reasons.join('; ') || null
        }
      });
    } catch (error) {
      logger.error('Erro ao registrar log de precificação:', error);
      // Não falhar a operação principal por erro de log
    }
  }

  /**
   * Ativa cobertura por transação
   */
  async activateTransactionCoverage(params) {
    const { userId, coverageId, serviceId, serviceValue, duration = 30 } = params;

    // Calcular prêmio dinâmico
    const pricingResult = await this.calculateDynamicPremium({
      userId,
      coverageId,
      serviceValue,
      duration
    });

    if (!pricingResult.success) {
      throw new AppError(`Não foi possível ativar a cobertura: ${pricingResult.validation.reasons.join(', ')}`, 400);
    }

    // Criar cobertura ativa
    const userCoverage = await prisma.userCoverage.create({
      data: {
        userId,
        coverageId,
        serviceId,
        serviceValue,
        premium: pricingResult.premium,
        startDate: new Date(),
        endDate: new Date(Date.now() + duration * 24 * 60 * 60 * 1000),
        duration,
        riskScoreAtCreation: pricingResult.riskScore,
        epidemiologicalData: JSON.stringify(pricingResult.factors),
        pricingFactors: JSON.stringify(pricingResult.breakdown),
        isActive: true,
        status: 'ACTIVE'
      },
      include: {
        coverage: true
      }
    });

    return {
      coverage: userCoverage,
      pricing: pricingResult
    };
  }
}

module.exports = new DynamicPricingService();