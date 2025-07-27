// Google Maps integration service for location-based features
class GoogleMapsService {
  constructor() {
    this.map = null
    this.markers = []
    this.infoWindows = []
    this.directionsService = null
    this.directionsRenderer = null
    this.placesService = null
    this.geocoder = null
    this.isLoaded = false
    this.loadPromise = null
  }

  // Initialize Google Maps API
  async initialize(apiKey) {
    if (this.isLoaded) {
      return Promise.resolve()
    }

    if (this.loadPromise) {
      return this.loadPromise
    }

    this.loadPromise = new Promise((resolve, reject) => {
      // Check if Google Maps is already loaded
      if (window.google && window.google.maps) {
        this.isLoaded = true
        this.initializeServices()
        resolve()
        return
      }

      // Create script element
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&callback=initGoogleMaps`
      script.async = true
      script.defer = true

      // Global callback function
      window.initGoogleMaps = () => {
        this.isLoaded = true
        this.initializeServices()
        resolve()
      }

      script.onerror = () => {
        reject(new Error('Failed to load Google Maps API'))
      }

      document.head.appendChild(script)
    })

    return this.loadPromise
  }

  // Initialize Google Maps services
  initializeServices() {
    if (window.google && window.google.maps) {
      this.directionsService = new window.google.maps.DirectionsService()
      this.directionsRenderer = new window.google.maps.DirectionsRenderer()
      this.geocoder = new window.google.maps.Geocoder()
    }
  }

  // Create a new map instance
  createMap(container, options = {}) {
    if (!this.isLoaded) {
      throw new Error('Google Maps API not loaded')
    }

    const defaultOptions = {
      zoom: 13,
      center: { lat: -23.5505, lng: -46.6333 }, // São Paulo default
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    }

    const mapOptions = { ...defaultOptions, ...options }
    this.map = new window.google.maps.Map(container, mapOptions)

    // Initialize places service for this map
    this.placesService = new window.google.maps.places.PlacesService(this.map)

    return this.map
  }

  // Add a marker to the map
  addMarker(position, options = {}) {
    if (!this.map) {
      throw new Error('Map not initialized')
    }

    const defaultOptions = {
      position,
      map: this.map,
      animation: window.google.maps.Animation.DROP
    }

    const markerOptions = { ...defaultOptions, ...options }
    const marker = new window.google.maps.Marker(markerOptions)

    this.markers.push(marker)

    // Add click listener if info window content is provided
    if (options.infoWindow) {
      const infoWindow = new window.google.maps.InfoWindow({
        content: options.infoWindow
      })

      marker.addListener('click', () => {
        // Close all other info windows
        this.infoWindows.forEach(iw => iw.close())
        infoWindow.open(this.map, marker)
      })

      this.infoWindows.push(infoWindow)
    }

    return marker
  }

  // Add multiple markers for professionals/services
  addProfessionalMarkers(professionals) {
    const bounds = new window.google.maps.LatLngBounds()

    professionals.forEach(professional => {
      if (professional.location && professional.location.coordinates) {
        const position = {
          lat: professional.location.coordinates.lat,
          lng: professional.location.coordinates.lng
        }

        const infoWindowContent = `
          <div class="p-3 max-w-xs">
            <div class="flex items-center space-x-3 mb-2">
              <img src="${professional.avatar}" alt="${professional.name}" 
                   class="w-12 h-12 rounded-full object-cover">
              <div>
                <h3 class="font-semibold text-gray-900">${professional.name}</h3>
                <p class="text-sm text-blue-600">${professional.specialty}</p>
              </div>
            </div>
            <div class="flex items-center space-x-2 text-sm text-gray-600 mb-2">
              <span>⭐ ${professional.rating}</span>
              <span>(${professional.reviews} avaliações)</span>
            </div>
            <p class="text-xs text-gray-500 mb-3">${professional.location.address}</p>
            <button class="w-full bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">
              Ver Perfil
            </button>
          </div>
        `

        const marker = this.addMarker(position, {
          title: professional.name,
          icon: {
            url: professional.avatar,
            scaledSize: new window.google.maps.Size(40, 40),
            origin: new window.google.maps.Point(0, 0),
            anchor: new window.google.maps.Point(20, 20)
          },
          infoWindow: infoWindowContent
        })

        // Store professional data in marker
        marker.professionalData = professional
        bounds.extend(position)
      }
    })

    // Fit map to show all markers
    if (professionals.length > 0) {
      this.map.fitBounds(bounds)
    }

    return this.markers
  }

  // Clear all markers
  clearMarkers() {
    this.markers.forEach(marker => marker.setMap(null))
    this.markers = []
    this.infoWindows.forEach(iw => iw.close())
    this.infoWindows = []
  }

  // Get directions between two points
  async getDirections(origin, destination, travelMode = 'DRIVING') {
    if (!this.directionsService) {
      throw new Error('Directions service not initialized')
    }

    return new Promise((resolve, reject) => {
      this.directionsService.route({
        origin,
        destination,
        travelMode: window.google.maps.TravelMode[travelMode],
        unitSystem: window.google.maps.UnitSystem.METRIC,
        avoidHighways: false,
        avoidTolls: false
      }, (result, status) => {
        if (status === 'OK') {
          resolve(result)
        } else {
          reject(new Error(`Directions request failed: ${status}`))
        }
      })
    })
  }

  // Display directions on map
  displayDirections(directionsResult) {
    if (!this.directionsRenderer) {
      throw new Error('Directions renderer not initialized')
    }

    this.directionsRenderer.setMap(this.map)
    this.directionsRenderer.setDirections(directionsResult)
  }

  // Calculate distance between two points
  calculateDistance(point1, point2) {
    if (!window.google || !window.google.maps) {
      throw new Error('Google Maps API not loaded')
    }

    const distance = window.google.maps.geometry.spherical.computeDistanceBetween(
      new window.google.maps.LatLng(point1.lat, point1.lng),
      new window.google.maps.LatLng(point2.lat, point2.lng)
    )

    return {
      meters: Math.round(distance),
      kilometers: Math.round(distance / 1000 * 100) / 100,
      formatted: distance < 1000 ? 
        `${Math.round(distance)}m` : 
        `${Math.round(distance / 1000 * 10) / 10}km`
    }
  }

  // Geocode address to coordinates
  async geocodeAddress(address) {
    if (!this.geocoder) {
      throw new Error('Geocoder not initialized')
    }

    return new Promise((resolve, reject) => {
      this.geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const location = results[0].geometry.location
          resolve({
            lat: location.lat(),
            lng: location.lng(),
            formatted_address: results[0].formatted_address,
            place_id: results[0].place_id
          })
        } else {
          reject(new Error(`Geocoding failed: ${status}`))
        }
      })
    })
  }

  // Reverse geocode coordinates to address
  async reverseGeocode(lat, lng) {
    if (!this.geocoder) {
      throw new Error('Geocoder not initialized')
    }

    return new Promise((resolve, reject) => {
      this.geocoder.geocode({ 
        location: { lat, lng } 
      }, (results, status) => {
        if (status === 'OK' && results[0]) {
          resolve({
            formatted_address: results[0].formatted_address,
            address_components: results[0].address_components,
            place_id: results[0].place_id
          })
        } else {
          reject(new Error(`Reverse geocoding failed: ${status}`))
        }
      })
    })
  }

  // Search for places nearby
  async searchNearbyPlaces(location, radius = 5000, type = 'hospital') {
    if (!this.placesService) {
      throw new Error('Places service not initialized')
    }

    return new Promise((resolve, reject) => {
      const request = {
        location: new window.google.maps.LatLng(location.lat, location.lng),
        radius,
        type
      }

      this.placesService.nearbySearch(request, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          const places = results.map(place => ({
            place_id: place.place_id,
            name: place.name,
            rating: place.rating,
            vicinity: place.vicinity,
            types: place.types,
            geometry: {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng()
            },
            photos: place.photos ? place.photos.map(photo => ({
              url: photo.getUrl({ maxWidth: 400, maxHeight: 300 })
            })) : []
          }))
          resolve(places)
        } else {
          reject(new Error(`Places search failed: ${status}`))
        }
      })
    })
  }

  // Get place details
  async getPlaceDetails(placeId) {
    if (!this.placesService) {
      throw new Error('Places service not initialized')
    }

    return new Promise((resolve, reject) => {
      this.placesService.getDetails({
        placeId,
        fields: [
          'name', 'rating', 'formatted_phone_number', 'formatted_address',
          'website', 'opening_hours', 'reviews', 'photos', 'geometry'
        ]
      }, (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          resolve({
            place_id: placeId,
            name: place.name,
            rating: place.rating,
            phone: place.formatted_phone_number,
            address: place.formatted_address,
            website: place.website,
            opening_hours: place.opening_hours,
            reviews: place.reviews,
            photos: place.photos ? place.photos.map(photo => ({
              url: photo.getUrl({ maxWidth: 400, maxHeight: 300 })
            })) : [],
            geometry: {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng()
            }
          })
        } else {
          reject(new Error(`Place details failed: ${status}`))
        }
      })
    })
  }

  // Find professionals within radius
  findProfessionalsNearby(userLocation, professionals, radiusKm = 10) {
    return professionals.filter(professional => {
      if (!professional.location || !professional.location.coordinates) {
        return false
      }

      const distance = this.calculateDistance(
        userLocation,
        professional.location.coordinates
      )

      return distance.kilometers <= radiusKm
    }).map(professional => ({
      ...professional,
      distance: this.calculateDistance(
        userLocation,
        professional.location.coordinates
      )
    })).sort((a, b) => a.distance.kilometers - b.distance.kilometers)
  }

  // Create custom marker icon
  createCustomMarker(color = '#3B82F6', size = 40) {
    const svg = `
      <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" 
              fill="${color}" stroke="white" stroke-width="2"/>
        <circle cx="12" cy="9" r="2.5" fill="white"/>
      </svg>
    `
    
    return {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
      scaledSize: new window.google.maps.Size(size, size),
      origin: new window.google.maps.Point(0, 0),
      anchor: new window.google.maps.Point(size / 2, size)
    }
  }

  // Set map theme
  setMapTheme(theme = 'default') {
    if (!this.map) return

    const themes = {
      default: [],
      dark: [
        { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
        { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
        { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] }
      ],
      light: [
        { elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
        { elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] }
      ],
      medical: [
        {
          featureType: 'poi.medical',
          elementType: 'geometry',
          stylers: [{ color: '#ffeaa7' }]
        },
        {
          featureType: 'poi.medical',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#d63031' }]
        }
      ]
    }

    this.map.setOptions({ styles: themes[theme] || themes.default })
  }

  // Add traffic layer
  toggleTrafficLayer(show = true) {
    if (!this.map) return

    if (show) {
      const trafficLayer = new window.google.maps.TrafficLayer()
      trafficLayer.setMap(this.map)
      this.trafficLayer = trafficLayer
    } else if (this.trafficLayer) {
      this.trafficLayer.setMap(null)
      this.trafficLayer = null
    }
  }

  // Get current map bounds
  getMapBounds() {
    if (!this.map) return null

    const bounds = this.map.getBounds()
    if (!bounds) return null

    const ne = bounds.getNorthEast()
    const sw = bounds.getSouthWest()

    return {
      north: ne.lat(),
      east: ne.lng(),
      south: sw.lat(),
      west: sw.lng()
    }
  }

  // Cleanup
  destroy() {
    this.clearMarkers()
    if (this.directionsRenderer) {
      this.directionsRenderer.setMap(null)
    }
    if (this.trafficLayer) {
      this.trafficLayer.setMap(null)
    }
    this.map = null
  }
}

// Create singleton instance
const googleMapsService = new GoogleMapsService()

export default googleMapsService

// Export class for testing
export { GoogleMapsService }

