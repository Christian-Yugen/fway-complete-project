require('dotenv').config()

const logger = require('./config/logger')
const { connectDatabase } = require('./config/database')
const configureExpress = require('./config/express')
const voiceAgentRoute = require('./routes/voiceAgent');
const express = require('express');
const app = express();

app.use(express.json());
app.use('/voice-agent', voiceAgentRoute);


// Função principal para iniciar o servidor
const startServer = async () => {
  try {
    // Conectar ao banco de dados
    await connectDatabase()

        // Configurar Express
    const app = configureExpress()

    // Definir porta
    const PORT = process.env.BACKEND_PORT || 3000
    const HOST = process.env.BACKEND_HOST || 'localhost'

    app.listen(PORT, HOST, () => {
    console.log(`Servidor rodando em http://${HOST}:${PORT}`);
});
    // Iniciar servidor
    const server = app.listen(PORT, HOST, () => {
      logger.info(`🚀 Server running on ${HOST}:${PORT}`)
      logger.info(`📱 Environment: ${process.env.NODE_ENV}`)
      
      if (process.env.NODE_ENV === 'development') {
        logger.info(`📚 API Documentation: http://${HOST}:${PORT}/api-docs`)
        logger.info(`🏥 Health Check: http://${HOST}:${PORT}/health`)
      }
    })

    // Graceful shutdown
    const gracefulShutdown = (signal) => {
      logger.info(`🔄 ${signal} received, shutting down gracefully...`)
      
      server.close(() => {
        logger.info('✅ HTTP server closed')
        process.exit(0)
      })

      // Force close after 10 seconds
      setTimeout(() => {
        logger.error('❌ Could not close connections in time, forcefully shutting down')
        process.exit(1)
      }, 10000)
    }

    // Listen for termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
    process.on('SIGINT', () => gracefulShutdown('SIGINT'))

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('❌ Uncaught Exception:', error)
      process.exit(1)
    })

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('❌ Unhandled Rejection at:', promise, 'reason:', reason)
      process.exit(1)
    })

  } catch (error) {
    logger.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

// Iniciar servidor apenas se este arquivo for executado diretamente
if (require.main === module) {
  startServer()
}

module.exports = { startServer }


