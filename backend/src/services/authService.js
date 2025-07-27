const { prisma } = require('../config/database')
const passwordUtils = require('../utils/password')
const jwtUtils = require('../utils/jwt')
const logger = require('../config/logger')
const { AppError, errors } = require('../middlewares/errorHandler')
const crypto = require('crypto')

class AuthService {
  /**
   * Registrar novo usuário
   * @param {Object} userData - Dados do usuário
   * @returns {Object} Usuário criado e tokens
   */
  async register(userData) {
    try {
      const { email, password, firstName, lastName, phone, birthDate } = userData

      // Verificar se o email já existe
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })

      if (existingUser) {
        throw errors.ALREADY_EXISTS('Email')
      }

      // Validar força da senha
      const passwordValidation = passwordUtils.validatePasswordStrength(password)
      if (!passwordValidation.isValid) {
        throw new AppError(
          `Senha muito fraca: ${passwordValidation.feedback.join(', ')}`,
          400,
          'WEAK_PASSWORD'
        )
      }

      // Hash da senha
      const hashedPassword = await passwordUtils.hashPassword(password)

      // Gerar token de verificação de email
      const emailVerificationToken = crypto.randomBytes(32).toString('hex')

      // Criar usuário
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          phone,
          birthDate: birthDate ? new Date(birthDate) : null,
          emailVerificationToken,
          profile: {
            create: {
              language: 'pt-BR',
              timezone: 'America/Sao_Paulo'
            }
          }
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          emailVerified: true,
          createdAt: true
        }
      })

      // Gerar tokens
      const tokens = await jwtUtils.generateTokenPair(user)

      // Log de auditoria
      logger.auditLog('USER_REGISTERED', 'auth', user.id, {
        email: user.email,
        role: user.role
      })

      // TODO: Enviar email de verificação
      logger.info(`Email verification token for ${email}: ${emailVerificationToken}`)

      return {
        user,
        tokens,
        message: 'Usuário registrado com sucesso. Verifique seu email para ativar a conta.'
      }
    } catch (error) {
      logger.error('Error in register:', error)
      throw error
    }
  }

  /**
   * Login do usuário
   * @param {Object} credentials - Credenciais de login
   * @returns {Object} Usuário e tokens
   */
  async login(credentials) {
    try {
      const { email, password } = credentials

      // Buscar usuário
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          password: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          emailVerified: true,
          createdAt: true
        }
      })

      if (!user) {
        throw errors.UNAUTHORIZED()
      }

      // Verificar senha
      const isPasswordValid = await passwordUtils.verifyPassword(password, user.password)
      if (!isPasswordValid) {
        // Log de tentativa de login inválida
        logger.auditLog('INVALID_LOGIN_ATTEMPT', 'auth', null, {
          email,
          reason: 'invalid_password'
        })
        throw errors.UNAUTHORIZED()
      }

      // Verificar status da conta
      if (user.status === 'SUSPENDED') {
        throw new AppError('Conta suspensa', 403, 'ACCOUNT_SUSPENDED')
      }

      if (user.status === 'INACTIVE') {
        throw new AppError('Conta inativa', 403, 'ACCOUNT_INACTIVE')
      }

      // Verificar se precisa atualizar hash da senha
      if (passwordUtils.needsRehash(user.password)) {
        const newHash = await passwordUtils.hashPassword(password)
        await prisma.user.update({
          where: { id: user.id },
          data: { password: newHash }
        })
        logger.info(`Password hash updated for user ${user.id}`)
      }

      // Remover senha do objeto de retorno
      delete user.password

      // Gerar tokens
      const tokens = await jwtUtils.generateTokenPair(user)

      // Log de auditoria
      logger.auditLog('USER_LOGIN', 'auth', user.id, {
        email: user.email
      })

      return {
        user,
        tokens,
        message: 'Login realizado com sucesso'
      }
    } catch (error) {
      logger.error('Error in login:', error)
      throw error
    }
  }

  /**
   * Renovar access token
   * @param {string} refreshToken - Refresh token
   * @returns {Object} Novo access token
   */
  async refreshToken(refreshToken) {
    try {
      if (!refreshToken) {
        throw errors.VALIDATION_ERROR('Refresh token é obrigatório')
      }

      const tokens = await jwtUtils.refreshAccessToken(refreshToken)

      return {
        tokens,
        message: 'Token renovado com sucesso'
      }
    } catch (error) {
      logger.error('Error in refreshToken:', error)
      throw error
    }
  }

  /**
   * Logout do usuário
   * @param {string} refreshToken - Refresh token para revogar
   * @param {string} userId - ID do usuário
   * @returns {Object} Resultado do logout
   */
  async logout(refreshToken, userId) {
    try {
      if (refreshToken) {
        await jwtUtils.revokeRefreshToken(refreshToken)
      }

      // Log de auditoria
      logger.auditLog('USER_LOGOUT', 'auth', userId)

      return {
        message: 'Logout realizado com sucesso'
      }
    } catch (error) {
      logger.error('Error in logout:', error)
      throw error
    }
  }

  /**
   * Logout de todos os dispositivos
   * @param {string} userId - ID do usuário
   * @returns {Object} Resultado do logout
   */
  async logoutAll(userId) {
    try {
      const tokensRevoked = await jwtUtils.revokeAllUserTokens(userId)

      return {
        message: `Logout realizado em ${tokensRevoked} dispositivos`,
        tokensRevoked
      }
    } catch (error) {
      logger.error('Error in logoutAll:', error)
      throw error
    }
  }

  /**
   * Verificar email
   * @param {string} token - Token de verificação
   * @returns {Object} Resultado da verificação
   */
  async verifyEmail(token) {
    try {
      if (!token) {
        throw errors.VALIDATION_ERROR('Token de verificação é obrigatório')
      }

      // Buscar usuário pelo token
      const user = await prisma.user.findFirst({
        where: {
          emailVerificationToken: token,
          emailVerified: false
        }
      })

      if (!user) {
        throw new AppError('Token de verificação inválido ou expirado', 400, 'INVALID_VERIFICATION_TOKEN')
      }

      // Atualizar usuário
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: true,
          emailVerificationToken: null,
          status: 'ACTIVE'
        }
      })

      // Log de auditoria
      logger.auditLog('EMAIL_VERIFIED', 'auth', user.id, {
        email: user.email
      })

      return {
        message: 'Email verificado com sucesso'
      }
    } catch (error) {
      logger.error('Error in verifyEmail:', error)
      throw error
    }
  }

  /**
   * Reenviar email de verificação
   * @param {string} email - Email do usuário
   * @returns {Object} Resultado do reenvio
   */
  async resendVerificationEmail(email) {
    try {
      // Buscar usuário
      const user = await prisma.user.findUnique({
        where: { email }
      })

      if (!user) {
        throw errors.NOT_FOUND('Usuário')
      }

      if (user.emailVerified) {
        throw errors.EMAIL_ALREADY_VERIFIED()
      }

      // Gerar novo token
      const emailVerificationToken = crypto.randomBytes(32).toString('hex')

      // Atualizar token
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerificationToken }
      })

      // TODO: Enviar email de verificação
      logger.info(`New email verification token for ${email}: ${emailVerificationToken}`)

      // Log de auditoria
      logger.auditLog('VERIFICATION_EMAIL_RESENT', 'auth', user.id, {
        email: user.email
      })

      return {
        message: 'Email de verificação reenviado com sucesso'
      }
    } catch (error) {
      logger.error('Error in resendVerificationEmail:', error)
      throw error
    }
  }

  /**
   * Solicitar reset de senha
   * @param {string} email - Email do usuário
   * @returns {Object} Resultado da solicitação
   */
  async forgotPassword(email) {
    try {
      // Buscar usuário
      const user = await prisma.user.findUnique({
        where: { email }
      })

      if (!user) {
        // Por segurança, não revelar se o email existe
        return {
          message: 'Se o email existir, você receberá instruções para redefinir sua senha'
        }
      }

      // Gerar token de reset
      const resetToken = passwordUtils.generatePasswordResetToken(email)
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000) // 1 hora

      // Salvar token
      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordResetToken: resetToken,
          passwordResetExpires: resetExpires
        }
      })

      // TODO: Enviar email com token de reset
      logger.info(`Password reset token for ${email}: ${resetToken}`)

      // Log de auditoria
      logger.auditLog('PASSWORD_RESET_REQUESTED', 'auth', user.id, {
        email: user.email
      })

      return {
        message: 'Se o email existir, você receberá instruções para redefinir sua senha'
      }
    } catch (error) {
      logger.error('Error in forgotPassword:', error)
      throw error
    }
  }

  /**
   * Resetar senha
   * @param {string} token - Token de reset
   * @param {string} newPassword - Nova senha
   * @returns {Object} Resultado do reset
   */
  async resetPassword(token, newPassword) {
    try {
      if (!token || !newPassword) {
        throw errors.VALIDATION_ERROR('Token e nova senha são obrigatórios')
      }

      // Buscar usuário pelo token
      const user = await prisma.user.findFirst({
        where: {
          passwordResetToken: token,
          passwordResetExpires: {
            gt: new Date()
          }
        }
      })

      if (!user) {
        throw new AppError('Token de reset inválido ou expirado', 400, 'INVALID_RESET_TOKEN')
      }

      // Validar nova senha
      const passwordValidation = passwordUtils.validatePasswordStrength(newPassword)
      if (!passwordValidation.isValid) {
        throw new AppError(
          `Senha muito fraca: ${passwordValidation.feedback.join(', ')}`,
          400,
          'WEAK_PASSWORD'
        )
      }

      // Hash da nova senha
      const hashedPassword = await passwordUtils.hashPassword(newPassword)

      // Atualizar senha e limpar tokens
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          passwordResetToken: null,
          passwordResetExpires: null
        }
      })

      // Revogar todos os refresh tokens
      await jwtUtils.revokeAllUserTokens(user.id)

      // Log de auditoria
      logger.auditLog('PASSWORD_RESET_COMPLETED', 'auth', user.id, {
        email: user.email
      })

      return {
        message: 'Senha redefinida com sucesso'
      }
    } catch (error) {
      logger.error('Error in resetPassword:', error)
      throw error
    }
  }

  /**
   * Alterar senha
   * @param {string} userId - ID do usuário
   * @param {string} currentPassword - Senha atual
   * @param {string} newPassword - Nova senha
   * @returns {Object} Resultado da alteração
   */
  async changePassword(userId, currentPassword, newPassword) {
    try {
      // Buscar usuário
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          password: true
        }
      })

      if (!user) {
        throw errors.NOT_FOUND('Usuário')
      }

      // Verificar senha atual
      const isCurrentPasswordValid = await passwordUtils.verifyPassword(currentPassword, user.password)
      if (!isCurrentPasswordValid) {
        throw errors.INVALID_PASSWORD()
      }

      // Validar nova senha
      const passwordValidation = passwordUtils.validatePasswordStrength(newPassword)
      if (!passwordValidation.isValid) {
        throw new AppError(
          `Senha muito fraca: ${passwordValidation.feedback.join(', ')}`,
          400,
          'WEAK_PASSWORD'
        )
      }

      // Verificar se a nova senha é diferente da atual
      const isSamePassword = await passwordUtils.verifyPassword(newPassword, user.password)
      if (isSamePassword) {
        throw new AppError('A nova senha deve ser diferente da senha atual', 400, 'SAME_PASSWORD')
      }

      // Hash da nova senha
      const hashedPassword = await passwordUtils.hashPassword(newPassword)

      // Atualizar senha
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword }
      })

      // Log de auditoria
      logger.auditLog('PASSWORD_CHANGED', 'auth', userId, {
        email: user.email
      })

      return {
        message: 'Senha alterada com sucesso'
      }
    } catch (error) {
      logger.error('Error in changePassword:', error)
      throw error
    }
  }

  /**
   * Obter perfil do usuário autenticado
   * @param {string} userId - ID do usuário
   * @returns {Object} Dados do usuário
   */
  async getProfile(userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          avatar: true,
          birthDate: true,
          role: true,
          status: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
          profile: {
            select: {
              cpf: true,
              address: true,
              city: true,
              state: true,
              zipCode: true,
              country: true,
              language: true,
              timezone: true,
              emailNotifications: true,
              smsNotifications: true,
              pushNotifications: true
            }
          }
        }
      })

      if (!user) {
        throw errors.NOT_FOUND('Usuário')
      }

      return user
    } catch (error) {
      logger.error('Error in getProfile:', error)
      throw error
    }
  }
}

module.exports = new AuthService()

