const express = require("express");
const userController = require("../controllers/userController");
const { isPrivate, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Gerenciamento de usuários
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Retorna todos os usuários (apenas para administradores)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuários
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   email:
 *                     type: string
 *                   role:
 *                     type: string
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Proibido (apenas para administradores)
 */
router.get("/users", isPrivate, authorize(["ADMIN"]), userController.getAllUsers);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Retorna um usuário pelo ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do usuário
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
 *         description: Proibido (se tentar acessar outro usuário sem permissão de admin)
 *       404:
 *         description: Usuário não encontrado
 */
router.get("/users/:id", isPrivate, authorize(["ADMIN", "USER"]), (req, res, next) => {
  // Se o usuário for USER e o ID na requisição não for o seu próprio, proíbe o acesso
  if (req.user.role === "USER" && req.user.userId !== req.params.id) {
    return res.status(403).json({ message: "Acesso proibido: Você não tem permissão para acessar este recurso." });
  }
  next(); // Continua para o userController.getUserById
}, userController.getUserById);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Atualiza um usuário pelo ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Proibido (se tentar atualizar outro usuário sem permissão de admin)
 *       404:
 *         description: Usuário não encontrado
 */
router.put("/users/:id", isPrivate, authorize(["ADMIN", "USER"]), (req, res, next) => {
  // Se o usuário for USER e o ID na requisição não for o seu próprio, proíbe o acesso
  if (req.user.role === "USER" && req.user.userId !== req.params.id) {
    return res.status(403).json({ message: "Acesso proibido: Você não tem permissão para acessar este recurso." });
  }
  next(); // Continua para o userController.updateUser
}, userController.updateUser);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Deleta um usuário pelo ID (apenas para administradores)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Usuário deletado com sucesso
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Proibido (apenas para administradores)
 *       404:
 *         description: Usuário não encontrado
 */
router.delete("/users/:id", isPrivate, authorize(["ADMIN"]), userController.deleteUser);

module.exports = router;


