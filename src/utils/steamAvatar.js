// ✅ NOVO: Converte URLs Steam para formato moderno que funciona
export function normalizeSteamAvatarUrl(url) {
  if (!url || typeof url !== 'string') return url;

  // ✅ Se já é o formato moderno, retorna como está
  if (url.includes('steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/')) {
    return url;
  }

  // ✅ CONVERSÃO: avatars.steamstatic.com → steamcdn-a.akamaihd.net
  if (url.includes('avatars.steamstatic.com/')) {
    // Extrai o hash e tamanho: https://avatars.steamstatic.com/HASH_size.jpg
    const match = url.match(/avatars\.steamstatic\.com\/([a-f0-9]{40})(_\w+)?\.jpg$/i);
    
    if (match) {
      const hash = match[1]; // Hash completo (40 chars)
      const size = match[2] || ''; // _medium, _full, etc.
      const prefix = hash.substring(0, 2); // Primeiros 2 chars
      
      // ✅ Novo formato moderno que funciona
      const modernUrl = `https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/${prefix}/${hash}${size}.jpg`;
      
      console.log(`🔄 Convertendo Steam URL: ${url} → ${modernUrl}`);
      return modernUrl;
    }
  }

  // ✅ FALLBACK: Se não conseguir converter, retorna original
  return url;
}

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
    // ✅ PRIMEIRO: Normaliza para formato moderno
    const modernUrl = normalizeSteamAvatarUrl(steamAvatarUrl);
    
    // Extrai o path do avatar da URL Steam
    const steamUrl = new URL(modernUrl);
    
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
 * Processa URL de avatar - NOVA ESTRATÉGIA: Tenta formato moderno primeiro
 * @param {string} avatarUrl - URL original
 * @returns {string} - URL processada
 */
export const processAvatarUrl = (avatarUrl) => {
  if (!avatarUrl) return null;
  
  if (isSteamAvatarUrl(avatarUrl)) {
    // ✅ ESTRATÉGIA NOVA: Tenta formato moderno Steam primeiro
    const modernUrl = normalizeSteamAvatarUrl(avatarUrl);
    
    // ✅ Se o formato moderno não funcionar no Vercel, use o proxy:
    // return getSteamAvatarProxyUrl(modernUrl);
    
    // ✅ Por enquanto, testa formato moderno direto
    return modernUrl;
  }
  
  return avatarUrl;
};
