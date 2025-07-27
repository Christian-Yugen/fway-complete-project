const jwt = require('jsonwebtoken')
const { prisma } = require('../config/database')
const logger = require('../config/logger')

class JWTUtils {
  constructor() {
    this.accessTokenSecret = process.env.JWT_SECRET
    this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET
    this.accessTokenExpiry = process.env.JWT_EXPIRES_IN || '15m'
    this.refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRES_IN || '7d'

    if (!this.accessTokenSecret || !this.refreshTokenSecret) {
      throw new Error('JWT secrets must be defined in environment variables')
    }
  }

  /**
   * Gerar access token
   * @param {Object} payload - Dados do usuário
   * @returns {string} Access token
   */
  generateAccessToken(payload) {
    try {
      return jwt.sign(
        {
          id: payload.id,
          email: payload.email,
          role: payload.role,
          status: payload.status
        },
        this.accessTokenSecret,
        {
          expiresIn: this.accessTokenExpiry,
          issuer: 'fway-backend',
          audience: 'fway-app'
        }
      )
    } catch (error) {
      logger.error('Error generating access token:', error)
      throw new Error('Failed to generate access token')
    }
  }

  /**
   * Gerar refresh token
   * @param {Object} payload - Dados do usuário
   * @returns {string} Refresh token
   */
  generateRefreshToken(payload) {
    try {
      return jwt.sign(
        {
          id: payload.id,
          email: payload.email,
          tokenType: 'refresh'
        },
        this.refreshTokenSecret,
        {
          expiresIn: this.refreshTokenExpiry,
          issuer: 'fway-backend',
          audience: 'fway-app'
        }
      )
    } catch (error) {
      logger.error('Error generating refresh token:', error)
      throw new Error('Failed to generate refresh token')
    }
  }

  /**
   * Gerar par de tokens (access + refresh)
   * @param {Object} user - Dados do usuário
   * @returns {Object} { accessToken, refreshToken, expiresIn }
   */
  async generateTokenPair(user) {
    try {
      const accessToken = this.generateAccessToken(user)
      const refreshToken = this.generateRefreshToken(user)

      // Salvar refresh token no banco
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7) // 7 dias

      await prisma.refreshToken.create({
        data: {
          token: refreshToken,
          userId: user.id,
          expiresAt
        }
      })

      // Calcular tempo de expiração em segundos
      const expiresIn = this.getTokenExpirationTime(this.accessTokenExpiry)

      logger.auditLog('TOKEN_GENERATED', 'auth', user.id, {
        tokenType: 'access_refresh_pair'
      })

      return {
        accessToken,
        refreshToken,
        expiresIn,
        tokenType: 'Bearer'
      }
    } catch (error) {
      logger.error('Error generating token pair:', error)
      throw new Error('Failed to generate token pair')
    }
  }

  /**
   * Verificar access token
   * @param {string} token - Access token
   * @returns {Object} Payload decodificado
   */
  verifyAccessToken(token) {
    try {
      return jwt.verify(token, this.accessTokenSecret, {
        issuer: 'fway-backend',
        audience: 'fway-app'
      })
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Access token expired')
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid access token')
      } else {
        logger.error('Error verifying access token:', error)
        throw new Error('Token verification failed')
      }
    }
  }

  /**
   * Verificar refresh token
   * @param {string} token - Refresh token
   * @returns {Object} Payload decodificado
   */
  verifyRefreshToken(token) {
    try {
      return jwt.verify(token, this.refreshTokenSecret, {
        issuer: 'fway-backend',
        audience: 'fway-app'
      })
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Refresh token expired')
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid refresh token')
      } else {
        logger.error('Error verifying refresh token:', error)
        throw new Error('Token verification failed')
      }
    }
  }

  /**
   * Renovar access token usando refresh token
   * @param {string} refreshToken - Refresh token
   * @returns {Object} Novo access token
   */
  async refreshAccessToken(refreshToken) {
    try {
      // Verificar refresh token
      const decoded = this.verifyRefreshToken(refreshToken)

      // Verificar se o refresh token existe no banco e não expirou
      const storedToken = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true }
      })

      if (!storedToken) {
        throw new Error('Refresh token not found')
      }

      if (storedToken.expiresAt < new Date()) {
        // Remover token expirado
        await prisma.refreshToken.delete({
          where: { id: storedToken.id }
        })
        throw new Error('Refresh token expired')
      }

      // Verificar se o usuário ainda existe e está ativo
      if (!storedToken.user || storedToken.user.status !== 'ACTIVE') {
        throw new Error('User not found or inactive')
      }

      // Gerar novo access token
      const accessToken = this.generateAccessToken(storedToken.user)
      const expiresIn = this.getTokenExpirationTime(this.accessTokenExpiry)

      logger.auditLog('TOKEN_REFRESHED', 'auth', storedToken.user.id)

      return {
        accessToken,
        expiresIn,
        tokenType: 'Bearer'
      }
    } catch (error) {
      logger.error('Error refreshing access token:', error)
      throw error
    }
  }

  /**
   * Revogar refresh token
   * @param {string} refreshToken - Refresh token para revogar
   * @returns {boolean} Sucesso da operação
   */
  async revokeRefreshToken(refreshToken) {
    try {
      const result = await prisma.refreshToken.deleteMany({
        where: { token: refreshToken }
      })

      return result.count > 0
    } catch (error) {
      logger.error('Error revoking refresh token:', error)
      throw new Error('Failed to revoke refresh token')
    }
  }

  /**
   * Revogar todos os refresh tokens de um usuário
   * @param {string} userId - ID do usuário
   * @returns {number} Número de tokens revogados
   */
  async revokeAllUserTokens(userId) {
    try {
      const result = await prisma.refreshToken.deleteMany({
        where: { userId }
      })

      logger.auditLog('ALL_TOKENS_REVOKED', 'auth', userId, {
        tokensRevoked: result.count
      })

      return result.count
    } catch (error) {
      logger.error('Error revoking all user tokens:', error)
      throw new Error('Failed to revoke user tokens')
    }
  }

  /**
   * Limpar tokens expirados
   * @returns {number} Número de tokens removidos
   */
  async cleanupExpiredTokens() {
    try {
      const result = await prisma.refreshToken.deleteMany({
        where: {
          expiresAt: {
            lt: new Date()
          }
        }
      })

      if (result.count > 0) {
        logger.info(`Cleaned up ${result.count} expired refresh tokens`)
      }

      return result.count
    } catch (error) {
      logger.error('Error cleaning up expired tokens:', error)
      throw new Error('Failed to cleanup expired tokens')
    }
  }

  /**
   * Converter string de tempo para segundos
   * @param {string} timeString - String de tempo (ex: '15m', '1h', '7d')
   * @returns {number} Tempo em segundos
   */
  getTokenExpirationTime(timeString) {
    const timeUnit = timeString.slice(-1)
    const timeValue = parseInt(timeString.slice(0, -1))

    switch (timeUnit) {
      case 's':
        return timeValue
      case 'm':
        return timeValue * 60
      case 'h':
        return timeValue * 60 * 60
      case 'd':
        return timeValue * 24 * 60 * 60
      default:
        return 900 // 15 minutos por padrão
    }
  }

  /**
   * Extrair token do header Authorization
   * @param {string} authHeader - Header Authorization
   * @returns {string|null} Token extraído
   */
  extractTokenFromHeader(authHeader) {
    if (!authHeader) {
      return null
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null
    }

    return parts[1]
  }

  /**
   * Decodificar token sem verificar (para debug)
   * @param {string} token - Token para decodificar
   * @returns {Object} Payload decodificado
   */
  decodeToken(token) {
    try {
      return jwt.decode(token, { complete: true })
    } catch (error) {
      logger.error('Error decoding token:', error)
      return null
    }
  }
}

module.exports = new JWTUtils()

