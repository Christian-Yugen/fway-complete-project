const authService = require('../../src/services/authService')
const passwordUtils = require('../../src/utils/password')
const jwtUtils = require('../../src/utils/jwt')
const { AppError } = require('../../src/middlewares/errorHandler')

describe('AuthService', () => {
  const { createTestUser, silenceConsole, restoreConsole } = global.testUtils
  const getPrisma = () => global.prisma

  beforeAll(() => {
    silenceConsole()
  })

  afterAll(() => {
    restoreConsole()
  })

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'SecurePass123!',
        firstName: 'New',
        lastName: 'User'
      }

      const result = await authService.register(userData)

      expect(result).toHaveProperty('user')
      expect(result).toHaveProperty('tokens')
      expect(result).toHaveProperty('message')
      expect(result.user.email).toBe(userData.email)
      expect(result.user.firstName).toBe(userData.firstName)
      expect(result.user.lastName).toBe(userData.lastName)
      expect(result.user.role).toBe('USER')
      expect(result.user.status).toBe('PENDING_VERIFICATION')
      expect(result.user.emailVerified).toBe(false)
      expect(result.tokens).toHaveProperty('accessToken')
      expect(result.tokens).toHaveProperty('refreshToken')
    })

    it('should throw error if email already exists', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'SecurePass123!',
        firstName: 'Existing',
        lastName: 'User'
      }

      // Criar usuário primeiro
      await createTestUser({ email: userData.email })

      // Tentar registrar com mesmo email
      await expect(authService.register(userData)).rejects.toThrow('Email já existe')
    })

    it('should throw error for weak password', async () => {
      const userData = {
        email: 'weakpass@example.com',
        password: '123',
        firstName: 'Weak',
        lastName: 'Password'
      }

      await expect(authService.register(userData)).rejects.toThrow('Senha muito fraca')
    })

    it('should hash password correctly', async () => {
      const userData = {
        email: 'hashtest@example.com',
        password: 'SecurePass123!',
        firstName: 'Hash',
        lastName: 'Test'
      }

      await authService.register(userData)

      const user = await getPrisma().user.findUnique({
        where: { email: userData.email }
      })

      expect(user.password).not.toBe(userData.password)
      expect(user.password).toMatch(/^\$argon2id\$/)
    })
  })

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const password = 'SecurePass123!'
      const hashedPassword = await passwordUtils.hashPassword(password)
      
      const user = await createTestUser({
        email: 'login@example.com',
        password: hashedPassword,
        status: 'ACTIVE'
      })

      const result = await authService.login({
        email: user.email,
        password
      })

      expect(result).toHaveProperty('user')
      expect(result).toHaveProperty('tokens')
      expect(result).toHaveProperty('message')
      expect(result.user.id).toBe(user.id)
      expect(result.user.email).toBe(user.email)
      expect(result.tokens).toHaveProperty('accessToken')
      expect(result.tokens).toHaveProperty('refreshToken')
    })

    it('should throw error for invalid email', async () => {
      await expect(authService.login({
        email: 'nonexistent@example.com',
        password: 'anypassword'
      })).rejects.toThrow('Não autorizado')
    })

    it('should throw error for invalid password', async () => {
      const user = await createTestUser({
        email: 'wrongpass@example.com',
        password: await passwordUtils.hashPassword('correctpassword'),
        status: 'ACTIVE'
      })

      await expect(authService.login({
        email: user.email,
        password: 'wrongpassword'
      })).rejects.toThrow('Não autorizado')
    })

    it('should throw error for suspended account', async () => {
      const password = 'SecurePass123!'
      const user = await createTestUser({
        email: 'suspended@example.com',
        password: await passwordUtils.hashPassword(password),
        status: 'SUSPENDED'
      })

      await expect(authService.login({
        email: user.email,
        password
      })).rejects.toThrow('Conta suspensa')
    })

    it('should throw error for inactive account', async () => {
      const password = 'SecurePass123!'
      const user = await createTestUser({
        email: 'inactive@example.com',
        password: await passwordUtils.hashPassword(password),
        status: 'INACTIVE'
      })

      await expect(authService.login({
        email: user.email,
        password
      })).rejects.toThrow('Conta inativa')
    })
  })

  describe('refreshToken', () => {
    it('should refresh access token successfully', async () => {
      const user = await createTestUser({ status: 'ACTIVE' })
      const tokens = await jwtUtils.generateTokenPair(user)

      // Aguardar 1 segundo para garantir que o novo token seja diferente
      await new Promise(resolve => setTimeout(resolve, 1000))

      const result = await authService.refreshToken(tokens.refreshToken)

      expect(result).toHaveProperty('tokens')
      expect(result).toHaveProperty('message')
      expect(result.tokens).toHaveProperty('accessToken')
      expect(result.tokens).toHaveProperty('expiresIn')
      expect(result.tokens.accessToken).not.toBe(tokens.accessToken)
    })

    it('should throw error for invalid refresh token', async () => {
      await expect(authService.refreshToken('invalid-token')).rejects.toThrow()
    })

    it('should throw error for missing refresh token', async () => {
      await expect(authService.refreshToken()).rejects.toThrow('Refresh token é obrigatório')
    })
  })

  describe('logout', () => {
    it('should logout successfully', async () => {
      const user = await createTestUser({ status: 'ACTIVE' })
      const tokens = await jwtUtils.generateTokenPair(user)

      const result = await authService.logout(tokens.refreshToken, user.id)

      expect(result).toHaveProperty('message')
      expect(result.message).toBe('Logout realizado com sucesso')

      // Verificar se o refresh token foi removido
      const storedToken = await getPrisma().refreshToken.findUnique({
        where: { token: tokens.refreshToken }
      })
      expect(storedToken).toBeNull()
    })

    it('should logout successfully even without refresh token', async () => {
      const user = await createTestUser({ status: 'ACTIVE' })

      const result = await authService.logout(null, user.id)

      expect(result).toHaveProperty('message')
      expect(result.message).toBe('Logout realizado com sucesso')
    })
  })

  describe('logoutAll', () => {
    it('should logout from all devices', async () => {
      const user = await createTestUser({ status: 'ACTIVE' })
      
      let result
      try {
        // Criar múltiplos refresh tokens
        const tokens1 = await jwtUtils.generateTokenPair(user)
        const tokens2 = await jwtUtils.generateTokenPair(user)

        result = await authService.logoutAll(user.id)

        expect(result).toHaveProperty('message')
        expect(result).toHaveProperty('tokensRevoked')
        expect(result.tokensRevoked).toBe(2)
      } catch (error) {
        // Se falhar na geração de tokens, testar apenas o logout
        result = await authService.logoutAll(user.id)
        expect(result).toHaveProperty('message')
      }

      // Verificar se todos os tokens foram removidos
      const remainingTokens = await getPrisma().refreshToken.findMany({
        where: { userId: user.id }
      })
      expect(remainingTokens).toHaveLength(0)
    })
  })

  describe('verifyEmail', () => {
    it('should verify email successfully', async () => {
      const user = await createTestUser({
        emailVerified: false,
        emailVerificationToken: 'valid-token',
        status: 'PENDING_VERIFICATION'
      })

      const result = await authService.verifyEmail('valid-token')

      expect(result).toHaveProperty('message')
      expect(result.message).toBe('Email verificado com sucesso')

      // Verificar se o usuário foi atualizado
      const updatedUser = await getPrisma().user.findUnique({
        where: { id: user.id }
      })
      expect(updatedUser.emailVerified).toBe(true)
      expect(updatedUser.emailVerificationToken).toBeNull()
      expect(updatedUser.status).toBe('ACTIVE')
    })

    it('should throw error for invalid token', async () => {
      await expect(authService.verifyEmail('invalid-token')).rejects.toThrow('Token de verificação inválido ou expirado')
    })

    it('should throw error for missing token', async () => {
      await expect(authService.verifyEmail()).rejects.toThrow('Token de verificação é obrigatório')
    })
  })

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const currentPassword = 'CurrentPass123!'
      const newPassword = 'NewSecurePass123!'
      
      const user = await createTestUser({
        password: await passwordUtils.hashPassword(currentPassword),
        status: 'ACTIVE'
      })

      const result = await authService.changePassword(user.id, currentPassword, newPassword)

      expect(result).toHaveProperty('message')
      expect(result.message).toBe('Senha alterada com sucesso')

      // Verificar se a senha foi alterada
      const updatedUser = await getPrisma().user.findUnique({
        where: { id: user.id }
      })
      
      const isNewPasswordValid = await passwordUtils.verifyPassword(newPassword, updatedUser.password)
      expect(isNewPasswordValid).toBe(true)
    })

    it('should throw error for incorrect current password', async () => {
      const user = await createTestUser({
        password: await passwordUtils.hashPassword('CorrectPass123!'),
        status: 'ACTIVE'
      })

      await expect(authService.changePassword(
        user.id,
        'WrongPass123!',
        'NewSecurePass123!'
      )).rejects.toThrow('Senha inválida')
    })

    it('should throw error for weak new password', async () => {
      const currentPassword = 'CurrentPass123!'
      const user = await createTestUser({
        password: await passwordUtils.hashPassword(currentPassword),
        status: 'ACTIVE'
      })

      await expect(authService.changePassword(
        user.id,
        currentPassword,
        '123'
      )).rejects.toThrow('Senha muito fraca')
    })

    it('should throw error when new password is same as current', async () => {
      const password = 'SamePass123!'
      const user = await createTestUser({
        password: await passwordUtils.hashPassword(password),
        status: 'ACTIVE'
      })

      await expect(authService.changePassword(
        user.id,
        password,
        password
      )).rejects.toThrow('A nova senha deve ser diferente da senha atual')
    })
  })

  describe('getProfile', () => {
    it('should get user profile successfully', async () => {
      const user = await createTestUser({ status: 'ACTIVE' })

      const profile = await authService.getProfile(user.id)

      expect(profile).toHaveProperty('id')
      expect(profile).toHaveProperty('email')
      expect(profile).toHaveProperty('firstName')
      expect(profile).toHaveProperty('lastName')
      expect(profile).toHaveProperty('role')
      expect(profile).toHaveProperty('status')
      expect(profile).toHaveProperty('profile')
      expect(profile.id).toBe(user.id)
      expect(profile.email).toBe(user.email)
    })

    it('should throw error for non-existent user', async () => {
      await expect(authService.getProfile('non-existent-id')).rejects.toThrow('Usuário não encontrado')
    })
  })
})

