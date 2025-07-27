const authService = require('../services/authService')
const { asyncHandler } = require('../middlewares/errorHandler')
const logger = require('../config/logger')

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Endpoints de autenticação e autorização
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar novo usuário
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: MySecurePass123!
 *               firstName:
 *                 type: string
 *                 example: João
 *               lastName:
 *                 type: string
 *                 example: Silva
 *               phone:
 *                 type: string
 *                 example: +5511999999999
 *               birthDate:
 *                 type: string
 *                 format: date
 *                 example: 1990-01-01
 *     responses:
 *       201:
 *         description: Usuário registrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Usuário registrado com sucesso
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     tokens:
 *                       type: object
 *                       properties:
 *                         accessToken:
 *                           type: string
 *                         refreshToken:
 *                           type: string
 *                         expiresIn:
 *                           type: number
 *                         tokenType:
 *                           type: string
 *                           example: Bearer
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       409:
 *         description: Email já está em uso
 */
const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body)

  res.status(201).json({
    success: true,
    message: result.message,
    data: {
      user: result.user,
      tokens: result.tokens
    }
  })
})

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login do usuário
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: MySecurePass123!
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Login realizado com sucesso
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     tokens:
 *                       type: object
 *                       properties:
 *                         accessToken:
 *                           type: string
 *                         refreshToken:
 *                           type: string
 *                         expiresIn:
 *                           type: number
 *                         tokenType:
 *                           type: string
 *                           example: Bearer
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Conta suspensa ou inativa
 */
const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body)

  res.json({
    success: true,
    message: result.message,
    data: {
      user: result.user,
      tokens: result.tokens
    }
  })
})

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Renovar access token
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: Token renovado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Token renovado com sucesso
 *                 data:
 *                   type: object
 *                   properties:
 *                     tokens:
 *                       type: object
 *                       properties:
 *                         accessToken:
 *                           type: string
 *                         expiresIn:
 *                           type: number
 *                         tokenType:
 *                           type: string
 *                           example: Bearer
 *       401:
 *         description: Refresh token inválido ou expirado
 */
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body
  const result = await authService.refreshToken(refreshToken)

  res.json({
    success: true,
    message: result.message,
    data: {
      tokens: result.tokens
    }
  })
})

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout do usuário
 *     tags: [Auth]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: Logout realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Logout realizado com sucesso
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body
  const result = await authService.logout(refreshToken, req.user.id)

  res.json({
    success: true,
    message: result.message
  })
})

/**
 * @swagger
 * /api/auth/logout-all:
 *   post:
 *     summary: Logout de todos os dispositivos
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logout realizado em todos os dispositivos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Logout realizado em 3 dispositivos
 *                 data:
 *                   type: object
 *                   properties:
 *                     tokensRevoked:
 *                       type: number
 *                       example: 3
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
const logoutAll = asyncHandler(async (req, res) => {
  const result = await authService.logoutAll(req.user.id)

  res.json({
    success: true,
    message: result.message,
    data: {
      tokensRevoked: result.tokensRevoked
    }
  })
})

/**
 * @swagger
 * /api/auth/verify-email:
 *   post:
 *     summary: Verificar email
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 example: abc123def456ghi789
 *     responses:
 *       200:
 *         description: Email verificado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Email verificado com sucesso
 *       400:
 *         description: Token inválido ou expirado
 */
const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body
  const result = await authService.verifyEmail(token)

  res.json({
    success: true,
    message: result.message
  })
})

/**
 * @swagger
 * /api/auth/resend-verification:
 *   post:
 *     summary: Reenviar email de verificação
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Email de verificação reenviado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Email de verificação reenviado com sucesso
 *       400:
 *         description: Email já verificado
 *       404:
 *         description: Usuário não encontrado
 */
const resendVerificationEmail = asyncHandler(async (req, res) => {
  const { email } = req.body
  const result = await authService.resendVerificationEmail(email)

  res.json({
    success: true,
    message: result.message
  })
})

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Solicitar reset de senha
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Instruções enviadas por email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Se o email existir, você receberá instruções para redefinir sua senha
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body
  const result = await authService.forgotPassword(email)

  res.json({
    success: true,
    message: result.message
  })
})

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Resetar senha
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *                 example: abc123def456ghi789
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *                 example: MyNewSecurePass123!
 *     responses:
 *       200:
 *         description: Senha redefinida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Senha redefinida com sucesso
 *       400:
 *         description: Token inválido ou senha muito fraca
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body
  const result = await authService.resetPassword(token, newPassword)

  res.json({
    success: true,
    message: result.message
  })
})

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: Alterar senha
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: MyCurrentPass123!
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *                 example: MyNewSecurePass123!
 *     responses:
 *       200:
 *         description: Senha alterada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Senha alterada com sucesso
 *       400:
 *         description: Senha atual incorreta ou nova senha muito fraca
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body
  const result = await authService.changePassword(req.user.id, currentPassword, newPassword)

  res.json({
    success: true,
    message: result.message
  })
})

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Obter perfil do usuário autenticado
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Dados do usuário
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
const getProfile = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.user.id)

  res.json({
    success: true,
    data: user
  })
})

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  logoutAll,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  changePassword,
  getProfile
}

