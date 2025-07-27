# Estrutura de Erros - API Fway

Este documento descreve a estrutura padronizada de erros da API Fway, incluindo códigos, formatos e exemplos de tratamento.

## 📋 Índice

- [Formato Padrão](#formato-padrão)
- [Códigos de Status HTTP](#códigos-de-status-http)
- [Códigos de Erro Customizados](#códigos-de-erro-customizados)
- [Categorias de Erro](#categorias-de-erro)
- [Exemplos por Categoria](#exemplos-por-categoria)
- [Tratamento no Frontend](#tratamento-no-frontend)

## 🔧 Formato Padrão

Todos os erros seguem uma estrutura consistente para facilitar o tratamento no frontend:

```json
{
  "success": false,
  "message": "Descrição legível do erro",
  "code": "ERROR_CODE",
  "errors": [
    {
      "field": "campo_com_erro",
      "message": "Descrição específica do erro no campo",
      "value": "valor_rejeitado"
    }
  ],
  "timestamp": "2024-01-01T12:00:00.000Z",
  "path": "/api/endpoint",
  "requestId": "req_123456789"
}
```

### Campos Obrigatórios
- `success`: Sempre `false` para erros
- `message`: Mensagem principal do erro
- `code`: Código identificador do erro

### Campos Opcionais
- `errors`: Array com detalhes específicos (principalmente para validação)
- `timestamp`: Timestamp do erro
- `path`: Endpoint onde ocorreu o erro
- `requestId`: ID único da requisição para debugging

## 📊 Códigos de Status HTTP

| Status | Descrição | Uso |
|--------|-----------|-----|
| 400 | Bad Request | Dados inválidos, validação falhou |
| 401 | Unauthorized | Token ausente, inválido ou expirado |
| 403 | Forbidden | Acesso negado, permissões insuficientes |
| 404 | Not Found | Recurso não encontrado |
| 409 | Conflict | Conflito de dados (ex: email já existe) |
| 422 | Unprocessable Entity | Dados válidos mas não processáveis |
| 429 | Too Many Requests | Rate limit excedido |
| 500 | Internal Server Error | Erro interno do servidor |
| 503 | Service Unavailable | Serviço temporariamente indisponível |

## 🏷️ Códigos de Erro Customizados

### Autenticação e Autorização

| Código | Status | Descrição |
|--------|--------|-----------|
| `MISSING_TOKEN` | 401 | Token de autenticação não fornecido |
| `INVALID_TOKEN` | 401 | Token inválido ou malformado |
| `EXPIRED_TOKEN` | 401 | Token expirado |
| `UNAUTHORIZED` | 401 | Credenciais inválidas |
| `FORBIDDEN` | 403 | Acesso negado |
| `INSUFFICIENT_PERMISSIONS` | 403 | Permissões insuficientes |

### Validação de Dados

| Código | Status | Descrição |
|--------|--------|-----------|
| `VALIDATION_ERROR` | 400 | Erro de validação de dados |
| `REQUIRED_FIELD` | 400 | Campo obrigatório ausente |
| `INVALID_FORMAT` | 400 | Formato de dados inválido |
| `INVALID_EMAIL` | 400 | Email em formato inválido |
| `WEAK_PASSWORD` | 400 | Senha não atende critérios de segurança |
| `INVALID_PHONE` | 400 | Telefone em formato inválido |

### Recursos e Dados

| Código | Status | Descrição |
|--------|--------|-----------|
| `NOT_FOUND` | 404 | Recurso não encontrado |
| `USER_NOT_FOUND` | 404 | Usuário não encontrado |
| `PROFESSIONAL_NOT_FOUND` | 404 | Profissional não encontrado |
| `ALREADY_EXISTS` | 409 | Recurso já existe |
| `EMAIL_EXISTS` | 409 | Email já está em uso |
| `LICENSE_EXISTS` | 409 | Licença profissional já existe |

### Conta e Status

| Código | Status | Descrição |
|--------|--------|-----------|
| `ACCOUNT_SUSPENDED` | 403 | Conta suspensa |
| `ACCOUNT_INACTIVE` | 403 | Conta inativa |
| `EMAIL_NOT_VERIFIED` | 403 | Email não verificado |
| `PROFESSIONAL_NOT_VERIFIED` | 403 | Profissional não verificado |

### Rate Limiting

| Código | Status | Descrição |
|--------|--------|-----------|
| `RATE_LIMIT_EXCEEDED` | 429 | Limite de requisições excedido |
| `TOO_MANY_LOGIN_ATTEMPTS` | 429 | Muitas tentativas de login |
| `TOO_MANY_REQUESTS` | 429 | Muitas requisições em geral |

### Sistema

| Código | Status | Descrição |
|--------|--------|-----------|
| `INTERNAL_ERROR` | 500 | Erro interno do servidor |
| `DATABASE_ERROR` | 500 | Erro de banco de dados |
| `SERVICE_UNAVAILABLE` | 503 | Serviço indisponível |
| `MAINTENANCE_MODE` | 503 | Sistema em manutenção |

## 📂 Categorias de Erro

### 1. Erros de Validação (400)

Ocorrem quando os dados enviados não atendem aos critérios de validação.

**Exemplo:**
```json
{
  "success": false,
  "message": "Dados de entrada inválidos",
  "code": "VALIDATION_ERROR",
  "errors": [
    {
      "field": "email",
      "message": "Email deve ter um formato válido",
      "value": "email-invalido"
    },
    {
      "field": "password",
      "message": "Senha deve ter pelo menos 8 caracteres",
      "value": "123"
    }
  ]
}
```

### 2. Erros de Autenticação (401)

Ocorrem quando há problemas com tokens ou credenciais.

**Exemplo:**
```json
{
  "success": false,
  "message": "Token de acesso inválido",
  "code": "INVALID_TOKEN"
}
```

### 3. Erros de Autorização (403)

Ocorrem quando o usuário não tem permissão para acessar o recurso.

**Exemplo:**
```json
{
  "success": false,
  "message": "Acesso negado. Apenas administradores podem acessar este recurso",
  "code": "INSUFFICIENT_PERMISSIONS"
}
```

### 4. Erros de Recurso (404)

Ocorrem quando um recurso solicitado não é encontrado.

**Exemplo:**
```json
{
  "success": false,
  "message": "Usuário não encontrado",
  "code": "USER_NOT_FOUND"
}
```

### 5. Erros de Conflito (409)

Ocorrem quando há conflito com dados existentes.

**Exemplo:**
```json
{
  "success": false,
  "message": "Email já está em uso",
  "code": "EMAIL_EXISTS"
}
```

### 6. Erros de Rate Limiting (429)

Ocorrem quando limites de requisição são excedidos.

**Exemplo:**
```json
{
  "success": false,
  "message": "Muitas tentativas de login. Tente novamente em 15 minutos",
  "code": "TOO_MANY_LOGIN_ATTEMPTS",
  "retryAfter": 900
}
```

### 7. Erros de Servidor (500)

Ocorrem quando há problemas internos no servidor.

**Exemplo:**
```json
{
  "success": false,
  "message": "Erro interno do servidor",
  "code": "INTERNAL_ERROR",
  "requestId": "req_123456789"
}
```

## 💻 Tratamento no Frontend

### React/JavaScript Example

```javascript
// Classe para tratamento de erros
class ApiErrorHandler {
  static handle(error, response) {
    if (!response) {
      return this.handleNetworkError(error)
    }

    switch (response.status) {
      case 400:
        return this.handleValidationError(response.data)
      case 401:
        return this.handleAuthError(response.data)
      case 403:
        return this.handleForbiddenError(response.data)
      case 404:
        return this.handleNotFoundError(response.data)
      case 409:
        return this.handleConflictError(response.data)
      case 429:
        return this.handleRateLimitError(response.data)
      case 500:
        return this.handleServerError(response.data)
      default:
        return this.handleUnknownError(response.data)
    }
  }

  static handleValidationError(errorData) {
    const { errors } = errorData
    
    // Exibir erros específicos por campo
    if (errors && errors.length > 0) {
      errors.forEach(error => {
        this.showFieldError(error.field, error.message)
      })
    } else {
      this.showGeneralError(errorData.message)
    }
  }

  static handleAuthError(errorData) {
    const { code } = errorData
    
    switch (code) {
      case 'EXPIRED_TOKEN':
        // Tentar renovar token
        return this.refreshToken()
      case 'INVALID_TOKEN':
      case 'MISSING_TOKEN':
        // Redirecionar para login
        return this.redirectToLogin()
      default:
        this.showGeneralError('Credenciais inválidas')
    }
  }

  static handleForbiddenError(errorData) {
    const { code } = errorData
    
    switch (code) {
      case 'ACCOUNT_SUSPENDED':
        this.showAccountSuspendedModal()
        break
      case 'EMAIL_NOT_VERIFIED':
        this.showEmailVerificationModal()
        break
      default:
        this.showGeneralError('Acesso negado')
    }
  }

  static handleRateLimitError(errorData) {
    const { retryAfter } = errorData
    const minutes = Math.ceil(retryAfter / 60)
    
    this.showGeneralError(
      `Muitas tentativas. Tente novamente em ${minutes} minutos`
    )
  }

  // Métodos auxiliares
  static showFieldError(field, message) {
    // Implementar exibição de erro específico do campo
    console.error(`Campo ${field}: ${message}`)
  }

  static showGeneralError(message) {
    // Implementar exibição de erro geral
    console.error(message)
  }

  static redirectToLogin() {
    window.location.href = '/login'
  }

  static async refreshToken() {
    // Implementar renovação de token
  }
}

// Hook React para tratamento de erros
function useApiError() {
  const handleError = useCallback((error, response) => {
    ApiErrorHandler.handle(error, response)
  }, [])

  return { handleError }
}

// Interceptor Axios
axios.interceptors.response.use(
  response => response,
  error => {
    ApiErrorHandler.handle(error, error.response)
    return Promise.reject(error)
  }
)
```

### Validação de Formulários

```javascript
// Componente de formulário com tratamento de erros
function UserForm() {
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (formData) => {
    setLoading(true)
    setErrors({})

    try {
      await api.post('/api/users', formData)
      // Sucesso
    } catch (error) {
      if (error.response?.status === 400) {
        const { errors: validationErrors } = error.response.data
        
        // Converter array de erros em objeto por campo
        const fieldErrors = {}
        validationErrors?.forEach(err => {
          fieldErrors[err.field] = err.message
        })
        
        setErrors(fieldErrors)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input 
        name="email" 
        type="email"
        className={errors.email ? 'error' : ''}
      />
      {errors.email && (
        <span className="error-message">{errors.email}</span>
      )}
      
      <input 
        name="password" 
        type="password"
        className={errors.password ? 'error' : ''}
      />
      {errors.password && (
        <span className="error-message">{errors.password}</span>
      )}
      
      <button type="submit" disabled={loading}>
        {loading ? 'Salvando...' : 'Salvar'}
      </button>
    </form>
  )
}
```

## 🔍 Debugging

### Logs de Erro

Todos os erros são logados com informações detalhadas:

```json
{
  "level": "error",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "message": "Validation error",
  "requestId": "req_123456789",
  "userId": "user_123",
  "endpoint": "/api/users",
  "method": "POST",
  "statusCode": 400,
  "errorCode": "VALIDATION_ERROR",
  "errors": [...],
  "stack": "Error stack trace..."
}
```

### Monitoramento

Use ferramentas de monitoramento para acompanhar erros:

```bash
# Filtrar erros por código
grep "VALIDATION_ERROR" logs/app.log

# Contar erros por tipo
grep -c "ERROR" logs/app.log

# Erros de um usuário específico
grep "userId:user_123" logs/error.log
```

## 📱 Boas Práticas

### Para Desenvolvedores Frontend

1. **Sempre trate erros**: Nunca ignore respostas de erro
2. **Use códigos específicos**: Baseie a lógica nos códigos, não nas mensagens
3. **Feedback ao usuário**: Sempre forneça feedback claro sobre erros
4. **Retry automático**: Implemente retry para erros temporários (5xx)
5. **Fallbacks**: Tenha planos B para quando APIs falharem

### Para Desenvolvedores Backend

1. **Consistência**: Sempre use a estrutura padrão de erro
2. **Códigos específicos**: Crie códigos únicos para cada tipo de erro
3. **Mensagens claras**: Escreva mensagens que ajudem o usuário
4. **Logs detalhados**: Registre informações suficientes para debugging
5. **Não exponha internals**: Nunca vaze informações sensíveis em erros

---

**Versão:** 1.0.0  
**Última atualização:** 2024-01-01

