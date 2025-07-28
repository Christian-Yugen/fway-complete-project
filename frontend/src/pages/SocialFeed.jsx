import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Lightbulb, PartyPopper, Trophy, PenTool, Phone, Flame, Camera, BarChart3, MapPin, MessageCircle, RefreshCw, Users, Calendar, Pill } from 'lucide-react'

const SocialFeed = () => {
  const [activeTab, setActiveTab] = useState('feed')
  const [newPost, setNewPost] = useState('')

  // Mock data para posts do feed
  const posts = [
    {
      id: 1,
      author: 'Dr. João Silva',
      specialty: 'Cardiologia',
      avatar: '/images/professionals/doctor1.jpg',
      time: '2 horas atrás',
      content: 'Compartilhando algumas dicas importantes sobre prevenção de doenças cardiovasculares. A prática regular de exercícios e uma alimentação balanceada são fundamentais para manter o coração saudável.',
      image: null,
      likes: 24,
      comments: 8,
      shares: 3,
      liked: false,
      type: 'tip'
    },
    {
      id: 2,
      author: 'Dra. Maria Santos',
      specialty: 'Pediatria',
      avatar: '/images/professionals/doctor2.jpg',
      time: '4 horas atrás',
      content: 'Acabei de participar do Congresso de Pediatria 2024. Muitas novidades sobre cuidados infantis e novas abordagens terapêuticas. A medicina está sempre evoluindo!',
      image: null,
      likes: 18,
      comments: 5,
      shares: 2,
      liked: true,
      type: 'update'
    },
    {
      id: 3,
      author: 'Dr. Rafael Mendes',
      specialty: 'Fisioterapia',
      avatar: '/images/professionals/physio1.jpg',
      time: '6 horas atrás',
      content: 'Exercícios simples que você pode fazer em casa para fortalecer a coluna vertebral. Lembre-se: consistência é a chave para resultados duradouros.',
      image: null,
      likes: 31,
      comments: 12,
      shares: 7,
      liked: false,
      type: 'exercise'
    },
    {
      id: 4,
      author: 'Enfª Ana Carolina Silva',
      specialty: 'UTI Adulto',
      avatar: '/images/professionals/nurse1.jpg',
      time: '8 horas atrás',
      content: 'Hoje completei 5 anos trabalhando na UTI. Cada dia é uma oportunidade de fazer a diferença na vida dos pacientes e suas famílias. Gratidão por essa profissão!',
      image: null,
      likes: 45,
      comments: 15,
      shares: 4,
      liked: true,
      type: 'milestone'
    },
    {
      id: 5,
      author: 'Dr. Carlos Oliveira',
      specialty: 'Ortopedia',
      avatar: '/images/professionals/doctor3.jpg',
      time: '1 dia atrás',
      content: 'Realizei uma cirurgia de joelho muito bem-sucedida hoje. A tecnologia minimamente invasiva permite recuperação mais rápida e menos dor para o paciente.',
      image: null,
      likes: 28,
      comments: 9,
      shares: 5,
      liked: false,
      type: 'achievement'
    }
  ]

  // Mock data para profissionais sugeridos
  const suggestedProfessionals = [
    {
      id: 1,
      name: 'Dra. Beatriz Ferreira',
      specialty: 'Neurologia',
      avatar: '/images/professionals/physio2.jpg',
      mutualConnections: 3,
      connected: false
    },
    {
      id: 2,
      name: 'Dr. Lucas Barbosa',
      specialty: 'Fisioterapia Respiratória',
      avatar: '/images/professionals/physio3.jpg',
      mutualConnections: 5,
      connected: false
    },
    {
      id: 3,
      name: 'Enfº Carlos Eduardo Santos',
      specialty: 'Obstetrícia',
      avatar: '/images/professionals/nurse2.jpg',
      mutualConnections: 2,
      connected: false
    }
  ]

  // Mock data para grupos sugeridos
  const suggestedGroups = [
    {
      id: 1,
      name: 'Cardiologia Preventiva',
      members: 1247,
      posts: 89,
      description: 'Discussões sobre prevenção de doenças cardiovasculares'
    },
    {
      id: 2,
      name: 'Fisioterapia Moderna',
      members: 856,
      posts: 156,
      description: 'Técnicas e novidades em fisioterapia'
    },
    {
      id: 3,
      name: 'Enfermagem Intensiva',
      members: 2341,
      posts: 234,
      description: 'Profissionais de UTI e cuidados intensivos'
    }
  ]

  // Mock data para trending topics
  const trendingTopics = [
    { tag: '#CardiologiaPreventiva', posts: 234 },
    { tag: '#FisioterapiaEmCasa', posts: 189 },
    { tag: '#SaúdeMental', posts: 156 },
    { tag: '#Telemedicina', posts: 134 },
    { tag: '#EnfermagemModerna', posts: 98 }
  ]

  const handleLike = (postId) => {
    // Implementar lógica de like
    console.log('Like post:', postId)
  }

  const handleComment = (postId) => {
    // Implementar lógica de comentário
    console.log('Comment post:', postId)
  }

  const handleShare = (postId) => {
    // Implementar lógica de compartilhamento
    console.log('Share post:', postId)
  }

  const handleConnect = (professionalId) => {
    // Implementar lógica de conexão
    console.log('Connect to:', professionalId)
  }

  const handleJoinGroup = (groupId) => {
    // Implementar lógica de entrar no grupo
    console.log('Join group:', groupId)
  }

  const handlePostSubmit = () => {
    if (newPost.trim()) {
      // Implementar lógica de criar post
      console.log('New post:', newPost)
      setNewPost('')
    }
  }

  const getPostIcon = (type) => {
    switch (type) {
      case 'tip': return '<Lightbulb size={16} />'
      case 'update': return '📢'
      case 'exercise': return '🏃'
      case 'milestone': return '<PartyPopper size={16} />'
      case 'achievement': return '<Trophy size={16} />'
      default: return '<PenTool size={16} />'
    }
  }

  const getPostTypeLabel = (type) => {
    switch (type) {
      case 'tip': return 'Dica de Saúde'
      case 'update': return 'Atualização'
      case 'exercise': return 'Exercício'
      case 'milestone': return 'Marco'
      case 'achievement': return 'Conquista'
      default: return 'Post'
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
              <Link to="/network" className="activity-action">
                <Users size={16} /> Minha Rede
              </Link>
              <Link to="/my-bookings" className="activity-action">
                <Calendar size={16} /> Minhas Consultas
              </Link>
              <Link to="/chat" className="activity-action">
                <MessageCircle size={16} /> Mensagens
              </Link>
            </nav>
          </div>
        </div>

        {/* Grupos */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title"><Users size={16} /> Meus Grupos</h3>
          </div>
          <div className="card-body">
            <div className="flex flex-col gap-sm">
              <Link to="#" className="activity-action">
                <Pill size={16} /> Diabetes Support
              </Link>
              <Link to="#" className="activity-action">
                ❤️ Coração Saudável
              </Link>
              <Link to="#" className="activity-action">
                🏃 Vida Ativa
              </Link>
              <button className="btn-professional btn-outline btn-sm">
                + Explorar Grupos
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="content-main">
        {/* Header do Feed Social */}
        <div className="card-professional">
          <div className="card-body">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="card-title" style={{ fontSize: 'var(--font-size-2xl)', margin: '0 0 8px 0' }}>
                  <Phone size={16} /> Feed Social
                </h1>
                <p className="card-subtitle">Conecte-se com profissionais de saúde e pacientes</p>
              </div>
              <div className="flex gap-sm">
                <button
                  onClick={() => setActiveTab('feed')}
                  className={`btn-professional btn-sm ${activeTab === 'feed' ? 'btn-primary' : 'btn-outline'}`}
                >
                  📰 Feed
                </button>
                <button
                  onClick={() => setActiveTab('trending')}
                  className={`btn-professional btn-sm ${activeTab === 'trending' ? 'btn-primary' : 'btn-outline'}`}
                >
                  <Flame size={16} /> Trending
                </button>
                <button
                  onClick={() => setActiveTab('groups')}
                  className={`btn-professional btn-sm ${activeTab === 'groups' ? 'btn-primary' : 'btn-outline'}`}
                >
                  <Users size={16} /> Grupos
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Criar Post */}
        <div className="card-professional">
          <div className="card-body">
            <div className="flex gap-md">
              <div className="profile-avatar-medium">
                <div className="profile-fallback">U</div>
              </div>
              <div className="flex-1">
                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="Compartilhe suas experiências de saúde, dicas ou perguntas..."
                  className="search-input"
                  style={{
                    width: '100%',
                    minHeight: '80px',
                    padding: 'var(--spacing-md)',
                    resize: 'vertical'
                  }}
                />
                <div className="flex justify-between items-center" style={{ marginTop: 'var(--spacing-sm)' }}>
                  <div className="flex gap-sm">
                    <button className="btn-professional btn-outline btn-sm">
                      <Camera size={16} /> Foto
                    </button>
                    <button className="btn-professional btn-outline btn-sm">
                      <BarChart3 size={16} /> Enquete
                    </button>
                    <button className="btn-professional btn-outline btn-sm">
                      <MapPin size={16} /> Local
                    </button>
                  </div>
                  <button 
                    onClick={handlePostSubmit}
                    className="btn-professional btn-primary btn-sm"
                    disabled={!newPost.trim()}
                  >
                    📤 Publicar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feed de Posts */}
        {activeTab === 'feed' && (
          <div className="activity-feed">
            {posts.map((post) => (
              <div key={post.id} className="card-professional">
                <div className="card-body">
                  <div className="activity-item">
                    <div className="activity-avatar">
                      <div className="profile-avatar-medium">
                        <img 
                          src={post.avatar} 
                          alt={post.author}
                          className="profile-image"
                          onError={(e) => {
                            e.target.style.display = 'none'
                            e.target.nextSibling.style.display = 'flex'
                          }}
                        />
                        <div className="profile-fallback" style={{ display: 'none' }}>
                          {post.author.split(' ').map(n => n[0]).join('')}
                        </div>
                      </div>
                    </div>
                    <div className="activity-content">
                      <div className="activity-header">
                        <div className="flex items-center gap-sm">
                          <Link to={`/professional/${post.id}`} className="activity-author">
                            {post.author}
                          </Link>
                          <span className="text-muted">•</span>
                          <span className="text-muted">{post.specialty}</span>
                          <span className="text-muted">•</span>
                          <span className="activity-time">{post.time}</span>
                        </div>
                        <div className="flex items-center gap-sm">
                          <span style={{
                            padding: '2px 8px',
                            backgroundColor: 'var(--primary-blue-light)',
                            color: 'var(--primary-blue)',
                            fontSize: 'var(--font-size-xs)',
                            fontWeight: '600'
                          }}>
                            {getPostIcon(post.type)} {getPostTypeLabel(post.type)}
                          </span>
                        </div>
                      </div>
                      <p className="activity-text">{post.content}</p>
                      {post.image && (
                        <img 
                          src={post.image} 
                          alt="Post content"
                          style={{
                            width: '100%',
                            maxHeight: '400px',
                            objectFit: 'cover',
                            marginTop: 'var(--spacing-sm)'
                          }}
                        />
                      )}
                      <div className="activity-actions" style={{ marginTop: 'var(--spacing-md)' }}>
                        <button 
                          onClick={() => handleLike(post.id)}
                          className={`activity-action ${post.liked ? 'text-blue' : ''}`}
                        >
                          {post.liked ? '❤️' : '🤍'} {post.likes} Curtidas
                        </button>
                        <button 
                          onClick={() => handleComment(post.id)}
                          className="activity-action"
                        >
                          <MessageCircle size={16} /> {post.comments} Comentários
                        </button>
                        <button 
                          onClick={() => handleShare(post.id)}
                          className="activity-action"
                        >
                          <RefreshCw size={16} /> {post.shares} Compartilhar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Trending Topics */}
        {activeTab === 'trending' && (
          <div className="card-professional">
            <div className="card-header">
              <h2 className="card-title"><Flame size={16} /> Tópicos em Alta</h2>
              <p className="card-subtitle">Assuntos mais discutidos na comunidade</p>
            </div>
            <div className="card-body">
              <div className="flex flex-col gap-md">
                {trendingTopics.map((topic, index) => (
                  <div key={index} className="flex justify-between items-center p-md border">
                    <div>
                      <h4 className="font-bold text-blue">{topic.tag}</h4>
                      <p className="text-muted">{topic.posts} posts</p>
                    </div>
                    <button className="btn-professional btn-outline btn-sm">
                      Seguir
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Grupos */}
        {activeTab === 'groups' && (
          <div className="card-professional">
            <div className="card-header">
              <h2 className="card-title"><Users size={16} /> Grupos Sugeridos</h2>
              <p className="card-subtitle">Encontre comunidades de interesse</p>
            </div>
            <div className="card-body">
              <div className="flex flex-col gap-md">
                {suggestedGroups.map((group) => (
                  <div key={group.id} className="card-professional">
                    <div className="card-body">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="professional-name">{group.name}</h4>
                          <p className="professional-specialty">{group.description}</p>
                          <div className="flex items-center gap-md text-muted">
                            <span><Users size={16} /> {group.members.toLocaleString()} membros</span>
                            <span><PenTool size={16} /> {group.posts} posts/semana</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleJoinGroup(group.id)}
                          className="btn-professional btn-primary btn-sm"
                        >
                          + Participar
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

      {/* Sidebar Direita */}
      <aside className="sidebar-right">
        {/* Profissionais Sugeridos */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title"><Users size={16} /> Conectar-se</h3>
            <p className="card-subtitle">Profissionais sugeridos</p>
          </div>
          <div className="card-body">
            <div className="flex flex-col gap-md">
              {suggestedProfessionals.map((professional) => (
                <div key={professional.id} className="flex items-center gap-sm">
                  <div className="profile-avatar-small">
                    <img 
                      src={professional.avatar} 
                      alt={professional.name}
                      className="profile-image"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'flex'
                      }}
                    />
                    <div className="profile-fallback" style={{ display: 'none' }}>
                      {professional.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h5 className="font-bold text-primary">{professional.name}</h5>
                    <p className="text-muted">{professional.specialty}</p>
                    <p className="text-muted">{professional.mutualConnections} conexões em comum</p>
                  </div>
                  <button 
                    onClick={() => handleConnect(professional.id)}
                    className="btn-professional btn-outline btn-sm"
                  >
                    + Conectar
                  </button>
                </div>
              ))}
            </div>
            <Link to="/network" className="btn-professional btn-outline btn-sm" style={{ marginTop: 'var(--spacing-md)' }}>
              Ver Mais Sugestões
            </Link>
          </div>
        </div>

        {/* Estatísticas da Comunidade */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title"><BarChart3 size={16} /> Comunidade</h3>
          </div>
          <div className="card-body">
            <div className="flex flex-col gap-sm">
              <div className="flex justify-between">
                <span className="text-secondary">Profissionais ativos</span>
                <span className="font-bold">1,247</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Posts hoje</span>
                <span className="font-bold">89</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Grupos ativos</span>
                <span className="font-bold">156</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Conexões feitas</span>
                <span className="font-bold">234</span>
              </div>
            </div>
          </div>
        </div>

        {/* Eventos da Comunidade */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title"><Calendar size={16} /> Eventos</h3>
          </div>
          <div className="card-body">
            <div className="flex flex-col gap-sm">
              <div className="bg-light p-sm">
                <h5 className="font-bold text-primary"><Stethoscope size={16} /> Webinar Cardiologia</h5>
                <p className="text-secondary">Amanhã às 19h</p>
                <p className="text-muted">Dr. João Silva</p>
              </div>
              <div className="bg-light p-sm">
                <h5 className="font-bold text-primary">🏃 Grupo de Caminhada</h5>
                <p className="text-secondary">Sábado às 7h</p>
                <p className="text-muted">Parque Ibirapuera</p>
              </div>
              <div className="bg-light p-sm">
                <h5 className="font-bold text-primary"><Pill size={16} /> Workshop Diabetes</h5>
                <p className="text-secondary">Próxima semana</p>
                <p className="text-muted">Dra. Ana Costa</p>
              </div>
            </div>
            <button className="btn-professional btn-outline btn-sm" style={{ marginTop: 'var(--spacing-sm)' }}>
              Ver Todos os Eventos
            </button>
          </div>
        </div>

        {/* Dicas Rápidas */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title"><Lightbulb size={16} /> Dica do Dia</h3>
          </div>
          <div className="card-body">
            <div className="bg-light p-md text-center">
              <div style={{ fontSize: '32px', marginBottom: 'var(--spacing-sm)' }}>🥗</div>
              <h4 className="font-bold text-primary">Alimentação Balanceada</h4>
              <p className="text-secondary">Inclua pelo menos 5 porções de frutas e vegetais na sua dieta diária</p>
              <button className="btn-professional btn-outline btn-sm">
                Saiba Mais
              </button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}

export default SocialFeed

