'use client';

import React, { useState, useEffect } from 'react';
import { useFaceitData } from '../../../hooks/useFaceitData';
// Componente filho para hovercard do jogador
function PlayerHoverCard({ player }) {
  const age = calculateAge(player.birthday);
  const { faceitData } = useFaceitData(player.steamid64);
  return (
    <Link 
      key={player.steamid64} 
      href={`/player/${player.steamid64}`}
      className="group relative transition-transform duration-200 ease-in-out hover:scale-110"
    >
      {/* Player Circle */}
      <SimpleSteamAvatar 
        src={player.avatar}
        alt={`Avatar de ${player.name}`}
        size="w-26 h-26"
        className="shadow-xl group-hover:shadow-2xl transition-shadow duration-200"
        fallbackInitial={player.name.charAt(0).toUpperCase()}
      />
      {/* Hover Card - Design equilibrado */}
      <div className="absolute left-1/2 top-full mt-2 transform -translate-x-1/2 
                    bg-white border border-gray-200 rounded-lg shadow-md
                    px-3 py-2 inline-block
                    opacity-0 group-hover:opacity-100 
                    transition-opacity duration-200 pointer-events-none z-10">
        <div className="text-center space-y-1.5">
          {/* Nome do player */}
          <div className="flex items-center justify-center gap-1 font-medium text-gray-900 text-sm leading-tight whitespace-nowrap">
            <span>{player.name}</span>
            {player.benched === true && (
              <span className="text-gray-400 text-xs font-normal flex-shrink-0">B</span>
            )}
          </div>
          {/* Bandeira em linha separada */}
          <div className="flex justify-center">
            <CountryFlag 
              countryCode={player.country} 
              size="w-4 h-3"
              flagSize={40}
            />
          </div>
          {/* Ícone da role + Faceit logo dinâmico */}
          <div className="flex justify-center gap-1 items-center">
            {/* Faceit level logo, se existir */}
            {faceitData && faceitData.level > 0 && (
              <img
                src={`/platforms/faceit-levels/skill_level_${faceitData.level === 10 ? 'max' : faceitData.level}.png`}
                alt={`FACEIT Level ${faceitData.level}`}
                className="w-4 h-4"
                title={`FACEIT Level ${faceitData.level}`}
              />
            )}
            <img 
              src={getRoleIcon(player.idrole)} 
              alt="Role"
              className="w-4 h-4"
            />
          </div>
          {isValidLevel(player.level) && (
            <div className="text-xs text-gray-600 font-medium">
              GC {player.level}
            </div>
          )}
        </div>
      </div>
      {/* ...sem botões de admin... */}
    </Link>
  );
}
import Link from 'next/link';
import CountryFlag from '../../../components/CountryFlag';
import LogoHeader from '../../../components/LogoHeader';
import Layout from '../../../components/Layout';
import LoadingScreen from '../../../components/LoadingScreen';
import SimpleSteamAvatar from '../../../components/SimpleSteamAvatar';
import { isValidLevel, calculateAge } from '../../../utils/playerUtils';
import { getRoleIcon } from '../../../utils/playerRoles';

export default function TeamPage({ params }) {
  const [players, setPlayers] = useState([]);
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [teamId, setTeamId] = useState(null);

  // Primeiro useEffect para extrair teamId dos params
  useEffect(() => {
    const unwrapParams = async () => {
      const unwrapped = await params;
      setTeamId(unwrapped.id);
    };
    unwrapParams();
  }, [params]);

  // Segundo useEffect para buscar dados quando teamId estiver disponível
  useEffect(() => {
    if (!teamId) return;
    
    const fetchTeamData = async () => {
      try {
        setLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        
        // Buscar dados do time
        const teamsRes = await fetch(`${baseUrl}/api/teams`, {cache: 'no-store'});
        if (!teamsRes.ok) throw new Error('Erro ao carregar dados do time');
        const teamsResJson = await teamsRes.json();
        const team = (teamsResJson.data || []).find(team => team.id === teamId);
        setTeamData(team);
        
        // Buscar players do time
        if (team) {
          const playersRes = await fetch(`${baseUrl}/api/players?teamid=${teamId}`, {cache: 'no-store'});
          if (playersRes.ok) {
            const playersResJson = await playersRes.json();
            setPlayers(playersResJson.data || []);
          }
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTeamData();
  }, [teamId]);

  // Exibe LoadingScreen enquanto carrega
  if (loading) {
    return (
      <LoadingScreen loadingDuration={2200}>
        <Layout />
      </LoadingScreen>
    );
  }

  // Se não encontrar o time após carregar
  if (!teamData) {
    return (
      <Layout 
        headerProps={{ logoSize: 32 }}
        footerText="Development"
      >
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-800 mb-4">Time não encontrado</h1>
          <Link href="/teams" className="text-gray-600 hover:text-gray-800 transition-colors">
            ← Voltar para Teams
          </Link>
        </div>
      </Layout>
    );
  }

  const headerProps = {
    logoSize: 24,
    centerLogo: {
      src: teamData.logo || "/teams/unknown.svg",
      alt: `${teamData.name} Logo`,
      href: "/teams",
      fallback: teamData.name.charAt(0)
    },
    centerCountry: teamData.countryid
  };

  return (
    <LoadingScreen loadingDuration={loading ? 2200 : 0}>
      <Layout 
        headerProps={headerProps}
        footerText={teamData.name.toUpperCase()}
      >
        <div className="max-w-6xl w-full">
          {/* Players com hover design */}
          <div className="flex flex-wrap justify-center gap-8">
            {players.map((player) => (
              <PlayerHoverCard key={player.steamid64} player={player} />
            ))}
          </div>
          
          {players.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Nenhum jogador encontrado neste time</p>
            </div>
          )}
        </div>
      </Layout>
    </LoadingScreen>
  );
}
