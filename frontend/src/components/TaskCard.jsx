import React from 'react'
import { Link } from 'react-router-dom'
import { 
  Search, Map, Brain, Calendar, CalendarCheck, MessageCircle, Bell,
  Activity, BarChart3, Shield, Trophy, Plus, Star, CreditCard,
  AlertTriangle, FileText, FileCheck, Bot, Radio, Glasses, Users,
  ArrowRight
} from 'lucide-react'

// Mapeamento de ícones
const iconMap = {
  Search, Map, Brain, Calendar, CalendarCheck, MessageCircle, Bell,
  Activity, BarChart3, Shield, Trophy, Plus, Star, CreditCard,
  AlertTriangle, FileText, FileCheck, Bot, Radio, Glasses, Users
}

export const TaskCard = ({ 
  title, 
  description, 
  icon, 
  primaryAction, 
  secondaryActions = [],
  priority = 'normal',
  context,
  className = ''
}) => {
  const getIcon = (iconName) => {
    const IconComponent = iconMap[iconName]
    return IconComponent ? <IconComponent size={24} /> : <Activity size={24} />
  }
  
  return (
    <div className={`task-card task-card--${priority} ${className}`}>
      <div className="task-card__header">
        <div className="task-card__icon">
          {typeof icon === 'string' ? getIcon(icon) : icon}
        </div>
        <div className="task-card__content">
          <h3 className="task-card__title">{title}</h3>
          <p className="task-card__description">{description}</p>
        </div>
      </div>
      
      <div className="task-card__actions">
        {primaryAction && (
          <Link 
            to={primaryAction.path} 
            className="btn-professional btn-primary flex items-center gap-2"
          >
            {primaryAction.icon && getIcon(primaryAction.icon)}
            {primaryAction.label}
            <ArrowRight size={16} />
          </Link>
        )}
        
        {secondaryActions.length > 0 && (
          <div className="task-card__secondary-actions">
            {secondaryActions.map(action => (
              <Link 
                key={action.id}
                to={action.path} 
                className="btn-professional btn-secondary btn-sm flex items-center gap-1"
              >
                {action.icon && getIcon(action.icon)}
                {action.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default TaskCard

