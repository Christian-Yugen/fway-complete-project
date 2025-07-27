# Fway Backend - Sistema de Saúde Digital

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.0+-purple.svg)](https://www.prisma.io/)
[![Jest](https://img.shields.io/badge/Jest-29+-red.svg)](https://jestjs.io/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)

Backend robusto e escalável para o sistema Fway, implementando os melhores padrões de engenharia de software para garantir segurança, performance e manutenibilidade.

## 🚀 Características Principais

### 🔐 Segurança Avançada
- **Autenticação JWT** com access e refresh tokens
- **Criptografia Argon2** para senhas
- **RBAC** (Role-Based Access Control)
- **Rate Limiting** inteligente
- **Middleware de proteção** completo
- **Headers de segurança** automáticos

### 🧪 Testes Automatizados
- **Cobertura de 80%+** de código
- **Testes unitários** com Jest
- **Testes de integração** end-to-end
- **Mocks e fixtures** completos
- **CI/CD ready**

### 📖 Documentação Completa
- **Swagger UI** integrado
- **Guias de uso** detalhados
- **Estrutura de erros** padronizada
- **Exemplos práticos**

### 🏗️ Arquitetura Modular
- **Separação de responsabilidades** clara
- **Controllers, Services, Middlewares**
- **Configuração centralizada**
- **Utilitários reutilizáveis**

### 📈 Pronto para Escalar
- **Logs estruturados** com Winston
- **Health checks** avançados
- **Docker** e **Docker Compose**
- **Monitoramento** integrado
- **Métricas** de performance

## 📋 Índice

- [Instalação](#instalação)
- [Configuração](#configuração)
- [Uso](#uso)
- [API](#api)
- [Testes](#testes)
- [Deploy](#deploy)
- [Contribuição](#contribuição)

## 🛠️ Instalação

### Pré-requisitos

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** ou **yarn**
- **PostgreSQL** 13+ (opcional, SQLite para desenvolvimento)
- **Redis** (opcional, para cache)
- **Docker** (opcional, para containerização)

### Instalação Rápida

```bash
# Clonar repositório
git clone https://github.com/fway/backend.git
cd fway-backend

# Executar setup automático
./scripts/setup.sh

# Ou instalação manual
npm install
cp .env.example .env
npx prisma generate
npx prisma db push
npm start
```

### Instalação com Docker

```bash
# Desenvolvimento
docker-compose up -d

# Produção
docker-compose -f docker-compose.yml --profile production up -d
```

## ⚙️ Configuração

### Variáveis de Ambiente

Copie `.env.example` para `.env` e configure:

```env
# Aplicação
NODE_ENV=development
PORT=3001

# Banco de Dados
DATABASE_URL="postgresql://user:password@localhost:5432/fway"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Redis (opcional)
REDIS_URL="redis://localhost:6379"

# Email (opcional)
EMAIL_SERVICE="gmail"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"

# SMS (opcional)
SMS_SERVICE="twilio"
SMS_ACCOUNT_SID="your-twilio-sid"
SMS_AUTH_TOKEN="your-twilio-token"
```

### Banco de Dados

```bash
# Gerar cliente Prisma
npx prisma generate

# Aplicar migrações (produção)
npx prisma migrate deploy

# Sincronizar schema (desenvolvimento)
npx prisma db push

# Visualizar dados
npx prisma studio
```

## 🚀 Uso

### Desenvolvimento

```bash
# Iniciar em modo desenvolvimento
npm run dev

# Executar testes
npm test

# Executar testes em modo watch
npm run test:watch

# Verificar cobertura
npm run test:coverage

# Linting
npm run lint

# Formatação
npm run format
```

### Produção

```bash
# Iniciar em produção
npm start

# Com PM2
pm2 start ecosystem.config.js

# Com Docker
docker-compose up -d
```

## 📊 API

### Endpoints Principais

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/api/auth/register` | Registrar usuário | ❌ |
| POST | `/api/auth/login` | Login | ❌ |
| GET | `/api/auth/me` | Perfil do usuário | ✅ |
| GET | `/api/users` | Listar usuários | ✅ Admin |
| GET | `/api/professionals` | Listar profissionais | ❌ |
| GET | `/health` | Health check | ❌ |

### Documentação Completa

- **Swagger UI**: `http://localhost:3001/api-docs` (em desenvolvimento)
- **Guia de Uso**: [docs/api_usage.md](docs/api_usage.md)
- **Estrutura de Erros**: [docs/errors.md](docs/errors.md)

### Exemplo de Uso

```javascript
// Registro de usuário
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePass123!',
    firstName: 'João',
    lastName: 'Silva'
  })
})

const { data } = await response.json()
const { user, tokens } = data

// Usar token em requisições
const profileResponse = await fetch('/api/auth/me', {
  headers: {
    'Authorization': `Bearer ${tokens.accessToken}`
  }
})
```

## 🧪 Testes

### Executar Testes

```bash
# Todos os testes
npm test

# Testes unitários
npm run test:unit

# Testes de integração
npm run test:integration

# Cobertura
npm run test:coverage

# Modo watch
npm run test:watch
```

### Estrutura de Testes

```
tests/
├── setup.js              # Configuração global
├── unit/                  # Testes unitários
│   ├── authService.test.js
│   └── passwordUtils.test.js
└── integration/           # Testes de integração
    └── auth.test.js
```

### Cobertura Atual

- **Statements**: 80%+
- **Branches**: 75%+
- **Functions**: 85%+
- **Lines**: 80%+

## 🐳 Deploy

### Docker

```bash
# Build da imagem
docker build -t fway-backend .

# Executar container
docker run -p 3001:3001 fway-backend

# Com docker-compose
docker-compose up -d
```

### Produção

```bash
# Variáveis de ambiente
export NODE_ENV=production
export DATABASE_URL="postgresql://..."

# Executar migrações
npx prisma migrate deploy

# Iniciar aplicação
npm start
```

### Health Checks

```bash
# Status geral
curl http://localhost:3001/health

# Readiness
curl http://localhost:3001/health/ready

# Liveness
curl http://localhost:3001/health/live
```

## 📁 Estrutura do Projeto

```
src/
├── config/              # Configurações
│   ├── database.js      # Prisma
│   ├── express.js       # Express
│   ├── logger.js        # Winston
│   └── swagger.js       # Swagger
├── controllers/         # Controllers
│   └── authController.js
├── middlewares/         # Middlewares
│   ├── auth.js          # Autenticação
│   ├── errorHandler.js  # Tratamento de erros
│   └── validation.js    # Validação
├── routes/              # Rotas
│   ├── auth.js
│   ├── health.js
│   ├── professional.js
│   └── user.js
├── services/            # Lógica de negócio
│   └── authService.js
├── utils/               # Utilitários
│   ├── healthcheck.js
│   ├── jwt.js
│   └── password.js
└── server.js            # Entrada principal
```

## 🔧 Scripts Disponíveis

```bash
npm start              # Produção
npm run dev            # Desenvolvimento
npm test               # Testes
npm run test:unit      # Testes unitários
npm run test:integration # Testes de integração
npm run test:coverage  # Cobertura
npm run test:watch     # Modo watch
npm run lint           # ESLint
npm run lint:fix       # Corrigir lint
npm run format         # Prettier
npm run db:generate    # Gerar Prisma client
npm run db:push        # Sincronizar schema
npm run db:migrate     # Executar migrações
npm run db:studio      # Prisma Studio
```

## 🛡️ Segurança

### Práticas Implementadas

- ✅ **Autenticação JWT** segura
- ✅ **Criptografia Argon2** para senhas
- ✅ **Rate limiting** por IP
- ✅ **Validação** rigorosa de entrada
- ✅ **Headers de segurança** (Helmet)
- ✅ **CORS** configurável
- ✅ **Sanitização** de dados
- ✅ **Logs de auditoria**

### Configurações de Segurança

```javascript
// Rate limiting
app.use('/api/auth', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5 // 5 tentativas por IP
}))

// Headers de segurança
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}))

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}))
```

## 📊 Monitoramento

### Logs

```bash
# Ver logs em tempo real
tail -f logs/app.log

# Filtrar por nível
grep "ERROR" logs/app.log

# Logs estruturados
{
  "level": "info",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "message": "User logged in",
  "userId": "user_123",
  "ip": "192.168.1.1"
}
```

### Métricas

- **Health checks** automáticos
- **Tempo de resposta** das APIs
- **Uso de memória** e CPU
- **Conexões** de banco de dados
- **Rate limiting** por endpoint

## 🤝 Contribuição

### Como Contribuir

1. **Fork** o projeto
2. **Crie** uma branch (`git checkout -b feature/nova-funcionalidade`)
3. **Commit** suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. **Push** para a branch (`git push origin feature/nova-funcionalidade`)
5. **Abra** um Pull Request

### Padrões de Código

- **ESLint** para linting
- **Prettier** para formatação
- **Conventional Commits** para mensagens
- **Testes** obrigatórios para novas funcionalidades

### Executar Localmente

```bash
# Instalar dependências
npm install

# Configurar ambiente
cp .env.example .env

# Executar testes
npm test

# Iniciar desenvolvimento
npm run dev
```

## 📄 Licença

Este projeto está licenciado sob a [MIT License](LICENSE).

## 👥 Equipe

- **Backend**: Equipe Fway
- **DevOps**: Equipe Fway
- **QA**: Equipe Fway

## 📞 Suporte

- **Email**: dev@fway.com
- **Documentação**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/fway/backend/issues)

---

**Versão**: 1.0.0  
**Última atualização**: 2024-01-01

Feito com ❤️ pela equipe Fway

