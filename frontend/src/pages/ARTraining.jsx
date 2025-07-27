import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const ARTraining = () => {
  const [activeTab, setActiveTab] = useState('courses')
  const [selectedCourse, setSelectedCourse] = useState(null)

  // Mock data para cursos de AR
  const arCourses = [
    {
      id: 1,
      title: 'Anatomia Cardíaca em 3D',
      category: 'Cardiologia',
      level: 'Intermediário',
      duration: '45 min',
      instructor: 'Dr. João Silva',
      rating: 4.9,
      students: 1247,
      description: 'Explore o coração humano em realidade aumentada com modelos 3D interativos',
      modules: 8,
      progress: 65,
      thumbnail: '🫀',
      skills: ['Anatomia Cardíaca', 'Visualização 3D', 'Diagnóstico'],
      prerequisites: ['Conhecimento básico de anatomia'],
      certification: true,
      price: 'Gratuito'
    },
    {
      id: 2,
      title: 'Técnicas de Fisioterapia AR',
      category: 'Fisioterapia',
      level: 'Avançado',
      duration: '60 min',
      instructor: 'Dr. Rafael Mendes',
      rating: 4.8,
      students: 856,
      description: 'Aprenda técnicas de reabilitação usando realidade aumentada',
      modules: 12,
      progress: 30,
      thumbnail: '🏃',
      skills: ['Reabilitação', 'Biomecânica', 'AR Therapy'],
      prerequisites: ['Formação em Fisioterapia'],
      certification: true,
      price: 'R$ 199'
    },
    {
      id: 3,
      title: 'Cirurgia Virtual - Básico',
      category: 'Cirurgia',
      level: 'Iniciante',
      duration: '90 min',
      instructor: 'Dra. Ana Costa',
      rating: 4.7,
      students: 2341,
      description: 'Simulação de procedimentos cirúrgicos em ambiente virtual seguro',
      modules: 15,
      progress: 0,
      thumbnail: '<Microscope size={16} />',
      skills: ['Técnica Cirúrgica', 'Precisão', 'Coordenação'],
      prerequisites: ['Estudante de Medicina'],
      certification: true,
      price: 'R$ 299'
    },
    {
      id: 4,
      title: 'Enfermagem Pediátrica AR',
      category: 'Enfermagem',
      level: 'Intermediário',
      duration: '40 min',
      instructor: 'Enfª Ana Carolina Silva',
      rating: 4.9,
      students: 1567,
      description: 'Cuidados pediátricos com suporte de realidade aumentada',
      modules: 10,
      progress: 80,
      thumbnail: '👶',
      skills: ['Cuidados Pediátricos', 'Comunicação', 'AR Interface'],
      prerequisites: ['Formação em Enfermagem'],
      certification: true,
      price: 'R$ 149'
    },
    {
      id: 5,
      title: 'Diagnóstico por Imagem 3D',
      category: 'Radiologia',
      level: 'Avançado',
      duration: '75 min',
      instructor: 'Dr. Carlos Oliveira',
      rating: 4.8,
      students: 934,
      description: 'Interpretação de exames médicos em ambiente 3D imersivo',
      modules: 14,
      progress: 45,
      thumbnail: '<Radio size={16} />',
      skills: ['Radiologia', 'Interpretação 3D', 'Diagnóstico'],
      prerequisites: ['Especialização em Radiologia'],
      certification: true,
      price: 'R$ 399'
    },
    {
      id: 6,
      title: 'Primeiros Socorros VR',
      category: 'Emergência',
      level: 'Iniciante',
      duration: '30 min',
      instructor: 'Dr. Paulo Mendes',
      rating: 4.6,
      students: 3456,
      description: 'Treinamento de primeiros socorros em realidade virtual',
      modules: 6,
      progress: 100,
      thumbnail: '🚑',
      skills: ['Primeiros Socorros', 'RCP', 'Emergência'],
      prerequisites: ['Nenhum'],
      certification: true,
      price: 'Gratuito'
    }
  ]

  // Mock data para sessões ativas
  const activeSessions = [
    {
      id: 1,
      title: 'Anatomia Cardíaca - Módulo 3',
      instructor: 'Dr. João Silva',
      participants: 23,
      startTime: '14:30',
      duration: '45 min',
      status: 'live'
    },
    {
      id: 2,
      title: 'Cirurgia Virtual - Prática',
      instructor: 'Dra. Ana Costa',
      participants: 15,
      startTime: '15:00',
      duration: '60 min',
      status: 'starting'
    },
    {
      id: 3,
      title: 'Fisioterapia AR - Workshop',
      instructor: 'Dr. Rafael Mendes',
      participants: 31,
      startTime: '16:00',
      duration: '90 min',
      status: 'scheduled'
    }
  ]

  // Mock data para equipamentos AR
  const arEquipment = [
    {
      id: 1,
      name: 'HoloLens Medical Pro',
      type: 'Headset AR',
      status: 'available',
      battery: 85,
      lastUsed: '2 horas atrás',
      features: ['Tracking 6DOF', 'Hand Tracking', 'Voice Commands'],
      compatibility: ['Anatomia 3D', 'Cirurgia Virtual', 'Diagnóstico']
    },
    {
      id: 2,
      name: 'Magic Leap Health',
      type: 'Headset AR',
      status: 'in-use',
      battery: 67,
      lastUsed: 'Em uso',
      features: ['Eye Tracking', 'Spatial Audio', 'Gesture Control'],
      compatibility: ['Fisioterapia AR', 'Enfermagem', 'Radiologia']
    },
    {
      id: 3,
      name: 'ARCore Medical Tablet',
      type: 'Tablet AR',
      status: 'available',
      battery: 92,
      lastUsed: '30 min atrás',
      features: ['Portabilidade', 'Touch Interface', 'Cloud Sync'],
      compatibility: ['Primeiros Socorros', 'Anatomia Básica']
    },
    {
      id: 4,
      name: 'VR Surgery Simulator',
      type: 'VR Headset',
      status: 'maintenance',
      battery: 0,
      lastUsed: '1 dia atrás',
      features: ['Haptic Feedback', 'High Resolution', 'Precision Tracking'],
      compatibility: ['Cirurgia Virtual', 'Procedimentos Avançados']
    }
  ]

  // Mock data para instrutores AR
  const arInstructors = [
    {
      id: 1,
      name: 'Dr. João Silva',
      specialty: 'Cardiologia + AR',
      avatar: '/images/professionals/doctor1.jpg',
      experience: '8 anos',
      arCourses: 15,
      rating: 4.9,
      students: 2847
    },
    {
      id: 2,
      name: 'Dra. Ana Costa',
      specialty: 'Cirurgia Virtual',
      avatar: '/images/professionals/doctor2.jpg',
      experience: '12 anos',
      arCourses: 8,
      rating: 4.8,
      students: 1923
    },
    {
      id: 3,
      name: 'Dr. Rafael Mendes',
      specialty: 'Fisioterapia AR',
      avatar: '/images/professionals/physio1.jpg',
      experience: '6 anos',
      arCourses: 12,
      rating: 4.9,
      students: 1567
    }
  ]

  // Mock data para conquistas
  const achievements = [
    {
      id: 1,
      title: 'Primeiro Curso Completo',
      description: 'Complete seu primeiro curso de AR',
      icon: '<Trophy size={16} />',
      earned: true,
      date: '2024-06-15'
    },
    {
      id: 2,
      title: 'Especialista em Anatomia',
      description: 'Complete 5 cursos de anatomia',
      icon: '🫀',
      earned: true,
      date: '2024-06-18'
    },
    {
      id: 3,
      title: 'Instrutor Iniciante',
      description: 'Ajude 10 colegas em sessões',
      icon: '👨‍🏫',
      earned: false,
      progress: 7
    },
    {
      id: 4,
      title: 'Mestre em VR',
      description: 'Complete 20 horas de treinamento VR',
      icon: '<Glasses size={16} />',
      earned: false,
      progress: 15
    }
  ]

  const getLevelColor = (level) => {
    switch (level) {
      case 'Iniciante': return 'var(--success-green)'
      case 'Intermediário': return 'var(--warning-orange)'
      case 'Avançado': return 'var(--error-red)'
      default: return 'var(--primary-blue)'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'var(--success-green)'
      case 'in-use': return 'var(--warning-orange)'
      case 'maintenance': return 'var(--error-red)'
      default: return 'var(--text-muted)'
    }
  }

  const getSessionStatusColor = (status) => {
    switch (status) {
      case 'live': return 'var(--error-red)'
      case 'starting': return 'var(--warning-orange)'
      case 'scheduled': return 'var(--primary-blue)'
      default: return 'var(--text-muted)'
    }
  }

  const getSessionStatusText = (status) => {
    switch (status) {
      case 'live': return '🔴 AO VIVO'
      case 'starting': return '🟡 INICIANDO'
      case 'scheduled': return '🔵 AGENDADO'
      default: return 'INDEFINIDO'
    }
  }

  const formatProgress = (progress) => {
    return `${progress}%`
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
            <p className="profile-title">Estudante de Medicina</p>
            <div className="profile-stats">
              <div className="profile-stat">
                <span className="profile-stat-number">6</span>
                <span className="profile-stat-label">Cursos</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat-number">45h</span>
                <span className="profile-stat-label">Treinamento</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navegação */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title">🧭 Navegação</h3>
          </div>
          <div className="card-body">
            <nav className="flex flex-col gap-sm">
              <Link to="/" className="activity-action">
                🏠 Início
              </Link>
              <Link to="/dashboard" className="activity-action">
                <BarChart3 size={16} /> Dashboard
              </Link>
              <Link to="/ai-health" className="activity-action">
                <Bot size={16} /> IA Saúde
              </Link>
              <Link to="/iot-monitor" className="activity-action">
                <Radio size={16} /> IoT Monitor
              </Link>
            </nav>
          </div>
        </div>

        {/* Progresso Geral */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title"><TrendingUp size={16} /> Meu Progresso</h3>
          </div>
          <div className="card-body">
            <div className="flex flex-col gap-sm">
              <div className="flex justify-between">
                <span className="text-secondary">Cursos concluídos</span>
                <span className="font-bold">2/6</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Horas de treinamento</span>
                <span className="font-bold">45h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Certificações</span>
                <span className="font-bold">3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Ranking</span>
                <span className="font-bold text-blue">#127</span>
              </div>
            </div>
          </div>
        </div>

        {/* Equipamentos Disponíveis */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title"><Glasses size={16} /> Equipamentos</h3>
          </div>
          <div className="card-body">
            <div className="flex flex-col gap-sm">
              {arEquipment.slice(0, 3).map((equipment) => (
                <div key={equipment.id} className="flex items-center gap-sm">
                  <div style={{
                    width: '8px',
                    height: '8px',
                    backgroundColor: getStatusColor(equipment.status)
                  }}></div>
                  <div className="flex-1">
                    <h5 className="font-bold text-primary">{equipment.name}</h5>
                    <p className="text-muted">{equipment.type}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="btn-professional btn-outline btn-sm" style={{ marginTop: 'var(--spacing-sm)' }}>
              Ver Todos
            </button>
          </div>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="content-main">
        {/* Header do AR Training */}
        <div className="card-professional">
          <div className="card-body">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="card-title" style={{ fontSize: 'var(--font-size-2xl)', margin: '0 0 8px 0' }}>
                  <Glasses size={16} /> AR Training
                </h1>
                <p className="card-subtitle">Treinamento médico em realidade aumentada e virtual</p>
              </div>
              <div className="flex gap-sm">
                <button
                  onClick={() => setActiveTab('courses')}
                  className={`btn-professional btn-sm ${activeTab === 'courses' ? 'btn-primary' : 'btn-outline'}`}
                >
                  📚 Cursos
                </button>
                <button
                  onClick={() => setActiveTab('sessions')}
                  className={`btn-professional btn-sm ${activeTab === 'sessions' ? 'btn-primary' : 'btn-outline'}`}
                >
                  🎥 Sessões
                </button>
                <button
                  onClick={() => setActiveTab('equipment')}
                  className={`btn-professional btn-sm ${activeTab === 'equipment' ? 'btn-primary' : 'btn-outline'}`}
                >
                  <Glasses size={16} /> Equipamentos
                </button>
                <button
                  onClick={() => setActiveTab('achievements')}
                  className={`btn-professional btn-sm ${activeTab === 'achievements' ? 'btn-primary' : 'btn-outline'}`}
                >
                  <Trophy size={16} /> Conquistas
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Cursos de AR */}
        {activeTab === 'courses' && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
            gap: 'var(--spacing-md)' 
          }}>
            {arCourses.map((course) => (
              <div key={course.id} className="card-professional">
                <div className="card-header">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-sm">
                      <div style={{ fontSize: '32px' }}>{course.thumbnail}</div>
                      <div>
                        <h3 className="card-title">{course.title}</h3>
                        <p className="card-subtitle">{course.category}</p>
                      </div>
                    </div>
                    <div>
                      <span style={{
                        padding: '4px 8px',
                        backgroundColor: getLevelColor(course.level),
                        color: 'white',
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: '600'
                      }}>
                        {course.level}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <p className="text-secondary mb-4">{course.description}</p>
                  
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-sm">
                      <span className="text-secondary"><Star size={16} /> {course.rating}</span>
                      <span className="text-muted">({course.students} alunos)</span>
                    </div>
                    <div className="flex items-center gap-sm">
                      <span className="text-secondary">⏱️ {course.duration}</span>
                      <span className="text-muted">📚 {course.modules} módulos</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-secondary">Progresso:</span>
                      <span className="font-bold">{formatProgress(course.progress)}</span>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '8px',
                      backgroundColor: 'var(--background-tertiary)',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${course.progress}%`,
                        height: '100%',
                        backgroundColor: 'var(--primary-blue)',
                        transition: 'width 0.3s ease'
                      }}></div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h5 className="font-bold text-primary mb-2">Habilidades:</h5>
                    <div className="flex flex-wrap gap-sm">
                      {course.skills.map((skill, index) => (
                        <span key={index} style={{
                          padding: '2px 6px',
                          backgroundColor: 'var(--primary-blue-light)',
                          color: 'var(--primary-blue)',
                          fontSize: 'var(--font-size-xs)',
                          fontWeight: '600'
                        }}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <span className="text-secondary">Instrutor:</span>
                      <span className="font-bold ml-2">{course.instructor}</span>
                    </div>
                    <div>
                      <span className="font-bold text-blue">{course.price}</span>
                      {course.certification && (
                        <span className="ml-2"><Trophy size={16} /> Certificado</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-sm">
                    <button 
                      onClick={() => setSelectedCourse(course)}
                      className="btn-professional btn-primary btn-sm flex-1"
                    >
                      {course.progress > 0 ? '▶️ Continuar' : '<Rocket size={16} /> Iniciar'}
                    </button>
                    <button className="btn-professional btn-outline btn-sm">
                      <Info size={16} /> Detalhes
                    </button>
                    <button className="btn-professional btn-outline btn-sm">
                      <MessageCircle size={16} /> Chat
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Sessões Ativas */}
        {activeTab === 'sessions' && (
          <div className="flex flex-col gap-md">
            {activeSessions.map((session) => (
              <div key={session.id} className="card-professional">
                <div className="card-body">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-md">
                      <div style={{
                        width: '60px',
                        height: '60px',
                        backgroundColor: 'var(--primary-blue-light)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px'
                      }}>
                        🎥
                      </div>
                      <div>
                        <h3 className="card-title">{session.title}</h3>
                        <p className="card-subtitle">Instrutor: {session.instructor}</p>
                        <div className="flex items-center gap-md text-muted">
                          <span><Users size={16} /> {session.participants} participantes</span>
                          <span>⏰ {session.startTime}</span>
                          <span>⏱️ {session.duration}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-sm">
                      <span style={{
                        padding: '4px 8px',
                        backgroundColor: getSessionStatusColor(session.status),
                        color: 'white',
                        fontSize: 'var(--font-size-sm)',
                        fontWeight: '600'
                      }}>
                        {getSessionStatusText(session.status)}
                      </span>
                      <div className="flex gap-sm">
                        <button className="btn-professional btn-primary btn-sm">
                          {session.status === 'live' ? '🔴 Entrar' : '<Calendar size={16} /> Participar'}
                        </button>
                        <button className="btn-professional btn-outline btn-sm">
                          <Info size={16} /> Info
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="card-professional">
              <div className="card-header">
                <h2 className="card-title"><Calendar size={16} /> Próximas Sessões</h2>
              </div>
              <div className="card-body">
                <div className="flex flex-col gap-sm">
                  <div className="bg-light p-md">
                    <h4 className="font-bold text-primary">🫀 Anatomia Cardíaca Avançada</h4>
                    <p className="text-secondary">Dr. João Silva • Amanhã às 14:00</p>
                    <button className="btn-professional btn-outline btn-sm">Agendar Lembrete</button>
                  </div>
                  <div className="bg-light p-md">
                    <h4 className="font-bold text-primary">🏃 Workshop Fisioterapia VR</h4>
                    <p className="text-secondary">Dr. Rafael Mendes • Sexta às 16:30</p>
                    <button className="btn-professional btn-outline btn-sm">Agendar Lembrete</button>
                  </div>
                  <div className="bg-light p-md">
                    <h4 className="font-bold text-primary"><Microscope size={16} /> Cirurgia Virtual Masterclass</h4>
                    <p className="text-secondary">Dra. Ana Costa • Sábado às 10:00</p>
                    <button className="btn-professional btn-outline btn-sm">Agendar Lembrete</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Equipamentos AR/VR */}
        {activeTab === 'equipment' && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
            gap: 'var(--spacing-md)' 
          }}>
            {arEquipment.map((equipment) => (
              <div key={equipment.id} className="card-professional">
                <div className="card-header">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="card-title">{equipment.name}</h3>
                      <p className="card-subtitle">{equipment.type}</p>
                    </div>
                    <div className="flex items-center gap-sm">
                      <div style={{
                        width: '12px',
                        height: '12px',
                        backgroundColor: getStatusColor(equipment.status)
                      }}></div>
                      <span style={{
                        padding: '2px 6px',
                        backgroundColor: getStatusColor(equipment.status),
                        color: 'white',
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: '600'
                      }}>
                        {equipment.status === 'available' && 'Disponível'}
                        {equipment.status === 'in-use' && 'Em Uso'}
                        {equipment.status === 'maintenance' && 'Manutenção'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <span className="text-secondary">Bateria:</span>
                      <span className="font-bold ml-2"><Battery size={16} /> {equipment.battery}%</span>
                    </div>
                    <div>
                      <span className="text-secondary">Último uso:</span>
                      <span className="font-bold ml-2">{equipment.lastUsed}</span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h5 className="font-bold text-primary mb-2">Recursos:</h5>
                    <div className="flex flex-wrap gap-sm">
                      {equipment.features.map((feature, index) => (
                        <span key={index} style={{
                          padding: '2px 6px',
                          backgroundColor: 'var(--primary-blue-light)',
                          color: 'var(--primary-blue)',
                          fontSize: 'var(--font-size-xs)',
                          fontWeight: '600'
                        }}>
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <h5 className="font-bold text-primary mb-2">Compatibilidade:</h5>
                    <div className="flex flex-wrap gap-sm">
                      {equipment.compatibility.map((comp, index) => (
                        <span key={index} style={{
                          padding: '2px 6px',
                          backgroundColor: 'var(--background-tertiary)',
                          color: 'var(--text-secondary)',
                          fontSize: 'var(--font-size-xs)',
                          fontWeight: '600'
                        }}>
                          {comp}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-sm">
                    <button 
                      className="btn-professional btn-primary btn-sm flex-1"
                      disabled={equipment.status !== 'available'}
                    >
                      {equipment.status === 'available' ? '<Target size={16} /> Reservar' : '⏳ Indisponível'}
                    </button>
                    <button className="btn-professional btn-outline btn-sm">
                      <Info size={16} /> Detalhes
                    </button>
                    <button className="btn-professional btn-outline btn-sm">
                      <FileText size={16} /> Manual
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Conquistas */}
        {activeTab === 'achievements' && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: 'var(--spacing-md)' 
          }}>
            {achievements.map((achievement) => (
              <div key={achievement.id} className="card-professional">
                <div className="card-body text-center">
                  <div style={{ 
                    fontSize: '48px', 
                    marginBottom: 'var(--spacing-md)',
                    opacity: achievement.earned ? 1 : 0.3
                  }}>
                    {achievement.icon}
                  </div>
                  <h3 className="card-title">{achievement.title}</h3>
                  <p className="card-subtitle">{achievement.description}</p>
                  
                  {achievement.earned ? (
                    <div style={{ marginTop: 'var(--spacing-md)' }}>
                      <span style={{
                        padding: '4px 8px',
                        backgroundColor: 'var(--success-green)',
                        color: 'white',
                        fontSize: 'var(--font-size-sm)',
                        fontWeight: '600'
                      }}>
                        <Check size={16} /> Conquistado
                      </span>
                      <p className="text-muted" style={{ marginTop: 'var(--spacing-xs)' }}>
                        {achievement.date}
                      </p>
                    </div>
                  ) : (
                    <div style={{ marginTop: 'var(--spacing-md)' }}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-secondary">Progresso:</span>
                        <span className="font-bold">{achievement.progress}/20</span>
                      </div>
                      <div style={{
                        width: '100%',
                        height: '8px',
                        backgroundColor: 'var(--background-tertiary)',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${(achievement.progress / 20) * 100}%`,
                          height: '100%',
                          backgroundColor: 'var(--primary-blue)',
                          transition: 'width 0.3s ease'
                        }}></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Sidebar Direita */}
      <aside className="sidebar-right">
        {/* Instrutores AR */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title">👨‍🏫 Instrutores AR</h3>
          </div>
          <div className="card-body">
            <div className="flex flex-col gap-md">
              {arInstructors.map((instructor) => (
                <div key={instructor.id} className="flex items-center gap-sm">
                  <div className="profile-avatar-small">
                    <img 
                      src={instructor.avatar} 
                      alt={instructor.name}
                      className="profile-image"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'flex'
                      }}
                    />
                    <div className="profile-fallback" style={{ display: 'none' }}>
                      {instructor.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h5 className="font-bold text-primary">{instructor.name}</h5>
                    <p className="text-muted">{instructor.specialty}</p>
                    <div className="flex items-center gap-sm text-muted">
                      <span><Star size={16} /> {instructor.rating}</span>
                      <span>🎓 {instructor.arCourses} cursos</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/network" className="btn-professional btn-outline btn-sm" style={{ marginTop: 'var(--spacing-md)' }}>
              Ver Mais Instrutores
            </Link>
          </div>
        </div>

        {/* Estatísticas AR */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title"><BarChart3 size={16} /> Estatísticas</h3>
          </div>
          <div className="card-body">
            <div className="flex flex-col gap-sm">
              <div className="flex justify-between">
                <span className="text-secondary">Horas de treinamento</span>
                <span className="font-bold">45h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Cursos concluídos</span>
                <span className="font-bold">2</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Certificações</span>
                <span className="font-bold">3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Ranking global</span>
                <span className="font-bold text-blue">#127</span>
              </div>
            </div>
          </div>
        </div>

        {/* Próximos Eventos */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title"><Calendar size={16} /> Próximos Eventos</h3>
          </div>
          <div className="card-body">
            <div className="flex flex-col gap-sm">
              <div className="bg-light p-sm">
                <h5 className="font-bold text-primary"><Glasses size={16} /> VR Medical Summit</h5>
                <p className="text-secondary">Conferência internacional</p>
                <small className="text-muted">25-27 Junho</small>
              </div>
              <div className="bg-light p-sm">
                <h5 className="font-bold text-primary"><Trophy size={16} /> AR Training Awards</h5>
                <p className="text-secondary">Premiação anual</p>
                <small className="text-muted">15 Julho</small>
              </div>
              <div className="bg-light p-sm">
                <h5 className="font-bold text-primary">🎓 Certificação Avançada</h5>
                <p className="text-secondary">Exame de certificação</p>
                <small className="text-muted">30 Julho</small>
              </div>
            </div>
          </div>
        </div>

        {/* Dicas AR */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title"><Lightbulb size={16} /> Dica AR</h3>
          </div>
          <div className="card-body">
            <div className="bg-light p-md text-center">
              <div style={{ fontSize: '32px', marginBottom: 'var(--spacing-sm)' }}><Glasses size={16} /></div>
              <h4 className="font-bold text-primary">Calibre Sempre</h4>
              <p className="text-secondary">Calibre seu headset AR antes de cada sessão para melhor precisão</p>
            </div>
          </div>
        </div>

        {/* Comunidade AR */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title"><Users size={16} /> Comunidade</h3>
          </div>
          <div className="card-body">
            <div className="flex flex-col gap-sm">
              <div className="flex justify-between">
                <span className="text-secondary">Estudantes ativos</span>
                <span className="font-bold">2,847</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Sessões hoje</span>
                <span className="font-bold">23</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Horas de treinamento</span>
                <span className="font-bold">15,678h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Certificações emitidas</span>
                <span className="font-bold">1,234</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}

export default ARTraining

