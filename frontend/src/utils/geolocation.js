// Utilitários para geolocalização e cálculos de distância

/**
 * Calcula a distância entre dois pontos geográficos usando a fórmula de Haversine
 * @param {number} lat1 - Latitude do primeiro ponto
 * @param {number} lon1 - Longitude do primeiro ponto
 * @param {number} lat2 - Latitude do segundo ponto
 * @param {number} lon2 - Longitude do segundo ponto
 * @returns {number} Distância em quilômetros
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
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

/**
 * Estima o tempo de viagem baseado na distância
 * @param {number} distance - Distância em quilômetros
 * @param {string} mode - Modo de transporte ('walking', 'driving', 'transit')
 * @returns {number} Tempo estimado em minutos
 */
export const estimateTime = (distance, mode = 'driving') => {
  const speeds = {
    walking: 5,    // 5 km/h
    driving: 25,   // 25 km/h (velocidade urbana média)
    transit: 20    // 20 km/h (transporte público)
  }
  
  const speed = speeds[mode] || speeds.driving
  const timeInHours = distance / speed
  const timeInMinutes = Math.round(timeInHours * 60)
  return Math.max(timeInMinutes, 1) // Mínimo de 1 minuto
}

/**
 * Gera coordenadas aleatórias próximas a um ponto central
 * @param {number} centerLat - Latitude central
 * @param {number} centerLng - Longitude central
 * @param {number} radiusKm - Raio em quilômetros
 * @returns {object} Objeto com lat e lng
 */
export const generateNearbyCoordinates = (centerLat, centerLng, radiusKm = 10) => {
  // Conversão aproximada: 1 grau ≈ 111 km
  const radiusDegrees = radiusKm / 111
  
  const randomLat = centerLat + (Math.random() - 0.5) * 2 * radiusDegrees
  const randomLng = centerLng + (Math.random() - 0.5) * 2 * radiusDegrees
  
  return {
    lat: randomLat,
    lng: randomLng
  }
}

/**
 * Filtra profissionais por distância e outros critérios
 * @param {Array} professionals - Lista de profissionais
 * @param {object} userLocation - Localização do usuário {lat, lng}
 * @param {object} filters - Filtros a aplicar
 * @returns {Array} Lista filtrada e ordenada
 */
export const filterProfessionals = (professionals, userLocation, filters = {}) => {
  const {
    maxDistance = 10,
    specialty = null,
    minRating = 0,
    availability = null,
    sortBy = 'distance' // 'distance', 'rating', 'price'
  } = filters

  if (!userLocation || !professionals.length) return []

  // Adicionar coordenadas e calcular distância para cada profissional
  const professionalsWithDistance = professionals.map(professional => {
    // Se o profissional não tem coordenadas, gerar próximas ao usuário
    let profCoords = professional.coordinates
    if (!profCoords) {
      profCoords = generateNearbyCoordinates(
        userLocation.lat, 
        userLocation.lng, 
        maxDistance
      )
    }

    const distance = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      profCoords.lat,
      profCoords.lng
    )

    return {
      ...professional,
      coordinates: profCoords,
      distance: distance,
      estimatedTime: estimateTime(distance),
      estimatedWalkingTime: estimateTime(distance, 'walking'),
      estimatedTransitTime: estimateTime(distance, 'transit')
    }
  })

  // Aplicar filtros
  let filtered = professionalsWithDistance.filter(prof => {
    // Filtro de distância
    if (prof.distance > maxDistance) return false
    
    // Filtro de especialidade
    if (specialty && prof.specialty !== specialty) return false
    
    // Filtro de avaliação
    if (prof.rating < minRating) return false
    
    // Filtro de disponibilidade (se implementado)
    if (availability && !prof.available) return false
    
    return true
  })

  // Ordenar resultados
  filtered.sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating
      case 'price':
        return (a.price || 0) - (b.price || 0)
      case 'distance':
      default:
        return a.distance - b.distance
    }
  })

  return filtered
}

/**
 * Obtém a localização atual do usuário
 * @param {object} options - Opções para geolocalização
 * @returns {Promise} Promise que resolve com a localização
 */
export const getCurrentLocation = (options = {}) => {
  const defaultOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 60000,
    ...options
  }

  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocalização não suportada pelo navegador'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        })
      },
      (error) => {
        let errorMessage = 'Erro ao obter localização'
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permissão de localização negada'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Localização indisponível'
            break
          case error.TIMEOUT:
            errorMessage = 'Timeout ao obter localização'
            break
        }
        
        reject(new Error(errorMessage))
      },
      defaultOptions
    )
  })
}

/**
 * Formata a distância para exibição
 * @param {number} distance - Distância em quilômetros
 * @returns {string} Distância formatada
 */
export const formatDistance = (distance) => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`
  }
  return `${distance.toFixed(1)}km`
}

/**
 * Formata o tempo para exibição
 * @param {number} minutes - Tempo em minutos
 * @returns {string} Tempo formatado
 */
export const formatTime = (minutes) => {
  if (minutes < 60) {
    return `${minutes}min`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return `${hours}h${remainingMinutes > 0 ? ` ${remainingMinutes}min` : ''}`
}

/**
 * Gera dados mock de profissionais com coordenadas
 * @param {object} userLocation - Localização do usuário
 * @param {number} count - Número de profissionais a gerar
 * @returns {Array} Lista de profissionais com coordenadas
 */
export const generateMockProfessionals = (userLocation, count = 20) => {
  const specialties = [
    'Cardiologia', 'Pediatria', 'Ortopedia', 'Dermatologia', 
    'Neurologia', 'Fisioterapia', 'Home Care', 'Obstetrícia'
  ]
  
  const names = [
    'Dr. João Silva', 'Dra. Maria Santos', 'Dr. Pedro Oliveira',
    'Dra. Ana Costa', 'Dr. Carlos Ferreira', 'Dra. Lucia Almeida',
    'Dr. Rafael Mendes', 'Dra. Beatriz Lima', 'Dr. Fernando Rocha',
    'Dra. Camila Souza', 'Dr. Ricardo Barbosa', 'Dra. Juliana Martins'
  ]

  return Array.from({ length: count }, (_, index) => {
    const coords = generateNearbyCoordinates(userLocation.lat, userLocation.lng, 15)
    
    return {
      id: index + 1,
      name: names[index % names.length],
      specialty: specialties[index % specialties.length],
      rating: (3.5 + Math.random() * 1.5).toFixed(1),
      price: Math.round(80 + Math.random() * 120),
      image: `https://images.unsplash.com/photo-${1559839734963 + index}?w=150&h=150&fit=crop&crop=face`,
      available: Math.random() > 0.3,
      coordinates: coords,
      reviews: Math.floor(50 + Math.random() * 200),
      experience: Math.floor(2 + Math.random() * 20)
    }
  })
}

// Constantes úteis
export const DISTANCE_FILTERS = [
  { value: 1, label: '1 km' },
  { value: 3, label: '3 km' },
  { value: 5, label: '5 km' },
  { value: 10, label: '10 km' },
  { value: 20, label: '20 km' },
  { value: 50, label: '50 km' }
]

export const SORT_OPTIONS = [
  { value: 'distance', label: 'Mais próximo' },
  { value: 'rating', label: 'Melhor avaliado' },
  { value: 'price', label: 'Menor preço' }
]

// Localização padrão (São Paulo) caso não seja possível obter a localização do usuário
export const DEFAULT_LOCATION = {
  lat: -23.5505,
  lng: -46.6333
}

