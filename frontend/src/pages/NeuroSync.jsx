import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const NeuroSync = () => {
  const [activeTab, setActiveTab] = useState('monitoring')
  const [isRecording, setIsRecording] = useState(false)
  const [brainwaveData, setBrainwaveData] = useState({
    alpha: 45,
    beta: 32,
    theta: 18,
    delta: 5
  })

  // Simulação de dados em tempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setBrainwaveData({
        alpha: Math.floor(Math.random() * 20) + 35,
        beta: Math.floor(Math.random() * 15) + 25,
        theta: Math.floor(Math.random() * 10) + 13,
        delta: Math.floor(Math.random() * 8) + 2
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  // Mock data para sessões de neurofeedback
  const neurofeedbackSessions = [
    {
      id: 1,
      title: 'Meditação Focada',
      type: 'Concentração',
      duration: '15 min',
      difficulty: 'Iniciante',
      description: 'Exercício de foco e concentração com feedback em tempo real',
      benefits: ['Melhora concentração', 'Reduz ansiedade', 'Aumenta foco'],
      completed: true,
      score: 87,
      date: '2024-06-20'
    },
    {
      id: 2,
      title: 'Relaxamento Profundo',
      type: 'Relaxamento',
      duration: '20 min',
      difficulty: 'Intermediário',
      description: 'Técnica de relaxamento com monitoramento de ondas alpha',
      benefits: ['Reduz estresse', 'Melhora sono', 'Equilibra emoções'],
      completed: true,
      score: 92,
      date: '2024-06-19'
    },
    {
      id: 3,
      title: 'Treinamento Cognitivo',
      type: 'Cognição',
      duration: '25 min',
      difficulty: 'Avançado',
      description: 'Exercícios para melhorar função cognitiva e memória',
      benefits: ['Melhora memória', 'Aumenta agilidade mental', 'Otimiza aprendizado'],
      completed: false,
      score: null,
      date: null
    },
    {
      id: 4,
      title: 'Controle de Ansiedade',
      type: 'Terapêutico',
      duration: '18 min',
      difficulty: 'Intermediário',
      description: 'Protocolo específico para redução de ansiedade',
      benefits: ['Controla ansiedade', 'Melhora autocontrole', 'Reduz tensão'],
      completed: false,
      score: null,
      date: null
    },
    {
      id: 5,
      title: 'Performance Atlética',
      type: 'Performance',
      duration: '30 min',
      difficulty: 'Avançado',
      description: 'Otimização do estado mental para performance esportiva',
      benefits: ['Melhora performance', 'Aumenta foco', 'Reduz pressão'],
      completed: true,
      score: 78,
      date: '2024-06-18'
    },
    {
      id: 6,
      title: 'Criatividade e Flow',
      type: 'Criatividade',
      duration: '22 min',
      difficulty: 'Intermediário',
      description: 'Estimulação de ondas theta para criatividade',
      benefits: ['Aumenta criatividade', 'Facilita insights', 'Melhora flow'],
      completed: false,
      score: null,
      date: null
    }
  ]

  // Mock data para dispositivos conectados
  const connectedDevices = [
    {
      id: 1,
      name: 'NeuroSky MindWave',
      type: 'EEG Headset',
      status: 'connected',
      battery: 78,
      signalQuality: 'Excelente',
      lastSync: '2 min atrás',
      channels: 1,
      sampleRate: '512 Hz'
    },
    {
      id: 2,
      name: 'Emotiv EPOC X',
      type: 'EEG Multi-canal',
      status: 'connected',
      battery: 92,
      signalQuality: 'Boa',
      lastSync: '1 min atrás',
      channels: 14,
      sampleRate: '2048 Hz'
    },
    {
      id: 3,
      name: 'Muse 2 Headband',
      type: 'Meditation Device',
      status: 'disconnected',
      battery: 45,
      signalQuality: 'N/A',
      lastSync: '2 horas atrás',
      channels: 4,
      sampleRate: '256 Hz'
    },
    {
      id: 4,
      name: 'OpenBCI Cyton',
      type: 'Research Grade',
      status: 'maintenance',
      battery: 0,
      signalQuality: 'N/A',
      lastSync: '1 dia atrás',
      channels: 8,
      sampleRate: '1000 Hz'
    }
  ]

  // Mock data para análises
  const brainAnalytics = [
    {
      metric: 'Nível de Concentração',
      value: 78,
      trend: 'up',
      change: '+12%',
      description: 'Melhoria significativa na última semana'
    },
    {
      metric: 'Estado de Relaxamento',
      value: 85,
      trend: 'up',
      change: '+8%',
      description: 'Ondas alpha consistentemente altas'
    },
    {
      metric: 'Qualidade do Sono',
      value: 72,
      trend: 'down',
      change: '-5%',
      description: 'Ondas delta ligeiramente reduzidas'
    },
    {
      metric: 'Estresse Mental',
      value: 34,
      trend: 'down',
      change: '-15%',
      description: 'Redução significativa do estresse'
    },
    {
      metric: 'Atividade Cognitiva',
      value: 89,
      trend: 'up',
      change: '+18%',
      description: 'Ondas beta otimizadas para cognição'
    },
    {
      metric: 'Equilíbrio Emocional',
      value: 76,
      trend: 'stable',
      change: '0%',
      description: 'Estado emocional estável'
    }
  ]

  // Mock data para especialistas
  const neuroSpecialists = [
    {
      id: 1,
      name: 'Dr. Carlos Neurologia',
      specialty: 'Neurofeedback Clínico',
      avatar: '/images/professionals/doctor3.jpg',
      experience: '15 anos',
      sessions: 2847,
      rating: 4.9,
      available: true
    },
    {
      id: 2,
      name: 'Dra. Ana Psicologia',
      specialty: 'Neuropsicologia',
      avatar: '/images/professionals/doctor4.jpg',
      experience: '12 anos',
      sessions: 1923,
      rating: 4.8,
      available: false
    },
    {
      id: 3,
      name: 'Dr. Paulo Neurofeedback',
      specialty: 'Performance Mental',
      avatar: '/images/professionals/doctor1.jpg',
      experience: '8 anos',
      sessions: 1456,
      rating: 4.7,
      available: true
    }
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected': return 'var(--success-green)'
      case 'disconnected': return 'var(--warning-orange)'
      case 'maintenance': return 'var(--error-red)'
      default: return 'var(--text-muted)'
    }
  }

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return '<TrendingUp size={16} />'
      case 'down': return '📉'
      case 'stable': return '<ArrowRight size={16} />'
      default: return '<BarChart3 size={16} />'
    }
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Iniciante': return 'var(--success-green)'
      case 'Intermediário': return 'var(--warning-orange)'
      case 'Avançado': return 'var(--error-red)'
      default: return 'var(--primary-blue)'
    }
  }

  const getBrainwaveColor = (type) => {
    switch (type) {
      case 'alpha': return '#4CAF50'
      case 'beta': return '#2196F3'
      case 'theta': return '#FF9800'
      case 'delta': return '#9C27B0'
      default: return 'var(--primary-blue)'
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
            <p className="profile-title">Paciente NeuroSync</p>
            <div className="profile-stats">
              <div className="profile-stat">
                <span className="profile-stat-number">47</span>
                <span className="profile-stat-label">Sessões</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat-number">89</span>
                <span className="profile-stat-label">Score</span>
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
              <Link to="/ar-training" className="activity-action">
                <Glasses size={16} /> AR Training
              </Link>
            </nav>
          </div>
        </div>

        {/* Status Atual */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title"><Brain size={16} /> Status Atual</h3>
          </div>
          <div className="card-body">
            <div className="flex flex-col gap-sm">
              <div className="flex justify-between">
                <span className="text-secondary">Estado Mental</span>
                <span className="font-bold text-blue">Focado</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Nível de Estresse</span>
                <span className="font-bold" style={{ color: 'var(--success-green)' }}>Baixo</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Qualidade do Sinal</span>
                <span className="font-bold" style={{ color: 'var(--success-green)' }}>Excelente</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Sessão Ativa</span>
                <span className="font-bold">{isRecording ? '🔴 Gravando' : '⏸️ Pausado'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dispositivos Conectados */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title"><Radio size={16} /> Dispositivos</h3>
          </div>
          <div className="card-body">
            <div className="flex flex-col gap-sm">
              {connectedDevices.slice(0, 2).map((device) => (
                <div key={device.id} className="flex items-center gap-sm">
                  <div style={{
                    width: '8px',
                    height: '8px',
                    backgroundColor: getStatusColor(device.status)
                  }}></div>
                  <div className="flex-1">
                    <h5 className="font-bold text-primary">{device.name}</h5>
                    <p className="text-muted">{device.type}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="btn-professional btn-outline btn-sm" style={{ marginTop: 'var(--spacing-sm)' }}>
              Gerenciar Dispositivos
            </button>
          </div>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="content-main">
        {/* Header do NeuroSync */}
        <div className="card-professional">
          <div className="card-body">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="card-title" style={{ fontSize: 'var(--font-size-2xl)', margin: '0 0 8px 0' }}>
                  <Brain size={16} /> NeuroSync
                </h1>
                <p className="card-subtitle">Monitoramento neurológico e neurofeedback avançado</p>
              </div>
              <div className="flex gap-sm">
                <button
                  onClick={() => setActiveTab('monitoring')}
                  className={`btn-professional btn-sm ${activeTab === 'monitoring' ? 'btn-primary' : 'btn-outline'}`}
                >
                  <BarChart3 size={16} /> Monitoramento
                </button>
                <button
                  onClick={() => setActiveTab('sessions')}
                  className={`btn-professional btn-sm ${activeTab === 'sessions' ? 'btn-primary' : 'btn-outline'}`}
                >
                  <Target size={16} /> Sessões
                </button>
                <button
                  onClick={() => setActiveTab('devices')}
                  className={`btn-professional btn-sm ${activeTab === 'devices' ? 'btn-primary' : 'btn-outline'}`}
                >
                  <Radio size={16} /> Dispositivos
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`btn-professional btn-sm ${activeTab === 'analytics' ? 'btn-primary' : 'btn-outline'}`}
                >
                  <TrendingUp size={16} /> Análises
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Monitoramento em Tempo Real */}
        {activeTab === 'monitoring' && (
          <div className="flex flex-col gap-md">
            {/* Ondas Cerebrais */}
            <div className="card-professional">
              <div className="card-header">
                <div className="flex justify-between items-center">
                  <h2 className="card-title">🌊 Ondas Cerebrais em Tempo Real</h2>
                  <button 
                    onClick={() => setIsRecording(!isRecording)}
                    className={`btn-professional btn-sm ${isRecording ? 'btn-secondary' : 'btn-primary'}`}
                  >
                    {isRecording ? '⏸️ Pausar' : '▶️ Iniciar'} Gravação
                  </button>
                </div>
              </div>
              <div className="card-body">
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                  gap: 'var(--spacing-md)' 
                }}>
                  {Object.entries(brainwaveData).map(([type, value]) => (
                    <div key={type} className="text-center">
                      <h4 className="font-bold text-primary" style={{ textTransform: 'capitalize' }}>
                        {type} ({type === 'alpha' ? '8-12 Hz' : type === 'beta' ? '13-30 Hz' : type === 'theta' ? '4-7 Hz' : '0.5-3 Hz'})
                      </h4>
                      <div style={{
                        width: '120px',
                        height: '120px',
                        margin: '0 auto',
                        borderRadius: '50%',
                        background: `conic-gradient(${getBrainwaveColor(type)} ${value * 3.6}deg, var(--background-tertiary) 0deg)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative'
                      }}>
                        <div style={{
                          width: '80px',
                          height: '80px',
                          backgroundColor: 'var(--background-primary)',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 'var(--font-size-xl)',
                          fontWeight: 'bold',
                          color: getBrainwaveColor(type)
                        }}>
                          {value}%
                        </div>
                      </div>
                      <p className="text-secondary" style={{ marginTop: 'var(--spacing-sm)' }}>
                        {type === 'alpha' && 'Relaxamento'}
                        {type === 'beta' && 'Concentração'}
                        {type === 'theta' && 'Criatividade'}
                        {type === 'delta' && 'Sono Profundo'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Métricas Instantâneas */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: 'var(--spacing-md)' 
            }}>
              <div className="card-professional">
                <div className="card-body text-center">
                  <div style={{ fontSize: '48px', marginBottom: 'var(--spacing-sm)' }}><Target size={16} /></div>
                  <h3 className="card-title">Nível de Foco</h3>
                  <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'bold', color: 'var(--primary-blue)' }}>
                    78%
                  </div>
                  <p className="text-secondary">Concentração alta</p>
                </div>
              </div>

              <div className="card-professional">
                <div className="card-body text-center">
                  <div style={{ fontSize: '48px', marginBottom: 'var(--spacing-sm)' }}>😌</div>
                  <h3 className="card-title">Estado de Calma</h3>
                  <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'bold', color: 'var(--success-green)' }}>
                    85%
                  </div>
                  <p className="text-secondary">Muito relaxado</p>
                </div>
              </div>

              <div className="card-professional">
                <div className="card-body text-center">
                  <div style={{ fontSize: '48px', marginBottom: 'var(--spacing-sm)' }}><Zap size={16} /></div>
                  <h3 className="card-title">Atividade Mental</h3>
                  <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'bold', color: 'var(--warning-orange)' }}>
                    67%
                  </div>
                  <p className="text-secondary">Moderadamente ativo</p>
                </div>
              </div>

              <div className="card-professional">
                <div className="card-body text-center">
                  <div style={{ fontSize: '48px', marginBottom: 'var(--spacing-sm)' }}>💤</div>
                  <h3 className="card-title">Sonolência</h3>
                  <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'bold', color: 'var(--text-muted)' }}>
                    12%
                  </div>
                  <p className="text-secondary">Bem alerta</p>
                </div>
              </div>
            </div>

            {/* Gráfico de Tendência */}
            <div className="card-professional">
              <div className="card-header">
                <h2 className="card-title"><TrendingUp size={16} /> Tendência dos Últimos 30 Minutos</h2>
              </div>
              <div className="card-body">
                <div style={{
                  height: '200px',
                  backgroundColor: 'var(--background-tertiary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-secondary)'
                }}>
                  <BarChart3 size={16} /> Gráfico de ondas cerebrais em tempo real
                  <br />
                  (Simulação de interface de monitoramento)
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sessões de Neurofeedback */}
        {activeTab === 'sessions' && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
            gap: 'var(--spacing-md)' 
          }}>
            {neurofeedbackSessions.map((session) => (
              <div key={session.id} className="card-professional">
                <div className="card-header">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="card-title">{session.title}</h3>
                      <p className="card-subtitle">{session.type}</p>
                    </div>
                    <div>
                      <span style={{
                        padding: '4px 8px',
                        backgroundColor: getDifficultyColor(session.difficulty),
                        color: 'white',
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: '600'
                      }}>
                        {session.difficulty}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <p className="text-secondary mb-4">{session.description}</p>
                  
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-sm">
                      <span className="text-secondary">⏱️ {session.duration}</span>
                    </div>
                    {session.completed && (
                      <div className="flex items-center gap-sm">
                        <span className="text-secondary">Score:</span>
                        <span className="font-bold text-blue">{session.score}%</span>
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <h5 className="font-bold text-primary mb-2">Benefícios:</h5>
                    <div className="flex flex-wrap gap-sm">
                      {session.benefits.map((benefit, index) => (
                        <span key={index} style={{
                          padding: '2px 6px',
                          backgroundColor: 'var(--primary-blue-light)',
                          color: 'var(--primary-blue)',
                          fontSize: 'var(--font-size-xs)',
                          fontWeight: '600'
                        }}>
                          {benefit}
                        </span>
                      ))}
                    </div>
                  </div>

                  {session.completed && (
                    <div className="mb-4">
                      <span style={{
                        padding: '4px 8px',
                        backgroundColor: 'var(--success-green)',
                        color: 'white',
                        fontSize: 'var(--font-size-sm)',
                        fontWeight: '600'
                      }}>
                        <Check size={16} /> Concluído em {session.date}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex gap-sm">
                    <button className="btn-professional btn-primary btn-sm flex-1">
                      {session.completed ? '<RefreshCw size={16} /> Repetir' : '▶️ Iniciar'}
                    </button>
                    <button className="btn-professional btn-outline btn-sm">
                      <Info size={16} /> Detalhes
                    </button>
                    <button className="btn-professional btn-outline btn-sm">
                      <BarChart3 size={16} /> Histórico
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Dispositivos */}
        {activeTab === 'devices' && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
            gap: 'var(--spacing-md)' 
          }}>
            {connectedDevices.map((device) => (
              <div key={device.id} className="card-professional">
                <div className="card-header">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="card-title">{device.name}</h3>
                      <p className="card-subtitle">{device.type}</p>
                    </div>
                    <div className="flex items-center gap-sm">
                      <div style={{
                        width: '12px',
                        height: '12px',
                        backgroundColor: getStatusColor(device.status)
                      }}></div>
                      <span style={{
                        padding: '2px 6px',
                        backgroundColor: getStatusColor(device.status),
                        color: 'white',
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: '600'
                      }}>
                        {device.status === 'connected' && 'Conectado'}
                        {device.status === 'disconnected' && 'Desconectado'}
                        {device.status === 'maintenance' && 'Manutenção'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <span className="text-secondary">Bateria:</span>
                      <span className="font-bold ml-2"><Battery size={16} /> {device.battery}%</span>
                    </div>
                    <div>
                      <span className="text-secondary">Canais:</span>
                      <span className="font-bold ml-2">{device.channels}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <span className="text-secondary">Qualidade:</span>
                      <span className="font-bold ml-2">{device.signalQuality}</span>
                    </div>
                    <div>
                      <span className="text-secondary">Taxa:</span>
                      <span className="font-bold ml-2">{device.sampleRate}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <span className="text-secondary">Última sincronização:</span>
                    <span className="font-bold ml-2">{device.lastSync}</span>
                  </div>
                  
                  <div className="flex gap-sm">
                    <button 
                      className="btn-professional btn-primary btn-sm flex-1"
                      disabled={device.status === 'maintenance'}
                    >
                      {device.status === 'connected' ? '<Radio size={16} /> Configurar' : '<Plug size={16} /> Conectar'}
                    </button>
                    <button className="btn-professional btn-outline btn-sm">
                      <Settings size={16} /> Config
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

        {/* Análises */}
        {activeTab === 'analytics' && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: 'var(--spacing-md)' 
          }}>
            {brainAnalytics.map((analytic, index) => (
              <div key={index} className="card-professional">
                <div className="card-body">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="card-title">{analytic.metric}</h3>
                      <p className="card-subtitle">{analytic.description}</p>
                    </div>
                    <div className="text-center">
                      <div style={{ fontSize: '24px' }}>{getTrendIcon(analytic.trend)}</div>
                      <span style={{
                        color: analytic.trend === 'up' ? 'var(--success-green)' : 
                               analytic.trend === 'down' ? 'var(--error-red)' : 'var(--text-muted)',
                        fontWeight: 'bold'
                      }}>
                        {analytic.change}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-center mb-4">
                    <div style={{
                      fontSize: 'var(--font-size-3xl)',
                      fontWeight: 'bold',
                      color: 'var(--primary-blue)'
                    }}>
                      {analytic.value}%
                    </div>
                  </div>

                  <div style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: 'var(--background-tertiary)',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${analytic.value}%`,
                      height: '100%',
                      backgroundColor: analytic.value >= 70 ? 'var(--success-green)' : 
                                     analytic.value >= 40 ? 'var(--warning-orange)' : 'var(--error-red)',
                      transition: 'width 0.3s ease'
                    }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Sidebar Direita */}
      <aside className="sidebar-right">
        {/* Especialistas em Neurologia */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title"><Brain size={16} /> Especialistas</h3>
          </div>
          <div className="card-body">
            <div className="flex flex-col gap-md">
              {neuroSpecialists.map((specialist) => (
                <div key={specialist.id} className="flex items-center gap-sm">
                  <div className="profile-avatar-small">
                    <img 
                      src={specialist.avatar} 
                      alt={specialist.name}
                      className="profile-image"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'flex'
                      }}
                    />
                    <div className="profile-fallback" style={{ display: 'none' }}>
                      {specialist.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h5 className="font-bold text-primary">{specialist.name}</h5>
                    <p className="text-muted">{specialist.specialty}</p>
                    <div className="flex items-center gap-sm text-muted">
                      <span><Star size={16} /> {specialist.rating}</span>
                      <span>{specialist.available ? '🟢 Online' : '🔴 Offline'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/network" className="btn-professional btn-outline btn-sm" style={{ marginTop: 'var(--spacing-md)' }}>
              Ver Mais Especialistas
            </Link>
          </div>
        </div>

        {/* Progresso Semanal */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title"><BarChart3 size={16} /> Progresso Semanal</h3>
          </div>
          <div className="card-body">
            <div className="flex flex-col gap-sm">
              <div className="flex justify-between">
                <span className="text-secondary">Sessões realizadas</span>
                <span className="font-bold">12/15</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Tempo de treinamento</span>
                <span className="font-bold">4h 30min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Score médio</span>
                <span className="font-bold text-blue">85%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Melhoria</span>
                <span className="font-bold" style={{ color: 'var(--success-green)' }}>+12%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Próximas Sessões */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title"><Calendar size={16} /> Próximas Sessões</h3>
          </div>
          <div className="card-body">
            <div className="flex flex-col gap-sm">
              <div className="bg-light p-sm">
                <h5 className="font-bold text-primary"><Target size={16} /> Treinamento de Foco</h5>
                <p className="text-secondary">Sessão personalizada</p>
                <small className="text-muted">Hoje às 16:00</small>
              </div>
              <div className="bg-light p-sm">
                <h5 className="font-bold text-primary">😌 Relaxamento Guiado</h5>
                <p className="text-secondary">Com Dr. Carlos</p>
                <small className="text-muted">Amanhã às 14:30</small>
              </div>
              <div className="bg-light p-sm">
                <h5 className="font-bold text-primary"><Brain size={16} /> Avaliação Cognitiva</h5>
                <p className="text-secondary">Teste mensal</p>
                <small className="text-muted">Sexta às 10:00</small>
              </div>
            </div>
          </div>
        </div>

        {/* Dicas de Neurofeedback */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title"><Lightbulb size={16} /> Dica do Dia</h3>
          </div>
          <div className="card-body">
            <div className="bg-light p-md text-center">
              <div style={{ fontSize: '32px', marginBottom: 'var(--spacing-sm)' }}>🧘</div>
              <h4 className="font-bold text-primary">Respiração Consciente</h4>
              <p className="text-secondary">Pratique respiração profunda antes das sessões para melhor qualidade do sinal</p>
            </div>
          </div>
        </div>

        {/* Estatísticas Globais */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title">🌍 Comunidade</h3>
          </div>
          <div className="card-body">
            <div className="flex flex-col gap-sm">
              <div className="flex justify-between">
                <span className="text-secondary">Usuários ativos</span>
                <span className="font-bold">15,847</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Sessões hoje</span>
                <span className="font-bold">2,341</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Horas de treinamento</span>
                <span className="font-bold">89,567h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Melhoria média</span>
                <span className="font-bold text-blue">+23%</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}

export default NeuroSync

