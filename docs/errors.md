# Estrutura de Erros da API Fway

Esta seção descreve a estrutura padrão das respostas de erro retornadas pela API do Fway.

## Formato Geral do Erro

Quando ocorre um erro, a API retornará uma resposta JSON com o seguinte formato:

```json
{
  "message": "Mensagem descritiva do erro",
  "statusCode": 400, // Código de status HTTP
  "details": "Detalhes adicionais sobre o erro (opcional)"
}
```

## Códigos de Status HTTP Comuns

A API utiliza códigos de status HTTP padrão para indicar o tipo de erro ocorrido:

-   **`200 OK`**: A requisição foi bem-sucedida.
-   **`201 Created`**: O recurso foi criado com sucesso.
-   **`400 Bad Request`**: A requisição é inválida ou malformada. Geralmente ocorre devido a dados de entrada inválidos.
    -   Exemplo: `{"message": "Email e senha são obrigatórios."}`
-   **`401 Unauthorized`**: A autenticação é necessária e falhou ou ainda não foi fornecida. Isso pode ocorrer por falta de token, token inválido ou expirado.
    -   Exemplo: `{"message": "Token não fornecido ou formato inválido."}`
    -   Exemplo: `{"message": "Credenciais inválidas."}`
-   **`403 Forbidden`**: O servidor entendeu a requisição, mas se recusa a autorizá-la. O usuário autenticado não tem permissão para acessar o recurso.
    -   Exemplo: `{"message": "Acesso proibido: Você não tem permissão para acessar este recurso."}`
-   **`404 Not Found`**: O recurso solicitado não foi encontrado no servidor.
    -   Exemplo: `{"message": "Usuário não encontrado"}`
-   **`409 Conflict`**: A requisição não pôde ser completada devido a um conflito com o estado atual do recurso. Comum em casos de registro de usuário com email já existente.
    -   Exemplo: `{"message": "Usuário com este email já existe."}`
-   **`500 Internal Server Error`**: Um erro inesperado ocorreu no servidor. Isso indica um problema no backend que precisa ser investigado.
    -   Exemplo: `{"message": "Ocorreu um erro interno no servidor."}`

## Exemplos de Erros Específicos

### Erro de Validação (400 Bad Request)

```json
{
  "message": "Email inválido ou senha muito curta (mínimo 6 caracteres).",
  "statusCode": 400
}
```

### Erro de Autenticação (401 Unauthorized)

```json
{
  "message": "Token inválido ou expirado.",
  "statusCode": 403 // Note: para tokens inválidos/expirados, pode ser 403 dependendo da implementação do middleware JWT
}
```

### Erro de Autorização (403 Forbidden)

```json
{
  "message": "Acesso proibido: Você não tem permissão para acessar este recurso.",
  "statusCode": 403
}
```

### Recurso Não Encontrado (404 Not Found)

```json
{
  "message": "Usuário não encontrado",
  "statusCode": 404
}
```

### Conflito (409 Conflict)

```json
{
  "message": "Usuário com este email já existe.",
  "statusCode": 409
}
```

### Erro Interno do Servidor (500 Internal Server Error)

```json
{
  "message": "Ocorreu um erro interno no servidor.",
  "statusCode": 500,
  "stack": "... (apenas em ambiente de desenvolvimento)"
}
```

Esta documentação visa padronizar as respostas de erro, facilitando a integração e o tratamento de exceções por parte dos clientes da API.

