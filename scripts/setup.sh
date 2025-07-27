#!/bin/bash

# Script de Setup do Projeto Fway Completo
# Configura tanto o frontend quanto o backend

set -e  # Parar em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# Banner
show_banner() {
    echo ""
    echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║                    🏥 FWAY SETUP SCRIPT 🏥                   ║${NC}"
    echo -e "${BLUE}║              Sistema de Saúde Digital Completo              ║${NC}"
    echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

# Verificar se Node.js está instalado
check_node() {
    if ! command -v node &> /dev/null; then
        error "Node.js não está instalado. Por favor, instale Node.js 18+ antes de continuar."
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        error "Node.js versão 18+ é necessária. Versão atual: $(node -v)"
        exit 1
    fi
    
    log "Node.js $(node -v) detectado ✓"
}

# Verificar se npm está instalado
check_npm() {
    if ! command -v npm &> /dev/null; then
        error "npm não está instalado."
        exit 1
    fi
    
    log "npm $(npm -v) detectado ✓"
}

# Verificar se Docker está instalado (opcional)
check_docker() {
    if command -v docker &> /dev/null; then
        log "Docker $(docker --version | cut -d' ' -f3 | cut -d',' -f1) detectado ✓"
        DOCKER_AVAILABLE=true
    else
        warn "Docker não está instalado. Funcionalidades de containerização não estarão disponíveis."
        DOCKER_AVAILABLE=false
    fi
}

# Configurar variáveis de ambiente
setup_env() {
    log "Configurando variáveis de ambiente..."
    
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env
            log "Arquivo .env criado a partir de .env.example"
        else
            error "Arquivo .env.example não encontrado"
            exit 1
        fi
    else
        info "Arquivo .env já existe"
    fi
    
    # Gerar JWT secrets se não existirem
    if ! grep -q "JWT_SECRET=" .env || [ "$(grep JWT_SECRET= .env | cut -d'=' -f2)" = "your-super-secret-jwt-key-change-in-production" ]; then
        JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')
        sed -i "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
        log "JWT_SECRET gerado automaticamente"
    fi
    
    if ! grep -q "JWT_REFRESH_SECRET=" .env || [ "$(grep JWT_REFRESH_SECRET= .env | cut -d'=' -f2)" = "your-super-secret-refresh-key-change-in-production" ]; then
        JWT_REFRESH_SECRET=$(openssl rand -base64 64 | tr -d '\n')
        sed -i "s/JWT_REFRESH_SECRET=.*/JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET/" .env
        log "JWT_REFRESH_SECRET gerado automaticamente"
    fi
    
    log "Variáveis de ambiente configuradas ✓"
}

# Setup do Backend
setup_backend() {
    log "Configurando Backend..."
    
    cd backend
    
    # Instalar dependências
    if [ -f "package-lock.json" ]; then
        npm ci
    else
        npm install
    fi
    
    # Configurar .env do backend se não existir
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env
            log "Backend .env criado"
        fi
    fi
    
    # Gerar cliente Prisma
    npx prisma generate
    
    # Aplicar migrações (desenvolvimento)
    if [ "$1" != "production" ]; then
        npx prisma db push
        log "Schema do banco aplicado"
    fi
    
    # Executar testes se não for produção
    if [ "$1" != "production" ] && [ "$SKIP_TESTS" != "true" ]; then
        npm test
        log "Testes do backend executados ✓"
    fi
    
    cd ..
    log "Backend configurado ✓"
}

# Setup do Frontend
setup_frontend() {
    log "Configurando Frontend..."
    
    cd frontend
    
    # Instalar dependências
    if [ -f "package-lock.json" ]; then
        npm ci
    else
        npm install
    fi
    
    # Configurar .env do frontend se não existir
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env
            log "Frontend .env criado"
        fi
    fi
    
    # Build para produção se especificado
    if [ "$1" = "production" ]; then
        npm run build
        log "Frontend build para produção criado"
    fi
    
    cd ..
    log "Frontend configurado ✓"
}

# Configurar Docker (se disponível)
setup_docker() {
    if [ "$DOCKER_AVAILABLE" = true ] && [ "$1" != "no-docker" ]; then
        log "Configurando Docker..."
        
        # Criar rede Docker se não existir
        if ! docker network ls | grep -q fway-network; then
            docker network create fway-network
            log "Rede Docker 'fway-network' criada ✓"
        fi
        
        # Verificar se docker-compose está disponível
        if command -v docker-compose &> /dev/null; then
            log "Docker Compose detectado ✓"
        elif docker compose version &> /dev/null; then
            log "Docker Compose (plugin) detectado ✓"
        else
            warn "Docker Compose não está disponível"
        fi
        
        log "Docker configurado ✓"
    fi
}

# Criar diretórios necessários
create_directories() {
    log "Criando diretórios necessários..."
    
    mkdir -p logs
    mkdir -p uploads
    mkdir -p data
    mkdir -p monitoring
    
    # Criar diretórios específicos do backend
    mkdir -p backend/logs
    mkdir -p backend/uploads
    mkdir -p backend/data
    
    # Definir permissões
    chmod 755 logs uploads data backend/logs backend/uploads backend/data
    
    log "Diretórios criados ✓"
}

# Verificar saúde dos serviços
health_check() {
    if [ "$CI" != "true" ] && [ "$1" != "production" ]; then
        log "Verificando saúde dos serviços..."
        
        # Iniciar backend em background
        cd backend
        npm start &
        BACKEND_PID=$!
        cd ..
        
        # Aguardar backend inicializar
        sleep 5
        
        # Verificar health endpoint
        if curl -f http://localhost:3001/health > /dev/null 2>&1; then
            log "Backend health check passou ✓"
        else
            warn "Backend health check falhou - verifique os logs"
        fi
        
        # Parar backend
        kill $BACKEND_PID 2>/dev/null || true
        wait $BACKEND_PID 2>/dev/null || true
    fi
}

# Exibir informações finais
show_info() {
    echo ""
    log "🎉 Setup do Projeto Fway concluído com sucesso!"
    echo ""
    info "Estrutura do projeto:"
    echo "  📁 backend/     - API Node.js com Express e Prisma"
    echo "  📁 frontend/    - PWA React com Vite"
    echo "  📁 docs/        - Documentação do projeto"
    echo "  📁 scripts/     - Scripts de automação"
    echo ""
    info "Comandos disponíveis:"
    echo ""
    echo "🔧 DESENVOLVIMENTO:"
    echo "  # Backend"
    echo "  cd backend && npm run dev"
    echo ""
    echo "  # Frontend"
    echo "  cd frontend && npm run dev"
    echo ""
    echo "🚀 PRODUÇÃO:"
    echo "  # Iniciar tudo com Docker"
    echo "  docker-compose up -d"
    echo ""
    echo "  # Ou separadamente:"
    echo "  cd backend && npm start"
    echo "  cd frontend && npm run build && npm run preview"
    echo ""
    
    if [ "$DOCKER_AVAILABLE" = true ]; then
        info "Comandos Docker:"
        echo "  docker-compose up -d                    - Iniciar todos os serviços"
        echo "  docker-compose logs -f backend          - Ver logs do backend"
        echo "  docker-compose logs -f frontend         - Ver logs do frontend"
        echo "  docker-compose down                     - Parar todos os serviços"
        echo ""
    fi
    
    info "URLs importantes:"
    echo "  🌐 Frontend: http://localhost:5173 (dev) ou http://localhost:80 (prod)"
    echo "  🔌 Backend API: http://localhost:3001"
    echo "  💚 Health Check: http://localhost:3001/health"
    echo "  📚 API Docs: http://localhost:3001/api-docs (dev)"
    echo ""
    
    warn "Próximos passos:"
    echo "  1. 📝 Revisar e configurar variáveis de ambiente em .env"
    echo "  2. 🗄️ Configurar banco de dados de produção (se necessário)"
    echo "  3. 📧 Configurar serviços externos (email, SMS, pagamentos)"
    echo "  4. 🔒 Revisar configurações de segurança"
    echo "  5. 🚀 Fazer deploy em ambiente de produção"
    echo ""
    
    info "Para suporte, consulte:"
    echo "  📖 README.md - Guia completo"
    echo "  📋 docs/ - Documentação técnica"
    echo "  🐛 GitHub Issues - Reportar problemas"
}

# Função principal
main() {
    show_banner
    
    # Verificar argumentos
    MODE=${1:-development}
    
    log "Iniciando setup em modo: $MODE"
    echo ""
    
    # Verificações iniciais
    check_node
    check_npm
    check_docker
    
    # Setup
    setup_env
    create_directories
    setup_backend "$MODE"
    setup_frontend "$MODE"
    
    # Docker (se disponível e não desabilitado)
    if [ "$2" != "no-docker" ]; then
        setup_docker "$2"
    fi
    
    # Health check (se não for CI ou produção)
    health_check "$MODE"
    
    # Informações finais
    show_info
}

# Verificar se o script está sendo executado diretamente
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
    main "$@"
fi

