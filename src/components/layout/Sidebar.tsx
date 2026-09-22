import React from 'react';
import {
  LayoutDashboard,
  Gamepad2,
  Briefcase,
  Trophy,
  Award,
  Gift,
  User,
  ShieldCheck,
  ShieldAlert,
  Volume2,
  VolumeX,
  Sparkles,
  ChevronRight,
  Hexagon,
  ShoppingBag,
  Gem,
  Package,
} from 'lucide-react';
import { useGame } from '../../context/GameContext';

interface SidebarProps {
  isOpenMobile?: boolean;
  setIsOpenMobile?: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpenMobile = false,
  setIsOpenMobile,
}) => {
  const {
    currentUser,
    users,
    activeTab,
    setActiveTab,
    inventory,
    isSoundEnabled,
    toggleSound,
    openAdminModal,
  } = useGame();

  const isStaff = currentUser.role === 'ADMIN' || currentUser.role === 'OWNER';

  const navItems = [
    { id: 'home', label: 'Strona główna', icon: LayoutDashboard },
    { id: 'games', label: 'Gry', icon: Gamepad2, badge: 'HOT' },
    { id: 'cases', label: 'Skrzynki', icon: Package, badge: 'DROP' },
    { id: 'inventory', label: 'Ekwipunek', icon: Briefcase, count: inventory.length },
    { id: 'shop', label: 'Sklep Gemów', icon: ShoppingBag, gemCount: currentUser.gems },
    { id: 'leaderboard', label: 'Ranking', icon: Trophy },
    { id: 'achievements', label: 'Osiągnięcia', icon: Award },
    { id: 'rewards', label: 'Nagrody dzienne', icon: Gift, badge: 'BONUS' },
    { id: 'profile', label: 'Profil', icon: User },
  ];


  const handleNavClick = (id: string) => {
    setActiveTab(id);
    if (setIsOpenMobile) setIsOpenMobile(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpenMobile && setIsOpenMobile(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#090D18]/95 backdrop-blur-xl border-r border-white/[0.08] flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo Brand */}
        <div className="h-20 px-6 flex items-center gap-3 border-b border-white/[0.08]">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-purple-600 via-indigo-600 to-pink-500 shadow-lg shadow-purple-500/25 p-[2px]">
            <div className="w-full h-full bg-[#090D18] rounded-[10px] flex items-center justify-center">
              <Hexagon className="w-6 h-6 text-purple-400 fill-purple-400/20" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500" />
            </span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-xl tracking-wider text-white">JACK</span>
              <span className="font-black text-xl tracking-wider bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                POT
              </span>
            </div>
            <span className="text-[10px] tracking-widest text-slate-400 uppercase font-semibold">
              Casino Gaming Hub
            </span>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            Menu Platformy
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600/20 via-pink-500/10 to-transparent text-white border border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.15)]'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-purple-500/20 text-purple-300'
                        : 'bg-white/[0.02] text-slate-400 group-hover:text-purple-400 group-hover:bg-purple-500/10'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`tracking-wide ${isActive ? 'font-semibold' : ''}`}>
                    {item.label}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        item.badge === 'HOT'
                          ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-black shadow-sm'
                          : 'bg-pink-500/20 text-pink-300 border border-pink-500/30'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {typeof item.count === 'number' && (
                    <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md font-mono">
                      {item.count}
                    </span>
                  )}
                  {'gemCount' in item && typeof item.gemCount === 'number' && (
                    <span className="flex items-center gap-1 text-xs bg-cyan-900/40 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-md font-mono">
                      <Gem className="w-2.5 h-2.5" />
                      {item.gemCount}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-4 h-4 text-purple-400" />}
                </div>
              </button>
            );
          })}

          {/* Admin Panel Option in Sidebar (Only for ADMIN / OWNER) */}
          {isStaff && (
            <div className="pt-3">
              <div className="px-3 pb-2 text-[11px] font-bold tracking-wider text-purple-400 uppercase flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-pink-400" />
                Zarządzanie
              </div>
              <button
                onClick={openAdminModal}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-purple-900/30 to-pink-900/20 text-purple-200 border border-purple-500/30 hover:border-purple-500/60 shadow-lg shadow-purple-900/20 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/20 text-purple-300 group-hover:scale-105 transition-transform">
                    <ShieldCheck className="w-4 h-4 text-pink-400" />
                  </div>
                  <span className="tracking-wide">Panel administratora</span>
                </div>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-300 border border-pink-500/30">
                  {currentUser.role}
                </span>
              </button>
            </div>
          )}

          {/* Daily streak promotion box */}
          <div className="pt-4">
            <div className="p-4 rounded-2xl bg-gradient-to-b from-purple-950/40 to-slate-900/60 border border-purple-500/20 relative overflow-hidden">
              <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Bonus Dzienny Aktywny</span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                Odbierz nagrodę dnia i utrzymuj passę logowania!
              </p>
              <button
                onClick={() => handleNavClick('rewards')}
                className="mt-3 w-full py-1.5 text-xs font-bold text-center bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 rounded-lg transition-colors"
              >
                Odbierz bonus
              </button>
            </div>
          </div>
        </div>

        {/* Footer controls & Server Stats */}
        <div className="p-4 border-t border-white/[0.08] space-y-3 bg-[#05070D]">
          {/* Online stats */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="font-mono font-medium text-slate-300">{users.length} Online</span>
            </div>
            <div
              className="flex items-center gap-1 text-slate-400 hover:text-purple-300 transition-colors"
              title="Algorytm Provably Fair"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-[11px]">Fair Play</span>
            </div>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[#0D1324] border border-white/[0.08] hover:border-purple-500/30 text-xs text-slate-400 hover:text-white transition-all"
          >
            <div className="flex items-center gap-2">
              {isSoundEnabled ? (
                <Volume2 className="w-4 h-4 text-cyan-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
              <span>Dźwięki</span>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                isSoundEnabled ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-500'
              }`}
            >
              {isSoundEnabled ? 'WŁ.' : 'WYŁ.'}
            </span>
          </button>
        </div>
      </aside>
    </>
  );
};
