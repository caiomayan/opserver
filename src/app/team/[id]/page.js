'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import Link from 'next/link';
import ReactCountryFlag from "react-country-flag";
import Layout from '../../../components/Layout';
import LoadingScreen from '../../../components/LoadingScreen';
import { isValidLevel, calculateAge } from '../../../utils/playerUtils';
import { getRoleIcon } from '../../../utils/playerRoles';

export default function TeamPage({ params }) {
  const [players, setPlayers] = useState([]);
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [teamId, setTeamId] = useState(null);
  const { user } = useAuth();
  const isAdmin = user?.user_metadata?.role === 'admin';

  // Primeiro useEffect para extrair o ID dos params
  useEffect(() => {
    const getTeamId = async () => {
      const { id } = await params;
      setTeamId(id);
    };
    
    getTeamId();
  }, [params]);

  // Segundo useEffect para buscar dados quando temos o teamId
  useEffect(() => {
    if (!teamId) return; // Só executa quando temos o teamId
    
    const fetchTeamData = async () => {
      try {
        setLoading(true);
        
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const [teamsRes] = await Promise.all([
          fetch(`${baseUrl}/api/teams`, {cache: 'no-store'})
        ]);
        
        if (teamsRes.ok) {
          const teams = await teamsRes.json();
          const team = teams.find(team => team.id === teamId);
          setTeamData(team);
          
          if (team) {
            // 🎯 OTIMIZAÇÃO: Buscar apenas jogadores deste time específico
            const playersRes = await fetch(`${baseUrl}/api/players?teamid=${teamId}`, {cache: 'no-store'});
            if (playersRes.ok) {
              const playersData = await playersRes.json();
              setPlayers(playersData);
            }
          }
        } else {
          throw new Error('Erro ao carregar dados do time');
        }
      } catch (error) {
  setError(error.message);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, [teamId]); // Agora depende apenas do teamId (string estática)

  // Loading state
  if (loading) {
    return (
      <LoadingScreen 
        message="Carregando"
        subMessage="Buscando jogadores e informações"
      />
    );
  }

  // Se não encontrar o time
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
    centerCountry: teamData.country
  };

  return (
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
                  {player.avatar ? (
                    <img 
                      src={player.avatar} 
                      alt={`Avatar de ${player.name}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <span className="text-xl font-bold">{player.name.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
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
                {/* Permissões: admins podem ver botões de editar/excluir configs */}
                {isAdmin && (
                  <div className="flex justify-center gap-2 mt-2">
                    <button className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200">Editar Config</button>
                    <button className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200">Excluir Config</button>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
        
        {players.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Nenhum jogador encontrado neste time.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
