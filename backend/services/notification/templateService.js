const fs = require('fs').promises;
const path = require('path');
const handlebars = require('handlebars');

class TemplateService {
  constructor() {
    this.templates = new Map();
    this.templatesPath = path.join(__dirname, '../../templates/email');
    this.initialized = false;
    this.init();
  }

  // Inicializar serviço de templates
  async init() {
    try {
      await this.loadTemplates();
      this.registerHelpers();
      this.initialized = true;
      console.log('✅ Template Service initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing Template Service:', error);
    }
  }

  // Carregar todos os templates
  async loadTemplates() {
    try {
      // Criar diretório se não existir
      await fs.mkdir(this.templatesPath, { recursive: true });

      // Carregar templates existentes
      const files = await fs.readdir(this.templatesPath);
      
      for (const file of files) {
        if (file.endsWith('.hbs') || file.endsWith('.handlebars')) {
          const templateName = path.basename(file, path.extname(file));
          const templatePath = path.join(this.templatesPath, file);
          const templateContent = await fs.readFile(templatePath, 'utf8');
          
          this.templates.set(templateName, handlebars.compile(templateContent));
          console.log(`📧 Template loaded: ${templateName}`);
        }
      }

      // Se não há templates, criar os padrões
      if (this.templates.size === 0) {
        await this.createDefaultTemplates();
      }

    } catch (error) {
      console.error('❌ Error loading templates:', error);
      // Criar templates padrão em caso de erro
      await this.createDefaultTemplates();
    }
  }

  // Registrar helpers do Handlebars
  registerHelpers() {
    // Helper para formatação de data
    handlebars.registerHelper('formatDate', function(date, format) {
      if (!date) return '';
      
      const d = new Date(date);
      
      switch (format) {
        case 'short':
          return d.toLocaleDateString('pt-BR');
        case 'long':
          return d.toLocaleDateString('pt-BR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          });
        case 'time':
          return d.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          });
        case 'datetime':
          return d.toLocaleString('pt-BR');
        default:
          return d.toLocaleDateString('pt-BR');
      }
    });

    // Helper para formatação de moeda
    handlebars.registerHelper('formatCurrency', function(amount) {
      if (!amount) return 'R$ 0,00';
      
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(amount);
    });

    // Helper para capitalizar texto
    handlebars.registerHelper('capitalize', function(text) {
      if (!text) return '';
      return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    });

    // Helper condicional
    handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
      return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
    });

    // Helper para URLs
    handlebars.registerHelper('buildUrl', function(path) {
      const baseUrl = process.env.FRONTEND_URL || 'https://fway.com';
      return `${baseUrl}${path}`;
    });
  }

  // Criar templates padrão
  async createDefaultTemplates() {
    const defaultTemplates = {
      'base': this.getBaseTemplate(),
      'verification': this.getVerificationTemplate(),
      'welcome': this.getWelcomeTemplate(),
      'password-reset': this.getPasswordResetTemplate(),
      'booking-created': this.getBookingCreatedTemplate(),
      'booking-confirmed': this.getBookingConfirmedTemplate(),
      'booking-cancelled': this.getBookingCancelledTemplate(),
      'booking-reminder': this.getBookingReminderTemplate(),
      'payment-received': this.getPaymentReceivedTemplate(),
      'payment-failed': this.getPaymentFailedTemplate(),
      'shield-claim-approved': this.getShieldClaimApprovedTemplate(),
      'shield-claim-rejected': this.getShieldClaimRejectedTemplate(),
      'chat-message': this.getChatMessageTemplate(),
      'system-alert': this.getSystemAlertTemplate(),
      'marketing': this.getMarketingTemplate(),
      'security': this.getSecurityTemplate(),
      'default': this.getDefaultTemplate()
    };

    for (const [name, content] of Object.entries(defaultTemplates)) {
      const templatePath = path.join(this.templatesPath, `${name}.hbs`);
      await fs.writeFile(templatePath, content, 'utf8');
      this.templates.set(name, handlebars.compile(content));
      console.log(`📧 Default template created: ${name}`);
    }
  }

  // Renderizar template
  async renderTemplate(templateName, data = {}) {
    try {
      if (!this.initialized) {
        await this.init();
      }

      const template = this.templates.get(templateName);
      
      if (!template) {
        console.warn(`⚠️ Template not found: ${templateName}, using default`);
        return this.renderDefaultTemplate(data);
      }

      // Dados padrão
      const defaultData = {
        appName: 'Fway',
        appUrl: process.env.FRONTEND_URL || 'https://fway.com',
        supportEmail: process.env.SUPPORT_EMAIL || 'suporte@fway.com',
        supportPhone: process.env.SUPPORT_PHONE || '(11) 99999-9999',
        currentYear: new Date().getFullYear(),
        logoUrl: `${process.env.FRONTEND_URL || 'https://fway.com'}/images/logo.png`
      };

      const mergedData = { ...defaultData, ...data };
      
      return template(mergedData);

    } catch (error) {
      console.error(`❌ Error rendering template ${templateName}:`, error);
      return this.renderDefaultTemplate(data);
    }
  }

  // Renderizar template padrão
  renderDefaultTemplate(data) {
    const defaultTemplate = handlebars.compile(this.getDefaultTemplate());
    return defaultTemplate(data);
  }

  // Template base
  getBaseTemplate() {
    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}} - {{appName}}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
            font-size: 16px;
        }
        .content {
            padding: 40px 30px;
            background-color: #ffffff;
        }
        .content h2 {
            color: #1f2937;
            margin-top: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .content p {
            margin: 16px 0;
            font-size: 16px;
            line-height: 1.6;
        }
        .button {
            display: inline-block;
            padding: 14px 28px;
            background: #3b82f6;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
            transition: background-color 0.3s;
        }
        .button:hover {
            background: #2563eb;
        }
        .info-box {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .warning-box {
            background: #fef3cd;
            border: 1px solid #fecaca;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .success-box {
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .footer {
            background: #f8fafc;
            padding: 30px;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
            border-top: 1px solid #e5e7eb;
        }
        .footer p {
            margin: 8px 0;
        }
        .social-links {
            margin: 20px 0;
        }
        .social-links a {
            display: inline-block;
            margin: 0 10px;
            color: #6b7280;
            text-decoration: none;
        }
        @media (max-width: 600px) {
            .container {
                margin: 0;
                box-shadow: none;
            }
            .header, .content, .footer {
                padding: 20px;
            }
            .button {
                display: block;
                text-align: center;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏥 {{appName}}</h1>
            <p>{{headerSubtitle}}</p>
        </div>
        <div class="content">
            {{{content}}}
        </div>
        <div class="footer">
            <p>© {{currentYear}} {{appName}}. Todos os direitos reservados.</p>
            <p>📧 {{supportEmail}} | 📱 {{supportPhone}}</p>
            <p>Este é um email automático, não responda.</p>
            <div class="social-links">
                <a href="{{appUrl}}">Website</a>
                <a href="{{appUrl}}/privacy">Privacidade</a>
                <a href="{{appUrl}}/terms">Termos</a>
            </div>
        </div>
    </div>
</body>
</html>`;
  }

  // Template de verificação
  getVerificationTemplate() {
    return `
<h2>Olá, {{userName}}!</h2>
<p>Bem-vindo ao {{appName}}! Para completar seu cadastro, precisamos verificar seu email.</p>
<p>Clique no botão abaixo para verificar sua conta:</p>
<a href="{{verificationUrl}}" class="button">Verificar Email</a>
<p>Ou copie e cole este link no seu navegador:</p>
<div class="info-box">
    <p style="word-break: break-all; color: #666;">{{verificationUrl}}</p>
</div>
<div class="warning-box">
    <strong>⚠️ Importante:</strong>
    <ul>
        <li>Este link expira em 24 horas</li>
        <li>Se você não criou uma conta no {{appName}}, pode ignorar este email</li>
    </ul>
</div>`;
  }

  // Template de boas-vindas
  getWelcomeTemplate() {
    return `
<h2>Olá, {{userName}}! 👋</h2>
<p>Estamos muito felizes em tê-lo conosco! O {{appName}} é o marketplace mais completo de serviços de saúde do Brasil.</p>

<h3>🌟 O que você pode fazer no {{appName}}:</h3>

<div class="info-box">
    <h4>🔍 Encontrar Profissionais</h4>
    <p>Busque médicos, enfermeiros, fisioterapeutas e outros profissionais próximos a você.</p>
</div>

<div class="info-box">
    <h4>📅 Agendar Consultas</h4>
    <p>Agende consultas presenciais, online ou domiciliares com facilidade.</p>
</div>

<div class="info-box">
    <h4>🛡️ {{appName}} Shield</h4>
    <p>Proteção inteligente com seguro embutido para todos os seus serviços.</p>
</div>

<div class="info-box">
    <h4>💬 Chat Integrado</h4>
    <p>Converse diretamente com profissionais antes e depois das consultas.</p>
</div>

<a href="{{buildUrl '/dashboard'}}" class="button">Explorar Plataforma</a>

<p>Se tiver dúvidas, nossa equipe está sempre pronta para ajudar!</p>`;
  }

  // Template de reset de senha
  getPasswordResetTemplate() {
    return `
<h2>Olá, {{userName}}!</h2>
<p>Recebemos uma solicitação para redefinir a senha da sua conta no {{appName}}.</p>
<p>Clique no botão abaixo para criar uma nova senha:</p>
<a href="{{resetUrl}}" class="button">Redefinir Senha</a>
<p>Ou copie e cole este link no seu navegador:</p>
<div class="info-box">
    <p style="word-break: break-all; color: #666;">{{resetUrl}}</p>
</div>
<div class="warning-box">
    <strong>⚠️ Importante:</strong>
    <ul>
        <li>Este link expira em 1 hora</li>
        <li>Se você não solicitou este reset, ignore este email</li>
        <li>Sua senha atual permanece ativa até que seja alterada</li>
    </ul>
</div>`;
  }

  // Template de agendamento criado
  getBookingCreatedTemplate() {
    return `
<h2>Olá, {{userName}}!</h2>
<p>Seu agendamento foi criado com sucesso! Aqui estão os detalhes:</p>

<div class="success-box">
    <h3>📋 Detalhes do Agendamento</h3>
    <p><strong>Profissional:</strong> {{professional}}</p>
    <p><strong>Serviço:</strong> {{service}}</p>
    <p><strong>Data e Hora:</strong> {{formatDate scheduledAt 'datetime'}}</p>
    <p><strong>Tipo:</strong> {{#ifEquals type 'ONLINE'}}Online{{else}}{{#ifEquals type 'HOME_VISIT'}}Domiciliar{{else}}Presencial{{/ifEquals}}{{/ifEquals}}</p>
    {{#if address}}<p><strong>Endereço:</strong> {{address}}</p>{{/if}}
    {{#if price}}<p><strong>Valor:</strong> {{formatCurrency price}}</p>{{/if}}
</div>

<p>📱 Você receberá lembretes antes da consulta.</p>
<p>💬 Use o chat integrado para se comunicar com o profissional.</p>

<a href="{{buildUrl (concat '/my-bookings/' bookingId)}}" class="button">Ver Agendamento</a>`;
  }

  // Template de agendamento confirmado
  getBookingConfirmedTemplate() {
    return `
<h2>Olá, {{userName}}!</h2>
<p>Ótimas notícias! Seu agendamento foi confirmado pelo profissional.</p>

<div class="success-box">
    <h3>✅ Agendamento Confirmado</h3>
    <p><strong>Profissional:</strong> {{professional}}</p>
    <p><strong>Serviço:</strong> {{service}}</p>
    <p><strong>Data e Hora:</strong> {{formatDate scheduledAt 'datetime'}}</p>
    <p><strong>Status:</strong> Confirmado</p>
</div>

<p>🎉 Tudo pronto! Agora é só aguardar o dia da consulta.</p>
<p>💬 Você pode conversar com o profissional através do chat integrado.</p>

<a href="{{buildUrl (concat '/my-bookings/' bookingId)}}" class="button">Ver Detalhes</a>`;
  }

  // Template de agendamento cancelado
  getBookingCancelledTemplate() {
    return `
<h2>Olá, {{userName}}!</h2>
<p>Informamos que seu agendamento foi cancelado.</p>

<div class="warning-box">
    <h3>❌ Agendamento Cancelado</h3>
    <p><strong>Profissional:</strong> {{professional}}</p>
    <p><strong>Serviço:</strong> {{service}}</p>
    <p><strong>Data Original:</strong> {{formatDate scheduledAt 'datetime'}}</p>
    {{#if reason}}<p><strong>Motivo:</strong> {{reason}}</p>{{/if}}
</div>

{{#if refundAmount}}
<div class="info-box">
    <p><strong>💰 Reembolso:</strong> {{formatCurrency refundAmount}} será processado em até 5 dias úteis.</p>
</div>
{{/if}}

<p>Você pode agendar uma nova consulta a qualquer momento.</p>

<a href="{{buildUrl '/services'}}" class="button">Agendar Nova Consulta</a>`;
  }

  // Template de lembrete
  getBookingReminderTemplate() {
    return `
<h2>Olá, {{userName}}!</h2>
<p>Este é um lembrete da sua consulta que acontecerá em breve.</p>

<div class="info-box">
    <h3>⏰ Lembrete de Consulta</h3>
    <p><strong>Profissional:</strong> {{professional}}</p>
    <p><strong>Serviço:</strong> {{service}}</p>
    <p><strong>Data e Hora:</strong> {{formatDate scheduledAt 'datetime'}}</p>
    <p><strong>Em:</strong> {{timeUntil}}</p>
</div>

{{#ifEquals type 'ONLINE'}}
<div class="success-box">
    <p><strong>💻 Consulta Online</strong></p>
    <p>O link da videochamada estará disponível 15 minutos antes do horário agendado.</p>
</div>
{{/ifEquals}}

{{#ifEquals type 'HOME_VISIT'}}
<div class="info-box">
    <p><strong>🏠 Consulta Domiciliar</strong></p>
    <p><strong>Endereço:</strong> {{address}}</p>
</div>
{{/ifEquals}}

<a href="{{buildUrl (concat '/my-bookings/' bookingId)}}" class="button">Ver Detalhes</a>`;
  }

  // Template de pagamento recebido
  getPaymentReceivedTemplate() {
    return `
<h2>Olá, {{userName}}!</h2>
<p>Seu pagamento foi processado com sucesso!</p>

<div class="success-box">
    <h3>💳 Pagamento Confirmado</h3>
    <p><strong>Valor:</strong> {{formatCurrency amount}}</p>
    <p><strong>Serviço:</strong> {{service}}</p>
    <p><strong>Data:</strong> {{formatDate paymentDate 'datetime'}}</p>
    <p><strong>Método:</strong> {{paymentMethod}}</p>
    {{#if transactionId}}<p><strong>ID da Transação:</strong> {{transactionId}}</p>{{/if}}
</div>

<p>📧 O recibo detalhado está disponível na sua conta.</p>

<a href="{{buildUrl (concat '/payments/' paymentId)}}" class="button">Ver Recibo</a>`;
  }

  // Template de falha no pagamento
  getPaymentFailedTemplate() {
    return `
<h2>Olá, {{userName}}!</h2>
<p>Não foi possível processar seu pagamento.</p>

<div class="warning-box">
    <h3>❌ Falha no Pagamento</h3>
    <p><strong>Valor:</strong> {{formatCurrency amount}}</p>
    <p><strong>Serviço:</strong> {{service}}</p>
    <p><strong>Motivo:</strong> {{reason}}</p>
</div>

<p>Por favor, verifique os dados do seu cartão e tente novamente.</p>

<a href="{{buildUrl (concat '/payments/retry/' paymentId)}}" class="button">Tentar Novamente</a>`;
  }

  // Template de claim aprovado
  getShieldClaimApprovedTemplate() {
    return `
<h2>Olá, {{userName}}!</h2>
<p>Ótimas notícias! Sua solicitação {{appName}} Shield foi aprovada.</p>

<div class="success-box">
    <h3>🛡️ Solicitação Aprovada</h3>
    <p><strong>ID da Solicitação:</strong> {{claimId}}</p>
    <p><strong>Valor Aprovado:</strong> {{formatCurrency approvedAmount}}</p>
    <p><strong>Serviço:</strong> {{service}}</p>
    <p><strong>Data de Aprovação:</strong> {{formatDate approvalDate 'datetime'}}</p>
</div>

<p>💰 O valor será creditado na sua conta em até 3 dias úteis.</p>

<a href="{{buildUrl (concat '/shield/claims/' claimId)}}" class="button">Ver Detalhes</a>`;
  }

  // Template de claim rejeitado
  getShieldClaimRejectedTemplate() {
    return `
<h2>Olá, {{userName}}!</h2>
<p>Informamos que sua solicitação {{appName}} Shield foi rejeitada.</p>

<div class="warning-box">
    <h3>🛡️ Solicitação Rejeitada</h3>
    <p><strong>ID da Solicitação:</strong> {{claimId}}</p>
    <p><strong>Serviço:</strong> {{service}}</p>
    <p><strong>Motivo:</strong> {{rejectionReason}}</p>
</div>

<p>Se você discorda desta decisão, pode entrar em contato com nosso suporte para revisão.</p>

<a href="{{buildUrl '/support'}}" class="button">Contatar Suporte</a>`;
  }

  // Template de mensagem de chat
  getChatMessageTemplate() {
    return `
<h2>Olá, {{userName}}!</h2>
<p>Você recebeu uma nova mensagem de {{senderName}}.</p>

<div class="info-box">
    <h3>💬 Nova Mensagem</h3>
    <p><strong>De:</strong> {{senderName}}</p>
    <p><strong>Mensagem:</strong> "{{message}}"</p>
    <p><strong>Data:</strong> {{formatDate messageDate 'datetime'}}</p>
</div>

<a href="{{buildUrl (concat '/chat/' conversationId)}}" class="button">Responder</a>`;
  }

  // Template de alerta do sistema
  getSystemAlertTemplate() {
    return `
<h2>Olá, {{userName}}!</h2>
<p>Temos um alerta importante do sistema para você.</p>

<div class="warning-box">
    <h3>🔔 Alerta do Sistema</h3>
    <p>{{message}}</p>
    {{#if details}}<p><strong>Detalhes:</strong> {{details}}</p>{{/if}}
</div>

{{#if actionRequired}}
<p><strong>Ação necessária:</strong> {{actionRequired}}</p>
<a href="{{actionUrl}}" class="button">Tomar Ação</a>
{{/if}}`;
  }

  // Template de marketing
  getMarketingTemplate() {
    return `
<h2>{{title}}</h2>
<p>{{description}}</p>

{{#if imageUrl}}
<div style="text-align: center; margin: 20px 0;">
    <img src="{{imageUrl}}" alt="{{title}}" style="max-width: 100%; height: auto; border-radius: 8px;">
</div>
{{/if}}

{{#if discount}}
<div class="success-box">
    <h3>🎉 Oferta Especial</h3>
    <p><strong>Desconto:</strong> {{discount}}%</p>
    {{#if validUntil}}<p><strong>Válido até:</strong> {{formatDate validUntil 'long'}}</p>{{/if}}
</div>
{{/if}}

<a href="{{actionUrl}}" class="button">{{ctaText}}</a>`;
  }

  // Template de segurança
  getSecurityTemplate() {
    return `
<h2>Olá, {{userName}}!</h2>
<p>Detectamos uma atividade de segurança na sua conta.</p>

<div class="warning-box">
    <h3>🔐 Alerta de Segurança</h3>
    <p><strong>Tipo:</strong> {{alertType}}</p>
    <p><strong>Data:</strong> {{formatDate alertDate 'datetime'}}</p>
    {{#if device}}<p><strong>Dispositivo:</strong> {{device}}</p>{{/if}}
    {{#if location}}<p><strong>Localização:</strong> {{location}}</p>{{/if}}
</div>

<p>Se esta atividade foi realizada por você, pode ignorar este email.</p>
<p>Caso contrário, recomendamos que altere sua senha imediatamente.</p>

<a href="{{buildUrl '/security'}}" class="button">Verificar Segurança</a>`;
  }

  // Template padrão
  getDefaultTemplate() {
    return `
<h2>{{title}}</h2>
<p>{{message}}</p>

{{#if data}}
<div class="info-box">
    <h3>Informações Adicionais</h3>
    {{#each data}}
    <p><strong>{{@key}}:</strong> {{this}}</p>
    {{/each}}
</div>
{{/if}}

{{#if actionUrl}}
<a href="{{actionUrl}}" class="button">{{actionText}}</a>
{{/if}}`;
  }

  // Obter lista de templates disponíveis
  getAvailableTemplates() {
    return Array.from(this.templates.keys());
  }

  // Verificar se template existe
  hasTemplate(templateName) {
    return this.templates.has(templateName);
  }

  // Recarregar templates
  async reloadTemplates() {
    this.templates.clear();
    await this.loadTemplates();
    console.log('🔄 Templates reloaded successfully');
  }
}

module.exports = new TemplateService();

