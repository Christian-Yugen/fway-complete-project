import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const ProfessionalVerification = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [verificationData, setVerificationData] = useState({
    personalDocuments: {
      cpf: null,
      rg: null,
      passport: null,
      proofOfAddress: null
    },
    professionalDocuments: {
      crmCoren: null,
      professionalLicense: null,
      malpracticeInsurance: null,
      workContract: null
    },
    educationalDocuments: {
      diploma: null,
      postGraduation: null,
      residency: null,
      specialization: null
    },
    competencyDocuments: {
      certificates: [],
      awards: [],
      publications: [],
      continuingEducation: []
    },
    personalInfo: {
      fullName: '',
      profession: '',
      specialty: '',
      crmNumber: '',
      yearsExperience: '',
      currentWorkplace: '',
      bio: ''
    }
  })

  const [uploadProgress, setUploadProgress] = useState({})
  const [verificationStatus, setVerificationStatus] = useState('pending') // pending, in_review, approved, rejected

  const documentTypes = {
    personal: [
      { key: 'cpf', label: 'CPF', required: true, description: 'Documento de identificação fiscal' },
      { key: 'rg', label: 'RG ou CNH', required: true, description: 'Documento de identidade com foto' },
      { key: 'passport', label: 'Passaporte', required: false, description: 'Para profissionais estrangeiros' },
      { key: 'proofOfAddress', label: 'Comprovante de Residência', required: true, description: 'Máximo 3 meses' }
    ],
    professional: [
      { key: 'crmCoren', label: 'CRM/COREN', required: true, description: 'Registro profissional ativo' },
      { key: 'professionalLicense', label: 'Licença Profissional', required: true, description: 'Documento de habilitação' },
      { key: 'malpracticeInsurance', label: 'Seguro Responsabilidade Civil', required: true, description: 'Apólice vigente' },
      { key: 'workContract', label: 'Contrato de Trabalho', required: false, description: 'Vínculo empregatício atual' }
    ],
    educational: [
      { key: 'diploma', label: 'Diploma de Graduação', required: true, description: 'Curso superior na área da saúde' },
      { key: 'postGraduation', label: 'Pós-Graduação', required: false, description: 'Especialização, mestrado ou doutorado' },
      { key: 'residency', label: 'Certificado de Residência', required: false, description: 'Residência médica ou multiprofissional' },
      { key: 'specialization', label: 'Certificado de Especialização', required: false, description: 'Títulos de especialista' }
    ]
  }

  const verificationLevels = [
    {
      level: 'basic',
      name: 'Verificação Básica',
      badge: '<Check size={16} />',
      color: '#057642',
      requirements: ['CPF', 'RG', 'CRM/COREN', 'Diploma'],
      benefits: ['Badge de verificado', 'Maior visibilidade', 'Confiança básica']
    },
    {
      level: 'advanced',
      name: 'Verificação Avançada',
      badge: '<Trophy size={16} />',
      color: '#f5a623',
      requirements: ['Todos os documentos básicos', 'Seguro RC', 'Pós-graduação', 'Certificados'],
      benefits: ['Badge premium', 'Destaque nos resultados', 'Selo de excelência']
    },
    {
      level: 'expert',
      name: 'Verificação Expert',
      badge: '👑',
      color: '#9013fe',
      requirements: ['Verificação avançada', 'Publicações', 'Prêmios', 'Educação continuada'],
      benefits: ['Badge exclusivo', 'Prioridade máxima', 'Selo de autoridade']
    }
  ]

  const handleFileUpload = (category, documentKey, file) => {
    if (!file) return

    // Simular upload com progresso
    setUploadProgress(prev => ({ ...prev, [`${category}_${documentKey}`]: 0 }))
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const key = `${category}_${documentKey}`
        const currentProgress = prev[key] || 0
        
        if (currentProgress >= 100) {
          clearInterval(interval)
          // Atualizar dados após upload completo
          setVerificationData(prevData => ({
            ...prevData,
            [`${category}Documents`]: {
              ...prevData[`${category}Documents`],
              [documentKey]: {
                file: file,
                name: file.name,
                size: file.size,
                uploadedAt: new Date().toISOString(),
                status: 'uploaded'
              }
            }
          }))
          return { ...prev, [key]: 100 }
        }
        
        return { ...prev, [key]: currentProgress + 10 }
      })
    }, 200)
  }

  const handleInputChange = (field, value) => {
    setVerificationData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value
      }
    }))
  }

  const calculateCompletionPercentage = () => {
    const totalRequired = documentTypes.personal.filter(doc => doc.required).length +
                         documentTypes.professional.filter(doc => doc.required).length +
                         documentTypes.educational.filter(doc => doc.required).length

    const uploaded = Object.values(verificationData.personalDocuments).filter(doc => doc).length +
                    Object.values(verificationData.professionalDocuments).filter(doc => doc).length +
                    Object.values(verificationData.educationalDocuments).filter(doc => doc).length

    return Math.round((uploaded / totalRequired) * 100)
  }

  const getVerificationLevel = () => {
    const completion = calculateCompletionPercentage()
    if (completion >= 90) return verificationLevels[2] // Expert
    if (completion >= 70) return verificationLevels[1] // Advanced
    if (completion >= 50) return verificationLevels[0] // Basic
    return null
  }

  const currentLevel = getVerificationLevel()

  const renderDocumentUpload = (category, documents) => (
    <div className="card-professional">
      <div className="card-header">
        <h3 className="card-title">
          {category === 'personal' && '<User size={16} /> Documentos Pessoais'}
          {category === 'professional' && '<Building size={16} /> Documentos Profissionais'}
          {category === 'educational' && '🎓 Documentos Educacionais'}
        </h3>
        <p className="card-subtitle">
          {category === 'personal' && 'Documentos de identificação e comprovação de residência'}
          {category === 'professional' && 'Registros profissionais e licenças de atuação'}
          {category === 'educational' && 'Diplomas, certificados e títulos acadêmicos'}
        </p>
      </div>
      <div className="card-body">
        <div className="flex flex-col gap-md">
          {documents.map((doc, index) => {
            const uploadKey = `${category}_${doc.key}`
            const progress = uploadProgress[uploadKey]
            const uploadedDoc = verificationData[`${category}Documents`][doc.key]
            
            return (
              <div key={index} className="bg-light p-md">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <h5 className="font-bold text-primary">
                      {doc.label} {doc.required && <span className="text-red">*</span>}
                    </h5>
                    <p className="text-secondary text-sm">{doc.description}</p>
                  </div>
                  {uploadedDoc && (
                    <div className="flex items-center gap-sm text-green">
                      <span><Check size={16} /></span>
                      <span className="font-bold">Enviado</span>
                    </div>
                  )}
                </div>
                
                {!uploadedDoc ? (
                  <div>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload(category, doc.key, e.target.files[0])}
                      className="search-input"
                      style={{ marginBottom: 'var(--spacing-sm)' }}
                    />
                    {progress !== undefined && (
                      <div className="bg-white p-sm">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Enviando...</span>
                          <span>{progress}%</span>
                        </div>
                        <div style={{ 
                          width: '100%', 
                          height: '4px', 
                          backgroundColor: 'var(--border-color)' 
                        }}>
                          <div style={{ 
                            width: `${progress}%`, 
                            height: '100%', 
                            backgroundColor: 'var(--primary-blue)',
                            transition: 'width 0.3s ease'
                          }} />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white p-sm">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold">{uploadedDoc.name}</p>
                        <p className="text-secondary text-sm">
                          {(uploadedDoc.size / 1024 / 1024).toFixed(2)} MB • 
                          Enviado em {new Date(uploadedDoc.uploadedAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="flex gap-sm">
                        <button className="btn-professional btn-outline btn-sm">
                          👁️ Visualizar
                        </button>
                        <button 
                          className="btn-professional btn-outline btn-sm"
                          onClick={() => {
                            setVerificationData(prev => ({
                              ...prev,
                              [`${category}Documents`]: {
                                ...prev[`${category}Documents`],
                                [doc.key]: null
                              }
                            }))
                          }}
                        >
                          🗑️ Remover
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="text-xs text-muted mt-2">
                  Formatos aceitos: PDF, JPG, PNG • Tamanho máximo: 10MB
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )

  return (
    <div className="content-container">
      {/* Sidebar Esquerda - Perfil do Usuário */}
      <aside className="sidebar-left">
        <div className="card-professional profile-card">
          <div className="card-body">
            <div className="profile-avatar-large">
              <div className="profile-fallback">U</div>
            </div>
            <h3 className="profile-name">Dr. João Silva</h3>
            <p className="profile-title">Cardiologista</p>
            
            {currentLevel && (
              <div className="text-center mt-4">
                <div style={{ 
                  fontSize: '2rem',
                  marginBottom: 'var(--spacing-xs)'
                }}>
                  {currentLevel.badge}
                </div>
                <div style={{ 
                  color: currentLevel.color,
                  fontWeight: 'bold',
                  fontSize: 'var(--font-size-sm)'
                }}>
                  {currentLevel.name}
                </div>
              </div>
            )}
            
            <div className="profile-stats">
              <div className="profile-stat">
                <span className="profile-stat-number">{calculateCompletionPercentage()}%</span>
                <span className="profile-stat-label">Completo</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat-number">
                  {Object.values(verificationData.personalDocuments).filter(doc => doc).length +
                   Object.values(verificationData.professionalDocuments).filter(doc => doc).length +
                   Object.values(verificationData.educationalDocuments).filter(doc => doc).length}
                </span>
                <span className="profile-stat-label">Documentos</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progresso da Verificação */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title"><BarChart3 size={16} /> Progresso</h3>
          </div>
          <div className="card-body">
            <div className="flex flex-col gap-sm">
              {verificationLevels.map((level, index) => {
                const isActive = currentLevel && verificationLevels.indexOf(currentLevel) >= index
                return (
                  <div key={index} className={`flex items-center gap-sm ${isActive ? 'text-blue' : 'text-muted'}`}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      backgroundColor: isActive ? level.color : 'var(--text-muted)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 'var(--font-size-sm)'
                    }}>
                      {level.badge}
                    </div>
                    <div>
                      <div className="font-bold">{level.name}</div>
                      <div className="text-xs text-secondary">{level.requirements.length} requisitos</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Navegação */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title">🧭 Navegação</h3>
          </div>
          <div className="card-body">
            <nav className="flex flex-col gap-sm">
              <Link to="/profile" className="activity-action">
                <User size={16} /> Meu Perfil
              </Link>
              <Link to="/my-bookings" className="activity-action">
                <Calendar size={16} /> Minhas Consultas
              </Link>
              <Link to="/chat" className="activity-action">
                <MessageCircle size={16} /> Mensagens
              </Link>
              <Link to="/" className="activity-action">
                🏠 Início
              </Link>
            </nav>
          </div>
        </div>

        {/* Status da Verificação */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title"><Search size={16} /> Status</h3>
          </div>
          <div className="card-body">
            <div className="text-center">
              {verificationStatus === 'pending' && (
                <div>
                  <div style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}>⏳</div>
                  <div className="font-bold text-warning">Pendente</div>
                  <div className="text-secondary text-sm">Envie os documentos para iniciar</div>
                </div>
              )}
              {verificationStatus === 'in_review' && (
                <div>
                  <div style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}><Search size={16} /></div>
                  <div className="font-bold text-blue">Em Análise</div>
                  <div className="text-secondary text-sm">Analisando documentos enviados</div>
                </div>
              )}
              {verificationStatus === 'approved' && (
                <div>
                  <div style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}><Check size={16} /></div>
                  <div className="font-bold text-green">Aprovado</div>
                  <div className="text-secondary text-sm">Perfil verificado com sucesso</div>
                </div>
              )}
              {verificationStatus === 'rejected' && (
                <div>
                  <div style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}><X size={16} /></div>
                  <div className="font-bold text-red">Rejeitado</div>
                  <div className="text-secondary text-sm">Documentos precisam ser revisados</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="content-main">
        {/* Header da Verificação */}
        <div className="card-professional">
          <div className="card-body">
            <div className="flex items-center gap-md">
              <div>
                <h1 className="card-title" style={{ fontSize: 'var(--font-size-2xl)', margin: '0 0 8px 0' }}>
                  <Shield size={16} /> Verificação Profissional
                </h1>
                <p className="card-subtitle">
                  Aumente sua credibilidade e confiança enviando seus documentos para verificação
                </p>
              </div>
              <div className="text-right">
                <div style={{ 
                  fontSize: 'var(--font-size-2xl)', 
                  fontWeight: 'bold', 
                  color: currentLevel ? currentLevel.color : 'var(--text-muted)' 
                }}>
                  {calculateCompletionPercentage()}%
                </div>
                <p className="text-secondary">Completo</p>
              </div>
            </div>
          </div>
        </div>

        {/* Informações Pessoais */}
        <div className="card-professional">
          <div className="card-header">
            <h2 className="card-title"><Info size={16} /> Informações Profissionais</h2>
            <p className="card-subtitle">Complete seus dados profissionais para verificação</p>
          </div>
          <div className="card-body">
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: 'var(--spacing-md)' 
            }}>
              <div>
                <label className="font-bold text-primary">Nome Completo *</label>
                <input
                  type="text"
                  value={verificationData.personalInfo.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="search-input"
                  style={{ marginTop: 'var(--spacing-xs)', width: '100%' }}
                  placeholder="Nome completo conforme documentos"
                />
              </div>
              <div>
                <label className="font-bold text-primary">Profissão *</label>
                <select
                  value={verificationData.personalInfo.profession}
                  onChange={(e) => handleInputChange('profession', e.target.value)}
                  className="search-input"
                  style={{ marginTop: 'var(--spacing-xs)', width: '100%' }}
                >
                  <option value="">Selecione sua profissão</option>
                  <option value="medico">Médico</option>
                  <option value="enfermeiro">Enfermeiro</option>
                  <option value="fisioterapeuta">Fisioterapeuta</option>
                  <option value="psicologo">Psicólogo</option>
                  <option value="nutricionista">Nutricionista</option>
                  <option value="dentista">Dentista</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-primary">Especialidade</label>
                <input
                  type="text"
                  value={verificationData.personalInfo.specialty}
                  onChange={(e) => handleInputChange('specialty', e.target.value)}
                  className="search-input"
                  style={{ marginTop: 'var(--spacing-xs)', width: '100%' }}
                  placeholder="Ex: Cardiologia, UTI, Ortopedia"
                />
              </div>
              <div>
                <label className="font-bold text-primary">Número CRM/COREN *</label>
                <input
                  type="text"
                  value={verificationData.personalInfo.crmNumber}
                  onChange={(e) => handleInputChange('crmNumber', e.target.value)}
                  className="search-input"
                  style={{ marginTop: 'var(--spacing-xs)', width: '100%' }}
                  placeholder="Ex: CRM-SP 123456"
                />
              </div>
              <div>
                <label className="font-bold text-primary">Anos de Experiência</label>
                <input
                  type="number"
                  value={verificationData.personalInfo.yearsExperience}
                  onChange={(e) => handleInputChange('yearsExperience', e.target.value)}
                  className="search-input"
                  style={{ marginTop: 'var(--spacing-xs)', width: '100%' }}
                  placeholder="Ex: 15"
                />
              </div>
              <div>
                <label className="font-bold text-primary">Local de Trabalho Atual</label>
                <input
                  type="text"
                  value={verificationData.personalInfo.currentWorkplace}
                  onChange={(e) => handleInputChange('currentWorkplace', e.target.value)}
                  className="search-input"
                  style={{ marginTop: 'var(--spacing-xs)', width: '100%' }}
                  placeholder="Ex: Hospital Albert Einstein"
                />
              </div>
            </div>
            
            <div style={{ marginTop: 'var(--spacing-md)' }}>
              <label className="font-bold text-primary">Biografia Profissional</label>
              <textarea
                value={verificationData.personalInfo.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                className="search-input"
                style={{ 
                  marginTop: 'var(--spacing-xs)', 
                  width: '100%', 
                  minHeight: '100px',
                  resize: 'vertical'
                }}
                placeholder="Descreva sua experiência, formação e áreas de atuação..."
              />
            </div>
          </div>
        </div>

        {/* Upload de Documentos */}
        {renderDocumentUpload('personal', documentTypes.personal)}
        {renderDocumentUpload('professional', documentTypes.professional)}
        {renderDocumentUpload('educational', documentTypes.educational)}

        {/* Documentos de Competência */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title"><Trophy size={16} /> Documentos de Competência</h3>
            <p className="card-subtitle">Certificados, prêmios e publicações que comprovem sua expertise</p>
          </div>
          <div className="card-body">
            <div className="flex flex-col gap-md">
              <div className="bg-light p-md">
                <h5 className="font-bold text-primary mb-2">📜 Certificados Adicionais</h5>
                <p className="text-secondary text-sm mb-3">
                  Cursos, workshops, certificações profissionais
                </p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="search-input"
                />
              </div>
              
              <div className="bg-light p-md">
                <h5 className="font-bold text-primary mb-2">🏅 Prêmios e Reconhecimentos</h5>
                <p className="text-secondary text-sm mb-3">
                  Premiações, homenagens, reconhecimentos profissionais
                </p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="search-input"
                />
              </div>
              
              <div className="bg-light p-md">
                <h5 className="font-bold text-primary mb-2">📚 Publicações Científicas</h5>
                <p className="text-secondary text-sm mb-3">
                  Artigos, pesquisas, livros, capítulos publicados
                </p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="search-input"
                />
              </div>
              
              <div className="bg-light p-md">
                <h5 className="font-bold text-primary mb-2">🎓 Educação Continuada</h5>
                <p className="text-secondary text-sm mb-3">
                  Participação em congressos, simpósios, atualizações
                </p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="search-input"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="card-professional">
          <div className="card-body">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-bold text-primary">Pronto para enviar?</h4>
                <p className="text-secondary">
                  Revise todos os documentos antes de enviar para análise
                </p>
              </div>
              <div className="flex gap-md">
                <button className="btn-professional btn-outline">
                  <Save size={16} /> Salvar Rascunho
                </button>
                <button 
                  className="btn-professional btn-primary btn-lg"
                  onClick={() => setVerificationStatus('in_review')}
                >
                  <Rocket size={16} /> Enviar para Verificação
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Sidebar Direita */}
      <aside className="sidebar-right">
        {/* Níveis de Verificação */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title"><Trophy size={16} /> Níveis de Verificação</h3>
          </div>
          <div className="card-body">
            <div className="flex flex-col gap-md">
              {verificationLevels.map((level, index) => (
                <div key={index} className="bg-light p-sm">
                  <div className="flex items-center gap-sm mb-2">
                    <span style={{ fontSize: 'var(--font-size-lg)' }}>{level.badge}</span>
                    <h5 className="font-bold" style={{ color: level.color }}>
                      {level.name}
                    </h5>
                  </div>
                  <div className="text-xs text-secondary mb-2">
                    <strong>Requisitos:</strong>
                    <ul style={{ margin: '4px 0', paddingLeft: '16px' }}>
                      {level.requirements.map((req, i) => (
                        <li key={i}>{req}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="text-xs text-secondary">
                    <strong>Benefícios:</strong>
                    <ul style={{ margin: '4px 0', paddingLeft: '16px' }}>
                      {level.benefits.map((benefit, i) => (
                        <li key={i}>{benefit}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Processo de Verificação */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title"><Search size={16} /> Como Funciona</h3>
          </div>
          <div className="card-body">
            <div className="flex flex-col gap-sm">
              <div className="flex items-start gap-sm">
                <div style={{
                  width: '20px',
                  height: '20px',
                  backgroundColor: 'var(--primary-blue)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 'bold',
                  flexShrink: 0
                }}>
                  1
                </div>
                <div>
                  <div className="font-bold text-primary">Envio de Documentos</div>
                  <div className="text-secondary text-sm">
                    Faça upload dos documentos necessários
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-sm">
                <div style={{
                  width: '20px',
                  height: '20px',
                  backgroundColor: 'var(--primary-blue)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 'bold',
                  flexShrink: 0
                }}>
                  2
                </div>
                <div>
                  <div className="font-bold text-primary">Análise Especializada</div>
                  <div className="text-secondary text-sm">
                    Nossa equipe verifica a autenticidade
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-sm">
                <div style={{
                  width: '20px',
                  height: '20px',
                  backgroundColor: 'var(--primary-blue)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 'bold',
                  flexShrink: 0
                }}>
                  3
                </div>
                <div>
                  <div className="font-bold text-primary">Certificação</div>
                  <div className="text-secondary text-sm">
                    Receba seu badge de verificação
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tempo de Processamento */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title">⏱️ Prazos</h3>
          </div>
          <div className="card-body">
            <div className="flex flex-col gap-sm text-secondary">
              <div className="flex justify-between">
                <span>Verificação Básica:</span>
                <span className="font-bold">2-3 dias úteis</span>
              </div>
              <div className="flex justify-between">
                <span>Verificação Avançada:</span>
                <span className="font-bold">5-7 dias úteis</span>
              </div>
              <div className="flex justify-between">
                <span>Verificação Expert:</span>
                <span className="font-bold">7-10 dias úteis</span>
              </div>
            </div>
          </div>
        </div>

        {/* Suporte */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title">🆘 Precisa de Ajuda?</h3>
          </div>
          <div className="card-body">
            <div className="flex flex-col gap-sm">
              <Link to="/chat" className="btn-professional btn-outline btn-sm">
                <MessageCircle size={16} /> Chat de Suporte
              </Link>
              <button className="btn-professional btn-outline btn-sm">
                <Phone size={16} /> (11) 9999-9999
              </button>
              <button className="btn-professional btn-outline btn-sm">
                <Mail size={16} /> verificacao@fway.com
              </button>
            </div>
          </div>
        </div>

        {/* Política de Privacidade */}
        <div className="card-professional">
          <div className="card-header">
            <h3 className="card-title"><Shield size={16} /> Segurança</h3>
          </div>
          <div className="card-body">
            <div className="flex flex-col gap-sm text-secondary text-sm">
              <p>• Todos os documentos são criptografados</p>
              <p>• Armazenamento seguro em nuvem</p>
              <p>• Acesso restrito à equipe de verificação</p>
              <p>• Exclusão automática após aprovação</p>
              <p>• Conformidade com LGPD</p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}

export default ProfessionalVerification

