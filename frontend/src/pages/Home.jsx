import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { mockProfessionals } from '../data/mockData'
import ProfessionalMap from '../components/ProfessionalMap'
import { 
  Home as HomeIcon,
  Activity,
  MessageCircle,
  FileText,
  RotateCcw,
  Zap,
  Star,
  FileCheck,
  BarChart3,
  Search,
  Plus,
  MapPin,
  Stethoscope,
  Users,
  UserCheck,
  Heart,
  Baby,
  Bone,
  Droplets,
  User,
  Map,
  List,
  Navigation
} from 'lucide-react'

const Home = () => {
  const navigate = useNavigate()
  const [professionals, setProfessionals] = useState([])
  const [filteredProfessionals, setFilteredProfessionals] = useState([])
  const [activeFilter, setActiveFilter] = useState('todos')
  const [viewMode, setViewMode] = useState('list') // 'list' ou 'map'
  const [locationEnabled, setLocationEnabled] = useState(false)

  useEffect(() => {
    setProfessionals(mockProfessionals)
    setFilteredProfessionals(mockProfessionals)
  }, [])

  const handleFilter = (filter) => {
    setActiveFilter(filter)
    if (filter === 'todos') {
      setFilteredProfessionals(professionals)
    } else {
      const filtered = professionals.filter(prof => prof.profession === filter)
      setFilteredProfessionals(filtered)
    }
  }

  const handleLocationRequest = () => {
    setLocationEnabled(true)
    setViewMode('map')
  }

  const handleProfessionalSelect = (professional) => {
    navigate(`/professional/${professional.id}`)
  }

  const getFilterCount = (filter) => {
    if (filter === 'todos') return professionals.length
    return professionals.filter(prof => prof.profession === filter).length
  }

  const getProfessionLabel = (profession) => {
    switch (profession) {
      case 'medico': return 'Dr(a).'
      case 'enfermeiro': return 'Enf.'
      case 'fisioterapeuta': return 'Dr(a).'
      default: return ''
    }
  }

  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} size={16} className="text-yellow-500 fill-current" />)
    }
    if (hasHalfStar) {
      stars.push(<Star key="half" size={16} className="text-yellow-500 fill-current" />)
    }
    return stars
  }

  return (
    <div className="content-container">
      {/* Sidebar Esquerda - Perfil do Usuário */}
      <aside className="sidebar-left">
        <div className="card-professional profile-card">
          <div className="card-body">
            <div className="profile-avatar-large">
              <div className="profile-fallback">U</div>
            </div>
            <h3 className="profile-name">Usuário</h3>
            <p className="profile-title">Paciente</p>
            <div className="profile-stats">
              <div className="profile-stat">
                <span className="profile-stat-number">12</span>
                <span className="profile-stat-label">Consultas</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat-number">8</span>
                <span className="profile-stat-label">Conexões</span>
              </div>
            </div>
          </div>
        </div>

        {/* Seção de Serviços Especializados */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <Stethoscope size={20} className="text-blue-600" />
              Serviços Especializados
            </h3>
          </div>
          <div className="card-body">
            <nav className="flex flex-col gap-sm">
              <Link 
                to="/homecare-booking" 
                className="header-nav-item text-left"
                style={{background: '#f0f8ff', borderColor: '#0a66c2', color: '#0a66c2'}}
              >
                <span className="header-nav-icon">
                  <HomeIcon size={18} />
                </span>
                <span className="header-nav-text">Agendar Home Care</span>
              </Link>
              <Link 
                to="/physiotherapy-booking" 
                className="header-nav-item text-left"
                style={{background: '#f0fff0', borderColor: '#057642', color: '#057642'}}
              >
                <span className="header-nav-icon">
                  <Activity size={18} />
                </span>
                <span className="header-nav-text">Agendar Fisioterapia</span>
              </Link>
            </nav>
          </div>
        </div>

        {/* Sistema de Negociação */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <FileCheck size={20} className="text-purple-600" />
              Sistema de Negociação Completo
            </h3>
          </div>
          <div className="card-body">
            <nav className="flex flex-col gap-sm">
              <Link 
                to="/intelligent-triage" 
                className="header-nav-item text-left"
                style={{background: '#e3f2fd', borderColor: '#2196f3', color: '#2196f3'}}
              >
                <span className="header-nav-icon">
                  <Search size={18} />
                </span>
                <span className="header-nav-text">Triagem Inteligente</span>
              </Link>
              <Link 
                to="/professional-chat" 
                className="header-nav-item text-left"
                style={{background: '#e8f5e8', borderColor: '#4caf50', color: '#4caf50'}}
              >
                <span className="header-nav-icon">
                  <MessageCircle size={18} />
                </span>
                <span className="header-nav-text">Chat com IA</span>
              </Link>
              <Link 
                to="/custom-plan" 
                className="header-nav-item text-left"
                style={{background: '#fff3e0', borderColor: '#ff9800', color: '#ff9800'}}
              >
                <span className="header-nav-icon">
                  <FileText size={18} />
                </span>
                <span className="header-nav-text">Planos Customizados</span>
              </Link>
              <Link 
                to="/negotiation-versions" 
                className="header-nav-item text-left"
                style={{background: '#f3e5f5', borderColor: '#9c27b0', color: '#9c27b0'}}
              >
                <span className="header-nav-icon">
                  <RotateCcw size={18} />
                </span>
                <span className="header-nav-text">Negociação Avançada</span>
              </Link>
              <Link 
                to="/escrow-payment" 
                className="header-nav-item text-left"
                style={{background: '#e8f5e8', borderColor: '#4caf50', color: '#4caf50'}}
              >
                <span className="header-nav-icon">
                  <Zap size={18} />
                </span>
                <span className="header-nav-text">Escrow & GPS</span>
              </Link>
              <Link 
                to="/service-review" 
                className="header-nav-item text-left"
                style={{background: '#e3f2fd', borderColor: '#2196f3', color: '#2196f3'}}
              >
                <span className="header-nav-icon">
                  <Star size={18} />
                </span>
                <span className="header-nav-text">Avaliações & Dashboard</span>
              </Link>
              <Link 
                to="/advanced-extras" 
                className="header-nav-item text-left"
                style={{background: '#f3e5f5', borderColor: '#9c27b0', color: '#9c27b0'}}
              >
                <span className="header-nav-icon">
                  <FileCheck size={18} />
                </span>
                <span className="header-nav-text">PDFs, IA & Recibos</span>
              </Link>
            </nav>
          </div>
        </div>

        {/* Menu de Navegação Rápida */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title">Acesso Rápido</h3>
          </div>
          <div className="card-body">
            <nav className="flex flex-col gap-sm">
              <Link to="/dashboard" className="header-nav-item text-left">
                <span className="header-nav-icon">
                  <BarChart3 size={18} />
                </span>
                <span className="header-nav-text">Dashboard</span>
              </Link>
              <Link to="/search" className="header-nav-item text-left">
                <span className="header-nav-icon">
                  <Search size={18} />
                </span>
                <span className="header-nav-text">Busca Avançada</span>
              </Link>
              <Link to="/create-service" className="header-nav-item text-left">
                <span className="header-nav-icon">
                  <Plus size={18} />
                </span>
                <span className="header-nav-text">Criar Serviço</span>
              </Link>
            </nav>
          </div>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="content-main">
        {/* Banner de Localização e Controles */}
        <div className="card-professional">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="card-title flex items-center gap-2">
                  <Navigation size={20} className="text-blue-500" />
                  {locationEnabled ? 'Localização Ativada' : 'Ative sua localização'}
                </h2>
                <p className="card-subtitle">
                  {locationEnabled 
                    ? 'Veja profissionais próximos no mapa interativo' 
                    : 'Encontre profissionais próximos a você'
                  }
                </p>
              </div>
              <div className="flex items-center gap-2">
                {!locationEnabled ? (
                  <button 
                    onClick={handleLocationRequest}
                    className="btn-professional btn-primary flex items-center gap-2"
                  >
                    <MapPin size={16} />
                    Permitir Localização
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewMode('list')}
                      className={`btn-professional ${viewMode === 'list' ? 'btn-primary' : 'btn-outline'} flex items-center gap-2`}
                    >
                      <List size={16} />
                      Lista
                    </button>
                    <button
                      onClick={() => setViewMode('map')}
                      className={`btn-professional ${viewMode === 'map' ? 'btn-primary' : 'btn-outline'} flex items-center gap-2`}
                    >
                      <Map size={16} />
                      Mapa
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Filtros de Profissionais */}
        <div className="card-professional">
          <div className="card-body">
            <div className="flex gap-sm flex-wrap">
              <button
                onClick={() => handleFilter('todos')}
                className={`btn-professional ${activeFilter === 'todos' ? 'btn-primary' : 'btn-outline'}`}
              >
                Todos ({getFilterCount('todos')})
              </button>
              <button
                onClick={() => handleFilter('medico')}
                className={`btn-professional ${activeFilter === 'medico' ? 'btn-primary' : 'btn-outline'} flex items-center gap-2`}
              >
                <Stethoscope size={16} />
                Médicos ({getFilterCount('medico')})
              </button>
              <button
                onClick={() => handleFilter('enfermeiro')}
                className={`btn-professional ${activeFilter === 'enfermeiro' ? 'btn-primary' : 'btn-outline'} flex items-center gap-2`}
              >
                <UserCheck size={16} />
                Enfermeiros ({getFilterCount('enfermeiro')})
              </button>
              <button
                onClick={() => handleFilter('fisioterapeuta')}
                className={`btn-professional ${activeFilter === 'fisioterapeuta' ? 'btn-primary' : 'btn-outline'} flex items-center gap-2`}
              >
                <Activity size={16} />
                Fisioterapeutas ({getFilterCount('fisioterapeuta')})
              </button>
            </div>
            
            {/* Seção de Serviços Especializados */}
            <div className="specialized-services" style={{marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e0e0e0'}}>
              <h3 style={{marginBottom: '16px', color: '#000', fontSize: '16px'}} className="flex items-center gap-2">
                <Stethoscope size={18} className="text-blue-600" />
                Serviços Especializados
              </h3>
              <div className="flex gap-sm flex-wrap">
                <Link 
                  to="/homecare-booking" 
                  className="btn-professional btn-outline flex items-center gap-2"
                  style={{background: '#f0f8ff', borderColor: '#0a66c2', color: '#0a66c2'}}
                >
                  <HomeIcon size={16} />
                  Agendar Home Care
                </Link>
                <Link 
                  to="/physiotherapy-booking" 
                  className="btn-professional btn-outline flex items-center gap-2"
                  style={{background: '#f0fff0', borderColor: '#057642', color: '#057642'}}
                >
                  <Activity size={16} />
                  Agendar Fisioterapia
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Mapa ou Lista de Profissionais */}
        {viewMode === 'map' && locationEnabled ? (
          <ProfessionalMap 
            professionals={filteredProfessionals}
            onProfessionalSelect={handleProfessionalSelect}
          />
        ) : (
          <div className="card-professional">
            <div className="card-header">
              <h2 className="card-title">Profissionais Disponíveis</h2>
              <p className="card-subtitle">{filteredProfessionals.length} profissionais encontrados</p>
            </div>
            <div className="card-body">
              <div className="professionals-grid">
                {filteredProfessionals.map((professional) => (
                  <div key={professional.id} className="card-professional professional-card">
                    <div className="profile-avatar-medium">
                      {professional.avatar ? (
                        <img 
                          src={professional.avatar} 
                          alt={professional.name}
                          className="profile-image"
                          onError={(e) => {
                            e.target.style.display = 'none'
                            e.target.nextSibling.style.display = 'flex'
                          }}
                        />
                      ) : null}
                      <div 
                        className="profile-fallback"
                        style={{ display: professional.avatar ? 'none' : 'flex' }}
                      >
                        {professional.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  </div>
                  
                  <div className="professional-info">
                    <h3 className="professional-name">
                      {getProfessionLabel(professional.profession)} {professional.name}
                    </h3>
                    <p className="professional-specialty">{professional.specialty}</p>
                    <p className="professional-location flex items-center gap-1">
                      <MapPin size={14} className="text-gray-500" />
                      {professional.location}
                    </p>
                    
                    <div className="professional-rating">
                      <span className="rating-stars flex items-center gap-1">{renderStars(professional.rating)}</span>
                      <span className="rating-text">
                        {professional.rating} ({professional.reviews} avaliações)
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-blue font-bold">R$ {professional.price}</span>
                      <span className="text-muted flex items-center gap-1">
                        <MapPin size={12} className="text-gray-400" />
                        {professional.distance}
                      </span>
                    </div>

                    <div className="professional-actions">
                      <button
                        onClick={() => navigate(`/professional/${professional.id}`)}
                        className="btn-professional btn-secondary btn-sm"
                      >
                        Ver Perfil
                      </button>
                      <button
                        onClick={() => navigate(`/booking/${professional.id}`)}
                        className="btn-professional btn-primary btn-sm"
                      >
                        Agendar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        )}
      </main>

      {/* Sidebar Direita - Atividades e Sugestões */}
      <aside className="sidebar-right">
        {/* Especialidades Populares */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title">Especialidades Populares</h3>
          </div>
          <div className="card-body">
            <div className="flex flex-col gap-sm">
              <Link to="/search?specialty=cardiologia" className="activity-action flex items-center gap-2">
                <Heart size={16} className="text-red-500" />
                Cardiologia
              </Link>
              <Link to="/search?specialty=pediatria" className="activity-action flex items-center gap-2">
                <Baby size={16} className="text-pink-500" />
                Pediatria
              </Link>
              <Link to="/search?specialty=ortopedia" className="activity-action flex items-center gap-2">
                <Bone size={16} className="text-gray-600" />
                Ortopedia
              </Link>
              <Link to="/search?specialty=dermatologia" className="activity-action flex items-center gap-2">
                <Droplets size={16} className="text-blue-500" />
                Dermatologia
              </Link>
              <Link to="/search?specialty=fisioterapia" className="activity-action flex items-center gap-2">
                <Activity size={16} className="text-green-500" />
                Fisioterapia
              </Link>
            </div>
          </div>
        </div>

        {/* Atividades Recentes */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title">Atividades Recentes</h3>
          </div>
          <div className="card-body">
            <div className="activity-feed">
              <div className="activity-item">
                <div className="activity-avatar">
                  <div className="profile-avatar-small">
                    <div className="profile-fallback">JS</div>
                  </div>
                </div>
                <div className="activity-content">
                  <div className="activity-header">
                    <span className="activity-author">Dr. João Silva</span>
                    <span className="activity-time">2h</span>
                  </div>
                  <p className="activity-text">
                    Novo horário disponível para consultas de cardiologia.
                  </p>
                </div>
              </div>

              <div className="activity-item">
                <div className="activity-avatar">
                  <div className="profile-avatar-small">
                    <div className="profile-fallback">MS</div>
                  </div>
                </div>
                <div className="activity-content">
                  <div className="activity-header">
                    <span className="activity-author">Dra. Maria Santos</span>
                    <span className="activity-time">4h</span>
                  </div>
                  <p className="activity-text">
                    Compartilhou dicas sobre cuidados pediátricos.
                  </p>
                </div>
              </div>

              <div className="activity-item">
                <div className="activity-avatar">
                  <div className="profile-avatar-small">
                    <div className="profile-fallback">RM</div>
                  </div>
                </div>
                <div className="activity-content">
                  <div className="activity-header">
                    <span className="activity-author">Dr. Rafael Mendes</span>
                    <span className="activity-time">1d</span>
                  </div>
                  <p className="activity-text">
                    Publicou exercícios de fisioterapia para dor nas costas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}

export default Home

