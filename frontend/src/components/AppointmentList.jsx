import React, { useState, useEffect } from 'react'
import { Calendar, Clock, User, MapPin, Star, MessageSquare, Phone, Video, CreditCard, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

const AppointmentCard = ({ appointment, onStatusChange, onReschedule, onCancel, onReview }) => {
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'in_progress':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />
      case 'pending':
        return <Clock className="w-4 h-4" />
      case 'cancelled':
        return <XCircle className="w-4 h-4" />
      case 'completed':
        return <CheckCircle className="w-4 h-4" />
      case 'in_progress':
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmado'
      case 'pending':
        return 'Pendente'
      case 'cancelled':
        return 'Cancelado'
      case 'completed':
        return 'Concluído'
      case 'in_progress':
        return 'Em Andamento'
      default:
        return 'Desconhecido'
    }
  }

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date))
  }

  const formatTime = (time) => {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(`2000-01-01T${time}`))
  }

  const canCancel = () => {
    const appointmentDate = new Date(`${appointment.date}T${appointment.time}`)
    const now = new Date()
    const hoursDiff = (appointmentDate - now) / (1000 * 60 * 60)
    return hoursDiff > 24 && ['confirmed', 'pending'].includes(appointment.status)
  }

  const canReschedule = () => {
    const appointmentDate = new Date(`${appointment.date}T${appointment.time}`)
    const now = new Date()
    const hoursDiff = (appointmentDate - now) / (1000 * 60 * 60)
    return hoursDiff > 48 && ['confirmed', 'pending'].includes(appointment.status)
  }

  const canReview = () => {
    return appointment.status === 'completed' && !appointment.reviewed
  }

  const handleCancel = () => {
    if (cancelReason.trim()) {
      onCancel(appointment.id, cancelReason)
      setShowCancelDialog(false)
      setCancelReason('')
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={appointment.professional.avatar} />
              <AvatarFallback>
                {appointment.professional.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">{appointment.professional.name}</h3>
              <p className="text-sm text-gray-600">{appointment.service.name}</p>
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{appointment.professional.rating}</span>
                <span className="text-sm text-gray-500">
                  ({appointment.professional.reviewCount} avaliações)
                </span>
              </div>
            </div>
          </div>
          <Badge className={cn("flex items-center gap-1", getStatusColor(appointment.status))}>
            {getStatusIcon(appointment.status)}
            {getStatusText(appointment.status)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Informações do agendamento */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span>{formatDate(appointment.date)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-gray-500" />
            <span>{formatTime(appointment.time)} - {appointment.duration}min</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-gray-500" />
            <span>{appointment.location || 'Online'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CreditCard className="w-4 h-4 text-gray-500" />
            <span>R$ {appointment.price.toFixed(2)}</span>
          </div>
        </div>

        {/* Notas */}
        {appointment.notes && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Observações:</strong> {appointment.notes}
            </p>
          </div>
        )}

        {/* Ações */}
        <div className="flex flex-wrap gap-2 pt-2 border-t">
          {/* Chat */}
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <MessageSquare className="w-4 h-4" />
            Chat
          </Button>

          {/* Chamada */}
          {appointment.type === 'online' && (
            <>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Phone className="w-4 h-4" />
                Ligar
              </Button>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Video className="w-4 h-4" />
                Vídeo
              </Button>
            </>
          )}

          {/* Reagendar */}
          {canReschedule() && (
            <Dialog open={showRescheduleDialog} onOpenChange={setShowRescheduleDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Reagendar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reagendar Consulta</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Selecione uma nova data e horário para sua consulta.
                  </p>
                  {/* Aqui seria implementado um calendário para seleção */}
                  <div className="flex gap-2">
                    <Button onClick={() => setShowRescheduleDialog(false)}>
                      Confirmar
                    </Button>
                    <Button variant="outline" onClick={() => setShowRescheduleDialog(false)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {/* Cancelar */}
          {canCancel() && (
            <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                  Cancelar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cancelar Consulta</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Tem certeza que deseja cancelar esta consulta? Esta ação não pode ser desfeita.
                  </p>
                  <div>
                    <label className="text-sm font-medium">Motivo do cancelamento</label>
                    <Textarea
                      placeholder="Por favor, informe o motivo do cancelamento..."
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="destructive" 
                      onClick={handleCancel}
                      disabled={!cancelReason.trim()}
                    >
                      Confirmar Cancelamento
                    </Button>
                    <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
                      Manter Consulta
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {/* Avaliar */}
          {canReview() && (
            <Button 
              size="sm" 
              className="bg-yellow-500 hover:bg-yellow-600 text-white"
              onClick={() => onReview(appointment)}
            >
              <Star className="w-4 h-4 mr-1" />
              Avaliar
            </Button>
          )}
        </div>

        {/* Informações adicionais baseadas no status */}
        {appointment.status === 'pending' && (
          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              <AlertCircle className="w-4 h-4 inline mr-1" />
              Aguardando confirmação do profissional
            </p>
          </div>
        )}

        {appointment.status === 'confirmed' && (
          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <p className="text-sm text-green-800">
              <CheckCircle className="w-4 h-4 inline mr-1" />
              Consulta confirmada! Você receberá um lembrete 1 hora antes.
            </p>
          </div>
        )}

        {appointment.status === 'cancelled' && appointment.cancelReason && (
          <div className="bg-red-50 p-3 rounded-lg border border-red-200">
            <p className="text-sm text-red-800">
              <XCircle className="w-4 h-4 inline mr-1" />
              <strong>Motivo:</strong> {appointment.cancelReason}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

const AppointmentList = () => {
  const [appointments, setAppointments] = useState([])
  const [filter, setFilter] = useState('all') // all, upcoming, past, cancelled
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      // Simular dados de agendamentos
      const mockAppointments = [
        {
          id: 1,
          professional: {
            id: 1,
            name: 'Dr. Ana Silva',
            avatar: null,
            rating: 4.8,
            reviewCount: 127
          },
          service: {
            id: 1,
            name: 'Consulta Médica Geral'
          },
          date: '2024-06-15',
          time: '14:00',
          duration: 60,
          location: 'Clínica Saúde Total - Sala 205',
          type: 'presencial',
          price: 150.00,
          status: 'confirmed',
          notes: 'Trazer exames de sangue recentes',
          reviewed: false
        },
        {
          id: 2,
          professional: {
            id: 2,
            name: 'Dra. Maria Santos',
            avatar: null,
            rating: 4.9,
            reviewCount: 89
          },
          service: {
            id: 2,
            name: 'Consulta Psicológica'
          },
          date: '2024-06-12',
          time: '16:30',
          duration: 50,
          location: 'Online',
          type: 'online',
          price: 120.00,
          status: 'completed',
          notes: null,
          reviewed: false
        },
        {
          id: 3,
          professional: {
            id: 3,
            name: 'Dr. João Oliveira',
            avatar: null,
            rating: 4.7,
            reviewCount: 203
          },
          service: {
            id: 3,
            name: 'Fisioterapia'
          },
          date: '2024-06-20',
          time: '09:00',
          duration: 45,
          location: 'Centro de Reabilitação - Sala 3',
          type: 'presencial',
          price: 80.00,
          status: 'pending',
          notes: 'Primeira sessão - avaliação inicial',
          reviewed: false
        },
        {
          id: 4,
          professional: {
            id: 4,
            name: 'Dra. Carla Lima',
            avatar: null,
            rating: 4.6,
            reviewCount: 156
          },
          service: {
            id: 4,
            name: 'Consulta Nutricional'
          },
          date: '2024-06-08',
          time: '10:00',
          duration: 60,
          location: 'Online',
          type: 'online',
          price: 100.00,
          status: 'cancelled',
          cancelReason: 'Profissional teve imprevisto',
          reviewed: false
        }
      ]

      setAppointments(mockAppointments)
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = (appointmentId, newStatus) => {
    setAppointments(prev => 
      prev.map(apt => 
        apt.id === appointmentId 
          ? { ...apt, status: newStatus }
          : apt
      )
    )
  }

  const handleCancel = (appointmentId, reason) => {
    setAppointments(prev => 
      prev.map(apt => 
        apt.id === appointmentId 
          ? { ...apt, status: 'cancelled', cancelReason: reason }
          : apt
      )
    )
  }

  const handleReview = (appointment) => {
    // Navegar para página de avaliação ou abrir modal
    console.log('Avaliar:', appointment)
  }

  const filteredAppointments = appointments.filter(appointment => {
    const appointmentDate = new Date(`${appointment.date}T${appointment.time}`)
    const now = new Date()
    
    switch (filter) {
      case 'upcoming':
        return appointmentDate > now && ['confirmed', 'pending'].includes(appointment.status)
      case 'past':
        return appointmentDate < now || appointment.status === 'completed'
      case 'cancelled':
        return appointment.status === 'cancelled'
      default:
        return true
    }
  })

  const getFilterCount = (filterType) => {
    return appointments.filter(appointment => {
      const appointmentDate = new Date(`${appointment.date}T${appointment.time}`)
      const now = new Date()
      
      switch (filterType) {
        case 'upcoming':
          return appointmentDate > now && ['confirmed', 'pending'].includes(appointment.status)
        case 'past':
          return appointmentDate < now || appointment.status === 'completed'
        case 'cancelled':
          return appointment.status === 'cancelled'
        default:
          return true
      }
    }).length
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="rounded-full bg-gray-200 h-12 w-12"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex gap-2 overflow-x-auto">
        {[
          { key: 'all', label: 'Todos', count: appointments.length },
          { key: 'upcoming', label: 'Próximos', count: getFilterCount('upcoming') },
          { key: 'past', label: 'Passados', count: getFilterCount('past') },
          { key: 'cancelled', label: 'Cancelados', count: getFilterCount('cancelled') }
        ].map(filterOption => (
          <Button
            key={filterOption.key}
            variant={filter === filterOption.key ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(filterOption.key)}
            className="whitespace-nowrap"
          >
            {filterOption.label} ({filterOption.count})
          </Button>
        ))}
      </div>

      {/* Lista de agendamentos */}
      <div className="space-y-4">
        {filteredAppointments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum agendamento encontrado
              </h3>
              <p className="text-gray-600 mb-4">
                {filter === 'all' 
                  ? 'Você ainda não tem agendamentos.'
                  : `Nenhum agendamento ${filter === 'upcoming' ? 'próximo' : filter === 'past' ? 'passado' : 'cancelado'} encontrado.`
                }
              </p>
              <Button>
                Agendar Consulta
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredAppointments.map(appointment => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              onStatusChange={handleStatusChange}
              onCancel={handleCancel}
              onReview={handleReview}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default AppointmentList

