import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLocation } from '../contexts/LocationContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { 
  MapPin, Star, Clock, Calendar as CalendarIcon, 
  Phone, MessageCircle, Heart, Share2, 
  CreditCard, ArrowLeft, CheckCircle 
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import ApiService from '../services/api'
import useAuthStore from '../store/authStore'

const ServiceDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { currentLocation } = useLocation()
  const { getAuthHeaders } = useAuthStore()
  
  const [service, setService] = useState(null)
  const [loading, setLoading] = useState(true)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [showBookingForm, setShowBookingForm] = useState(false)
  
  // Booking form state
  const [selectedDate, setSelectedDate] = useState(null)
  const [notes, setNotes] = useState('')
  const [estimatedPrice, setEstimatedPrice] = useState('')
  
  useEffect(() => {
    if (id) {
      loadService()
    }
  }, [id])
  
  const loadService = async () => {
    try {
      setLoading(true)
      const response = await ApiService.getServiceById(id)
      setService(response.service)
      setEstimatedPrice(response.service.price || '')
    } catch (error) {
      console.error('Error loading service:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleBookService = async () => {
    if (!selectedDate) {
      alert('Por favor, selecione uma data')
      return
    }
    
    try {
      setBookingLoading(true)
      
      const bookingData = {
        service_id: parseInt(id),
        scheduled_date: selectedDate.toISOString(),
        total_amount: parseFloat(estimatedPrice) || null,
        notes: notes.trim() || null
      }
      
      // Add client location if available
      if (currentLocation) {
        bookingData.client_location_lat = currentLocation.latitude
        bookingData.client_location_lng = currentLocation.longitude
      }
      
      const response = await ApiService.createBooking(bookingData, getAuthHeaders())
      
      // Navigate to bookings page or chat
      navigate(`/chat/${response.booking.id}`)
      
    } catch (error) {
      console.error('Error creating booking:', error)
      alert('Erro ao criar reserva. Tente novamente.')
    } finally {
      setBookingLoading(false)
    }
  }
  
  const calculateDistance = () => {
    if (!currentLocation || !service?.latitude || !service?.longitude) {
      return null
    }
    
    const lat1 = currentLocation.latitude
    const lng1 = currentLocation.longitude
    const lat2 = parseFloat(service.latitude)
    const lng2 = parseFloat(service.longitude)
    
    // Simple distance calculation (not accurate for large distances)
    const latDiff = Math.abs(lat1 - lat2)
    const lngDiff = Math.abs(lng1 - lng2)
    const distance = Math.sqrt(latDiff ** 2 + lngDiff ** 2) * 111 // Rough km conversion
    
    return distance.toFixed(1)
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  if (!service) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Serviço não encontrado
          </h2>
          <Button onClick={() => navigate('/services')}>
            Voltar para Serviços
          </Button>
        </div>
      </div>
    )
  }
  
  const distance = calculateDistance()
  const isOwnService = service.provider_id === user?.id
  
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar</span>
        </Button>
        
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Heart className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Service Images */}
          {service.images && service.images.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {service.images.slice(0, 4).map((image, index) => (
                <div key={index} className="aspect-video bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          ) : (
            <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">Nenhuma imagem disponível</span>
            </div>
          )}
          
          {/* Service Info */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl mb-2">{service.title}</CardTitle>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <Badge variant="secondary">
                      {service.category?.name}
                    </Badge>
                    
                    {distance && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{distance}km de distância</span>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>Disponível</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    R$ {service.price}
                  </div>
                  <div className="text-sm text-gray-500">
                    /{service.price_type === 'hourly' ? 'hora' : 'serviço'}
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Descrição</h3>
                  <p className="text-gray-600">
                    {service.description || 'Nenhuma descrição disponível.'}
                  </p>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-semibold mb-2">Localização</h3>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>
                      Atende em um raio de {service.radius_km}km
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Provider Info */}
          <Card>
            <CardHeader>
              <CardTitle>Prestador</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={service.provider?.avatar_url} alt={service.provider?.name} />
                  <AvatarFallback>
                    {service.provider?.name?.charAt(0)?.toUpperCase() || 'P'}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <h4 className="font-semibold">{service.provider?.name}</h4>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm">
                      {service.provider?.rating || 0} ({service.provider?.total_reviews || 0} avaliações)
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Phone className="h-4 w-4 mr-1" />
                  Ligar
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Chat
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Booking Form */}
          {!isOwnService && (
            <Card>
              <CardHeader>
                <CardTitle>Reservar Serviço</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!showBookingForm ? (
                  <Button 
                    className="w-full" 
                    onClick={() => setShowBookingForm(true)}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Solicitar Orçamento
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="date">Data Preferida</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate ? (
                              format(selectedDate, "PPP", { locale: ptBR })
                            ) : (
                              <span>Selecione uma data</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div>
                      <Label htmlFor="price">Valor Estimado (R$)</Label>
                      <Input
                        id="price"
                        type="number"
                        value={estimatedPrice}
                        onChange={(e) => setEstimatedPrice(e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="notes">Observações</Label>
                      <Textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Descreva detalhes do serviço..."
                        rows={3}
                      />
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowBookingForm(false)}
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleBookService}
                        disabled={bookingLoading}
                        className="flex-1"
                      >
                        {bookingLoading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Solicitar
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default ServiceDetail

