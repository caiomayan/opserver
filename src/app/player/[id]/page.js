'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import Link from 'next/link';
import ReactCountryFlag from "react-country-flag";
import Layout from '../../../components/Layout';
import LoadingScreen from '../../../components/LoadingScreen';
import { calculateAge, calculateEDPI, getProfileUrls, isValidLevel } from '../../../utils/playerUtils';
import { getRoleIcon, getRoleName } from '../../../utils/playerRoles';

export default function PlayerPage({ params }) {
  const [playerData, setPlayerData] = useState(null);
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const { user } = useAuth();
  const isAdmin = user?.user_metadata?.role === 'admin';

  // Primeiro useEffect para extrair o ID dos params
  useEffect(() => {
    const getPlayerId = async () => {
      const { id } = await params;
      setPlayerId(id);
    };
    
    getPlayerId();
  }, [params]);

  // Segundo useEffect para buscar dados quando temos o playerId
  useEffect(() => {
    if (!playerId) return; // Só executa quando temos o playerId
    
    const fetchPlayerData = async () => {
      try {
        setLoading(true);
        
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const [teamsRes] = await Promise.all([
          fetch(`${baseUrl}/api/teams`, {cache: 'no-store'}).catch(() => null)
        ]);
        
        // 🎯 OTIMIZAÇÃO: Buscar apenas o jogador específico
        const playersRes = await fetch(`${baseUrl}/api/players?playerIds=${playerId}`, {cache: 'no-store'});
        
        if (playersRes.ok) {
          const players = await playersRes.json();
          const player = players.find(player => player.steamid64 === playerId);
          setPlayerData(player);
          
          // Buscar dados do time se o jogador tiver teamid
          if (player?.teamid && teamsRes?.ok) {
            const teams = await teamsRes.json();
            const team = teams.find(team => team.id === player.teamid);
            setTeamData(team);
          }
        } else {
          throw new Error('Erro ao carregar jogador');
        }
      } catch (error) {
  setError(error.message);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerData();
  }, [playerId]); // Agora depende apenas do playerId (string estática)

  // Loading state
  if (loading) {
    return (
      <LoadingScreen 
        message="Carregando jogador..."
        subMessage="Buscando informações do player"
      />
    );
  }

  // Se não encontrar o jogador
  if (!playerData) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-gray-800 mb-4">Jogador não encontrado</h1>
            <Link href="/teams" className="text-gray-600 hover:text-gray-800 transition-colors">
              ← Voltar para Teams
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  // Usar utilitários para cálculos
  const edpi = calculateEDPI(playerData.settings.sensitivity, playerData.settings.dpi);
  const age = calculateAge(playerData.birthday);
  const profileUrls = getProfileUrls(playerData.steamid64);

  return (
    <Layout 
      headerProps={{
        centerLogo: {
          src: teamData?.logo || "/teams/unknown.svg",
          alt: teamData?.name ? `${teamData.name} Logo` : "Team Logo",
          href: teamData ? `/team/${teamData.id}` : "/teams"
        },
        centerCountry: teamData?.country || null
      }}
    >
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
        {/* Avatar e informações principais */}
        <div className="text-center mb-8">
            <div className="w-32 h-32 rounded-full bg-gray-200 overflow-hidden shadow-lg mx-auto mb-4">
              {playerData.avatar ? (
                <img 
                  src={playerData.avatar} 
                  alt={`Avatar de ${playerData.name}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <span className="text-3xl font-bold">{playerData.name.charAt(0).toUpperCase()}</span>
                </div>
              )}
            </div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <h1 className="text-2xl font-semibold text-gray-800">{playerData.name}</h1>
              <ReactCountryFlag countryCode={playerData.country} svg style={{width: '1.5em', height: '1.5em'}} />
            </div>
            {/* Ícone da role */}
            <div className="flex justify-center mb-4">
              <img 
                src={getRoleIcon(playerData.idrole)} 
                title={getRoleName(playerData.idrole)}
                alt="Player Role"
                className="w-6 h-6"
              />
            </div>
            <div className="flex items-center justify-center gap-4 mb-8">
              {profileUrls.steam && (
                <a 
                  href={profileUrls.steam}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <img src="/platforms/steam.svg" alt="Steam" className="w-4 h-4" />
                </a>
              )}
            </div>
            {/* Permissões: admins podem ver botões de editar/excluir configs do jogador */}
            {isAdmin && (
              <div className="flex justify-center gap-2 mt-2">
                <button className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200">Editar Config</button>
                <button className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200">Excluir Config</button>
              </div>
            )}
          </div>

          {/* Informações do jogador - DESIGN ORIGINAL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Configurações de Mouse */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Mouse</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Sensibilidade</span>
                  <span className="font-medium text-gray-800">{playerData.settings.sensitivity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">DPI</span>
                  <span className="font-medium text-gray-800">{playerData.settings.dpi}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2">
                  <span className="text-gray-600">eDPI</span>
                  <span className="font-semibold text-gray-800">{edpi}</span>
                </div>
              </div>
            </div>

            {/* Informações Pessoais */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Informações</h2>
              <div className="flex flex-col gap-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">País</span>
                  <div className="flex items-center gap-2">
                    <ReactCountryFlag countryCode={playerData.country} svg style={{width: '1em', height: '1em'}} />
                    <span className="font-medium text-gray-800">{playerData.country}</span>
                  </div>
                </div>
                {age && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Idade</span>
                    <span className="font-medium text-gray-800">{age} anos</span>
                  </div>
                )}
                {isValidLevel(playerData.level) && (
                  <>
                    <hr className="border-gray-200" />
                    <div className="flex justify-between">
                      <span className="text-gray-600">Level GC</span>
                      <span className="font-semibold text-gray-800">{playerData.level}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
