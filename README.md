# Fway - Sistema de Saúde Digital Completo

Este repositório contém o projeto completo do Fway, incluindo o frontend (aplicação web progressiva) e o backend (API Node.js).

## 🚀 Visão Geral

O Fway é um sistema de saúde digital inovador que conecta pacientes a profissionais de saúde, oferece serviços de agendamento, telemedicina, chat, e um sistema de proteção avançado (Fway Shield).

### Componentes

- **Frontend**: Aplicação web progressiva (PWA) desenvolvida em React.
- **Backend**: API RESTful desenvolvida em Node.js com Express e Prisma ORM.

## 📋 Índice

- [Estrutura do Projeto](#estrutura-do-projeto)
- [Instalação e Configuração](#instalação-e-configuração)
  - [Pré-requisitos](#pré-requisitos)
  - [Backend](#backend)
  - [Frontend](#frontend)
- [Uso](#uso)
- [Testes](#testes)
- [Deploy](#deploy)
- [Documentação](#documentação)
- [Contribuição](#contribuição)
- [Licença](#licença)

## 📁 Estrutura do Projeto

```
fway-complete-project/
├── backend/             # Código fonte do backend (Node.js, Express, Prisma)
│   ├── src/
│   ├── tests/
│   ├── docs/
│   ├── prisma/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── package.json
│   └── ...
├── frontend/            # Código fonte do frontend (React PWA)
│   ├── public/
│   ├── src/
│   ├── vite.config.js
│   ├── package.json
│   └── ...
├── docs/                # Documentação geral do projeto
│   └── architecture.md
├── .env.example         # Exemplo de variáveis de ambiente para o projeto completo
├── docker-compose.yml   # Docker Compose para o projeto completo
└── README.md            # Este arquivo
```

## 🛠️ Instalação e Configuração

### Pré-requisitos

Certifique-se de ter os seguintes softwares instalados:

- **Node.js** (versão 18 ou superior)
- **npm** ou **yarn**
- **Docker** e **Docker Compose** (recomendado para ambiente de desenvolvimento e produção)
- **Git**

### 1. Backend

Navegue até o diretório `backend` e siga as instruções:

```bash
cd backend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações (especialmente DATABASE_URL, JWT_SECRET, etc.)

# Gerar cliente Prisma e aplicar migrações (para SQLite local)
npx prisma generate
npx prisma db push

# Iniciar o backend em modo de desenvolvimento
npm run dev
```

O backend estará disponível em `http://localhost:3001`.

### 2. Frontend

Navegue até o diretório `frontend` e siga as instruções:

```bash
cd ../frontend

# Instalar dependências
npm install

# Configurar variáveis de ambiente (se necessário, ex: URL do backend)
cp .env.example .env
# Edite o arquivo .env com suas configurações (ex: VITE_API_URL=http://localhost:3001)

# Iniciar o frontend em modo de desenvolvimento
npm run dev
```

O frontend estará disponível em `http://localhost:5173` (ou outra porta indicada pelo Vite).

### Configuração Completa com Docker Compose

Para uma configuração mais fácil e consistente, use o Docker Compose na raiz do projeto:

```bash
# Na raiz do projeto fway-complete-project

# Copiar arquivo de variáveis de ambiente (se não existir)
cp .env.example .env
# Edite o arquivo .env com suas configurações

# Iniciar todos os serviços (backend, postgres, redis, frontend)
docker-compose up --build -d
```

Isso irá:
- Construir as imagens Docker do backend e frontend.
- Iniciar os containers do backend, PostgreSQL e Redis.
- Iniciar o frontend.

O backend estará acessível em `http://localhost:3001` e o frontend em `http://localhost:80` (se configurado com Nginx no docker-compose) ou a porta padrão do Vite.

## 🚀 Uso

Após a instalação e configuração, você pode acessar o frontend no seu navegador e interagir com a aplicação. O backend estará servindo a API para o frontend.

## 🧪 Testes

### Backend

No diretório `backend`:

```bash
npm test
# Para cobertura de código
npm run test:coverage
```

### Frontend

No diretório `frontend`:

```bash
npm test
```

## 🐳 Deploy

Para deploy em produção, é altamente recomendado usar Docker e orquestradores como Kubernetes ou Docker Swarm.

### Backend

Consulte o `backend/README.md` e o `backend/Dockerfile` para detalhes de deploy do backend.

### Frontend

Consulte o `frontend/README.md` para detalhes de deploy do frontend (geralmente como arquivos estáticos em um servidor web ou CDN).

### Docker Compose para Produção

Um `docker-compose.yml` na raiz do projeto pode ser adaptado para produção, incluindo Nginx como proxy reverso e certificados SSL.

## 📖 Documentação

- **Documentação da API (Backend)**: Consulte `backend/docs/` e o Swagger UI em `http://localhost:3001/api-docs` (apenas em desenvolvimento).
- **Documentação do Frontend**: Consulte `frontend/README.md`.
- **Documentação Geral do Projeto**: Arquivos em `docs/` na raiz do projeto.

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor, leia o `CONTRIBUTING.md` (a ser criado) para detalhes sobre nosso processo de desenvolvimento e como enviar pull requests.

## 📄 Licença

Este projeto está licenciado sob a [MIT License](LICENSE) (a ser criada).

---

**Fway Team**

*A saúde digital ao seu alcance.*

