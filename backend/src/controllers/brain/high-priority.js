// APIs de Alta Prioridade - FWAY Brain
// Arquivo: fway-brain-apis-high-priority.js
// Localização no projeto: backend/src/controllers/brain/

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

// ====================================
// 1. CHAT MÉDICO CONTEXTUAL
// ====================================

/**
 * POST /api/brain/chat
 * Processa mensagem do chat médico com análise de IA
 */
const processChat = async (req, res) => {
  try {
    const { message, sessionId, context } = req.body;
    const userId = req.user?.id;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Mensagem é obrigatória'
      });
    }

    // Buscar contexto médico do usuário
    const medicalProfile = await prisma.medicalProfile.findUnique({
      where: { userId }
    });

    // Buscar histórico recente da conversa
    const recentHistory = await prisma.aIInteraction.findMany({
      where: {
        userId,
        sessionId: sessionId || `session_${userId}_${Date.now()}`
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // Análise de intenção e entidades médicas
    const analysis = await analyzeMessage(message, medicalProfile, context, recentHistory);

    // Gerar resposta da IA
    const aiResponse = await generateAIResponse(message, analysis, medicalProfile, recentHistory);

    // Detectar urgência e red flags
    const urgencyAssessment = assessUrgency(analysis, message);

    // Salvar interação
    const interaction = await prisma.aIInteraction.create({
      data: {
        userId,
        sessionId: sessionId || `session_${userId}_${Date.now()}`,
        userMessage: message,
        aiResponse: aiResponse.response,
        intent: analysis.intent,
        entities: analysis.entities,
        confidence: analysis.confidence,
        urgencyLevel: urgencyAssessment.level,
        medicalRelevance: analysis.medicalRelevance,
        context: {
          ...context,
          medicalProfile: medicalProfile ? {
            hasChronicConditions: medicalProfile.chronicConditions?.length > 0,
            hasAllergies: medicalProfile.allergies?.length > 0,
            medicationCount: medicalProfile.currentMedications?.length || 0
          } : null
        }
      }
    });

    // Gerar recomendações baseadas na conversa
    const recommendations = generateChatRecommendations(analysis, urgencyAssessment, medicalProfile);

    res.json({
      success: true,
      data: {
        interactionId: interaction.id,
        sessionId: interaction.sessionId,
        response: aiResponse.response,
        intent: analysis.intent,
        entities: analysis.entities,
        confidence: analysis.confidence,
        medicalRelevance: analysis.medicalRelevance,
        urgencyLevel: urgencyAssessment.level,
        urgencyReasons: urgencyAssessment.reasons,
        suggestions: aiResponse.suggestions,
        followUpQuestions: aiResponse.followUpQuestions,
        recommendations,
        contextualInsights: aiResponse.contextualInsights,
        timestamp: interaction.createdAt
      }
    });

  } catch (error) {
    console.error('Erro no chat médico:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * GET /api/brain/chat/history/:userId
 * Retorna histórico de conversas do chat
 */
const getChatHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const { sessionId, limit = 50, page = 1 } = req.query;
    const requestingUserId = req.user?.id;

    // Verificar permissão
    if (userId !== requestingUserId && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }

    const whereClause = { userId };
    if (sessionId) {
      whereClause.sessionId = sessionId;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [history, totalCount] = await Promise.all([
      prisma.aIInteraction.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
        select: {
          id: true,
          sessionId: true,
          userMessage: true,
          aiResponse: true,
          intent: true,
          entities: true,
          confidence: true,
          urgencyLevel: true,
          medicalRelevance: true,
          createdAt: true
        }
      }),
      prisma.aIInteraction.count({ where: whereClause })
    ]);

    // Agrupar por sessão
    const sessionGroups = {};
    history.forEach(interaction => {
      if (!sessionGroups[interaction.sessionId]) {
        sessionGroups[interaction.sessionId] = [];
      }
      sessionGroups[interaction.sessionId].push(interaction);
    });

    // Estatísticas do histórico
    const stats = {
      totalInteractions: totalCount,
      totalSessions: Object.keys(sessionGroups).length,
      averageConfidence: history.length > 0 ? 
        history.reduce((sum, h) => sum + h.confidence, 0) / history.length : 0,
      urgencyDistribution: {
        LOW: history.filter(h => h.urgencyLevel === 'LOW').length,
        MEDIUM: history.filter(h => h.urgencyLevel === 'MEDIUM').length,
        HIGH: history.filter(h => h.urgencyLevel === 'HIGH').length,
        EMERGENCY: history.filter(h => h.urgencyLevel === 'EMERGENCY').length
      }
    };

    res.json({
      success: true,
      data: {
        history,
        sessionGroups,
        stats,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          totalPages: Math.ceil(totalCount / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Erro ao buscar histórico do chat:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// ====================================
// 2. TRIAGEM AVANÇADA COM RED FLAGS
// ====================================

/**
 * POST /api/brain/triage
 * Realiza triagem médica avançada com detecção de red flags
 */
const advancedTriage = async (req, res) => {
  try {
    const { symptoms, duration, severity, additionalInfo, vitals } = req.body;
    const userId = req.user?.id;

    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Sintomas são obrigatórios'
      });
    }

    // Buscar perfil médico para contexto
    const medicalProfile = await prisma.medicalProfile.findUnique({
      where: { userId }
    });

    // Buscar fatores de risco do usuário
    const riskFactors = await prisma.riskFactor.findMany({
      where: { userId }
    });

    // Análise de red flags
    const redFlags = detectRedFlags(symptoms, severity, additionalInfo, vitals, medicalProfile);
    
    // Cálculo de score de risco
    const riskScore = calculateTriageRiskScore(
      symptoms, 
      duration, 
      severity, 
      additionalInfo, 
      medicalProfile,
      riskFactors,
      vitals
    );
    
    // Determinação do nível de urgência
    const urgencyLevel = determineUrgencyLevel(riskScore, redFlags, symptoms, vitals);
    
    // Análise por sistemas corporais
    const systemAnalysis = analyzeBodySystems(symptoms, additionalInfo, vitals);
    
    // Geração de recomendações
    const recommendations = generateTriageRecommendations(
      urgencyLevel, 
      symptoms, 
      redFlags, 
      systemAnalysis,
      medicalProfile
    );

    // Sugestão de especialidade médica
    const specialtyRecommendation = getSpecialtyRecommendation(symptoms, systemAnalysis);

    // Estimativa de tempo de espera
    const estimatedWaitTime = getEstimatedWaitTime(urgencyLevel, specialtyRecommendation);

    // Salvar resultado da triagem
    const triageResult = await prisma.triageResult.create({
      data: {
        userId,
        symptoms,
        urgencyLevel,
        riskScore,
        redFlags,
        recommendations,
        specialtyRecommendation,
        confidence: calculateTriageConfidence(symptoms, additionalInfo, vitals),
        systemAnalysis,
        additionalData: {
          duration,
          severity,
          additionalInfo,
          vitals,
          medicalHistory: medicalProfile ? {
            allergies: medicalProfile.allergies,
            chronicConditions: medicalProfile.chronicConditions,
            currentMedications: medicalProfile.currentMedications,
            familyHistory: medicalProfile.familyHistory
          } : null,
          riskFactors: riskFactors.map(rf => ({
            factor: rf.factor,
            severity: rf.severity,
            category: rf.category
          }))
        }
      }
    });

    // Gerar plano de ação
    const actionPlan = generateActionPlan(urgencyLevel, recommendations, specialtyRecommendation);

    res.json({
      success: true,
      data: {
        triageId: triageResult.id,
        urgencyLevel,
        riskScore,
        redFlags,
        systemAnalysis,
        recommendations,
        actionPlan,
        confidence: triageResult.confidence,
        nextSteps: getNextSteps(urgencyLevel),
        estimatedWaitTime,
        specialtyRecommendation,
        followUpInstructions: generateFollowUpInstructions(urgencyLevel, symptoms),
        warningSignsToWatch: getWarningSignsToWatch(symptoms, urgencyLevel),
        timestamp: triageResult.createdAt
      }
    });

  } catch (error) {
    console.error('Erro na triagem avançada:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// ====================================
// FUNÇÕES AUXILIARES - CHAT
// ====================================

async function analyzeMessage(message, medicalProfile, context, recentHistory) {
  // Análise de intenção baseada em palavras-chave e contexto
  const medicalKeywords = [
    'dor', 'febre', 'tosse', 'náusea', 'tontura', 'cansaço', 'sangue', 'respiração',
    'coração', 'pressão', 'diabetes', 'medicamento', 'remédio', 'sintoma', 'doença'
  ];
  
  const emergencyKeywords = [
    'emergência', 'urgente', 'grave', 'intenso', 'insuportável', 'desmaio',
    'convulsão', 'infarto', 'avc', 'derrame', 'sangramento', 'overdose'
  ];

  const appointmentKeywords = [
    'agendar', 'consulta', 'médico', 'especialista', 'exame', 'marcar'
  ];

  const informationKeywords = [
    'o que é', 'como', 'quando', 'por que', 'sintomas de', 'tratamento'
  ];

  const messageLower = message.toLowerCase();
  
  const hasMedicalTerms = medicalKeywords.some(keyword => 
    messageLower.includes(keyword)
  );
  
  const hasEmergencyTerms = emergencyKeywords.some(keyword => 
    messageLower.includes(keyword)
  );

  const hasAppointmentTerms = appointmentKeywords.some(keyword => 
    messageLower.includes(keyword)
  );

  const hasInformationTerms = informationKeywords.some(keyword => 
    messageLower.includes(keyword)
  );

  // Determinar intenção principal
  let intent = 'GENERAL_INQUIRY';
  if (hasEmergencyTerms) intent = 'EMERGENCY_INQUIRY';
  else if (hasAppointmentTerms) intent = 'APPOINTMENT_REQUEST';
  else if (hasInformationTerms) intent = 'INFORMATION_REQUEST';
  else if (hasMedicalTerms) intent = 'MEDICAL_INQUIRY';

  // Extrair entidades médicas
  const entities = extractMedicalEntities(message);

  // Calcular confiança baseada em múltiplos fatores
  let confidence = 0.6; // Base
  if (hasMedicalTerms) confidence += 0.2;
  if (entities.length > 0) confidence += 0.1;
  if (medicalProfile) confidence += 0.1;
  if (recentHistory.length > 0) confidence += 0.05;

  return {
    intent,
    entities,
    confidence: Math.min(confidence, 0.95),
    medicalRelevance: hasMedicalTerms ? 0.9 : hasEmergencyTerms ? 1.0 : 0.3,
    urgencyLevel: hasEmergencyTerms ? 'HIGH' : hasMedicalTerms ? 'MEDIUM' : 'LOW',
    contextualFactors: {
      hasHistoricalContext: recentHistory.length > 0,
      hasMedicalProfile: !!medicalProfile,
      messageLength: message.length,
      keywordMatches: {
        medical: medicalKeywords.filter(k => messageLower.includes(k)),
        emergency: emergencyKeywords.filter(k => messageLower.includes(k))
      }
    }
  };
}

function extractMedicalEntities(message) {
  const entities = [];
  const messageLower = message.toLowerCase();
  
  // Sintomas
  const symptoms = [
    'dor de cabeça', 'febre', 'tosse', 'náusea', 'vômito', 'diarreia',
    'tontura', 'cansaço', 'falta de ar', 'dor no peito', 'palpitação'
  ];
  
  symptoms.forEach(symptom => {
    if (messageLower.includes(symptom)) {
      entities.push({
        type: 'SYMPTOM',
        value: symptom,
        confidence: 0.9
      });
    }
  });

  // Medicamentos
  const medications = [
    'paracetamol', 'ibuprofeno', 'aspirina', 'dipirona', 'omeprazol',
    'losartana', 'metformina', 'sinvastatina'
  ];

  medications.forEach(med => {
    if (messageLower.includes(med)) {
      entities.push({
        type: 'MEDICATION',
        value: med,
        confidence: 0.8
      });
    }
  });

  // Partes do corpo
  const bodyParts = [
    'cabeça', 'pescoço', 'peito', 'abdômen', 'barriga', 'braço', 'perna',
    'coração', 'pulmão', 'estômago', 'fígado', 'rim'
  ];

  bodyParts.forEach(part => {
    if (messageLower.includes(part)) {
      entities.push({
        type: 'BODY_PART',
        value: part,
        confidence: 0.7
      });
    }
  });

  return entities;
}

async function generateAIResponse(message, analysis, medicalProfile, recentHistory) {
  let response = '';
  const suggestions = [];
  const followUpQuestions = [];
  const contextualInsights = [];

  // Gerar resposta baseada na intenção
  switch (analysis.intent) {
    case 'EMERGENCY_INQUIRY':
      response = 'Entendo que você está enfrentando uma situação que considera urgente. Para emergências médicas reais, recomendo procurar atendimento médico imediato ou ligar para o SAMU (192). Posso ajudá-lo a entender melhor a situação enquanto isso.';
      suggestions.push('Procurar atendimento de emergência');
      suggestions.push('Ligar para o SAMU (192)');
      suggestions.push('Realizar triagem de urgência');
      break;

    case 'MEDICAL_INQUIRY':
      response = 'Compreendo sua preocupação com os sintomas mencionados. Posso ajudá-lo a entender melhor sua situação e orientá-lo sobre os próximos passos. É importante lembrar que não substituo uma consulta médica presencial.';
      suggestions.push('Realizar triagem médica');
      suggestions.push('Agendar consulta');
      suggestions.push('Verificar interações medicamentosas');
      followUpQuestions.push('Há quanto tempo você está sentindo esses sintomas?');
      followUpQuestions.push('Os sintomas estão piorando ou melhorando?');
      followUpQuestions.push('Você está tomando algum medicamento?');
      break;

    case 'APPOINTMENT_REQUEST':
      response = 'Posso ajudá-lo a encontrar o profissional mais adequado para sua necessidade. Vou usar inteligência artificial para fazer o melhor matching baseado em seus sintomas e preferências.';
      suggestions.push('Buscar especialista');
      suggestions.push('Ver profissionais disponíveis');
      suggestions.push('Realizar triagem primeiro');
      break;

    case 'INFORMATION_REQUEST':
      response = 'Estou aqui para fornecer informações médicas confiáveis. Posso explicar sobre condições, sintomas, tratamentos e cuidados preventivos. Sobre o que gostaria de saber?';
      suggestions.push('Buscar informações sobre sintomas');
      suggestions.push('Entender condições médicas');
      suggestions.push('Conhecer tratamentos');
      break;

    default:
      response = 'Olá! Sou seu assistente médico inteligente. Estou aqui para ajudá-lo com questões relacionadas à sua saúde, realizar triagens, encontrar profissionais adequados e fornecer informações médicas confiáveis. Como posso ajudá-lo hoje?';
      suggestions.push('Fazer uma pergunta sobre saúde');
      suggestions.push('Realizar triagem de sintomas');
      suggestions.push('Buscar profissional de saúde');
  }

  // Adicionar insights contextuais
  if (medicalProfile) {
    if (medicalProfile.chronicConditions?.length > 0) {
      contextualInsights.push(`Considerando suas condições crônicas: ${medicalProfile.chronicConditions.join(', ')}`);
    }
    if (medicalProfile.allergies?.length > 0) {
      contextualInsights.push(`Lembre-se de suas alergias conhecidas: ${medicalProfile.allergies.join(', ')}`);
    }
  }

  if (recentHistory.length > 0) {
    const recentTopics = recentHistory.slice(0, 3).map(h => h.intent).filter((v, i, a) => a.indexOf(v) === i);
    contextualInsights.push(`Continuando nossa conversa sobre: ${recentTopics.join(', ')}`);
  }

  return {
    response,
    suggestions,
    followUpQuestions,
    contextualInsights
  };
}

function assessUrgency(analysis, message) {
  const urgencyKeywords = {
    EMERGENCY: ['emergência', 'urgente', 'grave', 'insuportável', 'desmaio', 'convulsão', 'infarto'],
    HIGH: ['intenso', 'severo', 'muito forte', 'piorando', 'sangramento'],
    MEDIUM: ['moderado', 'preocupante', 'persistente'],
    LOW: ['leve', 'ocasional', 'melhorando']
  };

  const messageLower = message.toLowerCase();
  let level = 'LOW';
  const reasons = [];

  // Verificar palavras-chave de urgência
  for (const [urgencyLevel, keywords] of Object.entries(urgencyKeywords)) {
    for (const keyword of keywords) {
      if (messageLower.includes(keyword)) {
        if (urgencyLevel === 'EMERGENCY') {
          level = 'EMERGENCY';
          reasons.push(`Palavra-chave de emergência detectada: "${keyword}"`);
        } else if (urgencyLevel === 'HIGH' && level !== 'EMERGENCY') {
          level = 'HIGH';
          reasons.push(`Indicador de alta urgência: "${keyword}"`);
        } else if (urgencyLevel === 'MEDIUM' && !['EMERGENCY', 'HIGH'].includes(level)) {
          level = 'MEDIUM';
          reasons.push(`Indicador de urgência moderada: "${keyword}"`);
        }
      }
    }
  }

  // Considerar análise de intenção
  if (analysis.intent === 'EMERGENCY_INQUIRY' && level === 'LOW') {
    level = 'HIGH';
    reasons.push('Intenção de emergência detectada');
  }

  return { level, reasons };
}

function generateChatRecommendations(analysis, urgencyAssessment, medicalProfile) {
  const recommendations = [];

  if (urgencyAssessment.level === 'EMERGENCY') {
    recommendations.push({
      type: 'URGENT_ACTION',
      priority: 'CRITICAL',
      title: 'Busque atendimento médico imediato',
      description: 'Situação pode requerer cuidados de emergência',
      action: 'Dirija-se ao pronto-socorro ou ligue 192'
    });
  }

  if (analysis.medicalRelevance > 0.7) {
    recommendations.push({
      type: 'MEDICAL_EVALUATION',
      priority: urgencyAssessment.level === 'HIGH' ? 'HIGH' : 'MEDIUM',
      title: 'Avaliação médica recomendada',
      description: 'Seus sintomas merecem atenção profissional',
      action: 'Agendar consulta médica'
    });
  }

  if (analysis.entities.some(e => e.type === 'MEDICATION')) {
    recommendations.push({
      type: 'MEDICATION_CHECK',
      priority: 'MEDIUM',
      title: 'Verificar interações medicamentosas',
      description: 'Medicamentos mencionados podem ter interações',
      action: 'Usar verificador de interações'
    });
  }

  return recommendations;
}

// ====================================
// FUNÇÕES AUXILIARES - TRIAGEM
// ====================================

function detectRedFlags(symptoms, severity, additionalInfo, vitals, medicalProfile) {
  const redFlags = [];
  
  // Red flags baseados em sintomas críticos
  const criticalSymptoms = [
    'chest_pain', 'difficulty_breathing', 'severe_headache', 'loss_of_consciousness',
    'severe_abdominal_pain', 'sudden_weakness', 'speech_difficulty', 'vision_loss'
  ];
  
  symptoms.forEach(symptom => {
    if (criticalSymptoms.includes(symptom)) {
      redFlags.push({
        type: 'CRITICAL_SYMPTOM',
        symptom,
        severity: 'HIGH',
        description: getSymptomDescription(symptom),
        recommendation: 'Buscar atendimento médico imediato'
      });
    }
  });

  // Red flags baseados em severidade
  if (severity >= 8) {
    redFlags.push({
      type: 'HIGH_SEVERITY',
      severity: 'HIGH',
      description: 'Nível de dor/desconforto muito alto (8-10/10)',
      recommendation: 'Avaliação médica urgente necessária'
    });
  }

  // Red flags baseados em sinais vitais
  if (vitals) {
    if (vitals.temperature > 39.5) {
      redFlags.push({
        type: 'HIGH_FEVER',
        severity: 'HIGH',
        description: `Febre muito alta: ${vitals.temperature}°C`,
        recommendation: 'Controle da febre e avaliação médica'
      });
    }

    if (vitals.heartRate > 120 || vitals.heartRate < 50) {
      redFlags.push({
        type: 'ABNORMAL_HEART_RATE',
        severity: 'MEDIUM',
        description: `Frequência cardíaca anormal: ${vitals.heartRate} bpm`,
        recommendation: 'Monitoramento cardíaco necessário'
      });
    }

    if (vitals.bloodPressure) {
      const [systolic, diastolic] = vitals.bloodPressure.split('/').map(Number);
      if (systolic > 180 || diastolic > 110) {
        redFlags.push({
          type: 'HYPERTENSIVE_CRISIS',
          severity: 'HIGH',
          description: `Pressão arterial muito elevada: ${vitals.bloodPressure}`,
          recommendation: 'Atendimento médico imediato'
        });
      }
    }
  }

  // Red flags baseados no perfil médico
  if (medicalProfile) {
    const highRiskConditions = ['heart_disease', 'diabetes', 'kidney_disease', 'cancer'];
    const userConditions = medicalProfile.chronicConditions || [];
    
    const hasHighRiskCondition = userConditions.some(condition => 
      highRiskConditions.some(risk => condition.toLowerCase().includes(risk))
    );

    if (hasHighRiskCondition && symptoms.length > 0) {
      redFlags.push({
        type: 'HIGH_RISK_PATIENT',
        severity: 'MEDIUM',
        description: 'Paciente com condições de alto risco',
        recommendation: 'Monitoramento mais próximo necessário'
      });
    }
  }

  return redFlags;
}

function calculateTriageRiskScore(symptoms, duration, severity, additionalInfo, medicalProfile, riskFactors, vitals) {
  let score = 0;
  
  // Score baseado em sintomas
  const highRiskSymptoms = [
    'chest_pain', 'difficulty_breathing', 'severe_headache', 'loss_of_consciousness'
  ];
  const mediumRiskSymptoms = [
    'abdominal_pain', 'fever', 'vomiting', 'dizziness'
  ];

  symptoms.forEach(symptom => {
    if (highRiskSymptoms.includes(symptom)) {
      score += 30;
    } else if (mediumRiskSymptoms.includes(symptom)) {
      score += 15;
    } else {
      score += 10;
    }
  });
  
  // Score baseado em severidade
  score += severity * 5;
  
  // Score baseado em duração
  if (duration === 'acute') score += 20;
  else if (duration === 'subacute') score += 10;
  else if (duration === 'chronic') score += 5;
  
  // Score baseado em sinais vitais
  if (vitals) {
    if (vitals.temperature > 39) score += 15;
    if (vitals.heartRate > 100 || vitals.heartRate < 60) score += 10;
    if (vitals.bloodPressure) {
      const [systolic] = vitals.bloodPressure.split('/').map(Number);
      if (systolic > 160 || systolic < 90) score += 15;
    }
  }

  // Score baseado em histórico médico
  if (medicalProfile?.chronicConditions?.length > 0) {
    score += medicalProfile.chronicConditions.length * 8;
  }

  // Score baseado em fatores de risco
  riskFactors.forEach(factor => {
    score += (factor.severity || 1) * 5;
  });
  
  return Math.min(score, 100);
}

function determineUrgencyLevel(riskScore, redFlags, symptoms, vitals) {
  // Emergência: red flags críticos ou score muito alto
  if (redFlags.some(flag => flag.severity === 'HIGH') || riskScore >= 80) {
    return 'EMERGENCY';
  }
  
  // Alta urgência: múltiplos red flags ou score alto
  if (redFlags.length > 1 || riskScore >= 60) {
    return 'HIGH';
  }
  
  // Urgência média: alguns red flags ou score moderado
  if (redFlags.length > 0 || riskScore >= 40) {
    return 'MEDIUM';
  }
  
  // Baixa urgência: score baixo e sem red flags
  return 'LOW';
}

function analyzeBodySystems(symptoms, additionalInfo, vitals) {
  const systems = {
    cardiovascular: { symptoms: [], score: 0, risk: 'LOW' },
    respiratory: { symptoms: [], score: 0, risk: 'LOW' },
    neurological: { symptoms: [], score: 0, risk: 'LOW' },
    gastrointestinal: { symptoms: [], score: 0, risk: 'LOW' },
    musculoskeletal: { symptoms: [], score: 0, risk: 'LOW' },
    general: { symptoms: [], score: 0, risk: 'LOW' }
  };

  const systemMapping = {
    cardiovascular: ['chest_pain', 'palpitations', 'shortness_of_breath', 'leg_swelling'],
    respiratory: ['cough', 'difficulty_breathing', 'wheezing', 'chest_tightness'],
    neurological: ['headache', 'dizziness', 'confusion', 'weakness', 'numbness'],
    gastrointestinal: ['nausea', 'vomiting', 'abdominal_pain', 'diarrhea', 'constipation'],
    musculoskeletal: ['joint_pain', 'muscle_pain', 'back_pain', 'stiffness'],
    general: ['fever', 'fatigue', 'weight_loss', 'night_sweats']
  };

  // Mapear sintomas para sistemas
  symptoms.forEach(symptom => {
    for (const [system, systemSymptoms] of Object.entries(systemMapping)) {
      if (systemSymptoms.includes(symptom)) {
        systems[system].symptoms.push(symptom);
        systems[system].score += getSymptomWeight(symptom);
      }
    }
  });

  // Determinar nível de risco por sistema
  Object.keys(systems).forEach(system => {
    const score = systems[system].score;
    systems[system].risk = score > 20 ? 'HIGH' : score > 10 ? 'MEDIUM' : 'LOW';
  });

  return systems;
}

function generateTriageRecommendations(urgencyLevel, symptoms, redFlags, systemAnalysis, medicalProfile) {
  const recommendations = [];
  
  switch (urgencyLevel) {
    case 'EMERGENCY':
      recommendations.push({
        priority: 'CRITICAL',
        category: 'IMMEDIATE_ACTION',
        title: 'Procure atendimento médico de emergência IMEDIATAMENTE',
        description: 'Situação crítica detectada que requer cuidados médicos urgentes',
        action: 'Dirija-se ao pronto-socorro mais próximo ou ligue para o SAMU (192)'
      });
      break;
      
    case 'HIGH':
      recommendations.push({
        priority: 'HIGH',
        category: 'URGENT_CARE',
        title: 'Agende uma consulta médica urgente',
        description: 'Seus sintomas indicam necessidade de avaliação médica em breve',
        action: 'Procure atendimento médico nas próximas 4-6 horas'
      });
      break;
      
    case 'MEDIUM':
      recommendations.push({
        priority: 'MEDIUM',
        category: 'MEDICAL_CONSULTATION',
        title: 'Agende uma consulta médica nos próximos dias',
        description: 'Recomendamos avaliação médica para seus sintomas',
        action: 'Marque consulta médica em 24-48 horas'
      });
      break;
      
    case 'LOW':
      recommendations.push({
        priority: 'LOW',
        category: 'MONITORING',
        title: 'Monitore os sintomas',
        description: 'Continue observando a evolução dos sintomas',
        action: 'Autocuidado apropriado e monitoramento'
      });
      break;
  }

  // Recomendações específicas por sistema afetado
  Object.entries(systemAnalysis).forEach(([system, data]) => {
    if (data.risk === 'HIGH' && data.symptoms.length > 0) {
      recommendations.push({
        priority: 'MEDIUM',
        category: 'SYSTEM_SPECIFIC',
        title: `Atenção ao sistema ${system}`,
        description: `Múltiplos sintomas detectados no sistema ${system}`,
        action: `Considere consulta com especialista em ${system}`
      });
    }
  });

  return recommendations;
}

function getSpecialtyRecommendation(symptoms, systemAnalysis) {
  // Determinar especialidade baseada nos sistemas mais afetados
  const systemScores = Object.entries(systemAnalysis)
    .map(([system, data]) => ({ system, score: data.score }))
    .sort((a, b) => b.score - a.score);

  if (systemScores.length === 0) return 'Clínica Geral';

  const topSystem = systemScores[0].system;
  
  const specialtyMapping = {
    cardiovascular: 'Cardiologia',
    respiratory: 'Pneumologia',
    neurological: 'Neurologia',
    gastrointestinal: 'Gastroenterologia',
    musculoskeletal: 'Ortopedia',
    general: 'Clínica Geral'
  };

  return specialtyMapping[topSystem] || 'Clínica Geral';
}

function getEstimatedWaitTime(urgencyLevel, specialty) {
  const baseTimes = {
    'EMERGENCY': '0-15 minutos',
    'HIGH': '1-4 horas',
    'MEDIUM': '1-3 dias',
    'LOW': '1-7 dias'
  };

  const specialtyModifiers = {
    'Cardiologia': ' (pode ser mais rápido para casos urgentes)',
    'Neurologia': ' (pode ter lista de espera maior)',
    'Clínica Geral': ' (geralmente mais disponível)'
  };

  const baseTime = baseTimes[urgencyLevel] || baseTimes['LOW'];
  const modifier = specialtyModifiers[specialty] || '';

  return baseTime + modifier;
}

function calculateTriageConfidence(symptoms, additionalInfo, vitals) {
  let confidence = 0.7; // Base confidence
  
  if (symptoms.length > 3) confidence += 0.1;
  if (vitals) confidence += 0.1;
  if (additionalInfo?.duration) confidence += 0.05;
  if (additionalInfo?.notes && additionalInfo.notes.length > 20) confidence += 0.05;
  
  return Math.min(confidence, 0.95);
}

function getNextSteps(urgencyLevel) {
  const steps = {
    'EMERGENCY': [
      'Procurar atendimento imediato',
      'Ligar para emergência (192)',
      'Não dirigir sozinho se possível'
    ],
    'HIGH': [
      'Agendar consulta urgente',
      'Monitorar sintomas de perto',
      'Preparar lista de medicamentos'
    ],
    'MEDIUM': [
      'Agendar consulta médica',
      'Continuar autocuidado',
      'Anotar evolução dos sintomas'
    ],
    'LOW': [
      'Monitoramento domiciliar',
      'Medidas de autocuidado',
      'Procurar ajuda se piorar'
    ]
  };
  
  return steps[urgencyLevel] || steps['LOW'];
}

function generateActionPlan(urgencyLevel, recommendations, specialtyRecommendation) {
  return {
    immediate: urgencyLevel === 'EMERGENCY' ? 
      ['Buscar atendimento de emergência imediatamente'] : 
      ['Seguir recomendações de triagem'],
    shortTerm: [
      `Considerar consulta com ${specialtyRecommendation}`,
      'Monitorar evolução dos sintomas',
      'Manter registro dos sintomas'
    ],
    longTerm: [
      'Seguir plano de tratamento médico',
      'Manter acompanhamento regular',
      'Adotar medidas preventivas'
    ]
  };
}

function generateFollowUpInstructions(urgencyLevel, symptoms) {
  const instructions = [
    'Monitore a evolução dos sintomas',
    'Anote qualquer mudança ou piora',
    'Mantenha-se hidratado e descanse'
  ];

  if (urgencyLevel === 'HIGH' || urgencyLevel === 'EMERGENCY') {
    instructions.unshift('Procure atendimento médico se os sintomas piorarem');
  }

  return instructions;
}

function getWarningSignsToWatch(symptoms, urgencyLevel) {
  const generalWarnings = [
    'Piora súbita dos sintomas',
    'Dificuldade para respirar',
    'Dor no peito intensa',
    'Perda de consciência',
    'Febre muito alta (>39.5°C)'
  ];

  // Adicionar sinais específicos baseados nos sintomas
  if (symptoms.includes('headache')) {
    generalWarnings.push('Dor de cabeça súbita e intensa');
  }

  if (symptoms.includes('abdominal_pain')) {
    generalWarnings.push('Dor abdominal que piora rapidamente');
  }

  return generalWarnings;
}

// Funções auxiliares adicionais
function getSymptomDescription(symptom) {
  const descriptions = {
    'chest_pain': 'Dor no peito que pode indicar problema cardíaco',
    'difficulty_breathing': 'Dificuldade respiratória que requer atenção imediata',
    'severe_headache': 'Dor de cabeça intensa que pode indicar problema neurológico',
    'loss_of_consciousness': 'Perda de consciência é sempre um sinal de alarme'
  };
  
  return descriptions[symptom] || 'Sintoma que requer atenção médica';
}

function getSymptomWeight(symptom) {
  const weights = {
    'chest_pain': 25,
    'difficulty_breathing': 25,
    'severe_headache': 20,
    'abdominal_pain': 15,
    'fever': 10,
    'nausea': 8,
    'fatigue': 5
  };
  
  return weights[symptom] || 5;
}

module.exports = {
  processChat,
  getChatHistory,
  advancedTriage
};

