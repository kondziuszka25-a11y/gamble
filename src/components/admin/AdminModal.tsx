import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { AdminSidebar } from './AdminSidebar';
import type { AdminTab } from './AdminSidebar';
import { AdminDashboard } from './AdminDashboard';
import { AdminUsers } from './AdminUsers';
import { AdminEconomy } from './AdminEconomy';
import { AdminXP } from './AdminXP';
import { AdminLogs } from './AdminLogs';
import { AdminSettings } from './AdminSettings';
import { X, SlidersHorizontal } from 'lucide-react';

export const AdminModal: React.FC = () => {
  const { isAdminModalOpen, closeAdminModal, currentUser } = useGame();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  if (!isAdminModalOpen) return null;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'users':
        return <AdminUsers />;
      case 'economy':
        return <AdminEconomy />;
      case 'xp':
        return <AdminXP />;
      case 'games':
        return <AdminSettings mode="games" />;
      case 'logs':
        return <AdminLogs />;
      case 'settings':
      default:
        return <AdminSettings mode="settings" />;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-fade-in"
      onClick={closeAdminModal}
    >
      {/* 90% Width & 90% Height Main Panel */}
      <div
        className="relative w-[92vw] h-[90vh] rounded-3xl bg-[#0B0F1D] border border-purple-500/40 shadow-2xl shadow-purple-950/40 flex overflow-hidden"
        style={{
          boxShadow: '0 0 50px -10px rgba(168, 85, 247, 0.25)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Admin Sidebar */}
        <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#070A14]/90 overflow-hidden">
          {/* Top Bar inside Admin Modal */}
          <div className="h-16 px-6 border-b border-white/[0.08] flex items-center justify-between shrink-0 bg-[#090D18]/70">
            <div className="flex items-center gap-3">
              <SlidersHorizontal className="w-5 h-5 text-pink-400" />
              <div>
                <h2 className="text-base font-black text-white uppercase tracking-wider">
                  Panel Administratora • {activeTab.toUpperCase()}
                </h2>
                <span className="text-[10px] text-slate-400">
                  Zalogowany: <strong className="text-purple-300">{currentUser.username}</strong> ({currentUser.role})
                </span>
              </div>
            </div>

            <button
              onClick={closeAdminModal}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors flex items-center gap-1 text-xs font-semibold"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Zamknij</span>
            </button>
          </div>

          {/* Tab Body Scrollable Container */}
          <div className="flex-1 p-6 overflow-y-auto">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};
