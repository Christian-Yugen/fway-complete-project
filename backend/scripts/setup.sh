#!/bin/bash

# Script de Setup do Fway Backend
# Configura o ambiente de desenvolvimento e produção

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

# Instalar dependências
install_dependencies() {
    log "Instalando dependências do projeto..."
    
    if [ -f "package-lock.json" ]; then
        npm ci
    else
        npm install
    fi
    
    log "Dependências instaladas ✓"
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

# Configurar banco de dados
setup_database() {
    log "Configurando banco de dados..."
    
    # Gerar cliente Prisma
    npx prisma generate
    log "Cliente Prisma gerado ✓"
    
    # Verificar se deve executar migrações
    if [ "$1" = "production" ]; then
        info "Modo produção: execute 'npx prisma migrate deploy' manualmente"
    else
        # Modo desenvolvimento
        if [ -d "prisma/migrations" ] && [ "$(ls -A prisma/migrations)" ]; then
            npx prisma migrate dev --name init
            log "Migrações aplicadas ✓"
        else
            npx prisma db push
            log "Schema aplicado ao banco ✓"
        fi
    fi
}

# Criar diretórios necessários
create_directories() {
    log "Criando diretórios necessários..."
    
    mkdir -p logs
    mkdir -p uploads
    mkdir -p temp
    mkdir -p data
    
    # Definir permissões
    chmod 755 logs uploads temp data
    
    log "Diretórios criados ✓"
}

# Executar testes
run_tests() {
    if [ "$SKIP_TESTS" != "true" ]; then
        log "Executando testes..."
        npm test
        log "Testes executados ✓"
    else
        info "Testes ignorados (SKIP_TESTS=true)"
    fi
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
    fi
}

# Verificar saúde da aplicação
health_check() {
    log "Verificando saúde da aplicação..."
    
    # Iniciar aplicação em background
    npm start &
    APP_PID=$!
    
    # Aguardar aplicação inicializar
    sleep 5
    
    # Verificar health endpoint
    if curl -f http://localhost:3001/health > /dev/null 2>&1; then
        log "Health check passou ✓"
    else
        warn "Health check falhou - verifique os logs"
    fi
    
    # Parar aplicação
    kill $APP_PID 2>/dev/null || true
    wait $APP_PID 2>/dev/null || true
}

# Exibir informações finais
show_info() {
    echo ""
    log "🎉 Setup concluído com sucesso!"
    echo ""
    info "Comandos disponíveis:"
    echo "  npm start          - Iniciar em produção"
    echo "  npm run dev        - Iniciar em desenvolvimento"
    echo "  npm test           - Executar testes"
    echo "  npm run test:watch - Executar testes em modo watch"
    echo "  npm run lint       - Verificar código"
    echo "  npm run format     - Formatar código"
    echo ""
    
    if [ "$DOCKER_AVAILABLE" = true ]; then
        info "Comandos Docker:"
        echo "  docker-compose up -d              - Iniciar com Docker"
        echo "  docker-compose -f docker-compose.yml --profile production up -d  - Produção"
        echo "  docker-compose logs -f api         - Ver logs da API"
        echo ""
    fi
    
    info "URLs importantes:"
    echo "  API: http://localhost:3001"
    echo "  Health: http://localhost:3001/health"
    echo "  Docs: http://localhost:3001/api-docs (em desenvolvimento)"
    echo ""
    
    warn "Lembre-se de:"
    echo "  1. Configurar as variáveis de ambiente em .env"
    echo "  2. Configurar o banco de dados de produção"
    echo "  3. Configurar serviços externos (email, SMS, etc.)"
    echo "  4. Revisar configurações de segurança"
}

# Função principal
main() {
    echo ""
    log "🚀 Iniciando setup do Fway Backend..."
    echo ""
    
    # Verificar argumentos
    MODE=${1:-development}
    
    # Verificações iniciais
    check_node
    check_npm
    check_docker
    
    # Setup
    install_dependencies
    setup_env
    create_directories
    setup_database "$MODE"
    
    # Docker (se disponível e não desabilitado)
    if [ "$2" != "no-docker" ]; then
        setup_docker "$2"
    fi
    
    # Testes (se não for produção)
    if [ "$MODE" != "production" ]; then
        run_tests
    fi
    
    # Health check (se não for CI)
    if [ "$CI" != "true" ] && [ "$MODE" != "production" ]; then
        health_check
    fi
    
    # Informações finais
    show_info
}

# Verificar se o script está sendo executado diretamente
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
    main "$@"
fi

