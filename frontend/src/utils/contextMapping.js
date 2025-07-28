// Mapeamento de contextos por página e tipo de usuário
export const contextMapping = {
  // Página inicial
  '/': {
    patient: {
      primaryActions: ['search-professionals', 'schedule-appointment', 'ai-health'],
      secondaryActions: ['my-appointments', 'service-request', 'shield-dashboard'],
      contextualActions: ['intelligent-matching', 'professional-map'],
      hiddenFeatures: ['performance-dashboard', 'service-feed', 'profile-verification', 'ar-training']
    },
    professional: {
      primaryActions: ['service-feed', 'performance-dashboard', 'my-appointments'],
      secondaryActions: ['profile-verification', 'rewards-system', 'shield-dashboard'],
      contextualActions: ['intelligent-matching', 'ar-training'],
      hiddenFeatures: ['service-request', 'search-professionals']
    }
  },
  
  // Página de busca
  '/search': {
    patient: {
      primaryActions: ['professional-map', 'intelligent-matching'],
      secondaryActions: ['service-request', 'schedule-appointment'],
      contextualActions: ['rating-history', 'shield-dashboard'],
      hiddenFeatures: ['service-feed', 'performance-dashboard', 'profile-verification']
    },
    professional: {
      primaryActions: ['intelligent-matching'],
      secondaryActions: ['service-feed'],
      contextualActions: [],
      hiddenFeatures: ['service-request', 'professional-map', 'schedule-appointment']
    }
  },
  
  // Perfil do profissional
  '/professional/:id': {
    patient: {
      primaryActions: ['schedule-appointment', 'send-message'],
      secondaryActions: ['rating-history', 'shield-dashboard'],
      contextualActions: ['payment-pricing', 'chat-notifications'],
      hiddenFeatures: ['service-feed', 'performance-dashboard', 'profile-verification']
    },
    professional: {
      primaryActions: ['send-message'],
      secondaryActions: ['rating-history'],
      contextualActions: [],
      hiddenFeatures: ['schedule-appointment', 'service-request']
    }
  },
  
  // Dashboard
  '/dashboard': {
    patient: {
      primaryActions: ['my-appointments', 'ai-health', 'shield-dashboard'],
      secondaryActions: ['search-professionals', 'service-request'],
      contextualActions: ['iot-monitor', 'neurosync', 'social-feed'],
      hiddenFeatures: ['service-feed', 'performance-dashboard', 'profile-verification', 'ar-training']
    },
    professional: {
      primaryActions: ['service-feed', 'performance-dashboard', 'my-appointments'],
      secondaryActions: ['profile-verification', 'rewards-system'],
      contextualActions: ['ar-training', 'iot-monitor', 'social-feed'],
      hiddenFeatures: ['service-request', 'search-professionals']
    }
  },
  
  // Página de agendamento
  '/booking/:id': {
    patient: {
      primaryActions: ['payment-pricing', 'shield-dashboard'],
      secondaryActions: ['send-message', 'rating-history'],
      contextualActions: ['chat-notifications'],
      hiddenFeatures: ['service-feed', 'performance-dashboard', 'profile-verification']
    },
    professional: {
      primaryActions: ['send-message', 'payment-pricing'],
      secondaryActions: ['rating-history'],
      contextualActions: ['chat-notifications'],
      hiddenFeatures: ['schedule-appointment', 'service-request']
    }
  },
  
  // Perfil do usuário
  '/profile': {
    patient: {
      primaryActions: ['my-appointments', 'shield-dashboard'],
      secondaryActions: ['rating-history', 'social-feed'],
      contextualActions: ['ai-health', 'iot-monitor'],
      hiddenFeatures: ['service-feed', 'performance-dashboard', 'profile-verification', 'ar-training']
    },
    professional: {
      primaryActions: ['profile-verification', 'performance-dashboard'],
      secondaryActions: ['rewards-system', 'my-appointments'],
      contextualActions: ['ar-training', 'social-feed'],
      hiddenFeatures: ['service-request', 'search-professionals']
    }
  },
  
  // Chat
  '/chat': {
    patient: {
      primaryActions: ['send-message', 'chat-notifications'],
      secondaryActions: ['schedule-appointment', 'rating-history'],
      contextualActions: ['payment-pricing'],
      hiddenFeatures: ['service-feed', 'performance-dashboard', 'profile-verification']
    },
    professional: {
      primaryActions: ['send-message', 'chat-notifications'],
      secondaryActions: ['service-feed', 'rating-history'],
      contextualActions: ['payment-pricing'],
      hiddenFeatures: ['service-request', 'search-professionals']
    }
  },
  
  // Rede/Network
  '/network': {
    patient: {
      primaryActions: ['search-professionals', 'social-feed'],
      secondaryActions: ['intelligent-matching', 'send-message'],
      contextualActions: ['professional-map'],
      hiddenFeatures: ['service-feed', 'performance-dashboard', 'profile-verification']
    },
    professional: {
      primaryActions: ['social-feed', 'intelligent-matching'],
      secondaryActions: ['service-feed', 'send-message'],
      contextualActions: [],
      hiddenFeatures: ['service-request', 'search-professionals']
    }
  },
  
  // Fway Shield Dashboard
  '/shield-dashboard': {
    patient: {
      primaryActions: ['coverage-manager', 'claims-center'],
      secondaryActions: ['shield-dashboard', 'payment-pricing'],
      contextualActions: ['rating-history'],
      hiddenFeatures: ['service-feed', 'performance-dashboard', 'profile-verification', 'risk-intelligence']
    },
    professional: {
      primaryActions: ['risk-intelligence', 'shield-dashboard'],
      secondaryActions: ['payment-pricing', 'rating-history'],
      contextualActions: [],
      hiddenFeatures: ['coverage-manager', 'claims-center', 'service-request']
    }
  },
  
  // Service Feed (apenas profissionais)
  '/service-feed': {
    professional: {
      primaryActions: ['intelligent-matching', 'send-message'],
      secondaryActions: ['performance-dashboard', 'rating-history'],
      contextualActions: ['payment-pricing'],
      hiddenFeatures: ['service-request', 'search-professionals']
    }
  },
  
  // Service Request (apenas pacientes)
  '/service-request': {
    patient: {
      primaryActions: ['professional-map', 'intelligent-matching'],
      secondaryActions: ['search-professionals', 'shield-dashboard'],
      contextualActions: ['payment-pricing'],
      hiddenFeatures: ['service-feed', 'performance-dashboard', 'profile-verification']
    }
  },
  
  // AI Health
  '/ai-health': {
    patient: {
      primaryActions: ['iot-monitor', 'neurosync'],
      secondaryActions: ['my-appointments', 'shield-dashboard'],
      contextualActions: ['search-professionals'],
      hiddenFeatures: ['service-feed', 'performance-dashboard', 'profile-verification']
    },
    professional: {
      primaryActions: ['iot-monitor', 'neurosync'],
      secondaryActions: ['service-feed', 'performance-dashboard'],
      contextualActions: [],
      hiddenFeatures: ['service-request', 'search-professionals']
    }
  },
  
  // Performance Dashboard (apenas profissionais)
  '/performance-dashboard': {
    professional: {
      primaryActions: ['service-feed', 'rewards-system'],
      secondaryActions: ['profile-verification', 'rating-history'],
      contextualActions: ['ar-training'],
      hiddenFeatures: ['service-request', 'search-professionals']
    }
  },
  
  // Profile Verification (apenas profissionais)
  '/profile-verification': {
    professional: {
      primaryActions: ['performance-dashboard', 'service-feed'],
      secondaryActions: ['rewards-system', 'rating-history'],
      contextualActions: [],
      hiddenFeatures: ['service-request', 'search-professionals']
    }
  }
}

// Função auxiliar para obter contexto de uma página
export const getPageContext = (path, userType = 'patient') => {
  // Normalizar path para patterns com parâmetros
  let normalizedPath = path
  if (path.match(/^\/professional\/\d+/)) normalizedPath = '/professional/:id'
  if (path.match(/^\/booking\/\d+/)) normalizedPath = '/booking/:id'
  
  const pageConfig = contextMapping[normalizedPath] || contextMapping['/']
  return pageConfig[userType] || pageConfig['patient'] || {
    primaryActions: [],
    secondaryActions: [],
    contextualActions: [],
    hiddenFeatures: []
  }
}

// Função para verificar se uma funcionalidade deve ser exibida
export const shouldShowFeature = (featureId, context) => {
  const { primaryActions, secondaryActions, contextualActions, hiddenFeatures } = context
  
  if (hiddenFeatures.includes(featureId)) return false
  
  return primaryActions.includes(featureId) || 
         secondaryActions.includes(featureId) || 
         contextualActions.includes(featureId)
}

