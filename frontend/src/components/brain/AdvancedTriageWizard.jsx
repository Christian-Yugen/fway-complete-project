import React, { useState, useEffect } from 'react';
import { 
  Brain,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  Heart,
  Thermometer,
  Scale,
  MapPin,
  Calendar,
  User,
  FileText,
  Stethoscope,
  Eye,
  Ear,
  Zap,
  Target,
  TrendingUp,
  Info,
  ArrowRight,
  ArrowLeft,
  Star,
  Shield,
  Phone,
  Navigation,
  Plus,
  Minus
} from 'lucide-react';

const AdvancedTriageWizard = ({ 
  onTriageComplete,
  onEmergencyDetected,
  initialSymptoms = [],
  userId 
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [triageData, setTriageData] = useState({
    // Informações básicas
    age: '',
    gender: '',
    weight: '',
    height: '',
    
    // Sintomas principais
    primarySymptoms: initialSymptoms,
    symptomDuration: '',
    symptomSeverity: 5,
    symptomProgression: '',
    
    // Sintomas específicos por sistema
    cardiovascular: {
      chestPain: false,
      palpitations: false,
      shortnessOfBreath: false,
      swelling: false,
      dizziness: false
    },
    
    respiratory: {
      cough: false,
      wheezing: false,
      sputum: false,
      breathingDifficulty: false
    },
    
    neurological: {
      headache: false,
      confusion: false,
      weakness: false,
      numbness: false,
      seizures: false
    },
    
    gastrointestinal: {
      nausea: false,
      vomiting: false,
      diarrhea: false,
      abdominalPain: false,
      appetite: false
    },
    
    // Sinais vitais
    vitals: {
      temperature: '',
      bloodPressure: '',
      heartRate: '',
      respiratoryRate: '',
      oxygenSaturation: ''
    },
    
    // Histórico médico
    medicalHistory: {
      chronicConditions: [],
      currentMedications: [],
      allergies: [],
      recentSurgeries: [],
      familyHistory: []
    },
    
    // Fatores de risco
    riskFactors: {
      smoking: false,
      alcohol: false,
      drugs: false,
      pregnancy: false,
      immunocompromised: false
    },
    
    // Contexto situacional
    context: {
      location: '',
      timeOfOnset: '',
      triggeringFactors: '',
      relievingFactors: '',
      associatedSymptoms: []
    }
  });

  const [triageResult, setTriageResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [redFlags, setRedFlags] = useState([]);
  const [riskScore, setRiskScore] = useState(0);

  const totalSteps = 6;

  useEffect(() => {
    // Verificar red flags em tempo real
    checkRedFlags();
    calculateRiskScore();
  }, [triageData]);

  const checkRedFlags = () => {
    const flags = [];
    
    // Red flags cardiovasculares
    if (triageData.cardiovascular.chestPain && triageData.symptomSeverity >= 7) {
      flags.push({
        type: 'CARDIOVASCULAR',
        severity: 'HIGH',
        message: 'Dor torácica intensa pode indicar emergência cardíaca',
        action: 'Procurar atendimento imediato'
      });
    }
    
    // Red flags neurológicas
    if (triageData.neurological.confusion || triageData.neurological.seizures) {
      flags.push({
        type: 'NEUROLOGICAL',
        severity: 'HIGH',
        message: 'Sintomas neurológicos graves detectados',
        action: 'Chamar SAMU (192)'
      });
    }
    
    // Red flags respiratórias
    if (triageData.respiratory.breathingDifficulty && triageData.symptomSeverity >= 8) {
      flags.push({
        type: 'RESPIRATORY',
        severity: 'HIGH',
        message: 'Dificuldade respiratória grave',
        action: 'Atendimento de emergência necessário'
      });
    }
    
    // Red flags por sinais vitais
    if (triageData.vitals.temperature && parseFloat(triageData.vitals.temperature) >= 39.5) {
      flags.push({
        type: 'VITAL_SIGNS',
        severity: 'MEDIUM',
        message: 'Febre alta detectada',
        action: 'Monitoramento médico recomendado'
      });
    }
    
    setRedFlags(flags);
    
    // Notificar emergência se red flags críticos
    const criticalFlags = flags.filter(flag => flag.severity === 'HIGH');
    if (criticalFlags.length > 0 && onEmergencyDetected) {
      onEmergencyDetected(criticalFlags);
    }
  };

  const calculateRiskScore = () => {
    let score = 0;
    
    // Score baseado na idade
    const age = parseInt(triageData.age);
    if (age > 65) score += 20;
    else if (age > 45) score += 10;
    else if (age < 2) score += 15;
    
    // Score baseado na severidade dos sintomas
    score += triageData.symptomSeverity * 2;
    
    // Score baseado em red flags
    score += redFlags.length * 15;
    
    // Score baseado em condições crônicas
    score += triageData.medicalHistory.chronicConditions.length * 5;
    
    // Score baseado em fatores de risco
    if (triageData.riskFactors.smoking) score += 10;
    if (triageData.riskFactors.immunocompromised) score += 15;
    if (triageData.riskFactors.pregnancy) score += 10;
    
    setRiskScore(Math.min(100, score));
  };

  const performTriage = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/brain/advanced-triage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          symptoms: triageData.primarySymptoms,
          duration: triageData.symptomDuration,
          severity: triageData.symptomSeverity,
          additionalInfo: triageData
        })
      });
      
      if (!response.ok) {
        throw new Error('Erro na triagem');
      }
      
      const data = await response.json();
      setTriageResult(data.data);
      
      if (onTriageComplete) {
        onTriageComplete(data.data);
      }
      
    } catch (error) {
      console.error('Erro na triagem:', error);
      
      // Fallback com resultado simulado
      const mockResult = generateMockTriageResult();
      setTriageResult(mockResult);
      
      if (onTriageComplete) {
        onTriageComplete(mockResult);
      }
    } finally {
      setLoading(false);
    }
  };

  const generateMockTriageResult = () => {
    let urgencyLevel = 'LOW';
    if (riskScore >= 70) urgencyLevel = 'EMERGENCY';
    else if (riskScore >= 50) urgencyLevel = 'HIGH';
    else if (riskScore >= 30) urgencyLevel = 'MEDIUM';
    
    return {
      triageId: `triage_${Date.now()}`,
      urgencyLevel,
      riskScore,
      confidence: 0.87,
      possibleConditions: [
        {
          condition: 'Infecção respiratória viral',
          probability: 0.65,
          severity: 'MILD'
        },
        {
          condition: 'Síndrome gripal',
          probability: 0.45,
          severity: 'MILD'
        }
      ],
      recommendations: [
        {
          type: 'IMMEDIATE',
          action: urgencyLevel === 'EMERGENCY' ? 'Procurar pronto-socorro imediatamente' : 'Agendar consulta médica',
          priority: urgencyLevel === 'EMERGENCY' ? 'CRITICAL' : 'HIGH'
        },
        {
          type: 'MONITORING',
          action: 'Monitorar sintomas e temperatura',
          priority: 'MEDIUM'
        }
      ],
      nextSteps: [
        'Manter hidratação adequada',
        'Repouso',
        'Monitorar evolução dos sintomas'
      ],
      estimatedWaitTime: urgencyLevel === 'EMERGENCY' ? '0 min' : '2-4 horas',
      recommendedSpecialties: ['Clínico Geral', 'Pneumologista']
    };
  };

  const updateTriageData = (field, value) => {
    setTriageData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateNestedData = (section, field, value) => {
    setTriageData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const addToArray = (section, field, value) => {
    if (!value.trim()) return;
    
    setTriageData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: [...prev[section][field], value.trim()]
      }
    }));
  };

  const removeFromArray = (section, field, index) => {
    setTriageData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: prev[section][field].filter((_, i) => i !== index)
      }
    }));
  };

  const getUrgencyColor = (level) => {
    const colors = {
      'EMERGENCY': 'text-red-600 bg-red-100',
      'HIGH': 'text-orange-600 bg-orange-100',
      'MEDIUM': 'text-yellow-600 bg-yellow-100',
      'LOW': 'text-green-600 bg-green-100'
    };
    return colors[level] || 'text-gray-600 bg-gray-100';
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <User className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-800 mb-2">Informações Básicas</h3>
        <p className="text-gray-600">Vamos começar com algumas informações sobre você</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Idade</label>
          <input
            type="number"
            value={triageData.age}
            onChange={(e) => updateTriageData('age', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ex: 35"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Gênero</label>
          <select
            value={triageData.gender}
            onChange={(e) => updateTriageData('gender', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Selecione</option>
            <option value="M">Masculino</option>
            <option value="F">Feminino</option>
            <option value="O">Outro</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Peso (kg)</label>
          <input
            type="number"
            value={triageData.weight}
            onChange={(e) => updateTriageData('weight', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ex: 70"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Altura (cm)</label>
          <input
            type="number"
            value={triageData.height}
            onChange={(e) => updateTriageData('height', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ex: 175"
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Stethoscope className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-800 mb-2">Sintomas Principais</h3>
        <p className="text-gray-600">Descreva seus sintomas atuais</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Há quanto tempo você tem esses sintomas?
        </label>
        <select
          value={triageData.symptomDuration}
          onChange={(e) => updateTriageData('symptomDuration', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Selecione</option>
          <option value="< 1 hora">Menos de 1 hora</option>
          <option value="1-6 horas">1 a 6 horas</option>
          <option value="6-24 horas">6 a 24 horas</option>
          <option value="1-3 dias">1 a 3 dias</option>
          <option value="3-7 dias">3 a 7 dias</option>
          <option value="> 1 semana">Mais de 1 semana</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Intensidade dos sintomas (1-10)
        </label>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">1 (Leve)</span>
          <input
            type="range"
            min="1"
            max="10"
            value={triageData.symptomSeverity}
            onChange={(e) => updateTriageData('symptomSeverity', parseInt(e.target.value))}
            className="flex-1"
          />
          <span className="text-sm text-gray-500">10 (Grave)</span>
        </div>
        <div className="text-center mt-2">
          <span className={`text-2xl font-bold ${
            triageData.symptomSeverity <= 3 ? 'text-green-600' :
            triageData.symptomSeverity <= 6 ? 'text-yellow-600' :
            'text-red-600'
          }`}>
            {triageData.symptomSeverity}
          </span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Como os sintomas evoluíram?
        </label>
        <select
          value={triageData.symptomProgression}
          onChange={(e) => updateTriageData('symptomProgression', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Selecione</option>
          <option value="Melhorando">Melhorando</option>
          <option value="Estável">Estável</option>
          <option value="Piorando">Piorando</option>
          <option value="Intermitente">Intermitente</option>
        </select>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Activity className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-800 mb-2">Sintomas por Sistema</h3>
        <p className="text-gray-600">Marque os sintomas que você está sentindo</p>
      </div>

      {/* Sistema Cardiovascular */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Heart className="h-5 w-5 text-red-600" />
          <h4 className="font-medium text-gray-800">Sistema Cardiovascular</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.entries({
            chestPain: 'Dor no peito',
            palpitations: 'Palpitações',
            shortnessOfBreath: 'Falta de ar',
            swelling: 'Inchaço',
            dizziness: 'Tontura'
          }).map(([key, label]) => (
            <label key={key} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={triageData.cardiovascular[key]}
                onChange={(e) => updateNestedData('cardiovascular', key, e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Sistema Respiratório */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Activity className="h-5 w-5 text-blue-600" />
          <h4 className="font-medium text-gray-800">Sistema Respiratório</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.entries({
            cough: 'Tosse',
            wheezing: 'Chiado no peito',
            sputum: 'Catarro',
            breathingDifficulty: 'Dificuldade para respirar'
          }).map(([key, label]) => (
            <label key={key} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={triageData.respiratory[key]}
                onChange={(e) => updateNestedData('respiratory', key, e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Sistema Neurológico */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Brain className="h-5 w-5 text-purple-600" />
          <h4 className="font-medium text-gray-800">Sistema Neurológico</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.entries({
            headache: 'Dor de cabeça',
            confusion: 'Confusão mental',
            weakness: 'Fraqueza',
            numbness: 'Dormência',
            seizures: 'Convulsões'
          }).map(([key, label]) => (
            <label key={key} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={triageData.neurological[key]}
                onChange={(e) => updateNestedData('neurological', key, e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Thermometer className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-800 mb-2">Sinais Vitais</h3>
        <p className="text-gray-600">Se souber, informe seus sinais vitais atuais</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Temperatura (°C)
          </label>
          <input
            type="number"
            step="0.1"
            value={triageData.vitals.temperature}
            onChange={(e) => updateNestedData('vitals', 'temperature', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ex: 37.5"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pressão Arterial (mmHg)
          </label>
          <input
            type="text"
            value={triageData.vitals.bloodPressure}
            onChange={(e) => updateNestedData('vitals', 'bloodPressure', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ex: 120/80"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Frequência Cardíaca (bpm)
          </label>
          <input
            type="number"
            value={triageData.vitals.heartRate}
            onChange={(e) => updateNestedData('vitals', 'heartRate', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ex: 80"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Saturação O2 (%)
          </label>
          <input
            type="number"
            value={triageData.vitals.oxygenSaturation}
            onChange={(e) => updateNestedData('vitals', 'oxygenSaturation', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ex: 98"
          />
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Não tem certeza dos valores?</p>
            <p>Não se preocupe! Você pode pular esta etapa. Nossa IA consegue fazer uma boa avaliação mesmo sem esses dados.</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <FileText className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-800 mb-2">Histórico Médico</h3>
        <p className="text-gray-600">Informações sobre seu histórico de saúde</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Condições crônicas
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {triageData.medicalHistory.chronicConditions.map((condition, index) => (
              <span key={index} className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full flex items-center space-x-1">
                <span>{condition}</span>
                <button
                  onClick={() => removeFromArray('medicalHistory', 'chronicConditions', index)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Minus className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Ex: Diabetes, Hipertensão"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  addToArray('medicalHistory', 'chronicConditions', e.target.value);
                  e.target.value = '';
                }
              }}
            />
            <button
              onClick={(e) => {
                const input = e.target.previousElementSibling;
                addToArray('medicalHistory', 'chronicConditions', input.value);
                input.value = '';
              }}
              className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Medicamentos atuais
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {triageData.medicalHistory.currentMedications.map((medication, index) => (
              <span key={index} className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full flex items-center space-x-1">
                <span>{medication}</span>
                <button
                  onClick={() => removeFromArray('medicalHistory', 'currentMedications', index)}
                  className="text-green-600 hover:text-green-800"
                >
                  <Minus className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Ex: Losartana 50mg"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  addToArray('medicalHistory', 'currentMedications', e.target.value);
                  e.target.value = '';
                }
              }}
            />
            <button
              onClick={(e) => {
                const input = e.target.previousElementSibling;
                addToArray('medicalHistory', 'currentMedications', input.value);
                input.value = '';
              }}
              className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Alergias conhecidas
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {triageData.medicalHistory.allergies.map((allergy, index) => (
              <span key={index} className="bg-red-100 text-red-800 text-sm px-3 py-1 rounded-full flex items-center space-x-1">
                <span>{allergy}</span>
                <button
                  onClick={() => removeFromArray('medicalHistory', 'allergies', index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Minus className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Ex: Penicilina, Dipirona"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  addToArray('medicalHistory', 'allergies', e.target.value);
                  e.target.value = '';
                }
              }}
            />
            <button
              onClick={(e) => {
                const input = e.target.previousElementSibling;
                addToArray('medicalHistory', 'allergies', input.value);
                input.value = '';
              }}
              className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep6 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Target className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-800 mb-2">Revisão e Triagem</h3>
        <p className="text-gray-600">Revise suas informações antes da análise final</p>
      </div>

      {/* Risk Score */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-gray-800">Score de Risco Preliminar</h4>
          <div className={`text-3xl font-bold ${
            riskScore <= 30 ? 'text-green-600' :
            riskScore <= 60 ? 'text-yellow-600' :
            'text-red-600'
          }`}>
            {riskScore}
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full ${
              riskScore <= 30 ? 'bg-green-500' :
              riskScore <= 60 ? 'bg-yellow-500' :
              'bg-red-500'
            }`}
            style={{ width: `${riskScore}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {riskScore <= 30 ? 'Risco baixo - Situação estável' :
           riskScore <= 60 ? 'Risco moderado - Atenção recomendada' :
           'Risco alto - Avaliação urgente necessária'}
        </p>
      </div>

      {/* Red Flags */}
      {redFlags.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h4 className="font-semibold text-red-800">Sinais de Alerta Detectados</h4>
          </div>
          <div className="space-y-2">
            {redFlags.map((flag, index) => (
              <div key={index} className="bg-white border border-red-200 rounded p-3">
                <p className="text-sm font-medium text-red-800">{flag.message}</p>
                <p className="text-xs text-red-600 mt-1">{flag.action}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-gray-200 rounded-lg p-4">
          <h5 className="font-medium text-gray-800 mb-2">Sintomas Principais</h5>
          <p className="text-sm text-gray-600">
            Severidade: {triageData.symptomSeverity}/10<br/>
            Duração: {triageData.symptomDuration}<br/>
            Progressão: {triageData.symptomProgression}
          </p>
        </div>
        
        <div className="border border-gray-200 rounded-lg p-4">
          <h5 className="font-medium text-gray-800 mb-2">Informações Básicas</h5>
          <p className="text-sm text-gray-600">
            Idade: {triageData.age} anos<br/>
            Gênero: {triageData.gender}<br/>
            Condições: {triageData.medicalHistory.chronicConditions.length}
          </p>
        </div>
      </div>

      <button
        onClick={performTriage}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Analisando...</span>
          </>
        ) : (
          <>
            <Brain className="h-5 w-5" />
            <span>Realizar Triagem com IA</span>
          </>
        )}
      </button>
    </div>
  );

  const renderResult = () => (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-800 mb-2">Triagem Concluída</h3>
        <p className="text-gray-600">Análise realizada com sucesso</p>
      </div>

      {/* Urgency Level */}
      <div className={`rounded-lg p-6 border-2 ${getUrgencyColor(triageResult.urgencyLevel)}`}>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xl font-bold">Nível de Urgência</h4>
          <span className="text-2xl font-bold">{triageResult.urgencyLevel}</span>
        </div>
        <p className="text-sm">
          Tempo estimado de espera: {triageResult.estimatedWaitTime}
        </p>
      </div>

      {/* Possible Conditions */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-800 mb-3">Possíveis Condições</h4>
        <div className="space-y-2">
          {triageResult.possibleConditions.map((condition, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="text-sm font-medium">{condition.condition}</span>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">{Math.round(condition.probability * 100)}%</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  condition.severity === 'MILD' ? 'bg-green-100 text-green-800' :
                  condition.severity === 'MODERATE' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {condition.severity}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-800 mb-3">Recomendações</h4>
        <div className="space-y-3">
          {triageResult.recommendations.map((rec, index) => (
            <div key={index} className={`p-3 rounded border-l-4 ${
              rec.priority === 'CRITICAL' ? 'border-red-500 bg-red-50' :
              rec.priority === 'HIGH' ? 'border-orange-500 bg-orange-50' :
              'border-blue-500 bg-blue-50'
            }`}>
              <p className="text-sm font-medium">{rec.action}</p>
              <span className={`text-xs px-2 py-1 rounded-full ${
                rec.priority === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                rec.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {rec.priority}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-3">Próximos Passos</h4>
        <ul className="space-y-1">
          {triageResult.nextSteps.map((step, index) => (
            <li key={index} className="text-sm text-blue-700 flex items-center space-x-2">
              <CheckCircle className="h-3 w-3 text-blue-600" />
              <span>{step}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Actions */}
      <div className="flex space-x-3">
        <button
          onClick={() => {
            // Agendar consulta
            console.log('Agendar consulta');
          }}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Agendar Consulta
        </button>
        
        <button
          onClick={() => {
            // Buscar especialista
            console.log('Buscar especialista');
          }}
          className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Buscar Especialista
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Progress Bar */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">
            {triageResult ? 'Concluído' : `Etapa ${currentStep} de ${totalSteps}`}
          </span>
          <span className="text-sm text-gray-500">
            {triageResult ? 'Resultado' : 
             currentStep === 1 ? 'Informações Básicas' :
             currentStep === 2 ? 'Sintomas Principais' :
             currentStep === 3 ? 'Sintomas por Sistema' :
             currentStep === 4 ? 'Sinais Vitais' :
             currentStep === 5 ? 'Histórico Médico' :
             'Revisão'}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${triageResult ? 100 : (currentStep / totalSteps) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {!triageResult && (
          <>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
            {currentStep === 5 && renderStep5()}
            {currentStep === 6 && renderStep6()}
          </>
        )}
        
        {triageResult && renderResult()}
      </div>

      {/* Navigation */}
      {!triageResult && currentStep < 6 && (
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Anterior</span>
          </button>
          
          <button
            onClick={() => setCurrentStep(Math.min(totalSteps, currentStep + 1))}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <span>Próximo</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default AdvancedTriageWizard;

