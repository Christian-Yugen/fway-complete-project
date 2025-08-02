import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Shield,
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Award,
  Zap,
  Target,
  Activity,
  BarChart3,
  PieChart,
  Users,
  Globe,
  Lock,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Settings,
  Bell,
  Star,
  MapPin,
  Calendar,
  FileText,
  Percent,
  Eye,
  Plus,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';

const EnhancedShieldDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('30d');
  const [shieldData, setShieldData] = useState(null);
  const [activeCoverages, setActiveCoverages] = useState([]);
  const [riskAnalysis, setRiskAnalysis] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [aiInsights, setAiInsights] = useState([]);
  const [epidemiologicalData, setEpidemiologicalData] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, [timeRange]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Simular carregamento de dados (em produção, fazer chamadas reais para API)
      await Promise.all([
        loadShieldStatus(),
        loadActiveCoverages(),
        loadRiskAnalysis(),
        loadRecentActivity(),
        loadAIInsights(),
        loadEpidemiologicalData()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadShieldStatus = async () => {
    // Simular dados do Shield
    const mockData = {
      userShield: {
        riskScore: 72,
        shieldLevel: 'SILVER',
        totalPoints: 1250,
        isActive: true,
        nextLevelPoints: 500
      },
      stats: {
        totalCoverages: 8,
        activeCoverages: 3,
        totalClaims: 2,
        approvedClaims: 2,
        totalPayout: 850.00,
        totalPremiums: 245.50,
        estimatedSavings: 604.50,
        claimsApprovalRate: 100
      },
      performance: {
        claimsResolved: 2,
        averageResolutionTime: '2.4h',
        satisfactionRate: 96,
        savingsThisMonth: 125.30
      }
    };
    setShieldData(mockData);
  };

  const loadActiveCoverages = async () => {
    const mockCoverages = [
      {
        id: 'cov_001',
        coverage: {
          name: 'Cobertura Estendida',
          type: 'EXTENDED'
        },
        serviceValue: 350.00,
        premium: 17.50,
        startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        status: 'ACTIVE',
        riskScoreAtCreation: 75
      },
      {
        id: 'cov_002',
        coverage: {
          name: 'Cobertura Básica',
          type: 'BASIC'
        },
        serviceValue: 180.00,
        premium: 9.00,
        startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        status: 'ACTIVE',
        riskScoreAtCreation: 70
      },
      {
        id: 'cov_003',
        coverage: {
          name: 'Cobertura de Emergência',
          type: 'EMERGENCY'
        },
        serviceValue: 500.00,
        premium: 35.00,
        startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        status: 'ACTIVE',
        riskScoreAtCreation: 80
      }
    ];
    setActiveCoverages(mockCoverages);
  };

  const loadRiskAnalysis = async () => {
    const mockRiskAnalysis = {
      currentScore: 72,
      trend: 'IMPROVING',
      change: -3.2,
      confidence: 94.2,
      lastUpdated: new Date(),
      factors: {
        age: { score: 65, impact: 'MEDIUM', description: 'Faixa etária de baixo risco' },
        location: { score: 78, impact: 'HIGH', description: 'Região com incidência moderada' },
        lifestyle: { score: 45, impact: 'LOW', description: 'Estilo de vida saudável' },
        medical: { score: 85, impact: 'HIGH', description: 'Histórico médico com fatores de atenção' }
      },
      recommendations: [
        {
          type: 'LIFESTYLE',
          priority: 'MEDIUM',
          title: 'Atividade Física',
          description: 'Aumentar frequência de exercícios para reduzir score de risco',
          impact: 'Redução estimada de 5-8 pontos'
        },
        {
          type: 'MEDICAL',
          priority: 'HIGH',
          title: 'Acompanhamento Médico',
          description: 'Consulta preventiva recomendada',
          impact: 'Monitoramento contínuo do risco'
        }
      ],
      benchmarks: {
        ageGroup: 68,
        region: 75,
        similar: 70
      }
    };
    setRiskAnalysis(mockRiskAnalysis);
  };

  const loadRecentActivity = async () => {
    const mockActivity = [
      {
        id: 1,
        type: 'COVERAGE_ACTIVATED',
        title: 'Cobertura de Emergência Ativada',
        description: 'Microsseguro ativado para consulta cardiológica',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: 'SUCCESS',
        amount: 35.00
      },
      {
        id: 2,
        type: 'CLAIM_APPROVED',
        title: 'Sinistro Aprovado Automaticamente',
        description: 'Reembolso de R$ 180 processado pela IA',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        status: 'SUCCESS',
        amount: 180.00
      },
      {
        id: 3,
        type: 'RISK_SCORE_UPDATED',
        title: 'Score de Risco Atualizado',
        description: 'Melhoria de 3.2 pontos no score de risco',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        status: 'INFO',
        change: -3.2
      },
      {
        id: 4,
        type: 'LEVEL_UP',
        title: 'Nível Shield Atualizado',
        description: 'Parabéns! Você alcançou o nível Silver',
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        status: 'SUCCESS',
        level: 'SILVER'
      }
    ];
    setRecentActivity(mockActivity);
  };

  const loadAIInsights = async () => {
    const mockInsights = [
      {
        type: 'POSITIVE',
        title: 'Excelente Gestão de Risco',
        message: 'Seu score de risco melhorou 15% nos últimos 3 meses. Continue assim!',
        confidence: 0.95,
        action: 'Ver detalhes da evolução'
      },
      {
        type: 'INFO',
        title: 'Oportunidade de Economia',
        message: 'Baseado no seu perfil, você pode economizar até 20% ativando coberturas preventivas.',
        confidence: 0.87,
        action: 'Explorar opções'
      },
      {
        type: 'WARNING',
        title: 'Atenção: Período Sazonal',
        message: 'Estamos entrando no período de maior incidência de gripe. Considere cobertura adicional.',
        confidence: 0.82,
        action: 'Ver recomendações'
      }
    ];
    setAiInsights(mockInsights);
  };

  const loadEpidemiologicalData = async () => {
    const mockEpiData = {
      region: 'São Paulo, SP',
      currentAlerts: [
        {
          type: 'RESPIRATORY',
          level: 'MEDIUM',
          description: 'Aumento de 15% em casos respiratórios na região',
          recommendation: 'Considere cobertura adicional para consultas respiratórias'
        }
      ],
      trends: {
        respiratory: { current: 15, trend: 'UP', change: 15 },
        cardiovascular: { current: 8, trend: 'STABLE', change: 0 },
        gastrointestinal: { current: 12, trend: 'DOWN', change: -5 }
      },
      riskAdjustment: 1.1 // 10% de aumento no risco regional
    };
    setEpidemiologicalData(mockEpiData);
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const getRiskScoreColor = (score) => {
    if (score <= 50) return 'text-green-600';
    if (score <= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRiskScoreBgColor = (score) => {
    if (score <= 50) return 'bg-green-500';
    if (score <= 75) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getShieldLevelColor = (level) => {
    const colors = {
      'BRONZE': 'text-amber-600',
      'SILVER': 'text-gray-600',
      'GOLD': 'text-yellow-500',
      'PLATINUM': 'text-purple-600'
    };
    return colors[level] || 'text-gray-600';
  };

  const getActivityIcon = (type) => {
    const icons = {
      'COVERAGE_ACTIVATED': Shield,
      'CLAIM_APPROVED': CheckCircle,
      'RISK_SCORE_UPDATED': Activity,
      'LEVEL_UP': Award
    };
    return icons[type] || Info;
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d atrás`;
    if (hours > 0) return `${hours}h atrás`;
    return 'Agora';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-800">FWAY Shield</h1>
              </div>
              <div className="hidden md:flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${shieldData?.userShield.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-600">
                  {shieldData?.userShield.isActive ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="7d">Últimos 7 dias</option>
                <option value="30d">Últimos 30 dias</option>
                <option value="90d">Últimos 90 dias</option>
                <option value="1y">Último ano</option>
              </select>
              
              <button
                onClick={refreshData}
                disabled={refreshing}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              
              <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Risk Score Card */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-600">Score de Risco</span>
              </div>
              {riskAnalysis?.trend === 'IMPROVING' ? (
                <TrendingDown className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingUp className="h-4 w-4 text-red-600" />
              )}
            </div>
            <div className="flex items-end space-x-2">
              <span className={`text-3xl font-bold ${getRiskScoreColor(riskAnalysis?.currentScore)}`}>
                {riskAnalysis?.currentScore}
              </span>
              <span className="text-sm text-gray-500 mb-1">/100</span>
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <span className={`text-sm ${riskAnalysis?.change < 0 ? 'text-green-600' : 'text-red-600'}`}>
                {riskAnalysis?.change > 0 ? '+' : ''}{riskAnalysis?.change}%
              </span>
              <span className="text-xs text-gray-500">vs mês anterior</span>
            </div>
          </div>

          {/* Shield Level Card */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center space-x-2 mb-4">
              <Award className="h-5 w-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-600">Nível Shield</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`text-2xl font-bold ${getShieldLevelColor(shieldData?.userShield.shieldLevel)}`}>
                {shieldData?.userShield.shieldLevel}
              </span>
              <div className="flex-1">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ 
                      width: `${(shieldData?.userShield.totalPoints / (shieldData?.userShield.totalPoints + shieldData?.userShield.nextLevelPoints)) * 100}%` 
                    }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500 mt-1">
                  {shieldData?.userShield.nextLevelPoints} pontos para próximo nível
                </span>
              </div>
            </div>
          </div>

          {/* Active Coverages Card */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="h-5 w-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-600">Coberturas Ativas</span>
            </div>
            <div className="flex items-end space-x-2">
              <span className="text-3xl font-bold text-blue-600">
                {shieldData?.stats.activeCoverages}
              </span>
              <span className="text-sm text-gray-500 mb-1">
                de {shieldData?.stats.totalCoverages} total
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Valor total coberto: R$ {activeCoverages.reduce((sum, c) => sum + c.serviceValue, 0).toFixed(2)}
            </div>
          </div>

          {/* Savings Card */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center space-x-2 mb-4">
              <DollarSign className="h-5 w-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-600">Economia Total</span>
            </div>
            <div className="flex items-end space-x-2">
              <span className="text-3xl font-bold text-green-600">
                R$ {shieldData?.stats.estimatedSavings.toFixed(2)}
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Prêmios pagos: R$ {shieldData?.stats.totalPremiums.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Risk Analysis */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">Análise de Risco Detalhada</h3>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Ver relatório completo
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Risk Factors */}
                  <div>
                    <h4 className="font-medium text-gray-800 mb-4">Fatores de Risco</h4>
                    <div className="space-y-3">
                      {Object.entries(riskAnalysis?.factors || {}).map(([key, factor]) => (
                        <div key={key} className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-700 capitalize">{key}</span>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                factor.impact === 'HIGH' ? 'bg-red-100 text-red-800' :
                                factor.impact === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {factor.impact}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{factor.description}</p>
                          </div>
                          <span className={`text-sm font-bold ${getRiskScoreColor(factor.score)}`}>
                            {factor.score}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div>
                    <h4 className="font-medium text-gray-800 mb-4">Recomendações</h4>
                    <div className="space-y-3">
                      {riskAnalysis?.recommendations.map((rec, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex items-start space-x-2">
                            <div className={`w-2 h-2 rounded-full mt-2 ${
                              rec.priority === 'HIGH' ? 'bg-red-500' :
                              rec.priority === 'MEDIUM' ? 'bg-yellow-500' :
                              'bg-green-500'
                            }`}></div>
                            <div className="flex-1">
                              <h5 className="text-sm font-medium text-gray-800">{rec.title}</h5>
                              <p className="text-xs text-gray-600 mt-1">{rec.description}</p>
                              <p className="text-xs text-blue-600 mt-1">{rec.impact}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Coverages */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">Coberturas Ativas</h3>
                  <button 
                    onClick={() => navigate('/coverage-manager')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <Plus className="h-4 w-4 inline mr-2" />
                    Nova Cobertura
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {activeCoverages.map((coverage) => (
                    <div key={coverage.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <div>
                            <h4 className="font-medium text-gray-800">{coverage.coverage.name}</h4>
                            <p className="text-sm text-gray-600">ID: {coverage.id}</p>
                          </div>
                        </div>
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          {coverage.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Valor Coberto:</span>
                          <p className="font-medium">R$ {coverage.serviceValue.toFixed(2)}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Prêmio:</span>
                          <p className="font-medium">R$ {coverage.premium.toFixed(2)}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Válida até:</span>
                          <p className="font-medium">{new Date(coverage.endDate).toLocaleDateString('pt-BR')}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Dias restantes:</span>
                          <p className="font-medium">
                            {Math.ceil((new Date(coverage.endDate) - new Date()) / (1000 * 60 * 60 * 24))}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Epidemiological Insights */}
            {epidemiologicalData && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center space-x-2">
                    <Globe className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-800">Insights Epidemiológicos</h3>
                    <span className="text-sm text-gray-500">({epidemiologicalData.region})</span>
                  </div>
                </div>
                
                <div className="p-6">
                  {epidemiologicalData.currentAlerts.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-800 mb-3">Alertas Atuais</h4>
                      {epidemiologicalData.currentAlerts.map((alert, index) => (
                        <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <div className="flex items-start space-x-3">
                            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <h5 className="font-medium text-yellow-800">{alert.description}</h5>
                              <p className="text-sm text-yellow-700 mt-1">{alert.recommendation}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div>
                    <h4 className="font-medium text-gray-800 mb-3">Tendências Regionais</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {Object.entries(epidemiologicalData.trends).map(([key, trend]) => (
                        <div key={key} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700 capitalize">{key}</span>
                            <div className="flex items-center space-x-1">
                              {trend.trend === 'UP' && <TrendingUp className="h-4 w-4 text-red-500" />}
                              {trend.trend === 'DOWN' && <TrendingDown className="h-4 w-4 text-green-500" />}
                              {trend.trend === 'STABLE' && <div className="w-4 h-0.5 bg-gray-400"></div>}
                              <span className={`text-sm ${
                                trend.trend === 'UP' ? 'text-red-600' :
                                trend.trend === 'DOWN' ? 'text-green-600' :
                                'text-gray-600'
                              }`}>
                                {trend.change > 0 ? '+' : ''}{trend.change}%
                              </span>
                            </div>
                          </div>
                          <div className="text-lg font-bold text-gray-800">{trend.current}%</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Insights */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-800">Insights de IA</h3>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {aiInsights.map((insight, index) => (
                    <div key={index} className={`border rounded-lg p-4 ${
                      insight.type === 'POSITIVE' ? 'border-green-200 bg-green-50' :
                      insight.type === 'WARNING' ? 'border-yellow-200 bg-yellow-50' :
                      'border-blue-200 bg-blue-50'
                    }`}>
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          {insight.type === 'POSITIVE' && <CheckCircle className="h-5 w-5 text-green-600" />}
                          {insight.type === 'WARNING' && <AlertTriangle className="h-5 w-5 text-yellow-600" />}
                          {insight.type === 'INFO' && <Info className="h-5 w-5 text-blue-600" />}
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-medium ${
                            insight.type === 'POSITIVE' ? 'text-green-800' :
                            insight.type === 'WARNING' ? 'text-yellow-800' :
                            'text-blue-800'
                          }`}>
                            {insight.title}
                          </h4>
                          <p className={`text-sm mt-1 ${
                            insight.type === 'POSITIVE' ? 'text-green-700' :
                            insight.type === 'WARNING' ? 'text-yellow-700' :
                            'text-blue-700'
                          }`}>
                            {insight.message}
                          </p>
                          <button className={`text-xs font-medium mt-2 hover:underline ${
                            insight.type === 'POSITIVE' ? 'text-green-600' :
                            insight.type === 'WARNING' ? 'text-yellow-600' :
                            'text-blue-600'
                          }`}>
                            {insight.action}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">Atividade Recente</h3>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {recentActivity.map((activity) => {
                    const IconComponent = getActivityIcon(activity.type);
                    return (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          activity.status === 'SUCCESS' ? 'bg-green-100' :
                          activity.status === 'WARNING' ? 'bg-yellow-100' :
                          'bg-blue-100'
                        }`}>
                          <IconComponent className={`h-4 w-4 ${
                            activity.status === 'SUCCESS' ? 'text-green-600' :
                            activity.status === 'WARNING' ? 'text-yellow-600' :
                            'text-blue-600'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-800">{activity.title}</h4>
                          <p className="text-xs text-gray-600 mt-1">{activity.description}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500">{formatTimeAgo(activity.timestamp)}</span>
                            {activity.amount && (
                              <span className="text-xs font-medium text-green-600">
                                R$ {activity.amount.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <button className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Ver todas as atividades
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">Ações Rápidas</h3>
              </div>
              
              <div className="p-6">
                <div className="space-y-3">
                  <button 
                    onClick={() => navigate('/micro-insurance-activator')}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <Zap className="h-4 w-4 inline mr-2" />
                    Ativar Microsseguro
                  </button>
                  
                  <button 
                    onClick={() => navigate('/claims-center')}
                    className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    <FileText className="h-4 w-4 inline mr-2" />
                    Abrir Sinistro
                  </button>
                  
                  <button 
                    onClick={() => navigate('/risk-analysis')}
                    className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    <BarChart3 className="h-4 w-4 inline mr-2" />
                    Análise Completa
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedShieldDashboard;

