# Dockerfile para Fway Backend
# Imagem otimizada para produção com multi-stage build

# Stage 1: Build dependencies
FROM node:20-alpine AS dependencies

# Instalar dependências do sistema necessárias
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    sqlite

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependências
RUN npm ci --only=production && npm cache clean --force

# Gerar cliente Prisma
RUN npx prisma generate

# Stage 2: Build application
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar dependências do stage anterior
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/package*.json ./

# Copiar código fonte
COPY . .

# Remover arquivos desnecessários
RUN rm -rf tests/ docs/ *.md .git* .env*

# Stage 3: Production image
FROM node:20-alpine AS production

# Instalar dependências do sistema para produção
RUN apk add --no-cache \
    dumb-init \
    sqlite \
    curl

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S fway -u 1001

# Definir diretório de trabalho
WORKDIR /app

# Copiar aplicação do stage builder
COPY --from=builder --chown=fway:nodejs /app ./

# Criar diretórios necessários
RUN mkdir -p logs uploads temp && \
    chown -R fway:nodejs logs uploads temp

# Definir variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=3001
ENV DATABASE_URL="file:./data/fway.db"

# Criar diretório para banco de dados
RUN mkdir -p data && chown -R fway:nodejs data

# Expor porta
EXPOSE 3001

# Definir usuário
USER fway

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1

# Comando de inicialização
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/server.js"]

# Labels para metadados
LABEL maintainer="Fway Team <dev@fway.com>"
LABEL version="1.0.0"
LABEL description="Fway Backend API - Sistema de saúde digital"
LABEL org.opencontainers.image.source="https://github.com/fway/backend"
LABEL org.opencontainers.image.documentation="https://api.fway.com/docs"

