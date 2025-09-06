'use client';

import { useState, useEffect } from 'react';
import SteamAvatar from '../../components/SteamAvatar';

export default function AvatarTestStable() {
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  const [loadingStats, setLoadingStats] = useState({});

  // ✅ MENOS URLs para evitar rate limiting
  const testAvatars = [
    {
      url: 'https://avatars.steamstatic.com/c6054045a49a9c65c2e1d2d5b8c05387934e940a_medium.jpg',
      name: 'Avatar 1 (Medium)',
      expected: 'Deve funcionar'
    },
    {
      url: 'https://avatars.steamstatic.com/4948b7401158683d8c423d098118bdd1b040bd41_full.jpg',
      name: 'Avatar 2 (Full)',
      expected: 'Deve funcionar'
    },
    {
      url: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/49/4948b7401158683d8c423d098118bdd1b040bd41_full.jpg',
      name: 'Avatar 3 (Moderno)',
      expected: 'Deve funcionar com redirect'
    },
    {
      url: 'https://avatars.steamstatic.com/invalid_test.jpg',
      name: 'Avatar Inválido',
      expected: 'Deve usar fallback'
    }
  ];

  const handleAvatarEvent = (index, event, details) => {
    setLoadingStats(prev => ({
      ...prev,
      [index]: {
        ...prev[index],
        [event]: {
          timestamp: new Date().toLocaleTimeString(),
          details
        }
      }
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">
          🔬 Teste de Avatares Steam - Versão Estável
        </h1>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <h2 className="text-lg font-semibold text-yellow-800 mb-2">
            ⚠️ Problemas Identificados & Soluções
          </h2>
          <ul className="text-yellow-700 space-y-1 text-sm">
            <li>• <strong>Timeout muito agressivo:</strong> Aumentado para 8-15s</li>
            <li>• <strong>Rate limiting Steam:</strong> Delays entre tentativas</li>
            <li>• <strong>Qualidade ruim:</strong> Priorizando versões _full</li>
            <li>• <strong>onError tardio:</strong> Verificação de naturalWidth/Height</li>
            <li>• <strong>Muitas requisições:</strong> Teste individual por vez</li>
          </ul>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Teste Individual */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">👤 Teste Individual</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selecione um avatar para testar:
                </label>
                <select
                  value={selectedAvatar}
                  onChange={(e) => setSelectedAvatar(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {testAvatars.map((avatar, index) => (
                    <option key={index} value={index}>
                      {avatar.name} - {avatar.expected}
                    </option>
                  ))}
                </select>
              </div>

              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-medium mb-2">URL sendo testada:</h3>
                <div className="font-mono text-xs bg-white p-2 rounded border break-all">
                  {testAvatars[selectedAvatar]?.url}
                </div>
              </div>

              <div className="flex justify-center py-8">
                <div className="text-center">
                  <SteamAvatar
                    key={`test-${selectedAvatar}-${Date.now()}`} // Force re-render
                    src={testAvatars[selectedAvatar]?.url}
                    alt={`Test ${selectedAvatar}`}
                    size="w-32 h-32"
                    fallbackInitial={(selectedAvatar + 1).toString()}
                    className="mx-auto mb-4 border-4 border-blue-200"
                  />
                  <div className="text-sm text-gray-600">
                    {testAvatars[selectedAvatar]?.name}
                  </div>
                  <div className="text-xs text-blue-600">
                    {testAvatars[selectedAvatar]?.expected}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Comparação de Estratégias */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">⚡ Estratégias de Carregamento</h2>
            
            <div className="space-y-4">
              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                <strong>Ordem das estratégias:</strong>
                <ol className="list-decimal list-inside mt-2 space-y-1">
                  <li>Steam moderno (alta qualidade)</li>
                  <li>Steam moderno (qualidade original)</li>
                  <li>Proxy Steam (sem otimização)</li>
                  <li>URL original (backup)</li>
                  <li>Proxy universal (último recurso)</li>
                  <li>Fallback padrão Steam</li>
                </ol>
              </div>

              <div className="space-y-3">
                <h3 className="font-medium">🕒 Timeouts por estratégia:</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-green-100 p-2 rounded">
                    <strong>Diretas:</strong> 8s
                  </div>
                  <div className="bg-yellow-100 p-2 rounded">
                    <strong>Proxies:</strong> 15s
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-medium">🔄 Delays entre tentativas:</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-blue-100 p-2 rounded">
                    <strong>Primeiras:</strong> 500ms
                  </div>
                  <div className="bg-purple-100 p-2 rounded">
                    <strong>Tardias:</strong> 1500ms
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Logs de Debug */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
          <h2 className="text-2xl font-semibold mb-4">📋 Logs de Carregamento</h2>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-xs max-h-64 overflow-y-auto">
            <div className="text-yellow-400 mb-2">
              💡 Abra o DevTools Console (F12) para ver logs detalhados de carregamento
            </div>
            <div className="text-blue-400">
              • ✅ = Estratégia funcionou<br/>
              • ❌ = Estratégia falhou<br/>
              • 🔄 = Convertendo URL<br/>
              • ⏰ = Timeout da estratégia<br/>
              • ⚠️ = Rate limiting detectado
            </div>
          </div>
        </div>

        {/* Instruções */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">
            📖 Como usar este teste
          </h2>
          <div className="text-blue-700 space-y-2">
            <p>1. <strong>Selecione um avatar</strong> no dropdown acima</p>
            <p>2. <strong>Observe o carregamento</strong> - deve aparecer em poucos segundos</p>
            <p>3. <strong>Verifique o console</strong> (F12) para logs detalhados</p>
            <p>4. <strong>Se cair no fallback:</strong> pode ser rate limiting temporário</p>
            <p>5. <strong>Teste no Vercel:</strong> deploy e acesse a mesma página</p>
          </div>
        </div>
      </div>
    </div>
  );
}
