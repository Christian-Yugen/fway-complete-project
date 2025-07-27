import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  Calendar,
  Clock,
  DollarSign,
  User,
  Award,
  TrendingUp,
  Filter,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  Target,
  Heart,
  Stethoscope,
  Activity
} from 'lucide-react';
import { ratingSystem, historySystem } from '../utils/uberFeatures';

const RatingAndHistory = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('history');
  const [historyFilter, setHistoryFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('received');
  const [userHistory, setUserHistory] = useState([]);
  const [userRatings, setUserRatings] = useState([]);
  const [userStats, setUserStats] = useState({});
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Carregar dados do usuário
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = () => {
    // Simular dados do usuário
    const mockHistory = [
      {
        id: '1',
        type: 'service_requested',
        title: 'Consulta Cardiológica',
        professional: 'Dr. João Silva',
        date: '2024-01-15',
        status: 'completed',
        amount: 250,
        rating: 5,
        specialty: 'Cardiologia'
      },
      {
        id: '2',
        type: 'service_provided',
        title: 'Fisioterapia Domiciliar',
        client: 'Maria Santos',
        date: '2024-01-10',
        status: 'completed',
        amount: 180,
        rating: 4.8,
        specialty: 'Fisioterapia'
      },
      {
        id: '3',
        type: 'service_requested',
        title: 'Enfermagem Home Care',
        professional: 'Enf. Ana Costa',
        date: '2024-01-08',
        status: 'in_progress',
        amount: 320,
        specialty: 'Enfermagem'
      }
    ];

    const mockRatings = [
      {
        id: '1',
        serviceId: '1',
        fromUser: 'Maria Santos',
        rating: 5,
        comment: 'Excelente profissional, muito atencioso e pontual.',
        date: '2024-01-15',
        tags: ['pontual', 'atencioso', 'qualidade']
      },
      {
        id: '2',
        serviceId: '2',
        fromUser: 'João Oliveira',
        rating: 4.5,
        comment: 'Ótimo atendimento, recomendo!',
        date: '2024-01-12',
        tags: ['comunicativo', 'eficiente']
      }
    ];

    const mockStats = {
      totalServices: 15,
      servicesRequested: 8,
      servicesProvided: 7,
      totalSpent: 2450,
      totalEarned: 1890,
      averageRating: 4.7,
      completedServices: 12,
      cancelledServices: 1
    };

    setUserHistory(mockHistory);
    setUserRatings(mockRatings);
    setUserStats(mockStats);
  };

  const filteredHistory = userHistory.filter(item => {
    if (historyFilter !== 'all' && item.type !== historyFilter) return false;
    if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const filteredRatings = userRatings.filter(rating => {
    if (searchQuery && !rating.comment.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getSpecialtyIcon = (specialty) => {
    switch (specialty) {
      case 'Cardiologia':
        return <Heart className="w-4 h-4 text-red-500" />;
      case 'Fisioterapia':
        return <Activity className="w-4 h-4 text-blue-500" />;
      case 'Enfermagem':
        return <Stethoscope className="w-4 h-4 text-green-500" />;
      default:
        return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />);
    }
    if (hasHalfStar) {
      stars.push(<Star key="half" className="w-4 h-4 text-yellow-500 fill-current opacity-50" />);
    }
    for (let i = stars.length; i < 5; i++) {
      stars.push(<Star key={i} className="w-4 h-4 text-gray-300" />);
    }
    return stars;
  };

  return (
    <div className="content-container">
      {/* Sidebar Esquerda - Estatísticas */}
      <aside className="sidebar-left">
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title">
              <BarChart3 className="w-5 h-5" />
              Suas Estatísticas
            </h3>
          </div>
          <div className="card-body">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">
                  <Target className="w-5 h-5 text-blue-600" />
                </div>
                <div className="stat-info">
                  <h4>{userStats.totalServices}</h4>
                  <p>Total de Serviços</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <Star className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="stat-info">
                  <h4>{userStats.averageRating}</h4>
                  <p>Avaliação Média</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div className="stat-info">
                  <h4>R$ {userStats.totalEarned}</h4>
                  <p>Total Ganho</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div className="stat-info">
                  <h4>{userStats.completedServices}</h4>
                  <p>Concluídos</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title">
              <Filter className="w-5 h-5" />
              Filtros
            </h3>
          </div>
          <div className="card-body">
            <div className="filter-section">
              <label className="filter-label">Buscar</label>
              <div className="search-container">
                <Search className="search-icon w-4 h-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar serviços..."
                  className="search-input"
                />
              </div>
            </div>

            {activeTab === 'history' && (
              <div className="filter-section">
                <label className="filter-label">Tipo de Serviço</label>
                <div className="filter-buttons">
                  {[
                    { id: 'all', label: 'Todos' },
                    { id: 'service_requested', label: 'Solicitados' },
                    { id: 'service_provided', label: 'Prestados' }
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setHistoryFilter(filter.id)}
                      className={`filter-button ${historyFilter === filter.id ? 'active' : ''}`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="main-content">
        <div className="page-header">
          <h1 className="page-title">Avaliações e Histórico</h1>
          <p className="page-subtitle">Acompanhe seu desempenho e histórico de serviços</p>
        </div>

        {/* Tabs */}
        <div className="tabs-container">
          <div className="tabs-header">
            <button
              onClick={() => setActiveTab('history')}
              className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
            >
              <Calendar className="w-4 h-4" />
              Histórico
            </button>
            <button
              onClick={() => setActiveTab('ratings')}
              className={`tab-button ${activeTab === 'ratings' ? 'active' : ''}`}
            >
              <Star className="w-4 h-4" />
              Avaliações
            </button>
          </div>

          <div className="tabs-content">
            {activeTab === 'history' && (
              <div className="history-content">
                {filteredHistory.length === 0 ? (
                  <div className="empty-state">
                    <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3>Nenhum serviço encontrado</h3>
                    <p>Tente ajustar os filtros de busca</p>
                  </div>
                ) : (
                  <div className="history-list">
                    {filteredHistory.map((item) => (
                      <HistoryCard key={item.id} item={item} getStatusIcon={getStatusIcon} getSpecialtyIcon={getSpecialtyIcon} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'ratings' && (
              <div className="ratings-content">
                {filteredRatings.length === 0 ? (
                  <div className="empty-state">
                    <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3>Nenhuma avaliação encontrada</h3>
                    <p>Suas avaliações aparecerão aqui</p>
                  </div>
                ) : (
                  <div className="ratings-list">
                    {filteredRatings.map((rating) => (
                      <RatingCard key={rating.id} rating={rating} renderStars={renderStars} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Sidebar Direita - Resumo de Performance */}
      <aside className="sidebar-right">
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title">
              <TrendingUp className="w-5 h-5" />
              Performance
            </h3>
          </div>
          <div className="card-body">
            <div className="performance-metrics">
              <div className="metric-item">
                <div className="metric-label">Taxa de Conclusão</div>
                <div className="metric-value">
                  {Math.round((userStats.completedServices / userStats.totalServices) * 100)}%
                </div>
                <div className="metric-bar">
                  <div 
                    className="metric-fill"
                    style={{ width: `${(userStats.completedServices / userStats.totalServices) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="metric-item">
                <div className="metric-label">Avaliação Média</div>
                <div className="metric-value">{userStats.averageRating}/5.0</div>
                <div className="metric-stars">
                  {renderStars(userStats.averageRating)}
                </div>
              </div>

              <div className="metric-item">
                <div className="metric-label">Serviços Este Mês</div>
                <div className="metric-value">8</div>
                <div className="metric-trend positive">
                  <TrendingUp className="w-4 h-4" />
                  +25%
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title">
              <Award className="w-5 h-5" />
              Conquistas
            </h3>
          </div>
          <div className="card-body">
            <div className="achievements-list">
              <div className="achievement-item">
                <div className="achievement-icon">
                  <Star className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="achievement-info">
                  <h4>Profissional 5 Estrelas</h4>
                  <p>Mantenha avaliação acima de 4.5</p>
                </div>
              </div>

              <div className="achievement-item">
                <div className="achievement-icon">
                  <Target className="w-5 h-5 text-blue-600" />
                </div>
                <div className="achievement-info">
                  <h4>10 Serviços Concluídos</h4>
                  <p>Complete 10 serviços com sucesso</p>
                </div>
              </div>

              <div className="achievement-item locked">
                <div className="achievement-icon">
                  <Award className="w-5 h-5 text-gray-400" />
                </div>
                <div className="achievement-info">
                  <h4>Especialista Verificado</h4>
                  <p>Complete 50 serviços</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

// Componente Card do Histórico
const HistoryCard = ({ item, getStatusIcon, getSpecialtyIcon }) => {
  return (
    <div className="history-card">
      <div className="history-header">
        <div className="history-title-section">
          <div className="history-specialty-icon">
            {getSpecialtyIcon(item.specialty)}
          </div>
          <div className="history-title-info">
            <h3>{item.title}</h3>
            <p>{item.professional || item.client}</p>
          </div>
        </div>
        <div className="history-status">
          {getStatusIcon(item.status)}
          <span className={`status-text ${item.status}`}>
            {item.status === 'completed' ? 'Concluído' : 
             item.status === 'in_progress' ? 'Em Andamento' : 
             item.status === 'cancelled' ? 'Cancelado' : 'Pendente'}
          </span>
        </div>
      </div>

      <div className="history-details">
        <div className="history-detail">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span>{new Date(item.date).toLocaleDateString()}</span>
        </div>
        <div className="history-detail">
          <DollarSign className="w-4 h-4 text-gray-500" />
          <span>R$ {item.amount}</span>
        </div>
        {item.rating && (
          <div className="history-detail">
            <Star className="w-4 h-4 text-yellow-500" />
            <span>{item.rating}/5.0</span>
          </div>
        )}
      </div>

      <div className="history-actions">
        {item.status === 'completed' && !item.rating && (
          <button className="btn-secondary btn-small">
            <Star className="w-4 h-4" />
            Avaliar
          </button>
        )}
        <button className="btn-primary btn-small">
          <MessageSquare className="w-4 h-4" />
          Ver Detalhes
        </button>
      </div>
    </div>
  );
};

// Componente Card de Avaliação
const RatingCard = ({ rating, renderStars }) => {
  return (
    <div className="rating-card">
      <div className="rating-header">
        <div className="rating-user">
          <div className="rating-avatar">
            <User className="w-5 h-5" />
          </div>
          <div className="rating-user-info">
            <h4>{rating.fromUser}</h4>
            <p>{new Date(rating.date).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="rating-stars">
          {renderStars(rating.rating)}
          <span className="rating-value">{rating.rating}</span>
        </div>
      </div>

      <div className="rating-comment">
        <p>{rating.comment}</p>
      </div>

      {rating.tags && rating.tags.length > 0 && (
        <div className="rating-tags">
          {rating.tags.map((tag, index) => (
            <span key={index} className="rating-tag">{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
};

export default RatingAndHistory;

