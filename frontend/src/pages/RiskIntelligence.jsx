import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Target,
  Activity,
  BarChart3,
  PieChart,
  Zap,
  Eye,
  Clock,
  Calendar,
  MapPin,
  User,
  CreditCard,
  Shield,
  Sparkles,
  ArrowRight,
  Info,
  Settings,
  RefreshCw,
  Download
} from 'lucide-react';
import { riskIntelligenceSystem } from '../utils/fwayShield';

const RiskIntelligence = () => {
  const navigate = useNavigate();
  const [riskAnalysis, setRiskAnalysis] = useState({});
  const [behaviorPatterns, setBehaviorPatterns] = useState({});
  const [riskHistory, setRiskHistory] = useState([]);
  const [predictiveInsights, setPredictiveInsights] = useState([]);
  const [riskFactors, setRiskFactors] = useState({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    loadRiskIntelligenceData();
  }, []);

  const loadRiskIntelligenceData = () => {
    const userId = 'user_123';

    // Análise de risco atual
    const currentRiskAnalysis = riskIntelligenceSystem.calculateRiskScore(
      { urgency: 'normal', paymentMethod: 'credit_card' },
      { completedServices: 25, averageRating: 4.8, cancellationRate: 2, accountAge: 12 },
      { category: 'medicina', value: 300, professionalRating: 4.9 }
    );

    // Padrões comportamentais
    const behaviorAnalysis = riskIntelligenceSystem.analyzeBehaviorPattern(userId);

    // Histórico de risco (simulado)
    const mockRiskHistory = [
      { date: '2024-01-15', score: 85, level: 'low', event: 'Consulta médica agendada' },
      { date: '2024-01-10', score: 78, level: 'low', event: 'Fisioterapia concluída' },
      { date: '2024-01-05', score: 82, level: 'low', event: 'Home care solicitado' },
      { date: '2023-12-28', score: 75, level: 'medium', event: 'Cancelamento de última hora' },
      { date: '2023-12-20', score: 88, level: 'low', event: 'Avaliação 5 estrelas recebida' },
      { date: '2023-12-15', score: 80, level: 'low', event: 'Pagamento antecipado' },
      { date: '2023-12-10', score: 72, level: 'medium', event: 'Serviço de emergência' }
    ];

    // Insights preditivos
    const mockPredictiveInsights = [
      {
        id: '1',
        type: 'behavior_prediction',
        title: 'Padrão de Agendamento Detectado',
        description: 'Com base no seu histórico, você tem 85% de probabilidade de agendar um serviço médico na próxima terça-feira.',
        confidence: 85,
        impact: 'medium',
        recommendation: 'Considere agendar com antecedência para obter melhores preços.'
      },
      {
        id: '2',
        type: 'risk_prediction',
        title: 'Baixo Risco de Cancelamento',
        description: 'Sua taxa de cancelamento histórica de 2% indica alta confiabilidade.',
        confidence: 92,
        impact: 'low',
        recommendation: 'Mantenha esse padrão para continuar com descontos no seguro.'
      },
      {
        id: '3',
        type: 'optimization',
        title: 'Oportunidade de Economia',
        description: 'Alterando o horário preferencial para manhã, você pode economizar até 15% em seguros.',
        confidence: 78,
        impact: 'high',
        recommendation: 'Experimente agendar serviços entre 8h-12h.'
      }
    ];

    // Fatores de risco detalhados
    const detailedRiskFactors = {
      user: {
        score: 85,
        factors: [
          { name: 'Serviços Concluídos', value: 25, impact: 'positive', weight: 40 },
          { name: 'Avaliação Média', value: 4.8, impact: 'positive', weight: 30 },
          { name: 'Taxa de Cancelamento', value: 2, impact: 'positive', weight: 20 },
          { name: 'Idade da Conta', value: 12, impact: 'positive', weight: 10 }
        ]
      },
      service: {
        score: 78,
        factors: [
          { name: 'Categoria do Serviço', value: 'Medicina', impact: 'neutral', weight: 35 },
          { name: 'Valor do Serviço', value: 300, impact: 'neutral', weight: 25 },
          { name: 'Avaliação do Profissional', value: 4.9, impact: 'positive', weight: 25 },
          { name: 'Localização', value: 'São Paulo', impact: 'neutral', weight: 15 }
        ]
      },
      contextual: {
        score: 90,
        factors: [
          { name: 'Horário', value: 'Comercial', impact: 'positive', weight: 30 },
          { name: 'Dia da Semana', value: 'Terça-feira', impact: 'positive', weight: 25 },
          { name: 'Urgência', value: 'Normal', impact: 'positive', weight: 25 },
          { name: 'Método de Pagamento', value: 'Cartão', impact: 'positive', weight: 20 }
        ]
      }
    };

    setRiskAnalysis(currentRiskAnalysis);
    setBehaviorPatterns(behaviorAnalysis);
    setRiskHistory(mockRiskHistory);
    setPredictiveInsights(mockPredictiveInsights);
    setRiskFactors(detailedRiskFactors);
  };

  const runNewAnalysis = async () => {
    setIsAnalyzing(true);
    
    // Simular análise em tempo real
    setTimeout(() => {
      loadRiskIntelligenceData();
      setIsAnalyzing(false);
    }, 3000);
  };

  const getRiskLevelColor = (level) => {
    const colors = {
      low: 'text-green-600 bg-green-100',
      medium: 'text-yellow-600 bg-yellow-100',
      high: 'text-orange-600 bg-orange-100',
      critical: 'text-red-600 bg-red-100'
    };
    return colors[level] || colors.medium;
  };

  const getImpactColor = (impact) => {
    const colors = {
      positive: 'text-green-600',
      neutral: 'text-gray-600',
      negative: 'text-red-600'
    };
    return colors[impact] || colors.neutral;
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return 'text-green-600 bg-green-100';
    if (confidence >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="content-container">
      {/* Sidebar Esquerda - Controles de Análise */}
      <aside className="sidebar-left">
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title">
              <Brain className="w-5 h-5" />
              Análise IA
            </h3>
          </div>
          <div className="card-body">
            <div className="analysis-controls">
              <button 
                onClick={runNewAnalysis}
                disabled={isAnalyzing}
                className="analysis-btn primary"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Nova Análise
                  </>
                )}
              </button>

              <div className="analysis-options">
                <label className="analysis-option">
                  <input type="checkbox" defaultChecked />
                  <span>Análise Comportamental</span>
                </label>
                <label className="analysis-option">
                  <input type="checkbox" defaultChecked />
                  <span>Predição de Risco</span>
                </label>
                <label className="analysis-option">
                  <input type="checkbox" defaultChecked />
                  <span>Otimização de Custos</span>
                </label>
                <label className="analysis-option">
                  <input type="checkbox" />
                  <span>Análise Avançada</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title">
              <Activity className="w-5 h-5" />
              Padrões Comportamentais
            </h3>
          </div>
          <div className="card-body">
            <div className="behavior-patterns">
              <div className="pattern-item">
                <Clock className="w-4 h-4 text-blue-600" />
                <div className="pattern-info">
                  <h4>Horário Preferencial</h4>
                  <p>{behaviorPatterns.timePreference || 'Manhã'}</p>
                </div>
              </div>

              <div className="pattern-item">
                <Target className="w-4 h-4 text-green-600" />
                <div className="pattern-info">
                  <h4>Serviços Favoritos</h4>
                  <p>{behaviorPatterns.servicePreference?.[0] || 'Medicina'}</p>
                </div>
              </div>

              <div className="pattern-item">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                <div className="pattern-info">
                  <h4>Tolerância a Risco</h4>
                  <p>{Math.round((behaviorPatterns.riskTolerance || 0.2) * 100)}%</p>
                </div>
              </div>

              <div className="pattern-item">
                <Shield className="w-4 h-4 text-orange-600" />
                <div className="pattern-info">
                  <h4>Nível de Confiança</h4>
                  <p>{behaviorPatterns.trustLevel || 85}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title">
              <Settings className="w-5 h-5" />
              Configurações IA
            </h3>
          </div>
          <div className="card-body">
            <div className="ai-settings">
              <div className="setting-item">
                <label>Sensibilidade de Análise</label>
                <select className="setting-select">
                  <option>Padrão</option>
                  <option>Alta</option>
                  <option>Máxima</option>
                </select>
              </div>

              <div className="setting-item">
                <label>Frequência de Atualização</label>
                <select className="setting-select">
                  <option>Tempo Real</option>
                  <option>Diária</option>
                  <option>Semanal</option>
                </select>
              </div>

              <div className="setting-item">
                <label>Notificações de Risco</label>
                <select className="setting-select">
                  <option>Todas</option>
                  <option>Apenas Altas</option>
                  <option>Desabilitadas</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="main-content">
        <div className="page-header">
          <h1 className="page-title">
            <Brain className="w-8 h-8 text-purple-600" />
            Risk Intelligence IA
          </h1>
          <p className="page-subtitle">Análise comportamental avançada e predição de riscos</p>
        </div>

        {/* Score de Risco Principal */}
        <div className="risk-score-section">
          <div className="risk-score-card">
            <div className="score-display">
              <div className="score-circle">
                <div className="score-value">{riskAnalysis.score}</div>
                <div className="score-max">/100</div>
              </div>
              <div className="score-details">
                <h2>Risk Score Atual</h2>
                <div className={`risk-level-badge ${getRiskLevelColor(riskAnalysis.level)}`}>
                  {riskAnalysis.level === 'low' ? 'Baixo Risco' : 
                   riskAnalysis.level === 'medium' ? 'Risco Médio' : 
                   riskAnalysis.level === 'high' ? 'Alto Risco' : 'Risco Crítico'}
                </div>
                <p>Baseado em análise de IA comportamental e dados históricos</p>
              </div>
            </div>

            <div className="score-breakdown">
              <h3>Composição do Score</h3>
              <div className="breakdown-items">
                <div className="breakdown-item">
                  <User className="w-4 h-4 text-blue-600" />
                  <span>Perfil do Usuário</span>
                  <div className="breakdown-bar">
                    <div className="breakdown-fill" style={{ width: `${riskFactors.user?.score}%` }}></div>
                  </div>
                  <span className="breakdown-value">{riskFactors.user?.score}%</span>
                </div>

                <div className="breakdown-item">
                  <Target className="w-4 h-4 text-green-600" />
                  <span>Tipo de Serviço</span>
                  <div className="breakdown-bar">
                    <div className="breakdown-fill" style={{ width: `${riskFactors.service?.score}%` }}></div>
                  </div>
                  <span className="breakdown-value">{riskFactors.service?.score}%</span>
                </div>

                <div className="breakdown-item">
                  <Clock className="w-4 h-4 text-purple-600" />
                  <span>Contexto</span>
                  <div className="breakdown-bar">
                    <div className="breakdown-fill" style={{ width: `${riskFactors.contextual?.score}%` }}></div>
                  </div>
                  <span className="breakdown-value">{riskFactors.contextual?.score}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Insights Preditivos */}
        <div className="predictive-insights-section">
          <div className="section-header">
            <h2>
              <Sparkles className="w-6 h-6 text-purple-600" />
              Insights Preditivos IA
            </h2>
          </div>

          <div className="insights-grid">
            {predictiveInsights.map((insight) => (
              <PredictiveInsightCard key={insight.id} insight={insight} getConfidenceColor={getConfidenceColor} />
            ))}
          </div>
        </div>

        {/* Análise Detalhada de Fatores */}
        <div className="risk-factors-section">
          <div className="section-header">
            <h2>
              <BarChart3 className="w-6 h-6 text-blue-600" />
              Análise Detalhada de Fatores
            </h2>
          </div>

          <div className="factors-analysis">
            <div className="factor-category">
              <h3>
                <User className="w-5 h-5 text-blue-600" />
                Fatores do Usuário
              </h3>
              <div className="factors-list">
                {riskFactors.user?.factors?.map((factor, index) => (
                  <FactorItem key={index} factor={factor} getImpactColor={getImpactColor} />
                ))}
              </div>
            </div>

            <div className="factor-category">
              <h3>
                <Target className="w-5 h-5 text-green-600" />
                Fatores do Serviço
              </h3>
              <div className="factors-list">
                {riskFactors.service?.factors?.map((factor, index) => (
                  <FactorItem key={index} factor={factor} getImpactColor={getImpactColor} />
                ))}
              </div>
            </div>

            <div className="factor-category">
              <h3>
                <Clock className="w-5 h-5 text-purple-600" />
                Fatores Contextuais
              </h3>
              <div className="factors-list">
                {riskFactors.contextual?.factors?.map((factor, index) => (
                  <FactorItem key={index} factor={factor} getImpactColor={getImpactColor} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Histórico de Risco */}
        <div className="risk-history-section">
          <div className="section-header">
            <h2>
              <TrendingUp className="w-6 h-6 text-green-600" />
              Evolução do Risk Score
            </h2>
            <button className="btn-secondary">
              <Download className="w-4 h-4" />
              Exportar Dados
            </button>
          </div>

          <div className="risk-history-chart">
            <div className="chart-placeholder">
              <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3>Gráfico de Evolução do Risco</h3>
              <p>Visualização da evolução do seu risk score ao longo do tempo</p>
            </div>
          </div>

          <div className="risk-history-list">
            {riskHistory.slice(0, 5).map((entry, index) => (
              <RiskHistoryItem key={index} entry={entry} getRiskLevelColor={getRiskLevelColor} />
            ))}
          </div>
        </div>
      </main>

      {/* Sidebar Direita - Recomendações e Alertas */}
      <aside className="sidebar-right">
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title">
              <AlertTriangle className="w-5 h-5" />
              Recomendações IA
            </h3>
          </div>
          <div className="card-body">
            <div className="ai-recommendations">
              {riskAnalysis.recommendations?.map((rec, index) => (
                <div key={index} className="recommendation-item">
                  <Info className="w-4 h-4 text-blue-600" />
                  <div className="recommendation-content">
                    <h4>{rec.type === 'coverage_increase' ? 'Cobertura' : 
                         rec.type === 'behavior_improvement' ? 'Comportamento' : 'Verificação'}</h4>
                    <p>{rec.message}</p>
                    <button className="recommendation-action">
                      {rec.action === 'upgrade_coverage' ? 'Aumentar Cobertura' :
                       rec.action === 'improve_completion_rate' ? 'Ver Dicas' : 'Verificar Agora'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title">
              <Eye className="w-5 h-5" />
              Monitoramento Ativo
            </h3>
          </div>
          <div className="card-body">
            <div className="monitoring-status">
              <div className="monitor-item">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div className="monitor-info">
                  <h4>Análise Comportamental</h4>
                  <p>Ativa - Última atualização: agora</p>
                </div>
              </div>

              <div className="monitor-item">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div className="monitor-info">
                  <h4>Detecção de Anomalias</h4>
                  <p>Ativa - Nenhuma anomalia detectada</p>
                </div>
              </div>

              <div className="monitor-item">
                <Clock className="w-5 h-5 text-yellow-600" />
                <div className="monitor-info">
                  <h4>Predição de Risco</h4>
                  <p>Processando - Próxima em 2h</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title">
              <PieChart className="w-5 h-5" />
              Estatísticas IA
            </h3>
          </div>
          <div className="card-body">
            <div className="ai-stats">
              <div className="stat-item">
                <div className="stat-label">Precisão do Modelo</div>
                <div className="stat-value">94.2%</div>
              </div>

              <div className="stat-item">
                <div className="stat-label">Predições Corretas</div>
                <div className="stat-value">87/92</div>
              </div>

              <div className="stat-item">
                <div className="stat-label">Tempo de Análise</div>
                <div className="stat-value">0.3s</div>
              </div>

              <div className="stat-item">
                <div className="stat-label">Dados Processados</div>
                <div className="stat-value">1.2M</div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

// Componente Card de Insight Preditivo
const PredictiveInsightCard = ({ insight, getConfidenceColor }) => {
  return (
    <div className="insight-card">
      <div className="insight-header">
        <h4>{insight.title}</h4>
        <div className={`confidence-badge ${getConfidenceColor(insight.confidence)}`}>
          {insight.confidence}% confiança
        </div>
      </div>
      
      <div className="insight-content">
        <p>{insight.description}</p>
        
        <div className="insight-recommendation">
          <h5>Recomendação:</h5>
          <p>{insight.recommendation}</p>
        </div>
        
        <div className="insight-impact">
          <span className={`impact-badge ${insight.impact}`}>
            Impacto: {insight.impact === 'high' ? 'Alto' : 
                     insight.impact === 'medium' ? 'Médio' : 'Baixo'}
          </span>
        </div>
      </div>
      
      <div className="insight-actions">
        <button className="btn-primary btn-small">
          <ArrowRight className="w-4 h-4" />
          Aplicar
        </button>
      </div>
    </div>
  );
};

// Componente Item de Fator
const FactorItem = ({ factor, getImpactColor }) => {
  return (
    <div className="factor-item">
      <div className="factor-info">
        <h4>{factor.name}</h4>
        <span className="factor-value">{factor.value}</span>
      </div>
      <div className="factor-metrics">
        <div className="factor-weight">
          Peso: {factor.weight}%
        </div>
        <div className={`factor-impact ${getImpactColor(factor.impact)}`}>
          {factor.impact === 'positive' ? '↑ Positivo' : 
           factor.impact === 'negative' ? '↓ Negativo' : '→ Neutro'}
        </div>
      </div>
    </div>
  );
};

// Componente Item do Histórico de Risco
const RiskHistoryItem = ({ entry, getRiskLevelColor }) => {
  return (
    <div className="history-item">
      <div className="history-date">
        <Calendar className="w-4 h-4 text-gray-500" />
        <span>{new Date(entry.date).toLocaleDateString()}</span>
      </div>
      <div className="history-score">
        <div className="score-value">{entry.score}</div>
        <div className={`score-level ${getRiskLevelColor(entry.level)}`}>
          {entry.level === 'low' ? 'Baixo' : 
           entry.level === 'medium' ? 'Médio' : 'Alto'}
        </div>
      </div>
      <div className="history-event">
        <p>{entry.event}</p>
      </div>
    </div>
  );
};

export default RiskIntelligence;

