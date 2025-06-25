// Utility functions using functional programming
const createKey = (serverConfig) => 
  serverConfig?.ip && serverConfig?.port ? `${serverConfig.ip}:${serverConfig.port}` : null;

const isExpired = (timestamp, duration) => 
  timestamp ? (Date.now() - timestamp) >= duration : true;

const filterExpired = (cache, timestamps, duration) => {
  const now = Date.now();
  return [...cache.keys()].filter(key => {
    const timestamp = timestamps.get(key);
    return timestamp && (now - timestamp) >= duration;
  });
};

const cleanupExpiredEntries = (cache, timestamps, expiredKeys) => {
  expiredKeys.forEach(key => {
    cache.delete(key);
    timestamps.delete(key);
  });
  return expiredKeys.length;
};

class ServerCache {
  constructor(options = {}) {
    this.cacheDuration = options.cacheDuration || 30000;
    this.maxCacheSize = options.maxCacheSize || 100;
    this.cache = new Map();
    this.cacheTimestamps = new Map();
    this.isEnabled = options.enabled !== false;
    
    console.log('🗄️ ServerCache initialized with', {
      cacheDuration: this.cacheDuration,
      maxCacheSize: this.maxCacheSize,
      enabled: this.isEnabled
    });

    this.startCleanupInterval();
  }

  generateCacheKey(serverConfig) {
    return createKey(serverConfig);
  }

  isCacheValid(key) {
    if (!this.isEnabled || !this.cache.has(key)) {
      return false;
    }

    const timestamp = this.cacheTimestamps.get(key);
    const valid = !isExpired(timestamp, this.cacheDuration);

    if (!valid && this.cache.has(key)) {
      this.cache.delete(key);
      this.cacheTimestamps.delete(key);
      console.log('🗑️ Cache expired for key:', key);
    }

    return valid;
  }

  get(serverConfig) {
    const key = this.generateCacheKey(serverConfig);
    if (!key) return null;

    if (this.isCacheValid(key)) {
      const cachedData = this.cache.get(key);
      console.log('✅ Cache hit for server:', key);
      return { ...cachedData, fromCache: true };
    }

    console.log('❌ Cache miss for server:', key);
    return null;
  }

  set(serverConfig, statusData) {
    if (!this.isEnabled) return;

    const key = this.generateCacheKey(serverConfig);
    if (!key) return;

    if (this.cache.size >= this.maxCacheSize && !this.cache.has(key)) {
      this.evictOldestEntry();
    }

    const cacheEntry = {
      ...statusData,
      cachedAt: Date.now(),
      serverKey: key
    };

    this.cache.set(key, cacheEntry);
    this.cacheTimestamps.set(key, Date.now());

    console.log('💾 Cached server status for:', key, {
      status: statusData.status,
      cacheSize: this.cache.size
    });
  }

  /**
   * Remove oldest cache entry (LRU eviction)
   */
  evictOldestEntry() {
    let oldestKey = null;
    let oldestTimestamp = Date.now();

    for (const [key, timestamp] of this.cacheTimestamps) {
      if (timestamp < oldestTimestamp) {
        oldestTimestamp = timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.cacheTimestamps.delete(oldestKey);
      console.log('🗑️ Evicted oldest cache entry:', oldestKey);
    }
  }

  /**
   * Clear all cache entries
   */
  clear() {
    this.cache.clear();
    this.cacheTimestamps.clear();
    console.log('🧹 Cache cleared');
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;

    for (const [key, timestamp] of this.cacheTimestamps) {
      if ((now - timestamp) < this.cacheDuration) {
        validEntries++;
      } else {
        expiredEntries++;
      }
    }

    return {
      totalEntries: this.cache.size,
      validEntries,
      expiredEntries,
      cacheDuration: this.cacheDuration,
      maxCacheSize: this.maxCacheSize,
      enabled: this.isEnabled
    };
  }

  /**
   * Update cache configuration
   */
  updateConfig(options = {}) {
    if (options.cacheDuration !== undefined) {
      this.cacheDuration = options.cacheDuration;
      console.log('🔧 Cache duration updated to:', this.cacheDuration);
    }

    if (options.maxCacheSize !== undefined) {
      this.maxCacheSize = options.maxCacheSize;
      console.log('🔧 Max cache size updated to:', this.maxCacheSize);
    }

    if (options.enabled !== undefined) {
      this.isEnabled = options.enabled;
      console.log('🔧 Cache enabled status updated to:', this.isEnabled);
      
      if (!this.isEnabled) {
        this.clear();
      }
    }
  }

  /**
   * Start periodic cleanup of expired entries
   */
  startCleanupInterval() {
    // Clean up every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredEntries();
    }, 60000);
  }

  /**
   * Clean up expired cache entries
   */
  cleanupExpiredEntries() {
    const expiredKeys = filterExpired(this.cache, this.cacheTimestamps, this.cacheDuration);
    const cleanedCount = cleanupExpiredEntries(this.cache, this.cacheTimestamps, expiredKeys);
    
    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} expired cache entries`);
    }
  }

  /**
   * Stop cleanup interval
   */
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.clear();
    console.log('🗄️ ServerCache destroyed');
  }
}

/**
 * Cache-enabled server status fetcher
 * Integrates with existing CS2ServerStatus system
 */
class CachedServerStatusFetcher {
  constructor(options = {}) {
    this.cache = new ServerCache(options.cache || {});
    this.retryAttempts = options.retryAttempts || 2;
    this.retryDelay = options.retryDelay || 1000;
    
    console.log('🚀 CachedServerStatusFetcher initialized');
  }

  /**
   * Fetch server status with caching
   */
  async fetchServerStatus(serverConfig) {
    // Try to get from cache first
    const cachedResult = this.cache.get(serverConfig);
    if (cachedResult) {
      return cachedResult;
    }

    // If not in cache, fetch from server
    try {
      const statusData = await this.performServerCheck(serverConfig);
      
      // Cache the result
      this.cache.set(serverConfig, statusData);
      
      return statusData;
    } catch (error) {
      console.error('❌ Failed to fetch server status:', error);
      
      // Return error status
      const errorStatus = {
        status: 'offline',
        error: error.message,
        timestamp: Date.now(),
        fromCache: false
      };
      
      // Cache error result for shorter duration
      const errorConfig = { ...serverConfig };
      this.cache.set(errorConfig, errorStatus);
      
      return errorStatus;
    }
  }

  /**
   * Perform actual server status check
   */
  async performServerCheck(serverConfig) {
    const { ip, port } = serverConfig;
    
    // Determine if this is a VPN server
    const isVPN = this.isPrivateNetworkIP(ip);
      if (isVPN) {
      return {
        status: 'vpn',
        ip: ip,
        port: port,
        players: { current: 0, max: 32 },
        map: '?',
        name: 'A GREAT CHAOS 01',
        gameMode: '?',
        secure: true,
        isVpnServer: true,
        timestamp: Date.now(),
        fromCache: false
      };
    }

    // For regular servers, attempt connection
    try {
      const response = await this.attemptServerConnection(ip, port);
      return {
        status: 'online',
        ...response,
        timestamp: Date.now(),
        fromCache: false
      };
    } catch (error) {
      return {
        status: 'offline',
        ip: ip,
        port: port,
        error: error.message,
        timestamp: Date.now(),
        fromCache: false
      };
    }
  }
  /**
   * Check if IP is in private network range (RFC 1918, RFC 6598)
   */
  isPrivateNetworkIP(ip) {
    if (!ip || typeof ip !== 'string') return false;
    
    // Split IP into octets
    const octets = ip.split('.');
    if (octets.length !== 4) return false;
    
    // Convert to numbers
    const o1 = parseInt(octets[0], 10);
    const o2 = parseInt(octets[1], 10);
    
    // Check for private IP ranges:
    
    // 10.0.0.0 - 10.255.255.255 (10/8 prefix)
    if (o1 === 10) return true;
    
    // 172.16.0.0 - 172.31.255.255 (172.16/12 prefix)
    if (o1 === 172 && o2 >= 16 && o2 <= 31) return true;
    
    // 192.168.0.0 - 192.168.255.255 (192.168/16 prefix)
    if (o1 === 192 && o2 === 168) return true;
    
    // 100.64.0.0 - 100.127.255.255 (100.64/10 prefix, Carrier-grade NAT)
    if (o1 === 100 && o2 >= 64 && o2 <= 127) return true;
    
    // 127.0.0.0 - 127.255.255.255 (Loopback)
    if (o1 === 127) return true;
    
    return false;
  }

  /**
   * Attempt server connection with retry logic
   */
  async attemptServerConnection(ip, port) {
    for (let attempt = 0; attempt < this.retryAttempts; attempt++) {
      try {
        // Simulate server check (replace with actual implementation)
        const result = await this.checkServerConnectivity(ip, port);
        return result;
      } catch (error) {
        if (attempt === this.retryAttempts - 1) {
          throw error;
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        console.log(`🔄 Retrying server check for ${ip}:${port} (attempt ${attempt + 2})`);
      }
    }
  }
  /**
   * Check server connectivity - implementação real com A2S Query
   */
  async checkServerConnectivity(ip, port) {
    console.log(`🔍 Verificando conectividade real do servidor ${ip}:${port}...`);
    
    try {
      // Usar CORS proxy para consultas cross-origin
      const corsProxy = 'https://api.allorigins.win/get?url=';
      
      // Buscar informações do servidor utilizando a Steam Web API
      const steamApiKey = process.env.STEAM_API_KEY || '1270A62C1573C745CB26B8526242F0BD'; // Usar variável de ambiente
      const steamApiUrl = `https://api.steampowered.com/IGameServersService/GetServerList/v1/?key=${steamApiKey}&filter=addr\\${ip}:${port}`;
      const apiUrl = `${corsProxy}${encodeURIComponent(steamApiUrl)}`;
      
      console.log(`🌐 Consultando API Steam: ${steamApiUrl}`);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(8000) // 8 segundos de timeout
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📊 Resposta da API Steam:', data);
      
      // Se estamos usando CORS proxy, o resultado real está em data.contents
      const apiData = data.contents ? JSON.parse(data.contents) : data;
      
      if (!apiData || !apiData.response || !apiData.response.servers || !apiData.response.servers.length) {
        console.warn('⚠️ Nenhum servidor encontrado na resposta da API');
        throw new Error('Servidor não encontrado');
      }
      
      // Usar os dados reais do primeiro servidor encontrado
      const serverInfo = apiData.response.servers[0];
      
      return {
        ip: ip,
        port: port,
        players: serverInfo.players || 0,
        maxPlayers: serverInfo.max_players || 32,
        map: serverInfo.map || '?',
        name: serverInfo.name || `CS2 Server ${ip}:${port}`,
        gameType: serverInfo.game_type || 'competitive',
        ping: serverInfo.ping || 50,
        secure: serverInfo.secure == 1
      };
    } catch (error) {
      console.error(`❌ Falha ao verificar servidor ${ip}:${port}:`, error.message);
      throw error;
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return this.cache.getStats();
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Update cache configuration
   */
  updateCacheConfig(options) {
    this.cache.updateConfig(options);
  }

  /**
   * Cleanup and destroy
   */
  destroy() {
    this.cache.destroy();
  }
}

// Export for use in other modules (CommonJS and ES modules)
export { ServerCache, CachedServerStatusFetcher, createKey, isExpired, filterExpired, cleanupExpiredEntries };

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ServerCache, CachedServerStatusFetcher, createKey, isExpired, filterExpired, cleanupExpiredEntries };
} else {
  // Browser environment
  window.ServerCache = ServerCache;
  window.CachedServerStatusFetcher = CachedServerStatusFetcher;
}

// Auto-initialize global instance if in browser
if (typeof window !== 'undefined') {
  // Initialize global cache instance
  window.globalServerCache = new CachedServerStatusFetcher({
    cache: {
      cacheDuration: 30000, // 30 seconds
      maxCacheSize: 50,
      enabled: true
    },
    retryAttempts: 2,
    retryDelay: 1000
  });

  console.log('🌐 Global server cache initialized');
}
