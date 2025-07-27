import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { physiotherapyServices } from '../data/mockData';

const PhysiotherapyBooking = () => {
  const { professionalId } = useParams();
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [sessionType, setSessionType] = useState('domicilio'); // domicilio ou clinica
  const [patientInfo, setPatientInfo] = useState({
    name: '',
    age: '',
    condition: '',
    address: '',
    phone: '',
    medical_history: '',
    current_medications: '',
    pain_level: '',
    mobility_level: '',
    goals: ''
  });

  const handleBooking = () => {
    if (!selectedService || !selectedDate || !selectedTime || !patientInfo.name) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    // Simular agendamento
    alert('Agendamento de Fisioterapia realizado com sucesso!');
    navigate('/my-bookings');
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 6; hour <= 20; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour < 20) {
        slots.push(`${hour.toString().padStart(2, '0')}:30`);
      }
    }
    return slots;
  };

  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 21; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const selectedServiceData = physiotherapyServices.find(service => service.id === selectedService);

  return (
    <Layout>
      <div className="physiotherapy-booking">
        <div className="booking-header">
          <button 
            className="back-button"
            onClick={() => navigate(-1)}
          >
            ← Voltar
          </button>
          <h1>🏃‍♂️ Agendamento Fisioterapia</h1>
          <p>Reabilitação e bem-estar com profissionais especializados</p>
        </div>

        <div className="booking-container">
          {/* Tipo de Atendimento */}
          <div className="booking-section">
            <h2><MapPin size={16} /> Local do Atendimento</h2>
            <div className="session-type-selection">
              <div 
                className={`session-type-card ${sessionType === 'domicilio' ? 'selected' : ''}`}
                onClick={() => setSessionType('domicilio')}
              >
                <div className="session-icon">🏠</div>
                <h3>Atendimento Domiciliar</h3>
                <p>Fisioterapia no conforto da sua casa</p>
                <div className="session-benefits">
                  <span>✓ Maior comodidade</span>
                  <span>✓ Ambiente familiar</span>
                  <span>✓ Sem deslocamento</span>
                </div>
              </div>
              
              <div 
                className={`session-type-card ${sessionType === 'clinica' ? 'selected' : ''}`}
                onClick={() => setSessionType('clinica')}
              >
                <div className="session-icon"><Building size={16} /></div>
                <h3>Atendimento na Clínica</h3>
                <p>Equipamentos especializados disponíveis</p>
                <div className="session-benefits">
                  <span>✓ Equipamentos completos</span>
                  <span>✓ Ambiente clínico</span>
                  <span>✓ Recursos avançados</span>
                </div>
              </div>
            </div>
          </div>

          {/* Seleção de Serviço */}
          <div className="booking-section">
            <h2><Stethoscope size={16} /> Selecione o Tipo de Fisioterapia</h2>
            <div className="services-grid">
              {physiotherapyServices.map(service => (
                <div 
                  key={service.id}
                  className={`service-card ${selectedService === service.id ? 'selected' : ''}`}
                  onClick={() => setSelectedService(service.id)}
                >
                  <h3>{service.name}</h3>
                  <p className="service-description">{service.description}</p>
                  <div className="service-details">
                    <span className="duration">⏱️ {service.duration}</span>
                    <span className="price"><DollarSign size={16} /> R$ {service.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Informações do Paciente */}
          <div className="booking-section">
            <h2><User size={16} /> Avaliação Inicial do Paciente</h2>
            <div className="patient-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Nome Completo *</label>
                  <input
                    type="text"
                    value={patientInfo.name}
                    onChange={(e) => setPatientInfo({...patientInfo, name: e.target.value})}
                    placeholder="Nome do paciente"
                  />
                </div>
                <div className="form-group">
                  <label>Idade *</label>
                  <input
                    type="number"
                    value={patientInfo.age}
                    onChange={(e) => setPatientInfo({...patientInfo, age: e.target.value})}
                    placeholder="Idade"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Condição/Diagnóstico Principal</label>
                <input
                  type="text"
                  value={patientInfo.condition}
                  onChange={(e) => setPatientInfo({...patientInfo, condition: e.target.value})}
                  placeholder="Ex: Lombalgia, AVC, fratura de fêmur, artrose..."
                />
              </div>

              {sessionType === 'domicilio' && (
                <div className="form-group">
                  <label>Endereço Completo *</label>
                  <textarea
                    value={patientInfo.address}
                    onChange={(e) => setPatientInfo({...patientInfo, address: e.target.value})}
                    placeholder="Rua, número, bairro, cidade, CEP"
                    rows="3"
                  />
                </div>
              )}

              <div className="form-group">
                <label>Telefone *</label>
                <input
                  type="tel"
                  value={patientInfo.phone}
                  onChange={(e) => setPatientInfo({...patientInfo, phone: e.target.value})}
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div className="form-group">
                <label>Histórico Médico Relevante</label>
                <textarea
                  value={patientInfo.medical_history}
                  onChange={(e) => setPatientInfo({...patientInfo, medical_history: e.target.value})}
                  placeholder="Cirurgias anteriores, lesões, doenças crônicas..."
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Medicamentos em Uso</label>
                <textarea
                  value={patientInfo.current_medications}
                  onChange={(e) => setPatientInfo({...patientInfo, current_medications: e.target.value})}
                  placeholder="Liste os medicamentos atuais..."
                  rows="2"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Nível de Dor (0-10)</label>
                  <select
                    value={patientInfo.pain_level}
                    onChange={(e) => setPatientInfo({...patientInfo, pain_level: e.target.value})}
                  >
                    <option value="">Selecione</option>
                    <option value="0">0 - Sem dor</option>
                    <option value="1-3">1-3 - Dor leve</option>
                    <option value="4-6">4-6 - Dor moderada</option>
                    <option value="7-10">7-10 - Dor intensa</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Nível de Mobilidade</label>
                  <select
                    value={patientInfo.mobility_level}
                    onChange={(e) => setPatientInfo({...patientInfo, mobility_level: e.target.value})}
                  >
                    <option value="">Selecione</option>
                    <option value="independente">Independente</option>
                    <option value="auxilio_minimo">Auxílio mínimo</option>
                    <option value="auxilio_moderado">Auxílio moderado</option>
                    <option value="dependente">Dependente</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Objetivos do Tratamento</label>
                <textarea
                  value={patientInfo.goals}
                  onChange={(e) => setPatientInfo({...patientInfo, goals: e.target.value})}
                  placeholder="O que espera alcançar com a fisioterapia?"
                  rows="3"
                />
              </div>
            </div>
          </div>

          {/* Seleção de Data e Horário */}
          <div className="booking-section">
            <h2><Calendar size={16} /> Data e Horário</h2>
            
            <div className="datetime-selection">
              <div className="date-selection">
                <h3>Selecione a Data</h3>
                <div className="dates-grid">
                  {generateDates().map(date => {
                    const dateObj = new Date(date);
                    const dayName = dateObj.toLocaleDateString('pt-BR', { weekday: 'short' });
                    const dayNumber = dateObj.getDate();
                    const month = dateObj.toLocaleDateString('pt-BR', { month: 'short' });
                    
                    return (
                      <div 
                        key={date}
                        className={`date-card ${selectedDate === date ? 'selected' : ''}`}
                        onClick={() => setSelectedDate(date)}
                      >
                        <div className="day-name">{dayName}</div>
                        <div className="day-number">{dayNumber}</div>
                        <div className="month">{month}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {selectedDate && (
                <div className="time-selection">
                  <h3>Selecione o Horário</h3>
                  <div className="times-grid">
                    {generateTimeSlots().map(time => (
                      <div 
                        key={time}
                        className={`time-card ${selectedTime === time ? 'selected' : ''}`}
                        onClick={() => setSelectedTime(time)}
                      >
                        {time}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Resumo do Agendamento */}
          {selectedService && selectedDate && selectedTime && (
            <div className="booking-section">
              <h2><FileText size={16} /> Resumo do Agendamento</h2>
              <div className="booking-summary">
                <div className="summary-item">
                  <strong>Tipo de Fisioterapia:</strong> {selectedServiceData?.name}
                </div>
                <div className="summary-item">
                  <strong>Local:</strong> {sessionType === 'domicilio' ? 'Atendimento Domiciliar' : 'Clínica'}
                </div>
                <div className="summary-item">
                  <strong>Data:</strong> {new Date(selectedDate).toLocaleDateString('pt-BR')}
                </div>
                <div className="summary-item">
                  <strong>Horário:</strong> {selectedTime}
                </div>
                <div className="summary-item">
                  <strong>Duração:</strong> {selectedServiceData?.duration}
                </div>
                <div className="summary-item">
                  <strong>Valor:</strong> R$ {selectedServiceData?.price}
                </div>
                <div className="summary-item">
                  <strong>Paciente:</strong> {patientInfo.name}
                </div>
              </div>
            </div>
          )}

          {/* Botão de Confirmação */}
          <div className="booking-actions">
            <button 
              className="confirm-booking-btn"
              onClick={handleBooking}
              disabled={!selectedService || !selectedDate || !selectedTime || !patientInfo.name}
            >
              🏃‍♂️ Confirmar Agendamento de Fisioterapia
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .physiotherapy-booking {
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px;
        }

        .booking-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .back-button {
          background: none;
          border: none;
          color: #0a66c2;
          font-size: 16px;
          cursor: pointer;
          margin-bottom: 16px;
        }

        .booking-header h1 {
          font-size: 28px;
          color: #000;
          margin-bottom: 8px;
        }

        .booking-header p {
          color: #666;
          font-size: 16px;
        }

        .booking-container {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .booking-section {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 24px;
        }

        .booking-section h2 {
          font-size: 20px;
          color: #000;
          margin-bottom: 20px;
          border-bottom: 2px solid #f0f0f0;
          padding-bottom: 12px;
        }

        .session-type-selection {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .session-type-card {
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          padding: 24px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .session-type-card:hover {
          border-color: #0a66c2;
          box-shadow: 0 4px 12px rgba(10, 102, 194, 0.1);
        }

        .session-type-card.selected {
          border-color: #0a66c2;
          background: #f0f8ff;
        }

        .session-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .session-type-card h3 {
          font-size: 18px;
          color: #000;
          margin-bottom: 8px;
        }

        .session-type-card p {
          color: #666;
          margin-bottom: 16px;
        }

        .session-benefits {
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 14px;
          color: #057642;
        }

        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 16px;
        }

        .service-card {
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .service-card:hover {
          border-color: #0a66c2;
          box-shadow: 0 2px 8px rgba(10, 102, 194, 0.1);
        }

        .service-card.selected {
          border-color: #0a66c2;
          background: #f0f8ff;
        }

        .service-card h3 {
          font-size: 16px;
          color: #000;
          margin-bottom: 8px;
        }

        .service-description {
          color: #666;
          font-size: 14px;
          margin-bottom: 12px;
        }

        .service-details {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
        }

        .duration {
          color: #666;
        }

        .price {
          color: #0a66c2;
          font-weight: bold;
        }

        .patient-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group label {
          font-weight: bold;
          color: #000;
          margin-bottom: 8px;
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
          padding: 12px;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 14px;
        }

        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
          outline: none;
          border-color: #0a66c2;
        }

        .datetime-selection {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .dates-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
          gap: 12px;
        }

        .date-card {
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          padding: 12px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .date-card:hover {
          border-color: #0a66c2;
        }

        .date-card.selected {
          border-color: #0a66c2;
          background: #f0f8ff;
        }

        .day-name {
          font-size: 12px;
          color: #666;
          text-transform: uppercase;
        }

        .day-number {
          font-size: 18px;
          font-weight: bold;
          color: #000;
          margin: 4px 0;
        }

        .month {
          font-size: 12px;
          color: #666;
        }

        .times-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
          gap: 12px;
        }

        .time-card {
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          padding: 12px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
          font-weight: bold;
        }

        .time-card:hover {
          border-color: #0a66c2;
        }

        .time-card.selected {
          border-color: #0a66c2;
          background: #f0f8ff;
        }

        .booking-summary {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #e0e0e0;
        }

        .summary-item:last-child {
          border-bottom: none;
        }

        .booking-actions {
          text-align: center;
          margin-top: 32px;
        }

        .confirm-booking-btn {
          background: #0a66c2;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 16px 32px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          transition: background 0.2s;
        }

        .confirm-booking-btn:hover:not(:disabled) {
          background: #004182;
        }

        .confirm-booking-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .session-type-selection {
            grid-template-columns: 1fr;
          }
          
          .form-row {
            grid-template-columns: 1fr;
          }
          
          .datetime-selection {
            gap: 16px;
          }
          
          .dates-grid,
          .times-grid {
            grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
          }
        }
      `}</style>
    </Layout>
  );
};

export default PhysiotherapyBooking;

