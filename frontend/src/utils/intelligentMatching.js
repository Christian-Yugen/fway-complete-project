// Algoritmo de Matching Inteligente - Estilo Uber Pool
// Sistema avançado de sugestão de profissionais baseado em múltiplos fatores

/**
 * Calcula score de matching para um profissional
 * @param {Object} professional - Dados do profissional
 * @param {Object} request - Dados da solicitação
 * @param {Object} userHistory - Histórico do usuário
 * @returns {Object} Score e detalhes do matching
 */
export const calculateMatchingScore = (professional, request, userHistory = {}) => {
  const weights = {
    availability: 0.25,      // 25% - Disponibilidade imediata
    rating: 0.20,           // 20% - Avaliações
    experience: 0.15,       // 15% - Experiência
    distance: 0.15,         // 15% - Proximidade
    specialization: 0.10,   // 10% - Especialização
    priceMatch: 0.10,       // 10% - Compatibilidade de preço
    history: 0.05           // 5% - Histórico com usuário
  }

  // 1. Score de Disponibilidade (0-100)
  const availabilityScore = calculateAvailabilityScore(professional, request)
  
  // 2. Score de Avaliação (0-100)
  const ratingScore = (professional.rating / 5) * 100
  
  // 3. Score de Experiência (0-100)
  const experienceScore = Math.min((professional.experience / 10) * 100, 100)
  
  // 4. Score de Distância (0-100)
  const distanceScore = calculateDistanceScore(professional.distance)
  
  // 5. Score de Especialização (0-100)
  const specializationScore = calculateSpecializationScore(professional, request)
  
  // 6. Score de Preço (0-100)
  const priceScore = calculatePriceScore(professional.price, request.budget)
  
  // 7. Score de Histórico (0-100)
  const historyScore = calculateHistoryScore(professional, userHistory)

  // Cálculo do score final ponderado
  const finalScore = (
    availabilityScore * weights.availability +
    ratingScore * weights.rating +
    experienceScore * weights.experience +
    distanceScore * weights.distance +
    specializationScore * weights.specialization +
    priceScore * weights.priceMatch +
    historyScore * weights.history
  )

  return {
    score: Math.round(finalScore),
    breakdown: {
      availability: Math.round(availabilityScore),
      rating: Math.round(ratingScore),
      experience: Math.round(experienceScore),
      distance: Math.round(distanceScore),
      specialization: Math.round(specializationScore),
      price: Math.round(priceScore),
      history: Math.round(historyScore)
    },
    recommendation: getRecommendationLevel(finalScore),
    estimatedTime: calculateEstimatedTime(professional, request),
    confidence: calculateConfidence(finalScore, professional.reviews)
  }
}

/**
 * Calcula score de disponibilidade baseado em horários
 */
const calculateAvailabilityScore = (professional, request) => {
  const now = new Date()
  const requestTime = new Date(request.preferredTime || now)
  
  // Verifica se está online agora
  if (professional.isOnline) {
    return 100
  }
  
  // Verifica disponibilidade nos próximos horários
  const availableSlots = professional.availableSlots || []
  const nearestSlot = findNearestAvailableSlot(availableSlots, requestTime)
  
  if (!nearestSlot) return 0
  
  const timeDiff = Math.abs(nearestSlot.getTime() - requestTime.getTime())
  const hoursDiff = timeDiff / (1000 * 60 * 60)
  
  // Score decresce com o tempo de espera
  if (hoursDiff <= 1) return 90
  if (hoursDiff <= 4) return 70
  if (hoursDiff <= 12) return 50
  if (hoursDiff <= 24) return 30
  return 10
}

/**
 * Calcula score de distância (quanto menor, melhor)
 */
const calculateDistanceScore = (distance) => {
  if (distance <= 1) return 100
  if (distance <= 3) return 85
  if (distance <= 5) return 70
  if (distance <= 10) return 50
  if (distance <= 20) return 25
  return 10
}

/**
 * Calcula score de especialização
 */
const calculateSpecializationScore = (professional, request) => {
  const professionalSpecs = professional.specializations || []
  const requestedSpec = request.specialty
  
  // Match exato
  if (professionalSpecs.includes(requestedSpec)) {
    return 100
  }
  
  // Especialidades relacionadas
  const relatedSpecs = getRelatedSpecializations(requestedSpec)
  const hasRelated = professionalSpecs.some(spec => relatedSpecs.includes(spec))
  
  if (hasRelated) return 70
  
  // Especialização geral
  if (professionalSpecs.length > 0) return 40
  
  return 20
}

/**
 * Calcula score de compatibilidade de preço
 */
const calculatePriceScore = (professionalPrice, userBudget) => {
  if (!userBudget) return 50 // Neutro se não há orçamento definido
  
  const ratio = professionalPrice / userBudget
  
  if (ratio <= 0.8) return 100  // Abaixo do orçamento
  if (ratio <= 1.0) return 90   // Dentro do orçamento
  if (ratio <= 1.2) return 60   // Pouco acima
  if (ratio <= 1.5) return 30   // Moderadamente acima
  return 10                     // Muito acima
}

/**
 * Calcula score baseado no histórico com o usuário
 */
const calculateHistoryScore = (professional, userHistory) => {
  const previousInteractions = userHistory.professionals?.[professional.id]
  
  if (!previousInteractions) return 50 // Neutro para novos profissionais
  
  const { services, avgRating, lastService } = previousInteractions
  
  // Bonus por histórico positivo
  if (avgRating >= 4.5) return 100
  if (avgRating >= 4.0) return 80
  if (avgRating >= 3.5) return 60
  if (avgRating >= 3.0) return 40
  return 20
}

/**
 * Calcula tempo estimado para início do serviço
 */
const calculateEstimatedTime = (professional, request) => {
  const baseTime = professional.distance * 2 // 2 min por km
  const preparationTime = 15 // 15 min de preparação
  
  if (professional.isOnline) {
    return baseTime + preparationTime
  }
  
  const nextAvailable = findNearestAvailableSlot(
    professional.availableSlots, 
    new Date(request.preferredTime || Date.now())
  )
  
  if (nextAvailable) {
    const waitTime = Math.max(0, (nextAvailable.getTime() - Date.now()) / (1000 * 60))
    return waitTime + baseTime + preparationTime
  }
  
  return 120 // 2 horas como fallback
}

/**
 * Calcula nível de confiança da recomendação
 */
const calculateConfidence = (score, reviewCount) => {
  let confidence = score / 100
  
  // Ajusta baseado no número de avaliações
  if (reviewCount >= 100) confidence *= 1.0
  else if (reviewCount >= 50) confidence *= 0.95
  else if (reviewCount >= 20) confidence *= 0.9
  else if (reviewCount >= 10) confidence *= 0.85
  else confidence *= 0.8
  
  return Math.round(confidence * 100)
}

/**
 * Determina nível de recomendação baseado no score
 */
const getRecommendationLevel = (score) => {
  if (score >= 85) return 'excellent'
  if (score >= 70) return 'very-good'
  if (score >= 55) return 'good'
  if (score >= 40) return 'fair'
  return 'poor'
}

/**
 * Encontra o próximo horário disponível
 */
const findNearestAvailableSlot = (slots, targetTime) => {
  if (!slots || slots.length === 0) return null
  
  const availableSlots = slots
    .map(slot => new Date(slot))
    .filter(slot => slot >= targetTime)
    .sort((a, b) => a - b)
  
  return availableSlots[0] || null
}

/**
 * Retorna especializações relacionadas
 */
const getRelatedSpecializations = (specialty) => {
  const relations = {
    'cardiologia': ['clínica-geral', 'medicina-interna'],
    'pediatria': ['clínica-geral', 'medicina-família'],
    'ortopedia': ['fisioterapia', 'medicina-esportiva'],
    'fisioterapia': ['ortopedia', 'medicina-esportiva'],
    'dermatologia': ['clínica-geral', 'medicina-estética'],
    'neurologia': ['psiquiatria', 'medicina-interna'],
    'ginecologia': ['obstetrícia', 'medicina-família']
  }
  
  return relations[specialty] || []
}

/**
 * Função principal para obter profissionais recomendados
 * @param {Array} professionals - Lista de profissionais
 * @param {Object} request - Solicitação do usuário
 * @param {Object} userHistory - Histórico do usuário
 * @param {number} limit - Número máximo de resultados
 * @returns {Array} Lista ordenada de profissionais recomendados
 */
export const getIntelligentMatches = (professionals, request, userHistory = {}, limit = 10) => {
  const matches = professionals
    .map(professional => ({
      ...professional,
      matching: calculateMatchingScore(professional, request, userHistory)
    }))
    .filter(match => match.matching.score >= 30) // Filtro mínimo de qualidade
    .sort((a, b) => b.matching.score - a.matching.score)
    .slice(0, limit)

  return matches
}

/**
 * Gera explicação do matching para o usuário
 */
export const generateMatchingExplanation = (professional, matching) => {
  const reasons = []
  
  if (matching.breakdown.availability >= 80) {
    reasons.push('Disponível agora')
  }
  
  if (matching.breakdown.rating >= 90) {
    reasons.push('Excelentes avaliações')
  }
  
  if (matching.breakdown.distance >= 80) {
    reasons.push('Muito próximo')
  }
  
  if (matching.breakdown.specialization >= 90) {
    reasons.push('Especialista na área')
  }
  
  if (matching.breakdown.experience >= 80) {
    reasons.push('Muito experiente')
  }
  
  if (matching.breakdown.history >= 80) {
    reasons.push('Histórico positivo com você')
  }
  
  return reasons.length > 0 ? reasons : ['Profissional qualificado']
}

/**
 * Configurações do algoritmo de matching
 */
export const MATCHING_CONFIG = {
  MIN_SCORE: 30,
  EXCELLENT_THRESHOLD: 85,
  GOOD_THRESHOLD: 55,
  MAX_DISTANCE_KM: 50,
  MAX_RESULTS: 10,
  CACHE_DURATION_MINUTES: 5
}

/**
 * Métricas para análise do algoritmo
 */
export const getMatchingMetrics = (matches, actualChoices) => {
  const totalMatches = matches.length
  const avgScore = matches.reduce((sum, match) => sum + match.matching.score, 0) / totalMatches
  
  // Calcula precisão baseado nas escolhas reais dos usuários
  const topChoices = matches.slice(0, 3)
  const userChoseTopThree = actualChoices.some(choice => 
    topChoices.find(match => match.id === choice.professionalId)
  )
  
  return {
    totalMatches,
    averageScore: Math.round(avgScore),
    topThreeAccuracy: userChoseTopThree ? 100 : 0,
    distributionByLevel: {
      excellent: matches.filter(m => m.matching.recommendation === 'excellent').length,
      veryGood: matches.filter(m => m.matching.recommendation === 'very-good').length,
      good: matches.filter(m => m.matching.recommendation === 'good').length,
      fair: matches.filter(m => m.matching.recommendation === 'fair').length
    }
  }
}

