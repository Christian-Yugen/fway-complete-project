import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';

const InsuranceProtectionSystem = () => {
  const { serviceId } = useParams();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [claimForm, setClaimForm] = useState({
    type: '',
    description: '',
    evidence: [],
    amount: '',
    priority: 'medium'
  });

  const [insurancePlans] = useState([
    {
      id: 'basic',
      name: 'Proteção Básica',
      price: 0,
      coverage: 100,
      features: [
        'Proteção contra fraudes',
        'Mediação de disputas',
        'Reembolso em caso de não entrega',
        'Suporte 24/7'
      ],
      included: true
    },
    {
      id: 'premium',
      name: 'Proteção Premium',
      price: 5,
      coverage: 500,
      features: [
        'Todas as proteções básicas',
        'Cobertura para danos médicos',
        'Seguro de responsabilidade civil',
        'Reembolso de despesas extras',
        'Atendimento prioritário',
        'Garantia estendida de 30 dias'
      ],
      included: false
    },
    {
      id: 'enterprise',
      name: 'Proteção Empresarial',
      price: 15,
      coverage: 2000,
      features: [
        'Todas as proteções premium',
        'Cobertura para múltiplos serviços',
        'Seguro de erro profissional',
        'Proteção jurídica completa',
        'Gerente de conta dedicado',
        'SLA de 2 horas para suporte'
      ],
      included: false
    }
  ]);

  const [activeClaims] = useState([
    {
      id: 'CLM001',
      type: 'service_quality',
      title: 'Qualidade do serviço abaixo do esperado',
      status: 'investigating',
      amount: 150,
      createdAt: '2024-01-10',
      description: 'Consulta não atendeu às expectativas descritas',
      evidence: ['chat_logs', 'service_agreement'],
      estimatedResolution: '2024-01-15'
    }
  ]);

  const [protectionStats] = useState({
    totalProtected: 2450.50,
    claimsResolved: 47,
    averageResolutionTime: '2.3 dias',
    satisfactionRate: 98.5,
    fraudsPrevented: 12
  });

  const submitClaim = () => {
    if (claimForm.type && claimForm.description) {
      alert('Reclamação enviada com sucesso! Você receberá uma resposta em até 24 horas.');
      setClaimForm({
        type: '',
        description: '',
        evidence: [],
        amount: '',
        priority: 'medium'
      });
    }
  };

  const upgradeInsurance = (planId) => {
    alert(`Proteção ${planId} ativada! Sua cobertura foi atualizada.`);
  };

  return (
    <Layout>
      <div className="content-main">
        <div className="page-header">
          <h1 className="page-title"><Shield size={16} /> Sistema de Proteção Fway</h1>
          <p className="page-subtitle">Sua segurança é nossa prioridade</p>
        </div>

        {/* Estatísticas de Proteção */}
        <div className="card-professional" style={{marginBottom: '24px', background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)', border: '2px solid #4caf50'}}>
          <div className="card-header">
            <h3 className="card-title"><BarChart3 size={16} /> Estatísticas de Proteção</h3>
          </div>
          <div className="card-body">
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px'}}>
              <div style={{textAlign: 'center', padding: '16px', background: 'white', borderRadius: '8px'}}>
                <div style={{fontSize: '24px', fontWeight: 'bold', color: '#4caf50', marginBottom: '4px'}}>
                  R$ {protectionStats.totalProtected.toLocaleString('pt-BR')}
                </div>
                <div style={{fontSize: '14px', color: '#666'}}>Total Protegido</div>
              </div>
              <div style={{textAlign: 'center', padding: '16px', background: 'white', borderRadius: '8px'}}>
                <div style={{fontSize: '24px', fontWeight: 'bold', color: '#2196f3', marginBottom: '4px'}}>
                  {protectionStats.claimsResolved}
                </div>
                <div style={{fontSize: '14px', color: '#666'}}>Casos Resolvidos</div>
              </div>
              <div style={{textAlign: 'center', padding: '16px', background: 'white', borderRadius: '8px'}}>
                <div style={{fontSize: '24px', fontWeight: 'bold', color: '#ff9800', marginBottom: '4px'}}>
                  {protectionStats.averageResolutionTime}
                </div>
                <div style={{fontSize: '14px', color: '#666'}}>Tempo Médio</div>
              </div>
              <div style={{textAlign: 'center', padding: '16px', background: 'white', borderRadius: '8px'}}>
                <div style={{fontSize: '24px', fontWeight: 'bold', color: '#9c27b0', marginBottom: '4px'}}>
                  {protectionStats.satisfactionRate}%
                </div>
                <div style={{fontSize: '14px', color: '#666'}}>Satisfação</div>
              </div>
              <div style={{textAlign: 'center', padding: '16px', background: 'white', borderRadius: '8px'}}>
                <div style={{fontSize: '24px', fontWeight: 'bold', color: '#f44336', marginBottom: '4px'}}>
                  {protectionStats.fraudsPrevented}
                </div>
                <div style={{fontSize: '14px', color: '#666'}}>Fraudes Evitadas</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs de Navegação */}
        <div className="card-professional">
          <div className="card-header">
            <div style={{display: 'flex', gap: '16px', borderBottom: '1px solid #e0e0e0'}}>
              {[
                { id: 'overview', label: '🏠 Visão Geral', icon: '🏠' },
                { id: 'plans', label: '<FileText size={16} /> Planos', icon: '<FileText size={16} />' },
                { id: 'claims', label: '⚠️ Reclamações', icon: '⚠️' },
                { id: 'protection', label: '<Shield size={16} /> Proteções Ativas', icon: '<Shield size={16} />' }
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
            {activeTab === 'overview' && (
              <div>
                <h3 style={{marginBottom: '24px', color: '#1976d2'}}><Shield size={16} /> Como Funciona Nossa Proteção</h3>
                
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '32px'}}>
                  <div style={{
                    padding: '20px',
                    border: '2px solid #e3f2fd',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)'
                  }}>
                    <h4 style={{color: '#1976d2', marginBottom: '12px'}}><Search size={16} /> Detecção Automática</h4>
                    <p style={{margin: 0, fontSize: '14px', lineHeight: '1.6'}}>
                      Nosso sistema monitora todas as transações 24/7, detectando automaticamente 
                      atividades suspeitas e protegendo você contra fraudes antes que aconteçam.
                    </p>
                  </div>
                  
                  <div style={{
                    padding: '20px',
                    border: '2px solid #e8f5e8',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%)'
                  }}>
                    <h4 style={{color: '#4caf50', marginBottom: '12px'}}><Zap size={16} /> Resposta Rápida</h4>
                    <p style={{margin: 0, fontSize: '14px', lineHeight: '1.6'}}>
                      Em caso de problemas, nossa equipe especializada responde em até 2 horas, 
                      garantindo resolução rápida e eficiente de qualquer situação.
                    </p>
                  </div>
                  
                  <div style={{
                    padding: '20px',
                    border: '2px solid #fff3e0',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #fff3e0 0%, #fce4ec 100%)'
                  }}>
                    <h4 style={{color: '#ff9800', marginBottom: '12px'}}><DollarSign size={16} /> Reembolso Garantido</h4>
                    <p style={{margin: 0, fontSize: '14px', lineHeight: '1.6'}}>
                      Se algo der errado, você recebe 100% do seu dinheiro de volta. 
                      Sem burocracias, sem complicações. Sua satisfação é garantida.
                    </p>
                  </div>
                </div>

                <div style={{marginBottom: '32px'}}>
                  <h4 style={{marginBottom: '16px'}}><Shield size={16} /> Tipos de Proteção Incluídos:</h4>
                  <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px'}}>
                    {[
                      { icon: '<Shield size={16} />', title: 'Proteção Anti-Fraude', desc: 'Verificação de identidade e monitoramento contínuo' },
                      { icon: '<CreditCard size={16} />', title: 'Segurança de Pagamento', desc: 'Transações criptografadas e escrow automático' },
                      { icon: '<Scale size={16} />', title: 'Mediação Profissional', desc: 'Resolução imparcial de disputas por especialistas' },
                      { icon: '<Building size={16} />', title: 'Seguro Médico', desc: 'Cobertura para danos relacionados aos serviços' },
                      { icon: '<Phone size={16} />', title: 'Suporte 24/7', desc: 'Atendimento especializado disponível sempre' },
                      { icon: '<RefreshCw size={16} />', title: 'Garantia de Qualidade', desc: 'Reembolso se o serviço não atender expectativas' }
                    ].map((protection, index) => (
                      <div key={index} style={{
                        padding: '16px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        background: 'white'
                      }}>
                        <div style={{fontSize: '24px', marginBottom: '8px'}}>{protection.icon}</div>
                        <h5 style={{margin: '0 0 8px 0', color: '#1976d2'}}>{protection.title}</h5>
                        <p style={{margin: 0, fontSize: '12px', color: '#666', lineHeight: '1.4'}}>
                          {protection.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{
                  padding: '20px',
                  background: 'linear-gradient(135deg, #f3e5f5 0%, #e1f5fe 100%)',
                  borderRadius: '12px',
                  border: '2px solid #9c27b0'
                }}>
                  <h4 style={{color: '#9c27b0', marginBottom: '12px'}}><Star size={16} /> Por que escolher a Proteção Fway?</h4>
                  <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px'}}>
                    <div>
                      <strong style={{color: '#1976d2'}}><Check size={16} /> Sem Custo Extra</strong>
                      <p style={{margin: '4px 0 0 0', fontSize: '14px'}}>Proteção básica incluída em todos os serviços</p>
                    </div>
                    <div>
                      <strong style={{color: '#1976d2'}}><Check size={16} /> Cobertura Total</strong>
                      <p style={{margin: '4px 0 0 0', fontSize: '14px'}}>Desde fraudes até problemas médicos</p>
                    </div>
                    <div>
                      <strong style={{color: '#1976d2'}}><Check size={16} /> Processo Simples</strong>
                      <p style={{margin: '4px 0 0 0', fontSize: '14px'}}>Reclamações resolvidas em poucos cliques</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'plans' && (
              <div>
                <h3 style={{marginBottom: '24px', color: '#1976d2'}}><FileText size={16} /> Planos de Proteção</h3>
                
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px'}}>
                  {insurancePlans.map((plan) => (
                    <div key={plan.id} style={{
                      border: plan.included ? '3px solid #4caf50' : '2px solid #e0e0e0',
                      borderRadius: '12px',
                      padding: '24px',
                      background: plan.included ? 'linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%)' : 'white',
                      position: 'relative'
                    }}>
                      {plan.included && (
                        <div style={{
                          position: 'absolute',
                          top: '-10px',
                          left: '20px',
                          background: '#4caf50',
                          color: 'white',
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          <Check size={16} /> ATIVO
                        </div>
                      )}
                      
                      <div style={{textAlign: 'center', marginBottom: '20px'}}>
                        <h4 style={{margin: '0 0 8px 0', color: '#1976d2'}}>{plan.name}</h4>
                        <div style={{fontSize: '32px', fontWeight: 'bold', color: plan.price === 0 ? '#4caf50' : '#ff9800'}}>
                          {plan.price === 0 ? 'GRÁTIS' : `R$ ${plan.price}`}
                        </div>
                        {plan.price > 0 && (
                          <div style={{fontSize: '12px', color: '#666'}}>por serviço</div>
                        )}
                        <div style={{fontSize: '14px', color: '#666', marginTop: '8px'}}>
                          Cobertura até R$ {plan.coverage.toLocaleString('pt-BR')}
                        </div>
                      </div>

                      <div style={{marginBottom: '20px'}}>
                        <h5 style={{marginBottom: '12px'}}>Inclui:</h5>
                        <ul style={{margin: 0, paddingLeft: '20px', fontSize: '14px', lineHeight: '1.6'}}>
                          {plan.features.map((feature, index) => (
                            <li key={index} style={{marginBottom: '4px'}}>{feature}</li>
                          ))}
                        </ul>
                      </div>

                      <div style={{textAlign: 'center'}}>
                        {plan.included ? (
                          <div style={{
                            padding: '12px',
                            background: '#4caf50',
                            color: 'white',
                            borderRadius: '8px',
                            fontWeight: 'bold'
                          }}>
                            <Check size={16} /> Plano Ativo
                          </div>
                        ) : (
                          <button 
                            onClick={() => upgradeInsurance(plan.id)}
                            style={{
                              width: '100%',
                              padding: '12px',
                              background: '#1976d2',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontWeight: 'bold'
                            }}
                          >
                            <Rocket size={16} /> Ativar Plano
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{
                  marginTop: '32px',
                  padding: '20px',
                  background: '#f5f5f5',
                  borderRadius: '8px'
                }}>
                  <h4 style={{marginBottom: '12px'}}>❓ Qual plano escolher?</h4>
                  <div style={{fontSize: '14px', lineHeight: '1.6'}}>
                    <p><strong>Proteção Básica:</strong> Ideal para serviços simples e consultas básicas.</p>
                    <p><strong>Proteção Premium:</strong> Recomendada para procedimentos médicos e serviços de maior valor.</p>
                    <p><strong>Proteção Empresarial:</strong> Perfeita para empresas que usam múltiplos serviços regularmente.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'claims' && (
              <div>
                <h3 style={{marginBottom: '24px', color: '#1976d2'}}>⚠️ Central de Reclamações</h3>
                
                {/* Formulário de Nova Reclamação */}
                <div style={{marginBottom: '32px'}}>
                  <h4 style={{marginBottom: '16px'}}><PenTool size={16} /> Abrir Nova Reclamação</h4>
                  <div style={{
                    padding: '20px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    background: '#f9f9f9'
                  }}>
                    <div style={{display: 'grid', gap: '16px'}}>
                      <div>
                        <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>Tipo de Problema:</label>
                        <select
                          value={claimForm.type}
                          onChange={(e) => setClaimForm({...claimForm, type: e.target.value})}
                          style={{width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '6px'}}
                        >
                          <option value="">Selecione o tipo</option>
                          <option value="service_quality">Qualidade do serviço</option>
                          <option value="no_delivery">Serviço não entregue</option>
                          <option value="fraud">Suspeita de fraude</option>
                          <option value="medical_issue">Problema médico</option>
                          <option value="payment_issue">Problema de pagamento</option>
                          <option value="other">Outro</option>
                        </select>
                      </div>
                      
                      <div>
                        <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>Descrição Detalhada:</label>
                        <textarea
                          value={claimForm.description}
                          onChange={(e) => setClaimForm({...claimForm, description: e.target.value})}
                          placeholder="Descreva o problema em detalhes..."
                          rows="4"
                          style={{width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '6px'}}
                        />
                      </div>
                      
                      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                        <div>
                          <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>Valor Envolvido (R$):</label>
                          <input
                            type="number"
                            value={claimForm.amount}
                            onChange={(e) => setClaimForm({...claimForm, amount: e.target.value})}
                            placeholder="150.00"
                            style={{width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '6px'}}
                          />
                        </div>
                        <div>
                          <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>Prioridade:</label>
                          <select
                            value={claimForm.priority}
                            onChange={(e) => setClaimForm({...claimForm, priority: e.target.value})}
                            style={{width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '6px'}}
                          >
                            <option value="low">Baixa</option>
                            <option value="medium">Média</option>
                            <option value="high">Alta</option>
                            <option value="urgent">Urgente</option>
                          </select>
                        </div>
                      </div>
                      
                      <div style={{textAlign: 'center'}}>
                        <button 
                          onClick={submitClaim}
                          style={{
                            padding: '12px 32px',
                            background: '#f44336',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                          }}
                        >
                          📤 Enviar Reclamação
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reclamações Ativas */}
                <div>
                  <h4 style={{marginBottom: '16px'}}><FileText size={16} /> Suas Reclamações</h4>
                  {activeClaims.length > 0 ? (
                    activeClaims.map((claim) => (
                      <div key={claim.id} style={{
                        padding: '20px',
                        border: '2px solid #e0e0e0',
                        borderRadius: '8px',
                        marginBottom: '16px',
                        background: 'white'
                      }}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px'}}>
                          <div>
                            <h5 style={{margin: 0, color: '#1976d2'}}>#{claim.id} - {claim.title}</h5>
                            <div style={{fontSize: '12px', color: '#666', marginTop: '4px'}}>
                              Aberto em {new Date(claim.createdAt).toLocaleDateString('pt-BR')}
                            </div>
                          </div>
                          <div style={{textAlign: 'right'}}>
                            <div style={{
                              padding: '4px 12px',
                              borderRadius: '12px',
                              background: claim.status === 'investigating' ? '#fff3cd' : '#d4edda',
                              color: claim.status === 'investigating' ? '#856404' : '#155724',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              marginBottom: '4px'
                            }}>
                              {claim.status === 'investigating' ? '<Search size={16} /> Investigando' : '<Check size={16} /> Resolvido'}
                            </div>
                            <div style={{fontSize: '14px', fontWeight: 'bold', color: '#f44336'}}>
                              R$ {claim.amount}
                            </div>
                          </div>
                        </div>
                        
                        <p style={{margin: '0 0 12px 0', fontSize: '14px', lineHeight: '1.6'}}>
                          {claim.description}
                        </p>
                        
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#666'}}>
                          <div>
                            Evidências: {claim.evidence.join(', ')}
                          </div>
                          <div>
                            Resolução estimada: {new Date(claim.estimatedResolution).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{
                      textAlign: 'center',
                      padding: '40px',
                      background: '#f5f5f5',
                      borderRadius: '8px'
                    }}>
                      <div style={{fontSize: '48px', marginBottom: '16px'}}>😊</div>
                      <h4 style={{color: '#4caf50', marginBottom: '8px'}}>Nenhuma reclamação ativa</h4>
                      <p style={{margin: 0, color: '#666'}}>Ótimo! Você não tem reclamações pendentes.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'protection' && (
              <div>
                <h3 style={{marginBottom: '24px', color: '#1976d2'}}><Shield size={16} /> Suas Proteções Ativas</h3>
                
                <div style={{display: 'grid', gap: '16px'}}>
                  {[
                    {
                      title: '<Shield size={16} /> Proteção Anti-Fraude',
                      status: 'active',
                      description: 'Monitoramento 24/7 de atividades suspeitas',
                      lastCheck: '2024-01-10T15:30:00',
                      coverage: 'Ilimitada'
                    },
                    {
                      title: '<CreditCard size={16} /> Escrow Automático',
                      status: 'active',
                      description: 'Pagamentos protegidos até aprovação',
                      lastCheck: '2024-01-10T15:30:00',
                      coverage: 'Todos os pagamentos'
                    },
                    {
                      title: '<Scale size={16} /> Mediação de Disputas',
                      status: 'active',
                      description: 'Resolução profissional de conflitos',
                      lastCheck: '2024-01-10T15:30:00',
                      coverage: 'Até R$ 5.000'
                    },
                    {
                      title: '<Building size={16} /> Seguro Médico',
                      status: 'premium',
                      description: 'Cobertura para danos relacionados aos serviços',
                      lastCheck: '2024-01-10T15:30:00',
                      coverage: 'Até R$ 10.000'
                    },
                    {
                      title: '<Phone size={16} /> Suporte Prioritário',
                      status: 'premium',
                      description: 'Atendimento especializado 24/7',
                      lastCheck: '2024-01-10T15:30:00',
                      coverage: 'Resposta em 2h'
                    }
                  ].map((protection, index) => (
                    <div key={index} style={{
                      padding: '20px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      background: protection.status === 'active' ? 'linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%)' : 
                                 protection.status === 'premium' ? 'linear-gradient(135deg, #fff3e0 0%, #fce4ec 100%)' : 'white'
                    }}>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px'}}>
                        <h4 style={{margin: 0, color: '#1976d2'}}>{protection.title}</h4>
                        <div style={{
                          padding: '4px 12px',
                          borderRadius: '12px',
                          background: protection.status === 'active' ? '#4caf50' : '#ff9800',
                          color: 'white',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          {protection.status === 'active' ? '<Check size={16} /> ATIVO' : '<Star size={16} /> PREMIUM'}
                        </div>
                      </div>
                      
                      <p style={{margin: '0 0 12px 0', fontSize: '14px', color: '#666'}}>
                        {protection.description}
                      </p>
                      
                      <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666'}}>
                        <div>
                          <strong>Cobertura:</strong> {protection.coverage}
                        </div>
                        <div>
                          <strong>Última verificação:</strong> {new Date(protection.lastCheck).toLocaleString('pt-BR')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{
                  marginTop: '32px',
                  padding: '20px',
                  background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)',
                  borderRadius: '8px',
                  border: '2px solid #1976d2'
                }}>
                  <h4 style={{color: '#1976d2', marginBottom: '12px'}}><Lightbulb size={16} /> Dica de Segurança</h4>
                  <p style={{margin: 0, fontSize: '14px', lineHeight: '1.6'}}>
                    Mantenha sempre suas informações atualizadas e reporte qualquer atividade suspeita imediatamente. 
                    Nossa equipe está sempre monitorando para garantir sua segurança.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default InsuranceProtectionSystem;

