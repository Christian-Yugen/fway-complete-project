
# Guia de Uso da API Fway

Este guia fornece instruções sobre como interagir com a API do backend do Fway, incluindo autenticação, uso de endpoints e tratamento de respostas.

## 1. Visão Geral

A API do Fway é uma API RESTful que utiliza JSON para comunicação. Ela permite o gerenciamento de usuários, autenticação e outras funcionalidades da plataforma.

## 2. Autenticação

A API utiliza autenticação baseada em **JSON Web Tokens (JWT)**. Para acessar rotas protegidas, você precisa incluir um token de acesso no cabeçalho `Authorization` de suas requisições.

### Fluxo de Autenticação:

1.  **Registro (`POST /auth/register`)**: Crie uma nova conta de usuário fornecendo um email e senha.
2.  **Login (`POST /auth/login`)**: Autentique-se com seu email e senha para receber um `accessToken` e um `refreshToken`.
3.  **Acesso a Rotas Protegidas**: Inclua o `accessToken` no cabeçalho `Authorization`:

    ```
    Authorization: Bearer <seu_access_token>
    ```

4.  **Atualização de Token (`POST /auth/refresh-token`)**: Quando o `accessToken` expirar, use o `refreshToken` para obter um novo `accessToken` sem precisar fazer login novamente.

### Exemplo de Requisição com Autenticação:

```bash
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer <seu_access_token>"
```

## 3. Endpoints Principais

A documentação completa e interativa dos endpoints está disponível na rota `/api-docs` (em ambiente de desenvolvimento), gerada pelo Swagger UI.

### 3.1. Autenticação (`/auth`)

-   `POST /auth/register`: Registra um novo usuário.
-   `POST /auth/login`: Autentica um usuário e retorna tokens.
-   `POST /auth/refresh-token`: Atualiza o token de acesso.
-   `GET /auth/me`: Retorna informações do usuário autenticado (rota protegida).
-   `GET /auth/admin-only`: Rota de exemplo acessível apenas por administradores (rota protegida).

### 3.2. Usuários (`/users`)

-   `GET /users`: Retorna uma lista de todos os usuários (apenas para administradores).
-   `GET /users/{id}`: Retorna um usuário específico pelo ID. Usuários normais só podem acessar seu próprio perfil.
-   `PUT /users/{id}`: Atualiza um usuário pelo ID. Usuários normais só podem atualizar seu próprio perfil.
-   `DELETE /users/{id}`: Deleta um usuário pelo ID (apenas para administradores).

## 4. Tratamento de Erros

A API retorna códigos de status HTTP padrão para indicar o resultado de uma requisição. Para mais detalhes sobre a estrutura de erros, consulte o documento `docs/errors.md`.

-   **`2xx`**: Sucesso
-   **`4xx`**: Erro do cliente (ex: dados inválidos, não autorizado)
-   **`5xx`**: Erro do servidor

## 5. Variáveis de Ambiente

Para configurar o backend, você precisará criar um arquivo `.env` na raiz do projeto com base no `.env.example`. As variáveis de ambiente são essenciais para a segurança e configuração do aplicativo.

## 6. Executando Localmente com Docker

Para facilitar o desenvolvimento, você pode usar o Docker para subir o backend e o banco de dados PostgreSQL:

```bash
# Inicia os containers em modo detached
docker-compose up -d

# Para parar os containers
docker-compose down
```

Isso garantirá que você tenha um ambiente consistente e isolado para desenvolvimento e testes.


