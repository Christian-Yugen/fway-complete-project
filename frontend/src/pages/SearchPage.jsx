import React, { useState, useEffect } from 'react'
import nursingPhysiotherapyData from '../data/nursingPhysiotherapyData'

const SearchPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('all')
  const [selectedProfession, setSelectedProfession] = useState('all')
  const [selectedLocation, setSelectedLocation] = useState('all')
  const [sortBy, setSortBy] = useState('rating')
  const [professionals, setProfessionals] = useState([])

  useEffect(() => {
    const allProfessionals = [
      ...nursingPhysiotherapyData.nurses.map(nurse => ({ ...nurse, profession: 'nursing' })),
      ...nursingPhysiotherapyData.physiotherapists.map(physio => ({ ...physio, profession: 'physiotherapy' }))
    ]
    setProfessionals(allProfessionals)
  }, [])

  const filteredAndSortedProfessionals = professionals
    .filter(prof => {
      const matchesSearch = prof.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           prof.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           prof.specialties.some(spec => spec.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesSpecialty = selectedSpecialty === 'all' || 
                              prof.specialties.some(spec => spec.toLowerCase().includes(selectedSpecialty.toLowerCase()))
      
      const matchesProfession = selectedProfession === 'all' || prof.profession === selectedProfession
      
      const matchesLocation = selectedLocation === 'all' || 
                             prof.location.toLowerCase().includes(selectedLocation.toLowerCase())
      
      return matchesSearch && matchesSpecialty && matchesProfession && matchesLocation
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating
        case 'price_low':
          return a.price - b.price
        case 'price_high':
          return b.price - a.price
        case 'experience':
          return parseInt(b.experience) - parseInt(a.experience)
        case 'reviews':
          return b.reviews - a.reviews
        default:
          return 0
      }
    })

  const handleConnect = (professionalId) => {
    alert(`Solicitação de conexão enviada para o profissional ID: ${professionalId}`)
  }

  const handleMessage = (professionalId) => {
    alert(`Abrindo chat com o profissional ID: ${professionalId}`)
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      {/* Search Header */}
      <div className="linkedin-card mx-4 mt-4">
        <div className="p-4">
          <h1 className="text-xl font-bold text-gray-900 mb-4">
            Buscar Profissionais de Saúde
          </h1>
          
          {/* Main Search */}
          <div className="search-container mb-4">
            <div className="search-icon"><Search size={16} /></div>
            <input
              type="text"
              placeholder="Nome, especialidade, hospital..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <select
              className="linkedin-input"
              value={selectedProfession}
              onChange={(e) => setSelectedProfession(e.target.value)}
            >
              <option value="all">Todas as Profissões</option>
              <option value="nursing">👩‍⚕️ Enfermagem</option>
              <option value="physiotherapy">🧑‍⚕️ Fisioterapia</option>
            </select>

            <select
              className="linkedin-input"
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
            >
              <option value="all">Todas as Especialidades</option>
              <optgroup label="Enfermagem">
                <option value="uti">UTI</option>
                <option value="pediatria">Pediatria</option>
                <option value="obstetrícia">Obstetrícia</option>
                <option value="home care">Home Care</option>
                <option value="emergência">Emergência</option>
              </optgroup>
              <optgroup label="Fisioterapia">
                <option value="ortopedia">Ortopedia</option>
                <option value="neurologia">Neurologia</option>
                <option value="respiratória">Respiratória</option>
                <option value="esportiva">Esportiva</option>
                <option value="pélvica">Pélvica</option>
              </optgroup>
            </select>

            <select
              className="linkedin-input"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
            >
              <option value="all">Todas as Regiões</option>
              <option value="são paulo">São Paulo</option>
              <option value="rio de janeiro">Rio de Janeiro</option>
              <option value="belo horizonte">Belo Horizonte</option>
              <option value="brasília">Brasília</option>
            </select>

            <select
              className="linkedin-input"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="rating">Melhor Avaliação</option>
              <option value="price_low">Menor Preço</option>
              <option value="price_high">Maior Preço</option>
              <option value="experience">Mais Experiência</option>
              <option value="reviews">Mais Avaliações</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mx-4 mb-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">
            {filteredAndSortedProfessionals.length} profissionais encontrados
          </h2>
          <div className="text-sm text-gray-600">
            Ordenado por: {sortBy === 'rating' ? 'Avaliação' : 
                          sortBy === 'price_low' ? 'Menor Preço' :
                          sortBy === 'price_high' ? 'Maior Preço' :
                          sortBy === 'experience' ? 'Experiência' : 'Avaliações'}
          </div>
        </div>
      </div>

      {/* Results List */}
      <div className="mx-4">
        {filteredAndSortedProfessionals.map((professional) => (
          <div key={professional.id} className="profile-card">
            <div className="profile-header">
              <div className={`profile-avatar ${professional.profession === 'nursing' ? 'gradient-nursing' : 'gradient-physio'}`}>
                {professional.avatar}
              </div>
              <div className="profile-info flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3>{professional.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    professional.profession === 'nursing' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {professional.profession === 'nursing' ? 'Enfermagem' : 'Fisioterapia'}
                  </span>
                </div>
                <p className="profile-title">{professional.title}</p>
                <p className="profile-workplace">
                  {professional.coren || professional.crefito} • {professional.workplace}
                </p>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <MapPin size={16} /> {professional.location} • 🕒 {professional.experience}
                </p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">R$ {professional.price}</div>
                <div className="text-xs text-gray-500">por consulta</div>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-yellow-500"><Star size={16} /></span>
                  <span className="text-sm font-semibold">{professional.rating}</span>
                  <span className="text-xs text-gray-500">({professional.reviews})</span>
                </div>
              </div>
            </div>

            {/* Specialties */}
            <div className="specialties-tags">
              {professional.specialties.map((specialty, index) => (
                <span 
                  key={index} 
                  className={`specialty-tag ${professional.profession === 'nursing' ? 'nursing' : 'physio'}`}
                >
                  {specialty}
                </span>
              ))}
            </div>

            {/* Bio */}
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700 mb-3">{professional.bio}</p>
              
              {/* Education Preview */}
              <div className="mb-3">
                <h4 className="text-xs font-semibold text-gray-900 mb-1">Formação:</h4>
                <p className="text-xs text-gray-600">{professional.education[0]}</p>
                {professional.education.length > 1 && (
                  <p className="text-xs text-gray-500">+{professional.education.length - 1} mais</p>
                )}
              </div>

              {/* Services */}
              <div className="mb-3">
                <h4 className="text-xs font-semibold text-gray-900 mb-1">Serviços:</h4>
                <div className="flex flex-wrap gap-1">
                  {professional.services.slice(0, 3).map((service, index) => (
                    <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {service}
                    </span>
                  ))}
                  {professional.services.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{professional.services.length - 3} mais
                    </span>
                  )}
                </div>
              </div>

              {/* Availability */}
              <div className="mb-3">
                <h4 className="text-xs font-semibold text-gray-900 mb-1">Disponibilidade:</h4>
                <p className="text-xs text-gray-600">
                  {professional.availability.days.length} dias/semana • {professional.availability.hours}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 mt-4">
                <button 
                  className="linkedin-button-primary"
                  onClick={() => handleConnect(professional.id)}
                >
                  🤝 Conectar
                </button>
                <button 
                  className="linkedin-button-secondary"
                  onClick={() => handleMessage(professional.id)}
                >
                  <MessageCircle size={16} /> Mensagem
                </button>
                <button className="linkedin-button-secondary">
                  <Calendar size={16} /> Agendar
                </button>
                <button className="linkedin-button-secondary">
                  <User size={16} /> Ver Perfil
                </button>
                <button className="linkedin-button-secondary">
                  ❤️ Salvar
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="profile-stats mt-3 pt-3 border-t border-gray-200">
              <div className="profile-stat">
                <span><Users size={16} /></span>
                <span>{professional.consultations} consultas</span>
              </div>
              <div className="profile-stat">
                <span><Trophy size={16} /></span>
                <span>{professional.certifications.length} certificações</span>
              </div>
              <div className="profile-stat">
                <span><Globe size={16} /></span>
                <span>{professional.languages.join(', ')}</span>
              </div>
              <div className="profile-stat">
                <span><MapPin size={16} /></span>
                <span>2.5 km de distância</span>
              </div>
            </div>
          </div>
        ))}

        {filteredAndSortedProfessionals.length === 0 && (
          <div className="linkedin-card p-8 text-center">
            <div className="text-4xl mb-4"><Search size={16} /></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhum profissional encontrado
            </h3>
            <p className="text-gray-600 mb-4">
              Tente ajustar os filtros de busca para encontrar mais profissionais
            </p>
            <button 
              className="linkedin-button-primary"
              onClick={() => {
                setSearchTerm('')
                setSelectedSpecialty('all')
                setSelectedProfession('all')
                setSelectedLocation('all')
              }}
            >
              Limpar Filtros
            </button>
          </div>
        )}
      </div>

      {/* Quick Filters */}
      <div className="linkedin-card mx-4 mt-4">
        <div className="p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Filtros Rápidos</h3>
          <div className="flex flex-wrap gap-2">
            <button 
              className="text-xs bg-purple-100 text-purple-800 px-3 py-1 rounded-full"
              onClick={() => setSelectedProfession('nursing')}
            >
              👩‍⚕️ Enfermeiros
            </button>
            <button 
              className="text-xs bg-orange-100 text-orange-800 px-3 py-1 rounded-full"
              onClick={() => setSelectedProfession('physiotherapy')}
            >
              🧑‍⚕️ Fisioterapeutas
            </button>
            <button 
              className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full"
              onClick={() => setSelectedSpecialty('home care')}
            >
              🏠 Home Care
            </button>
            <button 
              className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full"
              onClick={() => setSelectedSpecialty('uti')}
            >
              <Building size={16} /> UTI
            </button>
            <button 
              className="text-xs bg-red-100 text-red-800 px-3 py-1 rounded-full"
              onClick={() => setSelectedSpecialty('emergência')}
            >
              🚨 Emergência
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SearchPage

