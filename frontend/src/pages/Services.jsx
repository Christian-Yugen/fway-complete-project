import React, { useState, useEffect } from 'react'
import { useLocation } from '../contexts/LocationContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Search, Filter, MapPin, Star, Clock, 
  SlidersHorizontal, Grid, List, Heart 
} from 'lucide-react'
import { Link } from 'react-router-dom'
import ApiService from '../services/api'

const Services = () => {
  const { currentLocation, getCurrentPosition, isLocationEnabled } = useLocation()
  const [services, setServices] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('grid')
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [radiusKm, setRadiusKm] = useState([10])
  const [sortBy, setSortBy] = useState('distance')
  const [showFilters, setShowFilters] = useState(false)
  
  useEffect(() => {
    loadInitialData()
  }, [currentLocation])
  
  useEffect(() => {
    searchServices()
  }, [searchTerm, selectedCategory, priceRange, radiusKm, sortBy])
  
  const loadInitialData = async () => {
    try {
      setLoading(true)
      
      // Load categories
      const categoriesResponse = await ApiService.getCategories()
      setCategories(categoriesResponse.categories || [])
      
      // Load services
      await searchServices()
      
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const searchServices = async () => {
    try {
      const params = {}
      
      if (searchTerm.trim()) {
        params.search = searchTerm
      }
      
      if (selectedCategory) {
        params.category_id = selectedCategory
      }
      
      if (currentLocation) {
        params.latitude = currentLocation.latitude
        params.longitude = currentLocation.longitude
        params.radius = radiusKm[0]
      }
      
      const response = await ApiService.getServices(params)
      let servicesData = response.services || []
      
      // Filter by price range
      servicesData = servicesData.filter(service => {
        const price = parseFloat(service.price) || 0
        return price >= priceRange[0] && price <= priceRange[1]
      })
      
      // Sort services
      servicesData.sort((a, b) => {
        switch (sortBy) {
          case 'price_low':
            return (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0)
          case 'price_high':
            return (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0)
          case 'rating':
            return (parseFloat(b.provider?.rating) || 0) - (parseFloat(a.provider?.rating) || 0)
          case 'distance':
          default:
            return (a.distance_km || 999) - (b.distance_km || 999)
        }
      })
      
      setServices(servicesData)
      
    } catch (error) {
      console.error('Error searching services:', error)
    }
  }
  
  const handleLocationRequest = async () => {
    try {
      await getCurrentPosition()
    } catch (error) {
      console.error('Error getting location:', error)
    }
  }
  
  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('')
    setPriceRange([0, 1000])
    setRadiusKm([10])
    setSortBy('distance')
  }
  
  const ServiceCard = ({ service, compact = false }) => (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow">
      <Link to={`/services/${service.id}`}>
        <CardContent className={compact ? "p-4" : "p-0"}>
          {!compact && service.images && service.images.length > 0 && (
            <div className="h-48 bg-gray-200 rounded-t-lg"></div>
          )}
          
          <div className={compact ? "" : "p-4"}>
            <div className="flex items-start justify-between mb-2">
              <h3 className={`font-semibold text-gray-900 line-clamp-2 ${compact ? 'text-sm' : ''}`}>
                {service.title}
              </h3>
              <Button variant="ghost" size="sm" className="p-1">
                <Heart className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center space-x-2 mb-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={service.provider?.avatar_url} alt={service.provider?.name} />
                <AvatarFallback className="text-xs">
                  {service.provider?.name?.charAt(0)?.toUpperCase() || 'P'}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-gray-600">{service.provider?.name}</span>
              <Badge variant="secondary" className="text-xs">
                {service.category?.name}
              </Badge>
            </div>
            
            {!compact && (
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {service.description}
              </p>
            )}
            
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm font-medium">
                  {service.provider?.rating || 0}
                </span>
                <span className="text-sm text-gray-500">
                  ({service.provider?.total_reviews || 0})
                </span>
              </div>
              
              {service.distance_km && (
                <div className="flex items-center space-x-1 text-gray-500">
                  <MapPin className="h-3 w-3" />
                  <span className="text-xs">
                    {service.distance_km}km
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <span className={`font-bold text-blue-600 ${compact ? 'text-sm' : 'text-lg'}`}>
                  R$ {service.price}
                </span>
                <span className="text-sm text-gray-500">
                  /{service.price_type === 'hourly' ? 'hora' : 'serviço'}
                </span>
              </div>
              
              <div className="flex items-center space-x-1 text-gray-500">
                <Clock className="h-3 w-3" />
                <span className="text-xs">Disponível</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  )
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Location Banner */}
      {!isLocationEnabled && (
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">
                    Ative sua localização
                  </p>
                  <p className="text-sm text-blue-700">
                    Encontre serviços próximos a você
                  </p>
                </div>
              </div>
              <Button onClick={handleLocationRequest} size="sm">
                Permitir
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar serviços..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button
            variant="outline"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
          </Button>
        </div>
        
        {/* Filters Panel */}
        {showFilters && (
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Categoria</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Preço: R$ {priceRange[0]} - R$ {priceRange[1]}
                  </label>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={1000}
                    step={10}
                    className="mt-2"
                  />
                </div>
                
                {currentLocation && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Raio: {radiusKm[0]}km
                    </label>
                    <Slider
                      value={radiusKm}
                      onValueChange={setRadiusKm}
                      max={50}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                )}
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Ordenar por</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="distance">Distância</SelectItem>
                      <SelectItem value="price_low">Menor Preço</SelectItem>
                      <SelectItem value="price_high">Maior Preço</SelectItem>
                      <SelectItem value="rating">Melhor Avaliação</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <span className="text-sm text-gray-600">
                  {services.length} serviço{services.length !== 1 ? 's' : ''} encontrado{services.length !== 1 ? 's' : ''}
                </span>
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Limpar Filtros
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Services Grid/List */}
      {services.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum serviço encontrado
            </h3>
            <p className="text-gray-500 mb-4">
              Tente ajustar seus filtros ou buscar por outros termos
            </p>
            <Button onClick={clearFilters}>
              Limpar Filtros
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
        }>
          {services.map((service) => (
            <ServiceCard 
              key={service.id} 
              service={service} 
              compact={viewMode === 'list'} 
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default Services

