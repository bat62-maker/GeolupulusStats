/**
 * Retorna l'estil visual per a edicions especials (50, 100, 150).
 */
export const getMilestoneStyle = (order) => {
  if (order === 150) return { bg: 'bg-amber-500/10', text: 'text-amber-500', label: 'HISTÒRIC 150' };
  if (order === 100) return { bg: 'bg-slate-400/10', text: 'text-slate-300', label: 'EDICIÓ 100' };
  if (order === 50)  return { bg: 'bg-orange-800/10', text: 'text-orange-400', label: 'EDICIÓ 50' };
  return null;
};

/**
 * Configuració de medalles per número d'edició.
 */
export const MEDAL_CONFIGS = {
  50:  { color: '#CD7F32', label: 'BRONZE', secondary: '#78350f' },
  100: { color: '#C0C0C0', label: 'PLATA',  secondary: '#475569' },
  150: { color: '#EAB308', label: 'OR / 150', secondary: '#854D0E' },
};
