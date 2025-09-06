'use client';

import { useState, useEffect } from 'react';
import SteamAvatar from '../../components/SteamAvatar';

export default function AvatarTestPage() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await fetch('/api/players');
        const data = await response.json();
        setPlayers(data.data || []);
      } catch (error) {
        console.error('Erro ao carregar jogadores:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Teste de Avatares Steam</h1>
      
      {loading ? (
        <p>Carregando jogadores...</p>
      ) : (
        <div>
          <h2>Jogadores com avatares ({players.length} encontrados):</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px', marginTop: '20px' }}>
            {players.map((player) => (
              <div key={player.steamid64} style={{ 
                border: '1px solid #ddd', 
                padding: '15px', 
                borderRadius: '8px',
                textAlign: 'center',
                backgroundColor: '#f9f9f9'
              }}>
                <h3>{player.name}</h3>
                
                <div style={{ marginBottom: '10px' }}>
                  <strong>Avatar URL:</strong>
                  <div style={{ fontSize: '12px', wordBreak: 'break-all', color: '#666' }}>
                    {player.avatar || 'Sem avatar'}
                  </div>
                </div>

                <div style={{ marginBottom: '10px' }}>
                  <strong>Novo Componente:</strong>
                  <div style={{ margin: '10px auto', width: 'fit-content' }}>
                    <SteamAvatar 
                      src={player.avatar}
                      alt={`Avatar de ${player.name}`}
                      fallbackInitial={player.name.charAt(0).toUpperCase()}
                      size="w-16 h-16"
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '10px' }}>
                  <strong>Tag IMG Normal:</strong>
                  <div style={{ margin: '10px auto', width: 'fit-content' }}>
                    {player.avatar ? (
                      <img 
                        src={player.avatar}
                        alt={`Avatar de ${player.name}`}
                        style={{ 
                          width: '64px', 
                          height: '64px', 
                          borderRadius: '50%',
                          border: '2px solid #ccc'
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                    ) : null}
                    <div style={{ 
                      display: player.avatar ? 'none' : 'block',
                      width: '64px', 
                      height: '64px', 
                      borderRadius: '50%',
                      backgroundColor: '#ddd',
                      lineHeight: '64px',
                      textAlign: 'center',
                      margin: '0 auto'
                    }}>
                      {player.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '12px', color: '#666' }}>
                  SteamID: {player.steamid64}
                </div>
              </div>
            ))}
          </div>

          {players.length === 0 && (
            <p>Nenhum jogador encontrado.</p>
          )}
        </div>
      )}

      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
        <h3>Instruções de teste:</h3>
        <ol>
          <li>Verifique se os avatares carregam usando o novo componente SteamAvatar</li>
          <li>Compare com as tags img normais</li>
          <li>Verifique se o fallback (inicial do nome) aparece quando o avatar falha</li>
          <li>Teste no Vercel para ver se resolve o problema</li>
        </ol>
      </div>
    </div>
  );
}
