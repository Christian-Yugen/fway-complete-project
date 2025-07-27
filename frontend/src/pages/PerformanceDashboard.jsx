import React, { useState, useEffect } from 'react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area,
  ResponsiveContainer
} from 'recharts'
import { 
  TrendingUp, 
  Clock, 
  Star, 
  Users, 
  DollarSign,
  Calendar,
  Award,
  Target,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Filter,
  Download,
  RefreshCw,
  Eye,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

const PerformanceDashboard = () => {
  const [timeRange, setTimeRange] = useState('30d')
  const [loading, setLoading] = useState(false)
  const [dashboardData, setDashboardData] = useState({})

  // Dados mock para demonstração
  const mockData = {
    overview: {
      totalServices: 156,
      avgDeliveryTime: 2.4,
      clientSatisfaction: 4.8,
      totalEarnings: 18750,
      growthRate: 15.3
    },
    servicesOverTime: [
      { month: 'Jan', services: 12, earnings: 1800, satisfaction: 4.6 },
      { month: 'Fev', services: 18, earnings: 2700, satisfaction: 4.7 },
      { month: 'Mar', services: 25, earnings: 3750, satisfaction: 4.8 },
      { month: 'Abr', services: 22, earnings: 3300, satisfaction: 4.7 },
      { month: 'Mai', services: 28, earnings: 4200, satisfaction: 4.9 },
      { month: 'Jun', services: 32, earnings: 4800, satisfaction: 4.8 }
    ],
    servicesByCategory: [
      { name: 'Cardiologia', value: 45, color: '#ef4444' },
      { name: 'Pediatria', value: 32, color: '#f97316' },
      { name: 'Fisioterapia', value: 28, color: '#eab308' },
      { name: 'Dermatologia', value: 25, color: '#22c55e' },
      { name: 'Outros', value: 26, color: '#3b82f6' }
    ],
    deliveryTimes: [
      { day: 'Seg', avgTime: 2.1, target: 2.5 },
      { day: 'Ter', avgTime: 2.3, target: 2.5 },
      { day: 'Qua', avgTime: 2.0, target: 2.5 },
      { day: 'Qui', avgTime: 2.4, target: 2.5 },
      { day: 'Sex', avgTime: 2.6, target: 2.5 },
      { day: 'Sáb', avgTime: 2.2, target: 2.5 },
      { day: 'Dom', avgTime: 1.9, target: 2.5 }
    ],
    satisfactionTrend: [
      { week: 'Sem 1', satisfaction: 4.5, reviews: 12 },
      { week: 'Sem 2', satisfaction: 4.6, reviews: 18 },
      { week: 'Sem 3', satisfaction: 4.8, reviews: 22 },
      { week: 'Sem 4', satisfaction: 4.7, reviews: 25 },
      { week: 'Sem 5', satisfaction: 4.9, reviews: 28 },
      { week: 'Sem 6', satisfaction: 4.8, reviews: 30 }
    ],
    topMetrics: [
      { 
        title: 'Tempo Médio de Entrega',
        value: '2.4h',
        change: -8.2,
        trend: 'down',
        icon: Clock,
        color: 'blue'
      },
      { 
        title: 'Satisfação do Cliente',
        value: '4.8/5',
        change: 5.1,
        trend: 'up',
        icon: Star,
        color: 'yellow'
      },
      { 
        title: 'Serviços Finalizados',
        value: '156',
        change: 23.5,
        trend: 'up',
        icon: CheckCircle,
        color: 'green'
      },
      { 
        title: 'Taxa de Retenção',
        value: '92%',
        change: 12.3,
        trend: 'up',
        icon: Users,
        color: 'purple'
      }
    ]
  }

  useEffect(() => {
    loadDashboardData()
  }, [timeRange])

  const loadDashboardData = async () => {
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setDashboardData(mockData)
    setLoading(false)
  }

  const getMetricColor = (color) => {
    const colors = {
      blue: 'text-blue-600 bg-blue-50',
      yellow: 'text-yellow-600 bg-yellow-50',
      green: 'text-green-600 bg-green-50',
      purple: 'text-purple-600 bg-purple-50',
      red: 'text-red-600 bg-red-50'
    }
    return colors[color] || colors.blue
  }

  const getTrendColor = (trend) => {
    return trend === 'up' ? 'text-green-600' : 'text-red-600'
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="content-container">
      {/* Sidebar Esquerda - Filtros */}
      <aside className="sidebar-left">
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <Filter size={20} className="text-blue-600" />
              Filtros
            </h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Período</label>
                <select 
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="7d">Últimos 7 dias</option>
                  <option value="30d">Últimos 30 dias</option>
                  <option value="90d">Últimos 3 meses</option>
                  <option value="1y">Último ano</option>
                </select>
              </div>

              <button 
                onClick={loadDashboardData}
                className="w-full btn-professional btn-primary flex items-center justify-center gap-2"
                disabled={loading}
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                Atualizar Dados
              </button>

              <button className="w-full btn-professional btn-outline flex items-center justify-center gap-2">
                <Download size={16} />
                Exportar Relatório
              </button>
            </div>
          </div>
        </div>

        {/* Metas */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <Target size={20} className="text-green-600" />
              Metas do Mês
            </h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Serviços</span>
                  <span>32/40</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '80%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Satisfação</span>
                  <span>4.8/5.0</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '96%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Tempo Médio</span>
                  <span>2.4h/2.0h</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: '120%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="content-main">
        <div className="card-professional">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="card-title flex items-center gap-2">
                  <BarChart3 size={24} className="text-blue-600" />
                  Dashboard de Desempenho
                </h1>
                <p className="card-subtitle">
                  Acompanhe suas métricas e performance profissional
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Activity size={20} className="text-green-500" />
                <span className="text-sm font-medium">Atualizado há 5 min</span>
              </div>
            </div>
          </div>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {dashboardData.topMetrics?.map((metric, index) => (
            <div key={index} className="card-professional">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-full ${getMetricColor(metric.color)}`}>
                    <metric.icon size={24} />
                  </div>
                  <div className={`text-sm font-medium ${getTrendColor(metric.trend)}`}>
                    {metric.change > 0 ? '+' : ''}{metric.change}%
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <div className="text-sm text-gray-600">{metric.title}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Gráficos Principais */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Serviços ao Longo do Tempo */}
          <div className="card-professional">
            <div className="card-header">
              <h3 className="card-title flex items-center gap-2">
                <LineChartIcon size={20} className="text-blue-600" />
                Serviços e Ganhos
              </h3>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dashboardData.servicesOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="services"
                    stackId="1"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.3}
                    name="Serviços"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="earnings"
                    stroke="#10b981"
                    strokeWidth={3}
                    name="Ganhos (R$)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Distribuição por Categoria */}
          <div className="card-professional">
            <div className="card-header">
              <h3 className="card-title flex items-center gap-2">
                <PieChartIcon size={20} className="text-purple-600" />
                Serviços por Categoria
              </h3>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dashboardData.servicesByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {dashboardData.servicesByCategory?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Gráficos Secundários */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tempo de Entrega */}
          <div className="card-professional">
            <div className="card-header">
              <h3 className="card-title flex items-center gap-2">
                <Clock size={20} className="text-orange-600" />
                Tempo de Entrega por Dia
              </h3>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={dashboardData.deliveryTimes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="avgTime" fill="#f97316" name="Tempo Real (h)" />
                  <Bar dataKey="target" fill="#e5e7eb" name="Meta (h)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tendência de Satisfação */}
          <div className="card-professional">
            <div className="card-header">
              <h3 className="card-title flex items-center gap-2">
                <Star size={20} className="text-yellow-600" />
                Tendência de Satisfação
              </h3>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={dashboardData.satisfactionTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis domain={[4.0, 5.0]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="satisfaction"
                    stroke="#eab308"
                    strokeWidth={3}
                    dot={{ fill: '#eab308', strokeWidth: 2, r: 6 }}
                    name="Satisfação"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>

      {/* Sidebar Direita - Insights */}
      <aside className="sidebar-right">
        {/* Insights Automáticos */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <Eye size={20} className="text-green-600" />
              Insights Automáticos
            </h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={16} className="text-green-600" />
                  <span className="font-medium text-green-800">Tendência Positiva</span>
                </div>
                <p className="text-sm text-green-700">
                  Sua satisfação do cliente aumentou 15% este mês
                </p>
              </div>

              <div className="p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle size={16} className="text-yellow-600" />
                  <span className="font-medium text-yellow-800">Atenção</span>
                </div>
                <p className="text-sm text-yellow-700">
                  Tempo de entrega nas sextas está acima da meta
                </p>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Target size={16} className="text-blue-600" />
                  <span className="font-medium text-blue-800">Oportunidade</span>
                </div>
                <p className="text-sm text-blue-700">
                  Cardiologia é sua especialidade mais demandada
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Comparação com Mercado */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title">Comparação com Mercado</h3>
          </div>
          <div className="card-body">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Sua satisfação</span>
                <span className="font-semibold text-green-600">4.8/5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Média do mercado</span>
                <span className="font-semibold">4.2/5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Seu tempo médio</span>
                <span className="font-semibold text-yellow-600">2.4h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Média do mercado</span>
                <span className="font-semibold">3.1h</span>
              </div>
            </div>
          </div>
        </div>

        {/* Próximas Ações */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title">Próximas Ações</h3>
          </div>
          <div className="card-body">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-500" />
                <span className="text-sm">Otimizar agenda das sextas</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-500" />
                <span className="text-sm">Focar em cardiologia</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-500" />
                <span className="text-sm">Manter qualidade do atendimento</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}

export default PerformanceDashboard

