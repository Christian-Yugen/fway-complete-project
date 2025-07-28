require("dotenv").config({ path: ".env.test" });
const request = require("supertest");
const app = require("../../src/server");
const { PrismaClient } = require("@prisma/client");
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");

let prisma;

describe("Auth Routes", () => {
  let userId;
  let adminId;
  let adminAccessToken;
  let userAccessToken;
  let userRefreshToken;

  beforeAll(async () => {
    process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || "postgresql://user:password@localhost:5432/fway_test_db";
    prisma = new PrismaClient();

    // Limpa o banco de dados antes de todos os testes
    await prisma.user.deleteMany();

    // Cria um usuário admin para testes
    const hashedPasswordAdmin = await argon2.hash("admin123");
    const adminUser = await prisma.user.create({
      data: {
        email: "admin@test.com",
        password: hashedPasswordAdmin,
        role: "ADMIN",
      },
    });
    adminId = adminUser.id;
    adminAccessToken = jwt.sign({ userId: adminId, role: "ADMIN" }, process.env.JWT_SECRET || "supersecretjwtkey", { expiresIn: "1h" });

    // Cria um usuário normal para testes
    const hashedPasswordUser = await argon2.hash("user123");
    const normalUser = await prisma.user.create({
      data: {
        email: "user@test.com",
        password: hashedPasswordUser,
        role: "USER",
      },
    });
    userId = normalUser.id;
    userAccessToken = jwt.sign({ userId: userId, role: "USER" }, process.env.JWT_SECRET || "supersecretjwtkey", { expiresIn: "1h" });
    userRefreshToken = jwt.sign({ userId: userId, role: "USER" }, process.env.JWT_REFRESH_SECRET || "supersecretjwtrefreshkey", { expiresIn: "7d" });
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe("POST /auth/register", () => {
    it("deve registrar um novo usuário com sucesso", async () => {
      const res = await request(app)
        .post("/auth/register")
        .send({
          email: "newuser@test.com",
          password: "newpassword123",
        });
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty("message", "Usuário registrado com sucesso");
      expect(res.body.user).toHaveProperty("email", "newuser@test.com");
      expect(res.body.user).toHaveProperty("role", "user");
    });

    it("não deve registrar usuário com email duplicado", async () => {
      const res = await request(app)
        .post("/auth/register")
        .send({
          email: "user@test.com",
          password: "password123",
        });
      expect(res.statusCode).toEqual(500); // Prisma lança erro 500 para unique constraint
      expect(res.body.message).toContain("Unique constraint failed");
    });
  });

  describe("POST /auth/login", () => {
    it("deve fazer login com credenciais válidas", async () => {
      const res = await request(app)
        .post("/auth/login")
        .send({
          email: "user@test.com",
          password: "user123",
        });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("accessToken");
      expect(res.body).toHaveProperty("refreshToken");
      expect(res.body.user).toHaveProperty("email", "user@test.com");
    });

    it("não deve fazer login com credenciais inválidas", async () => {
      const res = await request(app)
        .post("/auth/login")
        .send({
          email: "user@test.com",
          password: "wrongpassword",
        });
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty("message", "Credenciais inválidas");
    });
  });

  describe("POST /auth/refresh-token", () => {
    it("deve gerar um novo access token com um refresh token válido", async () => {
      const res = await request(app)
        .post("/auth/refresh-token")
        .send({
          refreshToken: userRefreshToken,
        });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("accessToken");
    });

    it("não deve retornar access token com refresh token inválido", async () => {
      const res = await request(app)
        .post("/auth/refresh-token")
        .send({
          refreshToken: "invalid.token.here",
        });
      expect(res.statusCode).toEqual(403);
      expect(res.body).toHaveProperty("message", "Token de atualização inválido ou expirado");
    });
  });

  describe("GET /auth/me", () => {
    it("deve retornar informações do usuário autenticado", async () => {
      const res = await request(app)
        .get("/auth/me")
        .set("Authorization", `Bearer ${userAccessToken}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("id", userId);
      expect(res.body).toHaveProperty("email", "user@test.com");
      expect(res.body).toHaveProperty("role", "USER");
    });

    it("não deve retornar informações sem token", async () => {
      const res = await request(app).get("/auth/me");
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty("message", "Token não fornecido ou formato inválido.");
    });

    it("não deve retornar informações com token inválido", async () => {
      const res = await request(app)
        .get("/auth/me")
        .set("Authorization", `Bearer invalid.token.here`);
      expect(res.statusCode).toEqual(403);
      expect(res.body).toHaveProperty("message", "Token inválido ou expirado.");
    });
  });

  describe("GET /auth/admin-only", () => {
    it("deve permitir acesso a administradores", async () => {
      const res = await request(app)
        .get("/auth/admin-only")
        .set("Authorization", `Bearer ${adminAccessToken}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("message", "Bem-vindo, administrador!");
    });

    it("não deve permitir acesso a usuários normais", async () => {
      const res = await request(app)
        .get("/auth/admin-only")
        .set("Authorization", `Bearer ${userAccessToken}`);
      expect(res.statusCode).toEqual(403);
      expect(res.body).toHaveProperty("message", "Acesso proibido: Você não tem permissão para acessar este recurso.");
    });

    it("não deve permitir acesso sem token", async () => {
      const res = await request(app).get("/auth/admin-only");
      expect(res.statusCode).toEqual(401);
    });
  });
});


