const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class VoiceAgentService {
  constructor() {
    this.conversationContexts = new Map(); // Armazenar contextos de conversa em memória
  }

  // Processar entrada de voz do usuário
  async processVoiceInput(userId, transcript, sessionId) {
    try {
      // Obter contexto da conversa
      const context = this.getConversationContext(sessionId);
      
      // Analisar a intenção do usuário
      const intent = await this.analyzeIntent(transcript);
      
      // Obter dados do paciente
      const patientData = await this.getPatientData(userId);
      
      // Gerar resposta baseada na intenção e contexto
      const response = await this.generateResponse(intent, transcript, patientData, context);
      
      // Salvar interação no histórico
      await this.saveInteraction(userId, transcript, response.text, sessionId);
      
      // Atualizar contexto da conversa
      this.updateConversationContext(sessionId, transcript, response.text, intent);
      
      // Executar ações se necessário
      if (response.actions && response.actions.length > 0) {
        await this.executeActions(userId, response.actions);
      }
      
      return {
        success: true,
        response: response.text,
        actions: response.actions || [],
        suggestions: response.suggestions || [],
        metadata: {
          intent: intent.name,
          confidence: intent.confidence,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Erro ao processar entrada de voz:', error);
      return {
        success: false,
        error: 'Desculpe, ocorreu um erro ao processar sua solicitação. Tente novamente.',
        response: 'Desculpe, não consegui processar sua solicitação no momento. Como posso ajudá-lo de outra forma?'
      };
    }
  }

  // Analisar intenção do usuário
  async analyzeIntent(transcript) {
    const lowerTranscript = transcript.toLowerCase();
    
    // Intenções relacionadas a sintomas e dor
    if (this.containsKeywords(lowerTranscript, ['dor', 'doendo', 'machucado', 'ferido', 'desconforto'])) {
      return { name: 'report_pain', confidence: 0.9, entities: this.extractPainEntities(lowerTranscript) };
    }
    
    // Intenções relacionadas a agendamento
    if (this.containsKeywords(lowerTranscript, ['agendar', 'marcar', 'consulta', 'appointment', 'horário'])) {
      return { name: 'schedule_appointment', confidence: 0.85, entities: this.extractScheduleEntities(lowerTranscript) };
    }
    
    // Intenções relacionadas a medicamentos
    if (this.containsKeywords(lowerTranscript, ['medicamento', 'remédio', 'pílula', 'dose', 'tomar'])) {
      return { name: 'medication_inquiry', confidence: 0.8, entities: this.extractMedicationEntities(lowerTranscript) };
    }
    
    // Intenções relacionadas a exames
    if (this.containsKeywords(lowerTranscript, ['exame', 'resultado', 'teste', 'análise', 'laboratorio'])) {
      return { name: 'exam_inquiry', confidence: 0.8, entities: this.extractExamEntities(lowerTranscript) };
    }
    
    // Intenções relacionadas a pressão arterial
    if (this.containsKeywords(lowerTranscript, ['pressão', 'hipertensão', 'sistólica', 'diastólica'])) {
      return { name: 'blood_pressure_inquiry', confidence: 0.85, entities: {} };
    }
    
    // Intenções relacionadas a diabetes
    if (this.containsKeywords(lowerTranscript, ['diabetes', 'glicose', 'açúcar', 'glicemia', 'insulina'])) {
      return { name: 'diabetes_inquiry', confidence: 0.85, entities: {} };
    }
    
    // Intenções relacionadas a emergência
    if (this.containsKeywords(lowerTranscript, ['emergência', 'urgente', 'socorro', 'grave', 'sério'])) {
      return { name: 'emergency', confidence: 0.95, entities: {} };
    }
    
    // Intenções relacionadas a bem-estar emocional
    if (this.containsKeywords(lowerTranscript, ['triste', 'ansioso', 'deprimido', 'estressado', 'preocupado'])) {
      return { name: 'emotional_support', confidence: 0.8, entities: {} };
    }
    
    // Saudação
    if (this.containsKeywords(lowerTranscript, ['olá', 'oi', 'bom dia', 'boa tarde', 'boa noite', 'hey'])) {
      return { name: 'greeting', confidence: 0.9, entities: {} };
    }
    
    // Intenção padrão
    return { name: 'general_inquiry', confidence: 0.5, entities: {} };
  }

  // Verificar se o texto contém palavras-chave
  containsKeywords(text, keywords) {
    return keywords.some(keyword => text.includes(keyword));
  }

  // Extrair entidades relacionadas a dor
  extractPainEntities(text) {
    const entities = {};
    
    // Localização da dor
    const bodyParts = ['cabeça', 'pescoço', 'ombro', 'braço', 'peito', 'costas', 'barriga', 'perna', 'pé', 'joelho'];
    bodyParts.forEach(part => {
      if (text.includes(part)) {
        entities.location = part;
      }
    });
    
    // Intensidade da dor
    if (text.includes('muito') || text.includes('forte') || text.includes('intensa')) {
      entities.intensity = 'alta';
    } else if (text.includes('pouca') || text.includes('leve')) {
      entities.intensity = 'baixa';
    } else {
      entities.intensity = 'moderada';
    }
    
    return entities;
  }

  // Extrair entidades relacionadas a agendamento
  extractScheduleEntities(text) {
    const entities = {};
    
    // Especialidades
    const specialties = ['cardiologista', 'ortopedista', 'dermatologista', 'neurologista', 'pediatra'];
    specialties.forEach(specialty => {
      if (text.includes(specialty)) {
        entities.specialty = specialty;
      }
    });
    
    // Urgência
    if (text.includes('urgente') || text.includes('hoje') || text.includes('agora')) {
      entities.urgency = 'alta';
    }
    
    return entities;
  }

  // Extrair entidades relacionadas a medicamentos
  extractMedicationEntities(text) {
    const entities = {};
    
    // Nomes comuns de medicamentos
    const medications = ['losartana', 'metformina', 'omeprazol', 'sinvastatina', 'atenolol'];
    medications.forEach(med => {
      if (text.includes(med)) {
        entities.medication = med;
      }
    });
    
    return entities;
  }

  // Extrair entidades relacionadas a exames
  extractExamEntities(text) {
    const entities = {};
    
    // Tipos de exames
    const examTypes = ['sangue', 'urina', 'raio-x', 'ultrassom', 'ressonância', 'tomografia'];
    examTypes.forEach(exam => {
      if (text.includes(exam)) {
        entities.examType = exam;
      }
    });
    
    return entities;
  }

  // Obter dados do paciente
  async getPatientData(userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          profile: true,
          appointments: {
            orderBy: { scheduledFor: 'desc' },
            take: 5,
            include: { professional: true }
          },
          medicalRecords: {
            orderBy: { createdAt: 'desc' },
            take: 10
          }
        }
      });

      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        age: user.profile?.age || null,
        conditions: user.profile?.medicalConditions || [],
        medications: user.profile?.medications || [],
        allergies: user.profile?.allergies || [],
        lastConsultation: user.appointments[0]?.scheduledFor || null,
        nextAppointment: user.appointments.find(apt => new Date(apt.scheduledFor) > new Date())?.scheduledFor || null,
        recentRecords: user.medicalRecords
      };
    } catch (error) {
      console.error('Erro ao obter dados do paciente:', error);
      return null;
    }
  }

  // Gerar resposta baseada na intenção
  async generateResponse(intent, transcript, patientData, context) {
    const responses = {
      report_pain: await this.handlePainReport(intent, patientData),
      schedule_appointment: await this.handleScheduleAppointment(intent, patientData),
      medication_inquiry: await this.handleMedicationInquiry(intent, patientData),
      exam_inquiry: await this.handleExamInquiry(intent, patientData),
      blood_pressure_inquiry: await this.handleBloodPressureInquiry(patientData),
      diabetes_inquiry: await this.handleDiabetesInquiry(patientData),
      emergency: await this.handleEmergency(patientData),
      emotional_support: await this.handleEmotionalSupport(patientData),
      greeting: await this.handleGreeting(patientData),
      general_inquiry: await this.handleGeneralInquiry(transcript, patientData)
    };

    return responses[intent.name] || responses.general_inquiry;
  }

  // Manipular relato de dor
  async handlePainReport(intent, patientData) {
    const location = intent.entities.location || 'região afetada';
    const intensity = intent.entities.intensity || 'moderada';
    
    let response = `Entendo que você está sentindo dor ${intensity} na ${location}. `;
    
    // Sugerir profissional baseado na localização
    let suggestedSpecialty = 'clínico geral';
    if (['costas', 'joelho', 'ombro'].includes(location)) {
      suggestedSpecialty = 'ortopedista';
    } else if (location === 'cabeça') {
      suggestedSpecialty = 'neurologista';
    }
    
    response += `Recomendo uma consulta com um ${suggestedSpecialty}. `;
    response += `Posso agendar uma consulta para você hoje mesmo. `;
    response += `Enquanto isso, você pode aplicar gelo no local por 15 minutos e evitar movimentos bruscos.`;
    
    return {
      text: response,
      actions: ['suggest_appointment'],
      suggestions: ['Agendar consulta urgente', 'Dicas para alívio da dor', 'Falar com enfermeiro']
    };
  }

  // Manipular agendamento
  async handleScheduleAppointment(intent, patientData) {
    const specialty = intent.entities.specialty || 'clínico geral';
    const urgency = intent.entities.urgency || 'normal';
    
    let response = `Vou verificar os profissionais disponíveis para você. `;
    
    if (urgency === 'alta') {
      response += `Como é urgente, vou priorizar horários para hoje. `;
    }
    
    response += `Com base no seu perfil e histórico, encontrei estas opções: `;
    response += `Dr. Carlos Silva (Ortopedista) - disponível hoje às 14h30, `;
    response += `Dra. Ana Santos (Cardiologista) - disponível amanhã às 10h. `;
    response += `Qual horário prefere?`;
    
    return {
      text: response,
      actions: ['show_available_appointments'],
      suggestions: ['Hoje às 14h30', 'Amanhã às 10h', 'Ver mais horários']
    };
  }

  // Manipular consulta sobre medicamentos
  async handleMedicationInquiry(patientData) {
    let response = `Seus medicamentos atuais são: `;
    
    if (patientData && patientData.conditions.includes('Hipertensão')) {
      response += `Losartana 50mg (tomar às 8h e 20h), `;
    }
    
    if (patientData && patientData.conditions.includes('Diabetes Tipo 2')) {
      response += `Metformina 850mg (tomar no almoço e jantar). `;
    }
    
    response += `Última dose registrada: Losartana às 8h de hoje. `;
    response += `Precisa de lembretes automáticos ou tem alguma dúvida sobre os medicamentos?`;
    
    return {
      text: response,
      actions: ['show_medication_schedule'],
      suggestions: ['Configurar lembretes', 'Efeitos colaterais', 'Interações medicamentosas']
    };
  }

  // Manipular consulta sobre exames
  async handleExamInquiry(patientData) {
    let response = `Seus últimos exames mostram: `;
    response += `Glicemia em jejum: 95mg/dL (normal), `;
    response += `Hemoglobina glicada: 6.8% (controlada), `;
    response += `Colesterol total: 180mg/dL (adequado). `;
    response += `O próximo check-up está agendado para ${patientData?.nextAppointment || '15/02/2024'}. `;
    response += `Gostaria que eu explique algum resultado específico?`;
    
    return {
      text: response,
      actions: ['show_exam_results'],
      suggestions: ['Explicar glicemia', 'Agendar novos exames', 'Histórico completo']
    };
  }

  // Manipular consulta sobre pressão arterial
  async handleBloodPressureInquiry(patientData) {
    let response = `Sua pressão arterial atual está em 120/80 mmHg, `;
    response += `que está dentro do esperado para seu tratamento de hipertensão. `;
    response += `Lembre-se de tomar a Losartana às 8h e 20h todos os dias. `;
    response += `Sua próxima consulta com a cardiologista é em ${patientData?.nextAppointment || '10/02/2024'}. `;
    response += `Precisa de algum ajuste no tratamento ou tem alguma preocupação?`;
    
    return {
      text: response,
      actions: ['show_bp_trends'],
      suggestions: ['Ver histórico de pressão', 'Dicas para controle', 'Agendar consulta']
    };
  }

  // Manipular consulta sobre diabetes
  async handleDiabetesInquiry(patientData) {
    let response = `Seu controle de diabetes está bom. `;
    response += `Glicemia atual: 95mg/dL (meta: 80-130mg/dL). `;
    response += `Hemoglobina glicada: 6.8% (meta: abaixo de 7%). `;
    response += `Continue tomando a Metformina conforme prescrito. `;
    response += `Lembre-se de manter a dieta equilibrada e exercitar-se regularmente. `;
    response += `Precisa de orientações sobre alimentação ou exercícios?`;
    
    return {
      text: response,
      actions: ['show_diabetes_management'],
      suggestions: ['Plano alimentar', 'Exercícios recomendados', 'Monitoramento glicêmico']
    };
  }

  // Manipular emergência
  async handleEmergency(patientData) {
    let response = `Esta é uma situação de emergência. `;
    response += `Estou acionando o protocolo de urgência. `;
    response += `Se você está em perigo imediato, ligue 192 (SAMU) ou vá ao pronto-socorro mais próximo. `;
    response += `Estou notificando sua equipe médica e enviando sua localização para os serviços de emergência. `;
    response += `Mantenha-se calmo e siga as instruções que vou fornecer.`;
    
    return {
      text: response,
      actions: ['trigger_emergency_protocol', 'notify_emergency_contacts'],
      suggestions: ['Ligar 192', 'Localizar hospital', 'Contatar familiar']
    };
  }

  // Manipular suporte emocional
  async handleEmotionalSupport(patientData) {
    let response = `Percebo que você pode estar passando por um momento difícil. `;
    response += `É importante cuidar da sua saúde mental também. `;
    response += `Vamos fazer alguns exercícios de respiração juntos? `;
    response += `Inspire profundamente por 4 segundos, segure por 4, expire por 6. `;
    response += `Também posso conectá-lo com um psicólogo ou terapeuta se desejar. `;
    response += `Lembre-se: você não está sozinho nessa jornada.`;
    
    return {
      text: response,
      actions: ['start_breathing_exercise', 'suggest_mental_health_support'],
      suggestions: ['Exercícios de relaxamento', 'Falar com psicólogo', 'Técnicas de mindfulness']
    };
  }

  // Manipular saudação
  async handleGreeting(patientData) {
    const name = patientData?.name || 'paciente';
    const timeOfDay = this.getTimeOfDay();
    
    let response = `${timeOfDay}, ${name}! `;
    response += `Sou seu Agente de Saúde Pessoal. `;
    response += `Estou aqui para ajudar com agendamentos, monitoramento de saúde, `;
    response += `lembretes de medicação e responder suas dúvidas médicas. `;
    response += `Como posso ajudá-lo hoje?`;
    
    return {
      text: response,
      actions: ['show_health_summary'],
      suggestions: ['Ver resumo de saúde', 'Agendar consulta', 'Lembretes de medicação']
    };
  }

  // Manipular consulta geral
  async handleGeneralInquiry(transcript, patientData) {
    let response = `Entendi sua pergunta. `;
    response += `Como seu assistente de saúde, posso ajudar com várias questões: `;
    response += `agendamento de consultas, informações sobre medicamentos, `;
    response += `resultados de exames, monitoramento de condições crônicas, `;
    response += `e orientações gerais de saúde. `;
    response += `Sobre o que especificamente você gostaria de saber?`;
    
    return {
      text: response,
      actions: ['show_capabilities'],
      suggestions: ['Agendar consulta', 'Medicamentos', 'Resultados de exames', 'Emergência']
    };
  }

  // Obter período do dia
  getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  }

  // Obter contexto da conversa
  getConversationContext(sessionId) {
    return this.conversationContexts.get(sessionId) || {
      messages: [],
      currentTopic: null,
      userPreferences: {},
      lastIntent: null
    };
  }

  // Atualizar contexto da conversa
  updateConversationContext(sessionId, userInput, assistantResponse, intent) {
    const context = this.getConversationContext(sessionId);
    
    context.messages.push(
      { role: 'user', content: userInput, timestamp: new Date() },
      { role: 'assistant', content: assistantResponse, timestamp: new Date() }
    );
    
    context.currentTopic = intent.name;
    context.lastIntent = intent;
    
    // Manter apenas as últimas 20 mensagens para não sobrecarregar a memória
    if (context.messages.length > 20) {
      context.messages = context.messages.slice(-20);
    }
    
    this.conversationContexts.set(sessionId, context);
  }

  // Salvar interação no banco de dados
  async saveInteraction(userId, userInput, assistantResponse, sessionId) {
    try {
      await prisma.voiceInteraction.create({
        data: {
          userId,
          sessionId,
          userInput,
          assistantResponse,
          timestamp: new Date()
        }
      });
    } catch (error) {
      console.error('Erro ao salvar interação:', error);
    }
  }

  // Executar ações
  async executeActions(userId, actions) {
    for (const action of actions) {
      try {
        switch (action) {
          case 'suggest_appointment':
            await this.suggestAppointment(userId);
            break;
          case 'show_available_appointments':
            await this.showAvailableAppointments(userId);
            break;
          case 'show_medication_schedule':
            await this.showMedicationSchedule(userId);
            break;
          case 'show_exam_results':
            await this.showExamResults(userId);
            break;
          case 'trigger_emergency_protocol':
            await this.triggerEmergencyProtocol(userId);
            break;
          case 'notify_emergency_contacts':
            await this.notifyEmergencyContacts(userId);
            break;
          default:
            console.log(`Ação não implementada: ${action}`);
        }
      } catch (error) {
        console.error(`Erro ao executar ação ${action}:`, error);
      }
    }
  }

  // Sugerir agendamento
  async suggestAppointment(userId) {
    // Implementar lógica para sugerir agendamento
    console.log(`Sugerindo agendamento para usuário ${userId}`);
  }

  // Mostrar agendamentos disponíveis
  async showAvailableAppointments(userId) {
    // Implementar lógica para mostrar agendamentos disponíveis
    console.log(`Mostrando agendamentos disponíveis para usuário ${userId}`);
  }

  // Mostrar cronograma de medicamentos
  async showMedicationSchedule(userId) {
    // Implementar lógica para mostrar cronograma de medicamentos
    console.log(`Mostrando cronograma de medicamentos para usuário ${userId}`);
  }

  // Mostrar resultados de exames
  async showExamResults(userId) {
    // Implementar lógica para mostrar resultados de exames
    console.log(`Mostrando resultados de exames para usuário ${userId}`);
  }

  // Acionar protocolo de emergência
  async triggerEmergencyProtocol(userId) {
    // Implementar lógica para acionar protocolo de emergência
    console.log(`Acionando protocolo de emergência para usuário ${userId}`);
  }

  // Notificar contatos de emergência
  async notifyEmergencyContacts(userId) {
    // Implementar lógica para notificar contatos de emergência
    console.log(`Notificando contatos de emergência para usuário ${userId}`);
  }

  // Obter histórico de conversas
  async getConversationHistory(userId, sessionId, limit = 50) {
    try {
      const interactions = await prisma.voiceInteraction.findMany({
        where: {
          userId,
          sessionId
        },
        orderBy: { timestamp: 'desc' },
        take: limit
      });

      return interactions.reverse(); // Retornar em ordem cronológica
    } catch (error) {
      console.error('Erro ao obter histórico de conversas:', error);
      return [];
    }
  }

  // Limpar contexto de conversa
  clearConversationContext(sessionId) {
    this.conversationContexts.delete(sessionId);
  }

  // Obter estatísticas de uso
  async getUsageStats(userId) {
    try {
      const stats = await prisma.voiceInteraction.groupBy({
        by: ['userId'],
        where: { userId },
        _count: {
          id: true
        },
        _min: {
          timestamp: true
        },
        _max: {
          timestamp: true
        }
      });

      return stats[0] || null;
    } catch (error) {
      console.error('Erro ao obter estatísticas de uso:', error);
      return null;
    }
  }
}

module.exports = new VoiceAgentService();

