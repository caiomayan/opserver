
import { useState, useEffect } from 'react';

const LogoScreen = ({ children, logoDuration = 2800 }) => {
  const [showLogo, setShowLogo] = useState(false);
  const [fadeOutLogo, setFadeOutLogo] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [fadeInContent, setFadeInContent] = useState(false);

  useEffect(() => {
    // Fade-in da logo
    const logoInTimer = setTimeout(() => setShowLogo(true), 200);
    // Fade-out da logo
    const logoOutTimer = setTimeout(() => setFadeOutLogo(true), logoDuration - 500);
    // Exibe o conteúdo principal (invisível)
    const contentTimer = setTimeout(() => setShowContent(true), logoDuration);
    // Fade-in do conteúdo principal
    const fadeInContentTimer = setTimeout(() => setFadeInContent(true), logoDuration + 700);
    return () => {
      clearTimeout(logoInTimer);
      clearTimeout(logoOutTimer);
      clearTimeout(contentTimer);
      clearTimeout(fadeInContentTimer);
    };
  }, [logoDuration]);

  return (
    <>
      {/* Tela de logo animada */}
      {!showContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
          <div className="w-32 h-32 flex items-center justify-center">
            <img
              src="/logo.svg"
              alt="Logo"
              className={`w-full h-full object-cover transition-opacity duration-700
                ${showLogo && !fadeOutLogo ? 'opacity-100' : ''}
                ${!showLogo ? 'opacity-0' : ''}
                ${fadeOutLogo ? 'opacity-0' : ''}
              `}
            />
          </div>
        </div>
      )}
      {/* Conteúdo principal no fluxo normal */}
      {showContent && (
        <div className={fadeInContent ? 'opacity-100 transition-opacity duration-700' : 'opacity-0 transition-opacity duration-700'}>
          {children}
        </div>
      )}
    </>
  );
};

export default LogoScreen;
