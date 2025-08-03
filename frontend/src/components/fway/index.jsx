import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  Heart,
  Shield,
  Brain,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  TrendingUp,
  TrendingDown,
  Users,
  Award,
  Target,
  Zap,
  MessageSquare,
  Search,
  Filter,
  Calendar,
  MapPin,
  Phone,
  Mail,
  FileText,
  Download,
  Upload,
  Settings,
  Info,
  Warning,
  X
} from 'lucide-react';

// ====================================
// 1. COMPONENTE DE PRECIFICAÇÃO DINÂMICA AVANÇADA
// ====================================

const AdvancedDynamicPricingCalculator = () => {
  const [formData, setFormData] = useState({
    serviceType: '',
    age: '',
    location: '',
    urgency: 'MEDIUM',
    riskFactors: [],
    medicalHistory: []
  });
  const [pricingResult, setPricingResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [availableRiskFactors, setAvailableRiskFactors] = useState([]);

  useEffect(() => {
    fetchRiskFactors();
  }, []);

  const fetchRiskFactors = async () => {
    try {
      const response = await fetch('/api/shield/risk-factors');
      const data = await response.json();
      if (data.success) {
        setAvailableRiskFactors(data.data.standardFactors);
      }
    } catch (error) {
      console.error('Erro ao buscar fatores de risco:', error);
    }
  };

  const calculatePremium = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/shield/calculate-premium', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          serviceType: formData.serviceType,
          userProfile: {
            age: parseInt(formData.age),
            location: formData.location,
            riskFactors: formData.riskFactors
          },
          serviceDetails: {
            urgency: formData.urgency,
            scheduledTime: new Date().toISOString()
          }
        })
      });

      const data = await response.json();
      if (data.success) {
        setPricingResult(data.data);
      }
    } catch (error) {
      console.error('Erro ao calcular prêmio:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRiskFactorToggle = (factorId) => {
    setFormData(prev => ({
      ...prev,
      riskFactors: prev.riskFactors.includes(factorId)
        ? prev.riskFactors.filter(id => id !== factorId)
        : [...prev.riskFactors, factorId]
    }));
  };

  const getRiskLevelColor = (level) => {
    const colors = {
      'MINIMAL': 'bg-green-100 text-green-800',
      'LOW': 'bg-blue-100 text-blue-800',
      'MEDIUM': 'bg-yellow-100 text-yellow-800',
      'HIGH': 'bg-orange-100 text-orange-800',
      'CRITICAL': 'bg-red-100 text-red-800'
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-blue-600" />
          Calculadora de Precificação Dinâmica
        </CardTitle>
        <CardDescription>
          Calcule seu prêmio personalizado baseado em IA e análise de risco
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulário */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="serviceType">Tipo de Serviço</Label>
              <Select value={formData.serviceType} onValueChange={(value) => 
                setFormData(prev => ({ ...prev, serviceType: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de serviço" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CONSULTATION">Consulta Médica</SelectItem>
                  <SelectItem value="EXAM">Exame</SelectItem>
                  <SelectItem value="PROCEDURE">Procedimento</SelectItem>
                  <SelectItem value="EMERGENCY">Emergência</SelectItem>
                  <SelectItem value="SURGERY">Cirurgia</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="age">Idade</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                  placeholder="Ex: 35"
                />
              </div>
              <div>
                <Label htmlFor="location">Localização</Label>
                <Select value={formData.location} onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, location: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SP">São Paulo</SelectItem>
                    <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                    <SelectItem value="MG">Minas Gerais</SelectItem>
                    <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                    <SelectItem value="PR">Paraná</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="urgency">Nível de Urgência</Label>
              <Select value={formData.urgency} onValueChange={(value) => 
                setFormData(prev => ({ ...prev, urgency: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Baixa</SelectItem>
                  <SelectItem value="MEDIUM">Média</SelectItem>
                  <SelectItem value="HIGH">Alta</SelectItem>
                  <SelectItem value="EMERGENCY">Emergência</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Fatores de Risco</Label>
              <div className="grid grid-cols-2 gap-2 mt-2 max-h-40 overflow-y-auto">
                {availableRiskFactors.map((factor) => (
                  <div key={factor.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={factor.id}
                      checked={formData.riskFactors.includes(factor.id)}
                      onChange={() => handleRiskFactorToggle(factor.id)}
                      className="rounded"
                    />
                    <Label htmlFor={factor.id} className="text-sm">
                      {factor.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Button 
              onClick={calculatePremium} 
              disabled={loading || !formData.serviceType || !formData.age}
              className="w-full"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Calculando...
                </div>
              ) : (
                'Calcular Prêmio'
              )}
            </Button>
          </div>

          {/* Resultado */}
          <div>
            {pricingResult && (
              <div className="space-y-4">
                <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">
                    R$ {pricingResult.finalPremium.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Prêmio Calculado
                  </div>
                  <Badge className={`mt-2 ${getRiskLevelColor(pricingResult.riskLevel)}`}>
                    Risco: {pricingResult.riskLevel}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Breakdown de Preços:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Preço Base:</span>
                      <span>R$ {pricingResult.basePremium.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ajuste de Risco:</span>
                      <span className={pricingResult.breakdown.riskAdjustment >= 0 ? 'text-red-600' : 'text-green-600'}>
                        {pricingResult.breakdown.riskAdjustment >= 0 ? '+' : ''}
                        R$ {pricingResult.breakdown.riskAdjustment.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ajuste de Urgência:</span>
                      <span className={pricingResult.breakdown.urgencyAdjustment >= 0 ? 'text-red-600' : 'text-green-600'}>
                        {pricingResult.breakdown.urgencyAdjustment >= 0 ? '+' : ''}
                        R$ {pricingResult.breakdown.urgencyAdjustment.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ajuste Regional:</span>
                      <span className={pricingResult.breakdown.locationAdjustment >= 0 ? 'text-red-600' : 'text-green-600'}>
                        {pricingResult.breakdown.locationAdjustment >= 0 ? '+' : ''}
                        R$ {pricingResult.breakdown.locationAdjustment.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {pricingResult.epidemiologicalContext && (
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 mb-2">
                      Contexto Epidemiológico
                    </h4>
                    <div className="text-sm text-yellow-700">
                      <p>Região: {pricingResult.epidemiologicalContext.region}</p>
                      <p>Nível de Alerta: {pricingResult.epidemiologicalContext.alertLevel}</p>
                    </div>
                  </div>
                )}

                {pricingResult.recommendations && pricingResult.recommendations.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold">Recomendações:</h4>
                    {pricingResult.recommendations.map((rec, index) => (
                      <Alert key={index}>
                        <Info className="h-4 w-4" />
                        <AlertTitle>{rec.message}</AlertTitle>
                        <AlertDescription>{rec.suggestion}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ====================================
// 2. COMPONENTE DE ATIVAÇÃO DE MICROSSEGUROS
// ====================================

const MicroInsuranceActivator = ({ serviceId, onActivationComplete }) => {
  const [step, setStep] = useState(1);
  const [selectedCoverage, setSelectedCoverage] = useState(null);
  const [pricingData, setPricingData] = useState(null);
  const [activationResult, setActivationResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const coverageTypes = [
    {
      id: 'basic',
      name: 'Cobertura Básica',
      description: 'Cobertura essencial para consultas e exames',
      maxCoverage: 1000,
      deductible: 50,
      features: ['Consultas médicas', 'Exames básicos', 'Medicamentos essenciais']
    },
    {
      id: 'premium',
      name: 'Cobertura Premium',
      description: 'Cobertura completa com benefícios adicionais',
      maxCoverage: 2500,
      deductible: 25,
      features: ['Todas as coberturas básicas', 'Procedimentos especializados', 'Telemedicina', 'Segunda opinião médica']
    },
    {
      id: 'emergency',
      name: 'Cobertura de Emergência',
      description: 'Cobertura específica para situações de emergência',
      maxCoverage: 5000,
      deductible: 100,
      features: ['Atendimento de emergência', 'Internação', 'UTI', 'Cirurgias de urgência']
    }
  ];

  const activateCoverage = async () => {
    if (!selectedCoverage || !pricingData) return;

    setLoading(true);
    try {
      const response = await fetch('/api/shield/activate-coverage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          coverageType: selectedCoverage.name,
          serviceId,
          premium: pricingData.finalPremium,
          duration: 24,
          calculationId: pricingData.calculationId
        })
      });

      const data = await response.json();
      if (data.success) {
        setActivationResult(data.data);
        setStep(3);
        onActivationComplete?.(data.data);
      }
    } catch (error) {
      console.error('Erro ao ativar cobertura:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Shield className="h-4 w-4 mr-2" />
          Ativar Microsseguro
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Ativação de Microsseguro</DialogTitle>
          <DialogDescription>
            Proteja-se com cobertura instantânea para sua consulta
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= stepNum ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {stepNum}
                </div>
                {stepNum < 3 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step > stepNum ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Seleção de Cobertura */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Escolha sua Cobertura</h3>
              <div className="grid gap-4">
                {coverageTypes.map((coverage) => (
                  <Card 
                    key={coverage.id}
                    className={`cursor-pointer transition-all ${
                      selectedCoverage?.id === coverage.id 
                        ? 'ring-2 ring-blue-600 bg-blue-50' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedCoverage(coverage)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{coverage.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {coverage.description}
                          </p>
                          <div className="mt-2 space-y-1">
                            <div className="text-sm">
                              <span className="font-medium">Cobertura Máxima:</span> R$ {coverage.maxCoverage}
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">Franquia:</span> R$ {coverage.deductible}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="w-4 h-4 rounded-full border-2 border-blue-600 flex items-center justify-center">
                            {selectedCoverage?.id === coverage.id && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full" />
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="text-sm font-medium mb-1">Inclui:</div>
                        <div className="flex flex-wrap gap-1">
                          {coverage.features.map((feature, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Button 
                onClick={() => setStep(2)} 
                disabled={!selectedCoverage}
                className="w-full"
              >
                Continuar
              </Button>
            </div>
          )}

          {/* Step 2: Confirmação e Pagamento */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Confirmação</h3>
              
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-semibold">{selectedCoverage.name}</h4>
                  <div className="mt-2 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Cobertura Máxima:</span>
                      <span>R$ {selectedCoverage.maxCoverage}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Franquia:</span>
                      <span>R$ {selectedCoverage.deductible}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duração:</span>
                      <span>24 horas</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg border-t pt-2">
                      <span>Prêmio:</span>
                      <span>R$ {pricingData?.finalPremium?.toFixed(2) || '0.00'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Importante</AlertTitle>
                <AlertDescription>
                  A cobertura será ativada imediatamente após a confirmação e será válida por 24 horas.
                </AlertDescription>
              </Alert>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Voltar
                </Button>
                <Button onClick={activateCoverage} disabled={loading} className="flex-1">
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Ativando...
                    </div>
                  ) : (
                    'Ativar Cobertura'
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Confirmação de Ativação */}
          {step === 3 && activationResult && (
            <div className="space-y-4 text-center">
              <div className="flex justify-center">
                <CheckCircle className="h-16 w-16 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-green-600">
                Cobertura Ativada com Sucesso!
              </h3>
              
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Número da Apólice:</span>
                      <span className="font-mono">{activationResult.policyNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ativada em:</span>
                      <span>{new Date(activationResult.activatedAt).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Expira em:</span>
                      <span>{new Date(activationResult.expiresAt).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cobertura Máxima:</span>
                      <span>R$ {activationResult.coverageDetails.maxCoverage}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Sua cobertura está ativa!</AlertTitle>
                <AlertDescription>
                  Você pode acessar os detalhes da sua apólice no dashboard do Shield.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ====================================
// 3. COMPONENTE DE CHAT MÉDICO CONTEXTUAL
// ====================================

const MedicalChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    // Inicializar sessão de chat
    setSessionId(`session_${Date.now()}`);
    
    // Mensagem de boas-vindas
    setMessages([{
      id: 1,
      type: 'ai',
      content: 'Olá! Sou seu assistente médico inteligente. Estou aqui para ajudá-lo com questões relacionadas à sua saúde. Como posso ajudá-lo hoje?',
      timestamp: new Date(),
      suggestions: [
        'Fazer uma pergunta sobre saúde',
        'Realizar triagem de sintomas',
        'Buscar profissional de saúde'
      ]
    }]);
  }, []);

  const sendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await fetch('/api/brain/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          message: inputMessage,
          sessionId,
          context: {
            previousMessages: messages.slice(-5)
          }
        })
      });

      const data = await response.json();
      if (data.success) {
        const aiMessage = {
          id: Date.now() + 1,
          type: 'ai',
          content: data.data.response,
          timestamp: new Date(),
          intent: data.data.intent,
          confidence: data.data.confidence,
          urgencyLevel: data.data.urgencyLevel,
          suggestions: data.data.suggestions,
          followUpQuestions: data.data.followUpQuestions,
          contextualInsights: data.data.contextualInsights
        };

        setMessages(prev => [...prev, aiMessage]);
        setSuggestions(data.data.suggestions || []);
      }
    } catch (error) {
      console.error('Erro no chat:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: 'Desculpe, ocorreu um erro. Tente novamente.',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion);
  };

  const getUrgencyColor = (level) => {
    const colors = {
      'LOW': 'text-green-600',
      'MEDIUM': 'text-yellow-600',
      'HIGH': 'text-orange-600',
      'EMERGENCY': 'text-red-600'
    };
    return colors[level] || 'text-gray-600';
  };

  return (
    <Card className="w-full max-w-4xl mx-auto h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-purple-600" />
          Chat Médico Inteligente
        </CardTitle>
        <CardDescription>
          Converse com nossa IA médica para esclarecimentos e orientações
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg p-3 ${
                message.type === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : message.isError 
                    ? 'bg-red-50 text-red-800 border border-red-200'
                    : 'bg-gray-100 text-gray-800'
              }`}>
                <div className="text-sm">{message.content}</div>
                
                {message.type === 'ai' && !message.isError && (
                  <div className="mt-2 space-y-2">
                    {message.urgencyLevel && message.urgencyLevel !== 'LOW' && (
                      <div className={`text-xs font-semibold ${getUrgencyColor(message.urgencyLevel)}`}>
                        Urgência: {message.urgencyLevel}
                      </div>
                    )}
                    
                    {message.contextualInsights && message.contextualInsights.length > 0 && (
                      <div className="text-xs bg-blue-50 p-2 rounded border-l-2 border-blue-400">
                        {message.contextualInsights.map((insight, index) => (
                          <div key={index}>{insight}</div>
                        ))}
                      </div>
                    )}
                    
                    {message.followUpQuestions && message.followUpQuestions.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-xs font-medium">Perguntas de acompanhamento:</div>
                        {message.followUpQuestions.map((question, index) => (
                          <button
                            key={index}
                            onClick={() => handleSuggestionClick(question)}
                            className="block text-xs text-blue-600 hover:text-blue-800 underline"
                          >
                            {question}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                <div className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                  <span className="text-sm">Analisando...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="p-4 border-t bg-gray-50">
            <div className="text-sm font-medium mb-2">Sugestões:</div>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="text-xs"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Digite sua pergunta sobre saúde..."
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              disabled={loading}
            />
            <Button onClick={sendMessage} disabled={loading || !inputMessage.trim()}>
              <MessageSquare className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ====================================
// 4. COMPONENTE DE TRIAGEM AVANÇADA
// ====================================

const AdvancedTriageWizard = () => {
  const [step, setStep] = useState(1);
  const [triageData, setTriageData] = useState({
    symptoms: [],
    duration: '',
    severity: 5,
    additionalInfo: '',
    vitals: {
      temperature: '',
      heartRate: '',
      bloodPressure: ''
    }
  });
  const [triageResult, setTriageResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const symptomCategories = {
    general: {
      name: 'Sintomas Gerais',
      symptoms: [
        { id: 'fever', name: 'Febre', icon: '🌡️' },
        { id: 'fatigue', name: 'Cansaço', icon: '😴' },
        { id: 'weight_loss', name: 'Perda de peso', icon: '⚖️' },
        { id: 'night_sweats', name: 'Suores noturnos', icon: '💧' }
      ]
    },
    pain: {
      name: 'Dor',
      symptoms: [
        { id: 'headache', name: 'Dor de cabeça', icon: '🤕' },
        { id: 'chest_pain', name: 'Dor no peito', icon: '💔' },
        { id: 'abdominal_pain', name: 'Dor abdominal', icon: '🤰' },
        { id: 'back_pain', name: 'Dor nas costas', icon: '🦴' }
      ]
    },
    respiratory: {
      name: 'Respiratório',
      symptoms: [
        { id: 'cough', name: 'Tosse', icon: '😷' },
        { id: 'difficulty_breathing', name: 'Dificuldade para respirar', icon: '🫁' },
        { id: 'wheezing', name: 'Chiado no peito', icon: '🌬️' },
        { id: 'chest_tightness', name: 'Aperto no peito', icon: '🫸' }
      ]
    },
    gastrointestinal: {
      name: 'Gastrointestinal',
      symptoms: [
        { id: 'nausea', name: 'Náusea', icon: '🤢' },
        { id: 'vomiting', name: 'Vômito', icon: '🤮' },
        { id: 'diarrhea', name: 'Diarreia', icon: '💩' },
        { id: 'constipation', name: 'Constipação', icon: '🚽' }
      ]
    },
    neurological: {
      name: 'Neurológico',
      symptoms: [
        { id: 'dizziness', name: 'Tontura', icon: '😵' },
        { id: 'confusion', name: 'Confusão mental', icon: '🤔' },
        { id: 'weakness', name: 'Fraqueza', icon: '💪' },
        { id: 'numbness', name: 'Dormência', icon: '🖐️' }
      ]
    }
  };

  const handleSymptomToggle = (symptomId) => {
    setTriageData(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptomId)
        ? prev.symptoms.filter(id => id !== symptomId)
        : [...prev.symptoms, symptomId]
    }));
  };

  const performTriage = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/brain/triage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(triageData)
      });

      const data = await response.json();
      if (data.success) {
        setTriageResult(data.data);
        setStep(6);
      }
    } catch (error) {
      console.error('Erro na triagem:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (level) => {
    const colors = {
      'LOW': 'bg-green-100 text-green-800 border-green-300',
      'MEDIUM': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'HIGH': 'bg-orange-100 text-orange-800 border-orange-300',
      'EMERGENCY': 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[level] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Selecione seus sintomas</h3>
            <div className="space-y-4">
              {Object.entries(symptomCategories).map(([categoryId, category]) => (
                <div key={categoryId}>
                  <h4 className="font-medium mb-2">{category.name}</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {category.symptoms.map((symptom) => (
                      <button
                        key={symptom.id}
                        onClick={() => handleSymptomToggle(symptom.id)}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          triageData.symptoms.includes(symptom.id)
                            ? 'bg-blue-50 border-blue-300 text-blue-800'
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{symptom.icon}</span>
                          <span className="text-sm">{symptom.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Há quanto tempo você tem esses sintomas?</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: 'acute', label: 'Menos de 24 horas', description: 'Sintomas recentes' },
                { value: 'subacute', label: '1-7 dias', description: 'Sintomas de alguns dias' },
                { value: 'chronic', label: 'Mais de 1 semana', description: 'Sintomas persistentes' },
                { value: 'intermittent', label: 'Vai e vem', description: 'Sintomas intermitentes' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTriageData(prev => ({ ...prev, duration: option.value }))}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    triageData.duration === option.value
                      ? 'bg-blue-50 border-blue-300 text-blue-800'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium">{option.label}</div>
                  <div className="text-sm text-gray-600">{option.description}</div>
                </button>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Qual a intensidade dos seus sintomas?</h3>
            <div className="space-y-4">
              <div>
                <Label>Intensidade (1-10)</Label>
                <div className="mt-2">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={triageData.severity}
                    onChange={(e) => setTriageData(prev => ({ 
                      ...prev, 
                      severity: parseInt(e.target.value) 
                    }))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600 mt-1">
                    <span>1 - Muito leve</span>
                    <span className="font-semibold text-lg">{triageData.severity}</span>
                    <span>10 - Insuportável</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl">😊</div>
                  <div className="text-xs">Leve (1-3)</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="text-2xl">😐</div>
                  <div className="text-xs">Moderado (4-6)</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-2xl">😰</div>
                  <div className="text-xs">Intenso (7-10)</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Sinais vitais (opcional)</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="temperature">Temperatura (°C)</Label>
                <Input
                  id="temperature"
                  type="number"
                  step="0.1"
                  value={triageData.vitals.temperature}
                  onChange={(e) => setTriageData(prev => ({
                    ...prev,
                    vitals: { ...prev.vitals, temperature: e.target.value }
                  }))}
                  placeholder="Ex: 37.5"
                />
              </div>
              <div>
                <Label htmlFor="heartRate">Frequência cardíaca (bpm)</Label>
                <Input
                  id="heartRate"
                  type="number"
                  value={triageData.vitals.heartRate}
                  onChange={(e) => setTriageData(prev => ({
                    ...prev,
                    vitals: { ...prev.vitals, heartRate: e.target.value }
                  }))}
                  placeholder="Ex: 80"
                />
              </div>
              <div>
                <Label htmlFor="bloodPressure">Pressão arterial</Label>
                <Input
                  id="bloodPressure"
                  value={triageData.vitals.bloodPressure}
                  onChange={(e) => setTriageData(prev => ({
                    ...prev,
                    vitals: { ...prev.vitals, bloodPressure: e.target.value }
                  }))}
                  placeholder="Ex: 120/80"
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informações adicionais</h3>
            <div>
              <Label htmlFor="additionalInfo">
                Descreva outros detalhes importantes sobre seus sintomas
              </Label>
              <Textarea
                id="additionalInfo"
                value={triageData.additionalInfo}
                onChange={(e) => setTriageData(prev => ({ 
                  ...prev, 
                  additionalInfo: e.target.value 
                }))}
                placeholder="Ex: Os sintomas pioram à noite, já tomei medicação X, tenho histórico de..."
                rows={4}
              />
            </div>
          </div>
        );

      case 6:
        return triageResult && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">Resultado da Triagem</h3>
              <div className={`inline-block px-4 py-2 rounded-lg border ${getUrgencyColor(triageResult.urgencyLevel)}`}>
                <div className="font-semibold">
                  Nível de Urgência: {triageResult.urgencyLevel}
                </div>
                <div className="text-sm">
                  Score de Risco: {triageResult.riskScore}/100
                </div>
              </div>
            </div>

            {triageResult.redFlags && triageResult.redFlags.length > 0 && (
              <Alert className="border-red-300 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-800">Red Flags Detectados</AlertTitle>
                <AlertDescription className="text-red-700">
                  <ul className="list-disc list-inside space-y-1">
                    {triageResult.redFlags.map((flag, index) => (
                      <li key={index}>{flag.description}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recomendações</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {triageResult.recommendations.map((rec, index) => (
                      <div key={index} className="p-3 bg-blue-50 rounded-lg">
                        <div className="font-medium text-blue-800">{rec.title}</div>
                        <div className="text-sm text-blue-600">{rec.description}</div>
                        <div className="text-xs text-blue-500 mt-1">{rec.action}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Próximos Passos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {triageResult.nextSteps.map((step, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                        <div className="text-sm">{step}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {triageResult.specialtyRecommendation && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Especialidade Recomendada</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">👨‍⚕️</div>
                    <div>
                      <div className="font-semibold">{triageResult.specialtyRecommendation}</div>
                      <div className="text-sm text-gray-600">
                        Tempo estimado de espera: {triageResult.estimatedWaitTime}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-2">
              <Button 
                onClick={() => {
                  setStep(1);
                  setTriageData({
                    symptoms: [],
                    duration: '',
                    severity: 5,
                    additionalInfo: '',
                    vitals: { temperature: '', heartRate: '', bloodPressure: '' }
                  });
                  setTriageResult(null);
                }}
                variant="outline"
                className="flex-1"
              >
                Nova Triagem
              </Button>
              <Button className="flex-1">
                Buscar Profissional
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-6 w-6 text-red-600" />
          Triagem Médica Avançada
        </CardTitle>
        <CardDescription>
          Avaliação inteligente dos seus sintomas com detecção de red flags
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* Progress Indicator */}
        {step < 6 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Etapa {step} de 5</span>
              <span className="text-sm text-gray-600">{Math.round((step / 5) * 100)}%</span>
            </div>
            <Progress value={(step / 5) * 100} className="h-2" />
          </div>
        )}

        {renderStep()}

        {/* Navigation Buttons */}
        {step < 6 && (
          <div className="flex gap-2 mt-6">
            {step > 1 && (
              <Button 
                variant="outline" 
                onClick={() => setStep(step - 1)}
                className="flex-1"
              >
                Anterior
              </Button>
            )}
            
            {step < 5 ? (
              <Button 
                onClick={() => setStep(step + 1)}
                disabled={
                  (step === 1 && triageData.symptoms.length === 0) ||
                  (step === 2 && !triageData.duration)
                }
                className="flex-1"
              >
                Próximo
              </Button>
            ) : (
              <Button 
                onClick={performTriage}
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Analisando...
                  </div>
                ) : (
                  'Finalizar Triagem'
                )}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ====================================
// EXPORTAÇÃO DOS COMPONENTES
// ====================================

export {
  AdvancedDynamicPricingCalculator,
  MicroInsuranceActivator,
  MedicalChatInterface,
  AdvancedTriageWizard
};

