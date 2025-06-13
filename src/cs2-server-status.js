/**
 * CS2 Server Status Integration with Cache Support
 * Integração em tempo real com dados de servidor Counter-Strike 2
 * Usando Steam Web API e vanilla JavaScript + Sistema de Cache
 */

// Default configuration - Optimized for faster response
// Usando variáveis de ambiente para dados sensíveis
const DEFAULT_CONFIG = {
  STEAM_API_KEY: process.env.STEAM_API_KEY || '',
  SERVER_IP: process.env.SERVER_IP || '127.0.0.1',
  SERVER_PORT: process.env.SERVER_PORT || '27015',
  UPDATE_INTERVAL: 15000,          // Reduced from 30s to 15s for faster updates
  FAST_INITIAL_INTERVAL: 3000,     // Fast polling for first 30 seconds
  INITIAL_FAST_DURATION: 30000,    // Duration of fast polling
  REQUEST_TIMEOUT: 8000,           // Reduced from 10s to 8s
  MAX_RETRIES: 2,                  // Reduced retries for faster failure detection
  RETRY_DELAY: 5000,               // Reduced retry delay from 30s to 5s
  DEBUG_MODE: false,
  VERBOSE_LOGGING: false,
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
let SERVER_CONFIG = DEFAULT_CONFIG;
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

let getConfig = () => DEFAULT_CONFIG;

// Async function to load configuration
async function loadConfiguration() {
  try {
    const configModule = await import('./server-config.js');
    ({ SERVER_CONFIG, MAP_NAMES, GAME_MODES, ConfigUtils, getConfig } = configModule);
    console.log('✅ Configuration module loaded successfully');
    return true;
  } catch (error) {
    console.warn('⚠️ Could not load server-config.js, using defaults:', error.message);
    return false;
  }
}

class CS2ServerStatus {  constructor(config = {}) {
    // Initialize with default config first
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.configLoaded = false;
    
    // Initialize cache system
    this.initializeCache();
      // State variables
    this.isUpdating = false;
    this.updateTimer = null;
    this.retryCount = 0;
    this.lastUpdate = null;
    this.startTime = Date.now(); // Track initialization time for fast polling
    this.serverData = {
      name: 'A GREAT CHAOS 01',
      map: '?',
      players: { current: 0, max: 32 },
      status: 'unknown',
      ping: null,
      gameMode: '?',
      secure: true
    };    // Bind methods
    this.fetchServerData = this.fetchServerData.bind(this);
    this.startAutoUpdate = this.startAutoUpdate.bind(this);
    this.stopAutoUpdate = this.stopAutoUpdate.bind(this);
    this.updateUI = this.updateUI.bind(this);
    this.updateServerRegion = this.updateServerRegion.bind(this);
    this.updateConnectionDetails = this.updateConnectionDetails.bind(this);
    this.updateServerTitle = this.updateServerTitle.bind(this);

    console.log('CS2ServerStatus initialized with cache support');
    
    // Setup language change handling
    this.setupLanguageChangeListener();
    
    // Load configuration asynchronously
    this.loadConfig().then(() => {
      // Initialize server region and connection details after config is loaded
      this.updateServerRegion();
      this.updateConnectionDetails();
      this.updateServerTitle();
    });
  }
    async loadConfig() {
    try {
      const loaded = await loadConfiguration();
      if (loaded) {
        const loadedConfig = getConfig(window.location.hostname === 'localhost' ? 'development' : 'production');
        this.config = { ...this.config, ...loadedConfig };
        this.configLoaded = true;
        console.log('✅ CS2ServerStatus config updated:', this.config);
      } else {
        console.log('📄 CS2ServerStatus using default config');
      }
      return this.config;
    } catch (error) {
      console.warn('⚠️ Error loading config:', error);
      return this.config;
    }
  }
  /**
   * Initialize cache system - Optimized for faster initial response
   */
  initializeCache() {
    try {
      if (typeof window !== 'undefined' && window.CachedServerStatusFetcher) {
        this.cachedFetcher = new window.CachedServerStatusFetcher({
          cache: {
            cacheDuration: this.config.FAST_INITIAL_INTERVAL || 3000, // Use fast interval for cache duration initially
            maxCacheSize: 10,
            enabled: true
          },
          retryAttempts: this.config.MAX_RETRIES || 2,
          retryDelay: 1000
        });
        console.log('✅ Cache system initialized with fast initial response');
      } else if (typeof window !== 'undefined' && window.globalServerCache) {
        this.cachedFetcher = window.globalServerCache;
        console.log('✅ Using global cache instance for CS2ServerStatus');
      } else {
        console.log('⚠️ Cache system not available, using direct fetching');
        this.cachedFetcher = null;
      }
    } catch (error) {
      console.warn('⚠️ Failed to initialize cache system:', error);
      this.cachedFetcher = null;
    }
  }

  /**
   * Fetch server data with cache support
   */
  async fetchServerData() {
    try {
      console.log('🔍 Fetching server data...');
      
      // Create server config object for cache
      const serverConfig = {
        ip: this.config.SERVER_IP,
        port: this.config.SERVER_PORT
      };

      // Try to get from cache first
      if (this.cachedFetcher) {
        console.log('💾 Attempting to fetch from cache...');
        try {
          const cachedResult = await this.cachedFetcher.fetchServerStatus(serverConfig);
          if (cachedResult) {
            console.log('✅ Got server data:', cachedResult.fromCache ? 'from cache' : 'fresh fetch');
            return this.formatServerData(cachedResult);
          }
        } catch (cacheError) {
          console.warn('⚠️ Cache fetch failed, falling back to direct fetch:', cacheError);
        }
      }

      // Fallback to direct fetch if cache is not available
      return await this.directFetchServerData();
      
    } catch (error) {
      console.error('❌ Error in fetchServerData:', error);
      this.retryCount++;
      
      return {
        name: this.serverData.name,
        map: '?',
        players: { current: 0, max: 32 },
        status: 'offline',
        ping: null,
        gameMode: '?',
        secure: false,
        error: error.message
      };
    }
  }

  /**
   * Direct server data fetch (without cache)
   */
  async directFetchServerData() {
    console.log('🔍 Direct fetching server data...');
    
    // Detect VPN/Private network
    const isPrivateNetwork = this.isPrivateNetworkIP(this.config.SERVER_IP);
    
    if (isPrivateNetwork) {
      console.log('🔌 Detected VPN/Private network server (IP: ' + this.config.SERVER_IP + ')');
      return this.getVpnServerData();
    }
    
    // For public servers, attempt real connection
    console.log('🌐 Attempting to fetch real server data from Steam API...');

    try {
      const steamApiUrl = ConfigUtils.getSteamApiUrl('SERVER_LIST', {
        filter: `addr\\${this.config.SERVER_IP}:${this.config.SERVER_PORT}`
      });
      
      const apiUrl = this.config.CORS_PROXY ? 
        `${this.config.CORS_PROXY}${encodeURIComponent(steamApiUrl)}` : 
        steamApiUrl;

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(this.config.REQUEST_TIMEOUT)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }      const data = await response.json();
      console.log('📊 Steam API Response:', JSON.stringify(data, null, 2));

      // Process successful response
      return this.processApiResponse(data);

    } catch (error) {
      console.error('❌ Steam API fetch failed:', error);
      
      // Return offline status for public servers
      return {
        name: 'A GREAT CHAOS 01',
        map: 'Unknown',
        players: { current: 0, max: 32 },
        status: 'offline',
        ping: null,
        gameMode: 'Unknown',
        secure: true,
        error: error.message,
        lastUpdate: new Date().toISOString()
      };
    }
  }

  /**
   * Format server data from cache or direct fetch
   */
  formatServerData(rawData) {
    if (!rawData) {
      return this.getOfflineServerData();
    }    // If data is already formatted (has players object with current/max), return as is
    if (rawData.name && rawData.map && rawData.players && typeof rawData.players === 'object' && rawData.players.current !== undefined && rawData.status) {
      return rawData;
    }

    // Format raw data from cache system or direct fetch
    return {
      name: rawData.name || 'A GREAT CHAOS 01',
      map: rawData.map || '?',
      players: {
        current: (typeof rawData.players === 'object' ? rawData.players.current : rawData.players) || 0,
        max: (typeof rawData.players === 'object' ? rawData.players.max : rawData.maxPlayers) || 32
      },
      status: rawData.status || 'unknown',
      ping: rawData.ping || null,
      gameMode: rawData.gameMode || '?',
      secure: rawData.secure !== false,
      lastUpdate: rawData.timestamp ? new Date(rawData.timestamp).toISOString() : new Date().toISOString(),
      fromCache: rawData.fromCache || false
    };
  }

  /**
   * Get offline server data
   */
  getOfflineServerData() {
    return {
      name: 'A GREAT CHAOS 01',
      map: 'Unknown',
      players: { current: 0, max: 32 },
      status: 'offline',
      ping: null,
      gameMode: 'Unknown',
      secure: true,
      lastUpdate: new Date().toISOString(),
      fromCache: false
    };
  }  /**
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
      
      return {
        name: serverInfo.name || 'A GREAT CHAOS 01',
        map: serverInfo.map || 'Unknown',
        players: { 
          current: serverInfo.players || 0, 
          max: serverInfo.max_players || 32 
        },
        status: 'online',
        ping: serverInfo.ping || 50,
        gameMode: this.mapGameMode(serverInfo.game_type) || 'Competitive',
        secure: serverInfo.secure == 1,
        lastUpdate: new Date().toISOString(),
        fromCache: false
      };
    } catch (error) {
      console.error('❌ Erro ao processar resposta da API:', error);
      return this.getOfflineServerData();
    }
  }
  
  /**
   * Map game type to user-friendly game mode
   */
  mapGameMode(gameType) {
    if (!gameType) return 'Competitive';
    
    const modeMap = {
      'competitive': 'Competitive',
      'casual': 'Casual',
      'deathmatch': 'Deathmatch',
      'armsrace': 'Arms Race',
      'demolition': 'Demolition',
      'dangerzone': 'Danger Zone',
      'custom': 'Custom'
    };
    
    const normalizedType = gameType.toLowerCase();
    return modeMap[normalizedType] || 'Competitive';
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
    const o3 = parseInt(octets[2], 10);
    
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
    
    // Add specific check for the known VPN IP if it's different than the configured server IP
    const configuredServerIP = this.config.SERVER_IP;
    if (configuredServerIP && ip === configuredServerIP) {
      // This is the configured server, so it's not a VPN
      return false;
    }
    
    return false;
  }
  /**
   * Map name to image path
   */
  getMapImagePath(mapName) {
    if (!mapName || mapName === '?') return './public/img/maps/unknown.svg';
    
    // Normalizar o nome do mapa (remover prefixos, espaços, etc.)
    let mapLower = mapName.toLowerCase().trim();
    
    // Checar se é apenas o nome sem prefixo (ex: "mirage" em vez de "de_mirage")
    if (!mapLower.includes('_')) {
      // Tentar adicionar o prefixo de_ se não tiver
      const withPrefix = 'de_' + mapLower;
      mapLower = withPrefix;
    }
    
    // Lista de imagens de mapas disponíveis
    const mapImages = {
      'de_dust2': './public/img/maps/dust2.svg',
      'de_mirage': './public/img/maps/mirage.svg',
      'de_inferno': './public/img/maps/inferno.svg',
      'de_nuke': './public/img/maps/unknown.svg',
      'de_overpass': './public/img/maps/unknown.svg',
      'de_vertigo': './public/img/maps/unknown.svg',
      'de_ancient': './public/img/maps/unknown.svg'
    };
    
    // Verificar se temos imagem para este mapa
    const mapPath = mapImages[mapLower];
    
    // Log para debug de imagens de mapas
    console.log(`🗺️ Mapa solicitado: "${mapName}" → normalizado: "${mapLower}" → caminho: "${mapPath || 'não encontrado'}"`);
    
    // Retornar o caminho da imagem ou o padrão "unknown" se não encontrado
    return mapPath || './public/img/maps/unknown.svg';
  }
  
  /**
   * Get VPN server data
   */
  getVpnServerData() {
    return {
      name: 'A GREAT CHAOS 01',
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
   * Start auto-update with callback - Optimized with fast initial polling
   */
  async startAutoUpdate(callback) {
    if (this.isUpdating) {
      console.log('⚠️ Auto-update already running');
      return;
    }

    this.isUpdating = true;
    this.startTime = Date.now();
    console.log('🔄 Starting optimized auto-update with fast initial polling...');

    const updateFunction = async () => {
      try {
        const data = await this.fetchServerData();
        this.serverData = data;
        this.lastUpdate = new Date();
        this.retryCount = 0;

        if (callback && typeof callback === 'function') {
          callback(data);
        }

        // Dispatch event for other systems
        window.dispatchEvent(new CustomEvent('serverStatusUpdate', {
          detail: data
        }));

        console.log(`🔄 Server status updated: ${data.status} (${data.players?.current || 0}/${data.players?.max || 32})`);

      } catch (error) {
        console.error('❌ Auto-update error:', error);
        this.retryCount++;
      }
    };

    // Initial update - immediate
    console.log('🚀 Performing initial server check...');
    await updateFunction();

    // Start with fast polling for better responsiveness
    const currentTime = Date.now();
    const timeSinceStart = currentTime - this.startTime;
    
    if (timeSinceStart < this.config.INITIAL_FAST_DURATION) {
      console.log(`⚡ Using fast polling (${this.config.FAST_INITIAL_INTERVAL}ms) for initial ${this.config.INITIAL_FAST_DURATION/1000}s`);
      
      // Fast initial polling
      this.updateTimer = setInterval(updateFunction, this.config.FAST_INITIAL_INTERVAL);
        // Switch to normal polling after initial period
      setTimeout(() => {
        if (this.updateTimer) {
          clearInterval(this.updateTimer);
          console.log(`🔄 Switching to normal polling (${this.config.UPDATE_INTERVAL}ms)`);
          
          // Update cache duration for normal polling
          this.updateCacheDuration(this.config.UPDATE_INTERVAL);
          
          this.updateTimer = setInterval(updateFunction, this.config.UPDATE_INTERVAL);
        }
      }, this.config.INITIAL_FAST_DURATION);
      
    } else {
      // Normal polling if already past initial period
      console.log(`🔄 Using normal polling (${this.config.UPDATE_INTERVAL}ms)`);
      this.updateCacheDuration(this.config.UPDATE_INTERVAL);
      this.updateTimer = setInterval(updateFunction, this.config.UPDATE_INTERVAL);
    }
  }

  /**
   * Update cache duration dynamically
   */
  updateCacheDuration(newDuration) {
    if (this.cachedFetcher && this.cachedFetcher.cache) {
      this.cachedFetcher.cache.cacheDuration = newDuration;
      console.log(`⚡ Cache duration updated to ${newDuration}ms`);
    }
  }

  /**
   * Stop auto-update
   */
  stopAutoUpdate() {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }
    this.isUpdating = false;
    console.log('⏹️ Auto-update stopped');
  }  /**
   * Update UI elements
   */
  updateUI(data) {
    this.updateServerStatus(data);
    this.updateMapInfo(data);
    this.updatePlayerCount(data);
    this.updateGameMode(data);
    this.updateTechnicalInfo(data);
    this.updateMapImage(data);
    this.updateServerRegion();
    this.updateConnectionDetails();
    this.updateLastUpdateTime();
  }

  /**
   * Update server status display
   */
  updateServerStatus(data) {
    const statusElement = document.getElementById('server-status-text');
    const statusDot = document.getElementById('server-status-dot');
    
    if (statusElement && window.TranslationSystem) {
      const statusKey = data.status === 'unknown' ? 'checking' : data.status;
      statusElement.textContent = window.TranslationSystem.translate(`servers.status.${statusKey}`);
    }
    
    if (statusDot) {
      statusDot.classList.remove('online', 'offline', 'unknown', 'vpn');
      statusDot.classList.add(data.status);
    }
  }

  /**
   * Update map information
   */
  updateMapInfo(data) {
    const mapElement = document.getElementById('server-map');
    if (mapElement) {
      mapElement.textContent = data.map || '?';
    }
    
    // Atualizar também o nome do mapa na seção de imagem
    const mapNameElement = document.getElementById('current-map-name');
    if (mapNameElement) {
      mapNameElement.textContent = data.map || '?';
    }
  }
    /**
   * Update map image
   */
  updateMapImage(data) {
    const mapImage = document.getElementById('current-map-image');
    const loadingText = document.querySelector('[data-translate="servers.map.loading"]');
    
    if (mapImage) {
      const imagePath = this.getMapImagePath(data.map);
      console.log(`🖼️ Atualizando imagem do mapa para: ${data.map} (${imagePath})`);
      
      // Aplicar fade-out/fade-in para transição suave
      mapImage.style.opacity = '0.3';
      
      // Verificar se o mapa é conhecido e tem imagem personalizada
      const isKnownMap = data.map && data.map !== '?' && !imagePath.includes('unknown.svg');
      
      // Criar nova imagem para verificar se carrega corretamente
      const img = new Image();
      img.onload = () => {
        // Imagem carregou com sucesso
        mapImage.src = imagePath;
        mapImage.style.opacity = '1';
        
        // Esconder o texto de carregamento quando o mapa for conhecido
        if (loadingText && isKnownMap) {
          loadingText.style.display = 'none';
        } else if (loadingText) {
          loadingText.style.display = 'block';
        }
      };
      
      img.onerror = () => {
        // Falha ao carregar - usar imagem padrão
        mapImage.src = './public/img/maps/unknown.svg';
        mapImage.style.opacity = '1';
        
        // Mostrar o texto de carregamento em caso de erro
        if (loadingText) {
          loadingText.style.display = 'block';
        }
      };
      
      // Iniciar carregamento da imagem
      img.src = imagePath;
    }
  }

  /**
   * Update player count
   */
  updatePlayerCount(data) {
    const playersElement = document.getElementById('server-players');
    if (playersElement) {
      const current = data.players?.current || 0;
      const max = data.players?.max || 32;
      playersElement.textContent = `${current}/${max}`;
    }
  }

  /**
   * Update game mode
   */
  updateGameMode(data) {
    const modeElement = document.getElementById('server-mode');
    if (modeElement) {
      modeElement.textContent = data.gameMode || '?';
    }
  }
  /**
   * Update technical information
   */
  updateTechnicalInfo(data) {
    const latencyElement = document.getElementById('server-latency');
    if (latencyElement && data.ping) {
      latencyElement.textContent = `${data.ping}ms`;
    }
    
    // Update VPN indicators
    this.updateVpnIndicators(data);
  }
  /**
   * Update VPN indicators on both pages
   */
  updateVpnIndicators(data) {
    // Update VPN indicator on servers page
    const vpnIndicator = document.getElementById('vpn-indicator');
    if (vpnIndicator) {
      if (data.status === 'vpn') {
        vpnIndicator.style.display = 'flex';
        console.log('🔌 VPN indicator shown on servers page');
      } else {
        vpnIndicator.style.display = 'none';
      }
    }

    // Update VPN indicator on main page
    const mainVpnIndicator = document.getElementById('main-vpn-indicator');
    if (mainVpnIndicator) {
      if (data.status === 'vpn') {
        mainVpnIndicator.style.display = 'flex';
        mainVpnIndicator.style.opacity = '1';
        console.log('🔌 VPN indicator shown on main page');
      } else {
        mainVpnIndicator.style.display = 'none';
        mainVpnIndicator.style.opacity = '0';
      }
    }

    // Emit event for any other listeners
    if (data.status === 'vpn') {
      document.dispatchEvent(new CustomEvent('vpnServerDetected', { detail: data }));
    }
  }

  /**
   * Update last update time
   */
  updateLastUpdateTime() {
    const lastUpdateElement = document.getElementById('last-update');
    if (lastUpdateElement && this.lastUpdate) {
      lastUpdateElement.textContent = this.lastUpdate.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }

  /**
   * Get current server data
   */
  getCurrentData() {
    return { ...this.serverData };
  }

  /**
   * Check if auto-updating
   */
  isAutoUpdating() {
    return this.isUpdating;
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    console.log('🔧 Configuration updated:', this.config);
  }

  /**
   * Update server region based on IP address
   * Displays only the country flag without "João Pessoa, PB" text
   */
  updateServerRegion() {
    try {
      const regionFlagElement = document.querySelector('.fi');
      const regionTextElement = document.querySelector('[data-translate="general.location"]');
      
      if (regionFlagElement && this.config.SERVER_IP) {
        // Detect country code from IP using the ConfigUtils helper
        let countryCode = 'br'; // Default
        
        if (typeof ConfigUtils !== 'undefined' && ConfigUtils.detectCountryFromIP) {
          countryCode = ConfigUtils.detectCountryFromIP(this.config.SERVER_IP);
        }
        
        // Update flag class
        regionFlagElement.className = '';
        regionFlagElement.classList.add('fi', `fi-${countryCode}`);
        
        // Hide the location text since we only want to show the flag
        if (regionTextElement) {
          regionTextElement.style.display = 'none';
        }
        
        console.log(`🌍 Region updated: ${countryCode} (IP: ${this.config.SERVER_IP})`);
      }
    } catch (error) {
      console.error('❌ Error updating server region:', error);
    }
  }

  /**
   * Update connection details with dynamic IP and port
   * Updates both the Steam connect button and copyable IP field
   */
  updateConnectionDetails() {
    try {
      // Get configuration values
      const serverIP = this.config.SERVER_IP || '127.0.0.1';
      const serverPort = this.config.SERVER_PORT || '27015';
      const fullAddress = `${serverIP}:${serverPort}`;
      
      // Update Steam connect button
      const steamConnectButton = document.querySelector('button[onclick^="window.open(\'steam://connect/"]');
      if (steamConnectButton) {
        const newOnClick = `window.open('steam://connect/${fullAddress}', '_blank')`;
        steamConnectButton.setAttribute('onclick', newOnClick);
      }
      
      // Update copyable IP field
      const serverIPInput = document.getElementById('serverIP1');
      if (serverIPInput) {
        serverIPInput.value = `connect ${fullAddress}`;
      }
      
      console.log(`🔌 Connection details updated to ${fullAddress}`);
    } catch (error) {
      console.error('❌ Error updating connection details:', error);
    }
  }
  
  /**
   * Update server title based on IP configuration
   * Makes the server title dynamic based on the server IP
   */
  updateServerTitle() {
    try {
      const serverIP = this.config.SERVER_IP || '127.0.0.1';
      const serverTitleElement = document.querySelector('[data-translate="servers.server.title"]');
      
      if (serverTitleElement && serverIP) {
        // Get dynamic title based on IP using ConfigUtils helper
        let serverTitle = 'A GREAT CHAOS 01'; // Default
        
        if (typeof ConfigUtils !== 'undefined' && ConfigUtils.getServerTitle) {
          serverTitle = ConfigUtils.getServerTitle(serverIP);
        }
        
        // Update the title element
        serverTitleElement.textContent = serverTitle;
        
        console.log(`📋 Server title updated to: ${serverTitle}`);
      }
    } catch (error) {
      console.error('❌ Error updating server title:', error);
    }
  }
  /**
   * Handle language changes
   */
  handleLanguageChange() {
    if (this.serverData) {
      this.updateUI(this.serverData);
    }
  }

  /**
   * Setup language change listener
   */
  setupLanguageChangeListener() {
    document.addEventListener('languageChanged', () => {
      this.handleLanguageChange();
    });
  }
}

// Initialize when DOM is ready - Optimized for faster startup
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Reduced delay for faster initialization
    await new Promise(resolve => setTimeout(resolve, 100));

    console.log('🚀 Initializing CS2ServerStatus with optimized timing...');
    window.cs2ServerStatus = new CS2ServerStatus();

    // Check if we're on servers page or main page
    const isServersPage = document.getElementById('server-status-text');
    const isMainPage = document.getElementById('main-vpn-indicator') || document.getElementById('main-server-count');
    
    if (isServersPage || isMainPage) {
      await window.cs2ServerStatus.startAutoUpdate((data) => {
        window.cs2ServerStatus.updateUI(data);
        console.log('🔄 Server status updated:', data.status);
        
        // Always update VPN indicators regardless of page
        window.cs2ServerStatus.updateVpnIndicators(data);
      });
      
      console.log(`✅ Auto-update started on ${isServersPage ? 'servers' : 'main'} page`);
    } else {
      // Manual initialization for other pages
      console.log('ℹ️ Manual initialization - no auto-update');
    }

    console.log('✅ CS2 Server Status integration initialized with cache support');

  } catch (error) {
    console.error('❌ Failed to initialize CS2 Server Status:', error);
  }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CS2ServerStatus };
}
