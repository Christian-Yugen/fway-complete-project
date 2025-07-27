import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Brain, 
  Star, 
  Clock, 
  MapPin, 
  Award, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Zap,
  Target,
  Users,
  Calendar,
  DollarSign,
  Filter
} from 'lucide-react'
import { getIntelligentMatches, generateMatchingExplanation } from '../utils/intelligentMatching'
import { mockProfessionals } from '../data/mockData'

const IntelligentMatching = () => {
  const navigate = useNavigate()
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [request, setRequest] = useState({
    specialty: 'cardiologia',
    preferredTime: new Date(),
    budget: 200,
    urgency: 'normal'
  })
  const [filters, setFilters] = useState({
    minRating: 4.0,
    maxDistance: 10,
    availability: 'any'
  })

  useEffect(() => {
    generateMatches()
  }, [request, filters])

  const generateMatches = async () => {
    setLoading(true)
    
    // Simula processamento do algoritmo
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const userHistory = {
      professionals: {
        1: { services: 3, avgRating: 4.8, lastService: '2024-05-15' },
        2: { services: 1, avgRating: 4.5, lastService: '2024-04-20' }
      }
    }
    
    const intelligentMatches = getIntelligentMatches(
      mockProfessionals.filter(p => p.profession === 'medico'),
      request,
      userHistory,
      8
    )
    
    setMatches(intelligentMatches)
    setLoading(false)
  }

  const getScoreColor = (score) => {
    if (score >= 85) return 'text-green-600 bg-green-50'
    if (score >= 70) return 'text-blue-600 bg-blue-50'
    if (score >= 55) return 'text-yellow-600 bg-yellow-50'
    return 'text-gray-600 bg-gray-50'
  }

  const getRecommendationIcon = (level) => {
    switch (level) {
      case 'excellent': return <CheckCircle className="text-green-500" size={20} />
      case 'very-good': return <TrendingUp className="text-blue-500" size={20} />
      case 'good': return <Target className="text-yellow-500" size={20} />
      default: return <AlertCircle className="text-gray-500" size={20} />
    }
  }

  const getRecommendationText = (level) => {
    switch (level) {
      case 'excellent': return 'Excelente Match'
      case 'very-good': return 'Muito Bom Match'
      case 'good': return 'Bom Match'
      case 'fair': return 'Match Razoável'
      default: return 'Match Básico'
    }
  }

  return (
    <div className="content-container">
      {/* Sidebar Esquerda - Filtros */}
      <aside className="sidebar-left">
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <Filter size={20} className="text-purple-600" />
              Configurações de Matching
            </h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Especialidade</label>
                <select 
                  value={request.specialty}
                  onChange={(e) => setRequest({...request, specialty: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="cardiologia">Cardiologia</option>
                  <option value="pediatria">Pediatria</option>
                  <option value="ortopedia">Ortopedia</option>
                  <option value="dermatologia">Dermatologia</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Orçamento Máximo</label>
                <input
                  type="range"
                  min="50"
                  max="500"
                  value={request.budget}
                  onChange={(e) => setRequest({...request, budget: parseInt(e.target.value)})}
                  className="w-full"
                />
                <div className="text-center text-sm text-gray-600 mt-1">
                  R$ {request.budget}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Urgência</label>
                <select 
                  value={request.urgency}
                  onChange={(e) => setRequest({...request, urgency: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="low">Baixa</option>
                  <option value="normal">Normal</option>
                  <option value="high">Alta</option>
                  <option value="emergency">Emergência</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Avaliação Mínima</label>
                <select 
                  value={filters.minRating}
                  onChange={(e) => setFilters({...filters, minRating: parseFloat(e.target.value)})}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="3.0">3.0+ estrelas</option>
                  <option value="3.5">3.5+ estrelas</option>
                  <option value="4.0">4.0+ estrelas</option>
                  <option value="4.5">4.5+ estrelas</option>
                </select>
              </div>

              <button 
                onClick={generateMatches}
                className="btn-professional btn-primary w-full flex items-center justify-center gap-2"
              >
                <Brain size={16} />
                Gerar Novos Matches
              </button>
            </div>
          </div>
        </div>

        {/* Métricas do Algoritmo */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title">Métricas do Matching</h3>
          </div>
          <div className="card-body">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Matches Encontrados</span>
                <span className="font-semibold">{matches.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Score Médio</span>
                <span className="font-semibold">
                  {matches.length > 0 
                    ? Math.round(matches.reduce((sum, m) => sum + m.matching.score, 0) / matches.length)
                    : 0
                  }%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Matches Excelentes</span>
                <span className="font-semibold text-green-600">
                  {matches.filter(m => m.matching.recommendation === 'excellent').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="content-main">
        <div className="card-professional">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="card-title flex items-center gap-2">
                  <Brain size={24} className="text-purple-600" />
                  Matching Inteligente
                </h1>
                <p className="card-subtitle">
                  Algoritmo avançado para encontrar os melhores profissionais para você
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Zap size={20} className="text-yellow-500" />
                <span className="text-sm font-medium">IA Ativa</span>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="card-professional">
            <div className="card-body">
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
                <h3 className="text-lg font-semibold mb-2">Processando Matching Inteligente</h3>
                <p className="text-gray-600 text-center">
                  Analisando disponibilidade, avaliações, experiência e compatibilidade...
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map((professional, index) => (
              <div key={professional.id} className="card-professional">
                <div className="card-body">
                  <div className="flex items-start gap-4">
                    {/* Avatar e Ranking */}
                    <div className="flex flex-col items-center">
                      <div className="relative">
                        <div className="profile-avatar-large">
                          {professional.avatar ? (
                            <img 
                              src={professional.avatar} 
                              alt={professional.name}
                              className="profile-image"
                            />
                          ) : (
                            <div className="profile-fallback">
                              {professional.name.split(' ').map(n => n[0]).join('')}
                            </div>
                          )}
                        </div>
                        <div className="absolute -top-2 -right-2 bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                          #{index + 1}
                        </div>
                      </div>
                    </div>

                    {/* Informações do Profissional */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-semibold">{professional.name}</h3>
                          <p className="text-gray-600">{professional.specialty}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-1">
                              <Star size={16} className="text-yellow-500 fill-current" />
                              <span className="font-medium">{professional.rating}</span>
                              <span className="text-gray-500">({professional.reviews} avaliações)</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin size={16} className="text-gray-500" />
                              <span className="text-gray-600">{professional.distance}km</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Award size={16} className="text-gray-500" />
                              <span className="text-gray-600">{professional.experience} anos</span>
                            </div>
                          </div>
                        </div>

                        {/* Score de Matching */}
                        <div className="text-right">
                          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(professional.matching.score)}`}>
                            {getRecommendationIcon(professional.matching.recommendation)}
                            {professional.matching.score}% Match
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {getRecommendationText(professional.matching.recommendation)}
                          </div>
                        </div>
                      </div>

                      {/* Breakdown do Score */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                        <div className="text-center">
                          <div className="text-xs text-gray-500">Disponibilidade</div>
                          <div className="font-semibold text-green-600">
                            {professional.matching.breakdown.availability}%
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-500">Avaliações</div>
                          <div className="font-semibold text-blue-600">
                            {professional.matching.breakdown.rating}%
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-500">Experiência</div>
                          <div className="font-semibold text-purple-600">
                            {professional.matching.breakdown.experience}%
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-500">Proximidade</div>
                          <div className="font-semibold text-orange-600">
                            {professional.matching.breakdown.distance}%
                          </div>
                        </div>
                      </div>

                      {/* Razões do Match */}
                      <div className="mb-4">
                        <div className="text-sm font-medium mb-2">Por que este profissional é recomendado:</div>
                        <div className="flex flex-wrap gap-2">
                          {generateMatchingExplanation(professional, professional.matching).map((reason, idx) => (
                            <span 
                              key={idx}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs"
                            >
                              <CheckCircle size={12} />
                              {reason}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Informações Adicionais */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock size={14} />
                            <span>~{professional.matching.estimatedTime} min</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign size={14} />
                            <span>R$ {professional.price}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Target size={14} />
                            <span>{professional.matching.confidence}% confiança</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button 
                            onClick={() => navigate(`/professional/${professional.id}`)}
                            className="btn-professional btn-outline"
                          >
                            Ver Perfil
                          </button>
                          <button 
                            onClick={() => navigate(`/booking/${professional.id}`)}
                            className="btn-professional btn-primary"
                          >
                            Agendar Agora
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Sidebar Direita - Insights */}
      <aside className="sidebar-right">
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <TrendingUp size={20} className="text-green-600" />
              Insights do Matching
            </h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Users size={16} className="text-blue-600" />
                  <span className="font-medium text-blue-800">Dica Inteligente</span>
                </div>
                <p className="text-sm text-blue-700">
                  Profissionais com 90%+ de match têm 85% mais chance de satisfação
                </p>
              </div>

              <div className="p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar size={16} className="text-green-600" />
                  <span className="font-medium text-green-800">Melhor Horário</span>
                </div>
                <p className="text-sm text-green-700">
                  Agendamentos entre 9h-11h têm maior disponibilidade
                </p>
              </div>

              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Brain size={16} className="text-purple-600" />
                  <span className="font-medium text-purple-800">IA Learning</span>
                </div>
                <p className="text-sm text-purple-700">
                  O algoritmo aprende com suas escolhas para melhorar futuras recomendações
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Histórico de Matches */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title">Histórico de Matches</h3>
          </div>
          <div className="card-body">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Último match</span>
                <span className="text-xs text-gray-500">Há 2 dias</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Taxa de sucesso</span>
                <span className="text-sm font-semibold text-green-600">92%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Matches realizados</span>
                <span className="text-sm font-semibold">47</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}

export default IntelligentMatching

