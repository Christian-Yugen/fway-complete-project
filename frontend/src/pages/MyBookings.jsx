import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Check, X, BarChart3, Search, MessageCircle, User, Star, Laptop, Building, DollarSign } from 'lucide-react'

const MyBookings = () => {
  const [activeTab, setActiveTab] = useState('upcoming')

  // Mock data para consultas
  const upcomingBookings = [
    {
      id: 1,
      professional: {
        name: 'Dr. João Silva',
        specialty: 'Cardiologia',
        avatar: '/images/professionals/doctor1.jpg'
      },
      date: '2024-06-22',
      time: '14:00',
      type: 'Presencial',
      location: 'Clínica CardioVida - Av. Paulista, 1000',
      status: 'confirmed',
      price: 150,
      notes: 'Consulta de retorno - trazer exames anteriores'
    },
    {
      id: 2,
      professional: {
        name: 'Dra. Maria Santos',
        specialty: 'Pediatria',
        avatar: '/images/professionals/doctor2.jpg'
      },
      date: '2024-06-25',
      time: '10:30',
      type: 'Teleconsulta',
      location: 'Online via Fway',
      status: 'confirmed',
      price: 120,
      notes: 'Acompanhamento do desenvolvimento infantil'
    },
    {
      id: 3,
      professional: {
        name: 'Dr. Rafael Mendes',
        specialty: 'Fisioterapia',
        avatar: '/images/professionals/physio1.jpg'
      },
      date: '2024-06-28',
      time: '16:00',
      type: 'Presencial',
      location: 'Clínica FisioSaúde - Rua Augusta, 500',
      status: 'pending',
      price: 80,
      notes: 'Sessão de fisioterapia para dor nas costas'
    }
  ]

  const pastBookings = [
    {
      id: 4,
      professional: {
        name: 'Dr. João Silva',
        specialty: 'Cardiologia',
        avatar: '/images/professionals/doctor1.jpg'
      },
      date: '2024-06-15',
      time: '14:00',
      type: 'Presencial',
      location: 'Clínica CardioVida - Av. Paulista, 1000',
      status: 'completed',
      price: 150,
      rating: 5,
      review: 'Excelente atendimento! Dr. João foi muito atencioso e explicou tudo detalhadamente.'
    },
    {
      id: 5,
      professional: {
        name: 'Enfª Ana Carolina',
        specialty: 'UTI Adulto',
        avatar: '/images/professionals/nurse1.jpg'
      },
      date: '2024-06-10',
      time: '09:00',
      type: 'Domiciliar',
      location: 'Atendimento em casa',
      status: 'completed',
      price: 100,
      rating: 5,
      review: 'Profissional muito competente e cuidadosa.'
    }
  ]

  const cancelledBookings = [
    {
      id: 6,
      professional: {
        name: 'Dr. Carlos Oliveira',
        specialty: 'Ortopedia',
        avatar: '/images/professionals/doctor3.jpg'
      },
      date: '2024-06-18',
      time: '15:30',
      type: 'Presencial',
      location: 'Hospital Ortopédico',
      status: 'cancelled',
      price: 180,
      cancelReason: 'Cancelado pelo profissional - reagendamento necessário'
    }
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return '#057642'
      case 'pending': return '#f5a623'
      case 'completed': return '#0a66c2'
      case 'cancelled': return '#cc1016'
      default: return '#666666'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed': return 'Confirmada'
      case 'pending': return 'Pendente'
      case 'completed': return 'Concluída'
      case 'cancelled': return 'Cancelada'
      default: return status
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const renderStars = (rating) => {
    return '<Star size={16} />'.repeat(rating) + '☆'.repeat(5 - rating)
  }

  const currentBookings = activeTab === 'upcoming' ? upcomingBookings : 
                         activeTab === 'past' ? pastBookings : cancelledBookings

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
                <span className="profile-stat-number">{upcomingBookings.length}</span>
                <span className="profile-stat-label">Próximas</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat-number">{pastBookings.length}</span>
                <span className="profile-stat-label">Realizadas</span>
              </div>
            </div>
          </div>
        </div>

        {/* Resumo de Consultas */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title"><BarChart3 size={16} /> Resumo</h3>
          </div>
          <div className="card-body">
            <div className="flex flex-col gap-sm">
              <div className="flex justify-between">
                <span className="text-secondary">Total de consultas</span>
                <span className="font-bold text-blue">{upcomingBookings.length + pastBookings.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Este mês</span>
                <span className="font-bold">3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Gasto total</span>
                <span className="font-bold">R$ 450</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Avaliação média</span>
                <span className="font-bold"><Star size={16} /> 5.0</span>
              </div>
            </div>
          </div>
        </div>

        {/* Acesso Rápido */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title">Acesso Rápido</h3>
          </div>
          <div className="card-body">
            <nav className="flex flex-col gap-sm">
              <Link to="/" className="activity-action">
                <Search size={16} /> Buscar Profissionais
              </Link>
              <Link to="/chat" className="activity-action">
                <MessageCircle size={16} /> Mensagens
              </Link>
              <Link to="/profile" className="activity-action">
                <User size={16} /> Meu Perfil
              </Link>
            </nav>
          </div>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="content-main">
        {/* Navegação por Abas */}
        <div className="card-professional">
          <div className="card-body">
            <div className="flex gap-sm">
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`btn-professional ${activeTab === 'upcoming' ? 'btn-primary' : 'btn-outline'}`}
              >
                <Calendar size={16} /> Próximas ({upcomingBookings.length})
              </button>
              <button
                onClick={() => setActiveTab('past')}
                className={`btn-professional ${activeTab === 'past' ? 'btn-primary' : 'btn-outline'}`}
              >
                <Check size={16} /> Realizadas ({pastBookings.length})
              </button>
              <button
                onClick={() => setActiveTab('cancelled')}
                className={`btn-professional ${activeTab === 'cancelled' ? 'btn-primary' : 'btn-outline'}`}
              >
                <X size={16} /> Canceladas ({cancelledBookings.length})
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Consultas */}
        <div className="card-professional">
          <div className="card-header">
            <h2 className="card-title">
              {activeTab === 'upcoming' && 'Próximas Consultas'}
              {activeTab === 'past' && 'Consultas Realizadas'}
              {activeTab === 'cancelled' && 'Consultas Canceladas'}
            </h2>
            <p className="card-subtitle">
              {activeTab === 'upcoming' && 'Suas consultas agendadas'}
              {activeTab === 'past' && 'Histórico de atendimentos'}
              {activeTab === 'cancelled' && 'Consultas que foram canceladas'}
            </p>
          </div>
          <div className="card-body">
            {currentBookings.length === 0 ? (
              <div className="text-center" style={{ padding: 'var(--spacing-2xl)' }}>
                <span style={{ fontSize: '48px' }}><Calendar size={16} /></span>
                <h3 className="card-title">Nenhuma consulta encontrada</h3>
                <p className="card-subtitle">
                  {activeTab === 'upcoming' && 'Você não tem consultas agendadas'}
                  {activeTab === 'past' && 'Você ainda não realizou consultas'}
                  {activeTab === 'cancelled' && 'Você não tem consultas canceladas'}
                </p>
                {activeTab === 'upcoming' && (
                  <Link to="/" className="btn-professional btn-primary">
                    Agendar Consulta
                  </Link>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-md">
                {currentBookings.map((booking) => (
                  <div key={booking.id} className="card-professional">
                    <div className="card-body">
                      <div className="flex gap-md">
                        {/* Avatar do Profissional */}
                        <div className="profile-avatar-medium">
                          {booking.professional.avatar ? (
                            <img 
                              src={booking.professional.avatar} 
                              alt={booking.professional.name}
                              className="profile-image"
                              onError={(e) => {
                                e.target.style.display = 'none'
                                e.target.nextSibling.style.display = 'flex'
                              }}
                            />
                          ) : null}
                          <div 
                            className="profile-fallback"
                            style={{ display: booking.professional.avatar ? 'none' : 'flex' }}
                          >
                            {booking.professional.name.split(' ').map(n => n[0]).join('')}
                          </div>
                        </div>

                        {/* Informações da Consulta */}
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="professional-name">{booking.professional.name}</h3>
                              <p className="professional-specialty">{booking.professional.specialty}</p>
                            </div>
                            <div style={{
                              padding: '4px 8px',
                              backgroundColor: getStatusColor(booking.status),
                              color: 'white',
                              fontSize: 'var(--font-size-xs)',
                              fontWeight: '600'
                            }}>
                              {getStatusText(booking.status)}
                            </div>
                          </div>

                          {/* Data e Hora */}
                          <div className="flex items-center gap-md" style={{ margin: 'var(--spacing-sm) 0' }}>
                            <div className="flex items-center gap-sm">
                              <span><Calendar size={16} /></span>
                              <span className="font-bold">{formatDate(booking.date)}</span>
                            </div>
                            <div className="flex items-center gap-sm">
                              <span>🕐</span>
                              <span className="font-bold">{booking.time}</span>
                            </div>
                          </div>

                          {/* Tipo e Local */}
                          <div className="flex items-center gap-md" style={{ margin: 'var(--spacing-sm) 0' }}>
                            <div className="flex items-center gap-sm">
                              <span>{booking.type === 'Teleconsulta' ? '<Laptop size={16} />' : booking.type === 'Domiciliar' ? '🏠' : '<Building size={16} />'}</span>
                              <span className="text-secondary">{booking.type}</span>
                            </div>
                            <div className="flex items-center gap-sm">
                              <span><MapPin size={16} /></span>
                              <span className="text-secondary">{booking.location}</span>
                            </div>
                          </div>

                          {/* Preço */}
                          <div className="flex items-center gap-sm" style={{ margin: 'var(--spacing-sm) 0' }}>
                            <span><DollarSign size={16} /></span>
                            <span className="font-bold text-blue">R$ {booking.price}</span>
                          </div>

                          {/* Observações */}
                          {booking.notes && (
                            <div className="bg-light p-sm" style={{ margin: 'var(--spacing-sm) 0' }}>
                              <p className="text-secondary">{booking.notes}</p>
                            </div>
                          )}

                          {/* Avaliação (para consultas passadas) */}
                          {booking.rating && (
                            <div className="bg-light p-sm" style={{ margin: 'var(--spacing-sm) 0' }}>
                              <div className="flex items-center gap-sm">
                                <span><Star size={16} /></span>
                                <span className="font-bold">{booking.rating}/5</span>
                                <span className="text-secondary">- Sua avaliação</span>
                              </div>
                              {booking.review && (
                                <p className="text-secondary" style={{ marginTop: '4px' }}>
                                  "{booking.review}"
                                </p>
                              )}
                            </div>
                          )}

                          {/* Motivo do Cancelamento */}
                          {booking.cancelReason && (
                            <div style={{ 
                              padding: 'var(--spacing-sm)',
                              backgroundColor: '#fef2f2',
                              border: '1px solid #fecaca',
                              margin: 'var(--spacing-sm) 0'
                            }}>
                              <p className="text-secondary">{booking.cancelReason}</p>
                            </div>
                          )}

                          {/* Ações */}
                          <div className="flex gap-sm" style={{ marginTop: 'var(--spacing-md)' }}>
                            {booking.status === 'confirmed' && (
                              <>
                                <Link
                                  to={`/chat?user=${booking.professional.id}`}
                                  className="btn-professional btn-secondary btn-sm"
                                >
                                  <MessageCircle size={16} /> Mensagem
                                </Link>
                                <button className="btn-professional btn-outline btn-sm">
                                  <Calendar size={16} /> Reagendar
                                </button>
                                <button className="btn-professional btn-outline btn-sm">
                                  <X size={16} /> Cancelar
                                </button>
                              </>
                            )}
                            
                            {booking.status === 'pending' && (
                              <>
                                <button className="btn-professional btn-primary btn-sm">
                                  <Check size={16} /> Confirmar
                                </button>
                                <button className="btn-professional btn-outline btn-sm">
                                  <X size={16} /> Cancelar
                                </button>
                              </>
                            )}
                            
                            {booking.status === 'completed' && (
                              <>
                                <Link
                                  to={`/professional/${booking.professional.id}`}
                                  className="btn-professional btn-secondary btn-sm"
                                >
                                  Ver Perfil
                                </Link>
                                <Link
                                  to={`/booking/${booking.professional.id}`}
                                  className="btn-professional btn-primary btn-sm"
                                >
                                  Agendar Novamente
                                </Link>
                                {!booking.rating && (
                                  <button className="btn-professional btn-outline btn-sm">
                                    <Star size={16} /> Avaliar
                                  </button>
                                )}
                              </>
                            )}
                            
                            {booking.status === 'cancelled' && (
                              <Link
                                to={`/booking/${booking.professional.id}`}
                                className="btn-professional btn-primary btn-sm"
                              >
                                Reagendar
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Sidebar Direita - Informações Úteis */}
      <aside className="sidebar-right">
        {/* Próxima Consulta */}
        {upcomingBookings.length > 0 && (
          <div className="card-professional">
            <div className="card-header">
              <h3 className="card-title">⏰ Próxima Consulta</h3>
            </div>
            <div className="card-body">
              <div className="text-center">
                <div className="profile-avatar-medium" style={{ margin: '0 auto var(--spacing-sm)' }}>
                  <div className="profile-fallback">
                    {upcomingBookings[0].professional.name.split(' ').map(n => n[0]).join('')}
                  </div>
                </div>
                <h4 className="professional-name">{upcomingBookings[0].professional.name}</h4>
                <p className="professional-specialty">{upcomingBookings[0].professional.specialty}</p>
                <p className="text-muted">{formatDate(upcomingBookings[0].date)}</p>
                <p className="font-bold text-blue">{upcomingBookings[0].time}</p>
                
                <div className="flex gap-sm" style={{ marginTop: 'var(--spacing-md)' }}>
                  <Link
                    to={`/chat?user=${upcomingBookings[0].professional.id}`}
                    className="btn-professional btn-secondary btn-sm"
                  >
                    <MessageCircle size={16} /> Chat
                  </Link>
                  <button className="btn-professional btn-outline btn-sm">
                    <MapPin size={16} /> Local
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lembretes */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title"><Bell size={16} /> Lembretes</h3>
          </div>
          <div className="card-body">
            <div className="flex flex-col gap-sm">
              <div className="border-bottom p-sm">
                <p className="font-bold">Consulta amanhã</p>
                <p className="text-muted">Dr. João Silva às 14:00</p>
              </div>
              <div className="border-bottom p-sm">
                <p className="font-bold">Levar exames</p>
                <p className="text-muted">Não esqueça dos exames anteriores</p>
              </div>
              <div className="p-sm">
                <p className="font-bold">Medicação</p>
                <p className="text-muted">Tomar remédio às 8h e 20h</p>
              </div>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title"><TrendingUp size={16} /> Estatísticas</h3>
          </div>
          <div className="card-body">
            <div className="flex flex-col gap-sm">
              <div className="flex justify-between">
                <span className="text-secondary">Consultas este ano</span>
                <span className="font-bold">8</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Profissionais diferentes</span>
                <span className="font-bold">4</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Especialidades</span>
                <span className="font-bold">3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Teleconsultas</span>
                <span className="font-bold">25%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dicas */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title"><Lightbulb size={16} /> Dicas</h3>
          </div>
          <div className="card-body">
            <div className="flex flex-col gap-sm">
              <p className="text-secondary"><Phone size={16} /> Configure lembretes para suas consultas</p>
              <p className="text-secondary"><MessageCircle size={16} /> Use o chat para tirar dúvidas</p>
              <p className="text-secondary"><Star size={16} /> Avalie seus profissionais</p>
              <p className="text-secondary"><FileText size={16} /> Mantenha seu histórico atualizado</p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}

export default MyBookings

