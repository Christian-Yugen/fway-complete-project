import React, { useState, useEffect, useRef } from 'react';
import { 
  Brain,
  Send,
  Mic,
  MicOff,
  Bot,
  User,
  AlertTriangle,
  CheckCircle,
  Clock,
  Heart,
  Activity,
  Stethoscope,
  FileText,
  Calendar,
  MapPin,
  Star,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Share,
  MoreVertical,
  Loader,
  Zap,
  Target,
  Info,
  Lightbulb,
  TrendingUp
} from 'lucide-react';

const MedicalChatInterface = ({ 
  userId,
  initialContext = {},
  onRecommendation,
  onTriageRequest,
  onAppointmentRequest 
}) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [contextualSuggestions, setContextualSuggestions] = useState([]);
  const [medicalContext, setMedicalContext] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    initializeChat();
    loadMedicalContext();
  }, [userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeChat = () => {
    const newSessionId = `session_${Date.now()}_${userId}`;
    setSessionId(newSessionId);
    
    // Mensagem de boas-vindas personalizada
    const welcomeMessage = {
      id: Date.now(),
      type: 'ai',
      content: 'Olá! Sou sua assistente de IA médica do FWAY Brain. Estou aqui para ajudá-lo com questões de saúde, triagem de sintomas, recomendações de profissionais e muito mais. Como posso ajudá-lo hoje?',
      timestamp: new Date(),
      confidence: 1.0,
      intent: 'WELCOME',
      suggestions: [
        'Relatar sintomas',
        'Agendar consulta',
        'Buscar especialista',
        'Verificar medicamentos'
      ]
    };
    
    setMessages([welcomeMessage]);
  };

  const loadMedicalContext = async () => {
    try {
      const response = await fetch(`/api/brain/medical-context/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMedicalContext(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar contexto médico:', error);
      // Usar dados mock para desenvolvimento
      setMedicalContext({
        allergies: ['penicilina'],
        chronicConditions: ['hipertensão'],
        currentMedications: ['losartana 50mg'],
        recentTriages: [],
        riskScore: 72
      });
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/brain/intelligent-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          message: userMessage.content,
          sessionId,
          context: {
            ...initialContext,
            medical: medicalContext
          }
        })
      });

      if (!response.ok) {
        throw new Error('Erro na comunicação com a IA');
      }

      const data = await response.json();
      
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: data.data.response,
        timestamp: new Date(),
        confidence: data.data.confidence,
        intent: data.data.intent,
        entities: data.data.entities,
        medicalRelevance: data.data.medicalRelevance,
        suggestions: data.data.suggestions,
        followUpQuestions: data.data.followUpQuestions
      };

      setMessages(prev => [...prev, aiMessage]);
      setContextualSuggestions(data.data.suggestions || []);
      
      // Processar ações baseadas na intenção
      handleAIIntent(data.data);
      
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      
      // Fallback com resposta simulada
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: 'Desculpe, houve um problema temporário. Posso ajudá-lo de outra forma?',
        timestamp: new Date(),
        confidence: 0.5,
        intent: 'ERROR',
        suggestions: ['Tentar novamente', 'Falar com atendente', 'Agendar consulta']
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleAIIntent = (aiResponse) => {
    switch (aiResponse.intent) {
      case 'SYMPTOM_INQUIRY':
        if (aiResponse.medicalRelevance > 0.7) {
          setAiInsights({
            type: 'TRIAGE_SUGGESTION',
            title: 'Triagem Recomendada',
            message: 'Baseado nos sintomas relatados, recomendo fazer uma triagem completa.',
            action: () => onTriageRequest && onTriageRequest(aiResponse.entities)
          });
        }
        break;
        
      case 'APPOINTMENT_REQUEST':
        setAiInsights({
          type: 'APPOINTMENT_SUGGESTION',
          title: 'Agendamento Disponível',
          message: 'Posso ajudá-lo a encontrar e agendar com o melhor profissional.',
          action: () => onAppointmentRequest && onAppointmentRequest(aiResponse.entities)
        });
        break;
        
      case 'EMERGENCY_INQUIRY':
        setAiInsights({
          type: 'EMERGENCY_ALERT',
          title: 'Situação de Emergência',
          message: 'Identifiquei uma possível emergência. Recomendo atendimento imediato.',
          action: () => window.open('tel:192', '_self')
        });
        break;
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion);
    inputRef.current?.focus();
  };

  const handleVoiceInput = () => {
    if (!isRecording) {
      // Iniciar gravação
      setIsRecording(true);
      // Implementar reconhecimento de voz aqui
      setTimeout(() => {
        setIsRecording(false);
        // Simular resultado de voz
        setInputMessage('Estou sentindo dor de cabeça há 2 dias');
      }, 3000);
    } else {
      // Parar gravação
      setIsRecording(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getIntentIcon = (intent) => {
    const icons = {
      'SYMPTOM_INQUIRY': Stethoscope,
      'APPOINTMENT_REQUEST': Calendar,
      'MEDICATION_QUESTION': FileText,
      'EMERGENCY_INQUIRY': AlertTriangle,
      'PREVENTION_INQUIRY': Heart,
      'WELCOME': Bot
    };
    return icons[intent] || Bot;
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const renderMessage = (message) => {
    const isUser = message.type === 'user';
    const IntentIcon = getIntentIcon(message.intent);

    return (
      <div key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`max-w-3xl ${isUser ? 'order-2' : 'order-1'}`}>
          <div className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
            {/* Avatar */}
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
              isUser ? 'bg-blue-600' : 'bg-purple-600'
            }`}>
              {isUser ? (
                <User className="h-5 w-5 text-white" />
              ) : (
                <Brain className="h-5 w-5 text-white" />
              )}
            </div>

            {/* Message Content */}
            <div className={`flex-1 ${isUser ? 'text-right' : 'text-left'}`}>
              <div className={`inline-block p-4 rounded-lg ${
                isUser 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-800 border border-gray-200'
              }`}>
                {/* Intent and Confidence (for AI messages) */}
                {!isUser && message.intent && (
                  <div className="flex items-center space-x-2 mb-2 text-xs text-gray-500">
                    <IntentIcon className="h-3 w-3" />
                    <span>{message.intent.replace('_', ' ').toLowerCase()}</span>
                    {message.confidence && (
                      <span className={`font-medium ${getConfidenceColor(message.confidence)}`}>
                        ({Math.round(message.confidence * 100)}%)
                      </span>
                    )}
                  </div>
                )}

                <p className="text-sm leading-relaxed">{message.content}</p>

                {/* Medical Relevance Indicator */}
                {!isUser && message.medicalRelevance > 0.5 && (
                  <div className="mt-2 flex items-center space-x-1 text-xs">
                    <Activity className="h-3 w-3 text-red-500" />
                    <span className="text-red-600">
                      Relevância médica: {Math.round(message.medicalRelevance * 100)}%
                    </span>
                  </div>
                )}

                {/* Entities (for AI messages) */}
                {!isUser && message.entities && message.entities.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {message.entities.map((entity, index) => (
                      <span 
                        key={index}
                        className={`text-xs px-2 py-1 rounded-full ${
                          entity.type === 'SYMPTOM' ? 'bg-red-100 text-red-700' :
                          entity.type === 'SPECIALTY' ? 'bg-blue-100 text-blue-700' :
                          entity.type === 'MEDICATION' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {entity.value}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Timestamp */}
              <div className={`text-xs text-gray-500 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
                {formatTimestamp(message.timestamp)}
              </div>

              {/* Suggestions (for AI messages) */}
              {!isUser && message.suggestions && message.suggestions.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {message.suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="text-xs bg-white border border-gray-300 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-50 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}

              {/* Follow-up Questions */}
              {!isUser && message.followUpQuestions && message.followUpQuestions.length > 0 && (
                <div className="mt-3 space-y-1">
                  <p className="text-xs text-gray-600 font-medium">Perguntas de acompanhamento:</p>
                  {message.followUpQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(question)}
                      className="block text-xs text-blue-600 hover:text-blue-700 hover:underline text-left"
                    >
                      • {question}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Brain className="h-6 w-6" />
            <div>
              <h3 className="font-semibold">FWAY Brain</h3>
              <p className="text-sm text-purple-100">Assistente de IA Médica</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {medicalContext && (
              <div className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded-full">
                Score: {medicalContext.riskScore}
              </div>
            )}
            <button className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors">
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* AI Insights Banner */}
      {aiInsights && (
        <div className={`p-3 border-b ${
          aiInsights.type === 'EMERGENCY_ALERT' ? 'bg-red-50 border-red-200' :
          aiInsights.type === 'TRIAGE_SUGGESTION' ? 'bg-yellow-50 border-yellow-200' :
          'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {aiInsights.type === 'EMERGENCY_ALERT' && <AlertTriangle className="h-4 w-4 text-red-600" />}
              {aiInsights.type === 'TRIAGE_SUGGESTION' && <Target className="h-4 w-4 text-yellow-600" />}
              {aiInsights.type === 'APPOINTMENT_SUGGESTION' && <Calendar className="h-4 w-4 text-blue-600" />}
              <div>
                <p className={`text-sm font-medium ${
                  aiInsights.type === 'EMERGENCY_ALERT' ? 'text-red-800' :
                  aiInsights.type === 'TRIAGE_SUGGESTION' ? 'text-yellow-800' :
                  'text-blue-800'
                }`}>
                  {aiInsights.title}
                </p>
                <p className={`text-xs ${
                  aiInsights.type === 'EMERGENCY_ALERT' ? 'text-red-600' :
                  aiInsights.type === 'TRIAGE_SUGGESTION' ? 'text-yellow-600' :
                  'text-blue-600'
                }`}>
                  {aiInsights.message}
                </p>
              </div>
            </div>
            
            <button
              onClick={aiInsights.action}
              className={`text-xs px-3 py-1 rounded-full font-medium ${
                aiInsights.type === 'EMERGENCY_ALERT' ? 'bg-red-600 text-white hover:bg-red-700' :
                aiInsights.type === 'TRIAGE_SUGGESTION' ? 'bg-yellow-600 text-white hover:bg-yellow-700' :
                'bg-blue-600 text-white hover:bg-blue-700'
              } transition-colors`}
            >
              {aiInsights.type === 'EMERGENCY_ALERT' ? 'Chamar SAMU' :
               aiInsights.type === 'TRIAGE_SUGGESTION' ? 'Fazer Triagem' :
               'Agendar'}
            </button>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(renderMessage)}
        
        {isTyping && (
          <div className="flex justify-start mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div className="bg-gray-100 rounded-lg p-3 border border-gray-200">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Contextual Suggestions */}
      {contextualSuggestions.length > 0 && (
        <div className="border-t border-gray-200 p-3">
          <p className="text-xs text-gray-600 mb-2">Sugestões:</p>
          <div className="flex flex-wrap gap-2">
            {contextualSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-200 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Digite sua pergunta sobre saúde..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-12 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            
            <button
              onClick={handleVoiceInput}
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full transition-colors ${
                isRecording 
                  ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
            >
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>
          </div>
          
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <span>Pressione Enter para enviar</span>
          {sessionId && (
            <span>Sessão: {sessionId.slice(-8)}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicalChatInterface;

