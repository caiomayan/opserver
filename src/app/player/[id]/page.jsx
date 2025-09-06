'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ReactCountryFlag from "react-country-flag";
import LogoHeader from '../../../components/LogoHeader';
import Layout from '../../../components/Layout';
import LoadingScreen from '../../../components/LoadingScreen';
import { calculateAge, getProfileUrls, isValidLevel } from '../../../utils/playerUtils';
import { getRoleIcon, getRoleName } from '../../../utils/playerRoles';
import { getHudColorName } from '../../../utils/hudColors';
import { useFaceitData } from '../../../hooks/useFaceitData';

export default function PlayerPage({ params }) {
  const [playerData, setPlayerData] = useState(null);
  const [teamData, setTeamData] = useState(null);
  const [playerConfigs, setPlayerConfigs] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id: playerId } = React.use(params);

  // Buscar dados da FACEIT - deve ser chamado sempre, antes de qualquer condição
  const { faceitData, loading: faceitLoading } = useFaceitData(playerData?.steamid64);

  // Helper function to format values, especially booleans
  const formatValue = (value, fieldType = null) => {
    if (fieldType === 'hud_color') {
      return getHudColorName(value);
    }
    if (typeof value === 'boolean') {
      return value ? 'Enabled' : 'Disabled';
    }
    return value;
  };

  // Helper function to check if an object has any non-null values
  const hasValidValues = (obj, fields) => {
    if (!obj) return false;
    return fields.some(field => {
      const value = field.includes('.') ? 
        field.split('.').reduce((o, key) => o?.[key], obj) : 
        obj[field];
      return value !== null && value !== undefined;
    });
  };

  // Check if this is the current user's profile
  const isOwnProfile = currentUser && playerData && currentUser.id === playerData.steamid64;

  // Format last updated date
  const formatLastUpdated = (timestamp) => {
    if (!timestamp) return 'Data não disponível';
    
    try {
      const date = new Date(timestamp);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      
      return `Última atualização: ${day}/${month}/${year}`;
    } catch (error) {
      return 'Data inválida';
    }
  };

  useEffect(() => {
    if (!playerId) return;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch current user data (if logged in)
        try {
          const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
          const userRes = await fetch(`${baseUrl}/api/auth/user`, { 
            credentials: 'include',
            cache: 'no-store'
          });
          if (userRes.ok) {
            const userData = await userRes.json();
            setCurrentUser(userData);
          }
        } catch (userError) {
          // User not logged in, continue without user data
          console.log('User not logged in');
        }

        // Fetch player data
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const playersRes = await fetch(`${baseUrl}/api/players?playerIds=${playerId}`, {cache: 'no-store'});
        if (!playersRes.ok) throw new Error('Erro ao carregar jogador');
        const playersResJson = await playersRes.json();
        const playersArr = playersResJson.data || [];
        const player = playersArr.find(player => player.steamid64 === playerId);
        setPlayerData(player);
        
        // configs já vem junto do player
        setPlayerConfigs(player?.configs || null);
        
        if (player?.teamid) {
          const teamsRes = await fetch(`${baseUrl}/api/teams`, {cache: 'no-store'});
          if (teamsRes.ok) {
            const teamsResJson = await teamsRes.json();
            const team = (teamsResJson.data || []).find(team => team.id === player.teamid);
            setTeamData(team);
          }
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [playerId]);

  // Exibe LoadingScreen enquanto carrega
  if (loading) {
    return (
      <LoadingScreen loadingDuration={2200}>
        <LogoHeader />
      </LoadingScreen>
    );
  }

  // Se não encontrar o jogador após carregar
  if (!playerData) {
    return (
      <LogoHeader>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-gray-800 mb-4">Jogador não encontrado</h1>
            <Link href="/teams" className="text-gray-600 hover:text-gray-800 transition-colors">
              ← Voltar para Teams
            </Link>
          </div>
        </div>
      </LogoHeader>
    );
  }

  // Usar utilitários para cálculos
  const age = calculateAge(playerData.birthday);
  const profileUrls = getProfileUrls(playerData.steamid64);

  return (
    <LoadingScreen loadingDuration={loading ? 2200 : 0}>
      <Layout
        headerProps={{
          centerLogo: {
            src: teamData?.logo || "/teams/unknown.svg",
            alt: teamData?.name ? `${teamData.name} Logo` : "Team Logo",
            href: teamData ? `/team/${teamData.id}` : "/teams"
          },
          // Show flag only if team's country is a valid ISO alpha-2 (no mock/defaults)
          centerCountry: (() => {
            const code = teamData?.countryid ? String(teamData.countryid).trim().toUpperCase() : "";
            return /^[A-Z]{2}$/.test(code) ? code : null;
          })()
        }}
        footerText={teamData?.name ? teamData.name.toUpperCase() : "Development"}
        fullPage={true}
      >
        <div className="w-full max-w-2xl mx-auto px-4 pt-28 pb-24">
          {error && (
            <div className="mb-4 p-3 rounded bg-red-50 text-red-700 text-sm border border-red-200">
              {String(error)}
            </div>
          )}
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
                {isOwnProfile && (
                  <img 
                    src="/others/aero.png" 
                    alt="Seu Perfil" 
                    className="w-5 h-5" 
                    title="Você"
                  />
                )}
                {/* Ícone de informação com tooltip da última atualização */}
                <div className="relative group">
                  <svg 
                    className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help transition-colors" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                    aria-label="Informações de atualização"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-1.5 py-0.5 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                    {formatLastUpdated(playerData.updated_at)}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-800"></div>
                  </div>
                </div>
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
            {/* ...sem botões de admin... */}
          </div>

          {/* Informações do jogador - caixas empilhadas verticalmente */}
          <div className="flex flex-col gap-6">
              <div className="bg-gray-50 p-5 rounded-lg overflow-hidden">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">Descrição</h2>
                <div className="flex flex-col gap-3">
                  <p className="text-gray-600 leading-relaxed">
                    {teamData 
                      ? (
                          <>
                            <span className="text-gray-800 font-medium">{playerData.name}</span> atualmente está no time da <span className="text-gray-800 font-medium">{teamData.name}</span>
                            {playerData.benched === true && (
                              <span className="text-gray-500 text-sm"> (banco)</span>
                            )}, jogando como <span className="text-gray-800 font-medium">{getRoleName(playerData.idrole)}</span>.
                          </>
                        )
                      : (
                          <>
                            <span className="text-gray-800 font-medium">{playerData.name}</span> atualmente está sem time, e joga como <span className="text-gray-800 font-medium">{getRoleName(playerData.idrole)}</span>.
                          </>
                        )
                    }
                  </p>
                </div>
              </div>
              {/* Informações Pessoais */}
              <div className="bg-gray-50 p-5 rounded-lg overflow-hidden">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">Informações</h2>
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center gap-x-2">
                    <span className="text-gray-600 min-w-[90px] truncate">País</span>
                    <div className="flex items-center gap-2">
                      <ReactCountryFlag countryCode={playerData.country} svg style={{width: '1em', height: '1em'}} />
                      <span className="font-medium text-gray-800">{playerData.country}</span>
                    </div>
                  </div>
                  {age && (
                    <div className="flex justify-between items-center gap-x-2">
                      <span className="text-gray-600 min-w-[90px] truncate">Idade</span>
                      <span className="font-medium text-gray-800">{age} anos</span>
                    </div>
                  )}
                  {isValidLevel(playerData.level) && (
                    <>
                      <hr className="border-gray-200" />
                      <div className="flex justify-between items-center gap-x-2">
                        <span className="text-gray-600 min-w-[90px] truncate">Level GC</span>
                        <span className="font-semibold text-gray-800">{playerData.level}</span>
                      </div>
                    </>
                  )}
                  {faceitData && faceitData.level > 0 && (
                    <div className="flex justify-between items-center gap-x-2">
                      <span className="text-gray-600 min-w-[90px] truncate">FACEIT Level</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{faceitData.elo} ELO</span>
                        <span className="font-semibold text-gray-800">{faceitData.level}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Configurações de Mouse */}
              {((playerConfigs?.sensitivity !== null && playerConfigs?.sensitivity !== undefined) || 
                (playerConfigs?.dpi !== null && playerConfigs?.dpi !== undefined) || 
                (playerConfigs?.edpi !== null && playerConfigs?.edpi !== undefined) || 
                hasValidValues(playerConfigs?.mouse_settings, ['polling_rate', 'windows_sens', 'zoom_sensitivity'])) && (
                <div className="bg-gray-50 p-5 rounded-lg overflow-hidden">
                  <h2 className="text-lg font-semibold text-gray-800 mb-3">Mouse</h2>
                  <div className="space-y-3">
                    {(playerConfigs?.sensitivity !== null && playerConfigs?.sensitivity !== undefined) && (
                      <div className="flex justify-between items-center gap-x-2">
                        <span className="text-gray-600 min-w-[90px] truncate">Sensibilidade</span>
                        <span className="font-medium text-gray-800">{formatValue(playerConfigs.sensitivity)}</span>
                      </div>
                    )}
                    {(playerConfigs?.dpi !== null && playerConfigs?.dpi !== undefined) && (
                      <div className="flex justify-between items-center gap-x-2">
                        <span className="text-gray-600 min-w-[90px] truncate">DPI</span>
                        <span className="font-medium text-gray-800">{formatValue(playerConfigs.dpi)}</span>
                      </div>
                    )}
                    {(playerConfigs?.edpi !== null && playerConfigs?.edpi !== undefined) && (
                      <div className="flex justify-between items-center gap-x-2 border-t border-gray-200 pt-2">
                        <span className="text-gray-600 min-w-[90px] truncate">eDPI</span>
                        <span className="font-semibold text-gray-800">{formatValue(playerConfigs.edpi)}</span>
                      </div>
                    )}
                    {playerConfigs?.mouse_settings && (
                      <>
                        {(playerConfigs.mouse_settings.polling_rate !== null && playerConfigs.mouse_settings.polling_rate !== undefined) && (
                          <div className="flex justify-between items-center gap-x-2">
                            <span className="text-gray-600 min-w-[90px] truncate">Polling Rate</span>
                            <span className="font-medium text-gray-800">{formatValue(playerConfigs.mouse_settings.polling_rate)}</span>
                          </div>
                        )}
                        {(playerConfigs.mouse_settings.windows_sens !== null && playerConfigs.mouse_settings.windows_sens !== undefined) && (
                          <div className="flex justify-between items-center gap-x-2">
                            <span className="text-gray-600 min-w-[90px] truncate">Windows Sens</span>
                            <span className="font-medium text-gray-800">{formatValue(playerConfigs.mouse_settings.windows_sens)}</span>
                          </div>
                        )}
                        {(playerConfigs.mouse_settings.zoom_sensitivity !== null && playerConfigs.mouse_settings.zoom_sensitivity !== undefined) && (
                          <div className="flex justify-between items-center gap-x-2">
                            <span className="text-gray-600 min-w-[90px] truncate">Zoom Sens</span>
                            <span className="font-medium text-gray-800">{formatValue(playerConfigs.mouse_settings.zoom_sensitivity)}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Configurações de Vídeo */}
              {(hasValidValues(playerConfigs?.video_settings, ['resolution', 'brightness']) || 
                (playerConfigs?.hz !== null && playerConfigs?.hz !== undefined) || 
                (playerConfigs?.pc_specs?.gpu?.digital_vibrance !== null && playerConfigs?.pc_specs?.gpu?.digital_vibrance !== undefined)) && (
                <div className="bg-gray-50 p-5 rounded-lg overflow-hidden">
                  <h2 className="text-lg font-semibold text-gray-800 mb-3">Vídeo</h2>
                  <div className="space-y-2">
                    {(playerConfigs?.video_settings?.resolution !== null && playerConfigs?.video_settings?.resolution !== undefined) && (
                      <div className="flex justify-between items-center gap-x-2">
                        <span className="text-gray-600 min-w-[90px] truncate">Resolução</span>
                        <span className="font-medium text-gray-800">{formatValue(playerConfigs.video_settings.resolution)}</span>
                      </div>
                    )}
                    {(playerConfigs?.video_settings?.brightness !== null && playerConfigs?.video_settings?.brightness !== undefined) && (
                      <div className="flex justify-between items-center gap-x-2">
                        <span className="text-gray-600 min-w-[90px] truncate">Brilho</span>
                        <span className="font-medium text-gray-800">{formatValue(playerConfigs.video_settings.brightness)}%</span>
                      </div>
                    )}
                    {(playerConfigs?.hz !== null && playerConfigs?.hz !== undefined) && (
                      <div className="flex justify-between items-center gap-x-2">
                        <span className="text-gray-600 min-w-[90px] truncate">Taxa de atualização</span>
                        <span className="font-medium text-gray-800">{formatValue(playerConfigs.hz)}</span>
                      </div>
                    )}
                    {(playerConfigs?.pc_specs?.gpu?.digital_vibrance !== null && playerConfigs?.pc_specs?.gpu?.digital_vibrance !== undefined) && (
                      <div className="flex justify-between items-center gap-x-2">
                        <span className="text-gray-600 min-w-[90px] truncate">Digital Vibrance</span>
                        <span className="font-medium text-gray-800">{formatValue(playerConfigs.pc_specs.gpu.digital_vibrance)}%</span>
                      </div>
                    )}
                    {/* Adicione outros campos relevantes de video_settings aqui */}
                  </div>
                </div>
              )}

              {/* Viewmodel */}
              {hasValidValues(playerConfigs?.viewmodel_settings, ['viewmodel_fov', 'viewmodel_offset_x', 'viewmodel_offset_y', 'viewmodel_offset_z', 'viewmodel_presetpos', 'viewmodel']) && (
                <div className="bg-gray-50 p-5 rounded-lg overflow-hidden">
                  <h2 className="text-lg font-semibold text-gray-800 mb-3">Viewmodel</h2>
                  <div className="space-y-2">
                    {(playerConfigs.viewmodel_settings.viewmodel_fov !== null && playerConfigs.viewmodel_settings.viewmodel_fov !== undefined) && (
                      <div className="flex justify-between items-center gap-x-2">
                        <span className="text-gray-600 min-w-[90px] truncate">FOV</span>
                        <span className="font-medium text-gray-800">{formatValue(playerConfigs.viewmodel_settings.viewmodel_fov)}</span>
                      </div>
                    )}
                    {(playerConfigs.viewmodel_settings.viewmodel_offset_x !== null && playerConfigs.viewmodel_settings.viewmodel_offset_x !== undefined) && (
                      <div className="flex justify-between items-center gap-x-2">
                        <span className="text-gray-600 min-w-[90px] truncate">Offset X</span>
                        <span className="font-medium text-gray-800">{formatValue(playerConfigs.viewmodel_settings.viewmodel_offset_x)}</span>
                      </div>
                    )}
                    {(playerConfigs.viewmodel_settings.viewmodel_offset_y !== null && playerConfigs.viewmodel_settings.viewmodel_offset_y !== undefined) && (
                      <div className="flex justify-between items-center gap-x-2">
                        <span className="text-gray-600 min-w-[90px] truncate">Offset Y</span>
                        <span className="font-medium text-gray-800">{formatValue(playerConfigs.viewmodel_settings.viewmodel_offset_y)}</span>
                      </div>
                    )}
                    {(playerConfigs.viewmodel_settings.viewmodel_offset_z !== null && playerConfigs.viewmodel_settings.viewmodel_offset_z !== undefined) && (
                      <div className="flex justify-between items-center gap-x-2">
                        <span className="text-gray-600 min-w-[90px] truncate">Offset Z</span>
                        <span className="font-medium text-gray-800">{formatValue(playerConfigs.viewmodel_settings.viewmodel_offset_z)}</span>
                      </div>
                    )}
                    {(playerConfigs.viewmodel_settings.viewmodel_presetpos !== null && playerConfigs.viewmodel_settings.viewmodel_presetpos !== undefined) && (
                      <div className="flex justify-between items-center gap-x-2">
                        <span className="text-gray-600 min-w-[90px] truncate">Presetpos</span>
                        <span className="font-medium text-gray-800">{formatValue(playerConfigs.viewmodel_settings.viewmodel_presetpos)}</span>
                      </div>
                    )}
                    {(playerConfigs.viewmodel_settings.viewmodel !== null && playerConfigs.viewmodel_settings.viewmodel !== undefined) && (
                      <div className="flex justify-between items-center gap-x-2">
                        <span className="text-gray-600 min-w-[90px] truncate">Código</span>
                        <span className="font-medium text-gray-800">{formatValue(playerConfigs.viewmodel_settings.viewmodel)}</span>
                      </div>
                    )}
                    {/* Adicione outros campos relevantes de viewmodel_settings aqui */}
                  </div>
                </div>
              )}

              {/* HUD */}
              {hasValidValues(playerConfigs?.hud_settings, ['hud_scaling', 'cl_hud_color', 'cl_radar_scale', 'cl_hud_radar_scale', 'cl_radar_always_centered', 'cl_radar_rotate', 'cl_radar_square_with_scoreboard']) && (
                <div className="bg-gray-50 p-5 rounded-lg overflow-hidden">
                  <h2 className="text-lg font-semibold text-gray-800 mb-3">HUD</h2>
                  <div className="space-y-2">
                    {(playerConfigs.hud_settings.hud_scaling !== null && playerConfigs.hud_settings.hud_scaling !== undefined) && (
                      <div className="flex justify-between items-center gap-x-2">
                        <span className="text-gray-600 min-w-[90px] truncate">HUD Scaling</span>
                        <span className="font-medium text-gray-800">{formatValue(playerConfigs.hud_settings.hud_scaling)}</span>
                      </div>
                    )}
                    {(playerConfigs.hud_settings.cl_hud_color !== null && playerConfigs.hud_settings.cl_hud_color !== undefined) && (
                      <div className="flex justify-between items-center gap-x-2">
                        <span className="text-gray-600 min-w-[90px] truncate">HUD Color</span>
                        <span className="font-medium text-gray-800">{formatValue(playerConfigs.hud_settings.cl_hud_color, 'hud_color')}</span>
                      </div>
                    )}
                    {(playerConfigs.hud_settings.cl_radar_scale !== null && playerConfigs.hud_settings.cl_radar_scale !== undefined) && (
                      <div className="flex justify-between items-center gap-x-2">
                        <span className="text-gray-600 min-w-[90px] truncate">Radar Scale</span>
                        <span className="font-medium text-gray-800">{formatValue(playerConfigs.hud_settings.cl_radar_scale)}</span>
                      </div>
                    )}
                    {(playerConfigs.hud_settings.cl_hud_radar_scale !== null && playerConfigs.hud_settings.cl_hud_radar_scale !== undefined) && (
                      <div className="flex justify-between items-center gap-x-2">
                        <span className="text-gray-600 min-w-[90px] truncate">Radar HUD Size</span>
                        <span className="font-medium text-gray-800">{formatValue(playerConfigs.hud_settings.cl_hud_radar_scale)}</span>
                      </div>
                    )}
                    {(playerConfigs.hud_settings.cl_radar_always_centered !== null && playerConfigs.hud_settings.cl_radar_always_centered !== undefined) && (
                      <div className="flex justify-between items-center gap-x-2">
                        <span className="text-gray-600 min-w-[90px] truncate">Radar Centers The Player</span>
                        <span className="font-medium text-gray-800">{formatValue(playerConfigs.hud_settings.cl_radar_always_centered)}</span>
                      </div>
                    )}
                    {(playerConfigs.hud_settings.cl_radar_rotate !== null && playerConfigs.hud_settings.cl_radar_rotate !== undefined) && (
                      <div className="flex justify-between items-center gap-x-2">
                        <span className="text-gray-600 min-w-[90px] truncate">Radar is Rotating</span>
                        <span className="font-medium text-gray-800">{formatValue(playerConfigs.hud_settings.cl_radar_rotate)}</span>
                      </div>
                    )}
                    {(playerConfigs.hud_settings.cl_radar_square_with_scoreboard !== null && playerConfigs.hud_settings.cl_radar_square_with_scoreboard !== undefined) && (
                      <div className="flex justify-between items-center gap-x-2">
                        <span className="text-gray-600 min-w-[90px] truncate">Radar Toggle Shape With Scoreboard</span>
                        <span className="font-medium text-gray-800">{formatValue(playerConfigs.hud_settings.cl_radar_square_with_scoreboard)}</span>
                      </div>
                    )}
                    {/* Adicione outros campos relevantes de hud_settings aqui */}
                  </div>
                </div>
              )}

              {/* Crosshair */}
              {playerConfigs?.crosshair_code && (
                <div className="bg-gray-50 p-5 rounded-lg overflow-hidden">
                  <h2 className="text-lg font-semibold text-gray-800 mb-3">Crosshair</h2>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center gap-x-2">
                      <span className="text-gray-600 min-w-[90px] truncate">Código</span>
                      <span className="font-medium text-gray-800">{playerConfigs.crosshair_code}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Skins */}
              {playerConfigs?.skins && (
                <div className="bg-gray-50 p-5 rounded-lg overflow-hidden">
                  <h2 className="text-lg font-semibold text-gray-800 mb-3">Skins</h2>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center gap-x-2">
                      <span className="text-gray-600 min-w-[90px] truncate">Skins</span>
                      <span className="font-medium text-gray-800">{playerConfigs.skins}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Gear Specs */}
              {(playerConfigs?.gear_specs && Object.values(playerConfigs.gear_specs).some(value => value !== null && value !== undefined && value !== '')) && (
                <div className="bg-gray-50 p-5 rounded-lg overflow-hidden">
                  <h2 className="text-lg font-semibold text-gray-800 mb-3">Equipamentos</h2>
                  <div className="space-y-2">
                    {Object.entries(playerConfigs.gear_specs).map(([key, value]) => (
                      (value !== null && value !== undefined && value !== '') && (
                        <div key={key} className="flex justify-between items-center gap-x-2">
                          <span className="text-gray-600 min-w-[90px] truncate">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                          <span className="font-medium text-gray-800">{value}</span>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}

              {/* PC Specs */}
              {hasValidValues(playerConfigs?.pc_specs, ['cpu', 'gpu.gpu_card']) && (
                <div className="bg-gray-50 p-5 rounded-lg overflow-hidden">
                  <h2 className="text-lg font-semibold text-gray-800 mb-3">PC</h2>
                  <div className="space-y-2">
                    {(playerConfigs.pc_specs.cpu !== null && playerConfigs.pc_specs.cpu !== undefined) && (
                      <div className="flex justify-between items-center gap-x-2">
                        <span className="text-gray-600 min-w-[90px] truncate">CPU</span>
                        <span className="font-medium text-gray-800">{formatValue(playerConfigs.pc_specs.cpu)}</span>
                      </div>
                    )}
                    {(playerConfigs.pc_specs.gpu?.gpu_card !== null && playerConfigs.pc_specs.gpu?.gpu_card !== undefined) && (
                      <div className="flex justify-between items-center gap-x-2">
                        <span className="text-gray-600 min-w-[90px] truncate">GPU</span>
                        <span className="font-medium text-gray-800">{formatValue(playerConfigs.pc_specs.gpu.gpu_card)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
      </Layout>
    </LoadingScreen>
  );
}
