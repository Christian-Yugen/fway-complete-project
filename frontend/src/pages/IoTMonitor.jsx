import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Radio, Stethoscope, BarChart3, Scale, Syringe, Zap, RefreshCw, Settings, TrendingUp, Phone, Check, X, Info, Battery, Bot, Glasses } from 'lucide-react'

const IoTMonitor = () => {
  const [activeTab, setActiveTab] = useState('devices')
  const [realTimeData, setRealTimeData] = useState({
    heartRate: 72,
    bloodPressure: { systolic: 120, diastolic: 80 },
    temperature: 36.5,
    oxygenSaturation: 98,
    steps: 8547,
    calories: 2156
  })

  // Simular dados em tempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData(prev => ({
        heartRate: prev.heartRate + Math.floor(Math.random() * 6) - 3,
        bloodPressure: {
          systolic: prev.bloodPressure.systolic + Math.floor(Math.random() * 4) - 2,
          diastolic: prev.bloodPressure.diastolic + Math.floor(Math.random() * 4) - 2
        },
        temperature: prev.temperature + (Math.random() * 0.4) - 0.2,
        oxygenSaturation: Math.max(95, Math.min(100, prev.oxygenSaturation + Math.floor(Math.random() * 2) - 1)),
        steps: prev.steps + Math.floor(Math.random() * 10),
        calories: prev.calories + Math.floor(Math.random() * 5)
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  // Mock data para dispositivos IoT
  const iotDevices = [
    {
      id: 1,
      name: 'Smartwatch Health Pro',
      type: 'wearable',
      status: 'connected',
      battery: 85,
      lastSync: '2 min atrás',
      metrics: ['Frequência Cardíaca', 'Passos', 'Calorias', 'Sono'],
      icon: '⌚'
    },
    {
      id: 2,
      name: 'Medidor de Pressão Smart',
      type: 'medical',
      status: 'connected',
      battery: 92,
      lastSync: '5 min atrás',
      metrics: ['Pressão Arterial', 'Pulso'],
      icon: '<Stethoscope size={16} />'
    },
    {
      id: 3,
      name: 'Oxímetro Digital',
      type: 'medical',
      status: 'connected',
      battery: 78,
      lastSync: '1 min atrás',
      metrics: ['Saturação O2', 'Frequência Cardíaca'],
      icon: '<BarChart3 size={16} />'
    },
    {
      id: 4,
      name: 'Termômetro Inteligente',
      type: 'medical',
      status: 'connected',
      battery: 67,
      lastSync: '3 min atrás',
      metrics: ['Temperatura Corporal'],
      icon: '🌡️'
    },
    {
      id: 5,
      name: 'Balança Smart Body',
      type: 'fitness',
      status: 'offline',
      battery: 45,
      lastSync: '2 horas atrás',
      metrics: ['Peso', 'IMC', 'Gordura Corporal', 'Massa Muscular'],
      icon: '<Scale size={16} />'
    },
    {
      id: 6,
      name: 'Monitor de Glicose',
      type: 'medical',
      status: 'connected',
      battery: 89,
      lastSync: '30 seg atrás',
      metrics: ['Glicemia', 'Tendências'],
      icon: '<Syringe size={16} />'
    }
  ]

  // Mock data para histórico de dados
  const historicalData = [
    {
      date: '2024-06-21',
      heartRate: { avg: 72, min: 58, max: 95 },
      bloodPressure: { systolic: 120, diastolic: 80 },
      steps: 8547,
      calories: 2156,
      sleep: 7.5
    },
    {
      date: '2024-06-20',
      heartRate: { avg: 74, min: 60, max: 98 },
      bloodPressure: { systolic: 118, diastolic: 78 },
      steps: 9234,
      calories: 2298,
      sleep: 8.2
    },
    {
      date: '2024-06-19',
      heartRate: { avg: 71, min: 57, max: 92 },
      bloodPressure: { systolic: 122, diastolic: 82 },
      steps: 7891,
      calories: 2034,
      sleep: 6.8
    },
    {
      date: '2024-06-18',
      heartRate: { avg: 73, min: 59, max: 96 },
      bloodPressure: { systolic: 119, diastolic: 79 },
      steps: 10567,
      calories: 2456,
      sleep: 7.9
    },
    {
      date: '2024-06-17',
      heartRate: { avg: 75, min: 61, max: 99 },
      bloodPressure: { systolic: 121, diastolic: 81 },
      steps: 8923,
      calories: 2187,
      sleep: 7.3
    }
  ]

  // Mock data para alertas
  const alerts = [
    {
      id: 1,
      type: 'warning',
      device: 'Medidor de Pressão Smart',
      message: 'Pressão arterial ligeiramente elevada detectada',
      time: '10 min atrás',
      severity: 'medium'
    },
    {
      id: 2,
      type: 'info',
      device: 'Smartwatch Health Pro',
      message: 'Meta de passos diária atingida!',
      time: '2 horas atrás',
      severity: 'low'
    },
    {
      id: 3,
      type: 'warning',
      device: 'Balança Smart Body',
      message: 'Dispositivo offline há mais de 2 horas',
      time: '2 horas atrás',
      severity: 'medium'
    },
    {
      id: 4,
      type: 'success',
      device: 'Monitor de Glicose',
      message: 'Níveis de glicose dentro do normal',
      time: '30 min atrás',
      severity: 'low'
    }
  ]

  // Mock data para especialistas IoT
  const iotSpecialists = [
    {
      id: 1,
      name: 'Dr. Tech Silva',
      specialty: 'Telemedicina IoT',
      avatar: '/images/professionals/doctor1.jpg',
      experience: '5 anos',
      devices: 25,
      rating: 4.9
    },
    {
      id: 2,
      name: 'Dra. Digital Costa',
      specialty: 'Saúde Digital',
      avatar: '/images/professionals/doctor2.jpg',
      experience: '7 anos',
      devices: 18,
      rating: 4.8
    },
    {
      id: 3,
      name: 'Eng. Carlos IoT',
      specialty: 'Dispositivos Médicos',
      avatar: '/images/professionals/doctor3.jpg',
      experience: '10 anos',
      devices: 35,
      rating: 4.9
    }
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected': return 'var(--success-green)'
      case 'offline': return 'var(--error-red)'
      case 'syncing': return 'var(--warning-orange)'
      default: return 'var(--text-muted)'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected': return '🟢'
      case 'offline': return '🔴'
      case 'syncing': return '🟡'
      default: return '⚪'
    }
  }

  const getAlertColor = (type) => {
    switch (type) {
      case 'success': return 'var(--success-green)'
      case 'warning': return 'var(--warning-orange)'
      case 'error': return 'var(--error-red)'
      default: return 'var(--primary-blue)'
    }
  }

  const getAlertIcon = (type) => {
    switch (type) {
      case 'success': return '<Check size={16} />'
      case 'warning': return '⚠️'
      case 'error': return '<X size={16} />'
      default: return '<Info size={16} />'
    }
  }

  const getBatteryColor = (battery) => {
    if (battery > 50) return 'var(--success-green)'
    if (battery > 20) return 'var(--warning-orange)'
    return 'var(--error-red)'
  }

  const getVitalStatus = (metric, value) => {
    switch (metric) {
      case 'heartRate':
        if (value >= 60 && value <= 100) return 'normal'
        return 'warning'
      case 'bloodPressure':
        if (value.systolic <= 120 && value.diastolic <= 80) return 'normal'
        return 'warning'
      case 'temperature':
        if (value >= 36.1 && value <= 37.2) return 'normal'
        return 'warning'
      case 'oxygenSaturation':
        if (value >= 95) return 'normal'
        return 'warning'
      default:
        return 'normal'
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit',
      weekday: 'short'
    })
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
                <span className="profile-stat-number">6</span>
                <span className="profile-stat-label">Dispositivos</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat-number">5</span>
                <span className="profile-stat-label">Conectados</span>
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
              <Link to="/ar-training" className="activity-action">
                <Glasses size={16} /> AR Training
              </Link>
            </nav>
          </div>
        </div>

        {/* Status dos Dispositivos */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title"><Radio size={16} /> Status Geral</h3>
          </div>
          <div className="card-body">
            <div className="flex flex-col gap-sm">
              <div className="flex justify-between">
                <span className="text-secondary">Dispositivos online</span>
                <span className="font-bold text-blue">5/6</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Última sincronização</span>
                <span className="font-bold">30s atrás</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Dados coletados hoje</span>
                <span className="font-bold">1,247</span>
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
                <BarChart3 size={16} /> Relatório Diário
              </button>
              <button className="activity-action text-left">
                <RefreshCw size={16} /> Sincronizar Tudo
              </button>
              <button className="activity-action text-left">
                <Settings size={16} /> Configurar Dispositivos
              </button>
              <button className="activity-action text-left">
                <TrendingUp size={16} /> Exportar Dados
              </button>
            </nav>
          </div>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="content-main">
        {/* Header do IoT Monitor */}
        <div className="card-professional">
          <div className="card-body">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="card-title" style={{ fontSize: 'var(--font-size-2xl)', margin: '0 0 8px 0' }}>
                  <Radio size={16} /> IoT Monitor
                </h1>
                <p className="card-subtitle">Monitoramento em tempo real dos seus dispositivos de saúde</p>
              </div>
              <div className="flex gap-sm">
                <button
                  onClick={() => setActiveTab('devices')}
                  className={`btn-professional btn-sm ${activeTab === 'devices' ? 'btn-primary' : 'btn-outline'}`}
                >
                  <Phone size={16} /> Dispositivos
                </button>
                <button
                  onClick={() => setActiveTab('realtime')}
                  className={`btn-professional btn-sm ${activeTab === 'realtime' ? 'btn-primary' : 'btn-outline'}`}
                >
                  <BarChart3 size={16} /> Tempo Real
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`btn-professional btn-sm ${activeTab === 'history' ? 'btn-primary' : 'btn-outline'}`}
                >
                  <TrendingUp size={16} /> Histórico
                </button>
                <button
                  onClick={() => setActiveTab('alerts')}
                  className={`btn-professional btn-sm ${activeTab === 'alerts' ? 'btn-primary' : 'btn-outline'}`}
                >
                  🚨 Alertas
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Dispositivos */}
        {activeTab === 'devices' && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
            gap: 'var(--spacing-md)' 
          }}>
            {iotDevices.map((device) => (
              <div key={device.id} className="card-professional">
                <div className="card-header">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-sm">
                      <div style={{ fontSize: '24px' }}>{device.icon}</div>
                      <div>
                        <h3 className="card-title">{device.name}</h3>
                        <p className="card-subtitle">{device.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-sm">
                      <span style={{ color: getStatusColor(device.status) }}>
                        {getStatusIcon(device.status)}
                      </span>
                      <span style={{
                        padding: '2px 6px',
                        backgroundColor: getStatusColor(device.status),
                        color: 'white',
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: '600'
                      }}>
                        {device.status === 'connected' ? 'Conectado' : 'Offline'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <span className="text-secondary">Bateria:</span>
                      <span className="font-bold ml-2" style={{ color: getBatteryColor(device.battery) }}>
                        <Battery size={16} /> {device.battery}%
                      </span>
                    </div>
                    <div>
                      <span className="text-secondary">Última sync:</span>
                      <span className="font-bold ml-2">{device.lastSync}</span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h5 className="font-bold text-primary mb-2">Métricas monitoradas:</h5>
                    <div className="flex flex-wrap gap-sm">
                      {device.metrics.map((metric, index) => (
                        <span key={index} style={{
                          padding: '4px 8px',
                          backgroundColor: 'var(--primary-blue-light)',
                          color: 'var(--primary-blue)',
                          fontSize: 'var(--font-size-xs)',
                          fontWeight: '600'
                        }}>
                          {metric}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-sm">
                    <button className="btn-professional btn-primary btn-sm flex-1">
                      <BarChart3 size={16} /> Ver Dados
                    </button>
                    <button className="btn-professional btn-outline btn-sm">
                      <Settings size={16} /> Config
                    </button>
                    <button className="btn-professional btn-outline btn-sm">
                      <RefreshCw size={16} /> Sync
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Dados em Tempo Real */}
        {activeTab === 'realtime' && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: 'var(--spacing-md)' 
          }}>
            {/* Frequência Cardíaca */}
            <div className="card-professional">
              <div className="card-header">
                <div className="flex items-center gap-sm">
                  <div style={{ fontSize: '24px' }}>❤️</div>
                  <div>
                    <h3 className="card-title">Frequência Cardíaca</h3>
                    <p className="card-subtitle">Smartwatch Health Pro</p>
                  </div>
                </div>
              </div>
              <div className="card-body text-center">
                <div style={{ fontSize: '48px', fontWeight: 'bold', color: 'var(--primary-blue)' }}>
                  {realTimeData.heartRate}
                </div>
                <div style={{ fontSize: '18px', color: 'var(--text-secondary)' }}>
                  bpm
                </div>
                <div style={{
                  marginTop: 'var(--spacing-sm)',
                  padding: '4px 8px',
                  backgroundColor: getVitalStatus('heartRate', realTimeData.heartRate) === 'normal' ? 'var(--success-green)' : 'var(--warning-orange)',
                  color: 'white',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: '600'
                }}>
                  {getVitalStatus('heartRate', realTimeData.heartRate) === 'normal' ? '<Check size={16} /> Normal' : '⚠️ Atenção'}
                </div>
              </div>
            </div>

            {/* Pressão Arterial */}
            <div className="card-professional">
              <div className="card-header">
                <div className="flex items-center gap-sm">
                  <div style={{ fontSize: '24px' }}><Stethoscope size={16} /></div>
                  <div>
                    <h3 className="card-title">Pressão Arterial</h3>
                    <p className="card-subtitle">Medidor Smart</p>
                  </div>
                </div>
              </div>
              <div className="card-body text-center">
                <div style={{ fontSize: '36px', fontWeight: 'bold', color: 'var(--primary-blue)' }}>
                  {realTimeData.bloodPressure.systolic}/{realTimeData.bloodPressure.diastolic}
                </div>
                <div style={{ fontSize: '18px', color: 'var(--text-secondary)' }}>
                  mmHg
                </div>
                <div style={{
                  marginTop: 'var(--spacing-sm)',
                  padding: '4px 8px',
                  backgroundColor: getVitalStatus('bloodPressure', realTimeData.bloodPressure) === 'normal' ? 'var(--success-green)' : 'var(--warning-orange)',
                  color: 'white',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: '600'
                }}>
                  {getVitalStatus('bloodPressure', realTimeData.bloodPressure) === 'normal' ? '<Check size={16} /> Normal' : '⚠️ Elevada'}
                </div>
              </div>
            </div>

            {/* Temperatura */}
            <div className="card-professional">
              <div className="card-header">
                <div className="flex items-center gap-sm">
                  <div style={{ fontSize: '24px' }}>🌡️</div>
                  <div>
                    <h3 className="card-title">Temperatura</h3>
                    <p className="card-subtitle">Termômetro Inteligente</p>
                  </div>
                </div>
              </div>
              <div className="card-body text-center">
                <div style={{ fontSize: '48px', fontWeight: 'bold', color: 'var(--primary-blue)' }}>
                  {realTimeData.temperature.toFixed(1)}
                </div>
                <div style={{ fontSize: '18px', color: 'var(--text-secondary)' }}>
                  °C
                </div>
                <div style={{
                  marginTop: 'var(--spacing-sm)',
                  padding: '4px 8px',
                  backgroundColor: getVitalStatus('temperature', realTimeData.temperature) === 'normal' ? 'var(--success-green)' : 'var(--warning-orange)',
                  color: 'white',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: '600'
                }}>
                  {getVitalStatus('temperature', realTimeData.temperature) === 'normal' ? '<Check size={16} /> Normal' : '⚠️ Alterada'}
                </div>
              </div>
            </div>

            {/* Saturação de Oxigênio */}
            <div className="card-professional">
              <div className="card-header">
                <div className="flex items-center gap-sm">
                  <div style={{ fontSize: '24px' }}><BarChart3 size={16} /></div>
                  <div>
                    <h3 className="card-title">Saturação O2</h3>
                    <p className="card-subtitle">Oxímetro Digital</p>
                  </div>
                </div>
              </div>
              <div className="card-body text-center">
                <div style={{ fontSize: '48px', fontWeight: 'bold', color: 'var(--primary-blue)' }}>
                  {realTimeData.oxygenSaturation}
                </div>
                <div style={{ fontSize: '18px', color: 'var(--text-secondary)' }}>
                  %
                </div>
                <div style={{
                  marginTop: 'var(--spacing-sm)',
                  padding: '4px 8px',
                  backgroundColor: getVitalStatus('oxygenSaturation', realTimeData.oxygenSaturation) === 'normal' ? 'var(--success-green)' : 'var(--warning-orange)',
                  color: 'white',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: '600'
                }}>
                  {getVitalStatus('oxygenSaturation', realTimeData.oxygenSaturation) === 'normal' ? '<Check size={16} /> Normal' : '⚠️ Baixa'}
                </div>
              </div>
            </div>

            {/* Passos */}
            <div className="card-professional">
              <div className="card-header">
                <div className="flex items-center gap-sm">
                  <div style={{ fontSize: '24px' }}>🚶</div>
                  <div>
                    <h3 className="card-title">Passos Hoje</h3>
                    <p className="card-subtitle">Smartwatch Health Pro</p>
                  </div>
                </div>
              </div>
              <div className="card-body text-center">
                <div style={{ fontSize: '36px', fontWeight: 'bold', color: 'var(--primary-blue)' }}>
                  {realTimeData.steps.toLocaleString()}
                </div>
                <div style={{ fontSize: '18px', color: 'var(--text-secondary)' }}>
                  passos
                </div>
                <div style={{
                  marginTop: 'var(--spacing-sm)',
                  padding: '4px 8px',
                  backgroundColor: realTimeData.steps >= 10000 ? 'var(--success-green)' : 'var(--warning-orange)',
                  color: 'white',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: '600'
                }}>
                  {realTimeData.steps >= 10000 ? '<Target size={16} /> Meta Atingida' : '<TrendingUp size={16} /> Em Progresso'}
                </div>
              </div>
            </div>

            {/* Calorias */}
            <div className="card-professional">
              <div className="card-header">
                <div className="flex items-center gap-sm">
                  <div style={{ fontSize: '24px' }}><Flame size={16} /></div>
                  <div>
                    <h3 className="card-title">Calorias Queimadas</h3>
                    <p className="card-subtitle">Smartwatch Health Pro</p>
                  </div>
                </div>
              </div>
              <div className="card-body text-center">
                <div style={{ fontSize: '36px', fontWeight: 'bold', color: 'var(--primary-blue)' }}>
                  {realTimeData.calories.toLocaleString()}
                </div>
                <div style={{ fontSize: '18px', color: 'var(--text-secondary)' }}>
                  kcal
                </div>
                <div style={{
                  marginTop: 'var(--spacing-sm)',
                  padding: '4px 8px',
                  backgroundColor: realTimeData.calories >= 2000 ? 'var(--success-green)' : 'var(--warning-orange)',
                  color: 'white',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: '600'
                }}>
                  {realTimeData.calories >= 2000 ? '<Target size={16} /> Meta Atingida' : '<TrendingUp size={16} /> Em Progresso'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Histórico de Dados */}
        {activeTab === 'history' && (
          <div className="card-professional">
            <div className="card-header">
              <h2 className="card-title"><TrendingUp size={16} /> Histórico dos Últimos 5 Dias</h2>
              <p className="card-subtitle">Tendências e padrões dos seus dados de saúde</p>
            </div>
            <div className="card-body">
              <div className="flex flex-col gap-md">
                {historicalData.map((day, index) => (
                  <div key={day.date} className="card-professional">
                    <div className="card-header">
                      <h3 className="card-title">{formatDate(day.date)}</h3>
                      <p className="card-subtitle">{day.date}</p>
                    </div>
                    <div className="card-body">
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                        gap: 'var(--spacing-md)' 
                      }}>
                        <div className="text-center">
                          <div className="text-secondary">❤️ Freq. Cardíaca</div>
                          <div className="font-bold text-primary">{day.heartRate.avg} bpm</div>
                          <div className="text-muted">({day.heartRate.min}-{day.heartRate.max})</div>
                        </div>
                        <div className="text-center">
                          <div className="text-secondary"><Stethoscope size={16} /> Pressão</div>
                          <div className="font-bold text-primary">{day.bloodPressure.systolic}/{day.bloodPressure.diastolic}</div>
                          <div className="text-muted">mmHg</div>
                        </div>
                        <div className="text-center">
                          <div className="text-secondary">🚶 Passos</div>
                          <div className="font-bold text-primary">{day.steps.toLocaleString()}</div>
                          <div className="text-muted">passos</div>
                        </div>
                        <div className="text-center">
                          <div className="text-secondary"><Flame size={16} /> Calorias</div>
                          <div className="font-bold text-primary">{day.calories.toLocaleString()}</div>
                          <div className="text-muted">kcal</div>
                        </div>
                        <div className="text-center">
                          <div className="text-secondary">😴 Sono</div>
                          <div className="font-bold text-primary">{day.sleep}h</div>
                          <div className="text-muted">horas</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-sm" style={{ marginTop: 'var(--spacing-md)' }}>
                <button className="btn-professional btn-primary">
                  <BarChart3 size={16} /> Ver Relatório Completo
                </button>
                <button className="btn-professional btn-outline">
                  <TrendingUp size={16} /> Análise de Tendências
                </button>
                <button className="btn-professional btn-outline">
                  📤 Exportar Dados
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Alertas */}
        {activeTab === 'alerts' && (
          <div className="flex flex-col gap-md">
            {alerts.map((alert) => (
              <div key={alert.id} className="card-professional">
                <div className="card-body">
                  <div className="flex items-start gap-md">
                    <div style={{
                      fontSize: '24px',
                      color: getAlertColor(alert.type)
                    }}>
                      {getAlertIcon(alert.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-primary">{alert.device}</h4>
                          <p className="text-secondary">{alert.message}</p>
                          <small className="text-muted">{alert.time}</small>
                        </div>
                        <div>
                          <span style={{
                            padding: '4px 8px',
                            backgroundColor: getAlertColor(alert.type),
                            color: 'white',
                            fontSize: 'var(--font-size-xs)',
                            fontWeight: '600'
                          }}>
                            {alert.type === 'warning' && 'Atenção'}
                            {alert.type === 'success' && 'Sucesso'}
                            {alert.type === 'info' && 'Info'}
                            {alert.type === 'error' && 'Erro'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-sm" style={{ marginTop: 'var(--spacing-sm)' }}>
                        <button className="btn-professional btn-primary btn-sm">
                          <Search size={16} /> Ver Detalhes
                        </button>
                        <button className="btn-professional btn-outline btn-sm">
                          <Check size={16} /> Marcar como Lido
                        </button>
                        <button className="btn-professional btn-outline btn-sm">
                          <Calendar size={16} /> Agendar Consulta
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Sidebar Direita */}
      <aside className="sidebar-right">
        {/* Resumo dos Vitais */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title"><BarChart3 size={16} /> Resumo Atual</h3>
          </div>
          <div className="card-body">
            <div className="flex flex-col gap-sm">
              <div className="flex justify-between">
                <span className="text-secondary">❤️ Freq. Cardíaca</span>
                <span className="font-bold">{realTimeData.heartRate} bpm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary"><Stethoscope size={16} /> Pressão</span>
                <span className="font-bold">{realTimeData.bloodPressure.systolic}/{realTimeData.bloodPressure.diastolic}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">🌡️ Temperatura</span>
                <span className="font-bold">{realTimeData.temperature.toFixed(1)}°C</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary"><BarChart3 size={16} /> Saturação O2</span>
                <span className="font-bold">{realTimeData.oxygenSaturation}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Especialistas IoT */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title"><Wrench size={16} /> Especialistas IoT</h3>
          </div>
          <div className="card-body">
            <div className="flex flex-col gap-md">
              {iotSpecialists.map((specialist) => (
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
                      <span><Phone size={16} /> {specialist.devices} dispositivos</span>
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

        {/* Estatísticas IoT */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title"><TrendingUp size={16} /> Estatísticas</h3>
          </div>
          <div className="card-body">
            <div className="flex flex-col gap-sm">
              <div className="flex justify-between">
                <span className="text-secondary">Dados coletados</span>
                <span className="font-bold">1,247</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Uptime médio</span>
                <span className="font-bold">98.5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Alertas resolvidos</span>
                <span className="font-bold">156</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Economia energia</span>
                <span className="font-bold">23%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dicas IoT */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title"><Lightbulb size={16} /> Dica IoT</h3>
          </div>
          <div className="card-body">
            <div className="bg-light p-md text-center">
              <div style={{ fontSize: '32px', marginBottom: 'var(--spacing-sm)' }}><Battery size={16} /></div>
              <h4 className="font-bold text-primary">Otimize a Bateria</h4>
              <p className="text-secondary">Sincronize seus dispositivos a cada 2 horas para economizar bateria</p>
            </div>
          </div>
        </div>

        {/* Atualizações de Firmware */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title"><RefreshCw size={16} /> Atualizações</h3>
          </div>
          <div className="card-body">
            <div className="flex flex-col gap-sm">
              <div className="bg-light p-sm">
                <h5 className="font-bold text-primary">⌚ Smartwatch</h5>
                <p className="text-secondary">Firmware v2.1.3 disponível</p>
                <button className="btn-professional btn-outline btn-sm">Atualizar</button>
              </div>
              <div className="bg-light p-sm">
                <h5 className="font-bold text-primary"><Stethoscope size={16} /> Medidor Pressão</h5>
                <p className="text-secondary">Atualizado recentemente</p>
                <span className="text-muted"><Check size={16} /> v1.8.2</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}

export default IoTMonitor

