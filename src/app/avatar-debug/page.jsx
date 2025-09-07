'use client';

import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import SimpleSteamAvatar from '../../components/SimpleSteamAvatar';

export default function AvatarDebugPage() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiLogs, setApiLogs] = useState([]);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setApiLogs(prev => [...prev, '🔍 Buscando players da API...']);
        
        const response = await fetch('/api/players', {cache: 'no-store'});
        
        if (response.ok) {
          const data = await response.json();
          const playersData = data.data || [];
          setPlayers(playersData.slice(0, 5)); // Apenas 5 primeiros para teste
          
          setApiLogs(prev => [...prev, `✅ ${playersData.length} players encontrados`]);
          
          // Log dos avatares
          playersData.slice(0, 5).forEach(player => {
            setApiLogs(prev => [...prev, `👤 ${player.name}: ${player.avatar || 'SEM AVATAR'}`]);
          });
        } else {
          setApiLogs(prev => [...prev, `❌ Erro na API: ${response.status}`]);
        }
      } catch (error) {
        setApiLogs(prev => [...prev, `💥 Erro: ${error.message}`]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPlayers();
  }, []);

  // Teste manual de estratégias
  const testSteamId = "76561198000000000"; // Steam ID de exemplo
  const testAvatarUrl = "https://avatars.steamstatic.com/abcdef1234567890abcdef1234567890abcdef12_full.jpg";

  return (
    <Layout
      headerProps={{ logoSize: 24 }}
      footerText="Avatar Debug"
    >
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">🔧 Debug de Avatares Steam</h1>
        
        {/* Status da API */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-semibold mb-3">📊 Log da API /api/players</h2>
          <div className="space-y-1 text-sm font-mono">
            {apiLogs.map((log, index) => (
              <div key={index} className="text-gray-700">{log}</div>
            ))}
          </div>
        </div>

        {/* Teste de estratégias manuais */}
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-semibold mb-3">🧪 Teste de Estratégias</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* Teste 1: URL Steam direta */}
            <div className="text-center">
              <h3 className="text-sm font-medium mb-2">URL Steam Original</h3>
              <SimpleSteamAvatar 
                src={testAvatarUrl}
                size="w-16 h-16"
                fallbackInitial="T"
              />
              <p className="text-xs text-gray-600 mt-1">Steam direto</p>
            </div>

            {/* Teste 2: Com Steam ID (proxy) */}
            <div className="text-center">
              <h3 className="text-sm font-medium mb-2">Com Steam ID</h3>
              <SimpleSteamAvatar 
                src={testAvatarUrl}
                steamId64={testSteamId}
                size="w-16 h-16"
                fallbackInitial="P"
              />
              <p className="text-xs text-gray-600 mt-1">Com proxy</p>
            </div>

            {/* Teste 3: URL inválida (fallback) */}
            <div className="text-center">
              <h3 className="text-sm font-medium mb-2">URL Inválida</h3>
              <SimpleSteamAvatar 
                src="https://invalid-url.com/avatar.jpg"
                steamId64={testSteamId}
                size="w-16 h-16"
                fallbackInitial="F"
              />
              <p className="text-xs text-gray-600 mt-1">Fallback</p>
            </div>

            {/* Teste 4: Sem src (apenas Steam ID) */}
            <div className="text-center">
              <h3 className="text-sm font-medium mb-2">Apenas Steam ID</h3>
              <SimpleSteamAvatar 
                src={null}
                steamId64={testSteamId}
                size="w-16 h-16"
                fallbackInitial="S"
              />
              <p className="text-xs text-gray-600 mt-1">ID apenas</p>
            </div>
          </div>
        </div>

        {/* Players da API */}
        <div className="bg-white border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3">👥 Players da API</h2>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-pulse text-gray-500">Carregando...</div>
            </div>
          ) : players.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {players.map((player) => (
                <div key={player.steamid64} className="text-center">
                  <SimpleSteamAvatar 
                    src={player.avatar}
                    steamId64={player.steamid64}
                    alt={`Avatar de ${player.name}`}
                    size="w-16 h-16"
                    fallbackInitial={player.name.charAt(0).toUpperCase()}
                    className="mx-auto mb-2"
                  />
                  <div className="text-sm font-medium">{player.name}</div>
                  <div className="text-xs text-gray-500 truncate">
                    {player.avatar ? '✅ Avatar' : '❌ Sem avatar'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Nenhum player encontrado
            </div>
          )}
        </div>

        {/* Links de teste */}
        <div className="mt-6 space-y-2 text-sm">
          <h3 className="font-semibold">🔗 URLs de Teste:</h3>
          <div className="space-y-1 text-blue-600">
            <div>
              <a href="/api/players" target="_blank" rel="noopener noreferrer" className="hover:underline">
                /api/players - API de jogadores
              </a>
            </div>
            <div>
              <a href="/api/steam-avatar/test_full.jpg" target="_blank" rel="noopener noreferrer" className="hover:underline">
                /api/steam-avatar/test_full.jpg - Proxy Steam
              </a>
            </div>
            <div>
              <a href="/api/proxy-image?url=https://avatars.steamstatic.com/test.jpg" target="_blank" rel="noopener noreferrer" className="hover:underline">
                /api/proxy-image - Proxy universal
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
