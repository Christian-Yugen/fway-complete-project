import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const NetworkPage = () => {
  const [activeTab, setActiveTab] = useState('connections')

  // Mock data para conexões
  const connections = [
    {
      id: 1,
      name: 'Dr. João Silva',
      title: 'Cardiologista',
      location: 'São Paulo, SP',
      avatar: '/images/professionals/doctor1.jpg',
      mutualConnections: 12,
      isOnline: true,
      lastActive: 'Agora'
    },
    {
      id: 2,
      name: 'Dra. Maria Santos',
      title: 'Pediatra',
      location: 'São Paulo, SP',
      avatar: '/images/professionals/doctor2.jpg',
      mutualConnections: 8,
      isOnline: false,
      lastActive: '2h atrás'
    },
    {
      id: 3,
      name: 'Enfª Ana Carolina',
      title: 'UTI Adulto',
      location: 'São Paulo, SP',
      avatar: '/images/professionals/nurse1.jpg',
      mutualConnections: 15,
      isOnline: true,
      lastActive: '5 min atrás'
    },
    {
      id: 4,
      name: 'Dr. Rafael Mendes',
      title: 'Fisioterapeuta',
      location: 'São Paulo, SP',
      avatar: '/images/professionals/physio1.jpg',
      mutualConnections: 6,
      isOnline: false,
      lastActive: '1h atrás'
    }
  ]

  const suggestions = [
    {
      id: 5,
      name: 'Dr. Carlos Oliveira',
      title: 'Ortopedista',
      location: 'São Paulo, SP',
      avatar: '/images/professionals/doctor3.jpg',
      mutualConnections: 3,
      reason: 'Trabalha na mesma área'
    },
    {
      id: 6,
      name: 'Dra. Beatriz Ferreira',
      title: 'Neurologista',
      location: 'São Paulo, SP',
      avatar: '/images/professionals/physio2.jpg',
      mutualConnections: 5,
      reason: 'Conexões em comum'
    },
    {
      id: 7,
      name: 'Enfº Carlos Eduardo',
      title: 'Obstetrícia',
      location: 'São Paulo, SP',
      avatar: '/images/professionals/nurse2.jpg',
      mutualConnections: 2,
      reason: 'Mesma especialidade'
    }
  ]

  const invitations = [
    {
      id: 8,
      name: 'Dra. Ana Costa',
      title: 'Dermatologista',
      location: 'São Paulo, SP',
      avatar: '/images/professionals/doctor4.jpg',
      message: 'Gostaria de conectar para trocar experiências sobre tratamentos dermatológicos.',
      time: '2h atrás'
    },
    {
      id: 9,
      name: 'Dr. Lucas Barbosa',
      title: 'Fisioterapeuta Respiratório',
      location: 'São Paulo, SP',
      avatar: '/images/professionals/physio3.jpg',
      message: 'Olá! Vi seu perfil e gostaria de conectar.',
      time: '1d atrás'
    }
  ]

  const handleConnect = (professionalId) => {
    console.log('Conectar com:', professionalId)
  }

  const handleAcceptInvitation = (invitationId) => {
    console.log('Aceitar convite:', invitationId)
  }

  const handleDeclineInvitation = (invitationId) => {
    console.log('Recusar convite:', invitationId)
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
                <span className="profile-stat-number">24</span>
                <span className="profile-stat-label">Conexões</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat-number">156</span>
                <span className="profile-stat-label">Visualizações</span>
              </div>
            </div>
          </div>
        </div>

        {/* Estatísticas da Rede */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title">Sua Rede</h3>
          </div>
          <div className="card-body">
            <div className="flex flex-col gap-sm">
              <div className="flex justify-between">
                <span className="text-secondary">Conexões diretas</span>
                <span className="font-bold text-blue">24</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Conexões de 2º grau</span>
                <span className="font-bold">1,247</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Profissionais na sua área</span>
                <span className="font-bold">89</span>
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
              <Link to="/search" className="activity-action">
                <Search size={16} /> Buscar Profissionais
              </Link>
              <Link to="/events" className="activity-action">
                <Calendar size={16} /> Eventos Médicos
              </Link>
              <Link to="/groups" className="activity-action">
                <Users size={16} /> Grupos Profissionais
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
                onClick={() => setActiveTab('connections')}
                className={`btn-professional ${activeTab === 'connections' ? 'btn-primary' : 'btn-outline'}`}
              >
                Minhas Conexões ({connections.length})
              </button>
              <button
                onClick={() => setActiveTab('suggestions')}
                className={`btn-professional ${activeTab === 'suggestions' ? 'btn-primary' : 'btn-outline'}`}
              >
                Sugestões ({suggestions.length})
              </button>
              <button
                onClick={() => setActiveTab('invitations')}
                className={`btn-professional ${activeTab === 'invitations' ? 'btn-primary' : 'btn-outline'}`}
              >
                Convites ({invitations.length})
              </button>
            </div>
          </div>
        </div>

        {/* Conteúdo das Abas */}
        {activeTab === 'connections' && (
          <div className="card-professional">
            <div className="card-header">
              <h2 className="card-title">Suas Conexões</h2>
              <p className="card-subtitle">Profissionais conectados com você</p>
            </div>
            <div className="card-body">
              <div className="professionals-grid">
                {connections.map((connection) => (
                  <div key={connection.id} className="card-professional professional-card">
                    <div className="profile-avatar-medium">
                      {connection.avatar ? (
                        <img 
                          src={connection.avatar} 
                          alt={connection.name}
                          className="profile-image"
                          onError={(e) => {
                            e.target.style.display = 'none'
                            e.target.nextSibling.style.display = 'flex'
                          }}
                        />
                      ) : null}
                      <div 
                        className="profile-fallback"
                        style={{ display: connection.avatar ? 'none' : 'flex' }}
                      >
                        {connection.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      {connection.isOnline && (
                        <div style={{
                          position: 'absolute',
                          bottom: '2px',
                          right: '2px',
                          width: '12px',
                          height: '12px',
                          backgroundColor: '#057642',
                          border: '2px solid white'
                        }}></div>
                      )}
                    </div>
                    
                    <div className="professional-info">
                      <h3 className="professional-name">{connection.name}</h3>
                      <p className="professional-specialty">{connection.title}</p>
                      <p className="professional-location"><MapPin size={16} /> {connection.location}</p>
                      
                      <div className="flex items-center gap-sm text-muted">
                        <span><Users size={16} /> {connection.mutualConnections} conexões em comum</span>
                      </div>
                      
                      <div className="flex items-center gap-sm text-muted">
                        <span className={connection.isOnline ? 'text-blue' : ''}>
                          {connection.isOnline ? '🟢 Online' : `⚪ ${connection.lastActive}`}
                        </span>
                      </div>

                      <div className="professional-actions">
                        <Link
                          to={`/chat?user=${connection.id}`}
                          className="btn-professional btn-primary btn-sm"
                        >
                          <MessageCircle size={16} /> Mensagem
                        </Link>
                        <Link
                          to={`/professional/${connection.id}`}
                          className="btn-professional btn-secondary btn-sm"
                        >
                          Ver Perfil
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'suggestions' && (
          <div className="card-professional">
            <div className="card-header">
              <h2 className="card-title">Sugestões de Conexão</h2>
              <p className="card-subtitle">Profissionais que você pode conhecer</p>
            </div>
            <div className="card-body">
              <div className="professionals-grid">
                {suggestions.map((suggestion) => (
                  <div key={suggestion.id} className="card-professional professional-card">
                    <div className="profile-avatar-medium">
                      {suggestion.avatar ? (
                        <img 
                          src={suggestion.avatar} 
                          alt={suggestion.name}
                          className="profile-image"
                          onError={(e) => {
                            e.target.style.display = 'none'
                            e.target.nextSibling.style.display = 'flex'
                          }}
                        />
                      ) : null}
                      <div 
                        className="profile-fallback"
                        style={{ display: suggestion.avatar ? 'none' : 'flex' }}
                      >
                        {suggestion.name.split(' ').map(n => n[0]).join('')}
                      </div>
                    </div>
                    
                    <div className="professional-info">
                      <h3 className="professional-name">{suggestion.name}</h3>
                      <p className="professional-specialty">{suggestion.title}</p>
                      <p className="professional-location"><MapPin size={16} /> {suggestion.location}</p>
                      
                      <div className="flex items-center gap-sm text-muted">
                        <span><Users size={16} /> {suggestion.mutualConnections} conexões em comum</span>
                      </div>
                      
                      <div className="flex items-center gap-sm text-muted">
                        <span><Lightbulb size={16} /> {suggestion.reason}</span>
                      </div>

                      <div className="professional-actions">
                        <button
                          onClick={() => handleConnect(suggestion.id)}
                          className="btn-professional btn-primary btn-sm"
                        >
                          ➕ Conectar
                        </button>
                        <Link
                          to={`/professional/${suggestion.id}`}
                          className="btn-professional btn-secondary btn-sm"
                        >
                          Ver Perfil
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'invitations' && (
          <div className="card-professional">
            <div className="card-header">
              <h2 className="card-title">Convites Recebidos</h2>
              <p className="card-subtitle">Profissionais que querem se conectar</p>
            </div>
            <div className="card-body">
              <div className="flex flex-col gap-md">
                {invitations.map((invitation) => (
                  <div key={invitation.id} className="card-professional">
                    <div className="card-body">
                      <div className="flex gap-md">
                        <div className="profile-avatar-medium">
                          {invitation.avatar ? (
                            <img 
                              src={invitation.avatar} 
                              alt={invitation.name}
                              className="profile-image"
                              onError={(e) => {
                                e.target.style.display = 'none'
                                e.target.nextSibling.style.display = 'flex'
                              }}
                            />
                          ) : null}
                          <div 
                            className="profile-fallback"
                            style={{ display: invitation.avatar ? 'none' : 'flex' }}
                          >
                            {invitation.name.split(' ').map(n => n[0]).join('')}
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="professional-name">{invitation.name}</h3>
                          <p className="professional-specialty">{invitation.title}</p>
                          <p className="professional-location"><MapPin size={16} /> {invitation.location}</p>
                          
                          <div className="bg-light p-sm" style={{ marginTop: '8px' }}>
                            <p className="text-secondary">{invitation.message}</p>
                          </div>
                          
                          <div className="flex items-center justify-between" style={{ marginTop: '12px' }}>
                            <span className="text-muted">{invitation.time}</span>
                            <div className="flex gap-sm">
                              <button
                                onClick={() => handleAcceptInvitation(invitation.id)}
                                className="btn-professional btn-primary btn-sm"
                              >
                                <Check size={16} /> Aceitar
                              </button>
                              <button
                                onClick={() => handleDeclineInvitation(invitation.id)}
                                className="btn-professional btn-outline btn-sm"
                              >
                                <X size={16} /> Recusar
                              </button>
                            </div>
                          </div>
                        </div>
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
        {/* Profissionais Online */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title">🟢 Online Agora</h3>
          </div>
          <div className="card-body">
            <div className="flex flex-col gap-sm">
              {connections.filter(c => c.isOnline).map((connection) => (
                <div key={connection.id} className="flex items-center gap-sm">
                  <div className="profile-avatar-small">
                    <div className="profile-fallback">
                      {connection.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="professional-name">{connection.name}</p>
                    <p className="professional-specialty">{connection.title}</p>
                  </div>
                  <Link
                    to={`/chat?user=${connection.id}`}
                    className="btn-professional btn-outline btn-sm"
                  >
                    <MessageCircle size={16} />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Eventos da Rede */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title"><Calendar size={16} /> Eventos da Rede</h3>
          </div>
          <div className="card-body">
            <div className="flex flex-col gap-md">
              <div className="border-bottom p-sm">
                <h4 className="font-bold">Congresso de Cardiologia</h4>
                <p className="text-secondary">15 de Julho • São Paulo</p>
                <p className="text-muted">12 conexões participando</p>
              </div>
              <div className="border-bottom p-sm">
                <h4 className="font-bold">Workshop de Pediatria</h4>
                <p className="text-secondary">22 de Julho • Online</p>
                <p className="text-muted">8 conexões participando</p>
              </div>
              <div className="p-sm">
                <h4 className="font-bold">Simpósio de Fisioterapia</h4>
                <p className="text-secondary">30 de Julho • Rio de Janeiro</p>
                <p className="text-muted">5 conexões participando</p>
              </div>
            </div>
          </div>
        </div>

        {/* Grupos Sugeridos */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title"><Users size={16} /> Grupos Sugeridos</h3>
          </div>
          <div className="card-body">
            <div className="flex flex-col gap-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold">Cardiologistas SP</p>
                  <p className="text-muted">1.2k membros</p>
                </div>
                <button className="btn-professional btn-outline btn-sm">
                  Participar
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold">Enfermagem UTI</p>
                  <p className="text-muted">856 membros</p>
                </div>
                <button className="btn-professional btn-outline btn-sm">
                  Participar
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold">Fisioterapia Esportiva</p>
                  <p className="text-muted">634 membros</p>
                </div>
                <button className="btn-professional btn-outline btn-sm">
                  Participar
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}

export default NetworkPage

