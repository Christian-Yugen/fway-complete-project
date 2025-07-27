import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { mockProfessionals } from '../data/mockData'
import { 
  ArrowLeft,
  Home,
  Users,
  Calendar,
  MessageCircle,
  UserPlus,
  Check,
  Star,
  MapPin,
  Heart,
  Baby,
  Bone,
  Droplets,
  Building2,
  User,
  Activity,
  Brain,
  Wind,
  Zap,
  GraduationCap,
  Award,
  Clock,
  Shield,
  FileText,
  Phone,
  Mail,
  Globe
} from 'lucide-react'

const ProfessionalProfile = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('about')
  const [isConnected, setIsConnected] = useState(false)
  const [showContactInfo, setShowContactInfo] = useState(false)

  // Encontrar o profissional pelo ID
  const professional = mockProfessionals.find(p => p.id === parseInt(id))

  if (!professional) {
    return (
      <div className="content-container">
        <div className="card-professional">
          <div className="card-body text-center">
            <h2 className="card-title">Profissional não encontrado</h2>
            <p className="card-subtitle">O profissional que você está procurando não existe.</p>
            <Link to="/" className="btn-professional btn-primary">
              Voltar ao Início
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const getProfessionLabel = (profession) => {
    switch (profession) {
      case 'medico': return 'Dr(a).'
      case 'enfermeiro': return 'Enf.'
      case 'fisioterapeuta': return 'Dr(a).'
      default: return ''
    }
  }

  const getSpecialtyIcon = (specialty) => {
    const icons = {
      'Cardiologia': <Heart size={16} className="text-red-500" />,
      'Pediatria': <Baby size={16} className="text-pink-500" />,
      'Ortopedia': <Bone size={16} className="text-gray-600" />,
      'Dermatologia': <Droplets size={16} className="text-blue-500" />,
      'UTI Adulto': <Building2 size={16} className="text-blue-600" />,
      'Obstetrícia': <User size={16} className="text-pink-600" />,
      'Home Care': <Home size={16} className="text-green-600" />,
      'Fisioterapia': <Activity size={16} className="text-green-500" />,
      'Neurologia': <Brain size={16} className="text-purple-600" />,
      'Respiratória': <Wind size={16} className="text-blue-400" />,
      'Esportiva': <Zap size={16} className="text-orange-500" />
    }
    return icons[specialty] || <User size={16} className="text-gray-500" />
  }

  // Mock data para avaliações
  const reviews = [
    {
      id: 1,
      patientName: 'Maria S.',
      rating: 5,
      date: '2024-06-15',
      comment: 'Excelente profissional! Muito atencioso e explicou tudo detalhadamente. Recomendo!',
      verified: true
    },
    {
      id: 2,
      patientName: 'João P.',
      rating: 5,
      date: '2024-06-10',
      comment: 'Ótimo atendimento, pontual e muito competente. Já agendei meu retorno.',
      verified: true
    },
    {
      id: 3,
      patientName: 'Ana L.',
      rating: 4,
      date: '2024-06-05',
      comment: 'Bom profissional, mas a consulta foi um pouco corrida. No geral, satisfeita.',
      verified: true
    }
  ]

  // Mock data para horários disponíveis
  const availableSlots = [
    { date: '2024-06-22', time: '09:00', available: true },
    { date: '2024-06-22', time: '10:30', available: false },
    { date: '2024-06-22', time: '14:00', available: true },
    { date: '2024-06-22', time: '15:30', available: true },
    { date: '2024-06-23', time: '09:00', available: true },
    { date: '2024-06-23', time: '11:00', available: true }
  ]

  // Mock data para profissionais similares
  const similarProfessionals = mockProfessionals
    .filter(p => p.id !== professional.id && p.specialty === professional.specialty)
    .slice(0, 3)

  const handleConnect = () => {
    setIsConnected(!isConnected)
  }

  const handleBooking = () => {
    navigate(`/booking/${professional.id}`)
  }

  const handleChat = () => {
    navigate(`/chat?user=${professional.id}`)
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

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR')
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

        {/* Navegação Rápida */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <ArrowLeft size={18} className="text-blue-600" />
              Navegação
            </h3>
          </div>
          <div className="card-body">
            <nav className="flex flex-col gap-sm">
              <button
                onClick={() => navigate(-1)}
                className="activity-action flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                Voltar
              </button>
              <Link to="/" className="activity-action flex items-center gap-2">
                <Home size={16} />
                Início
              </Link>
              <Link to="/network" className="activity-action flex items-center gap-2">
                <Users size={16} />
                Minha Rede
              </Link>
              <Link to="/my-bookings" className="activity-action flex items-center gap-2">
                <Calendar size={16} />
                Minhas Consultas
              </Link>
            </nav>
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <Zap size={18} className="text-orange-500" />
              Ações Rápidas
            </h3>
          </div>
          <div className="card-body">
            <div className="flex flex-col gap-sm">
              <button
                onClick={handleBooking}
                className="btn-professional btn-primary flex items-center gap-2"
              >
                <Calendar size={16} />
                Agendar Consulta
              </button>
              <button
                onClick={handleChat}
                className="btn-professional btn-secondary flex items-center gap-2"
              >
                <MessageCircle size={16} />
                Enviar Mensagem
              </button>
              <button
                onClick={handleConnect}
                className={`btn-professional ${isConnected ? 'btn-outline' : 'btn-secondary'} flex items-center gap-2`}
              >
                {isConnected ? (
                  <>
                    <Check size={16} />
                    Conectado
                  </>
                ) : (
                  <>
                    <UserPlus size={16} />
                    Conectar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="content-main">
        {/* Header do Profissional */}
        <div className="card-professional">
          <div className="card-body">
            <div className="flex gap-lg">
              {/* Avatar Grande */}
              <div className="profile-avatar-large" style={{ width: '120px', height: '120px' }}>
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
                  style={{ 
                    display: professional.avatar ? 'none' : 'flex',
                    fontSize: '32px'
                  }}
                >
                  {professional.name.split(' ').map(n => n[0]).join('')}
                </div>
              </div>

              {/* Informações Principais */}
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="card-title" style={{ fontSize: 'var(--font-size-2xl)', margin: '0 0 8px 0' }}>
                      {getProfessionLabel(professional.profession)} {professional.name}
                    </h1>
                    <p className="card-subtitle flex items-center gap-2" style={{ fontSize: 'var(--font-size-lg)', margin: '0 0 8px 0' }}>
                      {getSpecialtyIcon(professional.specialty)}
                      {professional.specialty}
                    </p>
                    <p className="text-muted flex items-center gap-1">
                      <MapPin size={16} className="text-gray-500" />
                      {professional.location}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center gap-sm" style={{ marginBottom: '8px' }}>
                      <span className="rating-stars flex items-center gap-1">{renderStars(Math.floor(professional.rating))}</span>
                      <span className="font-bold">{professional.rating}</span>
                      <span className="text-muted">({professional.reviews} avaliações)</span>
                    </div>
                    <p className="font-bold text-blue" style={{ fontSize: 'var(--font-size-xl)' }}>
                      R$ {professional.price}
                    </p>
                    <p className="text-muted flex items-center gap-1">
                      <MapPin size={12} className="text-gray-400" />
                      {professional.distance}
                    </p>
                  </div>
                </div>

                {/* Estatísticas */}
                <div className="flex gap-lg" style={{ marginTop: 'var(--spacing-lg)' }}>
                  <div className="profile-stat">
                    <span className="profile-stat-number">500+</span>
                    <span className="profile-stat-label">Consultas</span>
                  </div>
                  <div className="profile-stat">
                    <span className="profile-stat-number">15</span>
                    <span className="profile-stat-label">Anos de experiência</span>
                  </div>
                  <div className="profile-stat">
                    <span className="profile-stat-number">98%</span>
                    <span className="profile-stat-label">Satisfação</span>
                  </div>
                  <div className="profile-stat">
                    <span className="profile-stat-number">24h</span>
                    <span className="profile-stat-label">Tempo resposta</span>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex gap-sm" style={{ marginTop: 'var(--spacing-md)' }}>
                  <span style={{
                    padding: '4px 8px',
                    backgroundColor: 'var(--success-green)',
                    color: 'white',
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: '600',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Shield size={12} />
                    Verificado
                  </span>
                  <span style={{
                    padding: '4px 8px',
                    backgroundColor: 'var(--primary-blue)',
                    color: 'white',
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: '600',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Award size={12} />
                    Top Rated
                  </span>
                  <span style={{
                    padding: '4px 8px',
                    backgroundColor: 'var(--warning-orange)',
                    color: 'white',
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: '600',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Zap size={12} />
                    Resposta Rápida
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navegação por Abas */}
        <div className="card-professional">
          <div className="card-body">
            <div className="flex gap-sm">
              <button
                onClick={() => setActiveTab('about')}
                className={`btn-professional ${activeTab === 'about' ? 'btn-primary' : 'btn-outline'} flex items-center gap-2`}
              >
                <User size={16} />
                Sobre
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`btn-professional ${activeTab === 'reviews' ? 'btn-primary' : 'btn-outline'} flex items-center gap-2`}
              >
                <Star size={16} />
                Avaliações ({reviews.length})
              </button>
              <button
                onClick={() => setActiveTab('schedule')}
                className={`btn-professional ${activeTab === 'schedule' ? 'btn-primary' : 'btn-outline'} flex items-center gap-2`}
              >
                <Calendar size={16} />
                Horários
              </button>
              <button
                onClick={() => setActiveTab('location')}
                className={`btn-professional ${activeTab === 'location' ? 'btn-primary' : 'btn-outline'} flex items-center gap-2`}
              >
                <MapPin size={16} />
                Localização
              </button>
            </div>
          </div>
        </div>

        {/* Conteúdo das Abas */}
        {activeTab === 'about' && (
          <div className="card-professional">
            <div className="card-header">
              <h2 className="card-title">Sobre {professional.name}</h2>
              <p className="card-subtitle">Formação, experiência e especialidades</p>
            </div>
            <div className="card-body">
              <div className="flex flex-col gap-lg">
                {/* Biografia */}
                <div>
                  <h3 className="font-bold text-primary flex items-center gap-2">
                    <FileText size={18} />
                    Biografia
                  </h3>
                  <p className="text-secondary" style={{ marginTop: 'var(--spacing-sm)' }}>
                    {professional.profession === 'medico' && 
                      `Dr(a). ${professional.name} é especialista em ${professional.specialty} com mais de 15 anos de experiência. 
                      Formado(a) pela Universidade de São Paulo (USP), possui residência médica no Hospital das Clínicas e 
                      especialização em ${professional.specialty}. Atende com foco no cuidado humanizado e na medicina baseada em evidências.`
                    }
                    {professional.profession === 'enfermeiro' && 
                      `Enfermeiro(a) ${professional.name} é especialista em ${professional.specialty} com vasta experiência em cuidados intensivos. 
                      Formado(a) pela Universidade Federal de São Paulo (UNIFESP), possui especialização em ${professional.specialty} e 
                      certificações internacionais. Dedica-se ao cuidado integral do paciente com excelência técnica e humana.`
                    }
                    {professional.profession === 'fisioterapeuta' && 
                      `Dr(a). ${professional.name} é fisioterapeuta especialista em ${professional.specialty} com ampla experiência em reabilitação. 
                      Formado(a) pela Pontifícia Universidade Católica (PUC), possui pós-graduação em ${professional.specialty} e 
                      certificações em técnicas avançadas. Foca na recuperação funcional e qualidade de vida dos pacientes.`
                    }
                  </p>
                </div>

                {/* Formação */}
                <div>
                  <h3 className="font-bold text-primary flex items-center gap-2">
                    <GraduationCap size={18} />
                    Formação Acadêmica
                  </h3>
                  <div className="flex flex-col gap-sm" style={{ marginTop: 'var(--spacing-sm)' }}>
                    <div className="border-bottom p-sm">
                      <h4 className="font-bold">
                        {professional.profession === 'medico' && 'Medicina'}
                        {professional.profession === 'enfermeiro' && 'Enfermagem'}
                        {professional.profession === 'fisioterapeuta' && 'Fisioterapia'}
                      </h4>
                      <p className="text-secondary">
                        {professional.profession === 'medico' && 'Universidade de São Paulo (USP) • 2003-2008'}
                        {professional.profession === 'enfermeiro' && 'Universidade Federal de São Paulo (UNIFESP) • 2005-2009'}
                        {professional.profession === 'fisioterapeuta' && 'Pontifícia Universidade Católica (PUC) • 2004-2008'}
                      </p>
                    </div>
                    <div className="border-bottom p-sm">
                      <h4 className="font-bold">Especialização em {professional.specialty}</h4>
                      <p className="text-secondary">Hospital das Clínicas - FMUSP • 2009-2012</p>
                    </div>
                  </div>
                </div>

                {/* Experiência */}
                <div>
                  <h3 className="font-bold text-primary flex items-center gap-2">
                    <Award size={18} />
                    Experiência Profissional
                  </h3>
                  <div className="flex flex-col gap-sm" style={{ marginTop: 'var(--spacing-sm)' }}>
                    <div className="border-bottom p-sm">
                      <h4 className="font-bold">Hospital das Clínicas - FMUSP</h4>
                      <p className="text-secondary">
                        {professional.profession === 'medico' && 'Médico Assistente'}
                        {professional.profession === 'enfermeiro' && 'Enfermeiro Especialista'}
                        {professional.profession === 'fisioterapeuta' && 'Fisioterapeuta Sênior'}
                        • 2012-Presente
                      </p>
                    </div>
                    <div className="border-bottom p-sm">
                      <h4 className="font-bold">Clínica Particular</h4>
                      <p className="text-secondary">Atendimento privado • 2015-Presente</p>
                    </div>
                  </div>
                </div>

                {/* Certificações */}
                <div>
                  <h3 className="font-bold text-primary flex items-center gap-2">
                    <Shield size={18} />
                    Certificações e Licenças
                  </h3>
                  <div className="flex flex-col gap-sm" style={{ marginTop: 'var(--spacing-sm)' }}>
                    <div className="flex items-center gap-2">
                      <Shield size={16} className="text-green-500" />
                      <span>CRM/SP 123456 - Ativo</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield size={16} className="text-green-500" />
                      <span>Título de Especialista - {professional.specialty}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield size={16} className="text-green-500" />
                      <span>Certificação Internacional em {professional.specialty}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="card-professional">
            <div className="card-header">
              <h2 className="card-title flex items-center gap-2">
                <Star size={20} />
                Avaliações dos Pacientes
              </h2>
              <p className="card-subtitle">{reviews.length} avaliações verificadas</p>
            </div>
            <div className="card-body">
              <div className="flex flex-col gap-lg">
                {reviews.map((review) => (
                  <div key={review.id} className="border-bottom p-md">
                    <div className="flex justify-between items-start" style={{ marginBottom: 'var(--spacing-sm)' }}>
                      <div className="flex items-center gap-sm">
                        <div className="profile-avatar-small">
                          <div className="profile-fallback">
                            {review.patientName.split(' ').map(n => n[0]).join('')}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-bold">{review.patientName}</h4>
                          <div className="flex items-center gap-1">
                            {renderStars(review.rating)}
                            <span className="text-muted">• {formatDate(review.date)}</span>
                            {review.verified && (
                              <span className="flex items-center gap-1 text-green-600">
                                <Shield size={12} />
                                Verificado
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-secondary">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="card-professional">
            <div className="card-header">
              <h2 className="card-title flex items-center gap-2">
                <Calendar size={20} />
                Horários Disponíveis
              </h2>
              <p className="card-subtitle">Selecione um horário para agendar sua consulta</p>
            </div>
            <div className="card-body">
              <div className="flex flex-col gap-lg">
                <div className="grid grid-cols-3 gap-md">
                  {availableSlots.map((slot, index) => (
                    <button
                      key={index}
                      className={`btn-professional ${slot.available ? 'btn-outline' : 'btn-disabled'}`}
                      disabled={!slot.available}
                      onClick={() => slot.available && handleBooking()}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-bold">{slot.time}</span>
                        <span className="text-sm">{formatDate(slot.date)}</span>
                        {!slot.available && (
                          <span className="text-xs text-red-500">Ocupado</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                
                <div className="text-center">
                  <button
                    onClick={handleBooking}
                    className="btn-professional btn-primary flex items-center gap-2"
                  >
                    <Calendar size={16} />
                    Ver Mais Horários
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'location' && (
          <div className="card-professional">
            <div className="card-header">
              <h2 className="card-title flex items-center gap-2">
                <MapPin size={20} />
                Localização e Contato
              </h2>
              <p className="card-subtitle">Informações de localização e contato</p>
            </div>
            <div className="card-body">
              <div className="flex flex-col gap-lg">
                {/* Endereço */}
                <div>
                  <h3 className="font-bold text-primary flex items-center gap-2">
                    <MapPin size={18} />
                    Endereço
                  </h3>
                  <p className="text-secondary" style={{ marginTop: 'var(--spacing-sm)' }}>
                    Rua das Flores, 123 - Jardins<br />
                    São Paulo, SP - CEP: 01234-567
                  </p>
                </div>

                {/* Contato */}
                <div>
                  <h3 className="font-bold text-primary flex items-center gap-2">
                    <Phone size={18} />
                    Contato
                  </h3>
                  <div className="flex flex-col gap-sm" style={{ marginTop: 'var(--spacing-sm)' }}>
                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-gray-500" />
                      <span>(11) 99999-9999</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail size={16} className="text-gray-500" />
                      <span>{professional.name.toLowerCase().replace(' ', '.')}@email.com</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe size={16} className="text-gray-500" />
                      <span>www.{professional.name.toLowerCase().replace(' ', '')}.com.br</span>
                    </div>
                  </div>
                </div>

                {/* Horário de Funcionamento */}
                <div>
                  <h3 className="font-bold text-primary flex items-center gap-2">
                    <Clock size={18} />
                    Horário de Funcionamento
                  </h3>
                  <div className="flex flex-col gap-sm" style={{ marginTop: 'var(--spacing-sm)' }}>
                    <div className="flex justify-between">
                      <span>Segunda a Sexta:</span>
                      <span>08:00 - 18:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sábado:</span>
                      <span>08:00 - 12:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Domingo:</span>
                      <span>Fechado</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Sidebar Direita */}
      <aside className="sidebar-right">
        {/* Ações */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <Zap size={18} />
              Ações
            </h3>
          </div>
          <div className="card-body">
            <div className="flex flex-col gap-sm">
              <button
                onClick={handleBooking}
                className="btn-professional btn-primary flex items-center gap-2"
              >
                <Calendar size={16} />
                Agendar Consulta
              </button>
              <button
                onClick={handleChat}
                className="btn-professional btn-secondary flex items-center gap-2"
              >
                <MessageCircle size={16} />
                Enviar Mensagem
              </button>
              <button
                onClick={handleConnect}
                className={`btn-professional ${isConnected ? 'btn-outline' : 'btn-secondary'} flex items-center gap-2`}
              >
                {isConnected ? (
                  <>
                    <Check size={16} />
                    Conectado
                  </>
                ) : (
                  <>
                    <UserPlus size={16} />
                    Conectar
                  </>
                )}
              </button>
              <button className="btn-professional btn-outline flex items-center gap-2">
                <Star size={16} />
                Avaliar
              </button>
              <button className="btn-professional btn-outline flex items-center gap-2">
                <Users size={16} />
                Compartilhar
              </button>
            </div>
          </div>
        </div>

        {/* Profissionais Similares */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <Users size={18} />
              Profissionais Similares
            </h3>
          </div>
          <div className="card-body">
            <div className="flex flex-col gap-sm">
              {similarProfessionals.map((prof) => (
                <Link
                  key={prof.id}
                  to={`/professional/${prof.id}`}
                  className="activity-item"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div className="activity-avatar">
                    <div className="profile-avatar-small">
                      <div className="profile-fallback">
                        {prof.name.split(' ').map(n => n[0]).join('')}
                      </div>
                    </div>
                  </div>
                  <div className="activity-content">
                    <div className="activity-header">
                      <span className="activity-author">
                        {getProfessionLabel(prof.profession)} {prof.name}
                      </span>
                    </div>
                    <p className="activity-text">{prof.specialty}</p>
                    <div className="flex items-center gap-1">
                      <Star size={12} className="text-yellow-500" />
                      <span className="text-sm">{prof.rating}</span>
                      <span className="text-sm text-muted">R$ {prof.price}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <Activity size={18} />
              Estatísticas
            </h3>
          </div>
          <div className="card-body">
            <div className="flex flex-col gap-sm">
              <div className="flex justify-between">
                <span>Visualizações do perfil</span>
                <span className="font-bold">1,247</span>
              </div>
              <div className="flex justify-between">
                <span>Consultas este mês</span>
                <span className="font-bold">89</span>
              </div>
              <div className="flex justify-between">
                <span>Taxa de resposta</span>
                <span className="font-bold">98%</span>
              </div>
              <div className="flex justify-between">
                <span>Tempo médio resposta</span>
                <span className="font-bold">2h</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dicas */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <FileText size={18} />
              Dicas
            </h3>
          </div>
          <div className="card-body">
            <div className="flex flex-col gap-sm">
              <div className="activity-item">
                <div className="activity-content">
                  <p className="activity-text flex items-center gap-2">
                    <Calendar size={14} className="text-blue-500" />
                    Agende com antecedência para garantir o horário
                  </p>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-content">
                  <p className="activity-text flex items-center gap-2">
                    <MessageCircle size={14} className="text-green-500" />
                    Use o chat para tirar dúvidas
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

export default ProfessionalProfile

