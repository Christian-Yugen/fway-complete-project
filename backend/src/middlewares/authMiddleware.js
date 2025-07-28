const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/jwt");

const isPrivate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token não fornecido ou formato inválido." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded; // Adiciona o payload do token ao objeto req
    next();
  } catch (error) {
    return res.status(403).json({ message: "Token inválido ou expirado." });
  }
};

const authorize = (roles = []) => {
  if (typeof roles === "string") {
    roles = [roles];
  }

  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: "Acesso não autorizado: Papel do usuário não definido." });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Acesso proibido: Você não tem permissão para acessar este recurso." });
    }
    next();
  };
};

module.exports = { isPrivate, authorize };


