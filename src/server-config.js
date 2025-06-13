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
  UPDATE_INTERVAL: parseInt(process.env.UPDATE_INTERVAL) || 30000, // 30 segundos
  FAST_INITIAL_INTERVAL: parseInt(process.env.FAST_INITIAL_INTERVAL) || 3000,
  INITIAL_FAST_DURATION: parseInt(process.env.INITIAL_FAST_DURATION) || 30000,
  MAX_RETRIES: 3,
  RETRY_DELAY: 5000, // 5 segundos
  
  // Configurações de rede
  REQUEST_TIMEOUT: parseInt(process.env.REQUEST_TIMEOUT) || 10000, // 10 segundos
  CORS_PROXY: 'https://api.allorigins.win/get?url=', // Proxy para CORS
  
  // URLs da Steam API
  STEAM_API_URLS: {
    SERVER_LIST: 'https://api.steampowered.com/IGameServersService/GetServerList/v1/',
    SERVER_INFO: 'https://api.steampowered.com/ISteamApps/GetServersAtAddress/v0001/'
  },    // Configurações de UI
  DEBUG_MODE: process.env.DEBUG_MODE === 'true' || false, // Desabilitado para produção - sem controles de debug
  SHOW_PING: true,
  SHOW_LAST_UPDATE: false, // Não mostrar informações de debug
  VERBOSE_LOGGING: process.env.VERBOSE_LOGGING === 'true' || false
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
   * Detecta o código do país a partir de um endereço IP
   * Implementação simples baseada em faixas comuns de IPs brasileiros
   * Retorna o código ISO do país (br, us, etc)
   */
  detectCountryFromIP(ip) {
    if (!ip) return 'br'; // Default para Brasil
    
    // Verificar se está usando o IP do .env
    if (ip === SERVER_CONFIG.SERVER_IP) {
      // IP do servidor configurado no .env - detectar país
      // Simplificação: verificar faixas de IP comuns
      const octets = ip.split('.');
      if (octets.length !== 4) return 'br';
      
      const o1 = parseInt(octets[0], 10);
      
      // Alguns IPs comuns do Brasil (isso é uma simplificação)
      // 177.x.x.x, 179.x.x.x, 186.x.x.x, 187.x.x.x, 189.x.x.x, 191.x.x.x, 200.x.x.x, 201.x.x.x
      const brRanges = [177, 179, 186, 187, 189, 191, 200, 201];
      if (brRanges.includes(o1)) return 'br';
      
      // IPs americanos comuns
      // 50-79.x.x.x
      if (o1 >= 50 && o1 <= 79) return 'us';
      
      // IPs europeus comuns
      // 80-95.x.x.x
      if (o1 >= 80 && o1 <= 95) return 'eu';
    }
    
    // Alguns outros casos específicos
    if (ip === '177.54.147.46') return 'br';
    if (ip === '127.0.0.1' || ip === 'localhost') return 'br';
    
    return 'br'; // Padrão para o Brasil
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
  },
  
  /**
   * Define o título do servidor com base no IP
   * Retorna um título apropriado para o servidor
   */
  getServerTitle(ip) {
    if (!ip) return 'A GREAT CHAOS 01';
    
    // Se for o IP principal do .env, fornecer o título principal
    if (ip === SERVER_CONFIG.SERVER_IP) {
      return 'A GREAT CHAOS 01';
    }
    
    // Outros IPs conhecidos (podem ser expandidos conforme necessário)
    const knownServers = {
      '177.54.147.46': 'A GREAT CHAOS - PRINCIPAL',
      '127.0.0.1': 'A GREAT CHAOS - LOCALHOST',
      '192.168.1.1': 'A GREAT CHAOS - LAN',
      // Adicionar mais servidores conforme necessário
    };
    
    return knownServers[ip] || 'A GREAT CHAOS 01';
  }
};
