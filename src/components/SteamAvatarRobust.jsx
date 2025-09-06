'use client';

import { useState, useEffect, useRef } from 'react';
import { processAvatarUrl, isSteamAvatarUrl } from '../utils/steamAvatar';

// ✅ VERSÃO ULTRA-ROBUSTA: Sem race conditions e memory leaks
const SteamAvatarRobust = ({ 
  src, 
  alt = "Avatar", 
  className = "", 
  fallbackInitial = "?",
  size = "w-32 h-32" 
}) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [strategy, setStrategy] = useState('loading');
  
  // ✅ REFs para evitar race conditions
  const mountedRef = useRef(true);
  const currentImageRef = useRef(null);
  const successFlagRef = useRef(false);
  const strategyIndexRef = useRef(0);

  // ✅ ESTRATÉGIAS OTIMIZADAS 
  const getImageStrategies = (originalSrc) => {
    if (!originalSrc || !isSteamAvatarUrl(originalSrc)) {
      return [originalSrc];
    }

    const modernSteamUrl = processAvatarUrl(originalSrc);
    const highQualityUrl = modernSteamUrl.replace('_medium.jpg', '_full.jpg').replace('.jpg', '_full.jpg');

    return [
      highQualityUrl,
      modernSteamUrl,
      `/api/steam-avatar/${originalSrc.split('/').pop()}`,
      originalSrc,
      'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/fe/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg'
    ];
  };

  useEffect(() => {
    if (!src) {
      setIsLoading(false);
      setHasError(true);
      return;
    }

    // ✅ RESET state
    mountedRef.current = true;
    successFlagRef.current = false;
    strategyIndexRef.current = 0;
    setIsLoading(true);
    setHasError(false);

    const strategies = getImageStrategies(src);
    const strategyNames = ['high-quality', 'modern', 'proxy', 'original', 'fallback'];

    const tryStrategy = (index) => {
      if (!mountedRef.current || index >= strategies.length) {
        if (mountedRef.current) {
          setIsLoading(false);
          setHasError(true);
        }
        return;
      }

      const currentSrc = strategies[index];
      const currentStrategy = strategyNames[index] || `strategy-${index}`;
      
      console.log(`🔄 Tentando estratégia ${index + 1}/${strategies.length}: ${currentStrategy}`);
      
      if (mountedRef.current) {
        setStrategy(currentStrategy);
      }

      // ✅ CRIA nova instância de Image para cada tentativa
      const img = new Image();
      currentImageRef.current = img;
      
      // ✅ TIMEOUT com cleanup
      const timeoutId = setTimeout(() => {
        if (mountedRef.current && currentImageRef.current === img && !successFlagRef.current) {
          console.warn(`⏰ Timeout na estratégia: ${currentStrategy} (${index})`);
          img.onload = null;
          img.onerror = null;
          img.src = '';
          strategyIndexRef.current = index + 1;
          setTimeout(() => tryStrategy(index + 1), 1000);
        }
      }, index <= 1 ? 10000 : 20000); // Timeouts ainda maiores

      img.onload = () => {
        if (mountedRef.current && currentImageRef.current === img && !successFlagRef.current) {
          console.log(`✅ Sucesso definitivo: ${currentStrategy} - ${currentSrc}`);
          
          successFlagRef.current = true;
          clearTimeout(timeoutId);
          
          setImageSrc(currentSrc);
          setIsLoading(false);
          setHasError(false);
          
          // ✅ CLEANUP
          img.onload = null;
          img.onerror = null;
        }
      };
      
      img.onerror = (error) => {
        if (mountedRef.current && currentImageRef.current === img && !successFlagRef.current) {
          console.warn(`❌ Falhou estratégia ${currentStrategy}:`, error);
          clearTimeout(timeoutId);
          img.onload = null;
          img.onerror = null;
          strategyIndexRef.current = index + 1;
          setTimeout(() => tryStrategy(index + 1), 800);
        }
      };

      // ✅ INICIA carregamento
      img.src = currentSrc;
    };

    tryStrategy(0);

    // ✅ CLEANUP no unmount
    return () => {
      mountedRef.current = false;
      if (currentImageRef.current) {
        currentImageRef.current.onload = null;
        currentImageRef.current.onerror = null;
        currentImageRef.current.src = '';
      }
    };
  }, [src]);

  // ✅ LOADING STATE
  if (isLoading) {
    return (
      <div className={`${size} rounded-full bg-gray-200 flex items-center justify-center ${className}`}>
        <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
        {process.env.NODE_ENV === 'development' && (
          <div className="absolute -bottom-6 left-0 text-xs text-gray-500">
            {strategy}...
          </div>
        )}
      </div>
    );
  }

  // ✅ ERROR STATE
  if (hasError || !imageSrc) {
    return (
      <div className={`${size} rounded-full bg-gradient-to-br from-red-400 to-red-600 text-white flex items-center justify-center ${className}`}>
        <span className="text-2xl font-bold">{fallbackInitial}</span>
        {process.env.NODE_ENV === 'development' && (
          <div className="absolute -bottom-6 left-0 text-xs text-red-500">
            All failed
          </div>
        )}
      </div>
    );
  }

  // ✅ SUCCESS STATE - SEM onError que pode dar problema
  return (
    <div className={`${size} rounded-full bg-gray-200 overflow-hidden ${className} relative group`}>
      <img
        src={imageSrc}
        alt={alt}
        className="w-full h-full object-cover transition-all duration-200 group-hover:scale-105"
        loading="lazy"
        // ✅ SEM onError para evitar problemas tardios
        onLoad={(e) => {
          console.log(`🎯 Final load confirmed: ${imageSrc} (${e.target.naturalWidth}x${e.target.naturalHeight})`);
        }}
      />
      
      {/* Success indicator */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute -top-12 left-0 opacity-0 group-hover:opacity-100 transition-opacity bg-green-600 text-white text-xs px-2 py-1 rounded z-10 whitespace-nowrap">
          <div>✅ {strategy}</div>
          <div className="text-xs opacity-75">{imageSrc.split('/').pop()}</div>
        </div>
      )}
    </div>
  );
};

export default SteamAvatarRobust;
