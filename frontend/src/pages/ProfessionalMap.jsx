import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Navigation, 
  Filter, 
  Star, 
  Clock, 
  DollarSign,
  User,
  Phone,
  MessageCircle,
  Route,
  Zap,
  Target,
  Search,
  List,
  Map,
  Users,
  Stethoscope,
  Heart,
  Activity
} from 'lucide-react';
import { geolocationSystem } from '../utils/uberFeatures';

const ProfessionalMap = () => {
  const navigate = useNavigate();
  const [userLocation, setUserLocation] = useState(null);
  const [professionals, setProfessionals] = useState([]);
  const [filteredProfessionals, setFilteredProfessionals] = useState([]);
  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [filters, setFilters] = useState({
    specialty: 'all',
    maxDistance: 50,
    minRating: 0,
    maxPrice: 1000,
    availability: 'all'
  });
  const [viewMode, setViewMode] = useState('list');
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Obter localização do usuário
  useEffect(() => {
    geolocationSystem.getCurrentLocation()
      .then(location => {
        setUserLocation(location);
        setIsLoadingLocation(false);
      })
      .catch(error => {
        console.log('Erro ao obter localização:', error);
        const defaultLocation = { lat: -23.5505, lng: -46.6333 };
        setUserLocation(defaultLocation);
        setIsLoadingLocation(false);
      });
  }, []);

  // Carregar profissionais e calcular distâncias
  useEffect(() => {
    if (userLocation && mockData.professionals) {
      const professionalsWithDistance = mockData.professionals.map(professional => ({
        ...professional,
        distance: geolocationSystem.calculateDistance(
          userLocation,
          professional.location
        ),
        estimatedArrival: geolocationSystem.estimateArrivalTime(
          geolocationSystem.calculateDistance(
            userLocation,
            professional.location
          )
        )
      }));

      setProfessionals(professionalsWithDistance);
      setFilteredProfessionals(professionalsWithDistance);
    }
  }, [userLocation]);

  // Aplicar filtros
  useEffect(() => {
    let filtered = professionals;

    if (filters.specialty !== 'all') {
      filtered = filtered.filter(prof => 
        prof.specialty?.toLowerCase().includes(filters.specialty.toLowerCase())
      );
    }

    if (filters.maxDistance) {
      filtered = filtered.filter(prof => prof.distance <= filters.maxDistance);
    }

    if (filters.minRating) {
      filtered = filtered.filter(prof => prof.rating >= filters.minRating);
    }

    if (filters.maxPrice) {
      filtered = filtered.filter(prof => prof.hourlyRate <= filters.maxPrice);
    }

    if (searchQuery) {
      filtered = filtered.filter(prof => 
        prof.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prof.specialty?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProfessionals(filtered);
  }, [professionals, filters, searchQuery]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleProfessionalSelect = (professional) => {
    setSelectedProfessional(professional);
    navigate(`/professional/${professional.id}`);
  };

  const specialties = [
    { id: 'all', name: 'Todas as Especialidades', icon: <Users className="w-4 h-4" /> },
    { id: 'cardiologia', name: 'Cardiologia', icon: <Heart className="w-4 h-4" /> },
    { id: 'dermatologia', name: 'Dermatologia', icon: <User className="w-4 h-4" /> },
    { id: 'fisioterapia', name: 'Fisioterapia', icon: <Activity className="w-4 h-4" /> },
    { id: 'pediatria', name: 'Pediatria', icon: <Stethoscope className="w-4 h-4" /> }
  ];

  return (
    <div className="content-container">
      {/* Sidebar Esquerda - Filtros */}
      <aside className="sidebar-left">
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title">
              <Filter className="w-5 h-5" />
              Filtros de Busca
            </h3>
          </div>
          <div className="card-body">
            {/* Busca */}
            <div className="filter-section">
              <label className="filter-label">Buscar Profissional</label>
              <div className="search-container">
                <Search className="search-icon w-4 h-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Nome ou especialidade..."
                  className="search-input"
                />
              </div>
            </div>

            {/* Especialidade */}
            <div className="filter-section">
              <label className="filter-label">Especialidade</label>
              <div className="specialty-filters">
                {specialties.map((specialty) => (
                  <button
                    key={specialty.id}
                    onClick={() => handleFilterChange('specialty', specialty.id)}
                    className={`specialty-filter ${filters.specialty === specialty.id ? 'active' : ''}`}
                  >
                    {specialty.icon}
                    <span>{specialty.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Distância */}
            <div className="filter-section">
              <label className="filter-label">
                Distância Máxima: {filters.maxDistance}km
              </label>
              <input
                type="range"
                min="1"
                max="100"
                value={filters.maxDistance}
                onChange={(e) => handleFilterChange('maxDistance', parseInt(e.target.value))}
                className="filter-range"
              />
            </div>

            {/* Avaliação */}
            <div className="filter-section">
              <label className="filter-label">Avaliação Mínima</label>
              <div className="rating-filters">
                {[0, 3, 4, 4.5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => handleFilterChange('minRating', rating)}
                    className={`rating-filter ${filters.minRating === rating ? 'active' : ''}`}
                  >
                    <Star className="w-4 h-4" />
                    {rating === 0 ? 'Todas' : `${rating}+`}
                  </button>
                ))}
              </div>
            </div>

            {/* Preço */}
            <div className="filter-section">
              <label className="filter-label">
                Preço Máximo: R$ {filters.maxPrice}
              </label>
              <input
                type="range"
                min="50"
                max="500"
                step="50"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', parseInt(e.target.value))}
                className="filter-range"
              />
            </div>
          </div>
        </div>

        {/* Localização */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title">
              <MapPin className="w-5 h-5" />
              Sua Localização
            </h3>
          </div>
          <div className="card-body">
            {isLoadingLocation ? (
              <div className="location-loading">
                <div className="loading-spinner"></div>
                <p>Obtendo localização...</p>
              </div>
            ) : (
              <div className="location-info">
                <div className="location-status">
                  <Navigation className="w-4 h-4 text-green-600" />
                  <span>Localização ativa</span>
                </div>
                <p className="location-address">
                  {userLocation?.fallback ? 'São Paulo, SP (padrão)' : 'Localização atual'}
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="main-content">
        <div className="page-header">
          <h1 className="page-title">Profissionais Próximos</h1>
          <p className="page-subtitle">
            {filteredProfessionals.length} profissionais encontrados
          </p>
        </div>

        {/* Controles de Visualização */}
        <div className="view-controls">
          <div className="view-modes">
            <button
              onClick={() => setViewMode('list')}
              className={`view-mode ${viewMode === 'list' ? 'active' : ''}`}
            >
              <List className="w-4 h-4" />
              Lista
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`view-mode ${viewMode === 'map' ? 'active' : ''}`}
            >
              <Map className="w-4 h-4" />
              Mapa
            </button>
          </div>

          <div className="results-count">
            {filteredProfessionals.length} resultados
          </div>
        </div>

        {/* Lista de Profissionais */}
        <div className="professionals-container">
          {viewMode === 'list' ? (
            <div className="professionals-list">
              {filteredProfessionals.length === 0 ? (
                <div className="empty-state">
                  <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3>Nenhum profissional encontrado</h3>
                  <p>Tente ajustar os filtros de busca</p>
                </div>
              ) : (
                filteredProfessionals.map((professional) => (
                  <ProfessionalCard
                    key={professional.id}
                    professional={professional}
                    onSelect={handleProfessionalSelect}
                  />
                ))
              )}
            </div>
          ) : (
            <div className="map-container">
              <div className="map-placeholder">
                <Map className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3>Visualização do Mapa</h3>
                <p>Mapa interativo com localização dos profissionais</p>
                <p className="text-sm text-gray-500 mt-2">
                  {filteredProfessionals.length} profissionais no mapa
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Sidebar Direita - Profissional Selecionado */}
      <aside className="sidebar-right">
        {selectedProfessional ? (
          <div className="card-professional">
            <div className="card-header">
              <h3 className="card-title">Profissional Selecionado</h3>
            </div>
            <div className="card-body">
              <ProfessionalDetails professional={selectedProfessional} />
            </div>
          </div>
        ) : (
          <div className="card-professional">
            <div className="card-header">
              <h3 className="card-title">
                <Zap className="w-5 h-5" />
                Dicas de Busca
              </h3>
            </div>
            <div className="card-body">
              <div className="tips-list">
                <div className="tip-item">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span>Use filtros para refinar sua busca</span>
                </div>
                <div className="tip-item">
                  <Star className="w-4 h-4 text-yellow-600" />
                  <span>Verifique as avaliações dos profissionais</span>
                </div>
                <div className="tip-item">
                  <Clock className="w-4 h-4 text-green-600" />
                  <span>Considere o tempo de chegada</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
};

// Componente Card do Profissional
const ProfessionalCard = ({ professional, onSelect }) => {
  return (
    <div className="professional-card" onClick={() => onSelect(professional)}>
      <div className="professional-header">
        <div className="professional-avatar">
          <User className="w-6 h-6" />
        </div>
        <div className="professional-basic-info">
          <h3 className="professional-name">{professional.name}</h3>
          <p className="professional-specialty">{professional.specialty}</p>
          <div className="professional-rating">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span>{professional.rating}</span>
            <span className="rating-count">({professional.reviewCount} avaliações)</span>
          </div>
        </div>
        <div className="professional-price">
          <span className="price-value">R$ {professional.hourlyRate}</span>
          <span className="price-unit">/hora</span>
        </div>
      </div>

      <div className="professional-details">
        <div className="detail-item">
          <MapPin className="w-4 h-4 text-gray-500" />
          <span>{professional.distance?.toFixed(1)}km de distância</span>
        </div>
        <div className="detail-item">
          <Clock className="w-4 h-4 text-gray-500" />
          <span>{professional.estimatedArrival} para chegada</span>
        </div>
        <div className="detail-item">
          <MessageCircle className="w-4 h-4 text-gray-500" />
          <span>Responde em {professional.responseTime}</span>
        </div>
      </div>

      <div className="professional-skills">
        {professional.skills?.slice(0, 3).map((skill, index) => (
          <span key={index} className="skill-tag">{skill}</span>
        ))}
        {professional.skills?.length > 3 && (
          <span className="skill-more">+{professional.skills.length - 3}</span>
        )}
      </div>

      <div className="professional-actions">
        <button className="btn-secondary btn-small">
          <MessageCircle className="w-4 h-4" />
          Conversar
        </button>
        <button className="btn-primary btn-small">
          <Phone className="w-4 h-4" />
          Contratar
        </button>
      </div>
    </div>
  );
};

// Componente Detalhes do Profissional
const ProfessionalDetails = ({ professional }) => {
  return (
    <div className="professional-details-full">
      <div className="professional-avatar-large">
        <User className="w-8 h-8" />
      </div>
      
      <h3 className="professional-name">{professional.name}</h3>
      <p className="professional-specialty">{professional.specialty}</p>
      
      <div className="professional-stats">
        <div className="stat-item">
          <Star className="w-4 h-4 text-yellow-500" />
          <span>{professional.rating}</span>
        </div>
        <div className="stat-item">
          <MapPin className="w-4 h-4 text-blue-500" />
          <span>{professional.distance?.toFixed(1)}km</span>
        </div>
        <div className="stat-item">
          <DollarSign className="w-4 h-4 text-green-500" />
          <span>R$ {professional.hourlyRate}/h</span>
        </div>
      </div>

      <div className="professional-actions-full">
        <button className="btn-primary btn-full">
          <MessageCircle className="w-4 h-4" />
          Iniciar Conversa
        </button>
        <button className="btn-secondary btn-full">
          <Phone className="w-4 h-4" />
          Ver Perfil Completo
        </button>
      </div>
    </div>
  );
};

export default ProfessionalMap;

