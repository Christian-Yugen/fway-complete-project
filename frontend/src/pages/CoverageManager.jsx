import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Shield,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  Calendar,
  MapPin,
  User,
  Settings,
  Filter,
  Search,
  Download,
  Upload,
  RefreshCw,
  Eye,
  EyeOff,
  Star,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Target,
  Info,
  ArrowRight,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { dynamicInsuranceSystem, riskIntelligenceSystem } from '../utils/fwayShield';

const CoverageManager = () => {
  const navigate = useNavigate();
  const [coverages, setCoverages] = useState([]);
  const [filteredCoverages, setFilteredCoverages] = useState([]);
  const [selectedCoverage, setSelectedCoverage] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    dateRange: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [coverageStats, setCoverageStats] = useState({});
  const [availableModules, setAvailableModules] = useState([]);

  useEffect(() => {
    loadCoverageData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [coverages, filters, searchTerm]);

  const loadCoverageData = () => {
    // Carregar coberturas existentes
    const mockCoverages = [
      {
        id: '1',
        serviceId: 'srv_001',
        serviceType: 'Consulta Médica',
        specialty: 'Cardiologia',
        professional: 'Dr. João Silva',
        module: 'premium',
        moduleName: 'Proteção Premium',
        status: 'active',
        amount: 500,
        premium: 25,
        features: ['Reembolso por cancelamento', 'Proteção contra fraude', 'Responsabilidade civil', 'Suporte prioritário'],
        activatedAt: '2024-01-15T10:30:00',
        expiresAt: '2024-02-15T10:30:00',
        location: 'São Paulo, SP',
        riskLevel: 'low',
        claims: 0,
        savings: 75
      },
      {
        id: '2',
        serviceId: 'srv_002',
        serviceType: 'Fisioterapia',
        specialty: 'Ortopédica',
        professional: 'Ft. Ana Costa',
        module: 'standard',
        moduleName: 'Proteção Padrão',
        status: 'active',
        amount: 300,
        premium: 10.5,
        features: ['Reembolso por cancelamento', 'Atraso de serviço'],
        activatedAt: '2024-01-10T14:20:00',
        expiresAt: '2024-02-10T14:20:00',
        location: 'São Paulo, SP',
        riskLevel: 'low',
        claims: 0,
        savings: 30
      },
      {
        id: '3',
        serviceId: 'srv_003',
        serviceType: 'Home Care',
        specialty: 'Cuidados Básicos',
        professional: 'Enf. Maria Santos',
        module: 'premium',
        moduleName: 'Proteção Premium',
        status: 'pending',
        amount: 800,
        premium: 40,
        features: ['Cobertura completa', 'Suporte 24/7', 'Proteção de reputação'],
        activatedAt: '2024-01-20T09:15:00',
        expiresAt: '2024-02-20T09:15:00',
        location: 'São Paulo, SP',
        riskLevel: 'medium',
        claims: 0,
        savings: 0
      },
      {
        id: '4',
        serviceId: 'srv_004',
        serviceType: 'Psicologia',
        specialty: 'Clínica',
        professional: 'Psi. Carlos Lima',
        module: 'basic',
        moduleName: 'Proteção Básica',
        status: 'expired',
        amount: 200,
        premium: 4,
        features: ['Reembolso por cancelamento', 'Proteção contra fraude'],
        activatedAt: '2023-12-15T16:45:00',
        expiresAt: '2024-01-15T16:45:00',
        location: 'São Paulo, SP',
        riskLevel: 'low',
        claims: 1,
        savings: 50
      }
    ];

    // Estatísticas de cobertura
    const stats = {
      totalCoverages: mockCoverages.length,
      activeCoverages: mockCoverages.filter(c => c.status === 'active').length,
      totalProtection: mockCoverages.reduce((sum, c) => sum + c.amount, 0),
      totalPremiums: mockCoverages.reduce((sum, c) => sum + c.premium, 0),
      totalSavings: mockCoverages.reduce((sum, c) => sum + c.savings, 0),
      averageRisk: 'low',
      claimsRate: 0.25
    };

    // Módulos disponíveis
    const modules = Object.values(dynamicInsuranceSystem.coverageModules);

    setCoverages(mockCoverages);
    setCoverageStats(stats);
    setAvailableModules(modules);
  };

  const applyFilters = () => {
    let filtered = [...coverages];

    // Filtro por status
    if (filters.status !== 'all') {
      filtered = filtered.filter(coverage => coverage.status === filters.status);
    }

    // Filtro por tipo
    if (filters.type !== 'all') {
      filtered = filtered.filter(coverage => coverage.serviceType === filters.type);
    }

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(coverage => 
        coverage.serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coverage.professional.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coverage.specialty.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredCoverages(filtered);
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'text-green-600 bg-green-100',
      pending: 'text-yellow-600 bg-yellow-100',
      expired: 'text-red-600 bg-red-100',
      cancelled: 'text-gray-600 bg-gray-100'
    };
    return colors[status] || colors.pending;
  };

  const getRiskLevelColor = (level) => {
    const colors = {
      low: 'text-green-600',
      medium: 'text-yellow-600',
      high: 'text-orange-600',
      critical: 'text-red-600'
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

  const createNewCoverage = (coverageData) => {
    // Simular criação de nova cobertura
    const newCoverage = {
      id: Date.now().toString(),
      ...coverageData,
      status: 'pending',
      activatedAt: new Date().toISOString(),
      claims: 0,
      savings: 0
    };

    setCoverages([...coverages, newCoverage]);
    setShowCreateModal(false);
  };

  const updateCoverageStatus = (coverageId, newStatus) => {
    const updatedCoverages = coverages.map(coverage => 
      coverage.id === coverageId 
        ? { ...coverage, status: newStatus }
        : coverage
    );
    setCoverages(updatedCoverages);
  };

  const deleteCoverage = (coverageId) => {
    const updatedCoverages = coverages.filter(coverage => coverage.id !== coverageId);
    setCoverages(updatedCoverages);
  };

  return (
    <div className="content-container">
      {/* Sidebar Esquerda - Filtros e Controles */}
      <aside className="sidebar-left">
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title">
              <Filter className="w-5 h-5" />
              Filtros
            </h3>
          </div>
          <div className="card-body">
            <div className="filter-controls">
              <div className="filter-group">
                <label>Status</label>
                <select 
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="filter-select"
                >
                  <option value="all">Todos</option>
                  <option value="active">Ativo</option>
                  <option value="pending">Pendente</option>
                  <option value="expired">Expirado</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Tipo de Serviço</label>
                <select 
                  value={filters.type}
                  onChange={(e) => setFilters({...filters, type: e.target.value})}
                  className="filter-select"
                >
                  <option value="all">Todos</option>
                  <option value="Consulta Médica">Consulta Médica</option>
                  <option value="Fisioterapia">Fisioterapia</option>
                  <option value="Home Care">Home Care</option>
                  <option value="Psicologia">Psicologia</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Período</label>
                <select 
                  value={filters.dateRange}
                  onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
                  className="filter-select"
                >
                  <option value="all">Todos</option>
                  <option value="last_week">Última semana</option>
                  <option value="last_month">Último mês</option>
                  <option value="last_3_months">Últimos 3 meses</option>
                </select>
              </div>

              <button 
                onClick={() => setFilters({ status: 'all', type: 'all', dateRange: 'all' })}
                className="filter-reset-btn"
              >
                Limpar Filtros
              </button>
            </div>
          </div>
        </div>

        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title">
              <BarChart3 className="w-5 h-5" />
              Estatísticas
            </h3>
          </div>
          <div className="card-body">
            <div className="coverage-stats">
              <div className="stat-item">
                <Shield className="w-4 h-4 text-blue-600" />
                <div className="stat-info">
                  <h4>{coverageStats.totalCoverages}</h4>
                  <p>Total de Coberturas</p>
                </div>
              </div>

              <div className="stat-item">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <div className="stat-info">
                  <h4>{coverageStats.activeCoverages}</h4>
                  <p>Coberturas Ativas</p>
                </div>
              </div>

              <div className="stat-item">
                <DollarSign className="w-4 h-4 text-purple-600" />
                <div className="stat-info">
                  <h4>R$ {coverageStats.totalProtection?.toLocaleString()}</h4>
                  <p>Proteção Total</p>
                </div>
              </div>

              <div className="stat-item">
                <TrendingUp className="w-4 h-4 text-orange-600" />
                <div className="stat-info">
                  <h4>R$ {coverageStats.totalSavings}</h4>
                  <p>Economia Total</p>
                </div>
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
              <button 
                onClick={() => setShowCreateModal(true)}
                className="quick-action-btn primary"
              >
                <Plus className="w-4 h-4" />
                Nova Cobertura
              </button>
              
              <button className="quick-action-btn">
                <Download className="w-4 h-4" />
                Exportar Dados
              </button>
              
              <button className="quick-action-btn">
                <RefreshCw className="w-4 h-4" />
                Atualizar Tudo
              </button>
              
              <Link to="/shield-dashboard" className="quick-action-btn">
                <Eye className="w-4 h-4" />
                Ver Dashboard
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
            Gerenciador de Coberturas
          </h1>
          <p className="page-subtitle">Gerencie todas as suas coberturas de seguro inteligente</p>
        </div>

        {/* Barra de Busca e Controles */}
        <div className="search-controls">
          <div className="search-bar">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por serviço, profissional ou especialidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="control-buttons">
            <button 
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              <Plus className="w-4 h-4" />
              Nova Cobertura
            </button>
          </div>
        </div>

        {/* Cards de Estatísticas Resumidas */}
        <div className="coverage-summary-cards">
          <div className="summary-card active">
            <div className="summary-icon">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="summary-content">
              <h3>{coverageStats.activeCoverages}</h3>
              <p>Coberturas Ativas</p>
              <div className="summary-trend positive">
                <TrendingUp className="w-4 h-4" />
                +2 este mês
              </div>
            </div>
          </div>

          <div className="summary-card protection">
            <div className="summary-icon">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div className="summary-content">
              <h3>R$ {coverageStats.totalProtection?.toLocaleString()}</h3>
              <p>Proteção Total</p>
              <div className="summary-trend positive">
                <TrendingUp className="w-4 h-4" />
                +15% este mês
              </div>
            </div>
          </div>

          <div className="summary-card savings">
            <div className="summary-icon">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="summary-content">
              <h3>R$ {coverageStats.totalSavings}</h3>
              <p>Economia Acumulada</p>
              <div className="summary-trend positive">
                <TrendingUp className="w-4 h-4" />
                +R$ 25 esta semana
              </div>
            </div>
          </div>

          <div className="summary-card risk">
            <div className="summary-icon">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
            <div className="summary-content">
              <h3>{(coverageStats.claimsRate * 100).toFixed(1)}%</h3>
              <p>Taxa de Sinistros</p>
              <div className="summary-trend neutral">
                <Activity className="w-4 h-4" />
                Estável
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Coberturas */}
        <div className="coverages-section">
          <div className="section-header">
            <h2>
              <Shield className="w-6 h-6 text-blue-600" />
              Suas Coberturas ({filteredCoverages.length})
            </h2>
          </div>

          <div className="coverages-list">
            {filteredCoverages.map((coverage) => (
              <CoverageCard 
                key={coverage.id} 
                coverage={coverage} 
                getStatusColor={getStatusColor}
                getStatusIcon={getStatusIcon}
                getRiskLevelColor={getRiskLevelColor}
                onUpdateStatus={updateCoverageStatus}
                onDelete={deleteCoverage}
                onSelect={setSelectedCoverage}
              />
            ))}
          </div>

          {filteredCoverages.length === 0 && (
            <div className="empty-state">
              <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3>Nenhuma cobertura encontrada</h3>
              <p>Ajuste os filtros ou crie uma nova cobertura</p>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="btn-primary"
              >
                <Plus className="w-4 h-4" />
                Criar Primeira Cobertura
              </button>
            </div>
          )}
        </div>

        {/* Módulos Disponíveis */}
        <div className="available-modules-section">
          <div className="section-header">
            <h2>
              <Zap className="w-6 h-6 text-purple-600" />
              Módulos de Proteção Disponíveis
            </h2>
          </div>

          <div className="modules-grid">
            {availableModules.map((module) => (
              <ModuleCard key={module.id} module={module} />
            ))}
          </div>
        </div>
      </main>

      {/* Sidebar Direita - Detalhes e Insights */}
      <aside className="sidebar-right">
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title">
              <Activity className="w-5 h-5" />
              Atividade Recente
            </h3>
          </div>
          <div className="card-body">
            <div className="recent-activity">
              <div className="activity-item">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <div className="activity-content">
                  <h4>Cobertura Ativada</h4>
                  <p>Home Care - Proteção Premium</p>
                  <span className="activity-time">2h atrás</span>
                </div>
              </div>

              <div className="activity-item">
                <DollarSign className="w-4 h-4 text-blue-600" />
                <div className="activity-content">
                  <h4>Economia Gerada</h4>
                  <p>R$ 25 economizados em prêmios</p>
                  <span className="activity-time">1 dia atrás</span>
                </div>
              </div>

              <div className="activity-item">
                <Star className="w-4 h-4 text-yellow-600" />
                <div className="activity-content">
                  <h4>Nível Atualizado</h4>
                  <p>Risk score melhorou para 85</p>
                  <span className="activity-time">3 dias atrás</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title">
              <Target className="w-5 h-5" />
              Recomendações IA
            </h3>
          </div>
          <div className="card-body">
            <div className="ai-recommendations">
              <div className="recommendation-item">
                <Info className="w-4 h-4 text-blue-600" />
                <div className="recommendation-content">
                  <h4>Otimização de Custos</h4>
                  <p>Considere upgrade para Premium na fisioterapia para melhor custo-benefício</p>
                  <button className="recommendation-action">
                    Ver Detalhes
                  </button>
                </div>
              </div>

              <div className="recommendation-item">
                <Zap className="w-4 h-4 text-purple-600" />
                <div className="recommendation-content">
                  <h4>Cobertura Sugerida</h4>
                  <p>Baseado no seu perfil, recomendamos proteção para nutrição</p>
                  <button className="recommendation-action">
                    Criar Cobertura
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title">
              <PieChart className="w-5 h-5" />
              Distribuição de Coberturas
            </h3>
          </div>
          <div className="card-body">
            <div className="coverage-distribution">
              <div className="distribution-chart">
                <PieChart className="w-24 h-24 text-gray-400 mx-auto mb-4" />
                <p>Gráfico de distribuição por tipo de serviço</p>
              </div>
              
              <div className="distribution-legend">
                <div className="legend-item">
                  <div className="legend-color medical"></div>
                  <span>Medicina (40%)</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color therapy"></div>
                  <span>Fisioterapia (30%)</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color homecare"></div>
                  <span>Home Care (20%)</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color psychology"></div>
                  <span>Psicologia (10%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Modal de Criação de Cobertura */}
      {showCreateModal && (
        <CreateCoverageModal 
          availableModules={availableModules}
          onClose={() => setShowCreateModal(false)}
          onCreate={createNewCoverage}
        />
      )}
    </div>
  );
};

// Componente Card de Cobertura
const CoverageCard = ({ 
  coverage, 
  getStatusColor, 
  getStatusIcon, 
  getRiskLevelColor,
  onUpdateStatus,
  onDelete,
  onSelect 
}) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="coverage-card">
      <div className="coverage-header">
        <div className="coverage-main-info">
          <h4>{coverage.serviceType}</h4>
          <p>{coverage.specialty} - {coverage.professional}</p>
        </div>
        
        <div className="coverage-status-info">
          <div className={`status-badge ${getStatusColor(coverage.status)}`}>
            {getStatusIcon(coverage.status)}
            <span>
              {coverage.status === 'active' ? 'Ativa' : 
               coverage.status === 'pending' ? 'Pendente' : 
               coverage.status === 'expired' ? 'Expirada' : 'Cancelada'}
            </span>
          </div>
          
          <div className="coverage-amount">
            <span className="amount-label">Cobertura</span>
            <span className="amount-value">R$ {coverage.amount}</span>
          </div>
        </div>
      </div>

      <div className="coverage-details">
        <div className="detail-row">
          <div className="detail-item">
            <Shield className="w-4 h-4 text-blue-600" />
            <span>{coverage.moduleName}</span>
          </div>
          
          <div className="detail-item">
            <MapPin className="w-4 h-4 text-gray-500" />
            <span>{coverage.location}</span>
          </div>
          
          <div className="detail-item">
            <Target className={`w-4 h-4 ${getRiskLevelColor(coverage.riskLevel)}`} />
            <span>Risco {coverage.riskLevel === 'low' ? 'Baixo' : 
                        coverage.riskLevel === 'medium' ? 'Médio' : 'Alto'}</span>
          </div>
        </div>

        <div className="detail-row">
          <div className="detail-item">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span>Expira em {new Date(coverage.expiresAt).toLocaleDateString()}</span>
          </div>
          
          <div className="detail-item">
            <DollarSign className="w-4 h-4 text-green-600" />
            <span>Prêmio: R$ {coverage.premium}</span>
          </div>
          
          {coverage.savings > 0 && (
            <div className="detail-item">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span>Economia: R$ {coverage.savings}</span>
            </div>
          )}
        </div>
      </div>

      <div className="coverage-actions">
        <button 
          onClick={() => setShowDetails(!showDetails)}
          className="action-btn secondary"
        >
          {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          {showDetails ? 'Menos' : 'Mais'} Detalhes
        </button>
        
        <button 
          onClick={() => onSelect(coverage)}
          className="action-btn primary"
        >
          <Edit className="w-4 h-4" />
          Editar
        </button>
        
        {coverage.status === 'active' && (
          <button 
            onClick={() => onUpdateStatus(coverage.id, 'cancelled')}
            className="action-btn danger"
          >
            <EyeOff className="w-4 h-4" />
            Cancelar
          </button>
        )}
      </div>

      {showDetails && (
        <div className="coverage-expanded-details">
          <div className="features-list">
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
          
          <div className="coverage-metrics">
            <div className="metric-item">
              <span className="metric-label">Sinistros:</span>
              <span className="metric-value">{coverage.claims}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Ativada em:</span>
              <span className="metric-value">{new Date(coverage.activatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente Card de Módulo
const ModuleCard = ({ module }) => {
  return (
    <div className="module-card">
      <div className="module-header">
        <h4>{module.name}</h4>
        <div className="module-premium">
          {(module.premium * 100).toFixed(1)}% do valor
        </div>
      </div>
      
      <div className="module-description">
        <p>{module.description}</p>
      </div>
      
      <div className="module-features">
        <h5>Recursos:</h5>
        <ul>
          {module.features.slice(0, 3).map((feature, index) => (
            <li key={index}>
              <CheckCircle className="w-3 h-3 text-green-600" />
              {feature}
            </li>
          ))}
          {module.features.length > 3 && (
            <li className="more-features">
              +{module.features.length - 3} recursos adicionais
            </li>
          )}
        </ul>
      </div>
      
      <div className="module-coverage">
        <div className="coverage-info">
          <span className="coverage-label">Cobertura máxima:</span>
          <span className="coverage-value">R$ {module.maxCoverage.toLocaleString()}</span>
        </div>
      </div>
      
      <div className="module-actions">
        <button className="btn-primary btn-small">
          <Plus className="w-4 h-4" />
          Contratar
        </button>
        <button className="btn-secondary btn-small">
          <Info className="w-4 h-4" />
          Saiba Mais
        </button>
      </div>
    </div>
  );
};

// Modal de Criação de Cobertura
const CreateCoverageModal = ({ availableModules, onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    serviceType: '',
    specialty: '',
    professional: '',
    module: 'standard',
    amount: '',
    location: '',
    expiresAt: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const selectedModule = availableModules.find(m => m.id === formData.module);
    const premium = parseFloat(formData.amount) * selectedModule.premium;
    
    const coverageData = {
      ...formData,
      amount: parseFloat(formData.amount),
      premium: premium,
      moduleName: selectedModule.name,
      features: selectedModule.features,
      riskLevel: 'medium' // Seria calculado pela IA
    };
    
    onCreate(coverageData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Nova Cobertura</h3>
          <button onClick={onClose} className="modal-close">
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Tipo de Serviço</label>
            <select 
              value={formData.serviceType}
              onChange={(e) => setFormData({...formData, serviceType: e.target.value})}
              required
            >
              <option value="">Selecione...</option>
              <option value="Consulta Médica">Consulta Médica</option>
              <option value="Fisioterapia">Fisioterapia</option>
              <option value="Home Care">Home Care</option>
              <option value="Psicologia">Psicologia</option>
              <option value="Nutrição">Nutrição</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Especialidade</label>
            <input 
              type="text"
              value={formData.specialty}
              onChange={(e) => setFormData({...formData, specialty: e.target.value})}
              placeholder="Ex: Cardiologia, Ortopédica..."
              required
            />
          </div>
          
          <div className="form-group">
            <label>Profissional</label>
            <input 
              type="text"
              value={formData.professional}
              onChange={(e) => setFormData({...formData, professional: e.target.value})}
              placeholder="Nome do profissional"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Módulo de Proteção</label>
            <select 
              value={formData.module}
              onChange={(e) => setFormData({...formData, module: e.target.value})}
            >
              {availableModules.map(module => (
                <option key={module.id} value={module.id}>
                  {module.name} - {(module.premium * 100).toFixed(1)}%
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Valor do Serviço (R$)</label>
            <input 
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              placeholder="0.00"
              min="0"
              step="0.01"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Localização</label>
            <input 
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              placeholder="Cidade, Estado"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Data de Expiração</label>
            <input 
              type="date"
              value={formData.expiresAt}
              onChange={(e) => setFormData({...formData, expiresAt: e.target.value})}
              required
            />
          </div>
          
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              <Plus className="w-4 h-4" />
              Criar Cobertura
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CoverageManager;

