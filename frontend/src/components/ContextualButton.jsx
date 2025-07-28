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

export const ContextualButton = ({ 
  actionId, 
  className = '', 
  children,
  fallback = null,
  variant = 'default' // 'default', 'primary', 'secondary', 'outline'
}) => {
  const context = useTaskContext()
  const action = context.availableActions.find(a => a.id === actionId)
  
  if (!action) return fallback
  
  const getIcon = (iconName) => {
    const IconComponent = iconMap[iconName]
    return IconComponent ? <IconComponent size={18} /> : null
  }
  
  const getButtonClass = () => {
    const baseClass = 'btn-professional'
    const variantClass = variant === 'default' 
      ? (action.priority === 'high' ? 'btn-primary' : 'btn-secondary')
      : `btn-${variant}`
    
    return `${baseClass} ${variantClass} ${className}`
  }
  
  return (
    <Link 
      to={action.path} 
      className={getButtonClass()}
      title={action.label}
    >
      {action.icon && (
        <span className="btn-icon">
          {getIcon(action.icon)}
        </span>
      )}
      <span>
        {children || action.label}
      </span>
    </Link>
  )
}

export default ContextualButton

