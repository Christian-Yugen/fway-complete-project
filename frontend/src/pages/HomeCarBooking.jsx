import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { homeCarServices } from '../data/mockData';

const HomeCarBooking = () => {
  const { professionalId } = useParams();
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [patientInfo, setPatientInfo] = useState({
    name: '',
    age: '',
    condition: '',
    address: '',
    phone: '',
    emergency_contact: '',
    observations: ''
  });

  const handleBooking = () => {
    if (!selectedService || !selectedDate || !selectedTime || !patientInfo.name) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    // Simular agendamento
    alert('Agendamento de Home Care realizado com sucesso!');
    navigate('/my-bookings');
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 7; hour <= 18; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour < 18) {
        slots.push(`${hour.toString().padStart(2, '0')}:30`);
      }
    }
    return slots;
  };

  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const selectedServiceData = homeCarServices.find(service => service.id === selectedService);

  return (
    <Layout>
      <div className="home-care-booking">
        <div className="booking-header">
          <button 
            className="back-button"
            onClick={() => navigate(-1)}
          >
            ← Voltar
          </button>
          <h1>🏠 Agendamento Home Care</h1>
          <p>Cuidados de enfermagem no conforto do seu lar</p>
        </div>

        <div className="booking-container">
          {/* Seleção de Serviço */}
          <div className="booking-section">
            <h2><Stethoscope size={16} /> Selecione o Serviço</h2>
            <div className="services-grid">
              {homeCarServices.map(service => (
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
            <h2><User size={16} /> Informações do Paciente</h2>
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
                <label>Condição/Diagnóstico</label>
                <input
                  type="text"
                  value={patientInfo.condition}
                  onChange={(e) => setPatientInfo({...patientInfo, condition: e.target.value})}
                  placeholder="Ex: Pós-operatório, diabetes, hipertensão..."
                />
              </div>

              <div className="form-group">
                <label>Endereço Completo *</label>
                <textarea
                  value={patientInfo.address}
                  onChange={(e) => setPatientInfo({...patientInfo, address: e.target.value})}
                  placeholder="Rua, número, bairro, cidade, CEP"
                  rows="3"
                />
              </div>

              <div className="form-row">
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
                  <label>Contato de Emergência</label>
                  <input
                    type="tel"
                    value={patientInfo.emergency_contact}
                    onChange={(e) => setPatientInfo({...patientInfo, emergency_contact: e.target.value})}
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Observações Importantes</label>
                <textarea
                  value={patientInfo.observations}
                  onChange={(e) => setPatientInfo({...patientInfo, observations: e.target.value})}
                  placeholder="Medicamentos em uso, alergias, cuidados especiais..."
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
                  <strong>Serviço:</strong> {selectedServiceData?.name}
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
              🏠 Confirmar Agendamento Home Care
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .home-care-booking {
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
        .form-group textarea {
          padding: 12px;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 14px;
        }

        .form-group input:focus,
        .form-group textarea:focus {
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

export default HomeCarBooking;

