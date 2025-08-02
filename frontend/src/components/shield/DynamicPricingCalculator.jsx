// Componente de Precificação Dinâmica para FWAY Shield

import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  Shield, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Info,
  Zap,
  Target,
  MapPin,
  Clock,
  User,
  Activity,
  DollarSign,
  Percent,
  BarChart3
} from 'lucide-react';

const DynamicPricingCalculator = ({ 
  serviceValue, 
  coverageType, 
  onPricingCalculated,
  autoCalculate = false 
}) => {
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [userRiskData, setUserRiskData] = useState(null);

  // Simular dados do usuário (em produção, vir do contexto/API)
  const mockUserData = {
    riskScore: 75,
    shieldLevel: 'SILVER',
    location: { city: 'São Paulo', state: 'SP' },
    age: 32,
    medicalHistory: ['hipertensão'],
    recentClaims: 1
  };

  useEffect(() => {
    if (autoCalculate && serviceValue && coverageType) {
      calculatePricing();
    }
  }, [serviceValue, coverageType, autoCalculate]);

  const calculatePricing = async () => {
    if (!serviceValue || !coverageType) {
      setError('Valor do serviço e tipo de cobertura são obrigatórios');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Simular chamada para API de precificação dinâmica
      const response = await fetch('/api/shield/calculate-premium', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          coverageType,
          serviceValue: parseFloat(serviceValue),
          duration: 30
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao calcular precificação');
      }

      const data = await response.json();
      setPricing(data.data);
      setUserRiskData(mockUserData);
      
      if (onPricingCalculated) {
        onPricingCalculated(data.data);
      }
    } catch (err) {
      setError(err.message);
      // Fallback com dados simulados para desenvolvimento
      const mockPricing = generateMockPricing();
      setPricing(mockPricing);
      setUserRiskData(mockUserData);
    } finally {
      setLoading(false);
    }
  };

  const generateMockPricing = () => {
    const baseRate = 0.05; // 5% do valor do serviço
    const riskMultiplier = mockUserData.riskScore / 100;
    const basePremium = serviceValue * baseRate;
    const adjustedPremium = basePremium * riskMultiplier;
    const shieldDiscount = mockUserData.shieldLevel === 'SILVER' ? 0.05 : 0;
    const finalPremium = adjustedPremium * (1 - shieldDiscount);

    return {
      success: true,
      premium: Math.round(finalPremium * 100) / 100,
      riskScore: mockUserData.riskScore,
      coverage: {
        maxCoverage: serviceValue,
        deductible: 0,
        duration: 30
      },
      breakdown: {
        basePremium: Math.round(basePremium * 100) / 100,
        riskMultiplier: Math.round(riskMultiplier * 100) / 100,
        regionalFactor: 1.1,
        seasonalFactor: 1.0,
        discountApplied: shieldDiscount
      },
      factors: {
        specialtyMatch: 0.9,
        locationMatch: 1.1,
        availabilityMatch: 0.8,
        experienceMatch: 0.9,
        reviewMatch: 0.95
      },
      validation: {
        approved: true,
        reasons: [],
        warnings: []
      },
      recommendation: {
        type: 'SUCCESS',
        message: 'Excelente custo-benefício para esta cobertura',
        action: 'Recomendamos ativar a cobertura'
      }
    };
  };

  const getRiskScoreColor = (score) => {
    if (score <= 50) return 'text-green-600';
    if (score <= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRiskScoreLabel = (score) => {
    if (score <= 50) return 'Baixo Risco';
    if (score <= 75) return 'Risco Moderado';
    return 'Alto Risco';
  };

  const getShieldLevelColor = (level) => {
    const colors = {
      'BRONZE': 'text-amber-600',
      'SILVER': 'text-gray-600',
      'GOLD': 'text-yellow-500',
      'PLATINUM': 'text-purple-600'
    };
    return colors[level] || 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Calculando precificação dinâmica...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
        <div className="flex items-center space-x-3">
          <Calculator className="h-8 w-8" />
          <div>
            <h3 className="text-xl font-bold">Precificação Dinâmica</h3>
            <p className="text-blue-100">Cálculo inteligente baseado em IA</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {!pricing && !loading && (
          <div className="text-center py-8">
            <Calculator className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              Insira o valor do serviço e tipo de cobertura para calcular o prêmio
            </p>
            <button
              onClick={calculatePricing}
              disabled={!serviceValue || !coverageType}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Calcular Prêmio
            </button>
          </div>
        )}

        {pricing && (
          <div className="space-y-6">
            {/* Resultado Principal */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Shield className="h-6 w-6 text-green-600" />
                  <span className="text-lg font-semibold text-gray-800">Prêmio Calculado</span>
                </div>
                {pricing.validation.approved && (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    R$ {pricing.premium.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">Prêmio Final</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    R$ {pricing.coverage.maxCoverage.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">Cobertura Máxima</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {pricing.coverage.duration} dias
                  </div>
                  <div className="text-sm text-gray-600">Duração</div>
                </div>
              </div>
            </div>

            {/* Score de Risco */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-gray-600" />
                  <span className="font-semibold text-gray-800">Análise de Risco</span>
                </div>
                <span className={`font-bold ${getRiskScoreColor(pricing.riskScore)}`}>
                  {getRiskScoreLabel(pricing.riskScore)}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Score de Risco</span>
                    <span className={`font-bold ${getRiskScoreColor(pricing.riskScore)}`}>
                      {pricing.riskScore}/100
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        pricing.riskScore <= 50 ? 'bg-green-500' :
                        pricing.riskScore <= 75 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${pricing.riskScore}%` }}
                    ></div>
                  </div>
                </div>
                
                {userRiskData && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Nível Shield</span>
                      <span className={`font-bold ${getShieldLevelColor(userRiskData.shieldLevel)}`}>
                        {userRiskData.shieldLevel}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{userRiskData.location.city}, {userRiskData.location.state}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Fatores de Precificação */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <button
                onClick={() => setShowBreakdown(!showBreakdown)}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-gray-600" />
                  <span className="font-semibold text-gray-800">Detalhamento da Precificação</span>
                </div>
                <div className={`transform transition-transform ${showBreakdown ? 'rotate-180' : ''}`}>
                  <TrendingUp className="h-5 w-5 text-gray-400" />
                </div>
              </button>
              
              {showBreakdown && (
                <div className="mt-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Prêmio Base:</span>
                      <span className="font-medium">R$ {pricing.breakdown.basePremium.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Multiplicador de Risco:</span>
                      <span className="font-medium">{pricing.breakdown.riskMultiplier.toFixed(2)}x</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fator Regional:</span>
                      <span className="font-medium">{pricing.breakdown.regionalFactor.toFixed(2)}x</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fator Sazonal:</span>
                      <span className="font-medium">{pricing.breakdown.seasonalFactor.toFixed(2)}x</span>
                    </div>
                  </div>
                  
                  {pricing.breakdown.discountApplied > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded p-3">
                      <div className="flex items-center space-x-2">
                        <Percent className="h-4 w-4 text-green-600" />
                        <span className="text-green-800 font-medium">
                          Desconto Shield: {(pricing.breakdown.discountApplied * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Recomendação */}
            {pricing.recommendation && (
              <div className={`rounded-lg p-4 border ${
                pricing.recommendation.type === 'SUCCESS' ? 'bg-green-50 border-green-200' :
                pricing.recommendation.type === 'WARNING' ? 'bg-yellow-50 border-yellow-200' :
                'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {pricing.recommendation.type === 'SUCCESS' && <CheckCircle className="h-5 w-5 text-green-600" />}
                    {pricing.recommendation.type === 'WARNING' && <AlertTriangle className="h-5 w-5 text-yellow-600" />}
                    {pricing.recommendation.type === 'ERROR' && <AlertTriangle className="h-5 w-5 text-red-600" />}
                  </div>
                  <div>
                    <p className={`font-medium ${
                      pricing.recommendation.type === 'SUCCESS' ? 'text-green-800' :
                      pricing.recommendation.type === 'WARNING' ? 'text-yellow-800' :
                      'text-red-800'
                    }`}>
                      {pricing.recommendation.message}
                    </p>
                    <p className={`text-sm mt-1 ${
                      pricing.recommendation.type === 'SUCCESS' ? 'text-green-600' :
                      pricing.recommendation.type === 'WARNING' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {pricing.recommendation.action}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Ações */}
            <div className="flex space-x-3">
              <button
                onClick={calculatePricing}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Recalcular
              </button>
              
              {pricing.validation.approved && (
                <button
                  onClick={() => {
                    // Navegar para ativação de cobertura
                    console.log('Ativar cobertura com prêmio:', pricing.premium);
                  }}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Ativar Cobertura
                </button>
              )}
            </div>

            {/* Informações Adicionais */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Como funciona a precificação dinâmica:</p>
                  <ul className="space-y-1 text-blue-700">
                    <li>• Análise em tempo real do seu perfil de risco</li>
                    <li>• Consideração de fatores regionais e sazonais</li>
                    <li>• Descontos baseados no seu nível Shield</li>
                    <li>• Ajustes baseados em dados epidemiológicos</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DynamicPricingCalculator;

