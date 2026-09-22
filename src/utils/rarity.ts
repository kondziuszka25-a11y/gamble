import type { ItemRarity } from '../types';

export interface RarityConfig {
  name: string;
  color: string;
  bgSubtle: string;
  borderColor: string;
  glowColor: string;
  badgeBg: string;
}

export const RARITY_CONFIG: Record<ItemRarity, RarityConfig> = {
  common: {
    name: 'Zwykły',
    color: '#94a3b8',
    bgSubtle: 'rgba(148, 163, 184, 0.08)',
    borderColor: 'rgba(148, 163, 184, 0.35)',
    glowColor: 'rgba(148, 163, 184, 0.2)',
    badgeBg: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  },
  rare: {
    name: 'Rzadki',
    color: '#22d3ee',
    bgSubtle: 'rgba(34, 211, 238, 0.08)',
    borderColor: 'rgba(34, 211, 238, 0.45)',
    glowColor: 'rgba(34, 211, 238, 0.3)',
    badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  },
  epic: {
    name: 'Epicki',
    color: '#a855f7',
    bgSubtle: 'rgba(168, 85, 247, 0.08)',
    borderColor: 'rgba(168, 85, 247, 0.45)',
    glowColor: 'rgba(168, 85, 247, 0.35)',
    badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  },
  legendary: {
    name: 'Legendarny',
    color: '#facc15',
    bgSubtle: 'rgba(250, 204, 21, 0.1)',
    borderColor: 'rgba(250, 204, 21, 0.55)',
    glowColor: 'rgba(250, 204, 21, 0.45)',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/35',
  },
  mythic: {
    name: 'Mityczny ★',
    color: '#ec4899',
    bgSubtle: 'rgba(236, 72, 153, 0.12)',
    borderColor: 'rgba(236, 72, 153, 0.65)',
    glowColor: 'rgba(236, 72, 153, 0.55)',
    badgeBg: 'bg-pink-500/20 text-pink-300 border-pink-500/40',
  },
};

export const getRarityStyle = (rarity: ItemRarity) => {
  return RARITY_CONFIG[rarity] || RARITY_CONFIG.common;
};
