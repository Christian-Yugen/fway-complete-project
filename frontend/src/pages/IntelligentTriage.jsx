import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

const IntelligentTriage = () => {
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [triageData, setTriageData] = useState({
    // Dados básicos
    serviceType: '',
    age: '',
    gender: '',
    location: {
      state: '',
      city: '',
      neighborhood: '',
      coordinates: null
    },
    
    // Condições médicas
    comorbidities: [],
    currentMedications: '',
    allergies: '',
    previousSurgeries: '',
    
    // Urgência e frequência
    urgencyLevel: '',
    preferredSchedule: '',
    frequency: '',
    duration: '',
    
    // Preferências
    preferredGender: '',
    languagePreference: '',
    mobilityNeeds: '',
    budgetRange: '',
    
    // Sintomas específicos
    symptoms: [],
    painLevel: 0,
    symptomDuration: '',
    
    // Histórico
    previousTreatments: '',
    familyHistory: '',
    lifestyle: {
      smoking: false,
      drinking: false,
      exercise: '',
      diet: ''
    }
  });

  const [matchedProfessionals, setMatchedProfessionals] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [matchingScore, setMatchingScore] = useState(null);

  // Opções para os campos
  const serviceTypes = [
    { id: 'consultation', name: 'Consulta Médica', icon: '👨‍⚕️' },
    { id: 'home_care', name: 'Enfermagem Domiciliar', icon: '🏠' },
    { id: 'physiotherapy', name: 'Fisioterapia', icon: '🏃‍♂️' },
    { id: 'psychology', name: 'Psicologia', icon: '<Brain size={16} />' },
    { id: 'nutrition', name: 'Nutrição', icon: '🥗' },
    { id: 'dentistry', name: 'Odontologia', icon: '🦷' }
  ];

  const urgencyLevels = [
    { id: 'emergency', name: 'Emergência (24h)', color: '#f44336', icon: '🚨' },
    { id: 'urgent', name: 'Urgente (48h)', color: '#ff9800', icon: '<Zap size={16} />' },
    { id: 'normal', name: 'Normal (1 semana)', color: '#4caf50', icon: '<Calendar size={16} />' },
    { id: 'routine', name: 'Rotina (1 mês)', color: '#2196f3', icon: '🗓️' }
  ];

  const commonSymptoms = [
    'Dor de cabeça', 'Febre', 'Tosse', 'Dor no peito', 'Falta de ar',
    'Dor abdominal', 'Náusea', 'Tontura', 'Fadiga', 'Dor nas costas',
    'Dor nas articulações', 'Insônia', 'Ansiedade', 'Depressão'
  ];

  const comorbidityOptions = [
    'Diabetes', 'Hipertensão', 'Cardiopatia', 'Asma', 'DPOC',
    'Artrite', 'Osteoporose', 'Câncer', 'HIV/AIDS', 'Hepatite',
    'Doença renal', 'Doença hepática', 'Epilepsia', 'Alzheimer'
  ];

  // Função de matching inteligente
  const performIntelligentMatching = async () => {
    setIsProcessing(true);
    
    // Simular processamento de IA
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Algoritmo de matching baseado nos dados da triagem
    const professionals = [
      {
        id: 1,
        name: 'Dr. João Silva',
        specialty: 'Cardiologia',
        rating: 4.9,
        experience: 15,
        location: 'São Paulo, SP',
        distance: 2.5,
        availability: 'Hoje às 14h',
        matchScore: 95,
        price: 150,
        languages: ['Português', 'Inglês'],
        specializations: ['Hipertensão', 'Arritmias'],
        photo: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face'
      },
      {
        id: 2,
        name: 'Dra. Maria Santos',
        specialty: 'Clínica Geral',
        rating: 4.8,
        experience: 12,
        location: 'São Paulo, SP',
        distance: 1.8,
        availability: 'Amanhã às 9h',
        matchScore: 88,
        price: 120,
        languages: ['Português'],
        specializations: ['Diabetes', 'Check-up'],
        photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face'
      },
      {
        id: 3,
        name: 'Dr. Carlos Oliveira',
        specialty: 'Ortopedia',
        rating: 4.7,
        experience: 20,
        location: 'São Paulo, SP',
        distance: 3.2,
        availability: 'Hoje às 16h',
        matchScore: 82,
        price: 180,
        languages: ['Português', 'Espanhol'],
        specializations: ['Coluna', 'Articulações'],
        photo: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face'
      }
    ];

    // Ordenar por score de matching
    const sortedProfessionals = professionals.sort((a, b) => b.matchScore - a.matchScore);
    
    setMatchedProfessionals(sortedProfessionals);
    setMatchingScore(sortedProfessionals[0]?.matchScore || 0);
    setIsProcessing(false);
  };

  const updateTriageData = (field, value) => {
    setTriageData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateNestedData = (parent, field, value) => {
    setTriageData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const addToArray = (field, value) => {
    if (!triageData[field].includes(value)) {
      setTriageData(prev => ({
        ...prev,
        [field]: [...prev[field], value]
      }));
    }
  };

  const removeFromArray = (field, value) => {
    setTriageData(prev => ({
      ...prev,
      [field]: prev[field].filter(item => item !== value)
    }));
  };

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    } else {
      performIntelligentMatching();
      setCurrentStep(6);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const selectProfessional = (professional) => {
    // Salvar dados da triagem e profissional selecionado
    localStorage.setItem('triageData', JSON.stringify(triageData));
    localStorage.setItem('selectedProfessional', JSON.stringify(professional));
    
    // Navegar para criação de plano customizado
    navigate(`/custom-plan/${professional.id}`);
  };

  return (
    <Layout>
      <div className="content-main">
        <div className="page-header">
          <h1 className="page-title"><Target size={16} /> Triagem Inteligente</h1>
          <p className="page-subtitle">Encontre o profissional ideal para suas necessidades</p>
        </div>

        {/* Indicador de Progresso */}
        <div className="card-professional" style={{marginBottom: '24px'}}>
          <div className="card-body">
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
              {[1, 2, 3, 4, 5, 6].map((step) => (
                <div key={step} style={{
                  display: 'flex',
                  alignItems: 'center',
                  flex: step < 6 ? 1 : 0
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
                    {step < 6 ? step : '<Target size={16} />'}
                  </div>
                  {step < 6 && (
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
              {currentStep === 1 && 'Informações Básicas'}
              {currentStep === 2 && 'Condições Médicas'}
              {currentStep === 3 && 'Urgência e Frequência'}
              {currentStep === 4 && 'Preferências'}
              {currentStep === 5 && 'Sintomas e Histórico'}
              {currentStep === 6 && 'Profissionais Recomendados'}
            </div>
          </div>
        </div>

        <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px'}}>
          {/* Área Principal */}
          <div>
            {/* Passo 1: Informações Básicas */}
            {currentStep === 1 && (
              <div className="card-professional">
                <div className="card-header">
                  <h3 className="card-title"><FileText size={16} /> Informações Básicas</h3>
                </div>
                <div className="card-body">
                  <div style={{display: 'grid', gap: '20px'}}>
                    <div>
                      <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>
                        Tipo de Atendimento:
                      </label>
                      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px'}}>
                        {serviceTypes.map((service) => (
                          <div 
                            key={service.id}
                            onClick={() => updateTriageData('serviceType', service.id)}
                            style={{
                              padding: '16px',
                              border: triageData.serviceType === service.id ? '2px solid #4caf50' : '2px solid #e0e0e0',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              textAlign: 'center',
                              background: triageData.serviceType === service.id ? '#e8f5e8' : 'white'
                            }}
                          >
                            <div style={{fontSize: '24px', marginBottom: '8px'}}>{service.icon}</div>
                            <div style={{fontWeight: 'bold', fontSize: '14px'}}>{service.name}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px'}}>
                      <div>
                        <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>Idade:</label>
                        <input
                          type="number"
                          value={triageData.age}
                          onChange={(e) => updateTriageData('age', e.target.value)}
                          placeholder="Ex: 35"
                          style={{width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '6px'}}
                        />
                      </div>
                      <div>
                        <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>Gênero:</label>
                        <select
                          value={triageData.gender}
                          onChange={(e) => updateTriageData('gender', e.target.value)}
                          style={{width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '6px'}}
                        >
                          <option value="">Selecione</option>
                          <option value="male">Masculino</option>
                          <option value="female">Feminino</option>
                          <option value="other">Outro</option>
                          <option value="prefer_not_say">Prefiro não dizer</option>
                        </select>
                      </div>
                      <div>
                        <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>Estado:</label>
                        <select
                          value={triageData.location.state}
                          onChange={(e) => updateNestedData('location', 'state', e.target.value)}
                          style={{width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '6px'}}
                        >
                          <option value="">Selecione</option>
                          <option value="SP">São Paulo</option>
                          <option value="RJ">Rio de Janeiro</option>
                          <option value="MG">Minas Gerais</option>
                          <option value="RS">Rio Grande do Sul</option>
                        </select>
                      </div>
                    </div>

                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                      <div>
                        <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>Cidade:</label>
                        <input
                          type="text"
                          value={triageData.location.city}
                          onChange={(e) => updateNestedData('location', 'city', e.target.value)}
                          placeholder="Ex: São Paulo"
                          style={{width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '6px'}}
                        />
                      </div>
                      <div>
                        <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>Bairro:</label>
                        <input
                          type="text"
                          value={triageData.location.neighborhood}
                          onChange={(e) => updateNestedData('location', 'neighborhood', e.target.value)}
                          placeholder="Ex: Vila Madalena"
                          style={{width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '6px'}}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Passo 2: Condições Médicas */}
            {currentStep === 2 && (
              <div className="card-professional">
                <div className="card-header">
                  <h3 className="card-title"><Building size={16} /> Condições Médicas</h3>
                </div>
                <div className="card-body">
                  <div style={{display: 'grid', gap: '20px'}}>
                    <div>
                      <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>
                        Comorbidades (selecione todas que se aplicam):
                      </label>
                      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px'}}>
                        {comorbidityOptions.map((condition) => (
                          <div 
                            key={condition}
                            onClick={() => {
                              if (triageData.comorbidities.includes(condition)) {
                                removeFromArray('comorbidities', condition);
                              } else {
                                addToArray('comorbidities', condition);
                              }
                            }}
                            style={{
                              padding: '8px 12px',
                              border: triageData.comorbidities.includes(condition) ? '2px solid #4caf50' : '1px solid #e0e0e0',
                              borderRadius: '20px',
                              cursor: 'pointer',
                              textAlign: 'center',
                              fontSize: '14px',
                              background: triageData.comorbidities.includes(condition) ? '#e8f5e8' : 'white'
                            }}
                          >
                            {condition}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>
                        Medicamentos em uso:
                      </label>
                      <textarea
                        value={triageData.currentMedications}
                        onChange={(e) => updateTriageData('currentMedications', e.target.value)}
                        placeholder="Liste os medicamentos que você usa regularmente..."
                        rows="3"
                        style={{width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '6px'}}
                      />
                    </div>

                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                      <div>
                        <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>Alergias:</label>
                        <textarea
                          value={triageData.allergies}
                          onChange={(e) => updateTriageData('allergies', e.target.value)}
                          placeholder="Medicamentos, alimentos, etc."
                          rows="2"
                          style={{width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '6px'}}
                        />
                      </div>
                      <div>
                        <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>Cirurgias anteriores:</label>
                        <textarea
                          value={triageData.previousSurgeries}
                          onChange={(e) => updateTriageData('previousSurgeries', e.target.value)}
                          placeholder="Descreva cirurgias realizadas..."
                          rows="2"
                          style={{width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '6px'}}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Passo 3: Urgência e Frequência */}
            {currentStep === 3 && (
              <div className="card-professional">
                <div className="card-header">
                  <h3 className="card-title">⏰ Urgência e Frequência</h3>
                </div>
                <div className="card-body">
                  <div style={{display: 'grid', gap: '20px'}}>
                    <div>
                      <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>
                        Nível de Urgência:
                      </label>
                      <div style={{display: 'grid', gap: '12px'}}>
                        {urgencyLevels.map((level) => (
                          <div 
                            key={level.id}
                            onClick={() => updateTriageData('urgencyLevel', level.id)}
                            style={{
                              padding: '16px',
                              border: triageData.urgencyLevel === level.id ? `2px solid ${level.color}` : '2px solid #e0e0e0',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              background: triageData.urgencyLevel === level.id ? `${level.color}15` : 'white',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px'
                            }}
                          >
                            <div style={{fontSize: '24px'}}>{level.icon}</div>
                            <div>
                              <div style={{fontWeight: 'bold', color: level.color}}>{level.name}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                      <div>
                        <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>Horário preferido:</label>
                        <select
                          value={triageData.preferredSchedule}
                          onChange={(e) => updateTriageData('preferredSchedule', e.target.value)}
                          style={{width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '6px'}}
                        >
                          <option value="">Selecione</option>
                          <option value="morning">Manhã (8h-12h)</option>
                          <option value="afternoon">Tarde (12h-18h)</option>
                          <option value="evening">Noite (18h-22h)</option>
                          <option value="flexible">Flexível</option>
                        </select>
                      </div>
                      <div>
                        <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>Frequência:</label>
                        <select
                          value={triageData.frequency}
                          onChange={(e) => updateTriageData('frequency', e.target.value)}
                          style={{width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '6px'}}
                        >
                          <option value="">Selecione</option>
                          <option value="once">Uma vez</option>
                          <option value="weekly">Semanal</option>
                          <option value="biweekly">Quinzenal</option>
                          <option value="monthly">Mensal</option>
                          <option value="ongoing">Contínuo</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>
                        Duração estimada do tratamento:
                      </label>
                      <select
                        value={triageData.duration}
                        onChange={(e) => updateTriageData('duration', e.target.value)}
                        style={{width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '6px'}}
                      >
                        <option value="">Selecione</option>
                        <option value="single">Consulta única</option>
                        <option value="short">Curto prazo (1-3 meses)</option>
                        <option value="medium">Médio prazo (3-6 meses)</option>
                        <option value="long">Longo prazo (6+ meses)</option>
                        <option value="indefinite">Indefinido</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Passo 4: Preferências */}
            {currentStep === 4 && (
              <div className="card-professional">
                <div className="card-header">
                  <h3 className="card-title"><Settings size={16} /> Preferências</h3>
                </div>
                <div className="card-body">
                  <div style={{display: 'grid', gap: '20px'}}>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                      <div>
                        <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>
                          Gênero preferido do profissional:
                        </label>
                        <select
                          value={triageData.preferredGender}
                          onChange={(e) => updateTriageData('preferredGender', e.target.value)}
                          style={{width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '6px'}}
                        >
                          <option value="">Sem preferência</option>
                          <option value="male">Masculino</option>
                          <option value="female">Feminino</option>
                        </select>
                      </div>
                      <div>
                        <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>Idioma:</label>
                        <select
                          value={triageData.languagePreference}
                          onChange={(e) => updateTriageData('languagePreference', e.target.value)}
                          style={{width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '6px'}}
                        >
                          <option value="">Selecione</option>
                          <option value="portuguese">Português</option>
                          <option value="english">Inglês</option>
                          <option value="spanish">Espanhol</option>
                          <option value="other">Outro</option>
                        </select>
                      </div>
                    </div>

                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                      <div>
                        <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>
                          Necessidades de mobilidade:
                        </label>
                        <select
                          value={triageData.mobilityNeeds}
                          onChange={(e) => updateTriageData('mobilityNeeds', e.target.value)}
                          style={{width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '6px'}}
                        >
                          <option value="">Nenhuma</option>
                          <option value="wheelchair">Cadeira de rodas</option>
                          <option value="walker">Andador</option>
                          <option value="cane">Bengala</option>
                          <option value="assistance">Assistência para caminhar</option>
                        </select>
                      </div>
                      <div>
                        <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>Faixa de orçamento:</label>
                        <select
                          value={triageData.budgetRange}
                          onChange={(e) => updateTriageData('budgetRange', e.target.value)}
                          style={{width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '6px'}}
                        >
                          <option value="">Selecione</option>
                          <option value="low">Até R$ 100</option>
                          <option value="medium">R$ 100 - R$ 200</option>
                          <option value="high">R$ 200 - R$ 300</option>
                          <option value="premium">Acima de R$ 300</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Passo 5: Sintomas e Histórico */}
            {currentStep === 5 && (
              <div className="card-professional">
                <div className="card-header">
                  <h3 className="card-title"><Stethoscope size={16} /> Sintomas e Histórico</h3>
                </div>
                <div className="card-body">
                  <div style={{display: 'grid', gap: '20px'}}>
                    <div>
                      <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>
                        Sintomas atuais (selecione todos que se aplicam):
                      </label>
                      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px'}}>
                        {commonSymptoms.map((symptom) => (
                          <div 
                            key={symptom}
                            onClick={() => {
                              if (triageData.symptoms.includes(symptom)) {
                                removeFromArray('symptoms', symptom);
                              } else {
                                addToArray('symptoms', symptom);
                              }
                            }}
                            style={{
                              padding: '8px 12px',
                              border: triageData.symptoms.includes(symptom) ? '2px solid #4caf50' : '1px solid #e0e0e0',
                              borderRadius: '20px',
                              cursor: 'pointer',
                              textAlign: 'center',
                              fontSize: '14px',
                              background: triageData.symptoms.includes(symptom) ? '#e8f5e8' : 'white'
                            }}
                          >
                            {symptom}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>
                        Nível de dor (0-10):
                      </label>
                      <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
                        <input
                          type="range"
                          min="0"
                          max="10"
                          value={triageData.painLevel}
                          onChange={(e) => updateTriageData('painLevel', parseInt(e.target.value))}
                          style={{flex: 1}}
                        />
                        <div style={{
                          padding: '8px 16px',
                          background: triageData.painLevel > 7 ? '#f44336' : triageData.painLevel > 4 ? '#ff9800' : '#4caf50',
                          color: 'white',
                          borderRadius: '20px',
                          fontWeight: 'bold',
                          minWidth: '60px',
                          textAlign: 'center'
                        }}>
                          {triageData.painLevel}
                        </div>
                      </div>
                    </div>

                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                      <div>
                        <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>
                          Duração dos sintomas:
                        </label>
                        <select
                          value={triageData.symptomDuration}
                          onChange={(e) => updateTriageData('symptomDuration', e.target.value)}
                          style={{width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '6px'}}
                        >
                          <option value="">Selecione</option>
                          <option value="hours">Algumas horas</option>
                          <option value="days">Alguns dias</option>
                          <option value="weeks">Algumas semanas</option>
                          <option value="months">Alguns meses</option>
                          <option value="years">Anos</option>
                        </select>
                      </div>
                      <div>
                        <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>
                          Exercício físico:
                        </label>
                        <select
                          value={triageData.lifestyle.exercise}
                          onChange={(e) => updateNestedData('lifestyle', 'exercise', e.target.value)}
                          style={{width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '6px'}}
                        >
                          <option value="">Selecione</option>
                          <option value="none">Sedentário</option>
                          <option value="light">Leve (1-2x/semana)</option>
                          <option value="moderate">Moderado (3-4x/semana)</option>
                          <option value="intense">Intenso (5+x/semana)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>
                        Tratamentos anteriores para este problema:
                      </label>
                      <textarea
                        value={triageData.previousTreatments}
                        onChange={(e) => updateTriageData('previousTreatments', e.target.value)}
                        placeholder="Descreva tratamentos já realizados..."
                        rows="3"
                        style={{width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '6px'}}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Passo 6: Resultados do Matching */}
            {currentStep === 6 && (
              <div>
                {isProcessing ? (
                  <div className="card-professional">
                    <div className="card-body" style={{textAlign: 'center', padding: '60px'}}>
                      <div style={{
                        width: '80px',
                        height: '80px',
                        border: '6px solid #e0e0e0',
                        borderTop: '6px solid #4caf50',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 24px'
                      }}></div>
                      <h3 style={{color: '#4caf50', marginBottom: '16px'}}><Brain size={16} /> Processando com IA...</h3>
                      <p style={{color: '#666', marginBottom: '16px'}}>
                        Analisando seus dados e encontrando os melhores profissionais
                      </p>
                      <div style={{fontSize: '14px', color: '#999'}}>
                        • Verificando disponibilidade<br/>
                        • Calculando compatibilidade<br/>
                        • Ordenando por relevância
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="card-professional" style={{marginBottom: '24px', background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)', border: '2px solid #4caf50'}}>
                      <div className="card-body">
                        <div style={{textAlign: 'center'}}>
                          <h3 style={{color: '#4caf50', marginBottom: '16px'}}>
                            <Target size={16} /> Matching Concluído! Score: {matchingScore}%
                          </h3>
                          <p style={{margin: 0, color: '#666'}}>
                            Encontramos {matchedProfessionals.length} profissionais ideais para seu perfil
                          </p>
                        </div>
                      </div>
                    </div>

                    {matchedProfessionals.map((professional, index) => (
                      <div key={professional.id} className="card-professional" style={{marginBottom: '16px'}}>
                        <div className="card-body">
                          <div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
                            <img 
                              src={professional.photo} 
                              alt={professional.name}
                              style={{width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover'}}
                            />
                            <div style={{flex: 1}}>
                              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'}}>
                                <h4 style={{margin: 0, color: '#1976d2'}}>{professional.name}</h4>
                                <div style={{
                                  padding: '4px 12px',
                                  background: professional.matchScore > 90 ? '#4caf50' : professional.matchScore > 80 ? '#ff9800' : '#2196f3',
                                  color: 'white',
                                  borderRadius: '12px',
                                  fontSize: '12px',
                                  fontWeight: 'bold'
                                }}>
                                  {professional.matchScore}% Match
                                </div>
                              </div>
                              <div style={{marginBottom: '8px'}}>
                                <span style={{color: '#666'}}>{professional.specialty}</span>
                                <span style={{margin: '0 8px', color: '#ccc'}}>•</span>
                                <span style={{color: '#666'}}>{professional.experience} anos</span>
                                <span style={{margin: '0 8px', color: '#ccc'}}>•</span>
                                <span style={{color: '#ff9800'}}><Star size={16} /> {professional.rating}</span>
                              </div>
                              <div style={{fontSize: '14px', color: '#666', marginBottom: '8px'}}>
                                <MapPin size={16} /> {professional.location} ({professional.distance}km)
                              </div>
                              <div style={{fontSize: '14px', color: '#666', marginBottom: '12px'}}>
                                🕒 {professional.availability}
                              </div>
                              <div style={{display: 'flex', gap: '8px', marginBottom: '12px'}}>
                                {professional.specializations.map((spec) => (
                                  <span key={spec} style={{
                                    padding: '2px 8px',
                                    background: '#e3f2fd',
                                    color: '#1976d2',
                                    borderRadius: '12px',
                                    fontSize: '12px'
                                  }}>
                                    {spec}
                                  </span>
                                ))}
                              </div>
                              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                <div style={{fontSize: '18px', fontWeight: 'bold', color: '#4caf50'}}>
                                  R$ {professional.price}
                                </div>
                                <button 
                                  onClick={() => selectProfessional(professional)}
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
                                  <Check size={16} /> Selecionar
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Botões de Navegação */}
            {currentStep < 6 && (
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
                  {currentStep === 5 ? '<Target size={16} /> Encontrar Profissionais' : 'Próximo →'}
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div>
            {/* Resumo da Triagem */}
            <div className="card-professional" style={{marginBottom: '16px'}}>
              <div className="card-header">
                <h3 className="card-title"><FileText size={16} /> Resumo</h3>
              </div>
              <div className="card-body">
                <div style={{fontSize: '14px', lineHeight: '1.6'}}>
                  {triageData.serviceType && (
                    <div style={{marginBottom: '8px'}}>
                      <strong>Serviço:</strong> {serviceTypes.find(s => s.id === triageData.serviceType)?.name}
                    </div>
                  )}
                  {triageData.age && (
                    <div style={{marginBottom: '8px'}}>
                      <strong>Idade:</strong> {triageData.age} anos
                    </div>
                  )}
                  {triageData.location.city && (
                    <div style={{marginBottom: '8px'}}>
                      <strong>Local:</strong> {triageData.location.city}
                    </div>
                  )}
                  {triageData.urgencyLevel && (
                    <div style={{marginBottom: '8px'}}>
                      <strong>Urgência:</strong> {urgencyLevels.find(u => u.id === triageData.urgencyLevel)?.name}
                    </div>
                  )}
                  {triageData.comorbidities.length > 0 && (
                    <div style={{marginBottom: '8px'}}>
                      <strong>Condições:</strong> {triageData.comorbidities.length} selecionadas
                    </div>
                  )}
                  {triageData.symptoms.length > 0 && (
                    <div style={{marginBottom: '8px'}}>
                      <strong>Sintomas:</strong> {triageData.symptoms.length} relatados
                    </div>
                  )}
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
                      Seja específico sobre sua localização para encontrar profissionais próximos.
                    </p>
                  )}
                  {currentStep === 2 && (
                    <p style={{margin: 0}}>
                      Informações médicas precisas ajudam a encontrar o especialista ideal.
                    </p>
                  )}
                  {currentStep === 3 && (
                    <p style={{margin: 0}}>
                      O nível de urgência afeta a disponibilidade e o preço dos profissionais.
                    </p>
                  )}
                  {currentStep === 4 && (
                    <p style={{margin: 0}}>
                      Suas preferências ajudam a personalizar a experiência de atendimento.
                    </p>
                  )}
                  {currentStep === 5 && (
                    <p style={{margin: 0}}>
                      Descreva seus sintomas detalhadamente para um diagnóstico mais preciso.
                    </p>
                  )}
                  {currentStep === 6 && (
                    <p style={{margin: 0}}>
                      Os profissionais são ordenados por compatibilidade com seu perfil.
                    </p>
                  )}
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

export default IntelligentTriage;

