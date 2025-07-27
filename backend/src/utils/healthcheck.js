const { prisma } = require('../config/database')
const logger = require('../config/logger')

/**
 * Utilitário de Health Check para monitoramento da aplicação
 * Verifica status de serviços críticos e métricas de performance
 */
class HealthCheck {
  constructor() {
    this.checks = new Map()
    this.setupDefaultChecks()
  }

  /**
   * Configurar verificações padrão
   */
  setupDefaultChecks() {
    this.addCheck('database', this.checkDatabase.bind(this))
    this.addCheck('memory', this.checkMemory.bind(this))
    this.addCheck('disk', this.checkDisk.bind(this))
    this.addCheck('uptime', this.checkUptime.bind(this))
  }

  /**
   * Adicionar nova verificação
   * @param {string} name - Nome da verificação
   * @param {Function} checkFunction - Função de verificação
   */
  addCheck(name, checkFunction) {
    this.checks.set(name, checkFunction)
  }

  /**
   * Remover verificação
   * @param {string} name - Nome da verificação
   */
  removeCheck(name) {
    this.checks.delete(name)
  }

  /**
   * Executar todas as verificações
   * @param {Array} includeChecks - Lista de verificações específicas (opcional)
   * @returns {Object} Resultado das verificações
   */
  async runChecks(includeChecks = null) {
    const startTime = Date.now()
    const results = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: {},
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        warnings: 0
      },
      responseTime: 0
    }

    const checksToRun = includeChecks 
      ? Array.from(this.checks.entries()).filter(([name]) => includeChecks.includes(name))
      : Array.from(this.checks.entries())

    results.summary.total = checksToRun.length

    // Executar verificações em paralelo
    const checkPromises = checksToRun.map(async ([name, checkFunction]) => {
      try {
        const checkStart = Date.now()
        const result = await Promise.race([
          checkFunction(),
          this.timeout(5000) // Timeout de 5 segundos por verificação
        ])
        
        const checkResult = {
          status: result.status || 'pass',
          message: result.message || 'OK',
          responseTime: Date.now() - checkStart,
          details: result.details || {},
          timestamp: new Date().toISOString()
        }

        // Contabilizar resultado
        switch (checkResult.status) {
          case 'pass':
            results.summary.passed++
            break
          case 'warn':
            results.summary.warnings++
            break
          case 'fail':
            results.summary.failed++
            results.status = 'unhealthy'
            break
        }

        return [name, checkResult]
      } catch (error) {
        logger.error(`Health check failed for ${name}:`, error)
        
        const errorResult = {
          status: 'fail',
          message: error.message || 'Check failed',
          responseTime: Date.now() - checkStart,
          error: error.name || 'Error',
          timestamp: new Date().toISOString()
        }

        results.summary.failed++
        results.status = 'unhealthy'
        
        return [name, errorResult]
      }
    })

    // Aguardar todas as verificações
    const checkResults = await Promise.all(checkPromises)
    
    // Organizar resultados
    checkResults.forEach(([name, result]) => {
      results.checks[name] = result
    })

    // Calcular tempo total de resposta
    results.responseTime = Date.now() - startTime

    // Determinar status final
    if (results.summary.failed > 0) {
      results.status = 'unhealthy'
    } else if (results.summary.warnings > 0) {
      results.status = 'degraded'
    }

    return results
  }

  /**
   * Verificação rápida de liveness
   * @returns {Object} Status básico da aplicação
   */
  async liveness() {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      pid: process.pid,
      version: process.env.npm_package_version || '1.0.0'
    }
  }

  /**
   * Verificação de readiness
   * @returns {Object} Status de prontidão para receber tráfego
   */
  async readiness() {
    const criticalChecks = ['database']
    const results = await this.runChecks(criticalChecks)
    
    return {
      status: results.status === 'healthy' ? 'ready' : 'not_ready',
      timestamp: results.timestamp,
      checks: results.checks,
      responseTime: results.responseTime
    }
  }

  /**
   * Verificação completa de saúde
   * @returns {Object} Status completo da aplicação
   */
  async health() {
    return this.runChecks()
  }

  /**
   * Verificar conexão com banco de dados
   * @returns {Object} Status do banco de dados
   */
  async checkDatabase() {
    try {
      const start = Date.now()
      await prisma.$queryRaw`SELECT 1`
      const responseTime = Date.now() - start

      let status = 'pass'
      let message = 'Database connection is healthy'

      // Verificar tempo de resposta
      if (responseTime > 1000) {
        status = 'warn'
        message = 'Database response time is slow'
      } else if (responseTime > 5000) {
        status = 'fail'
        message = 'Database response time is critical'
      }

      return {
        status,
        message,
        details: {
          responseTime,
          connection: 'active'
        }
      }
    } catch (error) {
      return {
        status: 'fail',
        message: 'Database connection failed',
        details: {
          error: error.message,
          code: error.code
        }
      }
    }
  }

  /**
   * Verificar uso de memória
   * @returns {Object} Status da memória
   */
  async checkMemory() {
    const memUsage = process.memoryUsage()
    const totalMem = require('os').totalmem()
    const freeMem = require('os').freemem()
    
    const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024)
    const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024)
    const systemUsedMB = Math.round((totalMem - freeMem) / 1024 / 1024)
    const systemTotalMB = Math.round(totalMem / 1024 / 1024)
    
    const heapUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100
    const systemUsagePercent = ((totalMem - freeMem) / totalMem) * 100

    let status = 'pass'
    let message = 'Memory usage is normal'

    if (heapUsagePercent > 90 || systemUsagePercent > 90) {
      status = 'fail'
      message = 'Memory usage is critical'
    } else if (heapUsagePercent > 80 || systemUsagePercent > 80) {
      status = 'warn'
      message = 'Memory usage is high'
    }

    return {
      status,
      message,
      details: {
        heap: {
          used: heapUsedMB,
          total: heapTotalMB,
          percentage: Math.round(heapUsagePercent)
        },
        system: {
          used: systemUsedMB,
          total: systemTotalMB,
          percentage: Math.round(systemUsagePercent)
        },
        external: Math.round(memUsage.external / 1024 / 1024),
        arrayBuffers: Math.round(memUsage.arrayBuffers / 1024 / 1024)
      }
    }
  }

  /**
   * Verificar espaço em disco
   * @returns {Object} Status do disco
   */
  async checkDisk() {
    try {
      const fs = require('fs').promises
      const path = require('path')
      
      const stats = await fs.statfs(path.resolve('.'))
      const totalSpace = stats.blocks * stats.blksize
      const freeSpace = stats.bavail * stats.blksize
      const usedSpace = totalSpace - freeSpace
      
      const usagePercent = (usedSpace / totalSpace) * 100
      
      let status = 'pass'
      let message = 'Disk usage is normal'

      if (usagePercent > 95) {
        status = 'fail'
        message = 'Disk usage is critical'
      } else if (usagePercent > 85) {
        status = 'warn'
        message = 'Disk usage is high'
      }

      return {
        status,
        message,
        details: {
          total: Math.round(totalSpace / 1024 / 1024 / 1024),
          used: Math.round(usedSpace / 1024 / 1024 / 1024),
          free: Math.round(freeSpace / 1024 / 1024 / 1024),
          percentage: Math.round(usagePercent)
        }
      }
    } catch (error) {
      return {
        status: 'warn',
        message: 'Could not check disk usage',
        details: {
          error: error.message
        }
      }
    }
  }

  /**
   * Verificar tempo de atividade
   * @returns {Object} Status do uptime
   */
  async checkUptime() {
    const uptime = process.uptime()
    const uptimeHours = uptime / 3600
    
    let status = 'pass'
    let message = `Application has been running for ${Math.round(uptimeHours)} hours`

    if (uptime < 60) {
      status = 'warn'
      message = 'Application recently started'
    }

    return {
      status,
      message,
      details: {
        uptime: Math.round(uptime),
        uptimeHours: Math.round(uptimeHours),
        startTime: new Date(Date.now() - uptime * 1000).toISOString()
      }
    }
  }

  /**
   * Utilitário de timeout para verificações
   * @param {number} ms - Tempo limite em milissegundos
   * @returns {Promise} Promise que rejeita após o timeout
   */
  timeout(ms) {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Health check timeout')), ms)
    })
  }

  /**
   * Obter métricas básicas da aplicação
   * @returns {Object} Métricas da aplicação
   */
  getMetrics() {
    const memUsage = process.memoryUsage()
    const cpuUsage = process.cpuUsage()
    
    return {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        rss: memUsage.rss,
        heapTotal: memUsage.heapTotal,
        heapUsed: memUsage.heapUsed,
        external: memUsage.external,
        arrayBuffers: memUsage.arrayBuffers
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system
      },
      eventLoop: {
        lag: this.getEventLoopLag()
      },
      version: {
        node: process.version,
        app: process.env.npm_package_version || '1.0.0'
      }
    }
  }

  /**
   * Medir lag do event loop
   * @returns {number} Lag em milissegundos
   */
  getEventLoopLag() {
    const start = process.hrtime.bigint()
    setImmediate(() => {
      const lag = Number(process.hrtime.bigint() - start) / 1000000
      this.eventLoopLag = lag
    })
    return this.eventLoopLag || 0
  }
}

// Instância singleton
const healthCheck = new HealthCheck()

module.exports = healthCheck

