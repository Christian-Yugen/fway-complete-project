import React, { useState, useEffect } from 'react'
import { Star, ThumbsUp, MessageSquare, Flag, Send, Edit, Trash2, MoreVertical } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

const ReviewSystem = ({ serviceId, professionalId, userCanReview = false }) => {
  const [reviews, setReviews] = useState([])
  const [newReview, setNewReview] = useState({
    rating: 0,
    communication: 0,
    punctuality: 0,
    professionalism: 0,
    comment: '',
    anonymous: false
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [editingReview, setEditingReview] = useState(null)
  const [filter, setFilter] = useState('all') // all, recent, highest, lowest
  const [sortBy, setSortBy] = useState('recent') // recent, rating, helpful

  useEffect(() => {
    fetchReviews()
  }, [serviceId, professionalId, sortBy])

  const fetchReviews = async () => {
    try {
      // Simular dados de reviews
      const mockReviews = [
        {
          id: 1,
          user: {
            id: 1,
            name: 'Maria Silva',
            avatar: null,
            verified: true
          },
          rating: 5,
          communication: 5,
          punctuality: 4,
          professionalism: 5,
          comment: 'Excelente profissional! Muito atenciosa e pontual. Recomendo fortemente.',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          helpful: 12,
          userFoundHelpful: false,
          anonymous: false,
          response: {
            message: 'Muito obrigada pelo feedback! Foi um prazer atendê-la.',
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
          },
          canEdit: false,
          canDelete: false
        },
        {
          id: 2,
          user: {
            id: 2,
            name: 'João Santos',
            avatar: null,
            verified: false
          },
          rating: 4,
          communication: 4,
          punctuality: 3,
          professionalism: 4,
          comment: 'Bom atendimento, mas chegou um pouco atrasada. No geral, satisfeito com o serviço.',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          helpful: 8,
          userFoundHelpful: true,
          anonymous: false,
          response: null,
          canEdit: false,
          canDelete: false
        },
        {
          id: 3,
          user: {
            id: 3,
            name: 'Usuário Anônimo',
            avatar: null,
            verified: false
          },
          rating: 5,
          communication: 5,
          punctuality: 5,
          professionalism: 5,
          comment: 'Perfeito! Superou minhas expectativas. Muito profissional e cuidadosa.',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          helpful: 15,
          userFoundHelpful: false,
          anonymous: true,
          response: {
            message: 'Fico muito feliz em saber que ficou satisfeito! Obrigada!',
            createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
          },
          canEdit: true,
          canDelete: true
        }
      ]

      setReviews(mockReviews)
    } catch (error) {
      console.error('Erro ao buscar reviews:', error)
    }
  }

  const submitReview = async () => {
    if (newReview.rating === 0) {
      alert('Por favor, selecione uma avaliação geral')
      return
    }

    setIsSubmitting(true)
    try {
      // Simular envio da review
      const review = {
        id: Date.now(),
        user: {
          id: 999,
          name: newReview.anonymous ? 'Usuário Anônimo' : 'Você',
          avatar: null,
          verified: true
        },
        ...newReview,
        createdAt: new Date(),
        helpful: 0,
        userFoundHelpful: false,
        response: null,
        canEdit: true,
        canDelete: true
      }

      setReviews(prev => [review, ...prev])
      setNewReview({
        rating: 0,
        communication: 0,
        punctuality: 0,
        professionalism: 0,
        comment: '',
        anonymous: false
      })
      setShowReviewForm(false)
    } catch (error) {
      console.error('Erro ao enviar review:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const markHelpful = async (reviewId) => {
    try {
      setReviews(prev => prev.map(review => 
        review.id === reviewId 
          ? { 
              ...review, 
              helpful: review.userFoundHelpful ? review.helpful - 1 : review.helpful + 1,
              userFoundHelpful: !review.userFoundHelpful 
            }
          : review
      ))
    } catch (error) {
      console.error('Erro ao marcar como útil:', error)
    }
  }

  const deleteReview = async (reviewId) => {
    if (!confirm('Tem certeza que deseja excluir esta avaliação?')) return
    
    try {
      setReviews(prev => prev.filter(review => review.id !== reviewId))
    } catch (error) {
      console.error('Erro ao excluir review:', error)
    }
  }

  const reportReview = async (reviewId) => {
    try {
      alert('Avaliação reportada. Nossa equipe irá analisá-la.')
    } catch (error) {
      console.error('Erro ao reportar review:', error)
    }
  }

  const StarRating = ({ rating, onRatingChange, readonly = false, size = 'default' }) => {
    const starSize = size === 'small' ? 'w-4 h-4' : 'w-5 h-5'
    
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={cn(
              starSize,
              'cursor-pointer transition-colors',
              star <= rating 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-300 hover:text-yellow-400',
              readonly && 'cursor-default'
            )}
            onClick={() => !readonly && onRatingChange && onRatingChange(star)}
          />
        ))}
      </div>
    )
  }

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
    return (sum / reviews.length).toFixed(1)
  }

  const calculateRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    reviews.forEach(review => {
      distribution[review.rating]++
    })
    return distribution
  }

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date)
  }

  const averageRating = calculateAverageRating()
  const ratingDistribution = calculateRatingDistribution()
  const totalReviews = reviews.length

  return (
    <div className="space-y-6">
      {/* Resumo das avaliações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Avaliações ({totalReviews})</span>
            {userCanReview && (
              <Dialog open={showReviewForm} onOpenChange={setShowReviewForm}>
                <DialogTrigger asChild>
                  <Button>
                    <Star className="w-4 h-4 mr-2" />
                    Avaliar
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Avaliar Serviço</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    {/* Avaliação geral */}
                    <div>
                      <label className="text-sm font-medium">Avaliação Geral *</label>
                      <div className="mt-1">
                        <StarRating 
                          rating={newReview.rating} 
                          onRatingChange={(rating) => setNewReview(prev => ({ ...prev, rating }))}
                        />
                      </div>
                    </div>

                    {/* Avaliações específicas */}
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <label className="text-sm font-medium">Comunicação</label>
                        <StarRating 
                          rating={newReview.communication} 
                          onRatingChange={(rating) => setNewReview(prev => ({ ...prev, communication: rating }))}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Pontualidade</label>
                        <StarRating 
                          rating={newReview.punctuality} 
                          onRatingChange={(rating) => setNewReview(prev => ({ ...prev, punctuality: rating }))}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Profissionalismo</label>
                        <StarRating 
                          rating={newReview.professionalism} 
                          onRatingChange={(rating) => setNewReview(prev => ({ ...prev, professionalism: rating }))}
                        />
                      </div>
                    </div>

                    {/* Comentário */}
                    <div>
                      <label className="text-sm font-medium">Comentário</label>
                      <Textarea
                        placeholder="Compartilhe sua experiência..."
                        value={newReview.comment}
                        onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                        className="mt-1"
                        maxLength={1000}
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        {newReview.comment.length}/1000 caracteres
                      </div>
                    </div>

                    {/* Opções */}
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="anonymous"
                        checked={newReview.anonymous}
                        onChange={(e) => setNewReview(prev => ({ ...prev, anonymous: e.target.checked }))}
                      />
                      <label htmlFor="anonymous" className="text-sm">
                        Avaliar anonimamente
                      </label>
                    </div>

                    {/* Botões */}
                    <div className="flex gap-2">
                      <Button 
                        onClick={submitReview} 
                        disabled={isSubmitting || newReview.rating === 0}
                        className="flex-1"
                      >
                        {isSubmitting ? 'Enviando...' : 'Enviar Avaliação'}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowReviewForm(false)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {totalReviews > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Média geral */}
              <div className="text-center">
                <div className="text-4xl font-bold text-yellow-500 mb-2">
                  {averageRating}
                </div>
                <StarRating rating={Math.round(parseFloat(averageRating))} readonly />
                <div className="text-sm text-gray-600 mt-1">
                  Baseado em {totalReviews} avaliação{totalReviews !== 1 ? 'ões' : ''}
                </div>
              </div>

              {/* Distribuição das avaliações */}
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map(rating => (
                  <div key={rating} className="flex items-center gap-2">
                    <span className="text-sm w-8">{rating}★</span>
                    <Progress 
                      value={totalReviews > 0 ? (ratingDistribution[rating] / totalReviews) * 100 : 0} 
                      className="flex-1 h-2"
                    />
                    <span className="text-sm text-gray-600 w-8">
                      {ratingDistribution[rating]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Star className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Ainda não há avaliações</p>
              <p className="text-sm">Seja o primeiro a avaliar!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filtros e ordenação */}
      {totalReviews > 0 && (
        <div className="flex gap-2 overflow-x-auto">
          {[
            { key: 'all', label: 'Todas' },
            { key: 'recent', label: 'Recentes' },
            { key: 'highest', label: 'Melhores' },
            { key: 'lowest', label: 'Menores' }
          ].map(filterOption => (
            <Button
              key={filterOption.key}
              variant={filter === filterOption.key ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(filterOption.key)}
              className="whitespace-nowrap"
            >
              {filterOption.label}
            </Button>
          ))}
        </div>
      )}

      {/* Lista de avaliações */}
      <div className="space-y-4">
        {reviews.map(review => (
          <Card key={review.id}>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Cabeçalho da review */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={review.user.avatar} />
                      <AvatarFallback>
                        {review.anonymous ? '?' : review.user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {review.anonymous ? 'Usuário Anônimo' : review.user.name}
                        </span>
                        {review.user.verified && (
                          <Badge variant="secondary" className="text-xs">
                            Verificado
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatDate(review.createdAt)}
                      </div>
                    </div>
                  </div>

                  {/* Menu de ações */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {review.canEdit && (
                        <DropdownMenuItem onClick={() => setEditingReview(review)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                      )}
                      {review.canDelete && (
                        <DropdownMenuItem 
                          onClick={() => deleteReview(review.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => reportReview(review.id)}>
                        <Flag className="w-4 h-4 mr-2" />
                        Reportar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Avaliações */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Geral:</span>
                    <StarRating rating={review.rating} readonly size="small" />
                    <span className="text-sm text-gray-600">({review.rating}/5)</span>
                  </div>
                  
                  {(review.communication > 0 || review.punctuality > 0 || review.professionalism > 0) && (
                    <div className="grid grid-cols-3 gap-4 text-xs">
                      {review.communication > 0 && (
                        <div>
                          <span className="text-gray-600">Comunicação:</span>
                          <div className="flex items-center gap-1 mt-1">
                            <StarRating rating={review.communication} readonly size="small" />
                          </div>
                        </div>
                      )}
                      {review.punctuality > 0 && (
                        <div>
                          <span className="text-gray-600">Pontualidade:</span>
                          <div className="flex items-center gap-1 mt-1">
                            <StarRating rating={review.punctuality} readonly size="small" />
                          </div>
                        </div>
                      )}
                      {review.professionalism > 0 && (
                        <div>
                          <span className="text-gray-600">Profissionalismo:</span>
                          <div className="flex items-center gap-1 mt-1">
                            <StarRating rating={review.professionalism} readonly size="small" />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Comentário */}
                {review.comment && (
                  <p className="text-gray-700">{review.comment}</p>
                )}

                {/* Resposta do profissional */}
                {review.response && (
                  <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">
                        Resposta do profissional
                      </span>
                      <span className="text-xs text-blue-600">
                        {formatDate(review.response.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-blue-700">{review.response.message}</p>
                  </div>
                )}

                {/* Ações da review */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markHelpful(review.id)}
                    className={cn(
                      "text-sm",
                      review.userFoundHelpful && "text-blue-600"
                    )}
                  >
                    <ThumbsUp className={cn(
                      "w-4 h-4 mr-1",
                      review.userFoundHelpful && "fill-current"
                    )} />
                    Útil ({review.helpful})
                  </Button>

                  <div className="text-xs text-gray-500">
                    {review.canEdit && (
                      <span>Você pode editar esta avaliação por 24h</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default ReviewSystem

