import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';

const NegotiationChat = () => {
  const { negotiationId } = useParams();
  const messagesEndRef = useRef(null);
  
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'professional',
      senderName: 'Dr. João Silva',
      message: 'Olá! Vi sua proposta para consulta cardiológica. Posso ajudá-lo.',
      timestamp: '2024-01-10T10:30:00',
      type: 'text'
    },
    {
      id: 2,
      sender: 'client',
      senderName: 'Você',
      message: 'Ótimo! Gostaria de negociar o preço. Seria possível fazer por R$ 120?',
      timestamp: '2024-01-10T10:35:00',
      type: 'text'
    },
    {
      id: 3,
      sender: 'professional',
      senderName: 'Dr. João Silva',
      message: 'Posso fazer por R$ 130, incluindo um relatório detalhado.',
      timestamp: '2024-01-10T10:40:00',
      type: 'text'
    },
    {
      id: 4,
      sender: 'system',
      senderName: 'Sistema',
      message: 'Milestone criado: "Consulta inicial" - R$ 65 - Prazo: 15/01/2024',
      timestamp: '2024-01-10T10:45:00',
      type: 'milestone'
    }
  ]);

  const [newMessage, setNewMessage] = useState('');
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [milestoneData, setMilestoneData] = useState({
    title: '',
    description: '',
    amount: '',
    deadline: ''
  });

  const [negotiationDetails, setNegotiationDetails] = useState({
    professional: 'Dr. João Silva',
    service: 'Consulta Cardiológica',
    originalPrice: 150,
    currentPrice: 130,
    status: 'negotiating',
    milestones: [
      {
        id: 1,
        title: 'Consulta inicial',
        description: 'Consulta cardiológica completa com exames',
        amount: 65,
        deadline: '2024-01-15',
        status: 'pending'
      },
      {
        id: 2,
        title: 'Relatório final',
        description: 'Relatório detalhado com recomendações',
        amount: 65,
        deadline: '2024-01-20',
        status: 'pending'
      }
    ]
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: messages.length + 1,
        sender: 'client',
        senderName: 'Você',
        message: newMessage,
        timestamp: new Date().toISOString(),
        type: 'text'
      };
      setMessages([...messages, message]);
      setNewMessage('');
      
      // Simular resposta automática
      setTimeout(() => {
        const autoReply = {
          id: messages.length + 2,
          sender: 'professional',
          senderName: negotiationDetails.professional,
          message: 'Entendi. Vou analisar sua proposta e responder em breve.',
          timestamp: new Date().toISOString(),
          type: 'text'
        };
        setMessages(prev => [...prev, autoReply]);
      }, 2000);
    }
  };

  const createMilestone = () => {
    if (milestoneData.title && milestoneData.amount) {
      const milestone = {
        id: negotiationDetails.milestones.length + 1,
        ...milestoneData,
        status: 'pending'
      };
      
      setNegotiationDetails({
        ...negotiationDetails,
        milestones: [...negotiationDetails.milestones, milestone]
      });

      const systemMessage = {
        id: messages.length + 1,
        sender: 'system',
        senderName: 'Sistema',
        message: `Milestone criado: "${milestoneData.title}" - R$ ${milestoneData.amount} - Prazo: ${new Date(milestoneData.deadline).toLocaleDateString('pt-BR')}`,
        timestamp: new Date().toISOString(),
        type: 'milestone'
      };
      
      setMessages([...messages, systemMessage]);
      setMilestoneData({ title: '', description: '', amount: '', deadline: '' });
      setShowMilestoneForm(false);
    }
  };

  const approveMilestone = (milestoneId) => {
    setNegotiationDetails({
      ...negotiationDetails,
      milestones: negotiationDetails.milestones.map(m => 
        m.id === milestoneId ? { ...m, status: 'approved' } : m
      )
    });
    
    const systemMessage = {
      id: messages.length + 1,
      sender: 'system',
      senderName: 'Sistema',
      message: `Milestone aprovado! Pagamento de R$ ${negotiationDetails.milestones.find(m => m.id === milestoneId)?.amount} será processado via Strike.`,
      timestamp: new Date().toISOString(),
      type: 'payment'
    };
    
    setMessages([...messages, systemMessage]);
  };

  const sendQuickOffer = (price) => {
    const message = {
      id: messages.length + 1,
      sender: 'client',
      senderName: 'Você',
      message: `Proposta rápida: R$ ${price}`,
      timestamp: new Date().toISOString(),
      type: 'offer'
    };
    setMessages([...messages, message]);
  };

  return (
    <Layout>
      <div className="content-main">
        <div className="page-header">
          <h1 className="page-title"><MessageCircle size={16} /> Chat de Negociação</h1>
          <p className="page-subtitle">Negocie diretamente com o profissional</p>
        </div>

        <div style={{display: 'grid', gridTemplateColumns: '1fr 350px', gap: '24px', height: 'calc(100vh - 200px)'}}>
          {/* Chat Principal */}
          <div className="card-professional" style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
            {/* Header do Chat */}
            <div className="card-header" style={{background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)', color: 'white'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div>
                  <h3 style={{margin: 0, color: 'white'}}>{negotiationDetails.service}</h3>
                  <p style={{margin: 0, opacity: 0.9}}>com {negotiationDetails.professional}</p>
                </div>
                <div style={{textAlign: 'right'}}>
                  <div style={{fontSize: '18px', fontWeight: 'bold'}}>R$ {negotiationDetails.currentPrice}</div>
                  <div style={{fontSize: '12px', opacity: 0.8}}>
                    {negotiationDetails.status === 'negotiating' ? '<RefreshCw size={16} /> Negociando' : '<Check size={16} /> Acordado'}
                  </div>
                </div>
              </div>
            </div>

            {/* Área de Mensagens */}
            <div style={{
              flex: 1,
              padding: '16px',
              overflowY: 'auto',
              background: '#f8f9fa'
            }}>
              {messages.map((message) => (
                <div key={message.id} style={{
                  marginBottom: '16px',
                  display: 'flex',
                  justifyContent: message.sender === 'client' ? 'flex-end' : 'flex-start'
                }}>
                  <div style={{
                    maxWidth: '70%',
                    padding: '12px 16px',
                    borderRadius: '18px',
                    background: message.sender === 'client' ? '#1976d2' : 
                               message.sender === 'system' ? '#ff9800' : 'white',
                    color: message.sender === 'client' || message.sender === 'system' ? 'white' : '#333',
                    border: message.sender === 'professional' ? '1px solid #e0e0e0' : 'none',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    <div style={{fontSize: '12px', opacity: 0.8, marginBottom: '4px'}}>
                      {message.senderName} • {new Date(message.timestamp).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}
                    </div>
                    <div>{message.message}</div>
                    {message.type === 'offer' && (
                      <div style={{marginTop: '8px', fontSize: '12px', opacity: 0.9}}>
                        <DollarSign size={16} /> Proposta de preço
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Propostas Rápidas */}
            <div style={{padding: '12px 16px', borderTop: '1px solid #e0e0e0', background: 'white'}}>
              <div style={{marginBottom: '8px', fontSize: '14px', fontWeight: 'bold', color: '#666'}}>
                <Lightbulb size={16} /> Propostas Rápidas:
              </div>
              <div style={{display: 'flex', gap: '8px', marginBottom: '12px'}}>
                <button 
                  onClick={() => sendQuickOffer(120)}
                  style={{
                    padding: '6px 12px',
                    background: '#e3f2fd',
                    border: '1px solid #1976d2',
                    borderRadius: '16px',
                    color: '#1976d2',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  R$ 120
                </button>
                <button 
                  onClick={() => sendQuickOffer(125)}
                  style={{
                    padding: '6px 12px',
                    background: '#e3f2fd',
                    border: '1px solid #1976d2',
                    borderRadius: '16px',
                    color: '#1976d2',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  R$ 125
                </button>
                <button 
                  onClick={() => sendQuickOffer(130)}
                  style={{
                    padding: '6px 12px',
                    background: '#e8f5e8',
                    border: '1px solid #4caf50',
                    borderRadius: '16px',
                    color: '#4caf50',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Aceitar R$ 130
                </button>
              </div>
            </div>

            {/* Input de Mensagem */}
            <div style={{padding: '16px', borderTop: '1px solid #e0e0e0', background: 'white'}}>
              <div style={{display: 'flex', gap: '12px', alignItems: 'flex-end'}}>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  rows="2"
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '12px',
                    resize: 'none',
                    outline: 'none'
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
                <button 
                  onClick={sendMessage}
                  style={{
                    padding: '12px 20px',
                    background: '#1976d2',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Enviar
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar - Milestones e Ações */}
          <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
            {/* Milestones */}
            <div className="card-professional">
              <div className="card-header">
                <h3 className="card-title"><Target size={16} /> Milestones</h3>
                <button 
                  onClick={() => setShowMilestoneForm(!showMilestoneForm)}
                  style={{
                    padding: '6px 12px',
                    background: '#4caf50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  + Novo
                </button>
              </div>
              <div className="card-body">
                {showMilestoneForm && (
                  <div style={{
                    padding: '12px',
                    background: '#f5f5f5',
                    borderRadius: '8px',
                    marginBottom: '16px'
                  }}>
                    <input
                      type="text"
                      value={milestoneData.title}
                      onChange={(e) => setMilestoneData({...milestoneData, title: e.target.value})}
                      placeholder="Título"
                      style={{width: '100%', padding: '8px', marginBottom: '8px', border: '1px solid #ccc', borderRadius: '4px'}}
                    />
                    <textarea
                      value={milestoneData.description}
                      onChange={(e) => setMilestoneData({...milestoneData, description: e.target.value})}
                      placeholder="Descrição"
                      rows="2"
                      style={{width: '100%', padding: '8px', marginBottom: '8px', border: '1px solid #ccc', borderRadius: '4px'}}
                    />
                    <input
                      type="number"
                      value={milestoneData.amount}
                      onChange={(e) => setMilestoneData({...milestoneData, amount: e.target.value})}
                      placeholder="Valor (R$)"
                      style={{width: '100%', padding: '8px', marginBottom: '8px', border: '1px solid #ccc', borderRadius: '4px'}}
                    />
                    <input
                      type="date"
                      value={milestoneData.deadline}
                      onChange={(e) => setMilestoneData({...milestoneData, deadline: e.target.value})}
                      style={{width: '100%', padding: '8px', marginBottom: '12px', border: '1px solid #ccc', borderRadius: '4px'}}
                    />
                    <div style={{display: 'flex', gap: '8px'}}>
                      <button 
                        onClick={createMilestone}
                        style={{
                          flex: 1,
                          padding: '8px',
                          background: '#4caf50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Criar
                      </button>
                      <button 
                        onClick={() => setShowMilestoneForm(false)}
                        style={{
                          flex: 1,
                          padding: '8px',
                          background: '#ccc',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                {negotiationDetails.milestones.map((milestone) => (
                  <div key={milestone.id} style={{
                    padding: '12px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    marginBottom: '12px',
                    background: milestone.status === 'approved' ? '#e8f5e8' : 'white'
                  }}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'}}>
                      <h5 style={{margin: 0, fontSize: '14px'}}>{milestone.title}</h5>
                      <div style={{
                        padding: '2px 8px',
                        borderRadius: '12px',
                        background: milestone.status === 'approved' ? '#4caf50' : '#ff9800',
                        color: 'white',
                        fontSize: '10px'
                      }}>
                        {milestone.status === 'approved' ? '<Check size={16} /> Aprovado' : '⏳ Pendente'}
                      </div>
                    </div>
                    <p style={{margin: '0 0 8px 0', fontSize: '12px', color: '#666'}}>{milestone.description}</p>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'}}>
                      <strong style={{color: '#4caf50'}}>R$ {milestone.amount}</strong>
                      <span style={{fontSize: '12px', color: '#666'}}>
                        {new Date(milestone.deadline).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    {milestone.status === 'pending' && (
                      <button 
                        onClick={() => approveMilestone(milestone.id)}
                        style={{
                          width: '100%',
                          padding: '6px',
                          background: '#4caf50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        <Check size={16} /> Aprovar Milestone
                      </button>
                    )}
                  </div>
                ))}
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
                    padding: '10px',
                    background: '#4caf50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}>
                    <Check size={16} /> Finalizar Acordo
                  </button>
                  <button style={{
                    padding: '10px',
                    background: '#2196f3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}>
                    <DollarSign size={16} /> Ir para Pagamento
                  </button>
                  <button style={{
                    padding: '10px',
                    background: '#ff9800',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}>
                    <FileText size={16} /> Ver Contrato
                  </button>
                  <button style={{
                    padding: '10px',
                    background: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}>
                    ⚠️ Reportar Problema
                  </button>
                </div>
              </div>
            </div>

            {/* Proteções Ativas */}
            <div className="card-professional">
              <div className="card-header">
                <h3 className="card-title"><Shield size={16} /> Proteções Ativas</h3>
              </div>
              <div className="card-body">
                <div style={{fontSize: '12px', lineHeight: '1.4'}}>
                  <div style={{marginBottom: '8px', color: '#4caf50'}}>
                    <Check size={16} /> Seguro de Serviço Ativo
                  </div>
                  <div style={{marginBottom: '8px', color: '#4caf50'}}>
                    <Check size={16} /> Pagamento em Escrow
                  </div>
                  <div style={{marginBottom: '8px', color: '#4caf50'}}>
                    <Check size={16} /> Proteção Anti-Fraude
                  </div>
                  <div style={{marginBottom: '8px', color: '#4caf50'}}>
                    <Check size={16} /> Suporte 24/7
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NegotiationChat;

