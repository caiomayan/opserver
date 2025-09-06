'use client';

import { useState, useEffect } from 'react';
import { processAvatarUrl, isSteamAvatarUrl } from '../utils/steamAvatar';

// ✅ MÚLTIPLAS ESTRATÉGIAS MODERNAS para carregar avatares
const SteamAvatar = ({ 
  src, 
  alt = "Avatar", 
  className = "", 
  fallbackInitial = "?",
  size = "w-32 h-32" 
}) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [strategy, setStrategy] = useState('direct');

  // ✅ ESTRATÉGIAS SIMPLIFICADAS BASEADAS NA DESCOBERTA
  const getImageStrategies = (originalSrc) => {
    if (!originalSrc || !isSteamAvatarUrl(originalSrc)) {
      return [originalSrc]; // Não é Steam, usa direto
    }

    // ✅ URLs Steam funcionam com redirects - testa ambos formatos
    const modernSteamUrl = processAvatarUrl(originalSrc); // Converte para formato moderno

    return [
      // 1️⃣ Formato moderno Steam (steamcdn-a) - funciona com redirect
      modernSteamUrl,
      
      // 2️⃣ Proxy específico Steam (nossa implementação com redirects)
      `/api/steam-avatar/${modernSteamUrl.split('/').pop()}`,
      
      // 3️⃣ Direto original (backup)
      originalSrc,
      
      // 4️⃣ Proxy universal (com redirect support)
      `/api/proxy-image?url=${encodeURIComponent(modernSteamUrl)}`,
      
      // 5️⃣ Fallback Steam default avatar
      'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/fe/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb.jpg'
    ];
  };

  useEffect(() => {
    if (!src) {
      setIsLoading(false);
      setHasError(true);
      return;
    }

    const strategies = getImageStrategies(src);
    let currentStrategyIndex = 0;
    let mounted = true;

    const tryNextStrategy = () => {
      if (!mounted || currentStrategyIndex >= strategies.length) {
        setIsLoading(false);
        setHasError(true);
        return;
      }

      const currentSrc = strategies[currentStrategyIndex];
      const strategyNames = ['direct', 'steam-proxy', 'universal-proxy', 'fallback'];
      const currentStrategy = strategyNames[currentStrategyIndex] || `strategy-${currentStrategyIndex}`;
      
      console.log(`🔄 Tentando estratégia ${currentStrategyIndex + 1}/${strategies.length}: ${currentStrategy}`);
      setStrategy(currentStrategy);

      const img = new Image();
      
      img.onload = () => {
        if (mounted) {
          console.log(`✅ Sucesso com estratégia: ${currentStrategy} - ${currentSrc}`);
          setImageSrc(currentSrc);
          setIsLoading(false);
          setHasError(false);
        }
      };
      
      img.onerror = () => {
        if (mounted) {
          console.warn(`❌ Falhou estratégia ${currentStrategy}`);
          currentStrategyIndex++;
          setTimeout(tryNextStrategy, 300); // Delay para evitar spam
        }
      };

      // Timeout por estratégia
      const timeout = setTimeout(() => {
        if (mounted) {
          console.warn(`⏰ Timeout na estratégia: ${currentStrategy}`);
          img.src = '';
          currentStrategyIndex++;
          tryNextStrategy();
        }
      }, 5000);

      img.src = currentSrc;

      return () => {
        clearTimeout(timeout);
      };
    };

    tryNextStrategy();

    return () => {
      mounted = false;
    };
  }, [src]);

  // ✅ LOADING STATE
  if (isLoading) {
    return (
      <div className={`${size} rounded-full bg-gray-200 flex items-center justify-center ${className}`}>
        <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // ✅ ERROR STATE
  if (hasError || !imageSrc) {
    return (
      <div className={`${size} rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center ${className}`}>
        <span className="text-3xl font-bold">{fallbackInitial}</span>
      </div>
    );
  }

  // ✅ SUCCESS STATE
  return (
    <div className={`${size} rounded-full bg-gray-200 overflow-hidden ${className} relative group`}>
      <img
        src={imageSrc}
        alt={alt}
        className="w-full h-full object-cover transition-all duration-200 group-hover:scale-105"
        loading="lazy"
        onError={() => {
          console.warn(`❌ Falha final na imagem: ${imageSrc}`);
          setHasError(true);
          setImageSrc(null);
        }}
      />
      
      {/* Debug info em dev */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute -top-8 left-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-xs px-2 py-1 rounded z-10 whitespace-nowrap">
          {strategy} ✅
        </div>
      )}
    </div>
  );
};

export default SteamAvatar;
