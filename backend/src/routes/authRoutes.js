const express = require("express");
const authController = require("../controllers/authController");
const { isPrivate, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Gerenciamento de autenticação e usuários
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registra um novo usuário
 *     tags: [Auth]
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
 *                 description: Email do usuário
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Senha do usuário (mínimo 6 caracteres)
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *                 description: "Papel do usuário (padrão: user)"
 *     responses:
 *       201:
 *         description: Usuário registrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *       400:
 *         description: Erro de validação ou usuário já existe
 *       500:
 *         description: Erro interno do servidor
 */
router.post("/register", authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Autentica um usuário e retorna tokens de acesso e atualização
 *     tags: [Auth]
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
 *                 description: Email do usuário
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Senha do usuário
 *     responses:
 *       200:
 *         description: Autenticação bem-sucedida
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       401:
 *         description: Credenciais inválidas
 *       500:
 *         description: Erro interno do servidor
 */
router.post("/login", authController.login);

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: Atualiza o token de acesso usando um token de atualização
 *     tags: [Auth]
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
 *                 description: Token de atualização
 *     responses:
 *       200:
 *         description: Token de acesso atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *       401:
 *         description: Token de atualização inválido ou expirado
 *       500:
 *         description: Erro interno do servidor
 */
router.post("/refresh-token", authController.refreshToken);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Obtém informações do usuário autenticado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Informações do usuário
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 email:
 *                   type: string
 *                 role:
 *                   type: string
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Proibido
 */
router.get("/me", isPrivate, (req, res) => {
  res.status(200).json({ id: req.user.userId, email: req.user.email, role: req.user.role });
});

/**
 * @swagger
 * /auth/admin-only:
 *   get:
 *     summary: Rota de exemplo acessível apenas por administradores
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Acesso concedido a administradores
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Proibido (apenas para administradores)
 */
router.get("/admin-only", isPrivate, authorize(["ADMIN"]), (req, res) => {
  res.status(200).json({ message: "Bem-vindo, administrador!" });
});

module.exports = router;


