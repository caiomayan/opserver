import React from 'react';
import Layout from './Layout';

const LoadingScreen = ({ 
  message = "Carregando...", 
  subMessage = null,
  showLogo = true,
  minimal = false
}) => {
  if (minimal) {
    // Loading minimal para usar dentro de componentes
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-3"></div>
          <p className="text-gray-600 text-sm">{message}</p>
        </div>
      </div>
    );
  }

  // Loading completo para páginas inteiras usando Layout
  return (
    <Layout>
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="mb-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          </div>
          
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">{message}</h1>
          {subMessage && (
            <p className="text-gray-600">{subMessage}</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default LoadingScreen;
