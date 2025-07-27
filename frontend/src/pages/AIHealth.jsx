import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const AIHealth = () => {
  const [activeTab, setActiveTab] = useState('assistant')
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: 'Olá! Sou sua assistente de IA para saúde. Como posso ajudá-lo hoje?',
      time: '10:00'
    },
    {
      id: 2,
      type: 'user',
      content: 'Estou sentindo dores de cabeça frequentes. O que pode ser?',
      time: '10:02'
    },
    {
      id: 3,
      type: 'ai',
      content: 'Dores de cabeça podem ter várias causas. Vou fazer algumas perguntas para entender melhor: Com que frequência você tem essas dores? Em que momento do dia elas aparecem mais?',
      time: '10:03'
    }
  ])
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  // Mock data para análises de IA
  const aiAnalyses = [
    {
      id: 1,
      type: 'symptoms',
      title: 'Análise de Sintomas',
      description: 'Baseado nos seus sintomas relatados',
      result: 'Possível enxaqueca tensional',
      confidence: 85,
      recommendations: [
        'Consulte um neurologista',
        'Mantenha um diário de dores',
        'Evite fatores desencadeantes'
      ],
      date: '2024-06-21'
    },
    {
      id: 2,
      type: 'vitals',
      title: 'Análise de Sinais Vitais',
      description: 'Dados dos últimos 30 dias',
      result: 'Padrões normais detectados',
      confidence: 92,
      recommendations: [
        'Continue monitorando',
        'Mantenha atividade física',
        'Dieta balanceada'
      ],
      date: '2024-06-20'
    },
    {
      id: 3,
      type: 'medication',
      title: 'Interações Medicamentosas',
      description: 'Verificação de medicamentos atuais',
      result: 'Nenhuma interação detectada',
      confidence: 98,
      recommendations: [
        'Medicamentos seguros',
        'Mantenha horários regulares',
        'Informe médico sobre mudanças'
      ],
      date: '2024-06-19'
    }
  ]

  // Mock data para recursos de IA
  const aiFeatures = [
    {
      id: 1,
      icon: '<Stethoscope size={16} />',
      title: 'Diagnóstico Assistido',
      description: 'IA analisa sintomas e sugere possíveis diagnósticos',
      status: 'active'
    },
    {
      id: 2,
      icon: '<Pill size={16} />',
      title: 'Verificador de Medicamentos',
      description: 'Verifica interações e efeitos colaterais',
      status: 'active'
    },
    {
      id: 3,
      icon: '<BarChart3 size={16} />',
      title: 'Análise de Tendências',
      description: 'Identifica padrões nos seus dados de saúde',
      status: 'active'
    },
    {
      id: 4,
      icon: '⚠️',
      title: 'Alertas Preventivos',
      description: 'Notifica sobre riscos potenciais à saúde',
      status: 'active'
    },
    {
      id: 5,
      icon: '<Target size={16} />',
      title: 'Recomendações Personalizadas',
      description: 'Sugestões baseadas no seu perfil de saúde',
      status: 'active'
    },
    {
      id: 6,
      icon: '<TrendingUp size={16} />',
      title: 'Predição de Riscos',
      description: 'Avalia probabilidade de condições futuras',
      status: 'beta'
    }
  ]

  // Mock data para especialistas em IA
  const aiSpecialists = [
    {
      id: 1,
      name: 'Dr. Roberto Silva',
      specialty: 'IA Médica',
      avatar: '/images/professionals/doctor1.jpg',
      experience: '8 anos',
      aiProjects: 15,
      rating: 4.9
    },
    {
      id: 2,
      name: 'Dra. Fernanda Costa',
      specialty: 'Telemedicina + IA',
      avatar: '/images/professionals/doctor2.jpg',
      experience: '6 anos',
      aiProjects: 12,
      rating: 4.8
    },
    {
      id: 3,
      name: 'Dr. Paulo Mendes',
      specialty: 'Diagnóstico por IA',
      avatar: '/images/professionals/doctor3.jpg',
      experience: '10 anos',
      aiProjects: 20,
      rating: 4.9
    }
  ]

  // Mock data para insights de IA
  const aiInsights = [
    {
      id: 1,
      type: 'trend',
      title: 'Padrão de Sono Melhorou',
      description: 'Seus dados mostram melhoria de 23% na qualidade do sono',
      impact: 'positive',
      date: '2024-06-21'
    },
    {
      id: 2,
      type: 'alert',
      title: 'Pressão Arterial Elevada',
      description: 'Detectado aumento gradual nos últimos 7 dias',
      impact: 'warning',
      date: '2024-06-20'
    },
    {
      id: 3,
      type: 'recommendation',
      title: 'Hora de Exercitar',
      description: 'IA sugere atividade física baseada no seu histórico',
      impact: 'neutral',
      date: '2024-06-20'
    }
  ]

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const userMessage = {
        id: chatMessages.length + 1,
        type: 'user',
        content: newMessage,
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      }
      
      setChatMessages([...chatMessages, userMessage])
      setNewMessage('')
      setIsTyping(true)

      // Simular resposta da IA
      setTimeout(() => {
        const aiResponse = {
          id: chatMessages.length + 2,
          type: 'ai',
          content: 'Obrigada pela informação. Baseado no que você me contou, recomendo que você consulte um profissional de saúde para uma avaliação mais detalhada. Posso agendar uma consulta para você?',
          time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        }
        setChatMessages(prev => [...prev, aiResponse])
        setIsTyping(false)
      }, 2000)
    }
  }

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return 'var(--success-green)'
    if (confidence >= 70) return 'var(--warning-orange)'
    return 'var(--error-red)'
  }

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'positive': return 'var(--success-green)'
      case 'warning': return 'var(--warning-orange)'
      case 'negative': return 'var(--error-red)'
      default: return 'var(--primary-blue)'
    }
  }

  const getImpactIcon = (impact) => {
    switch (impact) {
      case 'positive': return '<Check size={16} />'
      case 'warning': return '⚠️'
      case 'negative': return '<X size={16} />'
      default: return '<Info size={16} />'
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
              <Link to="/my-bookings" className="activity-action">
                <Calendar size={16} /> Minhas Consultas
              </Link>
              <Link to="/iot-monitor" className="activity-action">
                <Radio size={16} /> IoT Monitor
              </Link>
            </nav>
          </div>
        </div>

        {/* Status da IA */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title"><Bot size={16} /> Status da IA</h3>
          </div>
          <div className="card-body">
            <div className="flex flex-col gap-sm">
              <div className="flex justify-between">
                <span className="text-secondary">Precisão</span>
                <span className="font-bold text-blue">94%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Análises hoje</span>
                <span className="font-bold">7</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Recomendações</span>
                <span className="font-bold">23</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Alertas ativos</span>
                <span className="font-bold">2</span>
              </div>
            </div>
          </div>
        </div>

        {/* Acesso Rápido */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title"><Zap size={16} /> Acesso Rápido</h3>
          </div>
          <div className="card-body">
            <nav className="flex flex-col gap-sm">
              <button className="activity-action text-left">
                <Stethoscope size={16} /> Análise de Sintomas
              </button>
              <button className="activity-action text-left">
                <Pill size={16} /> Verificar Medicamentos
              </button>
              <button className="activity-action text-left">
                <BarChart3 size={16} /> Relatório de Saúde
              </button>
              <button className="activity-action text-left">
                <Target size={16} /> Recomendações
              </button>
            </nav>
          </div>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="content-main">
        {/* Header da IA Saúde */}
        <div className="card-professional">
          <div className="card-body">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="card-title" style={{ fontSize: 'var(--font-size-2xl)', margin: '0 0 8px 0' }}>
                  <Bot size={16} /> IA Saúde
                </h1>
                <p className="card-subtitle">Assistente inteligente para cuidados de saúde</p>
              </div>
              <div className="flex gap-sm">
                <button
                  onClick={() => setActiveTab('assistant')}
                  className={`btn-professional btn-sm ${activeTab === 'assistant' ? 'btn-primary' : 'btn-outline'}`}
                >
                  <MessageCircle size={16} /> Assistente
                </button>
                <button
                  onClick={() => setActiveTab('analyses')}
                  className={`btn-professional btn-sm ${activeTab === 'analyses' ? 'btn-primary' : 'btn-outline'}`}
                >
                  <BarChart3 size={16} /> Análises
                </button>
                <button
                  onClick={() => setActiveTab('features')}
                  className={`btn-professional btn-sm ${activeTab === 'features' ? 'btn-primary' : 'btn-outline'}`}
                >
                  <Settings size={16} /> Recursos
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Chat com IA */}
        {activeTab === 'assistant' && (
          <div className="card-professional">
            <div className="card-header">
              <div className="flex items-center gap-sm">
                <div style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: 'var(--primary-blue)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px'
                }}>
                  <Bot size={16} />
                </div>
                <div>
                  <h2 className="card-title">Assistente IA de Saúde</h2>
                  <p className="card-subtitle">Online • Responde em segundos</p>
                </div>
              </div>
            </div>
            <div className="card-body">
              {/* Área de Chat */}
              <div style={{
                height: '400px',
                overflowY: 'auto',
                border: '1px solid var(--border-color)',
                padding: 'var(--spacing-md)',
                marginBottom: 'var(--spacing-md)'
              }}>
                {chatMessages.map((message) => (
                  <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
                    <div style={{
                      maxWidth: '70%',
                      padding: 'var(--spacing-sm) var(--spacing-md)',
                      backgroundColor: message.type === 'user' ? 'var(--primary-blue)' : 'var(--background-tertiary)',
                      color: message.type === 'user' ? 'white' : 'var(--text-primary)',
                      marginBottom: 'var(--spacing-sm)'
                    }}>
                      <p style={{ margin: '0 0 4px 0' }}>{message.content}</p>
                      <small style={{ opacity: 0.7 }}>{message.time}</small>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start mb-4">
                    <div style={{
                      padding: 'var(--spacing-sm) var(--spacing-md)',
                      backgroundColor: 'var(--background-tertiary)',
                      color: 'var(--text-primary)'
                    }}>
                      <p style={{ margin: 0 }}>IA está digitando...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Input de Mensagem */}
              <div className="flex gap-sm">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Digite sua pergunta sobre saúde..."
                  className="search-input flex-1"
                />
                <button 
                  onClick={handleSendMessage}
                  className="btn-professional btn-primary"
                  disabled={!newMessage.trim()}
                >
                  📤 Enviar
                </button>
              </div>

              {/* Sugestões Rápidas */}
              <div style={{ marginTop: 'var(--spacing-md)' }}>
                <p className="text-secondary">Perguntas sugeridas:</p>
                <div className="flex flex-wrap gap-sm">
                  <button 
                    onClick={() => setNewMessage('Como melhorar meu sono?')}
                    className="btn-professional btn-outline btn-sm"
                  >
                    😴 Como melhorar meu sono?
                  </button>
                  <button 
                    onClick={() => setNewMessage('Quais exercícios posso fazer?')}
                    className="btn-professional btn-outline btn-sm"
                  >
                    🏃 Exercícios recomendados
                  </button>
                  <button 
                    onClick={() => setNewMessage('Análise dos meus sintomas')}
                    className="btn-professional btn-outline btn-sm"
                  >
                    <Stethoscope size={16} /> Analisar sintomas
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Análises da IA */}
        {activeTab === 'analyses' && (
          <div className="flex flex-col gap-md">
            {aiAnalyses.map((analysis) => (
              <div key={analysis.id} className="card-professional">
                <div className="card-header">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="card-title">{analysis.title}</h3>
                      <p className="card-subtitle">{analysis.description}</p>
                    </div>
                    <div className="text-right">
                      <div style={{
                        padding: '4px 8px',
                        backgroundColor: getConfidenceColor(analysis.confidence),
                        color: 'white',
                        fontSize: 'var(--font-size-sm)',
                        fontWeight: '600'
                      }}>
                        {analysis.confidence}% confiança
                      </div>
                      <p className="text-muted">{analysis.date}</p>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <div className="flex items-center gap-md mb-4">
                    <div style={{
                      width: '48px',
                      height: '48px',
                      backgroundColor: 'var(--primary-blue-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px'
                    }}>
                      {analysis.type === 'symptoms' && '<Stethoscope size={16} />'}
                      {analysis.type === 'vitals' && '<BarChart3 size={16} />'}
                      {analysis.type === 'medication' && '<Pill size={16} />'}
                    </div>
                    <div>
                      <h4 className="font-bold text-primary">{analysis.result}</h4>
                      <p className="text-secondary">Resultado da análise</p>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-bold text-primary mb-2">Recomendações:</h5>
                    <ul style={{ paddingLeft: 'var(--spacing-md)' }}>
                      {analysis.recommendations.map((rec, index) => (
                        <li key={index} className="text-secondary mb-1">{rec}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex gap-sm" style={{ marginTop: 'var(--spacing-md)' }}>
                    <button className="btn-professional btn-primary btn-sm">
                      <FileText size={16} /> Ver Detalhes
                    </button>
                    <button className="btn-professional btn-outline btn-sm">
                      📤 Compartilhar
                    </button>
                    <button className="btn-professional btn-outline btn-sm">
                      <Calendar size={16} /> Agendar Consulta
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recursos da IA */}
        {activeTab === 'features' && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: 'var(--spacing-md)' 
          }}>
            {aiFeatures.map((feature) => (
              <div key={feature.id} className="card-professional">
                <div className="card-body text-center">
                  <div style={{ fontSize: '48px', marginBottom: 'var(--spacing-md)' }}>
                    {feature.icon}
                  </div>
                  <h3 className="card-title">{feature.title}</h3>
                  <p className="card-subtitle">{feature.description}</p>
                  <div style={{ marginTop: 'var(--spacing-md)' }}>
                    <span style={{
                      padding: '4px 8px',
                      backgroundColor: feature.status === 'active' ? 'var(--success-green)' : 'var(--warning-orange)',
                      color: 'white',
                      fontSize: 'var(--font-size-xs)',
                      fontWeight: '600'
                    }}>
                      {feature.status === 'active' ? '<Check size={16} /> Ativo' : '🧪 Beta'}
                    </span>
                  </div>
                  <button className="btn-professional btn-primary btn-sm" style={{ marginTop: 'var(--spacing-md)' }}>
                    <Rocket size={16} /> Usar Recurso
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Sidebar Direita */}
      <aside className="sidebar-right">
        {/* Insights da IA */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title"><Lightbulb size={16} /> Insights da IA</h3>
          </div>
          <div className="card-body">
            <div className="flex flex-col gap-sm">
              {aiInsights.map((insight) => (
                <div key={insight.id} className="bg-light p-sm">
                  <div className="flex items-start gap-sm">
                    <div style={{
                      color: getImpactColor(insight.impact),
                      fontSize: '20px'
                    }}>
                      {getImpactIcon(insight.impact)}
                    </div>
                    <div className="flex-1">
                      <h5 className="font-bold text-primary">{insight.title}</h5>
                      <p className="text-secondary">{insight.description}</p>
                      <small className="text-muted">{insight.date}</small>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Especialistas em IA */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title"><Bot size={16} /> Especialistas em IA</h3>
          </div>
          <div className="card-body">
            <div className="flex flex-col gap-md">
              {aiSpecialists.map((specialist) => (
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
                      <span><Bot size={16} /> {specialist.aiProjects} projetos</span>
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

        {/* Estatísticas da IA */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title"><TrendingUp size={16} /> Estatísticas</h3>
          </div>
          <div className="card-body">
            <div className="flex flex-col gap-sm">
              <div className="flex justify-between">
                <span className="text-secondary">Análises realizadas</span>
                <span className="font-bold">247</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Precisão média</span>
                <span className="font-bold">94%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Tempo de resposta</span>
                <span className="font-bold">1.2s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Usuários ativos</span>
                <span className="font-bold">1,847</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dicas de IA */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title"><Target size={16} /> Dicas da IA</h3>
          </div>
          <div className="card-body">
            <div className="bg-light p-md text-center">
              <div style={{ fontSize: '32px', marginBottom: 'var(--spacing-sm)' }}><Brain size={16} /></div>
              <h4 className="font-bold text-primary">Seja Específico</h4>
              <p className="text-secondary">Quanto mais detalhes você fornecer sobre seus sintomas, mais precisa será a análise da IA</p>
            </div>
          </div>
        </div>

        {/* Atualizações da IA */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title"><RefreshCw size={16} /> Atualizações</h3>
          </div>
          <div className="card-body">
            <div className="flex flex-col gap-sm">
              <div className="bg-light p-sm">
                <h5 className="font-bold text-primary">🆕 Nova Funcionalidade</h5>
                <p className="text-secondary">Análise de exames de sangue</p>
                <small className="text-muted">Há 2 dias</small>
              </div>
              <div className="bg-light p-sm">
                <h5 className="font-bold text-primary"><Zap size={16} /> Melhoria</h5>
                <p className="text-secondary">Resposta 30% mais rápida</p>
                <small className="text-muted">Há 1 semana</small>
              </div>
              <div className="bg-light p-sm">
                <h5 className="font-bold text-primary"><Target size={16} /> Precisão</h5>
                <p className="text-secondary">94% de precisão alcançada</p>
                <small className="text-muted">Há 2 semanas</small>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}

export default AIHealth

