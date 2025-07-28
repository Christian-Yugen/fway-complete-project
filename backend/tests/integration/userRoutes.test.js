require("dotenv").config({ path: ".env.test" });
const request = require("supertest");
const app = require("../../src/server");
const { PrismaClient } = require("@prisma/client");
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");

let prisma;

describe("User Routes", () => {
  let adminUser;
  let normalUser;
  let adminAccessToken;
  let normalUserAccessToken;

  beforeAll(async () => {
    process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || "postgresql://user:password@localhost:5432/fway_test_db";
    prisma = new PrismaClient();

    await prisma.user.deleteMany();

    const hashedPasswordAdmin = await argon2.hash("admin123");
    adminUser = await prisma.user.create({
      data: {
        email: "admin-user-routes@test.com",
        password: hashedPasswordAdmin,
        role: "ADMIN",
      },
    });
    adminAccessToken = jwt.sign({ userId: adminUser.id, role: adminUser.role }, process.env.JWT_SECRET || "supersecretjwtkey", { expiresIn: "1h" });

    const hashedPasswordUser = await argon2.hash("user123");
    normalUser = await prisma.user.create({
      data: {
        email: "normal-user-routes@test.com",
        password: hashedPasswordUser,
        role: "USER",
      },
    });
    normalUserAccessToken = jwt.sign({ userId: normalUser.id, role: normalUser.role }, process.env.JWT_SECRET || "supersecretjwtkey", { expiresIn: "1h" });
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe("GET /users", () => {
    it("deve retornar todos os usuários para um administrador", async () => {
      const res = await request(app)
        .get("/users")
        .set("Authorization", `Bearer ${adminAccessToken}`);

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
      expect(res.body).toEqual(expect.arrayContaining([
        expect.objectContaining({ email: adminUser.email, role: adminUser.role }),
        expect.objectContaining({ email: normalUser.email, role: normalUser.role }),
      ]));
    });

    it("não deve retornar usuários para um usuário normal", async () => {
      const res = await request(app)
        .get("/users")
        .set("Authorization", `Bearer ${normalUserAccessToken}`);

      expect(res.statusCode).toEqual(403);
      expect(res.body).toHaveProperty("message", "Acesso proibido: Você não tem permissão para acessar este recurso.");
    });

    it("não deve retornar usuários sem autenticação", async () => {
      const res = await request(app).get("/users");

      expect(res.statusCode).toEqual(401);
    });
  });

  describe("GET /users/:id", () => {
    it("deve retornar um usuário pelo ID para um administrador", async () => {
      const res = await request(app)
        .get(`/users/${normalUser.id}`)
        .set("Authorization", `Bearer ${adminAccessToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("email", normalUser.email);
    });

    it("deve retornar o próprio usuário pelo ID para um usuário normal", async () => {
      const res = await request(app)
        .get(`/users/${normalUser.id}`)
        .set("Authorization", `Bearer ${normalUserAccessToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("email", normalUser.email);
    });

    it("não deve retornar outro usuário pelo ID para um usuário normal", async () => {
      const res = await request(app)
        .get(`/users/${adminUser.id}`)
        .set("Authorization", `Bearer ${normalUserAccessToken}`);

      expect(res.statusCode).toEqual(403);
    });

    it("deve retornar 404 para usuário não encontrado", async () => {
      const res = await request(app)
        .get("/users/nonexistentid")
        .set("Authorization", `Bearer ${adminAccessToken}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty("message", "Usuário não encontrado");
    });
  });

  describe("PUT /users/:id", () => {
    it("deve atualizar um usuário pelo ID para um administrador", async () => {
      const res = await request(app)
        .put(`/users/${normalUser.id}`)
        .set("Authorization", `Bearer ${adminAccessToken}`)
        .send({ email: "updated-normal-user@test.com", role: "ADMIN" });

      expect(res.statusCode).toEqual(200);
      expect(res.body.user).toHaveProperty("email", "updated-normal-user@test.com");
      expect(res.body.user).toHaveProperty("role", "ADMIN");

      // Atualiza o usuário normal para o próximo teste
      normalUser.email = "updated-normal-user@test.com";
      normalUser.role = "ADMIN";
    });

    it("deve permitir que um usuário normal atualize seu próprio perfil", async () => {
      const res = await request(app)
        .put(`/users/${adminUser.id}`)
        .set("Authorization", `Bearer ${adminAccessToken}`)
        .send({ email: "updated-admin-user@test.com" });

      expect(res.statusCode).toEqual(200);
      expect(res.body.user).toHaveProperty("email", "updated-admin-user@test.com");

      // Atualiza o usuário admin para o próximo teste
      adminUser.email = "updated-admin-user@test.com";
    });

    it("não deve permitir que um usuário normal atualize outro perfil", async () => {
      const res = await request(app)
        .put(`/users/${adminUser.id}`)
        .set("Authorization", `Bearer ${normalUserAccessToken}`)
        .send({ email: "another-updated-user@test.com" });

      expect(res.statusCode).toEqual(403);
    });
  });

  describe("DELETE /users/:id", () => {
    it("deve deletar um usuário pelo ID para um administrador", async () => {
      const res = await request(app)
        .delete(`/users/${normalUser.id}`)
        .set("Authorization", `Bearer ${adminAccessToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("message", "Usuário deletado com sucesso");

      const checkUser = await prisma.user.findUnique({ where: { id: normalUser.id } });
      expect(checkUser).toBeNull();
    });

    it("não deve deletar um usuário para um usuário normal", async () => {
      const res = await request(app)
        .delete(`/users/${adminUser.id}`)
        .set("Authorization", `Bearer ${normalUserAccessToken}`);

      expect(res.statusCode).toEqual(403);
    });
  });
});


