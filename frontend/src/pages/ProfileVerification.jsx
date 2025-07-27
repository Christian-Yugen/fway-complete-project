import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Upload,
  FileText,
  Camera,
  Award,
  User,
  GraduationCap,
  Briefcase,
  Star,
  Eye,
  Download,
  RefreshCw,
  AlertTriangle,
  Zap,
  Target,
  Users,
  Calendar
} from 'lucide-react'

const ProfileVerification = () => {
  const navigate = useNavigate()
  const [verificationStatus, setVerificationStatus] = useState({
    identity: 'pending',
    education: 'verified',
    experience: 'pending',
    documents: 'rejected',
    background: 'verified'
  })
  const [uploadProgress, setUploadProgress] = useState({})
  const [activeStep, setActiveStep] = useState(1)

  const verificationSteps = [
    {
      id: 1,
      title: 'Verificação de Identidade',
      description: 'Upload de documento oficial com foto',
      status: verificationStatus.identity,
      icon: User,
      required: true,
      documents: ['RG', 'CNH', 'Passaporte'],
      estimatedTime: '2-5 minutos'
    },
    {
      id: 2,
      title: 'Formação Acadêmica',
      description: 'Diplomas e certificados de formação',
      status: verificationStatus.education,
      icon: GraduationCap,
      required: true,
      documents: ['Diploma', 'Histórico Escolar', 'Certificados'],
      estimatedTime: '5-10 minutos'
    },
    {
      id: 3,
      title: 'Experiência Profissional',
      description: 'Comprovantes de experiência e registros profissionais',
      status: verificationStatus.experience,
      icon: Briefcase,
      required: true,
      documents: ['CRM/COREN/CREFITO', 'Carteira de Trabalho', 'Declarações'],
      estimatedTime: '10-15 minutos'
    },
    {
      id: 4,
      title: 'Documentos Adicionais',
      description: 'Certificações especializadas e cursos',
      status: verificationStatus.documents,
      icon: FileText,
      required: false,
      documents: ['Especializações', 'Cursos', 'Certificações'],
      estimatedTime: '5-10 minutos'
    },
    {
      id: 5,
      title: 'Verificação de Antecedentes',
      description: 'Checagem de antecedentes criminais',
      status: verificationStatus.background,
      icon: Shield,
      required: true,
      documents: ['Certidão Criminal', 'Atestado de Antecedentes'],
      estimatedTime: '24-48 horas'
    }
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified': return 'text-green-600 bg-green-50 border-green-200'
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'rejected': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified': return <CheckCircle className="text-green-500" size={20} />
      case 'pending': return <Clock className="text-yellow-500" size={20} />
      case 'rejected': return <AlertCircle className="text-red-500" size={20} />
      default: return <AlertTriangle className="text-gray-500" size={20} />
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'verified': return 'Verificado'
      case 'pending': return 'Pendente'
      case 'rejected': return 'Rejeitado'
      default: return 'Não iniciado'
    }
  }

  const calculateOverallProgress = () => {
    const statuses = Object.values(verificationStatus)
    const verified = statuses.filter(status => status === 'verified').length
    return Math.round((verified / statuses.length) * 100)
  }

  const handleFileUpload = (stepId, file) => {
    setUploadProgress({ ...uploadProgress, [stepId]: 0 })
    
    // Simula upload
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = (prev[stepId] || 0) + 10
        if (newProgress >= 100) {
          clearInterval(interval)
          // Simula processamento
          setTimeout(() => {
            setVerificationStatus(prev => ({
              ...prev,
              [Object.keys(prev)[stepId - 1]]: 'pending'
            }))
          }, 1000)
        }
        return { ...prev, [stepId]: newProgress }
      })
    }, 200)
  }

  const retryVerification = (stepId) => {
    const statusKey = Object.keys(verificationStatus)[stepId - 1]
    setVerificationStatus(prev => ({
      ...prev,
      [statusKey]: 'pending'
    }))
  }

  return (
    <div className="content-container">
      {/* Sidebar Esquerda - Progresso */}
      <aside className="sidebar-left">
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <Shield size={20} className="text-blue-600" />
              Progresso da Verificação
            </h3>
          </div>
          <div className="card-body">
            <div className="text-center mb-4">
              <div className="relative w-24 h-24 mx-auto mb-3">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-gray-200"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - calculateOverallProgress() / 100)}`}
                    className="text-blue-600 transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-blue-600">
                    {calculateOverallProgress()}%
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600">Verificação Completa</p>
            </div>

            <div className="space-y-3">
              {verificationSteps.map((step) => (
                <div 
                  key={step.id}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                    activeStep === step.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setActiveStep(step.id)}
                >
                  {getStatusIcon(step.status)}
                  <div className="flex-1">
                    <div className="text-sm font-medium">{step.title}</div>
                    <div className="text-xs text-gray-500">{getStatusText(step.status)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Benefícios da Verificação */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title">Benefícios da Verificação</h3>
          </div>
          <div className="card-body">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-500" />
                <span className="text-sm">Perfil destacado</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-500" />
                <span className="text-sm">Mais confiança dos clientes</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-500" />
                <span className="text-sm">Acesso a serviços premium</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-500" />
                <span className="text-sm">Prioridade no matching</span>
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
                  <Shield size={24} className="text-blue-600" />
                  Verificação de Perfil Profissional
                </h1>
                <p className="card-subtitle">
                  Complete sua verificação para aumentar a confiança dos clientes
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Target size={20} className="text-green-500" />
                <span className="text-sm font-medium">Nível: {calculateOverallProgress() >= 80 ? 'Avançado' : 'Básico'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Etapa Ativa */}
        {verificationSteps.map((step) => (
          activeStep === step.id && (
            <div key={step.id} className="card-professional">
              <div className="card-header">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-full ${getStatusColor(step.status)}`}>
                    <step.icon size={24} />
                  </div>
                  <div>
                    <h2 className="card-title">{step.title}</h2>
                    <p className="card-subtitle">{step.description}</p>
                  </div>
                  <div className="ml-auto">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(step.status)}`}>
                      {getStatusIcon(step.status)}
                      {getStatusText(step.status)}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="card-body">
                {step.status === 'rejected' && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="text-red-500" size={20} />
                      <span className="font-medium text-red-800">Documentos Rejeitados</span>
                    </div>
                    <p className="text-sm text-red-700 mb-3">
                      Seus documentos foram rejeitados. Motivos: Qualidade da imagem baixa, documento ilegível.
                    </p>
                    <button 
                      onClick={() => retryVerification(step.id)}
                      className="btn-professional btn-outline flex items-center gap-2"
                    >
                      <RefreshCw size={16} />
                      Tentar Novamente
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Área de Upload */}
                  <div>
                    <h3 className="font-semibold mb-3">Documentos Necessários</h3>
                    <div className="space-y-3">
                      {step.documents.map((doc, index) => (
                        <div key={index} className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                          <div className="flex flex-col items-center gap-2">
                            <Upload className="text-gray-400" size={24} />
                            <div>
                              <p className="font-medium">{doc}</p>
                              <p className="text-sm text-gray-500">
                                Clique para fazer upload ou arraste aqui
                              </p>
                            </div>
                            <input
                              type="file"
                              accept="image/*,.pdf"
                              onChange={(e) => handleFileUpload(step.id, e.target.files[0])}
                              className="hidden"
                            />
                            <button 
                              onClick={() => document.querySelector('input[type="file"]').click()}
                              className="btn-professional btn-outline btn-sm"
                            >
                              Selecionar Arquivo
                            </button>
                          </div>
                          
                          {uploadProgress[step.id] !== undefined && (
                            <div className="mt-3">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${uploadProgress[step.id]}%` }}
                                ></div>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                {uploadProgress[step.id]}% enviado
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Instruções */}
                  <div>
                    <h3 className="font-semibold mb-3">Instruções</h3>
                    <div className="space-y-4">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Camera className="text-blue-600" size={16} />
                          <span className="font-medium text-blue-800">Qualidade da Foto</span>
                        </div>
                        <ul className="text-sm text-blue-700 space-y-1">
                          <li>• Use boa iluminação</li>
                          <li>• Mantenha o documento plano</li>
                          <li>• Evite reflexos e sombras</li>
                          <li>• Certifique-se que o texto está legível</li>
                        </ul>
                      </div>

                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="text-green-600" size={16} />
                          <span className="font-medium text-green-800">Formatos Aceitos</span>
                        </div>
                        <ul className="text-sm text-green-700 space-y-1">
                          <li>• JPG, PNG (máx. 10MB)</li>
                          <li>• PDF (máx. 20MB)</li>
                          <li>• Documentos originais ou cópias autenticadas</li>
                        </ul>
                      </div>

                      <div className="p-3 bg-yellow-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="text-yellow-600" size={16} />
                          <span className="font-medium text-yellow-800">Tempo de Processamento</span>
                        </div>
                        <p className="text-sm text-yellow-700">
                          {step.estimatedTime} para análise inicial
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex justify-between mt-6">
                  <button 
                    onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
                    className="btn-professional btn-outline"
                    disabled={activeStep === 1}
                  >
                    Anterior
                  </button>
                  <button 
                    onClick={() => setActiveStep(Math.min(verificationSteps.length, activeStep + 1))}
                    className="btn-professional btn-primary"
                    disabled={activeStep === verificationSteps.length}
                  >
                    Próximo
                  </button>
                </div>
              </div>
            </div>
          )
        ))}
      </main>

      {/* Sidebar Direita - Status e Suporte */}
      <aside className="sidebar-right">
        {/* Status Geral */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <Award size={20} className="text-purple-600" />
              Status da Verificação
            </h3>
          </div>
          <div className="card-body">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Etapas concluídas</span>
                <span className="font-semibold">
                  {Object.values(verificationStatus).filter(s => s === 'verified').length}/5
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Tempo estimado restante</span>
                <span className="font-semibold">2-3 dias</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Nível atual</span>
                <span className="font-semibold text-blue-600">
                  {calculateOverallProgress() >= 80 ? 'Verificado' : 'Em andamento'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Suporte */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title">Precisa de Ajuda?</h3>
          </div>
          <div className="card-body">
            <div className="space-y-3">
              <button className="w-full btn-professional btn-outline text-left">
                <div className="flex items-center gap-2">
                  <Eye size={16} />
                  <span>Ver exemplos de documentos</span>
                </div>
              </button>
              <button className="w-full btn-professional btn-outline text-left">
                <div className="flex items-center gap-2">
                  <Download size={16} />
                  <span>Baixar guia de verificação</span>
                </div>
              </button>
              <button className="w-full btn-professional btn-outline text-left">
                <div className="flex items-center gap-2">
                  <Users size={16} />
                  <span>Falar com suporte</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title">Estatísticas</h3>
          </div>
          <div className="card-body">
            <div className="space-y-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">95%</div>
                <div className="text-xs text-gray-500">Taxa de aprovação</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">24h</div>
                <div className="text-xs text-gray-500">Tempo médio</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">1.2k</div>
                <div className="text-xs text-gray-500">Profissionais verificados</div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}

export default ProfileVerification

