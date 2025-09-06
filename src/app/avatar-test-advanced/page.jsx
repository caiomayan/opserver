'use client';

import { useState, useEffect } from 'react';
import SteamAvatar from '../../components/SteamAvatar';

// ✅ TESTE AVANÇADO: Todas as estratégias de carregamento de avatar
export default function AvatarTestAdvanced() {
  const [testResults, setTestResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // URLs de teste variadas
  const testAvatars = [
    'https://avatars.steamstatic.com/c6054045a49a9c65c2e1d2d5b8c05387934e940a_medium.jpg',
    'https://avatars.steamstatic.com/b5bd56c1aa4644a474a2e4972be27ef94e522bb3_medium.jpg',
    'https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_medium.jpg',
    'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/fe/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb.jpg',
    'https://invalid-steam-url.com/fake.jpg', // URL inválida para testar fallback
  ];

  // ✅ TESTE INDIVIDUAL DE ESTRATÉGIAS
  const testStrategy = async (url, strategy) => {
    const strategies = {
      direct: url,
      'steam-proxy': `/api/steam-avatar/${url.split('/').pop()}`,
      'universal-proxy': `/api/proxy-image?url=${encodeURIComponent(url)}`,
      'nextjs-image': `/_next/image?url=${encodeURIComponent(url)}&w=128&q=75`
    };

    const testUrl = strategies[strategy];
    
    return new Promise((resolve) => {
      const img = new Image();
      const startTime = Date.now();
      
      img.onload = () => {
        resolve({
          strategy,
          url: testUrl,
          success: true,
          loadTime: Date.now() - startTime,
          size: img.naturalWidth + 'x' + img.naturalHeight
        });
      };
      
      img.onerror = () => {
        resolve({
          strategy,
          url: testUrl,
          success: false,
          loadTime: Date.now() - startTime,
          error: 'Failed to load'
        });
      };

      // Timeout
      setTimeout(() => {
        resolve({
          strategy,
          url: testUrl,
          success: false,
          loadTime: Date.now() - startTime,
          error: 'Timeout'
        });
      }, 10000);

      img.src = testUrl;
    });
  };

  // ✅ EXECUTAR TODOS OS TESTES
  const runAllTests = async () => {
    setIsLoading(true);
    setTestResults([]);

    const results = [];
    
    for (const url of testAvatars) {
      console.log(`🧪 Testando URL: ${url}`);
      
      for (const strategy of ['direct', 'steam-proxy', 'universal-proxy', 'nextjs-image']) {
        try {
          const result = await testStrategy(url, strategy);
          results.push({
            originalUrl: url,
            ...result
          });
          console.log(`${result.success ? '✅' : '❌'} ${strategy}: ${result.loadTime}ms`);
        } catch (error) {
          results.push({
            originalUrl: url,
            strategy,
            success: false,
            error: error.message
          });
        }
      }
    }

    setTestResults(results);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">
          🧪 Teste Avançado de Avatares Steam
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">🎯 Componente SteamAvatar (Auto-Strategy)</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {testAvatars.map((url, index) => (
              <div key={index} className="text-center">
                <SteamAvatar 
                  src={url} 
                  alt={`Test Avatar ${index + 1}`}
                  size="w-24 h-24"
                  fallbackInitial={(index + 1).toString()}
                  className="mx-auto mb-2"
                />
                <p className="text-xs text-gray-600 truncate">
                  Test {index + 1}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">⚡ Teste de Performance por Estratégia</h2>
            <button
              onClick={runAllTests}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50"
            >
              {isLoading ? '🔄 Testando...' : '🚀 Executar Testes'}
            </button>
          </div>

          {isLoading && (
            <div className="text-center py-8">
              <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-2 text-gray-600">Testando todas as estratégias...</p>
            </div>
          )}

          {testResults.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-3 text-left">URL Original</th>
                    <th className="p-3 text-left">Estratégia</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Tempo (ms)</th>
                    <th className="p-3 text-left">Detalhes</th>
                  </tr>
                </thead>
                <tbody>
                  {testResults.map((result, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-3 text-xs truncate max-w-xs">
                        {result.originalUrl.split('/').pop()}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          result.strategy === 'direct' ? 'bg-blue-100 text-blue-800' :
                          result.strategy === 'steam-proxy' ? 'bg-green-100 text-green-800' :
                          result.strategy === 'universal-proxy' ? 'bg-purple-100 text-purple-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {result.strategy}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {result.success ? '✅ Sucesso' : '❌ Falhou'}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`font-mono ${
                          result.loadTime < 1000 ? 'text-green-600' :
                          result.loadTime < 3000 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {result.loadTime}ms
                        </span>
                      </td>
                      <td className="p-3 text-xs text-gray-600">
                        {result.size || result.error || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">📊 Resumo das Estratégias</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {['direct', 'steam-proxy', 'universal-proxy', 'nextjs-image'].map(strategy => {
              const strategyResults = testResults.filter(r => r.strategy === strategy);
              const successCount = strategyResults.filter(r => r.success).length;
              const totalCount = strategyResults.length;
              const avgTime = totalCount > 0 ? 
                Math.round(strategyResults.reduce((sum, r) => sum + r.loadTime, 0) / totalCount) : 0;

              return (
                <div key={strategy} className="border rounded-lg p-4">
                  <h3 className="font-semibold capitalize mb-2">{strategy.replace('-', ' ')}</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Taxa de Sucesso:</span>
                      <div className="font-mono text-lg">
                        {totalCount > 0 ? `${Math.round(successCount/totalCount*100)}%` : '-'}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Tempo Médio:</span>
                      <div className="font-mono">{avgTime}ms</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-8 text-center text-gray-600">
          <p>🔬 Este teste compara todas as estratégias de carregamento de avatar</p>
          <p>Use os resultados para otimizar a performance no Vercel</p>
        </div>
      </div>
    </div>
  );
}
