const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { cache } = require('../config/redis');
const paymentValidators = require('../validators/payment');
const { createNotification } = require('../services/notification/notificationService');
const { sendEmail } = require('../services/notification/emailService');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const router = express.Router();
const prisma = new PrismaClient();

// ===== CARTEIRA DIGITAL =====

// @route   GET /api/payments/wallet
// @desc    Obter carteira digital do usuário
// @access  Private
router.get('/wallet', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Buscar ou criar carteira
  let wallet = await prisma.wallet.findUnique({
    where: { userId },
    include: {
      transactions: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          booking: {
            include: {
              service: { select: { name: true } },
              professional: {
                include: {
                  user: { select: { firstName: true, lastName: true } }
                }
              }
            }
          }
        }
      }
    }
  });

  if (!wallet) {
    wallet = await prisma.wallet.create({
      data: {
        userId,
        balance: 0,
        currency: 'BRL',
        isActive: true
      },
      include: {
        transactions: true
      }
    });
  }

  // Estatísticas da carteira
  const stats = await getWalletStats(userId);

  res.json({
    success: true,
    data: {
      wallet: {
        ...wallet,
        stats
      }
    }
  });
}));

// @route   POST /api/payments/wallet/add-funds
// @desc    Adicionar fundos à carteira
// @access  Private
router.post('/wallet/add-funds', authenticateToken, paymentValidators.validateAddFunds, asyncHandler(async (req, res) => {
  const { amount, paymentMethodId, currency = 'BRL' } = req.body;
  const userId = req.user.id;

  // Verificar método de pagamento
  const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
  
  if (paymentMethod.customer !== req.user.stripeCustomerId) {
    throw new AppError('Método de pagamento inválido', 400);
  }

  // Criar Payment Intent no Stripe
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Converter para centavos
    currency: currency.toLowerCase(),
    customer: req.user.stripeCustomerId,
    payment_method: paymentMethodId,
    confirmation_method: 'manual',
    confirm: true,
    metadata: {
      type: 'wallet_funding',
      userId,
      amount: amount.toString()
    }
  });

  // Criar transação pendente
  const transaction = await prisma.walletTransaction.create({
    data: {
      walletId: (await getOrCreateWallet(userId)).id,
      type: 'DEPOSIT',
      amount,
      currency,
      status: 'PENDING',
      description: 'Adição de fundos à carteira',
      stripePaymentIntentId: paymentIntent.id,
      metadata: JSON.stringify({
        paymentMethodId,
        paymentIntent: paymentIntent.id
      })
    }
  });

  // Se pagamento foi bem-sucedido, processar
  if (paymentIntent.status === 'succeeded') {
    await processSuccessfulPayment(transaction.id, paymentIntent);
  }

  res.json({
    success: true,
    message: 'Fundos adicionados com sucesso',
    data: {
      transaction,
      paymentIntent: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        clientSecret: paymentIntent.client_secret
      }
    }
  });
}));

// @route   POST /api/payments/wallet/withdraw
// @desc    Sacar fundos da carteira
// @access  Private
router.post('/wallet/withdraw', authenticateToken, paymentValidators.validateWithdraw, asyncHandler(async (req, res) => {
  const { amount, bankAccount, pixKey } = req.body;
  const userId = req.user.id;

  const wallet = await prisma.wallet.findUnique({
    where: { userId }
  });

  if (!wallet || wallet.balance < amount) {
    throw new AppError('Saldo insuficiente', 400);
  }

  // Verificar limite mínimo de saque
  if (amount < 10) {
    throw new AppError('Valor mínimo de saque é R$ 10,00', 400);
  }

  // Criar transação de saque
  const transaction = await prisma.walletTransaction.create({
    data: {
      walletId: wallet.id,
      type: 'WITHDRAWAL',
      amount: -amount,
      currency: 'BRL',
      status: 'PENDING',
      description: 'Saque de fundos da carteira',
      metadata: JSON.stringify({
        bankAccount,
        pixKey,
        withdrawalMethod: pixKey ? 'PIX' : 'BANK_TRANSFER'
      })
    }
  });

  // Atualizar saldo (reservar valor)
  await prisma.wallet.update({
    where: { id: wallet.id },
    data: {
      balance: { decrement: amount },
      reservedBalance: { increment: amount }
    }
  });

  // Processar saque (simulado - em produção seria integração com banco)
  await processWithdrawal(transaction.id);

  res.json({
    success: true,
    message: 'Saque solicitado com sucesso',
    data: { transaction }
  });
}));

// ===== PAGAMENTOS DE AGENDAMENTOS =====

// @route   POST /api/payments/bookings/:bookingId/pay
// @desc    Pagar agendamento
// @access  Private
router.post('/bookings/:bookingId/pay', authenticateToken, paymentValidators.validateBookingPayment, asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const { paymentMethod, paymentMethodId, useWallet = false } = req.body;
  const userId = req.user.id;

  // Verificar agendamento
  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      userId,
      status: { in: ['PENDING', 'CONFIRMED'] }
    },
    include: {
      service: true,
      professional: {
        include: { user: true }
      },
      payment: true
    }
  });

  if (!booking) {
    throw new AppError('Agendamento não encontrado', 404);
  }

  if (booking.payment) {
    throw new AppError('Agendamento já foi pago', 400);
  }

  const amount = booking.totalAmount;

  let payment;

  if (useWallet) {
    // Pagamento via carteira
    payment = await processWalletPayment(booking, amount);
  } else if (paymentMethod === 'PIX') {
    // Pagamento via PIX
    payment = await processPixPayment(booking, amount);
  } else if (paymentMethod === 'CREDIT_CARD' || paymentMethod === 'DEBIT_CARD') {
    // Pagamento via cartão
    payment = await processCardPayment(booking, amount, paymentMethodId);
  } else {
    throw new AppError('Método de pagamento inválido', 400);
  }

  // Atualizar status do agendamento se pagamento foi bem-sucedido
  if (payment.status === 'COMPLETED') {
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CONFIRMED' }
    });

    // Notificar profissional
    await createNotification({
      userId: booking.professional.userId,
      type: 'PAYMENT_RECEIVED',
      title: 'Pagamento Recebido',
      message: `Pagamento de R$ ${amount} foi recebido para o agendamento`,
      data: { bookingId, paymentId: payment.id }
    });
  }

  res.json({
    success: true,
    message: 'Pagamento processado com sucesso',
    data: { payment }
  });
}));

// ===== SISTEMA ESCROW =====

// @route   POST /api/payments/escrow/create
// @desc    Criar pagamento em custódia
// @access  Private
router.post('/escrow/create', authenticateToken, paymentValidators.validateEscrowCreation, asyncHandler(async (req, res) => {
  const { bookingId, amount, terms, releaseConditions } = req.body;
  const userId = req.user.id;

  // Verificar agendamento
  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      userId
    },
    include: {
      professional: { include: { user: true } }
    }
  });

  if (!booking) {
    throw new AppError('Agendamento não encontrado', 404);
  }

  // Criar escrow
  const escrow = await prisma.escrow.create({
    data: {
      bookingId,
      payerId: userId,
      payeeId: booking.professional.userId,
      amount,
      currency: 'BRL',
      status: 'PENDING',
      terms,
      releaseConditions: JSON.stringify(releaseConditions),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 dias
    }
  });

  // Notificar partes envolvidas
  await Promise.all([
    createNotification({
      userId,
      type: 'ESCROW_CREATED',
      title: 'Pagamento em Custódia Criado',
      message: `Pagamento de R$ ${amount} foi colocado em custódia`,
      data: { escrowId: escrow.id, bookingId }
    }),

    createNotification({
      userId: booking.professional.userId,
      type: 'ESCROW_CREATED',
      title: 'Pagamento em Custódia Recebido',
      message: `Um pagamento de R$ ${amount} foi colocado em custódia para você`,
      data: { escrowId: escrow.id, bookingId }
    })
  ]);

  res.status(201).json({
    success: true,
    message: 'Pagamento em custódia criado com sucesso',
    data: { escrow }
  });
}));

// @route   POST /api/payments/escrow/:id/release
// @desc    Liberar pagamento em custódia
// @access  Private
router.post('/escrow/:id/release', authenticateToken, paymentValidators.validateEscrowRelease, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason, evidence } = req.body;
  const userId = req.user.id;

  const escrow = await prisma.escrow.findFirst({
    where: {
      id,
      OR: [
        { payerId: userId },
        { payeeId: userId }
      ],
      status: 'HELD'
    },
    include: {
      booking: true,
      payer: { select: { firstName: true, lastName: true } },
      payee: { select: { firstName: true, lastName: true } }
    }
  });

  if (!escrow) {
    throw new AppError('Pagamento em custódia não encontrado', 404);
  }

  // Verificar condições de liberação
  const releaseConditions = JSON.parse(escrow.releaseConditions);
  const canRelease = await checkReleaseConditions(escrow, releaseConditions, userId);

  if (!canRelease) {
    throw new AppError('Condições de liberação não foram atendidas', 400);
  }

  // Liberar pagamento
  const updatedEscrow = await prisma.escrow.update({
    where: { id },
    data: {
      status: 'RELEASED',
      releasedAt: new Date(),
      releasedBy: userId,
      releaseReason: reason,
      releaseEvidence: JSON.stringify(evidence)
    }
  });

  // Transferir fundos para o profissional
  await transferEscrowFunds(escrow);

  // Notificar partes
  await Promise.all([
    createNotification({
      userId: escrow.payerId,
      type: 'ESCROW_RELEASED',
      title: 'Pagamento Liberado',
      message: `Pagamento de R$ ${escrow.amount} foi liberado`,
      data: { escrowId: id }
    }),

    createNotification({
      userId: escrow.payeeId,
      type: 'ESCROW_RELEASED',
      title: 'Pagamento Recebido',
      message: `Você recebeu R$ ${escrow.amount} do pagamento em custódia`,
      data: { escrowId: id }
    })
  ]);

  res.json({
    success: true,
    message: 'Pagamento liberado com sucesso',
    data: { escrow: updatedEscrow }
  });
}));

// ===== PIX =====

// @route   POST /api/payments/pix/create
// @desc    Criar pagamento PIX
// @access  Private
router.post('/pix/create', authenticateToken, paymentValidators.validatePixPayment, asyncHandler(async (req, res) => {
  const { amount, description, bookingId } = req.body;
  const userId = req.user.id;

  // Gerar chave PIX (simulado)
  const pixKey = generatePixKey();
  const qrCode = await generatePixQRCode(pixKey, amount, description);

  // Criar pagamento PIX
  const pixPayment = await prisma.pixPayment.create({
    data: {
      userId,
      bookingId,
      amount,
      currency: 'BRL',
      description,
      pixKey,
      qrCode,
      status: 'PENDING',
      expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutos
    }
  });

  res.json({
    success: true,
    message: 'PIX criado com sucesso',
    data: {
      pixPayment: {
        id: pixPayment.id,
        pixKey,
        qrCode,
        amount,
        expiresAt: pixPayment.expiresAt
      }
    }
  });
}));

// @route   GET /api/payments/pix/:id/status
// @desc    Verificar status do PIX
// @access  Private
router.get('/pix/:id/status', authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const pixPayment = await prisma.pixPayment.findFirst({
    where: { id, userId }
  });

  if (!pixPayment) {
    throw new AppError('Pagamento PIX não encontrado', 404);
  }

  // Verificar status no banco (simulado)
  const updatedStatus = await checkPixPaymentStatus(pixPayment.pixKey);

  if (updatedStatus !== pixPayment.status) {
    await prisma.pixPayment.update({
      where: { id },
      data: { 
        status: updatedStatus,
        ...(updatedStatus === 'COMPLETED' && { paidAt: new Date() })
      }
    });
  }

  res.json({
    success: true,
    data: {
      status: updatedStatus,
      paidAt: updatedStatus === 'COMPLETED' ? new Date() : null
    }
  });
}));

// ===== MÉTODOS DE PAGAMENTO =====

// @route   GET /api/payments/methods
// @desc    Listar métodos de pagamento do usuário
// @access  Private
router.get('/methods', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Buscar métodos salvos no Stripe
  const customer = await stripe.customers.retrieve(req.user.stripeCustomerId);
  const paymentMethods = await stripe.paymentMethods.list({
    customer: customer.id,
    type: 'card'
  });

  // Buscar chaves PIX salvas
  const pixKeys = await prisma.pixKey.findMany({
    where: { userId, isActive: true },
    select: {
      id: true,
      key: true,
      type: true,
      alias: true,
      isDefault: true,
      createdAt: true
    }
  });

  res.json({
    success: true,
    data: {
      cards: paymentMethods.data.map(pm => ({
        id: pm.id,
        brand: pm.card.brand,
        last4: pm.card.last4,
        expMonth: pm.card.exp_month,
        expYear: pm.card.exp_year,
        isDefault: pm.metadata.isDefault === 'true'
      })),
      pixKeys,
      wallet: {
        available: true,
        balance: await getWalletBalance(userId)
      }
    }
  });
}));

// @route   POST /api/payments/methods/card
// @desc    Adicionar cartão de crédito/débito
// @access  Private
router.post('/methods/card', authenticateToken, paymentValidators.validateAddCard, asyncHandler(async (req, res) => {
  const { paymentMethodId, isDefault = false } = req.body;
  const userId = req.user.id;

  // Anexar método de pagamento ao cliente
  await stripe.paymentMethods.attach(paymentMethodId, {
    customer: req.user.stripeCustomerId
  });

  // Definir como padrão se solicitado
  if (isDefault) {
    await stripe.customers.update(req.user.stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId
      }
    });

    // Remover padrão dos outros cartões
    await stripe.paymentMethods.update(paymentMethodId, {
      metadata: { isDefault: 'true' }
    });
  }

  res.json({
    success: true,
    message: 'Cartão adicionado com sucesso'
  });
}));

// @route   POST /api/payments/methods/pix
// @desc    Adicionar chave PIX
// @access  Private
router.post('/methods/pix', authenticateToken, paymentValidators.validateAddPixKey, asyncHandler(async (req, res) => {
  const { key, type, alias, isDefault = false } = req.body;
  const userId = req.user.id;

  // Validar chave PIX
  if (!validatePixKey(key, type)) {
    throw new AppError('Chave PIX inválida', 400);
  }

  // Verificar se chave já existe
  const existingKey = await prisma.pixKey.findFirst({
    where: { key, isActive: true }
  });

  if (existingKey) {
    throw new AppError('Chave PIX já cadastrada', 400);
  }

  // Se for padrão, remover padrão das outras
  if (isDefault) {
    await prisma.pixKey.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false }
    });
  }

  // Criar chave PIX
  const pixKey = await prisma.pixKey.create({
    data: {
      userId,
      key,
      type,
      alias,
      isDefault,
      isActive: true
    }
  });

  res.status(201).json({
    success: true,
    message: 'Chave PIX adicionada com sucesso',
    data: { pixKey }
  });
}));

// ===== RELATÓRIOS E ANALYTICS =====

// @route   GET /api/payments/analytics
// @desc    Obter analytics de pagamentos
// @access  Private
router.get('/analytics', authenticateToken, asyncHandler(async (req, res) => {
  const { period = '30d' } = req.query;
  const userId = req.user.id;
  
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const analytics = await getPaymentAnalytics(userId, startDate);

  res.json({
    success: true,
    data: { analytics }
  });
}));

// ===== WEBHOOKS =====

// @route   POST /api/payments/webhooks/stripe
// @desc    Webhook do Stripe
// @access  Public
router.post('/webhooks/stripe', express.raw({ type: 'application/json' }), asyncHandler(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    throw new AppError(`Webhook signature verification failed: ${err.message}`, 400);
  }

  // Processar evento
  await handleStripeWebhook(event);

  res.json({ received: true });
}));

// ===== FUNÇÕES AUXILIARES =====

// Obter ou criar carteira
async function getOrCreateWallet(userId) {
  let wallet = await prisma.wallet.findUnique({
    where: { userId }
  });

  if (!wallet) {
    wallet = await prisma.wallet.create({
      data: {
        userId,
        balance: 0,
        currency: 'BRL',
        isActive: true
      }
    });
  }

  return wallet;
}

// Processar pagamento bem-sucedido
async function processSuccessfulPayment(transactionId, paymentIntent) {
  const transaction = await prisma.walletTransaction.update({
    where: { id: transactionId },
    data: {
      status: 'COMPLETED',
      completedAt: new Date(),
      stripeChargeId: paymentIntent.charges.data[0]?.id
    },
    include: { wallet: true }
  });

  // Atualizar saldo da carteira
  await prisma.wallet.update({
    where: { id: transaction.walletId },
    data: {
      balance: { increment: transaction.amount }
    }
  });

  return transaction;
}

// Processar pagamento via carteira
async function processWalletPayment(booking, amount) {
  const wallet = await prisma.wallet.findUnique({
    where: { userId: booking.userId }
  });

  if (!wallet || wallet.balance < amount) {
    throw new AppError('Saldo insuficiente na carteira', 400);
  }

  // Criar pagamento
  const payment = await prisma.payment.create({
    data: {
      bookingId: booking.id,
      userId: booking.userId,
      amount,
      currency: 'BRL',
      method: 'WALLET',
      status: 'COMPLETED',
      paidAt: new Date()
    }
  });

  // Debitar da carteira
  await prisma.wallet.update({
    where: { id: wallet.id },
    data: { balance: { decrement: amount } }
  });

  // Criar transação na carteira
  await prisma.walletTransaction.create({
    data: {
      walletId: wallet.id,
      type: 'PAYMENT',
      amount: -amount,
      currency: 'BRL',
      status: 'COMPLETED',
      description: `Pagamento do agendamento #${booking.id}`,
      paymentId: payment.id
    }
  });

  return payment;
}

// Gerar chave PIX (simulado)
function generatePixKey() {
  return `pix_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Gerar QR Code PIX (simulado)
async function generatePixQRCode(pixKey, amount, description) {
  // Em produção, seria integração com banco para gerar QR Code real
  return `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`;
}

// Validar chave PIX
function validatePixKey(key, type) {
  const validators = {
    CPF: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
    CNPJ: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
    RANDOM: /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i
  };

  return validators[type]?.test(key) || false;
}

module.exports = router;

