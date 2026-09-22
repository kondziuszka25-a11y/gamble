export type UserRole = 'USER' | 'MODERATOR' | 'ADMIN' | 'OWNER';

export type UserStatus = 'ACTIVE' | 'BANNED' | 'SUSPENDED';

export type ItemRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

export type BoostType = 'permanent' | 'timed';

export type BoostCategory = 'coins' | 'xp' | 'luck' | 'daily' | 'cosmetic';

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  detailDescription: string;
  cost: number;
  type: BoostType;
  category: BoostCategory;
  icon: string;
  color: string;
  glowColor: string;
  durationHours?: number;
  badge?: string;
}

export interface OwnedBoost {
  shopItemId: string;
  purchasedAt: string;
  expiresAt?: string;
  isActive: boolean;
}

export interface User {
  id: number;
  username: string;
  email: string;
  avatar: string;
  role: UserRole;
  level: number;
  xp: number;
  xpRequired: number;
  coins: number;
  gems: number;
  online: boolean;
  status: UserStatus;
  registeredAt: string;
  lastLogin: string;
  ownedBoosts: OwnedBoost[];
}

export interface CollectibleItem {
  id: string;
  name: string;
  category: string;
  rarity: ItemRarity;
  value: number; // in virtual coins
  iconType: string;
  description: string;
  obtainedAt?: string;
}

export interface GameInfo {
  id: string;
  name: string;
  description: string;
  iconName: string;
  badge?: 'HOT' | 'POPULARNE' | 'NOWE' | 'KLASYK' | 'SKILL';
  maxMultiplier: string;
  activePlayers: number;
  gradient: string;
  glowColor: string;
}

export interface LiveWin {
  id: string;
  user: {
    username: string;
    avatar: string;
  };
  game: string;
  multiplier: number;
  winAmount: number;
  timestamp: string;
}

export interface DailyRewardDay {
  day: number;
  coins?: number;
  gems?: number;
  special?: boolean;
  specialTitle?: string;
  claimed: boolean;
  isToday: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  rewardCoins: number;
  rewardGems?: number;
  icon: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
}

export interface AdminLog {
  id: string;
  timestamp: string;
  adminName: string;
  targetUser: string;
  action: string;
  value: string;
  reason: string;
}

export interface GameHistoryEntry {
  id: string;
  game: string;
  betAmount: number;
  multiplier: number;
  payout: number;
  timestamp: string;
  result: 'WIN' | 'LOSS';
}
