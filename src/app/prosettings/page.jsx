'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
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
      <main className="flex flex-col items-center justify-center min-h-[calc(100vh-64px-56px)]">
        <div className="flex flex-wrap justify-center gap-8">
          {players.map((player) => (
            <Link 
              key={player.steamid64} 
              href={`/player/${player.steamid64}`}
              className="group relative transition-transform duration-200 ease-in-out hover:scale-110"
            >
              <SimpleSteamAvatar 
                src={player.avatar}
                alt={`Avatar de ${player.name}`}
                fallbackInitial={player.name.charAt(0).toUpperCase()}
                size="w-26 h-26"
                className="shadow-xl group-hover:shadow-2xl transition-shadow duration-200"
              />
              <div className="absolute left-1/2 top-full mt-2 transform -translate-x-1/2 bg-white border border-gray-200 rounded-lg shadow-md px-3 py-2 min-w-[5rem] max-w-[9rem] opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                <div className="text-center space-y-1">
                  <div className="flex items-center justify-center gap-1.5 font-medium text-gray-900 text-sm leading-tight">
                    <span>{player.name}</span>
                  </div>
                </div>
              </div>
            </Link>
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
