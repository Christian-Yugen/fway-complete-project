import { useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { contextMapping } from '../utils/contextMapping'

export const useTaskContext = () => {
  const location = useLocation()
  const { user } = useAuth()
  
  const getCurrentContext = () => {
    const path = location.pathname
    const userType = user?.type || 'patient'
    
    // Obter configuração de contexto para a página atual
    const pageConfig = contextMapping[path] || contextMapping['/'] // fallback para home
    const userConfig = pageConfig[userType] || pageConfig['patient'] // fallback para patient
    
    return {
      page: path,
      userType,
      primaryActions: userConfig.primaryActions || [],
      secondaryActions: userConfig.secondaryActions || [],
      contextualActions: userConfig.contextualActions || [],
      hiddenFeatures: userConfig.hiddenFeatures || [],
      availableActions: getAvailableActions(path, userType, userConfig)
    }
  }
  
  const getAvailableActions = (path, userType, config) => {
    const allActions = [
      // Ações de busca e descoberta
      {
        id: 'search-professionals',
        icon: 'Search',
        label: 'Buscar Profissionais',
        path: '/search',
        priority: 'high',
        context: ['home', 'search'],
        userTypes: ['patient']
      },
      {
        id: 'professional-map',
        icon: 'Map',
        label: 'Ver no Mapa',
        path: '/professional-map',
        priority: 'medium',
        context: ['search', 'service-request'],
        userTypes: ['patient']
      },
      {
        id: 'intelligent-matching',
        icon: 'Brain',
        label: 'Matching Inteligente',
        path: '/intelligent-matching',
        priority: 'medium',
        context: ['search', 'home'],
        userTypes: ['patient', 'professional']
      },
      
      // Ações de agendamento
      {
        id: 'schedule-appointment',
        icon: 'Calendar',
        label: 'Agendar Consulta',
        path: '/booking/1',
        priority: 'high',
        context: ['home', 'professional-profile'],
        userTypes: ['patient']
      },
      {
        id: 'my-appointments',
        icon: 'CalendarCheck',
        label: 'Minhas Consultas',
        path: '/my-bookings',
        priority: 'medium',
        context: ['home', 'dashboard'],
        userTypes: ['patient', 'professional']
      },
      
      // Ações de comunicação
      {
        id: 'send-message',
        icon: 'MessageCircle',
        label: 'Enviar Mensagem',
        path: '/chat',
        priority: 'medium',
        context: ['professional-profile', 'service-detail'],
        userTypes: ['patient', 'professional']
      },
      {
        id: 'chat-notifications',
        icon: 'Bell',
        label: 'Chat e Notificações',
        path: '/chat-notifications',
        priority: 'low',
        context: ['chat', 'dashboard'],
        userTypes: ['patient', 'professional']
      },
      
      // Ações para profissionais
      {
        id: 'service-feed',
        icon: 'Activity',
        label: 'Feed de Serviços',
        path: '/service-feed',
        priority: 'high',
        context: ['dashboard', 'home'],
        userTypes: ['professional']
      },
      {
        id: 'performance-dashboard',
        icon: 'BarChart3',
        label: 'Dashboard de Performance',
        path: '/performance-dashboard',
        priority: 'medium',
        context: ['dashboard', 'home'],
        userTypes: ['professional']
      },
      {
        id: 'profile-verification',
        icon: 'Shield',
        label: 'Verificação de Perfil',
        path: '/profile-verification',
        priority: 'high',
        context: ['dashboard', 'profile'],
        userTypes: ['professional'],
        showWhen: (user) => user?.verificationStatus !== 'verified'
      },
      {
        id: 'rewards-system',
        icon: 'Trophy',
        label: 'Sistema de Recompensas',
        path: '/rewards-system',
        priority: 'low',
        context: ['dashboard', 'profile'],
        userTypes: ['professional']
      },
      
      // Ações de serviços
      {
        id: 'service-request',
        icon: 'Plus',
        label: 'Solicitar Serviço',
        path: '/service-request',
        priority: 'medium',
        context: ['search', 'home'],
        userTypes: ['patient']
      },
      {
        id: 'rating-history',
        icon: 'Star',
        label: 'Avaliações e Histórico',
        path: '/rating-history',
        priority: 'low',
        context: ['professional-profile', 'dashboard'],
        userTypes: ['patient', 'professional']
      },
      {
        id: 'payment-pricing',
        icon: 'CreditCard',
        label: 'Pagamentos e Preços',
        path: '/payment-pricing',
        priority: 'low',
        context: ['booking', 'service-detail'],
        userTypes: ['patient', 'professional']
      },
      
      // Fway Shield
      {
        id: 'shield-dashboard',
        icon: 'Shield',
        label: 'Shield Dashboard',
        path: '/shield-dashboard',
        priority: 'medium',
        context: ['dashboard', 'insurance'],
        userTypes: ['patient', 'professional']
      },
      {
        id: 'risk-intelligence',
        icon: 'AlertTriangle',
        label: 'Risk Intelligence',
        path: '/risk-intelligence',
        priority: 'low',
        context: ['shield-dashboard'],
        userTypes: ['professional']
      },
      {
        id: 'coverage-manager',
        icon: 'FileText',
        label: 'Gerenciar Coberturas',
        path: '/coverage-manager',
        priority: 'medium',
        context: ['shield-dashboard'],
        userTypes: ['patient']
      },
      {
        id: 'claims-center',
        icon: 'FileCheck',
        label: 'Centro de Sinistros',
        path: '/claims-center',
        priority: 'medium',
        context: ['shield-dashboard'],
        userTypes: ['patient']
      },
      
      // Funcionalidades avançadas
      {
        id: 'ai-health',
        icon: 'Bot',
        label: 'IA Saúde (ASP)',
        path: '/ai-health',
        priority: 'medium',
        context: ['home', 'dashboard'],
        userTypes: ['patient']
      },
      {
        id: 'iot-monitor',
        icon: 'Radio',
        label: 'IoT Monitor',
        path: '/iot-monitor',
        priority: 'low',
        context: ['dashboard', 'ai-health'],
        userTypes: ['patient', 'professional']
      },
      {
        id: 'ar-training',
        icon: 'Glasses',
        label: 'AR Training',
        path: '/ar-training',
        priority: 'low',
        context: ['dashboard'],
        userTypes: ['professional']
      },
      {
        id: 'neurosync',
        icon: 'Brain',
        label: 'NeuroSync',
        path: '/neurosync',
        priority: 'low',
        context: ['dashboard', 'ai-health'],
        userTypes: ['patient', 'professional']
      },
      
      // Social
      {
        id: 'social-feed',
        icon: 'Users',
        label: 'Social',
        path: '/social',
        priority: 'low',
        context: ['network', 'dashboard'],
        userTypes: ['patient', 'professional']
      }
    ]
    
    // Filtrar ações baseadas no contexto atual
    const currentPageContext = getPageContext(path)
    
    return allActions.filter(action => {
      // Verificar se a ação é permitida para o tipo de usuário
      if (!action.userTypes.includes(userType)) return false
      
      // Verificar se a ação deve ser exibida baseada em condições específicas
      if (action.showWhen && !action.showWhen(user)) return false
      
      // Verificar se a ação está no contexto atual
      if (action.context && !action.context.includes(currentPageContext)) return false
      
      // Verificar se a ação está nas listas de ações permitidas
      const isInPrimary = config.primaryActions?.includes(action.id)
      const isInSecondary = config.secondaryActions?.includes(action.id)
      const isInContextual = config.contextualActions?.includes(action.id)
      const isHidden = config.hiddenFeatures?.includes(action.id)
      
      if (isHidden) return false
      
      return isInPrimary || isInSecondary || isInContextual
    })
  }
  
  const getPageContext = (path) => {
    if (path === '/') return 'home'
    if (path.startsWith('/search')) return 'search'
    if (path.startsWith('/professional/')) return 'professional-profile'
    if (path.startsWith('/booking/')) return 'booking'
    if (path.startsWith('/dashboard')) return 'dashboard'
    if (path.startsWith('/profile')) return 'profile'
    if (path.startsWith('/chat')) return 'chat'
    if (path.startsWith('/shield')) return 'shield-dashboard'
    if (path.startsWith('/service')) return 'service-detail'
    if (path.startsWith('/network')) return 'network'
    
    return 'general'
  }
  
  return getCurrentContext()
}





