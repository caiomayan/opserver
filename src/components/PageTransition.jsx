'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const PageTransitionContext = createContext();

export const usePageTransition = () => {
  const context = useContext(PageTransitionContext);
  if (!context) {
    throw new Error('usePageTransition must be used within PageTransitionProvider');
  }
  return context;
};

export const PageTransitionProvider = ({ children }) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const startTransition = async (callback) => {
    setIsTransitioning(true);
    setIsVisible(false);
    
    // Aguarda o fade-out
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (callback) {
      await callback();
    }
    
    // Inicia o fade-in
    setIsVisible(true);
    setIsTransitioning(false);
  };

  const value = {
    isTransitioning,
    isVisible,
    startTransition
  };

  return (
    <PageTransitionContext.Provider value={value}>
      <div className={`transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        {children}
      </div>
    </PageTransitionContext.Provider>
  );
};

// Componente wrapper para páginas
export const PageWrapper = ({ children, className = "" }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={`transition-opacity duration-300 ${mounted ? 'opacity-100' : 'opacity-0'} ${className}`}>
      {children}
    </div>
  );
};
