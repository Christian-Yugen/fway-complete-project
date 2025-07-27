import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

const NegotiationSystem = () => {
  const { professionalId } = useParams();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('proposal');
  const [proposalData, setProposalData] = useState({
    title: '',
    description: '',
    budget: '',
    deadline: '',
    milestones: [{ title: '', description: '', amount: '', deadline: '' }],
    requirements: '',
    deliverables: ''
  });
  
  const [negotiations, setNegotiations] = useState([
    {
      id: 1,
      professional: 'Dr. João Silva',
      service: 'Consulta Cardiológica',
      status: 'pending',
      originalPrice: 150,
      proposedPrice: 120,
      deadline: '2024-01-15',
      messages: [
        { sender: 'client', message: 'Gostaria de negociar o preço', time: '10:30' },
        { sender: 'professional', message: 'Posso fazer por R$ 120', time: '10:45' }
      ]
    }
  ]);

  const addMilestone = () => {
    setProposalData({
      ...proposalData,
      milestones: [...proposalData.milestones, { title: '', description: '', amount: '', deadline: '' }]
    });
  };

  const updateMilestone = (index, field, value) => {
    const updatedMilestones = proposalData.milestones.map((milestone, i) => 
      i === index ? { ...milestone, [field]: value } : milestone
    );
    setProposalData({ ...proposalData, milestones: updatedMilestones });
  };

  const removeMilestone = (index) => {
    const updatedMilestones = proposalData.milestones.filter((_, i) => i !== index);
    setProposalData({ ...proposalData, milestones: updatedMilestones });
  };

  const submitProposal = () => {
    // Simular envio da proposta
    alert('Proposta enviada com sucesso! O profissional será notificado.');
    navigate('/my-negotiations');
  };

  const acceptNegotiation = (id) => {
    setNegotiations(negotiations.map(neg => 
      neg.id === id ? { ...neg, status: 'accepted' } : neg
    ));
    alert('Negociação aceita! Redirecionando para pagamento via Strike...');
  };

  const counterOffer = (id) => {
    const newPrice = prompt('Digite sua contraproposta:');
    if (newPrice) {
      setNegotiations(negotiations.map(neg => 
        neg.id === id ? { ...neg, proposedPrice: parseFloat(newPrice), status: 'counter' } : neg
      ));
    }
  };

  return (
    <Layout>
      <div className="content-main">
        <div className="page-header">
          <h1 className="page-title">💼 Sistema de Negociação</h1>
          <p className="page-subtitle">Negocie serviços de forma segura com proteção total</p>
        </div>

        {/* Vantagens da Plataforma */}
        <div className="card-professional" style={{marginBottom: '24px', background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)', border: '2px solid #1976d2'}}>
          <div className="card-header">
            <h3 className="card-title"><Shield size={16} /> Vantagens de Negociar na Plataforma Fway</h3>
          </div>
          <div className="card-body">
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px'}}>
              <div style={{padding: '16px', background: 'white', borderRadius: '8px', border: '1px solid #e0e0e0'}}>
                <h4 style={{color: '#1976d2', marginBottom: '8px'}}><Shield size={16} /> Seguro Automático</h4>
                <p style={{margin: 0, fontSize: '14px'}}>Todos os serviços incluem seguro gratuito contra problemas e insatisfação</p>
              </div>
              <div style={{padding: '16px', background: 'white', borderRadius: '8px', border: '1px solid #e0e0e0'}}>
                <h4 style={{color: '#1976d2', marginBottom: '8px'}}><DollarSign size={16} /> Escrow Seguro</h4>
                <p style={{margin: 0, fontSize: '14px'}}>Pagamento protegido via Strike - dinheiro só é liberado após aprovação</p>
              </div>
              <div style={{padding: '16px', background: 'white', borderRadius: '8px', border: '1px solid #e0e0e0'}}>
                <h4 style={{color: '#1976d2', marginBottom: '8px'}}><Scale size={16} /> Sistema de Disputas</h4>
                <p style={{margin: 0, fontSize: '14px'}}>Mediação profissional em caso de conflitos com resolução justa</p>
              </div>
              <div style={{padding: '16px', background: 'white', borderRadius: '8px', border: '1px solid #e0e0e0'}}>
                <h4 style={{color: '#1976d2', marginBottom: '8px'}}><Shield size={16} /> Proteção Anti-Fraude</h4>
                <p style={{margin: 0, fontSize: '14px'}}>Verificação de identidade e monitoramento 24/7 contra fraudes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs de Navegação */}
        <div className="card-professional">
          <div className="card-header">
            <div style={{display: 'flex', gap: '16px', borderBottom: '1px solid #e0e0e0'}}>
              <button 
                onClick={() => setActiveTab('proposal')}
                className={`tab-button ${activeTab === 'proposal' ? 'active' : ''}`}
                style={{
                  padding: '12px 24px',
                  border: 'none',
                  background: activeTab === 'proposal' ? '#1976d2' : 'transparent',
                  color: activeTab === 'proposal' ? 'white' : '#666',
                  borderRadius: '8px 8px 0 0',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                <PenTool size={16} /> Nova Proposta
              </button>
              <button 
                onClick={() => setActiveTab('negotiations')}
                className={`tab-button ${activeTab === 'negotiations' ? 'active' : ''}`}
                style={{
                  padding: '12px 24px',
                  border: 'none',
                  background: activeTab === 'negotiations' ? '#1976d2' : 'transparent',
                  color: activeTab === 'negotiations' ? 'white' : '#666',
                  borderRadius: '8px 8px 0 0',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                <MessageCircle size={16} /> Negociações Ativas
              </button>
            </div>
          </div>

          <div className="card-body">
            {activeTab === 'proposal' && (
              <div>
                <h3 style={{marginBottom: '24px', color: '#1976d2'}}><FileText size={16} /> Criar Nova Proposta de Serviço</h3>
                
                {/* Informações Básicas */}
                <div style={{marginBottom: '24px'}}>
                  <h4 style={{marginBottom: '16px'}}>📌 Informações Básicas</h4>
                  <div style={{display: 'grid', gap: '16px'}}>
                    <div>
                      <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>Título do Serviço:</label>
                      <input
                        type="text"
                        value={proposalData.title}
                        onChange={(e) => setProposalData({...proposalData, title: e.target.value})}
                        placeholder="Ex: Consulta Cardiológica Completa"
                        style={{width: '100%', padding: '12px', border: '2px solid #e0e0e0', borderRadius: '8px'}}
                      />
                    </div>
                    <div>
                      <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>Descrição Detalhada:</label>
                      <textarea
                        value={proposalData.description}
                        onChange={(e) => setProposalData({...proposalData, description: e.target.value})}
                        placeholder="Descreva detalhadamente o serviço que você precisa..."
                        rows="4"
                        style={{width: '100%', padding: '12px', border: '2px solid #e0e0e0', borderRadius: '8px'}}
                      />
                    </div>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                      <div>
                        <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>Orçamento Total (R$):</label>
                        <input
                          type="number"
                          value={proposalData.budget}
                          onChange={(e) => setProposalData({...proposalData, budget: e.target.value})}
                          placeholder="150.00"
                          style={{width: '100%', padding: '12px', border: '2px solid #e0e0e0', borderRadius: '8px'}}
                        />
                      </div>
                      <div>
                        <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>Prazo Final:</label>
                        <input
                          type="date"
                          value={proposalData.deadline}
                          onChange={(e) => setProposalData({...proposalData, deadline: e.target.value})}
                          style={{width: '100%', padding: '12px', border: '2px solid #e0e0e0', borderRadius: '8px'}}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Milestones */}
                <div style={{marginBottom: '24px'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
                    <h4><Target size={16} /> Milestones de Pagamento</h4>
                    <button 
                      onClick={addMilestone}
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
                      + Adicionar Milestone
                    </button>
                  </div>
                  
                  {proposalData.milestones.map((milestone, index) => (
                    <div key={index} style={{
                      padding: '16px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      marginBottom: '12px',
                      background: '#f9f9f9'
                    }}>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px'}}>
                        <h5>Milestone {index + 1}</h5>
                        {proposalData.milestones.length > 1 && (
                          <button 
                            onClick={() => removeMilestone(index)}
                            style={{
                              padding: '4px 8px',
                              background: '#f44336',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            Remover
                          </button>
                        )}
                      </div>
                      <div style={{display: 'grid', gap: '12px'}}>
                        <input
                          type="text"
                          value={milestone.title}
                          onChange={(e) => updateMilestone(index, 'title', e.target.value)}
                          placeholder="Título do milestone"
                          style={{padding: '10px', border: '1px solid #ccc', borderRadius: '6px'}}
                        />
                        <textarea
                          value={milestone.description}
                          onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                          placeholder="Descrição do que será entregue"
                          rows="2"
                          style={{padding: '10px', border: '1px solid #ccc', borderRadius: '6px'}}
                        />
                        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
                          <input
                            type="number"
                            value={milestone.amount}
                            onChange={(e) => updateMilestone(index, 'amount', e.target.value)}
                            placeholder="Valor (R$)"
                            style={{padding: '10px', border: '1px solid #ccc', borderRadius: '6px'}}
                          />
                          <input
                            type="date"
                            value={milestone.deadline}
                            onChange={(e) => updateMilestone(index, 'deadline', e.target.value)}
                            style={{padding: '10px', border: '1px solid #ccc', borderRadius: '6px'}}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Requisitos e Entregáveis */}
                <div style={{marginBottom: '24px'}}>
                  <div style={{display: 'grid', gap: '16px'}}>
                    <div>
                      <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}><FileText size={16} /> Requisitos Específicos:</label>
                      <textarea
                        value={proposalData.requirements}
                        onChange={(e) => setProposalData({...proposalData, requirements: e.target.value})}
                        placeholder="Liste requisitos específicos, documentos necessários, etc."
                        rows="3"
                        style={{width: '100%', padding: '12px', border: '2px solid #e0e0e0', borderRadius: '8px'}}
                      />
                    </div>
                    <div>
                      <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>📦 Entregáveis Esperados:</label>
                      <textarea
                        value={proposalData.deliverables}
                        onChange={(e) => setProposalData({...proposalData, deliverables: e.target.value})}
                        placeholder="Descreva o que você espera receber (relatórios, exames, etc.)"
                        rows="3"
                        style={{width: '100%', padding: '12px', border: '2px solid #e0e0e0', borderRadius: '8px'}}
                      />
                    </div>
                  </div>
                </div>

                {/* Botão de Envio */}
                <div style={{textAlign: 'center'}}>
                  <button 
                    onClick={submitProposal}
                    style={{
                      padding: '16px 32px',
                      background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)'
                    }}
                  >
                    <Rocket size={16} /> Enviar Proposta
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'negotiations' && (
              <div>
                <h3 style={{marginBottom: '24px', color: '#1976d2'}}><MessageCircle size={16} /> Negociações em Andamento</h3>
                
                {negotiations.map((negotiation) => (
                  <div key={negotiation.id} style={{
                    border: '2px solid #e0e0e0',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '20px',
                    background: 'white'
                  }}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
                      <div>
                        <h4 style={{margin: 0, color: '#1976d2'}}>{negotiation.service}</h4>
                        <p style={{margin: '4px 0', color: '#666'}}>com {negotiation.professional}</p>
                      </div>
                      <div style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        background: negotiation.status === 'pending' ? '#fff3cd' : 
                                   negotiation.status === 'accepted' ? '#d4edda' : '#f8d7da',
                        color: negotiation.status === 'pending' ? '#856404' : 
                               negotiation.status === 'accepted' ? '#155724' : '#721c24',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {negotiation.status === 'pending' ? '⏳ Pendente' : 
                         negotiation.status === 'accepted' ? '<Check size={16} /> Aceito' : '<RefreshCw size={16} /> Contraproposta'}
                      </div>
                    </div>

                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '16px'}}>
                      <div>
                        <strong>Preço Original:</strong>
                        <div style={{color: '#666', textDecoration: 'line-through'}}>R$ {negotiation.originalPrice}</div>
                      </div>
                      <div>
                        <strong>Preço Proposto:</strong>
                        <div style={{color: '#4caf50', fontWeight: 'bold', fontSize: '18px'}}>R$ {negotiation.proposedPrice}</div>
                      </div>
                      <div>
                        <strong>Prazo:</strong>
                        <div>{new Date(negotiation.deadline).toLocaleDateString('pt-BR')}</div>
                      </div>
                    </div>

                    {/* Chat de Negociação */}
                    <div style={{
                      background: '#f5f5f5',
                      borderRadius: '8px',
                      padding: '12px',
                      marginBottom: '16px',
                      maxHeight: '150px',
                      overflowY: 'auto'
                    }}>
                      <h5 style={{margin: '0 0 12px 0'}}><MessageCircle size={16} /> Conversa:</h5>
                      {negotiation.messages.map((msg, index) => (
                        <div key={index} style={{
                          marginBottom: '8px',
                          padding: '8px',
                          borderRadius: '6px',
                          background: msg.sender === 'client' ? '#e3f2fd' : '#f3e5f5'
                        }}>
                          <div style={{fontSize: '12px', color: '#666', marginBottom: '4px'}}>
                            {msg.sender === 'client' ? 'Você' : negotiation.professional} - {msg.time}
                          </div>
                          <div>{msg.message}</div>
                        </div>
                      ))}
                    </div>

                    {/* Ações */}
                    <div style={{display: 'flex', gap: '12px', flexWrap: 'wrap'}}>
                      {negotiation.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => acceptNegotiation(negotiation.id)}
                            style={{
                              padding: '10px 20px',
                              background: '#4caf50',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontWeight: 'bold'
                            }}
                          >
                            <Check size={16} /> Aceitar Proposta
                          </button>
                          <button 
                            onClick={() => counterOffer(negotiation.id)}
                            style={{
                              padding: '10px 20px',
                              background: '#ff9800',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontWeight: 'bold'
                            }}
                          >
                            <RefreshCw size={16} /> Contraproposta
                          </button>
                        </>
                      )}
                      <button 
                        style={{
                          padding: '10px 20px',
                          background: '#2196f3',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        <MessageCircle size={16} /> Abrir Chat
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NegotiationSystem;

