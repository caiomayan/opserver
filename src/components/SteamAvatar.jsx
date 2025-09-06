'use client';

import { useState } from 'react';
import { processAvatarUrl } from '../utils/steamAvatar';

const SteamAvatar = ({ 
  src, 
  alt, 
  className = "", 
  fallbackInitial = "?",
  size = "w-32 h-32" 
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Processa a URL para usar proxy se necessário
  const processedSrc = processAvatarUrl(src);

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
    console.log('✅ Avatar carregado:', processedSrc);
  };

  const handleImageError = (e) => {
    setImageLoading(false);
    setImageError(true);
    console.error('❌ Erro ao carregar avatar:', processedSrc, e);
  };

  if (!processedSrc || imageError) {
    return (
      <div className={`${size} rounded-full bg-gray-200 flex items-center justify-center text-gray-400 ${className}`}>
        <span className="text-3xl font-bold">{fallbackInitial}</span>
      </div>
    );
  }

  return (
    <div className={`${size} rounded-full bg-gray-200 overflow-hidden ${className}`}>
      {imageLoading && (
        <div className="w-full h-full flex items-center justify-center text-gray-400">
          <span className="text-xs">Loading...</span>
        </div>
      )}
      <img
        src={processedSrc}
        alt={alt}
        className={`w-full h-full object-cover ${imageLoading ? 'hidden' : 'block'}`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        // Remove CORS headers pois agora é uma requisição interna
      />
    </div>
  );
};

export default SteamAvatar;
