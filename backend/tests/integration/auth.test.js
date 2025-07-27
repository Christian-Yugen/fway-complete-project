const getPrisma = () => global.prisma
const request = require('supertest')
const configureExpress = require('../../src/config/express')
const passwordUtils = require('../../src/utils/password')

describe('Auth Routes Integration', () => {
  let app
  const { prisma, createTestUser, generateTestToken, authenticatedRequest, silenceConsole, restoreConsole } = global.testUtils

  beforeAll(async () => {
    app = configureExpress()
    silenceConsole()
  })

  afterAll(() => {
    restoreConsole()
  })

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'SecurePass123!',
        firstName: 'New',
        lastName: 'User',
        phone: '+5511999999999'
      }

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201)

      expect(response.body.success).toBe(true)
      expect(response.body.message).toContain('registrado com sucesso')
      expect(response.body.data).toHaveProperty('user')
      expect(response.body.data).toHaveProperty('tokens')
      expect(response.body.data.user.email).toBe(userData.email)
      expect(response.body.data.user.firstName).toBe(userData.firstName)
      expect(response.body.data.user.lastName).toBe(userData.lastName)
      expect(response.body.data.tokens).toHaveProperty('accessToken')
      expect(response.body.data.tokens).toHaveProperty('refreshToken')
    })

    it('should return 400 for invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'SecurePass123!',
        firstName: 'Test',
        lastName: 'User'
      }

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.code).toBe('VALIDATION_ERROR')
    })

    it('should return 400 for weak password', async () => {
      const userData = {
        email: 'weakpass@example.com',
        password: '123',
        firstName: 'Test',
        lastName: 'User'
      }

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.code).toBe('VALIDATION_ERROR')
    })

    it('should return 409 for existing email', async () => {
      const email = 'existing@example.com'
      await createTestUser({ email })

      const userData = {
        email,
        password: 'SecurePass123!',
        firstName: 'Test',
        lastName: 'User'
      }

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(409)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('já existe')
    })

    it('should return 400 for missing required fields', async () => {
      const userData = {
        email: 'incomplete@example.com'
        // missing password, firstName, lastName
      }

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.code).toBe('VALIDATION_ERROR')
      expect(response.body.errors).toBeDefined()
    })
  })

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const password = 'SecurePass123!'
      const hashedPassword = await passwordUtils.hashPassword(password)
      
      const user = await createTestUser({
        email: 'login@example.com',
        password: hashedPassword,
        status: 'ACTIVE'
      })

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password
        })
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.message).toContain('Login realizado com sucesso')
      expect(response.body.data).toHaveProperty('user')
      expect(response.body.data).toHaveProperty('tokens')
      expect(response.body.data.user.id).toBe(user.id)
      expect(response.body.data.tokens).toHaveProperty('accessToken')
      expect(response.body.data.tokens).toHaveProperty('refreshToken')
    })

    it('should return 401 for invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'anypassword'
        })
        .expect(401)

      expect(response.body.success).toBe(false)
      expect(response.body.code).toBe('UNAUTHORIZED')
    })

    it('should return 401 for invalid password', async () => {
      const user = await createTestUser({
        email: 'wrongpass@example.com',
        password: await passwordUtils.hashPassword('correctpassword'),
        status: 'ACTIVE'
      })

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: 'wrongpassword'
        })
        .expect(401)

      expect(response.body.success).toBe(false)
      expect(response.body.code).toBe('UNAUTHORIZED')
    })

    it('should return 403 for suspended account', async () => {
      const password = 'SecurePass123!'
      const user = await createTestUser({
        email: 'suspended@example.com',
        password: await passwordUtils.hashPassword(password),
        status: 'SUSPENDED'
      })

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password
        })
        .expect(403)

      expect(response.body.success).toBe(false)
      expect(response.body.code).toBe('ACCOUNT_SUSPENDED')
    })

    it('should return 400 for invalid input format', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid-email',
          password: 'pass'
        })
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.code).toBe('VALIDATION_ERROR')
    })
  })

  describe('POST /api/auth/refresh', () => {
    it('should refresh token successfully', async () => {
      const user = await createTestUser({ status: 'ACTIVE' })
      
      // Primeiro fazer login para obter tokens
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: 'password123' // senha padrão do createTestUser
        })

      const { refreshToken } = loginResponse.body.data.tokens

      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.message).toContain('renovado com sucesso')
      expect(response.body.data).toHaveProperty('tokens')
      expect(response.body.data.tokens).toHaveProperty('accessToken')
      expect(response.body.data.tokens).toHaveProperty('expiresIn')
    })

    it('should return 401 for invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401)

      expect(response.body.success).toBe(false)
    })

    it('should return 400 for missing refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({})
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.code).toBe('VALIDATION_ERROR')
    })
  })

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const user = await createTestUser({ status: 'ACTIVE' })
      const token = generateTestToken(user)

      const response = await authenticatedRequest(request(app), token)
        .post('/api/auth/logout')
        .send({})
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.message).toContain('Logout realizado com sucesso')
    })

    it('should return 401 for unauthenticated request', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .send({})
        .expect(401)

      expect(response.body.success).toBe(false)
      expect(response.body.code).toBe('MISSING_TOKEN')
    })
  })

  describe('POST /api/auth/logout-all', () => {
    it('should logout from all devices', async () => {
      const user = await createTestUser({ status: 'ACTIVE' })
      const token = generateTestToken(user)

      const response = await authenticatedRequest(request(app), token)
        .post('/api/auth/logout-all')
        .send({})
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.message).toContain('Logout realizado')
      expect(response.body.data).toHaveProperty('tokensRevoked')
    })
  })

  describe('POST /api/auth/verify-email', () => {
    it('should verify email successfully', async () => {
      const user = await createTestUser({
        emailVerified: false,
        emailVerificationToken: 'valid-token',
        status: 'PENDING_VERIFICATION'
      })

      const response = await request(app)
        .post('/api/auth/verify-email')
        .send({ token: 'valid-token' })
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.message).toContain('verificado com sucesso')

      // Verificar se o usuário foi atualizado no banco
      const updatedUser = await getPrisma().user.findUnique({
        where: { id: user.id }
      })
      expect(updatedUser.emailVerified).toBe(true)
      expect(updatedUser.status).toBe('ACTIVE')
    })

    it('should return 400 for invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/verify-email')
        .send({ token: 'invalid-token' })
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('inválido ou expirado')
    })
  })

  describe('POST /api/auth/change-password', () => {
    it('should change password successfully', async () => {
      const currentPassword = 'CurrentPass123!'
      const newPassword = 'NewSecurePass123!'
      
      const user = await createTestUser({
        password: await passwordUtils.hashPassword(currentPassword),
        status: 'ACTIVE'
      })
      const token = generateTestToken(user)

      const response = await authenticatedRequest(request(app), token)
        .post('/api/auth/change-password')
        .send({
          currentPassword,
          newPassword
        })
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.message).toContain('alterada com sucesso')
    })

    it('should return 400 for incorrect current password', async () => {
      const user = await createTestUser({
        password: await passwordUtils.hashPassword('CorrectPass123!'),
        status: 'ACTIVE'
      })
      const token = generateTestToken(user)

      const response = await authenticatedRequest(request(app), token)
        .post('/api/auth/change-password')
        .send({
          currentPassword: 'WrongPass123!',
          newPassword: 'NewSecurePass123!'
        })
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.code).toBe('INVALID_PASSWORD')
    })

    it('should return 401 for unauthenticated request', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .send({
          currentPassword: 'CurrentPass123!',
          newPassword: 'NewSecurePass123!'
        })
        .expect(401)

      expect(response.body.success).toBe(false)
      expect(response.body.code).toBe('MISSING_TOKEN')
    })
  })

  describe('GET /api/auth/me', () => {
    it('should get user profile successfully', async () => {
      const user = await createTestUser({ status: 'ACTIVE' })
      const token = generateTestToken(user)

      const response = await authenticatedRequest(request(app), token)
        .get('/api/auth/me')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveProperty('id')
      expect(response.body.data).toHaveProperty('email')
      expect(response.body.data).toHaveProperty('firstName')
      expect(response.body.data).toHaveProperty('lastName')
      expect(response.body.data).toHaveProperty('role')
      expect(response.body.data).toHaveProperty('profile')
      expect(response.body.data.id).toBe(user.id)
      expect(response.body.data.email).toBe(user.email)
    })

    it('should return 401 for unauthenticated request', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401)

      expect(response.body.success).toBe(false)
      expect(response.body.code).toBe('MISSING_TOKEN')
    })

    it('should return 401 for invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401)

      expect(response.body.success).toBe(false)
      expect(response.body.code).toBe('INVALID_TOKEN')
    })
  })

  describe('Rate Limiting', () => {
    it('should apply rate limiting to auth routes', async () => {
      const userData = {
        email: 'ratelimit@example.com',
        password: 'wrongpassword'
      }

      // Fazer muitas requisições rapidamente
      const promises = []
      for (let i = 0; i < 10; i++) {
        promises.push(
          request(app)
            .post('/api/auth/login')
            .send(userData)
        )
      }

      const responses = await Promise.all(promises)
      
      // Pelo menos uma deve retornar 429 (rate limit)
      const rateLimitedResponses = responses.filter(res => res.status === 429)
      expect(rateLimitedResponses.length).toBeGreaterThan(0)
    }, 10000)
  })
})

