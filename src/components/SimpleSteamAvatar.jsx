'use client';

import { useState } from 'react';

// 🎯 SOLUÇÃO ROBUSTA: Múltiplas estratégias de avatar
function getSteamAvatarStrategies(src, steamId64) {
  const strategies = [];
  
  // Estratégia 1: URL original (se válida)
  if (src && typeof src === 'string' && src.includes('steam')) {
    strategies.push({
      url: src,
      name: 'original'
    });
  }

  // Estratégia 2: Proxy Steam (se temos steamId64)
  if (steamId64) {
    // Gerar hash padrão baseado no Steam ID para tentar adivinhar
    strategies.push({
      url: `/api/steam-avatar/${steamId64}_full.jpg`,
      name: 'proxy-guess'
    });
  }

  // Estratégia 3: Conversão para Fastly (se é URL Steam)
  if (src && typeof src === 'string') {
    const fastlyUrl = convertToFastly(src);
    if (fastlyUrl && fastlyUrl !== src) {
      strategies.push({
        url: fastlyUrl,
        name: 'fastly'
      });
    }
  }

  // Estratégia 4: Proxy universal (se temos URL)
  if (src && typeof src === 'string' && src.startsWith('http')) {
    strategies.push({
      url: `/api/proxy-image?url=${encodeURIComponent(src)}`,
      name: 'proxy-universal'
    });
  }

  console.log(`🎯 Estratégias de avatar:`, strategies.map(s => s.name));
  return strategies;
}

// 🔄 Conversão para Fastly (mantém a lógica existente)
function convertToFastly(steamUrl) {
  if (!steamUrl || typeof steamUrl !== 'string') {
    return null;
  }

  // Se já é Fastly, retorna como está
  if (steamUrl.includes('avatars.fastly.steamstatic.com')) {
    return steamUrl;
  }

  // Converte URLs Steam antigas para Fastly
  if (steamUrl.includes('avatars.steamstatic.com') || steamUrl.includes('steamcdn-a.akamaihd.net')) {
    const hashMatch = steamUrl.match(/([a-f0-9]{40})/i);
    if (hashMatch) {
      const hash = hashMatch[1];
      return `https://avatars.fastly.steamstatic.com/${hash}_full.jpg`;
    }
  }

  return steamUrl;
}

export default function SimpleSteamAvatar({ 
  src, 
  steamId64, // ✨ NOVO: para estratégias baseadas no Steam ID
  alt = "Avatar", 
  className = "",
  size = "w-16 h-16",
  fallbackInitial = "?"
}) {
  const [currentStrategyIndex, setCurrentStrategyIndex] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 🎯 Gerar todas as estratégias possíveis
  const strategies = getSteamAvatarStrategies(src, steamId64);
  const currentStrategy = strategies[currentStrategyIndex];

  console.log(`🔍 SimpleSteamAvatar - src: ${src}, steamId64: ${steamId64}`);
  console.log(`� Tentativa ${currentStrategyIndex + 1}/${strategies.length}: ${currentStrategy?.name}`);

  // Se não há estratégias ou todas falharam
  if (!currentStrategy || hasError) {
    return (
      <div className={`${size} rounded-full overflow-hidden ${className} relative`}>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center font-bold rounded-full">
          {fallbackInitial}
        </div>
      </div>
    );
  }

  const handleImageError = (e) => {
    console.warn(`❌ Falha na estratégia ${currentStrategy.name}: ${currentStrategy.url}`);
    
    // Tentar próxima estratégia
    if (currentStrategyIndex < strategies.length - 1) {
      console.log(`🔄 Tentando próxima estratégia...`);
      setCurrentStrategyIndex(prev => prev + 1);
      setIsLoading(true);
      return;
    }
    
    // Todas as estratégias falharam
    console.warn(`❌ Todas as estratégias falharam, usando fallback`);
    setHasError(true);
    setIsLoading(false);
  };

  const handleImageLoad = () => {
    console.log(`✅ Avatar carregado com estratégia ${currentStrategy.name}: ${currentStrategy.url}`);
    setIsLoading(false);
    setHasError(false);
  };

  return (
    <div className={`${size} rounded-full overflow-hidden ${className} relative`}>
      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-full"></div>
      )}
      
      {/* Imagem com estratégia atual */}
      <img
        src={currentStrategy.url}
        alt={alt}
        className="w-full h-full object-cover"
        onLoad={handleImageLoad}
        onError={handleImageError}
        style={{ display: hasError ? 'none' : 'block' }}
      />
    </div>
  );
}
