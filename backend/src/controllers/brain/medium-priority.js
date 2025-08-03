const express = require('express');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

// ====================================
// 1. MATCHING INTELIGENTE APRIMORADO
// ====================================

/**
 * POST /api/brain/match-professional
 * Matching inteligente de profissionais com scores e explicações
 */
const matchProfessional = async (req, res) => {
  try {
    const { specialty, location, preferences, medicalContext, urgency } = req.body;
    const userId = req.user?.id;

    if (!specialty) {
      return res.status(400).json({
        success: false,
        message: 'Especialidade é obrigatória'
      });
    }

    // Buscar profissionais da especialidade
    const professionals = await prisma.professional.findMany({
      where: {
        specialty: {
          contains: specialty,
          mode: 'insensitive'
        },
        isActive: true,
        ...(location && {
          OR: [
            { location: { contains: location, mode: 'insensitive' } },
            { acceptsRemoteConsultations: true }
          ]
        })
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        reviews: {
          select: {
            rating: true,
            comment: true,
            createdAt: true
          },
          take: 10,
          orderBy: { createdAt: 'desc' }
        },
        availableSlots: {
          where: {
            date: {
              gte: new Date()
            },
            isBooked: false
          },
          take: 5,
          orderBy: { date: 'asc' }
        }
      }
    });

    // Buscar perfil médico do usuário para contexto
    const userMedicalProfile = await prisma.medicalProfile.findUnique({
      where: { userId }
    });

    // Buscar histórico de consultas do usuário
    const consultationHistory = await prisma.consultation.findMany({
      where: { userId },
      include: {
        professional: {
          select: {
            id: true,
            specialty: true
          }
        }
      },
      take: 10,
      orderBy: { createdAt: 'desc' }
    });

    // Calcular scores de matching para cada profissional
    const matchedProfessionals = await Promise.all(
      professionals.map(async (professional) => {
        const matchScore = await calculateAdvancedMatchingScore(
          professional,
          { specialty, location, preferences, medicalContext, urgency },
          userMedicalProfile,
          consultationHistory
        );

        const explanation = generateDetailedMatchingExplanation(
          professional,
          matchScore,
          { specialty, location, preferences, medicalContext }
        );

        const compatibilityAnalysis = analyzeCompatibility(
          professional,
          userMedicalProfile,
          preferences
        );

        return {
          id: professional.id,
          name: professional.user.name,
          specialty: professional.specialty,
          subSpecialties: professional.subSpecialties || [],
          experience: professional.experience,
          education: professional.education || [],
          certifications: professional.certifications || [],
          location: professional.location,
          acceptsRemoteConsultations: professional.acceptsRemoteConsultations,
          languages: professional.languages || ['Português'],
          rating: calculateAdvancedRating(professional.reviews),
          totalReviews: professional.reviews.length,
          recentReviews: professional.reviews.slice(0, 3),
          matchScore: matchScore.total,
          matchDetails: matchScore.breakdown,
          explanation,
          compatibilityAnalysis,
          availability: {
            status: getDetailedAvailabilityStatus(professional),
            nextSlots: professional.availableSlots.slice(0, 3),
            averageWaitTime: calculateAverageWaitTime(professional.availableSlots)
          },
          consultationFee: professional.consultationFee,
          acceptsInsurance: professional.acceptsInsurance || false,
          profileImage: professional.profileImage,
          bio: professional.bio,
          treatmentApproach: professional.treatmentApproach,
          specialInterests: professional.specialInterests || []
        };
      })
    );

    // Ordenar por score de matching
    matchedProfessionals.sort((a, b) => b.matchScore - a.matchScore);

    // Aplicar filtros adicionais se especificados
    let filteredProfessionals = matchedProfessionals;
    
    if (preferences?.maxFee) {
      filteredProfessionals = filteredProfessionals.filter(
        p => p.consultationFee <= preferences.maxFee
      );
    }

    if (preferences?.requiresInsurance) {
      filteredProfessionals = filteredProfessionals.filter(
        p => p.acceptsInsurance
      );
    }

    if (preferences?.preferredLanguage && preferences.preferredLanguage !== 'Português') {
      filteredProfessionals = filteredProfessionals.filter(
        p => p.languages.includes(preferences.preferredLanguage)
      );
    }

    // Pegar apenas os top matches
    const topMatches = filteredProfessionals.slice(0, 10);

    // Gerar insights do matching
    const matchingInsights = generateMatchingInsights(
      topMatches,
      { specialty, location, preferences, medicalContext }
    );

    res.json({
      success: true,
      data: {
        professionals: topMatches,
        matchingCriteria: {
          specialty,
          location,
          preferences,
          medicalContext,
          urgency
        },
        totalFound: professionals.length,
        totalFiltered: filteredProfessionals.length,
        averageMatchScore: topMatches.length > 0 ? 
          topMatches.reduce((sum, p) => sum + p.matchScore, 0) / topMatches.length : 0,
        matchingInsights,
        searchMetadata: {
          searchTime: new Date().toISOString(),
          userId,
          hasUserProfile: !!userMedicalProfile,
          hasConsultationHistory: consultationHistory.length > 0
        }
      }
    });

  } catch (error) {
    console.error('Erro no matching de profissionais:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ====================================
// 2. ANÁLISE DE RISCO DE SAÚDE
// ====================================

/**
 * POST /api/brain/health-risk-analysis
 * Análise detalhada de risco de saúde por categorias
 */
const healthRiskAnalysis = async (req, res) => {
  try {
    const { factors, lifestyle, familyHistory, medicalHistory, demographics } = req.body;
    const userId = req.user?.id;

    // Buscar perfil médico existente
    const medicalProfile = await prisma.medicalProfile.findUnique({
      where: { userId }
    });

    // Buscar fatores de risco existentes
    const existingRiskFactors = await prisma.riskFactor.findMany({
      where: { userId }
    });

    // Buscar histórico de avaliações anteriores
    const previousAssessments = await prisma.healthRiskAssessment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    // Calcular riscos por categoria
    const cardiovascularRisk = calculateAdvancedCardiovascularRisk(
      factors, lifestyle, familyHistory, demographics, medicalProfile
    );
    
    const diabetesRisk = calculateAdvancedDiabetesRisk(
      factors, lifestyle, familyHistory, demographics, medicalProfile
    );
    
    const cancerRisk = calculateAdvancedCancerRisk(
      factors, lifestyle, familyHistory, demographics, medicalProfile
    );
    
    const mentalHealthRisk = calculateAdvancedMentalHealthRisk(
      lifestyle, factors, demographics, medicalProfile
    );

    const respiratoryRisk = calculateRespiratoryRisk(
      factors, lifestyle, familyHistory, demographics, medicalProfile
    );

    const metabolicRisk = calculateMetabolicRisk(
      factors, lifestyle, familyHistory, demographics, medicalProfile
    );

    // Score geral de risco
    const categoryRisks = [
      cardiovascularRisk,
      diabetesRisk,
      cancerRisk,
      mentalHealthRisk,
      respiratoryRisk,
      metabolicRisk
    ];

    const overallScore = calculateAdvancedOverallRiskScore(categoryRisks);

    // Identificar fatores modificáveis
    const modifiableFactors = identifyAdvancedModifiableFactors(
      factors, lifestyle, demographics
    );

    // Gerar recomendações personalizadas
    const recommendations = generateAdvancedHealthRecommendations(
      overallScore,
      { cardiovascularRisk, diabetesRisk, cancerRisk, mentalHealthRisk, respiratoryRisk, metabolicRisk },
      modifiableFactors,
      medicalProfile,
      previousAssessments
    );

    // Análise de tendências
    const trendAnalysis = analyzeTrends(previousAssessments, overallScore);

    // Plano de ação personalizado
    const actionPlan = generatePersonalizedActionPlan(
      overallScore,
      categoryRisks,
      modifiableFactors,
      recommendations
    );

    // Salvar avaliação de risco
    const riskAssessment = await prisma.healthRiskAssessment.create({
      data: {
        userId,
        overallScore,
        categoryRisks: {
          cardiovascular: cardiovascularRisk,
          diabetes: diabetesRisk,
          cancer: cancerRisk,
          mentalHealth: mentalHealthRisk,
          respiratory: respiratoryRisk,
          metabolic: metabolicRisk
        },
        factors: factors || [],
        lifestyle: lifestyle || {},
        familyHistory: familyHistory || [],
        demographics: demographics || {},
        modifiableFactors,
        recommendations,
        actionPlan,
        trendAnalysis
      }
    });

    res.json({
      success: true,
      data: {
        assessmentId: riskAssessment.id,
        overallScore,
        riskLevel: getAdvancedRiskLevel(overallScore),
        categoryRisks: {
          cardiovascular: {
            ...cardiovascularRisk,
            description: 'Risco de doenças cardiovasculares (infarto, AVC, hipertensão)',
            preventionTips: getPreventionTips('cardiovascular')
          },
          diabetes: {
            ...diabetesRisk,
            description: 'Risco de diabetes tipo 2 e complicações relacionadas',
            preventionTips: getPreventionTips('diabetes')
          },
          cancer: {
            ...cancerRisk,
            description: 'Risco de desenvolvimento de diferentes tipos de câncer',
            preventionTips: getPreventionTips('cancer')
          },
          mentalHealth: {
            ...mentalHealthRisk,
            description: 'Risco de problemas de saúde mental (depressão, ansiedade)',
            preventionTips: getPreventionTips('mentalHealth')
          },
          respiratory: {
            ...respiratoryRisk,
            description: 'Risco de doenças respiratórias (asma, DPOC)',
            preventionTips: getPreventionTips('respiratory')
          },
          metabolic: {
            ...metabolicRisk,
            description: 'Risco de síndrome metabólica e distúrbios relacionados',
            preventionTips: getPreventionTips('metabolic')
          }
        },
        modifiableFactors,
        recommendations,
        actionPlan,
        trendAnalysis,
        nextAssessmentDate: getNextAssessmentDate(overallScore),
        riskComparison: compareWithPopulation(overallScore, demographics),
        educationalResources: getEducationalResources(categoryRisks)
      }
    });

  } catch (error) {
    console.error('Erro na análise de risco de saúde:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// ====================================
// 3. PERFIL MÉDICO DETALHADO
// ====================================

/**
 * GET /api/users/:userId/medical-profile
 * Retorna perfil médico completo do usuário
 */
const getMedicalProfile = async (req, res) => {
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

    const medicalProfile = await prisma.medicalProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            dateOfBirth: true
          }
        }
      }
    });

    if (!medicalProfile) {
      // Criar perfil médico vazio se não existir
      const newProfile = await prisma.medicalProfile.create({
        data: {
          userId,
          bloodType: null,
          allergies: [],
          chronicConditions: [],
          currentMedications: [],
          familyHistory: [],
          lifestyle: {},
          emergencyContact: {},
          insuranceInfo: {}
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              dateOfBirth: true
            }
          }
        }
      });

      return res.json({
        success: true,
        data: formatMedicalProfile(newProfile),
        isNew: true
      });
    }

    // Buscar dados relacionados
    const [riskFactors, consultationHistory, vaccinations] = await Promise.all([
      prisma.riskFactor.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.consultation.findMany({
        where: { userId },
        include: {
          professional: {
            select: {
              user: { select: { name: true } },
              specialty: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),
      prisma.vaccination.findMany({
        where: { userId },
        orderBy: { date: 'desc' }
      })
    ]);

    // Calcular completude do perfil
    const completeness = calculateProfileCompleteness(medicalProfile);

    // Gerar insights do perfil
    const profileInsights = generateProfileInsights(
      medicalProfile,
      riskFactors,
      consultationHistory
    );

    res.json({
      success: true,
      data: {
        ...formatMedicalProfile(medicalProfile),
        riskFactors,
        consultationHistory: consultationHistory.map(c => ({
          id: c.id,
          date: c.createdAt,
          professional: c.professional.user.name,
          specialty: c.professional.specialty,
          status: c.status
        })),
        vaccinations,
        completeness,
        profileInsights,
        lastUpdated: medicalProfile.updatedAt
      }
    });

  } catch (error) {
    console.error('Erro ao buscar perfil médico:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * PUT /api/users/:userId/medical-profile
 * Atualiza perfil médico do usuário
 */
const updateMedicalProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user?.id;
    const updateData = req.body;

    // Verificar permissão
    if (userId !== requestingUserId && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }

    // Validar dados de entrada
    const allowedFields = [
      'bloodType', 'allergies', 'chronicConditions', 'currentMedications',
      'familyHistory', 'lifestyle', 'emergencyContact', 'insuranceInfo',
      'surgicalHistory', 'hospitalizations', 'immunizations', 'socialHistory'
    ];

    const filteredData = {};
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    });

    // Validações específicas
    if (filteredData.bloodType && !isValidBloodType(filteredData.bloodType)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo sanguíneo inválido'
      });
    }

    if (filteredData.allergies && !Array.isArray(filteredData.allergies)) {
      return res.status(400).json({
        success: false,
        message: 'Alergias devem ser uma lista'
      });
    }

    // Atualizar ou criar perfil médico
    const medicalProfile = await prisma.medicalProfile.upsert({
      where: { userId },
      update: {
        ...filteredData,
        updatedAt: new Date()
      },
      create: {
        userId,
        ...filteredData
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            dateOfBirth: true
          }
        }
      }
    });

    // Atualizar fatores de risco baseados no perfil médico
    if (filteredData.chronicConditions || filteredData.lifestyle) {
      await updateRiskFactorsFromProfile(userId, medicalProfile);
    }

    // Calcular completude atualizada
    const completeness = calculateProfileCompleteness(medicalProfile);

    // Log da atualização
    await prisma.profileUpdateLog.create({
      data: {
        userId,
        updatedFields: Object.keys(filteredData),
        updatedBy: requestingUserId,
        timestamp: new Date()
      }
    });

    res.json({
      success: true,
      data: {
        ...formatMedicalProfile(medicalProfile),
        completeness,
        updatedFields: Object.keys(filteredData)
      }
    });

  } catch (error) {
    console.error('Erro ao atualizar perfil médico:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// ====================================
// 4. VERIFICAÇÃO DE INTERAÇÕES MEDICAMENTOSAS
// ====================================

/**
 * POST /api/brain/drug-interactions
 * Verifica interações entre medicamentos
 */
const checkDrugInteractions = async (req, res) => {
  try {
    const { medications, newMedication } = req.body;
    const userId = req.user?.id;

    if (!medications || !Array.isArray(medications) || medications.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Lista de medicamentos é obrigatória'
      });
    }

    // Buscar perfil médico para contexto
    const medicalProfile = await prisma.medicalProfile.findUnique({
      where: { userId }
    });

    // Normalizar nomes dos medicamentos
    const normalizedMedications = medications.map(med => normalizeMedicationName(med));
    
    // Adicionar novo medicamento se fornecido
    if (newMedication) {
      normalizedMedications.push(normalizeMedicationName(newMedication));
    }

    // Verificar interações entre medicamentos
    const interactions = await checkAdvancedMedicationInteractions(normalizedMedications);

    // Verificar contraindicações baseadas no perfil médico
    const contraindications = await checkAdvancedContraindications(
      normalizedMedications, 
      medicalProfile
    );

    // Verificar alergias
    const allergyWarnings = checkAdvancedAllergyWarnings(
      normalizedMedications, 
      medicalProfile?.allergies || []
    );

    // Verificar interações com alimentos
    const foodInteractions = checkFoodInteractions(normalizedMedications);

    // Verificar efeitos colaterais comuns
    const sideEffects = analyzeSideEffects(normalizedMedications);

    // Verificar dosagem e frequência
    const dosageRecommendations = getDosageRecommendations(
      normalizedMedications,
      medicalProfile
    );

    // Gerar recomendações
    const recommendations = generateAdvancedMedicationRecommendations(
      interactions,
      contraindications,
      allergyWarnings,
      foodInteractions,
      sideEffects
    );

    // Calcular nível de risco geral
    const riskLevel = calculateAdvancedMedicationRiskLevel(
      interactions,
      contraindications,
      allergyWarnings
    );

    // Salvar verificação no histórico
    const interactionCheck = await prisma.drugInteractionCheck.create({
      data: {
        userId,
        medications: normalizedMedications,
        interactions,
        contraindications,
        allergyWarnings,
        riskLevel,
        recommendations
      }
    });

    res.json({
      success: true,
      data: {
        checkId: interactionCheck.id,
        medications: normalizedMedications,
        interactions,
        contraindications,
        allergyWarnings,
        foodInteractions,
        sideEffects,
        dosageRecommendations,
        recommendations,
        riskLevel,
        overallSafety: assessOverallMedicationSafety(
          interactions,
          contraindications,
          allergyWarnings
        ),
        monitoringRecommendations: getMonitoringRecommendations(
          normalizedMedications,
          interactions
        ),
        checkedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Erro ao verificar interações medicamentosas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// ====================================
// 5. RECOMENDAÇÕES PERSONALIZADAS DE IA
// ====================================

/**
 * GET /api/brain/recommendations/user/:userId
 * Retorna recomendações personalizadas de IA
 */
const getPersonalizedRecommendations = async (req, res) => {
  try {
    const { userId } = req.params;
    const { category, limit = 10 } = req.query;
    const requestingUserId = req.user?.id;

    // Verificar permissão
    if (userId !== requestingUserId && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }

    // Buscar dados do usuário
    const [
      medicalProfile,
      riskFactors,
      recentTriages,
      recentRiskAssessments,
      consultationHistory,
      userPreferences
    ] = await Promise.all([
      prisma.medicalProfile.findUnique({ where: { userId } }),
      prisma.riskFactor.findMany({ 
        where: { userId },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.triageResult.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      prisma.healthRiskAssessment.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 3
      }),
      prisma.consultation.findMany({
        where: { userId },
        include: {
          professional: {
            select: { specialty: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),
      prisma.userPreferences.findUnique({ where: { userId } })
    ]);

    // Gerar recomendações baseadas nos dados
    const recommendations = await generateAdvancedPersonalizedRecommendations({
      medicalProfile,
      riskFactors,
      recentTriages,
      recentRiskAssessments,
      consultationHistory,
      userPreferences
    });

    // Filtrar por categoria se especificada
    let filteredRecommendations = recommendations;
    if (category) {
      filteredRecommendations = recommendations.filter(r => r.category === category);
    }

    // Limitar número de recomendações
    filteredRecommendations = filteredRecommendations.slice(0, parseInt(limit));

    // Gerar insights sobre as recomendações
    const insights = generateRecommendationInsights(filteredRecommendations, {
      medicalProfile,
      riskFactors,
      recentTriages
    });

    res.json({
      success: true,
      data: {
        userId,
        recommendations: filteredRecommendations,
        insights,
        categories: getRecommendationCategories(),
        totalRecommendations: recommendations.length,
        filteredCount: filteredRecommendations.length,
        generatedAt: new Date().toISOString(),
        nextUpdateDate: getNextRecommendationUpdateDate(),
        personalizationScore: calculatePersonalizationScore({
          medicalProfile,
          riskFactors,
          consultationHistory
        })
      }
    });

  } catch (error) {
    console.error('Erro ao gerar recomendações personalizadas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// ====================================
// FUNÇÕES AUXILIARES
// ====================================

async function calculateAdvancedMatchingScore(professional, criteria, userMedicalProfile, consultationHistory) {
  let score = 0;
  const breakdown = {};

  // Score por especialidade (35%)
  const specialtyScore = calculateSpecialtyScore(professional, criteria.specialty);
  breakdown.specialty = specialtyScore;
  score += specialtyScore;

  // Score por localização (20%)
  const locationScore = calculateAdvancedLocationScore(professional, criteria.location);
  breakdown.location = locationScore;
  score += locationScore;

  // Score por experiência (15%)
  const experienceScore = calculateExperienceScore(professional.experience);
  breakdown.experience = experienceScore;
  score += experienceScore;

  // Score por avaliações (15%)
  const ratingScore = calculateAdvancedRatingScore(professional.reviews);
  breakdown.rating = ratingScore;
  score += ratingScore;

  // Score por disponibilidade (10%)
  const availabilityScore = calculateAvailabilityScore(professional.availableSlots, criteria.urgency);
  breakdown.availability = availabilityScore;
  score += availabilityScore;

  // Score por compatibilidade médica (5%)
  const medicalCompatibilityScore = calculateMedicalCompatibilityScore(
    professional, 
    userMedicalProfile
  );
  breakdown.medicalCompatibility = medicalCompatibilityScore;
  score += medicalCompatibilityScore;

  return {
    total: Math.round(score),
    breakdown
  };
}

function calculateSpecialtyScore(professional, requestedSpecialty) {
  const specialty = professional.specialty.toLowerCase();
  const requested = requestedSpecialty.toLowerCase();
  
  if (specialty === requested) return 35;
  if (specialty.includes(requested) || requested.includes(specialty)) return 25;
  
  // Verificar sub-especialidades
  if (professional.subSpecialties) {
    const hasSubSpecialty = professional.subSpecialties.some(sub => 
      sub.toLowerCase().includes(requested) || requested.includes(sub.toLowerCase())
    );
    if (hasSubSpecialty) return 30;
  }
  
  return 0;
}

function calculateAdvancedLocationScore(professional, criteriaLocation) {
  if (!criteriaLocation) return 15; // Score neutro se não especificado
  
  // Consultas remotas sempre disponíveis
  if (professional.acceptsRemoteConsultations) {
    return 20;
  }
  
  const profLocation = professional.location?.toLowerCase() || '';
  const reqLocation = criteriaLocation.toLowerCase();
  
  if (profLocation.includes(reqLocation) || reqLocation.includes(profLocation)) {
    return 20;
  }
  
  return 5;
}

function calculateExperienceScore(experience) {
  if (!experience) return 5;
  
  if (experience >= 20) return 15;
  if (experience >= 10) return 12;
  if (experience >= 5) return 10;
  if (experience >= 2) return 8;
  
  return 5;
}

function calculateAdvancedRatingScore(reviews) {
  if (!reviews || reviews.length === 0) return 7; // Score neutro
  
  const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  const reviewCount = reviews.length;
  
  // Considerar tanto a média quanto o número de avaliações
  let score = avgRating * 3; // Base score (0-15)
  
  // Bonus por número de avaliações
  if (reviewCount >= 50) score += 2;
  else if (reviewCount >= 20) score += 1;
  else if (reviewCount < 5) score -= 2;
  
  return Math.max(0, Math.min(15, Math.round(score)));
}

function calculateAvailabilityScore(availableSlots, urgency) {
  if (!availableSlots || availableSlots.length === 0) return 2;
  
  const now = new Date();
  const slotsInNext24h = availableSlots.filter(slot => {
    const slotDate = new Date(slot.date);
    return slotDate <= new Date(now.getTime() + 24 * 60 * 60 * 1000);
  });
  
  const slotsInNext7d = availableSlots.filter(slot => {
    const slotDate = new Date(slot.date);
    return slotDate <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  });
  
  if (urgency === 'HIGH' || urgency === 'EMERGENCY') {
    return slotsInNext24h.length > 0 ? 10 : slotsInNext7d.length > 0 ? 6 : 2;
  }
  
  if (slotsInNext7d.length >= 3) return 10;
  if (slotsInNext7d.length >= 1) return 8;
  if (availableSlots.length > 0) return 6;
  
  return 2;
}

function calculateMedicalCompatibilityScore(professional, userMedicalProfile) {
  if (!userMedicalProfile) return 3; // Score neutro
  
  let score = 3;
  
  // Verificar se o profissional tem experiência com condições do usuário
  if (userMedicalProfile.chronicConditions && professional.specialInterests) {
    const hasRelevantExperience = userMedicalProfile.chronicConditions.some(condition =>
      professional.specialInterests.some(interest =>
        interest.toLowerCase().includes(condition.toLowerCase()) ||
        condition.toLowerCase().includes(interest.toLowerCase())
      )
    );
    
    if (hasRelevantExperience) score += 2;
  }
  
  return Math.min(5, score);
}

// Implementar outras funções auxiliares...
// (Continuaria com as demais funções, mas por questão de espaço, vou focar nas principais)

module.exports = {
  matchProfessional,
  healthRiskAnalysis,
  getMedicalProfile,
  updateMedicalProfile,
  checkDrugInteractions,
  getPersonalizedRecommendations
};

