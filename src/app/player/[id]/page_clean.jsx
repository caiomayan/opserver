'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import LoadingScreen from '@/components/LoadingScreen';
import Layout from '@/components/Layout';
import LogoHeader from '@/components/LogoHeader';
import SimpleSteamAvatar from '@/components/SimpleSteamAvatar';
import CountryFlag from '@/components/CountryFlag';
import CountryName from '@/components/CountryName';
import { getRoleName, getRoleIcon } from '@/utils/playerRoles';
import { calculateAge, getProfileUrls } from '@/utils/playerUtils';
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

  const faceitData = useFaceitData(playerData?.steamid64);

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
          centerCountry: (() => {
            const code = teamData?.countryid ? String(teamData.countryid).trim().toUpperCase() : "";
            return /^[A-Z]{2}$/.test(code) ? code : null;
          })()
        }}
        footerText={teamData?.name ? teamData.name.toUpperCase() : "Development"}
        fullPage={true}
      >
        <div className="w-full max-w-5xl mx-auto px-4 pt-28 pb-24">
          {error && (
            <div className="mb-4 p-3 rounded bg-red-50 text-red-700 text-sm border border-red-200">
              {String(error)}
            </div>
          )}
          
          {/* Header do jogador */}
          <div className="text-center mb-8">
            <SimpleSteamAvatar 
              src={playerData.avatar}
              alt={`Avatar de ${playerData.name}`}
              size="w-32 h-32"
              fallbackInitial={playerData.name.charAt(0).toUpperCase()}
              className="shadow-lg mx-auto mb-4"
            />
            <div className="flex items-center justify-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-800">{playerData.name}</h1>
              <CountryFlag countryCode={playerData.country} size="w-8 h-5" flagSize={40} />
              {isOwnProfile && (
                <img 
                  src="/others/aero.png" 
                  alt="Seu Perfil" 
                  className="w-5 h-5" 
                  title="Você"
                />
              )}
            </div>
            
            {/* Informações básicas */}
            <div className="flex items-center justify-center gap-6 mb-4 text-sm text-gray-600">
              {age && <span>{age} anos</span>}
              <CountryName countryCode={playerData.country} />
              <span>{getRoleName(playerData.idrole)}</span>
              {teamData && (
                <span>
                  {teamData.name}
                  {playerData.benched === true && <span className="text-gray-400"> (banco)</span>}
                </span>
              )}
            </div>

            {/* Links e ações */}
            <div className="flex items-center justify-center gap-4">
              {profileUrls.steam && (
                <a 
                  href={profileUrls.steam}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  title="Steam Profile"
                >
                  <img src="/platforms/steam.svg" alt="Steam" className="w-5 h-5" />
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

          {/* Layout principal em duas colunas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Coluna esquerda - CS2 Settings */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-6">CS2 Settings</h2>
              
              {/* Mouse */}
              {((playerConfigs?.sensitivity !== null && playerConfigs?.sensitivity !== undefined) || 
                (playerConfigs?.dpi !== null && playerConfigs?.dpi !== undefined) || 
                (playerConfigs?.edpi !== null && playerConfigs?.edpi !== undefined) || 
                hasValidValues(playerConfigs?.mouse_settings, ['polling_rate', 'windows_sens', 'zoom_sensitivity'])) && (
                <div className="bg-gray-50 p-5 rounded-lg mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Mouse</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {(playerConfigs?.sensitivity !== null && playerConfigs?.sensitivity !== undefined) && (
                      <div>
                        <span className="text-sm text-gray-600">Sensitivity</span>
                        <p className="font-medium text-gray-800">{formatValue(playerConfigs.sensitivity)}</p>
                      </div>
                    )}
                    {(playerConfigs?.dpi !== null && playerConfigs?.dpi !== undefined) && (
                      <div>
                        <span className="text-sm text-gray-600">DPI</span>
                        <p className="font-medium text-gray-800">{formatValue(playerConfigs.dpi)}</p>
                      </div>
                    )}
                    {(playerConfigs?.edpi !== null && playerConfigs?.edpi !== undefined) && (
                      <div className="col-span-2 pt-2 border-t border-gray-200">
                        <span className="text-sm text-gray-600">eDPI</span>
                        <p className="font-semibold text-gray-800">{formatValue(playerConfigs.edpi)}</p>
                      </div>
                    )}
                    {playerConfigs?.mouse_settings && (
                      <>
                        {(playerConfigs.mouse_settings.polling_rate !== null && playerConfigs.mouse_settings.polling_rate !== undefined) && (
                          <div>
                            <span className="text-sm text-gray-600">Polling Rate</span>
                            <p className="font-medium text-gray-800">{formatValue(playerConfigs.mouse_settings.polling_rate)}</p>
                          </div>
                        )}
                        {(playerConfigs.mouse_settings.windows_sens !== null && playerConfigs.mouse_settings.windows_sens !== undefined) && (
                          <div>
                            <span className="text-sm text-gray-600">Windows Sens</span>
                            <p className="font-medium text-gray-800">{formatValue(playerConfigs.mouse_settings.windows_sens)}</p>
                          </div>
                        )}
                        {(playerConfigs.mouse_settings.zoom_sensitivity !== null && playerConfigs.mouse_settings.zoom_sensitivity !== undefined) && (
                          <div>
                            <span className="text-sm text-gray-600">Zoom Sensitivity</span>
                            <p className="font-medium text-gray-800">{formatValue(playerConfigs.mouse_settings.zoom_sensitivity)}</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Crosshair */}
              {playerConfigs?.crosshair_code && (
                <div className="bg-gray-50 p-5 rounded-lg mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Crosshair</h3>
                  <div className="bg-gray-800 p-3 rounded text-green-400 font-mono text-sm break-all">
                    {playerConfigs.crosshair_code}
                  </div>
                  <button 
                    onClick={() => navigator.clipboard.writeText(playerConfigs.crosshair_code)}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                  >
                    Copy
                  </button>
                </div>
              )}

              {/* Viewmodel */}
              {hasValidValues(playerConfigs?.viewmodel_settings, ['viewmodel_fov', 'viewmodel_offset_x', 'viewmodel_offset_y', 'viewmodel_offset_z', 'viewmodel_presetpos', 'viewmodel']) && (
                <div className="bg-gray-50 p-5 rounded-lg mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Viewmodel</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {(playerConfigs.viewmodel_settings.viewmodel_fov !== null && playerConfigs.viewmodel_settings.viewmodel_fov !== undefined) && (
                      <div>
                        <span className="text-sm text-gray-600">FOV</span>
                        <p className="font-medium text-gray-800">{formatValue(playerConfigs.viewmodel_settings.viewmodel_fov)}</p>
                      </div>
                    )}
                    {(playerConfigs.viewmodel_settings.viewmodel_offset_x !== null && playerConfigs.viewmodel_settings.viewmodel_offset_x !== undefined) && (
                      <div>
                        <span className="text-sm text-gray-600">Offset X</span>
                        <p className="font-medium text-gray-800">{formatValue(playerConfigs.viewmodel_settings.viewmodel_offset_x)}</p>
                      </div>
                    )}
                    {(playerConfigs.viewmodel_settings.viewmodel_offset_y !== null && playerConfigs.viewmodel_settings.viewmodel_offset_y !== undefined) && (
                      <div>
                        <span className="text-sm text-gray-600">Offset Y</span>
                        <p className="font-medium text-gray-800">{formatValue(playerConfigs.viewmodel_settings.viewmodel_offset_y)}</p>
                      </div>
                    )}
                    {(playerConfigs.viewmodel_settings.viewmodel_offset_z !== null && playerConfigs.viewmodel_settings.viewmodel_offset_z !== undefined) && (
                      <div>
                        <span className="text-sm text-gray-600">Offset Z</span>
                        <p className="font-medium text-gray-800">{formatValue(playerConfigs.viewmodel_settings.viewmodel_offset_z)}</p>
                      </div>
                    )}
                    {(playerConfigs.viewmodel_settings.viewmodel_presetpos !== null && playerConfigs.viewmodel_settings.viewmodel_presetpos !== undefined) && (
                      <div>
                        <span className="text-sm text-gray-600">Presetpos</span>
                        <p className="font-medium text-gray-800">{formatValue(playerConfigs.viewmodel_settings.viewmodel_presetpos)}</p>
                      </div>
                    )}
                  </div>
                  {(playerConfigs.viewmodel_settings.viewmodel !== null && playerConfigs.viewmodel_settings.viewmodel !== undefined) && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <span className="text-sm text-gray-600">Viewmodel Command</span>
                      <div className="bg-gray-800 p-3 rounded text-green-400 font-mono text-sm mt-2 break-all">
                        {formatValue(playerConfigs.viewmodel_settings.viewmodel)}
                      </div>
                      <button 
                        onClick={() => navigator.clipboard.writeText(formatValue(playerConfigs.viewmodel_settings.viewmodel))}
                        className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                      >
                        Copy
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Video Settings */}
              {(hasValidValues(playerConfigs?.video_settings, ['resolution', 'brightness']) || 
                (playerConfigs?.hz !== null && playerConfigs?.hz !== undefined) || 
                (playerConfigs?.pc_specs?.gpu?.digital_vibrance !== null && playerConfigs?.pc_specs?.gpu?.digital_vibrance !== undefined)) && (
                <div className="bg-gray-50 p-5 rounded-lg mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Video Settings</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {(playerConfigs?.video_settings?.resolution !== null && playerConfigs?.video_settings?.resolution !== undefined) && (
                      <div>
                        <span className="text-sm text-gray-600">Resolution</span>
                        <p className="font-medium text-gray-800">{formatValue(playerConfigs.video_settings.resolution)}</p>
                      </div>
                    )}
                    {(playerConfigs?.hz !== null && playerConfigs?.hz !== undefined) && (
                      <div>
                        <span className="text-sm text-gray-600">Refresh Rate</span>
                        <p className="font-medium text-gray-800">{formatValue(playerConfigs.hz)}</p>
                      </div>
                    )}
                    {(playerConfigs?.video_settings?.brightness !== null && playerConfigs?.video_settings?.brightness !== undefined) && (
                      <div>
                        <span className="text-sm text-gray-600">Brightness</span>
                        <p className="font-medium text-gray-800">{formatValue(playerConfigs.video_settings.brightness)}%</p>
                      </div>
                    )}
                    {(playerConfigs?.pc_specs?.gpu?.digital_vibrance !== null && playerConfigs?.pc_specs?.gpu?.digital_vibrance !== undefined) && (
                      <div>
                        <span className="text-sm text-gray-600">Digital Vibrance</span>
                        <p className="font-medium text-gray-800">{formatValue(playerConfigs.pc_specs.gpu.digital_vibrance)}%</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* HUD */}
              {hasValidValues(playerConfigs?.hud_settings, ['hud_scaling', 'cl_hud_color', 'cl_radar_scale', 'cl_hud_radar_scale', 'cl_radar_always_centered', 'cl_radar_rotate', 'cl_radar_square_with_scoreboard']) && (
                <div className="bg-gray-50 p-5 rounded-lg mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">HUD</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {(playerConfigs.hud_settings.hud_scaling !== null && playerConfigs.hud_settings.hud_scaling !== undefined) && (
                      <div>
                        <span className="text-sm text-gray-600">HUD Scaling</span>
                        <p className="font-medium text-gray-800">{formatValue(playerConfigs.hud_settings.hud_scaling)}</p>
                      </div>
                    )}
                    {(playerConfigs.hud_settings.cl_hud_color !== null && playerConfigs.hud_settings.cl_hud_color !== undefined) && (
                      <div>
                        <span className="text-sm text-gray-600">HUD Color</span>
                        <p className="font-medium text-gray-800">{formatValue(playerConfigs.hud_settings.cl_hud_color, 'hud_color')}</p>
                      </div>
                    )}
                    {(playerConfigs.hud_settings.cl_radar_scale !== null && playerConfigs.hud_settings.cl_radar_scale !== undefined) && (
                      <div>
                        <span className="text-sm text-gray-600">Radar Scale</span>
                        <p className="font-medium text-gray-800">{formatValue(playerConfigs.hud_settings.cl_radar_scale)}</p>
                      </div>
                    )}
                    {(playerConfigs.hud_settings.cl_hud_radar_scale !== null && playerConfigs.hud_settings.cl_hud_radar_scale !== undefined) && (
                      <div>
                        <span className="text-sm text-gray-600">Radar HUD Size</span>
                        <p className="font-medium text-gray-800">{formatValue(playerConfigs.hud_settings.cl_hud_radar_scale)}</p>
                      </div>
                    )}
                    {(playerConfigs.hud_settings.cl_radar_always_centered !== null && playerConfigs.hud_settings.cl_radar_always_centered !== undefined) && (
                      <div>
                        <span className="text-sm text-gray-600">Radar Centers Player</span>
                        <p className="font-medium text-gray-800">{formatValue(playerConfigs.hud_settings.cl_radar_always_centered)}</p>
                      </div>
                    )}
                    {(playerConfigs.hud_settings.cl_radar_rotate !== null && playerConfigs.hud_settings.cl_radar_rotate !== undefined) && (
                      <div>
                        <span className="text-sm text-gray-600">Radar Rotating</span>
                        <p className="font-medium text-gray-800">{formatValue(playerConfigs.hud_settings.cl_radar_rotate)}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Coluna direita - Equipment */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Equipment</h2>
              
              {/* Gear */}
              {(playerConfigs?.gear_specs && typeof playerConfigs.gear_specs === 'object' && Object.values(playerConfigs.gear_specs).some(value => value !== null && value !== undefined && value !== '')) && (
                <div className="bg-gray-50 p-5 rounded-lg mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Gear</h3>
                  <div className="space-y-3">
                    {Object.entries(playerConfigs.gear_specs).map(([key, value]) => (
                      (value !== null && value !== undefined && value !== '') && (
                        <div key={key}>
                          <span className="text-sm text-gray-600 block">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                          <p className="font-medium text-gray-800">{value}</p>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}

              {/* PC Specs */}
              {hasValidValues(playerConfigs?.pc_specs, ['cpu', 'gpu.gpu_card']) && (
                <div className="bg-gray-50 p-5 rounded-lg mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">PC Specs</h3>
                  <div className="space-y-3">
                    {(playerConfigs.pc_specs.cpu !== null && playerConfigs.pc_specs.cpu !== undefined) && (
                      <div>
                        <span className="text-sm text-gray-600 block">CPU</span>
                        <p className="font-medium text-gray-800">{formatValue(playerConfigs.pc_specs.cpu)}</p>
                      </div>
                    )}
                    {(playerConfigs.pc_specs.gpu?.gpu_card !== null && playerConfigs.pc_specs.gpu?.gpu_card !== undefined) && (
                      <div>
                        <span className="text-sm text-gray-600 block">GPU</span>
                        <p className="font-medium text-gray-800">{formatValue(playerConfigs.pc_specs.gpu.gpu_card)}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Additional Info */}
              {faceitData && faceitData.level > 0 && (
                <div className="bg-gray-50 p-5 rounded-lg mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">FACEIT</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm text-gray-600 block">Level</span>
                      <p className="font-semibold text-gray-800">{faceitData.level}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600 block">ELO</span>
                      <p className="font-medium text-gray-800">{faceitData.elo}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Skins */}
              {playerConfigs?.skins && typeof playerConfigs.skins === 'string' && playerConfigs.skins.trim() !== '' && (
                <div className="bg-gray-50 p-5 rounded-lg mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Skins</h3>
                  <p className="text-gray-700">{playerConfigs.skins}</p>
                </div>
              )}
            </div>
          </div>

          {/* Tooltip de última atualização */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 text-xs text-gray-400">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              {formatLastUpdated(playerData.updated_at)}
            </div>
          </div>
        </div>
      </Layout>
    </LoadingScreen>
  );
}
