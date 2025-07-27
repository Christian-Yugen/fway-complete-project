import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

const NegotiationVersions = () => {
  const { professionalId } = useParams();
  const navigate = useNavigate();
  
  const [currentVersion, setCurrentVersion] = useState(1);
  const [versions, setVersions] = useState([]);
  const [activeNegotiation, setActiveNegotiation] = useState(null);
  const [proposalChanges, setProposalChanges] = useState({});
  const [negotiationStatus, setNegotiationStatus] = useState('active'); // active, accepted, rejected, counter
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showComparison, setShowComparison] = useState(false);

  const [professional] = useState({
    id: 1,
    name: 'Dr. João Silva',
    specialty: 'Cardiologia',
    photo: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face',
    rating: 4.9,
    responseTime: '~2h'
  });

  // Carregar plano inicial
  useEffect(() => {
    const savedPlan = JSON.parse(localStorage.getItem('customPlan') || '{}');
    
    if (savedPlan.title) {
      const initialVersion = {
        id: 1,
        version: '1.0',
        title: savedPlan.title,
        description: savedPlan.description,
        pricing: savedPlan.pricing,
        deliverables: savedPlan.deliverables,
        milestones: savedPlan.milestones,
        schedule: savedPlan.schedule,
        terms: savedPlan.terms,
        status: 'pending',
        createdAt: new Date(),
        createdBy: 'client',
        changes: [],
        comments: 'Proposta inicial baseada no plano customizado'
      };
      
      setVersions([initialVersion]);
      setActiveNegotiation(initialVersion);
      
      // Simular resposta do profissional
      setTimeout(() => {
        simulateProfessionalResponse(initialVersion);
      }, 3000);
    }
  }, []);

  // Simular resposta do profissional
  const simulateProfessionalResponse = (clientProposal) => {
    const professionalChanges = {
      pricing: {
        ...clientProposal.pricing,
        basePrice: clientProposal.pricing.basePrice * 1.1, // Aumentar 10%
        totalPrice: clientProposal.pricing.totalPrice * 1.1
      },
      schedule: {
        ...clientProposal.schedule,
        flexibility: 'flexible' // Sugerir mais flexibilidade
      },
      terms: {
        ...clientProposal.terms,
        cancellation: 'Cancelamento gratuito até 48h antes (alterado de 24h)',
        modifications: 'Modificações permitidas até 72h antes do início (alterado de 48h)'
      }
    };

    const professionalVersion = {
      id: 2,
      version: '1.1',
      title: clientProposal.title,
      description: clientProposal.description,
      pricing: professionalChanges.pricing,
      deliverables: clientProposal.deliverables,
      milestones: clientProposal.milestones,
      schedule: professionalChanges.schedule,
      terms: professionalChanges.terms,
      status: 'counter_proposal',
      createdAt: new Date(),
      createdBy: 'professional',
      changes: [
        {
          field: 'pricing.basePrice',
          oldValue: clientProposal.pricing.basePrice,
          newValue: professionalChanges.pricing.basePrice,
          reason: 'Ajuste baseado na complexidade do caso'
        },
        {
          field: 'terms.cancellation',
          oldValue: clientProposal.terms.cancellation,
          newValue: professionalChanges.terms.cancellation,
          reason: 'Política mais flexível para o paciente'
        },
        {
          field: 'schedule.flexibility',
          oldValue: clientProposal.schedule.flexibility,
          newValue: professionalChanges.schedule.flexibility,
          reason: 'Maior flexibilidade de horários'
        }
      ],
      comments: 'Fiz alguns ajustes no preço e nas políticas para melhor atender seu caso. O aumento no preço se deve à complexidade identificada na triagem.'
    };

    setVersions(prev => [...prev, professionalVersion]);
    setCurrentVersion(2);
    setActiveNegotiation(professionalVersion);
    setNegotiationStatus('counter');
    
    // Adicionar mensagem automática
    const autoMessage = {
      id: Date.now(),
      sender: 'professional',
      content: 'Enviei uma contraproposta com alguns ajustes. Você pode revisar as mudanças e aceitar, rejeitar ou fazer uma nova contraproposta.',
      timestamp: new Date(),
      type: 'system'
    };
    
    setMessages(prev => [...prev, autoMessage]);
  };

  // Aceitar proposta
  const acceptProposal = () => {
    const updatedVersion = {
      ...activeNegotiation,
      status: 'accepted',
      acceptedAt: new Date()
    };
    
    setVersions(prev => prev.map(v => v.id === activeNegotiation.id ? updatedVersion : v));
    setActiveNegotiation(updatedVersion);
    setNegotiationStatus('accepted');
    
    // Salvar acordo final
    localStorage.setItem('finalAgreement', JSON.stringify(updatedVersion));
    
    // Navegar para escrow
    setTimeout(() => {
      navigate(`/escrow-payment/${professionalId}`);
    }, 2000);
  };

  // Rejeitar proposta
  const rejectProposal = () => {
    const reason = prompt('Motivo da rejeição (opcional):');
    
    const updatedVersion = {
      ...activeNegotiation,
      status: 'rejected',
      rejectedAt: new Date(),
      rejectionReason: reason
    };
    
    setVersions(prev => prev.map(v => v.id === activeNegotiation.id ? updatedVersion : v));
    setNegotiationStatus('rejected');
    
    const rejectMessage = {
      id: Date.now(),
      sender: 'user',
      content: `Proposta rejeitada. ${reason ? `Motivo: ${reason}` : ''}`,
      timestamp: new Date(),
      type: 'system'
    };
    
    setMessages(prev => [...prev, rejectMessage]);
  };

  // Criar contraproposta
  const createCounterProposal = () => {
    if (Object.keys(proposalChanges).length === 0) {
      alert('Faça pelo menos uma alteração antes de enviar a contraproposta.');
      return;
    }
    
    const newVersion = {
      ...activeNegotiation,
      id: versions.length + 1,
      version: `1.${versions.length}`,
      ...proposalChanges,
      status: 'counter_proposal',
      createdAt: new Date(),
      createdBy: 'client',
      changes: Object.keys(proposalChanges).map(field => ({
        field,
        oldValue: getNestedValue(activeNegotiation, field),
        newValue: getNestedValue(proposalChanges, field),
        reason: 'Ajuste solicitado pelo cliente'
      })),
      comments: newMessage || 'Contraproposta com ajustes solicitados'
    };
    
    setVersions(prev => [...prev, newVersion]);
    setCurrentVersion(newVersion.id);
    setActiveNegotiation(newVersion);
    setProposalChanges({});
    setNewMessage('');
    setNegotiationStatus('counter');
    
    // Simular resposta do profissional
    setTimeout(() => {
      simulateProfessionalCounterResponse(newVersion);
    }, 5000);
  };

  // Simular resposta do profissional à contraproposta
  const simulateProfessionalCounterResponse = (clientCounter) => {
    // Profissional aceita ou faz nova contraproposta
    const shouldAccept = Math.random() > 0.3; // 70% chance de aceitar
    
    if (shouldAccept) {
      const acceptedVersion = {
        ...clientCounter,
        status: 'accepted',
        acceptedAt: new Date(),
        acceptedBy: 'professional'
      };
      
      setVersions(prev => prev.map(v => v.id === clientCounter.id ? acceptedVersion : v));
      setActiveNegotiation(acceptedVersion);
      setNegotiationStatus('accepted');
      
      const acceptMessage = {
        id: Date.now(),
        sender: 'professional',
        content: 'Perfeito! Aceito sua contraproposta. Vamos prosseguir com o pagamento.',
        timestamp: new Date(),
        type: 'system'
      };
      
      setMessages(prev => [...prev, acceptMessage]);
    } else {
      // Nova contraproposta do profissional
      const finalCounter = {
        ...clientCounter,
        id: versions.length + 1,
        version: `1.${versions.length}`,
        pricing: {
          ...clientCounter.pricing,
          basePrice: (clientCounter.pricing.basePrice + activeNegotiation.pricing.basePrice) / 2 // Meio termo
        },
        status: 'counter_proposal',
        createdAt: new Date(),
        createdBy: 'professional',
        changes: [{
          field: 'pricing.basePrice',
          oldValue: clientCounter.pricing.basePrice,
          newValue: (clientCounter.pricing.basePrice + activeNegotiation.pricing.basePrice) / 2,
          reason: 'Proposta de meio termo'
        }],
        comments: 'Que tal encontrarmos um meio termo no preço? Esta é minha proposta final.'
      };
      
      setVersions(prev => [...prev, finalCounter]);
      setCurrentVersion(finalCounter.id);
      setActiveNegotiation(finalCounter);
    }
  };

  // Função auxiliar para acessar valores aninhados
  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  // Atualizar mudanças na proposta
  const updateProposalChange = (field, value) => {
    setProposalChanges(prev => {
      const newChanges = { ...prev };
      const keys = field.split('.');
      let current = newChanges;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newChanges;
    });
  };

  // Enviar mensagem
  const sendMessage = () => {
    if (!newMessage.trim()) return;
    
    const message = {
      id: Date.now(),
      sender: 'user',
      content: newMessage,
      timestamp: new Date(),
      type: 'text'
    };
    
    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  // Comparar versões
  const compareVersions = (v1, v2) => {
    const differences = [];
    
    if (v1.pricing.basePrice !== v2.pricing.basePrice) {
      differences.push({
        field: 'Preço Base',
        v1: `R$ ${v1.pricing.basePrice}`,
        v2: `R$ ${v2.pricing.basePrice}`,
        type: v1.pricing.basePrice < v2.pricing.basePrice ? 'increase' : 'decrease'
      });
    }
    
    if (v1.terms.cancellation !== v2.terms.cancellation) {
      differences.push({
        field: 'Cancelamento',
        v1: v1.terms.cancellation,
        v2: v2.terms.cancellation,
        type: 'change'
      });
    }
    
    return differences;
  };

  // Formatar data
  const formatDate = (date) => {
    return new Date(date).toLocaleString('pt-BR');
  };

  return (
    <Layout>
      <div className="content-main">
        <div className="page-header">
          <h1 className="page-title"><RefreshCw size={16} /> Negociação de Proposta</h1>
          <p className="page-subtitle">Versão {activeNegotiation?.version} • {professional.name}</p>
        </div>

        {/* Status da Negociação */}
        <div className="card-professional" style={{marginBottom: '24px'}}>
          <div className="card-body">
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: 
                    negotiationStatus === 'accepted' ? '#4caf50' :
                    negotiationStatus === 'rejected' ? '#f44336' :
                    negotiationStatus === 'counter' ? '#ff9800' : '#2196f3'
                }}></div>
                <div>
                  <div style={{fontWeight: 'bold'}}>
                    {negotiationStatus === 'accepted' && '<Check size={16} /> Proposta Aceita'}
                    {negotiationStatus === 'rejected' && '<X size={16} /> Proposta Rejeitada'}
                    {negotiationStatus === 'counter' && '<RefreshCw size={16} /> Contraproposta Recebida'}
                    {negotiationStatus === 'active' && '⏳ Aguardando Resposta'}
                  </div>
                  <div style={{fontSize: '14px', color: '#666'}}>
                    {versions.length} versão(ões) • Última atualização: {formatDate(activeNegotiation?.createdAt)}
                  </div>
                </div>
              </div>
              <div style={{display: 'flex', gap: '8px'}}>
                <button 
                  onClick={() => setShowComparison(!showComparison)}
                  style={{
                    padding: '8px 16px',
                    background: '#9c27b0',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  <BarChart3 size={16} /> Comparar
                </button>
                {negotiationStatus === 'accepted' && (
                  <button 
                    onClick={() => navigate(`/escrow-payment/${professionalId}`)}
                    style={{
                      padding: '8px 16px',
                      background: '#4caf50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}
                  >
                    <DollarSign size={16} /> Prosseguir Pagamento
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px'}}>
          {/* Área Principal */}
          <div>
            {/* Proposta Atual */}
            <div className="card-professional" style={{marginBottom: '24px'}}>
              <div className="card-header">
                <h3 className="card-title">
                  <FileText size={16} /> Proposta Atual - Versão {activeNegotiation?.version}
                  <span style={{
                    marginLeft: '12px',
                    padding: '4px 8px',
                    background: 
                      activeNegotiation?.status === 'accepted' ? '#4caf50' :
                      activeNegotiation?.status === 'rejected' ? '#f44336' :
                      activeNegotiation?.status === 'counter_proposal' ? '#ff9800' : '#2196f3',
                    color: 'white',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}>
                    {activeNegotiation?.status === 'accepted' && 'ACEITA'}
                    {activeNegotiation?.status === 'rejected' && 'REJEITADA'}
                    {activeNegotiation?.status === 'counter_proposal' && 'CONTRAPROPOSTA'}
                    {activeNegotiation?.status === 'pending' && 'PENDENTE'}
                  </span>
                </h3>
              </div>
              <div className="card-body">
                {activeNegotiation && (
                  <div style={{display: 'grid', gap: '20px'}}>
                    {/* Informações Básicas */}
                    <div>
                      <h4 style={{margin: '0 0 12px 0', color: '#1976d2'}}>{activeNegotiation.title}</h4>
                      <p style={{margin: '0 0 12px 0', color: '#666'}}>{activeNegotiation.description}</p>
                      <div style={{fontSize: '14px', color: '#666'}}>
                        Criado por: {activeNegotiation.createdBy === 'client' ? 'Você' : professional.name} • {formatDate(activeNegotiation.createdAt)}
                      </div>
                    </div>

                    {/* Preços */}
                    <div style={{
                      padding: '16px',
                      background: '#f5f5f5',
                      borderRadius: '8px',
                      border: '1px solid #e0e0e0'
                    }}>
                      <h4 style={{margin: '0 0 12px 0'}}><DollarSign size={16} /> Preços</h4>
                      <div style={{display: 'grid', gap: '8px'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between'}}>
                          <span>Preço base:</span>
                          <span style={{fontWeight: 'bold'}}>R$ {activeNegotiation.pricing?.basePrice}</span>
                        </div>
                        {activeNegotiation.pricing?.extras?.map((extra) => (
                          <div key={extra.name} style={{display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#666'}}>
                            <span>+ {extra.name}:</span>
                            <span>R$ {extra.price}</span>
                          </div>
                        ))}
                        <hr style={{margin: '8px 0', border: 'none', borderTop: '1px solid #ccc'}} />
                        <div style={{display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '18px', color: '#4caf50'}}>
                          <span>Total:</span>
                          <span>R$ {activeNegotiation.pricing?.totalPrice}</span>
                        </div>
                      </div>
                    </div>

                    {/* Entregáveis */}
                    <div>
                      <h4 style={{margin: '0 0 12px 0'}}>📦 Entregáveis</h4>
                      <div style={{display: 'grid', gap: '8px'}}>
                        {activeNegotiation.deliverables?.map((deliverable, index) => (
                          <div key={index} style={{
                            padding: '8px 12px',
                            background: '#e3f2fd',
                            borderRadius: '6px',
                            fontSize: '14px'
                          }}>
                            ✓ {deliverable}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Termos */}
                    <div>
                      <h4 style={{margin: '0 0 12px 0'}}><FileText size={16} /> Termos e Condições</h4>
                      <div style={{display: 'grid', gap: '12px', fontSize: '14px'}}>
                        <div>
                          <strong>Cancelamento:</strong> {activeNegotiation.terms?.cancellation}
                        </div>
                        <div>
                          <strong>Reembolso:</strong> {activeNegotiation.terms?.refund}
                        </div>
                        <div>
                          <strong>Modificações:</strong> {activeNegotiation.terms?.modifications}
                        </div>
                      </div>
                    </div>

                    {/* Mudanças */}
                    {activeNegotiation.changes && activeNegotiation.changes.length > 0 && (
                      <div>
                        <h4 style={{margin: '0 0 12px 0'}}><RefreshCw size={16} /> Mudanças Nesta Versão</h4>
                        <div style={{display: 'grid', gap: '8px'}}>
                          {activeNegotiation.changes.map((change, index) => (
                            <div key={index} style={{
                              padding: '12px',
                              border: '1px solid #ff9800',
                              borderRadius: '6px',
                              background: '#fff3e0'
                            }}>
                              <div style={{fontWeight: 'bold', marginBottom: '4px'}}>
                                {change.field.replace('.', ' → ')}
                              </div>
                              <div style={{fontSize: '14px', marginBottom: '4px'}}>
                                <span style={{color: '#f44336'}}>De: {change.oldValue}</span>
                                {' → '}
                                <span style={{color: '#4caf50'}}>Para: {change.newValue}</span>
                              </div>
                              <div style={{fontSize: '12px', color: '#666'}}>
                                Motivo: {change.reason}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Comentários */}
                    {activeNegotiation.comments && (
                      <div style={{
                        padding: '16px',
                        background: '#e8f5e8',
                        borderRadius: '8px',
                        border: '1px solid #4caf50'
                      }}>
                        <h4 style={{margin: '0 0 8px 0', color: '#4caf50'}}><MessageCircle size={16} /> Comentários</h4>
                        <p style={{margin: 0, fontSize: '14px'}}>{activeNegotiation.comments}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Ações de Negociação */}
            {negotiationStatus !== 'accepted' && negotiationStatus !== 'rejected' && (
              <div className="card-professional" style={{marginBottom: '24px'}}>
                <div className="card-header">
                  <h3 className="card-title"><Zap size={16} /> Ações de Negociação</h3>
                </div>
                <div className="card-body">
                  <div style={{display: 'grid', gap: '16px'}}>
                    {/* Botões de Ação */}
                    <div style={{display: 'flex', gap: '12px', justifyContent: 'center'}}>
                      <button 
                        onClick={acceptProposal}
                        style={{
                          padding: '12px 24px',
                          background: '#4caf50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          fontSize: '16px'
                        }}
                      >
                        <Check size={16} /> Aceitar Proposta
                      </button>
                      <button 
                        onClick={rejectProposal}
                        style={{
                          padding: '12px 24px',
                          background: '#f44336',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          fontSize: '16px'
                        }}
                      >
                        <X size={16} /> Rejeitar
                      </button>
                    </div>

                    <div style={{textAlign: 'center', color: '#666', fontSize: '14px'}}>
                      ou
                    </div>

                    {/* Fazer Contraproposta */}
                    <div>
                      <h4 style={{margin: '0 0 16px 0'}}><RefreshCw size={16} /> Fazer Contraproposta</h4>
                      
                      <div style={{display: 'grid', gap: '16px'}}>
                        {/* Ajustar Preço */}
                        <div>
                          <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>
                            Novo Preço Base:
                          </label>
                          <input
                            type="number"
                            placeholder={activeNegotiation?.pricing?.basePrice}
                            onChange={(e) => updateProposalChange('pricing.basePrice', parseFloat(e.target.value))}
                            style={{width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '6px'}}
                          />
                        </div>

                        {/* Ajustar Termos */}
                        <div>
                          <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>
                            Política de Cancelamento:
                          </label>
                          <textarea
                            placeholder={activeNegotiation?.terms?.cancellation}
                            onChange={(e) => updateProposalChange('terms.cancellation', e.target.value)}
                            rows="2"
                            style={{width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '6px'}}
                          />
                        </div>

                        {/* Comentário */}
                        <div>
                          <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>
                            Comentário (opcional):
                          </label>
                          <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Explique suas alterações..."
                            rows="3"
                            style={{width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '6px'}}
                          />
                        </div>

                        <button 
                          onClick={createCounterProposal}
                          style={{
                            padding: '12px 24px',
                            background: '#ff9800',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '16px'
                          }}
                        >
                          <RefreshCw size={16} /> Enviar Contraproposta
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Comparação de Versões */}
            {showComparison && versions.length > 1 && (
              <div className="card-professional">
                <div className="card-header">
                  <h3 className="card-title"><BarChart3 size={16} /> Comparação de Versões</h3>
                </div>
                <div className="card-body">
                  <div style={{display: 'grid', gap: '16px'}}>
                    {versions.slice(0, -1).map((version, index) => {
                      const nextVersion = versions[index + 1];
                      const differences = compareVersions(version, nextVersion);
                      
                      return (
                        <div key={version.id} style={{
                          padding: '16px',
                          border: '1px solid #e0e0e0',
                          borderRadius: '8px',
                          background: '#f9f9f9'
                        }}>
                          <h4 style={{margin: '0 0 12px 0'}}>
                            v{version.version} → v{nextVersion.version}
                          </h4>
                          {differences.length > 0 ? (
                            <div style={{display: 'grid', gap: '8px'}}>
                              {differences.map((diff, i) => (
                                <div key={i} style={{fontSize: '14px'}}>
                                  <strong>{diff.field}:</strong>
                                  <span style={{color: '#f44336', marginLeft: '8px'}}>{diff.v1}</span>
                                  {' → '}
                                  <span style={{color: '#4caf50'}}>{diff.v2}</span>
                                  {diff.type === 'increase' && ' <TrendingUp size={16} />'}
                                  {diff.type === 'decrease' && ' 📉'}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div style={{fontSize: '14px', color: '#666'}}>Nenhuma mudança significativa</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div>
            {/* Histórico de Versões */}
            <div className="card-professional" style={{marginBottom: '16px'}}>
              <div className="card-header">
                <h3 className="card-title">📚 Histórico</h3>
              </div>
              <div className="card-body">
                <div style={{display: 'grid', gap: '12px'}}>
                  {versions.map((version) => (
                    <div 
                      key={version.id}
                      onClick={() => {
                        setActiveNegotiation(version);
                        setCurrentVersion(version.id);
                      }}
                      style={{
                        padding: '12px',
                        border: version.id === currentVersion ? '2px solid #4caf50' : '1px solid #e0e0e0',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        background: version.id === currentVersion ? '#e8f5e8' : 'white'
                      }}
                    >
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px'}}>
                        <span style={{fontWeight: 'bold'}}>v{version.version}</span>
                        <span style={{
                          padding: '2px 6px',
                          background: 
                            version.status === 'accepted' ? '#4caf50' :
                            version.status === 'rejected' ? '#f44336' :
                            version.status === 'counter_proposal' ? '#ff9800' : '#2196f3',
                          color: 'white',
                          borderRadius: '8px',
                          fontSize: '10px'
                        }}>
                          {version.status === 'accepted' && 'ACEITA'}
                          {version.status === 'rejected' && 'REJEITADA'}
                          {version.status === 'counter_proposal' && 'CONTRA'}
                          {version.status === 'pending' && 'PENDENTE'}
                        </span>
                      </div>
                      <div style={{fontSize: '12px', color: '#666'}}>
                        {version.createdBy === 'client' ? 'Você' : professional.name}
                      </div>
                      <div style={{fontSize: '12px', color: '#666'}}>
                        {formatDate(version.createdAt)}
                      </div>
                      <div style={{fontSize: '14px', fontWeight: 'bold', color: '#4caf50', marginTop: '4px'}}>
                        R$ {version.pricing?.totalPrice}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Chat Rápido */}
            <div className="card-professional" style={{marginBottom: '16px'}}>
              <div className="card-header">
                <h3 className="card-title"><MessageCircle size={16} /> Chat</h3>
              </div>
              <div className="card-body">
                <div style={{
                  height: '200px',
                  overflowY: 'auto',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  padding: '8px',
                  marginBottom: '12px',
                  background: '#f9f9f9'
                }}>
                  {messages.map((message) => (
                    <div key={message.id} style={{
                      marginBottom: '8px',
                      padding: '8px',
                      borderRadius: '6px',
                      background: message.sender === 'user' ? '#e3f2fd' : '#f3e5f5',
                      fontSize: '14px'
                    }}>
                      <div style={{fontWeight: 'bold', marginBottom: '2px'}}>
                        {message.sender === 'user' ? 'Você' : professional.name}
                      </div>
                      <div>{message.content}</div>
                    </div>
                  ))}
                </div>
                <div style={{display: 'flex', gap: '8px'}}>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Digite uma mensagem..."
                    style={{
                      flex: 1,
                      padding: '8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        sendMessage();
                      }
                    }}
                  />
                  <button 
                    onClick={sendMessage}
                    style={{
                      padding: '8px 12px',
                      background: '#4caf50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    ➤
                  </button>
                </div>
              </div>
            </div>

            {/* Estatísticas */}
            <div className="card-professional">
              <div className="card-header">
                <h3 className="card-title"><BarChart3 size={16} /> Estatísticas</h3>
              </div>
              <div className="card-body">
                <div style={{fontSize: '14px', lineHeight: '1.6'}}>
                  <div style={{marginBottom: '8px'}}>
                    <strong>Versões:</strong> {versions.length}
                  </div>
                  <div style={{marginBottom: '8px'}}>
                    <strong>Tempo de negociação:</strong> {
                      versions.length > 0 ? 
                      Math.round((new Date() - new Date(versions[0].createdAt)) / (1000 * 60)) + ' min' :
                      '0 min'
                    }
                  </div>
                  <div style={{marginBottom: '8px'}}>
                    <strong>Status:</strong> {
                      negotiationStatus === 'accepted' ? '<Check size={16} /> Finalizada' :
                      negotiationStatus === 'rejected' ? '<X size={16} /> Rejeitada' :
                      '<RefreshCw size={16} /> Em andamento'
                    }
                  </div>
                  <div>
                    <strong>Última ação:</strong> {
                      activeNegotiation?.createdBy === 'client' ? 'Você' : professional.name
                    }
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

export default NegotiationVersions;

