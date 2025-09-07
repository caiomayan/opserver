'use client';

import { useState } from 'react';

export default function SimpleSteamAvatar({ 
  src, 
  alt = "Avatar", 
  className = "",
  size = "w-16 h-16",
  fallbackInitial = "?"
}) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Se não tem src ou deu erro, mostra fallback
  if (!src || hasError) {
    return (
      <div className={`${size} rounded-full overflow-hidden ${className} relative`}>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center font-bold rounded-full">
          {fallbackInitial}
        </div>
      </div>
    );
  }

  return (
    <div className={`${size} rounded-full overflow-hidden ${className} relative`}>
      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-full"></div>
      )}
      
      {/* Avatar image */}
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
      />
    </div>
  );
}