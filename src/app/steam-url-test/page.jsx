'use client';

import { useState } from 'react';
import SteamAvatar from '../../components/SteamAvatar';
import { normalizeSteamAvatarUrl } from '../../utils/steamAvatar';

export default function SteamUrlTest() {
  const [testUrl, setTestUrl] = useState('https://avatars.steamstatic.com/c6054045a49a9c65c2e1d2d5b8c05387934e940a_medium.jpg');
  const [results, setResults] = useState(null);

  // URLs de teste conhecidas
  const knownUrls = [
    'https://avatars.steamstatic.com/c6054045a49a9c65c2e1d2d5b8c05387934e940a_medium.jpg',
    'https://avatars.steamstatic.com/4948b7401158683d8c423d098118bdd1b040bd41_full.jpg',
    'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/49/4948b7401158683d8c423d098118bdd1b040bd41_full.jpg',
  ];

  const testUrl_ = async (url) => {
    const modernUrl = normalizeSteamAvatarUrl(url);
    
    const testResults = {
      original: url,
      modern: modernUrl,
      tests: {}
    };

    // Testa URL original
    try {
      const response = await fetch(url, { method: 'HEAD' });
      testResults.tests.original = {
        status: response.status,
        success: response.ok,
        contentType: response.headers.get('content-type')
      };
    } catch (error) {
      testResults.tests.original = { error: error.message };
    }

    // Testa URL moderna
    if (modernUrl !== url) {
      try {
        const response = await fetch(modernUrl, { method: 'HEAD' });
        testResults.tests.modern = {
          status: response.status,
          success: response.ok,
          contentType: response.headers.get('content-type')
        };
      } catch (error) {
        testResults.tests.modern = { error: error.message };
      }
    }

    setResults(testResults);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">
          🔧 Teste de URLs Steam - Formato Moderno
        </h1>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">🧪 Teste Individual</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL Steam para testar:
              </label>
              <input
                type="text"
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Cole uma URL Steam aqui..."
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => testUrl_(testUrl)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
              >
                🧪 Testar URL
              </button>
              
              <button
                onClick={() => setTestUrl('https://avatars.steamstatic.com/c6054045a49a9c65c2e1d2d5b8c05387934e940a_medium.jpg')}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm"
              >
                Reset
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {knownUrls.map((url, index) => (
                <button
                  key={index}
                  onClick={() => setTestUrl(url)}
                  className="text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm"
                >
                  <div className="font-mono text-xs text-gray-600 truncate">
                    {url.split('/').pop()}
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    {url.includes('steamcdn-a') ? '✅ Formato Moderno' : '❌ Formato Antigo'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {results && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">📊 Resultados do Teste</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">🔗 URLs</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Original:</span>
                    <div className="font-mono text-sm bg-white p-2 rounded border mt-1 break-all">
                      {results.original}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Moderno:</span>
                    <div className="font-mono text-sm bg-white p-2 rounded border mt-1 break-all">
                      {results.modern}
                    </div>
                    {results.modern !== results.original && (
                      <div className="text-xs text-green-600 mt-1">✅ URL foi convertida para formato moderno</div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">🧪 Testes de Conectividade</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(results.tests).map(([type, result]) => (
                    <div key={type} className="border rounded-lg p-4">
                      <h4 className="font-medium capitalize mb-2">{type} URL</h4>
                      {result.error ? (
                        <div className="text-red-600 text-sm">❌ Erro: {result.error}</div>
                      ) : (
                        <div className="space-y-1 text-sm">
                          <div className={`font-medium ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                            {result.success ? '✅ Sucesso' : '❌ Falhou'} - Status: {result.status}
                          </div>
                          {result.contentType && (
                            <div className="text-gray-600">Tipo: {result.contentType}</div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">👤 Preview do Avatar</h3>
                <div className="flex gap-6 items-center">
                  <div className="text-center">
                    <SteamAvatar 
                      src={results.original}
                      size="w-20 h-20"
                      fallbackInitial="T"
                    />
                    <div className="text-xs text-gray-600 mt-2">Original</div>
                  </div>
                  
                  <div className="text-center">
                    <SteamAvatar 
                      src={results.modern}
                      size="w-20 h-20"
                      fallbackInitial="M"
                    />
                    <div className="text-xs text-gray-600 mt-2">Moderno</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">
            💡 Descoberta Importante
          </h2>
          <div className="text-blue-700 space-y-2">
            <p>
              <strong>Problema encontrado:</strong> Steam mudou o formato das URLs de avatar!
            </p>
            <p>
              <strong>Formato antigo (não funciona):</strong> 
              <code className="bg-white px-2 py-1 rounded text-sm ml-1">
                https://avatars.steamstatic.com/HASH_size.jpg
              </code>
            </p>
            <p>
              <strong>Formato novo (funciona):</strong> 
              <code className="bg-white px-2 py-1 rounded text-sm ml-1">
                https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/XX/HASH_size.jpg
              </code>
            </p>
            <p className="text-sm">
              Onde <code>XX</code> são os primeiros 2 caracteres do hash.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
