import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Heart, 
  Activity, 
  MessageCircle, 
  Calendar,
  User,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  Stethoscope
} from 'lucide-react';

const VoiceAgent = () => {
  // Estados principais
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [conversationHistory, setConversationHistory] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);

  // Estados para funcionalidades avançadas
  const [patientData, setPatientData] = useState({
    name: 'João Silva',
    age: 35,
    conditions: ['Hipertensão', 'Diabetes Tipo 2'],
    lastConsultation: '2024-01-15',
    nextAppointment: '2024-02-10'
  });

  const [healthMetrics, setHealthMetrics] = useState({
    heartRate: 72,
    bloodPressure: '120/80',
    bloodSugar: 95,
    lastUpdated: new Date().toLocaleTimeString()
  });

  // Refs
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationRef = useRef(null);

  // Inicialização do Web Speech API
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'pt-BR';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setError(null);
        setIsConnected(true);
      };

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(finalTranscript || interimTranscript);

        if (finalTranscript) {
          handleUserInput(finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        setError(`Erro no reconhecimento de voz: ${event.error}`);
        setIsListening(false);
        setIsConnected(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    } else {
      setError('Reconhecimento de voz não suportado neste navegador');
    }

    // Inicialização do Speech Synthesis
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // Função para iniciar/parar a escuta
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
    }
  };

  // Função para processar entrada do usuário
  const handleUserInput = async (input) => {
    setIsProcessing(true);
    setTranscript('');

    // Adicionar mensagem do usuário ao histórico
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString()
    };

    setConversationHistory(prev => [...prev, userMessage]);

    try {
      // Simular processamento de IA (aqui seria a integração com o backend)
      const aiResponse = await processWithAI(input);
      
      const assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: aiResponse,
        timestamp: new Date().toLocaleTimeString()
      };

      setConversationHistory(prev => [...prev, assistantMessage]);
      setResponse(aiResponse);
      
      // Falar a resposta
      if (!isMuted) {
        speakResponse(aiResponse);
      }
    } catch (error) {
      setError('Erro ao processar sua solicitação');
    } finally {
      setIsProcessing(false);
    }
  };

  // Função para processar com IA (simulada)
  const processWithAI = async (input) => {
    // Simular delay de processamento
    await new Promise(resolve => setTimeout(resolve, 1500));

    const lowerInput = input.toLowerCase();

    // Respostas contextuais baseadas no input
    if (lowerInput.includes('dor') || lowerInput.includes('doendo')) {
      return `Entendo que você está sentindo dor. Com base no seu histórico, vou agendar uma consulta com o Dr. Carlos (Ortopedista) para hoje às 15h. Enquanto isso, você pode aplicar gelo no local por 15 minutos. Gostaria que eu envie lembretes sobre medicação?`;
    }
    
    if (lowerInput.includes('pressão') || lowerInput.includes('hipertensão')) {
      return `Vejo que sua pressão atual está em ${healthMetrics.bloodPressure}. Isso está dentro do esperado para seu tratamento. Lembre-se de tomar o medicamento às 8h e 20h. Sua próxima consulta com a Dra. Ana (Cardiologista) é em ${patientData.nextAppointment}. Precisa de algum ajuste?`;
    }

    if (lowerInput.includes('agendar') || lowerInput.includes('consulta')) {
      return `Claro! Vou verificar os profissionais disponíveis para você. Com base no seu perfil, recomendo: Dr. Carlos (Ortopedista) - disponível hoje às 14h, Dra. Ana (Cardiologista) - disponível amanhã às 10h. Qual você prefere?`;
    }

    if (lowerInput.includes('medicamento') || lowerInput.includes('remédio')) {
      return `Seus medicamentos atuais são: Losartana 50mg (8h e 20h) e Metformina 850mg (almoço e jantar). Última dose registrada: Losartana às 8h. Precisa de lembretes ou tem alguma dúvida sobre os medicamentos?`;
    }

    if (lowerInput.includes('exame') || lowerInput.includes('resultado')) {
      return `Seus últimos exames mostram: Glicemia em jejum: 95mg/dL (normal), Hemoglobina glicada: 6.8% (controlada). O próximo check-up está agendado para ${patientData.nextAppointment}. Gostaria que eu explique algum resultado?`;
    }

    // Resposta padrão
    return `Olá ${patientData.name}! Sou seu Agente de Saúde Pessoal. Posso ajudar com agendamentos, monitoramento de saúde, lembretes de medicação e responder suas dúvidas médicas. Como posso ajudá-lo hoje?`;
  };

  // Função para falar a resposta
  const speakResponse = (text) => {
    if (synthRef.current && !isMuted) {
      synthRef.current.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.volume = volume;
      utterance.rate = 0.9;
      utterance.pitch = 1;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      synthRef.current.speak(utterance);
    }
  };

  // Função para parar a fala
  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  // Função para limpar conversa
  const clearConversation = () => {
    setConversationHistory([]);
    setTranscript('');
    setResponse('');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Stethoscope className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Agente de Saúde Pessoal por Voz
                </h1>
                <p className="text-gray-600">
                  Seu assistente de saúde inteligente 24/7
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
                isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <span className="text-sm font-medium">
                  {isConnected ? 'Conectado' : 'Desconectado'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Painel Principal de Voz */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              {/* Controles de Voz */}
              <div className="text-center mb-8">
                <div className="relative inline-block">
                  <button
                    onClick={toggleListening}
                    disabled={isProcessing}
                    className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isListening 
                        ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200' 
                        : 'bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-200'
                    } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isProcessing ? (
                      <Loader2 className="w-10 h-10 text-white animate-spin" />
                    ) : isListening ? (
                      <MicOff className="w-10 h-10 text-white" />
                    ) : (
                      <Mic className="w-10 h-10 text-white" />
                    )}
                  </button>
                  
                  {isListening && (
                    <div className="absolute inset-0 rounded-full border-4 border-red-300 animate-ping" />
                  )}
                </div>
                
                <p className="mt-4 text-lg font-medium text-gray-700">
                  {isProcessing 
                    ? 'Processando...' 
                    : isListening 
                      ? 'Escutando... Fale agora' 
                      : 'Clique para falar'
                  }
                </p>
                
                {transcript && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-blue-800 font-medium">Você disse:</p>
                    <p className="text-blue-600">{transcript}</p>
                  </div>
                )}
              </div>

              {/* Controles de Áudio */}
              <div className="flex items-center justify-center space-x-4 mb-6">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-3 rounded-full transition-colors ${
                    isMuted ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                
                <div className="flex items-center space-x-2">
                  <Volume2 className="w-4 h-4 text-gray-500" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-20"
                  />
                </div>
                
                {isSpeaking && (
                  <button
                    onClick={stopSpeaking}
                    className="p-3 bg-orange-100 text-orange-600 rounded-full"
                  >
                    <Pause className="w-5 h-5" />
                  </button>
                )}
                
                <button
                  onClick={clearConversation}
                  className="p-3 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              </div>

              {/* Histórico de Conversa */}
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {conversationHistory.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                        message.type === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {message.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Erro */}
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <p className="text-red-700">{error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Painel Lateral - Informações do Paciente */}
          <div className="space-y-6">
            {/* Dados do Paciente */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <User className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-800">Perfil do Paciente</h3>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Nome</p>
                  <p className="font-medium text-gray-800">{patientData.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Idade</p>
                  <p className="font-medium text-gray-800">{patientData.age} anos</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Condições</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {patientData.conditions.map((condition, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full"
                      >
                        {condition}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Métricas de Saúde */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Activity className="w-6 h-6 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-800">Métricas Atuais</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Heart className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-gray-600">Frequência Cardíaca</span>
                  </div>
                  <span className="font-semibold text-gray-800">{healthMetrics.heartRate} bpm</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-gray-600">Pressão Arterial</span>
                  </div>
                  <span className="font-semibold text-gray-800">{healthMetrics.bloodPressure}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded-full" />
                    <span className="text-sm text-gray-600">Glicemia</span>
                  </div>
                  <span className="font-semibold text-gray-800">{healthMetrics.bloodSugar} mg/dL</span>
                </div>
                
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>Atualizado às {healthMetrics.lastUpdated}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Próximos Compromissos */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Calendar className="w-6 h-6 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-800">Próximos Compromissos</h3>
              </div>
              
              <div className="space-y-3">
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="font-medium text-purple-800">Consulta Cardiologia</p>
                  <p className="text-sm text-purple-600">Dra. Ana Silva</p>
                  <p className="text-xs text-purple-500">{patientData.nextAppointment} às 10:00</p>
                </div>
                
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="font-medium text-blue-800">Exames de Rotina</p>
                  <p className="text-sm text-blue-600">Laboratório Central</p>
                  <p className="text-xs text-blue-500">15/02/2024 às 08:00</p>
                </div>
              </div>
            </div>

            {/* Ações Rápidas */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Ações Rápidas</h3>
              
              <div className="space-y-2">
                <button className="w-full p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <span className="text-blue-800 font-medium">Agendar Consulta</span>
                  </div>
                </button>
                
                <button className="w-full p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3">
                    <MessageCircle className="w-5 h-5 text-green-600" />
                    <span className="text-green-800 font-medium">Chat com Profissional</span>
                  </div>
                </button>
                
                <button className="w-full p-3 text-left bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3">
                    <Settings className="w-5 h-5 text-orange-600" />
                    <span className="text-orange-800 font-medium">Configurações</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceAgent;

