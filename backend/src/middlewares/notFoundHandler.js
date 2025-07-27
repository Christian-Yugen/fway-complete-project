const { AppError } = require('./errorHandler')

/**
 * Middleware para capturar rotas não encontradas (404)
 * Deve ser usado antes do errorHandler
 */
const notFoundHandler = (req, res, next) => {
  const error = new AppError(
    `Rota ${req.method} ${req.originalUrl} não encontrada`,
    404,
    'ROUTE_NOT_FOUND'
  )
  
  next(error)
}

module.exports = notFoundHandler

