'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const Footer = ({ text = "BETA" }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Calcula se o usuário chegou ao final da página
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Considera que chegou ao final se está a menos de 100px do final
      const isAtBottom = scrollTop + windowHeight >= documentHeight;
      
      setIsVisible(isAtBottom);
    };

    // Adiciona o listener de scroll
    window.addEventListener('scroll', handleScroll);
    
    // Verifica a posição inicial
    handleScroll();
    
    // Cleanup
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <footer 
      className={`fixed bottom-0 left-0 right-0 py-2 flex justify-between items-center px-4 bg-white/95 backdrop-blur-sm transition-transform duration-300 z-50 ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      {/* Logo OPSERVER - Esquerda */}
      <Link href="/" className="flex items-center gap-1.5">
        <img src="/logo.svg" alt="OPIUM Logo" width="16" height="16" />
        <span className="text-xs font-semibold text-gray-600">OPIUM</span>
      </Link>
      
      {/* Texto central */}
      <p className="text-xs text-gray-400">{text}</p>
      
      {/* Espaço vazio para manter o texto centralizado */}
      <div className="w-20"></div>
    </footer>
  );
};

export default Footer;
