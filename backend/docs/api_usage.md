# Guia de Uso da API Fway

Este documento fornece um guia completo para usar a API do Fway, incluindo autenticação, endpoints disponíveis e exemplos práticos.

## 📋 Índice

- [Autenticação](#autenticação)
- [Estrutura de Resposta](#estrutura-de-resposta)
- [Códigos de Erro](#códigos-de-erro)
- [Rate Limiting](#rate-limiting)
- [Endpoints](#endpoints)
- [Exemplos Práticos](#exemplos-práticos)

## 🔐 Autenticação

A API utiliza autenticação JWT (JSON Web Tokens) com access tokens e refresh tokens.

### Fluxo de Autenticação

1. **Registro/Login**: Obtenha access token e refresh token
2. **Requisições**: Use access token no header `Authorization`
3. **Renovação**: Use refresh token quando access token expirar

### Headers de Autenticação

```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Exemplo de Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

**Resposta:**
```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "data": {
    "user": {
      "id": "clx1234567890",
      "email": "user@example.com",
      "firstName": "João",
      "lastName": "Silva",
      "role": "USER"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 900,
      "tokenType": "Bearer"
    }
  }
}
```

## 📊 Estrutura de Resposta

Todas as respostas seguem um padrão consistente:

### Resposta de Sucesso
```json
{
  "success": true,
  "message": "Operação realizada com sucesso",
  "data": {
    // Dados da resposta
  }
}
```

### Resposta de Erro
```json
{
  "success": false,
  "message": "Descrição do erro",
  "code": "ERROR_CODE",
  "errors": [
    // Detalhes dos erros (opcional)
  ]
}
```

### Resposta com Paginação
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "pages": 10
    }
  }
}
```

## ⚠️ Códigos de Erro

| Código | Status | Descrição |
|--------|--------|-----------|
| `VALIDATION_ERROR` | 400 | Dados de entrada inválidos |
| `UNAUTHORIZED` | 401 | Token inválido ou ausente |
| `FORBIDDEN` | 403 | Acesso negado |
| `NOT_FOUND` | 404 | Recurso não encontrado |
| `CONFLICT` | 409 | Conflito (ex: email já existe) |
| `RATE_LIMIT_EXCEEDED` | 429 | Muitas requisições |
| `INTERNAL_ERROR` | 500 | Erro interno do servidor |

## 🚦 Rate Limiting

A API implementa rate limiting para prevenir abuso:

- **Geral**: 100 requisições por 15 minutos por IP
- **Autenticação**: 5 tentativas por 15 minutos por IP
- **Upload**: 10 uploads por hora por usuário

Headers de resposta incluem informações sobre limites:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## 🛣️ Endpoints

### Autenticação (`/api/auth`)

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/register` | Registrar usuário | ❌ |
| POST | `/login` | Login | ❌ |
| POST | `/refresh` | Renovar token | ❌ |
| POST | `/logout` | Logout | ✅ |
| POST | `/logout-all` | Logout todos dispositivos | ✅ |
| GET | `/me` | Perfil do usuário | ✅ |
| POST | `/change-password` | Alterar senha | ✅ |
| POST | `/forgot-password` | Esqueci senha | ❌ |
| POST | `/reset-password` | Resetar senha | ❌ |

### Usuários (`/api/users`)

| Método | Endpoint | Descrição | Auth | Permissão |
|--------|----------|-----------|------|-----------|
| GET | `/` | Listar usuários | ✅ | Admin |
| GET | `/:id` | Obter usuário | ✅ | Owner/Admin |
| PUT | `/:id` | Atualizar usuário | ✅ | Owner/Admin |
| DELETE | `/:id` | Deletar usuário | ✅ | Admin |
| PATCH | `/:id/status` | Alterar status | ✅ | Admin |

### Profissionais (`/api/professionals`)

| Método | Endpoint | Descrição | Auth | Permissão |
|--------|----------|-----------|------|-----------|
| GET | `/` | Listar profissionais | ❌ | Público |
| GET | `/:id` | Obter profissional | ❌ | Público |
| POST | `/` | Registrar profissional | ✅ | User |
| PUT | `/:id` | Atualizar profissional | ✅ | Owner/Admin |

### Health Check (`/health`)

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/` | Status da aplicação | ❌ |
| GET | `/ready` | Readiness check | ❌ |
| GET | `/live` | Liveness check | ❌ |

## 💡 Exemplos Práticos

### 1. Registro de Usuário

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "novo@example.com",
    "password": "MinhaSenh@123",
    "firstName": "Maria",
    "lastName": "Santos",
    "phone": "+5511999999999"
  }'
```

### 2. Buscar Profissionais por Localização

```bash
curl -X GET "http://localhost:3001/api/professionals?latitude=-23.5505&longitude=-46.6333&radius=10&type=DOCTOR" \
  -H "Content-Type: application/json"
```

### 3. Atualizar Perfil de Usuário

```bash
curl -X PUT http://localhost:3001/api/users/clx1234567890 \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "João Carlos",
    "profile": {
      "address": "Rua Nova, 123",
      "city": "São Paulo",
      "state": "SP",
      "zipCode": "01234567"
    }
  }'
```

### 4. Registrar como Profissional

```bash
curl -X POST http://localhost:3001/api/professionals \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "DOCTOR",
    "specialization": "Cardiologia",
    "license": "CRM123456",
    "experience": 5,
    "address": "Av. Paulista, 1000",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "01310100",
    "consultationFee": 200.00,
    "latitude": -23.5505,
    "longitude": -46.6333
  }'
```

### 5. Renovar Token

```bash
curl -X POST http://localhost:3001/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

### 6. Logout de Todos os Dispositivos

```bash
curl -X POST http://localhost:3001/api/auth/logout-all \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json"
```

## 🔍 Filtros e Busca

### Parâmetros de Paginação
- `page`: Número da página (padrão: 1)
- `limit`: Itens por página (padrão: 10, máximo: 100)

### Parâmetros de Busca
- `search`: Busca textual
- `sort`: Campo para ordenação
- `order`: Direção da ordenação (`asc` ou `desc`)

### Filtros Específicos

#### Profissionais:
- `type`: Tipo do profissional
- `city`: Cidade
- `state`: Estado
- `latitude`, `longitude`, `radius`: Busca por proximidade

#### Usuários (Admin):
- `role`: Role do usuário
- `status`: Status do usuário

## 🛡️ Segurança

### Boas Práticas

1. **Sempre use HTTPS** em produção
2. **Armazene tokens de forma segura** (não em localStorage)
3. **Implemente refresh automático** de tokens
4. **Valide dados** no frontend antes de enviar
5. **Trate erros** adequadamente
6. **Respeite rate limits**

### Headers de Segurança

A API inclui headers de segurança automáticos:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security` (em HTTPS)

## 📱 Integração com Frontend

### React/JavaScript Example

```javascript
// Configuração do cliente API
class ApiClient {
  constructor(baseURL) {
    this.baseURL = baseURL
    this.accessToken = localStorage.getItem('accessToken')
    this.refreshToken = localStorage.getItem('refreshToken')
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    }

    if (this.accessToken) {
      config.headers.Authorization = `Bearer ${this.accessToken}`
    }

    try {
      const response = await fetch(url, config)
      
      if (response.status === 401 && this.refreshToken) {
        // Tentar renovar token
        await this.refreshAccessToken()
        config.headers.Authorization = `Bearer ${this.accessToken}`
        return fetch(url, config)
      }

      return response
    } catch (error) {
      throw error
    }
  }

  async refreshAccessToken() {
    const response = await fetch(`${this.baseURL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: this.refreshToken })
    })

    if (response.ok) {
      const data = await response.json()
      this.accessToken = data.data.tokens.accessToken
      localStorage.setItem('accessToken', this.accessToken)
    } else {
      // Redirect para login
      this.logout()
    }
  }

  logout() {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    window.location.href = '/login'
  }
}

// Uso
const api = new ApiClient('http://localhost:3001')

// Buscar profissionais
const professionals = await api.request('/api/professionals?city=São Paulo')
```

## 🐛 Debugging

### Logs

A aplicação gera logs estruturados que podem ser consultados:

```bash
# Ver logs em tempo real
tail -f logs/app.log

# Filtrar por nível
grep "ERROR" logs/app.log

# Filtrar por usuário
grep "userId:clx123" logs/app.log
```

### Health Check

Use os endpoints de health check para monitorar a aplicação:

```bash
# Status geral
curl http://localhost:3001/health

# Readiness (pronto para receber tráfego)
curl http://localhost:3001/health/ready

# Liveness (aplicação está viva)
curl http://localhost:3001/health/live
```

## 📞 Suporte

Para dúvidas ou problemas:

1. Consulte a [documentação Swagger](http://localhost:3001/api-docs) (em desenvolvimento)
2. Verifique os logs da aplicação
3. Entre em contato com a equipe de desenvolvimento

---

**Versão da API:** 1.0.0  
**Última atualização:** 2024-01-01

