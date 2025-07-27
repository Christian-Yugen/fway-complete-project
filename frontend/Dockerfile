# Dockerfile para Fway Frontend (React PWA)
# Multi-stage build para otimização

# Stage 1: Build da aplicação
FROM node:20-alpine AS builder

# Instalar dependências do sistema
RUN apk add --no-cache git

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production && npm cache clean --force

# Copiar código fonte
COPY . .

# Argumentos de build
ARG VITE_API_URL=http://localhost:3001
ENV VITE_API_URL=$VITE_API_URL

# Build da aplicação
RUN npm run build

# Stage 2: Servidor de produção
FROM nginx:alpine AS production

# Instalar curl para health checks
RUN apk add --no-cache curl

# Copiar arquivos de build
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuração customizada do Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S fway -u 1001

# Definir permissões
RUN chown -R fway:nodejs /usr/share/nginx/html && \
    chown -R fway:nodejs /var/cache/nginx && \
    chown -R fway:nodejs /var/log/nginx && \
    chown -R fway:nodejs /etc/nginx/conf.d

# Criar diretório para PID do nginx
RUN mkdir -p /var/run/nginx && \
    chown -R fway:nodejs /var/run/nginx

# Expor porta
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80 || exit 1

# Definir usuário
USER fway

# Comando de inicialização
CMD ["nginx", "-g", "daemon off;"]

# Labels para metadados
LABEL maintainer="Fway Team <dev@fway.com>"
LABEL version="1.0.0"
LABEL description="Fway Frontend PWA - Sistema de saúde digital"
LABEL org.opencontainers.image.source="https://github.com/fway/frontend"

