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
  const [loadedSuccessfully, setLoadedSuccessfully] = useState(false); // ✅ NOVO: Track de sucesso

  // ✅ ESTRATÉGIAS OTIMIZADAS (corrigido qualidade + timeout)
  const getImageStrategies = (originalSrc) => {
    if (!originalSrc || !isSteamAvatarUrl(originalSrc)) {
      return [originalSrc]; // Não é Steam, usa direto
    }

    // ✅ URLs Steam com qualidade otimizada
    const modernSteamUrl = processAvatarUrl(originalSrc);
    
    // ✅ FORÇA qualidade alta se possível
    const highQualityUrl = modernSteamUrl.replace('_medium.jpg', '_full.jpg').replace('.jpg', '_full.jpg');

    return [
      // 1️⃣ Steam formato moderno ALTA QUALIDADE
      highQualityUrl,
      
      // 2️⃣ Steam formato moderno original
      modernSteamUrl,
      
      // 3️⃣ Proxy Steam com qualidade original (sem otimização que pode degradar)
      `/api/steam-avatar/${originalSrc.split('/').pop()}`,
      
      // 4️⃣ Direto original (backup)
      originalSrc,
      
      // 5️⃣ Proxy universal (último recurso)
      `/api/proxy-image?url=${encodeURIComponent(modernSteamUrl)}`,
      
      // 6️⃣ Fallback Steam default (alta qualidade)
      'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/fe/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg'
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
          setLoadedSuccessfully(true); // ✅ MARCA como carregado com sucesso
          
          // ✅ LIMPA todos os timeouts e handlers
          clearTimeout(timeout);
          img.onload = null;
          img.onerror = null;
        }
      };
      
      img.onerror = (error) => {
        if (mounted) {
          console.warn(`❌ Falhou estratégia ${currentStrategy}:`, error);
          currentStrategyIndex++;
          
          // ✅ DELAY PROGRESSIVO: Evita spam + rate limiting
          const delay = currentStrategyIndex <= 2 ? 500 : 1500; // Mais tempo entre tentativas
          setTimeout(tryNextStrategy, delay);
        }
      };

      // ✅ TIMEOUT ESTENDIDO por estratégia (estava muito agressivo)
      const timeout = setTimeout(() => {
        if (mounted && img.src) {
          console.warn(`⏰ Timeout na estratégia: ${currentStrategy}`);
          img.onerror = null; // Remove handlers
          img.onload = null;
          img.src = ''; // Cancel current load
          currentStrategyIndex++;
          tryNextStrategy();
        }
      }, currentStrategyIndex <= 1 ? 8000 : 15000); // 8s para direto, 15s para proxies

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

  // ✅ SUCCESS STATE com proteção contra onError tardio
  return (
    <div className={`${size} rounded-full bg-gray-200 overflow-hidden ${className} relative group`}>
      <img
        src={imageSrc}
        alt={alt}
        className="w-full h-full object-cover transition-all duration-200 group-hover:scale-105"
        loading="lazy"
        onError={(e) => {
          // ✅ PROTEÇÃO: Só trata erro se NÃO carregou com sucesso antes
          if (!loadedSuccessfully) {
            console.warn(`❌ onError tardio chamado para: ${imageSrc}`);
            
            // Verifica se a imagem realmente falhou ou se é um falso positivo
            if (e.target.naturalWidth === 0 && e.target.naturalHeight === 0) {
              console.warn(`❌ Falha real na imagem: ${imageSrc} - resetando`);
              setHasError(true);
              setImageSrc(null);
            } else {
              console.log(`✅ Falso positivo de erro - imagem OK: ${e.target.naturalWidth}x${e.target.naturalHeight}`);
            }
          } else {
            console.log(`🛡️ onError ignorado - imagem já carregou com sucesso anteriormente`);
          }
        }}
        onLoad={(e) => {
          // ✅ CONFIRMA que a imagem carregou corretamente E atualiza flag
          setLoadedSuccessfully(true);
          console.log(`✅ Imagem confirmada carregada: ${imageSrc} (${e.target.naturalWidth}x${e.target.naturalHeight})`);
        }}
      />
      
      {/* Debug info em dev com mais detalhes */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute -top-12 left-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-xs px-2 py-1 rounded z-10 whitespace-nowrap">
          <div>{strategy} ✅</div>
          <div className="text-xs opacity-75">{imageSrc.split('/').pop()}</div>
        </div>
      )}
    </div>
  );
};

export default SteamAvatar;
