// This is a corrected version of cs2-server-status.js with all fixes applied
/**
 * CS2 Server Status Integration with Cache Support
 */
const DEFAULT_CONFIG = {
  STEAM_API_KEY: import.meta.env.VITE_STEAM_API_KEY,
  SERVER_IP: '26.115.124.39', // IP fixo do seu servidor
  SERVER_PORT: '27015', // Porta fixa do seu servidor
  SERVER_NAME: '?', // Nome fictício fixo
  SERVER_REGION: '', // Será detectado automaticamente pela geolocalização do IP
  UPDATE_INTERVAL: 30000,
  FAST_INITIAL_INTERVAL: 1500,
  INITIAL_FAST_DURATION: 8000,
  REQUEST_TIMEOUT: 4000,
  MAX_RETRIES: 0,
  RETRY_DELAY: 500,
  DEBUG_MODE: import.meta.env.VITE_DEBUG_MODE === 'true',
  VERBOSE_LOGGING: true,
  CORS_PROXY: 'https://api.allorigins.win/get?url='
};

const DEFAULT_MAP_NAMES = {
  'de_dust2': 'Dust II',
  'de_mirage': 'Mirage',
  'de_inferno': 'Inferno',
  'de_cache': 'Cache',
  'de_overpass': 'Overpass',
  'de_vertigo': 'Vertigo'
};

const DEFAULT_GAME_MODES = {
  'competitive': 'Competitive',
  'casual': 'Casual',
  'deathmatch': 'Deathmatch',
  'armsrace': 'Arms Race'
};

// Configuration variables
let MAP_NAMES = DEFAULT_MAP_NAMES;
let GAME_MODES = DEFAULT_GAME_MODES;
let ConfigUtils = {
  isApiKeyConfigured: () => !!DEFAULT_CONFIG.STEAM_API_KEY,
  shouldUseMockData: () => false,
  getSteamApiUrl: (endpoint, params = {}) => {
    const baseUrl = 'https://api.steampowered.com/IGameServersService/GetServerList/v1/';
    const url = new URL(baseUrl);
    url.searchParams.append('key', DEFAULT_CONFIG.STEAM_API_KEY);
    url.searchParams.append('filter', `addr\\${DEFAULT_CONFIG.SERVER_IP}:${DEFAULT_CONFIG.SERVER_PORT}`);
    return url.toString();
  }
};

// Configuration helper functions
// Configuration helper functions
let getConfig = () => DEFAULT_CONFIG;

class CS2ServerStatus {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.configLoaded = false;
    this.initializeCache();
    
    this.isUpdating = false;
    this.updateTimer = null;
    this.retryCount = 0;
    this.lastUpdate = null;
    this.startTime = Date.now();
    this.serverData = {
      name: '?',
      map: '?',
      players: { current: 0, max: 32 },
      status: 'checking',
      ping: null,
      gameMode: '?',
      secure: true
    };
    
    // Bind methods
    this.fetchServerData = this.fetchServerData.bind(this);
    this.startAutoUpdate = this.startAutoUpdate.bind(this);
    this.stopAutoUpdate = this.stopAutoUpdate.bind(this);
    this.updateUI = this.updateUI.bind(this);
    this.updateServerRegion = this.updateServerRegion.bind(this);
    this.updateConnectionDetails = this.updateConnectionDetails.bind(this);
    this.updateServerTitle = this.updateServerTitle.bind(this);

    console.log('CS2ServerStatus initialized with cache support');
  }

  /**
   * Initialize cache system
   */
  initializeCache() {
    this.cache = {
      data: null,
      timestamp: null,
      set: (data) => {
        this.cache.data = data;
        this.cache.timestamp = Date.now();
        
        // Also update localStorage cache for persistence
        try {
          const cacheData = {
            data: data,
            timestamp: this.cache.timestamp
          };
          localStorage.setItem('cs2ServerCache', JSON.stringify(cacheData));
          console.log('💾 Server data saved to localStorage cache');
        } catch (e) {
          console.warn('⚠️ Could not save to localStorage:', e.message);
        }
      },
      get: () => {
        return this.cache.data;
      },
      isValid: () => {
        const now = Date.now();
        // Cache is valid for 5 minutes
        return this.cache.data && this.cache.timestamp && (now - this.cache.timestamp < 5 * 60 * 1000);
      },
      loadFromStorage: () => {
        try {
          const storedCache = localStorage.getItem('cs2ServerCache');
          if (storedCache) {
            const parsedCache = JSON.parse(storedCache);
            if (parsedCache && parsedCache.data && parsedCache.timestamp) {
              this.cache.data = parsedCache.data;
              this.cache.timestamp = parsedCache.timestamp;
              
              // Mark data as from cache
              this.cache.data.fromCache = true;
              
              console.log('🔄 Loaded server data from localStorage cache');
              return true;
            }
          }
        } catch (e) {
          console.warn('⚠️ Could not load from localStorage:', e.message);
        }
        return false;
      }
    };
    
    // Try to load from localStorage on init
    this.cache.loadFromStorage();
  }  async init() {
    console.log('🚀 Initializing CS2 server status with config:', this.config);
    
    try {
      // Use default hardcoded configuration
      this.configLoaded = true;
      this.config = { ...this.config, ...DEFAULT_CONFIG };
      console.log('📋 Configuration loaded, server IP:', this.config.SERVER_IP);
      
      // Emit config loaded event for UI updates
      document.dispatchEvent(new CustomEvent('serverConfigLoaded', {
        detail: this.config
      }));
      
      if (this.config.DEBUG_MODE) {
        const apiKey = this.config.STEAM_API_KEY;
        if (apiKey) {
          console.log(`🔑 API Key configured: ${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`);
        } else {
          console.warn('⚠️ No API Key configured');
        }
      }
      
      const cachedData = this.cache.get();
      if (cachedData && this.cache.isValid()) {
        console.log('📦 Using cached data initially');
        this.serverData = { ...cachedData, fromCache: true };
        this.updateUI(this.serverData);      }
        this.startAutoUpdate();
      
      // Wait for region detection with error handling
      try {
        await this.updateServerRegion();
        console.log('✅ Server region detection completed');
      } catch (error) {
        console.error('❌ Error during server region detection:', error);
      }
      
      this.updateConnectionDetails();
      this.updateServerTitle();
      
      return true;
    } catch (error) {
      console.error('❌ Error initializing CS2 server status:', error);
      return false;
    }
  }
  /**
   * Fetch server data from Steam API
   */
  async fetchServerData() {
    if (this.isUpdating) {
      console.log('⏱️ Already updating, skipping fetch');
      return this.serverData;
    }
    
    this.isUpdating = true;
    console.log('🔄 Fetching server data...');
    
    // 🔌 VPN DETECTION: Check if server IP is VPN before trying to fetch
    const serverIP = this.config.SERVER_IP || '127.0.0.1';
    if (this.isPrivateNetworkIP(serverIP)) {
      console.log('🔌 VPN server detected:', serverIP);
      const vpnData = this.getVpnServerData();
      
      // Update cache with VPN data
      this.cache.set(vpnData);
      
      // Update UI with VPN data
      this.updateUI(vpnData);
      
      // Update VPN indicators
      this.updateVpnIndicators(vpnData);
      
      // Update last update time
      this.lastUpdate = new Date();
      this.serverData = vpnData;
      this.isUpdating = false;
      return vpnData;
    }
    
    try {
      // Temporary UI update to show checking status if we don't have data yet
      if (this.serverData.status === 'checking') {
        this.updateUI({ ...this.serverData, status: 'checking' });
      }
      
      // Get API URL
      const steamApiUrl = ConfigUtils.getSteamApiUrl();
      const corsProxy = this.config.CORS_PROXY;
      const proxyUrl = corsProxy + encodeURIComponent(steamApiUrl);
      
      console.log('🌐 Fetching from:', proxyUrl);
      
      // Use the timeout option
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.REQUEST_TIMEOUT);
      
      const response = await fetch(proxyUrl, { 
        signal: controller.signal 
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Fetch successful');
      
      // Process API response
      const serverData = this.processApiResponse(data);
        // Update cache with new data including region info
      this.cache.set(serverData);
      
      // Update UI with new data
      this.updateUI(serverData);
      
      // If we got new Steam region data, update the region display immediately
      if (serverData.steamRegion && serverData.steamRegion.detectedCountryCode) {
        console.log('🎯 New Steam region detected, updating display immediately');
        this.updateRegionFlag(serverData.steamRegion.detectedCountryCode);
      }
      
      // Update last update time
      this.lastUpdate = new Date();
      this.retryCount = 0;
      this.serverData = serverData;
      
      this.isUpdating = false;
      return serverData;
    } catch (error) {
      console.error('❌ Error fetching server data:', error.message);
      
      // Check if we should retry
      if (this.retryCount < this.config.MAX_RETRIES) {
        this.retryCount++;
        console.log(`⏱️ Retry ${this.retryCount}/${this.config.MAX_RETRIES} in ${this.config.RETRY_DELAY}ms`);
        
        // Schedule retry
        setTimeout(() => {
          this.isUpdating = false;
          this.fetchServerData();
        }, this.config.RETRY_DELAY);
      } else {
        // Max retries reached, update UI with offline status
        const offlineData = this.getOfflineServerData();
        this.updateUI(offlineData);
        this.serverData = offlineData;
        this.isUpdating = false;
      }
      
      return this.serverData;
    }
  }
  /**
   * Get offline server data object
   */
  getOfflineServerData() {
    // Use dynamic name if we have it from previous API calls, otherwise fallback
    const dynamicName = this.serverData?.name || this.config.SERVER_NAME || '?';
    
    return {
      name: dynamicName,
      map: 'Unknown',
      players: { current: 0, max: 32 },
      status: 'offline',
      ping: null,
      gameMode: 'Unknown',
      secure: true,
      lastUpdate: new Date().toISOString(),
      fromCache: false
    };
  }

  /**
   * Get VPN server data for detected VPN networks
   */
  getVpnServerData() {
    // Use dynamic name if we have it from previous API calls, otherwise fallback
    const dynamicName = this.serverData?.name || this.config.SERVER_NAME || '?';
    
    return {
      name: dynamicName,
      map: '?',
      players: { current: 0, max: 32 },
      status: 'vpn',
      ping: null,
      gameMode: '?',
      secure: true,
      lastUpdate: new Date().toISOString(),
      isVpnServer: true,
      fromCache: false
    };
  }
  /**
   * Process Steam API response
   */
  processApiResponse(data) {
    console.log('🔍 Processing API response data structure');
    
    try {
      // Se estamos usando o CORS proxy, o resultado real pode estar dentro de propriedade 'contents'
      const apiData = data.contents ? JSON.parse(data.contents) : data;
      
      // Verificar se temos a estrutura esperada da API da Steam
      if (!apiData || !apiData.response || !apiData.response.servers || !apiData.response.servers.length) {
        console.warn('⚠️ Resposta da API sem servidores:', apiData);
        return this.getOfflineServerData();
      }
      
      // Pegar o primeiro servidor da lista
      const serverInfo = apiData.response.servers[0];
      console.log('📊 Dados do servidor encontrado:', JSON.stringify(serverInfo, null, 2));
      
      // Extrair informações de região da API Steam se disponível
      const regionInfo = this.extractSteamRegionInfo(serverInfo);
      console.log('🌍 Informações de região extraídas da Steam API:', regionInfo);
      
      return {
        name: serverInfo.name || '?',
        map: serverInfo.map || 'Unknown',
        players: { 
          current: serverInfo.players || 0, 
          max: serverInfo.max_players || 32 
        },
        status: 'online',
        ping: serverInfo.ping || null,
        gameMode: this.mapGameMode(serverInfo.gametype) || 'Retake',
        secure: serverInfo.secure === true || serverInfo.secure === 1,
        lastUpdate: new Date().toISOString(),
        fromCache: false,
        // Adicionar informações de região da Steam API
        steamRegion: regionInfo
      };
    } catch (error) {
      console.error('❌ Erro ao processar resposta da API:', error);
      return this.getOfflineServerData();
    }
  }
  /**
   * Extract region information from Steam API response
   */
  extractSteamRegionInfo(serverInfo) {
    console.log('🔍 Extracting region info from Steam API response...');
    console.log('📋 Raw server info for region extraction:', JSON.stringify(serverInfo, null, 2));
    
    if (!serverInfo) {
      console.warn('⚠️ No server info provided for region extraction');
      return null;
    }
    
    // Check various possible fields that might contain region information
    const regionFields = [
      'region', 'country', 'location', 'geo', 'datacenter', 
      'server_region', 'game_server_region', 'addr', 'gameaddr',
      'steamid', 'version', 'product', 'appid', 'gamedir',
      // Additional fields that might contain location hints
      'name', 'hostname', 'server_name'
    ];
    
    let regionData = {};
    
    for (const field of regionFields) {
      if (serverInfo[field] !== undefined) {
        regionData[field] = serverInfo[field];
        console.log(`🎯 Found field "${field}": ${JSON.stringify(serverInfo[field])}`);
      }
    }
    
    // Log all available fields for debugging
    console.log('🔍 All available server fields:', Object.keys(serverInfo));
    
    // Try to map Steam region codes to country codes
    const countryCode = this.mapSteamRegionToCountry(regionData);
    
    // If no region found in standard fields, try to extract from server name or IP
    let additionalInfo = {};
    if (!countryCode && serverInfo.name) {
      additionalInfo.nameBasedRegion = this.extractRegionFromServerName(serverInfo.name);
      console.log('🏷️ Attempting region extraction from server name:', additionalInfo.nameBasedRegion);
    }
    
    return {
      ...regionData,
      ...additionalInfo,
      detectedCountryCode: countryCode || additionalInfo.nameBasedRegion,
      source: 'steam_api',
      extractionTimestamp: new Date().toISOString()
    };
  }

  /**
   * Extract region hints from server name
   */
  extractRegionFromServerName(serverName) {
    console.log('🏷️ Extracting region from server name:', serverName);
    
    if (!serverName || typeof serverName !== 'string') {
      return null;
    }
    
    const name = serverName.toLowerCase();
    
    // Common region indicators in server names
    const regionIndicators = {
      // Brazil
      'br': 'br', 'brazil': 'br', 'brasil': 'br', 'sao paulo': 'br', 'sp': 'br',
      'rio': 'br', 'rj': 'br', 'belo horizonte': 'br', 'bh': 'br',
      // US
      'us': 'us', 'usa': 'us', 'america': 'us', 'ny': 'us', 'la': 'us',
      'chicago': 'us', 'dallas': 'us', 'atlanta': 'us',
      // Europe
      'eu': 'de', 'europe': 'de', 'germany': 'de', 'berlin': 'de',
      'france': 'fr', 'paris': 'fr', 'uk': 'gb', 'london': 'gb'
    };
    
    for (const [indicator, code] of Object.entries(regionIndicators)) {
      if (name.includes(indicator)) {
        console.log(`✅ Region indicator found in name: ${indicator} -> ${code.toUpperCase()}`);
        return code;
      }
    }
    
    return null;
  }
  /**
   * Map Steam region information to ISO country codes
   */
  mapSteamRegionToCountry(regionData) {
    console.log('🗺️ Mapping Steam region data to country code:', regionData);
    
    // Steam region code mappings (comprehensive list)
    const steamRegionMap = {
      // Steam datacenter regions
      'useastcoast': 'us',
      'uswestcoast': 'us',
      'useast': 'us',
      'uswest': 'us',
      'ussouth': 'us',
      'usnorth': 'us',
      'us': 'us',
      'northamerica': 'us',
      'na': 'us',
      
      // Europe regions
      'europe': 'de',
      'eu': 'de',
      'eurwest': 'de',
      'eureast': 'de',
      'euwest': 'de',
      'eueast': 'de',
      'eunorth': 'se',
      'eusouth': 'it',
      
      // Asia-Pacific
      'asia': 'jp',
      'asiapacific': 'jp',
      'apac': 'jp',
      'japan': 'jp',
      'jp': 'jp',
      'korea': 'kr',
      'kr': 'kr',
      'china': 'cn',
      'cn': 'cn',
      'singapore': 'sg',
      'sg': 'sg',
      'hongkong': 'hk',
      'hk': 'hk',
      'india': 'in',
      'in': 'in',
      
      // Oceania
      'australia': 'au',
      'au': 'au',
      'oceania': 'au',
      'newzealand': 'nz',
      'nz': 'nz',
      
      // South America (Critical for Brazilian servers)
      'southamerica': 'br',
      'sa': 'br',
      'southam': 'br',
      'latam': 'br',
      'latinamerica': 'br',
      'brazil': 'br',
      'brasil': 'br',
      'br': 'br',
      'argentina': 'ar',
      'ar': 'ar',
      'chile': 'cl',
      'cl': 'cl',
      'peru': 'pe',
      'pe': 'pe',
      'colombia': 'co',
      'co': 'co',
      
      // Africa & Middle East
      'africa': 'za',
      'middleeast': 'ae',
      'me': 'ae',
      
      // Specific countries
      'united states': 'us',
      'usa': 'us',
      'canada': 'ca',
      'germany': 'de',
      'deutschland': 'de',
      'france': 'fr',
      'uk': 'gb',
      'united kingdom': 'gb',
      'spain': 'es',
      'italy': 'it',
      'netherlands': 'nl',
      'sweden': 'se',
      'norway': 'no',
      'russia': 'ru',
      'poland': 'pl'
    };
    
    // Check each region field for mappable values
    for (const [field, value] of Object.entries(regionData)) {
      if (typeof value === 'string') {
        const normalizedValue = value.toLowerCase().trim().replace(/[_\-\s]+/g, '');
        
        // Direct mapping
        if (steamRegionMap[normalizedValue]) {
          console.log(`✅ Steam region mapped: ${value} -> ${steamRegionMap[normalizedValue].toUpperCase()}`);
          return steamRegionMap[normalizedValue];
        }
        
        // Partial matching for compound region names
        for (const [regionKey, countryCode] of Object.entries(steamRegionMap)) {
          if (normalizedValue.includes(regionKey) || regionKey.includes(normalizedValue)) {
            console.log(`✅ Steam region partial match: ${value} -> ${countryCode.toUpperCase()}`);
            return countryCode;
          }
        }
        
        // Special case: Check for Brazilian hosting providers
        const brazilianIndicators = ['locaweb', 'uol', 'terra', 'ig', 'globo', 'sao paulo', 'rio de janeiro', 'sp', 'rj'];
        for (const indicator of brazilianIndicators) {
          if (normalizedValue.includes(indicator)) {
            console.log(`✅ Brazilian hosting indicator found: ${value} -> BR`);
            return 'br';
          }
        }
      }
    }
    
    console.log('⚠️ No Steam region mapping found');
    return null;
  }
  
  /**
   * Map game type to user-friendly game mode
   */
  mapGameMode(gameType) {
    if (!gameType) return 'Competitive';
    
    // Handle complex gametype strings like "dm,executes,firegames,gloves,knife,mix,multicfg,retake,retake p"
    const gameTypeStr = gameType.toLowerCase();
    
    if (gameTypeStr.includes('retake')) return 'Retake';
    if (gameTypeStr.includes('dm') || gameTypeStr.includes('deathmatch')) return 'Deathmatch';
    if (gameTypeStr.includes('executes')) return 'Executes';
    if (gameTypeStr.includes('casual')) return 'Casual';
    if (gameTypeStr.includes('competitive')) return 'Competitive';
    if (gameTypeStr.includes('armsrace')) return 'Arms Race';
    if (gameTypeStr.includes('demolition')) return 'Demolition';
    if (gameTypeStr.includes('dangerzone')) return 'Danger Zone';
    
    return 'Custom';
  }

  /**
   * Check if IP is in private network range (RFC 1918, RFC 6598) or VPN ranges
   */
  isPrivateNetworkIP(ip) {
    if (!ip || typeof ip !== 'string') return false;
    
    // Split IP into octets
    const octets = ip.split('.');
    if (octets.length !== 4) return false;
    
    // Convert to integers
    const o1 = parseInt(octets[0], 10);
    const o2 = parseInt(octets[1], 10);
    
    // Check standard private IP ranges
    if (o1 === 10) return true; // 10.0.0.0/8
    if (o1 === 172 && (o2 >= 16 && o2 <= 31)) return true; // 172.16.0.0/12
    if (o1 === 192 && o2 === 168) return true; // 192.168.0.0/16
    if (o1 === 169 && o2 === 254) return true; // 169.254.0.0/16 (link-local)
    
    // Check VPN service specific ranges
    if (o1 === 25) return true; // Hamachi
    if (o1 === 26) return true; // Radmin VPN
    
    return false;
  }
  /**
   * Start auto-updating server data
   */
  startAutoUpdate() {
    console.log('⏱️ Starting ULTRA FAST auto-update');
    
    // ⚡ IMEDIATO: Primeira verificação instantânea
    setTimeout(() => this.fetchServerData(), 100);
    
    // ⚡ POLLING INICIAL RÁPIDO: Verificações a cada 1.5s nos primeiros 8s
    const fastTimer = setInterval(() => {
      console.log('⚡ Fast initial polling');
      this.fetchServerData();
    }, this.config.FAST_INITIAL_INTERVAL);
    
    // ⚡ TRANSIÇÃO: Após 8s, muda para polling normal
    setTimeout(() => {
      clearInterval(fastTimer);
      console.log('🔄 Switching to normal polling interval');
      
      // Set up normal auto-update interval
      this.updateTimer = setInterval(() => {
        this.fetchServerData();
      }, this.config.UPDATE_INTERVAL);
    }, this.config.INITIAL_FAST_DURATION);
  }
  /**
   * Stop auto-updating server data
   */
  stopAutoUpdate() {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }
    if (this.fastTimer) {
      clearInterval(this.fastTimer);
      this.fastTimer = null;
    }
    console.log('⏹️ Auto-update stopped');
  }

  /**
   * Update the UI with server data
   */
  updateUI(data) {
    console.log('🎨 Updating UI with server data:', data);
      // Get UI elements
    const statusDot = document.getElementById('server-status-dot');
    const statusText = document.getElementById('server-status-text');
    const mapElement = document.getElementById('server-map');
    const playersElement = document.getElementById('server-players');
    const modeElement = document.getElementById('server-mode');
    const latencyElement = document.getElementById('server-latency');
    const serverTitleElement = document.getElementById('server-title');// Map image and name elements
    const mapImageElement = document.getElementById('current-map-image');
    const mapNameElement = document.getElementById('current-map-name');
    const mapLoadingText = document.getElementById('map-loading-text');
      // Debug: Log which elements were found
    console.log('🔍 UI Elements found:', {
      statusDot: !!statusDot,
      statusText: !!statusText,
      mapElement: !!mapElement,
      playersElement: !!playersElement,
      modeElement: !!modeElement,
      latencyElement: !!latencyElement,
      serverTitleElement: !!serverTitleElement,
      mapImageElement: !!mapImageElement,
      mapNameElement: !!mapNameElement,
      mapLoadingText: !!mapLoadingText    });
    
    // Debug: Log current map data
    console.log('🗺️ Map data being processed:', {
      mapName: data.map,
      status: data.status,
      serverName: data.name,
      hasMapLoadingText: !!mapLoadingText
    });
    
    // 🏷️ Update server title with dynamic name from Steam API
    if (serverTitleElement && data.name) {
      const dynamicServerName = data.name;
      console.log(`🏷️ Updating server title to: "${dynamicServerName}"`);
      
      // Remove data-translate attribute to prevent translation system from overriding
      serverTitleElement.removeAttribute('data-translate');
      serverTitleElement.textContent = dynamicServerName;
    } else if (serverTitleElement) {
      // Fallback to static name if no dynamic name available
      const fallbackName = this.config.SERVER_NAME || '?';
      console.log(`🏷️ Using fallback server name: "${fallbackName}"`);
      serverTitleElement.textContent = fallbackName;
    }
      
    // Update status dot and text
    if (statusDot && statusText) {
      if (data.status === 'online') {
        statusDot.className = 'status-dot online';
        statusText.textContent = 'ONLINE';
        statusText.className = 'server-status online';
      } else if (data.status === 'vpn') {
        statusDot.className = 'status-dot vpn';
        statusText.textContent = 'SERVIDOR VPN';
        statusText.className = 'server-status vpn';
      } else if (data.status === 'checking') {
        statusDot.className = 'status-dot checking';
        statusText.textContent = 'VERIFICANDO';
        statusText.className = 'server-status checking';
      } else {
        statusDot.className = 'status-dot offline';
        statusText.textContent = 'OFFLINE';
        statusText.className = 'server-status offline';
      }    }
    
    // Only update other elements if server is online (not VPN)
    if (data.status === 'online') {
      // Update map
      if (mapElement) {
        mapElement.textContent = data.map;
        mapElement.style.opacity = '1';
      }
      
      // Update players
      if (playersElement) {
        playersElement.textContent = `${data.players.current}/${data.players.max}`;
        playersElement.style.opacity = '1';
      }
      
      // Update game mode
      if (modeElement) {
        modeElement.textContent = data.gameMode;
        modeElement.style.opacity = '1';
      }
      
      // Update latency
      if (latencyElement) {
        if (data.ping !== null) {
          latencyElement.textContent = `${data.ping}ms`;
        } else {
          latencyElement.textContent = '-';
        }
        latencyElement.style.opacity = '1';
      }
      
      // Update map image if exists
      if (mapImageElement) {
        const mapName = data.map.toLowerCase();
        const mapImagePath = this.getMapImagePath(mapName);
        mapImageElement.src = mapImagePath;
        mapImageElement.style.opacity = '1';
      }
        // Update map name if exists
      if (mapNameElement) {
        const friendlyMapName = this.getFriendlyMapName(data.map);
        mapNameElement.textContent = friendlyMapName;
        mapNameElement.style.opacity = '1';
      }      // Update map loading text - hide it when server is online and map is loaded
      if (mapLoadingText) {
        if (data.map && data.map !== '?' && data.map !== 'Unknown') {
          // Remove data-translate attribute to prevent translation system from overriding
          mapLoadingText.removeAttribute('data-translate');
          mapLoadingText.style.display = 'none';
          console.log('🔄 Map loading text hidden - map loaded:', data.map);
        } else {
          // Restore data-translate attribute and show loading text
          mapLoadingText.setAttribute('data-translate', 'servers.map.loading');
          mapLoadingText.style.display = 'block';
          mapLoadingText.textContent = 'Carregando informações...'; // Set fallback text
          console.log('🔄 Map loading text shown - map not loaded:', data.map);
        }
      } else {
        console.warn('⚠️ mapLoadingText element not found!');
      }} else {
      // Fade out details if offline or checking
      if (mapElement) mapElement.style.opacity = '0.3';
      if (playersElement) playersElement.style.opacity = '0.3';
      if (modeElement) modeElement.style.opacity = '0.3';
      if (latencyElement) latencyElement.style.opacity = '0.3';
      if (mapImageElement) mapImageElement.style.opacity = '0.3';
      if (mapNameElement) mapNameElement.style.opacity = '0.3';      // Show loading text when server is not online
      if (mapLoadingText) {
        // Restore data-translate attribute and show loading text
        mapLoadingText.setAttribute('data-translate', 'servers.map.loading');
        mapLoadingText.style.display = 'block';
        mapLoadingText.textContent = 'Carregando informações...'; // Set fallback text
        console.log('🔄 Map loading text shown - server not online, status:', data.status);
      } else {
        console.warn('⚠️ mapLoadingText element not found in offline section!');
      }
    }
    
    // 🔌 Update VPN indicators based on status
    this.updateVpnIndicators(data);
      // Update region flag if we have new Steam region data
    if (data.steamRegion && data.steamRegion.detectedCountryCode) {
      this.updateRegionFlag(data.steamRegion.detectedCountryCode);
    }
    
    // Dispatch event to notify other components of update
    const event = new CustomEvent('serverStatusUpdated', { detail: data });
    document.dispatchEvent(event);
    
    // Also update all dynamic fields that contain server data
    this.updateDynamicFields(data);
  }
  /**
   * Get map image path based on map name
   */
  getMapImagePath(mapName) {
    // Normalize map name - remove prefix like de_
    const normalizedName = mapName.replace(/^[a-z]{2}_/, '');
    
    // Check if we have this map image
    const knownMaps = ['dust2', 'mirage', 'inferno', 'nuke', 'train', 'vertigo', 'overpass', 'cache'];
    if (knownMaps.includes(normalizedName)) {
      // Use relative path that works both locally and on GitHub Pages
      return `./img/maps/${normalizedName}.svg`;
    }
    
    // Default unknown map image
    return './img/maps/unknown.svg';
  }
  /**
   * Get friendly map name
   */
  getFriendlyMapName(mapName) {
    if (!mapName || mapName === '?' || mapName === 'Unknown') {
      return '?';
    }
    
    // Remove prefix (e.g., de_)
    const baseName = mapName.replace(/^[a-z]{2}_/, '').toLowerCase();
    
    // Map of known maps to their friendly names
    const friendlyMapNames = {
      'dust2': 'Dust II',
      'mirage': 'Mirage',
      'inferno': 'Inferno',
      'nuke': 'Nuke',
      'train': 'Train',
      'vertigo': 'Vertigo',
      'overpass': 'Overpass',
      'cache': 'Cache',
      'ancient': 'Ancient',
      'anubis': 'Anubis'
    };
    
    // Return friendly name if known, otherwise capitalize first letter
    return friendlyMapNames[baseName] || baseName.charAt(0).toUpperCase() + baseName.slice(1);
  }

  /**
   * Update all dynamic fields that contain server data
   */
  updateDynamicFields(data) {
    const dynamicFields = document.querySelectorAll('[data-server-field]');
    
    dynamicFields.forEach(field => {
      const fieldType = field.getAttribute('data-server-field');
      
      switch (fieldType) {
        case 'name':
          field.textContent = data.name;
          break;
        case 'map':
          field.textContent = data.map;
          break;
        case 'players':
          field.textContent = `${data.players.current}/${data.players.max}`;
          break;
        case 'game-mode':
          field.textContent = data.gameMode;
          break;
        case 'status':
          field.textContent = data.status.toUpperCase();
          break;
        case 'ping':
          field.textContent = data.ping ? `${data.ping}ms` : '-';
          break;
        case 'last-update':
          const lastUpdate = new Date(data.lastUpdate);
          field.textContent = lastUpdate.toLocaleTimeString();
          break;
      }
    });
  }  /**
   * Update server region display with country flag only
   */
  async updateServerRegion() {
    console.log('🔍 Starting server region update with Steam API priority...');
    
    // Find elements with more robust selectors
    const regionTextElement = document.getElementById('server-region');
    
    if (!regionTextElement) {
      console.warn('⚠️ server-region element not found');
      return;
    }
    
    const regionContainer = regionTextElement.parentElement;
    const flagElement = regionContainer.querySelector('.fi');
    
    if (!flagElement) {
      console.warn('⚠️ Flag element (.fi) not found');
      return;
    }
    
    console.log('✅ Found region elements, proceeding with country detection...');
    
    try {
      let countryCode = null;
      
      // PRIORITY 1: Check if we have Steam API region information from server data
      if (this.serverData && this.serverData.steamRegion && this.serverData.steamRegion.detectedCountryCode) {
        countryCode = this.serverData.steamRegion.detectedCountryCode;
        console.log(`🎯 Using Steam API region: ${countryCode.toUpperCase()}`);
      } 
      
      // PRIORITY 2: If no Steam region data, try to get it directly from current server status
      if (!countryCode) {
        console.log('🔄 No cached Steam region data, attempting direct Steam API region lookup...');
        countryCode = await this.getSteamRegionFromCurrentData();
      }
      
      // PRIORITY 3: Fallback to IP-based geolocation
      if (!countryCode) {
        console.log('🔄 Steam API region lookup failed, falling back to IP geolocation...');
        countryCode = await this.getCountryFromIP(this.config.SERVER_IP);
      }
      
      if (countryCode) {
        // Update flag to the detected country
        const newFlagClass = `fi fi-${countryCode.toLowerCase()}`;
        flagElement.className = newFlagClass;
        
        // Hide the text, show only the flag
        regionTextElement.style.display = 'none';
        
        console.log(`🏁 Server region flag updated to: ${countryCode.toUpperCase()} (class: ${newFlagClass})`);
      } else {
        // Fallback to Brazil if all detection methods fail
        flagElement.className = 'fi fi-br';
        regionTextElement.style.display = 'none';
        console.log('🏁 Using fallback flag: Brazil');
      }
    } catch (error) {
      console.error('❌ Error updating server region:', error);
      // Fallback to Brazil flag
      if (flagElement) {
        flagElement.className = 'fi fi-br';
        regionTextElement.style.display = 'none';
        console.log('🏁 Applied fallback flag due to error');
      }
    }
  }

  /**
   * Attempt to get region information directly from current Steam API data
   */
  async getSteamRegionFromCurrentData() {
    console.log('🎮 Attempting to get Steam region from current API data...');
    
    try {
      // If we have recent server data with Steam region info, use it
      if (this.serverData && this.serverData.steamRegion) {
        const regionInfo = this.serverData.steamRegion;
        if (regionInfo.detectedCountryCode) {
          console.log(`✅ Found Steam region in current data: ${regionInfo.detectedCountryCode.toUpperCase()}`);
          return regionInfo.detectedCountryCode;
        }
      }
      
      // If we don't have region data yet, try a quick Steam API call specifically for region info
      const steamApiUrl = ConfigUtils.getSteamApiUrl();
      const corsProxy = this.config.CORS_PROXY;
      const proxyUrl = corsProxy + encodeURIComponent(steamApiUrl);
      
      console.log('🌐 Making Steam API call for region data...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // Quick 3-second timeout
      
      const response = await fetch(proxyUrl, { 
        signal: controller.signal 
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      
      const data = await response.json();
      const processedData = this.processApiResponse(data);
      
      if (processedData.steamRegion && processedData.steamRegion.detectedCountryCode) {
        console.log(`✅ Steam API region detection successful: ${processedData.steamRegion.detectedCountryCode.toUpperCase()}`);
        return processedData.steamRegion.detectedCountryCode;
      }
      
    } catch (error) {
      console.warn('⚠️ Steam region lookup failed:', error.message);
    }
    
    return null;
  }/**
   * Get country code from IP address using geolocation API
   */
  async getCountryFromIP(ip) {
    console.log(`🌍 Detecting country for IP: ${ip}`);
    
    // First try the fallback method (which is very reliable for common ranges)
    const fallbackResult = this.getCountryFallback(ip);
    if (fallbackResult !== 'br' || (ip.startsWith('177.') || ip.startsWith('200.') || ip.startsWith('201.'))) {
      console.log(`🎯 Quick detection successful via IP range: ${fallbackResult.toUpperCase()}`);
      return fallbackResult;
    }
    
    // Only use API if fallback is uncertain
    const apis = [
      {
        name: 'ipapi.co via CORS proxy',
        url: `${this.config.CORS_PROXY}${encodeURIComponent(`https://ipapi.co/${ip}/country/`)}`,
        headers: { 'Accept': 'application/json' },
        useCorsProxy: true
      },
      {
        name: 'ip-api.com direct',
        url: `http://ip-api.com/json/${ip}?fields=countryCode`,
        headers: { 'Accept': 'application/json' },
        useCorsProxy: false
      }
    ];
    
    for (const api of apis) {
      try {
        console.log(`📡 Trying ${api.name}: ${api.url}`);
        
        const response = await fetch(api.url, {
          method: 'GET',
          headers: api.headers,
          signal: AbortSignal.timeout(5000) // 5 second timeout
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        let countryCode;
        if (api.useCorsProxy) {
          const data = await response.json();
          countryCode = data.contents?.trim();
        } else {
          const data = await response.json();
          countryCode = data.countryCode;
        }
        
        console.log(`📋 Country code from ${api.name}: "${countryCode}"`);
        
        if (countryCode && countryCode.length === 2 && /^[A-Z]{2}$/i.test(countryCode.trim())) {
          const cleanCode = countryCode.trim().toLowerCase();
          console.log(`✅ API detection successful via ${api.name}: ${cleanCode.toUpperCase()}`);
          return cleanCode;
        }
      } catch (error) {
        console.warn(`⚠️ ${api.name} failed:`, error.message);
        continue;
      }
    }
    
    console.log(`🔄 API detection failed, using fallback result: ${fallbackResult.toUpperCase()}`);
    return fallbackResult;
  }  /**
   * Fallback country detection based on IP ranges
   */
  getCountryFallback(ip) {
    console.log(`🔍 Using fallback detection for IP: ${ip}`);
    
    if (!ip || typeof ip !== 'string') {
      console.log('❌ Invalid IP provided, defaulting to Brazil');
      return 'br';
    }

    const octets = ip.split('.').map(num => parseInt(num, 10));
    if (octets.length !== 4) {
      console.log('❌ Invalid IP format, defaulting to Brazil');
      return 'br';
    }

    const [o1, o2, o3] = octets;
    console.log(`🔢 IP octets: ${o1}.${o2}.${o3}.x`);

    // Specific check for the server IP (177.54.144.181)
    if (o1 === 177 && o2 === 54 && o3 === 144) {
      console.log('🇧🇷 Exact match for server IP - Brazil confirmed');
      return 'br';
    }

    // Brazil IP ranges (more comprehensive)
    if ((o1 >= 177 && o1 <= 191) || 
        (o1 >= 200 && o1 <= 201) || 
        (o1 >= 186 && o1 <= 190) ||
        (o1 === 164 && o2 >= 41 && o2 <= 42)) {
      console.log('🇧🇷 IP range matches Brazil');
      return 'br';
    }
    
    // US IP ranges (simplified but more accurate)
    if ((o1 >= 3 && o1 <= 6) || 
        (o1 >= 8 && o1 <= 15) || 
        (o1 >= 16 && o1 <= 31) ||
        (o1 >= 44 && o1 <= 47) ||
        (o1 >= 54 && o1 <= 55) ||
        (o1 >= 64 && o1 <= 79)) {
      console.log('🇺🇸 IP range matches United States');
      return 'us';
    }

    // Europe IP ranges (simplified) - default to Germany
    if ((o1 >= 80 && o1 <= 95) || 
        (o1 >= 193 && o1 <= 194) ||
        (o1 >= 212 && o1 <= 213)) {
      console.log('🇩🇪 IP range matches Germany/Europe');
      return 'de';
    }

    // Default to Brazil (since this is a Brazilian server project)
    console.log('🇧🇷 No specific range matched, defaulting to Brazil');
    return 'br';
  }

  /**
   * Update connection details (IP and port)
   */
  updateConnectionDetails() {
    const addressElement = document.getElementById('server-address');
    if (addressElement) {
      addressElement.textContent = `${this.config.SERVER_IP}:${this.config.SERVER_PORT}`;
    }
    
    // Update Steam connect button
    const steamConnectButton = document.getElementById('steam-connect-button');
    if (steamConnectButton) {
      const serverAddress = `${this.config.SERVER_IP}:${this.config.SERVER_PORT}`;
      steamConnectButton.addEventListener('click', (e) => {
        e.preventDefault();
        window.open(`steam://connect/${serverAddress}`, '_blank');
      });
    }
  }

  /**
   * Update server title
   */
  updateServerTitle() {
    const titleElement = document.getElementById('server-title');
    if (titleElement) {
      const serverName = import.meta.env.VITE_SERVER_NAME || '?';
      titleElement.textContent = serverName;
    }
  }

  /**
   * Update VPN indicators on both pages
   */
  updateVpnIndicators(data) {
    // Update VPN indicator on servers page
    const vpnIndicator = document.getElementById('vpn-indicator');
    if (vpnIndicator) {
      if (data.status === 'vpn' || data.isVpnServer) {
        vpnIndicator.style.display = 'flex';
        console.log('🔌 VPN indicator shown on servers page');
      } else {
        vpnIndicator.style.display = 'none';
      }
    }

    // Update VPN indicator on main page
    const mainVpnIndicator = document.getElementById('main-vpn-indicator');
    if (mainVpnIndicator) {
      if (data.status === 'vpn' || data.isVpnServer) {
        mainVpnIndicator.style.display = 'flex';
        mainVpnIndicator.style.opacity = '1';
        console.log('🔌 VPN indicator shown on main page');
      } else {
        mainVpnIndicator.style.display = 'none';
        mainVpnIndicator.style.opacity = '0';
      }
    }

    // Emit event for any other listeners
    if (data.status === 'vpn' || data.isVpnServer) {
      document.dispatchEvent(new CustomEvent('vpnServerDetected', { detail: data }));
      console.log('🎯 VPN server detected event dispatched');
    }
  }

  /**
   * Update region flag display with given country code
   */
  updateRegionFlag(countryCode) {
    console.log(`🏁 Updating region flag to: ${countryCode.toUpperCase()}`);
    
    const regionTextElement = document.getElementById('server-region');
    if (!regionTextElement) return;
    
    const regionContainer = regionTextElement.parentElement;
    const flagElement = regionContainer.querySelector('.fi');
    
    if (flagElement && countryCode) {
      const newFlagClass = `fi fi-${countryCode.toLowerCase()}`;
      flagElement.className = newFlagClass;
      regionTextElement.style.display = 'none'; // Keep text hidden
      console.log(`✅ Flag updated to: ${newFlagClass}`);
    }
  }
}

export { CS2ServerStatus };

document.addEventListener('DOMContentLoaded', () => {
  const cs2ServerStatus = new CS2ServerStatus();
  cs2ServerStatus.init();
  window.cs2ServerStatus = cs2ServerStatus;
  console.log('✅ CS2ServerStatus initialized and exposed to window');
});
