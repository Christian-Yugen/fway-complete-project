# 🔧 Guia de Configuração Avançada - Fway Platform

## 📋 Índice

1. [Configurações de Desenvolvimento](#configurações-de-desenvolvimento)
2. [Configurações de Produção](#configurações-de-produção)
3. [Configurações de Segurança](#configurações-de-segurança)
4. [Configurações de Performance](#configurações-de-performance)
5. [Configurações de Monitoramento](#configurações-de-monitoramento)
6. [Scripts Úteis](#scripts-úteis)
7. [Docker e Containerização](#docker-e-containerização)
8. [CI/CD Pipeline](#cicd-pipeline)

---

## 🛠️ Configurações de Desenvolvimento

### 1. Configuração do VSCode

**Arquivo `.vscode/settings.json`:**
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "emmet.includeLanguages": {
    "javascript": "javascriptreact"
  },
  "files.associations": {
    "*.jsx": "javascriptreact"
  },
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

**Arquivo `.vscode/extensions.json`:**
```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "rangav.vscode-thunder-client",
    "ms-vscode.vscode-json"
  ]
}
```

### 2. Configuração do Prettier

**Arquivo `.prettierrc` (raiz do projeto):**
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

### 3. Configuração do ESLint

**Arquivo `.eslintrc.js` (frontend):**
```javascript
module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: ['react', '@typescript-eslint'],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
```

### 4. Scripts de Desenvolvimento

**Backend `package.json` scripts:**
```json
{
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:seed": "node prisma/seed.js",
    "db:reset": "prisma migrate reset",
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix",
    "format": "prettier --write src/"
  }
}
```

**Frontend `package.json` scripts:**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix",
    "format": "prettier --write src/",
    "type-check": "tsc --noEmit"
  }
}
```

---

## 🌐 Configurações de Produção

### 1. Variáveis de Ambiente - Produção

**Backend `.env.production`:**
```env
# Servidor
NODE_ENV=production
PORT=3001
HOST=0.0.0.0

# Banco de Dados
DATABASE_URL=postgresql://user:password@prod-db:5432/fway_prod

# Redis
REDIS_URL=redis://prod-redis:6379

# JWT
JWT_SECRET=sua_chave_super_secreta_producao_256_bits
JWT_REFRESH_SECRET=sua_chave_refresh_producao_256_bits
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Email
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=sua_api_key_sendgrid

# Stripe
STRIPE_SECRET_KEY=sk_live_sua_chave_live
STRIPE_PUBLISHABLE_KEY=pk_live_sua_chave_live
STRIPE_WEBHOOK_SECRET=whsec_sua_chave_webhook_live

# URLs
FRONTEND_URL=https://fway.com.br
BACKEND_URL=https://api.fway.com.br

# Logs
LOG_LEVEL=info
LOG_FILE=logs/app.log

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# CORS
CORS_ORIGIN=https://fway.com.br,https://www.fway.com.br
```

**Frontend `.env.production`:**
```env
VITE_API_BASE_URL=https://api.fway.com.br
VITE_SOCKET_URL=https://api.fway.com.br
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_sua_chave_live
VITE_GOOGLE_MAPS_API_KEY=sua_chave_google_maps
VITE_APP_ENV=production
VITE_SENTRY_DSN=sua_dsn_sentry
```

### 2. Configuração do Nginx

**Arquivo `nginx.conf`:**
```nginx
server {
    listen 80;
    server_name fway.com.br www.fway.com.br;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name fway.com.br www.fway.com.br;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    # Frontend
    location / {
        root /var/www/fway-frontend/dist;
        try_files $uri $uri/ /index.html;
        
        # Cache estático
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Socket.IO
    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3. PM2 Configuration

**Arquivo `ecosystem.config.js`:**
```javascript
module.exports = {
  apps: [
    {
      name: 'fway-backend',
      script: 'src/server.js',
      cwd: './fway-backend',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      max_memory_restart: '1G',
      node_args: '--max-old-space-size=1024',
    },
  ],
};
```

---

## 🔒 Configurações de Segurança

### 1. Helmet Configuration

**Backend `src/middleware/security.js`:**
```javascript
const helmet = require('helmet');

const securityMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.stripe.com"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
});

module.exports = securityMiddleware;
```

### 2. Rate Limiting

**Backend `src/middleware/rateLimiter.js`:**
```javascript
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const redis = require('../config/redis');

const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    store: new RedisStore({
      sendCommand: (...args) => redis.call(...args),
    }),
    windowMs,
    max,
    message: {
      error: message,
      retryAfter: Math.ceil(windowMs / 1000),
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Rate limiters específicos
const authLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutos
  5, // 5 tentativas
  'Muitas tentativas de login. Tente novamente em 15 minutos.'
);

const apiLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutos
  100, // 100 requests
  'Muitas requisições. Tente novamente em 15 minutos.'
);

module.exports = {
  authLimiter,
  apiLimiter,
};
```

### 3. Input Validation

**Backend `src/middleware/validation.js`:**
```javascript
const Joi = require('joi');
const { AppError } = require('./errorHandler');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return next(new AppError('Dados inválidos', 400, errors));
    }

    next();
  };
};

// Schemas comuns
const schemas = {
  email: Joi.string().email().required(),
  password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required(),
  phone: Joi.string().pattern(/^\(\d{2}\)\s\d{4,5}-\d{4}$/).required(),
  cpf: Joi.string().pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/).required(),
};

module.exports = {
  validate,
  schemas,
};
```

---

## ⚡ Configurações de Performance

### 1. Configuração do Redis

**Backend `src/config/redis.js` (otimizado):**
```javascript
const redis = require('redis');

const redisClient = redis.createClient({
  url: process.env.REDIS_URL,
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 50, 500),
    connectTimeout: 5000,
    lazyConnect: true,
  },
  database: 0,
});

// Configurações de performance
redisClient.configSet('maxmemory', '256mb');
redisClient.configSet('maxmemory-policy', 'allkeys-lru');

// Cache wrapper com TTL inteligente
class CacheManager {
  static async get(key) {
    try {
      const value = await redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  static async set(key, value, ttl = 3600) {
    try {
      await redisClient.setEx(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  static async invalidatePattern(pattern) {
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
      return keys.length;
    } catch (error) {
      console.error('Cache invalidation error:', error);
      return 0;
    }
  }
}

module.exports = CacheManager;
```

### 2. Database Optimization

**Backend `src/config/database.js`:**
```javascript
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Connection pooling
prisma.$connect();

// Middleware para logging de queries lentas
prisma.$use(async (params, next) => {
  const before = Date.now();
  const result = await next(params);
  const after = Date.now();
  
  const queryTime = after - before;
  
  if (queryTime > 1000) { // Log queries > 1s
    console.warn(`Slow query detected: ${params.model}.${params.action} took ${queryTime}ms`);
  }
  
  return result;
});

module.exports = prisma;
```

### 3. Frontend Optimization

**Frontend `vite.config.js` (otimizado):**
```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          charts: ['recharts'],
          utils: ['date-fns', 'clsx', 'tailwind-merge'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: 5173,
    host: true,
  },
  preview: {
    port: 4173,
    host: true,
  },
});
```

---

## 📊 Configurações de Monitoramento

### 1. Logging Configuration

**Backend `src/config/logger.js`:**
```javascript
const winston = require('winston');
const path = require('path');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'fway-backend' },
  transports: [
    new winston.transports.File({
      filename: path.join('logs', 'error.log'),
      level: 'error',
    }),
    new winston.transports.File({
      filename: path.join('logs', 'combined.log'),
    }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
```

### 2. Health Check

**Backend `src/routes/health.js`:**
```javascript
const express = require('express');
const prisma = require('../config/database');
const redis = require('../config/redis');

const router = express.Router();

router.get('/health', async (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version,
    services: {},
  };

  try {
    // Test database
    await prisma.$queryRaw`SELECT 1`;
    health.services.database = 'OK';
  } catch (error) {
    health.services.database = 'ERROR';
    health.status = 'ERROR';
  }

  try {
    // Test Redis
    await redis.ping();
    health.services.redis = 'OK';
  } catch (error) {
    health.services.redis = 'ERROR';
  }

  const statusCode = health.status === 'OK' ? 200 : 503;
  res.status(statusCode).json(health);
});

router.get('/metrics', async (req, res) => {
  const metrics = {
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    uptime: process.uptime(),
    activeConnections: req.socket.server._connections,
  };

  res.json(metrics);
});

module.exports = router;
```

### 3. Error Tracking

**Frontend `src/utils/errorTracking.js`:**
```javascript
import * as Sentry from '@sentry/react';

// Configuração do Sentry
if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.VITE_APP_ENV,
    tracesSampleRate: 1.0,
  });
}

export const captureError = (error, context = {}) => {
  console.error('Error captured:', error);
  
  if (import.meta.env.VITE_SENTRY_DSN) {
    Sentry.captureException(error, {
      tags: context,
    });
  }
};

export const captureMessage = (message, level = 'info') => {
  console.log(`[${level}] ${message}`);
  
  if (import.meta.env.VITE_SENTRY_DSN) {
    Sentry.captureMessage(message, level);
  }
};
```

---

## 🔧 Scripts Úteis

### 1. Scripts de Backup

**Script `scripts/backup-db.sh`:**
```bash
#!/bin/bash

# Configurações
DB_NAME="fway_db"
DB_USER="postgres"
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Criar diretório de backup
mkdir -p $BACKUP_DIR

# Fazer backup
pg_dump -U $DB_USER -h localhost $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# Compactar
gzip $BACKUP_DIR/backup_$DATE.sql

# Limpar backups antigos (manter últimos 7 dias)
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete

echo "Backup criado: $BACKUP_DIR/backup_$DATE.sql.gz"
```

### 2. Scripts de Deploy

**Script `scripts/deploy.sh`:**
```bash
#!/bin/bash

echo "🚀 Iniciando deploy do Fway..."

# Parar serviços
pm2 stop fway-backend

# Atualizar código
git pull origin main

# Backend
cd fway-backend
npm ci --production
npx prisma generate
npx prisma db push

# Frontend
cd ../fway-frontend
npm ci
npm run build

# Copiar build para nginx
sudo cp -r dist/* /var/www/fway-frontend/

# Reiniciar serviços
pm2 start fway-backend
sudo systemctl reload nginx

echo "✅ Deploy concluído!"
```

### 3. Scripts de Monitoramento

**Script `scripts/monitor.sh`:**
```bash
#!/bin/bash

# Verificar serviços
echo "🔍 Verificando serviços..."

# Backend
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ Backend: OK"
else
    echo "❌ Backend: ERROR"
    pm2 restart fway-backend
fi

# Nginx
if systemctl is-active --quiet nginx; then
    echo "✅ Nginx: OK"
else
    echo "❌ Nginx: ERROR"
    sudo systemctl start nginx
fi

# PostgreSQL
if systemctl is-active --quiet postgresql; then
    echo "✅ PostgreSQL: OK"
else
    echo "❌ PostgreSQL: ERROR"
    sudo systemctl start postgresql
fi

# Redis
if systemctl is-active --quiet redis; then
    echo "✅ Redis: OK"
else
    echo "❌ Redis: ERROR"
    sudo systemctl start redis
fi
```

---

## 🐳 Docker e Containerização

### 1. Backend Dockerfile

**Arquivo `fway-backend/Dockerfile`:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Instalar dependências
COPY package*.json ./
RUN npm ci --only=production

# Copiar código
COPY . .

# Gerar Prisma client
RUN npx prisma generate

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Mudar ownership
RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 3001

CMD ["npm", "start"]
```

### 2. Frontend Dockerfile

**Arquivo `fway-frontend/Dockerfile`:**
```dockerfile
FROM node:18-alpine as builder

WORKDIR /app

# Instalar dependências
COPY package*.json ./
RUN npm ci

# Copiar código e fazer build
COPY . .
RUN npm run build

# Nginx para servir arquivos estáticos
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### 3. Docker Compose

**Arquivo `docker-compose.yml`:**
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: fway_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data

  backend:
    build: ./fway-backend
    environment:
      DATABASE_URL: postgresql://postgres:password@postgres:5432/fway_db
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - redis
    ports:
      - "3001:3001"

  frontend:
    build: ./fway-frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
  redis_data:
```

---

## 🔄 CI/CD Pipeline

### 1. GitHub Actions

**Arquivo `.github/workflows/deploy.yml`:**
```yaml
name: Deploy Fway

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: |
            fway-backend/package-lock.json
            fway-frontend/package-lock.json

      - name: Install Backend Dependencies
        run: |
          cd fway-backend
          npm ci

      - name: Install Frontend Dependencies
        run: |
          cd fway-frontend
          npm ci

      - name: Run Backend Tests
        run: |
          cd fway-backend
          npm test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db

      - name: Run Frontend Tests
        run: |
          cd fway-frontend
          npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Production
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /var/www/fway
            git pull origin main
            ./scripts/deploy.sh
```

### 2. Configuração de Secrets

No GitHub, configure os seguintes secrets:

- `HOST`: IP do servidor de produção
- `USERNAME`: Usuário SSH
- `SSH_KEY`: Chave privada SSH
- `DATABASE_URL`: URL do banco de produção
- `JWT_SECRET`: Chave JWT de produção

---

**✅ Configuração Avançada Completa!**

Este guia fornece todas as configurações necessárias para um ambiente de produção robusto e escalável.

