const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { authenticateToken } = require('../middleware/auth');
const { cache } = require('../config/redis');
const aiValidators = require('../validators/ai');
const { createNotification } = require('../services/notification/notificationService');

const router = express.Router();
const prisma = new PrismaClient();

// ===== CHATBOT IA =====

// @route   POST /api/ai/chat
// @desc    Chat com IA médica
// @access  Private
router.post('/chat', authenticateToken, aiValidators.validateChatMessage, asyncHandler(async (req, res) => {
  const { message, context, sessionId } = req.body;
  const userId = req.user.id;

  // Obter histórico da sessão
  const sessionKey = `ai_chat:${sessionId || userId}`;
  let chatHistory = [];
  
  try {
    const cachedHistory = await cache.get(sessionKey);
    if (cachedHistory) {
      chatHistory = JSON.parse(cachedHistory);
    }
  } catch (error) {
    console.error('Erro ao obter histórico do chat:', error);
  }

  // Processar mensagem com IA
  const aiResponse = await processAIMessage(message, context, chatHistory, req.user);

  // Adicionar ao histórico
  chatHistory.push(
    { role: 'user', content: message, timestamp: new Date() },
    { role: 'assistant', content: aiResponse.content, timestamp: new Date() }
  );

  // Manter apenas últimas 20 mensagens
  if (chatHistory.length > 40) {
    chatHistory = chatHistory.slice(-40);
  }

  // Salvar histórico no cache (24 horas)
  await cache.setex(sessionKey, 86400, JSON.stringify(chatHistory));

  // Salvar interação no banco
  await prisma.aIInteraction.create({
    data: {
      userId,
      type: 'CHAT',
      input: message,
      output: aiResponse.content,
      confidence: aiResponse.confidence,
      processingTime: aiResponse.processingTime,
      metadata: JSON.stringify({
        context,
        sessionId: sessionId || userId,
        intent: aiResponse.intent,
        entities: aiResponse.entities
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
      sessionId: sessionId || userId,
      processingTime: aiResponse.processingTime
    }
  });
}));

// @route   POST /api/ai/triage
// @desc    Triagem inteligente de sintomas
// @access  Private
router.post('/triage', authenticateToken, aiValidators.validateTriageInput, asyncHandler(async (req, res) => {
  const { symptoms, duration, severity, age, gender, medicalHistory } = req.body;
  const userId = req.user.id;

  // Processar triagem com IA
  const triageResult = await processIntelligentTriage({
    symptoms,
    duration,
    severity,
    age,
    gender,
    medicalHistory,
    userId
  });

  // Salvar resultado da triagem
  const triageRecord = await prisma.triageResult.create({
    data: {
      userId,
      symptoms: JSON.stringify(symptoms),
      severity,
      urgencyLevel: triageResult.urgencyLevel,
      recommendations: JSON.stringify(triageResult.recommendations),
      possibleConditions: JSON.stringify(triageResult.possibleConditions),
      confidence: triageResult.confidence,
      aiAnalysis: JSON.stringify(triageResult.analysis),
      metadata: JSON.stringify({
        duration,
        age,
        gender,
        medicalHistory,
        processingTime: triageResult.processingTime
      })
    }
  });

  // Criar notificação se urgente
  if (triageResult.urgencyLevel === 'HIGH' || triageResult.urgencyLevel === 'EMERGENCY') {
    await createNotification({
      userId,
      type: 'URGENT_TRIAGE',
      title: 'Triagem Urgente',
      message: `Sua triagem indica ${triageResult.urgencyLevel === 'EMERGENCY' ? 'emergência' : 'alta prioridade'}. Procure atendimento médico imediatamente.`,
      data: { triageId: triageRecord.id }
    });
  }

  res.json({
    success: true,
    data: {
      triageId: triageRecord.id,
      urgencyLevel: triageResult.urgencyLevel,
      confidence: triageResult.confidence,
      recommendations: triageResult.recommendations,
      possibleConditions: triageResult.possibleConditions,
      analysis: triageResult.analysis,
      nextSteps: triageResult.nextSteps,
      processingTime: triageResult.processingTime
    }
  });
}));

// @route   POST /api/ai/sentiment
// @desc    Análise de sentimento
// @access  Private
router.post('/sentiment', authenticateToken, aiValidators.validateSentimentAnalysis, asyncHandler(async (req, res) => {
  const { text, context } = req.body;
  const userId = req.user.id;

  // Processar análise de sentimento
  const sentimentResult = await analyzeSentiment(text, context);

  // Salvar análise
  await prisma.aIInteraction.create({
    data: {
      userId,
      type: 'SENTIMENT_ANALYSIS',
      input: text,
      output: JSON.stringify(sentimentResult),
      confidence: sentimentResult.confidence,
      processingTime: sentimentResult.processingTime,
      metadata: JSON.stringify({ context })
    }
  });

  res.json({
    success: true,
    data: sentimentResult
  });
}));

// @route   POST /api/ai/nlp/extract
// @desc    Extração de entidades e intenções
// @access  Private
router.post('/nlp/extract', authenticateToken, aiValidators.validateNLPExtraction, asyncHandler(async (req, res) => {
  const { text, extractionType } = req.body;
  const userId = req.user.id;

  // Processar extração NLP
  const nlpResult = await extractNLPEntities(text, extractionType);

  // Salvar resultado
  await prisma.aIInteraction.create({
    data: {
      userId,
      type: 'NLP_EXTRACTION',
      input: text,
      output: JSON.stringify(nlpResult),
      confidence: nlpResult.confidence,
      processingTime: nlpResult.processingTime,
      metadata: JSON.stringify({ extractionType })
    }
  });

  res.json({
    success: true,
    data: nlpResult
  });
}));

// @route   POST /api/ai/recommendations
// @desc    Recomendações personalizadas
// @access  Private
router.post('/recommendations', authenticateToken, aiValidators.validateRecommendationRequest, asyncHandler(async (req, res) => {
  const { type, preferences, context } = req.body;
  const userId = req.user.id;

  // Obter dados do usuário para personalização
  const userData = await getUserDataForRecommendations(userId);

  // Gerar recomendações
  const recommendations = await generatePersonalizedRecommendations({
    type,
    preferences,
    context,
    userData,
    userId
  });

  // Salvar recomendações
  await prisma.aIRecommendation.create({
    data: {
      userId,
      type,
      recommendations: JSON.stringify(recommendations.items),
      confidence: recommendations.confidence,
      reasoning: JSON.stringify(recommendations.reasoning),
      metadata: JSON.stringify({
        preferences,
        context,
        processingTime: recommendations.processingTime
      })
    }
  });

  res.json({
    success: true,
    data: recommendations
  });
}));

// @route   POST /api/ai/risk-assessment
// @desc    Avaliação de risco de saúde
// @access  Private
router.post('/risk-assessment', authenticateToken, aiValidators.validateRiskAssessment, asyncHandler(async (req, res) => {
  const { factors, medicalHistory, lifestyle } = req.body;
  const userId = req.user.id;

  // Processar avaliação de risco
  const riskAssessment = await assessHealthRisk({
    factors,
    medicalHistory,
    lifestyle,
    userId
  });

  // Salvar avaliação
  const riskRecord = await prisma.riskAssessment.create({
    data: {
      userId,
      factors: JSON.stringify(factors),
      riskScore: riskAssessment.score,
      riskLevel: riskAssessment.level,
      recommendations: JSON.stringify(riskAssessment.recommendations),
      analysis: JSON.stringify(riskAssessment.analysis),
      confidence: riskAssessment.confidence,
      metadata: JSON.stringify({
        medicalHistory,
        lifestyle,
        processingTime: riskAssessment.processingTime
      })
    }
  });

  res.json({
    success: true,
    data: {
      assessmentId: riskRecord.id,
      riskScore: riskAssessment.score,
      riskLevel: riskAssessment.level,
      confidence: riskAssessment.confidence,
      recommendations: riskAssessment.recommendations,
      analysis: riskAssessment.analysis,
      preventiveMeasures: riskAssessment.preventiveMeasures,
      processingTime: riskAssessment.processingTime
    }
  });
}));

// @route   POST /api/ai/drug-interaction
// @desc    Verificação de interações medicamentosas
// @access  Private
router.post('/drug-interaction', authenticateToken, aiValidators.validateDrugInteraction, asyncHandler(async (req, res) => {
  const { medications, newMedication } = req.body;
  const userId = req.user.id;

  // Verificar interações
  const interactionResult = await checkDrugInteractions(medications, newMedication);

  // Salvar verificação
  await prisma.aIInteraction.create({
    data: {
      userId,
      type: 'DRUG_INTERACTION',
      input: JSON.stringify({ medications, newMedication }),
      output: JSON.stringify(interactionResult),
      confidence: interactionResult.confidence,
      processingTime: interactionResult.processingTime
    }
  });

  res.json({
    success: true,
    data: interactionResult
  });
}));

// @route   POST /api/ai/symptom-checker
// @desc    Verificador de sintomas avançado
// @access  Private
router.post('/symptom-checker', authenticateToken, aiValidators.validateSymptomChecker, asyncHandler(async (req, res) => {
  const { symptoms, patientInfo, duration } = req.body;
  const userId = req.user.id;

  // Processar verificação de sintomas
  const symptomAnalysis = await analyzeSymptoms({
    symptoms,
    patientInfo,
    duration,
    userId
  });

  // Salvar análise
  const analysisRecord = await prisma.symptomAnalysis.create({
    data: {
      userId,
      symptoms: JSON.stringify(symptoms),
      analysis: JSON.stringify(symptomAnalysis.analysis),
      possibleConditions: JSON.stringify(symptomAnalysis.conditions),
      confidence: symptomAnalysis.confidence,
      urgencyLevel: symptomAnalysis.urgencyLevel,
      recommendations: JSON.stringify(symptomAnalysis.recommendations),
      metadata: JSON.stringify({
        patientInfo,
        duration,
        processingTime: symptomAnalysis.processingTime
      })
    }
  });

  res.json({
    success: true,
    data: {
      analysisId: analysisRecord.id,
      confidence: symptomAnalysis.confidence,
      urgencyLevel: symptomAnalysis.urgencyLevel,
      possibleConditions: symptomAnalysis.conditions,
      recommendations: symptomAnalysis.recommendations,
      analysis: symptomAnalysis.analysis,
      nextSteps: symptomAnalysis.nextSteps,
      processingTime: symptomAnalysis.processingTime
    }
  });
}));

// @route   GET /api/ai/history
// @desc    Histórico de interações com IA
// @access  Private
router.get('/history', authenticateToken, asyncHandler(async (req, res) => {
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
        input: true,
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
}));

// @route   GET /api/ai/analytics
// @desc    Analytics de uso da IA
// @access  Private
router.get('/analytics', authenticateToken, asyncHandler(async (req, res) => {
  const { period = '30d' } = req.query;
  const userId = req.user.id;

  // Calcular período
  const days = parseInt(period.replace('d', ''));
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Obter estatísticas
  const [
    totalInteractions,
    interactionsByType,
    averageConfidence,
    averageProcessingTime,
    recentTrends
  ] = await Promise.all([
    // Total de interações
    prisma.aIInteraction.count({
      where: {
        userId,
        createdAt: { gte: startDate }
      }
    }),

    // Por tipo
    prisma.aIInteraction.groupBy({
      by: ['type'],
      where: {
        userId,
        createdAt: { gte: startDate }
      },
      _count: { type: true }
    }),

    // Confiança média
    prisma.aIInteraction.aggregate({
      where: {
        userId,
        createdAt: { gte: startDate }
      },
      _avg: { confidence: true }
    }),

    // Tempo médio de processamento
    prisma.aIInteraction.aggregate({
      where: {
        userId,
        createdAt: { gte: startDate }
      },
      _avg: { processingTime: true }
    }),

    // Tendências recentes (últimos 7 dias)
    prisma.aIInteraction.groupBy({
      by: ['type'],
      where: {
        userId,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      },
      _count: { type: true }
    })
  ]);

  res.json({
    success: true,
    data: {
      period,
      totalInteractions,
      interactionsByType: interactionsByType.map(item => ({
        type: item.type,
        count: item._count.type
      })),
      averageConfidence: averageConfidence._avg.confidence || 0,
      averageProcessingTime: averageProcessingTime._avg.processingTime || 0,
      recentTrends: recentTrends.map(item => ({
        type: item.type,
        count: item._count.type
      }))
    }
  });
}));

// ===== FUNÇÕES DE IA =====

// Processar mensagem com IA
async function processAIMessage(message, context, history, user) {
  const startTime = Date.now();
  
  // Simular processamento de IA (em produção, integrar com OpenAI, Anthropic, etc.)
  const response = await simulateAIResponse(message, context, history, user);
  
  const processingTime = Date.now() - startTime;
  
  return {
    content: response.content,
    confidence: response.confidence,
    intent: response.intent,
    entities: response.entities,
    suggestions: response.suggestions,
    processingTime
  };
}

// Simular resposta da IA
async function simulateAIResponse(message, context, history, user) {
  // Análise de intenção
  const intent = analyzeIntent(message);
  
  // Extração de entidades
  const entities = extractEntities(message);
  
  // Gerar resposta baseada na intenção
  let content = '';
  let confidence = 0.85;
  let suggestions = [];

  switch (intent) {
    case 'SYMPTOM_INQUIRY':
      content = generateSymptomResponse(entities, user);
      suggestions = ['Agendar consulta', 'Fazer triagem', 'Buscar especialista'];
      break;
    
    case 'APPOINTMENT_REQUEST':
      content = generateAppointmentResponse(entities, user);
      suggestions = ['Ver disponibilidade', 'Escolher especialista', 'Agendar agora'];
      break;
    
    case 'MEDICATION_QUESTION':
      content = generateMedicationResponse(entities, user);
      suggestions = ['Verificar interações', 'Consultar bula', 'Falar com farmacêutico'];
      break;
    
    case 'GENERAL_HEALTH':
      content = generateGeneralHealthResponse(entities, user);
      suggestions = ['Dicas de saúde', 'Exercícios', 'Alimentação saudável'];
      break;
    
    default:
      content = 'Entendi sua pergunta. Como posso ajudá-lo com questões de saúde hoje?';
      suggestions = ['Sintomas', 'Agendamentos', 'Medicamentos', 'Dicas de saúde'];
  }

  return {
    content,
    confidence,
    intent,
    entities,
    suggestions
  };
}

// Análise de intenção
function analyzeIntent(message) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('dor') || lowerMessage.includes('sintoma') || lowerMessage.includes('sinto')) {
   
(Content truncated due to size limit. Use line ranges to read in chunks)