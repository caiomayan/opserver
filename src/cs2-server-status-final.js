// This is a corrected version of cs2-server-status.js with all fixes applied
/**
 * CS2 Server Status Integration with Cache Support
 */
const DEFAULT_CONFIG = {
  STEAM_API_KEY: import.meta.env.VITE_STEAM_API_KEY || '',
  SERVER_IP: '177.54.144.181', // IP fixo do seu servidor
  SERVER_PORT: '27084', // Porta fixa do seu servidor
  SERVER_NAME: 'A GREAT CHAOS 01', // Nome fictício fixo
  SERVER_REGION: 'Brasil', // Será atualizado dinamicamente pela geolocalização do IP
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
      name: 'A GREAT CHAOS 01',
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
        this.updateUI(this.serverData);
      }
      
      this.startAutoUpdate();
      this.updateServerRegion();
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
      
      // Update cache with new data
      this.cache.set(serverData);
      
      // Update UI with new data
      this.updateUI(serverData);
      
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
  }

  /**
   * Get VPN server data for detected VPN networks
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
        ping: serverInfo.ping || null,
        gameMode: this.mapGameMode(serverInfo.gametype) || 'Retake',
        secure: serverInfo.secure === true || serverInfo.secure === 1,
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
    
    // Map image and name elements
    const mapImageElement = document.getElementById('current-map-image');
    const mapNameElement = document.getElementById('current-map-name');
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
      }
    } else {
      // Fade out details if offline or checking
      if (mapElement) mapElement.style.opacity = '0.3';
      if (playersElement) playersElement.style.opacity = '0.3';
      if (modeElement) modeElement.style.opacity = '0.3';
      if (latencyElement) latencyElement.style.opacity = '0.3';
      if (mapImageElement) mapImageElement.style.opacity = '0.3';
      if (mapNameElement) mapNameElement.style.opacity = '0.3';    }
    
    // 🔌 Update VPN indicators based on status
    this.updateVpnIndicators(data);
    
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
      return `./public/img/maps/${normalizedName}.svg`;
    }
    
    // Default unknown map image
    return './public/img/maps/unknown.svg';
  }

  /**
   * Get friendly map name
   */
  getFriendlyMapName(mapName) {
    // Remove prefix (e.g., de_)
    const baseName = mapName.replace(/^[a-z]{2}_/, '');
    
    // Capitalize first letter and rest lowercase
    return baseName.charAt(0).toUpperCase() + baseName.slice(1).toLowerCase();
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
  }

  /**
   * Update server region display
   */
  updateServerRegion() {
    const regionElement = document.getElementById('server-region');
    if (regionElement) {
      const serverRegion = import.meta.env.VITE_SERVER_REGION || 'João Pessoa, PB';
      regionElement.textContent = serverRegion;
    }
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
      const serverName = import.meta.env.VITE_SERVER_NAME || 'A GREAT CHAOS 01';
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
}

export { CS2ServerStatus };

document.addEventListener('DOMContentLoaded', () => {
  const cs2ServerStatus = new CS2ServerStatus();
  cs2ServerStatus.init();
  window.cs2ServerStatus = cs2ServerStatus;
  console.log('✅ CS2ServerStatus initialized and exposed to window');
});
