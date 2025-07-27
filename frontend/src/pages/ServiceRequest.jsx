import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Stethoscope,
  Heart,
  Activity,
  Brain,
  Apple,
  Home,
  Building2,
  Video,
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Shield,
  Star,
  User,
  ChevronRight,
  FileText
} from 'lucide-react';
import { serviceRequestSystem, geolocationSystem } from '../utils/uberFeatures';

const ServiceRequest = () => {
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedUrgency, setSelectedUrgency] = useState('routine');
  const [selectedLocation, setSelectedLocation] = useState('clinic');
  const [description, setDescription] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyProfessionals, setNearbyProfessionals] = useState([]);
  const [estimatedPrice, setEstimatedPrice] = useState(0);
  const [step, setStep] = useState(1);

  // Carregar localização do usuário
  useEffect(() => {
    geolocationSystem.getCurrentLocation()
      .then(location => {
        setUserLocation(location);
      })
      .catch(error => {
        console.error('Erro ao obter localização:', error);
      });
  }, []);

  // Buscar profissionais próximos
  useEffect(() => {
    if (selectedService && userLocation) {
      const professionals = geolocationSystem.findNearbyProfessionals(
        userLocation,
        selectedService.id,
        10
      );
      setNearbyProfessionals(professionals);
    }
  }, [selectedService, userLocation]);

  // Calcular preço estimado
  useEffect(() => {
    if (selectedService && selectedUrgency) {
      const urgency = serviceRequestSystem.urgencyLevels.find(u => u.id === selectedUrgency);
      const basePrice = 200;
      const finalPrice = basePrice * urgency.multiplier;
      setEstimatedPrice(finalPrice);
    }
  }, [selectedService, selectedUrgency]);

  const getServiceIcon = (iconName) => {
    const icons = {
      'Stethoscope': <Stethoscope className="w-6 h-6" />,
      'Home': <Home className="w-6 h-6" />,
      'Activity': <Activity className="w-6 h-6" />,
      'Brain': <Brain className="w-6 h-6" />,
      'Apple': <Apple className="w-6 h-6" />,
      'Heart': <Heart className="w-6 h-6" />
    };
    return icons[iconName] || <Stethoscope className="w-6 h-6" />;
  };

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setSelectedSpecialty('');
    setStep(2);
  };

  const handleRequestService = () => {
    const requestData = {
      serviceType: selectedService.id,
      specialty: selectedSpecialty,
      urgency: selectedUrgency,
      location: selectedLocation,
      description,
      preferredDate,
      preferredTime,
      userLocation
    };

    const request = serviceRequestSystem.createServiceRequest(requestData);
    alert('Solicitação de serviço criada com sucesso!');
    navigate('/');
  };

  return (
    <div className="content-container">
      {/* Sidebar Esquerda */}
      <aside className="sidebar-left">
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title">
              <Stethoscope className="w-5 h-5" />
              Solicitar Serviço
            </h3>
          </div>
          <div className="card-body">
            <div className="progress-steps">
              {[
                { num: 1, label: 'Serviço', icon: <Stethoscope className="w-4 h-4" /> },
                { num: 2, label: 'Detalhes', icon: <FileText className="w-4 h-4" /> },
                { num: 3, label: 'Confirmação', icon: <CheckCircle className="w-4 h-4" /> }
              ].map((stepItem, index) => (
                <div key={stepItem.num} className={`progress-step ${step >= stepItem.num ? 'active' : ''}`}>
                  <div className="step-icon">
                    {stepItem.icon}
                  </div>
                  <span className="step-label">{stepItem.label}</span>
                  {index < 2 && <ChevronRight className="w-4 h-4 text-gray-400" />}
                </div>
              ))}
            </div>

            {estimatedPrice > 0 && (
              <div className="price-estimate">
                <h4>Preço Estimado</h4>
                <div className="price-value">R$ {estimatedPrice.toFixed(2)}</div>
                <p className="price-note">*Valor pode variar conforme profissional</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="main-content">
        <div className="page-header">
          <h1 className="page-title">Solicitar Serviço de Saúde</h1>
          <p className="page-subtitle">Encontre e agende profissionais de saúde próximos a você</p>
        </div>

        <div className="card-professional">
          <div className="card-body">
            {step === 1 && (
              <ServiceSelectionStep
                services={serviceRequestSystem.serviceTypes}
                selectedService={selectedService}
                onServiceSelect={handleServiceSelect}
                getServiceIcon={getServiceIcon}
              />
            )}

            {step === 2 && selectedService && (
              <ServiceDetailsStep
                service={selectedService}
                selectedSpecialty={selectedSpecialty}
                onSpecialtyChange={setSelectedSpecialty}
                selectedUrgency={selectedUrgency}
                onUrgencyChange={setSelectedUrgency}
                selectedLocation={selectedLocation}
                onLocationChange={setSelectedLocation}
                description={description}
                onDescriptionChange={setDescription}
                preferredDate={preferredDate}
                onPreferredDateChange={setPreferredDate}
                preferredTime={preferredTime}
                onPreferredTimeChange={setPreferredTime}
                urgencyLevels={serviceRequestSystem.urgencyLevels}
                serviceLocations={serviceRequestSystem.serviceLocations}
                onNext={() => setStep(3)}
                onPrevious={() => setStep(1)}
              />
            )}

            {step === 3 && (
              <ConfirmationStep
                service={selectedService}
                specialty={selectedSpecialty}
                urgency={serviceRequestSystem.urgencyLevels.find(u => u.id === selectedUrgency)}
                location={serviceRequestSystem.serviceLocations.find(l => l.id === selectedLocation)}
                description={description}
                preferredDate={preferredDate}
                preferredTime={preferredTime}
                estimatedPrice={estimatedPrice}
                onConfirm={handleRequestService}
                onPrevious={() => setStep(2)}
                getServiceIcon={getServiceIcon}
              />
            )}
          </div>
        </div>
      </main>

      {/* Sidebar Direita */}
      <aside className="sidebar-right">
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title">
              <Shield className="w-5 h-5" />
              Garantia Fway
            </h3>
          </div>
          <div className="card-body">
            <div className="guarantee-items">
              <div className="guarantee-item">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>Profissionais verificados</span>
              </div>
              <div className="guarantee-item">
                <Shield className="w-5 h-5 text-blue-600" />
                <span>Atendimento garantido</span>
              </div>
              <div className="guarantee-item">
                <Star className="w-5 h-5 text-yellow-600" />
                <span>Avaliações reais</span>
              </div>
            </div>
          </div>
        </div>

        {nearbyProfessionals.length > 0 && (
          <div className="card-professional">
            <div className="card-header">
              <h3 className="card-title">
                <MapPin className="w-5 h-5" />
                Profissionais Próximos
              </h3>
            </div>
            <div className="card-body">
              <div className="professionals-preview">
                {nearbyProfessionals.slice(0, 3).map((prof) => (
                  <div key={prof.id} className="professional-preview">
                    <div className="professional-avatar">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="professional-info">
                      <h4>{prof.name}</h4>
                      <p>{prof.distance}km • {prof.estimatedArrival}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
};

// Componente Step 1: Seleção de Serviço
const ServiceSelectionStep = ({ services, selectedService, onServiceSelect, getServiceIcon }) => {
  return (
    <div className="step-content">
      <div className="step-header">
        <h2>Qual serviço de saúde você precisa?</h2>
        <p>Selecione o tipo de atendimento médico desejado</p>
      </div>

      <div className="services-grid">
        {services.map((service) => (
          <div
            key={service.id}
            onClick={() => onServiceSelect(service)}
            className={`service-card ${selectedService?.id === service.id ? 'selected' : ''}`}
          >
            <div className="service-icon">
              {getServiceIcon(service.icon)}
            </div>
            <div className="service-info">
              <h3>{service.name}</h3>
              <p className="service-time">{service.estimatedTime}</p>
              <p className="service-price">{service.priceRange}</p>
              <div className="service-specialties">
                {service.specialties.slice(0, 2).map((specialty, index) => (
                  <span key={index} className="specialty-tag">{specialty}</span>
                ))}
                {service.specialties.length > 2 && (
                  <span className="specialty-more">+{service.specialties.length - 2}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Componente Step 2: Detalhes do Serviço
const ServiceDetailsStep = ({ 
  service, 
  selectedSpecialty, 
  onSpecialtyChange,
  selectedUrgency,
  onUrgencyChange,
  selectedLocation,
  onLocationChange,
  description,
  onDescriptionChange,
  preferredDate,
  onPreferredDateChange,
  preferredTime,
  onPreferredTimeChange,
  urgencyLevels,
  serviceLocations,
  onNext,
  onPrevious
}) => {
  return (
    <div className="step-content">
      <div className="step-header">
        <h2>Detalhes do Atendimento</h2>
        <p>Configure os detalhes da sua consulta de {service.name}</p>
      </div>

      <div className="form-grid">
        <div className="form-section">
          <label className="form-label">Especialidade</label>
          <select
            value={selectedSpecialty}
            onChange={(e) => onSpecialtyChange(e.target.value)}
            className="form-select"
            required
          >
            <option value="">Selecione uma especialidade</option>
            {service.specialties.map((specialty) => (
              <option key={specialty} value={specialty}>
                {specialty}
              </option>
            ))}
          </select>
        </div>

        <div className="form-section">
          <label className="form-label">Urgência do Atendimento</label>
          <div className="urgency-options">
            {urgencyLevels.map((urgency) => (
              <div
                key={urgency.id}
                onClick={() => onUrgencyChange(urgency.id)}
                className={`urgency-option ${selectedUrgency === urgency.id ? 'selected' : ''}`}
              >
                <div className="urgency-header">
                  <h4>{urgency.name}</h4>
                  <span className="urgency-multiplier">
                    +{Math.round((urgency.multiplier - 1) * 100)}%
                  </span>
                </div>
                <p>{urgency.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="form-section">
          <label className="form-label">Local do Atendimento</label>
          <div className="location-options">
            {serviceLocations.map((location) => (
              <div
                key={location.id}
                onClick={() => onLocationChange(location.id)}
                className={`location-option ${selectedLocation === location.id ? 'selected' : ''}`}
              >
                <div className="location-icon">
                  {location.id === 'clinic' && <Building2 className="w-5 h-5" />}
                  {location.id === 'home' && <Home className="w-5 h-5" />}
                  {location.id === 'online' && <Video className="w-5 h-5" />}
                  {location.id === 'hospital' && <Building2 className="w-5 h-5" />}
                </div>
                <div className="location-info">
                  <h4>{location.name}</h4>
                  <p>{location.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="form-row">
          <div className="form-section">
            <label className="form-label">Data Preferida</label>
            <input
              type="date"
              value={preferredDate}
              onChange={(e) => onPreferredDateChange(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="form-input"
            />
          </div>
          
          <div className="form-section">
            <label className="form-label">Horário Preferido</label>
            <input
              type="time"
              value={preferredTime}
              onChange={(e) => onPreferredTimeChange(e.target.value)}
              className="form-input"
            />
          </div>
        </div>

        <div className="form-section">
          <label className="form-label">Descrição dos Sintomas/Necessidades</label>
          <textarea
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            rows={4}
            placeholder="Descreva seus sintomas, necessidades ou motivo da consulta..."
            className="form-textarea"
          />
        </div>
      </div>

      <div className="step-actions">
        <button onClick={onPrevious} className="btn-secondary">
          Voltar
        </button>
        <button 
          onClick={onNext} 
          disabled={!selectedSpecialty}
          className="btn-primary"
        >
          Continuar
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Componente Step 3: Confirmação
const ConfirmationStep = ({ 
  service, 
  specialty, 
  urgency, 
  location, 
  description, 
  preferredDate, 
  preferredTime, 
  estimatedPrice, 
  onConfirm, 
  onPrevious,
  getServiceIcon
}) => {
  return (
    <div className="step-content">
      <div className="step-header">
        <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
        <h2>Confirmar Solicitação</h2>
        <p>Revise os detalhes antes de finalizar sua solicitação</p>
      </div>

      <div className="confirmation-details">
        <div className="detail-section">
          <h3>Detalhes da Consulta</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <div className="detail-icon">
                {getServiceIcon(service.icon)}
              </div>
              <div className="detail-info">
                <h4>{service.name}</h4>
                <p>{specialty}</p>
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-icon">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
              <div className="detail-info">
                <h4>{urgency.name}</h4>
                <p>{urgency.description}</p>
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-icon">
                {location.id === 'clinic' && <Building2 className="w-6 h-6 text-blue-600" />}
                {location.id === 'home' && <Home className="w-6 h-6 text-green-600" />}
                {location.id === 'online' && <Video className="w-6 h-6 text-purple-600" />}
                {location.id === 'hospital' && <Building2 className="w-6 h-6 text-red-600" />}
              </div>
              <div className="detail-info">
                <h4>{location.name}</h4>
                <p>{location.description}</p>
              </div>
            </div>

            {preferredDate && (
              <div className="detail-item">
                <div className="detail-icon">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div className="detail-info">
                  <h4>Data e Horário</h4>
                  <p>{new Date(preferredDate).toLocaleDateString()} às {preferredTime}</p>
                </div>
              </div>
            )}

            <div className="detail-item">
              <div className="detail-icon">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="detail-info">
                <h4>Preço Estimado</h4>
                <p>R$ {estimatedPrice.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {description && (
          <div className="detail-section">
            <h3>Descrição</h3>
            <div className="description-box">
              {description}
            </div>
          </div>
        )}
      </div>

      <div className="step-actions">
        <button onClick={onPrevious} className="btn-secondary">
          Voltar
        </button>
        <button onClick={onConfirm} className="btn-primary btn-success">
          <CheckCircle className="w-4 h-4" />
          Confirmar Solicitação
        </button>
      </div>
    </div>
  );
};

export default ServiceRequest;

