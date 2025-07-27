import { create } from 'zustand'

const useLocationStore = create((set, get) => ({
  currentLocation: null,
  isLocationEnabled: false,
  locationError: null,
  
  setLocation: (location) => {
    set({
      currentLocation: location,
      isLocationEnabled: true,
      locationError: null
    })
  },
  
  setLocationError: (error) => {
    set({
      locationError: error,
      isLocationEnabled: false
    })
  },
  
  getCurrentPosition: () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const error = 'Geolocalização não é suportada neste navegador'
        get().setLocationError(error)
        reject(error)
        return
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          }
          get().setLocation(location)
          resolve(location)
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
          get().setLocationError(errorMessage)
          reject(errorMessage)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      )
    })
  },
  
  watchPosition: () => {
    if (!navigator.geolocation) {
      get().setLocationError('Geolocalização não é suportada')
      return null
    }
    
    return navigator.geolocation.watchPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        }
        get().setLocation(location)
      },
      (error) => {
        get().setLocationError('Erro ao monitorar localização')
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000 // 1 minute
      }
    )
  }
}))

export default useLocationStore

