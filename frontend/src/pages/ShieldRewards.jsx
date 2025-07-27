import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Award,
  Star,
  Trophy,
  Gift,
  Zap,
  Target,
  TrendingUp,
  Crown,
  Gem,
  Coins,
  ShoppingBag,
  Calendar,
  Clock,
  CheckCircle,
  ArrowRight,
  Plus,
  Minus,
  RefreshCw,
  Download,
  Share2,
  Users,
  Heart,
  Shield,
  Brain,
  Activity,
  BarChart3,
  PieChart,
  Sparkles,
  Flame,
  Rocket,
  Medal,
  Settings,
  Info,
  Eye,
  Lock,
  Unlock
} from 'lucide-react';
import { shieldRewardsSystem } from '../utils/fwayShield';

const ShieldRewards = () => {
  const navigate = useNavigate();
  const [userStatus, setUserStatus] = useState({});
  const [availableRewards, setAvailableRewards] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [selectedReward, setSelectedReward] = useState(null);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadRewardsData();
  }, []);

  const loadRewardsData = () => {
    const userId = 'user_123';

    // Status do usuário no programa de recompensas
    const mockUserStatus = shieldRewardsSystem.getUserShieldStatus(userId);

    // Recompensas disponíveis
    const mockRewards = [
      {
        id: 'discount_10',
        name: 'Desconto 10% no Seguro',
        description: 'Desconto de 10% na próxima cobertura contratada',
        cost: 100,
        category: 'discount',
        icon: 'Shield',
        available: true,
        popular: true,
        validUntil: '2024-03-31'
      },
      {
        id: 'priority_support',
        name: 'Suporte Prioritário',
        description: 'Atendimento prioritário por 30 dias',
        cost: 150,
        category: 'service',
        icon: 'Zap',
        available: true,
        popular: false,
        validUntil: '2024-02-29'
      },
      {
        id: 'free_consultation',
        name: 'Consulta Gratuita',
        description: 'Uma consulta médica gratuita até R$ 200',
        cost: 300,
        category: 'service',
        icon: 'Heart',
        available: true,
        popular: true,
        validUntil: '2024-04-30'
      },
      {
        id: 'premium_upgrade',
        name: 'Upgrade Premium',
        description: 'Upgrade gratuito para proteção premium por 1 mês',
        cost: 500,
        category: 'upgrade',
        icon: 'Crown',
        available: true,
        popular: false,
        validUntil: '2024-03-15'
      },
      {
        id: 'cashback_50',
        name: 'Cashback R$ 50',
        description: 'R$ 50 de volta na sua carteira Fway',
        cost: 750,
        category: 'cashback',
        icon: 'Coins',
        available: false,
        popular: true,
        validUntil: '2024-05-31'
      },
      {
        id: 'exclusive_access',
        name: 'Acesso Exclusivo',
        description: 'Acesso antecipado a novos recursos e serviços',
        cost: 1000,
        category: 'exclusive',
        icon: 'Rocket',
        available: false,
        popular: false,
        validUntil: '2024-06-30'
      }
    ];

    // Atividade recente de pontos
    const mockActivity = [
      {
        id: '1',
        action: 'complete_service',
        points: 10,
        description: 'Serviço concluído com sucesso',
        timestamp: '2024-01-15T14:30:00',
        serviceType: 'Consulta Médica'
      },
      {
        id: '2',
        action: 'receive_5_stars',
        points: 25,
        description: 'Avaliação 5 estrelas recebida',
        timestamp: '2024-01-14T16:45:00',
        serviceType: 'Fisioterapia'
      },
      {
        id: '3',
        action: 'no_claims_month',
        points: 50,
        description: 'Mês sem sinistros',
        timestamp: '2024-01-01T00:00:00',
        serviceType: 'Bônus Mensal'
      },
      {
        id: '4',
        action: 'early_payment',
        points: 15,
        description: 'Pagamento antecipado',
        timestamp: '2024-01-13T10:20:00',
        serviceType: 'Home Care'
      },
      {
        id: '5',
        action: 'refer_friend',
        points: 75,
        description: 'Amigo indicado',
        timestamp: '2024-01-12T18:15:00',
        serviceType: 'Indicação'
      }
    ];

    // Leaderboard
    const mockLeaderboard = [
      { rank: 1, name: 'Ana Silva', points: 2850, level: 'diamond', avatar: '👩‍⚕️' },
      { rank: 2, name: 'Carlos Santos', points: 2340, level: 'platinum', avatar: '👨‍⚕️' },
      { rank: 3, name: 'Maria Costa', points: 1980, level: 'gold', avatar: '👩‍💼' },
      { rank: 4, name: 'Você', points: mockUserStatus.totalPoints || 1750, level: mockUserStatus.currentLevel, avatar: '👤', isUser: true },
      { rank: 5, name: 'João Lima', points: 1650, level: 'gold', avatar: '👨‍💼' },
      { rank: 6, name: 'Paula Oliveira', points: 1420, level: 'silver', avatar: '👩‍🔬' },
      { rank: 7, name: 'Roberto Alves', points: 1280, level: 'silver', avatar: '👨‍🔬' },
      { rank: 8, name: 'Lucia Ferreira', points: 1150, level: 'silver', avatar: '👩‍⚖️' }
    ];

    // Conquistas
    const mockAchievements = [
      {
        id: 'first_service',
        name: 'Primeiro Passo',
        description: 'Complete seu primeiro serviço',
        icon: 'Star',
        unlocked: true,
        unlockedAt: '2023-12-01T10:00:00',
        points: 25
      },
      {
        id: 'perfect_month',
        name: 'Mês Perfeito',
        description: 'Complete um mês sem sinistros',
        icon: 'Trophy',
        unlocked: true,
        unlockedAt: '2024-01-01T00:00:00',
        points: 100
      },
      {
        id: 'five_star_streak',
        name: 'Sequência de Ouro',
        description: 'Receba 5 avaliações 5 estrelas seguidas',
        icon: 'Medal',
        unlocked: true,
        unlockedAt: '2024-01-10T15:30:00',
        points: 150
      },
      {
        id: 'referral_master',
        name: 'Mestre das Indicações',
        description: 'Indique 10 amigos para a plataforma',
        icon: 'Users',
        unlocked: false,
        progress: 3,
        target: 10,
        points: 500
      },
      {
        id: 'shield_veteran',
        name: 'Veterano Shield',
        description: 'Use o Fway Shield por 6 meses',
        icon: 'Shield',
        unlocked: false,
        progress: 2,
        target: 6,
        points: 300
      },
      {
        id: 'ai_expert',
        name: 'Especialista IA',
        description: 'Tenha 50 interações com a IA do sistema',
        icon: 'Brain',
        unlocked: false,
        progress: 23,
        target: 50,
        points: 200
      }
    ];

    setUserStatus(mockUserStatus);
    setAvailableRewards(mockRewards);
    setRecentActivity(mockActivity);
    setLeaderboard(mockLeaderboard);
    setAchievements(mockAchievements);
  };

  const redeemReward = (reward) => {
    const result = shieldRewardsSystem.redeemPoints('user_123', reward.id, reward.cost);
    
    if (result.success) {
      // Atualizar status do usuário
      const updatedStatus = shieldRewardsSystem.getUserShieldStatus('user_123');
      setUserStatus(updatedStatus);
      
      // Fechar modal
      setShowRedeemModal(false);
      setSelectedReward(null);
      
      // Mostrar notificação de sucesso
      alert(`Recompensa "${reward.name}" resgatada com sucesso!`);
    } else {
      alert(result.message);
    }
  };

  const getLevelColor = (level) => {
    const colors = {
      bronze: '#CD7F32',
      silver: '#C0C0C0',
      gold: '#FFD700',
      platinum: '#E5E4E2',
      diamond: '#B9F2FF'
    };
    return colors[level] || colors.bronze;
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'discount':
        return <Shield className="w-5 h-5" />;
      case 'service':
        return <Zap className="w-5 h-5" />;
      case 'upgrade':
        return <Crown className="w-5 h-5" />;
      case 'cashback':
        return <Coins className="w-5 h-5" />;
      case 'exclusive':
        return <Rocket className="w-5 h-5" />;
      default:
        return <Gift className="w-5 h-5" />;
    }
  };

  const getAchievementIcon = (iconName) => {
    switch (iconName) {
      case 'Star':
        return <Star className="w-6 h-6" />;
      case 'Trophy':
        return <Trophy className="w-6 h-6" />;
      case 'Medal':
        return <Medal className="w-6 h-6" />;
      case 'Users':
        return <Users className="w-6 h-6" />;
      case 'Shield':
        return <Shield className="w-6 h-6" />;
      case 'Brain':
        return <Brain className="w-6 h-6" />;
      default:
        return <Award className="w-6 h-6" />;
    }
  };

  return (
    <div className="content-container">
      {/* Sidebar Esquerda - Status e Progresso */}
      <aside className="sidebar-left">
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title">
              <Award className="w-5 h-5" />
              Seu Status Shield
            </h3>
          </div>
          <div className="card-body">
            <div className="user-status">
              <div className="level-display">
                <div 
                  className="level-badge large"
                  style={{ backgroundColor: getLevelColor(userStatus.currentLevel) }}
                >
                  <Crown className="w-6 h-6" />
                  <span>{userStatus.currentLevel?.toUpperCase()}</span>
                </div>
              </div>

              <div className="points-display">
                <h4>{userStatus.totalPoints} Pontos</h4>
                {userStatus.nextLevel && (
                  <p>{userStatus.pointsToNext} pontos para {userStatus.nextLevel}</p>
                )}
              </div>

              <div className="progress-section">
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${userStatus.progressPercentage}%` }}
                  ></div>
                </div>
                <span className="progress-text">{userStatus.progressPercentage}%</span>
              </div>

              <div className="level-benefits">
                <h5>Benefícios Ativos:</h5>
                <ul>
                  {userStatus.levelData?.benefits?.map((benefit, index) => (
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
              <Activity className="w-5 h-5" />
              Atividade Recente
            </h3>
          </div>
          <div className="card-body">
            <div className="activity-list">
              {recentActivity.slice(0, 5).map((activity) => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-icon">
                    <Plus className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="activity-content">
                    <h4>+{activity.points} pontos</h4>
                    <p>{activity.description}</p>
                    <span className="activity-time">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title">
              <Target className="w-5 h-5" />
              Próximas Metas
            </h3>
          </div>
          <div className="card-body">
            <div className="goals-list">
              <div className="goal-item">
                <Star className="w-4 h-4 text-yellow-600" />
                <div className="goal-content">
                  <h4>Próximo Nível</h4>
                  <p>{userStatus.pointsToNext} pontos restantes</p>
                  <div className="goal-progress">
                    <div 
                      className="goal-fill"
                      style={{ width: `${userStatus.progressPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="goal-item">
                <Trophy className="w-4 h-4 text-orange-600" />
                <div className="goal-content">
                  <h4>Conquista Próxima</h4>
                  <p>Mestre das Indicações</p>
                  <div className="goal-progress">
                    <div 
                      className="goal-fill"
                      style={{ width: '30%' }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="main-content">
        <div className="page-header">
          <h1 className="page-title">
            <Award className="w-8 h-8 text-yellow-600" />
            Shield Rewards
          </h1>
          <p className="page-subtitle">Sistema de recompensas e gamificação inteligente</p>
        </div>

        {/* Tabs de Navegação */}
        <div className="rewards-tabs">
          <button 
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <BarChart3 className="w-4 h-4" />
            Visão Geral
          </button>
          <button 
            className={`tab-btn ${activeTab === 'rewards' ? 'active' : ''}`}
            onClick={() => setActiveTab('rewards')}
          >
            <Gift className="w-4 h-4" />
            Recompensas
          </button>
          <button 
            className={`tab-btn ${activeTab === 'achievements' ? 'active' : ''}`}
            onClick={() => setActiveTab('achievements')}
          >
            <Trophy className="w-4 h-4" />
            Conquistas
          </button>
          <button 
            className={`tab-btn ${activeTab === 'leaderboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('leaderboard')}
          >
            <Medal className="w-4 h-4" />
            Ranking
          </button>
        </div>

        {/* Conteúdo das Tabs */}
        {activeTab === 'overview' && (
          <OverviewTab 
            userStatus={userStatus}
            recentActivity={recentActivity}
            getLevelColor={getLevelColor}
          />
        )}

        {activeTab === 'rewards' && (
          <RewardsTab 
            availableRewards={availableRewards}
            userStatus={userStatus}
            getCategoryIcon={getCategoryIcon}
            onSelectReward={(reward) => {
              setSelectedReward(reward);
              setShowRedeemModal(true);
            }}
          />
        )}

        {activeTab === 'achievements' && (
          <AchievementsTab 
            achievements={achievements}
            getAchievementIcon={getAchievementIcon}
          />
        )}

        {activeTab === 'leaderboard' && (
          <LeaderboardTab 
            leaderboard={leaderboard}
            getLevelColor={getLevelColor}
          />
        )}
      </main>

      {/* Sidebar Direita - Estatísticas e Insights */}
      <aside className="sidebar-right">
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title">
              <Sparkles className="w-5 h-5" />
              Estatísticas Pessoais
            </h3>
          </div>
          <div className="card-body">
            <div className="personal-stats">
              <div className="stat-item">
                <div className="stat-icon">
                  <Star className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="stat-info">
                  <h4>{userStatus.totalPoints}</h4>
                  <p>Pontos Totais</p>
                </div>
              </div>

              <div className="stat-item">
                <div className="stat-icon">
                  <Trophy className="w-5 h-5 text-orange-600" />
                </div>
                <div className="stat-info">
                  <h4>{achievements.filter(a => a.unlocked).length}</h4>
                  <p>Conquistas Desbloqueadas</p>
                </div>
              </div>

              <div className="stat-item">
                <div className="stat-icon">
                  <Gift className="w-5 h-5 text-purple-600" />
                </div>
                <div className="stat-info">
                  <h4>5</h4>
                  <p>Recompensas Resgatadas</p>
                </div>
              </div>

              <div className="stat-item">
                <div className="stat-icon">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div className="stat-info">
                  <h4>4º</h4>
                  <p>Posição no Ranking</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title">
              <Flame className="w-5 h-5" />
              Sequências Ativas
            </h3>
          </div>
          <div className="card-body">
            <div className="streaks-list">
              <div className="streak-item">
                <Flame className="w-5 h-5 text-orange-600" />
                <div className="streak-content">
                  <h4>Sem Sinistros</h4>
                  <p>15 dias consecutivos</p>
                  <div className="streak-progress">
                    <div className="streak-fill" style={{ width: '50%' }}></div>
                  </div>
                  <span className="streak-target">Meta: 30 dias</span>
                </div>
              </div>

              <div className="streak-item">
                <Star className="w-5 h-5 text-yellow-600" />
                <div className="streak-content">
                  <h4>Avaliações 5 Estrelas</h4>
                  <p>3 consecutivas</p>
                  <div className="streak-progress">
                    <div className="streak-fill" style={{ width: '60%' }}></div>
                  </div>
                  <span className="streak-target">Meta: 5 consecutivas</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title">
              <Zap className="w-5 h-5" />
              Dicas para Ganhar Pontos
            </h3>
          </div>
          <div className="card-body">
            <div className="tips-list">
              <div className="tip-item">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <div className="tip-content">
                  <h4>Complete Serviços</h4>
                  <p>+10 pontos por serviço concluído</p>
                </div>
              </div>

              <div className="tip-item">
                <Star className="w-4 h-4 text-yellow-600" />
                <div className="tip-content">
                  <h4>Receba 5 Estrelas</h4>
                  <p>+25 pontos por avaliação máxima</p>
                </div>
              </div>

              <div className="tip-item">
                <Users className="w-4 h-4 text-blue-600" />
                <div className="tip-content">
                  <h4>Indique Amigos</h4>
                  <p>+75 pontos por indicação</p>
                </div>
              </div>

              <div className="tip-item">
                <Shield className="w-4 h-4 text-purple-600" />
                <div className="tip-content">
                  <h4>Mês Sem Sinistros</h4>
                  <p>+50 pontos de bônus mensal</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Modal de Resgate */}
      {showRedeemModal && selectedReward && (
        <RedeemModal 
          reward={selectedReward}
          userPoints={userStatus.totalPoints}
          onClose={() => {
            setShowRedeemModal(false);
            setSelectedReward(null);
          }}
          onConfirm={() => redeemReward(selectedReward)}
        />
      )}
    </div>
  );
};

// Tab de Visão Geral
const OverviewTab = ({ userStatus, recentActivity, getLevelColor }) => {
  return (
    <div className="overview-content">
      {/* Cards de Status */}
      <div className="status-cards-grid">
        <div className="status-card level">
          <div className="card-icon" style={{ backgroundColor: getLevelColor(userStatus.currentLevel) }}>
            <Crown className="w-8 h-8 text-white" />
          </div>
          <div className="card-content">
            <h3>{userStatus.currentLevel?.toUpperCase()}</h3>
            <p>Nível Atual</p>
            <div className="card-progress">
              <div 
                className="progress-fill"
                style={{ width: `${userStatus.progressPercentage}%` }}
              ></div>
            </div>
            <span className="progress-text">{userStatus.progressPercentage}% para o próximo</span>
          </div>
        </div>

        <div className="status-card points">
          <div className="card-icon">
            <Star className="w-8 h-8 text-yellow-600" />
          </div>
          <div className="card-content">
            <h3>{userStatus.totalPoints}</h3>
            <p>Pontos Totais</p>
            <div className="card-trend positive">
              <TrendingUp className="w-4 h-4" />
              +175 este mês
            </div>
          </div>
        </div>

        <div className="status-card next-reward">
          <div className="card-icon">
            <Gift className="w-8 h-8 text-purple-600" />
          </div>
          <div className="card-content">
            <h3>Desconto 10%</h3>
            <p>Próxima Recompensa</p>
            <div className="card-info">
              <Coins className="w-4 h-4 text-green-600" />
              <span>100 pontos</span>
            </div>
          </div>
        </div>

        <div className="status-card achievements">
          <div className="card-icon">
            <Trophy className="w-8 h-8 text-orange-600" />
          </div>
          <div className="card-content">
            <h3>3/6</h3>
            <p>Conquistas</p>
            <div className="card-progress">
              <div className="progress-fill" style={{ width: '50%' }}></div>
            </div>
            <span className="progress-text">50% completo</span>
          </div>
        </div>
      </div>

      {/* Atividade Recente Detalhada */}
      <div className="detailed-activity-section">
        <div className="section-header">
          <h2>
            <Activity className="w-6 h-6 text-green-600" />
            Atividade Recente Detalhada
          </h2>
        </div>

        <div className="activity-timeline">
          {recentActivity.map((activity, index) => (
            <div key={activity.id} className="timeline-item">
              <div className="timeline-marker">
                <Plus className="w-4 h-4 text-green-600" />
              </div>
              <div className="timeline-content">
                <div className="timeline-header">
                  <h4>+{activity.points} pontos</h4>
                  <span className="timeline-date">
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <p>{activity.description}</p>
                <div className="timeline-meta">
                  <span className="service-type">{activity.serviceType}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Tab de Recompensas
const RewardsTab = ({ availableRewards, userStatus, getCategoryIcon, onSelectReward }) => {
  const [filterCategory, setFilterCategory] = useState('all');

  const filteredRewards = filterCategory === 'all' 
    ? availableRewards 
    : availableRewards.filter(reward => reward.category === filterCategory);

  return (
    <div className="rewards-content">
      {/* Filtros de Categoria */}
      <div className="category-filters">
        <button 
          className={`filter-btn ${filterCategory === 'all' ? 'active' : ''}`}
          onClick={() => setFilterCategory('all')}
        >
          Todas
        </button>
        <button 
          className={`filter-btn ${filterCategory === 'discount' ? 'active' : ''}`}
          onClick={() => setFilterCategory('discount')}
        >
          <Shield className="w-4 h-4" />
          Descontos
        </button>
        <button 
          className={`filter-btn ${filterCategory === 'service' ? 'active' : ''}`}
          onClick={() => setFilterCategory('service')}
        >
          <Zap className="w-4 h-4" />
          Serviços
        </button>
        <button 
          className={`filter-btn ${filterCategory === 'cashback' ? 'active' : ''}`}
          onClick={() => setFilterCategory('cashback')}
        >
          <Coins className="w-4 h-4" />
          Cashback
        </button>
        <button 
          className={`filter-btn ${filterCategory === 'exclusive' ? 'active' : ''}`}
          onClick={() => setFilterCategory('exclusive')}
        >
          <Rocket className="w-4 h-4" />
          Exclusivos
        </button>
      </div>

      {/* Grid de Recompensas */}
      <div className="rewards-grid">
        {filteredRewards.map((reward) => (
          <RewardCard 
            key={reward.id}
            reward={reward}
            userPoints={userStatus.totalPoints}
            getCategoryIcon={getCategoryIcon}
            onSelect={onSelectReward}
          />
        ))}
      </div>
    </div>
  );
};

// Tab de Conquistas
const AchievementsTab = ({ achievements, getAchievementIcon }) => {
  return (
    <div className="achievements-content">
      <div className="achievements-grid">
        {achievements.map((achievement) => (
          <AchievementCard 
            key={achievement.id}
            achievement={achievement}
            getAchievementIcon={getAchievementIcon}
          />
        ))}
      </div>
    </div>
  );
};

// Tab de Ranking
const LeaderboardTab = ({ leaderboard, getLevelColor }) => {
  return (
    <div className="leaderboard-content">
      <div className="leaderboard-header">
        <h2>
          <Medal className="w-6 h-6 text-yellow-600" />
          Ranking Shield Points
        </h2>
        <p>Top usuários do programa de recompensas</p>
      </div>

      <div className="leaderboard-list">
        {leaderboard.map((user) => (
          <LeaderboardItem 
            key={user.rank}
            user={user}
            getLevelColor={getLevelColor}
          />
        ))}
      </div>
    </div>
  );
};

// Componente Card de Recompensa
const RewardCard = ({ reward, userPoints, getCategoryIcon, onSelect }) => {
  const canAfford = userPoints >= reward.cost;
  const isAvailable = reward.available && canAfford;

  return (
    <div className={`reward-card ${!isAvailable ? 'disabled' : ''} ${reward.popular ? 'popular' : ''}`}>
      {reward.popular && (
        <div className="popular-badge">
          <Flame className="w-3 h-3" />
          Popular
        </div>
      )}

      <div className="reward-header">
        <div className="reward-icon">
          {getCategoryIcon(reward.category)}
        </div>
        <h4>{reward.name}</h4>
      </div>

      <div className="reward-description">
        <p>{reward.description}</p>
      </div>

      <div className="reward-cost">
        <div className="cost-display">
          <Coins className="w-4 h-4 text-yellow-600" />
          <span>{reward.cost} pontos</span>
        </div>
        {!canAfford && (
          <div className="insufficient-points">
            Faltam {reward.cost - userPoints} pontos
          </div>
        )}
      </div>

      <div className="reward-validity">
        <Calendar className="w-4 h-4 text-gray-500" />
        <span>Válido até {new Date(reward.validUntil).toLocaleDateString()}</span>
      </div>

      <div className="reward-actions">
        <button 
          onClick={() => onSelect(reward)}
          disabled={!isAvailable}
          className={`reward-btn ${isAvailable ? 'primary' : 'disabled'}`}
        >
          {!reward.available ? (
            <>
              <Lock className="w-4 h-4" />
              Bloqueado
            </>
          ) : !canAfford ? (
            <>
              <Coins className="w-4 h-4" />
              Pontos Insuficientes
            </>
          ) : (
            <>
              <Gift className="w-4 h-4" />
              Resgatar
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// Componente Card de Conquista
const AchievementCard = ({ achievement, getAchievementIcon }) => {
  return (
    <div className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}>
      <div className="achievement-icon">
        {getAchievementIcon(achievement.icon)}
      </div>

      <div className="achievement-content">
        <h4>{achievement.name}</h4>
        <p>{achievement.description}</p>

        {achievement.unlocked ? (
          <div className="achievement-unlocked">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span>Desbloqueada em {new Date(achievement.unlockedAt).toLocaleDateString()}</span>
          </div>
        ) : (
          <div className="achievement-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
              ></div>
            </div>
            <span>{achievement.progress}/{achievement.target}</span>
          </div>
        )}

        <div className="achievement-points">
          <Star className="w-4 h-4 text-yellow-600" />
          <span>{achievement.points} pontos</span>
        </div>
      </div>
    </div>
  );
};

// Componente Item do Ranking
const LeaderboardItem = ({ user, getLevelColor }) => {
  return (
    <div className={`leaderboard-item ${user.isUser ? 'current-user' : ''}`}>
      <div className="rank-display">
        {user.rank <= 3 ? (
          <div className={`rank-medal rank-${user.rank}`}>
            {user.rank === 1 && <Trophy className="w-5 h-5" />}
            {user.rank === 2 && <Medal className="w-5 h-5" />}
            {user.rank === 3 && <Award className="w-5 h-5" />}
          </div>
        ) : (
          <div className="rank-number">#{user.rank}</div>
        )}
      </div>

      <div className="user-info">
        <div className="user-avatar">{user.avatar}</div>
        <div className="user-details">
          <h4>{user.name}</h4>
          <div 
            className="user-level"
            style={{ color: getLevelColor(user.level) }}
          >
            {user.level.toUpperCase()}
          </div>
        </div>
      </div>

      <div className="user-points">
        <Star className="w-4 h-4 text-yellow-600" />
        <span>{user.points.toLocaleString()}</span>
      </div>
    </div>
  );
};

// Modal de Resgate
const RedeemModal = ({ reward, userPoints, onClose, onConfirm }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>
            <Gift className="w-5 h-5" />
            Confirmar Resgate
          </h3>
          <button onClick={onClose} className="modal-close">
            ×
          </button>
        </div>
        
        <div className="modal-body">
          <div className="reward-preview">
            <div className="reward-icon large">
              <Gift className="w-12 h-12 text-purple-600" />
            </div>
            <h4>{reward.name}</h4>
            <p>{reward.description}</p>
          </div>

          <div className="cost-breakdown">
            <div className="cost-item">
              <span>Custo da recompensa:</span>
              <span className="cost-value">
                <Coins className="w-4 h-4 text-yellow-600" />
                {reward.cost} pontos
              </span>
            </div>
            <div className="cost-item">
              <span>Seus pontos atuais:</span>
              <span className="points-value">
                <Star className="w-4 h-4 text-yellow-600" />
                {userPoints} pontos
              </span>
            </div>
            <div className="cost-item total">
              <span>Pontos após resgate:</span>
              <span className="remaining-value">
                <Star className="w-4 h-4 text-green-600" />
                {userPoints - reward.cost} pontos
              </span>
            </div>
          </div>

          <div className="validity-info">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span>Válido até {new Date(reward.validUntil).toLocaleDateString()}</span>
          </div>
        </div>
        
        <div className="modal-actions">
          <button onClick={onClose} className="btn-secondary">
            Cancelar
          </button>
          <button onClick={onConfirm} className="btn-primary">
            <Gift className="w-4 h-4" />
            Confirmar Resgate
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShieldRewards;

