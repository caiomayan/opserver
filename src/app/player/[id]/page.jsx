'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import LoadingScreen from '@/components/LoadingScreen';
import Layout from '@/components/Layout';
import LogoHeader from '@/components/LogoHeader';
import SimpleSteamAvatar from '@/components/SimpleSteamAvatar';
import CountryFlag, { CountryName } from '@/components/CountryFlag';
import { getRoleName, getRoleIcon } from '@/utils/playerRoles';
import { calculateAge, getProfileUrls, isValidLevel } from '@/utils/playerUtils';
import { useFaceitData } from '@/hooks/useFaceitData';
import { getHudColorName } from '@/utils/hudColors';

export default function PlayerPage() {
  const params = useParams();
  const [playerData, setPlayerData] = useState(null);
  const [playerConfigs, setPlayerConfigs] = useState(null);
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  const { faceitData, loading: faceitLoading, error: faceitError } = useFaceitData(playerData?.steamid64);

  useEffect(() => {
    if (playerData?.steamid64) {
      console.log('🎮 Player Steam ID para FACEIT:', playerData.steamid64);
    }
  }, [playerData?.steamid64]);

  useEffect(() => {
    console.log('🎮 FACEIT Data na página:', faceitData);
  }, [faceitData]);

  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        const response = await fetch(`/api/players?id=${params.id}`);
        if (!response.ok) {
          throw new Error('Jogador não encontrado');
        }
        const data = await response.json();
        setPlayerData(data.player);
        setPlayerConfigs(data.config);
        setTeamData(data.team);

        // Check if it's the user's own profile
        const userResponse = await fetch('/api/auth/user', {
          credentials: 'include'
        });
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setIsOwnProfile(userData.id === parseInt(params.id));
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchPlayerData();
    }
  }, [params.id]);

  const formatValue = (value, type = null) => {
    if (value === null || value === undefined || value === '') {
      return 'N/A';
    }
    
    if (type === 'hud_color') {
      return getHudColorName(value);
    }
    
    return String(value);
  };

  const formatLastUpdated = (dateString) => {
    if (!dateString) return 'Data não disponível';
    
    try {
      const date = new Date(dateString);
      return `Atualizado em ${date.toLocaleDateString('pt-BR')} às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return 'Data inválida';
    }
  };

  const hasValidValues = (obj, fields) => {
    if (!obj || typeof obj !== 'object') return false;
    return fields.some(field => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        return obj[parent] && obj[parent][child] !== null && obj[parent][child] !== undefined && obj[parent][child] !== '';
      }
      return obj[field] !== null && obj[field] !== undefined && obj[field] !== '';
    });
  };

  // Verificar se há alguma configuração válida para determinar layout
  const hasAnyConfigs = () => {
    if (!playerConfigs) return false;
    
    // Verificar configurações básicas
    const hasBasicConfigs = (
      (playerConfigs.sensitivity !== null && playerConfigs.sensitivity !== undefined) ||
      (playerConfigs.dpi !== null && playerConfigs.dpi !== undefined) ||
      (playerConfigs.edpi !== null && playerConfigs.edpi !== undefined) ||
      (playerConfigs.hz !== null && playerConfigs.hz !== undefined) ||
      (playerConfigs.crosshair_code && playerConfigs.crosshair_code.trim() !== '') ||
      (playerConfigs.skins && typeof playerConfigs.skins === 'string' && playerConfigs.skins.trim() !== '')
    );

    if (hasBasicConfigs) return true;

    // Verificar configurações aninhadas
    const hasNestedConfigs = (
      hasValidValues(playerConfigs.mouse_settings, ['polling_rate', 'windows_sens', 'zoom_sensitivity']) ||
      hasValidValues(playerConfigs.video_settings, ['resolution', 'brightness']) ||
      hasValidValues(playerConfigs.viewmodel_settings, ['viewmodel_fov', 'viewmodel_offset_x', 'viewmodel_offset_y', 'viewmodel_offset_z', 'viewmodel_presetpos', 'viewmodel']) ||
      hasValidValues(playerConfigs.hud_settings, ['hud_scaling', 'cl_hud_color', 'cl_radar_scale', 'cl_hud_radar_scale', 'cl_radar_always_centered', 'cl_radar_rotate', 'cl_radar_square_with_scoreboard']) ||
      hasValidValues(playerConfigs.pc_specs, ['cpu', 'gpu.gpu_card', 'gpu.digital_vibrance']) ||
      (playerConfigs.gear_specs && typeof playerConfigs.gear_specs === 'object' && Object.values(playerConfigs.gear_specs).some(value => value !== null && value !== undefined && value !== ''))
    );

    return hasNestedConfigs;
  };

  if (loading) {
    return <LoadingScreen loadingDuration={2200} />;
  }

  if (error || !playerData) {
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
        {error && (
          <div className="w-full max-w-6xl mx-auto px-4 pt-28 mb-4">
            <div className="p-3 rounded bg-red-50 text-red-700 text-sm border border-red-200">
              {String(error)}
            </div>
          </div>
        )}
        
        <div className={`w-full max-w-6xl mx-auto px-4 ${error ? 'pt-4' : 'pt-28'} pb-24 ${!hasAnyConfigs() ? 'min-h-screen flex items-center' : ''}`}>
          {/* Layout principal - dinâmico baseado em configurações */}
          <div className={`${hasAnyConfigs() 
            ? 'grid grid-cols-1 lg:grid-cols-5 gap-8' 
            : 'flex justify-center w-full'
          }`}>
            
            {/* Coluna principal - informações do jogador */}
            <div className={hasAnyConfigs() ? 'lg:col-span-2' : 'w-full max-w-2xl'}>
              {/* Avatar e informações principais */}
              <div className="text-center mb-6">
                <SimpleSteamAvatar 
                  src={playerData.avatar}
                  alt={`Avatar de ${playerData.name}`}
                  size="w-32 h-32"
                  fallbackInitial={playerData.name.charAt(0).toUpperCase()}
                  className="shadow-lg mx-auto mb-4"
                />
                <div className="flex items-center justify-center gap-2 mb-2">
                  <h1 className="text-2xl font-semibold text-gray-800">{playerData.name}</h1>
                  <CountryFlag countryCode={playerData.country} size="w-6 h-4" flagSize={40} />
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
                
                {/* Role e links */}
                <div className="flex justify-center mb-4">
                  <img 
                    src={getRoleIcon(playerData.idrole)} 
                    title={getRoleName(playerData.idrole)}
                    alt="Player Role"
                    className="w-6 h-6"
                  />
                </div>
                
                <div className="flex items-center justify-center gap-4 mb-6">
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
                  {isOwnProfile && (
                    <Link 
                      href="/profile"
                      className="flex items-center justify-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                      </svg>
                      Editar Perfil
                    </Link>
                  )}
                </div>
              </div>












              {/* Descrição remodelada, integrada ao design do projeto */}
              <div className="mb-8">
                <div className="w-full flex justify-center">
                  <div className="max-w-2xl w-full bg-white/80 border border-gray-100 shadow-sm rounded-xl px-6 py-5">
                    <p className="text-center text-gray-700 text-lg font-normal leading-relaxed tracking-tight">
                      {teamData ? (
                        <>
                          <span className="font-bold text-black">{playerData.name}</span> é {getRoleName(playerData.idrole).toLowerCase()} da{' '}
                          <a href={`/team/${teamData.id}`} className="text-gray-800 hover:underline transition-colors font-normal">{teamData.name}</a>.
                          {playerData.benched === true ? " Atualmente está no banco de reservas." : ""}
                          {age ? ` Tem ${age} anos.` : ""}
                          {isValidLevel(playerData.level) ? ` Possui nível ${playerData.level} no GamersClub.` : ""}
                        </>
                      ) : (
                        <>
                          <span className="font-bold text-black">{playerData.name}</span> atua como {getRoleName(playerData.idrole).toLowerCase()}.
                          {age ? ` Tem ${age} anos.` : ""}
                          {isValidLevel(playerData.level) ? ` Possui nível ${playerData.level} no GamersClub.` : ""}
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Informações Pessoais */}
              <div className="bg-gray-50 p-5 rounded-lg">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">Informações</h2>
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center gap-x-2">
                    <span className="text-gray-600 min-w-[90px] truncate">País</span>
                    <div className="flex items-center gap-2">
                      <CountryFlag countryCode={playerData.country} size="w-6 h-4" flagSize={20} />
                      <CountryName countryCode={playerData.country} className="font-medium text-gray-800" />
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
                  {/* FACEIT Information */}
                  {faceitLoading && (
                    <div className="flex justify-between items-center gap-x-2">
                      <span className="text-gray-600 min-w-[90px] truncate">FACEIT</span>
                      <span className="text-xs text-gray-500">Carregando...</span>
                    </div>
                  )}
                  {!faceitLoading && faceitError && (
                    <div className="flex justify-between items-center gap-x-2">
                      <span className="text-gray-600 min-w-[90px] truncate">FACEIT</span>
                      <span className="text-xs text-red-500">Erro ao carregar</span>
                    </div>
                  )}
                  {!faceitLoading && !faceitError && faceitData && faceitData.level > 0 && (
                    <div className="flex justify-between items-center gap-x-2">
                      <span className="text-gray-600 min-w-[90px] truncate">FACEIT Level</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{faceitData.elo} ELO</span>
                        <span className="font-semibold text-gray-800">{faceitData.level}</span>
                      </div>
                    </div>
                  )}
                  {!faceitLoading && !faceitError && faceitData && faceitData.level === 0 && (
                    <div className="flex justify-between items-center gap-x-2">
                      <span className="text-gray-600 min-w-[90px] truncate">FACEIT</span>
                      <span className="text-xs text-gray-500">Sem ranking CS2</span>
                    </div>
                  )}
                  {!faceitLoading && !faceitError && !faceitData && (
                    <div className="flex justify-between items-center gap-x-2">
                      <span className="text-gray-600 min-w-[90px] truncate">FACEIT</span>
                      <span className="text-xs text-gray-500">Conta não encontrada</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Coluna direita - Configurações técnicas - só mostra se há configurações */}
            {hasAnyConfigs() && (
              <div className="lg:col-span-3">

              {/* Configurações de Mouse */}
              {((playerConfigs?.sensitivity !== null && playerConfigs?.sensitivity !== undefined) || 
                (playerConfigs?.dpi !== null && playerConfigs?.dpi !== undefined) || 
                (playerConfigs?.edpi !== null && playerConfigs?.edpi !== undefined) || 
                hasValidValues(playerConfigs?.mouse_settings, ['polling_rate', 'windows_sens', 'zoom_sensitivity'])) && (
                <div className="bg-gray-50 p-5 rounded-lg mb-6">
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
                <div className="bg-gray-50 p-5 rounded-lg mb-6">
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
                  </div>
                </div>
              )}

              {/* Viewmodel */}
              {hasValidValues(playerConfigs?.viewmodel_settings, ['viewmodel_fov', 'viewmodel_offset_x', 'viewmodel_offset_y', 'viewmodel_offset_z', 'viewmodel_presetpos', 'viewmodel']) && (
                <div className="bg-gray-50 p-5 rounded-lg mb-6">
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
                  </div>
                </div>
              )}

              {/* HUD */}
              {hasValidValues(playerConfigs?.hud_settings, ['hud_scaling', 'cl_hud_color', 'cl_radar_scale', 'cl_hud_radar_scale', 'cl_radar_always_centered', 'cl_radar_rotate', 'cl_radar_square_with_scoreboard']) && (
                <div className="bg-gray-50 p-5 rounded-lg mb-6">
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
                  </div>
                </div>
              )}

              {/* Crosshair */}
              {playerConfigs?.crosshair_code && (
                <div className="bg-gray-50 p-5 rounded-lg mb-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-3">Crosshair</h2>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center gap-x-2">
                      <span className="text-gray-600 min-w-[90px] truncate">Código</span>
                      <span className="font-medium text-gray-800 text-xs break-all">{playerConfigs.crosshair_code}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Skins */}
              {playerConfigs?.skins && typeof playerConfigs.skins === 'string' && playerConfigs.skins.trim() !== '' && (
                <div className="bg-gray-50 p-5 rounded-lg mb-6">
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
              {(playerConfigs?.gear_specs && typeof playerConfigs.gear_specs === 'object' && Object.values(playerConfigs.gear_specs).some(value => value !== null && value !== undefined && value !== '')) && (
                <div className="bg-gray-50 p-5 rounded-lg mb-6">
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
                <div className="bg-gray-50 p-5 rounded-lg mb-6">
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
            )}
          </div>
        </div>
      </Layout>
    </LoadingScreen>
  );
}
