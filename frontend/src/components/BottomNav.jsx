import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, BarChart3, Search, Users, Smartphone, User, Bot, Radio, Glasses, Brain, Calendar, PlusCircle } from 'lucide-react'


const BottomNav = () => {
  const location = useLocation()

  const navItems = [
    { path: '/', icon: <Home size={20} />, label: 'Início' },
    { path: '/dashboard', icon: <BarChart3 size={20} />, label: 'Dashboard' },
    { path: '/search', icon: <Search size={20} />, label: 'Buscar' },
    { path: '/network', icon: <Users size={20} />, label: 'Rede' },
    { path: '/social', icon: <Smartphone size={20} />, label: 'Social' },
    { path: '/profile', icon: <User size={20} />, label: 'Perfil' },
    { path: '/ai-health', icon: <Bot size={20} />, label: 'IA Saúde' },
    { path: '/iot-monitor', icon: <Radio size={20} />, label: 'IoT Monitor' },
    { path: '/ar-training', icon: <Glasses size={20} />, label: 'AR Training' },
    { path: '/neurosync', icon: <Brain size={20} />, label: 'NeuroSync' },
    { path: '/my-bookings', icon: <Calendar size={20} />, label: 'Consultas' },
    { path: '/create-service', icon: <PlusCircle size={20} />, label: 'Criar' }
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

