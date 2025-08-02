'use strict';

const { PrismaClient } = require('@prisma/client');
const { AppError } = require('../../middleware/errorHandler');
const { logger } = require('../../config/logger');

const prisma = new PrismaClient();

class AdvancedTriageService {

  /**
   * Realizar triagem inteligente avançada
   * @param {Object} params - Parâmetros da triagem
   * @param {Array} params.symptoms - Lista de sintomas
   * @param {string} params.duration - Duração dos sintomas
   * @param {string} params.severity - Severidade percebida
   * @param {number} params.age - Idade do paciente
   * @param {string} params.gender - Gênero do paciente
   * @param {Array} params.medicalHistory - Histórico médico
   * @param {string} params.userId - ID do usuário
   * @returns {Object} Resultado da triagem
   */
  async performAdvancedTriage(params) {
    const { symptoms, duration, severity, age, gender, medicalHistory = [], userId } = params;

    try {
      // 1. Validar e normalizar sintomas
      const normalizedSymptoms = this.normalizeSymptoms(symptoms);

      // 2. Obter dados médicos do usuário
      const patientData = await this.getPatientMedicalData(userId);

      // 3. Análise de sintomas com IA
      const symptomAnalysis = await this.analyzeSymptoms(normalizedSymptoms, {
        duration,
        severity,
        age,
        gender,
        medicalHistory: [...medicalHistory, ...patientData.conditions],
        currentMedications: patientData.medications
      });

      // 4. Calcular nível de urgência
      const urgencyAssessment = this.calculateUrgencyLevel(symptomAnalysis, {
        age,
        medicalHistory,
        severity,
        duration
      });

      // 5. Identificar possíveis condições
      const possibleConditions = await this.identifyPossibleConditions(
        normalizedSymptoms,
        symptomAnalysis,
        { age, gender, medicalHistory }
      );

      // 6. Gerar recomendações
      const recommendations = this.generateRecommendations(
        urgencyAssessment,
        possibleConditions,
        symptomAnalysis
      );

      // 7. Calcular confiança da análise
      const confidence = this.calculateAnalysisConfidence(
        symptomAnalysis,
        possibleConditions,
        urgencyAssessment
      );

      // 8. Salvar resultado da triagem
      const triageResult = await this.saveTriageResult({
        userId,
        symptoms: normalizedSymptoms,
        severity,
        duration,
        urgencyLevel: urgencyAssessment.level,
        confidence,
        possibleConditions,
        recommendations,
        analysis: symptomAnalysis,
        patientAge: age,
        patientGender: gender,
        patientHistory: medicalHistory
      });

      return {
        triageId: triageResult.id,
        urgencyLevel: urgencyAssessment.level,
        urgencyScore: urgencyAssessment.score,
        confidence,
        possibleConditions: possibleConditions.slice(0, 5), // Top 5
        recommendations,
        analysis: {
          primaryConcerns: symptomAnalysis.primaryConcerns,
          riskFactors: symptomAnalysis.riskFactors,
          redFlags: symptomAnalysis.redFlags,
          timeline: symptomAnalysis.timeline
        },
        nextSteps: this.generateNextSteps(urgencyAssessment, recommendations),
        followUp: this.generateFollowUpPlan(urgencyAssessment, possibleConditions),
        processingTime: Date.now() - (params.startTime || Date.now())
      };

    } catch (error) {
      logger.error('Erro na triagem avançada:', error);
      throw new AppError('Erro interno no sistema de triagem', 500);
    }
  }

  /**
   * Normalizar e validar sintomas
   */
  normalizeSymptoms(symptoms) {
    if (!Array.isArray(symptoms) || symptoms.length === 0) {
      throw new AppError('Lista de sintomas é obrigatória', 400);
    }

    return symptoms.map(symptom => {
      if (typeof symptom === 'string') {
        return {
          name: symptom.toLowerCase().trim(),
          severity: 'medium',
          duration: 'unknown',
          location: null,
          characteristics: []
        };
      }

      return {
        name: (symptom.name || '').toLowerCase().trim(),
        severity: symptom.severity || 'medium',
        duration: symptom.duration || 'unknown',
        location: symptom.location || null,
        characteristics: symptom.characteristics || [],
        onset: symptom.onset || null,
        triggers: symptom.triggers || []
      };
    }).filter(symptom => symptom.name.length > 0);
  }

  /**
   * Obter dados médicos do paciente
   */
  async getPatientMedicalData(userId) {
    const medicalProfile = await prisma.medicalProfile.findUnique({
      where: { userId },
      select: {
        allergies: true,
        chronicConditions: true,
        currentMedications: true,
        familyHistory: true,
        smokingStatus: true,
        alcoholConsumption: true
      }
    });

    if (!medicalProfile) {
      return {
        conditions: [],
        medications: [],
        allergies: [],
        familyHistory: [],
        lifestyle: {}
      };
    }

    return {
      conditions: medicalProfile.chronicConditions ? JSON.parse(medicalProfile.chronicConditions) : [],
      medications: medicalProfile.currentMedications ? JSON.parse(medicalProfile.currentMedications) : [],
      allergies: medicalProfile.allergies ? JSON.parse(medicalProfile.allergies) : [],
      familyHistory: medicalProfile.familyHistory ? JSON.parse(medicalProfile.familyHistory) : [],
      lifestyle: {
        smoking: medicalProfile.smokingStatus,
        alcohol: medicalProfile.alcoholConsumption
      }
    };
  }

  /**
   * Analisar sintomas com IA
   */
  async analyzeSymptoms(symptoms, context) {
    const { duration, severity, age, gender, medicalHistory, currentMedications } = context;

    // Análise de padrões de sintomas
    const symptomPatterns = this.identifySymptomPatterns(symptoms);

    // Identificar red flags (sinais de alarme)
    const redFlags = this.identifyRedFlags(symptoms, { age, medicalHistory });

    // Analisar timeline dos sintomas
    const timeline = this.analyzeSymptomTimeline(symptoms, duration);

    // Identificar fatores de risco
    const riskFactors = this.identifyRiskFactors(symptoms, {
      age,
      gender,
      medicalHistory,
      currentMedications
    });

    // Determinar preocupações primárias
    const primaryConcerns = this.identifyPrimaryConcerns(symptoms, redFlags, riskFactors);

    // Análise de sistemas corporais afetados
    const affectedSystems = this.identifyAffectedSystems(symptoms);

    return {
      symptomPatterns,
      redFlags,
      timeline,
      riskFactors,
      primaryConcerns,
      affectedSystems,
      complexity: this.calculateComplexity(symptoms, redFlags, riskFactors),
      confidence: this.calculateSymptomAnalysisConfidence(symptoms, symptomPatterns)
    };
  }

  /**
   * Identificar padrões de sintomas
   */
  identifySymptomPatterns(symptoms) {
    const patterns = [];

    // Padrões cardiovasculares
    const cardiacSymptoms = symptoms.filter(s => 
      ['dor no peito', 'palpitação', 'falta de ar', 'tontura', 'desmaio'].includes(s.name)
    );
    if (cardiacSymptoms.length >= 2) {
      patterns.push({
        type: 'CARDIOVASCULAR',
        symptoms: cardiacSymptoms,
        confidence: 0.8
      });
    }

    // Padrões neurológicos
    const neuroSymptoms = symptoms.filter(s => 
      ['dor de cabeça', 'tontura', 'confusão', 'fraqueza', 'dormência', 'convulsão'].includes(s.name)
    );
    if (neuroSymptoms.length >= 2) {
      patterns.push({
        type: 'NEUROLOGICAL',
        symptoms: neuroSymptoms,
        confidence: 0.75
      });
    }

    // Padrões respiratórios
    const respSymptoms = symptoms.filter(s => 
      ['falta de ar', 'tosse', 'dor no peito', 'chiado', 'expectoração'].includes(s.name)
    );
    if (respSymptoms.length >= 2) {
      patterns.push({
        type: 'RESPIRATORY',
        symptoms: respSymptoms,
        confidence: 0.7
      });
    }

    // Padrões gastrointestinais
    const giSymptoms = symptoms.filter(s => 
      ['dor abdominal', 'náusea', 'vômito', 'diarreia', 'constipação', 'azia'].includes(s.name)
    );
    if (giSymptoms.length >= 2) {
      patterns.push({
        type: 'GASTROINTESTINAL',
        symptoms: giSymptoms,
        confidence: 0.7
      });
    }

    // Padrões infecciosos
    const infectSymptoms = symptoms.filter(s => 
      ['febre', 'calafrios', 'fadiga', 'dor de cabeça', 'dor muscular'].includes(s.name)
    );
    if (infectSymptoms.length >= 3) {
      patterns.push({
        type: 'INFECTIOUS',
        symptoms: infectSymptoms,
        confidence: 0.65
      });
    }

    return patterns;
  }

  /**
   * Identificar red flags (sinais de alarme)
   */
  identifyRedFlags(symptoms, context) {
    const { age, medicalHistory } = context;
    const redFlags = [];

    // Red flags cardiovasculares
    const hasChestPain = symptoms.some(s => s.name === 'dor no peito');
    const hasShortness = symptoms.some(s => s.name === 'falta de ar');
    if (hasChestPain && (age > 40 || medicalHistory.includes('hipertensão'))) {
      redFlags.push({
        type: 'CARDIAC_EMERGENCY',
        description: 'Dor no peito em paciente com fatores de risco cardiovascular',
        urgency: 'HIGH'
      });
    }

    // Red flags neurológicos
    const hasHeadache = symptoms.some(s => s.name === 'dor de cabeça');
    const hasConfusion = symptoms.some(s => s.name === 'confusão');
    const hasFever = symptoms.some(s => s.name === 'febre');
    if (hasHeadache && hasConfusion && hasFever) {
      redFlags.push({
        type: 'NEUROLOGICAL_EMERGENCY',
        description: 'Tríade sugestiva de meningite',
        urgency: 'EMERGENCY'
      });
    }

    // Red flags respiratórios
    if (hasShortness && symptoms.some(s => s.severity === 'severe')) {
      redFlags.push({
        type: 'RESPIRATORY_DISTRESS',
        description: 'Dificuldade respiratória severa',
        urgency: 'HIGH'
      });
    }

    // Red flags abdominais
    const hasAbdominalPain = symptoms.some(s => s.name === 'dor abdominal');
    const hasVomiting = symptoms.some(s => s.name === 'vômito');
    if (hasAbdominalPain && symptoms.some(s => s.severity === 'severe')) {
      redFlags.push({
        type: 'ACUTE_ABDOMEN',
        description: 'Dor abdominal severa',
        urgency: 'HIGH'
      });
    }

    // Red flags por idade
    if (age > 65 && symptoms.length >= 3) {
      redFlags.push({
        type: 'ELDERLY_MULTIPLE_SYMPTOMS',
        description: 'Múltiplos sintomas em paciente idoso',
        urgency: 'MEDIUM'
      });
    }

    return redFlags;
  }

  /**
   * Analisar timeline dos sintomas
   */
  analyzeSymptomTimeline(symptoms, duration) {
    const timeline = {
      onset: 'unknown',
      progression: 'unknown',
      pattern: 'unknown',
      duration: duration
    };

    // Determinar onset baseado na duração
    if (duration.includes('minuto') || duration.includes('hora')) {
      timeline.onset = 'acute';
    } else if (duration.includes('dia')) {
      timeline.onset = 'subacute';
    } else if (duration.includes('semana') || duration.includes('mês')) {
      timeline.onset = 'chronic';
    }

    // Analisar progressão baseado nos sintomas
    const severityLevels = symptoms.map(s => {
      switch (s.severity) {
        case 'mild': return 1;
        case 'medium': return 2;
        case 'severe': return 3;
        default: return 2;
      }
    });

    const avgSeverity = severityLevels.reduce((a, b) => a + b, 0) / severityLevels.length;
    if (avgSeverity >= 2.5) {
      timeline.progression = 'worsening';
    } else if (avgSeverity <= 1.5) {
      timeline.progression = 'improving';
    } else {
      timeline.progression = 'stable';
    }

    return timeline;
  }

  /**
   * Identificar fatores de risco
   */
  identifyRiskFactors(symptoms, context) {
    const { age, gender, medicalHistory, currentMedications } = context;
    const riskFactors = [];

    // Fatores de risco por idade
    if (age > 65) {
      riskFactors.push({
        type: 'AGE',
        description: 'Idade avançada (>65 anos)',
        impact: 'HIGH'
      });
    }

    // Fatores de risco por histórico médico
    const highRiskConditions = ['diabetes', 'hipertensão', 'doença cardíaca', 'câncer'];
    for (const condition of medicalHistory) {
      if (highRiskConditions.some(hrc => condition.toLowerCase().includes(hrc))) {
        riskFactors.push({
          type: 'MEDICAL_HISTORY',
          description: `Histórico de ${condition}`,
          impact: 'HIGH'
        });
      }
    }

    // Fatores de risco por medicamentos
    const highRiskMeds = ['anticoagulante', 'imunossupressor', 'quimioterapia'];
    for (const med of currentMedications) {
      if (highRiskMeds.some(hrm => med.toLowerCase().includes(hrm))) {
        riskFactors.push({
          type: 'MEDICATION',
          description: `Uso de ${med}`,
          impact: 'MEDIUM'
        });
      }
    }

    // Fatores de risco por combinação de sintomas
    const symptomNames = symptoms.map(s => s.name);
    if (symptomNames.includes('dor no peito') && symptomNames.includes('falta de ar')) {
      riskFactors.push({
        type: 'SYMPTOM_COMBINATION',
        description: 'Combinação de dor no peito e falta de ar',
        impact: 'HIGH'
      });
    }

    return riskFactors;
  }

  /**
   * Identificar preocupações primárias
   */
  identifyPrimaryConcerns(symptoms, redFlags, riskFactors) {
    const concerns = [];

    // Preocupações baseadas em red flags
    for (const redFlag of redFlags) {
      if (redFlag.urgency === 'EMERGENCY' || redFlag.urgency === 'HIGH') {
        concerns.push({
          type: 'EMERGENCY',
          description: redFlag.description,
          priority: 1
        });
      }
    }

    // Preocupações baseadas em fatores de risco
    const highRiskFactors = riskFactors.filter(rf => rf.impact === 'HIGH');
    if (highRiskFactors.length > 0) {
      concerns.push({
        type: 'HIGH_RISK',
        description: 'Paciente com múltiplos fatores de risco',
        priority: 2
      });
    }

    // Preocupações baseadas em sintomas específicos
    const criticalSymptoms = symptoms.filter(s => 
      ['dor no peito', 'falta de ar', 'confusão', 'convulsão'].includes(s.name)
    );
    if (criticalSymptoms.length > 0) {
      concerns.push({
        type: 'CRITICAL_SYMPTOMS',
        description: 'Presença de sintomas críticos',
        priority: 2
      });
    }

    return concerns.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Identificar sistemas corporais afetados
   */
  identifyAffectedSystems(symptoms) {
    const systems = new Set();

    const systemMap = {
      'cardiovascular': ['dor no peito', 'palpitação', 'falta de ar', 'tontura'],
      'respiratório': ['tosse', 'falta de ar', 'chiado', 'expectoração'],
      'neurológico': ['dor de cabeça', 'tontura', 'confusão', 'fraqueza', 'dormência'],
      'gastrointestinal': ['dor abdominal', 'náusea', 'vômito', 'diarreia'],
      'musculoesquelético': ['dor muscular', 'dor nas articulações', 'rigidez'],
      'dermatológico': ['erupção', 'coceira', 'vermelhidão'],
      'genitourinário': ['dor ao urinar', 'urgência urinária', 'sangue na urina']
    };

    for (const symptom of symptoms) {
      for (const [system, systemSymptoms] of Object.entries(systemMap)) {
        if (systemSymptoms.includes(symptom.name)) {
          systems.add(system);
        }
      }
    }

    return Array.from(systems);
  }

  /**
   * Calcular nível de urgência
   */
  calculateUrgencyLevel(analysis, context) {
    let urgencyScore = 0;
    const { age, medicalHistory, severity, duration } = context;

    // Score baseado em red flags
    for (const redFlag of analysis.redFlags) {
      switch (redFlag.urgency) {
        case 'EMERGENCY': urgencyScore += 40; break;
        case 'HIGH': urgencyScore += 25; break;
        case 'MEDIUM': urgencyScore += 15; break;
        default: urgencyScore += 5;
      }
    }

    // Score baseado em fatores de risco
    const highRiskFactors = analysis.riskFactors.filter(rf => rf.impact === 'HIGH');
    urgencyScore += highRiskFactors.length * 10;

    // Score baseado na idade
    if (age > 65) urgencyScore += 10;
    if (age > 80) urgencyScore += 15;

    // Score baseado na severidade
    if (severity === 'severe') urgencyScore += 20;
    else if (severity === 'medium') urgencyScore += 10;

    // Score baseado na duração (sintomas agudos são mais urgentes)
    if (duration.includes('minuto')) urgencyScore += 15;
    else if (duration.includes('hora')) urgencyScore += 10;

    // Score baseado em preocupações primárias
    const emergencyConcerns = analysis.primaryConcerns.filter(c => c.type === 'EMERGENCY');
    urgencyScore += emergencyConcerns.length * 20;

    // Determinar nível baseado no score
    let level;
    if (urgencyScore >= 60) level = 'EMERGENCY';
    else if (urgencyScore >= 40) level = 'HIGH';
    else if (urgencyScore >= 20) level = 'MEDIUM';
    else level = 'LOW';

    return {
      level,
      score: Math.min(100, urgencyScore),
      factors: {
        redFlags: analysis.redFlags.length,
        riskFactors: analysis.riskFactors.length,
        age: age > 65,
        severity: severity,
        duration: duration
      }
    };
  }

  /**
   * Identificar possíveis condições
   */
  async identifyPossibleConditions(symptoms, analysis, context) {
    // Base de conhecimento simplificada - em produção, usar base mais robusta
    const conditionDatabase = await this.getConditionDatabase();
    
    const possibleConditions = [];

    for (const condition of conditionDatabase) {
      const matchScore = this.calculateConditionMatch(symptoms, condition, analysis, context);
      
      if (matchScore.score > 0.3) {
        possibleConditions.push({
          name: condition.name,
          code: condition.code,
          category: condition.category,
          probability: Math.round(matchScore.score * 100),
          confidence: matchScore.confidence,
          matchingSymptoms: matchScore.matchingSymptoms,
          description: condition.description,
          urgency: condition.urgency || 'MEDIUM',
          recommendedActions: condition.recommendedActions || []
        });
      }
    }

    return possibleConditions
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 10);
  }

  /**
   * Obter base de dados de condições (simplificada)
   */
  async getConditionDatabase() {
    // Em produção, buscar do banco de dados MedicalKnowledge
    return [
      {
        name: 'Infarto Agudo do Miocárdio',
        code: 'I21',
        category: 'Cardiovascular',
        symptoms: ['dor no peito', 'falta de ar', 'náusea', 'sudorese'],
        riskFactors: ['idade > 40', 'hipertensão', 'diabetes', 'tabagismo'],
        urgency: 'EMERGENCY',
        description: 'Bloqueio agudo de artéria coronária',
        recommendedActions: ['Chamar SAMU', 'Ir ao pronto-socorro imediatamente']
      },
      {
        name: 'Pneumonia',
        code: 'J18',
        category: 'Respiratório',
        symptoms: ['tosse', 'febre', 'falta de ar', 'dor no peito'],
        riskFactors: ['idade > 65', 'imunossupressão'],
        urgency: 'HIGH',
        description: 'Infecção pulmonar',
        recommendedActions: ['Procurar atendimento médico', 'Exames de imagem']
      },
      {
        name: 'Gastroenterite',
        code: 'K59',
        category: 'Gastrointestinal',
        symptoms: ['dor abdominal', 'náusea', 'vômito', 'diarreia'],
        riskFactors: ['desidratação'],
        urgency: 'MEDIUM',
        description: 'Inflamação do trato gastrointestinal',
        recommendedActions: ['Hidratação', 'Dieta leve', 'Monitorar sintomas']
      },
      {
        name: 'Enxaqueca',
        code: 'G43',
        category: 'Neurológico',
        symptoms: ['dor de cabeça', 'náusea', 'sensibilidade à luz'],
        riskFactors: ['estresse', 'alterações hormonais'],
        urgency: 'LOW',
        description: 'Cefaleia primária recorrente',
        recommendedActions: ['Repouso', 'Analgésicos', 'Evitar gatilhos']
      }
    ];
  }

  /**
   * Calcular match entre sintomas e condição
   */
  calculateConditionMatch(symptoms, condition, analysis, context) {
    const symptomNames = symptoms.map(s => s.name);
    const conditionSymptoms = condition.symptoms || [];
    
    // Calcular sintomas em comum
    const matchingSymptoms = symptomNames.filter(s => 
      conditionSymptoms.some(cs => cs.includes(s) || s.includes(cs))
    );

    // Score baseado em sintomas
    let score = matchingSymptoms.length / Math.max(conditionSymptoms.length, symptomNames.length);

    // Bonus por fatores de risco
    const patientRiskFactors = analysis.riskFactors.map(rf => rf.description.toLowerCase());
    const conditionRiskFactors = condition.riskFactors || [];
    
    for (const crf of conditionRiskFactors) {
      if (patientRiskFactors.some(prf => prf.includes(crf.toLowerCase()))) {
        score += 0.1;
      }
    }

    // Bonus por padrões de sintomas
    const relevantPatterns = analysis.symptomPatterns.filter(p => 
      p.type.toLowerCase() === condition.category.toLowerCase()
    );
    if (relevantPatterns.length > 0) {
      score += 0.15;
    }

    // Calcular confiança
    const confidence = Math.min(1.0, 
      (matchingSymptoms.length / symptomNames.length) * 
      (matchingSymptoms.length / conditionSymptoms.length)
    );

    return {
      score: Math.min(1.0, score),
      confidence,
      matchingSymptoms
    };
  }

  /**
   * Gerar recomendações
   */
  generateRecommendations(urgencyAssessment, possibleConditions, analysis) {
    const recommendations = [];

    // Recomendações baseadas na urgência
    switch (urgencyAssessment.level) {
      case 'EMERGENCY':
        recommendations.push({
          type: 'IMMEDIATE_ACTION',
          priority: 'URGENT',
          action: 'Procurar atendimento de emergência imediatamente',
          description: 'Chamar SAMU (192) ou ir ao pronto-socorro mais próximo',
          timeframe: 'Imediato'
        });
        break;

      case 'HIGH':
        recommendations.push({
          type: 'URGENT_CARE',
          priority: 'HIGH',
          action: 'Procurar atendimento médico urgente',
          description: 'Agendar consulta para hoje ou procurar pronto-atendimento',
          timeframe: 'Nas próximas 4 horas'
        });
        break;

      case 'MEDIUM':
        recommendations.push({
          type: 'MEDICAL_CONSULTATION',
          priority: 'MEDIUM',
          action: 'Agendar consulta médica',
          description: 'Procurar atendimento médico nos próximos dias',
          timeframe: 'Em 24-48 horas'
        });
        break;

      case 'LOW':
        recommendations.push({
          type: 'ROUTINE_CARE',
          priority: 'LOW',
          action: 'Monitorar sintomas',
          description: 'Observar evolução e procurar médico se piorar',
          timeframe: 'Se sintomas persistirem por mais de uma semana'
        });
        break;
    }

    // Recomendações baseadas em condições específicas
    if (possibleConditions.length > 0) {
      const topCondition = possibleConditions[0];
      if (topCondition.recommendedActions) {
        for (const action of topCondition.recommendedActions) {
          recommendations.push({
            type: 'SPECIFIC_ACTION',
            priority: topCondition.urgency,
            action: action,
            description: `Recomendado para possível ${topCondition.name}`,
            condition: topCondition.name
          });
        }
      }
    }

    // Recomendações baseadas em red flags
    for (const redFlag of analysis.redFlags) {
      if (redFlag.urgency === 'EMERGENCY') {
        recommendations.unshift({
          type: 'RED_FLAG_ACTION',
          priority: 'URGENT',
          action: 'Atenção: Sinal de alarme identificado',
          description: redFlag.description,
          timeframe: 'Imediato'
        });
      }
    }

    return recommendations;
  }

  /**
   * Calcular confiança da análise
   */
  calculateAnalysisConfidence(symptomAnalysis, possibleConditions, urgencyAssessment) {
    let confidence = 0.5; // Base

    // Confiança baseada na análise de sintomas
    confidence += symptomAnalysis.confidence * 0.3;

    // Confiança baseada nas condições identificadas
    if (possibleConditions.length > 0) {
      const avgConditionConfidence = possibleConditions
        .slice(0, 3)
        .reduce((acc, c) => acc + c.confidence, 0) / Math.min(3, possibleConditions.length);
      confidence += avgConditionConfidence * 0.2;
    }

    // Confiança baseada na consistência da urgência
    if (urgencyAssessment.score > 60 && symptomAnalysis.redFlags.length > 0) {
      confidence += 0.2; // Alta urgência com red flags = mais confiança
    }

    // Confiança baseada na complexidade
    if (symptomAnalysis.complexity === 'low') {
      confidence += 0.1;
    } else if (symptomAnalysis.complexity === 'high') {
      confidence -= 0.1;
    }

    return Math.max(0.3, Math.min(1.0, confidence));
  }

  /**
   * Calcular complexidade dos sintomas
   */
  calculateComplexity(symptoms, redFlags, riskFactors) {
    let complexityScore = 0;

    // Número de sintomas
    complexityScore += symptoms.length * 2;

    // Red flags aumentam complexidade
    complexityScore += redFlags.length * 5;

    // Fatores de risco aumentam complexidade
    complexityScore += riskFactors.length * 3;

    // Sistemas múltiplos aumentam complexidade
    const systems = new Set();
    // ... lógica para identificar sistemas afetados

    if (complexityScore <= 10) return 'low';
    if (complexityScore <= 25) return 'medium';
    return 'high';
  }

  /**
   * Calcular confiança da análise de sintomas
   */
  calculateSymptomAnalysisConfidence(symptoms, patterns) {
    let confidence = 0.6; // Base

    // Mais sintomas = mais confiança (até um limite)
    confidence += Math.min(0.2, symptoms.length * 0.05);

    // Padrões identificados aumentam confiança
    confidence += patterns.length * 0.1;

    // Sintomas bem definidos aumentam confiança
    const wellDefinedSymptoms = symptoms.filter(s => 
      s.severity && s.duration && s.duration !== 'unknown'
    );
    confidence += (wellDefinedSymptoms.length / symptoms.length) * 0.2;

    return Math.min(1.0, confidence);
  }

  /**
   * Gerar próximos passos
   */
  generateNextSteps(urgencyAssessment, recommendations) {
    const nextSteps = [];

    // Passo imediato baseado na urgência
    const immediateAction = recommendations.find(r => r.priority === 'URGENT');
    if (immediateAction) {
      nextSteps.push({
        step: 1,
        action: immediateAction.action,
        timeframe: immediateAction.timeframe || 'Imediato',
        critical: true
      });
    }

    // Passos de acompanhamento
    nextSteps.push({
      step: nextSteps.length + 1,
      action: 'Monitorar evolução dos sintomas',
      timeframe: 'Contínuo',
      critical: false
    });

    if (urgencyAssessment.level !== 'EMERGENCY') {
      nextSteps.push({
        step: nextSteps.length + 1,
        action: 'Registrar novos sintomas ou mudanças',
        timeframe: 'Conforme necessário',
        critical: false
      });
    }

    return nextSteps;
  }

  /**
   * Gerar plano de follow-up
   */
  generateFollowUpPlan(urgencyAssessment, possibleConditions) {
    const followUp = {
      required: true,
      timeframe: '24 horas',
      actions: []
    };

    switch (urgencyAssessment.level) {
      case 'EMERGENCY':
        followUp.timeframe = 'Imediato';
        followUp.actions.push('Acompanhamento hospitalar');
        break;

      case 'HIGH':
        followUp.timeframe = '4-6 horas';
        followUp.actions.push('Reavaliação médica');
        break;

      case 'MEDIUM':
        followUp.timeframe = '24-48 horas';
        followUp.actions.push('Consulta médica agendada');
        break;

      case 'LOW':
        followUp.timeframe = '1 semana';
        followUp.actions.push('Monitoramento domiciliar');
        followUp.required = false;
        break;
    }

    // Adicionar follow-up específico para condições
    if (possibleConditions.length > 0) {
      const topCondition = possibleConditions[0];
      followUp.actions.push(`Investigação para ${topCondition.name}`);
    }

    return followUp;
  }

  /**
   * Salvar resultado da triagem
   */
  async saveTriageResult(data) {
    try {
      const triageResult = await prisma.triageResult.create({
        data: {
          userId: data.userId,
          symptoms: JSON.stringify(data.symptoms),
          severity: data.severity,
          duration: data.duration,
          urgencyLevel: data.urgencyLevel,
          confidence: data.confidence,
          possibleConditions: JSON.stringify(data.possibleConditions),
          recommendations: JSON.stringify(data.recommendations),
          aiAnalysis: JSON.stringify(data.analysis),
          patientAge: data.patientAge,
          patientGender: data.patientGender,
          patientHistory: JSON.stringify(data.patientHistory),
          followUpRequired: data.urgencyLevel !== 'LOW'
        }
      });

      return triageResult;
    } catch (error) {
      logger.error('Erro ao salvar resultado da triagem:', error);
      throw new AppError('Erro ao salvar resultado da triagem', 500);
    }
  }

  /**
   * Obter histórico de triagens do usuário
   */
  async getUserTriageHistory(userId, limit = 10) {
    const triages = await prisma.triageResult.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        urgencyLevel: true,
        confidence: true,
        createdAt: true,
        symptoms: true,
        possibleConditions: true
      }
    });

    return triages.map(triage => ({
      ...triage,
      symptoms: JSON.parse(triage.symptoms),
      possibleConditions: JSON.parse(triage.possibleConditions)
    }));
  }
}

module.exports = new AdvancedTriageService();

