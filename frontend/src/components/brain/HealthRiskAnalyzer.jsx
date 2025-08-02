import React, { useState, useEffect } from 'react';
import { 
  Brain,
  Activity,
  Heart,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Info,
  Target,
  Shield,
  Zap,
  BarChart3,
  PieChart,
  Calendar,
  User,
  MapPin,
  Clock,
  Star,
  Award,
  Lightbulb,
  Eye,
  RefreshCw,
  Download,
  Share,
  Settings
} from 'lucide-react';

const HealthRiskAnalyzer = ({ userId, onRecommendation, onRiskUpdate }) => {
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [riskAnalysis, setRiskAnalysis] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [timeRange, setTimeRange] = useState('6m');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadRiskAnalysis();
    loadUserProfile();
  }, [userId, timeRange]);

  const loadRiskAnalysis = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/brain/health-risk-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          factors: [],
          lifestyle: {},
          familyHistory: []
        })
      });

      if (response.ok) {
        const data = await response.json();
        setRiskAnalysis(data.data);
        
        if (onRiskUpdate) {
          onRiskUpdate(data.data);
        }
      } else {
        throw new Error('Erro ao carregar análise de risco');
      }
    } catch (error) {
      console.error('Erro:', error);
      // Usar dados mock para desenvolvimento
      setRiskAnalysis(generateMockRiskAnalysis());
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async () => {
    try {
      // Simular carregamento do perfil do usuário
      setUserProfile({
        age: 32,
        gender: 'M',
        location: { city: 'São Paulo', state: 'SP' },
        lifestyle: {
          smoking: 'NEVER',
          alcohol: 'MODERATE',
          exercise: 'MODERATE',
          diet: 'BALANCED'
        },
        medicalHistory: ['hipertensão'],
        familyHistory: ['diabetes', 'doença cardíaca']
      });
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    }
  };

  const generateMockRiskAnalysis = () => ({
    assessmentId: 'risk_' + Date.now(),
    overallScore: 68,
    level: 'MEDIUM',
    confidence: 0.89,
    categoryRisks: {
      cardiovascular: 72,
      diabetes: 45,
      cancer: 35,
      mentalHealth: 58
    },
    recommendations: [
      {
        category: 'CARDIOVASCULAR',
        priority: 'HIGH',
        title: 'Atividade Física Regular',
        description: 'Aumentar frequência de exercícios aeróbicos para 150 min/semana',
        impact: 'Redução estimada de 15-20 pontos no risco cardiovascular',
        timeframe: '3-6 meses',
        difficulty: 'MEDIUM'
      },
      {
        category: 'LIFESTYLE',
        priority: 'MEDIUM',
        title: 'Controle do Estresse',
        description: 'Implementar técnicas de relaxamento e mindfulness',
        impact: 'Melhoria na saúde mental e redução do risco cardiovascular',
        timeframe: '1-3 meses',
        difficulty: 'LOW'
      },
      {
        category: 'MEDICAL',
        priority: 'HIGH',
        title: 'Monitoramento da Pressão Arterial',
        description: 'Acompanhamento regular com cardiologista',
        impact: 'Controle adequado da hipertensão',
        timeframe: 'Contínuo',
        difficulty: 'LOW'
      }
    ],
    modifiableFactors: [
      {
        factor: 'Sedentarismo',
        impact: 'HIGH',
        action: 'Iniciar programa de exercícios',
        resources: ['Personal trainer', 'Aplicativos de fitness', 'Grupos de caminhada']
      },
      {
        factor: 'Estresse',
        impact: 'MEDIUM',
        action: 'Técnicas de relaxamento',
        resources: ['Meditação', 'Yoga', 'Terapia']
      }
    ],
    detailedAnalysis: {
      primaryRisks: [
        { category: 'cardiovascular', score: 72, trend: 'STABLE' },
        { category: 'mentalHealth', score: 58, trend: 'IMPROVING' }
      ],
      protectiveFactors: [
        'Não fumante',
        'Dieta balanceada',
        'Acompanhamento médico regular'
      ],
      timeline: {
        shortTerm: 'Implementar mudanças no estilo de vida',
        mediumTerm: 'Monitorar evolução dos fatores de risco',
        longTerm: 'Manter hábitos saudáveis preventivos'
      }
    },
    nextAssessmentDate: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000),
    lastUpdated: new Date()
  });

  const performNewAnalysis = async () => {
    setAnalyzing(true);
    try {
      await loadRiskAnalysis();
    } finally {
      setAnalyzing(false);
    }
  };

  const getRiskColor = (score) => {
    if (score <= 30) return 'text-green-600';
    if (score <= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRiskBgColor = (score) => {
    if (score <= 30) return 'bg-green-500';
    if (score <= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getRiskLevel = (score) => {
    if (score <= 30) return 'Baixo';
    if (score <= 60) return 'Moderado';
    return 'Alto';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'HIGH': 'text-red-600 bg-red-100',
      'MEDIUM': 'text-yellow-600 bg-yellow-100',
      'LOW': 'text-green-600 bg-green-100'
    };
    return colors[priority] || 'text-gray-600 bg-gray-100';
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      'HIGH': 'text-red-600',
      'MEDIUM': 'text-yellow-600',
      'LOW': 'text-green-600'
    };
    return colors[difficulty] || 'text-gray-600';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center justify-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Carregando análise de risco...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Brain className="h-8 w-8" />
              <div>
                <h2 className="text-2xl font-bold">Análise de Risco de Saúde</h2>
                <p className="text-purple-100">Avaliação inteligente baseada em IA</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-white bg-opacity-20 text-white border border-white border-opacity-30 rounded-lg px-3 py-1 text-sm"
              >
                <option value="3m">Últimos 3 meses</option>
                <option value="6m">Últimos 6 meses</option>
                <option value="1y">Último ano</option>
              </select>
              
              <button
                onClick={performNewAnalysis}
                disabled={analyzing}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-lg transition-colors"
              >
                <RefreshCw className={`h-5 w-5 ${analyzing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Overall Risk Score */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Score Geral de Risco</h3>
                <span className={`text-sm px-3 py-1 rounded-full ${
                  riskAnalysis.level === 'LOW' ? 'bg-green-100 text-green-800' :
                  riskAnalysis.level === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {getRiskLevel(riskAnalysis.overallScore)}
                </span>
              </div>
              
              <div className="flex items-end space-x-4 mb-4">
                <span className={`text-5xl font-bold ${getRiskColor(riskAnalysis.overallScore)}`}>
                  {riskAnalysis.overallScore}
                </span>
                <div className="flex-1 pb-2">
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div 
                      className={`h-4 rounded-full ${getRiskBgColor(riskAnalysis.overallScore)}`}
                      style={{ width: `${riskAnalysis.overallScore}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0</span>
                    <span>50</span>
                    <span>100</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Target className="h-4 w-4" />
                  <span>Confiança: {Math.round(riskAnalysis.confidence * 100)}%</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Atualizado: {formatDate(riskAnalysis.lastUpdated)}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Próxima Avaliação</span>
                </div>
                <p className="text-sm text-blue-700">
                  {formatDate(riskAnalysis.nextAssessmentDate)}
                </p>
              </div>
              
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg transition-colors text-sm"
              >
                {showDetails ? 'Ocultar' : 'Ver'} Detalhes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Categories */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Riscos por Categoria</h3>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todas as categorias</option>
            <option value="cardiovascular">Cardiovascular</option>
            <option value="diabetes">Diabetes</option>
            <option value="cancer">Câncer</option>
            <option value="mentalHealth">Saúde Mental</option>
          </select>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(riskAnalysis.categoryRisks).map(([category, score]) => {
            if (selectedCategory !== 'all' && selectedCategory !== category) return null;
            
            const categoryNames = {
              cardiovascular: 'Cardiovascular',
              diabetes: 'Diabetes',
              cancer: 'Câncer',
              mentalHealth: 'Saúde Mental'
            };
            
            const categoryIcons = {
              cardiovascular: Heart,
              diabetes: Activity,
              cancer: Shield,
              mentalHealth: Brain
            };
            
            const IconComponent = categoryIcons[category];
            
            return (
              <div key={category} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <IconComponent className={`h-5 w-5 ${getRiskColor(score)}`} />
                  <span className="font-medium text-gray-800">{categoryNames[category]}</span>
                </div>
                
                <div className="flex items-end space-x-2 mb-2">
                  <span className={`text-2xl font-bold ${getRiskColor(score)}`}>
                    {score}
                  </span>
                  <span className="text-sm text-gray-500 mb-1">/ 100</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getRiskBgColor(score)}`}
                    style={{ width: `${score}%` }}
                  ></div>
                </div>
                
                <p className="text-xs text-gray-600 mt-2">
                  {getRiskLevel(score)} risco
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Lightbulb className="h-6 w-6 text-yellow-600" />
          <h3 className="text-lg font-semibold text-gray-800">Recomendações Personalizadas</h3>
        </div>
        
        <div className="space-y-4">
          {riskAnalysis.recommendations.map((rec, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-medium text-gray-800">{rec.title}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(rec.priority)}`}>
                      {rec.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                  <p className="text-xs text-blue-600">{rec.impact}</p>
                </div>
                
                <div className="text-right text-sm text-gray-500">
                  <div className="flex items-center space-x-1 mb-1">
                    <Clock className="h-3 w-3" />
                    <span>{rec.timeframe}</span>
                  </div>
                  <div className={`flex items-center space-x-1 ${getDifficultyColor(rec.difficulty)}`}>
                    <Target className="h-3 w-3" />
                    <span>{rec.difficulty}</span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => onRecommendation && onRecommendation(rec)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Implementar Recomendação
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modifiable Factors */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Zap className="h-6 w-6 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-800">Fatores Modificáveis</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {riskAnalysis.modifiableFactors.map((factor, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-800">{factor.factor}</h4>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  factor.impact === 'HIGH' ? 'bg-red-100 text-red-800' :
                  factor.impact === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {factor.impact}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">{factor.action}</p>
              
              <div>
                <p className="text-xs text-gray-500 mb-1">Recursos disponíveis:</p>
                <div className="flex flex-wrap gap-1">
                  {factor.resources.map((resource, idx) => (
                    <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {resource}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Analysis (Collapsible) */}
      {showDetails && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Análise Detalhada</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Primary Risks */}
            <div>
              <h4 className="font-medium text-gray-800 mb-3">Riscos Primários</h4>
              <div className="space-y-2">
                {riskAnalysis.detailedAnalysis.primaryRisks.map((risk, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm capitalize">{risk.category}</span>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-medium ${getRiskColor(risk.score)}`}>
                        {risk.score}
                      </span>
                      {risk.trend === 'IMPROVING' && <TrendingDown className="h-3 w-3 text-green-600" />}
                      {risk.trend === 'WORSENING' && <TrendingUp className="h-3 w-3 text-red-600" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Protective Factors */}
            <div>
              <h4 className="font-medium text-gray-800 mb-3">Fatores Protetivos</h4>
              <div className="space-y-1">
                {riskAnalysis.detailedAnalysis.protectiveFactors.map((factor, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    <span className="text-sm text-gray-700">{factor}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Timeline */}
            <div>
              <h4 className="font-medium text-gray-800 mb-3">Cronograma</h4>
              <div className="space-y-2">
                <div className="p-2 bg-blue-50 rounded">
                  <p className="text-xs font-medium text-blue-800">Curto Prazo</p>
                  <p className="text-xs text-blue-700">{riskAnalysis.detailedAnalysis.timeline.shortTerm}</p>
                </div>
                <div className="p-2 bg-yellow-50 rounded">
                  <p className="text-xs font-medium text-yellow-800">Médio Prazo</p>
                  <p className="text-xs text-yellow-700">{riskAnalysis.detailedAnalysis.timeline.mediumTerm}</p>
                </div>
                <div className="p-2 bg-green-50 rounded">
                  <p className="text-xs font-medium text-green-800">Longo Prazo</p>
                  <p className="text-xs text-green-700">{riskAnalysis.detailedAnalysis.timeline.longTerm}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-800">Ações Disponíveis</h3>
            <p className="text-sm text-gray-600">Gerencie sua análise de risco</p>
          </div>
          
          <div className="flex space-x-3">
            <button className="flex items-center space-x-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="h-4 w-4" />
              <span>Exportar</span>
            </button>
            
            <button className="flex items-center space-x-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              <Share className="h-4 w-4" />
              <span>Compartilhar</span>
            </button>
            
            <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              <Settings className="h-4 w-4" />
              <span>Configurar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthRiskAnalyzer;

