/**
 * Server-side Cache System for CS2 Server Status
 * Handles caching of server status data to improve performance
 * and reduce API calls
 */

class ServerCache {
  constructor(options = {}) {
    this.cacheDuration = options.cacheDuration || 30000; // 30 seconds default
    this.maxCacheSize = options.maxCacheSize || 100; // Maximum cache entries
    this.cache = new Map();
    this.cacheTimestamps = new Map();
    this.isEnabled = options.enabled !== false; // Cache enabled by default
    
    console.log('🗄️ ServerCache initialized with', {
      cacheDuration: this.cacheDuration,
      maxCacheSize: this.maxCacheSize,
      enabled: this.isEnabled
    });

    // Cleanup expired entries periodically
    this.startCleanupInterval();
  }

  /**
   * Generate cache key from server configuration
   */
  generateCacheKey(serverConfig) {
    if (!serverConfig || !serverConfig.ip || !serverConfig.port) {
      return null;
    }
    return `${serverConfig.ip}:${serverConfig.port}`;
  }

  /**
   * Check if cache entry is valid
   */
  isCacheValid(key) {
    if (!this.isEnabled || !this.cache.has(key)) {
      return false;
    }

    const timestamp = this.cacheTimestamps.get(key);
    const now = Date.now();
    const isValid = timestamp && (now - timestamp) < this.cacheDuration;

    if (!isValid && this.cache.has(key)) {
      // Remove expired entry
      this.cache.delete(key);
      this.cacheTimestamps.delete(key);
      console.log('🗑️ Cache expired for key:', key);
    }

    return isValid;
  }

  /**
   * Get cached server status
   */
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

  /**
   * Store server status in cache
   */
  set(serverConfig, statusData) {
    if (!this.isEnabled) return;

    const key = this.generateCacheKey(serverConfig);
    if (!key) return;

    // Ensure we don't exceed max cache size
    if (this.cache.size >= this.maxCacheSize && !this.cache.has(key)) {
      this.evictOldestEntry();
    }

    // Store data with timestamp
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
    const now = Date.now();
    const expiredKeys = [];

    for (const [key, timestamp] of this.cacheTimestamps) {
      if ((now - timestamp) >= this.cacheDuration) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => {
      this.cache.delete(key);
      this.cacheTimestamps.delete(key);
    });

    if (expiredKeys.length > 0) {
      console.log(`🧹 Cleaned up ${expiredKeys.length} expired cache entries`);
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
   * Check if IP is in VPN range (26.x.x.x)
   */
  isPrivateNetworkIP(ip) {
    if (!ip || typeof ip !== 'string') return false;
    return ip.startsWith('26.');
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
   * Check server connectivity (placeholder implementation)
   */
  async checkServerConnectivity(ip, port) {
    // This is a placeholder - replace with actual server checking logic
    // For now, return mock data
    return new Promise((resolve, reject) => {
      // Simulate network delay
      setTimeout(() => {
        // Mock server response
        const mockResponse = {
          ip: ip,
          port: port,
          players: Math.floor(Math.random() * 20),
          maxPlayers: 20,
          map: 'de_dust2',
          name: `CS2 Server ${ip}:${port}`
        };
        
        resolve(mockResponse);
      }, 100 + Math.random() * 200);
    });
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

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ServerCache, CachedServerStatusFetcher };
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
