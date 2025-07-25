'use client';

import { useState, useEffect } from 'react';

export default function MainPage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div 
      className={`min-h-screen bg-white transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">
          Bem-vindo ao OPSERVER
        </h1>
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-8">
            Esta é a página principal do seu servidor.
          </p>
          {/* Aqui você pode adicionar o conteúdo do main.html */}
        </div>
      </div>
    </div>
  );
}
