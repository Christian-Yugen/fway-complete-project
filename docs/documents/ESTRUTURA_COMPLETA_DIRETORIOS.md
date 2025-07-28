# Estrutura Completa de Diretórios do Projeto Fway

Este documento detalha a estrutura de diretórios do projeto Fway, que é dividido em `fway-backend` (Flask) e `fway-frontend` (React PWA). A organização visa modularidade, escalabilidade e facilidade de manutenção.

```
fway-complete-project/
├── fway-backend/                         # Diretório do Backend (Flask)
│   ├── .env.example                      # Exemplo de variáveis de ambiente
│   ├── package.json                      # Dependências e scripts do Node.js
│   ├── prisma/                           # Configuração do Prisma ORM
│   │   └── schema.prisma                 # Definição do esquema do banco de dados
│   ├── src/                              # Código fonte do Backend
│   │   ├── app.js                        # Ponto de entrada principal da aplicação
│   │   ├── config/                       # Configurações gerais da aplicação
│   │   │   ├── database.js               # Configuração do banco de dados
│   │   │   ├── redis.js                  # Configuração do Redis
│   │   │   └── index.js                  # Arquivo de índice de configurações
│   │   ├── controllers/                  # Lógica de negócio para as rotas
│   │   │   ├── authController.js
│   │   │   ├── userController.js
│   │   │   ├── serviceController.js
│   │   │   ├── bookingController.js
│   │   │   ├── paymentController.js
│   │   │   ├── chatController.js
│   │   │   ├── reviewController.js
│   │   │   └── notificationController.js # Controlador para notificações
│   │   ├── middleware/                   # Funções de middleware para Express
│   │   │   ├── auth.js                   # Middleware de autenticação
│   │   │   ├── errorHandler.js           # Middleware de tratamento de erros
│   │   │   └── validation.js             # Middleware de validação
│   │   ├── models/                       # Modelos de dados (se não usar Prisma diretamente)
│   │   │   └── index.js
│   │   ├── routes/                       # Definição das rotas da API
│   │   │   ├── auth.js
│   │   │   ├── users.js
│   │   │   ├── services.js
│   │   │   ├── bookings.js
│   │   │   ├── payments.js
│   │   │   ├── chat.js
│   │   │   ├── reviews.js
│   │   │   └── notification.js           # Rotas para o serviço de notificação
│   │   ├── services/                     # Lógica de serviço e integração com APIs externas
│   │   │   ├── auth/                     # Serviços de autenticação
│   │   │   │   └── authService.js
│   │   │   ├── user/                     # Serviços de usuário
│   │   │   │   └── userService.js
│   │   │   ├── notification/             # Serviços de Notificação (Expandido)
│   │   │   │   ├── notificationService.js # Lógica principal de notificação
│   │   │   │   ├── emailService.js        # Envio de e-mails (Nodemailer)
│   │   │   │   ├── smsService.js          # Envio de SMS (Twilio) - NOVO
│   │   │   │   ├── pushService.js         # Envio de Push Notifications (Firebase) - NOVO
│   │   │   │   ├── templateService.js     # Gerenciamento de templates (Handlebars) - NOVO
│   │   │   │   └── notificationWorker.js  # Worker para processamento em background - NOVO
│   │   │   ├── payment/                  # Serviços de pagamento
│   │   │   │   └── stripeService.js
│   │   │   ├── socket/                   # Serviço de Socket.IO
│   │   │   │   └── socketService.js
│   │   │   └── index.js                  # Arquivo de índice de serviços
│   │   ├── utils/                        # Funções utilitárias e helpers
│   │   │   ├── helpers.js
│   │   │   └── logger.js
│   │   ├── validators/                   # Esquemas de validação (Joi)
│   │   │   ├── auth.js
│   │   │   ├── user.js
│   │   │   ├── service.js
│   │   │   ├── booking.js
│   │   │   ├── payment.js
│   │   │   ├── chat.js
│   │   │   ├── review.js
│   │   │   └── notification.js           # Validadores para notificações
│   │   └── database/                     # Configuração e seeders do banco de dados
│   │       ├── seeders/                  # Dados iniciais para o banco
│   │       │   └── index.js
│   │       └── client.js                 # Cliente Prisma
│   └── templates/                        # Templates de e-mail (Handlebars) - NOVO DIRETÓRIO
│       └── email/                        # Subdiretório para templates de e-mail
│           ├── base.hbs
│           ├── verification.hbs
│           ├── welcome.hbs
│           ├── password-reset.hbs
│           ├── booking-created.hbs
│           ├── booking-confirmed.hbs
│           ├── booking-cancelled.hbs
│           ├── booking-reminder.hbs
│           ├── payment-received.hbs
│           ├── payment-failed.hbs
│           ├── shield-claim-approved.hbs
│           ├── shield-claim-rejected.hbs
│           ├── chat-message.hbs
│           ├── system-alert.hbs
│           ├── marketing.hbs
│           ├── security.hbs
│           └── default.hbs
│
├── fway-frontend/                        # Diretório do Frontend (React PWA)
│   ├── public/                           # Arquivos estáticos e manifest
│   │   ├── index.html
│   │   ├── manifest.json
│   │   └── icons/                        # Ícones da aplicação
│   ├── src/                              # Código fonte do Frontend
│   │   ├── App.jsx                       # Componente principal da aplicação
│   │   ├── index.css                     # Estilos globais
│   │   ├── main.jsx                      # Ponto de entrada do React
│   │   ├── assets/                       # Imagens, vídeos, fontes
│   │   │   ├── images/
│   │   │   └── fonts/
│   │   ├── components/                   # Componentes reutilizáveis
│   │   │   ├── common/                   # Componentes genéricos
│   │   │   ├── auth/                     # Componentes de autenticação
│   │   │   ├── forms/                    # Componentes de formulário
│   │   │   ├── notifications/            # Componentes de UI para notificações
│   │   │   │   ├── NotificationCenter.jsx
│   │   │   │   └── NotificationItem.jsx
│   │   │   └── ui/                       # Componentes de UI (botões, cards, etc.)
│   │   ├── contexts/                     # Contextos React para estado global
│   │   │   ├── AuthContext.jsx
│   │   │   └── NotificationContext.jsx   # Contexto para notificações
│   │   ├── hooks/                        # Hooks personalizados
│   │   │   ├── useAuth.js
│   │   │   └── useNotifications.js       # Hook para gerenciar notificações
│   │   ├── pages/                        # Páginas da aplicação
│   │   │   ├── Home.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Services.jsx
│   │   │   ├── BookingPage.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Chat.jsx
│   │   │   ├── Notifications.jsx         # Página de central de notificações
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── AdminDashboard.jsx
│   │   ├── services/                     # Funções para interagir com a API do backend
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── notificationService.js    # Serviço para consumir API de notificações
│   │   │   └── socketService.js          # Serviço para Socket.IO
│   │   ├── store/                        # Gerenciamento de estado (ex: Zustand, Redux)
│   │   │   ├── authStore.js
│   │   │   └── notificationStore.js      # Store para estado das notificações
│   │   └── utils/                        # Funções utilitárias
│   │       └── helpers.js
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── README.md
│
├── .gitignore                            # Arquivos e diretórios a serem ignorados pelo Git
├── README.md                             # Informações gerais do projeto
├── MANUAL_INSTALACAO.md                  # Guia de instalação
├── CONFIGURACAO_AVANCADA.md              # Configurações avançadas
├── DEPLOY_PRODUCAO.md                    # Guia de deploy em produção
├── ESTRUTURA_PROJETO.md                  # Visão geral da estrutura (este arquivo)
├── CONTEXTO_NOTIFICACOES_FWAY.md         # Documentação do contexto das notificações
└── IMPLEMENTACAO_NOTIFICACOES.md         # Documentação detalhada da implementação das notificações
```

## 💡 Destaques da Estrutura:

- **Modularidade**: Cada funcionalidade (autenticação, usuários, serviços, notificações) tem seus próprios controladores, serviços, rotas e validadores, facilitando o desenvolvimento e a manutenção.
- **Separação de Responsabilidades**: Backend e Frontend são projetos separados, comunicando-se via API, o que permite escalabilidade independente e equipes dedicadas.
- **Serviços de Notificação**: O diretório `fway-backend/src/services/notification/` foi expandido para incluir `smsService.js`, `pushService.js`, `templateService.js` e `notificationWorker.js`, centralizando toda a lógica de notificação.
- **Templates de Email**: Um novo diretório `fway-backend/templates/email/` foi criado para armazenar os templates HTML de e-mail, permitindo fácil edição e personalização.
- **Documentação**: Arquivos Markdown adicionais (`CONTEXTO_NOTIFICACOES_FWAY.md`, `IMPLEMENTACAO_NOTIFICACOES.md`) fornecem informações detalhadas sobre o sistema de notificações e o projeto em geral.
- **Frontend Integrado**: O frontend inclui componentes, contextos, hooks e serviços específicos para consumir e exibir as notificações do backend, garantindo uma experiência de usuário completa.

Esta estrutura fornece uma base sólida para o desenvolvimento contínuo do Fway, permitindo a adição de novas funcionalidades de forma organizada e eficiente.

