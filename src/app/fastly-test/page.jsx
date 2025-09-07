'use client';

import React, { useState } from 'react';

export default function FastlyTestPage() {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // URLs de teste usando o novo domínio Fastly
  const testUrls = [
    // O exemplo que você encontrou
    'https://avatars.fastly.steamstatic.com/c6054045a49a9c65c2e1d2d5b8c05387934e940a_full.jpg',
    
    // Outras variações para testar
    'https://avatars.fastly.steamstatic.com/c6054045a49a9c65c2e1d2d5b8c05387934e940a_medium.jpg',
    'https://avatars.fastly.steamstatic.com/c6054045a49a9c65c2e1d2d5b8c05387934e940a.jpg',
    
    // Outro perfil de exemplo
    'https://avatars.fastly.steamstatic.com/4948b7401158683d8c423d098118bdd1b040bd41_full.jpg',
    'https://avatars.fastly.steamstatic.com/4948b7401158683d8c423d098118bdd1b040bd41_medium.jpg',
  ];

  const testFastlyUrls = async () => {
    setLoading(true);
    setTestResults([]);
    
    for (let i = 0; i < testUrls.length; i++) {
      const url = testUrls[i];
      const startTime = Date.now();
      
      try {
        const response = await fetch(url, { 
          method: 'HEAD',
          mode: 'no-cors' // Para evitar CORS issues
        });
        
        const loadTime = Date.now() - startTime;
        
        // Como usamos no-cors, vamos testar carregando a imagem
        const img = new Image();
        const imgLoadTime = Date.now();
        
        img.onload = () => {
          const totalTime = Date.now() - imgLoadTime;
          setTestResults(prev => [...prev, {
            url,
            status: '✅ SUCCESS',
            loadTime: totalTime,
            dimensions: `${img.naturalWidth}x${img.naturalHeight}`,
            size: url.includes('_full') ? 'Full' : url.includes('_medium') ? 'Medium' : 'Default'
          }]);
        };
        
        img.onerror = () => {
          setTestResults(prev => [...prev, {
            url,
            status: '❌ FAILED',
            loadTime: Date.now() - imgLoadTime,
            dimensions: 'N/A',
            size: url.includes('_full') ? 'Full' : url.includes('_medium') ? 'Medium' : 'Default'
          }]);
        };
        
        img.src = url;
        
        // Timeout de 10s por imagem
        setTimeout(() => {
          if (!img.complete) {
            setTestResults(prev => [...prev, {
              url,
              status: '⏰ TIMEOUT',
              loadTime: 10000,
              dimensions: 'N/A',
              size: url.includes('_full') ? 'Full' : url.includes('_medium') ? 'Medium' : 'Default'
            }]);
          }
        }, 10000);
        
      } catch (error) {
        setTestResults(prev => [...prev, {
          url,
          status: `❌ ERROR: ${error.message}`,
          loadTime: Date.now() - startTime,
          dimensions: 'N/A',
          size: url.includes('_full') ? 'Full' : url.includes('_medium') ? 'Medium' : 'Default'
        }]);
      }
      
      // Delay entre testes
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🧪 Teste Fastly Steam URLs
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Testando novo domínio: <code className="bg-gray-100 px-2 py-1 rounded">avatars.fastly.steamstatic.com</code>
          </h2>
          
          <button
            onClick={testFastlyUrls}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 mb-6"
          >
            {loading ? '🔄 Testando...' : '🚀 Testar URLs Fastly'}
          </button>

          {testResults.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">📊 Resultados:</h3>
              
              {testResults.map((result, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{result.status}</span>
                    <span className="text-sm text-gray-500">{result.size} Quality</span>
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <div><strong>URL:</strong> {result.url}</div>
                    <div><strong>Tempo:</strong> {result.loadTime}ms</div>
                    <div><strong>Dimensões:</strong> {result.dimensions}</div>
                  </div>
                  
                  {result.status.includes('SUCCESS') && (
                    <div className="mt-2">
                      <img 
                        src={result.url} 
                        alt="Test avatar"
                        className="w-16 h-16 rounded-full object-cover border"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            💡 Se Fastly funcionar:
          </h3>
          <ul className="text-blue-800 space-y-1">
            <li>✅ Vou simplificar o sistema para usar apenas Fastly URLs</li>
            <li>✅ Remover todas as estratégias complexas</li>
            <li>✅ Manter apenas conversão: old format → fastly format</li>
            <li>✅ Sistema limpo e otimizado</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
