const argon2 = require('argon2')
const logger = require('../config/logger')

class PasswordUtils {
  constructor() {
    // Configurações do Argon2
    this.options = {
      type: argon2.argon2id, // Recomendado para aplicações gerais
      memoryCost: parseInt(process.env.ARGON2_MEMORY_COST) || 65536, // 64 MB
      timeCost: parseInt(process.env.ARGON2_TIME_COST) || 3, // 3 iterações
      parallelism: parseInt(process.env.ARGON2_PARALLELISM) || 4, // 4 threads
      hashLength: 32 // 32 bytes de hash
    }
  }

  /**
   * Hash de senha usando Argon2
   * @param {string} password - Senha em texto plano
   * @returns {Promise<string>} Hash da senha
   */
  async hashPassword(password) {
    try {
      if (!password || typeof password !== 'string' || password.trim() === '') {
        throw new Error('Password must be a non-empty string')
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long')
      }

      const hash = await argon2.hash(password, this.options)
      
      logger.debug('Password hashed successfully')
      return hash
    } catch (error) {
      // Re-lançar erros de validação sem modificar
      if (error.message.includes('Password must be')) {
        throw error
      }
      
      logger.error('Error hashing password:', error)
      throw new Error('Failed to hash password')
    }
  }

  /**
   * Verificar senha contra hash
   * @param {string} password - Senha em texto plano
   * @param {string} hash - Hash armazenado
   * @returns {Promise<boolean>} True se a senha estiver correta
   */
  async verifyPassword(password, hash) {
    try {
      if (!password || !hash) {
        throw new Error('Password and hash are required')
      }

      const isValid = await argon2.verify(hash, password)
      
      if (isValid) {
        logger.debug('Password verification successful')
      } else {
        logger.debug('Password verification failed')
      }

      return isValid
    } catch (error) {
      logger.error('Error verifying password:', error)
      return false
    }
  }

  /**
   * Verificar se o hash precisa ser atualizado
   * @param {string} hash - Hash atual
   * @returns {boolean} True se precisa atualizar
   */
  needsRehash(hash) {
    try {
      return argon2.needsRehash(hash, this.options)
    } catch (error) {
      logger.error('Error checking if hash needs rehash:', error)
      return false
    }
  }

  /**
   * Gerar senha aleatória
   * @param {number} length - Comprimento da senha (padrão: 12)
   * @param {Object} options - Opções de geração
   * @returns {string} Senha gerada
   */
  generateRandomPassword(length = 12, options = {}) {
    const {
      includeUppercase = true,
      includeLowercase = true,
      includeNumbers = true,
      includeSymbols = true,
      excludeSimilar = true
    } = options

    let charset = ''
    
    if (includeLowercase) {
      charset += excludeSimilar ? 'abcdefghjkmnpqrstuvwxyz' : 'abcdefghijklmnopqrstuvwxyz'
    }
    
    if (includeUppercase) {
      charset += excludeSimilar ? 'ABCDEFGHJKMNPQRSTUVWXYZ' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    }
    
    if (includeNumbers) {
      charset += excludeSimilar ? '23456789' : '0123456789'
    }
    
    if (includeSymbols) {
      charset += '!@#$%^&*()_+-=[]{}|;:,.<>?'
    }

    if (!charset) {
      throw new Error('At least one character type must be included')
    }

    let password = ''
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length))
    }

    return password
  }

  /**
   * Validar força da senha
   * @param {string} password - Senha para validar
   * @returns {Object} Resultado da validação
   */
  validatePasswordStrength(password) {
    const result = {
      isValid: false,
      score: 0,
      feedback: [],
      requirements: {
        minLength: false,
        hasUppercase: false,
        hasLowercase: false,
        hasNumbers: false,
        hasSymbols: false,
        noCommonPatterns: false
      }
    }

    if (!password || typeof password !== 'string') {
      result.feedback.push('Senha é obrigatória')
      return result
    }

    // Verificar comprimento mínimo
    if (password.length >= 8) {
      result.requirements.minLength = true
      result.score += 1
    } else {
      result.feedback.push('Senha deve ter pelo menos 8 caracteres')
    }

    // Verificar maiúsculas
    if (/[A-Z]/.test(password)) {
      result.requirements.hasUppercase = true
      result.score += 1
    } else {
      result.feedback.push('Senha deve conter pelo menos uma letra maiúscula')
    }

    // Verificar minúsculas
    if (/[a-z]/.test(password)) {
      result.requirements.hasLowercase = true
      result.score += 1
    } else {
      result.feedback.push('Senha deve conter pelo menos uma letra minúscula')
    }

    // Verificar números
    if (/[0-9]/.test(password)) {
      result.requirements.hasNumbers = true
      result.score += 1
    } else {
      result.feedback.push('Senha deve conter pelo menos um número')
    }

    // Verificar símbolos
    if (/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) {
      result.requirements.hasSymbols = true
      result.score += 1
    } else {
      result.feedback.push('Senha deve conter pelo menos um símbolo especial')
    }

    // Verificar padrões comuns
    const commonPatterns = [
      /123456/,
      /password/i,
      /qwerty/i,
      /abc123/i,
      /(.)\1{2,}/, // caracteres repetidos
      /012345/,
      /987654/
    ]

    const hasCommonPattern = commonPatterns.some(pattern => pattern.test(password))
    if (!hasCommonPattern) {
      result.requirements.noCommonPatterns = true
      result.score += 1
    } else {
      result.feedback.push('Senha contém padrões comuns ou caracteres repetidos')
    }

    // Determinar se a senha é válida
    result.isValid = result.score >= 5 // Pelo menos 5 dos 6 critérios

    return result
  }

  /**
   * Gerar hash de senha temporária para reset
   * @param {string} email - Email do usuário
   * @returns {string} Token de reset
   */
  generatePasswordResetToken(email) {
    try {
      const crypto = require('crypto')
      const timestamp = Date.now().toString()
      const randomBytes = crypto.randomBytes(32).toString('hex')
      const data = `${email}:${timestamp}:${randomBytes}`
      
      return crypto.createHash('sha256').update(data).digest('hex')
    } catch (error) {
      logger.error('Error generating password reset token:', error)
      throw new Error('Failed to generate reset token')
    }
  }

  /**
   * Verificar se o token de reset é válido
   * @param {string} token - Token de reset
   * @param {Date} expiresAt - Data de expiração
   * @returns {boolean} True se válido
   */
  isPasswordResetTokenValid(token, expiresAt) {
    try {
      if (!token || !expiresAt) {
        return false
      }

      // Verificar se não expirou
      if (new Date() > expiresAt) {
        return false
      }

      // Verificar formato do token (64 caracteres hex)
      if (!/^[a-f0-9]{64}$/.test(token)) {
        return false
      }

      return true
    } catch (error) {
      logger.error('Error validating password reset token:', error)
      return false
    }
  }

  /**
   * Limpar dados sensíveis da memória
   * @param {string} password - Senha para limpar
   */
  clearPassword(password) {
    if (typeof password === 'string') {
      // Em JavaScript não é possível limpar completamente a memória,
      // mas podemos sobrescrever a variável
      password = null
    }
  }
}

module.exports = new PasswordUtils()

