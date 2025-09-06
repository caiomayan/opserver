export const PLAYER_ROLES = {
  0: { name: 'Rifler', icon: '/roles/rifler.svg', color: '#7EAC47' },
  1: { name: 'AWPer', icon: '/roles/awper.svg', color: '#F6B026' },
  2: { name: 'Lurker', icon: '/roles/lurker.svg', color: '#86BAF3' },
  3: { name: 'Opener', icon: '/roles/entry_fragger.svg', color: '#da5858' },
  4: { name: 'IGL', icon: '/roles/igl.svg', color: '#23DFBD' },
  5: { name: 'Support', icon: '/roles/support.svg', color: '#F9EA1D' },
  6: { name: 'Beginner', icon: '/roles/beginner.svg', color: '#ffb36c' },
  7: { name: 'Coach', icon: '/roles/coach.svg', color: '#bf8afe' }
};

export const getPlayerRole = (idrole) => {
  return PLAYER_ROLES[idrole] || { name: 'Unknown', icon: '/teams/unknown.svg', color: '#6B7280' };
};

export const getRoleName = (idrole) => {
  return PLAYER_ROLES[idrole]?.name || 'Unknown';
};

export const getRoleIcon = (idrole) => {
  const role = getPlayerRole(idrole);
  return role.icon;
};
