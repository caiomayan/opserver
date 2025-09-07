'use client';

import { useState } from 'react';

// 🎯 SOLUÇÃO SIMPLES: Apenas conversão para Fastly
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
    // Extrai o hash da URL
    const hashMatch = steamUrl.match(/([a-f0-9]{40})/);
    if (hashMatch) {
      const hash = hashMatch[1];
      // Prioriza _full, senão _medium
      return `https://avatars.fastly.steamstatic.com/${hash}_full.jpg`;
    }
  }

  // Se não é Steam URL, retorna original
  return steamUrl;
}

export default function SimpleSteamAvatar({ 
  src, 
  alt = "Avatar", 
  className = "",
  size = "w-16 h-16",
  fallbackInitial = "?"
}) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Converte para Fastly
  const fastlyUrl = convertToFastly(src);

  // ✅ SEMPRE tenta carregar primeiro, só mostra fallback após erro
  return (
    <div className={`${size} rounded-full overflow-hidden ${className} relative`}>
      {/* Loading state */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-full"></div>
      )}
      
      {/* Fallback só aparece após erro ou se não tem URL */}
      {(hasError || !fastlyUrl) && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center font-bold rounded-full">
          {fallbackInitial}
        </div>
      )}
      
      {/* Sempre tenta carregar se tem URL */}
      {fastlyUrl && !hasError && (
        <img
          src={fastlyUrl}
          alt={alt}
          className="w-full h-full object-cover"
          onLoad={() => {
            setIsLoading(false);
            console.log(`✅ Avatar carregado: ${fastlyUrl}`);
          }}
          onError={(e) => {
            console.warn(`❌ Falha no avatar: ${fastlyUrl}`);
            
            // Tenta versão medium como fallback
            if (fastlyUrl.includes('_full.jpg')) {
              const mediumUrl = fastlyUrl.replace('_full.jpg', '_medium.jpg');
              console.log(`🔄 Tentando medium: ${mediumUrl}`);
              e.target.src = mediumUrl;
              return; // Não seta hasError ainda, dá uma chance ao medium
            }
            
            // Se medium também falhou, vai para o fallback visual
            console.warn(`❌ Todas as tentativas falharam, usando fallback`);
            setHasError(true);
            setIsLoading(false);
          }}
        />
      )}
    </div>
  );
}
