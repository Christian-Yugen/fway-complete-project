// Tipos de serviços especializados
export const homeCarServices = [
  {
    id: "curativo",
    name: "Curativos e Feridas",
    description: "Limpeza, curativo e acompanhamento de feridas",
    duration: "30-45 min",
    price: 80
  },
  {
    id: "medicacao",
    name: "Administração de Medicamentos",
    description: "Aplicação de injeções, soros e medicamentos",
    duration: "20-30 min",
    price: 60
  },
  {
    id: "pos_operatorio",
    name: "Cuidados Pós-Operatórios",
    description: "Acompanhamento e cuidados após cirurgias",
    duration: "45-60 min",
    price: 120
  },
  {
    id: "fisio_respiratoria",
    name: "Fisioterapia Respiratória",
    description: "Exercícios e técnicas para melhora respiratória",
    duration: "40-50 min",
    price: 100
  },
  {
    id: "coleta_exames",
    name: "Coleta de Exames",
    description: "Coleta de sangue e outros exames laboratoriais",
    duration: "15-20 min",
    price: 50
  },
  {
    id: "sondas_cateteres",
    name: "Cuidados com Sondas e Cateteres",
    description: "Manutenção e troca de sondas e cateteres",
    duration: "30-40 min",
    price: 90
  },
  {
    id: "cuidados_geriaticos",
    name: "Cuidados Geriátricos",
    description: "Cuidados especializados para idosos",
    duration: "60-90 min",
    price: 150
  },
  {
    id: "acompanhamento_cronico",
    name: "Acompanhamento de Doenças Crônicas",
    description: "Monitoramento de diabetes, hipertensão, etc.",
    duration: "45-60 min",
    price: 110
  }
];

export const physiotherapyServices = [
  {
    id: "ortopedica",
    name: "Fisioterapia Ortopédica",
    description: "Reabilitação de lesões musculoesqueléticas",
    duration: "50-60 min",
    price: 120
  },
  {
    id: "neurologica",
    name: "Reabilitação Neurológica",
    description: "Tratamento de sequelas neurológicas",
    duration: "60-90 min",
    price: 150
  },
  {
    id: "respiratoria_fisio",
    name: "Fisioterapia Respiratória",
    description: "Melhora da capacidade pulmonar e respiração",
    duration: "45-60 min",
    price: 110
  },
  {
    id: "rpg_pilates",
    name: "RPG e Pilates",
    description: "Reeducação postural global e fortalecimento",
    duration: "50-60 min",
    price: 130
  },
  {
    id: "drenagem_linfatica",
    name: "Drenagem Linfática",
    description: "Redução de edemas e melhora circulatória",
    duration: "60-90 min",
    price: 140
  },
  {
    id: "geriatrica_fisio",
    name: "Fisioterapia Geriátrica",
    description: "Manutenção da mobilidade e independência",
    duration: "45-60 min",
    price: 120
  },
  {
    id: "esportiva",
    name: "Fisioterapia Esportiva",
    description: "Prevenção e tratamento de lesões esportivas",
    duration: "50-60 min",
    price: 140
  },
  {
    id: "aquatica",
    name: "Fisioterapia Aquática",
    description: "Reabilitação em ambiente aquático",
    duration: "45-50 min",
    price: 160
  }
];

// Dados expandidos mantendo estrutura original + enfermeiros e fisioterapeutas
export const mockProfessionals = [
  // Médicos originais mantidos
  {
    id: 1,
    name: "Dr. João Silva",
    title: "Cardiologista",
    specialty: "Cardiologia",
    profession: "medico",
    rating: 4.8,
    reviews: 127,
    price: 150,
    location: "São Paulo, SP",
    distance: "2.5 km",
    avatar: "/images/professionals/doctor1.jpg",
    experience: "15 anos",
    workplace: "Hospital Sírio-Libanês",
    registration: "CRM-SP 123456",
    bio: "Cardiologista com vasta experiência em cirurgias cardíacas e tratamentos preventivos.",
    services: ["Consulta Cardiológica", "Ecocardiograma", "Teste Ergométrico"],
    availability: { days: ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"], hours: "08:00-18:00" }
  },
  {
    id: 2,
    name: "Dra. Maria Santos",
    title: "Pediatra",
    specialty: "Pediatria",
    profession: "medico",
    rating: 4.9,
    reviews: 203,
    price: 120,
    location: "São Paulo, SP",
    distance: "1.8 km",
    avatar: "/images/professionals/doctor2.jpg",
    experience: "12 anos",
    workplace: "Hospital Infantil Sabará",
    registration: "CRM-SP 234567",
    bio: "Pediatra especializada em desenvolvimento infantil e medicina preventiva.",
    services: ["Consulta Pediátrica", "Vacinação", "Puericultura"],
    availability: { days: ["Segunda", "Terça", "Quinta", "Sexta"], hours: "09:00-17:00" }
  },
  {
    id: 3,
    name: "Dr. Carlos Oliveira",
    title: "Ortopedista",
    specialty: "Ortopedia",
    profession: "medico",
    rating: 4.7,
    reviews: 89,
    price: 180,
    location: "São Paulo, SP",
    distance: "3.2 km",
    avatar: "/images/professionals/doctor3.jpg",
    experience: "18 anos",
    workplace: "Hospital das Clínicas",
    registration: "CRM-SP 345678",
    bio: "Ortopedista especializado em cirurgias de joelho e medicina esportiva.",
    services: ["Consulta Ortopédica", "Infiltração", "Cirurgia Artroscópica"],
    availability: { days: ["Segunda", "Quarta", "Sexta"], hours: "08:00-16:00" }
  },
  {
    id: 4,
    name: "Dra. Ana Costa",
    title: "Dermatologista",
    specialty: "Dermatologia",
    profession: "medico",
    rating: 4.6,
    reviews: 156,
    price: 140,
    location: "São Paulo, SP",
    distance: "4.1 km",
    avatar: "/images/professionals/doctor4.jpg",
    experience: "10 anos",
    workplace: "Clínica Dermatológica",
    registration: "CRM-SP 456789",
    bio: "Dermatologista focada em dermatologia clínica e procedimentos estéticos.",
    services: ["Consulta Dermatológica", "Biópsia", "Procedimentos Estéticos"],
    availability: { days: ["Terça", "Quarta", "Quinta", "Sexta"], hours: "10:00-18:00" }
  },

  // Enfermeiros adicionados
  {
    id: 5,
    name: "Enfª Ana Carolina Silva",
    title: "Enfermeira Especialista em UTI",
    specialty: "UTI Adulto",
    profession: "enfermeiro",
    rating: 4.9,
    reviews: 127,
    price: 80,
    location: "São Paulo, SP",
    distance: "2.1 km",
    avatar: "/images/professionals/nurse1.jpg",
    experience: "8 anos",
    workplace: "Hospital das Clínicas - USP",
    registration: "COREN-SP 123456",
    bio: "Enfermeira especialista em cuidados intensivos com vasta experiência em UTI adulto.",
    services: ["Cuidados Domiciliares Intensivos", "Orientação Familiar para Cuidados", "Administração de Medicamentos"],
    availability: { days: ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"], hours: "07:00-19:00" }
  },
  {
    id: 6,
    name: "Enfº Carlos Eduardo Santos",
    title: "Enfermeiro Obstétrico",
    specialty: "Obstetrícia",
    profession: "enfermeiro",
    rating: 4.8,
    reviews: 89,
    price: 90,
    location: "São Paulo, SP",
    distance: "3.5 km",
    avatar: "/images/professionals/nurse2.jpg",
    experience: "12 anos",
    workplace: "Maternidade São Luiz",
    registration: "COREN-SP 234567",
    bio: "Enfermeiro obstétrico dedicado ao parto humanizado e cuidados integrais à mulher.",
    services: ["Acompanhamento Pré-natal", "Assistência ao Parto Domiciliar", "Aleitamento Materno"],
    availability: { days: ["Segunda", "Terça", "Quinta", "Sexta", "Sábado"], hours: "08:00-20:00" }
  },
  {
    id: 7,
    name: "Enfª Maria Fernanda Costa",
    title: "Enfermeira Pediatra",
    specialty: "Pediatria",
    profession: "enfermeiro",
    rating: 4.9,
    reviews: 156,
    price: 75,
    location: "São Paulo, SP",
    distance: "1.9 km",
    avatar: "/images/professionals/nurse3.jpg",
    experience: "6 anos",
    workplace: "Hospital Infantil Sabará",
    registration: "COREN-SP 345678",
    bio: "Enfermeira pediatra apaixonada pelo cuidado infantil. Especialista em imunização e cuidados neonatais.",
    services: ["Vacinação Domiciliar", "Cuidados Neonatais", "Orientação aos Pais"],
    availability: { days: ["Segunda", "Terça", "Quarta", "Quinta"], hours: "09:00-17:00" }
  },
  {
    id: 8,
    name: "Enfª Juliana Oliveira",
    title: "Enfermeira Home Care",
    specialty: "Home Care",
    profession: "enfermeiro",
    rating: 4.7,
    reviews: 98,
    price: 85,
    location: "São Paulo, SP",
    distance: "2.8 km",
    avatar: "/images/professionals/nurse4.jpg",
    experience: "9 anos",
    workplace: "Empresa de Home Care Premium",
    registration: "COREN-SP 456789",
    bio: "Enfermeira especializada em cuidados domiciliares para pacientes com necessidades especiais.",
    services: ["Cuidados Domiciliares", "Curativos", "Administração de Medicamentos"],
    availability: { days: ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"], hours: "06:00-22:00" }
  },

  // Fisioterapeutas adicionados
  {
    id: 9,
    name: "Dr. Rafael Mendes",
    title: "Fisioterapeuta Ortopédico",
    specialty: "Ortopedia",
    profession: "fisioterapeuta",
    rating: 4.7,
    reviews: 98,
    price: 100,
    location: "São Paulo, SP",
    distance: "2.8 km",
    avatar: "/images/professionals/physio1.jpg",
    experience: "10 anos",
    workplace: "Clínica de Fisioterapia Avançada",
    registration: "CREFITO-3 12345",
    bio: "Fisioterapeuta ortopédico especializado em reabilitação pós-cirúrgica e lesões esportivas.",
    services: ["Fisioterapia Ortopédica", "RPG", "Pilates Terapêutico"],
    availability: { days: ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"], hours: "08:00-18:00" }
  },
  {
    id: 10,
    name: "Dra. Beatriz Ferreira",
    title: "Fisioterapeuta Neurológica",
    specialty: "Neurologia",
    profession: "fisioterapeuta",
    rating: 4.8,
    reviews: 134,
    price: 110,
    location: "São Paulo, SP",
    distance: "3.7 km",
    avatar: "/images/professionals/physio2.jpg",
    experience: "14 anos",
    workplace: "Centro de Reabilitação Neurológica",
    registration: "CREFITO-3 23456",
    bio: "Fisioterapeuta neurológica com expertise em reabilitação de AVC e lesões medulares.",
    services: ["Fisioterapia Neurológica", "Bobath", "Estimulação Elétrica Funcional"],
    availability: { days: ["Segunda", "Terça", "Quinta", "Sexta"], hours: "09:00-17:00" }
  },
  {
    id: 11,
    name: "Dr. Lucas Barbosa",
    title: "Fisioterapeuta Respiratório",
    specialty: "Respiratória",
    profession: "fisioterapeuta",
    rating: 4.6,
    reviews: 67,
    price: 95,
    location: "São Paulo, SP",
    distance: "4.2 km",
    avatar: "/images/professionals/physio3.jpg",
    experience: "7 anos",
    workplace: "Hospital Pulmonar",
    registration: "CREFITO-3 34567",
    bio: "Fisioterapeuta respiratório especializado em reabilitação pulmonar e cuidados intensivos.",
    services: ["Fisioterapia Respiratória", "Ventilação Mecânica", "Reabilitação Pulmonar"],
    availability: { days: ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"], hours: "07:00-19:00" }
  },
  {
    id: 12,
    name: "Dra. Gabriela Martins",
    title: "Fisioterapeuta Esportiva",
    specialty: "Esportiva",
    profession: "fisioterapeuta",
    rating: 4.9,
    reviews: 145,
    price: 120,
    location: "São Paulo, SP",
    distance: "3.1 km",
    avatar: "/images/professionals/physio4.jpg",
    experience: "11 anos",
    workplace: "Centro de Medicina Esportiva",
    registration: "CREFITO-3 45678",
    bio: "Fisioterapeuta esportiva com experiência em atletas de alto rendimento e prevenção de lesões.",
    services: ["Fisioterapia Esportiva", "Avaliação Biomecânica", "Treinamento Funcional"],
    availability: { days: ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"], hours: "06:00-20:00" }
  }
]

export const mockCategories = [
  { id: 1, name: "Cardiologia", icon: "❤️", profession: "medico" },
  { id: 2, name: "Pediatria", icon: "👶", profession: "medico" },
  { id: 3, name: "Ortopedia", icon: "🦴", profession: "medico" },
  { id: 4, name: "Dermatologia", icon: "🧴", profession: "medico" },
  { id: 5, name: "UTI", icon: "🏥", profession: "enfermeiro" },
  { id: 6, name: "Obstetrícia", icon: "🤱", profession: "enfermeiro" },
  { id: 7, name: "Home Care", icon: "🏠", profession: "enfermeiro" },
  { id: 8, name: "Fisio Ortopédica", icon: "🦴", profession: "fisioterapeuta" },
  { id: 9, name: "Fisio Neurológica", icon: "🧠", profession: "fisioterapeuta" },
  { id: 10, name: "Fisio Respiratória", icon: "🫁", profession: "fisioterapeuta" },
  { id: 11, name: "Fisio Esportiva", icon: "⚽", profession: "fisioterapeuta" }
]

export default { mockProfessionals, mockCategories }

