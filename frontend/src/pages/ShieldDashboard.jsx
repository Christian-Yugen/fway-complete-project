import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Shield,
  Brain,
  TrendingUp,
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
  Star
} from 'lucide-react';
import { 
  riskIntelligenceSystem, 
  dynamicInsuranceSystem, 
  shieldRewardsSystem,
  initializeFwayShield 
} from '../utils/fwayShield';

const ShieldDashboard = () => {
  const navigate = useNavigate();
  const [shieldStatus, setShieldStatus] = useState({});
  const [activeCoverages, setActiveCoverages] = useState([]);
  const [riskAnalysis, setRiskAnalysis] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);
  const [shieldStats, setShieldStats] = useState({});
  const [userLevel, setUserLevel] = useState({});

  useEffect(() => {
    initializeFwayShield();
    loadShieldData();
  }, []);

  const loadShieldData = () => {
    const userId = 'user_123'; // Simular ID do usuário

    // Carregar status do Shield
    const mockShieldStatus = {
      isActive: true,
      totalProtection: 15750,
      activePolicies: 3,
      riskLevel: 'low',
      lastUpdate: new Date().toISOString()
    };

    // Carregar coberturas ativas
    const mockCoverages = [
      {
        id: '1',
        serviceType: 'Consulta Médica',
        coverage: 'Proteção Premium',
        amount: 500,
        status: 'active',
        expiresAt: '2024-02-15',
        features: ['Reembolso por cancelamento', 'Proteção contra fraude', 'Responsabilidade civil']
      },
      {
        id: '2',
        serviceType: 'Fisioterapia',
        coverage: 'Proteção Padrão',
        amount: 300,
        status: 'active',
        expiresAt: '2024-02-10',
        features: ['Reembolso por cancelamento', 'Atraso de serviço']
      },
      {
        id: '3',
        serviceType: 'Home Care',
        coverage: 'Proteção Premium',
        amount: 800,
        status: 'pending',
        expiresAt: '2024-02-20',
        features: ['Cobertura completa', 'Suporte 24/7']
      }
    ];

    // Análise de risco simulada
    const mockRiskAnalysis = riskIntelligenceSystem.calculateRiskScore(
      { urgency: 'normal', paymentMethod: 'credit_card' },
      { completedServices: 25, averageRating: 4.8, cancellationRate: 2, accountAge: 12 },
      { category: 'medicina', value: 300, professionalRating: 4.9 }
    );

    // Atividades recentes
    const mockActivity = [
      {
        id: '1',
        type: 'coverage_activated',
        description: 'Proteção Premium ativada para consulta médica',
        timestamp: '2024-01-15T10:30:00',
        amount: 500,
        status: 'success'
      },
      {
        id: '2',
        type: 'points_earned',
        description: 'Ganhou 25 Shield Points por avaliação 5 estrelas',
        timestamp: '2024-01-14T16:45:00',
        points: 25,
        status: 'success'
      },
      {
        id: '3',
        type: 'claim_resolved',
        description: 'Sinistro resolvido automaticamente - Reembolso R$ 50',
        timestamp: '2024-01-13T14:20:00',
        amount: 50,
        status: 'resolved'
      }
    ];

    // Estatísticas do Shield
    const mockStats = {
      totalSavings: 1250,
      claimsResolved: 8,
      averageResolutionTime: 2.5,
      satisfactionRate: 98,
      protectionUptime: 99.9
    };

    // Status do usuário no programa de recompensas
    const mockUserLevel = shieldRewardsSystem.getUserShieldStatus(userId);

    setShieldStatus(mockShieldStatus);
    setActiveCoverages(mockCoverages);
    setRiskAnalysis(mockRiskAnalysis);
    setRecentActivity(mockActivity);
    setShieldStats(mockStats);
    setUserLevel(mockUserLevel);
  };

  const getRiskLevelColor = (level) => {
    const colors = {
      low: 'text-green-600 bg-green-100',
      medium: 'text-yellow-600 bg-yellow-100',
      high: 'text-orange-600 bg-orange-100',
      critical: 'text-red-600 bg-red-100'
    };
    return colors[level] || colors.medium;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'expired':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Info className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="content-container">
      {/* Sidebar Esquerda - Status e Controles */}
      <aside className="sidebar-left">
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title">
              <Shield className="w-5 h-5" />
              Fway Shield Status
            </h3>
          </div>
          <div className="card-body">
            <div className="shield-status-overview">
              <div className="status-indicator">
                <div className={`status-dot ${shieldStatus.isActive ? 'active' : 'inactive'}`}></div>
                <span className="status-text">
                  {shieldStatus.isActive ? 'Proteção Ativa' : 'Proteção Inativa'}
                </span>
              </div>

              <div className="protection-amount">
                <h4>Proteção Total</h4>
                <div className="amount-display">
                  <span className="currency">R$</span>
                  <span className="amount">{shieldStatus.totalProtection?.toLocaleString()}</span>
                </div>
              </div>

              <div className="quick-stats">
                <div className="stat-item">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span>{shieldStatus.activePolicies} Coberturas Ativas</span>
                </div>
                <div className="stat-item">
                  <Target className="w-4 h-4 text-green-600" />
                  <span className={`risk-badge ${getRiskLevelColor(shieldStatus.riskLevel)}`}>
                    Risco {shieldStatus.riskLevel === 'low' ? 'Baixo' : 
                           shieldStatus.riskLevel === 'medium' ? 'Médio' : 
                           shieldStatus.riskLevel === 'high' ? 'Alto' : 'Crítico'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title">
              <Award className="w-5 h-5" />
              Shield Level
            </h3>
          </div>
          <div className="card-body">
            <div className="shield-level-display">
              <div className="level-badge" style={{ backgroundColor: userLevel.levelData?.color }}>
                <Star className="w-5 h-5" />
                <span>{userLevel.currentLevel?.toUpperCase()}</span>
              </div>
              
              <div className="points-display">
                <h4>{userLevel.totalPoints} Pontos</h4>
                {userLevel.nextLevel && (
                  <p>{userLevel.pointsToNext} pontos para {userLevel.nextLevel}</p>
                )}
              </div>

              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${userLevel.progressPercentage}%` }}
                ></div>
              </div>

              <div className="level-benefits">
                <h5>Benefícios Ativos:</h5>
                <ul>
                  {userLevel.levelData?.benefits?.map((benefit, index) => (
                    <li key={index}>
                      <CheckCircle className="w-3 h-3 text-green-600" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title">
              <Settings className="w-5 h-5" />
              Ações Rápidas
            </h3>
          </div>
          <div className="card-body">
            <div className="quick-actions">
              <Link to="/risk-intelligence" className="quick-action-btn">
                <Brain className="w-4 h-4" />
                Análise de Risco
              </Link>
              <Link to="/coverage-manager" className="quick-action-btn">
                <Shield className="w-4 h-4" />
                Gerenciar Coberturas
              </Link>
              <Link to="/claims-center" className="quick-action-btn">
                <AlertTriangle className="w-4 h-4" />
                Centro de Sinistros
              </Link>
              <Link to="/shield-rewards" className="quick-action-btn">
                <Award className="w-4 h-4" />
                Recompensas Shield
              </Link>
            </div>
          </div>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="main-content">
        <div className="page-header">
          <h1 className="page-title">
            <Shield className="w-8 h-8 text-blue-600" />
            Fway Shield Dashboard
          </h1>
          <p className="page-subtitle">Proteção inteligente integrada com IA comportamental</p>
        </div>

        {/* Cards de Estatísticas */}
        <div className="shield-stats-grid">
          <div className="stat-card primary">
            <div className="stat-icon">
              <DollarSign className="w-6 h-6" />
            </div>
            <div className="stat-content">
              <h3>R$ {shieldStats.totalSavings}</h3>
              <p>Economia Total</p>
              <div className="stat-trend positive">
                <ArrowUpRight className="w-4 h-4" />
                +15% este mês
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="stat-content">
              <h3>{shieldStats.claimsResolved}</h3>
              <p>Sinistros Resolvidos</p>
              <div className="stat-trend positive">
                <ArrowUpRight className="w-4 h-4" />
                100% automático
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div className="stat-content">
              <h3>{shieldStats.averageResolutionTime}h</h3>
              <p>Tempo Médio de Resolução</p>
              <div className="stat-trend positive">
                <ArrowDownRight className="w-4 h-4" />
                -30% mais rápido
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="stat-content">
              <h3>{shieldStats.satisfactionRate}%</h3>
              <p>Satisfação dos Usuários</p>
              <div className="stat-trend positive">
                <ArrowUpRight className="w-4 h-4" />
                +2% este mês
              </div>
            </div>
          </div>
        </div>

        {/* Análise de Risco em Tempo Real */}
        <div className="risk-analysis-section">
          <div className="section-header">
            <h2>
              <Brain className="w-6 h-6 text-purple-600" />
              Análise de Risco IA
            </h2>
            <Link to="/risk-intelligence" className="btn-secondary">
              Ver Detalhes
            </Link>
          </div>

          <div className="risk-analysis-card">
            <div className="risk-score-display">
              <div className="score-circle">
                <div className="score-value">{riskAnalysis.score}</div>
                <div className="score-label">Risk Score</div>
              </div>
              <div className="score-details">
                <h3>Perfil de Risco: {riskAnalysis.level?.toUpperCase()}</h3>
                <p>Baseado em análise comportamental e histórico de transações</p>
                <div className={`risk-level-badge ${getRiskLevelColor(riskAnalysis.level)}`}>
                  {riskAnalysis.level === 'low' ? 'Baixo Risco' : 
                   riskAnalysis.level === 'medium' ? 'Risco Médio' : 
                   riskAnalysis.level === 'high' ? 'Alto Risco' : 'Risco Crítico'}
                </div>
              </div>
            </div>

            {riskAnalysis.recommendations && riskAnalysis.recommendations.length > 0 && (
              <div className="risk-recommendations">
                <h4>Recomendações da IA:</h4>
                <ul>
                  {riskAnalysis.recommendations.map((rec, index) => (
                    <li key={index} className="recommendation-item">
                      <Info className="w-4 h-4 text-blue-600" />
                      {rec.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Coberturas Ativas */}
        <div className="active-coverages-section">
          <div className="section-header">
            <h2>
              <Shield className="w-6 h-6 text-blue-600" />
              Coberturas Ativas
            </h2>
            <Link to="/coverage-manager" className="btn-primary">
              Gerenciar Todas
            </Link>
          </div>

          <div className="coverages-grid">
            {activeCoverages.map((coverage) => (
              <CoverageCard key={coverage.id} coverage={coverage} getStatusIcon={getStatusIcon} />
            ))}
          </div>
        </div>

        {/* Atividade Recente */}
        <div className="recent-activity-section">
          <div className="section-header">
            <h2>
              <Activity className="w-6 h-6 text-green-600" />
              Atividade Recente
            </h2>
          </div>

          <div className="activity-list">
            {recentActivity.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        </div>
      </main>

      {/* Sidebar Direita - Insights e Alertas */}
      <aside className="sidebar-right">
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title">
              <Zap className="w-5 h-5" />
              Insights IA
            </h3>
          </div>
          <div className="card-body">
            <div className="ai-insights">
              <div className="insight-item">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <div className="insight-content">
                  <h4>Padrão Detectado</h4>
                  <p>Você tende a contratar serviços médicos às terças-feiras. Considere agendar com antecedência para melhores preços.</p>
                </div>
              </div>

              <div className="insight-item">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <div className="insight-content">
                  <h4>Economia Potencial</h4>
                  <p>Com seu histórico de baixo risco, você pode economizar até 25% em seguros premium.</p>
                </div>
              </div>

              <div className="insight-item">
                <Target className="w-5 h-5 text-blue-600" />
                <div className="insight-content">
                  <h4>Recomendação</h4>
                  <p>Complete mais 3 serviços para alcançar o nível Gold e desbloquear benefícios exclusivos.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title">
              <Bell className="w-5 h-5" />
              Alertas Inteligentes
            </h3>
          </div>
          <div className="card-body">
            <div className="smart-alerts">
              <div className="alert-item low">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div className="alert-content">
                  <h4>Sistema Operacional</h4>
                  <p>Todas as coberturas funcionando normalmente</p>
                  <span className="alert-time">Agora</span>
                </div>
              </div>

              <div className="alert-item medium">
                <Clock className="w-5 h-5 text-yellow-600" />
                <div className="alert-content">
                  <h4>Cobertura Expirando</h4>
                  <p>Fisioterapia expira em 3 dias</p>
                  <span className="alert-time">2h atrás</span>
                </div>
              </div>

              <div className="alert-item info">
                <Star className="w-5 h-5 text-blue-600" />
                <div className="alert-content">
                  <h4>Nova Recompensa</h4>
                  <p>Você ganhou 25 Shield Points!</p>
                  <span className="alert-time">1 dia atrás</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title">
              <BarChart3 className="w-5 h-5" />
              Performance Shield
            </h3>
          </div>
          <div className="card-body">
            <div className="performance-metrics">
              <div className="metric-item">
                <div className="metric-label">Uptime de Proteção</div>
                <div className="metric-value">{shieldStats.protectionUptime}%</div>
                <div className="metric-bar">
                  <div 
                    className="metric-fill"
                    style={{ width: `${shieldStats.protectionUptime}%` }}
                  ></div>
                </div>
              </div>

              <div className="metric-item">
                <div className="metric-label">Eficiência IA</div>
                <div className="metric-value">96.5%</div>
                <div className="metric-bar">
                  <div 
                    className="metric-fill"
                    style={{ width: '96.5%' }}
                  ></div>
                </div>
              </div>

              <div className="metric-item">
                <div className="metric-label">Resolução Automática</div>
                <div className="metric-value">89%</div>
                <div className="metric-bar">
                  <div 
                    className="metric-fill"
                    style={{ width: '89%' }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

// Componente Card de Cobertura
const CoverageCard = ({ coverage, getStatusIcon }) => {
  return (
    <div className="coverage-card">
      <div className="coverage-header">
        <div className="coverage-title">
          <h4>{coverage.serviceType}</h4>
          <div className="coverage-status">
            {getStatusIcon(coverage.status)}
            <span className={`status-text ${coverage.status}`}>
              {coverage.status === 'active' ? 'Ativa' : 
               coverage.status === 'pending' ? 'Pendente' : 'Expirada'}
            </span>
          </div>
        </div>
        <div className="coverage-amount">
          R$ {coverage.amount}
        </div>
      </div>

      <div className="coverage-details">
        <div className="coverage-type">
          <Shield className="w-4 h-4 text-blue-600" />
          <span>{coverage.coverage}</span>
        </div>
        <div className="coverage-expiry">
          <Clock className="w-4 h-4 text-gray-500" />
          <span>Expira em {new Date(coverage.expiresAt).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="coverage-features">
        <h5>Recursos Inclusos:</h5>
        <ul>
          {coverage.features.map((feature, index) => (
            <li key={index}>
              <CheckCircle className="w-3 h-3 text-green-600" />
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// Componente Item de Atividade
const ActivityItem = ({ activity }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'coverage_activated':
        return <Shield className="w-5 h-5 text-blue-600" />;
      case 'points_earned':
        return <Star className="w-5 h-5 text-yellow-600" />;
      case 'claim_resolved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return <Activity className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="activity-item">
      <div className="activity-icon">
        {getActivityIcon(activity.type)}
      </div>
      <div className="activity-content">
        <h4>{activity.description}</h4>
        <div className="activity-meta">
          <span className="activity-time">
            {new Date(activity.timestamp).toLocaleString()}
          </span>
          {activity.amount && (
            <span className="activity-amount">
              R$ {activity.amount}
            </span>
          )}
          {activity.points && (
            <span className="activity-points">
              +{activity.points} pontos
            </span>
          )}
        </div>
      </div>
      <div className={`activity-status ${activity.status}`}>
        {activity.status === 'success' ? 'Sucesso' : 
         activity.status === 'resolved' ? 'Resolvido' : 'Pendente'}
      </div>
    </div>
  );
};

export default ShieldDashboard;

