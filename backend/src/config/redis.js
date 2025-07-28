const redis = require('redis');

let redisClient = null;
let isRedisConnected = false;

// Tentar conectar ao Redis
const initializeRedis = async () => {
  try {
    redisClient = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      password: process.env.REDIS_PASSWORD || undefined,
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
        reconnectStrategy: (retries) => Math.min(retries * 50, 500),
        connectTimeout: 5000
      }
    });

    redisClient.on('error', (err) => {
      console.warn('Redis Client Error (running without cache):', err.message);
      isRedisConnected = false;
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis connected successfully');
      isRedisConnected = true;
    });

    redisClient.on('ready', () => {
      console.log('✅ Redis ready to use');
      isRedisConnected = true;
    });

    redisClient.on('end', () => {
      console.log('❌ Redis connection ended');
      isRedisConnected = false;
    });

    // Conectar ao Redis com timeout
    await Promise.race([
      redisClient.connect(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Redis connection timeout')), 5000)
      )
    ]);
    
    isRedisConnected = true;
    console.log('✅ Redis initialized successfully');
  } catch (error) {
    console.warn('⚠️ Redis not available, running without cache:', error.message);
    isRedisConnected = false;
    redisClient = null;
  }
};

// Inicializar Redis
initializeRedis();

// Funções utilitárias para cache com fallback
const cache = {
  // Definir cache com TTL
  async set(key, value, ttl = 3600) {
    if (!isRedisConnected || !redisClient) {
      return false;
    }
    
    try {
      const serializedValue = JSON.stringify(value);
      await redisClient.setEx(key, ttl, serializedValue);
      return true;
    } catch (error) {
      console.warn('Cache set error:', error.message);
      return false;
    }
  },

  // Obter do cache
  async get(key) {
    if (!isRedisConnected || !redisClient) {
      return null;
    }
    
    try {
      const value = await redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.warn('Cache get error:', error.message);
      return null;
    }
  },

  // Deletar do cache
  async del(key) {
    if (!isRedisConnected || !redisClient) {
      return false;
    }
    
    try {
      await redisClient.del(key);
      return true;
    } catch (error) {
      console.warn('Cache delete error:', error.message);
      return false;
    }
  },

  // Verificar se existe
  async exists(key) {
    if (!isRedisConnected || !redisClient) {
      return false;
    }
    
    try {
      const result = await redisClient.exists(key);
      return result === 1;
    } catch (error) {
      console.warn('Cache exists error:', error.message);
      return false;
    }
  },

  // Incrementar valor
  async incr(key) {
    if (!isRedisConnected || !redisClient) {
      return 0;
    }
    
    try {
      return await redisClient.incr(key);
    } catch (error) {
      console.warn('Cache incr error:', error.message);
      return 0;
    }
  },

  // Definir TTL
  async expire(key, ttl) {
    if (!isRedisConnected || !redisClient) {
      return false;
    }
    
    try {
      await redisClient.expire(key, ttl);
      return true;
    } catch (error) {
      console.warn('Cache expire error:', error.message);
      return false;
    }
  },

  // Buscar por padrão
  async keys(pattern) {
    if (!isRedisConnected || !redisClient) {
      return [];
    }
    
    try {
      return await redisClient.keys(pattern);
    } catch (error) {
      console.warn('Cache keys error:', error.message);
      return [];
    }
  },

  // Limpar cache por padrão
  async clearPattern(pattern) {
    if (!isRedisConnected || !redisClient) {
      return 0;
    }
    
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
      return keys.length;
    } catch (error) {
      console.warn('Cache clear pattern error:', error.message);
      return 0;
    }
  },

  // Verificar se Redis está conectado
  isConnected() {
    return isRedisConnected;
  }
};

module.exports = redisClient;
module.exports.cache = cache;
module.exports.isConnected = () => isRedisConnected;

