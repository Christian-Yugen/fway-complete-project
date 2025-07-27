import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

const EscrowPaymentSystem = () => {
  const { professionalId } = useParams();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(1); // 1: payment, 2: escrow, 3: execution, 4: completion
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [escrowStatus, setEscrowStatus] = useState('pending'); // pending, secured, released, disputed
  const [serviceStatus, setServiceStatus] = useState('scheduled'); // scheduled, in_progress, completed, cancelled
  const [location, setLocation] = useState(null);
  const [checkInStatus, setCheckInStatus] = useState(false);
  const [serviceReport, setServiceReport] = useState({
    startTime: null,
    endTime: null,
    observations: '',
    patientSignature: '',
    photos: [],
    vitals: {},
    recommendations: ''
  });
  
  const [agreement, setAgreement] = useState(null);
  const [professional] = useState({
    id: 1,
    name: 'Dr. João Silva',
    specialty: 'Cardiologia',
    photo: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face',
    rating: 4.9,
    location: { lat: -23.5505, lng: -46.6333 } // São Paulo
  });

  const [milestones, setMilestones] = useState([]);
  const [currentMilestone, setCurrentMilestone] = useState(0);
  const [gpsTracking, setGpsTracking] = useState(false);
  const [distanceToPatient, setDistanceToPatient] = useState(null);

  // Carregar acordo final
  useEffect(() => {
    const finalAgreement = JSON.parse(localStorage.getItem('finalAgreement') || '{}');
    if (finalAgreement.title) {
      setAgreement(finalAgreement);
      
      // Configurar marcos baseados no acordo
      const agreementMilestones = finalAgreement.milestones || [
        { name: 'Pagamento confirmado', percentage: 25, status: 'pending' },
        { name: 'Profissional a caminho', percentage: 50, status: 'pending' },
        { name: 'Atendimento realizado', percentage: 90, status: 'pending' },
        { name: 'Relatório entregue', percentage: 100, status: 'pending' }
      ];
      
      setMilestones(agreementMilestones);
    }
  }, []);

  // Solicitar localização
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          console.error('Erro ao obter localização:', error);
        }
      );
    }
  }, []);

  // Simular rastreamento GPS
  useEffect(() => {
    if (gpsTracking && location && professional.location) {
      const interval = setInterval(() => {
        // Calcular distância simulada
        const distance = calculateDistance(
          location.lat, location.lng,
          professional.location.lat, professional.location.lng
        );
        setDistanceToPatient(distance);
        
        // Simular aproximação do profissional
        if (distance < 0.5) { // Menos de 500m
          setCheckInStatus(true);
          setGpsTracking(false);
          updateMilestone(1, 'completed');
        }
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [gpsTracking, location]);

  // Calcular distância entre dois pontos
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Processar pagamento
  const processPayment = () => {
    setCurrentStep(2);
    setEscrowStatus('secured');
    updateMilestone(0, 'completed');
    
    // Simular confirmação de pagamento
    setTimeout(() => {
      setServiceStatus('confirmed');
      // Iniciar rastreamento GPS
      setGpsTracking(true);
    }, 2000);
  };

  // Atualizar marco
  const updateMilestone = (index, status) => {
    setMilestones(prev => prev.map((milestone, i) => 
      i === index ? { ...milestone, status } : milestone
    ));
    
    if (status === 'completed') {
      setCurrentMilestone(Math.max(currentMilestone, index + 1));
    }
  };

  // Check-in do profissional
  const professionalCheckIn = () => {
    setServiceStatus('in_progress');
    setServiceReport(prev => ({
      ...prev,
      startTime: new Date()
    }));
    updateMilestone(2, 'in_progress');
    setCurrentStep(3);
  };

  // Finalizar atendimento
  const completeService = () => {
    setServiceReport(prev => ({
      ...prev,
      endTime: new Date()
    }));
    setServiceStatus('completed');
    updateMilestone(2, 'completed');
    setCurrentStep(4);
    
    // Liberar pagamento do escrow
    setTimeout(() => {
      setEscrowStatus('released');
      updateMilestone(3, 'completed');
    }, 1000);
  };

  // Adicionar foto ao relatório
  const addPhoto = (event) => {
    const files = Array.from(event.target.files);
    const newPhotos = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      url: URL.createObjectURL(file),
      timestamp: new Date()
    }));
    
    setServiceReport(prev => ({
      ...prev,
      photos: [...prev.photos, ...newPhotos]
    }));
  };

  // Gerar PDF do relatório
  const generateReport = () => {
    const reportData = {
      ...serviceReport,
      agreement,
      professional,
      patient: 'Paciente Exemplo',
      date: new Date(),
      duration: serviceReport.endTime && serviceReport.startTime ? 
        Math.round((new Date(serviceReport.endTime) - new Date(serviceReport.startTime)) / (1000 * 60)) : 0
    };
    
    // Simular geração de PDF
    console.log('Gerando PDF:', reportData);
    alert('Relatório PDF gerado com sucesso!');
    
    // Navegar para avaliações
    navigate(`/service-review/${professionalId}`);
  };

  // Abrir disputa
  const openDispute = () => {
    setEscrowStatus('disputed');
    alert('Disputa aberta. Nossa equipe entrará em contato em até 24h.');
  };

  // Formatar tempo
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('pt-BR');
  };

  // Formatar duração
  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  return (
    <Layout>
      <div className="content-main">
        <div className="page-header">
          <h1 className="page-title"><DollarSign size={16} /> Sistema de Pagamento Seguro</h1>
          <p className="page-subtitle">Escrow • GPS • Execução • {agreement?.title}</p>
        </div>

        {/* Indicador de Progresso */}
        <div className="card-professional" style={{marginBottom: '24px'}}>
          <div className="card-body">
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
              {[1, 2, 3, 4].map((step) => (
                <div key={step} style={{
                  display: 'flex',
                  alignItems: 'center',
                  flex: step < 4 ? 1 : 0
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: currentStep >= step ? '#4caf50' : '#e0e0e0',
                    color: currentStep >= step ? 'white' : '#666',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '14px'
                  }}>
                    {step === 1 && '<CreditCard size={16} />'}
                    {step === 2 && '<Shield size={16} />'}
                    {step === 3 && '<Building size={16} />'}
                    {step === 4 && '<Check size={16} />'}
                  </div>
                  {step < 4 && (
                    <div style={{
                      flex: 1,
                      height: '2px',
                      background: currentStep > step ? '#4caf50' : '#e0e0e0',
                      margin: '0 8px'
                    }}></div>
                  )}
                </div>
              ))}
            </div>
            <div style={{textAlign: 'center', fontSize: '14px', color: '#666'}}>
              {currentStep === 1 && 'Pagamento'}
              {currentStep === 2 && 'Escrow Ativo'}
              {currentStep === 3 && 'Execução do Serviço'}
              {currentStep === 4 && 'Finalização'}
            </div>
          </div>
        </div>

        <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px'}}>
          {/* Área Principal */}
          <div>
            {/* Passo 1: Pagamento */}
            {currentStep === 1 && (
              <div className="card-professional">
                <div className="card-header">
                  <h3 className="card-title"><CreditCard size={16} /> Processamento de Pagamento</h3>
                </div>
                <div className="card-body">
                  <div style={{display: 'grid', gap: '20px'}}>
                    {/* Resumo do Acordo */}
                    {agreement && (
                      <div style={{
                        padding: '20px',
                        background: '#f5f5f5',
                        borderRadius: '8px',
                        border: '1px solid #e0e0e0'
                      }}>
                        <h4 style={{margin: '0 0 16px 0'}}><FileText size={16} /> Resumo do Acordo</h4>
                        <div style={{display: 'grid', gap: '8px', fontSize: '14px'}}>
                          <div><strong>Serviço:</strong> {agreement.title}</div>
                          <div><strong>Profissional:</strong> {professional.name}</div>
                          <div><strong>Valor Total:</strong> R$ {agreement.pricing?.totalPrice}</div>
                          <div><strong>Duração:</strong> {agreement.duration}</div>
                        </div>
                      </div>
                    )}

                    {/* Métodos de Pagamento */}
                    <div>
                      <h4 style={{margin: '0 0 16px 0'}}><CreditCard size={16} /> Método de Pagamento</h4>
                      <div style={{display: 'grid', gap: '12px'}}>
                        <div 
                          onClick={() => setPaymentMethod('stripe')}
                          style={{
                            padding: '16px',
                            border: paymentMethod === 'stripe' ? '2px solid #4caf50' : '1px solid #e0e0e0',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            background: paymentMethod === 'stripe' ? '#e8f5e8' : 'white',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                          }}
                        >
                          <div style={{fontSize: '24px'}}><CreditCard size={16} /></div>
                          <div>
                            <div style={{fontWeight: 'bold'}}>Cartão de Crédito/Débito</div>
                            <div style={{fontSize: '14px', color: '#666'}}>Visa, Mastercard, Elo - Processado via Stripe</div>
                          </div>
                        </div>
                        
                        <div 
                          onClick={() => setPaymentMethod('pix')}
                          style={{
                            padding: '16px',
                            border: paymentMethod === 'pix' ? '2px solid #4caf50' : '1px solid #e0e0e0',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            background: paymentMethod === 'pix' ? '#e8f5e8' : 'white',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                          }}
                        >
                          <div style={{fontSize: '24px'}}><Zap size={16} /></div>
                          <div>
                            <div style={{fontWeight: 'bold'}}>PIX</div>
                            <div style={{fontSize: '14px', color: '#666'}}>Transferência instantânea</div>
                          </div>
                        </div>

                        <div 
                          onClick={() => setPaymentMethod('bitcoin')}
                          style={{
                            padding: '16px',
                            border: paymentMethod === 'bitcoin' ? '2px solid #4caf50' : '1px solid #e0e0e0',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            background: paymentMethod === 'bitcoin' ? '#e8f5e8' : 'white',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                          }}
                        >
                          <div style={{fontSize: '24px'}}>₿</div>
                          <div>
                            <div style={{fontWeight: 'bold'}}>Bitcoin (Strike)</div>
                            <div style={{fontSize: '14px', color: '#666'}}>Pagamento via Lightning Network</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Proteções do Escrow */}
                    <div style={{
                      padding: '20px',
                      background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
                      borderRadius: '8px',
                      border: '2px solid #4caf50'
                    }}>
                      <h4 style={{margin: '0 0 16px 0', color: '#4caf50'}}><Shield size={16} /> Proteções do Escrow</h4>
                      <div style={{display: 'grid', gap: '8px', fontSize: '14px'}}>
                        <div><Check size={16} /> Pagamento retido até conclusão do serviço</div>
                        <div><Check size={16} /> Reembolso automático em caso de não comparecimento</div>
                        <div><Check size={16} /> Sistema de disputas com mediação profissional</div>
                        <div><Check size={16} /> Seguro de responsabilidade civil incluído</div>
                        <div><Check size={16} /> Rastreamento GPS para transparência</div>
                      </div>
                    </div>

                    <button 
                      onClick={processPayment}
                      style={{
                        padding: '16px 32px',
                        background: '#4caf50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '18px',
                        width: '100%'
                      }}
                    >
                      <Shield size={16} /> Processar Pagamento Seguro - R$ {agreement?.pricing?.totalPrice}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Passo 2: Escrow Ativo */}
            {currentStep === 2 && (
              <div className="card-professional">
                <div className="card-header">
                  <h3 className="card-title"><Shield size={16} /> Escrow Ativo - Aguardando Profissional</h3>
                </div>
                <div className="card-body">
                  <div style={{display: 'grid', gap: '20px'}}>
                    {/* Status do Pagamento */}
                    <div style={{
                      padding: '20px',
                      background: '#e8f5e8',
                      borderRadius: '8px',
                      border: '2px solid #4caf50',
                      textAlign: 'center'
                    }}>
                      <div style={{fontSize: '48px', marginBottom: '16px'}}><Check size={16} /></div>
                      <h4 style={{margin: '0 0 8px 0', color: '#4caf50'}}>Pagamento Confirmado</h4>
                      <p style={{margin: 0, fontSize: '14px'}}>
                        Valor de R$ {agreement?.pricing?.totalPrice} está seguro em escrow
                      </p>
                    </div>

                    {/* Rastreamento GPS */}
                    {gpsTracking && (
                      <div style={{
                        padding: '20px',
                        background: '#e3f2fd',
                        borderRadius: '8px',
                        border: '2px solid #2196f3'
                      }}>
                        <h4 style={{margin: '0 0 16px 0', color: '#2196f3'}}><MapPin size={16} /> Rastreamento GPS Ativo</h4>
                        <div style={{display: 'grid', gap: '12px', fontSize: '14px'}}>
                          <div>
                            <strong>Profissional:</strong> {professional.name} está a caminho
                          </div>
                          {distanceToPatient && (
                            <div>
                              <strong>Distância:</strong> {distanceToPatient.toFixed(1)} km
                            </div>
                          )}
                          <div>
                            <strong>Tempo estimado:</strong> {distanceToPatient ? Math.round(distanceToPatient * 3) : 15} minutos
                          </div>
                          <div style={{
                            width: '100%',
                            height: '8px',
                            background: '#e0e0e0',
                            borderRadius: '4px',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              width: distanceToPatient ? `${Math.max(10, 100 - distanceToPatient * 20)}%` : '20%',
                              height: '100%',
                              background: '#2196f3',
                              transition: 'width 0.3s ease'
                            }}></div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Check-in do Profissional */}
                    {checkInStatus && (
                      <div style={{
                        padding: '20px',
                        background: '#fff3e0',
                        borderRadius: '8px',
                        border: '2px solid #ff9800',
                        textAlign: 'center'
                      }}>
                        <div style={{fontSize: '48px', marginBottom: '16px'}}><MapPin size={16} /></div>
                        <h4 style={{margin: '0 0 8px 0', color: '#ff9800'}}>Profissional Chegou!</h4>
                        <p style={{margin: '0 0 16px 0', fontSize: '14px'}}>
                          {professional.name} está no local e pronto para iniciar o atendimento
                        </p>
                        <button 
                          onClick={professionalCheckIn}
                          style={{
                            padding: '12px 24px',
                            background: '#ff9800',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                          }}
                        >
                          <Check size={16} /> Confirmar Início do Atendimento
                        </button>
                      </div>
                    )}

                    {/* Ações de Emergência */}
                    <div style={{
                      padding: '16px',
                      background: '#ffebee',
                      borderRadius: '8px',
                      border: '1px solid #f44336'
                    }}>
                      <h4 style={{margin: '0 0 12px 0', color: '#f44336'}}>🚨 Ações de Emergência</h4>
                      <div style={{display: 'flex', gap: '12px'}}>
                        <button 
                          onClick={() => alert('Contato de emergência acionado!')}
                          style={{
                            padding: '8px 16px',
                            background: '#f44336',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px'
                          }}
                        >
                          <Phone size={16} /> Emergência
                        </button>
                        <button 
                          onClick={openDispute}
                          style={{
                            padding: '8px 16px',
                            background: '#ff9800',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px'
                          }}
                        >
                          ⚠️ Abrir Disputa
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Passo 3: Execução do Serviço */}
            {currentStep === 3 && (
              <div className="card-professional">
                <div className="card-header">
                  <h3 className="card-title"><Building size={16} /> Atendimento em Andamento</h3>
                </div>
                <div className="card-body">
                  <div style={{display: 'grid', gap: '20px'}}>
                    {/* Status do Atendimento */}
                    <div style={{
                      padding: '20px',
                      background: '#e3f2fd',
                      borderRadius: '8px',
                      border: '2px solid #2196f3'
                    }}>
                      <h4 style={{margin: '0 0 16px 0', color: '#2196f3'}}>⏱️ Atendimento Iniciado</h4>
                      <div style={{display: 'grid', gap: '8px', fontSize: '14px'}}>
                        <div><strong>Início:</strong> {formatTime(serviceReport.startTime)}</div>
                        <div><strong>Profissional:</strong> {professional.name}</div>
                        <div><strong>Serviço:</strong> {agreement?.title}</div>
                        <div><strong>Duração prevista:</strong> {agreement?.duration}</div>
                      </div>
                    </div>

                    {/* Formulário de Relatório */}
                    <div>
                      <h4 style={{margin: '0 0 16px 0'}}><PenTool size={16} /> Registro do Atendimento</h4>
                      
                      <div style={{display: 'grid', gap: '16px'}}>
                        {/* Observações */}
                        <div>
                          <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>
                            Observações do Atendimento:
                          </label>
                          <textarea
                            value={serviceReport.observations}
                            onChange={(e) => setServiceReport(prev => ({...prev, observations: e.target.value}))}
                            placeholder="Descreva o que foi realizado durante o atendimento..."
                            rows="4"
                            style={{width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '6px'}}
                          />
                        </div>

                        {/* Sinais Vitais */}
                        <div>
                          <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>
                            Sinais Vitais (opcional):
                          </label>
                          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px'}}>
                            <input
                              type="text"
                              placeholder="Pressão Arterial"
                              onChange={(e) => setServiceReport(prev => ({
                                ...prev, 
                                vitals: {...prev.vitals, bloodPressure: e.target.value}
                              }))}
                              style={{padding: '8px', border: '1px solid #ccc', borderRadius: '4px'}}
                            />
                            <input
                              type="text"
                              placeholder="Frequência Cardíaca"
                              onChange={(e) => setServiceReport(prev => ({
                                ...prev, 
                                vitals: {...prev.vitals, heartRate: e.target.value}
                              }))}
                              style={{padding: '8px', border: '1px solid #ccc', borderRadius: '4px'}}
                            />
                            <input
                              type="text"
                              placeholder="Temperatura"
                              onChange={(e) => setServiceReport(prev => ({
                                ...prev, 
                                vitals: {...prev.vitals, temperature: e.target.value}
                              }))}
                              style={{padding: '8px', border: '1px solid #ccc', borderRadius: '4px'}}
                            />
                          </div>
                        </div>

                        {/* Fotos */}
                        <div>
                          <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>
                            Fotos do Atendimento:
                          </label>
                          <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
                            <label style={{
                              padding: '12px 24px',
                              background: '#2196f3',
                              color: 'white',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '14px'
                            }}>
                              <Camera size={16} /> Adicionar Fotos
                              <input 
                                type="file" 
                                multiple 
                                accept="image/*"
                                onChange={addPhoto}
                                style={{display: 'none'}}
                              />
                            </label>
                            <span style={{fontSize: '14px', color: '#666'}}>
                              {serviceReport.photos.length} foto(s) adicionada(s)
                            </span>
                          </div>
                          
                          {serviceReport.photos.length > 0 && (
                            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '8px', marginTop: '12px'}}>
                              {serviceReport.photos.map((photo) => (
                                <div key={photo.id} style={{
                                  width: '100px',
                                  height: '100px',
                                  borderRadius: '6px',
                                  overflow: 'hidden',
                                  border: '1px solid #e0e0e0'
                                }}>
                                  <img 
                                    src={photo.url} 
                                    alt={photo.name}
                                    style={{width: '100%', height: '100%', objectFit: 'cover'}}
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Recomendações */}
                        <div>
                          <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>
                            Recomendações e Orientações:
                          </label>
                          <textarea
                            value={serviceReport.recommendations}
                            onChange={(e) => setServiceReport(prev => ({...prev, recommendations: e.target.value}))}
                            placeholder="Orientações para o paciente, medicações, cuidados..."
                            rows="3"
                            style={{width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '6px'}}
                          />
                        </div>

                        {/* Assinatura Digital */}
                        <div>
                          <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>
                            Assinatura Digital do Paciente:
                          </label>
                          <div style={{
                            width: '100%',
                            height: '150px',
                            border: '2px dashed #ccc',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: '#f9f9f9',
                            cursor: 'pointer'
                          }}
                          onClick={() => {
                            const signature = prompt('Digite o nome para assinatura digital:');
                            if (signature) {
                              setServiceReport(prev => ({...prev, patientSignature: signature}));
                            }
                          }}
                          >
                            {serviceReport.patientSignature ? (
                              <div style={{textAlign: 'center'}}>
                                <div style={{fontSize: '24px', fontFamily: 'cursive', color: '#4caf50'}}>
                                  {serviceReport.patientSignature}
                                </div>
                                <div style={{fontSize: '12px', color: '#666'}}>
                                  Assinado em {new Date().toLocaleString('pt-BR')}
                                </div>
                              </div>
                            ) : (
                              <div style={{textAlign: 'center', color: '#666'}}>
                                <div style={{fontSize: '24px', marginBottom: '8px'}}>✍️</div>
                                <div>Clique para assinar digitalmente</div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={completeService}
                      disabled={!serviceReport.observations || !serviceReport.patientSignature}
                      style={{
                        padding: '16px 32px',
                        background: serviceReport.observations && serviceReport.patientSignature ? '#4caf50' : '#e0e0e0',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: serviceReport.observations && serviceReport.patientSignature ? 'pointer' : 'not-allowed',
                        fontWeight: 'bold',
                        fontSize: '18px',
                        width: '100%'
                      }}
                    >
                      <Check size={16} /> Finalizar Atendimento
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Passo 4: Finalização */}
            {currentStep === 4 && (
              <div className="card-professional">
                <div className="card-header">
                  <h3 className="card-title"><Check size={16} /> Atendimento Finalizado</h3>
                </div>
                <div className="card-body">
                  <div style={{display: 'grid', gap: '20px'}}>
                    {/* Confirmação */}
                    <div style={{
                      padding: '20px',
                      background: '#e8f5e8',
                      borderRadius: '8px',
                      border: '2px solid #4caf50',
                      textAlign: 'center'
                    }}>
                      <div style={{fontSize: '48px', marginBottom: '16px'}}><PartyPopper size={16} /></div>
                      <h4 style={{margin: '0 0 8px 0', color: '#4caf50'}}>Atendimento Concluído com Sucesso!</h4>
                      <p style={{margin: 0, fontSize: '14px'}}>
                        Pagamento liberado para {professional.name}
                      </p>
                    </div>

                    {/* Resumo do Atendimento */}
                    <div style={{
                      padding: '20px',
                      background: '#f5f5f5',
                      borderRadius: '8px',
                      border: '1px solid #e0e0e0'
                    }}>
                      <h4 style={{margin: '0 0 16px 0'}}><BarChart3 size={16} /> Resumo do Atendimento</h4>
                      <div style={{display: 'grid', gap: '8px', fontSize: '14px'}}>
                        <div><strong>Início:</strong> {formatTime(serviceReport.startTime)}</div>
                        <div><strong>Fim:</strong> {formatTime(serviceReport.endTime)}</div>
                        <div><strong>Duração:</strong> {
                          serviceReport.endTime && serviceReport.startTime ? 
                          formatDuration(Math.round((new Date(serviceReport.endTime) - new Date(serviceReport.startTime)) / (1000 * 60))) :
                          'N/A'
                        }</div>
                        <div><strong>Fotos:</strong> {serviceReport.photos.length} anexada(s)</div>
                        <div><strong>Assinatura:</strong> <Check size={16} /> Confirmada</div>
                      </div>
                    </div>

                    {/* Ações Finais */}
                    <div style={{display: 'grid', gap: '12px'}}>
                      <button 
                        onClick={generateReport}
                        style={{
                          padding: '12px 24px',
                          background: '#2196f3',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        <File size={16} /> Gerar Relatório PDF
                      </button>
                      
                      <button 
                        onClick={() => navigate(`/service-review/${professionalId}`)}
                        style={{
                          padding: '12px 24px',
                          background: '#ff9800',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        <Star size={16} /> Avaliar Atendimento
                      </button>
                      
                      <button 
                        onClick={() => navigate(`/professional-chat/${professionalId}`)}
                        style={{
                          padding: '12px 24px',
                          background: '#9c27b0',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        <MessageCircle size={16} /> Continuar Conversa
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div>
            {/* Marcos do Projeto */}
            <div className="card-professional" style={{marginBottom: '16px'}}>
              <div className="card-header">
                <h3 className="card-title"><Target size={16} /> Marcos do Projeto</h3>
              </div>
              <div className="card-body">
                <div style={{display: 'grid', gap: '12px'}}>
                  {milestones.map((milestone, index) => (
                    <div key={index} style={{
                      padding: '12px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '6px',
                      background: 
                        milestone.status === 'completed' ? '#e8f5e8' :
                        milestone.status === 'in_progress' ? '#fff3e0' : '#f9f9f9'
                    }}>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px'}}>
                        <span style={{fontWeight: 'bold', fontSize: '14px'}}>{milestone.name}</span>
                        <span style={{
                          padding: '2px 6px',
                          background: 
                            milestone.status === 'completed' ? '#4caf50' :
                            milestone.status === 'in_progress' ? '#ff9800' : '#e0e0e0',
                          color: milestone.status === 'pending' ? '#666' : 'white',
                          borderRadius: '8px',
                          fontSize: '10px'
                        }}>
                          {milestone.status === 'completed' && '<Check size={16} />'}
                          {milestone.status === 'in_progress' && '⏳'}
                          {milestone.status === 'pending' && '⏸️'}
                        </span>
                      </div>
                      <div style={{fontSize: '12px', color: '#666'}}>
                        {milestone.percentage}% do pagamento
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Status do Escrow */}
            <div className="card-professional" style={{marginBottom: '16px'}}>
              <div className="card-header">
                <h3 className="card-title"><Shield size={16} /> Status do Escrow</h3>
              </div>
              <div className="card-body">
                <div style={{textAlign: 'center'}}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 
                      escrowStatus === 'released' ? '#4caf50' :
                      escrowStatus === 'disputed' ? '#f44336' :
                      escrowStatus === 'secured' ? '#2196f3' : '#e0e0e0',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    margin: '0 auto 12px'
                  }}>
                    {escrowStatus === 'released' && '<Check size={16} />'}
                    {escrowStatus === 'disputed' && '⚠️'}
                    {escrowStatus === 'secured' && '<Shield size={16} />'}
                    {escrowStatus === 'pending' && '⏳'}
                  </div>
                  <div style={{fontWeight: 'bold', marginBottom: '4px'}}>
                    {escrowStatus === 'released' && 'Pagamento Liberado'}
                    {escrowStatus === 'disputed' && 'Em Disputa'}
                    {escrowStatus === 'secured' && 'Valor Protegido'}
                    {escrowStatus === 'pending' && 'Aguardando Pagamento'}
                  </div>
                  <div style={{fontSize: '14px', color: '#666'}}>
                    R$ {agreement?.pricing?.totalPrice}
                  </div>
                </div>
              </div>
            </div>

            {/* Informações do Profissional */}
            <div className="card-professional" style={{marginBottom: '16px'}}>
              <div className="card-header">
                <h3 className="card-title">👨‍⚕️ Profissional</h3>
              </div>
              <div className="card-body">
                <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px'}}>
                  <img 
                    src={professional.photo} 
                    alt={professional.name}
                    style={{width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover'}}
                  />
                  <div>
                    <div style={{fontWeight: 'bold'}}>{professional.name}</div>
                    <div style={{fontSize: '14px', color: '#666'}}>{professional.specialty}</div>
                    <div style={{fontSize: '12px', color: '#ff9800'}}><Star size={16} /> {professional.rating}</div>
                  </div>
                </div>
                <div style={{display: 'flex', gap: '8px'}}>
                  <button style={{
                    flex: 1,
                    padding: '8px',
                    background: '#4caf50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}>
                    <Phone size={16} /> Ligar
                  </button>
                  <button style={{
                    flex: 1,
                    padding: '8px',
                    background: '#2196f3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}>
                    <MessageCircle size={16} /> Chat
                  </button>
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
                  <div style={{marginBottom: '12px'}}>
                    <strong>Central de Ajuda:</strong><br />
                    <Phone size={16} /> (11) 9999-9999<br />
                    <MessageCircle size={16} /> Chat 24/7
                  </div>
                  <div style={{marginBottom: '12px'}}>
                    <strong>Emergência Médica:</strong><br />
                    🚨 192 (SAMU)
                  </div>
                  <button style={{
                    width: '100%',
                    padding: '8px',
                    background: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}>
                    🚨 Emergência
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EscrowPaymentSystem;

