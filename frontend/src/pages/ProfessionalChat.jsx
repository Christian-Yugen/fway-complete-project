import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

const ProfessionalChat = () => {
  const { professionalId } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [chatPhase, setChatPhase] = useState('initial'); // initial, negotiation, planning, execution
  
  const [professional] = useState({
    id: 1,
    name: 'Dr. João Silva',
    specialty: 'Cardiologia',
    photo: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face',
    status: 'online',
    responseTime: '~5 min'
  });

  const [suggestedServices, setSuggestedServices] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);

  // Simulação de mensagens iniciais
  useEffect(() => {
    const initialMessages = [
      {
        id: 1,
        sender: 'professional',
        content: 'Olá! Sou Dr. João Silva, cardiologista. Vi que você passou pela triagem e tenho algumas perguntas para entender melhor seu caso.',
        timestamp: new Date(Date.now() - 300000),
        type: 'text'
      },
      {
        id: 2,
        sender: 'professional',
        content: 'Baseado nas informações da triagem, vou sugerir alguns serviços que podem ser ideais para você.',
        timestamp: new Date(Date.now() - 240000),
        type: 'text'
      }
    ];
    
    setMessages(initialMessages);
    
    // Simular sugestões de IA baseadas na triagem
    setTimeout(() => {
      generateAISuggestions();
      suggestClinicalServices();
    }, 1000);
  }, []);

  // Auto-scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Gerar sugestões de IA baseadas no contexto
  const generateAISuggestions = () => {
    const triageData = JSON.parse(localStorage.getItem('triageData') || '{}');
    
    const suggestions = [];
    
    if (triageData.symptoms?.includes('Dor no peito')) {
      suggestions.push({
        id: 1,
        text: 'Perguntar sobre características da dor (localização, irradiação, fatores desencadeantes)',
        category: 'anamnese',
        confidence: 95
      });
    }
    
    if (triageData.comorbidities?.includes('Hipertensão')) {
      suggestions.push({
        id: 2,
        text: 'Verificar controle da pressão arterial e medicações em uso',
        category: 'followup',
        confidence: 90
      });
    }
    
    if (triageData.urgencyLevel === 'urgent') {
      suggestions.push({
        id: 3,
        text: 'Agendar consulta presencial nas próximas 48h para avaliação detalhada',
        category: 'scheduling',
        confidence: 88
      });
    }
    
    suggestions.push({
      id: 4,
      text: 'Solicitar exames complementares: ECG, Ecocardiograma, Exames laboratoriais',
      category: 'exams',
      confidence: 85
    });
    
    setAiSuggestions(suggestions);
  };

  // Sugerir serviços clínicos padronizados
  const suggestClinicalServices = () => {
    const triageData = JSON.parse(localStorage.getItem('triageData') || '{}');
    
    const services = [
      {
        id: 1,
        name: 'Consulta Cardiológica Completa',
        description: 'Avaliação clínica + ECG + Orientações',
        duration: '60 min',
        price: 180,
        urgency: triageData.urgencyLevel,
        recommended: true
      },
      {
        id: 2,
        name: 'Monitoramento Domiciliar',
        description: 'Acompanhamento semanal da pressão arterial',
        duration: '30 min/semana',
        price: 120,
        frequency: 'weekly',
        recommended: triageData.comorbidities?.includes('Hipertensão')
      },
      {
        id: 3,
        name: 'Plano de Prevenção Cardiovascular',
        description: 'Programa completo de prevenção e acompanhamento',
        duration: '3 meses',
        price: 450,
        installments: 3,
        recommended: triageData.age > 40
      }
    ];
    
    setSuggestedServices(services);
  };

  // Enviar mensagem
  const sendMessage = async () => {
    if (!newMessage.trim() && attachments.length === 0) return;
    
    const message = {
      id: Date.now(),
      sender: 'user',
      content: newMessage,
      timestamp: new Date(),
      type: attachments.length > 0 ? 'mixed' : 'text',
      attachments: [...attachments]
    };
    
    setMessages(prev => [...prev, message]);
    setNewMessage('');
    setAttachments([]);
    
    // Simular resposta do profissional
    setIsTyping(true);
    setTimeout(() => {
      generateProfessionalResponse(message);
      setIsTyping(false);
    }, 2000);
  };

  // Gerar resposta do profissional com IA
  const generateProfessionalResponse = (userMessage) => {
    const responses = [
      'Entendi. Baseado no que você descreveu, vou ajustar minha recomendação.',
      'Essa informação é muito importante. Vou incluir isso no plano de atendimento.',
      'Perfeito! Isso me ajuda a entender melhor seu caso.',
      'Vou considerar isso na elaboração do seu plano personalizado.'
    ];
    
    const response = {
      id: Date.now() + 1,
      sender: 'professional',
      content: responses[Math.floor(Math.random() * responses.length)],
      timestamp: new Date(),
      type: 'text'
    };
    
    setMessages(prev => [...prev, response]);
    
    // Atualizar sugestões de IA baseadas na conversa
    setTimeout(() => {
      updateAISuggestions(userMessage);
    }, 1000);
  };

  // Atualizar sugestões de IA baseadas na conversa
  const updateAISuggestions = (lastMessage) => {
    const newSuggestions = [
      {
        id: Date.now(),
        text: 'Propor plano de atendimento personalizado baseado na conversa',
        category: 'planning',
        confidence: 92
      },
      {
        id: Date.now() + 1,
        text: 'Agendar consulta de seguimento em 2 semanas',
        category: 'followup',
        confidence: 88
      }
    ];
    
    setAiSuggestions(prev => [...newSuggestions, ...prev.slice(0, 3)]);
  };

  // Usar sugestão de IA
  const useSuggestion = (suggestion) => {
    setNewMessage(suggestion.text);
    setShowSuggestions(false);
  };

  // Adicionar anexo
  const addAttachment = (event) => {
    const files = Array.from(event.target.files);
    const newAttachments = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file)
    }));
    
    setAttachments(prev => [...prev, ...newAttachments]);
  };

  // Remover anexo
  const removeAttachment = (id) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  };

  // Aceitar serviço sugerido
  const acceptService = (service) => {
    const planMessage = {
      id: Date.now(),
      sender: 'system',
      content: `Serviço "${service.name}" adicionado ao plano de atendimento`,
      timestamp: new Date(),
      type: 'service_added',
      service: service
    };
    
    setMessages(prev => [...prev, planMessage]);
    setChatPhase('planning');
    
    // Navegar para criação de plano customizado
    setTimeout(() => {
      navigate(`/custom-plan/${professional.id}?service=${service.id}`);
    }, 2000);
  };

  // Formatar timestamp
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Formatar tamanho do arquivo
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Layout>
      <div className="content-main">
        <div className="page-header">
          <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
            <img 
              src={professional.photo} 
              alt={professional.name}
              style={{width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover'}}
            />
            <div>
              <h1 className="page-title" style={{margin: 0}}>{professional.name}</h1>
              <p className="page-subtitle" style={{margin: 0}}>
                {professional.specialty} • 
                <span style={{color: '#4caf50', marginLeft: '8px'}}>
                  🟢 {professional.status} • Responde em {professional.responseTime}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div style={{display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', height: 'calc(100vh - 200px)'}}>
          {/* Área Principal do Chat */}
          <div style={{display: 'flex', flexDirection: 'column'}}>
            {/* Mensagens */}
            <div style={{
              flex: 1,
              background: 'white',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              padding: '16px',
              overflowY: 'auto',
              marginBottom: '16px'
            }}>
              {messages.map((message) => (
                <div key={message.id} style={{
                  display: 'flex',
                  justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                  marginBottom: '16px'
                }}>
                  <div style={{
                    maxWidth: '70%',
                    padding: '12px 16px',
                    borderRadius: '18px',
                    background: message.sender === 'user' ? '#1976d2' : 
                               message.sender === 'system' ? '#4caf50' : '#f5f5f5',
                    color: message.sender === 'user' || message.sender === 'system' ? 'white' : '#333'
                  }}>
                    {message.type === 'service_added' ? (
                      <div>
                        <div style={{fontWeight: 'bold', marginBottom: '8px'}}>
                          <Check size={16} /> Serviço Adicionado
                        </div>
                        <div style={{fontSize: '14px'}}>
                          {message.service.name} - R$ {message.service.price}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div>{message.content}</div>
                        {message.attachments && message.attachments.length > 0 && (
                          <div style={{marginTop: '8px'}}>
                            {message.attachments.map((att) => (
                              <div key={att.id} style={{
                                padding: '8px',
                                background: 'rgba(255,255,255,0.2)',
                                borderRadius: '8px',
                                marginTop: '4px',
                                fontSize: '14px'
                              }}>
                                📎 {att.name} ({formatFileSize(att.size)})
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    <div style={{
                      fontSize: '12px',
                      opacity: 0.7,
                      marginTop: '4px',
                      textAlign: 'right'
                    }}>
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div style={{display: 'flex', justifyContent: 'flex-start', marginBottom: '16px'}}>
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: '18px',
                    background: '#f5f5f5',
                    color: '#666'
                  }}>
                    <div style={{display: 'flex', gap: '4px', alignItems: 'center'}}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#999',
                        animation: 'pulse 1.5s ease-in-out infinite'
                      }}></div>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#999',
                        animation: 'pulse 1.5s ease-in-out infinite 0.2s'
                      }}></div>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#999',
                        animation: 'pulse 1.5s ease-in-out infinite 0.4s'
                      }}></div>
                      <span style={{marginLeft: '8px'}}>Digitando...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Sugestões de IA */}
            {showSuggestions && aiSuggestions.length > 0 && (
              <div style={{
                background: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '16px'
              }}>
                <h4 style={{margin: '0 0 12px 0', color: '#1976d2'}}><Brain size={16} /> Sugestões de IA</h4>
                {aiSuggestions.slice(0, 3).map((suggestion) => (
                  <div key={suggestion.id} style={{
                    padding: '8px 12px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '6px',
                    marginBottom: '8px',
                    cursor: 'pointer',
                    background: '#f9f9f9'
                  }}
                  onClick={() => useSuggestion(suggestion)}
                  >
                    <div style={{fontSize: '14px', marginBottom: '4px'}}>{suggestion.text}</div>
                    <div style={{fontSize: '12px', color: '#666'}}>
                      {suggestion.category} • {suggestion.confidence}% confiança
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Anexos */}
            {attachments.length > 0 && (
              <div style={{
                background: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '16px'
              }}>
                <h4 style={{margin: '0 0 12px 0'}}>📎 Anexos</h4>
                {attachments.map((att) => (
                  <div key={att.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '6px',
                    marginBottom: '8px'
                  }}>
                    <div>
                      <div style={{fontWeight: 'bold', fontSize: '14px'}}>{att.name}</div>
                      <div style={{fontSize: '12px', color: '#666'}}>{formatFileSize(att.size)}</div>
                    </div>
                    <button 
                      onClick={() => removeAttachment(att.id)}
                      style={{
                        background: '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Área de Input */}
            <div style={{
              background: 'white',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              padding: '16px'
            }}>
              <div style={{display: 'flex', gap: '8px', alignItems: 'flex-end'}}>
                <div style={{flex: 1}}>
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Digite sua mensagem..."
                    rows="3"
                    style={{
                      width: '100%',
                      border: '1px solid #ccc',
                      borderRadius: '6px',
                      padding: '12px',
                      resize: 'none'
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                </div>
                <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                  <label style={{
                    padding: '8px',
                    background: '#ff9800',
                    color: 'white',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    textAlign: 'center',
                    fontSize: '14px'
                  }}>
                    📎
                    <input 
                      type="file" 
                      multiple 
                      onChange={addAttachment}
                      style={{display: 'none'}}
                      accept="image/*,.pdf,.doc,.docx"
                    />
                  </label>
                  <button 
                    onClick={() => setShowSuggestions(!showSuggestions)}
                    style={{
                      padding: '8px',
                      background: '#9c27b0',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    <Brain size={16} />
                  </button>
                  <button 
                    onClick={sendMessage}
                    style={{
                      padding: '8px 16px',
                      background: '#4caf50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    ➤
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* Serviços Sugeridos */}
            <div className="card-professional" style={{marginBottom: '16px'}}>
              <div className="card-header">
                <h3 className="card-title"><Lightbulb size={16} /> Serviços Sugeridos</h3>
              </div>
              <div className="card-body">
                {suggestedServices.map((service) => (
                  <div key={service.id} style={{
                    padding: '12px',
                    border: service.recommended ? '2px solid #4caf50' : '1px solid #e0e0e0',
                    borderRadius: '8px',
                    marginBottom: '12px',
                    background: service.recommended ? '#e8f5e8' : 'white'
                  }}>
                    {service.recommended && (
                      <div style={{
                        fontSize: '12px',
                        color: '#4caf50',
                        fontWeight: 'bold',
                        marginBottom: '4px'
                      }}>
                        <Star size={16} /> RECOMENDADO
                      </div>
                    )}
                    <div style={{fontWeight: 'bold', marginBottom: '4px'}}>{service.name}</div>
                    <div style={{fontSize: '14px', color: '#666', marginBottom: '8px'}}>
                      {service.description}
                    </div>
                    <div style={{fontSize: '12px', color: '#666', marginBottom: '8px'}}>
                      ⏱️ {service.duration}
                    </div>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                      <div style={{fontWeight: 'bold', color: '#4caf50'}}>
                        R$ {service.price}
                        {service.installments && (
                          <span style={{fontSize: '12px', color: '#666'}}>
                            {' '}ou {service.installments}x
                          </span>
                        )}
                      </div>
                      <button 
                        onClick={() => acceptService(service)}
                        style={{
                          padding: '6px 12px',
                          background: '#1976d2',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        <Check size={16} /> Aceitar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Status da Conversa */}
            <div className="card-professional" style={{marginBottom: '16px'}}>
              <div className="card-header">
                <h3 className="card-title"><BarChart3 size={16} /> Status</h3>
              </div>
              <div className="card-body">
                <div style={{fontSize: '14px', lineHeight: '1.6'}}>
                  <div style={{marginBottom: '8px'}}>
                    <strong>Fase:</strong> {
                      chatPhase === 'initial' ? 'Avaliação Inicial' :
                      chatPhase === 'negotiation' ? 'Negociação' :
                      chatPhase === 'planning' ? 'Planejamento' :
                      'Execução'
                    }
                  </div>
                  <div style={{marginBottom: '8px'}}>
                    <strong>Mensagens:</strong> {messages.length}
                  </div>
                  <div style={{marginBottom: '8px'}}>
                    <strong>Anexos:</strong> {messages.reduce((acc, msg) => acc + (msg.attachments?.length || 0), 0)}
                  </div>
                  <div>
                    <strong>Última atividade:</strong> Agora
                  </div>
                </div>
              </div>
            </div>

            {/* Ações Rápidas */}
            <div className="card-professional">
              <div className="card-header">
                <h3 className="card-title"><Zap size={16} /> Ações Rápidas</h3>
              </div>
              <div className="card-body">
                <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                  <button style={{
                    padding: '8px 12px',
                    background: '#2196f3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}>
                    <Calendar size={16} /> Agendar Consulta
                  </button>
                  <button style={{
                    padding: '8px 12px',
                    background: '#ff9800',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}>
                    <FileText size={16} /> Solicitar Exames
                  </button>
                  <button style={{
                    padding: '8px 12px',
                    background: '#9c27b0',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}>
                    <Pill size={16} /> Receita Médica
                  </button>
                  <button 
                    onClick={() => navigate(`/custom-plan/${professional.id}`)}
                    style={{
                      padding: '8px 12px',
                      background: '#4caf50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    <PenTool size={16} /> Criar Plano
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes pulse {
            0%, 80%, 100% {
              opacity: 0.3;
            }
            40% {
              opacity: 1;
            }
          }
        `}</style>
      </div>
    </Layout>
  );
};

export default ProfessionalChat;

