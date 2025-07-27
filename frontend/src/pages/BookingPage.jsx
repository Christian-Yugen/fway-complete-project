import React, { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'

const BookingPage = () => {
  const { professionalId } = useParams()
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)
  const [consultationType, setConsultationType] = useState('presencial')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    symptoms: '',
    observations: '',
    healthPlan: '',
    isFirstConsultation: false
  })

  // Mock data do profissional
  const professional = {
    id: professionalId || 1,
    name: 'Dr. João Silva',
    specialty: 'Cardiologia',
    avatar: '/images/professionals/doctor1.jpg',
    rating: 4.9,
    reviews: 247,
    price: 180,
    location: 'São Paulo, SP',
    experience: '15 anos'
  }

  // Gerar próximos 30 dias (excluindo domingos)
  const generateAvailableDates = () => {
    const dates = []
    const today = new Date()
    
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      
      // Pular domingos (0 = domingo)
      if (date.getDay() !== 0) {
        dates.push({
          date: date,
          day: date.getDate(),
          month: date.getMonth() + 1,
          year: date.getFullYear(),
          dayName: date.toLocaleDateString('pt-BR', { weekday: 'short' }),
          fullDate: date.toLocaleDateString('pt-BR')
        })
      }
    }
    
    return dates
  }

  // Gerar horários disponíveis baseado no dia selecionado
  const generateAvailableTimes = (selectedDate) => {
    if (!selectedDate) return []
    
    const times = []
    const dayOfWeek = selectedDate.date.getDay()
    
    // Horários diferentes para sábado
    const startHour = 8
    const endHour = dayOfWeek === 6 ? 12 : 17 // Sábado até 12h, outros dias até 17h
    
    for (let hour = startHour; hour < endHour; hour++) {
      // Pular horário de almoço (12h-14h) nos dias úteis
      if (dayOfWeek !== 6 && (hour === 12 || hour === 13)) continue
      
      for (let minute of [0, 30]) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        
        // Simular alguns horários ocupados
        const isOccupied = ['09:00', '10:30', '14:00', '15:30'].includes(timeString)
        
        times.push({
          time: timeString,
          available: !isOccupied
        })
      }
    }
    
    return times
  }

  const availableDates = generateAvailableDates()
  const availableTimes = generateAvailableTimes(selectedDate)

  const handleDateSelect = (date) => {
    setSelectedDate(date)
    setSelectedTime(null) // Reset time when date changes
  }

  const handleTimeSelect = (time) => {
    setSelectedTime(time)
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleConfirmBooking = () => {
    // Simular confirmação de agendamento
    alert('Agendamento confirmado com sucesso!')
    navigate('/')
  }

  const isStep1Valid = selectedDate && selectedTime
  const isStep2Valid = formData.name && formData.email && formData.phone && formData.cpf

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
                <span className="profile-stat-number">3</span>
                <span className="profile-stat-label">Consultas</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat-number">2</span>
                <span className="profile-stat-label">Profissionais</span>
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
              <Link to="/my-bookings" className="activity-action">
                <Calendar size={16} /> Minhas Consultas
              </Link>
              <Link to="/chat" className="activity-action">
                <MessageCircle size={16} /> Mensagens
              </Link>
              <Link to="/profile" className="activity-action">
                <User size={16} /> Meu Perfil
              </Link>
            </nav>
          </div>
        </div>

        {/* Progresso do Agendamento */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title"><FileText size={16} /> Progresso</h3>
          </div>
          <div className="card-body">
            <div className="flex flex-col gap-sm">
              <div className={`flex items-center gap-sm ${currentStep >= 1 ? 'text-blue' : 'text-muted'}`}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  backgroundColor: currentStep >= 1 ? 'var(--primary-blue)' : 'var(--text-muted)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 'bold'
                }}>
                  1
                </div>
                <span>Data e Horário</span>
              </div>
              <div className={`flex items-center gap-sm ${currentStep >= 2 ? 'text-blue' : 'text-muted'}`}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  backgroundColor: currentStep >= 2 ? 'var(--primary-blue)' : 'var(--text-muted)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 'bold'
                }}>
                  2
                </div>
                <span>Dados Pessoais</span>
              </div>
              <div className={`flex items-center gap-sm ${currentStep >= 3 ? 'text-blue' : 'text-muted'}`}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  backgroundColor: currentStep >= 3 ? 'var(--primary-blue)' : 'var(--text-muted)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 'bold'
                }}>
                  3
                </div>
                <span>Confirmação</span>
              </div>
            </div>
          </div>
        </div>

        {/* Informações Importantes */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title"><Info size={16} /> Informações</h3>
          </div>
          <div className="card-body">
            <div className="flex flex-col gap-sm text-secondary">
              <p>• Chegue 15 minutos antes</p>
              <p>• Traga documentos pessoais</p>
              <p>• Exames anteriores (se houver)</p>
              <p>• Carteirinha do plano de saúde</p>
              <p>• Cancelamento até 24h antes</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="content-main">
        {/* Header do Agendamento */}
        <div className="card-professional">
          <div className="card-body">
            <div className="flex items-center gap-md">
              <Link to={`/professional/${professional.id}`} className="btn-professional btn-outline btn-sm">
                ← Voltar ao Perfil
              </Link>
              <div>
                <h1 className="card-title" style={{ fontSize: 'var(--font-size-2xl)', margin: '0 0 8px 0' }}>
                  <Calendar size={16} /> Agendar Consulta
                </h1>
                <p className="card-subtitle">Complete os dados para confirmar seu agendamento</p>
              </div>
            </div>
          </div>
        </div>

        {/* Informações do Profissional */}
        <div className="card-professional">
          <div className="card-body">
            <div className="flex items-center gap-md">
              <div className="profile-avatar-medium">
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
                <h3 className="card-title">{professional.name}</h3>
                <p className="card-subtitle">{professional.specialty}</p>
                <div className="flex items-center gap-md text-muted">
                  <span><Star size={16} /> {professional.rating} ({professional.reviews} avaliações)</span>
                  <span><MapPin size={16} /> {professional.location}</span>
                  <span>🎓 {professional.experience}</span>
                </div>
              </div>
              <div className="text-right">
                <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'bold', color: 'var(--primary-blue)' }}>
                  R$ {professional.price}
                </div>
                <p className="text-secondary">por consulta</p>
              </div>
            </div>
          </div>
        </div>

        {/* Etapa 1: Data e Horário */}
        {currentStep === 1 && (
          <div className="flex flex-col gap-md">
            {/* Tipo de Consulta */}
            <div className="card-professional">
              <div className="card-header">
                <h2 className="card-title"><Building size={16} /> Tipo de Consulta</h2>
              </div>
              <div className="card-body">
                <div className="flex gap-md">
                  <button
                    onClick={() => setConsultationType('presencial')}
                    className={`btn-professional flex-1 ${consultationType === 'presencial' ? 'btn-primary' : 'btn-outline'}`}
                  >
                    <Building size={16} /> Presencial
                  </button>
                  <button
                    onClick={() => setConsultationType('teleconsulta')}
                    className={`btn-professional flex-1 ${consultationType === 'teleconsulta' ? 'btn-primary' : 'btn-outline'}`}
                  >
                    <Laptop size={16} /> Teleconsulta
                  </button>
                </div>
              </div>
            </div>

            {/* Seleção de Data */}
            <div className="card-professional">
              <div className="card-header">
                <h2 className="card-title"><Calendar size={16} /> Selecione a Data</h2>
              </div>
              <div className="card-body">
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', 
                  gap: 'var(--spacing-sm)' 
                }}>
                  {availableDates.slice(0, 21).map((date, index) => (
                    <button
                      key={index}
                      onClick={() => handleDateSelect(date)}
                      className={`btn-professional btn-sm ${selectedDate?.fullDate === date.fullDate ? 'btn-primary' : 'btn-outline'}`}
                      style={{ 
                        padding: 'var(--spacing-sm)',
                        textAlign: 'center',
                        minHeight: '60px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center'
                      }}
                    >
                      <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'bold' }}>
                        {date.dayName}
                      </div>
                      <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'bold' }}>
                        {date.day}
                      </div>
                      <div style={{ fontSize: 'var(--font-size-xs)' }}>
                        {date.month}/{date.year}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Seleção de Horário */}
            {selectedDate && (
              <div className="card-professional">
                <div className="card-header">
                  <h2 className="card-title">⏰ Selecione o Horário</h2>
                  <p className="card-subtitle">Data selecionada: {selectedDate.fullDate}</p>
                </div>
                <div className="card-body">
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', 
                    gap: 'var(--spacing-sm)' 
                  }}>
                    {availableTimes.map((timeSlot, index) => (
                      <button
                        key={index}
                        onClick={() => timeSlot.available && handleTimeSelect(timeSlot.time)}
                        disabled={!timeSlot.available}
                        className={`btn-professional btn-sm ${selectedTime === timeSlot.time ? 'btn-primary' : 'btn-outline'}`}
                        style={{ 
                          opacity: timeSlot.available ? 1 : 0.5,
                          cursor: timeSlot.available ? 'pointer' : 'not-allowed'
                        }}
                      >
                        {timeSlot.time}
                      </button>
                    ))}
                  </div>
                  {availableTimes.length === 0 && (
                    <p className="text-secondary text-center">Nenhum horário disponível para esta data</p>
                  )}
                </div>
              </div>
            )}

            {/* Botões de Navegação */}
            <div className="card-professional">
              <div className="card-body">
                <div className="flex justify-between">
                  <Link to={`/professional/${professional.id}`} className="btn-professional btn-outline">
                    ← Cancelar
                  </Link>
                  <button 
                    onClick={handleNext}
                    disabled={!isStep1Valid}
                    className="btn-professional btn-primary"
                    style={{ opacity: isStep1Valid ? 1 : 0.5 }}
                  >
                    Próximo →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Etapa 2: Dados Pessoais */}
        {currentStep === 2 && (
          <div className="flex flex-col gap-md">
            <div className="card-professional">
              <div className="card-header">
                <h2 className="card-title"><User size={16} /> Dados Pessoais</h2>
              </div>
              <div className="card-body">
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                  gap: 'var(--spacing-md)' 
                }}>
                  <div>
                    <label className="font-bold text-primary">Nome Completo *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="search-input"
                      style={{ marginTop: 'var(--spacing-xs)', width: '100%' }}
                      placeholder="Digite seu nome completo"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-primary">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="search-input"
                      style={{ marginTop: 'var(--spacing-xs)', width: '100%' }}
                      placeholder="seu@email.com"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-primary">Telefone *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="search-input"
                      style={{ marginTop: 'var(--spacing-xs)', width: '100%' }}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-primary">CPF *</label>
                    <input
                      type="text"
                      name="cpf"
                      value={formData.cpf}
                      onChange={handleInputChange}
                      className="search-input"
                      style={{ marginTop: 'var(--spacing-xs)', width: '100%' }}
                      placeholder="000.000.000-00"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="card-professional">
              <div className="card-header">
                <h2 className="card-title"><Building size={16} /> Informações Médicas</h2>
              </div>
              <div className="card-body">
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr', 
                  gap: 'var(--spacing-md)' 
                }}>
                  <div>
                    <label className="font-bold text-primary">Sintomas ou Motivo da Consulta</label>
                    <textarea
                      name="symptoms"
                      value={formData.symptoms}
                      onChange={handleInputChange}
                      className="search-input"
                      style={{ 
                        marginTop: 'var(--spacing-xs)', 
                        width: '100%', 
                        minHeight: '80px',
                        resize: 'vertical'
                      }}
                      placeholder="Descreva seus sintomas ou o motivo da consulta"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-primary">Observações Adicionais</label>
                    <textarea
                      name="observations"
                      value={formData.observations}
                      onChange={handleInputChange}
                      className="search-input"
                      style={{ 
                        marginTop: 'var(--spacing-xs)', 
                        width: '100%', 
                        minHeight: '60px',
                        resize: 'vertical'
                      }}
                      placeholder="Medicamentos em uso, alergias, etc."
                    />
                  </div>
                  <div>
                    <label className="font-bold text-primary">Plano de Saúde</label>
                    <input
                      type="text"
                      name="healthPlan"
                      value={formData.healthPlan}
                      onChange={handleInputChange}
                      className="search-input"
                      style={{ marginTop: 'var(--spacing-xs)', width: '100%' }}
                      placeholder="Nome do plano de saúde (opcional)"
                    />
                  </div>
                  <div className="flex items-center gap-sm">
                    <input
                      type="checkbox"
                      name="isFirstConsultation"
                      checked={formData.isFirstConsultation}
                      onChange={handleInputChange}
                      id="firstConsultation"
                    />
                    <label htmlFor="firstConsultation" className="text-primary">
                      Esta é minha primeira consulta com este profissional
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Botões de Navegação */}
            <div className="card-professional">
              <div className="card-body">
                <div className="flex justify-between">
                  <button onClick={handlePrevious} className="btn-professional btn-outline">
                    ← Anterior
                  </button>
                  <button 
                    onClick={handleNext}
                    disabled={!isStep2Valid}
                    className="btn-professional btn-primary"
                    style={{ opacity: isStep2Valid ? 1 : 0.5 }}
                  >
                    Próximo →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Etapa 3: Confirmação */}
        {currentStep === 3 && (
          <div className="flex flex-col gap-md">
            <div className="card-professional">
              <div className="card-header">
                <h2 className="card-title"><Check size={16} /> Confirmação do Agendamento</h2>
              </div>
              <div className="card-body">
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                  gap: 'var(--spacing-lg)' 
                }}>
                  {/* Dados da Consulta */}
                  <div className="bg-light p-md">
                    <h3 className="font-bold text-primary mb-4"><Calendar size={16} /> Dados da Consulta</h3>
                    <div className="flex flex-col gap-sm">
                      <div className="flex justify-between">
                        <span className="text-secondary">Profissional:</span>
                        <span className="font-bold">{professional.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-secondary">Especialidade:</span>
                        <span className="font-bold">{professional.specialty}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-secondary">Data:</span>
                        <span className="font-bold">{selectedDate?.fullDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-secondary">Horário:</span>
                        <span className="font-bold">{selectedTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-secondary">Tipo:</span>
                        <span className="font-bold">{consultationType === 'presencial' ? '<Building size={16} /> Presencial' : '<Laptop size={16} /> Teleconsulta'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-secondary">Valor:</span>
                        <span className="font-bold text-blue">R$ {professional.price}</span>
                      </div>
                    </div>
                  </div>

                  {/* Dados do Paciente */}
                  <div className="bg-light p-md">
                    <h3 className="font-bold text-primary mb-4"><User size={16} /> Dados do Paciente</h3>
                    <div className="flex flex-col gap-sm">
                      <div className="flex justify-between">
                        <span className="text-secondary">Nome:</span>
                        <span className="font-bold">{formData.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-secondary">Email:</span>
                        <span className="font-bold">{formData.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-secondary">Telefone:</span>
                        <span className="font-bold">{formData.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-secondary">CPF:</span>
                        <span className="font-bold">{formData.cpf}</span>
                      </div>
                      {formData.healthPlan && (
                        <div className="flex justify-between">
                          <span className="text-secondary">Plano:</span>
                          <span className="font-bold">{formData.healthPlan}</span>
                        </div>
                      )}
                      {formData.isFirstConsultation && (
                        <div className="flex justify-between">
                          <span className="text-secondary">Primeira consulta:</span>
                          <span className="font-bold"><Check size={16} /> Sim</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Informações Importantes */}
                <div className="bg-light p-md" style={{ marginTop: 'var(--spacing-lg)' }}>
                  <h3 className="font-bold text-primary mb-4"><Info size={16} /> Informações Importantes</h3>
                  <div className="flex flex-col gap-sm text-secondary">
                    <p>• Chegue com 15 minutos de antecedência</p>
                    <p>• Traga documento de identidade e carteirinha do plano de saúde</p>
                    <p>• Leve exames anteriores relacionados ao motivo da consulta</p>
                    <p>• Para teleconsulta, você receberá o link por email 30 minutos antes</p>
                    <p>• Cancelamentos devem ser feitos com até 24 horas de antecedência</p>
                    <p>• Em caso de dúvidas, entre em contato através do chat</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Botões de Navegação */}
            <div className="card-professional">
              <div className="card-body">
                <div className="flex justify-between">
                  <button onClick={handlePrevious} className="btn-professional btn-outline">
                    ← Anterior
                  </button>
                  <button 
                    onClick={handleConfirmBooking}
                    className="btn-professional btn-primary btn-lg"
                  >
                    <Check size={16} /> Confirmar Agendamento
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Sidebar Direita */}
      <aside className="sidebar-right">
        {/* Resumo do Agendamento */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title"><FileText size={16} /> Resumo</h3>
          </div>
          <div className="card-body">
            <div className="flex flex-col gap-sm">
              <div className="flex justify-between">
                <span className="text-secondary">Etapa:</span>
                <span className="font-bold">{currentStep}/3</span>
              </div>
              {selectedDate && (
                <div className="flex justify-between">
                  <span className="text-secondary">Data:</span>
                  <span className="font-bold">{selectedDate.fullDate}</span>
                </div>
              )}
              {selectedTime && (
                <div className="flex justify-between">
                  <span className="text-secondary">Horário:</span>
                  <span className="font-bold">{selectedTime}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-secondary">Valor:</span>
                <span className="font-bold text-blue">R$ {professional.price}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Outros Profissionais */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title">👨‍⚕️ Outros Profissionais</h3>
          </div>
          <div className="card-body">
            <div className="flex flex-col gap-sm">
              <div className="bg-light p-sm">
                <h5 className="font-bold text-primary">Dra. Maria Santos</h5>
                <p className="text-secondary">Pediatria</p>
                <small className="text-muted"><Star size={16} /> 4.8 • R$ 160</small>
              </div>
              <div className="bg-light p-sm">
                <h5 className="font-bold text-primary">Dr. Carlos Oliveira</h5>
                <p className="text-secondary">Ortopedia</p>
                <small className="text-muted"><Star size={16} /> 4.7 • R$ 200</small>
              </div>
              <div className="bg-light p-sm">
                <h5 className="font-bold text-primary">Dra. Ana Costa</h5>
                <p className="text-secondary">Dermatologia</p>
                <small className="text-muted"><Star size={16} /> 4.9 • R$ 220</small>
              </div>
            </div>
            <Link to="/" className="btn-professional btn-outline btn-sm" style={{ marginTop: 'var(--spacing-md)' }}>
              Ver Mais Profissionais
            </Link>
          </div>
        </div>

        {/* Formas de Pagamento */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title"><CreditCard size={16} /> Pagamento</h3>
          </div>
          <div className="card-body">
            <div className="flex flex-col gap-sm text-secondary">
              <p><CreditCard size={16} /> Cartão de Crédito</p>
              <p><DollarSign size={16} /> Cartão de Débito</p>
              <p><DollarSign size={16} /> Dinheiro (presencial)</p>
              <p><Building size={16} /> Plano de Saúde</p>
              <p><Phone size={16} /> PIX</p>
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
              <Link to="/chat" className="btn-professional btn-outline btn-sm">
                <MessageCircle size={16} /> Chat de Suporte
              </Link>
              <button className="btn-professional btn-outline btn-sm">
                <Phone size={16} /> (11) 9999-9999
              </button>
              <button className="btn-professional btn-outline btn-sm">
                <Mail size={16} /> suporte@fway.com
              </button>
            </div>
          </div>
        </div>

        {/* Política de Cancelamento */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title"><FileText size={16} /> Política</h3>
          </div>
          <div className="card-body">
            <div className="flex flex-col gap-sm text-secondary">
              <p>• Cancelamento gratuito até 24h antes</p>
              <p>• Reagendamento sem custo adicional</p>
              <p>• Reembolso em até 5 dias úteis</p>
              <p>• Falta sem aviso: cobrança de 50%</p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}

export default BookingPage

