import React from 'react';
import { useGame } from '../../context/GameContext';
import {
  Users,
  Radio,
  UserPlus,
  Gamepad2,
  Coins,
  Gem,
  Ban,
  ShieldCheck,
  TrendingUp,
  Activity,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { adminLogs, users } = useGame();

  const totalUsers = users.length;
  const onlineUsers = users.filter((u) => u.online).length;
  const bannedUsers = users.filter((u) => u.status === 'BANNED').length;
  const admins = users.filter((u) => u.role === 'ADMIN' || u.role === 'OWNER').length;
  const totalCoins = users.reduce((sum, u) => sum + (u.coins || 0), 0);
  const totalGems = users.reduce((sum, u) => sum + (u.gems || 0), 0);

  const stats = [
    { label: 'Liczba użytkowników', value: totalUsers.toString(), icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Użytkownicy online', value: onlineUsers.toString(), icon: Radio, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Nowe konta dzisiaj', value: '—', icon: UserPlus, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { label: 'Rozegrane gry', value: '—', icon: Gamepad2, color: 'text-pink-400', bg: 'bg-pink-500/10' },
    { label: 'Monety w obiegu', value: totalCoins.toLocaleString(), icon: Coins, color: 'text-amber-300', bg: 'bg-amber-500/10' },
    { label: 'Gemy w obiegu', value: totalGems.toLocaleString(), icon: Gem, color: 'text-cyan-300', bg: 'bg-cyan-500/10' },
    { label: 'Aktywne bany', value: bannedUsers.toString(), icon: Ban, color: 'text-rose-400', bg: 'bg-rose-500/10' },
    { label: 'Administratorzy', value: admins.toString(), icon: ShieldCheck, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  ];

  return (
    <div className="space-y-6">
      {/* Top 8 Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-[#090D18] border border-white/[0.08] flex items-center justify-between"
            >
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  {stat.label}
                </span>
                <span className="text-lg font-mono font-black text-white mt-1 block">
                  {stat.value}
                </span>
              </div>
              <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Activity Chart & Live Logs Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Activity Chart (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl bg-[#090D18] border border-white/[0.08] p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-pink-400" />
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                Aktywność i Obroty w Grach (24h)
              </h4>
            </div>
            <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +18.4% dzisiaj
            </span>
          </div>

          {/* SVG Area Chart */}
          <div className="py-2 h-44 w-full">
            <svg viewBox="0 0 500 160" className="w-full h-full overflow-visible" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chart-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ec4899" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="40" x2="500" y2="40" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
              <line x1="0" y1="80" x2="500" y2="80" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
              <line x1="0" y1="120" x2="500" y2="120" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />

              {/* Area Fill */}
              <polygon
                points="0,120 40,110 80,130 120,90 160,85 200,105 240,65 280,50 320,70 360,40 400,35 440,20 480,30 500,25 500,160 0,160"
                fill="url(#chart-grad)"
              />

              {/* Gradient Stroke Line */}
              <polyline
                points="0,120 40,110 80,130 120,90 160,85 200,105 240,65 280,50 320,70 360,40 400,35 440,20 480,30 500,25"
                fill="none"
                stroke="#ec4899"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Data Points */}
              <circle cx="280" cy="50" r="4" fill="#ffffff" stroke="#ec4899" strokeWidth="2" />
              <circle cx="440" cy="20" r="4" fill="#ffffff" stroke="#a855f7" strokeWidth="2" />
            </svg>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-2 border-t border-white/[0.05]">
            <span>00:00</span>
            <span>06:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>Teraz (Szczyt)</span>
          </div>
        </div>

        {/* Recent Admin Actions (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl bg-[#090D18] border border-white/[0.08] p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Ostatnie akcje administratorów
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">Audyt Live</span>
          </div>

          <div className="space-y-2.5 max-h-56 overflow-y-auto no-scrollbar">
            {adminLogs.slice(0, 5).map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-[#0D1324] border border-white/[0.05] text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-300">{log.adminName}</span>
                  <span className="text-[10px] text-slate-500">{log.timestamp}</span>
                </div>
                <div className="text-slate-300 font-medium">
                  {log.action}: <strong className="text-amber-300">{log.value}</strong> dla{' '}
                  <span className="text-cyan-300 font-bold">{log.targetUser}</span>
                </div>
                <div className="text-[11px] text-slate-400 italic">
                  Powód: {log.reason}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
