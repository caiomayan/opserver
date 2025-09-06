/**
 * Converte URL do avatar Steam para usar nosso proxy interno
 * @param {string} steamAvatarUrl - URL original do Steam
 * @returns {string} - URL do proxy interno
 */
export const getSteamAvatarProxyUrl = (steamAvatarUrl) => {
  if (!steamAvatarUrl) return null;

  // Se já é uma URL do nosso proxy, retorna como está
  if (steamAvatarUrl.includes('/api/steam-avatar/')) {
    return steamAvatarUrl;
  }

  try {
    // Extrai o path do avatar da URL Steam
    const steamUrl = new URL(steamAvatarUrl);
    
    // Remove o hostname e mantém apenas o path
    const avatarPath = steamUrl.pathname;
    
    // Retorna URL do nosso proxy
    return `/api/steam-avatar${avatarPath}`;
  } catch (error) {
    console.error('Error parsing Steam avatar URL:', error);
    return null;
  }
};

/**
 * Valida se uma URL é de avatar Steam
 * @param {string} url - URL para validar
 * @returns {boolean}
 */
export const isSteamAvatarUrl = (url) => {
  if (!url) return false;
  
  const steamDomains = [
    'avatars.steamstatic.com',
    'steamcdn-a.akamaihd.net',
    'steamuserimages-a.akamaihd.net'
  ];
  
  try {
    const urlObj = new URL(url);
    return steamDomains.includes(urlObj.hostname);
  } catch {
    return false;
  }
};

/**
 * Processa URL de avatar - usa proxy se for Steam, senão retorna original
 * @param {string} avatarUrl - URL original
 * @returns {string} - URL processada
 */
export const processAvatarUrl = (avatarUrl) => {
  if (!avatarUrl) return null;
  
  if (isSteamAvatarUrl(avatarUrl)) {
    return getSteamAvatarProxyUrl(avatarUrl);
  }
  
  return avatarUrl;
};
