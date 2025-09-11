'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../../components/Layout';
import LoadingScreen from '../../components/LoadingScreen';
import SimpleSteamAvatar from '../../components/SimpleSteamAvatar';
import Footer from '@/components/Footer';
import { 
  MOUSE_SETTINGS_SCHEMA, 
  VIDEO_SETTINGS_SCHEMA, 
  VIEWMODEL_SETTINGS_SCHEMA,
  HUD_SETTINGS_SCHEMA,
  GEAR_SPECS_SCHEMA,
  PC_SPECS_SCHEMA,
  getDefaultValues 
} from '../../utils/configSchemas';

export default function ProfilePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [playerData, setPlayerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');

  // Estados para diferentes seções das configurações
  const [personalData, setPersonalData] = useState({
    birthday: '',
    gamersclubid: ''
  });

  const [configs, setConfigs] = useState({
    sensitivity: '',
    dpi: '',
    hz: '',
    mouse_settings: getDefaultValues(MOUSE_SETTINGS_SCHEMA),
    video_settings: getDefaultValues(VIDEO_SETTINGS_SCHEMA),
    viewmodel_settings: getDefaultValues(VIEWMODEL_SETTINGS_SCHEMA),
    hud_settings: getDefaultValues(HUD_SETTINGS_SCHEMA),
    crosshair_code: '',
    skins: '',
    gear_specs: getDefaultValues(GEAR_SPECS_SCHEMA),
    pc_specs: getDefaultValues(PC_SPECS_SCHEMA)
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Buscar usuário atual
        const userRes = await fetch('/api/auth/user', { 
          credentials: 'include',
          cache: 'no-store'
        });
        
        if (!userRes.ok) {
          router.push('/');
          return;
        }
        
        const userData = await userRes.json();
        setCurrentUser(userData);
        
        // Buscar dados do player
        const playersRes = await fetch(`/api/players?playerIds=${userData.id}`, {cache: 'no-store'});
        if (playersRes.ok) {
          const playersResJson = await playersRes.json();
          const player = playersResJson.data?.find(p => p.steamid64 === userData.id);
          
          if (player) {
            setPlayerData(player);
            
            // Preencher dados pessoais
            setPersonalData({
              birthday: player.birthday || '',
              gamersclubid: player.gamersclubid || ''
            });
            
            // Preencher configurações se existirem
            if (player.configs) {
              setConfigs(prev => ({
                ...prev,
                sensitivity: player.configs.sensitivity || '',
                dpi: player.configs.dpi || '',
                hz: player.configs.hz || '',
                mouse_settings: { ...prev.mouse_settings, ...player.configs.mouse_settings },
                video_settings: { ...prev.video_settings, ...player.configs.video_settings },
                viewmodel_settings: { ...prev.viewmodel_settings, ...player.configs.viewmodel_settings },
                hud_settings: { ...prev.hud_settings, ...player.configs.hud_settings },
                crosshair_code: player.configs.crosshair_code || '',
                skins: player.configs.skins || '',
                gear_specs: { ...prev.gear_specs, ...player.configs.gear_specs },
                pc_specs: { ...prev.pc_specs, ...player.configs.pc_specs }
              }));
            }
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setError('Erro ao carregar dados do perfil');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleSave = async () => {
    if (!currentUser || !playerData) return;
    
    setSaving(true);
    setError(null);
    
    try {
      // Preparar dados para envio
      const updateData = {
        steamid64: currentUser.id,
        birthday: personalData.birthday || null,
        gamersclubid: personalData.gamersclubid || null,
        ...configs
      };

      const response = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao salvar perfil');
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
    } catch (error) {
      console.error('Erro ao salvar:', error);
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <LoadingScreen loadingDuration={2200}>
        <div>Carregando perfil...</div>
      </LoadingScreen>
    );
  }

  if (!currentUser || !playerData) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-gray-800 mb-4">Acesso negado</h1>
            <p className="text-gray-600 mb-4">Você precisa estar logado para acessar esta página.</p>
            <button 
              onClick={() => router.push('/')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Voltar ao início
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const tabs = [
    { id: 'personal', label: 'Pessoal' },
    { id: 'mouse', label: 'Mouse' },
    { id: 'video', label: 'Vídeo' },
    { id: 'viewmodel', label: 'Viewmodel' },
    { id: 'hud', label: 'HUD' },
    { id: 'crosshair', label: 'Crosshair' },
    { id: 'gear', label: 'Equipamentos' }
  ];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <SimpleSteamAvatar 
            src={playerData.avatar}
            alt={`Avatar de ${playerData.name}`}
            size="w-24 h-24"
            fallbackInitial={playerData.name.charAt(0).toUpperCase()}
            className="shadow-lg mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Meu Perfil</h1>
          <p className="text-gray-600">Edite suas configurações e informações pessoais</p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700">Perfil atualizado com sucesso!</p>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap pb-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow p-6">
          {activeTab === 'personal' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Informações Pessoais</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data de Nascimento
                  </label>
                  <input
                    type="date"
                    value={personalData.birthday}
                    onChange={(e) => setPersonalData(prev => ({ ...prev, birthday: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GamersClub ID
                  </label>
                  <input
                    type="text"
                    value={personalData.gamersclubid}
                    onChange={(e) => setPersonalData(prev => ({ ...prev, gamersclubid: e.target.value }))}
                    placeholder="Seu ID do GamersClub"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'mouse' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Configurações de Mouse</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sensibilidade
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={configs.sensitivity !== null && configs.sensitivity !== undefined ? configs.sensitivity : ''}
                    onChange={(e) => setConfigs(prev => ({ ...prev, sensitivity: e.target.value === '' ? null : parseFloat(e.target.value) }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    DPI
                  </label>
                  <input
                    type="number"
                    value={configs.dpi !== null && configs.dpi !== undefined ? configs.dpi : ''}
                    onChange={(e) => setConfigs(prev => ({ ...prev, dpi: e.target.value === '' ? null : parseInt(e.target.value) }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              {/* eDPI é calculado automaticamente */}
              {(configs.sensitivity && configs.dpi) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-blue-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-blue-800">eDPI Calculado Automaticamente</p>
                      <p className="text-sm text-blue-600">
                        eDPI: {Math.round(configs.sensitivity * configs.dpi)} (Sensibilidade × DPI)
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Taxa de Atualização (Hz)
                  </label>
                  <input
                    type="number"
                    value={configs.hz !== null && configs.hz !== undefined ? configs.hz : ''}
                    onChange={(e) => setConfigs(prev => ({ ...prev, hz: e.target.value === '' ? null : parseInt(e.target.value) }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Polling Rate
                  </label>
                  <input
                    type="number"
                    value={configs.mouse_settings.polling_rate !== null && configs.mouse_settings.polling_rate !== undefined ? configs.mouse_settings.polling_rate : ''}
                    onChange={(e) => setConfigs(prev => ({ 
                      ...prev, 
                      mouse_settings: { 
                        ...prev.mouse_settings, 
                        polling_rate: e.target.value === '' ? null : parseInt(e.target.value)
                      }
                    }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'crosshair' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Crosshair</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código da Crosshair
                </label>
                <textarea
                  value={configs.crosshair_code || ''}
                  onChange={(e) => setConfigs(prev => ({ ...prev, crosshair_code: e.target.value }))}
                  placeholder="Cole aqui o código da sua crosshair (ex: CSGO-xxxxx-xxxxx-xxxxx-xxxxx-xxxxx)"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Você pode obter o código da crosshair no jogo ou em sites como crosshair-generator.com
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skins Favoritas
                </label>
                <textarea
                  value={configs.skins || ''}
                  onChange={(e) => setConfigs(prev => ({ ...prev, skins: e.target.value }))}
                  placeholder="Liste suas skins favoritas ou configurações de skins..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="4"
                />
              </div>
            </div>
          )}

          {activeTab === 'gear' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Equipamentos</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(GEAR_SPECS_SCHEMA).map(([key, field]) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {field.label}
                      </label>
                      <input
                        type="text"
                        value={configs.gear_specs[key] || ''}
                        onChange={(e) => setConfigs(prev => ({ 
                          ...prev, 
                          gear_specs: { 
                            ...prev.gear_specs, 
                            [key]: e.target.value || null 
                          }
                        }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Especificações do PC</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Processador (CPU)
                    </label>
                    <input
                      type="text"
                      value={configs.pc_specs.cpu || ''}
                      onChange={(e) => setConfigs(prev => ({ 
                        ...prev, 
                        pc_specs: { 
                          ...prev.pc_specs, 
                          cpu: e.target.value || null 
                        }
                      }))}
                      placeholder="Ex: Intel Core i7-10700K"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Placa de Vídeo (GPU)
                    </label>
                    <input
                      type="text"
                      value={configs.pc_specs.gpu?.gpu_card || ''}
                      onChange={(e) => setConfigs(prev => ({ 
                        ...prev, 
                        pc_specs: { 
                          ...prev.pc_specs, 
                          gpu: {
                            ...prev.pc_specs.gpu,
                            gpu_card: e.target.value || null
                          }
                        }
                      }))}
                      placeholder="Ex: NVIDIA RTX 3080"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Digital Vibrance (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={configs.pc_specs.gpu?.digital_vibrance || ''}
                      onChange={(e) => setConfigs(prev => ({ 
                        ...prev, 
                        pc_specs: { 
                          ...prev.pc_specs, 
                          gpu: {
                            ...prev.pc_specs.gpu,
                            digital_vibrance: parseInt(e.target.value) || null
                          }
                        }
                      }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'video' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Configurações de Vídeo</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Resolução
                  </label>
                  <select
                    value={configs.video_settings.resolution || ''}
                    onChange={(e) => setConfigs(prev => ({ 
                      ...prev, 
                      video_settings: { 
                        ...prev.video_settings, 
                        resolution: e.target.value || null 
                      }
                    }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Selecionar resolução</option>
                    <option value="1920x1080">1920x1080</option>
                    <option value="1440x1080">1440x1080</option>
                    <option value="1280x960">1280x960</option>
                    <option value="1024x768">1024x768</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Aspect Ratio
                  </label>
                  <select
                    value={configs.video_settings.aspect_ratio || ''}
                    onChange={(e) => setConfigs(prev => ({ 
                      ...prev, 
                      video_settings: { 
                        ...prev.video_settings, 
                        aspect_ratio: e.target.value || null 
                      }
                    }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Selecionar aspect ratio</option>
                    <option value="16:9">16:9</option>
                    <option value="4:3">4:3</option>
                    <option value="16:10">16:10</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brilho
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={configs.video_settings.brightness || ''}
                    onChange={(e) => setConfigs(prev => ({ 
                      ...prev, 
                      video_settings: { 
                        ...prev.video_settings, 
                        brightness: parseInt(e.target.value) || null 
                      }
                    }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    FPS Máximo
                  </label>
                  <input
                    type="number"
                    min="60"
                    max="999"
                    value={configs.video_settings.maxfps || ''}
                    onChange={(e) => setConfigs(prev => ({ 
                      ...prev, 
                      video_settings: { 
                        ...prev.video_settings, 
                        maxfps: parseInt(e.target.value) || null 
                      }
                    }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    HDR
                  </label>
                  <select
                    value={configs.video_settings.hdr || ''}
                    onChange={(e) => setConfigs(prev => ({ 
                      ...prev, 
                      video_settings: { 
                        ...prev.video_settings, 
                        hdr: e.target.value || null 
                      }
                    }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Selecione...</option>
                    <option value="disabled">disabled</option>
                    <option value="performance">performance</option>
                    <option value="quality">quality</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    FFX-SR
                  </label>
                  <select
                    value={configs.video_settings.ffxsr || ''}
                    onChange={(e) => setConfigs(prev => ({ 
                      ...prev, 
                      video_settings: { 
                        ...prev.video_settings, 
                        ffxsr: e.target.value || null 
                      }
                    }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Selecione...</option>
                    <option value="disabled">disabled</option>
                    <option value="performance">performance</option>
                    <option value="quality">quality</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={configs.video_settings.vsync || false}
                      onChange={(e) => setConfigs(prev => ({ 
                        ...prev, 
                        video_settings: { 
                          ...prev.video_settings, 
                          vsync: e.target.checked 
                        }
                      }))}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">VSync</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'viewmodel' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Configurações de Viewmodel</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Viewmodel FOV
                  </label>
                  <input
                    type="number"
                    min="54"
                    max="68"
                    value={configs.viewmodel_settings.viewmodel_fov || ''}
                    onChange={(e) => setConfigs(prev => ({ 
                      ...prev, 
                      viewmodel_settings: { 
                        ...prev.viewmodel_settings, 
                        viewmodel_fov: parseFloat(e.target.value) || null 
                      }
                    }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preset Position
                  </label>
                  <select
                    value={configs.viewmodel_settings.viewmodel_presetpos || ''}
                    onChange={(e) => setConfigs(prev => ({ 
                      ...prev, 
                      viewmodel_settings: { 
                        ...prev.viewmodel_settings, 
                        viewmodel_presetpos: e.target.value || null 
                      }
                    }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Selecionar preset</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Offset X
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="-2.5"
                    max="2.5"
                    value={configs.viewmodel_settings.viewmodel_offset_x !== null && configs.viewmodel_settings.viewmodel_offset_x !== undefined ? configs.viewmodel_settings.viewmodel_offset_x : ''}
                    onChange={(e) => setConfigs(prev => ({ 
                      ...prev, 
                      viewmodel_settings: { 
                        ...prev.viewmodel_settings, 
                        viewmodel_offset_x: e.target.value === '' ? null : parseFloat(e.target.value)
                      }
                    }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Offset Y
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="-2"
                    max="2"
                    value={configs.viewmodel_settings.viewmodel_offset_y !== null && configs.viewmodel_settings.viewmodel_offset_y !== undefined ? configs.viewmodel_settings.viewmodel_offset_y : ''}
                    onChange={(e) => setConfigs(prev => ({ 
                      ...prev, 
                      viewmodel_settings: { 
                        ...prev.viewmodel_settings, 
                        viewmodel_offset_y: e.target.value === '' ? null : parseFloat(e.target.value)
                      }
                    }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Offset Z
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="-2"
                    max="2"
                    value={configs.viewmodel_settings.viewmodel_offset_z !== null && configs.viewmodel_settings.viewmodel_offset_z !== undefined ? configs.viewmodel_settings.viewmodel_offset_z : ''}
                    onChange={(e) => setConfigs(prev => ({ 
                      ...prev, 
                      viewmodel_settings: { 
                        ...prev.viewmodel_settings, 
                        viewmodel_offset_z: e.target.value === '' ? null : parseFloat(e.target.value)
                      }
                    }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'hud' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Configurações de HUD</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    HUD Scaling
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0.5"
                    max="1.0"
                    value={configs.hud_settings.hud_scaling || ''}
                    onChange={(e) => setConfigs(prev => ({ 
                      ...prev, 
                      hud_settings: { 
                        ...prev.hud_settings, 
                        hud_scaling: parseFloat(e.target.value) || null 
                      }
                    }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cor do HUD
                  </label>
                  <select
                    value={configs.hud_settings.cl_hud_color || ''}
                    onChange={(e) => setConfigs(prev => ({ 
                      ...prev, 
                      hud_settings: { 
                        ...prev.hud_settings, 
                        cl_hud_color: e.target.value || null 
                      }
                    }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Selecionar cor</option>
                    {[...Array(11)].map((_, i) => (
                      <option key={i} value={i.toString()}>{i}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Escala do Radar
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0.25"
                    max="1.0"
                    value={configs.hud_settings.cl_radar_scale || ''}
                    onChange={(e) => setConfigs(prev => ({ 
                      ...prev, 
                      hud_settings: { 
                        ...prev.hud_settings, 
                        cl_radar_scale: parseFloat(e.target.value) || null 
                      }
                    }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={configs.hud_settings.cl_radar_rotate || false}
                    onChange={(e) => setConfigs(prev => ({ 
                      ...prev, 
                      hud_settings: { 
                        ...prev.hud_settings, 
                        cl_radar_rotate: e.target.checked 
                      }
                    }))}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Radar Rotaciona</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={configs.hud_settings.cl_radar_always_centered || false}
                    onChange={(e) => setConfigs(prev => ({ 
                      ...prev, 
                      hud_settings: { 
                        ...prev.hud_settings, 
                        cl_radar_always_centered: e.target.checked 
                      }
                    }))}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Radar Sempre Centralizado</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Salvando...
              </>
            ) : (
              'Salvar Alterações'
            )}
          </button>
        </div>
      </div>
      <Footer />
    </Layout>
  );
}
