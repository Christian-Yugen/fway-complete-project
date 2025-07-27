import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Briefcase, 
  Clock, 
  DollarSign, 
  MapPin, 
  Star, 
  Eye,
  Heart,
  MessageCircle,
  Send,
  Filter,
  Search,
  TrendingUp,
  Award,
  Users,
  Calendar,
  CheckCircle,
  AlertCircle,
  Zap,
  Target
} from 'lucide-react'

const ServiceFeed = () => {
  const navigate = useNavigate()
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('recent')

  // Mock data para serviços disponíveis
  const mockServices = [
    {
      id: 1,
      title: 'Consulta Cardiológica Domiciliar',
      description: 'Paciente idoso, 75 anos, necessita consulta cardiológica em casa. Histórico de hipertensão e diabetes.',
      category: 'cardiologia',
      budget: 250,
      urgency: 'medium',
      location: 'Vila Madalena, SP',
      distance: 3.2,
      postedBy: 'Maria Silva',
      postedAt: '2024-06-22T10:30:00Z',
      proposals: 8,
      views: 45,
      requirements: ['CRM ativo', 'Experiência com idosos', 'Equipamentos próprios'],
      preferredTime: '2024-06-25T14:00:00Z',
      estimatedDuration: 60,
      isUrgent: false,
      tags: ['domiciliar', 'idoso', 'cardiologia'],
      clientRating: 4.8,
      clientHistory: 12
    },
    {
      id: 2,
      title: 'Fisioterapia Pós-Cirúrgica',
      description: 'Recuperação de cirurgia no joelho. Preciso de fisioterapeuta especializado em ortopedia.',
      category: 'fisioterapia',
      budget: 180,
      urgency: 'high',
      location: 'Pinheiros, SP',
      distance: 5.1,
      postedBy: 'João Santos',
      postedAt: '2024-06-22T08:15:00Z',
      proposals: 15,
      views: 78,
      requirements: ['CREFITO ativo', 'Especialização em ortopedia', 'Experiência pós-cirúrgica'],
      preferredTime: '2024-06-23T09:00:00Z',
      estimatedDuration: 90,
      isUrgent: true,
      tags: ['pós-cirúrgica', 'joelho', 'ortopedia'],
      clientRating: 4.9,
      clientHistory: 8
    },
    {
      id: 3,
      title: 'Consulta Pediátrica de Rotina',
      description: 'Consulta de rotina para bebê de 6 meses. Primeira consulta com novo pediatra.',
      category: 'pediatria',
      budget: 200,
      urgency: 'low',
      location: 'Jardins, SP',
      distance: 7.8,
      postedBy: 'Ana Costa',
      postedAt: '2024-06-21T16:45:00Z',
      proposals: 12,
      views: 56,
      requirements: ['CRM ativo', 'Especialização em pediatria', 'Experiência com bebês'],
      preferredTime: '2024-06-28T10:30:00Z',
      estimatedDuration: 45,
      isUrgent: false,
      tags: ['bebê', 'rotina', 'pediatria'],
      clientRating: 4.7,
      clientHistory: 5
    },
    {
      id: 4,
      title: 'Atendimento Dermatológico Urgente',
      description: 'Aparecimento súbito de manchas na pele. Necessário atendimento dermatológico urgente.',
      category: 'dermatologia',
      budget: 300,
      urgency: 'high',
      location: 'Moema, SP',
      distance: 4.5,
      postedBy: 'Carlos Oliveira',
      postedAt: '2024-06-22T12:00:00Z',
      proposals: 6,
      views: 34,
      requirements: ['CRM ativo', 'Especialização em dermatologia', 'Disponibilidade imediata'],
      preferredTime: '2024-06-22T18:00:00Z',
      estimatedDuration: 30,
      isUrgent: true,
      tags: ['urgente', 'manchas', 'dermatologia'],
      clientRating: 4.6,
      clientHistory: 3
    },
    {
      id: 5,
      title: 'Home Care para Idoso',
      description: 'Cuidados domiciliares para idoso de 82 anos. Necessário enfermeiro especializado.',
      category: 'enfermagem',
      budget: 400,
      urgency: 'medium',
      location: 'Brooklin, SP',
      distance: 8.2,
      postedBy: 'Família Rodrigues',
      postedAt: '2024-06-21T14:20:00Z',
      proposals: 20,
      views: 89,
      requirements: ['COREN ativo', 'Experiência com idosos', 'Disponibilidade período integral'],
      preferredTime: '2024-06-24T08:00:00Z',
      estimatedDuration: 480,
      isUrgent: false,
      tags: ['home-care', 'idoso', 'período-integral'],
      clientRating: 4.9,
      clientHistory: 15
    }
  ]

  useEffect(() => {
    loadServices()
  }, [filter, sortBy])

  const loadServices = async () => {
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 800))
    
    let filteredServices = mockServices
    
    if (filter !== 'all') {
      filteredServices = filteredServices.filter(service => service.category === filter)
    }
    
    if (searchTerm) {
      filteredServices = filteredServices.filter(service => 
        service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }
    
    // Ordenação
    filteredServices.sort((a, b) => {
      switch (sortBy) {
        case 'budget':
          return b.budget - a.budget
        case 'distance':
          return a.distance - b.distance
        case 'proposals':
          return b.proposals - a.proposals
        case 'urgent':
          return b.isUrgent - a.isUrgent
        default:
          return new Date(b.postedAt) - new Date(a.postedAt)
      }
    })
    
    setServices(filteredServices)
    setLoading(false)
  }

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default: return 'text-green-600 bg-green-50 border-green-200'
    }
  }

  const getUrgencyText = (urgency) => {
    switch (urgency) {
      case 'high': return 'Urgente'
      case 'medium': return 'Moderada'
      default: return 'Baixa'
    }
  }

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'cardiologia': return '❤️'
      case 'pediatria': return '👶'
      case 'fisioterapia': return '🦴'
      case 'dermatologia': return '<Microscope size={16} />'
      case 'enfermagem': return '👩‍⚕️'
      default: return '<Building size={16} />'
    }
  }

  const formatTimeAgo = (date) => {
    const now = new Date()
    const posted = new Date(date)
    const diffInHours = Math.floor((now - posted) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Há poucos minutos'
    if (diffInHours < 24) return `Há ${diffInHours}h`
    return `Há ${Math.floor(diffInHours / 24)} dias`
  }

  const handleProposal = (serviceId) => {
    navigate(`/proposal/${serviceId}`)
  }

  return (
    <div className="content-container">
      {/* Sidebar Esquerda - Filtros */}
      <aside className="sidebar-left">
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <Filter size={20} className="text-blue-600" />
              Filtros
            </h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Categoria</label>
                <select 
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="all">Todas as categorias</option>
                  <option value="cardiologia">Cardiologia</option>
                  <option value="pediatria">Pediatria</option>
                  <option value="fisioterapia">Fisioterapia</option>
                  <option value="dermatologia">Dermatologia</option>
                  <option value="enfermagem">Enfermagem</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Ordenar por</label>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="recent">Mais recentes</option>
                  <option value="budget">Maior orçamento</option>
                  <option value="distance">Mais próximos</option>
                  <option value="proposals">Menos propostas</option>
                  <option value="urgent">Mais urgentes</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Buscar</label>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar serviços..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title">Estatísticas</h3>
          </div>
          <div className="card-body">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Serviços ativos</span>
                <span className="font-semibold">{services.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Orçamento médio</span>
                <span className="font-semibold">
                  R$ {services.length > 0 
                    ? Math.round(services.reduce((sum, s) => sum + s.budget, 0) / services.length)
                    : 0
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Urgentes</span>
                <span className="font-semibold text-red-600">
                  {services.filter(s => s.urgency === 'high').length}
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
                  <Briefcase size={24} className="text-blue-600" />
                  Feed de Serviços Disponíveis
                </h1>
                <p className="card-subtitle">
                  Encontre oportunidades de trabalho e envie suas propostas
                </p>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp size={20} className="text-green-500" />
                <span className="text-sm font-medium">{services.length} serviços ativos</span>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="card-professional">
            <div className="card-body">
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <h3 className="text-lg font-semibold mb-2">Carregando serviços...</h3>
                <p className="text-gray-600">Buscando as melhores oportunidades para você</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {services.map((service) => (
              <div key={service.id} className="card-professional">
                <div className="card-body">
                  <div className="flex items-start gap-4">
                    {/* Categoria Icon */}
                    <div className="text-3xl">
                      {getCategoryIcon(service.category)}
                    </div>

                    {/* Conteúdo Principal */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold">{service.title}</h3>
                            {service.isUrgent && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                                <Zap size={12} />
                                URGENTE
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 mb-3">{service.description}</p>
                          
                          {/* Tags */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            {service.tags.map((tag, index) => (
                              <span 
                                key={index}
                                className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>

                          {/* Requisitos */}
                          <div className="mb-3">
                            <div className="text-sm font-medium mb-1">Requisitos:</div>
                            <div className="flex flex-wrap gap-2">
                              {service.requirements.map((req, index) => (
                                <span 
                                  key={index}
                                  className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs"
                                >
                                  <CheckCircle size={12} />
                                  {req}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Urgência e Orçamento */}
                        <div className="text-right ml-4">
                          <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getUrgencyColor(service.urgency)}`}>
                            <AlertCircle size={14} />
                            {getUrgencyText(service.urgency)}
                          </div>
                          <div className="text-2xl font-bold text-green-600 mt-2">
                            R$ {service.budget}
                          </div>
                          <div className="text-xs text-gray-500">
                            {service.estimatedDuration} min
                          </div>
                        </div>
                      </div>

                      {/* Informações do Cliente e Localização */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Users size={14} />
                            <span>{service.postedBy}</span>
                            <div className="flex items-center gap-1 ml-2">
                              <Star size={12} className="text-yellow-500 fill-current" />
                              <span>{service.clientRating}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin size={14} />
                            <span>{service.location} ({service.distance}km)</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            <span>{new Date(service.preferredTime).toLocaleDateString('pt-BR')}</span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatTimeAgo(service.postedAt)}
                        </div>
                      </div>

                      {/* Estatísticas e Ações */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Eye size={14} />
                            <span>{service.views} visualizações</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle size={14} />
                            <span>{service.proposals} propostas</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Award size={14} />
                            <span>{service.clientHistory} serviços anteriores</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button className="btn-professional btn-outline flex items-center gap-2">
                            <Heart size={16} />
                            Salvar
                          </button>
                          <button 
                            onClick={() => handleProposal(service.id)}
                            className="btn-professional btn-primary flex items-center gap-2"
                          >
                            <Send size={16} />
                            Enviar Proposta
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

      {/* Sidebar Direita - Dicas e Insights */}
      <aside className="sidebar-right">
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <Target size={20} className="text-purple-600" />
              Dicas para Propostas
            </h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle size={16} className="text-blue-600" />
                  <span className="font-medium text-blue-800">Seja Específico</span>
                </div>
                <p className="text-sm text-blue-700">
                  Detalhe sua experiência e como você atenderá os requisitos
                </p>
              </div>

              <div className="p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={16} className="text-green-600" />
                  <span className="font-medium text-green-800">Responda Rápido</span>
                </div>
                <p className="text-sm text-green-700">
                  Propostas enviadas nas primeiras 2 horas têm 3x mais chance
                </p>
              </div>

              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign size={16} className="text-purple-600" />
                  <span className="font-medium text-purple-800">Preço Justo</span>
                </div>
                <p className="text-sm text-purple-700">
                  Considere o orçamento do cliente e justifique seu valor
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Suas Estatísticas */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title">Suas Estatísticas</h3>
          </div>
          <div className="card-body">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Propostas enviadas</span>
                <span className="font-semibold">23</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Taxa de aceitação</span>
                <span className="font-semibold text-green-600">65%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Tempo médio resposta</span>
                <span className="font-semibold">2.5h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avaliação média</span>
                <span className="font-semibold text-yellow-600">4.8 <Star size={16} /></span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}

export default ServiceFeed

