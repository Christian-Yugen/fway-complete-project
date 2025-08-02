'use strict';

const { PrismaClient } = require('@prisma/client');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const intelligentMatchingService = require('../services/brain/intelligentMatchingService');
const advancedTriageService = require('../services/brain/advancedTriageService');
const { createNotification } = require('../services/notification/notificationService');
const { logger } = require('../config/logger');

const prisma = new PrismaClient();

class BrainController {

  /**
   * Chat inteligente com IA médica
   * @route POST /api/brain/chat
   */
  intelligentChat = asyncHandler(async (req, res) => {
    const { message, context, sessionId, language = 'pt-BR' } = req.body;
    const userId = req.user.id;

    if (!message || message.trim().length === 0) {
      throw new AppError('Mensagem é obrigatória', 400);
    }

    const startTime = Date.now();

    // Obter contexto médico do usuário
    const medicalContext = await this.getUserMedicalContext(userId);

    // Processar mensagem com IA avançada
    const aiResponse = await this.processIntelligentMessage({
      message,
      context: { ...context, medical: medicalContext },
      sessionId: sessionId || userId,
      language,
      userId
    });

    // Salvar interação
    await prisma.aIInteraction.create({
      data: {
        userId,
        type: 'INTELLIGENT_CHAT',
        input: message,
        output: aiResponse.content,
        confidence: aiResponse.confidence,
        processingTime: Date.now() - startTime,
        sessionId: sessionId || userId,
        context: JSON.stringify(context),
        metadata: JSON.stringify({
          intent: aiResponse.intent,
          entities: aiResponse.entities,
          language,
          medicalRelevance: aiResponse.medicalRelevance
        })
      }
    });

    res.json({
      success: true,
      data: {
        response: aiResponse.content,
        confidence: aiResponse.confidence,
        intent: aiResponse.intent,
        entities: aiResponse.entities,
        suggestions: aiResponse.suggestions,
        medicalRelevance: aiResponse.medicalRelevance,
        followUpQuestions: aiResponse.followUpQuestions,
        sessionId: sessionId || userId,
        processingTime: Date.now() - startTime
      }
    });
  });

  /**
   * Triagem inteligente avançada
   * @route POST /api/brain/advanced-triage
   */
  advancedTriage = asyncHandler(async (req, res) => {
    const { symptoms, duration, severity, additionalInfo = {} } = req.body;
    const userId = req.user.id;

    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      throw new AppError('Lista de sintomas é obrigatória', 400);
    }

    // Obter dados do usuário
    const userData = await this.getUserDataForTriage(userId);

    // Realizar triagem avançada
    const triageResult = await advancedTriageService.performAdvancedTriage({
      symptoms,
      duration,
      severity,
      age: userData.age,
      gender: userData.gender,
      medicalHistory: userData.medicalHistory,
      userId,
      startTime: Date.now()
    });

    // Criar notificação se urgente
    if (triageResult.urgencyLevel === 'EMERGENCY' || triageResult.urgencyLevel === 'HIGH') {
      await createNotification({
        userId,
        type: 'URGENT_TRIAGE',
        title: triageResult.urgencyLevel === 'EMERGENCY' ? 'EMERGÊNCIA MÉDICA' : 'Triagem Urgente',
        message: `Sua triagem indica ${triageResult.urgencyLevel === 'EMERGENCY' ? 'emergência médica' : 'alta prioridade'}. ${triageResult.recommendations[0]?.action || 'Procure atendimento médico imediatamente.'}`,
        data: { triageId: triageResult.triageId },
        priority: 'HIGH'
      });
    }

    // Log da triagem
    logger.info('Triagem avançada realizada', {
      userId,
      triageId: triageResult.triageId,
      urgencyLevel: triageResult.urgencyLevel,
      confidence: triageResult.confidence,
      symptomsCount: symptoms.length
    });

    res.json({
      success: true,
      data: triageResult
    });
  });

  /**
   * Matching inteligente de profissionais
   * @route POST /api/brain/intelligent-matching
   */
  intelligentMatching = asyncHandler(async (req, res) => {
    const { specialty, symptoms = [], urgencyLevel = 'MEDIUM', preferences = {} } = req.body;
    const userId = req.user.id;

    if (!specialty) {
      throw new AppError('Especialidade é obrigatória', 400);
    }

    // Realizar matching inteligente
    const matchingResult = await intelligentMatchingService.findBestMatches({
      userId,
      specialty,
      symptoms,
      urgencyLevel,
      preferences
    });

    // Log do matching
    logger.info('Matching inteligente realizado', {
      userId,
      specialty,
      matchesFound: matchingResult.matches.length,
      topScore: matchingResult.matches[0]?.matchScore || 0
    });

    res.json({
      success: true,
      data: matchingResult
    });
  });

  /**
   * Análise de risco de saúde personalizada
   * @route POST /api/brain/health-risk-analysis
   */
  healthRiskAnalysis = asyncHandler(async (req, res) => {
    const { factors = [], lifestyle = {}, familyHistory = [] } = req.body;
    const userId = req.user.id;

    // Obter perfil médico completo
    const medicalProfile = await this.getCompleteMedicalProfile(userId);

    // Realizar análise de risco
    const riskAnalysis = await this.performHealthRiskAnalysis({
      userId,
      factors,
      lifestyle,
      familyHistory,
      medicalProfile
    });

    // Salvar avaliação de risco
    const riskRecord = await prisma.riskAssessment.create({
      data: {
        userId,
        factors: JSON.stringify(factors),
        riskScore: riskAnalysis.overallScore,
        riskLevel: riskAnalysis.level,
        recommendations: JSON.stringify(riskAnalysis.recommendations),
        analysis: JSON.stringify(riskAnalysis.detailedAnalysis),
        confidence: riskAnalysis.confidence,
        cardiovascularRisk: riskAnalysis.categoryRisks.cardiovascular,
        diabetesRisk: riskAnalysis.categoryRisks.diabetes,
        cancerRisk: riskAnalysis.categoryRisks.cancer,
        mentalHealthRisk: riskAnalysis.categoryRisks.mentalHealth,
        modifiableFactors: JSON.stringify(riskAnalysis.modifiableFactors),
        nextAssessmentDate: riskAnalysis.nextAssessmentDate
      }
    });

    res.json({
      success: true,
      data: {
        assessmentId: riskRecord.id,
        ...riskAnalysis
      }
    });
  });

  /**
   * Recomendações personalizadas de IA
   * @route POST /api/brain/personalized-recommendations
   */
  personalizedRecommendations = asyncHandler(async (req, res) => {
    const { type, context = {}, preferences = {} } = req.body;
    const userId = req.user.id;

    // Tipos válidos de recomendação
    const validTypes = ['PROFESSIONAL', 'EXAM', 'LIFESTYLE', 'MEDICATION', 'PREVENTION', 'WELLNESS'];
    if (!validTypes.includes(type)) {
      throw new AppError('Tipo de recomendação inválido', 400);
    }

    // Obter dados do usuário para personalização
    const userData = await this.getUserDataForRecommendations(userId);

    // Gerar recomendações personalizadas
    const recommendations = await this.generatePersonalizedRecommendations({
      type,
      context,
      preferences,
      userData,
      userId
    });

    // Salvar recomendações
    const savedRecommendations = await Promise.all(
      recommendations.items.slice(0, 5).map(rec => // Salvar top 5
        prisma.aIRecommendation.create({
          data: {
            userId,
            type,
            category: rec.category,
            title: rec.title,
            description: rec.description,
            recommendations: JSON.stringify([rec]),
            reasoning: JSON.stringify(rec.reasoning),
            priority: rec.priority,
            confidence: rec.confidence,
            basedOnSymptoms: rec.basedOn?.symptoms ? JSON.stringify(rec.basedOn.symptoms) : null,
            basedOnHistory: rec.basedOn?.history ? JSON.stringify(rec.basedOn.history) : null,
            basedOnRisk: rec.basedOn?.risk ? JSON.stringify(rec.basedOn.risk) : null,
            validUntil: rec.validUntil
          }
        })
      )
    );

    res.json({
      success: true,
      data: {
        recommendations: recommendations.items,
        confidence: recommendations.confidence,
        reasoning: recommendations.reasoning,
        savedIds: savedRecommendations.map(r => r.id)
      }
    });
  });

  /**
   * Análise de sintomas com IA
   * @route POST /api/brain/symptom-analysis
   */
  symptomAnalysis = asyncHandler(async (req, res) => {
    const { symptoms, patientInfo = {}, duration, context = {} } = req.body;
    const userId = req.user.id;

    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      throw new AppError('Lista de sintomas é obrigatória', 400);
    }

    // Realizar análise avançada de sintomas
    const analysis = await this.performAdvancedSymptomAnalysis({
      symptoms,
      patientInfo,
      duration,
      context,
      userId
    });

    // Salvar análise
    const analysisRecord = await prisma.symptomAnalysis.create({
      data: {
        userId,
        symptoms: JSON.stringify(symptoms),
        symptomDuration: duration,
        analysis: JSON.stringify(analysis.detailedAnalysis),
        possibleConditions: JSON.stringify(analysis.possibleConditions),
        confidence: analysis.confidence,
        urgencyLevel: analysis.urgencyLevel,
        recommendations: JSON.stringify(analysis.recommendations),
        nextSteps: JSON.stringify(analysis.nextSteps),
        riskFactors: JSON.stringify(analysis.riskFactors),
        recommendedSpecialties: JSON.stringify(analysis.recommendedSpecialties)
      }
    });

    res.json({
      success: true,
      data: {
        analysisId: analysisRecord.id,
        ...analysis
      }
    });
  });

  /**
   * Verificação inteligente de interações medicamentosas
   * @route POST /api/brain/drug-interaction-check
   */
  drugInteractionCheck = asyncHandler(async (req, res) => {
    const { currentMedications = [], newMedication, patientProfile = {} } = req.body;
    const userId = req.user.id;

    if (!newMedication) {
      throw new AppError('Novo medicamento é obrigatório', 400);
    }

    // Obter medicações atuais do perfil se não fornecidas
    if (currentMedications.length === 0) {
      const medicalProfile = await prisma.medicalProfile.findUnique({
        where: { userId },
        select: { currentMedications: true }
      });

      if (medicalProfile?.currentMedications) {
        currentMedications.push(...JSON.parse(medicalProfile.currentMedications));
      }
    }

    // Verificar interações
    const interactionResult = await this.checkDrugInteractions({
      currentMedications,
      newMedication,
      patientProfile,
      userId
    });

    // Salvar verificação
    await prisma.aIInteraction.create({
      data: {
        userId,
        type: 'DRUG_INTERACTION_CHECK',
        input: JSON.stringify({ currentMedications, newMedication }),
        output: JSON.stringify(interactionResult),
        confidence: interactionResult.confidence,
        processingTime: interactionResult.processingTime
      }
    });

    res.json({
      success: true,
      data: interactionResult
    });
  });

  /**
   * Dashboard de insights de IA
   * @route GET /api/brain/ai-insights
   */
  getAIInsights = asyncHandler(async (req, res) => {
    const { period = '30d' } = req.query;
    const userId = req.user.id;

    // Obter insights personalizados
    const insights = await this.generateAIInsights(userId, period);

    res.json({
      success: true,
      data: { insights }
    });
  });

  /**
   * Histórico de interações com IA
   * @route GET /api/brain/interaction-history
   */
  getInteractionHistory = asyncHandler(async (req, res) => {
    const { type, page = 1, limit = 20, startDate, endDate } = req.query;
    const userId = req.user.id;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      userId,
      ...(type && { type }),
      ...(startDate && endDate && {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      })
    };

    const [interactions, total] = await Promise.all([
      prisma.aIInteraction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
        select: {
          id: true,
          type: true,
          confidence: true,
          processingTime: true,
          createdAt: true,
          metadata: true
        }
      }),

      prisma.aIInteraction.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        interactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  });

  /**
   * Feedback sobre recomendação de IA
   * @route POST /api/brain/recommendation-feedback
   */
  recommendationFeedback = asyncHandler(async (req, res) => {
    const { recommendationId, rating, feedback, status } = req.body;
    const userId = req.user.id;

    if (!recommendationId) {
      throw new AppError('ID da recomendação é obrigatório', 400);
    }

    // Verificar se a recomendação pertence ao usuário
    const recommendation = await prisma.aIRecommendation.findFirst({
      where: { id: recommendationId, userId }
    });

    if (!recommendation) {
      throw new AppError('Recomendação não encontrada', 404);
    }

    // Atualizar feedback
    await prisma.aIRecommendation.update({
      where: { id: recommendationId },
      data: {
        status: status || recommendation.status,
        userRating: rating,
        userFeedback: feedback,
        updatedAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Feedback registrado com sucesso'
    });
  });

  // ===== MÉTODOS AUXILIARES =====

  async getUserMedicalContext(userId) {
    const [medicalProfile, recentTriages, recentSymptoms] = await Promise.all([
      prisma.medicalProfile.findUnique({
        where: { userId },
        select: {
          allergies: true,
          chronicConditions: true,
          currentMedications: true,
          familyHistory: true
        }
      }),

      prisma.triageResult.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: {
          urgencyLevel: true,
          possibleConditions: true,
          createdAt: true
        }
      }),

      prisma.symptomAnalysis.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: {
          symptoms: true,
          possibleConditions: true,
          createdAt: true
        }
      })
    ]);

    return {
      medicalProfile: medicalProfile ? {
        allergies: medicalProfile.allergies ? JSON.parse(medicalProfile.allergies) : [],
        chronicConditions: medicalProfile.chronicConditions ? JSON.parse(medicalProfile.chronicConditions) : [],
        currentMedications: medicalProfile.currentMedications ? JSON.parse(medicalProfile.currentMedications) : [],
        familyHistory: medicalProfile.familyHistory ? JSON.parse(medicalProfile.familyHistory) : []
      } : null,
      recentTriages,
      recentSymptoms
    };
  }

  async processIntelligentMessage(params) {
    const { message, context, sessionId, language, userId } = params;

    // Análise de intenção avançada
    const intent = this.analyzeAdvancedIntent(message, context);

    // Extração de entidades médicas
    const entities = this.extractMedicalEntities(message);

    // Determinar relevância médica
    const medicalRelevance = this.assessMedicalRelevance(message, entities, context);

    // Gerar resposta baseada na intenção e contexto
    const response = await this.generateContextualResponse(message, intent, entities, context);

    return {
      content: response.content,
      confidence: response.confidence,
      intent,
      entities,
      medicalRelevance,
      suggestions: response.suggestions,
      followUpQuestions: response.followUpQuestions
    };
  }

  analyzeAdvancedIntent(message, context) {
    const lowerMessage = message.toLowerCase();

    // Intenções médicas específicas
    if (lowerMessage.includes('dor') || lowerMessage.includes('sintoma') || lowerMessage.includes('sinto')) {
      return 'SYMPTOM_INQUIRY';
    }

    if (lowerMessage.includes('agendar') || lowerMessage.includes('consulta') || lowerMessage.includes('médico')) {
      return 'APPOINTMENT_REQUEST';
    }

    if (lowerMessage.includes('medicamento') || lowerMessage.includes('remédio') || lowerMessage.includes('medicação')) {
      return 'MEDICATION_QUESTION';
    }

    if (lowerMessage.includes('exame') || lowerMessage.includes('teste') || lowerMessage.includes('diagnóstico')) {
      return 'EXAM_INQUIRY';
    }

    if (lowerMessage.includes('emergência') || lowerMessage.includes('urgente') || lowerMessage.includes('grave')) {
      return 'EMERGENCY_INQUIRY';
    }

    if (lowerMessage.includes('prevenção') || lowerMessage.includes('cuidado') || lowerMessage.includes('saúde')) {
      return 'PREVENTION_INQUIRY';
    }

    return 'GENERAL_INQUIRY';
  }

  extractMedicalEntities(message) {
    const entities = [];

    // Entidades de sintomas
    const symptomKeywords = [
      'dor', 'febre', 'tosse', 'náusea', 'vômito', 'diarreia', 'constipação',
      'fadiga', 'cansaço', 'tontura', 'palpitação', 'falta de ar', 'chiado'
    ];

    for (const keyword of symptomKeywords) {
      if (message.toLowerCase().includes(keyword)) {
        entities.push({
          type: 'SYMPTOM',
          value: keyword,
          confidence: 0.8
        });
      }
    }

    // Entidades de especialidades
    const specialtyKeywords = [
      'cardiologista', 'neurologista', 'dermatologista', 'ginecologista',
      'pediatra', 'psiquiatra', 'ortopedista', 'oftalmologista'
    ];

    for (const keyword of specialtyKeywords) {
      if (message.toLowerCase().includes(keyword)) {
        entities.push({
          type: 'SPECIALTY',
          value: keyword,
          confidence: 0.9
        });
      }
    }

    // Entidades de urgência
    const urgencyKeywords = ['urgente', 'emergência', 'grave', 'imediato'];
    for (const keyword of urgencyKeywords) {
      if (message.toLowerCase().includes(keyword)) {
        entities.push({
          type: 'URGENCY',
          value: keyword,
          confidence: 0.85
        });
      }
    }

    return entities;
  }

  assessMedicalRelevance(message, entities, context) {
    let relevance = 0;

    // Relevância baseada em entidades médicas
    const medicalEntities = entities.filter(e => 
      ['SYMPTOM', 'SPECIALTY', 'MEDICATION', 'CONDITION'].includes(e.type)
    );
    relevance += medicalEntities.length * 0.2;

    // Relevância baseada em palavras-chave médicas
    const medicalKeywords = [
      'saúde', 'médico', 'hospital', 'clínica', 'tratamento', 'diagnóstico',
      'sintoma', 'doença', 'medicamento', 'exame', 'consulta'
    ];

    const foundKeywords = medicalKeywords.filter(keyword => 
      message.toLowerCase().includes(keyword)
    );
    relevance += foundKeywords.length * 0.1;

    // Relevância baseada no contexto médico
    if (context.medical?.recentTriages?.length > 0) {
      relevance += 0.3;
    }

    return Math.min(1.0, relevance);
  }

  async generateContextualResponse(message, intent, entities, context) {
    let content = '';
    let confidence = 0.8;
    let suggestions = [];
    let followUpQuestions = [];

    switch (intent) {
      case 'SYMPTOM_INQUIRY':
        content = this.generateSymptomResponse(entities, context);
        suggestions = ['Fazer triagem completa', 'Agendar consulta', 'Buscar especialista'];
        followUpQuestions = [
          'Há quanto tempo você tem esses sintomas?',
          'A intensidade dos sintomas mudou?',
          'Você tem outros sintomas associados?'
        ];
        break;

      case 'APPOINTMENT_REQUEST':
        content = this.generateAppointmentResponse(entities, context);
        suggestions = ['Ver especialistas disponíveis', 'Verificar agenda', 'Agendar agora'];
        followUpQuestions = [
          'Qual especialidade você precisa?',
          'Qual a urgência do atendimento?',
          'Você tem preferência de horário?'
        ];
        break;

      case 'MEDICATION_QUESTION':
        content = this.generateMedicationResponse(entities, context);
        suggestions = ['Verificar interações', 'Consultar bula', 'Falar com farmacêutico'];
        followUpQuestions = [
          'Você está tomando outros medicamentos?',
          'Tem alguma alergia conhecida?',
          'Qual a dosagem prescrita?'
        ];
        break;

      case 'EMERGENCY_INQUIRY':
        content = 'Identifiquei que você pode estar em uma situação de emergência. Para emergências médicas, recomendo procurar atendimento imediato no pronto-socorro ou chamar o SAMU (192).';
        suggestions = ['Chamar SAMU (192)', 'Localizar pronto-socorro', 'Fazer triagem de urgência'];
        confidence = 0.95;
        break;

      default:
        content = 'Entendi sua pergunta sobre saúde. Como posso ajudá-lo melhor hoje?';
        suggestions = ['Relatar sintomas', 'Agendar consulta', 'Buscar informações', 'Fazer triagem'];
        followUpQuestions = [
          'Você tem algum sintoma específico?',
          'Precisa de algum tipo de atendimento médico?',
          'Gostaria de informações sobre prevenção?'
        ];
    }

    return {
      content,
      confidence,
      suggestions,
      followUpQuestions
    };
  }

  generateSymptomResponse(entities, context) {
    const symptoms = entities.filter(e => e.type === 'SYMPTOM');
    
    if (symptoms.length === 0) {
      return 'Entendi que você tem alguns sintomas. Pode me contar mais detalhes sobre o que está sentindo?';
    }

    const symptomNames = symptoms.map(s => s.value).join(', ');
    return `Você mencionou sintomas como ${symptomNames}. Para uma avaliação mais precisa, recomendo fazer nossa triagem inteligente ou agendar uma consulta médica. Posso ajudá-lo com isso?`;
  }

  generateAppointmentResponse(entities, context) {
    const specialties = entities.filter(e => e.type === 'SPECIALTY');
    
    if (specialties.length > 0) {
      const specialtyName = specialties[0].value;
      return `Entendi que você precisa de uma consulta com ${specialtyName}. Posso ajudá-lo a encontrar os melhores profissionais na sua região e verificar a disponibilidade.`;
    }

    return 'Posso ajudá-lo a agendar uma consulta médica. Você tem alguma especialidade específica em mente ou gostaria que eu recomende baseado nos seus sintomas?';
  }

  generateMedicationResponse(entities, context) {
    return 'Sobre medicamentos, posso ajudá-lo a verificar interações, esclarecer dúvidas sobre dosagem e fornecer informações gerais. Lembre-se de que sempre é importante consultar um médico ou farmacêutico para orientações específicas.';
  }

  async getUserDataForTriage(userId) {
    const [user, userProfile, medicalProfile] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { birthDate: true, gender: true }
      }),
      
      prisma.userProfile.findUnique({
        where: { userId },
        select: { city: true, state: true }
      }),
      
      prisma.medicalProfile.findUnique({
        where: { userId },
        select: {
          chronicConditions: true,
          familyHistory: true,
          currentMedications: true
        }
      })
    ]);

    const age = user?.birthDate ? 
      Math.floor((new Date() - new Date(user.birthDate)) / (365.25 * 24 * 60 * 60 * 1000)) : null;

    return {
      age,
      gender: user?.gender,
      location: {
        city: userProfile?.city,
        state: userProfile?.state
      },
      medicalHistory: medicalProfile?.chronicConditions ? 
        JSON.parse(medicalProfile.chronicConditions) : []
    };
  }

  async getCompleteMedicalProfile(userId) {
    const medicalProfile = await prisma.medicalProfile.findUnique({
      where: { userId }
    });

    if (!medicalProfile) {
      return {
        allergies: [],
        chronicConditions: [],
        currentMedications: [],
        familyHistory: [],
        lifestyle: {}
      };
    }

    return {
      allergies: medicalProfile.allergies ? JSON.parse(medicalProfile.allergies) : [],
      chronicConditions: medicalProfile.chronicConditions ? JSON.parse(medicalProfile.chronicConditions) : [],
      currentMedications: medicalProfile.currentMedications ? JSON.parse(medicalProfile.currentMedications) : [],
      familyHistory: medicalProfile.familyHistory ? JSON.parse(medicalProfile.familyHistory) : [],
      lifestyle: {
        smoking: medicalProfile.smokingStatus,
        alcohol: medicalProfile.alcoholConsumption,
        exercise: medicalProfile.exerciseFrequency,
        diet: medicalProfile.dietType
      },
      vitals: {
        height: medicalProfile.height,
        weight: medicalProfile.weight,
        bloodType: medicalProfile.bloodType,
        lastBloodPressure: medicalProfile.lastBloodPressure,
        lastHeartRate: medicalProfile.lastHeartRate
      }
    };
  }

  async performHealthRiskAnalysis(params) {
    const { userId, factors, lifestyle, familyHistory, medicalProfile } = params;

    // Simular análise de risco avançada
    // Em produção, integrar com modelos de ML reais

    const riskScores = {
      cardiovascular: this.calculateCardiovascularRisk(factors, lifestyle, familyHistory, medicalProfile),
      diabetes: this.calculateDiabetesRisk(factors, lifestyle, familyHistory, medicalProfile),
      cancer: this.calculateCancerRisk(factors, lifestyle, familyHistory, medicalProfile),
      mentalHealth: this.calculateMentalHealthRisk(factors, lifestyle, familyHistory, medicalProfile)
    };

    const overallScore = Object.values(riskScores).reduce((a, b) => a + b, 0) / 4;

    let level = 'LOW';
    if (overallScore >= 70) level = 'VERY_HIGH';
    else if (overallScore >= 50) level = 'HIGH';
    else if (overallScore >= 30) level = 'MEDIUM';

    const recommendations = this.generateRiskRecommendations(riskScores, level);
    const modifiableFactors = this.identifyModifiableFactors(factors, lifestyle);

    return {
      overallScore: Math.round(overallScore),
      level,
      categoryRisks: riskScores,
      confidence: 0.85,
      recommendations,
      modifiableFactors,
      detailedAnalysis: {
        primaryRisks: this.identifyPrimaryRisks(riskScores),
        protectiveFactors: this.identifyProtectiveFactors(lifestyle, medicalProfile),
        timeline: this.generateRiskTimeline(riskScores)
      },
      nextAssessmentDate: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000) // 6 meses
    };
  }

  calculateCardiovascularRisk(factors, lifestyle, familyHistory, medicalProfile) {
    let risk = 20; // Base risk

    // Age factor
    if (medicalProfile.vitals?.age > 65) risk += 20;
    else if (medicalProfile.vitals?.age > 45) risk += 10;

    // Lifestyle factors
    if (lifestyle.smoking === 'CURRENT') risk += 25;
    if (lifestyle.exercise === 'SEDENTARY') risk += 15;
    if (lifestyle.alcohol === 'HEAVY') risk += 10;

    // Medical history
    if (medicalProfile.chronicConditions.includes('hipertensão')) risk += 20;
    if (medicalProfile.chronicConditions.includes('diabetes')) risk += 15;

    // Family history
    if (familyHistory.some(h => h.includes('cardíaca') || h.includes('infarto'))) risk += 15;

    return Math.min(100, risk);
  }

  calculateDiabetesRisk(factors, lifestyle, familyHistory, medicalProfile) {
    let risk = 15; // Base risk

    // BMI calculation (if height and weight available)
    if (medicalProfile.vitals?.height && medicalProfile.vitals?.weight) {
      const bmi = medicalProfile.vitals.weight / Math.pow(medicalProfile.vitals.height / 100, 2);
      if (bmi >= 30) risk += 25;
      else if (bmi >= 25) risk += 15;
    }

    // Lifestyle factors
    if (lifestyle.exercise === 'SEDENTARY') risk += 20;
    if (lifestyle.diet === 'HIGH_SUGAR') risk += 15;

    // Family history
    if (familyHistory.some(h => h.includes('diabetes'))) risk += 20;

    // Medical conditions
    if (medicalProfile.chronicConditions.includes('hipertensão')) risk += 10;

    return Math.min(100, risk);
  }

  calculateCancerRisk(factors, lifestyle, familyHistory, medicalProfile) {
    let risk = 10; // Base risk

    // Age factor
    if (medicalProfile.vitals?.age > 50) risk += 15;

    // Lifestyle factors
    if (lifestyle.smoking === 'CURRENT') risk += 30;
    if (lifestyle.alcohol === 'HEAVY') risk += 15;

    // Family history
    if (familyHistory.some(h => h.includes('câncer'))) risk += 25;

    return Math.min(100, risk);
  }

  calculateMentalHealthRisk(factors, lifestyle, familyHistory, medicalProfile) {
    let risk = 25; // Base risk

    // Lifestyle factors
    if (lifestyle.exercise === 'SEDENTARY') risk += 10;
    if (lifestyle.alcohol === 'HEAVY') risk += 15;

    // Family history
    if (familyHistory.some(h => h.includes('depressão') || h.includes('ansiedade'))) risk += 20;

    // Chronic conditions (can affect mental health)
    if (medicalProfile.chronicConditions.length > 2) risk += 10;

    return Math.min(100, risk);
  }

  generateRiskRecommendations(riskScores, level) {
    const recommendations = [];

    // Cardiovascular recommendations
    if (riskScores.cardiovascular > 50) {
      recommendations.push({
        category: 'CARDIOVASCULAR',
        priority: 'HIGH',
        action: 'Consultar cardiologista',
        description: 'Avaliação cardiovascular completa recomendada'
      });
    }

    // Diabetes recommendations
    if (riskScores.diabetes > 40) {
      recommendations.push({
        category: 'DIABETES',
        priority: 'MEDIUM',
        action: 'Exames de glicemia',
        description: 'Monitoramento regular dos níveis de açúcar no sangue'
      });
    }

    // General lifestyle recommendations
    recommendations.push({
      category: 'LIFESTYLE',
      priority: 'MEDIUM',
      action: 'Atividade física regular',
      description: 'Pelo menos 150 minutos de exercício moderado por semana'
    });

    return recommendations;
  }

  identifyModifiableFactors(factors, lifestyle) {
    const modifiable = [];

    if (lifestyle.smoking === 'CURRENT') {
      modifiable.push({
        factor: 'Tabagismo',
        impact: 'HIGH',
        action: 'Parar de fumar',
        resources: ['Programa de cessação do tabagismo', 'Apoio médico']
      });
    }

    if (lifestyle.exercise === 'SEDENTARY') {
      modifiable.push({
        factor: 'Sedentarismo',
        impact: 'HIGH',
        action: 'Iniciar atividade física',
        resources: ['Programa de exercícios', 'Acompanhamento profissional']
      });
    }

    if (lifestyle.alcohol === 'HEAVY') {
      modifiable.push({
        factor: 'Consumo excessivo de álcool',
        impact: 'MEDIUM',
        action: 'Reduzir consumo de álcool',
        resources: ['Apoio psicológico', 'Grupos de apoio']
      });
    }

    return modifiable;
  }

  identifyPrimaryRisks(riskScores) {
    return Object.entries(riskScores)
      .filter(([_, score]) => score > 50)
      .map(([category, score]) => ({ category, score }))
      .sort((a, b) => b.score - a.score);
  }

  identifyProtectiveFactors(lifestyle, medicalProfile) {
    const protective = [];

    if (lifestyle.exercise === 'MODERATE' || lifestyle.exercise === 'INTENSE') {
      protective.push('Atividade física regular');
    }

    if (lifestyle.smoking === 'NEVER') {
      protective.push('Não fumante');
    }

    if (lifestyle.diet === 'HEALTHY' || lifestyle.diet === 'MEDITERRANEAN') {
      protective.push('Dieta saudável');
    }

    return protective;
  }

  generateRiskTimeline(riskScores) {
    return {
      shortTerm: '1-2 anos: Monitoramento regular',
      mediumTerm: '3-5 anos: Reavaliação completa',
      longTerm: '5+ anos: Prevenção contínua'
    };
  }

  async generateAIInsights(userId, period) {
    // Gerar insights personalizados baseados no histórico do usuário
    const insights = [];

    // Análise de padrões de uso
    const recentInteractions = await prisma.aIInteraction.count({
      where: {
        userId,
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }
    });

    if (recentInteractions > 10) {
      insights.push({
        type: 'USAGE_PATTERN',
        title: 'Usuário Ativo',
        message: 'Você tem usado bastante nossa IA médica. Isso mostra seu cuidado com a saúde!',
        confidence: 0.9
      });
    }

    // Análise de triagens
    const recentTriages = await prisma.triageResult.findMany({
      where: {
        userId,
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }
    });

    if (recentTriages.length > 0) {
      const urgentTriages = recentTriages.filter(t => t.urgencyLevel === 'HIGH' || t.urgencyLevel === 'EMERGENCY');
      if (urgentTriages.length === 0) {
        insights.push({
          type: 'HEALTH_STATUS',
          title: 'Saúde Estável',
          message: 'Suas triagens recentes não indicaram problemas urgentes. Continue cuidando bem da sua saúde!',
          confidence: 0.85
        });
      }
    }

    return insights;
  }
}

module.exports = new BrainController();

