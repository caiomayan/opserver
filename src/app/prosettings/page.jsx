'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import PlayerHoverCard from '../../components/PlayerHoverCard';
import Footer from '../../components/Footer';
import SimpleSteamAvatar from '../../components/SimpleSteamAvatar';

const ProSettingsPage = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await fetch('/api/players', {cache: 'no-store'});
        if (response.ok) {
          const data = await response.json();
          setPlayers(data.data || []);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchPlayers();
  }, []);

  return (
    <>
      <Header />
      <main className="flex flex-col items-center justify-center min-h-[calc(100vh-64px-56px)] overflow-visible">
        <div className="flex flex-wrap justify-center gap-8 overflow-visible relative">
          {players.map((player) => (
            <PlayerHoverCard key={player.steamid64} player={player} />
          ))}
        </div>
        {players.length === 0 && !loading && (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Nenhum jogador encontrado</h3>
            <p className="text-gray-600">Não foi possível carregar os jogadores no momento.</p>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
};

export default ProSettingsPage;
