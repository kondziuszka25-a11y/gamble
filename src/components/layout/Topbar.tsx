import React, { useState } from 'react';
import {
  Search,
  Coins,
  Gem,
  Bell,
  Menu,
  CheckCheck,
  SlidersHorizontal,
  LogOut,
} from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { useAuth } from '../../context/AuthContext';

interface TopbarProps {
  onToggleMobileMenu: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  onToggleMobileMenu,
  searchQuery,
  setSearchQuery,
}) => {
  const {
    currentUser,
    openAdminModal,
  } = useGame();
  const { logout } = useAuth();

  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const isStaff = currentUser.role === 'ADMIN' || currentUser.role === 'OWNER';

  const notificationsList: { id: number; title: string; time: string; unread: boolean }[] = [];

  return (
    <header className="sticky top-0 z-30 h-20 bg-[#090D18]/85 backdrop-blur-xl border-b border-white/[0.08] px-4 lg:px-8 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Search */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-300 hover:text-white"
          aria-label="Otwórz menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Szukaj gier, przedmiotów, graczy..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-16 py-2.5 bg-[#0D1324]/80 border border-white/[0.08] rounded-xl text-sm text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 transition-all"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-white/10 text-slate-400 rounded border border-white/10">
              Ctrl K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right: Balances, Admin Button, Notifications, Profile */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Virtual Currencies Bar (Monety & Gemy) */}
        <div className="flex items-center gap-2 bg-[#0D1324]/90 border border-white/[0.08] rounded-xl p-1.5 shadow-inner">
          {/* Neon Coins */}
          <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-amber-500/15 to-yellow-500/5 rounded-lg border border-amber-500/25">
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center shadow-sm shadow-amber-500/40">
              <Coins className="w-3.5 h-3.5 text-black" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black font-mono tracking-wider text-amber-300">
                {currentUser.coins.toLocaleString()}
              </span>
              <span className="text-[9px] uppercase font-bold text-amber-400/80 -mt-0.5">MONET</span>
            </div>
          </div>

          {/* Gems */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-cyan-500/15 to-blue-500/5 rounded-lg border border-cyan-500/25">
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 flex items-center justify-center shadow-sm shadow-cyan-500/40">
              <Gem className="w-3 h-3 text-black" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black font-mono tracking-wider text-cyan-300">
                {currentUser.gems}
              </span>
              <span className="text-[9px] uppercase font-bold text-cyan-400/80 -mt-0.5">GEMÓW</span>
            </div>
          </div>
        </div>

        {/* Admin Panel Button (for ADMIN or OWNER) */}
        {isStaff && (
          <button
            onClick={openAdminModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600/30 to-pink-600/30 hover:from-purple-600/50 hover:to-pink-600/50 border border-purple-500/40 text-purple-200 hover:text-white text-xs font-bold transition-all shadow-md shadow-purple-900/20 active:scale-95"
            title="Otwórz Panel Administratora"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-pink-400" />
            <span className="hidden md:inline">Panel admina</span>
          </button>
        )}

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (unreadCount > 0) setUnreadCount(0);
            }}
            className="relative p-2.5 rounded-xl bg-[#0D1324] border border-white/[0.08] hover:border-purple-500/40 text-slate-300 hover:text-white transition-all"
            aria-label="Powiadomienia"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500" />
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 rounded-2xl bg-[#0D1324] border border-white/[0.08] shadow-2xl shadow-black/80 z-50 overflow-hidden backdrop-blur-2xl">
              <div className="px-4 py-3 border-b border-white/[0.08] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Powiadomienia
                  </span>
                </div>
                <button
                  onClick={() => setUnreadCount(0)}
                  className="text-[10px] text-purple-400 hover:underline flex items-center gap-1"
                >
                  <CheckCheck className="w-3 h-3" /> Przeczytane
                </button>
              </div>

              <div className="divide-y divide-white/[0.05] max-h-64 overflow-y-auto">
                {notificationsList.length === 0 ? (
                  <div className="py-8 text-center text-slate-500 text-xs">
                    Brak powiadomień
                  </div>
                ) : (
                  notificationsList.map((n) => (
                    <div key={n.id} className="p-3 hover:bg-white/[0.02] transition-colors">
                      <p className="text-xs text-slate-200 font-medium">{n.title}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Badge */}
        <div className="flex items-center gap-3 pl-2 border-l border-white/[0.08]">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 via-indigo-500 to-pink-500 p-[1.5px] shadow-md shadow-purple-500/20">
              <img
                src={currentUser.avatar}
                alt={currentUser.username}
                className="w-full h-full object-cover rounded-[9px]"
              />
            </div>
            {/* Level badge */}
            <div className="absolute -bottom-1 -right-1.5 px-1.5 py-0.2 bg-[#05070D] border border-purple-400/60 rounded-md text-[9px] font-mono font-bold text-purple-300">
              {currentUser.level}
            </div>
          </div>

          <div className="hidden xl:flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white tracking-wide">{currentUser.username}</span>
              <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30">
                {currentUser.role}
              </span>
            </div>
            {/* XP progress bar */}
            <div className="flex items-center gap-2 mt-1">
              <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                  style={{ width: `${(currentUser.xp / currentUser.xpRequired) * 100}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                LVL {currentUser.level}
              </span>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={logout}
            title="Wyloguj się"
            className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-rose-500/15 border border-white/[0.08] hover:border-rose-500/30 text-slate-400 hover:text-rose-400 transition-colors ml-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
