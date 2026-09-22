import React from 'react';
import {
  LayoutDashboard,
  Users,
  Coins,
  Award,
  Gamepad2,
  FileText,
  Shield,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { useGame } from '../../context/GameContext';

export type AdminTab =
  | 'dashboard'
  | 'users'
  | 'economy'
  | 'xp'
  | 'games'
  | 'logs'
  | 'settings';

interface AdminSidebarProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, setActiveTab }) => {
  const { currentUser } = useGame();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Użytkownicy', icon: Users },
    { id: 'economy', label: 'Ekonomia', icon: Coins },
    { id: 'xp', label: 'XP i poziomy', icon: Award },
    { id: 'games', label: 'Gry', icon: Gamepad2 },
    { id: 'logs', label: 'Logi', icon: FileText },
    { id: 'settings', label: 'Administracja', icon: Shield },
  ];

  return (
    <aside className="w-64 bg-[#090D18] border-r border-white/[0.08] flex flex-col p-4 shrink-0">
      {/* Admin Branding */}
      <div className="flex items-center gap-3 p-2 pb-4 border-b border-white/[0.08] mb-4">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center text-white shadow-md shadow-purple-600/30">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-white block">
            CENTRALNY ADMIN
          </span>
          <span className="text-[10px] text-pink-400 font-mono font-bold">
            Uprawnienia: {currentUser.role}
          </span>
        </div>
      </div>

      {/* Menu Links */}
      <nav className="space-y-1.5 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          // Permission restriction for MODERATOR
          const isRestrictedForMod =
            currentUser.role === 'MODERATOR' &&
            (item.id === 'economy' || item.id === 'xp' || item.id === 'settings');

          if (isRestrictedForMod) return null;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as AdminTab)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-purple-600/30 to-pink-600/20 text-white border border-purple-500/40 shadow-lg shadow-purple-900/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-pink-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {isActive && <ChevronRight className="w-4 h-4 text-purple-400" />}
            </button>
          );
        })}
      </nav>

      {/* Admin Footnote */}
      <div className="pt-4 border-t border-white/[0.08] text-[10px] text-slate-500 text-center">
        Jackpot Audit Engine v2.6.4
      </div>
    </aside>
  );
};
