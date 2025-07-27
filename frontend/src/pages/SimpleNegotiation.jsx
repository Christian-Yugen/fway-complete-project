import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

const SimpleNegotiation = () => {
  const [activeTab, setActiveTab] = useState('proposals');
  
  const [proposals] = useState([
    {
      id: 1,
      professional: 'Dr. João Silva',
      service: 'Consulta Cardiológica',
      originalPrice: 150,
      proposedPrice: 130,
      status: 'pending',
      description: 'Consulta completa com ECG incluído',
      deadline: '2024-01-15'
    },
    {
      id: 2,
      professional: 'Dra. Maria Santos',
      service: 'Consulta Pediátrica',
      originalPrice: 120,
      proposedPrice: 100,
      status: 'accepted',
      description: 'Consulta de rotina para criança',
      deadline: '2024-01-12'
    }
  ]);

  const acceptProposal = (id) => {
    alert(`Proposta ${id} aceita! Redirecionando para pagamento via Strike...`);
  };

  const counterProposal = (id) => {
    const newPrice = prompt('Digite sua contraproposta:');
    if (newPrice) {
      alert(`Contraproposta de R$ ${newPrice} enviada!`);
    }
  };

  return (
    <Layout>
      <div className="content-main">
        <div className="page-header">
          <h1 className="page-title">💼 Sistema de Negociação Fway</h1>
          <p className="page-subtitle">Negocie preços e condições diretamente na plataforma</p>
        </div>

        {/* Vantagens da Plataforma */}
        <div className="card-professional" style={{marginBottom: '24px', background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)', border: '2px solid #4caf50'}}>
          <div className="card-header">
            <h3 className="card-title"><Star size={16} /> Vantagens de Negociar no Fway</h3>
          </div>
          <div className="card-body">
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px'}}>
              <div style={{padding: '16px', background: 'white', borderRadius: '8px', border: '1px solid #4caf50'}}>
                <h4 style={{color: '#4caf50', marginBottom: '8px'}}><Shield size={16} /> Seguro Incluído</h4>
                <p style={{margin: 0, fontSize: '14px'}}>Proteção automática contra fraudes e problemas</p>
              </div>
              <div style={{padding: '16px', background: 'white', borderRadius: '8px', border: '1px solid #2196f3'}}>
                <h4 style={{color: '#2196f3', marginBottom: '8px'}}><Zap size={16} /> Pagamento Strike</h4>
                <p style={{margin: 0, fontSize: '14px'}}>Pagamentos instantâneos via Bitcoin</p>
              </div>
              <div style={{padding: '16px', background: 'white', borderRadius: '8px', border: '1px solid #ff9800'}}>
                <h4 style={{color: '#ff9800', marginBottom: '8px'}}><Shield size={16} /> Escrow Seguro</h4>
                <p style={{margin: 0, fontSize: '14px'}}>Dinheiro protegido até aprovação do serviço</p>
              </div>
              <div style={{padding: '16px', background: 'white', borderRadius: '8px', border: '1px solid #9c27b0'}}>
                <h4 style={{color: '#9c27b0', marginBottom: '8px'}}><Scale size={16} /> Mediação Gratuita</h4>
                <p style={{margin: 0, fontSize: '14px'}}>Resolução de disputas por especialistas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs de Navegação */}
        <div className="card-professional">
          <div className="card-header">
            <div style={{display: 'flex', gap: '16px', borderBottom: '1px solid #e0e0e0'}}>
              {[
                { id: 'proposals', label: '<PenTool size={16} /> Propostas Ativas' },
                { id: 'chat', label: '<MessageCircle size={16} /> Chat Negociação' },
                { id: 'payment', label: '<Zap size={16} /> Pagamento Strike' },
                { id: 'insurance', label: '<Shield size={16} /> Proteção' }
              ].map((tab) => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '12px 24px',
                    border: 'none',
                    background: activeTab === tab.id ? '#1976d2' : 'transparent',
                    color: activeTab === tab.id ? 'white' : '#666',
                    borderRadius: '8px 8px 0 0',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="card-body">
            {activeTab === 'proposals' && (
              <div>
                <h3 style={{marginBottom: '24px', color: '#1976d2'}}><PenTool size={16} /> Suas Propostas Ativas</h3>
                
                {proposals.map((proposal) => (
                  <div key={proposal.id} style={{
                    padding: '20px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    background: proposal.status === 'accepted' ? '#e8f5e8' : 'white'
                  }}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
                      <div>
                        <h4 style={{margin: 0, color: '#1976d2'}}>{proposal.service}</h4>
                        <p style={{margin: '4px 0', color: '#666'}}>com {proposal.professional}</p>
                      </div>
                      <div style={{textAlign: 'right'}}>
                        <div style={{
                          padding: '4px 12px',
                          borderRadius: '12px',
                          background: proposal.status === 'accepted' ? '#4caf50' : '#ff9800',
                          color: 'white',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          {proposal.status === 'accepted' ? '<Check size={16} /> Aceita' : '⏳ Pendente'}
                        </div>
                      </div>
                    </div>

                    <div style={{marginBottom: '16px'}}>
                      <p style={{margin: '0 0 8px 0', fontSize: '14px'}}>{proposal.description}</p>
                      <div style={{fontSize: '12px', color: '#666'}}>
                        Prazo: {new Date(proposal.deadline).toLocaleDateString('pt-BR')}
                      </div>
                    </div>

                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
                      <div>
                        <span style={{textDecoration: 'line-through', color: '#666'}}>R$ {proposal.originalPrice}</span>
                        <span style={{marginLeft: '8px', fontSize: '18px', fontWeight: 'bold', color: '#4caf50'}}>
                          R$ {proposal.proposedPrice}
                        </span>
                      </div>
                      <div style={{fontSize: '12px', color: '#4caf50'}}>
                        Economia: R$ {proposal.originalPrice - proposal.proposedPrice}
                      </div>
                    </div>

                    <div style={{display: 'flex', gap: '8px'}}>
                      {proposal.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => acceptProposal(proposal.id)}
                            style={{
                              flex: 1,
                              padding: '10px',
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
                            onClick={() => counterProposal(proposal.id)}
                            style={{
                              flex: 1,
                              padding: '10px',
                              background: '#ff9800',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontWeight: 'bold'
                            }}
                          >
                            <MessageCircle size={16} /> Contraproposta
                          </button>
                        </>
                      )}
                      {proposal.status === 'accepted' && (
                        <Link 
                          to={`/payment/${proposal.id}`}
                          style={{
                            flex: 1,
                            padding: '10px',
                            background: '#1976d2',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            textDecoration: 'none',
                            textAlign: 'center',
                            fontWeight: 'bold'
                          }}
                        >
                          <Zap size={16} /> Pagar com Strike
                        </Link>
                      )}
                    </div>
                  </div>
                ))}

                <div style={{textAlign: 'center', marginTop: '24px'}}>
                  <Link 
                    to="/search"
                    style={{
                      padding: '12px 24px',
                      background: '#1976d2',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '8px',
                      fontWeight: 'bold'
                    }}
                  >
                    <Search size={16} /> Buscar Mais Profissionais
                  </Link>
                </div>
              </div>
            )}

            {activeTab === 'chat' && (
              <div style={{textAlign: 'center', padding: '40px'}}>
                <div style={{fontSize: '48px', marginBottom: '16px'}}><MessageCircle size={16} /></div>
                <h3 style={{color: '#1976d2', marginBottom: '16px'}}>Chat de Negociação</h3>
                <p style={{color: '#666', marginBottom: '24px'}}>
                  Negocie diretamente com os profissionais em tempo real
                </p>
                <Link 
                  to="/negotiation-chat/1"
                  style={{
                    padding: '12px 24px',
                    background: '#9c27b0',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontWeight: 'bold'
                  }}
                >
                  <MessageCircle size={16} /> Abrir Chat
                </Link>
              </div>
            )}

            {activeTab === 'payment' && (
              <div style={{textAlign: 'center', padding: '40px'}}>
                <div style={{fontSize: '48px', marginBottom: '16px'}}><Zap size={16} /></div>
                <h3 style={{color: '#1976d2', marginBottom: '16px'}}>Pagamento via Strike</h3>
                <p style={{color: '#666', marginBottom: '24px'}}>
                  Pagamentos instantâneos e seguros com Bitcoin
                </p>
                <Link 
                  to="/payment/1"
                  style={{
                    padding: '12px 24px',
                    background: '#ff9800',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontWeight: 'bold'
                  }}
                >
                  <Zap size={16} /> Ver Sistema de Pagamento
                </Link>
              </div>
            )}

            {activeTab === 'insurance' && (
              <div style={{textAlign: 'center', padding: '40px'}}>
                <div style={{fontSize: '48px', marginBottom: '16px'}}><Shield size={16} /></div>
                <h3 style={{color: '#1976d2', marginBottom: '16px'}}>Sistema de Proteção</h3>
                <p style={{color: '#666', marginBottom: '24px'}}>
                  Seguro completo e proteção contra fraudes
                </p>
                <Link 
                  to="/insurance"
                  style={{
                    padding: '12px 24px',
                    background: '#4caf50',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontWeight: 'bold'
                  }}
                >
                  <Shield size={16} /> Ver Proteções
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Estatísticas da Plataforma */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title"><BarChart3 size={16} /> Por que Negociar no Fway?</h3>
          </div>
          <div className="card-body">
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px'}}>
              <div style={{textAlign: 'center', padding: '16px'}}>
                <div style={{fontSize: '24px', fontWeight: 'bold', color: '#4caf50', marginBottom: '4px'}}>98.5%</div>
                <div style={{fontSize: '14px', color: '#666'}}>Satisfação dos Usuários</div>
              </div>
              <div style={{textAlign: 'center', padding: '16px'}}>
                <div style={{fontSize: '24px', fontWeight: 'bold', color: '#2196f3', marginBottom: '4px'}}>2.3 dias</div>
                <div style={{fontSize: '14px', color: '#666'}}>Tempo Médio de Resolução</div>
              </div>
              <div style={{textAlign: 'center', padding: '16px'}}>
                <div style={{fontSize: '24px', fontWeight: 'bold', color: '#ff9800', marginBottom: '4px'}}>R$ 2.450</div>
                <div style={{fontSize: '14px', color: '#666'}}>Total Protegido</div>
              </div>
              <div style={{textAlign: 'center', padding: '16px'}}>
                <div style={{fontSize: '24px', fontWeight: 'bold', color: '#9c27b0', marginBottom: '4px'}}>0%</div>
                <div style={{fontSize: '14px', color: '#666'}}>Taxa de Fraudes</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SimpleNegotiation;

