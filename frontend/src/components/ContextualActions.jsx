import React from 'react'
import { Link } from 'react-router-dom'
import { useTaskContext } from '../hooks/useTaskContext'
import { 
  Search, Map, Brain, Calendar, CalendarCheck, MessageCircle, Bell,
  Activity, BarChart3, Shield, Trophy, Plus, Star, CreditCard,
  AlertTriangle, FileText, FileCheck, Bot, Radio, Glasses, Users
} from 'lucide-react'

// Mapeamento de ícones
const iconMap = {
  Search, Map, Brain, Calendar, CalendarCheck, MessageCircle, Bell,
  Activity, BarChart3, Shield, Trophy, Plus, Star, CreditCard,
  AlertTriangle, FileText, FileCheck, Bot, Radio, Glasses, Users
}

export const ContextualActions = ({ 
  position = 'inline', 
  maxActions = null,
  priority = 'all', // 'high', 'medium', 'low', 'all'
  className = ''
}) => {
  const context = useTaskContext()
  
  const getIcon = (iconName) => {
    const IconComponent = iconMap[iconName]
    return IconComponent ? <IconComponent size={18} /> : <Activity size={18} />
  }
  
  const filterActionsByPriority = (actions) => {
    if (priority === 'all') return actions
    return actions.filter(action => action.priority === priority)
  }
  
  const sortActionsByPriority = (actions) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    return actions.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority])
  }
  
  const renderActions = () => {
    let actions = context.availableActions || []
    
    // Filtrar por prioridade se especificado
    actions = filterActionsByPriority(actions)
    
    // Ordenar por prioridade
    actions = sortActionsByPriority(actions)
    
    // Limitar número de ações se especificado
    if (maxActions) {
      actions = actions.slice(0, maxActions)
    }
    
    return actions.map(action => (
      <Link
        key={action.id}
        to={action.path}
        className={`contextual-action contextual-action--${action.priority} ${
          position === 'header' ? 'header-nav-item' : 'btn-professional btn-outline'
        }`}
        title={action.label}
      >
        <span className={position === 'header' ? 'header-nav-icon' : 'btn-icon'}>
          {getIcon(action.icon)}
        </span>
        <span className={position === 'header' ? 'header-nav-text' : ''}>
          {action.label}
        </span>
      </Link>
    ))
  }
  
  const actions = context.availableActions || []
  const filteredActions = filterActionsByPriority(actions)
  
  if (filteredActions.length === 0) return null
  
  return (
    <div className={`contextual-actions contextual-actions--${position} ${className}`}>
      {renderActions()}
    </div>
  )
}

export default ContextualActions

