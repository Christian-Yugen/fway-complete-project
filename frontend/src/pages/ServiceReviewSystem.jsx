import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

const ServiceReviewSystem = () => {
  const { professionalId } = useParams();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(1); // 1: review, 2: dashboard, 3: analytics
  const [review, setReview] = useState({
    overall: 0,
    technical: 0,
    communication: 0,
    punctuality: 0,
    cleanliness: 0,
    wouldRecommend: null,
    comment: '',
    tags: [],
    photos: []
  });
  
  const [professional] = useState({
    id: 1,
    name: 'Dr. João Silva',
    specialty: 'Cardiologia',
    photo: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face',
    rating: 4.9,
    totalReviews: 127,
    completedServices: 156,
    responseTime: '2h',
    location: 'São Paulo, SP'
  });

  const [serviceHistory, setServiceHistory] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [showRecontractModal, setShowRecontractModal] = useState(false);

  // Carregar histórico de serviços
  useEffect(() => {
    const mockHistory = [
      {
        id: 1,
        date: '2024-01-15',
        service: 'Consulta Cardiológica Completa',
        professional: 'Dr. João Silva',
        status: 'completed',
        rating: 5,
        price: 180,
        duration: '45min'
      },
      {
        id: 2,
        date: '2024-01-08',
        service: 'Ecocardiograma',
        professional: 'Dr. João Silva',
        status: 'completed',
        rating: 4,
        price: 250,
        duration: '30min'
      },
      {
        id: 3,
        date: '2023-12-20',
        service: 'Consulta de Rotina',
        professional: 'Dra. Maria Santos',
        status: 'completed',
        rating: 5,
        price: 120,
        duration: '30min'
      }
    ];
    
    setServiceHistory(mockHistory);
    
    // Calcular analytics
    const totalSpent = mockHistory.reduce((sum, service) => sum + service.price, 0);
    const avgRating = mockHistory.reduce((sum, service) => sum + service.rating, 0) / mockHistory.length;
    const totalServices = mockHistory.length;
    
    setAnalytics({
      totalSpent,
      avgRating,
      totalServices,
      favoriteSpecialty: 'Cardiologia',
      monthlyAverage: totalSpent / 3,
      lastService: mockHistory[0]
    });
  }, []);

  // Tags disponíveis para avaliação
  const availableTags = [
    'Pontual', 'Atencioso', 'Experiente', 'Didático', 'Empático',
    'Organizado', 'Eficiente', 'Cuidadoso', 'Profissional', 'Recomendo'
  ];

  // Critérios técnicos específicos para saúde
  const technicalCriteria = [
    { key: 'technical', label: 'Competência Técnica', icon: '<Target size={16} />' },
    { key: 'communication', label: 'Comunicação', icon: '<MessageCircle size={16} />' },
    { key: 'punctuality', label: 'Pontualidade', icon: '⏰' },
    { key: 'cleanliness', label: 'Higiene e Limpeza', icon: '🧼' }
  ];

  // Atualizar avaliação
  const updateRating = (criterion, value) => {
    setReview(prev => ({
      ...prev,
      [criterion]: value
    }));
  };

  // Alternar tag
  const toggleTag = (tag) => {
    setReview(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  // Adicionar foto à avaliação
  const addReviewPhoto = (event) => {
    const files = Array.from(event.target.files);
    const newPhotos = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      url: URL.createObjectURL(file),
      timestamp: new Date()
    }));
    
    setReview(prev => ({
      ...prev,
      photos: [...prev.photos, ...newPhotos]
    }));
  };

  // Submeter avaliação
  const submitReview = () => {
    // Calcular avaliação geral
    const overallRating = Math.round(
      (review.technical + review.communication + review.punctuality + review.cleanliness) / 4
    );
    
    const finalReview = {
      ...review,
      overall: overallRating,
      professionalId,
      timestamp: new Date(),
      serviceId: Date.now()
    };
    
    console.log('Avaliação enviada:', finalReview);
    
    // Simular envio
    setTimeout(() => {
      alert('Avaliação enviada com sucesso!');
      setCurrentStep(2);
    }, 1000);
  };

  // Recontratar serviço
  const recontractService = (serviceId) => {
    const service = serviceHistory.find(s => s.id === serviceId);
    if (service) {
      // Redirecionar para criação de plano com dados pré-preenchidos
      localStorage.setItem('recontractData', JSON.stringify(service));
      navigate(`/custom-plan/${professionalId}`);
    }
  };

  // Renderizar estrelas
  const renderStars = (rating, onRate = null, size = 24) => {
    return (
      <div style={{display: 'flex', gap: '4px'}}>
        {[1, 2, 3, 4, 5].map(star => (
          <span
            key={star}
            onClick={() => onRate && onRate(star)}
            style={{
              fontSize: `${size}px`,
              color: star <= rating ? '#ffc107' : '#e0e0e0',
              cursor: onRate ? 'pointer' : 'default',
              transition: 'color 0.2s ease'
            }}
          >
            <Star size={16} />
          </span>
        ))}
      </div>
    );
  };

  // Formatar moeda
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Layout>
      <div className="content-main">
        <div className="page-header">
          <h1 className="page-title"><Star size={16} /> Sistema de Avaliações</h1>
          <p className="page-subtitle">Reviews • Dashboard • Analytics • Recontratação</p>
        </div>

        {/* Navegação por Abas */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          borderBottom: '1px solid #e0e0e0'
        }}>
          {[
            { id: 1, label: '<Star size={16} /> Avaliar', icon: '<Star size={16} />' },
            { id: 2, label: '<BarChart3 size={16} /> Dashboard', icon: '<BarChart3 size={16} />' },
            { id: 3, label: '<TrendingUp size={16} /> Analytics', icon: '<TrendingUp size={16} />' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setCurrentStep(tab.id)}
              style={{
                padding: '12px 24px',
                border: 'none',
                background: currentStep === tab.id ? '#4caf50' : 'transparent',
                color: currentStep === tab.id ? 'white' : '#666',
                borderRadius: '8px 8px 0 0',
                cursor: 'pointer',
                fontWeight: currentStep === tab.id ? 'bold' : 'normal',
                borderBottom: currentStep === tab.id ? '2px solid #4caf50' : '2px solid transparent'
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Aba 1: Avaliação */}
        {currentStep === 1 && (
          <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px'}}>
            <div>
              <div className="card-professional">
                <div className="card-header">
                  <h3 className="card-title"><Star size={16} /> Avaliar Atendimento</h3>
                </div>
                <div className="card-body">
                  <div style={{display: 'grid', gap: '24px'}}>
                    {/* Informações do Profissional */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '16px',
                      background: '#f5f5f5',
                      borderRadius: '8px'
                    }}>
                      <img 
                        src={professional.photo} 
                        alt={professional.name}
                        style={{width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover'}}
                      />
                      <div>
                        <h4 style={{margin: '0 0 4px 0'}}>{professional.name}</h4>
                        <p style={{margin: '0 0 4px 0', color: '#666'}}>{professional.specialty}</p>
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                          {renderStars(professional.rating, null, 16)}
                          <span style={{fontSize: '14px', color: '#666'}}>
                            {professional.rating} ({professional.totalReviews} avaliações)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Critérios de Avaliação */}
                    <div>
                      <h4 style={{margin: '0 0 16px 0'}}><FileText size={16} /> Critérios de Avaliação</h4>
                      <div style={{display: 'grid', gap: '16px'}}>
                        {technicalCriteria.map(criterion => (
                          <div key={criterion.key} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '16px',
                            border: '1px solid #e0e0e0',
                            borderRadius: '8px'
                          }}>
                            <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                              <span style={{fontSize: '24px'}}>{criterion.icon}</span>
                              <span style={{fontWeight: 'bold'}}>{criterion.label}</span>
                            </div>
                            {renderStars(review[criterion.key], (rating) => updateRating(criterion.key, rating))}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recomendação */}
                    <div>
                      <h4 style={{margin: '0 0 16px 0'}}>💭 Você recomendaria este profissional?</h4>
                      <div style={{display: 'flex', gap: '12px'}}>
                        <button
                          onClick={() => setReview(prev => ({...prev, wouldRecommend: true}))}
                          style={{
                            flex: 1,
                            padding: '16px',
                            border: review.wouldRecommend === true ? '2px solid #4caf50' : '1px solid #e0e0e0',
                            background: review.wouldRecommend === true ? '#e8f5e8' : 'white',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                          }}
                        >
                          👍 Sim, recomendo
                        </button>
                        <button
                          onClick={() => setReview(prev => ({...prev, wouldRecommend: false}))}
                          style={{
                            flex: 1,
                            padding: '16px',
                            border: review.wouldRecommend === false ? '2px solid #f44336' : '1px solid #e0e0e0',
                            background: review.wouldRecommend === false ? '#ffebee' : 'white',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                          }}
                        >
                          👎 Não recomendo
                        </button>
                      </div>
                    </div>

                    {/* Tags */}
                    <div>
                      <h4 style={{margin: '0 0 16px 0'}}>🏷️ Tags (opcional)</h4>
                      <div style={{display: 'flex', flexWrap: 'wrap', gap: '8px'}}>
                        {availableTags.map(tag => (
                          <button
                            key={tag}
                            onClick={() => toggleTag(tag)}
                            style={{
                              padding: '8px 16px',
                              border: review.tags.includes(tag) ? '2px solid #4caf50' : '1px solid #e0e0e0',
                              background: review.tags.includes(tag) ? '#e8f5e8' : 'white',
                              borderRadius: '20px',
                              cursor: 'pointer',
                              fontSize: '14px'
                            }}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Comentário */}
                    <div>
                      <h4 style={{margin: '0 0 16px 0'}}><MessageCircle size={16} /> Comentário Detalhado</h4>
                      <textarea
                        value={review.comment}
                        onChange={(e) => setReview(prev => ({...prev, comment: e.target.value}))}
                        placeholder="Descreva sua experiência com o atendimento, pontos positivos, sugestões de melhoria..."
                        rows="4"
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '1px solid #ccc',
                          borderRadius: '6px',
                          resize: 'vertical'
                        }}
                      />
                    </div>

                    {/* Fotos da Avaliação */}
                    <div>
                      <h4 style={{margin: '0 0 16px 0'}}><Camera size={16} /> Fotos (opcional)</h4>
                      <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
                        <label style={{
                          padding: '12px 24px',
                          background: '#2196f3',
                          color: 'white',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}>
                          <Camera size={16} /> Adicionar Fotos
                          <input 
                            type="file" 
                            multiple 
                            accept="image/*"
                            onChange={addReviewPhoto}
                            style={{display: 'none'}}
                          />
                        </label>
                        <span style={{fontSize: '14px', color: '#666'}}>
                          {review.photos.length} foto(s) adicionada(s)
                        </span>
                      </div>
                      
                      {review.photos.length > 0 && (
                        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '8px', marginTop: '12px'}}>
                          {review.photos.map((photo) => (
                            <div key={photo.id} style={{
                              width: '100px',
                              height: '100px',
                              borderRadius: '6px',
                              overflow: 'hidden',
                              border: '1px solid #e0e0e0'
                            }}>
                              <img 
                                src={photo.url} 
                                alt={photo.name}
                                style={{width: '100%', height: '100%', objectFit: 'cover'}}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Botão de Envio */}
                    <button 
                      onClick={submitReview}
                      disabled={!review.technical || !review.communication || !review.punctuality || !review.cleanliness}
                      style={{
                        padding: '16px 32px',
                        background: (review.technical && review.communication && review.punctuality && review.cleanliness) ? '#4caf50' : '#e0e0e0',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: (review.technical && review.communication && review.punctuality && review.cleanliness) ? 'pointer' : 'not-allowed',
                        fontWeight: 'bold',
                        fontSize: '18px',
                        width: '100%'
                      }}
                    >
                      <Star size={16} /> Enviar Avaliação
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar - Resumo */}
            <div>
              <div className="card-professional" style={{marginBottom: '16px'}}>
                <div className="card-header">
                  <h3 className="card-title"><BarChart3 size={16} /> Resumo da Avaliação</h3>
                </div>
                <div className="card-body">
                  <div style={{textAlign: 'center'}}>
                    <div style={{fontSize: '48px', marginBottom: '8px'}}>
                      {Math.round((review.technical + review.communication + review.punctuality + review.cleanliness) / 4) || 0}
                    </div>
                    {renderStars(Math.round((review.technical + review.communication + review.punctuality + review.cleanliness) / 4), null, 20)}
                    <div style={{fontSize: '14px', color: '#666', marginTop: '8px'}}>
                      Avaliação Geral
                    </div>
                  </div>
                  
                  <div style={{marginTop: '16px', fontSize: '14px'}}>
                    <div style={{marginBottom: '8px'}}>
                      <strong>Critérios avaliados:</strong> {[review.technical, review.communication, review.punctuality, review.cleanliness].filter(r => r > 0).length}/4
                    </div>
                    <div style={{marginBottom: '8px'}}>
                      <strong>Tags selecionadas:</strong> {review.tags.length}
                    </div>
                    <div style={{marginBottom: '8px'}}>
                      <strong>Comentário:</strong> {review.comment.length > 0 ? '<Check size={16} />' : '<X size={16} />'}
                    </div>
                    <div>
                      <strong>Fotos:</strong> {review.photos.length}
                    </div>
                  </div>
                </div>
              </div>

              <div className="card-professional">
                <div className="card-header">
                  <h3 className="card-title"><Lightbulb size={16} /> Dicas</h3>
                </div>
                <div className="card-body">
                  <div style={{fontSize: '14px', lineHeight: '1.6'}}>
                    <div style={{marginBottom: '12px'}}>
                      <Check size={16} /> <strong>Seja específico</strong> nos comentários
                    </div>
                    <div style={{marginBottom: '12px'}}>
                      <Check size={16} /> <strong>Avalie todos os critérios</strong> para ajudar outros pacientes
                    </div>
                    <div style={{marginBottom: '12px'}}>
                      <Check size={16} /> <strong>Use tags</strong> para destacar qualidades
                    </div>
                    <div>
                      <Check size={16} /> <strong>Fotos</strong> tornam a avaliação mais útil
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Aba 2: Dashboard */}
        {currentStep === 2 && (
          <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px'}}>
            <div>
              {/* Histórico de Serviços */}
              <div className="card-professional" style={{marginBottom: '24px'}}>
                <div className="card-header">
                  <h3 className="card-title"><FileText size={16} /> Histórico de Serviços</h3>
                </div>
                <div className="card-body">
                  <div style={{display: 'grid', gap: '16px'}}>
                    {serviceHistory.map(service => (
                      <div key={service.id} style={{
                        padding: '16px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        background: '#f9f9f9'
                      }}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px'}}>
                          <div>
                            <h4 style={{margin: '0 0 4px 0'}}>{service.service}</h4>
                            <p style={{margin: '0 0 4px 0', color: '#666', fontSize: '14px'}}>
                              {service.professional} • {new Date(service.date).toLocaleDateString('pt-BR')}
                            </p>
                            <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                              {renderStars(service.rating, null, 16)}
                              <span style={{fontSize: '14px', color: '#666'}}>
                                {service.duration} • {formatCurrency(service.price)}
                              </span>
                            </div>
                          </div>
                          <div style={{display: 'flex', gap: '8px'}}>
                            <button
                              onClick={() => recontractService(service.id)}
                              style={{
                                padding: '8px 16px',
                                background: '#4caf50',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              <RefreshCw size={16} /> Recontratar
                            </button>
                            <button
                              style={{
                                padding: '8px 16px',
                                background: '#2196f3',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              <File size={16} /> Relatório
                            </button>
                          </div>
                        </div>
                        
                        <div style={{
                          padding: '8px',
                          background: service.status === 'completed' ? '#e8f5e8' : '#fff3e0',
                          borderRadius: '4px',
                          fontSize: '12px',
                          textAlign: 'center',
                          color: service.status === 'completed' ? '#4caf50' : '#ff9800'
                        }}>
                          {service.status === 'completed' ? '<Check size={16} /> Concluído' : '⏳ Em andamento'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Profissionais Favoritos */}
              <div className="card-professional">
                <div className="card-header">
                  <h3 className="card-title"><Star size={16} /> Profissionais Favoritos</h3>
                </div>
                <div className="card-body">
                  <div style={{display: 'grid', gap: '16px'}}>
                    {[professional].map(prof => (
                      <div key={prof.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        padding: '16px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px'
                      }}>
                        <img 
                          src={prof.photo} 
                          alt={prof.name}
                          style={{width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover'}}
                        />
                        <div style={{flex: 1}}>
                          <h4 style={{margin: '0 0 4px 0'}}>{prof.name}</h4>
                          <p style={{margin: '0 0 4px 0', color: '#666'}}>{prof.specialty}</p>
                          <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                            {renderStars(prof.rating, null, 16)}
                            <span style={{fontSize: '14px', color: '#666'}}>
                              {prof.totalReviews} avaliações
                            </span>
                          </div>
                        </div>
                        <div style={{display: 'flex', gap: '8px'}}>
                          <button style={{
                            padding: '8px 16px',
                            background: '#4caf50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}>
                            <MessageCircle size={16} /> Chat
                          </button>
                          <button 
                            onClick={() => navigate(`/custom-plan/${prof.id}`)}
                            style={{
                              padding: '8px 16px',
                              background: '#2196f3',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            <Calendar size={16} /> Agendar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar - Estatísticas */}
            <div>
              <div className="card-professional" style={{marginBottom: '16px'}}>
                <div className="card-header">
                  <h3 className="card-title"><BarChart3 size={16} /> Suas Estatísticas</h3>
                </div>
                <div className="card-body">
                  <div style={{display: 'grid', gap: '16px'}}>
                    <div style={{textAlign: 'center'}}>
                      <div style={{fontSize: '32px', fontWeight: 'bold', color: '#4caf50'}}>
                        {formatCurrency(analytics.totalSpent)}
                      </div>
                      <div style={{fontSize: '14px', color: '#666'}}>Total Investido em Saúde</div>
                    </div>
                    
                    <div style={{textAlign: 'center'}}>
                      <div style={{fontSize: '32px', fontWeight: 'bold', color: '#2196f3'}}>
                        {analytics.totalServices}
                      </div>
                      <div style={{fontSize: '14px', color: '#666'}}>Serviços Realizados</div>
                    </div>
                    
                    <div style={{textAlign: 'center'}}>
                      <div style={{fontSize: '32px', fontWeight: 'bold', color: '#ff9800'}}>
                        {analytics.avgRating?.toFixed(1)}<Star size={16} />
                      </div>
                      <div style={{fontSize: '14px', color: '#666'}}>Avaliação Média Dada</div>
                    </div>
                    
                    <div style={{textAlign: 'center'}}>
                      <div style={{fontSize: '18px', fontWeight: 'bold', color: '#9c27b0'}}>
                        {analytics.favoriteSpecialty}
                      </div>
                      <div style={{fontSize: '14px', color: '#666'}}>Especialidade Favorita</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card-professional" style={{marginBottom: '16px'}}>
                <div className="card-header">
                  <h3 className="card-title"><Target size={16} /> Metas de Saúde</h3>
                </div>
                <div className="card-body">
                  <div style={{fontSize: '14px', lineHeight: '1.6'}}>
                    <div style={{marginBottom: '12px'}}>
                      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '4px'}}>
                        <span>Check-ups Anuais</span>
                        <span>2/4</span>
                      </div>
                      <div style={{width: '100%', height: '8px', background: '#e0e0e0', borderRadius: '4px'}}>
                        <div style={{width: '50%', height: '100%', background: '#4caf50', borderRadius: '4px'}}></div>
                      </div>
                    </div>
                    
                    <div style={{marginBottom: '12px'}}>
                      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '4px'}}>
                        <span>Exames Preventivos</span>
                        <span>3/6</span>
                      </div>
                      <div style={{width: '100%', height: '8px', background: '#e0e0e0', borderRadius: '4px'}}>
                        <div style={{width: '50%', height: '100%', background: '#2196f3', borderRadius: '4px'}}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '4px'}}>
                        <span>Orçamento Mensal</span>
                        <span>{formatCurrency(analytics.monthlyAverage)}</span>
                      </div>
                      <div style={{width: '100%', height: '8px', background: '#e0e0e0', borderRadius: '4px'}}>
                        <div style={{width: '75%', height: '100%', background: '#ff9800', borderRadius: '4px'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card-professional">
                <div className="card-header">
                  <h3 className="card-title"><Bell size={16} /> Lembretes</h3>
                </div>
                <div className="card-body">
                  <div style={{fontSize: '14px', lineHeight: '1.6'}}>
                    <div style={{marginBottom: '12px', padding: '8px', background: '#fff3e0', borderRadius: '4px'}}>
                      ⏰ <strong>Próximo check-up:</strong> Em 2 meses
                    </div>
                    <div style={{marginBottom: '12px', padding: '8px', background: '#e3f2fd', borderRadius: '4px'}}>
                      <Pill size={16} /> <strong>Renovar receita:</strong> Em 1 semana
                    </div>
                    <div style={{padding: '8px', background: '#e8f5e8', borderRadius: '4px'}}>
                      <FileText size={16} /> <strong>Exame de sangue:</strong> Agendar
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Aba 3: Analytics */}
        {currentStep === 3 && (
          <div>
            <div className="card-professional">
              <div className="card-header">
                <h3 className="card-title"><TrendingUp size={16} /> Analytics Detalhados</h3>
              </div>
              <div className="card-body">
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px'}}>
                  {/* Gráfico de Gastos */}
                  <div>
                    <h4 style={{margin: '0 0 16px 0'}}><DollarSign size={16} /> Gastos por Mês</h4>
                    <div style={{
                      height: '200px',
                      background: '#f5f5f5',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid #e0e0e0'
                    }}>
                      <div style={{textAlign: 'center', color: '#666'}}>
                        <div style={{fontSize: '48px', marginBottom: '8px'}}><BarChart3 size={16} /></div>
                        <div>Gráfico de gastos mensais</div>
                        <div style={{fontSize: '12px', marginTop: '4px'}}>
                          (Implementação com biblioteca de gráficos)
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Distribuição por Especialidade */}
                  <div>
                    <h4 style={{margin: '0 0 16px 0'}}><Building size={16} /> Distribuição por Especialidade</h4>
                    <div style={{
                      height: '200px',
                      background: '#f5f5f5',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid #e0e0e0'
                    }}>
                      <div style={{textAlign: 'center', color: '#666'}}>
                        <div style={{fontSize: '48px', marginBottom: '8px'}}>🥧</div>
                        <div>Gráfico pizza especialidades</div>
                        <div style={{fontSize: '12px', marginTop: '4px'}}>
                          (Implementação com biblioteca de gráficos)
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Evolução das Avaliações */}
                  <div>
                    <h4 style={{margin: '0 0 16px 0'}}><Star size={16} /> Evolução das Avaliações</h4>
                    <div style={{
                      height: '200px',
                      background: '#f5f5f5',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid #e0e0e0'
                    }}>
                      <div style={{textAlign: 'center', color: '#666'}}>
                        <div style={{fontSize: '48px', marginBottom: '8px'}}><TrendingUp size={16} /></div>
                        <div>Gráfico linha avaliações</div>
                        <div style={{fontSize: '12px', marginTop: '4px'}}>
                          (Implementação com biblioteca de gráficos)
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Comparativo de Preços */}
                  <div>
                    <h4 style={{margin: '0 0 16px 0'}}>💲 Comparativo de Preços</h4>
                    <div style={{
                      height: '200px',
                      background: '#f5f5f5',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid #e0e0e0'
                    }}>
                      <div style={{textAlign: 'center', color: '#666'}}>
                        <div style={{fontSize: '48px', marginBottom: '8px'}}><BarChart3 size={16} /></div>
                        <div>Gráfico barras preços</div>
                        <div style={{fontSize: '12px', marginTop: '4px'}}>
                          (Implementação com biblioteca de gráficos)
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Insights */}
                <div style={{marginTop: '24px'}}>
                  <h4 style={{margin: '0 0 16px 0'}}><Lightbulb size={16} /> Insights Personalizados</h4>
                  <div style={{display: 'grid', gap: '12px'}}>
                    <div style={{
                      padding: '16px',
                      background: '#e8f5e8',
                      borderRadius: '8px',
                      border: '1px solid #4caf50'
                    }}>
                      <strong><Check size={16} /> Parabéns!</strong> Você mantém uma frequência regular de consultas preventivas.
                    </div>
                    <div style={{
                      padding: '16px',
                      background: '#fff3e0',
                      borderRadius: '8px',
                      border: '1px solid #ff9800'
                    }}>
                      <strong><Lightbulb size={16} /> Dica:</strong> Considere agendar um check-up cardiológico anual para manter a prevenção.
                    </div>
                    <div style={{
                      padding: '16px',
                      background: '#e3f2fd',
                      borderRadius: '8px',
                      border: '1px solid #2196f3'
                    }}>
                      <strong><BarChart3 size={16} /> Economia:</strong> Você economizou R$ 120 este mês usando a plataforma Fway.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Recontratação */}
        {showRecontractModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: 'white',
              padding: '24px',
              borderRadius: '12px',
              maxWidth: '500px',
              width: '90%'
            }}>
              <h3 style={{margin: '0 0 16px 0'}}><RefreshCw size={16} /> Recontratar Serviço</h3>
              <p>Deseja recontratar o mesmo serviço com as mesmas condições?</p>
              <div style={{display: 'flex', gap: '12px', marginTop: '20px'}}>
                <button 
                  onClick={() => setShowRecontractModal(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: '#e0e0e0',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => {
                    setShowRecontractModal(false);
                    navigate(`/custom-plan/${professionalId}`);
                  }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: '#4caf50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ServiceReviewSystem;

