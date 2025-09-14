// Estruturas para os campos JSONB do player_configs

export const MOUSE_SETTINGS_SCHEMA = {
  mouse: { type: 'string', label: 'Mouse' },
  mousepad: { type: 'string', label: 'Mousepad' },
  dpi: { type: 'number', label: 'DPI', min: 100, max: 10000 },
  sensitivity: { type: 'number', label: 'Sensibilidade', min: 0.1, max: 10, step: 0.01 },
  polling_rate: { type: 'number', label: 'Polling Rate', min: 125, max: 8000 },
  zoom_sensitivity: { type: 'number', label: 'Sensibilidade do Zoom', min: 0.1, max: 5, step: 0.01 }
};

export const VIDEO_SETTINGS_SCHEMA = {
  resolution: { type: 'select', label: 'Resolução', options: ['1920x1080', '1440x1080', '1280x960', '1024x768'] },
  aspect_ratio: { type: 'select', label: 'Aspect Ratio', options: ['16:9', '4:3', '16:10'] },
  display_mode: { type: 'select', label: 'Modo de Exibição', options: ['Tela cheia', 'Modo janela', 'Tela cheia sem bordas'] },
  scaling_mode: { type: 'select', label: 'Modo de Escala', options: ['Esticado', 'Black Bars'] },
  brightness: { type: 'number', label: 'Brilho', min: 0, max: 100 },
  maxfps: { type: 'number', label: 'FPS Máximo', min: 60, max: 999 },
  dynamicshadows: { type: 'select', label: 'Sombras Dinâmicas', options: ['Sun Only', 'All'] },
  hdr: { type: 'select', label: 'HDR', options: ['Performance', 'Quality'] },
  nvidiareflexll: { type: 'select', label: 'NVIDIA Reflex Low Latency', options: ['Disabled', 'Enabled', 'Enabled + Boost'] },
  particle_detail: { type: 'select', label: 'Particle Detail', options: ['Low', 'Medium', 'High'] },
  ambientocclusion: { type: 'select', label: 'Oclusão de Ambiente', options: ['Disabled', 'Medium', 'Enabled'] },
  global_shadow_quality: { type: 'select', label: 'Global Shadow Quality', options: ['Low', 'Medium', 'High', 'Very High'] },
  multisampling_anti_aliasing_mode: { type: 'select', label: 'Multisampling Anti-Aliasing Mode', options: ['CMAA2', '2x MSAA', '4x MSAA', '8x MSAA'] },
  texture_filtering_mode: { type: 'select', label: 'Modo de Filtragem de Textura', options: ['Bilinear', 'Trilinear', 'Anisotropic 2x', 'Anisotropic 4x', 'Anisotropic 8x', 'Anisotropic 16x'] },
  boostplayercontrast: { type: 'select', label: 'Boost Player Contrast', options: [false, true] },
  model_texture_detail: { type: 'select', label: 'Model / Texture Detail', options: ['Low', 'Medium', 'High'] },
  ffxsr: { type: 'select', label: 'Fidelity FX-Super Resolution', options: ['Performance', 'Balanced', 'Quality', 'Ultra Quality', 'Disabled (Highest Quality)'] },
  shader_detail: { type: 'select', label: 'Shader Detail', options: ['Low', 'High'] },
  refresh_rate: { type: 'number', label: 'Taxa de Atualização do Monitor (hz)', min: 60, max: 1000 },
  vsync: { type: 'select', label: 'V-Sync', options: [false, true] },
  nvidiagsync: { type: 'select', label: 'NVIDIA G-Sync', options: [false, true] }
};

export const VIEWMODEL_SETTINGS_SCHEMA = {
  viewmodel: { type: 'select', label: 'Viewmodel Preset', options: ['Desktop', 'Couch', 'Classic'] },
  viewmodel_fov: { type: 'number', label: 'Viewmodel FOV', min: 54, max: 68 },
  viewmodel_offset_x: { type: 'number', label: 'Offset X', min: -2.5, max: 2.5, step: 0.1 },
  viewmodel_offset_y: { type: 'number', label: 'Offset Y', min: -2, max: 2, step: 0.1 },
  viewmodel_offset_z: { type: 'number', label: 'Offset Z', min: -2, max: 2, step: 0.1 },
  viewmodel_presetpos: { type: 'select', label: 'Preset Position', options: ['1', '2', '3'] }
};

export const HUD_SETTINGS_SCHEMA = {
  hud_scaling: { type: 'number', label: 'HUD Scaling', min: 0.5, max: 1.0, step: 0.05 },
  cl_hud_color: { type: 'select', label: 'Cor do HUD', options: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'] },
  cl_radar_scale: { type: 'number', label: 'Radar Map Zoom', min: 0.25, max: 1.0, step: 0.05 },
  cl_hud_radar_scale: { type: 'number', label: 'Radar Hud Size', min: 0.8, max: 1.3, step: 0.05 },
  cl_radar_rotate: { type: 'boolean', label: 'Radar is Rotating' },
  cl_radar_square_with_scoreboard: { type: 'boolean', label: 'Toggle Shape With Scoreboard' },
  cl_radar_always_centered: { type: 'boolean', label: 'Radar Centers The Player' }
};

export const GEAR_SPECS_SCHEMA = {
  mouse: { type: 'string', label: 'Mouse' },
  mousepad: { type: 'string', label: 'Mousepad' },
  keyboard: { type: 'string', label: 'Teclado' },
  headset: { type: 'string', label: 'Headset' },
  earphones: { type: 'string', label: 'Fones de Ouvido' },
  monitor: { type: 'string', label: 'Monitor' },
  // Adicionado para casar com profile
  mouse_cable: { type: 'string', label: 'Cabo do Mouse' }
};

export const PC_SPECS_SCHEMA = {
  cpu: { type: 'string', label: 'Processador (CPU)' },
  gpu: {
    gpu_card: { type: 'string', label: 'Placa de Vídeo' },
    digital_vibrance: { type: 'number', label: 'Vibrance Digital (%)', min: 0, max: 100 }
  },
  // Adicionado para casar com profile
  ram: { type: 'string', label: 'Memória RAM' },
  ssd: { type: 'string', label: 'SSD' }
};

export const ROLE_OPTIONS = [
  { value: 0, label: 'Rifler' },
  { value: 1, label: 'AWPer' },
  { value: 2, label: 'Lurker' },
  { value: 3, label: 'Opener' },
  { value: 4, label: 'IGL' },
  { value: 5, label: 'Support' },
  { value: 6, label: 'Beginner' },
  { value: 7, label: 'Coach' }
];

export const MEMBERSHIP_OPTIONS = [
  { value: 0, label: 'Membro' },
  { value: 1, label: 'Premium' },
  { value: 2, label: 'Admin' },
  { value: 3, label: 'Dono' }
];

// Função para obter valores padrão dos schemas
export const getDefaultValues = (schema) => {
  const defaults = {};
  Object.keys(schema).forEach(key => {
    const field = schema[key];
    if (field.type === 'boolean') {
      defaults[key] = false;
    } else if (field.type === 'number') {
      defaults[key] = field.min || 0;
    } else if (field.type === 'select' && field.options) {
      defaults[key] = field.options[0];
    } else {
      defaults[key] = null;
    }
  });
  return defaults;
};

// Função para validar dados
export const validateField = (value, fieldSchema) => {
  if (fieldSchema.type === 'number') {
    const num = parseFloat(value);
    if (isNaN(num)) return false;
    if (fieldSchema.min !== undefined && num < fieldSchema.min) return false;
    if (fieldSchema.max !== undefined && num > fieldSchema.max) return false;
    return true;
  }
  if (fieldSchema.type === 'select') {
    return fieldSchema.options.includes(value);
  }
  return true;
};
