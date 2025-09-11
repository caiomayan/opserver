"use client";

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import CountryFlag from './CountryFlag';
import SteamAuth from './SteamAuth';

const LogoHeader = ({ 
  logoSize = 24, 
  showBackButton = true, 
  centerLogo = null,
  centerCountry = null 
}) => {
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    setMounted(true);
    
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      // Show logo when at top (scrollTop <= 50px), hide when scrolling down
      setIsVisible(scrollTop <= 1);
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const headerContent = (
    <>
      {/* Seta fixa na extrema esquerda superior */}
      {showBackButton && (
        <button
          onClick={() => window.history.back()}
          className="fixed top-4 left-4 z-10 flex items-center gap-1 text-gray-700 hover:text-blue-600 transition-colors bg-transparent border-none p-0 m-0"
          style={{boxShadow: 'none'}}
        >
          <span className="text-2xl">←</span>
        </button>
      )}
      {/* SteamAuth fixa na extrema direita superior */}
      <div className="fixed top-4 right-4 z-10">
        <SteamAuth />
      </div>
      {/* Logo/Team no Centro - com transição de visibilidade */}
      {centerLogo && (
        <header className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-10 text-center transition-opacity duration-250 ${
          isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}>
          <Link href={centerLogo.href || "/"}>
            {centerLogo.src ? (
              <img 
                src={centerLogo.src || "/teams/unknown.svg"} 
                alt={centerLogo.alt || "Logo"}
                className={`mx-auto object-contain transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}
                width="40" 
                height="40" 
              />
            ) : (
              <img 
                src="/teams/unknown.svg" 
                alt="Unknown Team"
                className={`mx-auto object-contain transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}
                width="40" 
                height="40" 
              />
            )}
          </Link>
          {(() => {
            const code = typeof centerCountry === 'string' ? centerCountry.trim().toUpperCase() : '';
            return /^[A-Z]{2}$/.test(code) ? (
              <div className="mt-1">
                <CountryFlag 
                  countryCode={code}
                  size="w-3 h-2"
                  flagSize={20}
                />
              </div>
            ) : null;
          })()}
        </header>
      )}
    </>
  );

  // Render via portal to document.body to ensure it's always fixed to viewport
  if (!mounted) return null;
  return createPortal(headerContent, document.body);
};

export default LogoHeader;
