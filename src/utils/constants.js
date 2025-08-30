export const APP_CONFIG = {
  CACHE_DURATION: 3 * 60 * 60 * 1000,
  REQUEST_BATCH_SIZE: 2,
  REQUEST_DELAY_RANGE: [500, 1500],
  BATCH_DELAY: 2000,
  DEFAULT_TIMEOUT: 15000,
  PROBLEMATIC_PROFILES_TIMEOUT: 30000
};

export const PROBLEMATIC_PROFILES = ['yuurih', 'FalleN'];

export const PRODUCTION_LEVEL_MAP = {
  '1635730': 17,
  '2319357': 19,
  '1808995': 15,
  '2345889': 13,
  'FalleN': 99,
  'yuurih': 99,
  '': 'Indisponível'
};

export const NAVIGATION_COLORS = {
  teams: 'gray-300',
  server: 'blue-300',
  stats: 'green-300',
  admin: 'orange-300'
};
