# Arquitetura do Sistema Fway

Este documento descreve a arquitetura geral do sistema Fway, incluindo seus principais componentes, tecnologias utilizadas e o fluxo de dados.

## 🚀 Visão Geral

O sistema Fway é uma plataforma de saúde digital que conecta usuários a profissionais de saúde, oferece serviços de agendamento, telemedicina, chat em tempo real, e um sistema de proteção avançado (Fway Shield). A arquitetura é baseada em microserviços, com um frontend desacoplado e uma API robusta.

## 📊 Diagrama de Arquitetura

```mermaid
graph TD
    A[Usuário] -->|Acessa| B(Frontend PWA)
    B -->|Requisições API| C(Backend API Gateway)
    C -->|Autenticação/Autorização| D[Auth Service]
    C -->|Gerenciamento Usuários| E[User Service]
    C -->|Profissionais/Serviços| F[Professional Service]
    C -->|Agendamentos/Consultas| G[Booking Service]
    C -->|Chat/Notificações| H[Notification & Chat Service]
    C -->|Pagamentos| I[Payment Service]
    C -->|IA/Triagem| J[AI Service]
    C -->|Fway Shield| K[Shield Service]

    D -->|Persiste dados| L(Banco de Dados PostgreSQL)
    E -->|Persiste dados| L
    F -->|Persiste dados| L
    G -->|Persiste dados| L
    H -->|Persiste dados| L
    I -->|Persiste dados| L
    J -->|Persiste dados| L
    K -->|Persiste dados| L

    H -->|Mensagens em tempo real| M(Redis Cache)
    J -->|Cache de contexto| M

    subgraph Backend Services
        D
        E
        F
        G
        H
        I
        J
        K
    end

    subgraph Infraestrutura
        L
        M
    end

    subgraph Monitoramento
        N[Prometheus] -->|Coleta Métricas| C
        N -->|Coleta Métricas| L
        N -->|Coleta Métricas| M
        O[Grafana] -->|Visualiza Métricas| N
    end

    subgraph CI/CD
        P[GitHub Actions] -->|Build & Test| Q(Docker Registry)
        Q -->|Deploy| R[Kubernetes/ECS]
    end

    C -->|Logs| S[Winston Logger]
    S -->|Armazena Logs| T(Elasticsearch/Loki)
    T -->|Visualiza Logs| U[Kibana/Grafana Loki]

    B -->|Notificações Push| V[Firebase Cloud Messaging]
    H -->|Email/SMS| W[Serviços Externos (SendGrid, Twilio)]
```

## 💻 Componentes Principais

### Frontend (PWA)

- **Tecnologia**: React, Vite, PWA (Progressive Web App)
- **Funcionalidades**: Interface do usuário, agendamento, chat, perfil, pagamentos, dashboard.
- **Comunicação**: Interage com o Backend API via requisições HTTP/HTTPS.

### Backend (API)

- **Tecnologia**: Node.js, Express, Prisma ORM
- **Banco de Dados**: PostgreSQL (produção), SQLite (desenvolvimento/testes)
- **Cache**: Redis
- **Serviços (Microserviços Lógicos)**:
    - **Auth Service**: Gerencia autenticação (JWT, refresh tokens), autorização (RBAC), registro e login.
    - **User Service**: Gerencia perfis de usuário, CRUD de usuários.
    - **Professional Service**: Gerencia perfis de profissionais de saúde, busca por especialidade e localização.
    - **Booking Service**: Gerencia agendamentos de consultas e telemedicina.
    - **Notification & Chat Service**: Gerencia notificações em tempo real (WebSockets), push notifications, e-mail e SMS. Inclui funcionalidades de chat.
    - **Payment Service**: Integração com gateways de pagamento (Stripe, PIX).
    - **AI Service**: Triagem inteligente, chatbot médico, análise de sentimento.
    - **Shield Service**: Gerencia o sistema de proteção Fway Shield (seguros, cobertura, sinistros).

### Banco de Dados (PostgreSQL)

- **Prisma ORM**: Utilizado para interação com o banco de dados, fornecendo tipagem segura e migrações.
- **Modelos**: `User`, `UserProfile`, `Professional`, `Booking`, `Notification`, `Payment`, `Chat`, `RefreshToken`, `AuditLog`, etc.

### Cache (Redis)

- Utilizado para armazenar sessões de usuário, cache de dados frequentemente acessados e contexto de conversas do AI Service.

### Docker e Orquestração

- **Docker**: Containerização de todos os serviços (frontend, backend, PostgreSQL, Redis).
- **Docker Compose**: Orquestração de múltiplos containers para ambiente de desenvolvimento e testes.
- **Kubernetes/ECS**: Recomendado para orquestração em ambiente de produção.

## 🔄 Fluxo de Dados

1. **Acesso do Usuário**: O usuário acessa o Frontend PWA através de um navegador web.
2. **Requisições API**: O Frontend envia requisições HTTP/HTTPS para o Backend API Gateway.
3. **Processamento Backend**: O API Gateway roteia as requisições para os serviços apropriados.
4. **Autenticação/Autorização**: O Auth Service verifica a identidade e permissões do usuário usando JWT e RBAC.
5. **Interação com DB/Cache**: Os serviços interagem com o PostgreSQL para persistência de dados e com o Redis para cache.
6. **Serviços Externos**: O Notification Service pode interagir com serviços externos (ex: Twilio para SMS, SendGrid para e-mail, Firebase para Push Notifications).
7. **Resposta**: O Backend retorna a resposta para o Frontend, que atualiza a interface do usuário.
8. **Logs e Monitoramento**: Todos os serviços geram logs estruturados (Winston) e métricas (Prometheus), que são coletados e visualizados em ferramentas como Grafana e Kibana.

## 🔒 Segurança

- **JWT**: Autenticação baseada em tokens.
- **Argon2**: Criptografia de senhas.
- **RBAC**: Controle de acesso baseado em papéis.
- **Rate Limiting**: Proteção contra ataques de força bruta e DDoS.
- **CORS, Helmet**: Proteções contra ataques comuns da web.
- **Validação de Entrada**: Joi para validação rigorosa de dados.

## 📈 Escalabilidade

- **Arquitetura Modular**: Facilita a adição de novos serviços e a escalabilidade horizontal.
- **Containerização**: Permite o deploy em ambientes de nuvem escaláveis.
- **Banco de Dados Relacional**: PostgreSQL, escalável para grandes volumes de dados.
- **Cache Distribuído**: Redis, para reduzir a carga no banco de dados.
- **Logs e Monitoramento**: Essenciais para identificar gargalos e otimizar a performance.

## 🔮 Futuras Melhorias

- Implementação de mais microserviços para funcionalidades específicas.
- Integração com sistemas de telemedicina de terceiros.
- Expansão do AI Service com mais modelos de IA.
- Dashboards de monitoramento mais avançados.
- Implementação de filas de mensagens (ex: RabbitMQ, Kafka) para processamento assíncrono.

---

**Fway Team**

*A saúde digital ao seu alcance.*

