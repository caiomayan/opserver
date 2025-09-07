'use client';

import React, { useState, useEffect } from 'react';

export default function TeamDebugPage() {
  const [logs, setLogs] = useState([]);
  const [playersData, setPlayersData] = useState(null);
  const [error, setError] = useState(null);

  const addLog = (message) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        addLog('🔍 Fazendo fetch para API...');
        const res = await fetch('/api/players?teamid=furia');
        addLog(`🔍 Response status: ${res.status}`);
        const data = await res.json();
        addLog(`🔍 Response data recebido: ${JSON.stringify(data, null, 2)}`);
        addLog(`🔍 Players count: ${data?.data?.length || 0}`);
        setPlayersData(data);
      } catch (err) {
        addLog(`❌ Erro: ${err.message}`);
        setError(err.message);
      }
    };

    fetchPlayers();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Debug da API Players</h1>
      
      <h2>Logs:</h2>
      <div style={{ background: '#f0f0f0', padding: '10px', borderRadius: '5px', height: '200px', overflow: 'auto' }}>
        {logs.map((log, index) => (
          <div key={index}>{log}</div>
        ))}
      </div>

      <h2>Dados Brutos:</h2>
      <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '5px' }}>
        {JSON.stringify(playersData, null, 2)}
      </pre>

      {error && (
        <div style={{ color: 'red' }}>
          <h2>Erro:</h2>
          <p>{error}</p>
        </div>
      )}

      {playersData?.data && (
        <div>
          <h2>Players encontrados: {playersData.data.length}</h2>
          {playersData.data.map((player, index) => (
            <div key={index} style={{ 
              border: '1px solid #ccc', 
              margin: '10px 0', 
              padding: '10px',
              borderRadius: '5px'
            }}>
              <strong>Nome:</strong> {player.name}<br/>
              <strong>Steam ID:</strong> {player.steamid64}<br/>
              <strong>Team:</strong> {player.teamid}<br/>
              <strong>Avatar:</strong> {player.avatar}<br/>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
