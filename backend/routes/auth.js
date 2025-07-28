const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { authenticateToken, invalidateToken } = require('../middleware/auth');
const { cache } = require('../config/redis');
const authValidators = require('../validators/auth');
const emailService = require('../services/notification/emailService');

const router = express.Router();
const prisma = new PrismaClient();

// Função para gerar tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );

  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );

  return { accessToken, refreshToken };
};

// @route   POST /api/auth/register
// @desc    Registrar novo usuário
// @access  Public
router.post('/register', authValidators.validateRegister, asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName, phone, dateOfBirth, gender } = req.body;

  // Verificar se usuário já existe
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw new AppError('Email já está em uso', 400);
  }

  // Hash da senha
  const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS) || 12);

  // Criar usuário
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      gender,
      profile: {
        create: {}
      },
      shieldProfile: {
        create: {
          currentLevel: 'BRONZE',
          totalPoints: 0,
          riskScore: 50
        }
      }
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      isEmailVerified: true,
      createdAt: true
    }
  });

  // Gerar tokens
  const { accessToken, refreshToken } = generateTokens(user.id);

  // Armazenar refresh token no Redis
  await cache.set(`refresh:${user.id}`, refreshToken, 7 * 24 * 3600); // 7 dias

  // Enviar email de verificação
  try {
    await emailService.sendVerificationEmail(user.email, user.firstName);
  } catch (error) {
    console.error('Erro ao enviar email de verificação:', error);
  }

  res.status(201).json({
    success: true,
    message: 'Usuário registrado com sucesso',
    data: {
      user,
      tokens: {
        accessToken,
        refreshToken
      }
    }
  });
}));

// @route   POST /api/auth/login
// @desc    Login do usuário
// @access  Public
router.post('/login', authValidators.validateLogin, asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Buscar usuário
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      professional: {
        select: {
          id: true,
          isVerified: true,
          isAvailable: true,
          specialties: true
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

  if (!user || !await bcrypt.compare(password, user.password)) {
    throw new AppError('Credenciais inválidas', 401);
  }

  if (!user.isActive) {
    throw new AppError('Conta desativada', 401);
  }

  // Atualizar último login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() }
  });

  // Gerar tokens
  const { accessToken, refreshToken } = generateTokens(user.id);

  // Armazenar refresh token no Redis
  await cache.set(`refresh:${user.id}`, refreshToken, 7 * 24 * 3600);

  // Remover senha da resposta
  const { password: _, ...userWithoutPassword } = user;

  res.json({
    success: true,
    message: 'Login realizado com sucesso',
    data: {
      user: userWithoutPassword,
      tokens: {
        accessToken,
        refreshToken
      }
    }
  });
}));

// @route   POST /api/auth/refresh
// @desc    Renovar token de acesso
// @access  Public
router.post('/refresh', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new AppError('Refresh token requerido', 401);
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Verificar se o refresh token está armazenado
    const storedToken = await cache.get(`refresh:${decoded.userId}`);
    
    if (!storedToken || storedToken !== refreshToken) {
      throw new AppError('Refresh token inválido', 401);
    }

    // Verificar se usuário ainda existe e está ativo
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, isActive: true }
    });

    if (!user || !user.isActive) {
      throw new AppError('Usuário não encontrado ou inativo', 401);
    }

    // Gerar novos tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user.id);

    // Atualizar refresh token no Redis
    await cache.set(`refresh:${user.id}`, newRefreshToken, 7 * 24 * 3600);

    res.json({
      success: true,
      message: 'Token renovado com sucesso',
      data: {
        tokens: {
          accessToken,
          refreshToken: newRefreshToken
        }
      }
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      throw new AppError('Refresh token inválido', 401);
    }
    throw error;
  }
}));

// @route   POST /api/auth/logout
// @desc    Logout do usuário
// @access  Private
router.post('/logout', authenticateToken, asyncHandler(async (req, res) => {
  // Invalidar access token
  await invalidateToken(req.token);
  
  // Remover refresh token
  await cache.del(`refresh:${req.user.id}`);

  res.json({
    success: true,
    message: 'Logout realizado com sucesso'
  });
}));

// @route   POST /api/auth/forgot-password
// @desc    Solicitar reset de senha
// @access  Public
router.post('/forgot-password', authValidators.validateForgotPassword, asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, firstName: true, email: true }
  });

  if (!user) {
    // Por segurança, sempre retornar sucesso
    return res.json({
      success: true,
      message: 'Se o email existir, você receberá instruções para reset de senha'
    });
  }

  // Gerar token de reset
  const resetToken = jwt.sign(
    { userId: user.id, type: 'password-reset' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  // Armazenar token no Redis por 1 hora
  await cache.set(`reset:${user.id}`, resetToken, 3600);

  // Enviar email de reset
  try {
    await emailService.sendPasswordResetEmail(user.email, user.firstName, resetToken);
  } catch (error) {
    console.error('Erro ao enviar email de reset:', error);
  }

  res.json({
    success: true,
    message: 'Se o email existir, você receberá instruções para reset de senha'
  });
}));

// @route   POST /api/auth/reset-password
// @desc    Resetar senha
// @access  Public
router.post('/reset-password', authValidators.validateResetPassword, asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.type !== 'password-reset') {
      throw new AppError('Token inválido', 400);
    }

    // Verificar se token está armazenado
    const storedToken = await cache.get(`reset:${decoded.userId}`);
    
    if (!storedToken || storedToken !== token) {
      throw new AppError('Token inválido ou expirado', 400);
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, parseInt(process.env.BCRYPT_ROUNDS) || 12);

    // Atualizar senha
    await prisma.user.update({
      where: { id: decoded.userId },
      data: { password: hashedPassword }
    });

    // Remover token de reset
    await cache.del(`reset:${decoded.userId}`);

    // Invalidar todos os tokens do usuário
    await cache.del(`refresh:${decoded.userId}`);

    res.json({
      success: true,
      message: 'Senha alterada com sucesso'
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      throw new AppError('Token inválido ou expirado', 400);
    }
    throw error;
  }
}));

// @route   POST /api/auth/verify-email
// @desc    Verificar email
// @access  Public
router.post('/verify-email', asyncHandler(async (req, res) => {
  const { token } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.type !== 'email-verification') {
      throw new AppError('Token inválido', 400);
    }

    // Atualizar status de verificação
    await prisma.user.update({
      where: { id: decoded.userId },
      data: { isEmailVerified: true }
    });

    res.json({
      success: true,
      message: 'Email verificado com sucesso'
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      throw new AppError('Token inválido ou expirado', 400);
    }
    throw error;
  }
}));

// @route   GET /api/auth/me
// @desc    Obter dados do usuário logado
// @access  Private
router.get('/me', authenticateToken, asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      avatar: true,
      dateOfBirth: true,
      gender: true,
      isEmailVerified: true,
      isPhoneVerified: true,
      lastLoginAt: true,
      createdAt: true,
      profile: true,
      professional: {
        select: {
          id: true,
          licenseNumber: true,
          specialties: true,
          isVerified: true,
          isAvailable: true,
          rating: true,
          totalReviews: true
        }
      },
      shieldProfile: {
        select: {
          id: true,
          currentLevel: true,
          totalPoints: true,
          riskScore: true,
          activeCoverages: true,
          totalProtection: true
        }
      }
    }
  });

  res.json({
    success: true,
    data: { user }
  });
}));

module.exports = router;

