export const MEMBERSHIP_TYPES = {
  0: { name: 'Membro', color: '#6B7280', bgColor: '#F3F4F6' },
  1: { name: 'Premium', color: '#F59E0B', bgColor: '#FEF3C7' },
  2: { name: 'Admin', color: '#EF4444', bgColor: '#FEE2E2' },
  3: { name: 'Dono', color: '#8B5CF6', bgColor: '#EDE9FE' }
};

export const getMembershipType = (idmembership) => {
  return MEMBERSHIP_TYPES[idmembership] || MEMBERSHIP_TYPES[0];
};

export const getMembershipName = (idmembership) => {
  return MEMBERSHIP_TYPES[idmembership]?.name || 'Membro';
};

export const getMembershipColor = (idmembership) => {
  return MEMBERSHIP_TYPES[idmembership]?.color || '#6B7280';
};

export const getMembershipBgColor = (idmembership) => {
  return MEMBERSHIP_TYPES[idmembership]?.bgColor || '#F3F4F6';
};
