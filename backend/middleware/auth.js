const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { cache } = require('../config/redis');

const prisma = new PrismaClient();

// Middleware de autenticação JWT
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acesso requerido'
      });
    }

    // Verificar se o token está na blacklist
    const isBlacklisted = await cache.exists(`blacklist:${token}`);
    if (isBlacklisted) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }

    // Verificar e decodificar o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar usuário no cache primeiro
    let user = await cache.get(`user:${decoded.userId}`);
    
    if (!user) {
      // Se não estiver no cache, buscar no banco
      user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isActive: true,
          isEmailVerified: true,
          professional: {
            select: {
              id: true,
              isVerified: true,
              isAvailable: true
            }
          },
          shieldProfile: {
            select: {
              id: true,
              currentLevel: true,
              riskScore: true
            }
          }
        }
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      // Armazenar no cache por 1 hora
      await cache.set(`user:${decoded.userId}`, user, 3600);
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Conta desativada'
      });
    }

    // Adicionar informações do usuário à requisição
    req.user = user;
    req.token = token;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }

    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Middleware para verificar se é profissional
const requireProfessional = async (req, res, next) => {
  try {
    if (!req.user.professional) {
      return res.status(403).json({
        success: false,
        message: 'Acesso restrito a profissionais'
      });
    }

    if (!req.user.professional.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Profissional não verificado'
      });
    }

    next();
  } catch (error) {
    console.error('Professional middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Middleware para verificar se é admin
const requireAdmin = async (req, res, next) => {
  try {
    // Verificar se o usuário tem role de admin (implementar conforme necessário)
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    
    if (!adminEmails.includes(req.user.email)) {
      return res.status(403).json({
        success: false,
        message: 'Acesso restrito a administradores'
      });
    }

    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Middleware opcional de autenticação (não falha se não houver token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    let user = await cache.get(`user:${decoded.userId}`);
    
    if (!user) {
      user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isActive: true,
          professional: {
            select: {
              id: true,
              isVerified: true,
              isAvailable: true
            }
          }
        }
      });

      if (user && user.isActive) {
        await cache.set(`user:${decoded.userId}`, user, 3600);
      }
    }

    req.user = user && user.isActive ? user : null;
    req.token = token;
    
    next();
  } catch (error) {
    // Em caso de erro, continuar sem autenticação
    req.user = null;
    next();
  }
};

// Função para invalidar token (logout)
const invalidateToken = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
    
    if (expiresIn > 0) {
      await cache.set(`blacklist:${token}`, true, expiresIn);
    }
    
    // Limpar cache do usuário
    await cache.del(`user:${decoded.userId}`);
    
    return true;
  } catch (error) {
    console.error('Token invalidation error:', error);
    return false;
  }
};

module.exports = {
  authenticateToken,
  requireProfessional,
  requireAdmin,
  optionalAuth,
  invalidateToken
};

