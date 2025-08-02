'use strict';

const { PrismaClient } = require('@prisma/client');
const { AppError } = require('../../middleware/errorHandler');
const { logger } = require('../../config/logger');

const prisma = new PrismaClient();

class IntelligentMatchingService {

  /**
   * Encontra os melhores profissionais para um paciente
   * @param {Object} params - Parâmetros do matching
   * @param {string} params.userId - ID do usuário/paciente
   * @param {string} params.specialty - Especialidade desejada
   * @param {Array} params.symptoms - Sintomas do paciente
   * @param {string} params.urgencyLevel - Nível de urgência
   * @param {Object} params.preferences - Preferências do paciente
   * @returns {Array} Lista de profissionais rankeados
   */
  async findBestMatches(params) {
    const { userId, specialty, symptoms = [], urgencyLevel = 'MEDIUM', preferences = {} } = params;

    try {
      // 1. Obter dados do paciente
      const patientData = await this.getPatientData(userId);

      // 2. Buscar profissionais elegíveis
      const eligibleProfessionals = await this.getEligibleProfessionals({
        specialty,
        urgencyLevel,
        patientLocation: patientData.location,
        preferences
      });

      if (eligibleProfessionals.length === 0) {
        throw new AppError('Nenhum profissional encontrado para os critérios especificados', 404);
      }

      // 3. Calcular scores de matching para cada profissional
      const matchedProfessionals = await Promise.all(
        eligibleProfessionals.map(professional => 
          this.calculateMatchScore(professional, patientData, { symptoms, urgencyLevel, preferences })
        )
      );

      // 4. Ordenar por score de matching
      const rankedProfessionals = matchedProfessionals
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 10); // Top 10 matches

      // 5. Salvar resultados do matching
      await this.saveMatchingResults(userId, rankedProfessionals, params);

      // 6. Gerar explicações para os matches
      const explainedMatches = rankedProfessionals.map(match => ({
        ...match,
        explanation: this.generateMatchExplanation(match),
        confidence: this.calculateConfidence(match)
      }));

      return {
        matches: explainedMatches,
        totalFound: eligibleProfessionals.length,
        searchCriteria: {
          specialty,
          urgencyLevel,
          symptoms: symptoms.length,
          location: patientData.location?.city
        },
        recommendations: this.generateRecommendations(explainedMatches, params)
      };

    } catch (error) {
      logger.error('Erro no matching inteligente:', error);
      throw new AppError('Erro interno no sistema de matching', 500);
    }
  }

  /**
   * Obter dados do paciente para matching
   */
  async getPatientData(userId) {
    const [user, userProfile, medicalProfile] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          birthDate: true
        }
      }),
      
      prisma.userProfile.findUnique({
        where: { userId },
        select: {
          city: true,
          state: true,
          zipCode: true,
          language: true
        }
      }),
      
      prisma.medicalProfile.findUnique({
        where: { userId },
        select: {
          allergies: true,
          chronicConditions: true,
          currentMedications: true,
          preferredLanguage: true,
          communicationStyle: true
        }
      })
    ]);

    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    // Calcular idade
    const age = user.birthDate ? 
      Math.floor((new Date() - new Date(user.birthDate)) / (365.25 * 24 * 60 * 60 * 1000)) : null;

    return {
      id: userId,
      age,
      location: {
        city: userProfile?.city,
        state: userProfile?.state,
        zipCode: userProfile?.zipCode
      },
      language: medicalProfile?.preferredLanguage || userProfile?.language || 'pt-BR',
      communicationStyle: medicalProfile?.communicationStyle,
      medicalInfo: {
        allergies: medicalProfile?.allergies ? JSON.parse(medicalProfile.allergies) : [],
        chronicConditions: medicalProfile?.chronicConditions ? JSON.parse(medicalProfile.chronicConditions) : [],
        currentMedications: medicalProfile?.currentMedications ? JSON.parse(medicalProfile.currentMedications) : []
      }
    };
  }

  /**
   * Buscar profissionais elegíveis
   */
  async getEligibleProfessionals(criteria) {
    const { specialty, urgencyLevel, patientLocation, preferences } = criteria;

    // Construir filtros
    const where = {
      isActive: true,
      isVerified: true,
      ...(specialty && { specialization: { contains: specialty, mode: 'insensitive' } })
    };

    // Se urgente, priorizar profissionais próximos
    if (urgencyLevel === 'HIGH' || urgencyLevel === 'EMERGENCY') {
      if (patientLocation?.city) {
        where.city = { contains: patientLocation.city, mode: 'insensitive' };
      }
    }

    const professionals = await prisma.professional.findMany({
      where,
      include: {
        services: {
          where: { isActive: true }
        },
        reviews: {
          select: {
            rating: true,
            comment: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        bookings: {
          where: {
            createdAt: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } // Últimos 90 dias
          },
          select: {
            status: true,
            createdAt: true
          }
        }
      }
    });

    return professionals;
  }

  /**
   * Calcular score de matching para um profissional
   */
  async calculateMatchScore(professional, patientData, context) {
    const { symptoms, urgencyLevel, preferences } = context;

    // 1. Score de especialidade (peso: 30%)
    const specialtyScore = this.calculateSpecialtyMatch(professional, symptoms, context);

    // 2. Score de localização (peso: 25%)
    const locationScore = this.calculateLocationMatch(professional, patientData.location, urgencyLevel);

    // 3. Score de disponibilidade (peso: 20%)
    const availabilityScore = await this.calculateAvailabilityMatch(professional, urgencyLevel);

    // 4. Score de experiência (peso: 15%)
    const experienceScore = this.calculateExperienceMatch(professional, symptoms);

    // 5. Score de avaliações (peso: 10%)
    const reviewScore = this.calculateReviewScore(professional.reviews);

    // Calcular score final ponderado
    const matchScore = (
      specialtyScore * 0.30 +
      locationScore * 0.25 +
      availabilityScore * 0.20 +
      experienceScore * 0.15 +
      reviewScore * 0.10
    );

    return {
      professional: {
        id: professional.id,
        userId: professional.userId,
        type: professional.type,
        specialization: professional.specialization,
        experience: professional.experience,
        city: professional.city,
        state: professional.state,
        consultationFee: professional.consultationFee,
        averageRating: this.calculateAverageRating(professional.reviews),
        totalReviews: professional.reviews.length,
        services: professional.services
      },
      matchScore: Math.round(matchScore * 100) / 100,
      factors: {
        specialtyMatch: Math.round(specialtyScore * 100) / 100,
        locationMatch: Math.round(locationScore * 100) / 100,
        availabilityMatch: Math.round(availabilityScore * 100) / 100,
        experienceMatch: Math.round(experienceScore * 100) / 100,
        reviewMatch: Math.round(reviewScore * 100) / 100
      },
      matchReasons: this.generateMatchReasons({
        specialtyScore,
        locationScore,
        availabilityScore,
        experienceScore,
        reviewScore,
        professional,
        patientData,
        context
      })
    };
  }

  /**
   * Calcular compatibilidade de especialidade
   */
  calculateSpecialtyMatch(professional, symptoms, context) {
    let score = 0.5; // Score base

    // Correspondência exata de especialidade
    const specialization = professional.specialization.toLowerCase();
    
    // Mapeamento de sintomas para especialidades
    const symptomSpecialtyMap = {
      'dor de cabeça': ['neurologia', 'clínica geral'],
      'febre': ['clínica geral', 'infectologia'],
      'dor no peito': ['cardiologia', 'pneumologia', 'clínica geral'],
      'dor abdominal': ['gastroenterologia', 'clínica geral'],
      'dor nas costas': ['ortopedia', 'reumatologia', 'fisiatria'],
      'ansiedade': ['psiquiatria', 'psicologia'],
      'depressão': ['psiquiatria', 'psicologia'],
      'tosse': ['pneumologia', 'clínica geral'],
      'dor de garganta': ['otorrinolaringologia', 'clínica geral']
    };

    // Verificar se a especialização é relevante para os sintomas
    for (const symptom of symptoms) {
      const relevantSpecialties = symptomSpecialtyMap[symptom.toLowerCase()] || [];
      if (relevantSpecialties.some(spec => specialization.includes(spec))) {
        score += 0.3;
        break;
      }
    }

    // Bonus para clínica geral (versatilidade)
    if (specialization.includes('clínica geral') || specialization.includes('medicina geral')) {
      score += 0.2;
    }

    // Bonus para especialistas em casos específicos
    if (symptoms.length > 0 && !specialization.includes('clínica geral')) {
      score += 0.1; // Especialistas têm bonus para casos específicos
    }

    return Math.min(1.0, score);
  }

  /**
   * Calcular compatibilidade de localização
   */
  calculateLocationMatch(professional, patientLocation, urgencyLevel) {
    if (!patientLocation?.city || !professional.city) {
      return 0.5; // Score neutro se não há dados de localização
    }

    let score = 0;

    // Mesma cidade
    if (professional.city.toLowerCase() === patientLocation.city.toLowerCase()) {
      score = 1.0;
    }
    // Mesmo estado
    else if (professional.state === patientLocation.state) {
      score = 0.6;
    }
    // Estados diferentes
    else {
      score = 0.3;
    }

    // Ajustar baseado na urgência
    if (urgencyLevel === 'EMERGENCY' || urgencyLevel === 'HIGH') {
      // Para casos urgentes, localização é mais importante
      if (score < 0.8) {
        score *= 0.7; // Penalizar profissionais distantes
      }
    }

    return score;
  }

  /**
   * Calcular compatibilidade de disponibilidade
   */
  async calculateAvailabilityMatch(professional, urgencyLevel) {
    // Simular análise de disponibilidade
    // Em produção, integrar com sistema de agenda real
    
    const now = new Date();
    const recentBookings = professional.bookings.filter(booking => {
      const bookingDate = new Date(booking.createdAt);
      const daysDiff = (now - bookingDate) / (1000 * 60 * 60 * 24);
      return daysDiff <= 7; // Últimos 7 dias
    });

    // Calcular taxa de ocupação recente
    const maxBookingsPerWeek = 35; // Assumindo 5 consultas por dia
    const occupationRate = recentBookings.length / maxBookingsPerWeek;

    let availabilityScore = 1.0 - occupationRate;

    // Ajustar baseado na urgência
    if (urgencyLevel === 'EMERGENCY') {
      // Para emergências, priorizar profissionais menos ocupados
      availabilityScore = Math.max(0.1, availabilityScore);
    } else if (urgencyLevel === 'LOW') {
      // Para casos não urgentes, ocupação não é tão crítica
      availabilityScore = Math.max(0.5, availabilityScore);
    }

    return Math.max(0.1, Math.min(1.0, availabilityScore));
  }

  /**
   * Calcular compatibilidade de experiência
   */
  calculateExperienceMatch(professional, symptoms) {
    let score = 0;

    // Score baseado em anos de experiência
    const experience = professional.experience || 0;
    if (experience >= 10) score += 0.4;
    else if (experience >= 5) score += 0.3;
    else if (experience >= 2) score += 0.2;
    else score += 0.1;

    // Bonus para profissionais com muitos atendimentos
    const totalBookings = professional.bookings.length;
    if (totalBookings >= 100) score += 0.3;
    else if (totalBookings >= 50) score += 0.2;
    else if (totalBookings >= 20) score += 0.1;

    // Bonus para variedade de serviços
    const servicesCount = professional.services.length;
    if (servicesCount >= 5) score += 0.2;
    else if (servicesCount >= 3) score += 0.1;

    return Math.min(1.0, score);
  }

  /**
   * Calcular score baseado em avaliações
   */
  calculateReviewScore(reviews) {
    if (reviews.length === 0) {
      return 0.5; // Score neutro para profissionais sem avaliações
    }

    const averageRating = this.calculateAverageRating(reviews);
    const reviewCount = reviews.length;

    // Score baseado na média das avaliações
    let score = averageRating / 5.0;

    // Bonus por quantidade de avaliações (confiabilidade)
    if (reviewCount >= 50) score += 0.1;
    else if (reviewCount >= 20) score += 0.05;
    else if (reviewCount >= 10) score += 0.02;

    // Penalizar se tem poucas avaliações
    if (reviewCount < 5) {
      score *= 0.8;
    }

    return Math.min(1.0, score);
  }

  /**
   * Calcular média de avaliações
   */
  calculateAverageRating(reviews) {
    if (reviews.length === 0) return 0;
    
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / reviews.length;
  }

  /**
   * Gerar razões do matching
   */
  generateMatchReasons(data) {
    const { specialtyScore, locationScore, availabilityScore, experienceScore, reviewScore, professional } = data;
    const reasons = [];

    if (specialtyScore >= 0.8) {
      reasons.push(`Especialização em ${professional.specialization} é ideal para seus sintomas`);
    }

    if (locationScore >= 0.8) {
      reasons.push(`Localizado na sua cidade (${professional.city})`);
    }

    if (availabilityScore >= 0.7) {
      reasons.push('Alta disponibilidade para agendamento');
    }

    if (experienceScore >= 0.7) {
      reasons.push(`${professional.experience} anos de experiência na área`);
    }

    if (reviewScore >= 0.8) {
      const avgRating = this.calculateAverageRating(professional.reviews);
      reasons.push(`Excelente avaliação dos pacientes (${avgRating.toFixed(1)}/5.0)`);
    }

    if (professional.consultationFee && professional.consultationFee <= 200) {
      reasons.push('Preço acessível para consulta');
    }

    return reasons;
  }

  /**
   * Gerar explicação do matching
   */
  generateMatchExplanation(match) {
    const { matchScore, factors, professional } = match;
    
    let explanation = `Este profissional tem ${matchScore}% de compatibilidade com seu perfil. `;
    
    // Destacar o fator mais forte
    const topFactor = Object.entries(factors).reduce((a, b) => factors[a[0]] > factors[b[0]] ? a : b);
    
    switch (topFactor[0]) {
      case 'specialtyMatch':
        explanation += `A especialização em ${professional.specialization} é muito adequada para suas necessidades.`;
        break;
      case 'locationMatch':
        explanation += `A localização em ${professional.city} facilita o acesso.`;
        break;
      case 'availabilityMatch':
        explanation += 'Alta disponibilidade para agendamento rápido.';
        break;
      case 'experienceMatch':
        explanation += `${professional.experience} anos de experiência garantem atendimento qualificado.`;
        break;
      case 'reviewMatch':
        explanation += `Excelente reputação com ${professional.totalReviews} avaliações positivas.`;
        break;
    }

    return explanation;
  }

  /**
   * Calcular confiança do matching
   */
  calculateConfidence(match) {
    const { factors } = match;
    
    // Confiança baseada na consistência dos fatores
    const factorValues = Object.values(factors);
    const average = factorValues.reduce((a, b) => a + b, 0) / factorValues.length;
    const variance = factorValues.reduce((acc, val) => acc + Math.pow(val - average, 2), 0) / factorValues.length;
    const standardDeviation = Math.sqrt(variance);
    
    // Menor desvio padrão = maior confiança
    const confidence = Math.max(0.5, 1.0 - standardDeviation);
    
    return Math.round(confidence * 100) / 100;
  }

  /**
   * Salvar resultados do matching
   */
  async saveMatchingResults(userId, matches, originalParams) {
    try {
      const matchingPromises = matches.slice(0, 5).map(match => // Salvar top 5
        prisma.intelligentMatch.create({
          data: {
            userId,
            professionalId: match.professional.id,
            matchScore: match.matchScore,
            confidence: this.calculateConfidence(match),
            specialtyMatch: match.factors.specialtyMatch,
            locationMatch: match.factors.locationMatch,
            availabilityMatch: match.factors.availabilityMatch,
            experienceMatch: match.factors.experienceMatch,
            matchReasons: JSON.stringify(match.matchReasons),
            requestContext: JSON.stringify(originalParams),
            symptoms: JSON.stringify(originalParams.symptoms || []),
            urgencyLevel: originalParams.urgencyLevel
          }
        })
      );

      await Promise.all(matchingPromises);
    } catch (error) {
      logger.error('Erro ao salvar resultados do matching:', error);
      // Não falhar a operação principal por erro de log
    }
  }

  /**
   * Gerar recomendações baseadas nos matches
   */
  generateRecommendations(matches, params) {
    const recommendations = [];

    if (matches.length === 0) {
      recommendations.push({
        type: 'NO_MATCHES',
        message: 'Não encontramos profissionais ideais. Tente expandir os critérios de busca.',
        action: 'Buscar em outras cidades ou especialidades relacionadas'
      });
      return recommendations;
    }

    const topMatch = matches[0];
    
    if (topMatch.matchScore >= 85) {
      recommendations.push({
        type: 'EXCELLENT_MATCH',
        message: `${topMatch.professional.specialization} em ${topMatch.professional.city} é uma excelente opção.`,
        action: 'Recomendamos agendar com este profissional'
      });
    }

    if (params.urgencyLevel === 'HIGH' || params.urgencyLevel === 'EMERGENCY') {
      const urgentMatches = matches.filter(m => m.factors.availabilityMatch >= 0.7);
      if (urgentMatches.length > 0) {
        recommendations.push({
          type: 'URGENT_AVAILABLE',
          message: `${urgentMatches.length} profissional(is) com alta disponibilidade para casos urgentes.`,
          action: 'Contate imediatamente para agendamento prioritário'
        });
      }
    }

    const localMatches = matches.filter(m => m.factors.locationMatch >= 0.8);
    if (localMatches.length >= 3) {
      recommendations.push({
        type: 'LOCAL_OPTIONS',
        message: `${localMatches.length} profissionais na sua cidade.`,
        action: 'Considere a proximidade para facilitar o acesso'
      });
    }

    return recommendations;
  }

  /**
   * Buscar histórico de matches do usuário
   */
  async getUserMatchHistory(userId, limit = 10) {
    const matches = await prisma.intelligentMatch.findMany({
      where: { userId },
      include: {
        professional: {
          select: {
            specialization: true,
            city: true,
            state: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    return matches.map(match => ({
      id: match.id,
      matchScore: match.matchScore,
      confidence: match.confidence,
      professional: match.professional,
      status: match.status,
      createdAt: match.createdAt,
      symptoms: match.symptoms ? JSON.parse(match.symptoms) : [],
      urgencyLevel: match.urgencyLevel
    }));
  }

  /**
   * Atualizar feedback do usuário sobre um match
   */
  async updateMatchFeedback(matchId, userId, feedback) {
    const match = await prisma.intelligentMatch.findFirst({
      where: { id: matchId, userId }
    });

    if (!match) {
      throw new AppError('Match não encontrado', 404);
    }

    await prisma.intelligentMatch.update({
      where: { id: matchId },
      data: {
        status: feedback.status || match.status,
        userFeedback: feedback.comment,
        updatedAt: new Date()
      }
    });

    return { success: true, message: 'Feedback registrado com sucesso' };
  }
}

module.exports = new IntelligentMatchingService();

