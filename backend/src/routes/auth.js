const express = require('express')
const router = express.Router()

const authController = require('../controllers/authController')
const { authenticate } = require('../middlewares/auth')
const { validators, sanitize } = require('../middlewares/validation')

// Middleware de sanitização para todas as rotas
router.use(sanitize)

/**
 * Rotas públicas (não requerem autenticação)
 */

// Registro de usuário
router.post('/register', 
  validators.register,
  authController.register
)

// Login
router.post('/login',
  validators.login,
  authController.login
)

// Renovar token
router.post('/refresh',
  authController.refreshToken
)

// Verificar email
router.post('/verify-email',
  authController.verifyEmail
)

// Reenviar email de verificação
router.post('/resend-verification',
  authController.resendVerificationEmail
)

// Esqueci minha senha
router.post('/forgot-password',
  authController.forgotPassword
)

// Resetar senha
router.post('/reset-password',
  validators.resetPassword,
  authController.resetPassword
)

/**
 * Rotas privadas (requerem autenticação)
 */

// Logout
router.post('/logout',
  authenticate,
  authController.logout
)

// Logout de todos os dispositivos
router.post('/logout-all',
  authenticate,
  authController.logoutAll
)

// Alterar senha
router.post('/change-password',
  authenticate,
  validators.changePassword,
  authController.changePassword
)

// Obter perfil do usuário autenticado
router.get('/me',
  authenticate,
  authController.getProfile
)

module.exports = router

