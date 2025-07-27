const passwordUtils = require('../../src/utils/password')

describe('PasswordUtils', () => {
  describe('hashPassword', () => {
    it('should hash password successfully', async () => {
      const password = 'SecurePass123!'
      const hash = await passwordUtils.hashPassword(password)

      expect(hash).toBeDefined()
      expect(hash).not.toBe(password)
      expect(hash).toMatch(/^\$argon2id\$/)
    })

    it('should generate different hashes for same password', async () => {
      const password = 'SecurePass123!'
      const hash1 = await passwordUtils.hashPassword(password)
      const hash2 = await passwordUtils.hashPassword(password)

      expect(hash1).not.toBe(hash2)
    })

    it('should throw error for empty password', async () => {
      await expect(passwordUtils.hashPassword('')).rejects.toThrow('Password must be a non-empty string')
    })

    it('should throw error for null password', async () => {
      await expect(passwordUtils.hashPassword(null)).rejects.toThrow('Password must be a non-empty string')
    })

    it('should throw error for short password', async () => {
      await expect(passwordUtils.hashPassword('123')).rejects.toThrow('Password must be at least 6 characters long')
    })

    it('should throw error for non-string password', async () => {
      await expect(passwordUtils.hashPassword(123)).rejects.toThrow('Password must be a non-empty string')
    })
  })

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const password = 'SecurePass123!'
      const hash = await passwordUtils.hashPassword(password)

      const isValid = await passwordUtils.verifyPassword(password, hash)
      expect(isValid).toBe(true)
    })

    it('should reject incorrect password', async () => {
      const password = 'SecurePass123!'
      const wrongPassword = 'WrongPass123!'
      const hash = await passwordUtils.hashPassword(password)

      const isValid = await passwordUtils.verifyPassword(wrongPassword, hash)
      expect(isValid).toBe(false)
    })

    it('should return false for empty password', async () => {
      const hash = await passwordUtils.hashPassword('SecurePass123!')
      const isValid = await passwordUtils.verifyPassword('', hash)
      expect(isValid).toBe(false)
    })

    it('should return false for empty hash', async () => {
      const isValid = await passwordUtils.verifyPassword('SecurePass123!', '')
      expect(isValid).toBe(false)
    })

    it('should return false for null values', async () => {
      const isValid1 = await passwordUtils.verifyPassword(null, 'hash')
      const isValid2 = await passwordUtils.verifyPassword('password', null)
      
      expect(isValid1).toBe(false)
      expect(isValid2).toBe(false)
    })
  })

  describe('generateRandomPassword', () => {
    it('should generate password with default length', () => {
      const password = passwordUtils.generateRandomPassword()
      expect(password).toHaveLength(12)
    })

    it('should generate password with custom length', () => {
      const password = passwordUtils.generateRandomPassword(16)
      expect(password).toHaveLength(16)
    })

    it('should generate different passwords', () => {
      const password1 = passwordUtils.generateRandomPassword()
      const password2 = passwordUtils.generateRandomPassword()
      expect(password1).not.toBe(password2)
    })

    it('should include uppercase letters by default', () => {
      const password = passwordUtils.generateRandomPassword(50)
      expect(password).toMatch(/[A-Z]/)
    })

    it('should include lowercase letters by default', () => {
      const password = passwordUtils.generateRandomPassword(50)
      expect(password).toMatch(/[a-z]/)
    })

    it('should include numbers by default', () => {
      const password = passwordUtils.generateRandomPassword(50)
      expect(password).toMatch(/[0-9]/)
    })

    it('should include symbols by default', () => {
      const password = passwordUtils.generateRandomPassword(50)
      expect(password).toMatch(/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/)
    })

    it('should respect character type options', () => {
      const password = passwordUtils.generateRandomPassword(20, {
        includeUppercase: false,
        includeLowercase: true,
        includeNumbers: false,
        includeSymbols: false
      })
      
      expect(password).toMatch(/^[a-z]+$/)
    })

    it('should throw error when no character types are included', () => {
      expect(() => {
        passwordUtils.generateRandomPassword(12, {
          includeUppercase: false,
          includeLowercase: false,
          includeNumbers: false,
          includeSymbols: false
        })
      }).toThrow('At least one character type must be included')
    })
  })

  describe('validatePasswordStrength', () => {
    it('should validate strong password', () => {
      const result = passwordUtils.validatePasswordStrength('SecurePass123!')
      
      expect(result.isValid).toBe(true)
      expect(result.score).toBe(6)
      expect(result.feedback).toHaveLength(0)
      expect(result.requirements.minLength).toBe(true)
      expect(result.requirements.hasUppercase).toBe(true)
      expect(result.requirements.hasLowercase).toBe(true)
      expect(result.requirements.hasNumbers).toBe(true)
      expect(result.requirements.hasSymbols).toBe(true)
      expect(result.requirements.noCommonPatterns).toBe(true)
    })

    it('should reject short password', () => {
      const result = passwordUtils.validatePasswordStrength('Short1!')
      
      expect(result.isValid).toBe(false)
      expect(result.requirements.minLength).toBe(false)
      expect(result.feedback).toContain('Senha deve ter pelo menos 8 caracteres')
    })

    it('should reject password without uppercase', () => {
      const result = passwordUtils.validatePasswordStrength('lowercase123!')
      
      expect(result.requirements.hasUppercase).toBe(false)
      expect(result.feedback).toContain('Senha deve conter pelo menos uma letra maiúscula')
    })

    it('should reject password without lowercase', () => {
      const result = passwordUtils.validatePasswordStrength('UPPERCASE123!')
      
      expect(result.requirements.hasLowercase).toBe(false)
      expect(result.feedback).toContain('Senha deve conter pelo menos uma letra minúscula')
    })

    it('should reject password without numbers', () => {
      const result = passwordUtils.validatePasswordStrength('NoNumbers!')
      
      expect(result.requirements.hasNumbers).toBe(false)
      expect(result.feedback).toContain('Senha deve conter pelo menos um número')
    })

    it('should reject password without symbols', () => {
      const result = passwordUtils.validatePasswordStrength('NoSymbols123')
      
      expect(result.requirements.hasSymbols).toBe(false)
      expect(result.feedback).toContain('Senha deve conter pelo menos um símbolo especial')
    })

    it('should reject password with common patterns', () => {
      const result = passwordUtils.validatePasswordStrength('Password123!')
      
      expect(result.requirements.noCommonPatterns).toBe(false)
      expect(result.feedback).toContain('Senha contém padrões comuns ou caracteres repetidos')
    })

    it('should reject password with repeated characters', () => {
      const result = passwordUtils.validatePasswordStrength('Aaaa1234!')
      
      expect(result.requirements.noCommonPatterns).toBe(false)
      expect(result.feedback).toContain('Senha contém padrões comuns ou caracteres repetidos')
    })

    it('should handle null password', () => {
      const result = passwordUtils.validatePasswordStrength(null)
      
      expect(result.isValid).toBe(false)
      expect(result.feedback).toContain('Senha é obrigatória')
    })

    it('should handle empty password', () => {
      const result = passwordUtils.validatePasswordStrength('')
      
      expect(result.isValid).toBe(false)
      expect(result.feedback).toContain('Senha é obrigatória')
    })
  })

  describe('generatePasswordResetToken', () => {
    it('should generate reset token', () => {
      const email = 'test@example.com'
      const token = passwordUtils.generatePasswordResetToken(email)
      
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token).toHaveLength(64) // SHA256 hex string
      expect(token).toMatch(/^[a-f0-9]{64}$/)
    })

    it('should generate different tokens for same email', () => {
      const email = 'test@example.com'
      const token1 = passwordUtils.generatePasswordResetToken(email)
      const token2 = passwordUtils.generatePasswordResetToken(email)
      
      expect(token1).not.toBe(token2)
    })

    it('should generate different tokens for different emails', () => {
      const token1 = passwordUtils.generatePasswordResetToken('test1@example.com')
      const token2 = passwordUtils.generatePasswordResetToken('test2@example.com')
      
      expect(token1).not.toBe(token2)
    })
  })

  describe('isPasswordResetTokenValid', () => {
    it('should validate valid token', () => {
      const token = passwordUtils.generatePasswordResetToken('test@example.com')
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now
      
      const isValid = passwordUtils.isPasswordResetTokenValid(token, expiresAt)
      expect(isValid).toBe(true)
    })

    it('should reject expired token', () => {
      const token = passwordUtils.generatePasswordResetToken('test@example.com')
      const expiresAt = new Date(Date.now() - 60 * 60 * 1000) // 1 hour ago
      
      const isValid = passwordUtils.isPasswordResetTokenValid(token, expiresAt)
      expect(isValid).toBe(false)
    })

    it('should reject invalid token format', () => {
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000)
      
      const isValid = passwordUtils.isPasswordResetTokenValid('invalid-token', expiresAt)
      expect(isValid).toBe(false)
    })

    it('should reject null token', () => {
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000)
      
      const isValid = passwordUtils.isPasswordResetTokenValid(null, expiresAt)
      expect(isValid).toBe(false)
    })

    it('should reject null expiration date', () => {
      const token = passwordUtils.generatePasswordResetToken('test@example.com')
      
      const isValid = passwordUtils.isPasswordResetTokenValid(token, null)
      expect(isValid).toBe(false)
    })
  })
})

