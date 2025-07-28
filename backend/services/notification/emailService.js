const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  // Verificar conexão com o servidor de email
  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ Email service connected successfully');
      return true;
    } catch (error) {
      console.error('❌ Email service connection failed:', error);
      return false;
    }
  }

  // Enviar email de verificação
  async sendVerificationEmail(email, firstName) {
    try {
      const verificationToken = jwt.sign(
        { email, type: 'email-verification' },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Verificação de Email - Fway',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verificação de Email</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
              .content { padding: 30px; background: #f9f9f9; }
              .button { display: inline-block; padding: 12px 30px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🏥 Fway</h1>
                <p>Marketplace de Serviços de Saúde</p>
              </div>
              <div class="content">
                <h2>Olá, ${firstName}!</h2>
                <p>Bem-vindo ao Fway! Para completar seu cadastro, precisamos verificar seu email.</p>
                <p>Clique no botão abaixo para verificar sua conta:</p>
                <a href="${verificationUrl}" class="button">Verificar Email</a>
                <p>Ou copie e cole este link no seu navegador:</p>
                <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
                <p><strong>Este link expira em 24 horas.</strong></p>
                <p>Se você não criou uma conta no Fway, pode ignorar este email.</p>
              </div>
              <div class="footer">
                <p>© 2024 Fway. Todos os direitos reservados.</p>
                <p>Este é um email automático, não responda.</p>
              </div>
            </div>
          </body>
          </html>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Verification email sent to ${email}`);
      return true;
    } catch (error) {
      console.error('❌ Error sending verification email:', error);
      throw error;
    }
  }

  // Enviar email de reset de senha
  async sendPasswordResetEmail(email, firstName, resetToken) {
    try {
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Reset de Senha - Fway',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset de Senha</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #ef4444; color: white; padding: 20px; text-align: center; }
              .content { padding: 30px; background: #f9f9f9; }
              .button { display: inline-block; padding: 12px 30px; background: #ef4444; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
              .warning { background: #fef3cd; border: 1px solid #fecaca; padding: 15px; border-radius: 5px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔒 Fway</h1>
                <p>Reset de Senha</p>
              </div>
              <div class="content">
                <h2>Olá, ${firstName}!</h2>
                <p>Recebemos uma solicitação para redefinir a senha da sua conta no Fway.</p>
                <p>Clique no botão abaixo para criar uma nova senha:</p>
                <a href="${resetUrl}" class="button">Redefinir Senha</a>
                <p>Ou copie e cole este link no seu navegador:</p>
                <p style="word-break: break-all; color: #666;">${resetUrl}</p>
                <div class="warning">
                  <strong>⚠️ Importante:</strong>
                  <ul>
                    <li>Este link expira em 1 hora</li>
                    <li>Se você não solicitou este reset, ignore este email</li>
                    <li>Sua senha atual permanece ativa até que seja alterada</li>
                  </ul>
                </div>
              </div>
              <div class="footer">
                <p>© 2024 Fway. Todos os direitos reservados.</p>
                <p>Este é um email automático, não responda.</p>
              </div>
            </div>
          </body>
          </html>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Password reset email sent to ${email}`);
      return true;
    } catch (error) {
      console.error('❌ Error sending password reset email:', error);
      throw error;
    }
  }

  // Enviar email de boas-vindas
  async sendWelcomeEmail(email, firstName) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Bem-vindo ao Fway! 🎉',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Bem-vindo ao Fway</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 30px; text-align: center; }
              .content { padding: 30px; background: #f9f9f9; }
              .feature { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #3b82f6; }
              .button { display: inline-block; padding: 12px 30px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🏥 Bem-vindo ao Fway!</h1>
                <p>Sua jornada de saúde começa aqui</p>
              </div>
              <div class="content">
                <h2>Olá, ${firstName}! 👋</h2>
                <p>Estamos muito felizes em tê-lo conosco! O Fway é o marketplace mais completo de serviços de saúde do Brasil.</p>
                
                <h3>🌟 O que você pode fazer no Fway:</h3>
                
                <div class="feature">
                  <h4>🔍 Encontrar Profissionais</h4>
                  <p>Busque médicos, enfermeiros, fisioterapeutas e outros profissionais próximos a você.</p>
                </div>
                
                <div class="feature">
                  <h4>📅 Agendar Consultas</h4>
                  <p>Agende consultas presenciais, online ou domiciliares com facilidade.</p>
                </div>
                
                <div class="feature">
                  <h4>🛡️ Fway Shield</h4>
                  <p>Proteção inteligente com seguro embutido para todos os seus serviços.</p>
                </div>
                
                <div class="feature">
                  <h4>💬 Chat Integrado</h4>
                  <p>Converse diretamente com profissionais antes e depois das consultas.</p>
                </div>
                
                <a href="${process.env.FRONTEND_URL}/dashboard" class="button">Explorar Plataforma</a>
                
                <p>Se tiver dúvidas, nossa equipe está sempre pronta para ajudar!</p>
              </div>
              <div class="footer">
                <p>© 2024 Fway. Todos os direitos reservados.</p>
                <p>📧 suporte@fway.com | 📱 (11) 99999-9999</p>
              </div>
            </div>
          </body>
          </html>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Welcome email sent to ${email}`);
      return true;
    } catch (error) {
      console.error('❌ Error sending welcome email:', error);
      throw error;
    }
  }

  // Enviar notificação de agendamento
  async sendBookingNotification(email, firstName, bookingDetails) {
    try {
      const { professional, service, scheduledAt, type } = bookingDetails;

      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Agendamento Confirmado - Fway',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Agendamento Confirmado</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #10b981; color: white; padding: 20px; text-align: center; }
              .content { padding: 30px; background: #f9f9f9; }
              .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
              .button { display: inline-block; padding: 12px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>✅ Agendamento Confirmado</h1>
                <p>Fway - Cuidando da sua saúde</p>
              </div>
              <div class="content">
                <h2>Olá, ${firstName}!</h2>
                <p>Seu agendamento foi confirmado com sucesso! Aqui estão os detalhes:</p>
                
                <div class="booking-details">
                  <h3>📋 Detalhes do Agendamento</h3>
                  <div class="detail-row">
                    <strong>Profissional:</strong>
                    <span>${professional}</span>
                  </div>
                  <div class="detail-row">
                    <strong>Serviço:</strong>
                    <span>${service}</span>
                  </div>
                  <div class="detail-row">
                    <strong>Data e Hora:</strong>
                    <span>${new Date(scheduledAt).toLocaleString('pt-BR')}</span>
                  </div>
                  <div class="detail-row">
                    <strong>Tipo:</strong>
                    <span>${type === 'ONLINE' ? 'Online' : type === 'HOME_VISIT' ? 'Domiciliar' : 'Presencial'}</span>
                  </div>
                </div>
                
                <p>📱 Você receberá lembretes antes da consulta.</p>
                <p>💬 Use o chat integrado para se comunicar com o profissional.</p>
                
                <a href="${process.env.FRONTEND_URL}/my-bookings" class="button">Ver Agendamentos</a>
              </div>
              <div class="footer">
                <p>© 2024 Fway. Todos os direitos reservados.</p>
              </div>
            </div>
          </body>
          </html>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Booking notification sent to ${email}`);
      return true;
    } catch (error) {
      console.error('❌ Error sending booking notification:', error);
      throw error;
    }
  }
}

module.exports = new EmailService();

