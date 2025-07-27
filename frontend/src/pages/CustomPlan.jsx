import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

const CustomPlan = () => {
  const { professionalId } = useParams();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [planData, setPlanData] = useState({
    title: '',
    description: '',
    category: '',
    duration: '',
    deliverables: [],
    milestones: [],
    pricing: {
      basePrice: 0,
      extras: [],
      totalPrice: 0
    },
    schedule: {
      startDate: '',
      sessions: [],
      flexibility: ''
    },
    requirements: {
      patientPrep: '',
      location: '',
      equipment: '',
      restrictions: ''
    },
    terms: {
      cancellation: '',
      refund: '',
      modifications: '',
      guarantee: ''
    }
  });

  const [professional] = useState({
    id: 1,
    name: 'Dr. João Silva',
    specialty: 'Cardiologia',
    photo: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face',
    rating: 4.9,
    experience: 15,
    baseRate: 150
  });

  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [customExtras, setCustomExtras] = useState([]);

  // Templates de planos pré-definidos
  useEffect(() => {
    const planTemplates = [
      {
        id: 1,
        name: 'Consulta Cardiológica Completa',
        category: 'consultation',
        duration: '60 min',
        basePrice: 180,
        description: 'Avaliação cardiológica completa com ECG e orientações',
        deliverables: [
          'Consulta presencial de 60 minutos',
          'Eletrocardiograma (ECG)',
          'Relatório médico detalhado',
          'Orientações personalizadas',
          'Prescrição médica se necessário'
        ],
        milestones: [
          { name: 'Agendamento confirmado', percentage: 20 },
          { name: 'Consulta realizada', percentage: 80 },
          { name: 'Relatório entregue', percentage: 100 }
        ],
        extras: [
          { name: 'Ecocardiograma', price: 120, description: 'Exame complementar' },
          { name: 'Teste ergométrico', price: 200, description: 'Avaliação sob esforço' },
          { name: 'Consulta de retorno', price: 100, description: 'Acompanhamento em 30 dias' }
        ]
      },
      {
        id: 2,
        name: 'Programa de Prevenção Cardiovascular',
        category: 'program',
        duration: '3 meses',
        basePrice: 450,
        description: 'Programa completo de prevenção e acompanhamento cardiovascular',
        deliverables: [
          '3 consultas mensais',
          'Plano alimentar personalizado',
          'Programa de exercícios',
          'Monitoramento contínuo',
          'Relatórios mensais',
          'Suporte via WhatsApp'
        ],
        milestones: [
          { name: 'Avaliação inicial', percentage: 25 },
          { name: '1º mês completo', percentage: 50 },
          { name: '2º mês completo', percentage: 75 },
          { name: 'Programa finalizado', percentage: 100 }
        ],
        extras: [
          { name: 'Consulta nutricional', price: 80, description: 'Com nutricionista especializada' },
          { name: 'Personal trainer', price: 200, description: 'Acompanhamento físico' },
          { name: 'Exames laboratoriais', price: 150, description: 'Pacote completo' }
        ]
      },
      {
        id: 3,
        name: 'Atendimento Domiciliar',
        category: 'home_care',
        duration: 'Flexível',
        basePrice: 250,
        description: 'Atendimento cardiológico no conforto da sua casa',
        deliverables: [
          'Consulta domiciliar',
          'ECG portátil',
          'Avaliação do ambiente',
          'Orientações familiares',
          'Relatório completo'
        ],
        milestones: [
          { name: 'Agendamento confirmado', percentage: 30 },
          { name: 'Visita realizada', percentage: 90 },
          { name: 'Relatório entregue', percentage: 100 }
        ],
        extras: [
          { name: 'Deslocamento extra', price: 50, description: 'Acima de 20km' },
          { name: 'Fim de semana', price: 100, description: 'Atendimento sábado/domingo' },
          { name: 'Urgência', price: 150, description: 'Atendimento em 24h' }
        ]
      }
    ];
    
    setTemplates(planTemplates);
  }, []);

  // Carregar dados da triagem se disponível
  useEffect(() => {
    const triageData = JSON.parse(localStorage.getItem('triageData') || '{}');
    const selectedProfessional = JSON.parse(localStorage.getItem('selectedProfessional') || '{}');
    
    if (triageData.serviceType) {
      // Auto-selecionar template baseado na triagem
      const matchingTemplate = templates.find(t => 
        (triageData.serviceType === 'consultation' && t.category === 'consultation') ||
        (triageData.serviceType === 'home_care' && t.category === 'home_care') ||
        (triageData.duration === 'long' && t.category === 'program')
      );
      
      if (matchingTemplate) {
        setSelectedTemplate(matchingTemplate);
        loadTemplate(matchingTemplate);
      }
    }
  }, [templates]);

  // Carregar template selecionado
  const loadTemplate = (template) => {
    setPlanData(prev => ({
      ...prev,
      title: template.name,
      description: template.description,
      category: template.category,
      duration: template.duration,
      deliverables: [...template.deliverables],
      milestones: [...template.milestones],
      pricing: {
        basePrice: template.basePrice,
        extras: [],
        totalPrice: template.basePrice
      }
    }));
    
    setCustomExtras(template.extras || []);
    setSelectedTemplate(template);
  };

  // Atualizar dados do plano
  const updatePlanData = (field, value) => {
    setPlanData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateNestedData = (parent, field, value) => {
    setPlanData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  // Adicionar entregável
  const addDeliverable = () => {
    const newDeliverable = prompt('Digite o novo entregável:');
    if (newDeliverable) {
      setPlanData(prev => ({
        ...prev,
        deliverables: [...prev.deliverables, newDeliverable]
      }));
    }
  };

  // Remover entregável
  const removeDeliverable = (index) => {
    setPlanData(prev => ({
      ...prev,
      deliverables: prev.deliverables.filter((_, i) => i !== index)
    }));
  };

  // Adicionar marco
  const addMilestone = () => {
    const name = prompt('Nome do marco:');
    const percentage = prompt('Porcentagem (0-100):');
    
    if (name && percentage) {
      setPlanData(prev => ({
        ...prev,
        milestones: [...prev.milestones, {
          name,
          percentage: parseInt(percentage)
        }]
      }));
    }
  };

  // Remover marco
  const removeMilestone = (index) => {
    setPlanData(prev => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index)
    }));
  };

  // Adicionar extra
  const toggleExtra = (extra) => {
    setPlanData(prev => {
      const isSelected = prev.pricing.extras.some(e => e.name === extra.name);
      let newExtras;
      
      if (isSelected) {
        newExtras = prev.pricing.extras.filter(e => e.name !== extra.name);
      } else {
        newExtras = [...prev.pricing.extras, extra];
      }
      
      const totalPrice = prev.pricing.basePrice + newExtras.reduce((sum, e) => sum + e.price, 0);
      
      return {
        ...prev,
        pricing: {
          ...prev.pricing,
          extras: newExtras,
          totalPrice
        }
      };
    });
  };

  // Adicionar sessão
  const addSession = () => {
    const date = prompt('Data da sessão (DD/MM/AAAA):');
    const time = prompt('Horário (HH:MM):');
    const type = prompt('Tipo de sessão:');
    
    if (date && time && type) {
      setPlanData(prev => ({
        ...prev,
        schedule: {
          ...prev.schedule,
          sessions: [...prev.schedule.sessions, { date, time, type }]
        }
      }));
    }
  };

  // Próximo passo
  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    } else {
      // Finalizar e ir para negociação
      savePlan();
    }
  };

  // Passo anterior
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Salvar plano
  const savePlan = () => {
    const finalPlan = {
      ...planData,
      professionalId,
      professional,
      createdAt: new Date(),
      status: 'draft'
    };
    
    localStorage.setItem('customPlan', JSON.stringify(finalPlan));
    
    // Navegar para negociação
    navigate(`/negotiation-versions/${professionalId}`);
  };

  return (
    <Layout>
      <div className="content-main">
        <div className="page-header">
          <h1 className="page-title"><PenTool size={16} /> Criar Plano de Atendimento Customizado</h1>
          <p className="page-subtitle">Desenvolva um plano personalizado com {professional.name}</p>
        </div>

        {/* Indicador de Progresso */}
        <div className="card-professional" style={{marginBottom: '24px'}}>
          <div className="card-body">
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
              {[1, 2, 3, 4, 5].map((step) => (
                <div key={step} style={{
                  display: 'flex',
                  alignItems: 'center',
                  flex: step < 5 ? 1 : 0
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
                    {step}
                  </div>
                  {step < 5 && (
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
              {currentStep === 1 && 'Escolher Template'}
              {currentStep === 2 && 'Personalizar Serviços'}
              {currentStep === 3 && 'Definir Preços e Extras'}
              {currentStep === 4 && 'Cronograma e Logística'}
              {currentStep === 5 && 'Termos e Condições'}
            </div>
          </div>
        </div>

        <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px'}}>
          {/* Área Principal */}
          <div>
            {/* Passo 1: Escolher Template */}
            {currentStep === 1 && (
              <div className="card-professional">
                <div className="card-header">
                  <h3 className="card-title"><Target size={16} /> Escolher Template Base</h3>
                </div>
                <div className="card-body">
                  <div style={{display: 'grid', gap: '16px'}}>
                    {templates.map((template) => (
                      <div 
                        key={template.id}
                        onClick={() => loadTemplate(template)}
                        style={{
                          padding: '20px',
                          border: selectedTemplate?.id === template.id ? '2px solid #4caf50' : '2px solid #e0e0e0',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          background: selectedTemplate?.id === template.id ? '#e8f5e8' : 'white'
                        }}
                      >
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px'}}>
                          <h4 style={{margin: 0, color: '#1976d2'}}>{template.name}</h4>
                          <div style={{
                            padding: '4px 12px',
                            background: '#4caf50',
                            color: 'white',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}>
                            R$ {template.basePrice}
                          </div>
                        </div>
                        <p style={{margin: '0 0 12px 0', color: '#666'}}>{template.description}</p>
                        <div style={{fontSize: '14px', color: '#666', marginBottom: '12px'}}>
                          ⏱️ {template.duration} • <FileText size={16} /> {template.deliverables.length} entregáveis
                        </div>
                        <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
                          {template.deliverables.slice(0, 3).map((deliverable, index) => (
                            <span key={index} style={{
                              padding: '2px 8px',
                              background: '#e3f2fd',
                              color: '#1976d2',
                              borderRadius: '12px',
                              fontSize: '12px'
                            }}>
                              {deliverable}
                            </span>
                          ))}
                          {template.deliverables.length > 3 && (
                            <span style={{
                              padding: '2px 8px',
                              background: '#f5f5f5',
                              color: '#666',
                              borderRadius: '12px',
                              fontSize: '12px'
                            }}>
                              +{template.deliverables.length - 3} mais
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {/* Opção de criar do zero */}
                    <div 
                      onClick={() => {
                        setSelectedTemplate(null);
                        setPlanData({
                          title: '',
                          description: '',
                          category: '',
                          duration: '',
                          deliverables: [],
                          milestones: [],
                          pricing: { basePrice: 0, extras: [], totalPrice: 0 },
                          schedule: { startDate: '', sessions: [], flexibility: '' },
                          requirements: { patientPrep: '', location: '', equipment: '', restrictions: '' },
                          terms: { cancellation: '', refund: '', modifications: '', guarantee: '' }
                        });
                      }}
                      style={{
                        padding: '20px',
                        border: selectedTemplate === null ? '2px solid #ff9800' : '2px dashed #e0e0e0',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        background: selectedTemplate === null ? '#fff3e0' : 'white',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{fontSize: '48px', marginBottom: '16px'}}><Sparkles size={16} /></div>
                      <h4 style={{margin: '0 0 8px 0', color: '#ff9800'}}>Criar do Zero</h4>
                      <p style={{margin: 0, color: '#666'}}>Desenvolva um plano completamente personalizado</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Passo 2: Personalizar Serviços */}
            {currentStep === 2 && (
              <div className="card-professional">
                <div className="card-header">
                  <h3 className="card-title"><Settings size={16} /> Personalizar Serviços</h3>
                </div>
                <div className="card-body">
                  <div style={{display: 'grid', gap: '20px'}}>
                    <div>
                      <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>
                        Título do Plano:
                      </label>
                      <input
                        type="text"
                        value={planData.title}
                        onChange={(e) => updatePlanData('title', e.target.value)}
                        placeholder="Ex: Consulta Cardiológica Completa"
                        style={{width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '6px'}}
                      />
                    </div>

                    <div>
                      <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>
                        Descrição Detalhada:
                      </label>
                      <textarea
                        value={planData.description}
                        onChange={(e) => updatePlanData('description', e.target.value)}
                        placeholder="Descreva detalhadamente o que está incluído no plano..."
                        rows="4"
                        style={{width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '6px'}}
                      />
                    </div>

                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                      <div>
                        <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>Categoria:</label>
                        <select
                          value={planData.category}
                          onChange={(e) => updatePlanData('category', e.target.value)}
                          style={{width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '6px'}}
                        >
                          <option value="">Selecione</option>
                          <option value="consultation">Consulta</option>
                          <option value="program">Programa</option>
                          <option value="home_care">Atendimento Domiciliar</option>
                          <option value="monitoring">Monitoramento</option>
                          <option value="emergency">Emergência</option>
                        </select>
                      </div>
                      <div>
                        <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>Duração:</label>
                        <input
                          type="text"
                          value={planData.duration}
                          onChange={(e) => updatePlanData('duration', e.target.value)}
                          placeholder="Ex: 60 min, 3 meses, Flexível"
                          style={{width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '6px'}}
                        />
                      </div>
                    </div>

                    {/* Entregáveis */}
                    <div>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px'}}>
                        <label style={{fontWeight: 'bold'}}>Entregáveis:</label>
                        <button 
                          onClick={addDeliverable}
                          style={{
                            padding: '6px 12px',
                            background: '#4caf50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px'
                          }}
                        >
                          + Adicionar
                        </button>
                      </div>
                      <div style={{display: 'grid', gap: '8px'}}>
                        {planData.deliverables.map((deliverable, index) => (
                          <div key={index} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '12px',
                            border: '1px solid #e0e0e0',
                            borderRadius: '6px',
                            background: '#f9f9f9'
                          }}>
                            <span>{deliverable}</span>
                            <button 
                              onClick={() => removeDeliverable(index)}
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
                    </div>

                    {/* Marcos do Projeto */}
                    <div>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px'}}>
                        <label style={{fontWeight: 'bold'}}>Marcos do Projeto:</label>
                        <button 
                          onClick={addMilestone}
                          style={{
                            padding: '6px 12px',
                            background: '#2196f3',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px'
                          }}
                        >
                          + Adicionar Marco
                        </button>
                      </div>
                      <div style={{display: 'grid', gap: '8px'}}>
                        {planData.milestones.map((milestone, index) => (
                          <div key={index} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '12px',
                            border: '1px solid #e0e0e0',
                            borderRadius: '6px',
                            background: '#f9f9f9'
                          }}>
                            <div>
                              <span style={{fontWeight: 'bold'}}>{milestone.name}</span>
                              <span style={{marginLeft: '8px', color: '#666'}}>({milestone.percentage}%)</span>
                            </div>
                            <button 
                              onClick={() => removeMilestone(index)}
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
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Passo 3: Preços e Extras */}
            {currentStep === 3 && (
              <div className="card-professional">
                <div className="card-header">
                  <h3 className="card-title"><DollarSign size={16} /> Definir Preços e Extras</h3>
                </div>
                <div className="card-body">
                  <div style={{display: 'grid', gap: '20px'}}>
                    <div>
                      <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>
                        Preço Base:
                      </label>
                      <input
                        type="number"
                        value={planData.pricing.basePrice}
                        onChange={(e) => updateNestedData('pricing', 'basePrice', parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        style={{width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '6px'}}
                      />
                    </div>

                    {/* Extras Disponíveis */}
                    {customExtras.length > 0 && (
                      <div>
                        <label style={{display: 'block', marginBottom: '12px', fontWeight: 'bold'}}>
                          Serviços Extras:
                        </label>
                        <div style={{display: 'grid', gap: '12px'}}>
                          {customExtras.map((extra) => (
                            <div key={extra.name} style={{
                              padding: '16px',
                              border: planData.pricing.extras.some(e => e.name === extra.name) ? '2px solid #4caf50' : '1px solid #e0e0e0',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              background: planData.pricing.extras.some(e => e.name === extra.name) ? '#e8f5e8' : 'white'
                            }}
                            onClick={() => toggleExtra(extra)}
                            >
                              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'}}>
                                <h4 style={{margin: 0}}>{extra.name}</h4>
                                <div style={{
                                  padding: '4px 12px',
                                  background: '#4caf50',
                                  color: 'white',
                                  borderRadius: '12px',
                                  fontSize: '12px',
                                  fontWeight: 'bold'
                                }}>
                                  + R$ {extra.price}
                                </div>
                              </div>
                              <p style={{margin: 0, fontSize: '14px', color: '#666'}}>{extra.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Resumo de Preços */}
                    <div style={{
                      padding: '20px',
                      background: '#f5f5f5',
                      borderRadius: '8px',
                      border: '1px solid #e0e0e0'
                    }}>
                      <h4 style={{margin: '0 0 16px 0'}}><DollarSign size={16} /> Resumo de Preços</h4>
                      <div style={{display: 'grid', gap: '8px'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between'}}>
                          <span>Preço base:</span>
                          <span>R$ {planData.pricing.basePrice}</span>
                        </div>
                        {planData.pricing.extras.map((extra) => (
                          <div key={extra.name} style={{display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#666'}}>
                            <span>+ {extra.name}:</span>
                            <span>R$ {extra.price}</span>
                          </div>
                        ))}
                        <hr style={{margin: '12px 0', border: 'none', borderTop: '1px solid #ccc'}} />
                        <div style={{display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '18px', color: '#4caf50'}}>
                          <span>Total:</span>
                          <span>R$ {planData.pricing.totalPrice}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Passo 4: Cronograma */}
            {currentStep === 4 && (
              <div className="card-professional">
                <div className="card-header">
                  <h3 className="card-title"><Calendar size={16} /> Cronograma e Logística</h3>
                </div>
                <div className="card-body">
                  <div style={{display: 'grid', gap: '20px'}}>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                      <div>
                        <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>
                          Data de Início:
                        </label>
                        <input
                          type="date"
                          value={planData.schedule.startDate}
                          onChange={(e) => updateNestedData('schedule', 'startDate', e.target.value)}
                          style={{width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '6px'}}
                        />
                      </div>
                      <div>
                        <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>
                          Flexibilidade:
                        </label>
                        <select
                          value={planData.schedule.flexibility}
                          onChange={(e) => updateNestedData('schedule', 'flexibility', e.target.value)}
                          style={{width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '6px'}}
                        >
                          <option value="">Selecione</option>
                          <option value="fixed">Horários fixos</option>
                          <option value="flexible">Flexível</option>
                          <option value="emergency">Disponível para emergências</option>
                        </select>
                      </div>
                    </div>

                    {/* Sessões Programadas */}
                    <div>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px'}}>
                        <label style={{fontWeight: 'bold'}}>Sessões Programadas:</label>
                        <button 
                          onClick={addSession}
                          style={{
                            padding: '6px 12px',
                            background: '#2196f3',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px'
                          }}
                        >
                          + Adicionar Sessão
                        </button>
                      </div>
                      <div style={{display: 'grid', gap: '8px'}}>
                        {planData.schedule.sessions.map((session, index) => (
                          <div key={index} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '12px',
                            border: '1px solid #e0e0e0',
                            borderRadius: '6px',
                            background: '#f9f9f9'
                          }}>
                            <div>
                              <span style={{fontWeight: 'bold'}}>{session.type}</span>
                              <span style={{marginLeft: '8px', color: '#666'}}>
                                {session.date} às {session.time}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Requisitos */}
                    <div style={{display: 'grid', gap: '16px'}}>
                      <div>
                        <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>
                          Preparação do Paciente:
                        </label>
                        <textarea
                          value={planData.requirements.patientPrep}
                          onChange={(e) => updateNestedData('requirements', 'patientPrep', e.target.value)}
                          placeholder="Ex: Jejum de 12h, trazer exames anteriores..."
                          rows="2"
                          style={{width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '6px'}}
                        />
                      </div>
                      <div>
                        <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>
                          Local do Atendimento:
                        </label>
                        <input
                          type="text"
                          value={planData.requirements.location}
                          onChange={(e) => updateNestedData('requirements', 'location', e.target.value)}
                          placeholder="Ex: Consultório, Domicílio, Hospital"
                          style={{width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '6px'}}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Passo 5: Termos e Condições */}
            {currentStep === 5 && (
              <div className="card-professional">
                <div className="card-header">
                  <h3 className="card-title"><FileText size={16} /> Termos e Condições</h3>
                </div>
                <div className="card-body">
                  <div style={{display: 'grid', gap: '20px'}}>
                    <div>
                      <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>
                        Política de Cancelamento:
                      </label>
                      <textarea
                        value={planData.terms.cancellation}
                        onChange={(e) => updateNestedData('terms', 'cancellation', e.target.value)}
                        placeholder="Ex: Cancelamento gratuito até 24h antes..."
                        rows="3"
                        style={{width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '6px'}}
                      />
                    </div>

                    <div>
                      <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>
                        Política de Reembolso:
                      </label>
                      <textarea
                        value={planData.terms.refund}
                        onChange={(e) => updateNestedData('terms', 'refund', e.target.value)}
                        placeholder="Ex: Reembolso integral em caso de não comparecimento do profissional..."
                        rows="3"
                        style={{width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '6px'}}
                      />
                    </div>

                    <div>
                      <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>
                        Modificações no Plano:
                      </label>
                      <textarea
                        value={planData.terms.modifications}
                        onChange={(e) => updateNestedData('terms', 'modifications', e.target.value)}
                        placeholder="Ex: Modificações permitidas até 48h antes do início..."
                        rows="3"
                        style={{width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '6px'}}
                      />
                    </div>

                    <div>
                      <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>
                        Garantias Oferecidas:
                      </label>
                      <textarea
                        value={planData.terms.guarantee}
                        onChange={(e) => updateNestedData('terms', 'guarantee', e.target.value)}
                        placeholder="Ex: Garantia de satisfação, nova consulta gratuita se necessário..."
                        rows="3"
                        style={{width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '6px'}}
                      />
                    </div>

                    {/* Resumo Final */}
                    <div style={{
                      padding: '20px',
                      background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
                      borderRadius: '8px',
                      border: '2px solid #4caf50'
                    }}>
                      <h4 style={{margin: '0 0 16px 0', color: '#4caf50'}}><Check size={16} /> Resumo do Plano</h4>
                      <div style={{display: 'grid', gap: '8px', fontSize: '14px'}}>
                        <div><strong>Título:</strong> {planData.title}</div>
                        <div><strong>Duração:</strong> {planData.duration}</div>
                        <div><strong>Entregáveis:</strong> {planData.deliverables.length} itens</div>
                        <div><strong>Marcos:</strong> {planData.milestones.length} marcos</div>
                        <div><strong>Preço Total:</strong> R$ {planData.pricing.totalPrice}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Botões de Navegação */}
            <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '24px'}}>
              <button 
                onClick={prevStep}
                disabled={currentStep === 1}
                style={{
                  padding: '12px 24px',
                  background: currentStep === 1 ? '#e0e0e0' : '#666',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold'
                }}
              >
                ← Anterior
              </button>
              <button 
                onClick={nextStep}
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
                {currentStep === 5 ? '<Rocket size={16} /> Finalizar Plano' : 'Próximo →'}
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* Profissional */}
            <div className="card-professional" style={{marginBottom: '16px'}}>
              <div className="card-header">
                <h3 className="card-title">👨‍⚕️ Profissional</h3>
              </div>
              <div className="card-body">
                <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px'}}>
                  <img 
                    src={professional.photo} 
                    alt={professional.name}
                    style={{width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover'}}
                  />
                  <div>
                    <div style={{fontWeight: 'bold'}}>{professional.name}</div>
                    <div style={{fontSize: '14px', color: '#666'}}>{professional.specialty}</div>
                    <div style={{fontSize: '12px', color: '#ff9800'}}><Star size={16} /> {professional.rating} • {professional.experience} anos</div>
                  </div>
                </div>
                <div style={{fontSize: '14px', color: '#666'}}>
                  <div>Taxa base: R$ {professional.baseRate}/hora</div>
                </div>
              </div>
            </div>

            {/* Progresso */}
            <div className="card-professional" style={{marginBottom: '16px'}}>
              <div className="card-header">
                <h3 className="card-title"><BarChart3 size={16} /> Progresso</h3>
              </div>
              <div className="card-body">
                <div style={{fontSize: '14px', lineHeight: '1.6'}}>
                  <div style={{marginBottom: '8px'}}>
                    <strong>Etapa:</strong> {currentStep}/5
                  </div>
                  <div style={{marginBottom: '8px'}}>
                    <strong>Completude:</strong> {Math.round((currentStep / 5) * 100)}%
                  </div>
                  <div style={{
                    width: '100%',
                    height: '8px',
                    background: '#e0e0e0',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${(currentStep / 5) * 100}%`,
                      height: '100%',
                      background: '#4caf50',
                      transition: 'width 0.3s ease'
                    }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dicas */}
            <div className="card-professional">
              <div className="card-header">
                <h3 className="card-title"><Lightbulb size={16} /> Dicas</h3>
              </div>
              <div className="card-body">
                <div style={{fontSize: '14px', lineHeight: '1.6'}}>
                  {currentStep === 1 && (
                    <p style={{margin: 0}}>
                      Escolha um template que mais se aproxima do que você precisa. Você poderá personalizar tudo nas próximas etapas.
                    </p>
                  )}
                  {currentStep === 2 && (
                    <p style={{margin: 0}}>
                      Seja específico nos entregáveis e marcos. Isso ajuda na transparência e confiança do cliente.
                    </p>
                  )}
                  {currentStep === 3 && (
                    <p style={{margin: 0}}>
                      Extras bem definidos podem aumentar significativamente o valor do seu serviço.
                    </p>
                  )}
                  {currentStep === 4 && (
                    <p style={{margin: 0}}>
                      Um cronograma claro evita mal-entendidos e facilita o acompanhamento do progresso.
                    </p>
                  )}
                  {currentStep === 5 && (
                    <p style={{margin: 0}}>
                      Termos claros protegem tanto você quanto o cliente. Seja transparente sobre políticas.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CustomPlan;

