import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { ToastProvider } from '../contexts/ToastContext';

// Importar componentes desenvolvidos
import {
  AdvancedDynamicPricingCalculator,
  MicroInsuranceActivator,
  MedicalChatInterface,
  AdvancedTriageWizard
} from '../components/fway-frontend-components-complete';

// Importar componentes existentes (assumindo que existem)
import Layout from '../components/Layout';
import Dashboard from '../pages/Dashboard';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Profile from '../pages/Profile';
import ShieldDashboard from '../pages/ShieldDashboard';
import AIHealth from '../pages/AIHealth';
import IntelligentTriage from '../pages/IntelligentTriage';
import ProfessionalSearch from '../pages/ProfessionalSearch';
import Appointments from '../pages/Appointments';
import MedicalHistory from '../pages/MedicalHistory';
import Settings from '../pages/Settings';

// Componente de rota protegida
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Componente de rota pública (apenas para não autenticados)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// ====================================
// PÁGINAS INTEGRADAS COM NOVOS COMPONENTES
// ====================================

// Página do Shield com Precificação Dinâmica
const EnhancedShieldPage = () => {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          FWAY Shield - Microsseguros Inteligentes
        </h1>
        <p className="text-lg text-gray-600">
          Proteja-se com cobertura dinâmica baseada em IA
        </p>
      </div>
      
      {/* Calculadora de Precificação */}
      <section>
        <AdvancedDynamicPricingCalculator />
      </section>
      
      {/* Dashboard Shield Existente */}
      <section>
        <ShieldDashboard />
      </section>
    </div>
  );
};

// Página do Brain com Chat e Triagem
const EnhancedBrainPage = () => {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          FWAY Brain - IA Médica Avançada
        </h1>
        <p className="text-lg text-gray-600">
          Assistente médico inteligente para suas necessidades de saúde
        </p>
      </div>
      
      {/* Tabs para diferentes funcionalidades */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
              Chat Médico
            </button>
            <button className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
              Triagem Avançada
            </button>
            <button className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
              IA Health
            </button>
          </nav>
        </div>
        
        <div className="p-6">
          {/* Chat Médico */}
          <section className="mb-8">
            <MedicalChatInterface />
          </section>
        </div>
      </div>
    </div>
  );
};

// Página de Triagem Independente
const TriagePage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Triagem Médica Inteligente
        </h1>
        <p className="text-lg text-gray-600">
          Avaliação rápida e precisa dos seus sintomas
        </p>
      </div>
      
      <AdvancedTriageWizard />
    </div>
  );
};

// Página de Agendamento com Microsseguro
const EnhancedAppointmentsPage = () => {
  const [selectedService, setSelectedService] = React.useState(null);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Agendamentos
        </h1>
        <p className="text-lg text-gray-600">
          Agende consultas com proteção de microsseguro
        </p>
      </div>
      
      {/* Componente de Agendamentos Existente */}
      <section>
        <Appointments />
      </section>
      
      {/* Ativador de Microsseguro */}
      {selectedService && (
        <section className="mt-8">
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">
              Proteja seu agendamento
            </h3>
            <MicroInsuranceActivator 
              serviceId={selectedService.id}
              onActivationComplete={(result) => {
                console.log('Cobertura ativada:', result);
                // Atualizar estado do agendamento
              }}
            />
          </div>
        </section>
      )}
    </div>
  );
};

// ====================================
// CONFIGURAÇÃO DE ROTAS PRINCIPAL
// ====================================

const AppRoutes = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            {/* Rotas Públicas */}
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            
            <Route path="/register" element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } />

            {/* Rotas Protegidas */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              {/* Dashboard Principal */}
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              
              {/* Perfil e Configurações */}
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<Settings />} />
              
              {/* FWAY Shield - Microsseguros */}
              <Route path="shield" element={<EnhancedShieldPage />} />
              <Route path="shield/pricing" element={<AdvancedDynamicPricingCalculator />} />
              <Route path="shield/dashboard" element={<ShieldDashboard />} />
              
              {/* FWAY Brain - IA Médica */}
              <Route path="brain" element={<EnhancedBrainPage />} />
              <Route path="brain/chat" element={<MedicalChatInterface />} />
              <Route path="brain/triage" element={<TriagePage />} />
              <Route path="brain/ai-health" element={<AIHealth />} />
              
              {/* Funcionalidades Existentes Aprimoradas */}
              <Route path="appointments" element={<EnhancedAppointmentsPage />} />
              <Route path="professionals" element={<ProfessionalSearch />} />
              <Route path="medical-history" element={<MedicalHistory />} />
              
              {/* Triagem como página independente */}
              <Route path="triage" element={<TriagePage />} />
              
              {/* Rotas de Funcionalidades Específicas */}
              <Route path="insurance/activate" element={<MicroInsuranceActivator />} />
              <Route path="pricing/calculate" element={<AdvancedDynamicPricingCalculator />} />
            </Route>

            {/* Rota 404 */}
            <Route path="*" element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                  <p className="text-lg text-gray-600 mb-8">Página não encontrada</p>
                  <a 
                    href="/dashboard" 
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Voltar ao Dashboard
                  </a>
                </div>
              </div>
            } />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
};

// ====================================
// CONTEXTO DE AUTENTICAÇÃO
// ====================================

// Contexto de autenticação (se não existir)
const AuthContext = React.createContext();

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  React.useEffect(() => {
    // Verificar token no localStorage
    const token = localStorage.getItem('token');
    if (token) {
      // Validar token com o backend
      validateToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const validateToken = async (token) => {
    try {
      const response = await fetch('/api/auth/validate', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user);
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Erro ao validar token:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('token', data.token);
        setUser(data.user);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      return { success: false, message: 'Erro de conexão' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ====================================
// CONTEXTO DE TOAST/NOTIFICAÇÕES
// ====================================

const ToastContext = React.createContext();

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast deve ser usado dentro de ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = React.useState([]);

  const addToast = (message, type = 'info', duration = 5000) => {
    const id = Date.now();
    const toast = { id, message, type, duration };
    
    setToasts(prev => [...prev, toast]);
    
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const value = {
    toasts,
    addToast,
    removeToast,
    success: (message) => addToast(message, 'success'),
    error: (message) => addToast(message, 'error'),
    warning: (message) => addToast(message, 'warning'),
    info: (message) => addToast(message, 'info')
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden ${
              toast.type === 'success' ? 'border-l-4 border-green-500' :
              toast.type === 'error' ? 'border-l-4 border-red-500' :
              toast.type === 'warning' ? 'border-l-4 border-yellow-500' :
              'border-l-4 border-blue-500'
            }`}
          >
            <div className="p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {toast.type === 'success' && <div className="text-green-500">✓</div>}
                  {toast.type === 'error' && <div className="text-red-500">✗</div>}
                  {toast.type === 'warning' && <div className="text-yellow-500">⚠</div>}
                  {toast.type === 'info' && <div className="text-blue-500">ℹ</div>}
                </div>
                <div className="ml-3 w-0 flex-1 pt-0.5">
                  <p className="text-sm font-medium text-gray-900">
                    {toast.message}
                  </p>
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                  <button
                    className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500"
                    onClick={() => removeToast(toast.id)}
                  >
                    <span className="sr-only">Fechar</span>
                    ×
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// ====================================
// CONFIGURAÇÃO DE NAVEGAÇÃO
// ====================================

export const navigationConfig = {
  main: [
    { name: 'Dashboard', href: '/dashboard', icon: 'Home' },
    { name: 'FWAY Shield', href: '/shield', icon: 'Shield' },
    { name: 'FWAY Brain', href: '/brain', icon: 'Brain' },
    { name: 'Agendamentos', href: '/appointments', icon: 'Calendar' },
    { name: 'Profissionais', href: '/professionals', icon: 'Users' },
    { name: 'Histórico Médico', href: '/medical-history', icon: 'FileText' }
  ],
  shield: [
    { name: 'Dashboard', href: '/shield' },
    { name: 'Calcular Prêmio', href: '/shield/pricing' },
    { name: 'Minhas Coberturas', href: '/shield/dashboard' }
  ],
  brain: [
    { name: 'Overview', href: '/brain' },
    { name: 'Chat Médico', href: '/brain/chat' },
    { name: 'Triagem', href: '/brain/triage' },
    { name: 'IA Health', href: '/brain/ai-health' }
  ],
  user: [
    { name: 'Perfil', href: '/profile' },
    { name: 'Configurações', href: '/settings' }
  ]
};

export default AppRoutes;

