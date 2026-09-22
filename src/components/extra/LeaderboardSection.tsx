import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import {
  Trophy,
  Crown,
  Medal,
  Flame,
  Coins,
  Award,
  Zap,
} from 'lucide-react';

export const LeaderboardSection: React.FC = () => {
  const { users, currentUser } = useGame();
  const [activeTab, setActiveTab] = useState<'coins' | 'level' | 'win' | 'games' | 'multiplier'>('coins');

  const tabs = [
    { id: 'coins', label: 'Najwięcej monet', icon: Coins },
    { id: 'level', label: 'Najwyższy level', icon: Award },
    { id: 'win', label: 'Największa wygrana', icon: Trophy },
    { id: 'games', label: 'Rozegrane gry', icon: Zap },
    { id: 'multiplier', label: 'Najwyższy mnożnik', icon: Flame },
  ];

  // Derive sorted users based on tab
  const getSortedUsers = () => {
    const list = [...users];
    switch (activeTab) {
      case 'level':
        return list.sort((a, b) => b.level - a.level);
      case 'win':
        return list.sort((a, b) => b.coins * 0.8 - a.coins * 0.8);
      case 'games':
        return list.sort((a, b) => b.level * 45 - a.level * 45);
      case 'multiplier':
        return list.sort((a, b) => b.id - a.id);
      case 'coins':
      default:
        return list.sort((a, b) => b.coins - a.coins);
    }
  };

  const sortedUsers = getSortedUsers();
  const topThree = sortedUsers.slice(0, 3);
  const remaining = sortedUsers.slice(3);

  const getMetricDisplay = (u: typeof users[0]) => {
    switch (activeTab) {
      case 'level':
        return `Poziom ${u.level}`;
      case 'win':
        return `+${Math.floor(u.coins * 0.65).toLocaleString()} monet`;
      case 'games':
        return `${u.level * 42} gier`;
      case 'multiplier':
        return `${(u.level * 1.8 + 12).toFixed(1)}x`;
      case 'coins':
      default:
        return `${u.coins.toLocaleString()} monet`;
    }
  };

  return (
    <section id="leaderboard-section" className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              Ranking Graczy
            </h2>
            <p className="text-xs text-slate-400">
              Cotygodniowe zestawienie najlepszych graczy platformy NeonVault
            </p>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 p-1 bg-[#0D1324] border border-white/[0.08] rounded-2xl overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Top 3 Podium Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 2nd Place */}
        {topThree[1] && (
          <div className="relative p-6 rounded-3xl bg-[#0D1324] border border-slate-400/30 flex flex-col items-center text-center shadow-xl order-2 md:order-1 mt-0 md:mt-4">
            <div className="w-8 h-8 rounded-full bg-slate-400/20 border border-slate-300 flex items-center justify-center mb-3">
              <Medal className="w-4 h-4 text-slate-300" />
            </div>
            <img
              src={topThree[1].avatar}
              alt={topThree[1].username}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-400/50 mb-3 shadow-md"
            />
            <h4 className="text-base font-black text-white">{topThree[1].username}</h4>
            <span className="text-xs text-slate-400 font-mono">LVL {topThree[1].level}</span>
            <div className="mt-4 px-4 py-2 rounded-xl bg-black/40 border border-white/5 font-mono font-bold text-slate-200 text-sm">
              {getMetricDisplay(topThree[1])}
            </div>
          </div>
        )}

        {/* 1st Place (Winner) */}
        {topThree[0] && (
          <div className="relative p-6 rounded-3xl bg-gradient-to-b from-[#1E1B4B] to-[#0D1324] border-2 border-amber-500/60 flex flex-col items-center text-center shadow-2xl shadow-amber-500/20 order-1 md:order-2 scale-105 z-10">
            <div className="absolute -top-3 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 text-black text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md">
              <Crown className="w-3 h-3 fill-current" />
              LIDER TYGODNIA
            </div>

            <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center mb-3 mt-1">
              <Crown className="w-5 h-5 text-amber-400 fill-amber-400/30" />
            </div>
            <img
              src={topThree[0].avatar}
              alt={topThree[0].username}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-amber-400 mb-3 shadow-lg shadow-amber-500/30"
            />
            <h4 className="text-lg font-black text-white">{topThree[0].username}</h4>
            <span className="text-xs text-amber-300 font-mono font-bold">
              LVL {topThree[0].level} • {topThree[0].role}
            </span>
            <div className="mt-4 px-5 py-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 font-mono font-black text-amber-300 text-base shadow-sm">
              {getMetricDisplay(topThree[0])}
            </div>
          </div>
        )}

        {/* 3rd Place */}
        {topThree[2] && (
          <div className="relative p-6 rounded-3xl bg-[#0D1324] border border-amber-700/40 flex flex-col items-center text-center shadow-xl order-3 mt-0 md:mt-6">
            <div className="w-8 h-8 rounded-full bg-amber-700/20 border border-amber-700 flex items-center justify-center mb-3">
              <Medal className="w-4 h-4 text-amber-600" />
            </div>
            <img
              src={topThree[2].avatar}
              alt={topThree[2].username}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-700/50 mb-3 shadow-md"
            />
            <h4 className="text-base font-black text-white">{topThree[2].username}</h4>
            <span className="text-xs text-slate-400 font-mono">LVL {topThree[2].level}</span>
            <div className="mt-4 px-4 py-2 rounded-xl bg-black/40 border border-white/5 font-mono font-bold text-slate-200 text-sm">
              {getMetricDisplay(topThree[2])}
            </div>
          </div>
        )}
      </div>

      {/* Remaining Users Table */}
      <div className="rounded-3xl bg-[#0D1324] border border-white/[0.08] p-4 sm:p-6 overflow-hidden">
        <div className="divide-y divide-white/[0.05]">
          {remaining.map((user, idx) => {
            const rank = idx + 4;
            const isMe = user.id === currentUser.id;

            return (
              <div
                key={user.id}
                className={`py-3.5 px-3 flex items-center justify-between rounded-xl transition-colors ${
                  isMe ? 'bg-purple-950/30 border border-purple-500/30' : 'hover:bg-white/[0.02]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 flex items-center justify-center font-mono font-bold text-slate-400 text-xs">
                    #{rank}
                  </div>
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-9 h-9 rounded-xl object-cover border border-white/10"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{user.username}</span>
                      {isMe && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          TY
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400">Poziom {user.level}</span>
                  </div>
                </div>

                <span className="font-mono font-bold text-sm text-slate-200">
                  {getMetricDisplay(user)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
