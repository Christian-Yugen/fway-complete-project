import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  CreditCard,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  Shield,
  CheckCircle,
  AlertCircle,
  Wallet,
  Receipt,
  PieChart,
  BarChart3,
  Target,
  Settings,
  Plus,
  Minus,
  ArrowUpRight,
  ArrowDownLeft,
  Filter,
  Search,
  Download,
  Eye,
  Edit
} from 'lucide-react';
import { dynamicPricing, paymentSystem } from '../utils/uberFeatures';

const PaymentAndPricing = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [pricingData, setPricingData] = useState({});
  const [walletBalance, setWalletBalance] = useState(0);
  const [earnings, setEarnings] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Carregar dados financeiros
  useEffect(() => {
    loadFinancialData();
  }, [selectedPeriod]);

  const loadFinancialData = () => {
    // Simular dados financeiros
    const mockPaymentHistory = [
      {
        id: '1',
        type: 'received',
        amount: 250,
        description: 'Consulta Cardiológica - Dr. João Silva',
        date: '2024-01-15',
        status: 'completed',
        method: 'pix',
        client: 'Maria Santos'
      },
      {
        id: '2',
        type: 'paid',
        amount: 180,
        description: 'Fisioterapia Domiciliar - Ana Costa',
        date: '2024-01-12',
        status: 'completed',
        method: 'credit_card',
        professional: 'Ana Costa'
      },
      {
        id: '3',
        type: 'received',
        amount: 320,
        description: 'Enfermagem Home Care - Enf. Pedro Lima',
        date: '2024-01-10',
        status: 'pending',
        method: 'bank_transfer',
        client: 'João Oliveira'
      }
    ];

    const mockEarnings = {
      thisMonth: 1250,
      lastMonth: 980,
      thisYear: 12500,
      totalEarnings: 25000,
      pendingPayments: 450,
      averagePerService: 225
    };

    const mockPricingData = {
      baseRates: {
        consultation: 200,
        homecare: 150,
        physiotherapy: 120,
        nursing: 180
      },
      dynamicFactors: {
        urgency: 1.3,
        demand: 1.1,
        timeOfDay: 1.0,
        dayOfWeek: 1.0
      }
    };

    setPaymentHistory(mockPaymentHistory);
    setEarnings(mockEarnings);
    setPricingData(mockPricingData);
    setWalletBalance(2450.75);
  };

  const filteredPayments = paymentHistory.filter(payment => {
    if (filterType !== 'all' && payment.type !== filterType) return false;
    if (searchQuery && !payment.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getPaymentIcon = (type) => {
    return type === 'received' ? 
      <ArrowUpRight className="w-4 h-4 text-green-600" /> : 
      <ArrowDownLeft className="w-4 h-4 text-red-600" />;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getMethodName = (method) => {
    const methods = {
      'pix': 'PIX',
      'credit_card': 'Cartão de Crédito',
      'bank_transfer': 'Transferência',
      'wallet': 'Carteira Fway'
    };
    return methods[method] || method;
  };

  return (
    <div className="content-container">
      {/* Sidebar Esquerda - Carteira e Resumo */}
      <aside className="sidebar-left">
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title">
              <Wallet className="w-5 h-5" />
              Carteira Fway
            </h3>
          </div>
          <div className="card-body">
            <div className="wallet-balance">
              <div className="balance-amount">
                <span className="currency">R$</span>
                <span className="amount">{walletBalance.toFixed(2)}</span>
              </div>
              <p className="balance-label">Saldo Disponível</p>
            </div>

            <div className="wallet-actions">
              <button className="wallet-action-btn primary">
                <Plus className="w-4 h-4" />
                Adicionar
              </button>
              <button className="wallet-action-btn secondary">
                <Minus className="w-4 h-4" />
                Sacar
              </button>
            </div>
          </div>
        </div>

        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title">
              <BarChart3 className="w-5 h-5" />
              Resumo Financeiro
            </h3>
          </div>
          <div className="card-body">
            <div className="financial-summary">
              <div className="summary-item">
                <div className="summary-icon">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div className="summary-info">
                  <h4>R$ {earnings.thisMonth}</h4>
                  <p>Este Mês</p>
                </div>
              </div>

              <div className="summary-item">
                <div className="summary-icon">
                  <Target className="w-5 h-5 text-blue-600" />
                </div>
                <div className="summary-info">
                  <h4>R$ {earnings.averagePerService}</h4>
                  <p>Média por Serviço</p>
                </div>
              </div>

              <div className="summary-item">
                <div className="summary-icon">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="summary-info">
                  <h4>R$ {earnings.pendingPayments}</h4>
                  <p>Pendente</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title">
              <Filter className="w-5 h-5" />
              Filtros
            </h3>
          </div>
          <div className="card-body">
            <div className="filter-section">
              <label className="filter-label">Buscar</label>
              <div className="search-container">
                <Search className="search-icon w-4 h-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar transações..."
                  className="search-input"
                />
              </div>
            </div>

            <div className="filter-section">
              <label className="filter-label">Tipo</label>
              <div className="filter-buttons">
                {[
                  { id: 'all', label: 'Todas' },
                  { id: 'received', label: 'Recebidas' },
                  { id: 'paid', label: 'Pagas' }
                ].map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setFilterType(filter.id)}
                    className={`filter-button ${filterType === filter.id ? 'active' : ''}`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-section">
              <label className="filter-label">Período</label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="filter-select"
              >
                <option value="week">Esta Semana</option>
                <option value="month">Este Mês</option>
                <option value="quarter">Este Trimestre</option>
                <option value="year">Este Ano</option>
              </select>
            </div>
          </div>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="main-content">
        <div className="page-header">
          <h1 className="page-title">Pagamentos e Preços</h1>
          <p className="page-subtitle">Gerencie seus pagamentos e configure preços dinâmicos</p>
        </div>

        {/* Tabs */}
        <div className="tabs-container">
          <div className="tabs-header">
            <button
              onClick={() => setActiveTab('overview')}
              className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            >
              <PieChart className="w-4 h-4" />
              Visão Geral
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`tab-button ${activeTab === 'payments' ? 'active' : ''}`}
            >
              <Receipt className="w-4 h-4" />
              Histórico
            </button>
            <button
              onClick={() => setActiveTab('pricing')}
              className={`tab-button ${activeTab === 'pricing' ? 'active' : ''}`}
            >
              <DollarSign className="w-4 h-4" />
              Preços
            </button>
          </div>

          <div className="tabs-content">
            {activeTab === 'overview' && (
              <OverviewTab earnings={earnings} />
            )}

            {activeTab === 'payments' && (
              <PaymentsTab 
                payments={filteredPayments}
                getPaymentIcon={getPaymentIcon}
                getStatusIcon={getStatusIcon}
                getMethodName={getMethodName}
              />
            )}

            {activeTab === 'pricing' && (
              <PricingTab pricingData={pricingData} />
            )}
          </div>
        </div>
      </main>

      {/* Sidebar Direita - Configurações e Métodos */}
      <aside className="sidebar-right">
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title">
              <CreditCard className="w-5 h-5" />
              Métodos de Pagamento
            </h3>
          </div>
          <div className="card-body">
            <div className="payment-methods">
              <div className="payment-method">
                <div className="method-icon">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                </div>
                <div className="method-info">
                  <h4>Cartão •••• 1234</h4>
                  <p>Visa - Principal</p>
                </div>
                <button className="method-action">
                  <Edit className="w-4 h-4" />
                </button>
              </div>

              <div className="payment-method">
                <div className="method-icon">
                  <Wallet className="w-5 h-5 text-green-600" />
                </div>
                <div className="method-info">
                  <h4>PIX</h4>
                  <p>Chave: email@exemplo.com</p>
                </div>
                <button className="method-action">
                  <Edit className="w-4 h-4" />
                </button>
              </div>

              <button className="add-method-btn">
                <Plus className="w-4 h-4" />
                Adicionar Método
              </button>
            </div>
          </div>
        </div>

        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title">
              <Shield className="w-5 h-5" />
              Segurança
            </h3>
          </div>
          <div className="card-body">
            <div className="security-features">
              <div className="security-item">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>Transações criptografadas</span>
              </div>
              <div className="security-item">
                <Shield className="w-5 h-5 text-blue-600" />
                <span>Proteção contra fraude</span>
              </div>
              <div className="security-item">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>Verificação em duas etapas</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title">
              <Settings className="w-5 h-5" />
              Ações Rápidas
            </h3>
          </div>
          <div className="card-body">
            <div className="quick-actions">
              <button className="quick-action-btn">
                <Download className="w-4 h-4" />
                Exportar Relatório
              </button>
              <button className="quick-action-btn">
                <Receipt className="w-4 h-4" />
                Gerar Comprovante
              </button>
              <button className="quick-action-btn">
                <Settings className="w-4 h-4" />
                Configurações
              </button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

// Componente Tab Visão Geral
const OverviewTab = ({ earnings }) => {
  const growthRate = ((earnings.thisMonth - earnings.lastMonth) / earnings.lastMonth * 100).toFixed(1);
  const isPositiveGrowth = growthRate > 0;

  return (
    <div className="overview-content">
      <div className="earnings-cards">
        <div className="earnings-card primary">
          <div className="earnings-header">
            <h3>Ganhos Este Mês</h3>
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <div className="earnings-amount">
            R$ {earnings.thisMonth?.toLocaleString()}
          </div>
          <div className={`earnings-growth ${isPositiveGrowth ? 'positive' : 'negative'}`}>
            {isPositiveGrowth ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {Math.abs(growthRate)}% vs mês anterior
          </div>
        </div>

        <div className="earnings-card">
          <div className="earnings-header">
            <h3>Total Acumulado</h3>
            <Target className="w-6 h-6 text-blue-600" />
          </div>
          <div className="earnings-amount">
            R$ {earnings.totalEarnings?.toLocaleString()}
          </div>
          <div className="earnings-info">
            Desde o início na plataforma
          </div>
        </div>

        <div className="earnings-card">
          <div className="earnings-header">
            <h3>Pagamentos Pendentes</h3>
            <Clock className="w-6 h-6 text-yellow-600" />
          </div>
          <div className="earnings-amount">
            R$ {earnings.pendingPayments?.toLocaleString()}
          </div>
          <div className="earnings-info">
            Processamento em até 2 dias úteis
          </div>
        </div>
      </div>

      <div className="chart-placeholder">
        <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3>Gráfico de Ganhos</h3>
        <p>Visualização dos ganhos ao longo do tempo</p>
      </div>
    </div>
  );
};

// Componente Tab Histórico de Pagamentos
const PaymentsTab = ({ payments, getPaymentIcon, getStatusIcon, getMethodName }) => {
  return (
    <div className="payments-content">
      {payments.length === 0 ? (
        <div className="empty-state">
          <Receipt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3>Nenhuma transação encontrada</h3>
          <p>Tente ajustar os filtros de busca</p>
        </div>
      ) : (
        <div className="payments-list">
          {payments.map((payment) => (
            <PaymentCard 
              key={payment.id} 
              payment={payment}
              getPaymentIcon={getPaymentIcon}
              getStatusIcon={getStatusIcon}
              getMethodName={getMethodName}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Componente Tab Preços
const PricingTab = ({ pricingData }) => {
  return (
    <div className="pricing-content">
      <div className="pricing-section">
        <h3>Preços Base por Serviço</h3>
        <div className="pricing-grid">
          {Object.entries(pricingData.baseRates || {}).map(([service, rate]) => (
            <div key={service} className="pricing-card">
              <h4>{service === 'consultation' ? 'Consulta' : 
                   service === 'homecare' ? 'Home Care' :
                   service === 'physiotherapy' ? 'Fisioterapia' : 'Enfermagem'}</h4>
              <div className="price-value">R$ {rate}</div>
              <button className="price-edit-btn">
                <Edit className="w-4 h-4" />
                Editar
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="pricing-section">
        <h3>Fatores de Preço Dinâmico</h3>
        <div className="factors-list">
          {Object.entries(pricingData.dynamicFactors || {}).map(([factor, multiplier]) => (
            <div key={factor} className="factor-item">
              <div className="factor-info">
                <h4>{factor === 'urgency' ? 'Urgência' :
                     factor === 'demand' ? 'Demanda' :
                     factor === 'timeOfDay' ? 'Horário' : 'Dia da Semana'}</h4>
                <p>Multiplicador atual: {multiplier}x</p>
              </div>
              <div className="factor-value">
                +{Math.round((multiplier - 1) * 100)}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Componente Card de Pagamento
const PaymentCard = ({ payment, getPaymentIcon, getStatusIcon, getMethodName }) => {
  return (
    <div className="payment-card">
      <div className="payment-header">
        <div className="payment-type">
          {getPaymentIcon(payment.type)}
          <span className={`payment-type-text ${payment.type}`}>
            {payment.type === 'received' ? 'Recebido' : 'Pago'}
          </span>
        </div>
        <div className="payment-amount">
          <span className={`amount ${payment.type}`}>
            {payment.type === 'received' ? '+' : '-'}R$ {payment.amount}
          </span>
        </div>
      </div>

      <div className="payment-details">
        <h4>{payment.description}</h4>
        <p>{payment.client || payment.professional}</p>
      </div>

      <div className="payment-meta">
        <div className="payment-date">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span>{new Date(payment.date).toLocaleDateString()}</span>
        </div>
        <div className="payment-method">
          <CreditCard className="w-4 h-4 text-gray-500" />
          <span>{getMethodName(payment.method)}</span>
        </div>
        <div className="payment-status">
          {getStatusIcon(payment.status)}
          <span className={`status-text ${payment.status}`}>
            {payment.status === 'completed' ? 'Concluído' :
             payment.status === 'pending' ? 'Pendente' : 'Falhou'}
          </span>
        </div>
      </div>

      <div className="payment-actions">
        <button className="btn-secondary btn-small">
          <Eye className="w-4 h-4" />
          Ver Detalhes
        </button>
        <button className="btn-secondary btn-small">
          <Download className="w-4 h-4" />
          Comprovante
        </button>
      </div>
    </div>
  );
};

export default PaymentAndPricing;

