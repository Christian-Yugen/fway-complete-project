import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Calendar, 
  MessageCircle, 
  Star, 
  Users, 
  FileText,
  Edit,
  X,
  Check,
  Info,
  Mail,
  Phone,
  Building,
  MapPin,
  User,
  Settings,
  Shield,
  Download,
  Upload,
  Eye,
  Trash2,
  Plus,
  Search,
  Filter,
  BarChart3,
  Activity,
  Heart,
  Clock,
  Bell,
  HelpCircle
} from 'lucide-react'

const Profile = () => {
  const [activeTab, setActiveTab] = useState('about')
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    name: 'João da Silva',
    email: 'joao.silva@email.com',
    phone: '(11) 99999-9999',
    cpf: '123.456.789-00',
    birthDate: '1985-03-15',
    address: 'Rua das Flores, 123 - São Paulo, SP',
    healthPlan: 'Unimed',
    emergencyContact: 'Maria da Silva - (11) 88888-8888',
    allergies: 'Penicilina, Dipirona',
    medications: 'Losartana 50mg - 1x ao dia',
    medicalHistory: 'Hipertensão arterial, Diabetes tipo 2'
  })

  // Mock data para atividades
  const activities = [
    {
      id: 1,
      type: 'appointment',
      icon: <Calendar size={16} className="text-blue-500" />,
      title: 'Consulta realizada',
      description: 'Consulta com Dr. João Silva - Cardiologia',
      date: '2024-06-15',
      time: '14:00'
    },
    {
      id: 2,
      type: 'message',
      icon: <MessageCircle size={16} className="text-green-500" />,
      title: 'Mensagem enviada',
      description: 'Conversa com Dra. Maria Santos sobre exames',
      date: '2024-06-14',
      time: '10:30'
    },
    {
      id: 3,
      type: 'review',
      icon: <Star size={16} className="text-yellow-500" />,
      title: 'Avaliação publicada',
      description: 'Avaliou Dr. João Silva com 5 estrelas',
      date: '2024-06-13',
      time: '16:20'
    },
    {
      id: 4,
      type: 'connection',
      icon: <Users size={16} className="text-purple-500" />,
      title: 'Nova conexão',
      description: 'Conectou-se com Dr. Rafael Mendes',
      date: '2024-06-12',
      time: '09:15'
    }
  ]

  // Mock data para documentos
  const documents = [
    {
      id: 1,
      name: 'Exame de Sangue',
      type: 'PDF',
      size: '2.3 MB',
      date: '2024-06-15',
      category: 'Exames'
    },
    {
      id: 2,
      name: 'Raio-X Tórax',
      type: 'JPG',
      size: '1.8 MB',
      date: '2024-06-10',
      category: 'Exames'
    },
    {
      id: 3,
      name: 'Receita Médica',
      type: 'PDF',
      size: '0.5 MB',
      date: '2024-06-08',
      category: 'Receitas'
    },
    {
      id: 4,
      name: 'Atestado Médico',
      type: 'PDF',
      size: '0.3 MB',
      date: '2024-06-05',
      category: 'Atestados'
    }
  ]

  const handleSave = () => {
    setIsEditing(false)
    // Aqui você salvaria os dados no backend
    console.log('Dados salvos:', profileData)
  }

  const handleCancel = () => {
    setIsEditing(false)
    // Aqui você reverteria as alterações
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR')
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case 'appointment': return <Calendar size={16} className="text-blue-500" />
      case 'message': return <MessageCircle size={16} className="text-green-500" />
      case 'review': return <Star size={16} className="text-yellow-500" />
      case 'connection': return <Users size={16} className="text-purple-500" />
      default: return <FileText size={16} className="text-gray-500" />
    }
  }

  return (
    <div className="content-container">
      {/* Sidebar Esquerda - Avatar e Estatísticas */}
      <aside className="sidebar-left">
        <div className="card-professional profile-card">
          <div className="card-body">
            <div className="profile-avatar-large">
              <div className="profile-fallback">
                {profileData.name.split(' ').map(n => n[0]).join('')}
              </div>
            </div>
            <h3 className="profile-name">{profileData.name}</h3>
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
            
            <div className="flex gap-sm" style={{ marginTop: 'var(--spacing-md)' }}>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="btn-professional btn-primary btn-sm"
              >
                {isEditing ? '<X size={14} /> Cancelar' : '<Edit size={14} /> Editar'}
              </button>
              {isEditing && (
                <button
                  onClick={handleSave}
                  className="btn-professional btn-secondary btn-sm"
                >
                  <Check size={14} /> Salvar
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Informações Rápidas */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title"><Info size={16} /> Informações</h3>
          </div>
          <div className="card-body">
            <div className="flex flex-col gap-sm">
              <div className="flex items-center gap-sm">
                <span><Mail size={16} /></span>
                <span className="text-secondary">{profileData.email}</span>
              </div>
              <div className="flex items-center gap-sm">
                <span><Phone size={16} /></span>
                <span className="text-secondary">{profileData.phone}</span>
              </div>
              <div className="flex items-center gap-sm">
                <span><Building size={16} /></span>
                <span className="text-secondary">{profileData.healthPlan}</span>
              </div>
              <div className="flex items-center gap-sm">
                <span><MapPin size={16} /></span>
                <span className="text-secondary">São Paulo, SP</span>
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
              <Link to="/my-bookings" className="activity-action">
                <Calendar size={16} /> Minhas Consultas
              </Link>
              <Link to="/chat" className="activity-action">
                <MessageCircle size={16} /> Mensagens
              </Link>
              <Link to="/network" className="activity-action">
                <Users size={16} /> Minha Rede
              </Link>
              <button className="activity-action">
                <Settings size={16} /> Configurações
              </button>
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
                onClick={() => setActiveTab('about')}
                className={`btn-professional ${activeTab === 'about' ? 'btn-primary' : 'btn-outline'}`}
              >
                <User size={16} /> Sobre Mim
              </button>
              <button
                onClick={() => setActiveTab('medical')}
                className={`btn-professional ${activeTab === 'medical' ? 'btn-primary' : 'btn-outline'}`}
              >
                <Building size={16} /> Informações Médicas
              </button>
              <button
                onClick={() => setActiveTab('documents')}
                className={`btn-professional ${activeTab === 'documents' ? 'btn-primary' : 'btn-outline'}`}
              >
                <FileText size={16} /> Documentos
              </button>
              <button
                onClick={() => setActiveTab('privacy')}
                className={`btn-professional ${activeTab === 'privacy' ? 'btn-primary' : 'btn-outline'}`}
              >
                <Shield size={16} /> Privacidade
              </button>
            </div>
          </div>
        </div>

        {/* Conteúdo das Abas */}
        {activeTab === 'about' && (
          <div className="card-professional">
            <div className="card-header">
              <h2 className="card-title">Informações Pessoais</h2>
              <p className="card-subtitle">Seus dados básicos e de contato</p>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--spacing-md)' }}>
                <div>
                  <label className="font-bold text-secondary">Nome Completo</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                      className="search-input"
                      style={{ width: '100%', marginTop: '4px' }}
                    />
                  ) : (
                    <p className="text-primary">{profileData.name}</p>
                  )}
                </div>

                <div>
                  <label className="font-bold text-secondary">Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      className="search-input"
                      style={{ width: '100%', marginTop: '4px' }}
                    />
                  ) : (
                    <p className="text-primary">{profileData.email}</p>
                  )}
                </div>

                <div>
                  <label className="font-bold text-secondary">Telefone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      className="search-input"
                      style={{ width: '100%', marginTop: '4px' }}
                    />
                  ) : (
                    <p className="text-primary">{profileData.phone}</p>
                  )}
                </div>

                <div>
                  <label className="font-bold text-secondary">CPF</label>
                  <p className="text-primary">{profileData.cpf}</p>
                </div>

                <div>
                  <label className="font-bold text-secondary">Data de Nascimento</label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={profileData.birthDate}
                      onChange={(e) => setProfileData({...profileData, birthDate: e.target.value})}
                      className="search-input"
                      style={{ width: '100%', marginTop: '4px' }}
                    />
                  ) : (
                    <p className="text-primary">{formatDate(profileData.birthDate)}</p>
                  )}
                </div>

                <div>
                  <label className="font-bold text-secondary">Plano de Saúde</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.healthPlan}
                      onChange={(e) => setProfileData({...profileData, healthPlan: e.target.value})}
                      className="search-input"
                      style={{ width: '100%', marginTop: '4px' }}
                    />
                  ) : (
                    <p className="text-primary">{profileData.healthPlan}</p>
                  )}
                </div>
              </div>

              <div style={{ marginTop: 'var(--spacing-lg)' }}>
                <label className="font-bold text-secondary">Endereço</label>
                {isEditing ? (
                  <textarea
                    value={profileData.address}
                    onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                    className="search-input"
                    style={{ width: '100%', marginTop: '4px', minHeight: '60px' }}
                  />
                ) : (
                  <p className="text-primary">{profileData.address}</p>
                )}
              </div>

              <div style={{ marginTop: 'var(--spacing-md)' }}>
                <label className="font-bold text-secondary">Contato de Emergência</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.emergencyContact}
                    onChange={(e) => setProfileData({...profileData, emergencyContact: e.target.value})}
                    className="search-input"
                    style={{ width: '100%', marginTop: '4px' }}
                  />
                ) : (
                  <p className="text-primary">{profileData.emergencyContact}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'medical' && (
          <div className="card-professional">
            <div className="card-header">
              <h2 className="card-title">Informações Médicas</h2>
              <p className="card-subtitle">Histórico médico e informações de saúde</p>
            </div>
            <div className="card-body">
              <div className="flex flex-col gap-lg">
                <div>
                  <label className="font-bold text-secondary">Alergias</label>
                  {isEditing ? (
                    <textarea
                      value={profileData.allergies}
                      onChange={(e) => setProfileData({...profileData, allergies: e.target.value})}
                      className="search-input"
                      style={{ width: '100%', marginTop: '4px', minHeight: '60px' }}
                      placeholder="Liste suas alergias conhecidas..."
                    />
                  ) : (
                    <p className="text-primary">{profileData.allergies}</p>
                  )}
                </div>

                <div>
                  <label className="font-bold text-secondary">Medicamentos em Uso</label>
                  {isEditing ? (
                    <textarea
                      value={profileData.medications}
                      onChange={(e) => setProfileData({...profileData, medications: e.target.value})}
                      className="search-input"
                      style={{ width: '100%', marginTop: '4px', minHeight: '60px' }}
                      placeholder="Liste os medicamentos que você toma regularmente..."
                    />
                  ) : (
                    <p className="text-primary">{profileData.medications}</p>
                  )}
                </div>

                <div>
                  <label className="font-bold text-secondary">Histórico Médico</label>
                  {isEditing ? (
                    <textarea
                      value={profileData.medicalHistory}
                      onChange={(e) => setProfileData({...profileData, medicalHistory: e.target.value})}
                      className="search-input"
                      style={{ width: '100%', marginTop: '4px', minHeight: '100px' }}
                      placeholder="Descreva seu histórico médico, doenças crônicas, cirurgias anteriores..."
                    />
                  ) : (
                    <p className="text-primary">{profileData.medicalHistory}</p>
                  )}
                </div>
              </div>

              <div className="bg-light p-md" style={{ marginTop: 'var(--spacing-lg)' }}>
                <h4 className="font-bold text-primary">⚠️ Importante</h4>
                <p className="text-secondary">
                  Mantenha suas informações médicas sempre atualizadas. Elas são importantes para que os profissionais 
                  possam oferecer o melhor atendimento possível.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="card-professional">
            <div className="card-header">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="card-title">Meus Documentos</h2>
                  <p className="card-subtitle">Exames, receitas e outros documentos médicos</p>
                </div>
                <button className="btn-professional btn-primary">
                  📤 Enviar Documento
                </button>
              </div>
            </div>
            <div className="card-body">
              <div className="flex flex-col gap-md">
                {documents.map((doc) => (
                  <div key={doc.id} className="card-professional">
                    <div className="card-body">
                      <div className="flex items-center gap-md">
                        <div style={{
                          width: '48px',
                          height: '48px',
                          backgroundColor: 'var(--primary-blue-light)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '20px'
                        }}>
                          {doc.type === 'PDF' ? '<File size={16} />' : '<Camera size={16} />'}
                        </div>
                        
                        <div className="flex-1">
                          <h4 className="professional-name">{doc.name}</h4>
                          <p className="professional-specialty">{doc.category}</p>
                          <div className="flex items-center gap-md text-muted">
                            <span>{doc.type}</span>
                            <span>{doc.size}</span>
                            <span>{formatDate(doc.date)}</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-sm">
                          <button className="btn-professional btn-secondary btn-sm">
                            👁️ Visualizar
                          </button>
                          <button className="btn-professional btn-outline btn-sm">
                            📥 Baixar
                          </button>
                          <button className="btn-professional btn-outline btn-sm">
                            🗑️ Excluir
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-light p-md" style={{ marginTop: 'var(--spacing-lg)' }}>
                <h4 className="font-bold text-primary"><FileText size={16} /> Dicas para Organizar Documentos</h4>
                <ul style={{ marginTop: 'var(--spacing-sm)', paddingLeft: 'var(--spacing-md)' }}>
                  <li className="text-secondary">Use nomes descritivos para seus arquivos</li>
                  <li className="text-secondary">Organize por categoria (exames, receitas, atestados)</li>
                  <li className="text-secondary">Mantenha sempre a versão mais recente</li>
                  <li className="text-secondary">Compartilhe com profissionais quando necessário</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'privacy' && (
          <div className="card-professional">
            <div className="card-header">
              <h2 className="card-title">Configurações de Privacidade</h2>
              <p className="card-subtitle">Controle quem pode ver suas informações</p>
            </div>
            <div className="card-body">
              <div className="flex flex-col gap-lg">
                <div className="card-professional">
                  <div className="card-body">
                    <h4 className="font-bold text-primary"><Users size={16} /> Visibilidade do Perfil</h4>
                    <div className="flex flex-col gap-sm" style={{ marginTop: 'var(--spacing-sm)' }}>
                      <label className="flex items-center gap-sm">
                        <input type="radio" name="profile-visibility" defaultChecked />
                        <span>Público - Visível para todos os profissionais</span>
                      </label>
                      <label className="flex items-center gap-sm">
                        <input type="radio" name="profile-visibility" />
                        <span>Conexões - Apenas profissionais conectados</span>
                      </label>
                      <label className="flex items-center gap-sm">
                        <input type="radio" name="profile-visibility" />
                        <span>Privado - Apenas você</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="card-professional">
                  <div className="card-body">
                    <h4 className="font-bold text-primary"><Phone size={16} /> Notificações</h4>
                    <div className="flex flex-col gap-sm" style={{ marginTop: 'var(--spacing-sm)' }}>
                      <label className="flex items-center justify-between">
                        <span>Mensagens de profissionais</span>
                        <input type="checkbox" defaultChecked />
                      </label>
                      <label className="flex items-center justify-between">
                        <span>Lembretes de consultas</span>
                        <input type="checkbox" defaultChecked />
                      </label>
                      <label className="flex items-center justify-between">
                        <span>Novos profissionais na área</span>
                        <input type="checkbox" />
                      </label>
                      <label className="flex items-center justify-between">
                        <span>Promoções e ofertas</span>
                        <input type="checkbox" />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="card-professional">
                  <div className="card-body">
                    <h4 className="font-bold text-primary"><Shield size={16} /> Segurança</h4>
                    <div className="flex flex-col gap-sm" style={{ marginTop: 'var(--spacing-sm)' }}>
                      <button className="btn-professional btn-outline">
                        🔑 Alterar Senha
                      </button>
                      <button className="btn-professional btn-outline">
                        <Phone size={16} /> Configurar Autenticação em Duas Etapas
                      </button>
                      <button className="btn-professional btn-outline">
                        <FileText size={16} /> Ver Dispositivos Conectados
                      </button>
                      <button className="btn-professional btn-outline">
                        📥 Baixar Meus Dados
                      </button>
                    </div>
                  </div>
                </div>

                <div className="card-professional">
                  <div className="card-body">
                    <h4 className="font-bold text-primary">⚠️ Zona de Perigo</h4>
                    <p className="text-secondary" style={{ marginBottom: 'var(--spacing-sm)' }}>
                      Ações irreversíveis que afetam permanentemente sua conta.
                    </p>
                    <div className="flex flex-col gap-sm">
                      <button className="btn-professional btn-outline">
                        🗑️ Excluir Conta
                      </button>
                      <button className="btn-professional btn-outline">
                        📤 Exportar Dados
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Sidebar Direita - Atividades Recentes */}
      <aside className="sidebar-right">
        {/* Atividades Recentes */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title"><TrendingUp size={16} /> Atividades Recentes</h3>
          </div>
          <div className="card-body">
            <div className="activity-feed">
              {activities.map((activity) => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-avatar">
                    <div style={{
                      width: '32px',
                      height: '32px',
                      backgroundColor: 'var(--primary-blue-light)',
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
                      <span className="activity-time">{formatDate(activity.date)}</span>
                    </div>
                    <p className="activity-text">{activity.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Progresso do Perfil */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title"><BarChart3 size={16} /> Progresso do Perfil</h3>
          </div>
          <div className="card-body">
            <div className="flex items-center gap-sm" style={{ marginBottom: 'var(--spacing-sm)' }}>
              <div style={{
                width: '100%',
                height: '8px',
                backgroundColor: 'var(--border-light)',
                position: 'relative'
              }}>
                <div style={{
                  width: '85%',
                  height: '100%',
                  backgroundColor: 'var(--primary-blue)'
                }}></div>
              </div>
              <span className="font-bold text-blue">85%</span>
            </div>
            <p className="text-secondary">Seu perfil está quase completo!</p>
            
            <div className="flex flex-col gap-sm" style={{ marginTop: 'var(--spacing-md)' }}>
              <div className="flex items-center gap-sm">
                <span><Check size={14} /></span>
                <span className="text-secondary">Informações básicas</span>
              </div>
              <div className="flex items-center gap-sm">
                <span><Check size={14} /></span>
                <span className="text-secondary">Foto do perfil</span>
              </div>
              <div className="flex items-center gap-sm">
                <span><Check size={14} /></span>
                <span className="text-secondary">Informações médicas</span>
              </div>
              <div className="flex items-center gap-sm">
                <span>⭕</span>
                <span className="text-secondary">Verificação de identidade</span>
              </div>
            </div>
          </div>
        </div>

        {/* Suporte */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title">🆘 Precisa de Ajuda?</h3>
          </div>
          <div className="card-body">
            <div className="flex flex-col gap-sm">
              <button className="activity-action">
                <MessageCircle size={16} /> Chat com Suporte
              </button>
              <button className="activity-action">
                📚 Central de Ajuda
              </button>
              <button className="activity-action">
                <Mail size={16} /> Enviar Feedback
              </button>
              <button className="activity-action">
                <Phone size={16} /> Contato Telefônico
              </button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}

export default Profile

