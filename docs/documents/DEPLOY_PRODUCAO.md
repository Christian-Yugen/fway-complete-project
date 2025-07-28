# 🚀 Guia de Deploy e Produção - Fway Platform

## 📋 Índice

1. [Preparação para Deploy](#preparação-para-deploy)
2. [Deploy em Diferentes Plataformas](#deploy-em-diferentes-plataformas)
3. [Configuração de Domínio e SSL](#configuração-de-domínio-e-ssl)
4. [Monitoramento e Logs](#monitoramento-e-logs)
5. [Backup e Recuperação](#backup-e-recuperação)
6. [Escalabilidade](#escalabilidade)
7. [Manutenção](#manutenção)

---

## 🛠️ Preparação para Deploy

### 1. Checklist Pré-Deploy

**✅ Backend:**
- [ ] Todas as variáveis de ambiente configuradas
- [ ] Banco de dados de produção criado
- [ ] Migrações testadas
- [ ] Testes passando
- [ ] Logs configurados
- [ ] Rate limiting ativado
- [ ] CORS configurado corretamente
- [ ] Secrets seguros (JWT, API keys)

**✅ Frontend:**
- [ ] Build de produção funcionando
- [ ] URLs da API atualizadas
- [ ] Assets otimizados
- [ ] PWA configurado
- [ ] Analytics configurado
- [ ] Error tracking ativo

**✅ Infraestrutura:**
- [ ] Servidor configurado
- [ ] Banco de dados provisionado
- [ ] Redis configurado
- [ ] SSL certificado
- [ ] Domínio configurado
- [ ] CDN configurado (opcional)

### 2. Configuração de Ambiente

**Arquivo `deploy.env`:**
```env
# Produção
NODE_ENV=production
PORT=3001

# URLs
FRONTEND_URL=https://fway.com.br
BACKEND_URL=https://api.fway.com.br

# Banco de Dados
DATABASE_URL=postgresql://user:pass@prod-db:5432/fway_prod

# Redis
REDIS_URL=redis://prod-redis:6379

# Segurança
JWT_SECRET=sua_chave_super_secreta_256_bits
CORS_ORIGIN=https://fway.com.br,https://www.fway.com.br

# Email
EMAIL_HOST=smtp.sendgrid.net
EMAIL_USER=apikey
EMAIL_PASSWORD=SG.sua_api_key

# Stripe
STRIPE_SECRET_KEY=sk_live_sua_chave_live
STRIPE_WEBHOOK_SECRET=whsec_sua_chave_webhook

# Monitoramento
SENTRY_DSN=https://sua_dsn@sentry.io/projeto
LOG_LEVEL=info
```

---

## 🌐 Deploy em Diferentes Plataformas

### 1. Deploy no Vercel (Frontend)

**Configuração:**
```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd fway-frontend
vercel --prod
```

**Arquivo `vercel.json`:**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "VITE_API_BASE_URL": "https://api.fway.com.br",
    "VITE_STRIPE_PUBLISHABLE_KEY": "pk_live_sua_chave"
  }
}
```

### 2. Deploy no Heroku (Backend)

**Configuração:**
```bash
# Instalar Heroku CLI
# Baixar de: https://devcenter.heroku.com/articles/heroku-cli

# Login
heroku login

# Criar app
heroku create fway-backend

# Configurar variáveis
heroku config:set NODE_ENV=production
heroku config:set DATABASE_URL=postgresql://...
heroku config:set JWT_SECRET=sua_chave

# Deploy
git push heroku main
```

**Arquivo `Procfile`:**
```
web: npm start
worker: node src/workers/index.js
```

### 3. Deploy no Railway

**Configuração:**
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Criar projeto
railway new

# Deploy
railway up
```

**Arquivo `railway.json`:**
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/health"
  }
}
```

### 4. Deploy no DigitalOcean (VPS)

**1. Configurar Droplet:**
```bash
# Conectar via SSH
ssh root@seu_ip

# Atualizar sistema
apt update && apt upgrade -y

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Instalar PM2
npm install -g pm2

# Instalar Nginx
apt install nginx -y

# Instalar PostgreSQL
apt install postgresql postgresql-contrib -y
```

**2. Configurar aplicação:**
```bash
# Clonar repositório
git clone https://github.com/seu-usuario/fway.git
cd fway

# Backend
cd fway-backend
npm install --production
npx prisma generate
npx prisma db push

# Frontend
cd ../fway-frontend
npm install
npm run build

# Copiar para Nginx
cp -r dist/* /var/www/html/
```

**3. Configurar PM2:**
```bash
# Iniciar aplicação
pm2 start ecosystem.config.js

# Salvar configuração
pm2 save
pm2 startup
```

### 5. Deploy com Docker

**1. Build das imagens:**
```bash
# Backend
docker build -t fway-backend ./fway-backend

# Frontend
docker build -t fway-frontend ./fway-frontend
```

**2. Docker Compose produção:**
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: fway_prod
      POSTGRES_USER: fway_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    restart: unless-stopped

  backend:
    image: fway-backend:latest
    environment:
      DATABASE_URL: postgresql://fway_user:${DB_PASSWORD}@postgres:5432/fway_prod
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

  frontend:
    image: fway-frontend:latest
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

**3. Deploy:**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🔒 Configuração de Domínio e SSL

### 1. Configuração de DNS

**Registros necessários:**
```
A     fway.com.br          -> IP_DO_SERVIDOR
A     www.fway.com.br      -> IP_DO_SERVIDOR
A     api.fway.com.br      -> IP_DO_SERVIDOR
CNAME admin.fway.com.br    -> fway.com.br
```

### 2. SSL com Let's Encrypt

**Instalação do Certbot:**
```bash
# Ubuntu/Debian
apt install certbot python3-certbot-nginx

# Gerar certificado
certbot --nginx -d fway.com.br -d www.fway.com.br -d api.fway.com.br

# Renovação automática
crontab -e
# Adicionar: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 3. Configuração do Nginx

**Arquivo `/etc/nginx/sites-available/fway`:**
```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name fway.com.br www.fway.com.br;
    return 301 https://$server_name$request_uri;
}

# Frontend
server {
    listen 443 ssl http2;
    server_name fway.com.br www.fway.com.br;

    ssl_certificate /etc/letsencrypt/live/fway.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/fway.com.br/privkey.pem;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;

    # Security Headers
    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;

    # Frontend
    location / {
        root /var/www/fway-frontend;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}

# Backend API
server {
    listen 443 ssl http2;
    server_name api.fway.com.br;

    ssl_certificate /etc/letsencrypt/live/fway.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/fway.com.br/privkey.pem;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
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

**Ativar configuração:**
```bash
ln -s /etc/nginx/sites-available/fway /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

---

## 📊 Monitoramento e Logs

### 1. Configuração de Logs

**Backend logging:**
```javascript
// src/config/logger.js
const winston = require('winston');
const path = require('path');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: path.join('logs', 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: path.join('logs', 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

module.exports = logger;
```

### 2. Monitoramento com PM2

**Configuração PM2:**
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'fway-backend',
    script: 'src/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024',
    watch: false,
    ignore_watch: ['node_modules', 'logs'],
  }],
};
```

**Comandos PM2:**
```bash
# Status
pm2 status

# Logs
pm2 logs fway-backend

# Monitoramento
pm2 monit

# Restart
pm2 restart fway-backend

# Reload (zero downtime)
pm2 reload fway-backend
```

### 3. Monitoramento com Grafana + Prometheus

**Docker Compose para monitoramento:**
```yaml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana

volumes:
  grafana_data:
```

### 4. Alertas

**Script de monitoramento:**
```bash
#!/bin/bash
# monitor.sh

# Verificar se aplicação está respondendo
if ! curl -f http://localhost:3001/health > /dev/null 2>&1; then
    echo "❌ Backend não está respondendo"
    # Enviar alerta
    curl -X POST "https://api.telegram.org/bot$BOT_TOKEN/sendMessage" \
         -d "chat_id=$CHAT_ID" \
         -d "text=🚨 Fway Backend está fora do ar!"
    
    # Tentar restart
    pm2 restart fway-backend
fi

# Verificar uso de memória
MEMORY_USAGE=$(free | grep Mem | awk '{printf("%.2f", $3/$2 * 100.0)}')
if (( $(echo "$MEMORY_USAGE > 90" | bc -l) )); then
    echo "⚠️ Uso de memória alto: $MEMORY_USAGE%"
fi

# Verificar espaço em disco
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 85 ]; then
    echo "⚠️ Espaço em disco baixo: $DISK_USAGE%"
fi
```

**Cron job:**
```bash
# Executar a cada 5 minutos
*/5 * * * * /path/to/monitor.sh
```

---

## 💾 Backup e Recuperação

### 1. Backup do Banco de Dados

**Script de backup automático:**
```bash
#!/bin/bash
# backup-db.sh

DB_NAME="fway_prod"
DB_USER="fway_user"
BACKUP_DIR="/backups/database"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Criar diretório
mkdir -p $BACKUP_DIR

# Backup
pg_dump -U $DB_USER -h localhost $DB_NAME | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Upload para S3 (opcional)
aws s3 cp $BACKUP_DIR/backup_$DATE.sql.gz s3://fway-backups/database/

# Limpar backups antigos
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "✅ Backup criado: backup_$DATE.sql.gz"
```

### 2. Backup de Arquivos

**Script de backup de uploads:**
```bash
#!/bin/bash
# backup-files.sh

UPLOAD_DIR="/var/www/fway/uploads"
BACKUP_DIR="/backups/files"
DATE=$(date +%Y%m%d_%H%M%S)

# Criar backup
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz $UPLOAD_DIR

# Upload para S3
aws s3 cp $BACKUP_DIR/uploads_$DATE.tar.gz s3://fway-backups/files/

echo "✅ Backup de arquivos criado: uploads_$DATE.tar.gz"
```

### 3. Restauração

**Restaurar banco de dados:**
```bash
#!/bin/bash
# restore-db.sh

BACKUP_FILE=$1
DB_NAME="fway_prod"
DB_USER="fway_user"

if [ -z "$BACKUP_FILE" ]; then
    echo "Uso: $0 <arquivo_backup.sql.gz>"
    exit 1
fi

# Parar aplicação
pm2 stop fway-backend

# Restaurar banco
gunzip -c $BACKUP_FILE | psql -U $DB_USER -d $DB_NAME

# Reiniciar aplicação
pm2 start fway-backend

echo "✅ Banco restaurado com sucesso"
```

### 4. Cron Jobs para Backup

```bash
# Backup diário do banco às 2h
0 2 * * * /scripts/backup-db.sh

# Backup semanal de arquivos aos domingos às 3h
0 3 * * 0 /scripts/backup-files.sh

# Backup de logs mensalmente
0 4 1 * * tar -czf /backups/logs/logs_$(date +%Y%m).tar.gz /var/log/fway/
```

---

## 📈 Escalabilidade

### 1. Load Balancer com Nginx

**Configuração para múltiplas instâncias:**
```nginx
upstream fway_backend {
    least_conn;
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
    server 127.0.0.1:3003;
}

server {
    listen 443 ssl http2;
    server_name api.fway.com.br;

    location / {
        proxy_pass http://fway_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 2. Cluster com PM2

**Configuração cluster:**
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'fway-backend',
    script: 'src/server.js',
    instances: 'max', // Usar todos os cores
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
    },
  }],
};
```

### 3. Database Scaling

**Read Replicas:**
```javascript
// src/config/database.js
const { PrismaClient } = require('@prisma/client');

const prismaWrite = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_WRITE_URL,
    },
  },
});

const prismaRead = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_READ_URL,
    },
  },
});

module.exports = {
  write: prismaWrite,
  read: prismaRead,
};
```

### 4. CDN Configuration

**Cloudflare setup:**
```javascript
// Frontend build com CDN
const cdnUrl = 'https://cdn.fway.com.br';

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? cdnUrl : '/',
  build: {
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name].[hash][extname]',
        chunkFileNames: 'assets/[name].[hash].js',
        entryFileNames: 'assets/[name].[hash].js',
      },
    },
  },
});
```

---

## 🔧 Manutenção

### 1. Atualizações

**Script de atualização:**
```bash
#!/bin/bash
# update.sh

echo "🔄 Iniciando atualização..."

# Backup antes da atualização
./scripts/backup-db.sh

# Parar aplicação
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
sudo cp -r dist/* /var/www/fway-frontend/

# Reiniciar serviços
pm2 start fway-backend
sudo systemctl reload nginx

echo "✅ Atualização concluída!"
```

### 2. Limpeza de Logs

**Script de limpeza:**
```bash
#!/bin/bash
# cleanup.sh

# Limpar logs antigos (> 30 dias)
find /var/log/fway -name "*.log" -mtime +30 -delete

# Limpar uploads temporários
find /var/www/fway/uploads/temp -mtime +1 -delete

# Limpar cache Redis
redis-cli FLUSHDB

# Limpar logs do PM2
pm2 flush

echo "✅ Limpeza concluída!"
```

### 3. Health Checks

**Script de verificação:**
```bash
#!/bin/bash
# health-check.sh

echo "🔍 Verificando saúde do sistema..."

# Verificar serviços
services=("nginx" "postgresql" "redis")
for service in "${services[@]}"; do
    if systemctl is-active --quiet $service; then
        echo "✅ $service: OK"
    else
        echo "❌ $service: ERROR"
    fi
done

# Verificar aplicação
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ Backend: OK"
else
    echo "❌ Backend: ERROR"
fi

# Verificar espaço em disco
df -h

# Verificar memória
free -h

# Verificar CPU
top -bn1 | grep "Cpu(s)"
```

### 4. Rotação de Logs

**Configuração logrotate:**
```bash
# /etc/logrotate.d/fway
/var/log/fway/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        systemctl reload nginx
        pm2 reloadLogs
    endscript
}
```

---

## 📞 Suporte e Troubleshooting

### Problemas Comuns

**1. Aplicação não inicia:**
```bash
# Verificar logs
pm2 logs fway-backend

# Verificar porta
netstat -tulpn | grep :3001

# Verificar variáveis de ambiente
pm2 env 0
```

**2. Banco de dados inacessível:**
```bash
# Verificar status
systemctl status postgresql

# Testar conexão
psql -U fway_user -d fway_prod -h localhost

# Verificar logs
tail -f /var/log/postgresql/postgresql-14-main.log
```

**3. SSL não funciona:**
```bash
# Verificar certificado
certbot certificates

# Testar configuração Nginx
nginx -t

# Renovar certificado
certbot renew --dry-run
```

### Contatos de Emergência

- **DevOps:** devops@fway.com.br
- **Suporte:** suporte@fway.com.br
- **Telegram:** @fway_alerts
- **Status Page:** https://status.fway.com.br

---

**🚀 Deploy Completo! Sua plataforma Fway está em produção!**

