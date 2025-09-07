'use client';

import React, { useState, useEffect } from 'react';

export default function TeamSimplePage({ params }) {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teamId, setTeamId] = useState(null);

  useEffect(() => {
    const unwrapParams = async () => {
      const unwrapped = await params;
      setTeamId(unwrapped.id);
    };
    unwrapParams();
  }, [params]);

  useEffect(() => {
    console.log('🔄 useEffect executado, teamId:', teamId);
    
    const fetchPlayers = async () => {
      try {
        console.log('🔍 Fazendo fetch para API...');
        const res = await fetch(`/api/players?teamid=${teamId}`);
        console.log('🔍 Response status:', res.status);
        const data = await res.json();
        console.log('🔍 Response data:', data);
        setPlayers(data.data || []);
      } catch (error) {
        console.error('❌ Erro:', error);
      } finally {
        setLoading(false);
      }
    };

    if (teamId) {
      fetchPlayers();
    }
  }, [teamId]);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Time: {teamId || 'Loading team ID...'}</h1>
      <p>Debug - Loading: {loading ? 'true' : 'false'}</p>
      <p>Debug - TeamId: {teamId || 'null'}</p>
      
      {loading && <div>Carregando...</div>}
      
      {!loading && (
        <>
          <h2>Players ({players.length}):</h2>
          {players.map((player, index) => (
            <div key={index} style={{ margin: '10px 0', padding: '10px', border: '1px solid #ccc' }}>
              <div><strong>Nome:</strong> {player.name}</div>
              <div><strong>Steam ID:</strong> {player.steamid64}</div>
              <div><strong>Avatar:</strong> <img src={player.avatar} alt={player.name} style={{ width: '50px', height: '50px' }} /></div>
            </div>
          ))}
          {players.length === 0 && <p>Nenhum player encontrado</p>}
        </>
      )}
    </div>
  );
}
