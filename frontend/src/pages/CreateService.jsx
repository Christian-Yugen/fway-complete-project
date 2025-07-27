import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  FileText,
  DollarSign,
  MapPin,
  Clock,
  ArrowLeft,
  ArrowRight,
  Check,
  Plus,
  Home,
  Building2,
  CreditCard,
  Shield,
  Calendar,
  User,
  Stethoscope,
  Heart,
  Baby,
  Bone,
  Droplets,
  Brain,
  Eye,
  Activity,
  Users,
  Monitor,
  Video,
  Banknote,
  Smartphone
} from 'lucide-react'

const CreateService = () => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    title: '',
    specialty: '',
    serviceType: '',
    description: '',
    price: '',
    duration: 60,
    location: 'clinic',
    address: '',
    city: 'São Paulo',
    workingDays: [],
    workingHours: { start: '08:00', end: '18:00' },
    acceptsInsurance: false,
    paymentMethods: [],
    images: []
  })

  const specialties = [
    { value: 'Cardiologia', icon: <Heart size={16} className="text-red-500" /> },
    { value: 'Dermatologia', icon: <Droplets size={16} className="text-blue-500" /> },
    { value: 'Pediatria', icon: <Baby size={16} className="text-pink-500" /> },
    { value: 'Ginecologia', icon: <User size={16} className="text-purple-500" /> },
    { value: 'Ortopedia', icon: <Bone size={16} className="text-gray-600" /> },
    { value: 'Psiquiatria', icon: <Brain size={16} className="text-purple-600" /> },
    { value: 'Neurologia', icon: <Brain size={16} className="text-indigo-600" /> },
    { value: 'Oftalmologia', icon: <Eye size={16} className="text-blue-600" /> },
    { value: 'Enfermagem', icon: <Users size={16} className="text-green-600" /> },
    { value: 'Fisioterapia', icon: <Activity size={16} className="text-green-500" /> },
    { value: 'Psicologia', icon: <Brain size={16} className="text-teal-600" /> },
    { value: 'Nutrição', icon: <User size={16} className="text-orange-500" /> }
  ]

  const serviceTypes = [
    { value: 'Consulta de Rotina', icon: <Stethoscope size={16} /> },
    { value: 'Consulta Especializada', icon: <User size={16} /> },
    { value: 'Retorno', icon: <ArrowLeft size={16} /> },
    { value: 'Exame Clínico', icon: <FileText size={16} /> },
    { value: 'Procedimento', icon: <Activity size={16} /> },
    { value: 'Home Care', icon: <Home size={16} /> },
    { value: 'Telemedicina', icon: <Video size={16} /> }
  ]

  const weekDays = [
    { id: 'monday', name: 'Segunda' },
    { id: 'tuesday', name: 'Terça' },
    { id: 'wednesday', name: 'Quarta' },
    { id: 'thursday', name: 'Quinta' },
    { id: 'friday', name: 'Sexta' },
    { id: 'saturday', name: 'Sábado' },
    { id: 'sunday', name: 'Domingo' }
  ]

  const paymentMethods = [
    { value: 'Dinheiro', icon: <Banknote size={16} /> },
    { value: 'Cartão de Débito', icon: <CreditCard size={16} /> },
    { value: 'Cartão de Crédito', icon: <CreditCard size={16} /> },
    { value: 'PIX', icon: <Smartphone size={16} /> },
    { value: 'Bitcoin (Strike)', icon: <Monitor size={16} /> }
  ]

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    if (name.includes('.')) {
      const [section, field] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [section]: { ...prev[section], [field]: value }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }))
    }
  }

  const handleArrayChange = (name, value, checked) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked 
        ? [...prev[name], value]
        : prev[name].filter(item => item !== value)
    }))
  }

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Serviço criado:', formData)
    alert('Serviço criado com sucesso!')
    navigate('/dashboard')
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="card-professional">
            <div className="card-header">
              <h3 className="card-title flex items-center gap-2">
                <FileText size={20} className="text-blue-600" />
                Informações Básicas
              </h3>
              <p className="card-subtitle">Configure as informações principais do seu serviço</p>
            </div>
            <div className="card-body">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Título do Serviço *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Ex: Consulta Cardiológica Completa"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Especialidade *</label>
                  <select
                    name="specialty"
                    value={formData.specialty}
                    onChange={handleInputChange}
                    className="form-select"
                    required
                  >
                    <option value="">Selecione uma especialidade</option>
                    {specialties.map(specialty => (
                      <option key={specialty.value} value={specialty.value}>
                        {specialty.value}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Tipo de Serviço *</label>
                  <select
                    name="serviceType"
                    value={formData.serviceType}
                    onChange={handleInputChange}
                    className="form-select"
                    required
                  >
                    <option value="">Selecione o tipo</option>
                    {serviceTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.value}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group form-group-full">
                  <label className="form-label">Descrição do Serviço *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="form-textarea"
                    rows="4"
                    placeholder="Descreva detalhadamente o serviço oferecido, procedimentos incluídos, benefícios..."
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="card-professional">
            <div className="card-header">
              <h3 className="card-title flex items-center gap-2">
                <DollarSign size={20} className="text-green-600" />
                Preços e Duração
              </h3>
              <p className="card-subtitle">Defina valores e tempo de atendimento</p>
            </div>
            <div className="card-body">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Preço (R$) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="150.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Duração (minutos) *</label>
                  <select
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    className="form-select"
                    required
                  >
                    <option value={30}>30 minutos</option>
                    <option value={45}>45 minutos</option>
                    <option value={60}>1 hora</option>
                    <option value={90}>1h 30min</option>
                    <option value={120}>2 horas</option>
                  </select>
                </div>

                <div className="form-group form-group-full">
                  <label className="form-label">Local de Atendimento *</label>
                  <div className="radio-group">
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="location"
                        value="clinic"
                        checked={formData.location === 'clinic'}
                        onChange={handleInputChange}
                      />
                      <span className="radio-label flex items-center gap-2">
                        <Building2 size={16} />
                        Clínica/Consultório
                      </span>
                    </label>
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="location"
                        value="home"
                        checked={formData.location === 'home'}
                        onChange={handleInputChange}
                      />
                      <span className="radio-label flex items-center gap-2">
                        <Home size={16} />
                        Domicílio (Home Care)
                      </span>
                    </label>
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="location"
                        value="online"
                        checked={formData.location === 'online'}
                        onChange={handleInputChange}
                      />
                      <span className="radio-label flex items-center gap-2">
                        <Video size={16} />
                        Online (Telemedicina)
                      </span>
                    </label>
                  </div>
                </div>

                {formData.location !== 'online' && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Endereço *</label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="Rua, número, bairro"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Cidade *</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="form-input"
                        required
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="card-professional">
            <div className="card-header">
              <h3 className="card-title flex items-center gap-2">
                <Clock size={20} className="text-purple-600" />
                Horários e Disponibilidade
              </h3>
              <p className="card-subtitle">Configure seus dias e horários de trabalho</p>
            </div>
            <div className="card-body">
              <div className="form-grid">
                <div className="form-group form-group-full">
                  <label className="form-label">Dias de Trabalho *</label>
                  <div className="checkbox-group">
                    {weekDays.map(day => (
                      <label key={day.id} className="checkbox-option">
                        <input
                          type="checkbox"
                          checked={formData.workingDays.includes(day.id)}
                          onChange={(e) => handleArrayChange('workingDays', day.id, e.target.checked)}
                        />
                        <span className="checkbox-label">{day.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Horário de Início *</label>
                  <input
                    type="time"
                    name="workingHours.start"
                    value={formData.workingHours.start}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Horário de Término *</label>
                  <input
                    type="time"
                    name="workingHours.end"
                    value={formData.workingHours.end}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="card-professional">
            <div className="card-header">
              <h3 className="card-title flex items-center gap-2">
                <CreditCard size={20} className="text-indigo-600" />
                Pagamento e Finalização
              </h3>
              <p className="card-subtitle">Configure formas de pagamento e finalize</p>
            </div>
            <div className="card-body">
              <div className="form-grid">
                <div className="form-group form-group-full">
                  <label className="form-label">Formas de Pagamento Aceitas *</label>
                  <div className="checkbox-group">
                    {paymentMethods.map(method => (
                      <label key={method.value} className="checkbox-option">
                        <input
                          type="checkbox"
                          checked={formData.paymentMethods.includes(method.value)}
                          onChange={(e) => handleArrayChange('paymentMethods', method.value, e.target.checked)}
                        />
                        <span className="checkbox-label flex items-center gap-2">
                          {method.icon}
                          {method.value}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-group form-group-full">
                  <label className="checkbox-option">
                    <input
                      type="checkbox"
                      name="acceptsInsurance"
                      checked={formData.acceptsInsurance}
                      onChange={handleInputChange}
                    />
                    <span className="checkbox-label flex items-center gap-2">
                      <Shield size={16} />
                      Aceita convênios médicos
                    </span>
                  </label>
                </div>

                {/* Resumo do Serviço */}
                <div className="form-group form-group-full">
                  <div className="service-summary">
                    <h4 className="font-bold text-primary">Resumo do Serviço</h4>
                    <div className="summary-item">
                      <span className="summary-label">Título:</span>
                      <span className="summary-value">{formData.title || 'Não informado'}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Especialidade:</span>
                      <span className="summary-value">{formData.specialty || 'Não informado'}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Preço:</span>
                      <span className="summary-value">R$ {formData.price || '0,00'}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Duração:</span>
                      <span className="summary-value">{formData.duration} minutos</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Local:</span>
                      <span className="summary-value">
                        {formData.location === 'clinic' && 'Clínica/Consultório'}
                        {formData.location === 'home' && 'Domicílio'}
                        {formData.location === 'online' && 'Online'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
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
            <p className="profile-title">Profissional</p>
            <div className="profile-stats">
              <div className="profile-stat">
                <span className="profile-stat-number">5</span>
                <span className="profile-stat-label">Serviços</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat-number">4.8</span>
                <span className="profile-stat-label">Avaliação</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progresso */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <FileText size={18} />
              Progresso
            </h3>
          </div>
          <div className="card-body">
            <div className="progress-steps">
              {[1, 2, 3, 4].map(step => (
                <div 
                  key={step} 
                  className={`progress-step ${currentStep >= step ? 'active' : ''}`}
                >
                  <div className="progress-step-number">
                    {currentStep > step ? (
                      <Check size={16} />
                    ) : (
                      step
                    )}
                  </div>
                  <div className="progress-step-label">
                    {step === 1 && 'Básico'}
                    {step === 2 && 'Preços'}
                    {step === 3 && 'Horários'}
                    {step === 4 && 'Pagamento'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Navegação */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <ArrowLeft size={18} />
              Navegação
            </h3>
          </div>
          <div className="card-body">
            <nav className="flex flex-col gap-sm">
              <button
                onClick={() => navigate(-1)}
                className="activity-action flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                Voltar
              </button>
              <button
                onClick={() => navigate('/')}
                className="activity-action flex items-center gap-2"
              >
                <Home size={16} />
                Início
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="activity-action flex items-center gap-2"
              >
                <User size={16} />
                Dashboard
              </button>
            </nav>
          </div>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="content-main">
        {/* Header */}
        <div className="card-professional">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="card-title flex items-center gap-2">
                  <Plus size={24} className="text-blue-600" />
                  Criar Novo Serviço
                </h1>
                <p className="card-subtitle">
                  Passo {currentStep} de 4 - {
                    currentStep === 1 ? 'Informações Básicas' :
                    currentStep === 2 ? 'Preços e Localização' :
                    currentStep === 3 ? 'Horários de Trabalho' :
                    'Pagamento e Finalização'
                  }
                </p>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${(currentStep / 4) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit}>
          {renderStepContent()}

          {/* Navegação dos Steps */}
          <div className="card-professional">
            <div className="card-body">
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className={`btn-professional ${currentStep === 1 ? 'btn-disabled' : 'btn-outline'} flex items-center gap-2`}
                >
                  <ArrowLeft size={16} />
                  Anterior
                </button>

                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="btn-professional btn-primary flex items-center gap-2"
                  >
                    Próximo
                    <ArrowRight size={16} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="btn-professional btn-primary flex items-center gap-2"
                  >
                    <Check size={16} />
                    Criar Serviço
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>
      </main>

      {/* Sidebar Direita */}
      <aside className="sidebar-right">
        {/* Dicas */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <FileText size={18} />
              Dicas
            </h3>
          </div>
          <div className="card-body">
            <div className="flex flex-col gap-sm">
              <div className="tip-item">
                <h4 className="tip-title flex items-center gap-2">
                  <FileText size={14} className="text-blue-500" />
                  Título Atrativo
                </h4>
                <p className="tip-text">Use um título claro e específico para atrair mais pacientes</p>
              </div>
              <div className="tip-item">
                <h4 className="tip-title flex items-center gap-2">
                  <DollarSign size={14} className="text-green-500" />
                  Preço Competitivo
                </h4>
                <p className="tip-text">Pesquise preços da região para definir um valor justo</p>
              </div>
              <div className="tip-item">
                <h4 className="tip-title flex items-center gap-2">
                  <Clock size={14} className="text-purple-500" />
                  Horários Flexíveis
                </h4>
                <p className="tip-text">Ofereça horários variados para atender mais pacientes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <Activity size={18} />
              Estatísticas
            </h3>
          </div>
          <div className="card-body">
            <div className="flex flex-col gap-sm">
              <div className="stat-item">
                <span className="stat-label">Serviços criados</span>
                <span className="stat-value">5</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Taxa de conversão</span>
                <span className="stat-value">78%</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Avaliação média</span>
                <span className="stat-value">4.8</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}

export default CreateService

