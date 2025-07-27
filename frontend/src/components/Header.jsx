import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import NotificationCenter from './NotificationCenter'
import { 
  Search,
  Home,
  Users,
  MessageCircle,
  Calendar,
  Rocket,
  BarChart3,
  Smartphone,
  Bot,
  Radio,
  Glasses,
  Brain,
  Shield,
  User,
  Trophy
} from 'lucide-react'

const Header = () => {
  const location = useLocation()
  const [searchQuery, setSearchQuery] = useState('')
  const [showAdvancedMenu, setShowAdvancedMenu] = useState(false)

  const isActive = (path) => location.pathname === path

  const handleSearch = (e) => {
    e.preventDefault()
    // Implementar busca
    console.log('Buscar:', searchQuery)
  }

  const advancedFeatures = [
    { path: '/dashboard', icon: <BarChart3 size={18} />, label: 'Dashboard' },
    { path: '/intelligent-matching', icon: <Brain size={18} />, label: 'Matching Inteligente' },
    { path: '/service-feed', icon: <MessageCircle size={18} />, label: 'Feed de Serviços' },
    { path: '/profile-verification', icon: <Shield size={18} />, label: 'Verificação de Perfil' },
    { path: '/performance-dashboard', icon: <BarChart3 size={18} />, label: 'Dashboard de Performance' },
    { path: '/rewards-system', icon: <Trophy size={18} />, label: 'Sistema de Recompensas' },
    // Funcionalidades Uber adaptadas
    { path: '/service-request', icon: <MessageCircle size={18} />, label: 'Solicitar Serviço' },
    { path: '/professional-map', icon: <Users size={18} />, label: 'Mapa de Profissionais' },
    { path: '/rating-history', icon: <Trophy size={18} />, label: 'Avaliações e Histórico' },
    { path: '/payment-pricing', icon: <BarChart3 size={18} />, label: 'Pagamentos e Preços' },
    { path: '/chat-notifications', icon: <MessageCircle size={18} />, label: 'Chat e Notificações' },
    // Fway Shield - Seguro Embutido
    { path: '/shield-dashboard', icon: <Shield size={18} />, label: 'Shield Dashboard' },
    { path: '/risk-intelligence', icon: <Brain size={18} />, label: 'Risk Intelligence' },
    { path: '/coverage-manager', icon: <BarChart3 size={18} />, label: 'Gerenciar Coberturas' },
    { path: '/claims-center', icon: <MessageCircle size={18} />, label: 'Centro de Sinistros' },
    { path: '/shield-rewards', icon: <Trophy size={18} />, label: 'Shield Rewards' },
    // Outras funcionalidades
    { path: '/social', icon: <Smartphone size={18} />, label: 'Social' },
    { path: '/ai-health', icon: <Bot size={18} />, label: 'IA Saúde' },
    { path: '/iot-monitor', icon: <Radio size={18} />, label: 'IoT Monitor' },
    { path: '/ar-training', icon: <Glasses size={18} />, label: 'AR Training' },
    { path: '/neurosync', icon: <Brain size={18} />, label: 'NeuroSync' },
    { path: '/booking/1', icon: <Calendar size={18} />, label: 'Agendamento' },
    { path: '/verification', icon: <Shield size={18} />, label: 'Verificação' }
  ]

  return (
    <header className="header-professional">
      <div className="header-content">
        {/* Logo e Busca */}
        <div className="header-left">
          <Link to="/" className="logo-professional">
            <div className="logo-icon">F</div>
            <span className="logo-text">Fway</span>
          </Link>
          
          <div className="header-center">
            <form onSubmit={handleSearch} className="search-professional">
              <span className="search-icon">
                <Search size={18} className="text-gray-500" />
              </span>
              <input
                type="text"
                placeholder="Buscar profissionais, especialidades..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </form>
          </div>
        </div>

        {/* Navegação Principal */}
        <nav className="header-nav">
          <Link 
            to="/" 
            className={`header-nav-item ${isActive('/') ? 'active' : ''}`}
          >
            <span className="header-nav-icon">
              <Home size={18} />
            </span>
            <span className="header-nav-text">Início</span>
          </Link>

          <Link 
            to="/network" 
            className={`header-nav-item ${isActive('/network') ? 'active' : ''}`}
          >
            <span className="header-nav-icon">
              <Users size={18} />
            </span>
            <span className="header-nav-text">Rede</span>
          </Link>

          <Link 
            to="/chat" 
            className={`header-nav-item ${isActive('/chat') ? 'active' : ''}`}
          >
            <span className="header-nav-icon">
              <MessageCircle size={18} />
            </span>
            <span className="header-nav-text">Mensagens</span>
          </Link>

          <Link 
            to="/my-bookings" 
            className={`header-nav-item ${isActive('/my-bookings') ? 'active' : ''}`}
          >
            <span className="header-nav-icon">
              <Calendar size={18} />
            </span>
            <span className="header-nav-text">Consultas</span>
          </Link>

          {/* Menu de Funcionalidades Avançadas */}
          <div 
            className="header-nav-item"
            style={{ position: 'relative' }}
            onMouseEnter={() => setShowAdvancedMenu(true)}
            onMouseLeave={() => setShowAdvancedMenu(false)}
          >
            <span className="header-nav-icon">
              <Rocket size={18} />
            </span>
            <span className="header-nav-text">Avançado</span>
            
            {showAdvancedMenu && (
              <div className="notifications-dropdown" style={{ 
                top: '100%', 
                right: 0, 
                width: '280px',
                maxHeight: 'none'
              }}>
                <div className="notifications-header">
                  <h3 className="notifications-title flex items-center gap-2">
                    <Rocket size={18} />
                    Funcionalidades Avançadas
                  </h3>
                </div>
                <div style={{ padding: 'var(--spacing-sm)' }}>
                  {advancedFeatures.map((feature, index) => (
                    <Link
                      key={index}
                      to={feature.path}
                      className="notification-item"
                      style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-sm)',
                        padding: 'var(--spacing-sm)',
                        textDecoration: 'none',
                        color: 'var(--text-primary)',
                        borderBottom: index < advancedFeatures.length - 1 ? '1px solid var(--border-light)' : 'none'
                      }}
                      onClick={() => setShowAdvancedMenu(false)}
                    >
                      <span className="text-blue-600">{feature.icon}</span>
                      <span className="font-bold">{feature.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <NotificationCenter />

          <Link 
            to="/profile" 
            className={`header-nav-item ${isActive('/profile') ? 'active' : ''}`}
          >
            <span className="header-nav-icon">
              <User size={18} />
            </span>
            <span className="header-nav-text">Perfil</span>
          </Link>
        </nav>
      </div>
    </header>
  )
}

export default Header

