import React, { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { 
  MapPin, 
  Navigation, 
  Clock, 
  Star, 
  Phone, 
  MessageCircle,
  User,
  Heart,
  Baby,
  Bone,
  Droplets,
  Activity,
  Brain,
  Wind,
  Zap,
  Loader2,
  Target,
  Filter
} from 'lucide-react'
import 'leaflet/dist/leaflet.css'

// Corrigir ícones do Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Componente para centralizar o mapa na localização do usuário
const MapController = ({ userLocation, professionals }) => {
  const map = useMap()
  
  useEffect(() => {
    if (userLocation) {
      map.setView([userLocation.lat, userLocation.lng], 13)
    }
  }, [userLocation, map])
  
  return null
}

// Função para calcular distância entre dois pontos
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371 // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  const distance = R * c
  return distance
}

// Função para estimar tempo de viagem
const estimateTime = (distance) => {
  // Velocidade média urbana: 25 km/h
  const avgSpeed = 25
  const timeInHours = distance / avgSpeed
  const timeInMinutes = Math.round(timeInHours * 60)
  return timeInMinutes
}

// Ícones para especialidades
const getSpecialtyIcon = (specialty) => {
  const icons = {
    'Cardiologia': <Heart size={16} className="text-red-500" />,
    'Pediatria': <Baby size={16} className="text-blue-500" />,
    'Ortopedia': <Bone size={16} className="text-gray-600" />,
    'Dermatologia': <Droplets size={16} className="text-green-500" />,
    'Obstetrícia': <User size={16} className="text-pink-600" />,
    'Home Care': <MapPin size={16} className="text-green-600" />,
    'Fisioterapia': <Activity size={16} className="text-green-500" />,
    'Neurologia': <Brain size={16} className="text-purple-600" />,
    'Respiratória': <Wind size={16} className="text-blue-400" />,
    'Esportiva': <Zap size={16} className="text-orange-500" />
  }
  return icons[specialty] || <User size={16} className="text-gray-500" />
}

const ProfessionalMap = ({ professionals = [], onProfessionalSelect }) => {
  const [userLocation, setUserLocation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedDistance, setSelectedDistance] = useState(10) // km
  const [filteredProfessionals, setFilteredProfessionals] = useState([])
  const mapRef = useRef()

  // Obter localização do usuário
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          setUserLocation(location)
          setLoading(false)
        },
        (error) => {
          console.error('Erro ao obter localização:', error)
          // Localização padrão (São Paulo)
          setUserLocation({ lat: -23.5505, lng: -46.6333 })
          setError('Não foi possível obter sua localização. Usando localização padrão.')
          setLoading(false)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      )
    } else {
      setUserLocation({ lat: -23.5505, lng: -46.6333 })
      setError('Geolocalização não suportada pelo navegador.')
      setLoading(false)
    }
  }, [])

  // Filtrar profissionais por distância
  useEffect(() => {
    if (userLocation && professionals.length > 0) {
      const filtered = professionals.map(professional => {
        // Coordenadas simuladas para profissionais (próximas ao usuário)
        const profLat = userLocation.lat + (Math.random() - 0.5) * 0.1
        const profLng = userLocation.lng + (Math.random() - 0.5) * 0.1
        
        const distance = calculateDistance(
          userLocation.lat, 
          userLocation.lng, 
          profLat, 
          profLng
        )
        
        return {
          ...professional,
          lat: profLat,
          lng: profLng,
          distance: distance,
          estimatedTime: estimateTime(distance)
        }
      }).filter(prof => prof.distance <= selectedDistance)
      .sort((a, b) => a.distance - b.distance)
      
      setFilteredProfessionals(filtered)
    }
  }, [userLocation, professionals, selectedDistance])

  // Ícone personalizado para usuário
  const userIcon = new L.DivIcon({
    html: `<div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>`,
    className: 'custom-user-marker',
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  })

  // Ícone personalizado para profissionais
  const professionalIcon = new L.DivIcon({
    html: `<div class="w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
             <svg width="12" height="12" fill="white" viewBox="0 0 24 24">
               <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 7V9C15 10.1 15.9 11 17 11V20C17 21.1 16.1 22 15 22H9C7.9 22 7 21.1 7 20V11C8.1 11 9 10.1 9 9V7H3V9C3 10.1 3.9 11 5 11V20C5 21.1 5.9 22 7 22H17C18.1 22 19 21.1 19 20V11C20.1 11 21 10.1 21 9Z"/>
             </svg>
           </div>`,
    className: 'custom-professional-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
          <p className="text-gray-600">Obtendo sua localização...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Controles do Mapa */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-gray-900">Profissionais Próximos</h3>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select 
              value={selectedDistance}
              onChange={(e) => setSelectedDistance(Number(e.target.value))}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={1}>1 km</option>
              <option value={3}>3 km</option>
              <option value={5}>5 km</option>
              <option value={10}>10 km</option>
              <option value={20}>20 km</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-yellow-800 text-sm">{error}</p>
          </div>
        )}

        <div className="text-sm text-gray-600 mb-2">
          {filteredProfessionals.length} profissionais encontrados em um raio de {selectedDistance}km
        </div>
      </div>

      {/* Mapa */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div style={{ height: '400px', width: '100%' }}>
          {userLocation && (
            <MapContainer
              center={[userLocation.lat, userLocation.lng]}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
              ref={mapRef}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              <MapController userLocation={userLocation} professionals={filteredProfessionals} />
              
              {/* Marcador do usuário */}
              <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
                <Popup>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Navigation className="w-4 h-4 text-blue-500 mr-1" />
                      <span className="font-semibold">Sua Localização</span>
                    </div>
                  </div>
                </Popup>
              </Marker>

              {/* Marcadores dos profissionais */}
              {filteredProfessionals.map((professional) => (
                <Marker
                  key={professional.id}
                  position={[professional.lat, professional.lng]}
                  icon={professionalIcon}
                >
                  <Popup>
                    <div className="w-64 p-2">
                      <div className="flex items-start space-x-3">
                        <img 
                          src={professional.image} 
                          alt={professional.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{professional.name}</h4>
                          <div className="flex items-center space-x-1 mb-1">
                            {getSpecialtyIcon(professional.specialty)}
                            <span className="text-sm text-gray-600">{professional.specialty}</span>
                          </div>
                          <div className="flex items-center space-x-1 mb-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600">{professional.rating}</span>
                          </div>
                          <div className="flex items-center space-x-1 mb-2">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {professional.distance.toFixed(1)}km
                            </span>
                            <Clock className="w-3 h-3 text-gray-400 ml-2" />
                            <span className="text-sm text-gray-600">
                              ~{professional.estimatedTime}min
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => onProfessionalSelect && onProfessionalSelect(professional)}
                              className="flex-1 bg-blue-500 text-white text-xs px-2 py-1 rounded hover:bg-blue-600 transition-colors"
                            >
                              Ver Perfil
                            </button>
                            <button className="bg-green-500 text-white text-xs px-2 py-1 rounded hover:bg-green-600 transition-colors">
                              <MessageCircle className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}
        </div>
      </div>

      {/* Lista de Profissionais Próximos */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-gray-900">Lista de Profissionais</h3>
        </div>
        <div className="divide-y">
          {filteredProfessionals.slice(0, 5).map((professional) => (
            <div key={professional.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img 
                    src={professional.image} 
                    alt={professional.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-medium text-gray-900">{professional.name}</h4>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      {getSpecialtyIcon(professional.specialty)}
                      <span>{professional.specialty}</span>
                      <span>•</span>
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span>{professional.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1 text-sm text-gray-600 mb-1">
                    <MapPin className="w-3 h-3" />
                    <span>{professional.distance.toFixed(1)}km</span>
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <Clock className="w-3 h-3" />
                    <span>~{professional.estimatedTime}min</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ProfessionalMap

