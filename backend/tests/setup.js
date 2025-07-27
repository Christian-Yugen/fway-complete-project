const { PrismaClient } = require('@prisma/client')

// Configurar variáveis de ambiente para testes
process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only'
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-for-testing-only'
process.env.JWT_EXPIRES_IN = '15m'
process.env.JWT_REFRESH_EXPIRES_IN = '7d'
process.env.DATABASE_URL = 'file:./test.db'

// Instância do Prisma para testes
let prisma

// Setup global antes de todos os testes
beforeAll(async () => {
  // Criar nova instância do Prisma para testes
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  })

  // Configurar instância global para uso nos testes
  global.prisma = prisma

  // Conectar ao banco de dados de teste
  await prisma.$connect()

  // Aplicar migrações
  try {
    await prisma.$executeRaw`PRAGMA foreign_keys = OFF;`
    
    // Criar tabelas se não existirem
    await createTestTables()
    
    await prisma.$executeRaw`PRAGMA foreign_keys = ON;`
  } catch (error) {
    console.warn('Warning setting up test database:', error.message)
  }

  // Limpar banco de dados antes dos testes
  await cleanDatabase()
})

// Cleanup após todos os testes
afterAll(async () => {
  // Limpar banco de dados após os testes
  await cleanDatabase()
  
  // Desconectar do banco
  await prisma.$disconnect()
})

// Limpar banco antes de cada teste
beforeEach(async () => {
  await cleanDatabase()
})

// Função para criar tabelas de teste
async function createTestTables() {
  try {
    // Criar tabelas básicas para testes
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        phone TEXT,
        avatar TEXT,
        birthDate DATETIME,
        role TEXT NOT NULL DEFAULT 'USER',
        status TEXT NOT NULL DEFAULT 'PENDING_VERIFICATION',
        emailVerified BOOLEAN NOT NULL DEFAULT false,
        emailVerificationToken TEXT,
        passwordResetToken TEXT,
        passwordResetExpires DATETIME,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id TEXT PRIMARY KEY,
        userId TEXT UNIQUE NOT NULL,
        cpf TEXT,
        address TEXT,
        city TEXT,
        state TEXT,
        zipCode TEXT,
        country TEXT DEFAULT 'Brasil',
        language TEXT DEFAULT 'pt-BR',
        timezone TEXT DEFAULT 'America/Sao_Paulo',
        emailNotifications BOOLEAN DEFAULT true,
        smsNotifications BOOLEAN DEFAULT false,
        pushNotifications BOOLEAN DEFAULT true,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      );
    `

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id TEXT PRIMARY KEY,
        token TEXT UNIQUE NOT NULL,
        userId TEXT NOT NULL,
        expiresAt DATETIME NOT NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      );
    `

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS professionals (
        id TEXT PRIMARY KEY,
        userId TEXT UNIQUE NOT NULL,
        type TEXT NOT NULL,
        specialization TEXT NOT NULL,
        license TEXT UNIQUE NOT NULL,
        experience INTEGER NOT NULL,
        address TEXT NOT NULL,
        city TEXT NOT NULL,
        state TEXT NOT NULL,
        zipCode TEXT NOT NULL,
        latitude REAL,
        longitude REAL,
        isActive BOOLEAN DEFAULT true,
        isVerified BOOLEAN DEFAULT false,
        consultationFee REAL,
        workingHours TEXT,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id)
      );
    `

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        userId TEXT,
        action TEXT NOT NULL,
        resource TEXT NOT NULL,
        details TEXT,
        ipAddress TEXT,
        userAgent TEXT,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `
  } catch (error) {
    console.warn('Warning creating test tables:', error.message)
  }
}

// Função para limpar o banco de dados
async function cleanDatabase() {
  try {
    const prisma = global.prisma
    if (!prisma) return
    
    // Ordem de limpeza respeitando foreign keys
    const tablenames = [
      'refresh_tokens',
      'professionals',
      'user_profiles',
      'users',
      'audit_logs'
    ]

    // Desabilitar verificação de foreign keys temporariamente
    await prisma.$executeRaw`PRAGMA foreign_keys = OFF;`

    // Limpar cada tabela
    for (const tablename of tablenames) {
      try {
        await prisma.$executeRawUnsafe(`DELETE FROM ${tablename};`)
      } catch (error) {
        // Ignorar erros de tabelas que não existem
        if (!error.message.includes("no such table")) {
          console.warn(`Warning cleaning table ${tablename}:`, error.message)
        }
      }
    }

    // Reabilitar verificação de foreign keys
    await prisma.$executeRaw`PRAGMA foreign_keys = ON;`
  } catch (error) {
    console.warn('Warning cleaning database:', error.message)
  }
}

// Função para criar usuário de teste
async function createTestUser(userData = {}) {
  const crypto = require('crypto')
  const prisma = global.prisma
  if (!prisma) throw new Error('Prisma not initialized')
  
  const defaultUser = {
    id: crypto.randomUUID(),
    email: 'test@example.com',
    password: '$argon2id$v=19$m=65536,t=3,p=4$testhashedpassword', // senha: 'password123'
    firstName: 'Test',
    lastName: 'User',
    role: 'USER',
    status: 'ACTIVE',
    emailVerified: true
  }

  const userId = userData.id || crypto.randomUUID()

  try {
    // Criar usuário usando Prisma create
    const user = await prisma.user.create({
      data: {
        id: userId,
        email: userData.email || defaultUser.email,
        password: userData.password || defaultUser.password,
        firstName: userData.firstName || defaultUser.firstName,
        lastName: userData.lastName || defaultUser.lastName,
        phone: userData.phone || null,
        role: userData.role || defaultUser.role,
        status: userData.status || defaultUser.status,
        emailVerified: userData.emailVerified !== undefined ? userData.emailVerified : defaultUser.emailVerified,
        emailVerificationToken: userData.emailVerificationToken || null,
        profile: {
          create: {
            language: 'pt-BR',
            timezone: 'America/Sao_Paulo'
          }
        }
      },
      include: {
        profile: true
      }
    })

    return user
  } catch (error) {
    // Fallback para SQL direto se Prisma falhar
    await prisma.$executeRaw`
      INSERT OR IGNORE INTO users (id, email, password, firstName, lastName, phone, role, status, emailVerified, emailVerificationToken, createdAt, updatedAt)
      VALUES (${userId}, ${userData.email || defaultUser.email}, ${userData.password || defaultUser.password}, 
              ${userData.firstName || defaultUser.firstName}, ${userData.lastName || defaultUser.lastName}, 
              ${userData.phone || null}, ${userData.role || defaultUser.role}, ${userData.status || defaultUser.status}, 
              ${userData.emailVerified !== undefined ? userData.emailVerified : defaultUser.emailVerified}, 
              ${userData.emailVerificationToken || null}, datetime('now'), datetime('now'))
    `

    return {
      id: userId,
      email: userData.email || defaultUser.email,
      firstName: userData.firstName || defaultUser.firstName,
      lastName: userData.lastName || defaultUser.lastName,
      role: userData.role || defaultUser.role,
      status: userData.status || defaultUser.status,
      emailVerified: userData.emailVerified !== undefined ? userData.emailVerified : defaultUser.emailVerified,
      createdAt: new Date()
    }
  }
}

// Função para criar admin de teste
async function createTestAdmin(userData = {}) {
  return createTestUser({
    email: 'admin@example.com',
    role: 'ADMIN',
    ...userData
  })
}

// Função para criar profissional de teste
async function createTestProfessional(userData = {}) {
  const user = await createTestUser({
    email: 'professional@example.com',
    role: 'PROFESSIONAL',
    ...userData
  })

  const crypto = require('crypto')
  const professionalId = crypto.randomUUID()

  await prisma.$executeRaw`
    INSERT INTO professionals (id, userId, type, specialization, license, experience, address, city, state, zipCode, isActive, isVerified, consultationFee, createdAt, updatedAt)
    VALUES (${professionalId}, ${user.id}, 'DOCTOR', 'Cardiologia', 'CRM123456', 5, 'Rua das Flores, 123', 'São Paulo', 'SP', '01234567', true, true, 150.00, datetime('now'), datetime('now'))
  `

  const professional = {
    id: professionalId,
    userId: user.id,
    type: 'DOCTOR',
    specialization: 'Cardiologia',
    license: 'CRM123456',
    experience: 5,
    address: 'Rua das Flores, 123',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01234567',
    isActive: true,
    isVerified: true,
    consultationFee: 150.00
  }

  return { user, professional }
}

// Função para gerar token JWT de teste
function generateTestToken(user) {
  const jwt = require('jsonwebtoken')
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '1h',
      issuer: 'fway-backend',
      audience: 'fway-app'
    }
  )
}

// Função para fazer requisição autenticada
function authenticatedRequest(request, token) {
  return request.set('Authorization', `Bearer ${token}`)
}

// Mock de console para testes silenciosos
const originalConsole = { ...console }

function silenceConsole() {
  console.log = jest.fn()
  console.info = jest.fn()
  console.warn = jest.fn()
  console.error = jest.fn()
}

function restoreConsole() {
  console.log = originalConsole.log
  console.info = originalConsole.info
  console.warn = originalConsole.warn
  console.error = originalConsole.error
}

// Timeout padrão para testes
jest.setTimeout(30000)

// Exportar utilitários para uso nos testes
global.testUtils = {
  get prisma() { return global.prisma },
  cleanDatabase,
  createTestUser,
  createTestAdmin,
  createTestProfessional,
  generateTestToken,
  authenticatedRequest,
  silenceConsole,
  restoreConsole
}

module.exports = {
  get prisma() { return global.prisma },
  cleanDatabase,
  createTestUser,
  createTestAdmin,
  createTestProfessional,
  generateTestToken,
  authenticatedRequest,
  silenceConsole,
  restoreConsole
}

