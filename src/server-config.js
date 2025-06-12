/**
 * Configurações do CS2 Server Status
 * Centralizando todas as configurações de API e servidor
 * Utiliza variáveis de ambiente para dados sensíveis
 */

// Configurações principais
export const SERVER_CONFIG = {
  // Configurações da Steam Web API
  // Usa variáveis de ambiente definidas no .env para segurança
  STEAM_API_KEY: process.env.STEAM_API_KEY || '', 
  
  // Configurações do servidor CS2
  SERVER_IP: process.env.SERVER_IP || '127.0.0.1',
  SERVER_PORT: process.env.SERVER_PORT || '27015',
  
  // Configurações de atualização
  UPDATE_INTERVAL: 30000, // 30 segundos
  MAX_RETRIES: 3,
  RETRY_DELAY: 5000, // 5 segundos
  
  // Configurações de rede
  REQUEST_TIMEOUT: 10000, // 10 segundos
  CORS_PROXY: 'https://api.allorigins.win/get?url=', // Proxy para CORS
  
  // URLs da Steam API
  STEAM_API_URLS: {
    SERVER_LIST: 'https://api.steampowered.com/IGameServersService/GetServerList/v1/',
    SERVER_INFO: 'https://api.steampowered.com/ISteamApps/GetServersAtAddress/v0001/'
  },    // Configurações de UI
  DEBUG_MODE: false, // Desabilitado para produção - sem controles de debug
  SHOW_PING: true,
  SHOW_LAST_UPDATE: false // Não mostrar informações de debug
};

// Configurações específicas para desenvolvimento
export const DEV_CONFIG = {
  // Usar dados mock quando não há API key
  USE_MOCK_DATA: false, // SEMPRE false - só usar dados reais
  
  // Intervalo de atualização mais rápido para desenvolvimento
  DEV_UPDATE_INTERVAL: 15000, // 15 segundos
    // Logs detalhados
  VERBOSE_LOGGING: false // Desabilitado para produção
};

// Mapas conhecidos do CS2 com nomes amigáveis
export const MAP_NAMES = {
  'de_dust2': 'Dust II',
  'de_mirage': 'Mirage',
  'de_inferno': 'Inferno',
  'de_cache': 'Cache',
  'de_overpass': 'Overpass',
  'de_train': 'Train',
  'de_nuke': 'Nuke',
  'de_vertigo': 'Vertigo',
  'de_ancient': 'Ancient',
  'de_anubis': 'Anubis'
};

// Modos de jogo conhecidos
export const GAME_MODES = {
  'competitive': 'Competitive',
  'casual': 'Casual',
  'deathmatch': 'Deathmatch',
  'arms_race': 'Arms Race',
  'demolition': 'Demolition',
  'wingman': 'Wingman'
};

// Configuração para diferentes ambientes
export const getConfig = (environment = 'production') => {
  const baseConfig = { ...SERVER_CONFIG };
  
  if (environment === 'development') {
    return {
      ...baseConfig,
      ...DEV_CONFIG,
      UPDATE_INTERVAL: DEV_CONFIG.DEV_UPDATE_INTERVAL
    };
  }
  
  return baseConfig;
};

// Utilitários de configuração
export const ConfigUtils = {
  /**
   * Verifica se a Steam API Key está configurada
   */
  isApiKeyConfigured() {
    return SERVER_CONFIG.STEAM_API_KEY && SERVER_CONFIG.STEAM_API_KEY.length > 0;
  },
  
  /**
   * Atualiza a Steam API Key
   */
  setSteamApiKey(apiKey) {
    SERVER_CONFIG.STEAM_API_KEY = apiKey;
    console.log('Steam API Key updated');
  },
  
  /**
   * Obtém URL completa da Steam API
   */
  getSteamApiUrl(endpoint, params = {}) {
    const url = new URL(SERVER_CONFIG.STEAM_API_URLS[endpoint]);
    url.searchParams.append('key', SERVER_CONFIG.STEAM_API_KEY);
    
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
    
    return url.toString();
  },
    /**
   * Verifica se deve usar dados mock
   * MODIFICADO: Sempre tentar dados reais primeiro
   */
  shouldUseMockData() {
    // Nunca usar mock - sempre tentar dados reais
    return false;
  }
};
