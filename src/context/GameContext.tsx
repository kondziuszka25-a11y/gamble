import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type {
  User,
  CollectibleItem,
  LiveWin,
  DailyRewardDay,
  Achievement,
  AdminLog,
  UserRole,
  OwnedBoost,
  GameHistoryEntry,
} from '../types';
import {
  CURRENT_USER,
  MOCK_USERS,
  DAILY_REWARDS_DATA,
  ACHIEVEMENTS_LIST,
  INITIAL_ADMIN_LOGS,
  SHOP_ITEMS,
} from '../data/mockData';
import { useAuth } from './AuthContext';
import { api } from '../lib/api';

interface GameContextType {
  currentUser: User;
  users: User[];
  inventory: CollectibleItem[];
  liveWins: LiveWin[];
  gameHistory: GameHistoryEntry[];
  refreshGameHistory: () => Promise<void>;
  refreshLiveWins: () => Promise<void>;
  dailyRewards: DailyRewardDay[];
  achievements: Achievement[];
  achievementsNextReset: number;
  resetAchievementsNow: () => void;
  adminLogs: AdminLog[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isSoundEnabled: boolean;
  toggleSound: () => void;
  playSound: (type: 'tick' | 'win' | 'click' | 'claim' | 'cash' | 'buy') => void;
  // Admin modal
  isAdminModalOpen: boolean;
  openAdminModal: () => void;
  closeAdminModal: () => void;
  // Daily Reward claim
  claimDailyReward: () => void;
  isDailyClaimed: boolean;
  // Inventory actions
  sellItem: (itemId: string, value: number) => void;
  // Shop
  purchaseBoost: (shopItemId: string) => boolean;
  hasBoost: (shopItemId: string) => boolean;
  getActiveBoosts: () => OwnedBoost[];
  // Admin Operations
  updateUserBalance: (userId: number, coinDiff: number, gemDiff: number, reason: string) => void;
  updateUserXP: (userId: number, xpDiff: number, targetLevel?: number, reason?: string) => void;
  updateUserRole: (userId: number, newRole: UserRole, reason: string) => void;
  toggleUserStatus: (userId: number, reason: string) => void;
  resetUserPassword: (userId: number) => string;
  // Game availability & Maintenance
  disabledGames: Record<string, boolean>;
  toggleGameStatus: (gameId: string) => void;
  isGameEnabled: (gameId: string) => boolean;
  maintenanceMode: boolean;
  toggleMaintenanceMode: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: authUser, refreshUser } = useAuth();

  const [currentUser, setCurrentUser] = useState<User>(authUser || CURRENT_USER);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [inventory, setInventory] = useState<CollectibleItem[]>([]);
  const [liveWins, setLiveWins] = useState<LiveWin[]>([]);
  const [gameHistory, setGameHistory] = useState<GameHistoryEntry[]>([]);
  const [dailyRewards, setDailyRewards] = useState<DailyRewardDay[]>(DAILY_REWARDS_DATA);
  const [adminLogs, setAdminLogs] = useState<AdminLog[]>(INITIAL_ADMIN_LOGS);
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [isDailyClaimed, setIsDailyClaimed] = useState<boolean>(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);

  // Game availability & maintenance state persisted in localStorage
  const DISABLED_GAMES_KEY = 'neonvault_disabled_games';
  const MAINTENANCE_MODE_KEY = 'neonvault_maintenance_mode';

  const [disabledGames, setDisabledGames] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem(DISABLED_GAMES_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem(MAINTENANCE_MODE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const toggleGameStatus = useCallback((gameId: string) => {
    setDisabledGames((prev) => {
      const next = { ...prev, [gameId]: !prev[gameId] };
      try {
        localStorage.setItem(DISABLED_GAMES_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const isGameEnabled = useCallback((gameId: string) => {
    return !disabledGames[gameId];
  }, [disabledGames]);

  const toggleMaintenanceMode = useCallback(() => {
    setMaintenanceMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(MAINTENANCE_MODE_KEY, String(next));
      } catch {}
      return next;
    });
  }, []);

  // Achievements with 48h platform-wide synchronized reset
  const ACHIEVEMENTS_CYCLE_KEY = 'neonvault_achievements_cycle';
  const ACHIEVEMENTS_STATE_KEY = 'neonvault_achievements_state';
  const ACHIEVEMENTS_48H = 48 * 60 * 60 * 1000;

  const getCurrentCycleId = () => Math.floor(Date.now() / ACHIEVEMENTS_48H);
  const getNextResetTimestamp = (cycleId = getCurrentCycleId()) => (cycleId + 1) * ACHIEVEMENTS_48H;

  const getInitialAchievements = (): Achievement[] => {
    const currentCycle = getCurrentCycleId();
    const storedCycle = localStorage.getItem(ACHIEVEMENTS_CYCLE_KEY);
    const storedState = localStorage.getItem(ACHIEVEMENTS_STATE_KEY);

    if (!storedCycle || parseInt(storedCycle, 10) !== currentCycle) {
      localStorage.setItem(ACHIEVEMENTS_CYCLE_KEY, String(currentCycle));
      const cleanSlate = ACHIEVEMENTS_LIST.map((a) => ({ ...a, unlocked: false, progress: 0 }));
      localStorage.setItem(ACHIEVEMENTS_STATE_KEY, JSON.stringify(cleanSlate));
      return cleanSlate;
    }

    if (storedState) {
      try {
        const parsed = JSON.parse(storedState);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }

    return ACHIEVEMENTS_LIST.map((a) => ({ ...a, unlocked: false, progress: 0 }));
  };

  const [achievements, setAchievements] = useState<Achievement[]>(getInitialAchievements);
  const [achievementsNextReset, setAchievementsNextReset] = useState<number>(() =>
    getNextResetTimestamp()
  );

  const resetAchievementsNow = useCallback(() => {
    const currentCycle = getCurrentCycleId();
    localStorage.setItem(ACHIEVEMENTS_CYCLE_KEY, String(currentCycle));
    const cleanSlate = ACHIEVEMENTS_LIST.map((a) => ({ ...a, unlocked: false, progress: 0 }));
    localStorage.setItem(ACHIEVEMENTS_STATE_KEY, JSON.stringify(cleanSlate));
    setAchievements(cleanSlate);
    setAchievementsNextReset(getNextResetTimestamp(currentCycle));
  }, []);

  // Periodic cycle checker: verifies every 10s if the 48h cycle has rolled over
  useEffect(() => {
    const checkCycle = () => {
      const currentCycle = getCurrentCycleId();
      const storedCycle = localStorage.getItem(ACHIEVEMENTS_CYCLE_KEY);
      if (!storedCycle || parseInt(storedCycle, 10) !== currentCycle) {
        resetAchievementsNow();
      } else {
        setAchievementsNextReset(getNextResetTimestamp(currentCycle));
      }
    };

    const interval = setInterval(checkCycle, 10000);
    return () => clearInterval(interval);
  }, [resetAchievementsNow]);

  // Dynamically update achievement progress when user plays games or levels up
  useEffect(() => {
    const currentCycle = getCurrentCycleId();
    const cycleStartTime = currentCycle * ACHIEVEMENTS_48H;

    // Filter games from this 48h cycle
    const cycleGames = gameHistory.filter((g: any) => {
      if (g.playedAt) {
        return new Date(g.playedAt).getTime() >= cycleStartTime;
      }
      return true;
    });

    setAchievements((prev) => {
      const updated = prev.map((ach) => {
        let newProgress = 0;
        let unlocked = false;

        if (ach.id === 'ach-1') {
          // Pierwsza gra
          newProgress = Math.min(1, cycleGames.length);
          unlocked = newProgress >= 1;
        } else if (ach.id === 'ach-2') {
          // Pierwsza wygrana (> 1.5x)
          const hasWin = cycleGames.some((g) => g.result === 'WIN' && g.multiplier > 1.5);
          newProgress = hasWin ? 1 : 0;
          unlocked = hasWin;
        } else if (ach.id === 'ach-3') {
          // Szczęściarz (>= 10x)
          const hasWin10 = cycleGames.some((g) => g.result === 'WIN' && g.multiplier >= 10);
          newProgress = hasWin10 ? 1 : 0;
          unlocked = hasWin10;
        } else if (ach.id === 'ach-4') {
          // High Roller (100 gier)
          newProgress = Math.min(100, cycleGames.length);
          unlocked = newProgress >= 100;
        } else if (ach.id === 'ach-5') {
          // Neon Veteran (lvl 50)
          newProgress = Math.min(50, currentUser.level);
          unlocked = newProgress >= 50;
        } else if (ach.id === 'ach-6') {
          // Jackpot King
          const hasJackpot = cycleGames.some(
            (g) => g.game.toLowerCase().includes('jackpot') && g.result === 'WIN'
          );
          newProgress = hasJackpot ? 1 : 0;
          unlocked = hasJackpot;
        }

        return { ...ach, progress: newProgress, unlocked };
      });

      try {
        localStorage.setItem(ACHIEVEMENTS_STATE_KEY, JSON.stringify(updated));
      } catch {}

      return updated;
    });
  }, [gameHistory, currentUser.level]);

  // Sync auth user to current user
  useEffect(() => {
    if (authUser) {
      setCurrentUser(authUser);
    }
  }, [authUser]);

  // Load live data from Backend API when user is logged in
  const loadBackendData = useCallback(async () => {
    if (!authUser) return;

    try {
      // 1. Fetch inventory
      const items = await api.inventory.get().catch(() => null);
      if (items && Array.isArray(items)) {
        setInventory(
          items.map((i: any) => ({
            id: i.id,
            name: i.name,
            category: i.category,
            rarity: i.rarity,
            value: i.value,
            iconType: i.iconType,
            description: i.description,
            obtainedAt: new Date(i.obtainedAt).toLocaleDateString('pl-PL'),
          }))
        );
      }

      // 2. Fetch daily rewards
      const rew = await api.rewards.get().catch(() => null);
      if (rew && Array.isArray(rew.rewards)) {
        setDailyRewards(rew.rewards);
        setIsDailyClaimed(rew.claimedToday);
      }

      // 3. If admin/owner, fetch all users & admin logs
      if (authUser.role === 'ADMIN' || authUser.role === 'OWNER' || authUser.role === 'MODERATOR') {
        const allUsers = await api.users.getAll().catch(() => null);
        if (allUsers && Array.isArray(allUsers)) {
          setUsers(
            allUsers.map((u: any) => ({
              id: u.id,
              username: u.username,
              email: u.email,
              avatar: u.avatar,
              role: u.role,
              level: u.level,
              xp: u.xp,
              xpRequired: u.xpRequired,
              coins: u.coins,
              gems: u.gems,
              online: u.online,
              status: u.status,
              registeredAt: new Date(u.createdAt).toLocaleDateString('pl-PL'),
              lastLogin: 'Niedawno',
              ownedBoosts: u.ownedBoosts || [],
            }))
          );
        }

        const logsRes = await api.admin.getLogs(1, 50).catch(() => null);
        if (logsRes && Array.isArray(logsRes.logs)) {
          setAdminLogs(logsRes.logs);
        }
      }

      // 4. Fetch user's real game history
      const hist = await api.games.getHistory().catch(() => null);
      if (hist && Array.isArray(hist)) {
        setGameHistory(hist);
      }

      // 5. Fetch real live wins
      const wins = await api.games.getLiveWins().catch(() => null);
      if (wins && Array.isArray(wins)) {
        setLiveWins(wins);
      }
    } catch {
      // Graceful fallback
    }
  }, [authUser]);

  const refreshGameHistory = useCallback(async () => {
    try {
      const hist = await api.games.getHistory();
      if (Array.isArray(hist)) {
        setGameHistory(hist);
      }
    } catch {
      // silent
    }
  }, []);

  const refreshLiveWins = useCallback(async () => {
    try {
      const wins = await api.games.getLiveWins();
      if (Array.isArray(wins)) {
        setLiveWins(wins);
      }
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    loadBackendData();
  }, [loadBackendData]);

  const toggleSound = () => setIsSoundEnabled((prev) => !prev);

  const playSound = (type: 'tick' | 'win' | 'click' | 'claim' | 'cash' | 'buy') => {
    if (!isSoundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (type === 'tick') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.04);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.04);
      } else if (type === 'win') {
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.09);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.09 + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.09);
          osc.stop(ctx.currentTime + idx * 0.09 + 0.35);
        });
      } else if (type === 'buy') {
        const notes = [392, 523.25, 659.25, 880];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.1, ctx.currentTime + idx * 0.07);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.07 + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.07);
          osc.stop(ctx.currentTime + idx * 0.07 + 0.25);
        });
      } else if (type === 'claim' || type === 'cash') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === 'click') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, ctx.currentTime);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.03);
      }
    } catch {
      // Audio context policy
    }
  };

  const openAdminModal = () => {
    playSound('click');
    setIsAdminModalOpen(true);
  };

  const closeAdminModal = () => {
    playSound('click');
    setIsAdminModalOpen(false);
  };

  // ── REWARDS ───────────────────────────────────────────────────────────────
  const claimDailyReward = async () => {
    if (isDailyClaimed) return;

    try {
      const res = await api.rewards.claim();
      setCurrentUser((prev) => ({
        ...prev,
        coins: res.coins,
        gems: res.gems,
      }));
      setIsDailyClaimed(true);
      setDailyRewards((prev) =>
        prev.map((d) => (d.day === res.day ? { ...d, claimed: true, isToday: false } : d))
      );
      playSound('claim');
      refreshUser();
    } catch {
      // Fallback local
      setCurrentUser((prev) => ({
        ...prev,
        gems: prev.gems + 5,
      }));
      setIsDailyClaimed(true);
      setDailyRewards((prev) =>
        prev.map((d) => (d.isToday ? { ...d, claimed: true } : d))
      );
      playSound('claim');
    }
  };

  // ── INVENTORY ─────────────────────────────────────────────────────────────
  const sellItem = async (itemId: string, value: number) => {
    setInventory((prev) => prev.filter((i) => i.id !== itemId));
    setCurrentUser((prev) => ({
      ...prev,
      coins: prev.coins + value,
    }));
    playSound('cash');

    api.inventory.sell(itemId).then((res) => {
      if (res?.coins !== undefined) {
        setCurrentUser((prev) => ({ ...prev, coins: res.coins }));
      }
      refreshUser();
    }).catch(() => {});
  };

  // ── SHOP ──────────────────────────────────────────────────────────────────
  const hasBoost = (shopItemId: string): boolean => {
    const boost = currentUser.ownedBoosts?.find((b) => b.shopItemId === shopItemId);
    if (!boost) return false;
    if (!boost.expiresAt) return boost.isActive;
    return new Date(boost.expiresAt) > new Date();
  };

  const getActiveBoosts = (): OwnedBoost[] => {
    return (currentUser.ownedBoosts || []).filter((b) => {
      if (!b.expiresAt) return b.isActive;
      return new Date(b.expiresAt) > new Date();
    });
  };

  const purchaseBoost = (shopItemId: string): boolean => {
    const item = SHOP_ITEMS.find((s) => s.id === shopItemId);
    if (!item) return false;
    if (currentUser.gems < item.cost) return false;
    if (hasBoost(shopItemId)) return false;

    const now = new Date();
    const expiresAt =
      item.type === 'timed' && item.durationHours
        ? new Date(now.getTime() + item.durationHours * 60 * 60 * 1000).toISOString()
        : undefined;

    const newBoost: OwnedBoost = {
      shopItemId,
      purchasedAt: now.toISOString(),
      expiresAt,
      isActive: true,
    };

    // Optimistic update
    setCurrentUser((prev) => ({
      ...prev,
      gems: prev.gems - item.cost,
      ownedBoosts: [...(prev.ownedBoosts || []), newBoost],
    }));

    playSound('buy');

    // Sync with backend
    api.shop.purchase(shopItemId).then((res) => {
      if (res?.gems !== undefined) {
        setCurrentUser((prev) => ({ ...prev, gems: res.gems }));
      }
      refreshUser();
    }).catch(() => {});

    return true;
  };

  // ── ADMIN OPERATIONS ──────────────────────────────────────────────────────
  const addLog = (targetUser: string, action: string, value: string, reason: string) => {
    const newLog: AdminLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString('pl-PL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      adminName: currentUser.username,
      targetUser,
      action,
      value,
      reason: reason || 'Brak podanego powodu',
    };
    setAdminLogs((prev) => [newLog, ...prev]);
  };

  const updateUserBalance = async (userId: number, coinDiff: number, gemDiff: number, reason: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const updated = {
            ...u,
            coins: Math.max(0, u.coins + coinDiff),
            gems: Math.max(0, u.gems + gemDiff),
          };
          if (u.id === currentUser.id) {
            setCurrentUser(updated);
          }
          return updated;
        }
        return u;
      })
    );

    const target = users.find((u) => u.id === userId);
    const targetName = target ? target.username : `User #${userId}`;
    const descParts: string[] = [];
    if (coinDiff !== 0) descParts.push(`${coinDiff > 0 ? '+' : ''}${coinDiff.toLocaleString()} monet`);
    if (gemDiff !== 0) descParts.push(`${gemDiff > 0 ? '+' : ''}${gemDiff.toLocaleString()} gemów`);

    addLog(targetName, 'Korekta salda', descParts.join(', '), reason);
    playSound('cash');

    api.users.updateBalance(userId, coinDiff, gemDiff, reason).catch(() => {});
  };

  const updateUserXP = async (userId: number, xpDiff: number, targetLevel?: number, reason?: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const nextLevel = targetLevel !== undefined ? targetLevel : u.level;
          const nextXp = Math.max(0, u.xp + xpDiff);
          const updated = {
            ...u,
            level: nextLevel,
            xp: nextXp,
          };
          if (u.id === currentUser.id) {
            setCurrentUser(updated);
          }
          return updated;
        }
        return u;
      })
    );

    const target = users.find((u) => u.id === userId);
    const targetName = target ? target.username : `User #${userId}`;
    addLog(
      targetName,
      'Modyfikacja XP/Poziomu',
      targetLevel ? `Ustawiono Level ${targetLevel}` : `${xpDiff > 0 ? '+' : ''}${xpDiff} XP`,
      reason || 'Korekta administratorska'
    );
    playSound('claim');

    api.users.updateXP(userId, xpDiff, targetLevel, reason).catch(() => {});
  };

  const updateUserRole = async (userId: number, newRole: UserRole, reason: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const updated = { ...u, role: newRole };
          if (u.id === currentUser.id) {
            setCurrentUser(updated);
          }
          return updated;
        }
        return u;
      })
    );

    const target = users.find((u) => u.id === userId);
    const targetName = target ? target.username : `User #${userId}`;
    addLog(targetName, 'Zmiana roli', `Nowa rola: ${newRole}`, reason);
    playSound('click');

    api.users.updateRole(userId, newRole, reason).catch(() => {});
  };

  const toggleUserStatus = async (userId: number, reason: string) => {
    let isNowBanned = false;
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const nextStatus: 'ACTIVE' | 'BANNED' = u.status === 'ACTIVE' ? 'BANNED' : 'ACTIVE';
          isNowBanned = nextStatus === 'BANNED';
          const updated = { ...u, status: nextStatus };
          if (u.id === currentUser.id) {
            setCurrentUser(updated);
          }
          return updated;
        }
        return u;
      })
    );

    const target = users.find((u) => u.id === userId);
    const targetName = target ? target.username : `User #${userId}`;
    addLog(
      targetName,
      isNowBanned ? 'Zablokowano konto' : 'Odblokowano konto',
      `STATUS: ${isNowBanned ? 'BANNED' : 'ACTIVE'}`,
      reason
    );
    playSound('click');

    api.users.updateStatus(userId, reason).catch(() => {});
  };

  const resetUserPassword = (userId: number): string => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789#$!';
    let tempPass = 'JP-';
    for (let i = 0; i < 8; i++) {
      tempPass += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const target = users.find((u) => u.id === userId);
    const targetName = target ? target.username : `User #${userId}`;
    addLog(targetName, 'Reset hasła', 'Wygenerowano hasło tymczasowe', 'Procedura bezpieczeństwa');
    playSound('click');

    api.users.resetPassword(userId).catch(() => {});

    return tempPass;
  };

  // Real live wins — refresh from backend every 60 seconds
  useEffect(() => {
    if (!authUser) return;
    const interval = setInterval(() => {
      refreshLiveWins();
    }, 60000);
    return () => clearInterval(interval);
  }, [authUser, refreshLiveWins]);

  return (
    <GameContext.Provider
      value={{
        currentUser,
        users,
        inventory,
        liveWins,
        gameHistory,
        refreshGameHistory,
        refreshLiveWins,
        dailyRewards,
        achievements,
        achievementsNextReset,
        resetAchievementsNow,
        adminLogs,
        activeTab,
        setActiveTab,
        isSoundEnabled,
        toggleSound,
        playSound,
        isAdminModalOpen,
        openAdminModal,
        closeAdminModal,
        claimDailyReward,
        isDailyClaimed,
        sellItem,
        purchaseBoost,
        hasBoost,
        getActiveBoosts,
        updateUserBalance,
        updateUserXP,
        updateUserRole,
        toggleUserStatus,
        resetUserPassword,
        disabledGames,
        toggleGameStatus,
        isGameEnabled,
        maintenanceMode,
        toggleMaintenanceMode,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
