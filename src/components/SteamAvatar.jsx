'use client';

import { useState } from 'react';

const SteamAvatar = ({ 
  src, 
  alt, 
  className = "", 
  fallbackInitial = "?",
  size = "w-32 h-32" 
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  if (!src || imageError) {
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
          <span className="text-sm">Carregando...</span>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover ${imageLoading ? 'hidden' : 'block'}`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        crossOrigin="anonymous"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
};

export default SteamAvatar;
