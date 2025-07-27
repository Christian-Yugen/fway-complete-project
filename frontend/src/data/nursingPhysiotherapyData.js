// Dados específicos para profissionais de enfermagem e fisioterapia
export const nursingPhysiotherapyData = {
  // Profissionais de Enfermagem
  nurses: [
    {
      id: 1,
      name: 'Enfª Ana Carolina Silva',
      title: 'Enfermeira Especialista em UTI',
      avatar: '👩‍⚕️',
      coren: 'COREN-SP 123456',
      specialties: ['UTI Adulto', 'Cuidados Intensivos', 'Ventilação Mecânica'],
      experience: '8 anos',
      education: [
        'Graduação em Enfermagem - USP',
        'Especialização em UTI - Hospital Sírio-Libanês',
        'Curso de Ventilação Mecânica - AMIB'
      ],
      workplace: 'Hospital das Clínicas - USP',
      location: 'São Paulo, SP',
      rating: 4.9,
      reviews: 127,
      consultations: 450,
      price: 80,
      bio: 'Enfermeira especialista em cuidados intensivos com vasta experiência em UTI adulto. Focada em proporcionar cuidados humanizados e seguros aos pacientes críticos.',
      services: [
        'Cuidados Domiciliares Intensivos',
        'Orientação Familiar para Cuidados',
        'Treinamento em Primeiros Socorros',
        'Consultoria em Cuidados Paliativos'
      ],
      certifications: [
        'BLS - Suporte Básico de Vida',
        'ACLS - Suporte Avançado de Vida',
        'Certificação em Cuidados Paliativos'
      ],
      languages: ['Português', 'Inglês'],
      availability: {
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        hours: '08:00-18:00'
      }
    },
    {
      id: 2,
      name: 'Enfº Carlos Eduardo Santos',
      title: 'Enfermeiro Obstétrico',
      avatar: '👨‍⚕️',
      coren: 'COREN-SP 234567',
      specialties: ['Obstetrícia', 'Parto Humanizado', 'Aleitamento Materno'],
      experience: '12 anos',
      education: [
        'Graduação em Enfermagem - UNIFESP',
        'Especialização em Obstetrícia - Maternidade Amparo Maternal',
        'Curso de Parto na Água - GAMA'
      ],
      workplace: 'Maternidade São Luiz',
      location: 'São Paulo, SP',
      rating: 4.8,
      reviews: 89,
      consultations: 320,
      price: 90,
      bio: 'Enfermeiro obstétrico dedicado ao parto humanizado e cuidados integrais à mulher. Especialista em acompanhamento pré-natal e puerpério.',
      services: [
        'Acompanhamento Pré-natal',
        'Assistência ao Parto Domiciliar',
        'Consultoria em Amamentação',
        'Curso de Gestantes'
      ],
      certifications: [
        'Especialista em Enfermagem Obstétrica',
        'Certificação em Parto Humanizado',
        'Consultor em Aleitamento Materno'
      ],
      languages: ['Português', 'Espanhol'],
      availability: {
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
        hours: '07:00-19:00'
      }
    },
    {
      id: 3,
      name: 'Enfª Maria Fernanda Costa',
      title: 'Enfermeira Pediatra',
      avatar: '👩‍⚕️',
      coren: 'COREN-SP 345678',
      specialties: ['Pediatria', 'Neonatologia', 'Vacinação'],
      experience: '6 anos',
      education: [
        'Graduação em Enfermagem - PUC-SP',
        'Especialização em Pediatria - Hospital Sabará',
        'Curso de Imunização - CRIE'
      ],
      workplace: 'Hospital Infantil Sabará',
      location: 'São Paulo, SP',
      rating: 4.9,
      reviews: 156,
      consultations: 380,
      price: 75,
      bio: 'Enfermeira pediatra apaixonada pelo cuidado infantil. Especialista em imunização e cuidados neonatais, sempre priorizando o bem-estar das crianças.',
      services: [
        'Vacinação Domiciliar',
        'Cuidados Neonatais',
        'Orientação aos Pais',
        'Acompanhamento do Desenvolvimento'
      ],
      certifications: [
        'Especialista em Enfermagem Pediátrica',
        'Certificação em Imunização',
        'Curso de Reanimação Neonatal'
      ],
      languages: ['Português', 'Inglês'],
      availability: {
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        hours: '08:00-17:00'
      }
    },
    {
      id: 4,
      name: 'Enfª Juliana Oliveira',
      title: 'Enfermeira Home Care',
      avatar: '👩‍⚕️',
      coren: 'COREN-SP 456789',
      specialties: ['Home Care', 'Cuidados Geriátricos', 'Feridas Complexas'],
      experience: '10 anos',
      education: [
        'Graduação em Enfermagem - UNINOVE',
        'Especialização em Gerontologia - COGEAE PUC-SP',
        'Curso de Tratamento de Feridas - SOBEST'
      ],
      workplace: 'Home Care Premium',
      location: 'São Paulo, SP',
      rating: 4.7,
      reviews: 203,
      consultations: 520,
      price: 85,
      bio: 'Enfermeira especializada em cuidados domiciliares e geriátricos. Experiência em tratamento de feridas complexas e cuidados paliativos.',
      services: [
        'Cuidados Domiciliares',
        'Tratamento de Feridas',
        'Cuidados Geriátricos',
        'Administração de Medicamentos'
      ],
      certifications: [
        'Especialista em Gerontologia',
        'Certificação em Tratamento de Feridas',
        'Curso de Cuidados Paliativos'
      ],
      languages: ['Português'],
      availability: {
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        hours: '06:00-22:00'
      }
    }
  ],

  // Profissionais de Fisioterapia
  physiotherapists: [
    {
      id: 5,
      name: 'Ft. Roberto Almeida',
      title: 'Fisioterapeuta Ortopédico',
      avatar: '🧑‍⚕️',
      crefito: 'CREFITO-3 12345-F',
      specialties: ['Ortopedia', 'Traumatologia', 'RPG'],
      experience: '15 anos',
      education: [
        'Graduação em Fisioterapia - UNINOVE',
        'Especialização em Ortopedia - COFFITO',
        'Formação em RPG - Instituto Philippe Souchard'
      ],
      workplace: 'Clínica Fisio Excellence',
      location: 'São Paulo, SP',
      rating: 4.8,
      reviews: 178,
      consultations: 650,
      price: 120,
      bio: 'Fisioterapeuta ortopédico com vasta experiência em reabilitação pós-cirúrgica e tratamento de lesões esportivas. Especialista em RPG e terapia manual.',
      services: [
        'Fisioterapia Ortopédica',
        'Reabilitação Pós-Cirúrgica',
        'RPG - Reeducação Postural Global',
        'Fisioterapia Esportiva'
      ],
      certifications: [
        'Especialista em Fisioterapia Ortopédica',
        'Certificação em RPG',
        'Curso de Terapia Manual'
      ],
      languages: ['Português', 'Inglês'],
      availability: {
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        hours: '07:00-19:00'
      }
    },
    {
      id: 6,
      name: 'Ft. Camila Rodrigues',
      title: 'Fisioterapeuta Neurológica',
      avatar: '👩‍⚕️',
      crefito: 'CREFITO-3 23456-F',
      specialties: ['Neurologia', 'Bobath', 'Hidroterapia'],
      experience: '9 anos',
      education: [
        'Graduação em Fisioterapia - USP',
        'Especialização em Neurologia - AACD',
        'Curso Bobath - IBITA'
      ],
      workplace: 'Centro de Reabilitação AACD',
      location: 'São Paulo, SP',
      rating: 4.9,
      reviews: 134,
      consultations: 420,
      price: 130,
      bio: 'Fisioterapeuta neurológica especializada no método Bobath. Experiência em reabilitação de pacientes com AVC, paralisia cerebral e lesões medulares.',
      services: [
        'Fisioterapia Neurológica',
        'Método Bobath',
        'Hidroterapia',
        'Reabilitação Pós-AVC'
      ],
      certifications: [
        'Especialista em Fisioterapia Neurológica',
        'Certificação Bobath',
        'Instrutora de Hidroterapia'
      ],
      languages: ['Português', 'Inglês', 'Francês'],
      availability: {
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        hours: '08:00-18:00'
      }
    },
    {
      id: 7,
      name: 'Ft. Lucas Ferreira',
      title: 'Fisioterapeuta Respiratório',
      avatar: '👨‍⚕️',
      crefito: 'CREFITO-3 34567-F',
      specialties: ['Fisioterapia Respiratória', 'UTI', 'Ventilação Mecânica'],
      experience: '7 anos',
      education: [
        'Graduação em Fisioterapia - UNIFESP',
        'Especialização em Fisioterapia Respiratória - INCOR',
        'Curso de Ventilação Mecânica - AMIB'
      ],
      workplace: 'Hospital do Coração - HCor',
      location: 'São Paulo, SP',
      rating: 4.8,
      reviews: 92,
      consultations: 280,
      price: 110,
      bio: 'Fisioterapeuta respiratório com experiência em UTI e ventilação mecânica. Especialista em reabilitação pulmonar e cuidados intensivos.',
      services: [
        'Fisioterapia Respiratória',
        'Reabilitação Pulmonar',
        'Fisioterapia em UTI',
        'Desmame Ventilatório'
      ],
      certifications: [
        'Especialista em Fisioterapia Respiratória',
        'Certificação em Ventilação Mecânica',
        'Curso de Reabilitação Cardiopulmonar'
      ],
      languages: ['Português', 'Inglês'],
      availability: {
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
        hours: '06:00-20:00'
      }
    },
    {
      id: 8,
      name: 'Ft. Patrícia Lima',
      title: 'Fisioterapeuta Pélvica',
      avatar: '👩‍⚕️',
      crefito: 'CREFITO-3 45678-F',
      specialties: ['Fisioterapia Pélvica', 'Uroginecologia', 'Obstetrícia'],
      experience: '11 anos',
      education: [
        'Graduação em Fisioterapia - PUC-SP',
        'Especialização em Fisioterapia Pélvica - SOBRAFIP',
        'Curso de Uroginecologia - FEBRASGO'
      ],
      workplace: 'Clínica da Mulher',
      location: 'São Paulo, SP',
      rating: 4.9,
      reviews: 167,
      consultations: 490,
      price: 140,
      bio: 'Fisioterapeuta especializada em saúde da mulher e fisioterapia pélvica. Atua na prevenção e tratamento de disfunções do assoalho pélvico.',
      services: [
        'Fisioterapia Pélvica',
        'Preparação para o Parto',
        'Tratamento de Incontinência',
        'Reabilitação Pós-Parto'
      ],
      certifications: [
        'Especialista em Fisioterapia Pélvica',
        'Certificação em Uroginecologia',
        'Instrutora de Pilates'
      ],
      languages: ['Português', 'Espanhol'],
      availability: {
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        hours: '08:00-18:00'
      }
    }
  ],

  // Especialidades de Enfermagem
  nursingSpecialties: [
    'UTI Adulto',
    'UTI Pediátrica',
    'UTI Neonatal',
    'Centro Cirúrgico',
    'Emergência',
    'Home Care',
    'Obstetrícia',
    'Pediatria',
    'Geriatria',
    'Oncologia',
    'Cardiologia',
    'Nefrologia',
    'Psiquiatria',
    'Saúde Mental',
    'Cuidados Paliativos',
    'Infectologia',
    'Dermatologia',
    'Estomaterapia',
    'Auditoria',
    'Gestão em Saúde'
  ],

  // Especialidades de Fisioterapia
  physiotherapySpecialties: [
    'Ortopedia',
    'Traumatologia',
    'Neurologia',
    'Respiratória',
    'Cardiopulmonar',
    'Pélvica',
    'Esportiva',
    'Geriátrica',
    'Pediátrica',
    'Aquática',
    'Dermatofuncional',
    'Oncológica',
    'UTI',
    'Home Care',
    'Reumatologia',
    'Acupuntura',
    'Osteopatia',
    'RPG',
    'Pilates',
    'Quiropraxia'
  ],

  // Tipos de Serviços
  serviceTypes: [
    'Consulta Presencial',
    'Atendimento Domiciliar',
    'Teleconsulta',
    'Avaliação Inicial',
    'Reavaliação',
    'Sessão de Fisioterapia',
    'Cuidados de Enfermagem',
    'Procedimentos',
    'Orientações',
    'Treinamento',
    'Consultoria',
    'Supervisão'
  ],

  // Locais de Trabalho
  workplaces: [
    'Hospital das Clínicas - USP',
    'Hospital Sírio-Libanês',
    'Hospital Albert Einstein',
    'Hospital do Coração - HCor',
    'Hospital Samaritano',
    'Hospital Santa Catarina',
    'AACD',
    'Hospital Infantil Sabará',
    'Maternidade São Luiz',
    'Home Care Premium',
    'Clínica Fisio Excellence',
    'Centro de Reabilitação',
    'Clínica da Mulher',
    'UBS - Unidade Básica de Saúde',
    'Clínica Particular',
    'Atendimento Domiciliar'
  ]
}

export default nursingPhysiotherapyData

