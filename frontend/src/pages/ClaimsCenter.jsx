import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  AlertTriangle,
  MessageSquare,
  Mic,
  Send,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  Camera,
  Paperclip,
  Bot,
  User,
  Brain,
  Zap,
  TrendingUp,
  DollarSign,
  Calendar,
  MapPin,
  Shield,
  Star,
  Filter,
  Search,
  Download,
  Upload,
  RefreshCw,
  Eye,
  Settings,
  Info,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Play,
  Pause,
  Volume2,
  VolumeX
} from 'lucide-react';
import { claimsSystem, notificationSystem } from '../utils/fwayShield';

const ClaimsCenter = () => {
  const navigate = useNavigate();
  const [claims, setClaims] = useState([]);
  const [filteredClaims, setFilteredClaims] = useState([]);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [showNewClaimModal, setShowNewClaimModal] = useState(false);
  const [claimInput, setClaimInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    severity: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [claimsStats, setClaimsStats] = useState({});
  const [nlpAnalysis, setNlpAnalysis] = useState(null);

  useEffect(() => {
    loadClaimsData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [claims, filters, searchTerm]);

  const loadClaimsData = () => {
    // Carregar sinistros existentes
    const mockClaims = [
      {
        id: '1',
        serviceId: 'srv_001',
        serviceType: 'Consulta Médica',
        professional: 'Dr. João Silva',
        type: 'cancellation',
        severity: 'low',
        status: 'resolved',
        description: 'O médico cancelou a consulta de última hora sem aviso prévio',
        analysis: {
          sentiment: 'negative',
          confidence: 0.85,
          keywords: { cancellation: true, fraud: false, delay: false },
          urgency: 'normal'
        },
        resolution: {
          type: 'automatic',
          amount: 50,
          resolvedAt: '2024-01-15T14:30:00',
          message: 'Reembolso automático processado'
        },
        createdAt: '2024-01-15T10:30:00',
        estimatedResolution: 2,
        autoResolvable: true,
        attachments: []
      },
      {
        id: '2',
        serviceId: 'srv_002',
        serviceType: 'Fisioterapia',
        professional: 'Ft. Ana Costa',
        type: 'quality_issue',
        severity: 'medium',
        status: 'analyzing',
        description: 'O atendimento não foi satisfatório, a fisioterapeuta chegou atrasada e o equipamento estava com defeito',
        analysis: {
          sentiment: 'negative',
          confidence: 0.78,
          keywords: { cancellation: false, fraud: false, delay: true, quality: true },
          urgency: 'normal'
        },
        createdAt: '2024-01-14T16:45:00',
        estimatedResolution: 6,
        autoResolvable: false,
        attachments: ['foto_equipamento.jpg']
      },
      {
        id: '3',
        serviceId: 'srv_003',
        serviceType: 'Home Care',
        professional: 'Enf. Maria Santos',
        type: 'delay',
        severity: 'low',
        status: 'pending',
        description: 'A enfermeira chegou 30 minutos atrasada',
        analysis: {
          sentiment: 'neutral',
          confidence: 0.92,
          keywords: { cancellation: false, fraud: false, delay: true },
          urgency: 'normal'
        },
        createdAt: '2024-01-13T09:15:00',
        estimatedResolution: 4,
        autoResolvable: true,
        attachments: []
      }
    ];

    // Estatísticas de sinistros
    const stats = {
      totalClaims: mockClaims.length,
      resolvedClaims: mockClaims.filter(c => c.status === 'resolved').length,
      pendingClaims: mockClaims.filter(c => c.status === 'pending').length,
      averageResolutionTime: 3.2,
      autoResolutionRate: 0.67,
      totalCompensation: 125,
      satisfactionRate: 0.94
    };

    setClaims(mockClaims);
    setClaimsStats(stats);
  };

  const applyFilters = () => {
    let filtered = [...claims];

    // Filtro por status
    if (filters.status !== 'all') {
      filtered = filtered.filter(claim => claim.status === filters.status);
    }

    // Filtro por tipo
    if (filters.type !== 'all') {
      filtered = filtered.filter(claim => claim.type === filters.type);
    }

    // Filtro por severidade
    if (filters.severity !== 'all') {
      filtered = filtered.filter(claim => claim.severity === filters.severity);
    }

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(claim => 
        claim.serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.professional.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredClaims(filtered);
  };

  const processClaimWithNLP = async (input, attachments = []) => {
    setIsProcessing(true);
    
    try {
      // Simular processamento NLP
      const analysis = claimsSystem.analyzeClaimText(input);
      setNlpAnalysis(analysis);
      
      // Criar novo sinistro
      const newClaim = claimsSystem.processClaimWithNLP(input, 'user_123', 'srv_new');
      
      // Adicionar à lista
      setClaims([newClaim, ...claims]);
      
      // Criar notificação
      notificationSystem.createNotification({
        userId: 'user_123',
        type: 'claim',
        title: 'Sinistro Criado',
        message: `Seu sinistro foi registrado e está sendo analisado pela IA`,
        priority: 'medium'
      });
      
      setClaimInput('');
      setShowNewClaimModal(false);
      
    } catch (error) {
      console.error('Erro ao processar sinistro:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const startVoiceRecording = () => {
    setIsRecording(true);
    
    // Simular gravação de voz
    setTimeout(() => {
      setIsRecording(false);
      setClaimInput('O profissional não apareceu no horário marcado e não avisou sobre o atraso');
    }, 3000);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'text-yellow-600 bg-yellow-100',
      analyzing: 'text-blue-600 bg-blue-100',
      resolved: 'text-green-600 bg-green-100',
      rejected: 'text-red-600 bg-red-100'
    };
    return colors[status] || colors.pending;
  };

  const getSeverityColor = (severity) => {
    const colors = {
      low: 'text-green-600',
      medium: 'text-yellow-600',
      high: 'text-red-600'
    };
    return colors[severity] || colors.medium;
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'cancellation':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'delay':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'quality_issue':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case 'fraud':
        return <Shield className="w-4 h-4 text-red-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'analyzing':
        return <Brain className="w-4 h-4 text-blue-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Info className="w-4 h-4 text-gray-600" />;
    }
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
                  <option value="pending">Pendente</option>
                  <option value="analyzing">Analisando</option>
                  <option value="resolved">Resolvido</option>
                  <option value="rejected">Rejeitado</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Tipo</label>
                <select 
                  value={filters.type}
                  onChange={(e) => setFilters({...filters, type: e.target.value})}
                  className="filter-select"
                >
                  <option value="all">Todos</option>
                  <option value="cancellation">Cancelamento</option>
                  <option value="delay">Atraso</option>
                  <option value="quality_issue">Qualidade</option>
                  <option value="fraud">Fraude</option>
                  <option value="damage">Dano</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Severidade</label>
                <select 
                  value={filters.severity}
                  onChange={(e) => setFilters({...filters, severity: e.target.value})}
                  className="filter-select"
                >
                  <option value="all">Todas</option>
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                </select>
              </div>

              <button 
                onClick={() => setFilters({ status: 'all', type: 'all', severity: 'all' })}
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
              <Brain className="w-5 h-5" />
              IA NLP
            </h3>
          </div>
          <div className="card-body">
            <div className="nlp-status">
              <div className="nlp-indicator">
                <div className="status-dot active"></div>
                <span>Sistema NLP Ativo</span>
              </div>
              
              <div className="nlp-stats">
                <div className="stat-item">
                  <Zap className="w-4 h-4 text-purple-600" />
                  <div className="stat-info">
                    <h4>94.2%</h4>
                    <p>Precisão de Análise</p>
                  </div>
                </div>
                
                <div className="stat-item">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <div className="stat-info">
                    <h4>0.3s</h4>
                    <p>Tempo de Processamento</p>
                  </div>
                </div>
                
                <div className="stat-item">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <div className="stat-info">
                    <h4>{Math.round(claimsStats.autoResolutionRate * 100)}%</h4>
                    <p>Resolução Automática</p>
                  </div>
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
                onClick={() => setShowNewClaimModal(true)}
                className="quick-action-btn primary"
              >
                <MessageSquare className="w-4 h-4" />
                Novo Sinistro
              </button>
              
              <button className="quick-action-btn">
                <Download className="w-4 h-4" />
                Exportar Dados
              </button>
              
              <button className="quick-action-btn">
                <RefreshCw className="w-4 h-4" />
                Atualizar Lista
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
            <AlertTriangle className="w-8 h-8 text-orange-600" />
            Centro de Sinistros IA
          </h1>
          <p className="page-subtitle">Processamento inteligente com NLP e resolução automática</p>
        </div>

        {/* Barra de Busca e Controles */}
        <div className="search-controls">
          <div className="search-bar">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por serviço, profissional ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="control-buttons">
            <button 
              onClick={() => setShowNewClaimModal(true)}
              className="btn-primary"
            >
              <MessageSquare className="w-4 h-4" />
              Novo Sinistro
            </button>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="claims-stats-grid">
          <div className="stat-card total">
            <div className="stat-icon">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="stat-content">
              <h3>{claimsStats.totalClaims}</h3>
              <p>Total de Sinistros</p>
              <div className="stat-trend neutral">
                <TrendingUp className="w-4 h-4" />
                Este mês
              </div>
            </div>
          </div>

          <div className="stat-card resolved">
            <div className="stat-icon">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="stat-content">
              <h3>{claimsStats.resolvedClaims}</h3>
              <p>Resolvidos</p>
              <div className="stat-trend positive">
                <TrendingUp className="w-4 h-4" />
                {Math.round((claimsStats.resolvedClaims / claimsStats.totalClaims) * 100)}% taxa
              </div>
            </div>
          </div>

          <div className="stat-card time">
            <div className="stat-icon">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <div className="stat-content">
              <h3>{claimsStats.averageResolutionTime}h</h3>
              <p>Tempo Médio</p>
              <div className="stat-trend positive">
                <TrendingUp className="w-4 h-4" />
                -40% mais rápido
              </div>
            </div>
          </div>

          <div className="stat-card compensation">
            <div className="stat-icon">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="stat-content">
              <h3>R$ {claimsStats.totalCompensation}</h3>
              <p>Compensação Total</p>
              <div className="stat-trend positive">
                <TrendingUp className="w-4 h-4" />
                Processado
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Sinistros */}
        <div className="claims-section">
          <div className="section-header">
            <h2>
              <AlertTriangle className="w-6 h-6 text-orange-600" />
              Seus Sinistros ({filteredClaims.length})
            </h2>
          </div>

          <div className="claims-list">
            {filteredClaims.map((claim) => (
              <ClaimCard 
                key={claim.id} 
                claim={claim} 
                getStatusColor={getStatusColor}
                getSeverityColor={getSeverityColor}
                getTypeIcon={getTypeIcon}
                getStatusIcon={getStatusIcon}
                onSelect={setSelectedClaim}
              />
            ))}
          </div>

          {filteredClaims.length === 0 && (
            <div className="empty-state">
              <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3>Nenhum sinistro encontrado</h3>
              <p>Ajuste os filtros ou registre um novo sinistro</p>
              <button 
                onClick={() => setShowNewClaimModal(true)}
                className="btn-primary"
              >
                <MessageSquare className="w-4 h-4" />
                Registrar Primeiro Sinistro
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Sidebar Direita - Análise IA e Insights */}
      <aside className="sidebar-right">
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title">
              <Brain className="w-5 h-5" />
              Análise IA em Tempo Real
            </h3>
          </div>
          <div className="card-body">
            <div className="ai-analysis">
              {nlpAnalysis ? (
                <div className="analysis-results">
                  <div className="analysis-item">
                    <h4>Sentimento Detectado</h4>
                    <div className={`sentiment-badge ${nlpAnalysis.sentiment}`}>
                      {nlpAnalysis.sentiment === 'negative' ? 'Negativo' : 
                       nlpAnalysis.sentiment === 'positive' ? 'Positivo' : 'Neutro'}
                    </div>
                  </div>
                  
                  <div className="analysis-item">
                    <h4>Confiança da Análise</h4>
                    <div className="confidence-bar">
                      <div 
                        className="confidence-fill"
                        style={{ width: `${nlpAnalysis.confidence * 100}%` }}
                      ></div>
                    </div>
                    <span>{Math.round(nlpAnalysis.confidence * 100)}%</span>
                  </div>
                  
                  <div className="analysis-item">
                    <h4>Palavras-chave Detectadas</h4>
                    <div className="keywords-list">
                      {Object.entries(nlpAnalysis.keywords)
                        .filter(([key, value]) => value)
                        .map(([key, value]) => (
                          <span key={key} className="keyword-tag">
                            {key === 'cancellation' ? 'Cancelamento' :
                             key === 'fraud' ? 'Fraude' :
                             key === 'delay' ? 'Atraso' :
                             key === 'quality' ? 'Qualidade' : key}
                          </span>
                        ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="no-analysis">
                  <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p>Registre um sinistro para ver a análise IA em ação</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title">
              <TrendingUp className="w-5 h-5" />
              Estatísticas Avançadas
            </h3>
          </div>
          <div className="card-body">
            <div className="advanced-stats">
              <div className="stat-item">
                <div className="stat-label">Taxa de Satisfação</div>
                <div className="stat-value">{Math.round(claimsStats.satisfactionRate * 100)}%</div>
                <div className="stat-bar">
                  <div 
                    className="stat-fill"
                    style={{ width: `${claimsStats.satisfactionRate * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="stat-item">
                <div className="stat-label">Resolução Automática</div>
                <div className="stat-value">{Math.round(claimsStats.autoResolutionRate * 100)}%</div>
                <div className="stat-bar">
                  <div 
                    className="stat-fill"
                    style={{ width: `${claimsStats.autoResolutionRate * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="stat-item">
                <div className="stat-label">Tempo Médio de Resposta</div>
                <div className="stat-value">{claimsStats.averageResolutionTime}h</div>
              </div>

              <div className="stat-item">
                <div className="stat-label">Sinistros Pendentes</div>
                <div className="stat-value">{claimsStats.pendingClaims}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title">
              <Info className="w-5 h-5" />
              Dicas de Prevenção
            </h3>
          </div>
          <div className="card-body">
            <div className="prevention-tips">
              <div className="tip-item">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <div className="tip-content">
                  <h4>Comunicação Clara</h4>
                  <p>Sempre confirme detalhes do serviço antes do agendamento</p>
                </div>
              </div>

              <div className="tip-item">
                <Clock className="w-4 h-4 text-blue-600" />
                <div className="tip-content">
                  <h4>Pontualidade</h4>
                  <p>Chegue no horário marcado e confirme presença</p>
                </div>
              </div>

              <div className="tip-item">
                <Star className="w-4 h-4 text-yellow-600" />
                <div className="tip-content">
                  <h4>Avaliações</h4>
                  <p>Verifique avaliações antes de contratar profissionais</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Modal de Novo Sinistro */}
      {showNewClaimModal && (
        <NewClaimModal 
          claimInput={claimInput}
          setClaimInput={setClaimInput}
          isRecording={isRecording}
          isProcessing={isProcessing}
          onClose={() => setShowNewClaimModal(false)}
          onSubmit={processClaimWithNLP}
          onStartRecording={startVoiceRecording}
        />
      )}
    </div>
  );
};

// Componente Card de Sinistro
const ClaimCard = ({ 
  claim, 
  getStatusColor, 
  getSeverityColor, 
  getTypeIcon, 
  getStatusIcon,
  onSelect 
}) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="claim-card">
      <div className="claim-header">
        <div className="claim-main-info">
          <div className="claim-type">
            {getTypeIcon(claim.type)}
            <h4>
              {claim.type === 'cancellation' ? 'Cancelamento' :
               claim.type === 'delay' ? 'Atraso' :
               claim.type === 'quality_issue' ? 'Problema de Qualidade' :
               claim.type === 'fraud' ? 'Fraude' : 'Outro'}
            </h4>
          </div>
          <p>{claim.serviceType} - {claim.professional}</p>
        </div>
        
        <div className="claim-status-info">
          <div className={`status-badge ${getStatusColor(claim.status)}`}>
            {getStatusIcon(claim.status)}
            <span>
              {claim.status === 'pending' ? 'Pendente' :
               claim.status === 'analyzing' ? 'Analisando' :
               claim.status === 'resolved' ? 'Resolvido' : 'Rejeitado'}
            </span>
          </div>
          
          <div className={`severity-badge ${getSeverityColor(claim.severity)}`}>
            {claim.severity === 'low' ? 'Baixa' :
             claim.severity === 'medium' ? 'Média' : 'Alta'}
          </div>
        </div>
      </div>

      <div className="claim-description">
        <p>{claim.description}</p>
      </div>

      <div className="claim-details">
        <div className="detail-row">
          <div className="detail-item">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span>{new Date(claim.createdAt).toLocaleDateString()}</span>
          </div>
          
          <div className="detail-item">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>Resolução em {claim.estimatedResolution}h</span>
          </div>
          
          {claim.autoResolvable && (
            <div className="detail-item">
              <Bot className="w-4 h-4 text-purple-600" />
              <span>Resolução Automática</span>
            </div>
          )}
        </div>

        {claim.analysis && (
          <div className="analysis-summary">
            <div className="analysis-item">
              <Brain className="w-4 h-4 text-purple-600" />
              <span>Confiança IA: {Math.round(claim.analysis.confidence * 100)}%</span>
            </div>
            
            <div className="analysis-item">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <span>Sentimento: {claim.analysis.sentiment === 'negative' ? 'Negativo' : 
                                claim.analysis.sentiment === 'positive' ? 'Positivo' : 'Neutro'}</span>
            </div>
          </div>
        )}
      </div>

      {claim.resolution && (
        <div className="claim-resolution">
          <div className="resolution-header">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <h5>Resolução</h5>
          </div>
          <p>{claim.resolution.message}</p>
          {claim.resolution.amount && (
            <div className="resolution-amount">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span>Compensação: R$ {claim.resolution.amount}</span>
            </div>
          )}
        </div>
      )}

      <div className="claim-actions">
        <button 
          onClick={() => setShowDetails(!showDetails)}
          className="action-btn secondary"
        >
          {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          {showDetails ? 'Menos' : 'Mais'} Detalhes
        </button>
        
        <button 
          onClick={() => onSelect(claim)}
          className="action-btn primary"
        >
          <Eye className="w-4 h-4" />
          Ver Completo
        </button>
      </div>

      {showDetails && (
        <div className="claim-expanded-details">
          <div className="analysis-details">
            <h5>Análise Detalhada da IA:</h5>
            <div className="analysis-grid">
              <div className="analysis-metric">
                <span className="metric-label">Urgência:</span>
                <span className="metric-value">{claim.analysis?.urgency || 'Normal'}</span>
              </div>
              <div className="analysis-metric">
                <span className="metric-label">Tipo Detectado:</span>
                <span className="metric-value">
                  {claim.type === 'cancellation' ? 'Cancelamento' :
                   claim.type === 'delay' ? 'Atraso' :
                   claim.type === 'quality_issue' ? 'Qualidade' : 'Outro'}
                </span>
              </div>
            </div>
          </div>
          
          {claim.attachments && claim.attachments.length > 0 && (
            <div className="attachments-list">
              <h5>Anexos:</h5>
              <ul>
                {claim.attachments.map((attachment, index) => (
                  <li key={index}>
                    <Paperclip className="w-3 h-3 text-gray-600" />
                    {attachment}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Modal de Novo Sinistro
const NewClaimModal = ({ 
  claimInput, 
  setClaimInput, 
  isRecording, 
  isProcessing,
  onClose, 
  onSubmit, 
  onStartRecording 
}) => {
  const [attachments, setAttachments] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (claimInput.trim()) {
      onSubmit(claimInput, attachments);
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setAttachments([...attachments, ...files.map(f => f.name)]);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content large">
        <div className="modal-header">
          <h3>
            <MessageSquare className="w-5 h-5" />
            Registrar Novo Sinistro
          </h3>
          <button onClick={onClose} className="modal-close">
            ×
          </button>
        </div>
        
        <div className="modal-body">
          <div className="nlp-info">
            <div className="nlp-badge">
              <Bot className="w-4 h-4" />
              <span>Processamento com IA Natural Language</span>
            </div>
            <p>Descreva o problema em suas próprias palavras. Nossa IA irá analisar automaticamente e classificar o sinistro.</p>
          </div>

          <form onSubmit={handleSubmit} className="claim-form">
            <div className="input-section">
              <label>Descreva o que aconteceu:</label>
              <div className="text-input-container">
                <textarea
                  value={claimInput}
                  onChange={(e) => setClaimInput(e.target.value)}
                  placeholder="Ex: O profissional cancelou o serviço de última hora sem aviso prévio..."
                  rows={6}
                  className="claim-textarea"
                  disabled={isRecording || isProcessing}
                />
                
                <div className="input-controls">
                  <button
                    type="button"
                    onClick={onStartRecording}
                    disabled={isRecording || isProcessing}
                    className={`voice-btn ${isRecording ? 'recording' : ''}`}
                  >
                    {isRecording ? (
                      <>
                        <Volume2 className="w-4 h-4" />
                        Gravando...
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4" />
                        Gravar Áudio
                      </>
                    )}
                  </button>
                  
                  <label className="file-upload-btn">
                    <Camera className="w-4 h-4" />
                    Anexar Foto
                    <input 
                      type="file" 
                      accept="image/*,application/pdf"
                      multiple
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
              </div>
            </div>

            {attachments.length > 0 && (
              <div className="attachments-preview">
                <h5>Anexos:</h5>
                <ul>
                  {attachments.map((file, index) => (
                    <li key={index}>
                      <Paperclip className="w-3 h-3" />
                      {file}
                      <button 
                        type="button"
                        onClick={() => setAttachments(attachments.filter((_, i) => i !== index))}
                        className="remove-attachment"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="ai-preview">
              <h5>
                <Brain className="w-4 h-4" />
                Prévia da Análise IA
              </h5>
              {claimInput.length > 10 ? (
                <div className="preview-content">
                  <p>A IA detectará automaticamente:</p>
                  <ul>
                    <li>Tipo de problema (cancelamento, atraso, qualidade, etc.)</li>
                    <li>Nível de severidade</li>
                    <li>Sentimento da mensagem</li>
                    <li>Possibilidade de resolução automática</li>
                  </ul>
                </div>
              ) : (
                <p>Digite mais detalhes para ver a prévia da análise...</p>
              )}
            </div>
          </form>
        </div>
        
        <div className="modal-actions">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancelar
          </button>
          <button 
            onClick={handleSubmit}
            disabled={!claimInput.trim() || isProcessing}
            className="btn-primary"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Processando IA...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Registrar Sinistro
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClaimsCenter;

