'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ReactCountryFlag from "react-country-flag";
import LogoHeader from '../../../components/LogoHeader';
import Layout from '../../../components/Layout';
import LoadingScreen from '../../../components/LoadingScreen';
import SteamAvatar from '../../../components/SteamAvatar';
import { isValidLevel, calculateAge } from '../../../utils/playerUtils';
import { getRoleIcon } from '../../../utils/playerRoles';

export default function TeamPage({ params }) {
  const [players, setPlayers] = useState([]);
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id: teamId } = React.use(params);

  useEffect(() => {
    if (!teamId) return;
    const fetchTeamData = async () => {
      try {
        setLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const teamsRes = await fetch(`${baseUrl}/api/teams`, {cache: 'no-store'});
        if (!teamsRes.ok) throw new Error('Erro ao carregar dados do time');
        const teamsResJson = await teamsRes.json();
        const team = (teamsResJson.data || []).find(team => team.id === teamId);
        setTeamData(team);
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
            {players.map((player) => {
              const age = calculateAge(player.birthday);
              return (
                <Link 
                  key={player.steamid64} 
                  href={`/player/${player.steamid64}`}
                  className="group relative transition-transform duration-200 ease-in-out hover:scale-110"
                >
                  {/* Player Circle */}
                  <div className="w-26 h-26 rounded-full bg-gray-200 overflow-hidden shadow-xl group-hover:shadow-2xl transition-shadow duration-200">
                    <SteamAvatar 
                      src={player.avatar}
                      alt={`Avatar de ${player.name}`}
                      size={104} // 26 * 4 = 104px
                      className="w-full h-full object-cover"
                      fallback={
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <span className="text-xl font-bold">{player.name.charAt(0).toUpperCase()}</span>
                        </div>
                      }
                    />
                  </div>
                  {/* Hover Card - Design equilibrado */}
                  <div className="absolute left-1/2 top-full mt-2 transform -translate-x-1/2 
                                bg-white border border-gray-200 rounded-lg shadow-md
                                px-3 py-2 min-w-[5rem] max-w-[9rem]
                                opacity-0 group-hover:opacity-100 
                                transition-opacity duration-200 pointer-events-none z-10">
                    <div className="text-center space-y-1">
                      <div className="flex items-center justify-center gap-1.5 font-medium text-gray-900 text-sm leading-tight">
                        <span>{player.name}</span>
                        {player.benched === true && (
                          <span className="text-gray-400 text-xs font-normal">B</span>
                        )}
                        <ReactCountryFlag 
                          countryCode={player.country} 
                          svg 
                          style={{width: '0.9em', height: '0.9em'}} 
                        />
                      </div>
                      {/* Ícone da role */}
                      <div className="flex justify-center mb-1">
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
            })}
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
