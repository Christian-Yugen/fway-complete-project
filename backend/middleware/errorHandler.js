// Middleware para rotas não encontradas
const notFound = (req, res, next) => {
  const error = new Error(`Rota não encontrada - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Middleware de tratamento de erros
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Erro de validação do Prisma
  if (err.code === 'P2002') {
    statusCode = 400;
    message = 'Dados duplicados. Este registro já existe.';
  }

  // Erro de registro não encontrado do Prisma
  if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Registro não encontrado.';
  }

  // Erro de validação do Joi
  if (err.isJoi) {
    statusCode = 400;
    message = err.details[0].message;
  }

  // Erro de validação do Express Validator
  if (err.array && typeof err.array === 'function') {
    statusCode = 400;
    message = err.array()[0].msg;
  }

  // Erro de JWT
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Token inválido';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expirado';
  }

  // Erro de upload de arquivo
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message = 'Arquivo muito grande';
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    statusCode = 400;
    message = 'Tipo de arquivo não permitido';
  }

  // Log do erro em desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    console.error('Error Stack:', err.stack);
  }

  // Resposta de erro
  const errorResponse = {
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  };

  res.status(statusCode).json(errorResponse);
};

// Middleware para capturar erros assíncronos
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Classe de erro customizada
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Middleware de validação de dados
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }
    next();
  };
};

// Middleware de validação de parâmetros
const validateParams = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.params);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }
    next();
  };
};

// Middleware de validação de query
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.query);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }
    next();
  };
};

module.exports = {
  notFound,
  errorHandler,
  asyncHandler,
  AppError,
  validateRequest,
  validateParams,
  validateQuery
};

