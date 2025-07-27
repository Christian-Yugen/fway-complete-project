import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

const AdvancedExtrasSystem = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  
  const [currentTab, setCurrentTab] = useState(1); // 1: PDFs, 2: IA Assistant, 3: Receipts, 4: Reports
  const [documents, setDocuments] = useState([]);
  const [aiChat, setAiChat] = useState([]);
  const [aiInput, setAiInput] = useState('');
  const [receipts, setReceipts] = useState([]);
  const [reports, setReports] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Dados do serviço atual
  const [serviceData] = useState({
    id: serviceId || 1,
    title: 'Consulta Cardiológica Completa',
    professional: {
      name: 'Dr. João Silva',
      crm: '12345-SP',
      specialty: 'Cardiologia',
      photo: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face'
    },
    patient: {
      name: 'Maria Silva Santos',
      cpf: '123.456.789-00',
      age: 45,
      phone: '(11) 99999-9999',
      email: 'maria@email.com'
    },
    service: {
      date: '2024-01-15',
      time: '14:30',
      duration: '45min',
      price: 180,
      location: 'Consultório - Av. Paulista, 1000',
      observations: 'Paciente apresentou pressão arterial elevada. Solicitados exames complementares.',
      vitals: {
        bloodPressure: '140/90 mmHg',
        heartRate: '78 bpm',
        temperature: '36.5°C',
        weight: '70 kg'
      },
      recommendations: 'Dieta hipossódica, exercícios leves, retorno em 30 dias'
    }
  });

  // Carregar dados iniciais
  useEffect(() => {
    loadDocuments();
    loadReceipts();
    loadReports();
    initializeAI();
  }, []);

  // Carregar documentos
  const loadDocuments = () => {
    const mockDocs = [
      {
        id: 1,
        type: 'medical_report',
        title: 'Relatório Médico - Consulta Cardiológica',
        date: '2024-01-15',
        size: '245 KB',
        status: 'generated',
        downloadUrl: '#'
      },
      {
        id: 2,
        type: 'prescription',
        title: 'Receita Médica - Medicamentos',
        date: '2024-01-15',
        size: '128 KB',
        status: 'generated',
        downloadUrl: '#'
      },
      {
        id: 3,
        type: 'exam_request',
        title: 'Solicitação de Exames',
        date: '2024-01-15',
        size: '156 KB',
        status: 'pending',
        downloadUrl: null
      }
    ];
    setDocuments(mockDocs);
  };

  // Carregar recibos
  const loadReceipts = () => {
    const mockReceipts = [
      {
        id: 1,
        number: 'REC-2024-001',
        date: '2024-01-15',
        amount: 180,
        service: 'Consulta Cardiológica',
        paymentMethod: 'Cartão de Crédito',
        status: 'paid',
        taxId: '12.345.678/0001-90'
      },
      {
        id: 2,
        number: 'REC-2024-002',
        date: '2024-01-08',
        amount: 250,
        service: 'Ecocardiograma',
        paymentMethod: 'PIX',
        status: 'paid',
        taxId: '12.345.678/0001-90'
      }
    ];
    setReceipts(mockReceipts);
  };

  // Carregar relatórios
  const loadReports = () => {
    const mockReports = [
      {
        id: 1,
        type: 'monthly',
        title: 'Relatório Mensal de Saúde',
        period: 'Janeiro 2024',
        services: 3,
        totalSpent: 550,
        status: 'available'
      },
      {
        id: 2,
        type: 'annual',
        title: 'Relatório Anual de Saúde',
        period: '2023',
        services: 12,
        totalSpent: 2400,
        status: 'available'
      }
    ];
    setReports(mockReports);
  };

  // Inicializar IA
  const initializeAI = () => {
    const welcomeMessage = {
      id: 1,
      type: 'ai',
      message: 'Olá! Sou seu assistente de IA para saúde. Posso ajudar com:\n\n• Sugestões de planos de tratamento\n• Interpretação de exames\n• Recomendações de especialistas\n• Dúvidas sobre medicamentos\n• Orientações preventivas\n\nComo posso ajudar você hoje?',
      timestamp: new Date(),
      suggestions: [
        'Interpretar meus últimos exames',
        'Sugerir plano de prevenção cardiovascular',
        'Encontrar especialista em cardiologia',
        'Orientações sobre medicamentos'
      ]
    };
    setAiChat([welcomeMessage]);
  };

  // Gerar documento PDF
  const generatePDF = async (type, title) => {
    setIsGenerating(true);
    
    try {
      // Simular geração de PDF
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newDoc = {
        id: Date.now(),
        type,
        title,
        date: new Date().toISOString().split('T')[0],
        size: Math.floor(Math.random() * 300 + 100) + ' KB',
        status: 'generated',
        downloadUrl: '#'
      };
      
      setDocuments(prev => [newDoc, ...prev]);
      alert(`${title} gerado com sucesso!`);
    } catch (error) {
      alert('Erro ao gerar documento. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Enviar mensagem para IA
  const sendAIMessage = async () => {
    if (!aiInput.trim()) return;
    
    const userMessage = {
      id: Date.now(),
      type: 'user',
      message: aiInput,
      timestamp: new Date()
    };
    
    setAiChat(prev => [...prev, userMessage]);
    setAiInput('');
    
    // Simular resposta da IA
    setTimeout(() => {
      const aiResponse = generateAIResponse(aiInput);
      setAiChat(prev => [...prev, aiResponse]);
    }, 1500);
  };

  // Gerar resposta da IA
  const generateAIResponse = (input) => {
    const responses = {
      'exames': {
        message: 'Com base nos seus últimos exames, observo:\n\n• **Pressão arterial**: 140/90 mmHg (levemente elevada)\n• **Colesterol**: Dentro dos parâmetros normais\n• **Glicemia**: Normal\n\n**Recomendações:**\n• Reduzir sal na alimentação\n• Exercícios aeróbicos 3x/semana\n• Acompanhamento em 30 dias\n\nGostaria de um plano detalhado de prevenção?',
        suggestions: ['Criar plano de exercícios', 'Dieta para hipertensão', 'Agendar retorno']
      },
      'prevenção': {
        message: 'Baseado no seu perfil (45 anos, histórico cardiovascular), sugiro:\n\n**Plano de Prevenção Cardiovascular:**\n\n🏃 **Exercícios:**\n• Caminhada 30min, 5x/semana\n• Musculação 2x/semana\n• Alongamento diário\n\n🥗 **Alimentação:**\n• Dieta mediterrânea\n• Reduzir sódio (<2g/dia)\n• Ômega-3 2x/semana\n\n<Calendar size={16} /> **Acompanhamento:**\n• Check-up a cada 6 meses\n• Ecocardiograma anual\n• Exames laboratoriais trimestrais',
        suggestions: ['Encontrar nutricionista', 'Personal trainer', 'Agendar check-up']
      },
      'especialista': {
        message: 'Para cardiologia, recomendo profissionais com base no seu perfil:\n\n👨‍⚕️ **Dr. João Silva** (atual)\n• Especialista em prevenção\n• 15 anos de experiência\n• Avaliação: 4.9<Star size={16} />\n\n👩‍⚕️ **Dra. Ana Costa**\n• Especialista em hipertensão\n• 20 anos de experiência\n• Avaliação: 4.8<Star size={16} />\n\n👨‍⚕️ **Dr. Carlos Oliveira**\n• Especialista em arritmias\n• 12 anos de experiência\n• Avaliação: 4.7<Star size={16} />\n\nQual especialidade específica você precisa?',
        suggestions: ['Agendar com Dr. João', 'Ver outros cardiologistas', 'Especialista em hipertensão']
      },
      'medicamentos': {
        message: 'Sobre medicamentos cardiovasculares:\n\n<Pill size={16} /> **Medicamentos Comuns:**\n\n**Para Hipertensão:**\n• Losartana: Reduz pressão arterial\n• Anlodipino: Vasodilatador\n• Hidroclorotiazida: Diurético\n\n**Orientações Gerais:**\n• Tomar sempre no mesmo horário\n• Não interromper sem orientação médica\n• Monitorar pressão regularmente\n\n⚠️ **Importante:** Sempre consulte seu médico antes de iniciar ou alterar medicações.\n\nTem alguma dúvida específica sobre medicamentos?',
        suggestions: ['Efeitos colaterais', 'Interações medicamentosas', 'Horários de tomada']
      }
    };
    
    // Determinar resposta baseada na entrada
    let response = responses['exames']; // padrão
    
    if (input.toLowerCase().includes('exame')) response = responses['exames'];
    else if (input.toLowerCase().includes('prevenção') || input.toLowerCase().includes('plano')) response = responses['prevenção'];
    else if (input.toLowerCase().includes('especialista') || input.toLowerCase().includes('médico')) response = responses['especialista'];
    else if (input.toLowerCase().includes('medicamento') || input.toLowerCase().includes('remédio')) response = responses['medicamentos'];
    
    return {
      id: Date.now(),
      type: 'ai',
      message: response.message,
      timestamp: new Date(),
      suggestions: response.suggestions
    };
  };

  // Gerar recibo
  const generateReceipt = () => {
    const newReceipt = {
      id: Date.now(),
      number: `REC-2024-${String(receipts.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString().split('T')[0],
      amount: serviceData.service.price,
      service: serviceData.title,
      paymentMethod: 'Cartão de Crédito',
      status: 'paid',
      taxId: '12.345.678/0001-90'
    };
    
    setReceipts(prev => [newReceipt, ...prev]);
    alert('Recibo gerado com sucesso!');
  };

  // Gerar relatório personalizado
  const generateCustomReport = (type) => {
    const newReport = {
      id: Date.now(),
      type,
      title: `Relatório ${type === 'custom' ? 'Personalizado' : 'Automático'} de Saúde`,
      period: 'Janeiro 2024',
      services: Math.floor(Math.random() * 10 + 1),
      totalSpent: Math.floor(Math.random() * 1000 + 500),
      status: 'generating'
    };
    
    setReports(prev => [newReport, ...prev]);
    
    // Simular geração
    setTimeout(() => {
      setReports(prev => prev.map(report => 
        report.id === newReport.id 
          ? { ...report, status: 'available' }
          : report
      ));
      alert('Relatório gerado com sucesso!');
    }, 3000);
  };

  // Formatar moeda
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Formatar data
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  return (
    <Layout>
      <div className="content-main">
        <div className="page-header">
          <h1 className="page-title"><File size={16} /> Extras Avançados</h1>
          <p className="page-subtitle">PDFs • IA Assistant • Recibos • Relatórios</p>
        </div>

        {/* Navegação por Abas */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          borderBottom: '1px solid #e0e0e0'
        }}>
          {[
            { id: 1, label: '<File size={16} /> PDFs', icon: '<File size={16} />' },
            { id: 2, label: '<Bot size={16} /> IA Assistant', icon: '<Bot size={16} />' },
            { id: 3, label: '🧾 Recibos', icon: '🧾' },
            { id: 4, label: '<BarChart3 size={16} /> Relatórios', icon: '<BarChart3 size={16} />' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              style={{
                padding: '12px 24px',
                border: 'none',
                background: currentTab === tab.id ? '#4caf50' : 'transparent',
                color: currentTab === tab.id ? 'white' : '#666',
                borderRadius: '8px 8px 0 0',
                cursor: 'pointer',
                fontWeight: currentTab === tab.id ? 'bold' : 'normal',
                borderBottom: currentTab === tab.id ? '2px solid #4caf50' : '2px solid transparent'
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Aba 1: PDFs */}
        {currentTab === 1 && (
          <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px'}}>
            <div>
              <div className="card-professional">
                <div className="card-header">
                  <h3 className="card-title"><File size={16} /> Geração de Documentos PDF</h3>
                </div>
                <div className="card-body">
                  <div style={{display: 'grid', gap: '20px'}}>
                    {/* Tipos de Documentos */}
                    <div>
                      <h4 style={{margin: '0 0 16px 0'}}><FileText size={16} /> Tipos de Documentos Disponíveis</h4>
                      <div style={{display: 'grid', gap: '12px'}}>
                        {[
                          { type: 'medical_report', title: 'Relatório Médico Completo', icon: '<Building size={16} />', desc: 'Relatório detalhado da consulta com diagnósticos e recomendações' },
                          { type: 'prescription', title: 'Receita Médica Digital', icon: '<Pill size={16} />', desc: 'Receita com prescrições e orientações de uso' },
                          { type: 'exam_request', title: 'Solicitação de Exames', icon: '<Microscope size={16} />', desc: 'Pedidos de exames laboratoriais e de imagem' },
                          { type: 'certificate', title: 'Atestado Médico', icon: '📜', desc: 'Atestado para fins trabalhistas ou acadêmicos' },
                          { type: 'treatment_plan', title: 'Plano de Tratamento', icon: '<FileText size={16} />', desc: 'Plano detalhado com cronograma de tratamento' }
                        ].map(doc => (
                          <div key={doc.type} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '16px',
                            border: '1px solid #e0e0e0',
                            borderRadius: '8px',
                            background: '#f9f9f9'
                          }}>
                            <div style={{display: 'flex', alignItems: 'center', gap: '12px', flex: 1}}>
                              <span style={{fontSize: '24px'}}>{doc.icon}</span>
                              <div>
                                <div style={{fontWeight: 'bold', marginBottom: '4px'}}>{doc.title}</div>
                                <div style={{fontSize: '14px', color: '#666'}}>{doc.desc}</div>
                              </div>
                            </div>
                            <button
                              onClick={() => generatePDF(doc.type, doc.title)}
                              disabled={isGenerating}
                              style={{
                                padding: '8px 16px',
                                background: isGenerating ? '#e0e0e0' : '#4caf50',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: isGenerating ? 'not-allowed' : 'pointer',
                                fontSize: '14px'
                              }}
                            >
                              {isGenerating ? '⏳' : '<File size={16} />'} Gerar
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Documentos Gerados */}
                    <div>
                      <h4 style={{margin: '0 0 16px 0'}}><FileText size={16} /> Documentos Gerados</h4>
                      <div style={{display: 'grid', gap: '12px'}}>
                        {documents.map(doc => (
                          <div key={doc.id} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '16px',
                            border: '1px solid #e0e0e0',
                            borderRadius: '8px',
                            background: doc.status === 'generated' ? '#e8f5e8' : '#fff3e0'
                          }}>
                            <div style={{display: 'flex', alignItems: 'center', gap: '12px', flex: 1}}>
                              <span style={{fontSize: '24px'}}>
                                {doc.type === 'medical_report' && '<Building size={16} />'}
                                {doc.type === 'prescription' && '<Pill size={16} />'}
                                {doc.type === 'exam_request' && '<Microscope size={16} />'}
                                {doc.type === 'certificate' && '📜'}
                                {doc.type === 'treatment_plan' && '<FileText size={16} />'}
                              </span>
                              <div>
                                <div style={{fontWeight: 'bold', marginBottom: '4px'}}>{doc.title}</div>
                                <div style={{fontSize: '14px', color: '#666'}}>
                                  {formatDate(doc.date)} • {doc.size}
                                </div>
                              </div>
                            </div>
                            <div style={{display: 'flex', gap: '8px'}}>
                              <span style={{
                                padding: '4px 8px',
                                background: doc.status === 'generated' ? '#4caf50' : '#ff9800',
                                color: 'white',
                                borderRadius: '4px',
                                fontSize: '12px'
                              }}>
                                {doc.status === 'generated' ? '<Check size={16} /> Pronto' : '⏳ Gerando'}
                              </span>
                              {doc.status === 'generated' && (
                                <button style={{
                                  padding: '8px 16px',
                                  background: '#2196f3',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '12px'
                                }}>
                                  📥 Download
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar - Informações do Serviço */}
            <div>
              <div className="card-professional" style={{marginBottom: '16px'}}>
                <div className="card-header">
                  <h3 className="card-title"><FileText size={16} /> Dados do Serviço</h3>
                </div>
                <div className="card-body">
                  <div style={{fontSize: '14px', lineHeight: '1.6'}}>
                    <div style={{marginBottom: '12px'}}>
                      <strong>Serviço:</strong><br />
                      {serviceData.title}
                    </div>
                    <div style={{marginBottom: '12px'}}>
                      <strong>Profissional:</strong><br />
                      {serviceData.professional.name}<br />
                      CRM: {serviceData.professional.crm}
                    </div>
                    <div style={{marginBottom: '12px'}}>
                      <strong>Paciente:</strong><br />
                      {serviceData.patient.name}<br />
                      CPF: {serviceData.patient.cpf}
                    </div>
                    <div style={{marginBottom: '12px'}}>
                      <strong>Data/Hora:</strong><br />
                      {formatDate(serviceData.service.date)} às {serviceData.service.time}
                    </div>
                    <div>
                      <strong>Valor:</strong><br />
                      {formatCurrency(serviceData.service.price)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="card-professional">
                <div className="card-header">
                  <h3 className="card-title"><Settings size={16} /> Configurações PDF</h3>
                </div>
                <div className="card-body">
                  <div style={{fontSize: '14px', lineHeight: '1.6'}}>
                    <div style={{marginBottom: '12px'}}>
                      <label style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                        <input type="checkbox" defaultChecked />
                        Incluir logo da clínica
                      </label>
                    </div>
                    <div style={{marginBottom: '12px'}}>
                      <label style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                        <input type="checkbox" defaultChecked />
                        Assinatura digital
                      </label>
                    </div>
                    <div style={{marginBottom: '12px'}}>
                      <label style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                        <input type="checkbox" />
                        Marca d'água de segurança
                      </label>
                    </div>
                    <div>
                      <label style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                        <input type="checkbox" defaultChecked />
                        QR Code de verificação
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Aba 2: IA Assistant */}
        {currentTab === 2 && (
          <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px'}}>
            <div>
              <div className="card-professional" style={{height: '600px', display: 'flex', flexDirection: 'column'}}>
                <div className="card-header">
                  <h3 className="card-title"><Bot size={16} /> Assistente de IA para Saúde</h3>
                </div>
                <div className="card-body" style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
                  {/* Chat Messages */}
                  <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    marginBottom: '16px',
                    padding: '16px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    background: '#f9f9f9'
                  }}>
                    {aiChat.map(message => (
                      <div key={message.id} style={{
                        marginBottom: '16px',
                        display: 'flex',
                        justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start'
                      }}>
                        <div style={{
                          maxWidth: '80%',
                          padding: '12px 16px',
                          borderRadius: '12px',
                          background: message.type === 'user' ? '#4caf50' : '#e0e0e0',
                          color: message.type === 'user' ? 'white' : '#333',
                          whiteSpace: 'pre-line'
                        }}>
                          <div>{message.message}</div>
                          {message.suggestions && (
                            <div style={{marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '8px'}}>
                              {message.suggestions.map((suggestion, index) => (
                                <button
                                  key={index}
                                  onClick={() => setAiInput(suggestion)}
                                  style={{
                                    padding: '4px 8px',
                                    background: 'rgba(255,255,255,0.2)',
                                    border: '1px solid rgba(255,255,255,0.3)',
                                    borderRadius: '12px',
                                    color: message.type === 'user' ? 'white' : '#666',
                                    fontSize: '12px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  {suggestion}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Input Area */}
                  <div style={{display: 'flex', gap: '12px'}}>
                    <input
                      type="text"
                      value={aiInput}
                      onChange={(e) => setAiInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendAIMessage()}
                      placeholder="Digite sua pergunta sobre saúde..."
                      style={{
                        flex: 1,
                        padding: '12px',
                        border: '1px solid #ccc',
                        borderRadius: '6px'
                      }}
                    />
                    <button
                      onClick={sendAIMessage}
                      disabled={!aiInput.trim()}
                      style={{
                        padding: '12px 24px',
                        background: aiInput.trim() ? '#4caf50' : '#e0e0e0',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: aiInput.trim() ? 'pointer' : 'not-allowed'
                      }}
                    >
                      <Rocket size={16} /> Enviar
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar - Recursos da IA */}
            <div>
              <div className="card-professional" style={{marginBottom: '16px'}}>
                <div className="card-header">
                  <h3 className="card-title"><Target size={16} /> Recursos da IA</h3>
                </div>
                <div className="card-body">
                  <div style={{display: 'grid', gap: '12px', fontSize: '14px'}}>
                    <div style={{padding: '8px', background: '#e8f5e8', borderRadius: '4px'}}>
                      <Search size={16} /> <strong>Análise de Exames</strong><br />
                      Interpretação inteligente de resultados
                    </div>
                    <div style={{padding: '8px', background: '#e3f2fd', borderRadius: '4px'}}>
                      <FileText size={16} /> <strong>Planos de Tratamento</strong><br />
                      Sugestões personalizadas baseadas em evidências
                    </div>
                    <div style={{padding: '8px', background: '#fff3e0', borderRadius: '4px'}}>
                      👨‍⚕️ <strong>Matching de Especialistas</strong><br />
                      Recomendações de profissionais ideais
                    </div>
                    <div style={{padding: '8px', background: '#f3e5f5', borderRadius: '4px'}}>
                      <Pill size={16} /> <strong>Orientações sobre Medicamentos</strong><br />
                      Informações sobre interações e efeitos
                    </div>
                    <div style={{padding: '8px', background: '#ffebee', borderRadius: '4px'}}>
                      🚨 <strong>Alertas Preventivos</strong><br />
                      Lembretes e recomendações de saúde
                    </div>
                  </div>
                </div>
              </div>

              <div className="card-professional" style={{marginBottom: '16px'}}>
                <div className="card-header">
                  <h3 className="card-title"><BarChart3 size={16} /> Seu Perfil de Saúde</h3>
                </div>
                <div className="card-body">
                  <div style={{fontSize: '14px', lineHeight: '1.6'}}>
                    <div style={{marginBottom: '8px'}}>
                      <strong>Idade:</strong> {serviceData.patient.age} anos
                    </div>
                    <div style={{marginBottom: '8px'}}>
                      <strong>Última consulta:</strong> Cardiologia
                    </div>
                    <div style={{marginBottom: '8px'}}>
                      <strong>Condições:</strong> Hipertensão leve
                    </div>
                    <div style={{marginBottom: '8px'}}>
                      <strong>Medicamentos:</strong> Nenhum atual
                    </div>
                    <div>
                      <strong>Próximo check-up:</strong> Em 30 dias
                    </div>
                  </div>
                </div>
              </div>

              <div className="card-professional">
                <div className="card-header">
                  <h3 className="card-title"><Lightbulb size={16} /> Dicas Rápidas</h3>
                </div>
                <div className="card-body">
                  <div style={{fontSize: '14px', lineHeight: '1.6'}}>
                    <div style={{marginBottom: '8px'}}>
                      <MessageCircle size={16} /> <strong>Seja específico</strong> nas perguntas
                    </div>
                    <div style={{marginBottom: '8px'}}>
                      <FileText size={16} /> <strong>Mencione sintomas</strong> e histórico
                    </div>
                    <div style={{marginBottom: '8px'}}>
                      <Search size={16} /> <strong>Use as sugestões</strong> para começar
                    </div>
                    <div>
                      ⚠️ <strong>Não substitui</strong> consulta médica
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Aba 3: Recibos */}
        {currentTab === 3 && (
          <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px'}}>
            <div>
              <div className="card-professional">
                <div className="card-header">
                  <h3 className="card-title">🧾 Gestão de Recibos e Faturas</h3>
                </div>
                <div className="card-body">
                  <div style={{display: 'grid', gap: '20px'}}>
                    {/* Gerar Novo Recibo */}
                    <div style={{
                      padding: '20px',
                      background: '#e8f5e8',
                      borderRadius: '8px',
                      border: '2px solid #4caf50'
                    }}>
                      <h4 style={{margin: '0 0 16px 0', color: '#4caf50'}}>➕ Gerar Novo Recibo</h4>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <div>
                          <div style={{fontWeight: 'bold', marginBottom: '4px'}}>
                            Serviço Atual: {serviceData.title}
                          </div>
                          <div style={{fontSize: '14px', color: '#666'}}>
                            Valor: {formatCurrency(serviceData.service.price)} • Data: {formatDate(serviceData.service.date)}
                          </div>
                        </div>
                        <button
                          onClick={generateReceipt}
                          style={{
                            padding: '12px 24px',
                            background: '#4caf50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                          }}
                        >
                          🧾 Gerar Recibo
                        </button>
                      </div>
                    </div>

                    {/* Lista de Recibos */}
                    <div>
                      <h4 style={{margin: '0 0 16px 0'}}><FileText size={16} /> Recibos Emitidos</h4>
                      <div style={{display: 'grid', gap: '12px'}}>
                        {receipts.map(receipt => (
                          <div key={receipt.id} style={{
                            padding: '16px',
                            border: '1px solid #e0e0e0',
                            borderRadius: '8px',
                            background: '#f9f9f9'
                          }}>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px'}}>
                              <div>
                                <div style={{fontWeight: 'bold', marginBottom: '4px'}}>
                                  Recibo #{receipt.number}
                                </div>
                                <div style={{fontSize: '14px', color: '#666', marginBottom: '4px'}}>
                                  {receipt.service} • {formatDate(receipt.date)}
                                </div>
                                <div style={{fontSize: '14px', color: '#666'}}>
                                  Pagamento: {receipt.paymentMethod}
                                </div>
                              </div>
                              <div style={{textAlign: 'right'}}>
                                <div style={{fontSize: '18px', fontWeight: 'bold', color: '#4caf50'}}>
                                  {formatCurrency(receipt.amount)}
                                </div>
                                <div style={{
                                  padding: '4px 8px',
                                  background: receipt.status === 'paid' ? '#4caf50' : '#ff9800',
                                  color: 'white',
                                  borderRadius: '4px',
                                  fontSize: '12px',
                                  marginTop: '4px'
                                }}>
                                  {receipt.status === 'paid' ? '<Check size={16} /> Pago' : '⏳ Pendente'}
                                </div>
                              </div>
                            </div>
                            
                            <div style={{display: 'flex', gap: '8px'}}>
                              <button style={{
                                padding: '8px 16px',
                                background: '#2196f3',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}>
                                📥 Download PDF
                              </button>
                              <button style={{
                                padding: '8px 16px',
                                background: '#ff9800',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}>
                                <Mail size={16} /> Enviar por Email
                              </button>
                              <button style={{
                                padding: '8px 16px',
                                background: '#9c27b0',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}>
                                🔗 Compartilhar
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar - Informações Fiscais */}
            <div>
              <div className="card-professional" style={{marginBottom: '16px'}}>
                <div className="card-header">
                  <h3 className="card-title"><BarChart3 size={16} /> Resumo Fiscal</h3>
                </div>
                <div className="card-body">
                  <div style={{textAlign: 'center', marginBottom: '16px'}}>
                    <div style={{fontSize: '32px', fontWeight: 'bold', color: '#4caf50'}}>
                      {formatCurrency(receipts.reduce((sum, r) => sum + r.amount, 0))}
                    </div>
                    <div style={{fontSize: '14px', color: '#666'}}>Total em Recibos</div>
                  </div>
                  
                  <div style={{fontSize: '14px', lineHeight: '1.6'}}>
                    <div style={{marginBottom: '8px'}}>
                      <strong>Recibos emitidos:</strong> {receipts.length}
                    </div>
                    <div style={{marginBottom: '8px'}}>
                      <strong>Valor médio:</strong> {formatCurrency(receipts.reduce((sum, r) => sum + r.amount, 0) / receipts.length)}
                    </div>
                    <div style={{marginBottom: '8px'}}>
                      <strong>Último recibo:</strong> {formatDate(receipts[0]?.date)}
                    </div>
                    <div>
                      <strong>CNPJ:</strong> {receipts[0]?.taxId}
                    </div>
                  </div>
                </div>
              </div>

              <div className="card-professional" style={{marginBottom: '16px'}}>
                <div className="card-header">
                  <h3 className="card-title"><Settings size={16} /> Configurações</h3>
                </div>
                <div className="card-body">
                  <div style={{fontSize: '14px', lineHeight: '1.6'}}>
                    <div style={{marginBottom: '12px'}}>
                      <label style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                        <input type="checkbox" defaultChecked />
                        Gerar recibo automaticamente
                      </label>
                    </div>
                    <div style={{marginBottom: '12px'}}>
                      <label style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                        <input type="checkbox" defaultChecked />
                        Enviar por email
                      </label>
                    </div>
                    <div style={{marginBottom: '12px'}}>
                      <label style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                        <input type="checkbox" />
                        Incluir QR Code PIX
                      </label>
                    </div>
                    <div>
                      <label style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                        <input type="checkbox" defaultChecked />
                        Numeração sequencial
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card-professional">
                <div className="card-header">
                  <h3 className="card-title"><FileText size={16} /> Modelos</h3>
                </div>
                <div className="card-body">
                  <div style={{display: 'grid', gap: '8px', fontSize: '14px'}}>
                    <button style={{
                      padding: '8px',
                      background: '#e3f2fd',
                      border: '1px solid #2196f3',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}>
                      <File size={16} /> Recibo Simples
                    </button>
                    <button style={{
                      padding: '8px',
                      background: '#e8f5e8',
                      border: '1px solid #4caf50',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}>
                      <FileText size={16} /> Recibo Detalhado
                    </button>
                    <button style={{
                      padding: '8px',
                      background: '#fff3e0',
                      border: '1px solid #ff9800',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}>
                      <Building size={16} /> Recibo Médico
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Aba 4: Relatórios */}
        {currentTab === 4 && (
          <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px'}}>
            <div>
              <div className="card-professional">
                <div className="card-header">
                  <h3 className="card-title"><BarChart3 size={16} /> Relatórios Personalizados</h3>
                </div>
                <div className="card-body">
                  <div style={{display: 'grid', gap: '20px'}}>
                    {/* Gerar Relatórios */}
                    <div>
                      <h4 style={{margin: '0 0 16px 0'}}>➕ Gerar Novos Relatórios</h4>
                      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
                        <button
                          onClick={() => generateCustomReport('monthly')}
                          style={{
                            padding: '16px',
                            background: '#e3f2fd',
                            border: '2px solid #2196f3',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            textAlign: 'left'
                          }}
                        >
                          <div style={{fontSize: '24px', marginBottom: '8px'}}><Calendar size={16} /></div>
                          <div style={{fontWeight: 'bold', marginBottom: '4px'}}>Relatório Mensal</div>
                          <div style={{fontSize: '14px', color: '#666'}}>
                            Resumo de serviços e gastos do mês
                          </div>
                        </button>
                        
                        <button
                          onClick={() => generateCustomReport('annual')}
                          style={{
                            padding: '16px',
                            background: '#e8f5e8',
                            border: '2px solid #4caf50',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            textAlign: 'left'
                          }}
                        >
                          <div style={{fontSize: '24px', marginBottom: '8px'}}><BarChart3 size={16} /></div>
                          <div style={{fontWeight: 'bold', marginBottom: '4px'}}>Relatório Anual</div>
                          <div style={{fontSize: '14px', color: '#666'}}>
                            Análise completa do ano
                          </div>
                        </button>
                        
                        <button
                          onClick={() => generateCustomReport('custom')}
                          style={{
                            padding: '16px',
                            background: '#fff3e0',
                            border: '2px solid #ff9800',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            textAlign: 'left'
                          }}
                        >
                          <div style={{fontSize: '24px', marginBottom: '8px'}}><Settings size={16} /></div>
                          <div style={{fontWeight: 'bold', marginBottom: '4px'}}>Relatório Personalizado</div>
                          <div style={{fontSize: '14px', color: '#666'}}>
                            Configure período e filtros
                          </div>
                        </button>
                        
                        <button
                          onClick={() => generateCustomReport('health')}
                          style={{
                            padding: '16px',
                            background: '#f3e5f5',
                            border: '2px solid #9c27b0',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            textAlign: 'left'
                          }}
                        >
                          <div style={{fontSize: '24px', marginBottom: '8px'}}><Building size={16} /></div>
                          <div style={{fontWeight: 'bold', marginBottom: '4px'}}>Relatório de Saúde</div>
                          <div style={{fontSize: '14px', color: '#666'}}>
                            Histórico médico completo
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Relatórios Gerados */}
                    <div>
                      <h4 style={{margin: '0 0 16px 0'}}><FileText size={16} /> Relatórios Disponíveis</h4>
                      <div style={{display: 'grid', gap: '12px'}}>
                        {reports.map(report => (
                          <div key={report.id} style={{
                            padding: '16px',
                            border: '1px solid #e0e0e0',
                            borderRadius: '8px',
                            background: report.status === 'available' ? '#f9f9f9' : '#fff3e0'
                          }}>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px'}}>
                              <div>
                                <div style={{fontWeight: 'bold', marginBottom: '4px'}}>
                                  {report.title}
                                </div>
                                <div style={{fontSize: '14px', color: '#666', marginBottom: '4px'}}>
                                  Período: {report.period}
                                </div>
                                <div style={{fontSize: '14px', color: '#666'}}>
                                  {report.services} serviços • {formatCurrency(report.totalSpent)}
                                </div>
                              </div>
                              <div style={{textAlign: 'right'}}>
                                <div style={{
                                  padding: '4px 8px',
                                  background: report.status === 'available' ? '#4caf50' : '#ff9800',
                                  color: 'white',
                                  borderRadius: '4px',
                                  fontSize: '12px',
                                  marginBottom: '8px'
                                }}>
                                  {report.status === 'available' ? '<Check size={16} /> Disponível' : '⏳ Gerando'}
                                </div>
                              </div>
                            </div>
                            
                            {report.status === 'available' && (
                              <div style={{display: 'flex', gap: '8px'}}>
                                <button style={{
                                  padding: '8px 16px',
                                  background: '#2196f3',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '12px'
                                }}>
                                  📥 Download PDF
                                </button>
                                <button style={{
                                  padding: '8px 16px',
                                  background: '#4caf50',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '12px'
                                }}>
                                  👁️ Visualizar
                                </button>
                                <button style={{
                                  padding: '8px 16px',
                                  background: '#ff9800',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '12px'
                                }}>
                                  <Mail size={16} /> Enviar
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar - Estatísticas */}
            <div>
              <div className="card-professional" style={{marginBottom: '16px'}}>
                <div className="card-header">
                  <h3 className="card-title"><TrendingUp size={16} /> Estatísticas</h3>
                </div>
                <div className="card-body">
                  <div style={{display: 'grid', gap: '16px'}}>
                    <div style={{textAlign: 'center'}}>
                      <div style={{fontSize: '24px', fontWeight: 'bold', color: '#2196f3'}}>
                        {reports.filter(r => r.status === 'available').length}
                      </div>
                      <div style={{fontSize: '14px', color: '#666'}}>Relatórios Disponíveis</div>
                    </div>
                    
                    <div style={{textAlign: 'center'}}>
                      <div style={{fontSize: '24px', fontWeight: 'bold', color: '#4caf50'}}>
                        {reports.reduce((sum, r) => sum + r.services, 0)}
                      </div>
                      <div style={{fontSize: '14px', color: '#666'}}>Total de Serviços</div>
                    </div>
                    
                    <div style={{textAlign: 'center'}}>
                      <div style={{fontSize: '24px', fontWeight: 'bold', color: '#ff9800'}}>
                        {formatCurrency(reports.reduce((sum, r) => sum + r.totalSpent, 0))}
                      </div>
                      <div style={{fontSize: '14px', color: '#666'}}>Valor Total</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card-professional" style={{marginBottom: '16px'}}>
                <div className="card-header">
                  <h3 className="card-title"><Settings size={16} /> Configurações</h3>
                </div>
                <div className="card-body">
                  <div style={{fontSize: '14px', lineHeight: '1.6'}}>
                    <div style={{marginBottom: '12px'}}>
                      <label style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                        <input type="checkbox" defaultChecked />
                        Relatórios automáticos mensais
                      </label>
                    </div>
                    <div style={{marginBottom: '12px'}}>
                      <label style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                        <input type="checkbox" />
                        Incluir gráficos detalhados
                      </label>
                    </div>
                    <div style={{marginBottom: '12px'}}>
                      <label style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                        <input type="checkbox" defaultChecked />
                        Comparação com período anterior
                      </label>
                    </div>
                    <div>
                      <label style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                        <input type="checkbox" />
                        Envio automático por email
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card-professional">
                <div className="card-header">
                  <h3 className="card-title"><FileText size={16} /> Filtros Disponíveis</h3>
                </div>
                <div className="card-body">
                  <div style={{fontSize: '14px', lineHeight: '1.6'}}>
                    <div style={{marginBottom: '8px'}}>
                      <Calendar size={16} /> <strong>Período:</strong> Personalizado
                    </div>
                    <div style={{marginBottom: '8px'}}>
                      <Building size={16} /> <strong>Especialidade:</strong> Todas
                    </div>
                    <div style={{marginBottom: '8px'}}>
                      👨‍⚕️ <strong>Profissional:</strong> Todos
                    </div>
                    <div style={{marginBottom: '8px'}}>
                      <DollarSign size={16} /> <strong>Valor:</strong> Qualquer
                    </div>
                    <div>
                      <MapPin size={16} /> <strong>Local:</strong> Todos
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdvancedExtrasSystem;

