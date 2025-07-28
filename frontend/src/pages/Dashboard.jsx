import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, MessageCircle, Users, Zap, BarChart3, Check, MapPin, FileText, Stethoscope, Scale, Pill, Bot, TrendingUp, Building } from 'lucide-react'

const Dashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month')

  // Mock data para métricas
  const metrics = {
    totalConsultations: 47,
    upcomingConsultations: 3,
    completedConsultations: 44,
    cancelledConsultations: 2,
    totalConnections: 23,
    newMessages: 8,
    healthScore: 85,
    lastCheckup: '2024-06-10'
  }

  // Mock data para próximas consultas
  const upcomingConsultations = [
    {
      id: 1,
      professional: 'Dr. João Silva',
      specialty: 'Cardiologia',
      date: '2024-06-22',
      time: '14:00',
      type: 'Presencial',
      status: 'confirmada'
    },
    {
      id: 2,
      professional: 'Dra. Maria Santos',
      specialty: 'Pediatria',
      date: '2024-06-25',
      time: '10:30',
      type: 'Teleconsulta',
      status: 'pendente'
    },
    {
      id: 3,
      professional: 'Dr. Rafael Mendes',
      specialty: 'Fisioterapia',
      date: '2024-06-28',
      time: '16:00',
      type: 'Presencial',
      status: 'confirmada'
    }
  ]

  // Mock data para atividades recentes
  const recentActivities = [
    {
      id: 1,
      type: 'consultation',
      icon: '<Calendar size={16} />',
      title: 'Consulta realizada',
      description: 'Consulta com Dr. João Silva - Cardiologia',
      time: '2 horas atrás',
      status: 'completed'
    },
    {
      id: 2,
      type: 'message',
      icon: '<MessageCircle size={16} />',
      title: 'Nova mensagem',
      description: 'Dra. Maria Santos enviou uma mensagem',
      time: '4 horas atrás',
      status: 'unread'
    },
    {
      id: 3,
      type: 'connection',
      icon: '<Users size={16} />',
      title: 'Nova conexão',
      description: 'Dr. Rafael Mendes aceitou sua conexão',
      time: '1 dia atrás',
      status: 'new'
    },
    {
      id: 4,
      type: 'reminder',
      icon: '⏰',
      title: 'Lembrete',
      description: 'Tomar medicamento - Losartana 50mg',
      time: '2 dias atrás',
      status: 'completed'
    }
  ]

  // Mock data para estatísticas de saúde
  const healthStats = [
    { label: 'Pressão Arterial', value: '120/80', status: 'normal', icon: '❤️' },
    { label: 'Frequência Cardíaca', value: '72 bpm', status: 'normal', icon: '💓' },
    { label: 'Temperatura', value: '36.5°C', status: 'normal', icon: '🌡️' },
    { label: 'Peso', value: '75 kg', status: 'normal', icon: '<Scale size={16} />' }
  ]

  // Mock data para lembretes
  const reminders = [
    {
      id: 1,
      type: 'medication',
      title: 'Tomar Losartana',
      time: '08:00',
      status: 'pending'
    },
    {
      id: 2,
      type: 'appointment',
      title: 'Consulta Dr. João Silva',
      time: '14:00',
      status: 'upcoming'
    },
    {
      id: 3,
      type: 'exercise',
      title: 'Caminhada 30min',
      time: '18:00',
      status: 'pending'
    }
  ]

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR')
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmada': return 'var(--success-green)'
      case 'pendente': return 'var(--warning-orange)'
      case 'cancelada': return 'var(--error-red)'
      default: return 'var(--text-secondary)'
    }
  }

  const getHealthStatusColor = (status) => {
    switch (status) {
      case 'normal': return 'var(--success-green)'
      case 'attention': return 'var(--warning-orange)'
      case 'critical': return 'var(--error-red)'
      default: return 'var(--text-secondary)'
    }
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
                <span className="profile-stat-number">{metrics.totalConsultations}</span>
                <span className="profile-stat-label">Consultas</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat-number">{metrics.totalConnections}</span>
                <span className="profile-stat-label">Conexões</span>
              </div>
            </div>
          </div>
        </div>

        {/* Score de Saúde */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title"><Building size={16} /> Score de Saúde</h3>
          </div>
          <div className="card-body text-center">
            <div style={{
              width: '80px',
              height: '80px',
              margin: '0 auto var(--spacing-md)',
              borderRadius: '50%',
              background: `conic-gradient(var(--success-green) ${metrics.healthScore * 3.6}deg, var(--border-light) 0deg)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: 'var(--background-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'var(--font-size-lg)',
                fontWeight: 'bold',
                color: 'var(--success-green)'
              }}>
                {metrics.healthScore}%
              </div>
            </div>
            <p className="text-secondary">Excelente estado de saúde</p>
            <Link to="/profile" className="btn-professional btn-outline btn-sm">
              Ver Detalhes
            </Link>
          </div>
        </div>

        {/* Acesso Rápido */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title"><Zap size={16} /> Acesso Rápido</h3>
          </div>
          <div className="card-body">
            <nav className="flex flex-col gap-sm">
              <Link to="/my-bookings" className="activity-action">
                <Calendar size={16} /> Minhas Consultas
              </Link>
              <Link to="/chat" className="activity-action">
                <MessageCircle size={16} /> Mensagens
              </Link>
              <Link to="/network" className="activity-action">
                <Users size={16} /> Minha Rede
              </Link>
              <Link to="/ai-health" className="activity-action">
                <Bot size={16} /> IA Saúde
              </Link>
            </nav>
          </div>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="content-main">
        {/* Header do Dashboard */}
        <div className="card-professional">
          <div className="card-body">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="card-title" style={{ fontSize: 'var(--font-size-2xl)', margin: '0 0 8px 0' }}>
                  <BarChart3 size={16} /> Dashboard
                </h1>
                <p className="card-subtitle">Visão geral da sua saúde e atividades</p>
              </div>
              <div className="flex gap-sm">
                <button
                  onClick={() => setSelectedPeriod('week')}
                  className={`btn-professional btn-sm ${selectedPeriod === 'week' ? 'btn-primary' : 'btn-outline'}`}
                >
                  Semana
                </button>
                <button
                  onClick={() => setSelectedPeriod('month')}
                  className={`btn-professional btn-sm ${selectedPeriod === 'month' ? 'btn-primary' : 'btn-outline'}`}
                >
                  Mês
                </button>
                <button
                  onClick={() => setSelectedPeriod('year')}
                  className={`btn-professional btn-sm ${selectedPeriod === 'year' ? 'btn-primary' : 'btn-outline'}`}
                >
                  Ano
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Métricas Principais */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: 'var(--spacing-md)' 
        }}>
          <div className="card-professional">
            <div className="card-body text-center">
              <div style={{ fontSize: '32px', color: 'var(--primary-blue)', marginBottom: 'var(--spacing-sm)' }}>
                <Calendar size={16} />
              </div>
              <h3 className="font-bold text-primary">{metrics.upcomingConsultations}</h3>
              <p className="text-secondary">Próximas Consultas</p>
            </div>
          </div>

          <div className="card-professional">
            <div className="card-body text-center">
              <div style={{ fontSize: '32px', color: 'var(--success-green)', marginBottom: 'var(--spacing-sm)' }}>
                <Check size={16} />
              </div>
              <h3 className="font-bold text-primary">{metrics.completedConsultations}</h3>
              <p className="text-secondary">Consultas Realizadas</p>
            </div>
          </div>

          <div className="card-professional">
            <div className="card-body text-center">
              <div style={{ fontSize: '32px', color: 'var(--primary-blue)', marginBottom: 'var(--spacing-sm)' }}>
                <Users size={16} />
              </div>
              <h3 className="font-bold text-primary">{metrics.totalConnections}</h3>
              <p className="text-secondary">Conexões</p>
            </div>
          </div>

          <div className="card-professional">
            <div className="card-body text-center">
              <div style={{ fontSize: '32px', color: 'var(--warning-orange)', marginBottom: 'var(--spacing-sm)' }}>
                <MessageCircle size={16} />
              </div>
              <h3 className="font-bold text-primary">{metrics.newMessages}</h3>
              <p className="text-secondary">Novas Mensagens</p>
            </div>
          </div>
        </div>

        {/* Próximas Consultas */}
        <div className="card-professional">
          <div className="card-header">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="card-title"><Calendar size={16} /> Próximas Consultas</h2>
                <p className="card-subtitle">{upcomingConsultations.length} consultas agendadas</p>
              </div>
              <Link to="/my-bookings" className="btn-professional btn-outline btn-sm">
                Ver Todas
              </Link>
            </div>
          </div>
          <div className="card-body">
            <div className="flex flex-col gap-md">
              {upcomingConsultations.map((consultation) => (
                <div key={consultation.id} className="card-professional">
                  <div className="card-body">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-md">
                        <div className="profile-avatar-medium">
                          <div className="profile-fallback">
                            {consultation.professional.split(' ').map(n => n[0]).join('')}
                          </div>
                        </div>
                        <div>
                          <h4 className="professional-name">{consultation.professional}</h4>
                          <p className="professional-specialty">{consultation.specialty}</p>
                          <div className="flex items-center gap-md text-muted">
                            <span><Calendar size={16} /> {formatDate(consultation.date)}</span>
                            <span>⏰ {consultation.time}</span>
                            <span><MapPin size={16} /> {consultation.type}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-sm">
                        <span 
                          style={{ 
                            padding: '4px 8px',
                            backgroundColor: getStatusColor(consultation.status),
                            color: 'white',
                            fontSize: 'var(--font-size-xs)',
                            fontWeight: '600'
                          }}
                        >
                          {consultation.status === 'confirmada' ? '<Check size={16} /> Confirmada' : '⏳ Pendente'}
                        </span>
                        <div className="flex gap-sm">
                          <Link 
                            to={`/chat?user=${consultation.id}`}
                            className="btn-professional btn-outline btn-sm"
                          >
                            <MessageCircle size={16} /> Chat
                          </Link>
                          <button className="btn-professional btn-secondary btn-sm">
                            <FileText size={16} /> Detalhes
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Estatísticas de Saúde */}
        <div className="card-professional">
          <div className="card-header">
            <h2 className="card-title"><Stethoscope size={16} /> Estatísticas de Saúde</h2>
            <p className="card-subtitle">Últimas medições registradas</p>
          </div>
          <div className="card-body">
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: 'var(--spacing-md)' 
            }}>
              {healthStats.map((stat, index) => (
                <div key={index} className="card-professional">
                  <div className="card-body text-center">
                    <div style={{ fontSize: '24px', marginBottom: 'var(--spacing-sm)' }}>
                      {stat.icon}
                    </div>
                    <h4 className="font-bold text-primary">{stat.value}</h4>
                    <p className="text-secondary">{stat.label}</p>
                    <span 
                      style={{ 
                        padding: '2px 8px',
                        backgroundColor: getHealthStatusColor(stat.status),
                        color: 'white',
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: '600'
                      }}
                    >
                      Normal
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Sidebar Direita */}
      <aside className="sidebar-right">
        {/* Lembretes de Hoje */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title">⏰ Lembretes de Hoje</h3>
          </div>
          <div className="card-body">
            <div className="flex flex-col gap-sm">
              {reminders.map((reminder) => (
                <div key={reminder.id} className="flex items-center gap-sm p-sm border">
                  <div style={{
                    width: '32px',
                    height: '32px',
                    backgroundColor: reminder.status === 'completed' ? 'var(--success-green)' : 'var(--primary-blue-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {reminder.type === 'medication' && '<Pill size={16} />'}
                    {reminder.type === 'appointment' && '<Calendar size={16} />'}
                    {reminder.type === 'exercise' && '🏃'}
                  </div>
                  <div className="flex-1">
                    <h5 className="font-bold text-primary">{reminder.title}</h5>
                    <p className="text-muted">{reminder.time}</p>
                  </div>
                  {reminder.status === 'pending' && (
                    <button className="btn-professional btn-outline btn-sm">
                      ✓
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Atividades Recentes */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title"><TrendingUp size={16} /> Atividades Recentes</h3>
          </div>
          <div className="card-body">
            <div className="activity-feed">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-avatar">
                    <div style={{
                      width: '32px',
                      height: '32px',
                      backgroundColor: activity.status === 'unread' ? 'var(--primary-blue)' : 'var(--primary-blue-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {activity.icon}
                    </div>
                  </div>
                  <div className="activity-content">
                    <div className="activity-header">
                      <span className="activity-author">{activity.title}</span>
                      <span className="activity-time">{activity.time}</span>
                    </div>
                    <p className="activity-text">{activity.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dicas de Saúde */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title"><Lightbulb size={16} /> Dicas de Saúde</h3>
          </div>
          <div className="card-body">
            <div className="flex flex-col gap-sm">
              <div className="bg-light p-sm">
                <h5 className="font-bold text-primary">💧 Hidratação</h5>
                <p className="text-secondary">Beba pelo menos 2 litros de água por dia</p>
              </div>
              <div className="bg-light p-sm">
                <h5 className="font-bold text-primary">🏃 Exercícios</h5>
                <p className="text-secondary">30 minutos de atividade física diária</p>
              </div>
              <div className="bg-light p-sm">
                <h5 className="font-bold text-primary">😴 Sono</h5>
                <p className="text-secondary">Durma de 7 a 9 horas por noite</p>
              </div>
            </div>
          </div>
        </div>

        {/* Progresso Mensal */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title"><BarChart3 size={16} /> Progresso Mensal</h3>
          </div>
          <div className="card-body">
            <div className="flex flex-col gap-sm">
              <div className="flex justify-between">
                <span className="text-secondary">Consultas realizadas</span>
                <span className="font-bold">8/10</span>
              </div>
              <div style={{
                width: '100%',
                height: '8px',
                backgroundColor: 'var(--border-light)',
                position: 'relative'
              }}>
                <div style={{
                  width: '80%',
                  height: '100%',
                  backgroundColor: 'var(--success-green)'
                }}></div>
              </div>
              
              <div className="flex justify-between">
                <span className="text-secondary">Medicamentos tomados</span>
                <span className="font-bold">28/30</span>
              </div>
              <div style={{
                width: '100%',
                height: '8px',
                backgroundColor: 'var(--border-light)',
                position: 'relative'
              }}>
                <div style={{
                  width: '93%',
                  height: '100%',
                  backgroundColor: 'var(--primary-blue)'
                }}></div>
              </div>

              <div className="flex justify-between">
                <span className="text-secondary">Exercícios realizados</span>
                <span className="font-bold">15/20</span>
              </div>
              <div style={{
                width: '100%',
                height: '8px',
                backgroundColor: 'var(--border-light)',
                position: 'relative'
              }}>
                <div style={{
                  width: '75%',
                  height: '100%',
                  backgroundColor: 'var(--warning-orange)'
                }}></div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}

export default Dashboard

