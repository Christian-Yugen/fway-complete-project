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

  // Mock data simplificado para evitar erros
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
    }
  ]

  // Mock data simplificado para documentos
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
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="card-professional">
            <div className="card-header">
              <h2 className="card-title">Documentos</h2>
              <p className="card-subtitle">Seus documentos e exames</p>
            </div>
            <div className="card-body">
              <div className="flex flex-col gap-md">
                {documents.length > 0 ? (
                  documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded-md">
                      <div className="flex items-center gap-sm">
                        <FileText size={20} className="text-gray-500" />
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-sm text-secondary">{doc.type} - {doc.size} - {formatDate(doc.date)}</p>
                        </div>
                      </div>
                      <div className="flex gap-sm">
                        <button className="btn-professional btn-outline btn-sm"><Download size={16} /></button>
                        <button className="btn-professional btn-outline btn-sm"><Eye size={16} /></button>
                        <button className="btn-professional btn-outline btn-sm"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-secondary">Nenhum documento encontrado.</p>
                )}
                <button className="btn-professional btn-primary mt-md">
                  <Upload size={16} /> Fazer Upload de Documento
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'privacy' && (
          <div className="card-professional">
            <div className="card-header">
              <h2 className="card-title">Configurações de Privacidade</h2>
              <p className="card-subtitle">Gerencie quem pode ver suas informações</p>
            </div>
            <div className="card-body">
              <div className="flex flex-col gap-md">
                <div className="flex items-center justify-between">
                  <label htmlFor="profileVisibility" className="font-medium">Visibilidade do Perfil</label>
                  <select id="profileVisibility" className="form-select">
                    <option>Público</option>
                    <option>Somente Conexões</option>
                    <option>Privado</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <label htmlFor="dataSharing" className="font-medium">Compartilhamento de Dados</label>
                  <input type="checkbox" id="dataSharing" className="form-checkbox" />
                </div>
                <div className="flex items-center justify-between">
                  <label htmlFor="notificationSettings" className="font-medium">Notificações</label>
                  <button className="btn-professional btn-outline btn-sm">Gerenciar</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Atividades Recentes */}
        <div className="card-professional">
          <div className="card-header">
            <h2 className="card-title">Atividades Recentes</h2>
            <p className="card-subtitle">Seu histórico de interações na plataforma</p>
          </div>
          <div className="card-body">
            <div className="flex flex-col gap-md">
              {activities.length > 0 ? (
                activities.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-md">
                    {getActivityIcon(activity.type)}
                    <div>
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-sm text-secondary">{activity.description}</p>
                      <p className="text-xs text-muted flex items-center gap-1">
                        <Clock size={12} /> {formatDate(activity.date)} às {activity.time}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-secondary">Nenhuma atividade recente.</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Profile