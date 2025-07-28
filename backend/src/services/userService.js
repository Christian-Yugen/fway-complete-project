const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const userService = {
  async getAllUsers() {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, role: true, createdAt: true, updatedAt: true },
    });
    return users;
  },

  async getUserById(id) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, role: true, createdAt: true, updatedAt: true },
    });
    return user;
  },

  async updateUser(id, data) {
    const user = await prisma.user.update({
      where: { id },
      data: {
        email: data.email,
        role: data.role,
      },
      select: { id: true, email: true, role: true, createdAt: true, updatedAt: true },
    });
    return user;
  },

  async deleteUser(id) {
    await prisma.user.delete({ where: { id } });
    return { message: 'Usuário deletado com sucesso' };
  },
};

module.exports = userService;


