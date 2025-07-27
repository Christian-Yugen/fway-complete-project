import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

const StrikePaymentSystem = () => {
  const { negotiationId } = useParams();
  const navigate = useNavigate();
  
  const [paymentStep, setPaymentStep] = useState('overview'); // overview, payment, escrow, confirmation
  const [paymentMethod, setPaymentMethod] = useState('strike');
  const [escrowDetails, setEscrowDetails] = useState({
    totalAmount: 130,
    platformFee: 6.5, // 5%
    insuranceFee: 2.6, // 2%
    netAmount: 120.9,
    btcAmount: 0.00305,
    btcRate: 42623.45
  });

  const [milestones, setMilestones] = useState([
    {
      id: 1,
      title: 'Consulta inicial',
      amount: 65,
      status: 'pending',
      escrowStatus: 'locked',
      releaseDate: null
    },
    {
      id: 2,
      title: 'Relatório final',
      amount: 65,
      status: 'pending',
      escrowStatus: 'locked',
      releaseDate: null
    }
  ]);

  const [strikeInvoice, setStrikeInvoice] = useState({
    invoiceId: 'inv_fway_' + Date.now(),
    amount: 130,
    btcAmount: 0.00305,
    qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    lightningInvoice: 'lnbc1300000n1pjqxqxqpp5...',
    expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutos
  });

  const [paymentStatus, setPaymentStatus] = useState('pending'); // pending, processing, confirmed, failed

  const processPayment = () => {
    setPaymentStep('payment');
    setPaymentStatus('processing');
    
    // Simular processamento do pagamento
    setTimeout(() => {
      setPaymentStatus('confirmed');
      setPaymentStep('escrow');
      
      // Atualizar milestones para escrow
      setMilestones(milestones.map(m => ({
        ...m,
        escrowStatus: 'secured'
      })));
    }, 3000);
  };

  const releaseMilestone = (milestoneId) => {
    setMilestones(milestones.map(m => 
      m.id === milestoneId ? {
        ...m,
        status: 'completed',
        escrowStatus: 'released',
        releaseDate: new Date()
      } : m
    ));
    
    alert('Pagamento liberado para o profissional via Strike!');
  };

  const requestDispute = () => {
    alert('Disputa iniciada. Nossa equipe de mediação entrará em contato em até 24 horas.');
  };

  return (
    <Layout>
      <div className="content-main">
        <div className="page-header">
          <h1 className="page-title"><Zap size={16} /> Pagamento via Strike</h1>
          <p className="page-subtitle">Sistema de pagamento seguro com Bitcoin</p>
        </div>

        {/* Indicador de Progresso */}
        <div className="card-professional" style={{marginBottom: '24px'}}>
          <div className="card-body">
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
              <div style={{
                padding: '8px 16px',
                borderRadius: '20px',
                background: paymentStep === 'overview' ? '#1976d2' : '#e0e0e0',
                color: paymentStep === 'overview' ? 'white' : '#666',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                1. Revisão
              </div>
              <div style={{flex: 1, height: '2px', background: '#e0e0e0', margin: '0 8px'}}></div>
              <div style={{
                padding: '8px 16px',
                borderRadius: '20px',
                background: paymentStep === 'payment' ? '#1976d2' : '#e0e0e0',
                color: paymentStep === 'payment' ? 'white' : '#666',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                2. Pagamento
              </div>
              <div style={{flex: 1, height: '2px', background: '#e0e0e0', margin: '0 8px'}}></div>
              <div style={{
                padding: '8px 16px',
                borderRadius: '20px',
                background: paymentStep === 'escrow' ? '#1976d2' : '#e0e0e0',
                color: paymentStep === 'escrow' ? 'white' : '#666',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                3. Escrow
              </div>
              <div style={{flex: 1, height: '2px', background: '#e0e0e0', margin: '0 8px'}}></div>
              <div style={{
                padding: '8px 16px',
                borderRadius: '20px',
                background: paymentStep === 'confirmation' ? '#1976d2' : '#e0e0e0',
                color: paymentStep === 'confirmation' ? 'white' : '#666',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                4. Conclusão
              </div>
            </div>
          </div>
        </div>

        <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px'}}>
          {/* Área Principal */}
          <div>
            {paymentStep === 'overview' && (
              <div className="card-professional">
                <div className="card-header">
                  <h3 className="card-title"><FileText size={16} /> Revisão do Pagamento</h3>
                </div>
                <div className="card-body">
                  <div style={{marginBottom: '24px'}}>
                    <h4 style={{marginBottom: '16px'}}>Detalhes do Serviço:</h4>
                    <div style={{padding: '16px', background: '#f5f5f5', borderRadius: '8px'}}>
                      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                        <span>Consulta Cardiológica</span>
                        <span>R$ {escrowDetails.totalAmount}</span>
                      </div>
                      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: '#666'}}>
                        <span>Taxa da plataforma (5%)</span>
                        <span>- R$ {escrowDetails.platformFee}</span>
                      </div>
                      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: '#666'}}>
                        <span>Seguro do serviço (2%)</span>
                        <span>- R$ {escrowDetails.insuranceFee}</span>
                      </div>
                      <hr style={{margin: '12px 0'}} />
                      <div style={{display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '18px'}}>
                        <span>Total a pagar:</span>
                        <span>R$ {escrowDetails.totalAmount}</span>
                      </div>
                      <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#666', marginTop: '4px'}}>
                        <span>Equivalente em Bitcoin:</span>
                        <span>₿ {escrowDetails.btcAmount}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{marginBottom: '24px'}}>
                    <h4 style={{marginBottom: '16px'}}><Target size={16} /> Milestones de Pagamento:</h4>
                    {milestones.map((milestone) => (
                      <div key={milestone.id} style={{
                        padding: '12px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        marginBottom: '8px',
                        background: 'white'
                      }}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                          <div>
                            <strong>{milestone.title}</strong>
                            <div style={{fontSize: '12px', color: '#666'}}>
                              Pagamento será liberado após aprovação
                            </div>
                          </div>
                          <div style={{textAlign: 'right'}}>
                            <div style={{fontWeight: 'bold', color: '#4caf50'}}>R$ {milestone.amount}</div>
                            <div style={{fontSize: '12px', color: '#666'}}>
                              {milestone.escrowStatus === 'locked' ? '<Shield size={16} /> Será bloqueado' : '<Check size={16} /> Em escrow'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{marginBottom: '24px'}}>
                    <h4 style={{marginBottom: '16px'}}><Shield size={16} /> Proteções Incluídas:</h4>
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px'}}>
                      <div style={{padding: '12px', background: '#e8f5e8', borderRadius: '8px', border: '1px solid #4caf50'}}>
                        <div style={{fontWeight: 'bold', color: '#4caf50', marginBottom: '4px'}}><Shield size={16} /> Seguro Total</div>
                        <div style={{fontSize: '12px'}}>Cobertura completa contra problemas</div>
                      </div>
                      <div style={{padding: '12px', background: '#e3f2fd', borderRadius: '8px', border: '1px solid #2196f3'}}>
                        <div style={{fontWeight: 'bold', color: '#2196f3', marginBottom: '4px'}}><Shield size={16} /> Escrow Seguro</div>
                        <div style={{fontSize: '12px'}}>Dinheiro protegido até aprovação</div>
                      </div>
                      <div style={{padding: '12px', background: '#fff3e0', borderRadius: '8px', border: '1px solid #ff9800'}}>
                        <div style={{fontWeight: 'bold', color: '#ff9800', marginBottom: '4px'}}><Scale size={16} /> Mediação</div>
                        <div style={{fontSize: '12px'}}>Resolução de disputas profissional</div>
                      </div>
                    </div>
                  </div>

                  <div style={{textAlign: 'center'}}>
                    <button 
                      onClick={processPayment}
                      style={{
                        padding: '16px 32px',
                        background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(255, 152, 0, 0.3)'
                      }}
                    >
                      <Zap size={16} /> Pagar com Strike
                    </button>
                  </div>
                </div>
              </div>
            )}

            {paymentStep === 'payment' && (
              <div className="card-professional">
                <div className="card-header">
                  <h3 className="card-title"><Zap size={16} /> Pagamento via Strike</h3>
                </div>
                <div className="card-body">
                  {paymentStatus === 'processing' && (
                    <div style={{textAlign: 'center', padding: '40px'}}>
                      <div style={{
                        width: '60px',
                        height: '60px',
                        border: '4px solid #e0e0e0',
                        borderTop: '4px solid #ff9800',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 20px'
                      }}></div>
                      <h3 style={{color: '#ff9800', marginBottom: '16px'}}>Processando Pagamento...</h3>
                      <p style={{color: '#666'}}>Aguarde enquanto processamos seu pagamento via Strike</p>
                    </div>
                  )}

                  {paymentStatus === 'confirmed' && (
                    <div style={{textAlign: 'center', padding: '40px'}}>
                      <div style={{
                        width: '80px',
                        height: '80px',
                        background: '#4caf50',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 20px',
                        fontSize: '40px'
                      }}>
                        <Check size={16} />
                      </div>
                      <h3 style={{color: '#4caf50', marginBottom: '16px'}}>Pagamento Confirmado!</h3>
                      <p style={{color: '#666', marginBottom: '20px'}}>
                        Seu pagamento de R$ {escrowDetails.totalAmount} foi confirmado na blockchain
                      </p>
                      <div style={{
                        padding: '16px',
                        background: '#f5f5f5',
                        borderRadius: '8px',
                        marginBottom: '20px'
                      }}>
                        <div style={{fontSize: '14px', color: '#666', marginBottom: '8px'}}>Transaction ID:</div>
                        <div style={{fontFamily: 'monospace', fontSize: '12px', wordBreak: 'break-all'}}>
                          bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh
                        </div>
                      </div>
                      <button 
                        onClick={() => setPaymentStep('escrow')}
                        style={{
                          padding: '12px 24px',
                          background: '#4caf50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        Continuar para Escrow
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {paymentStep === 'escrow' && (
              <div className="card-professional">
                <div className="card-header">
                  <h3 className="card-title"><Shield size={16} /> Gerenciamento de Escrow</h3>
                </div>
                <div className="card-body">
                  <div style={{marginBottom: '24px'}}>
                    <div style={{
                      padding: '16px',
                      background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
                      borderRadius: '8px',
                      border: '2px solid #4caf50',
                      marginBottom: '20px'
                    }}>
                      <h4 style={{color: '#4caf50', marginBottom: '8px'}}><DollarSign size={16} /> Fundos Seguros em Escrow</h4>
                      <p style={{margin: 0, fontSize: '14px'}}>
                        Seus R$ {escrowDetails.totalAmount} estão seguros e serão liberados conforme os milestones forem aprovados.
                      </p>
                    </div>
                  </div>

                  <h4 style={{marginBottom: '16px'}}><Target size={16} /> Controle de Milestones:</h4>
                  {milestones.map((milestone) => (
                    <div key={milestone.id} style={{
                      padding: '16px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      marginBottom: '16px',
                      background: milestone.status === 'completed' ? '#e8f5e8' : 'white'
                    }}>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px'}}>
                        <div>
                          <h5 style={{margin: 0, marginBottom: '4px'}}>{milestone.title}</h5>
                          <div style={{fontSize: '12px', color: '#666'}}>
                            {milestone.status === 'completed' 
                              ? `Liberado em ${milestone.releaseDate?.toLocaleDateString('pt-BR')}`
                              : 'Aguardando aprovação do cliente'
                            }
                          </div>
                        </div>
                        <div style={{textAlign: 'right'}}>
                          <div style={{fontWeight: 'bold', fontSize: '18px', color: '#4caf50'}}>
                            R$ {milestone.amount}
                          </div>
                          <div style={{
                            fontSize: '12px',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            background: milestone.escrowStatus === 'released' ? '#4caf50' : '#ff9800',
                            color: 'white'
                          }}>
                            {milestone.escrowStatus === 'released' ? '<Check size={16} /> Liberado' : '<Shield size={16} /> Em Escrow'}
                          </div>
                        </div>
                      </div>

                      <div style={{display: 'flex', gap: '8px'}}>
                        {milestone.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => releaseMilestone(milestone.id)}
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
                              <Check size={16} /> Aprovar e Liberar
                            </button>
                            <button 
                              onClick={requestDispute}
                              style={{
                                flex: 1,
                                padding: '10px',
                                background: '#f44336',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                              }}
                            >
                              ⚠️ Reportar Problema
                            </button>
                          </>
                        )}
                        {milestone.status === 'completed' && (
                          <div style={{
                            flex: 1,
                            padding: '10px',
                            background: '#e8f5e8',
                            color: '#4caf50',
                            border: '1px solid #4caf50',
                            borderRadius: '6px',
                            textAlign: 'center',
                            fontWeight: 'bold'
                          }}>
                            <Check size={16} /> Milestone Concluído
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  <div style={{
                    padding: '16px',
                    background: '#f5f5f5',
                    borderRadius: '8px',
                    marginTop: '20px'
                  }}>
                    <h5 style={{marginBottom: '12px'}}><Info size={16} /> Como funciona o Escrow:</h5>
                    <ul style={{margin: 0, paddingLeft: '20px', fontSize: '14px', lineHeight: '1.6'}}>
                      <li>Seus fundos ficam seguros até você aprovar cada milestone</li>
                      <li>O profissional só recebe após sua aprovação</li>
                      <li>Em caso de problemas, nossa equipe medeia a situação</li>
                      <li>Você tem 7 dias para aprovar cada milestone</li>
                      <li>Após 7 dias, o pagamento é liberado automaticamente</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div>
            {/* Resumo do Pagamento */}
            <div className="card-professional" style={{marginBottom: '16px'}}>
              <div className="card-header">
                <h3 className="card-title"><DollarSign size={16} /> Resumo</h3>
              </div>
              <div className="card-body">
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                  <span>Valor do serviço:</span>
                  <span>R$ {escrowDetails.totalAmount}</span>
                </div>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: '#666'}}>
                  <span>Taxa Strike:</span>
                  <span>R$ {escrowDetails.platformFee}</span>
                </div>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: '#666'}}>
                  <span>Seguro:</span>
                  <span>R$ {escrowDetails.insuranceFee}</span>
                </div>
                <hr />
                <div style={{display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '16px'}}>
                  <span>Total:</span>
                  <span>R$ {escrowDetails.totalAmount}</span>
                </div>
                <div style={{textAlign: 'center', marginTop: '8px', fontSize: '12px', color: '#666'}}>
                  ≈ ₿ {escrowDetails.btcAmount}
                </div>
              </div>
            </div>

            {/* Status do Pagamento */}
            <div className="card-professional" style={{marginBottom: '16px'}}>
              <div className="card-header">
                <h3 className="card-title"><BarChart3 size={16} /> Status</h3>
              </div>
              <div className="card-body">
                <div style={{textAlign: 'center'}}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: paymentStatus === 'confirmed' ? '#4caf50' : '#ff9800',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px',
                    fontSize: '24px'
                  }}>
                    {paymentStatus === 'confirmed' ? '<Check size={16} />' : '⏳'}
                  </div>
                  <div style={{fontWeight: 'bold', marginBottom: '4px'}}>
                    {paymentStatus === 'confirmed' ? 'Pagamento Confirmado' : 'Processando...'}
                  </div>
                  <div style={{fontSize: '12px', color: '#666'}}>
                    {paymentStatus === 'confirmed' 
                      ? 'Fundos seguros em escrow'
                      : 'Aguardando confirmação'
                    }
                  </div>
                </div>
              </div>
            </div>

            {/* Suporte */}
            <div className="card-professional">
              <div className="card-header">
                <h3 className="card-title">🆘 Suporte</h3>
              </div>
              <div className="card-body">
                <div style={{fontSize: '14px', lineHeight: '1.6'}}>
                  <p style={{margin: '0 0 12px 0'}}>
                    Precisa de ajuda? Nossa equipe está disponível 24/7.
                  </p>
                  <button style={{
                    width: '100%',
                    padding: '10px',
                    background: '#2196f3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    marginBottom: '8px'
                  }}>
                    <MessageCircle size={16} /> Chat de Suporte
                  </button>
                  <button style={{
                    width: '100%',
                    padding: '10px',
                    background: '#4caf50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}>
                    <Phone size={16} /> Ligar Agora
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </Layout>
  );
};

export default StrikePaymentSystem;

