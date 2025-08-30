/**
 * Calcula a idade baseada no aniversário
 * @param {string} birthday - Data no formato MM-DD-YYYY
 * @returns {number|null} - Idade ou null se inválido
 */
export const calculateAge = (birthday) => {
  if (!birthday) return null;
  // Aceita formatos YYYY-MM-DD ou MM-DD-YYYY
  let birthDate;
  if (/^\d{4}-\d{2}-\d{2}$/.test(birthday)) {
    // YYYY-MM-DD
    birthDate = new Date(birthday);
  } else if (/^\d{2}-\d{2}-\d{4}$/.test(birthday)) {
    // MM-DD-YYYY
    const [month, day, year] = birthday.split('-');
    birthDate = new Date(year, month - 1, day);
  } else {
    return null;
  }
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  if (
    today.getMonth() < birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
};

/**
 * Calcula o eDPI (effective DPI)
 * @param {string|number} sensitivity - Sensibilidade do mouse
 * @param {string|number} dpi - DPI do mouse
 * @returns {string} - eDPI formatado
 */
export const calculateEDPI = (sensitivity, dpi) => {
  return (parseFloat(sensitivity) * parseInt(dpi)).toFixed(0);
};

/**
 * Verifica se um level é válido e numérico
 * @param {any} level - Level para verificar
 * @returns {boolean} - Se é um level válido
 */
export const isValidLevel = (level) => {
  return level && level !== 'Indisponível' && level !== '?' && typeof level === 'number';
};

/**
 * Gera URLs de perfis externos
 * @param {string} steamid64 - Steam ID do jogador
 * @returns {object} - URLs dos perfis
 */
export const getProfileUrls = (steamid64) => {
  return {
    steam: steamid64 ? `https://steamcommunity.com/profiles/${steamid64}` : null
  };
};
