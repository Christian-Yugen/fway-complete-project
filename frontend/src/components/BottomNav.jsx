import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const BottomNav = () => {
  const location = useLocation()

  const navItems = [
    { path: '/', icon: '🏠', label: 'Início' },
    { path: '/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/search', icon: '🔍', label: 'Buscar' },
    { path: '/network', icon: '🌐', label: 'Rede' },
    { path: '/social', icon: '📱', label: 'Social' },
    { path: '/profile', icon: '👤', label: 'Perfil' },
    { path: '/ai-health', icon: '🤖', label: 'IA Saúde' },
    { path: '/iot-monitor', icon: '📡', label: 'IoT Monitor' },
    { path: '/ar-training', icon: '🥽', label: 'AR Training' },
    { path: '/neurosync', icon: '🧠', label: 'NeuroSync' },
    { path: '/bookings', icon: '📅', label: 'Reservas' },
    { path: '/create', icon: '➕', label: 'Criar' }
  ]

  return (
    <nav className="bottom-nav-fixed">
      <div className="nav-grid">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="nav-item-icon">{item.icon}</span>
            <span className="nav-item-text">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}

export default BottomNav

