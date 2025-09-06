export const HUD_COLORS = {
  0: { name: 'Padrão', colorValue: '#FFFFFF' },
  1: { name: 'Branco', colorValue: '#FFFFFF' },
  2: { name: 'Azul', colorValue: '#0099CC' },
  3: { name: 'Azul-escuro', colorValue: '#0066FF' },
  4: { name: 'Roxo', colorValue: '#CC00FF' },
  5: { name: 'Vermelho', colorValue: '#FF0000' },
  6: { name: 'Laranja', colorValue: '#FF9900' },
  7: { name: 'Amarelo', colorValue: '#FFFF00' },
  8: { name: 'Verde', colorValue: '#00FF00' },
  9: { name: 'Aqua', colorValue: '#00FFFF' },
  10: { name: 'Rosa', colorValue: '#FF69B4' }
};

export const getHudColor = (colorId) => {
  return HUD_COLORS[colorId] || { name: 'Padrão', colorValue: '#FFFFFF' };
};

export const getHudColorName = (colorId) => {
  return HUD_COLORS[colorId]?.name || 'Padrão';
};

export const getHudColorValue = (colorId) => {
  return HUD_COLORS[colorId]?.colorValue || '#FFFFFF';
};
