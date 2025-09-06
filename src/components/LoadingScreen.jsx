

import { useState, useEffect } from 'react';

const LoadingScreen = ({ children, loadingDuration = 1200 }) => {
  const [showLogo, setShowLogo] = useState(false);
  const [fadeOutLogo, setFadeOutLogo] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [fadeInContent, setFadeInContent] = useState(false);
  const [hideLogo, setHideLogo] = useState(false);
  const fadeOutDuration = 400;
  const pulseDuration = 600;
  const [pulsing, setPulsing] = useState(true);

  useEffect(() => {
    let pulseInterval;
    // Fade-in inicial da logo
    const initialFadeIn = setTimeout(() => {
      setShowLogo(true);
      setTimeout(() => setPulsing(true), pulseDuration);
    }, 100);

    if (pulsing) {
      pulseInterval = setInterval(() => {
        setShowLogo((prev) => !prev);
      }, pulseDuration);
    }

    // Quando loading terminar, inicia fade-out final
    const loadingTimer = setTimeout(() => {
      setPulsing(false);
      setShowLogo(true); // Garante que a logo está visível para fade-out
      setFadeOutLogo(true);
      setTimeout(() => {
        setShowContent(true);
        setTimeout(() => setFadeInContent(true), fadeOutDuration);
        setTimeout(() => setHideLogo(true), fadeOutDuration);
      }, fadeOutDuration);
    }, loadingDuration);

    return () => {
      clearInterval(pulseInterval);
      clearTimeout(loadingTimer);
      clearTimeout(initialFadeIn);
    };
  }, [loadingDuration, pulsing]);
  // Enquanto carrega, mostra overlay fixo com a logo
  if (!showContent) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
        {!hideLogo && (
          <div className="w-32 h-32 flex items-center justify-center">
            <img
              src="/logo.svg"
              alt="Logo"
              className={`w-full h-full object-cover transition-opacity duration-400
                ${showLogo && !fadeOutLogo ? 'opacity-100' : ''}
                ${!showLogo && !fadeOutLogo ? 'opacity-0' : ''}
                ${fadeOutLogo ? 'opacity-0' : ''}
              `}
            />
          </div>
        )}
      </div>
    );
  }

  // Após carregar, renderiza o conteúdo normalmente (permitindo scroll da página)
  return (
    <div className={`w-full ${fadeInContent ? 'loading-fade' : ''}`}>
      {children}
    </div>
  );
}

export default LoadingScreen;
