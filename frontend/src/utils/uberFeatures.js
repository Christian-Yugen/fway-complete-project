// ===== FUNCIONALIDADES UBER ADAPTADAS PARA FWAY =====

// 1. SOLICITAÇÃO DE SERVIÇO PROFISSIONAL
export const serviceRequestSystem = {
  // Tipos de serviços de saúde disponíveis
  serviceTypes: [
    {
      id: 'medicina',
      name: 'Consulta Médica',
      icon: 'Stethoscope',
      estimatedTime: '30-60 min',
      priceRange: 'R$ 150-500',
      specialties: ['Cardiologia', 'Dermatologia', 'Pediatria', 'Ginecologia', 'Ortopedia', 'Neurologia']
    },
    {
      id: 'homecare',
      name: 'Enfermagem (Home Care)',
      icon: 'Home',
      estimatedTime: '1-4 horas',
      priceRange: 'R$ 80-300',
      specialties: ['Cuidados Básicos', 'Medicação', 'Curativos', 'Acompanhamento', 'Pós-Cirúrgico']
    },
    {
      id: 'fisioterapia',
      name: 'Fisioterapia',
      icon: 'Activity',
      estimatedTime: '45-90 min',
      priceRange: 'R$ 100-250',
      specialties: ['Ortopédica', 'Neurológica', 'Respiratória', 'Esportiva', 'Geriátrica', 'Pediátrica']
    },
    {
      id: 'psicologia',
      name: 'Psicologia',
      icon: 'Brain',
      estimatedTime: '50 min',
      priceRange: 'R$ 120-400',
      specialties: ['Clínica', 'Infantil', 'Casal', 'Familiar', 'Organizacional', 'Neuropsicologia']
    },
    {
      id: 'nutricao',
      name: 'Nutrição',
      icon: 'Apple',
      estimatedTime: '60 min',
      priceRange: 'R$ 100-300',
      specialties: ['Clínica', 'Esportiva', 'Infantil', 'Geriátrica', 'Funcional', 'Comportamental']
    },
    {
      id: 'enfermagem',
      name: 'Enfermagem Especializada',
      icon: 'Heart',
      estimatedTime: '2-6 horas',
      priceRange: 'R$ 120-400',
      specialties: ['UTI', 'Pediatria', 'Geriatria', 'Oncologia', 'Psiquiatria', 'Emergência']
    }
  ],

  // Urgência do serviço médico
  urgencyLevels: [
    { id: 'routine', name: 'Consulta de Rotina', multiplier: 1.0, description: 'Agendamento normal (até 7 dias)' },
    { id: 'priority', name: 'Prioritário', multiplier: 1.3, description: 'Necessário em 24-48h (+30%)' },
    { id: 'urgent', name: 'Urgente', multiplier: 1.8, description: 'Necessário no mesmo dia (+80%)' },
    { id: 'emergency', name: 'Emergência', multiplier: 2.5, description: 'Atendimento imediato (+150%)' }
  ],

  // Tipos de atendimento
  attendanceTypes: [
    { id: 'clinic', name: 'Presencial - Clínica', icon: 'Building', description: 'Na clínica do profissional' },
    { id: 'home', name: 'Domiciliar', icon: 'Home', description: 'Na residência do paciente', extraCost: 50 },
    { id: 'online', name: 'Telemedicina', icon: 'Video', description: 'Consulta online por videochamada', discount: 20 },
    { id: 'hospital', name: 'Hospitalar', icon: 'Hospital', description: 'Em ambiente hospitalar', extraCost: 100 }
  ],

  // Criar solicitação de serviço
  createServiceRequest: (requestData) => {
    const request = {
      id: Date.now().toString(),
      clientId: requestData.clientId,
      serviceType: requestData.serviceType,
      specialty: requestData.specialty,
      urgency: requestData.urgency,
      attendanceType: requestData.attendanceType,
      preferredDate: requestData.preferredDate,
      preferredTime: requestData.preferredTime,
      location: requestData.location,
      description: requestData.description,
      estimatedPrice: requestData.estimatedPrice,
      status: 'searching', // searching, matched, accepted, in_progress, completed, cancelled
      createdAt: new Date().toISOString()
    };

    // Salvar solicitação
    const requests = JSON.parse(localStorage.getItem('serviceRequests') || '[]');
    requests.push(request);
    localStorage.setItem('serviceRequests', JSON.stringify(requests));

    return request;
  },

  // Calcular preço estimado
  calculateEstimatedPrice: (serviceType, urgency, attendanceType, specialty) => {
    const service = serviceRequestSystem.serviceTypes.find(s => s.id === serviceType);
    const urgencyLevel = serviceRequestSystem.urgencyLevels.find(u => u.id === urgency);
    const attendance = serviceRequestSystem.attendanceTypes.find(a => a.id === attendanceType);

    if (!service || !urgencyLevel || !attendance) return 0;

    // Preço base (média do range)
    const priceRange = service.priceRange.match(/\d+/g);
    const basePrice = (parseInt(priceRange[0]) + parseInt(priceRange[1])) / 2;

    // Aplicar multiplicadores
    let finalPrice = basePrice * urgencyLevel.multiplier;

    // Aplicar custos/descontos do tipo de atendimento
    if (attendance.extraCost) {
      finalPrice += attendance.extraCost;
    }
    if (attendance.discount) {
      finalPrice -= attendance.discount;
    }

    return Math.round(finalPrice);
  }
};

// 2. SISTEMA DE GEOLOCALIZAÇÃO AVANÇADA
export const geolocationSystem = {
  // Obter localização atual
  getCurrentLocation: () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalização não suportada'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    });
  },

  // Calcular distância entre dois pontos
  calculateDistance: (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  },

  // Buscar profissionais próximos
  findNearbyProfessionals: async (userLocation, serviceType, radius = 10) => {
    // Simular dados de profissionais
    const mockProfessionals = [
      {
        id: '1',
        name: 'Dr. João Silva',
        specialty: 'Cardiologia',
        rating: 4.8,
        reviews: 127,
        distance: 2.3,
        estimatedTime: '15 min',
        price: 250,
        available: true,
        location: { lat: -23.5505, lng: -46.6333 }
      },
      {
        id: '2',
        name: 'Enf. Maria Santos',
        specialty: 'Home Care',
        rating: 4.9,
        reviews: 89,
        distance: 1.8,
        estimatedTime: '12 min',
        price: 180,
        available: true,
        location: { lat: -23.5489, lng: -46.6388 }
      },
      {
        id: '3',
        name: 'Ft. Ana Costa',
        specialty: 'Fisioterapia',
        rating: 4.7,
        reviews: 156,
        distance: 3.1,
        estimatedTime: '20 min',
        price: 150,
        available: false,
        location: { lat: -23.5567, lng: -46.6298 }
      }
    ];

    // Filtrar por distância e tipo de serviço
    return mockProfessionals
      .filter(prof => prof.distance <= radius)
      .sort((a, b) => a.distance - b.distance);
  },

  // Estimar tempo de chegada
  estimateArrivalTime: (distance) => {
    // Velocidade média urbana: 25 km/h
    const timeInHours = distance / 25;
    const timeInMinutes = Math.round(timeInHours * 60);
    return `${timeInMinutes} min`;
  }
};

// 3. SISTEMA DE AVALIAÇÕES BILATERAL
export const ratingSystem = {
  // Criar avaliação
  createRating: (ratingData) => {
    const rating = {
      id: Date.now().toString(),
      serviceId: ratingData.serviceId,
      fromUserId: ratingData.fromUserId,
      toUserId: ratingData.toUserId,
      rating: ratingData.rating, // 1-5
      comment: ratingData.comment,
      tags: ratingData.tags || [],
      type: ratingData.type, // 'client_to_professional' ou 'professional_to_client'
      createdAt: new Date().toISOString()
    };

    // Salvar avaliação
    const ratings = JSON.parse(localStorage.getItem('ratings') || '[]');
    ratings.push(rating);
    localStorage.setItem('ratings', JSON.stringify(ratings));

    return rating;
  },

  // Obter avaliações de um usuário
  getUserRatings: (userId, type = 'received') => {
    const ratings = JSON.parse(localStorage.getItem('ratings') || '[]');
    return ratings.filter(rating => 
      type === 'received' ? rating.toUserId === userId : rating.fromUserId === userId
    );
  },

  // Calcular média de avaliações
  calculateAverageRating: (userId) => {
    const ratings = ratingSystem.getUserRatings(userId, 'received');
    if (ratings.length === 0) return 0;
    
    const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0);
    return (sum / ratings.length).toFixed(1);
  }
};

// 4. SISTEMA DE HISTÓRICO
export const historySystem = {
  // Adicionar item ao histórico
  addToHistory: (historyData) => {
    const historyItem = {
      id: Date.now().toString(),
      userId: historyData.userId,
      type: historyData.type, // 'service_requested', 'service_provided'
      serviceId: historyData.serviceId,
      title: historyData.title,
      description: historyData.description,
      amount: historyData.amount,
      status: historyData.status,
      date: historyData.date,
      createdAt: new Date().toISOString()
    };

    const history = JSON.parse(localStorage.getItem('userHistory') || '[]');
    history.unshift(historyItem);
    localStorage.setItem('userHistory', JSON.stringify(history));

    return historyItem;
  },

  // Obter histórico do usuário
  getUserHistory: (userId, filters = {}) => {
    const history = JSON.parse(localStorage.getItem('userHistory') || '[]');
    let userHistory = history.filter(item => item.userId === userId);

    if (filters.type) {
      userHistory = userHistory.filter(item => item.type === filters.type);
    }

    if (filters.status) {
      userHistory = userHistory.filter(item => item.status === filters.status);
    }

    return userHistory;
  }
};

// 5. SISTEMA DE PRECIFICAÇÃO DINÂMICA
export const dynamicPricing = {
  // Fatores de preço
  pricingFactors: {
    demand: { low: 0.9, medium: 1.0, high: 1.3 },
    timeOfDay: { 
      morning: 1.0,    // 6-12h
      afternoon: 1.1,  // 12-18h
      evening: 1.2,    // 18-22h
      night: 1.5       // 22-6h
    },
    dayOfWeek: {
      weekday: 1.0,
      weekend: 1.2
    },
    urgency: {
      routine: 1.0,
      priority: 1.3,
      urgent: 1.8,
      emergency: 2.5
    }
  },

  // Calcular preço dinâmico
  calculateDynamicPrice: (basePrice, factors) => {
    let finalPrice = basePrice;

    // Aplicar fatores
    if (factors.demand) {
      finalPrice *= dynamicPricing.pricingFactors.demand[factors.demand];
    }

    if (factors.timeOfDay) {
      finalPrice *= dynamicPricing.pricingFactors.timeOfDay[factors.timeOfDay];
    }

    if (factors.dayOfWeek) {
      finalPrice *= dynamicPricing.pricingFactors.dayOfWeek[factors.dayOfWeek];
    }

    if (factors.urgency) {
      finalPrice *= dynamicPricing.pricingFactors.urgency[factors.urgency];
    }

    return Math.round(finalPrice);
  },

  // Obter fator de demanda atual
  getCurrentDemandFactor: (serviceType, location) => {
    // Simular demanda baseada em horário
    const hour = new Date().getHours();
    
    if (hour >= 8 && hour <= 10) return 'high';   // Pico manhã
    if (hour >= 17 && hour <= 19) return 'high';  // Pico tarde
    if (hour >= 11 && hour <= 16) return 'medium'; // Meio dia
    return 'low'; // Outros horários
  }
};

// 6. SISTEMA DE CANCELAMENTO
export const cancellationSystem = {
  // Políticas de cancelamento
  cancellationPolicies: {
    free: { timeLimit: 24, fee: 0, description: 'Cancelamento gratuito até 24h antes' },
    partial: { timeLimit: 2, fee: 0.3, description: 'Taxa de 30% se cancelar com menos de 2h' },
    full: { timeLimit: 0, fee: 1.0, description: 'Taxa integral para cancelamentos de última hora' }
  },

  // Calcular taxa de cancelamento
  calculateCancellationFee: (servicePrice, hoursUntilService) => {
    let policy;
    
    if (hoursUntilService >= 24) {
      policy = cancellationSystem.cancellationPolicies.free;
    } else if (hoursUntilService >= 2) {
      policy = cancellationSystem.cancellationPolicies.partial;
    } else {
      policy = cancellationSystem.cancellationPolicies.full;
    }

    return {
      fee: Math.round(servicePrice * policy.fee),
      policy: policy.description
    };
  },

  // Processar cancelamento
  processCancellation: (serviceId, userId, reason) => {
    const cancellation = {
      id: Date.now().toString(),
      serviceId: serviceId,
      userId: userId,
      reason: reason,
      timestamp: new Date().toISOString(),
      status: 'processed'
    };

    // Salvar cancelamento
    const cancellations = JSON.parse(localStorage.getItem('cancellations') || '[]');
    cancellations.push(cancellation);
    localStorage.setItem('cancellations', JSON.stringify(cancellations));

    return cancellation;
  }
};

// 7. SISTEMA DE PAGAMENTOS
export const paymentSystem = {
  // Processar pagamento
  processPayment: (paymentData) => {
    const payment = {
      id: Date.now().toString(),
      amount: paymentData.amount,
      method: paymentData.method, // 'pix', 'credit_card', 'bank_transfer', 'wallet'
      serviceId: paymentData.serviceId,
      fromUserId: paymentData.fromUserId,
      toUserId: paymentData.toUserId,
      status: 'processing',
      createdAt: new Date().toISOString(),
      description: paymentData.description
    };

    // Simular processamento
    setTimeout(() => {
      payment.status = 'completed';
      paymentSystem.updatePaymentStatus(payment.id, 'completed');
    }, 2000);

    // Salvar pagamento
    const payments = JSON.parse(localStorage.getItem('payments') || '[]');
    payments.push(payment);
    localStorage.setItem('payments', JSON.stringify(payments));

    return payment;
  },

  // Atualizar status do pagamento
  updatePaymentStatus: (paymentId, status) => {
    const payments = JSON.parse(localStorage.getItem('payments') || '[]');
    const updatedPayments = payments.map(payment => 
      payment.id === paymentId ? { ...payment, status } : payment
    );
    localStorage.setItem('payments', JSON.stringify(updatedPayments));
  },

  // Obter histórico de pagamentos
  getPaymentHistory: (userId, filters = {}) => {
    const payments = JSON.parse(localStorage.getItem('payments') || '[]');
    let userPayments = payments.filter(payment => 
      payment.fromUserId === userId || payment.toUserId === userId
    );

    if (filters.type) {
      userPayments = userPayments.filter(payment => {
        if (filters.type === 'received') return payment.toUserId === userId;
        if (filters.type === 'paid') return payment.fromUserId === userId;
        return true;
      });
    }

    if (filters.status) {
      userPayments = userPayments.filter(payment => payment.status === filters.status);
    }

    return userPayments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  // Calcular saldo da carteira
  getWalletBalance: (userId) => {
    const payments = JSON.parse(localStorage.getItem('payments') || '[]');
    const received = payments
      .filter(p => p.toUserId === userId && p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);
    
    const paid = payments
      .filter(p => p.fromUserId === userId && p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);

    return received - paid;
  }
};

// 8. SISTEMA DE CHAT
export const chatSystem = {
  // Criar nova conversa
  createChat: (participants) => {
    const chat = {
      id: Date.now().toString(),
      participants: participants,
      messages: [],
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    };

    const chats = JSON.parse(localStorage.getItem('chats') || '[]');
    chats.push(chat);
    localStorage.setItem('chats', JSON.stringify(chats));

    return chat;
  },

  // Enviar mensagem
  sendMessage: (chatId, senderId, content, type = 'text') => {
    const message = {
      id: Date.now().toString(),
      chatId: chatId,
      senderId: senderId,
      content: content,
      type: type, // 'text', 'image', 'file', 'audio'
      timestamp: new Date().toISOString(),
      read: false
    };

    // Salvar mensagem
    const messages = JSON.parse(localStorage.getItem('messages') || '[]');
    messages.push(message);
    localStorage.setItem('messages', JSON.stringify(messages));

    // Atualizar última atividade do chat
    const chats = JSON.parse(localStorage.getItem('chats') || '[]');
    const updatedChats = chats.map(chat => 
      chat.id === chatId 
        ? { ...chat, lastActivity: new Date().toISOString() }
        : chat
    );
    localStorage.setItem('chats', JSON.stringify(updatedChats));

    return message;
  },

  // Obter mensagens do chat
  getChatMessages: (chatId, limit = 50) => {
    const messages = JSON.parse(localStorage.getItem('messages') || '[]');
    return messages
      .filter(message => message.chatId === chatId)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .slice(-limit);
  },

  // Obter chats do usuário
  getUserChats: (userId) => {
    const chats = JSON.parse(localStorage.getItem('chats') || '[]');
    return chats
      .filter(chat => chat.participants.includes(userId))
      .sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));
  },

  // Marcar mensagens como lidas
  markMessagesAsRead: (chatId, userId) => {
    const messages = JSON.parse(localStorage.getItem('messages') || '[]');
    const updatedMessages = messages.map(message => 
      message.chatId === chatId && message.senderId !== userId
        ? { ...message, read: true }
        : message
    );
    localStorage.setItem('messages', JSON.stringify(updatedMessages));
  }
};

// 9. SISTEMA DE NOTIFICAÇÕES
export const notificationSystem = {
  // Criar notificação
  createNotification: (notificationData) => {
    const notification = {
      id: Date.now().toString(),
      userId: notificationData.userId,
      type: notificationData.type, // 'appointment', 'payment', 'message', 'rating', 'system'
      title: notificationData.title,
      message: notificationData.message,
      data: notificationData.data || {},
      read: false,
      priority: notificationData.priority || 'medium', // 'low', 'medium', 'high'
      createdAt: new Date().toISOString(),
      expiresAt: notificationData.expiresAt || null
    };

    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    notifications.push(notification);
    localStorage.setItem('notifications', JSON.stringify(notifications));

    return notification;
  },

  // Obter notificações do usuário
  getUserNotifications: (userId, filters = {}) => {
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    let userNotifications = notifications.filter(notification => 
      notification.userId === userId
    );

    if (filters.type) {
      userNotifications = userNotifications.filter(n => n.type === filters.type);
    }

    if (filters.unreadOnly) {
      userNotifications = userNotifications.filter(n => !n.read);
    }

    return userNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  // Marcar notificação como lida
  markAsRead: (notificationId) => {
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const updatedNotifications = notifications.map(notification => 
      notification.id === notificationId 
        ? { ...notification, read: true }
        : notification
    );
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
  },

  // Marcar todas como lidas
  markAllAsRead: (userId) => {
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const updatedNotifications = notifications.map(notification => 
      notification.userId === userId 
        ? { ...notification, read: true }
        : notification
    );
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
  },

  // Deletar notificação
  deleteNotification: (notificationId) => {
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const filteredNotifications = notifications.filter(n => n.id !== notificationId);
    localStorage.setItem('notifications', JSON.stringify(filteredNotifications));
  }
};

// 10. SISTEMA DE AGENDAMENTOS
export const schedulingSystem = {
  // Criar agendamento
  createAppointment: (appointmentData) => {
    const appointment = {
      id: Date.now().toString(),
      title: appointmentData.title,
      description: appointmentData.description,
      clientId: appointmentData.clientId,
      professionalId: appointmentData.professionalId,
      serviceType: appointmentData.serviceType,
      date: appointmentData.date,
      time: appointmentData.time,
      duration: appointmentData.duration || 60, // minutos
      location: appointmentData.location,
      locationType: appointmentData.locationType, // 'clinic', 'home', 'online'
      status: 'pending', // 'pending', 'confirmed', 'completed', 'cancelled'
      price: appointmentData.price,
      notes: appointmentData.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    appointments.push(appointment);
    localStorage.setItem('appointments', JSON.stringify(appointments));

    // Criar notificação para o profissional
    notificationSystem.createNotification({
      userId: appointmentData.professionalId,
      type: 'appointment',
      title: 'Novo Agendamento',
      message: `Novo agendamento para ${appointmentData.date} às ${appointmentData.time}`,
      data: { appointmentId: appointment.id },
      priority: 'high'
    });

    return appointment;
  },

  // Atualizar status do agendamento
  updateAppointmentStatus: (appointmentId, status, updatedBy) => {
    const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    const updatedAppointments = appointments.map(appointment => 
      appointment.id === appointmentId 
        ? { 
            ...appointment, 
            status, 
            updatedAt: new Date().toISOString(),
            updatedBy 
          }
        : appointment
    );
    localStorage.setItem('appointments', JSON.stringify(updatedAppointments));

    // Criar notificação sobre mudança de status
    const appointment = updatedAppointments.find(a => a.id === appointmentId);
    if (appointment) {
      const notifyUserId = updatedBy === appointment.clientId 
        ? appointment.professionalId 
        : appointment.clientId;
      
      notificationSystem.createNotification({
        userId: notifyUserId,
        type: 'appointment',
        title: 'Agendamento Atualizado',
        message: `Status do agendamento alterado para: ${status}`,
        data: { appointmentId: appointmentId },
        priority: 'medium'
      });
    }
  },

  // Obter agendamentos do usuário
  getUserAppointments: (userId, filters = {}) => {
    const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    let userAppointments = appointments.filter(appointment => 
      appointment.clientId === userId || appointment.professionalId === userId
    );

    if (filters.status) {
      userAppointments = userAppointments.filter(a => a.status === filters.status);
    }

    if (filters.date) {
      userAppointments = userAppointments.filter(a => a.date === filters.date);
    }

    if (filters.upcoming) {
      const today = new Date().toISOString().split('T')[0];
      userAppointments = userAppointments.filter(a => a.date >= today);
    }

    return userAppointments.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateA - dateB;
    });
  },

  // Verificar disponibilidade
  checkAvailability: (professionalId, date, time, duration = 60) => {
    const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    const professionalAppointments = appointments.filter(appointment => 
      appointment.professionalId === professionalId && 
      appointment.date === date &&
      appointment.status !== 'cancelled'
    );

    const requestedStart = new Date(`${date}T${time}`);
    const requestedEnd = new Date(requestedStart.getTime() + duration * 60000);

    for (const appointment of professionalAppointments) {
      const appointmentStart = new Date(`${appointment.date}T${appointment.time}`);
      const appointmentEnd = new Date(appointmentStart.getTime() + appointment.duration * 60000);

      // Verificar sobreposição
      if (requestedStart < appointmentEnd && requestedEnd > appointmentStart) {
        return false;
      }
    }

    return true;
  },

  // Obter horários disponíveis
  getAvailableSlots: (professionalId, date) => {
    const workingHours = {
      start: '08:00',
      end: '18:00',
      slotDuration: 60 // minutos
    };

    const slots = [];
    const startTime = new Date(`${date}T${workingHours.start}`);
    const endTime = new Date(`${date}T${workingHours.end}`);

    let currentTime = new Date(startTime);
    while (currentTime < endTime) {
      const timeString = currentTime.toTimeString().slice(0, 5);
      const isAvailable = schedulingSystem.checkAvailability(
        professionalId, 
        date, 
        timeString, 
        workingHours.slotDuration
      );

      slots.push({
        time: timeString,
        available: isAvailable
      });

      currentTime.setMinutes(currentTime.getMinutes() + workingHours.slotDuration);
    }

    return slots;
  }
};

// Função para inicializar dados mock
export const initializeMockData = () => {
  // Verificar se já foi inicializado
  if (localStorage.getItem('fway_initialized')) {
    return;
  }

  // Dados mock iniciais
  const mockData = {
    professionals: [
      {
        id: '1',
        name: 'Dr. João Silva',
        specialty: 'Cardiologia',
        rating: 4.8,
        reviews: 127,
        location: { lat: -23.5505, lng: -46.6333 },
        available: true,
        price: 250
      },
      {
        id: '2',
        name: 'Enf. Maria Santos',
        specialty: 'Home Care',
        rating: 4.9,
        reviews: 89,
        location: { lat: -23.5489, lng: -46.6388 },
        available: true,
        price: 180
      }
    ],
    serviceRequests: [],
    ratings: [],
    userHistory: [],
    payments: [],
    chats: [],
    messages: [],
    notifications: [],
    appointments: [],
    cancellations: []
  };

  // Salvar dados mock
  Object.keys(mockData).forEach(key => {
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify(mockData[key]));
    }
  });

  // Marcar como inicializado
  localStorage.setItem('fway_initialized', 'true');
};

