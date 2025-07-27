import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Trophy, 
  Star, 
  Award, 
  Target, 
  Zap,
  Crown,
  Medal,
  Gift,
  TrendingUp,
  Users,
  Calendar,
  CheckCircle,
  Lock,
  Unlock,
  Flame,
  Diamond,
  Shield,
  Heart,
  Clock,
  DollarSign,
  BarChart3,
  ArrowUp,
  ArrowRight,
  Sparkles,
  Gem
} from 'lucide-react'

const RewardsSystem = () => {
  const navigate = useNavigate()
  const [currentLevel, setCurrentLevel] = useState('gold')
  const [currentPoints, setCurrentPoints] = useState(2850)
  const [achievements, setAchievements] = useState([])
  const [recentRewards, setRecentRewards] = useState([])

  // Sistema de níveis
  const levels = [
    {
      id: 'bronze',
      name: 'Bronze',
      icon: Medal,
      color: 'text-orange-600 bg-orange-50',
      borderColor: 'border-orange-200',
      minPoints: 0,
      maxPoints: 999,
      benefits: [
        'Acesso básico à plataforma',
        'Suporte por email',
        'Perfil básico'
      ],
      badge: '🥉'
    },
    {
      id: 'silver',
      name: 'Prata',
      icon: Award,
      color: 'text-gray-600 bg-gray-50',
      borderColor: 'border-gray-200',
      minPoints: 1000,
      maxPoints: 2499,
      benefits: [
        'Destaque no perfil',
        'Suporte prioritário',
        'Acesso a estatísticas básicas',
        'Badge de verificação'
      ],
      badge: '🥈'
    },
    {
      id: 'gold',
      name: 'Ouro',
      icon: Crown,
      color: 'text-yellow-600 bg-yellow-50',
      borderColor: 'border-yellow-200',
      minPoints: 2500,
      maxPoints: 4999,
      benefits: [
        'Perfil premium destacado',
        'Suporte VIP 24/7',
        'Dashboard avançado',
        'Matching prioritário',
        'Comissão reduzida (8%)'
      ],
      badge: '🥇'
    },
    {
      id: 'elite',
      name: 'Elite',
      icon: Diamond,
      color: 'text-purple-600 bg-purple-50',
      borderColor: 'border-purple-200',
      minPoints: 5000,
      maxPoints: 9999,
      benefits: [
        'Perfil VIP exclusivo',
        'Gerente de conta dedicado',
        'Analytics premium',
        'Acesso antecipado a recursos',
        'Comissão mínima (5%)',
        'Eventos exclusivos'
      ],
      badge: '<Gem size={16} />'
    }
  ]

  // Conquistas disponíveis
  const allAchievements = [
    {
      id: 'first_service',
      title: 'Primeiro Serviço',
      description: 'Complete seu primeiro atendimento',
      icon: CheckCircle,
      points: 50,
      unlocked: true,
      category: 'milestone'
    },
    {
      id: 'perfect_week',
      title: 'Semana Perfeita',
      description: 'Mantenha 5.0 de avaliação por uma semana',
      icon: Star,
      points: 200,
      unlocked: true,
      category: 'quality'
    },
    {
      id: 'speed_demon',
      title: 'Velocidade da Luz',
      description: 'Complete 10 atendimentos em menos de 1 hora',
      icon: Zap,
      points: 150,
      unlocked: true,
      category: 'efficiency'
    },
    {
      id: 'loyal_clients',
      title: 'Cliente Fiel',
      description: 'Tenha 5 clientes que retornaram',
      icon: Heart,
      points: 300,
      unlocked: false,
      category: 'loyalty'
    },
    {
      id: 'century_club',
      title: 'Clube dos 100',
      description: 'Complete 100 atendimentos',
      icon: Trophy,
      points: 500,
      unlocked: false,
      category: 'milestone'
    },
    {
      id: 'early_bird',
      title: 'Madrugador',
      description: 'Complete 20 atendimentos antes das 8h',
      icon: Clock,
      points: 100,
      unlocked: true,
      category: 'schedule'
    },
    {
      id: 'money_maker',
      title: 'Gerador de Renda',
      description: 'Ganhe R$ 10.000 em um mês',
      icon: DollarSign,
      points: 400,
      unlocked: false,
      category: 'earnings'
    },
    {
      id: 'specialist',
      title: 'Especialista',
      description: 'Complete verificação profissional completa',
      icon: Shield,
      points: 250,
      unlocked: true,
      category: 'verification'
    }
  ]

  // Recompensas recentes
  const mockRecentRewards = [
    {
      id: 1,
      type: 'achievement',
      title: 'Conquista desbloqueada: Especialista',
      points: 250,
      date: '2024-06-22T10:30:00Z',
      icon: Shield
    },
    {
      id: 2,
      type: 'bonus',
      title: 'Bônus de qualidade - Avaliação 5.0',
      points: 50,
      date: '2024-06-21T15:45:00Z',
      icon: Star
    },
    {
      id: 3,
      type: 'streak',
      title: 'Sequência de 7 dias ativos',
      points: 100,
      date: '2024-06-20T09:15:00Z',
      icon: Flame
    }
  ]

  useEffect(() => {
    setAchievements(allAchievements)
    setRecentRewards(mockRecentRewards)
  }, [])

  const getCurrentLevel = () => {
    return levels.find(level => 
      currentPoints >= level.minPoints && currentPoints <= level.maxPoints
    ) || levels[0]
  }

  const getNextLevel = () => {
    const current = getCurrentLevel()
    const currentIndex = levels.findIndex(l => l.id === current.id)
    return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null
  }

  const getProgressToNextLevel = () => {
    const current = getCurrentLevel()
    const next = getNextLevel()
    
    if (!next) return 100
    
    const progress = ((currentPoints - current.minPoints) / (next.minPoints - current.minPoints)) * 100
    return Math.min(progress, 100)
  }

  const getPointsToNextLevel = () => {
    const next = getNextLevel()
    return next ? next.minPoints - currentPoints : 0
  }

  const getCategoryIcon = (category) => {
    const icons = {
      milestone: Trophy,
      quality: Star,
      efficiency: Zap,
      loyalty: Heart,
      schedule: Clock,
      earnings: DollarSign,
      verification: Shield
    }
    return icons[category] || Trophy
  }

  const getCategoryColor = (category) => {
    const colors = {
      milestone: 'text-purple-600 bg-purple-50',
      quality: 'text-yellow-600 bg-yellow-50',
      efficiency: 'text-blue-600 bg-blue-50',
      loyalty: 'text-red-600 bg-red-50',
      schedule: 'text-green-600 bg-green-50',
      earnings: 'text-emerald-600 bg-emerald-50',
      verification: 'text-indigo-600 bg-indigo-50'
    }
    return colors[category] || 'text-gray-600 bg-gray-50'
  }

  const formatTimeAgo = (date) => {
    const now = new Date()
    const past = new Date(date)
    const diffInHours = Math.floor((now - past) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Há poucos minutos'
    if (diffInHours < 24) return `Há ${diffInHours}h`
    return `Há ${Math.floor(diffInHours / 24)} dias`
  }

  const currentLevelData = getCurrentLevel()
  const nextLevelData = getNextLevel()

  return (
    <div className="content-container">
      {/* Sidebar Esquerda - Nível Atual */}
      <aside className="sidebar-left">
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <Trophy size={20} className="text-yellow-600" />
              Seu Nível
            </h3>
          </div>
          <div className="card-body">
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full text-4xl mb-3 ${currentLevelData.color} border-2 ${currentLevelData.borderColor}`}>
                {currentLevelData.badge}
              </div>
              <h3 className="text-xl font-bold mb-1">{currentLevelData.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{currentPoints} pontos</p>
              
              {nextLevelData && (
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progresso para {nextLevelData.name}</span>
                    <span>{Math.round(getProgressToNextLevel())}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${getProgressToNextLevel()}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500">
                    {getPointsToNextLevel()} pontos para o próximo nível
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Benefícios do Nível */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title">Benefícios Ativos</h3>
          </div>
          <div className="card-body">
            <div className="space-y-2">
              {currentLevelData.benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500" />
                  <span className="text-sm">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Próximos Benefícios */}
        {nextLevelData && (
          <div className="card-professional">
            <div className="card-header">
              <h3 className="card-title flex items-center gap-2">
                <ArrowUp size={20} className="text-blue-600" />
                Próximos Benefícios
              </h3>
            </div>
            <div className="card-body">
              <div className="space-y-2">
                {nextLevelData.benefits.slice(currentLevelData.benefits.length).map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Lock size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-600">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Conteúdo Principal */}
      <main className="content-main">
        <div className="card-professional">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="card-title flex items-center gap-2">
                  <Award size={24} className="text-purple-600" />
                  Sistema de Recompensas
                </h1>
                <p className="card-subtitle">
                  Ganhe pontos, desbloqueie conquistas e suba de nível
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles size={20} className="text-yellow-500" />
                <span className="text-sm font-medium">Nível {currentLevelData.name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Todos os Níveis */}
        <div className="card-professional">
          <div className="card-header">
            <h2 className="card-title">Níveis Disponíveis</h2>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {levels.map((level, index) => {
                const isCurrentLevel = level.id === currentLevelData.id
                const isUnlocked = currentPoints >= level.minPoints
                
                return (
                  <div 
                    key={level.id}
                    className={`relative p-4 rounded-lg border-2 transition-all ${
                      isCurrentLevel 
                        ? `${level.color} ${level.borderColor} ring-2 ring-blue-300` 
                        : isUnlocked 
                          ? `${level.color} ${level.borderColor}` 
                          : 'bg-gray-50 border-gray-200 opacity-60'
                    }`}
                  >
                    {isCurrentLevel && (
                      <div className="absolute -top-2 -right-2 bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                        ✓
                      </div>
                    )}
                    
                    <div className="text-center">
                      <div className="text-3xl mb-2">{level.badge}</div>
                      <h3 className="font-bold text-lg mb-1">{level.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {level.minPoints} - {level.maxPoints === 9999 ? '∞' : level.maxPoints} pts
                      </p>
                      
                      <div className="space-y-1">
                        {level.benefits.slice(0, 3).map((benefit, idx) => (
                          <div key={idx} className="flex items-center gap-1 text-xs">
                            {isUnlocked ? (
                              <CheckCircle size={12} className="text-green-500" />
                            ) : (
                              <Lock size={12} className="text-gray-400" />
                            )}
                            <span className={isUnlocked ? '' : 'text-gray-500'}>
                              {benefit}
                            </span>
                          </div>
                        ))}
                        {level.benefits.length > 3 && (
                          <div className="text-xs text-gray-500">
                            +{level.benefits.length - 3} mais benefícios
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Conquistas */}
        <div className="card-professional">
          <div className="card-header">
            <h2 className="card-title flex items-center gap-2">
              <Target size={20} className="text-green-600" />
              Conquistas
            </h2>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((achievement) => {
                const IconComponent = achievement.icon
                const categoryColor = getCategoryColor(achievement.category)
                
                return (
                  <div 
                    key={achievement.id}
                    className={`p-4 rounded-lg border transition-all ${
                      achievement.unlocked 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-gray-200 bg-gray-50 opacity-70'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full ${categoryColor}`}>
                        <IconComponent size={20} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-sm">{achievement.title}</h3>
                          {achievement.unlocked ? (
                            <CheckCircle size={16} className="text-green-500" />
                          ) : (
                            <Lock size={16} className="text-gray-400" />
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mb-2">
                          {achievement.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-blue-600">
                            +{achievement.points} pontos
                          </span>
                          <span className="text-xs text-gray-500 capitalize">
                            {achievement.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Sidebar Direita - Atividade Recente */}
      <aside className="sidebar-right">
        {/* Recompensas Recentes */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <Gift size={20} className="text-purple-600" />
              Atividade Recente
            </h3>
          </div>
          <div className="card-body">
            <div className="space-y-3">
              {recentRewards.map((reward) => {
                const IconComponent = reward.icon
                
                return (
                  <div key={reward.id} className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <IconComponent size={16} className="text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{reward.title}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-blue-600 font-medium">
                          +{reward.points} pts
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(reward.date)}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title">Suas Estatísticas</h3>
          </div>
          <div className="card-body">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total de pontos</span>
                <span className="font-semibold">{currentPoints.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Conquistas desbloqueadas</span>
                <span className="font-semibold">
                  {achievements.filter(a => a.unlocked).length}/{achievements.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Posição no ranking</span>
                <span className="font-semibold text-yellow-600">#47</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Pontos esta semana</span>
                <span className="font-semibold text-green-600">+420</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dicas para Ganhar Pontos */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title">Como Ganhar Pontos</h3>
          </div>
          <div className="card-body">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Star size={16} className="text-yellow-500" />
                <span className="text-sm">Mantenha avaliação alta (+50 pts)</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-blue-500" />
                <span className="text-sm">Complete serviços rapidamente (+25 pts)</span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={16} className="text-green-500" />
                <span className="text-sm">Conquiste clientes fiéis (+100 pts)</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-purple-500" />
                <span className="text-sm">Mantenha sequência diária (+20 pts/dia)</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}

export default RewardsSystem

