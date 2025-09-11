'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '../../../components/AdminLayout';

export default function AdminConfigs() {
  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('mouse');
  const [configs, setConfigs] = useState({
    // Campos principais
    dpi: 0,
    sensitivity: 0,
    edpi: 0,
    hz: 0,
    // Campos JSONB
    mouse_settings: {},
    video_settings: {},
    viewmodel_settings: {},
    hud_settings: {},
    // Campos TEXT
    crosshair_code: '',
    // Campos JSONB adicionais
    skins: null,
    gear_specs: {},
    pc_specs: {}
  });

  // Esquemas de configuração baseados na estrutura real do banco
  const configSchemas = {
    mouse_settings: {
      dpi: { type: 'number', label: 'DPI', min: 100, max: 10000 },
      sensitivity: { type: 'number', label: 'Sensibilidade', min: 0.1, max: 10, step: 0.01 },
      edpi: { type: 'readonly', label: 'EDPI (Calculado)', description: 'DPI × Sensibilidade (calculado automaticamente)' },
      hz: { type: 'number', label: 'Hz do Monitor', min: 60, max: 360 },
      polling_rate: { type: 'select', label: 'Polling Rate', options: [125, 250, 500, 1000] },
      windows_sens: { type: 'number', label: 'Sens. Windows', min: 1, max: 11 },
      zoom_sensitivity: { type: 'number', label: 'Zoom Sensitivity', min: 0.1, max: 5, step: 0.01 }
    },
    video_settings: {
      resolution: { type: 'select', label: 'Resolução', options: ['1920x1080', '1440x1080', '1280x960', '1024x768'] },
      aspect_ratio: { type: 'select', label: 'Aspect Ratio', options: ['4:3', '16:9', '16:10'] },
      scaling_mode: { type: 'select', label: 'Scaling', options: ['stretched', 'black_bars', 'native'] },
      brightness: { type: 'number', label: 'Brilho', min: 0, max: 200 },
      display_mode: { type: 'select', label: 'Display Mode', options: ['fullscreen', 'windowed', 'fullscreen_windowed'] },
      refresh_rate: { type: 'number', label: 'Taxa de Atualização', min: 60, max: 360 },
      maxfps: { type: 'number', label: 'FPS Máximo', min: 60, max: 999 },
      vsync: { type: 'boolean', label: 'VSync' },
      hdr: { type: 'select', label: 'HDR', options: ['disabled', 'quality', 'performance'] },
      ffxsr: { type: 'select', label: 'FFX-SR', options: ['disabled', 'quality', 'performance'] },
      nvidiagsync: { type: 'boolean', label: 'NVIDIA G-Sync' },
      nvidiareflexll: { type: 'select', label: 'NVIDIA Reflex', options: ['disabled', 'enabled', 'enabled_boost'] },
      shader_detail: { type: 'select', label: 'Shader Detail', options: ['low', 'medium', 'high', 'very_high'] },
      model_texture_detail: { type: 'select', label: 'Texture Detail', options: ['low', 'medium', 'high', 'very_high'] },
      particle_detail: { type: 'select', label: 'Particle Detail', options: ['low', 'medium', 'high', 'very_high'] },
      global_shadow_quality: { type: 'select', label: 'Shadow Quality', options: ['low', 'medium', 'high', 'very_high'] },
      dynamicshadows: { type: 'select', label: 'Dynamic Shadows', options: ['disabled', 'sun_only', 'all'] },
      texture_filtering_mode: { type: 'select', label: 'Texture Filtering', options: ['bilinear', 'trilinear', 'anisotropic_2x', 'anisotropic_4x', 'anisotropic_8x', 'anisotropic_16x'] },
      multisampling_anti_aliasing_mode: { type: 'select', label: 'Anti-Aliasing', options: ['none', '2x', '4x', '8x', 'fxaa'] },
      ambientocclusion: { type: 'select', label: 'Ambient Occlusion', options: ['disabled', 'enabled'] },
      boostplayercontrast: { type: 'boolean', label: 'Boost Player Contrast' }
    },
    crosshair_code: {
      // Campo único de texto para o código da crosshair
      code: { type: 'text', label: 'Código da Crosshair', placeholder: 'CSGO-xxxxx-xxxxx-xxxxx-xxxxx-xxxxx' }
    },
    viewmodel_settings: {
      viewmodel_fov: { type: 'number', label: 'FOV', min: 54, max: 68 },
      viewmodel_offset_x: { type: 'number', label: 'Offset X', min: -2.5, max: 2.5, step: 0.1 },
      viewmodel_offset_y: { type: 'number', label: 'Offset Y', min: -2, max: 2, step: 0.1 },
      viewmodel_offset_z: { type: 'number', label: 'Offset Z', min: -2, max: 2, step: 0.1 },
      viewmodel_presetpos: { type: 'select', label: 'Preset', options: ['1', '2', '3'] }
    },
    hud_settings: {
      hud_scaling: { type: 'number', label: 'HUD Scaling', min: 0.5, max: 1.5, step: 0.05 },
      cl_hud_color: { type: 'select', label: 'Cor HUD', options: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'] },
      cl_radar_scale: { type: 'number', label: 'Escala Radar', min: 0.25, max: 1.0, step: 0.05 },
      cl_radar_rotate: { type: 'boolean', label: 'Radar Rotativo' },
      cl_hud_radar_scale: { type: 'number', label: 'Escala Mini-Radar', min: 0.8, max: 1.3, step: 0.05 },
      cl_radar_always_centered: { type: 'boolean', label: 'Radar Centralizado' },
      cl_radar_square_with_scoreboard: { type: 'boolean', label: 'Radar Quadrado' }
    },
    gear_specs: {
      mouse: { type: 'text', label: 'Mouse' },
      headset: { type: 'text', label: 'Headset' },
      monitor: { type: 'text', label: 'Monitor' },
      keyboard: { type: 'text', label: 'Teclado' },
      mousepad: { type: 'text', label: 'Mousepad' },
      earphones: { type: 'text', label: 'Fones de Ouvido' }
    },
    pc_specs: {
      cpu: { type: 'text', label: 'Processador (CPU)' },
      'gpu.gpu_card': { type: 'text', label: 'Placa de Vídeo' },
      'gpu.digital_vibrance': { type: 'number', label: 'Vibrance Digital (%)', min: 0, max: 100 }
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      const response = await fetch('/api/admin/players');
      const result = await response.json();
      
      if (result.success) {
        setPlayers(result.data);
      }
    } catch (error) {
      console.error('Erro ao buscar players:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlayerConfigs = async (steamId) => {
    try {
      const response = await fetch(`/api/admin/players/${steamId}/configs`);
      const result = await response.json();
      
      if (result.configs) {
        // Se temos configurações da API, usar elas diretamente
        setConfigs(result.configs);
      } else {
        // Se não há configurações, inicializar com valores padrão
        setConfigs({
          // Campos principais
          dpi: 0,
          sensitivity: 0,
          edpi: 0,
          hz: 0,
          // Campos JSONB
          mouse_settings: {},
          video_settings: {},
          viewmodel_settings: {},
          hud_settings: {},
          // Campos TEXT
          crosshair_code: '',
          // Campos JSONB adicionais
          skins: null,
          gear_specs: {},
          pc_specs: {}
        });
      }
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
    }
  };

  const saveConfigs = async () => {
    if (!selectedPlayer) return;
    
    setSaving(true);
    try {
      // Sanitizar dados antes de filtrar - converter valores temporários
      const sanitizedConfigs = Object.fromEntries(
        Object.entries(configs).map(([key, value]) => {
          if (typeof value === 'object' && value !== null) {
            // Para objetos JSONB, sanitizar valores internos
            const sanitizedObject = Object.fromEntries(
              Object.entries(value).map(([objKey, objValue]) => {
                // Se for string que deveria ser número, tentar converter
                if (typeof objValue === 'string' && (objValue === '' || objValue === '-')) {
                  return [objKey, null]; // Converter strings inválidas para null
                }
                return [objKey, objValue];
              })
            );
            return [key, sanitizedObject];
          }
          // Para campos diretos, sanitizar também
          if (typeof value === 'string' && (value === '' || value === '-')) {
            return [key, null];
          }
          return [key, value];
        })
      );

      // Filtrar campos vazios para não sobrescrever dados existentes
      const filteredConfigs = Object.fromEntries(
        Object.entries(sanitizedConfigs).filter(([key, value]) => {
          // Manter campos principais sempre
          if (['sensitivity', 'dpi', 'hz', 'crosshair_code'].includes(key)) {
            return true;
          }
          // Para objetos JSONB, só enviar se tiver valores não-null/não-vazios
          if (typeof value === 'object' && value !== null) {
            const hasValidValues = Object.values(value).some(v => 
              v !== null && v !== undefined && v !== ''
            );
            return hasValidValues;
          }
          // Para outros campos, só enviar se tiver valor
          return value !== '' && value !== null && value !== undefined;
        })
      );

      console.log('Enviando configurações filtradas:', filteredConfigs);

      const response = await fetch(`/api/admin/players/${selectedPlayer.steamid64}/configs`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filteredConfigs),
      });

      const result = await response.json();
      
      if (result.message && result.message.includes('sucesso')) {
        alert('Configurações salvas com sucesso!');
      } else {
        alert('Erro ao salvar configurações: ' + (result.error || result.message));
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      alert('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const handlePlayerSelect = (player) => {
    setSelectedPlayer(player);
    fetchPlayerConfigs(player.steamid64);
  };

  const updateConfig = (category, key, value) => {
    // Campos principais são dpi, sensitivity e hz (armazenados diretamente)
    if (category === 'mouse_settings' && (key === 'dpi' || key === 'sensitivity' || key === 'hz')) {
      setConfigs(prev => ({
        ...prev,
        [key]: value
        // NÃO calcular EDPI - deixar o banco calcular automaticamente
      }));
    } else if (category === 'crosshair_code' && key === 'code') {
      // Campo crosshair_code é direto
      setConfigs(prev => ({
        ...prev,
        crosshair_code: value
      }));
    } else if (key.includes('.')) {
      // Campos aninhados como gpu.gpu_card
      const [parentKey, childKey] = key.split('.');
      setConfigs(prev => ({
        ...prev,
        [category]: {
          ...prev[category],
          [parentKey]: {
            ...prev[category]?.[parentKey],
            [childKey]: value
          }
        }
      }));
    } else {
      // Campos JSONB normais
      setConfigs(prev => ({
        ...prev,
        [category]: {
          ...prev[category],
          [key]: value
        }
      }));
    }
  };

  const renderConfigField = (category, key, schema) => {
    // Para campos principais, buscar diretamente no configs
    let value;
    if (category === 'mouse_settings' && (key === 'dpi' || key === 'sensitivity' || key === 'hz' || key === 'edpi')) {
      value = configs[key];
    } else if (category === 'crosshair_code' && key === 'code') {
      value = configs.crosshair_code;
    } else if (key.includes('.')) {
      // Campos aninhados como gpu.gpu_card
      const [parentKey, childKey] = key.split('.');
      value = configs[category]?.[parentKey]?.[childKey];
    } else {
      value = configs[category]?.[key];
    }
    
    // Aplicar valor padrão baseado no tipo
    if (value === null || value === undefined) {
      if (schema.type === 'boolean') {
        value = null; // Manter null para booleanos não definidos
      } else if (schema.type === 'number') {
        value = 0;
      } else {
        value = '';
      }
    }
    
    switch (schema.type) {
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => {
              const inputValue = e.target.value;
              // Permitir valores vazios, negativos parciais como "-" ou valores válidos
              if (inputValue === '' || inputValue === '-') {
                updateConfig(category, key, inputValue);
              } else {
                const numValue = parseFloat(inputValue);
                updateConfig(category, key, isNaN(numValue) ? 0 : numValue);
              }
            }}
            min={schema.min}
            max={schema.max}
            step={schema.step || 1}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );
      
      case 'readonly':
        return (
          <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-600">
            {value || '—'}
            {schema.description && (
              <div className="text-xs text-gray-500 mt-1">{schema.description}</div>
            )}
          </div>
        );
      
      case 'boolean':
        return (
          <select
            value={value === true ? 'true' : value === false ? 'false' : ''}
            onChange={(e) => {
              const boolValue = e.target.value === 'true' ? true : e.target.value === 'false' ? false : null;
              updateConfig(category, key, boolValue);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecione...</option>
            <option value="false">Não</option>
            <option value="true">Sim</option>
          </select>
        );
      
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => updateConfig(category, key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecione...</option>
            {schema.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => updateConfig(category, key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );
    }
  };

  const tabs = [
    { id: 'mouse', label: 'Mouse', icon: '🖱️' },
    { id: 'video', label: 'Vídeo', icon: '🖥️' },
    { id: 'crosshair_code', label: 'Crosshair', icon: '🎯' },
    { id: 'viewmodel', label: 'Viewmodel', icon: '👁️' },
    { id: 'hud', label: 'HUD', icon: '📊' },
    { id: 'gear', label: 'Gear', icon: '🎮' },
    { id: 'pc', label: 'PC Specs', icon: '💻' }
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-xl">Carregando...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Gerenciar Configurações</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de Players */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Selecionar Player</h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {players.map((player) => (
                  <button
                    key={player.steamid64}
                    onClick={() => handlePlayerSelect(player)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedPlayer?.steamid64 === player.steamid64
                        ? 'bg-blue-50 border-blue-500'
                        : 'hover:bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="font-medium">{player.name}</div>
                    <div className="text-sm text-gray-500">{player.team_name || 'Sem time'}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Editor de Configurações */}
          <div className="lg:col-span-2">
            {selectedPlayer ? (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b">
                  <h2 className="text-lg font-semibold">
                    Configurações de {selectedPlayer.name}
                  </h2>
                </div>

                {/* Tabs */}
                <div className="border-b">
                  <nav className="flex space-x-8 px-6">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${
                          activeTab === tab.id
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        <span className="mr-2">{tab.icon}</span>
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                </div>

                <div className="p-6">
                  {activeTab === 'crosshair_code' ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Código da Crosshair
                      </label>
                      <input
                        type="text"
                        value={configs.crosshair_code || ''}
                        onChange={(e) => setConfigs(prev => ({ ...prev, crosshair_code: e.target.value }))}
                        placeholder="CSGO-xxxxx-xxxxx-xxxxx-xxxxx-xxxxx"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(configSchemas[activeTab === 'mouse' ? 'mouse_settings' : 
                                                    activeTab === 'video' ? 'video_settings' :
                                                    activeTab === 'viewmodel' ? 'viewmodel_settings' :
                                                    activeTab === 'hud' ? 'hud_settings' :
                                                    activeTab === 'gear' ? 'gear_specs' :
                                                    activeTab === 'pc' ? 'pc_specs' : 
                                                    `${activeTab}_settings`] || {}).map(([key, schema]) => (
                        <div key={key}>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {schema.label}
                          </label>
                          {renderConfigField(activeTab === 'mouse' ? 'mouse_settings' : 
                                           activeTab === 'video' ? 'video_settings' :
                                           activeTab === 'viewmodel' ? 'viewmodel_settings' :
                                           activeTab === 'hud' ? 'hud_settings' :
                                           activeTab === 'gear' ? 'gear_specs' :
                                           activeTab === 'pc' ? 'pc_specs' : 
                                           `${activeTab}_settings`, key, schema)}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-6 pt-6 border-t">
                    <button
                      onClick={saveConfigs}
                      disabled={saving}
                      className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {saving ? 'Salvando...' : 'Salvar Configurações'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
                <div className="text-4xl mb-4">⚙️</div>
                <div className="text-lg">Selecione um player para editar suas configurações</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
