import api from './api';

class VoiceAgentService {
  constructor() {
    this.baseURL = '/api/voice-agent';
  }

  // Processar entrada de voz
  async processVoiceInput(transcript, sessionId) {
    try {
      const response = await api.post(`${this.baseURL}/process`, {
        transcript,
        sessionId
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao processar entrada de voz:', error);
      throw this.handleError(error);
    }
  }

  // Obter histórico de conversa
  async getConversationHistory(sessionId, limit = 50) {
    try {
      const response = await api.get(`${this.baseURL}/history/${sessionId}`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao obter histórico de conversa:', error);
      throw this.handleError(error);
    }
  }

  // Limpar contexto de conversa
  async clearConversationContext(sessionId) {
    try {
      const response = await api.delete(`${this.baseURL}/session/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao limpar contexto de conversa:', error);
      throw this.handleError(error);
    }
  }

  // Obter estatísticas de uso
  async getUsageStats() {
    try {
      const response = await api.get(`${this.baseURL}/stats`);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter estatísticas de uso:', error);
      throw this.handleError(error);
    }
  }

  // Acionar protocolo de emergência
  async triggerEmergency(location = null, description = null) {
    try {
      const response = await api.post(`${this.baseURL}/emergency`, {
        location,
        description
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao acionar protocolo de emergência:', error);
      throw this.handleError(error);
    }
  }

  // Obter capacidades do agente
  async getCapabilities() {
    try {
      const response = await api.get(`${this.baseURL}/capabilities`);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter capacidades:', error);
      throw this.handleError(error);
    }
  }

  // Enviar feedback sobre interação
  async sendFeedback(sessionId, interactionId, rating, comment = null) {
    try {
      const response = await api.post(`${this.baseURL}/feedback`, {
        sessionId,
        interactionId,
        rating,
        comment
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao enviar feedback:', error);
      throw this.handleError(error);
    }
  }

  // Verificar saúde do serviço
  async checkHealth() {
    try {
      const response = await api.get(`${this.baseURL}/health`);
      return response.data;
    } catch (error) {
      console.error('Erro ao verificar saúde do serviço:', error);
      throw this.handleError(error);
    }
  }

  // Gerar ID de sessão único
  generateSessionId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // Verificar suporte a Web Speech API
  checkWebSpeechSupport() {
    const support = {
      speechRecognition: false,
      speechSynthesis: false
    };

    // Verificar Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      support.speechRecognition = true;
    }

    // Verificar Speech Synthesis
    if ('speechSynthesis' in window) {
      support.speechSynthesis = true;
    }

    return support;
  }

  // Obter vozes disponíveis para síntese
  getAvailableVoices() {
    if ('speechSynthesis' in window) {
      return speechSynthesis.getVoices().filter(voice => 
        voice.lang.startsWith('pt') || voice.lang.startsWith('en')
      );
    }
    return [];
  }

  // Configurar reconhecimento de voz
  setupSpeechRecognition(callbacks = {}) {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      throw new Error('Reconhecimento de voz não suportado neste navegador');
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    // Configurações padrão
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'pt-BR';
    recognition.maxAlternatives = 1;

    // Callbacks
    if (callbacks.onStart) recognition.onstart = callbacks.onStart;
    if (callbacks.onEnd) recognition.onend = callbacks.onEnd;
    if (callbacks.onError) recognition.onerror = callbacks.onError;
    if (callbacks.onResult) recognition.onresult = callbacks.onResult;

    return recognition;
  }

  // Configurar síntese de voz
  setupSpeechSynthesis(options = {}) {
    if (!('speechSynthesis' in window)) {
      throw new Error('Síntese de voz não suportada neste navegador');
    }

    const defaults = {
      lang: 'pt-BR',
      volume: 0.8,
      rate: 0.9,
      pitch: 1
    };

    return { ...defaults, ...options };
  }

  // Falar texto usando síntese de voz
  speak(text, options = {}) {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('Síntese de voz não suportada'));
        return;
      }

      const synthOptions = this.setupSpeechSynthesis(options);
      const utterance = new SpeechSynthesisUtterance(text);

      utterance.lang = synthOptions.lang;
      utterance.volume = synthOptions.volume;
      utterance.rate = synthOptions.rate;
      utterance.pitch = synthOptions.pitch;

      utterance.onend = () => resolve();
      utterance.onerror = (error) => reject(error);

      // Selecionar voz se especificada
      if (synthOptions.voice) {
        const voices = this.getAvailableVoices();
        const selectedVoice = voices.find(voice => 
          voice.name === synthOptions.voice || voice.lang === synthOptions.voice
        );
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      }

      speechSynthesis.speak(utterance);
    });
  }

  // Parar síntese de voz
  stopSpeaking() {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
  }

  // Verificar se está falando
  isSpeaking() {
    if ('speechSynthesis' in window) {
      return speechSynthesis.speaking;
    }
    return false;
  }

  // Processar áudio em tempo real (para visualização)
  async setupAudioVisualization(stream, callback) {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      
      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      microphone.connect(analyser);
      
      const updateVisualization = () => {
        analyser.getByteFrequencyData(dataArray);
        
        // Calcular volume médio
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        
        if (callback) {
          callback({
            volume: average / 255,
            frequencyData: dataArray
          });
        }
        
        requestAnimationFrame(updateVisualization);
      };
      
      updateVisualization();
      
      return {
        audioContext,
        analyser,
        stop: () => {
          audioContext.close();
        }
      };
    } catch (error) {
      console.error('Erro ao configurar visualização de áudio:', error);
      throw error;
    }
  }

  // Obter permissão de microfone
  async requestMicrophonePermission() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      return stream;
    } catch (error) {
      console.error('Erro ao obter permissão de microfone:', error);
      throw new Error('Permissão de microfone negada ou não disponível');
    }
  }

  // Manipular erros
  handleError(error) {
    if (error.response) {
      // Erro de resposta do servidor
      const { status, data } = error.response;
      return {
        type: 'server_error',
        status,
        message: data.message || 'Erro do servidor',
        details: data.errors || null
      };
    } else if (error.request) {
      // Erro de rede
      return {
        type: 'network_error',
        message: 'Erro de conexão com o servidor',
        details: null
      };
    } else {
      // Erro de configuração
      return {
        type: 'client_error',
        message: error.message || 'Erro desconhecido',
        details: null
      };
    }
  }

  // Validar entrada de texto
  validateInput(text) {
    if (!text || typeof text !== 'string') {
      return { valid: false, error: 'Texto inválido' };
    }

    if (text.trim().length === 0) {
      return { valid: false, error: 'Texto vazio' };
    }

    if (text.length > 1000) {
      return { valid: false, error: 'Texto muito longo (máximo 1000 caracteres)' };
    }

    return { valid: true };
  }

  // Formatar resposta para exibição
  formatResponse(response) {
    if (!response || typeof response !== 'string') {
      return 'Resposta inválida';
    }

    // Adicionar quebras de linha para melhor legibilidade
    return response
      .replace(/\. /g, '.\n')
      .replace(/\? /g, '?\n')
      .replace(/! /g, '!\n')
      .trim();
  }

  // Extrair entidades de texto (básico)
  extractEntities(text) {
    const entities = {
      medications: [],
      symptoms: [],
      bodyParts: [],
      timeReferences: []
    };

    const lowerText = text.toLowerCase();

    // Medicamentos comuns
    const medications = ['losartana', 'metformina', 'omeprazol', 'sinvastatina', 'atenolol', 'insulina'];
    medications.forEach(med => {
      if (lowerText.includes(med)) {
        entities.medications.push(med);
      }
    });

    // Sintomas comuns
    const symptoms = ['dor', 'febre', 'tosse', 'náusea', 'tontura', 'cansaço', 'insônia'];
    symptoms.forEach(symptom => {
      if (lowerText.includes(symptom)) {
        entities.symptoms.push(symptom);
      }
    });

    // Partes do corpo
    const bodyParts = ['cabeça', 'pescoço', 'peito', 'braço', 'perna', 'costas', 'barriga', 'joelho'];
    bodyParts.forEach(part => {
      if (lowerText.includes(part)) {
        entities.bodyParts.push(part);
      }
    });

    // Referências temporais
    const timeRefs = ['hoje', 'amanhã', 'ontem', 'semana', 'mês', 'urgente', 'agora'];
    timeRefs.forEach(time => {
      if (lowerText.includes(time)) {
        entities.timeReferences.push(time);
      }
    });

    return entities;
  }
}

export default new VoiceAgentService();

