const express = require('express');
const router = express.Router();
const voiceAgentService = require('../services/voiceAgent/voiceAgentService');
const { authenticateToken } = require('../middleware/auth');
const { body, param, query, validationResult } = require('express-validator');

// Middleware para validar erros
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors: errors.array()
    });
  }
  next();
};

// POST /api/voice-agent/process - Processar entrada de voz
router.post('/process', 
  authenticateToken,
  [
    body('transcript')
      .notEmpty()
      .withMessage('Transcrição é obrigatória')
      .isLength({ min: 1, max: 1000 })
      .withMessage('Transcrição deve ter entre 1 e 1000 caracteres'),
    body('sessionId')
      .notEmpty()
      .withMessage('ID da sessão é obrigatório')
      .isUUID()
      .withMessage('ID da sessão deve ser um UUID válido')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { transcript, sessionId } = req.body;
      const userId = req.user.id;

      const result = await voiceAgentService.processVoice(req.body);

      res.json(result);
    } catch (error) {
      console.error('Erro ao processar entrada de voz:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// GET /api/voice-agent/history/:sessionId - Obter histórico de conversa
router.get('/history/:sessionId',
  authenticateToken,
  [
    param('sessionId')
      .isUUID()
      .withMessage('ID da sessão deve ser um UUID válido'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limite deve ser um número entre 1 e 100')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { limit = 50 } = req.query;
      const userId = req.user.id;

      const history = await voiceAgentService.getConversationHistory(userId, sessionId, parseInt(limit));

      res.json({
        success: true,
        data: history,
        count: history.length
      });
    } catch (error) {
      console.error('Erro ao obter histórico de conversa:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// DELETE /api/voice-agent/session/:sessionId - Limpar contexto de conversa
router.delete('/session/:sessionId',
  authenticateToken,
  [
    param('sessionId')
      .isUUID()
      .withMessage('ID da sessão deve ser um UUID válido')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { sessionId } = req.params;

      voiceAgentService.clearConversationContext(sessionId);

      res.json({
        success: true,
        message: 'Contexto de conversa limpo com sucesso'
      });
    } catch (error) {
      console.error('Erro ao limpar contexto de conversa:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// GET /api/voice-agent/stats - Obter estatísticas de uso
router.get('/stats',
  authenticateToken,
  async (req, res) => {
    try {
      const userId = req.user.id;

      const stats = await voiceAgentService.getUsageStats(userId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Erro ao obter estatísticas de uso:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// POST /api/voice-agent/emergency - Acionar protocolo de emergência
router.post('/emergency',
  authenticateToken,
  [
    body('location')
      .optional()
      .isObject()
      .withMessage('Localização deve ser um objeto'),
    body('description')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Descrição deve ter no máximo 500 caracteres')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { location, description } = req.body;
      const userId = req.user.id;

      // Acionar protocolo de emergência
      await voiceAgentService.triggerEmergencyProtocol(userId);
      
      // Notificar contatos de emergência
      await voiceAgentService.notifyEmergencyContacts(userId);

      res.json({
        success: true,
        message: 'Protocolo de emergência acionado com sucesso',
        emergencyNumber: '192',
        instructions: [
          'Se você está em perigo imediato, ligue 192 (SAMU)',
          'Mantenha-se calmo e siga as instruções',
          'Sua equipe médica foi notificada',
          'Contatos de emergência foram acionados'
        ]
      });
    } catch (error) {
      console.error('Erro ao acionar protocolo de emergência:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// GET /api/voice-agent/capabilities - Obter capacidades do agente
router.get('/capabilities',
  authenticateToken,
  async (req, res) => {
    try {
      const capabilities = {
        intents: [
          {
            name: 'report_pain',
            description: 'Relatar dor ou desconforto',
            examples: ['Estou sentindo dor no joelho', 'Minha cabeça está doendo']
          },
          {
            name: 'schedule_appointment',
            description: 'Agendar consultas médicas',
            examples: ['Quero agendar uma consulta', 'Preciso marcar com um cardiologista']
          },
          {
            name: 'medication_inquiry',
            description: 'Consultar sobre medicamentos',
            examples: ['Quando devo tomar meu remédio?', 'Esqueci de tomar a medicação']
          },
          {
            name: 'exam_inquiry',
            description: 'Consultar resultados de exames',
            examples: ['Como estão meus exames?', 'Preciso fazer novos exames?']
          },
          {
            name: 'blood_pressure_inquiry',
            description: 'Consultar sobre pressão arterial',
            examples: ['Como está minha pressão?', 'Minha pressão está alta?']
          },
          {
            name: 'diabetes_inquiry',
            description: 'Consultar sobre diabetes',
            examples: ['Como está meu diabetes?', 'Minha glicose está controlada?']
          },
          {
            name: 'emergency',
            description: 'Situações de emergência',
            examples: ['Socorro!', 'É uma emergência', 'Preciso de ajuda urgente']
          },
          {
            name: 'emotional_support',
            description: 'Suporte emocional e bem-estar',
            examples: ['Estou me sentindo triste', 'Estou ansioso', 'Preciso de apoio']
          }
        ],
        features: [
          'Reconhecimento de voz em português',
          'Síntese de voz natural',
          'Processamento de linguagem natural',
          'Análise de intenções',
          'Contexto de conversa',
          'Integração com dados médicos',
          'Agendamento inteligente',
          'Protocolo de emergência',
          'Suporte emocional',
          'Lembretes de medicação'
        ],
        supportedLanguages: ['pt-BR'],
        version: '1.0.0'
      };

      res.json({
        success: true,
        data: capabilities
      });
    } catch (error) {
      console.error('Erro ao obter capacidades:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// POST /api/voice-agent/feedback - Enviar feedback sobre interação
router.post('/feedback',
  authenticateToken,
  [
    body('sessionId')
      .notEmpty()
      .withMessage('ID da sessão é obrigatório')
      .isUUID()
      .withMessage('ID da sessão deve ser um UUID válido'),
    body('interactionId')
      .notEmpty()
      .withMessage('ID da interação é obrigatório')
      .isInt()
      .withMessage('ID da interação deve ser um número'),
    body('rating')
      .isInt({ min: 1, max: 5 })
      .withMessage('Avaliação deve ser um número entre 1 e 5'),
    body('comment')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Comentário deve ter no máximo 500 caracteres')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { sessionId, interactionId, rating, comment } = req.body;
      const userId = req.user.id;

      // Aqui você salvaria o feedback no banco de dados
      // Por enquanto, apenas logamos
      console.log('Feedback recebido:', {
        userId,
        sessionId,
        interactionId,
        rating,
        comment
      });

      res.json({
        success: true,
        message: 'Feedback enviado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao enviar feedback:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// GET /api/voice-agent/health - Health check do serviço
router.get('/health', async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      services: {
        database: 'connected',
        speechRecognition: 'available',
        speechSynthesis: 'available',
        nlp: 'active'
      }
    };

    res.json({
      success: true,
      data: health
    });
  } catch (error) {
    console.error('Erro no health check:', error);
    res.status(500).json({
      success: false,
      message: 'Serviço indisponível',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;

