'use client';

import { useState } from 'react';
import SteamAvatar from '../../components/SteamAvatar';
import SteamAvatarRobust from '../../components/SteamAvatarRobust';

export default function AvatarComparisonTest() {
  const [testUrl, setTestUrl] = useState('https://avatars.steamstatic.com/c6054045a49a9c65c2e1d2d5b8c05387934e940a_medium.jpg');
  const [startTime, setStartTime] = useState(null);

  const testUrls = [
    'https://avatars.steamstatic.com/c6054045a49a9c65c2e1d2d5b8c05387934e940a_medium.jpg',
    'https://avatars.steamstatic.com/4948b7401158683d8c423d098118bdd1b040bd41_full.jpg',
    'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/49/4948b7401158683d8c423d098118bdd1b040bd41_full.jpg',
    'https://avatars.steamstatic.com/invalid_test.jpg', // Deve falhar
  ];

  const startTest = () => {
    setStartTime(Date.now());
    // Force re-render mudando a key
    setTestUrl(testUrl + '?t=' + Date.now());
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">
          ⚔️ Comparação: SteamAvatar vs SteamAvatarRobust
        </h1>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <h2 className="text-lg font-semibold text-yellow-800 mb-2">
            🎯 Objetivo do Teste
          </h2>
          <p className="text-yellow-700">
            Comparar o comportamento das duas versões do componente para identificar qual é mais estável 
            e não "cai no fallback" após carregar com sucesso.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">🔧 Controles de Teste</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL Steam para testar:
              </label>
              <select
                value={testUrl.split('?')[0]} // Remove timestamp
                onChange={(e) => setTestUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {testUrls.map((url, index) => (
                  <option key={index} value={url}>
                    {url.includes('invalid') ? '❌ URL Inválida (teste fallback)' : 
                     url.includes('_full') ? '🎨 Alta Qualidade (_full)' :
                     url.includes('steamcdn-a') ? '🔄 Formato Moderno' : 
                     '📷 Formato Padrão (_medium)'}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={startTest}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
              >
                🚀 Iniciar Teste Comparativo
              </button>
              
              {startTime && (
                <div className="px-4 py-2 bg-green-100 text-green-800 rounded-lg">
                  ⏱️ Teste iniciado: {new Date(startTime).toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Versão Original */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-blue-700">
              📊 SteamAvatar (Original)
            </h2>
            
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2">Características:</h3>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>• ⏰ Timeouts: 8s direto, 15s proxy</li>
                  <li>• 🔄 Múltiplas estratégias sequenciais</li>
                  <li>• 🛡️ Proteção onError com naturalWidth</li>
                  <li>• 📝 useState para controle de estado</li>
                  <li>• ⚡ Delays progressivos anti-rate-limit</li>
                </ul>
              </div>

              <div className="flex justify-center py-8 border-2 border-blue-200 rounded-lg bg-blue-25">
                <div className="text-center">
                  <SteamAvatar
                    key={`original-${testUrl}`}
                    src={testUrl}
                    alt="Original Avatar"
                    size="w-32 h-32"
                    fallbackInitial="O"
                    className="mx-auto mb-4 border-4 border-blue-300"
                  />
                  <div className="text-sm text-blue-600 font-medium">Versão Original</div>
                </div>
              </div>
            </div>
          </div>

          {/* Versão Robusta */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-green-700">
              🛡️ SteamAvatarRobust (Nova)
            </h2>
            
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium text-green-800 mb-2">Melhorias:</h3>
                <ul className="text-green-700 text-sm space-y-1">
                  <li>• ⏰ Timeouts estendidos: 10s direto, 20s proxy</li>
                  <li>• 🔄 useRef para evitar race conditions</li>
                  <li>• 🛡️ successFlag evita onError tardio</li>
                  <li>• 🧹 Cleanup mais agressivo de handlers</li>
                  <li>• ❌ SEM onError no img final (mais estável)</li>
                </ul>
              </div>

              <div className="flex justify-center py-8 border-2 border-green-200 rounded-lg bg-green-25">
                <div className="text-center">
                  <SteamAvatarRobust
                    key={`robust-${testUrl}`}
                    src={testUrl}
                    alt="Robust Avatar"
                    size="w-32 h-32"
                    fallbackInitial="R"
                    className="mx-auto mb-4 border-4 border-green-300"
                  />
                  <div className="text-sm text-green-600 font-medium">Versão Robusta</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Observações */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
          <h2 className="text-2xl font-semibold mb-4">👀 Como Observar</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-medium text-gray-800">🔍 O que verificar:</h3>
              <ul className="text-gray-700 space-y-1 text-sm">
                <li>1. ⏱️ <strong>Tempo de carregamento</strong> inicial</li>
                <li>2. 🎨 <strong>Qualidade da imagem</strong> final</li>
                <li>3. 🔄 <strong>Estabilidade</strong> - imagem mantém ou cai no fallback?</li>
                <li>4. 📊 <strong>Console logs</strong> - estratégias usadas</li>
                <li>5. 🖼️ <strong>Hover info</strong> - qual estratégia funcionou</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-medium text-gray-800">🎯 Sucesso esperado:</h3>
              <ul className="text-gray-700 space-y-1 text-sm">
                <li>✅ <strong>Carrega em 5-15s</strong> (dependendo da estratégia)</li>
                <li>✅ <strong>Qualidade alta</strong> (_full quando possível)</li>
                <li>✅ <strong>NÃO cai no fallback</strong> depois de carregar</li>
                <li>✅ <strong>Console limpo</strong> sem erros tardios</li>
                <li>✅ <strong>Versão Robusta</strong> deve ser mais estável</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Console Monitor */}
        <div className="bg-gray-900 text-green-400 p-6 rounded-lg mt-8 font-mono text-sm">
          <h3 className="text-white font-sans font-medium mb-4">📺 Monitor do Console (abra F12)</h3>
          <div className="space-y-1">
            <div className="text-blue-400">🔄 "Tentando estratégia X/Y: strategy-name"</div>
            <div className="text-green-400">✅ "Sucesso com estratégia: strategy-name"</div>
            <div className="text-green-400">🎯 "Final load confirmed: url (WxH)"</div>
            <div className="text-red-400">❌ "Falhou estratégia strategy-name"</div>
            <div className="text-yellow-400">⏰ "Timeout na estratégia: strategy-name"</div>
            <div className="text-purple-400">🛡️ "onError ignorado - imagem já carregou"</div>
          </div>
        </div>
      </div>
    </div>
  );
}
