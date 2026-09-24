import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GameProvider, useGame } from './context/GameContext';
import { AuthPage } from './components/auth/AuthPage';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { Footer } from './components/layout/Footer';
import { LiveWinsFeed } from './components/live/LiveWinsFeed';
import { HeroBanner } from './components/hero/HeroBanner';
import { GamesGrid } from './components/games/GamesGrid';
import { DailyRewardsSection } from './components/rewards/DailyRewardsSection';
import { InventorySection } from './components/inventory/InventorySection';
import { LeaderboardSection } from './components/extra/LeaderboardSection';
import { AchievementsSection } from './components/achievements/AchievementsSection';
import { ProfileSection } from './components/profile/ProfileSection';
import { AdminModal } from './components/admin/AdminModal';
import { GemShop } from './components/shop/GemShop';
import { CasesSection } from './components/cases/CasesSection';
import { Hexagon } from 'lucide-react';
import type { User } from './types';

const MainDashboard: React.FC = () => {
  const { activeTab, setActiveTab } = useGame();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const scrollToSection = (sectionId: string) => {
    setActiveTab('home');
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'games':
        return <GamesGrid searchFilter={searchQuery} />;
      case 'cases':
        return <CasesSection />;
      case 'inventory':
        return <InventorySection />;
      case 'shop':
        return <GemShop />;
      case 'leaderboard':
        return <LeaderboardSection />;
      case 'achievements':
        return <AchievementsSection />;
      case 'rewards':
        return <DailyRewardsSection />;
      case 'profile':
        return <ProfileSection />;
      case 'home':
      default:
        return (
          <>
            {/* Hero Section */}
            <HeroBanner
              onPlayNowClick={() => scrollToSection('games-section')}
              onClaimBonusClick={() => scrollToSection('daily-rewards')}
            />

            {/* Popular Games Section */}
            <GamesGrid searchFilter={searchQuery} />

            {/* Cases Opening Section */}
            <CasesSection />

            {/* Daily Rewards Section */}
            <DailyRewardsSection />

            {/* Inventory Section */}
            <InventorySection />

            {/* Leaderboard Section */}
            <LeaderboardSection />

            {/* Achievements Section */}
            <AchievementsSection />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#05070D] text-slate-100 flex">
      {/* Left Navigation Sidebar */}
      <Sidebar
        isOpenMobile={isMobileMenuOpen}
        setIsOpenMobile={setIsMobileMenuOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Sticky Topbar */}
        <Topbar
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Real-time Live Wins Feed */}
        <LiveWinsFeed />

        {/* Main Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-10 sm:space-y-14">
          {renderActiveView()}
        </main>

        {/* Footer */}
        <Footer />
      </div>

      {/* Admin Panel Modal Overlay (90% width x 90% height) */}
      <AdminModal />
    </div>
  );
};

interface MainDashboardWithMaintenanceProps {
  currentUser: User | null;
}

const MainDashboardWithMaintenance: React.FC<MainDashboardWithMaintenanceProps> = ({ currentUser }) => {
  const { maintenanceMode } = useGame();
  const isStaff = currentUser?.role === 'OWNER' || currentUser?.role === 'ADMIN' || currentUser?.role === 'MODERATOR';

  return (
    <>
      <MainDashboard />
      {maintenanceMode && !isStaff && (
        <div className="fixed inset-0 z-[9999] bg-[#05070D]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 shadow-2xl shadow-amber-500/30 p-[2px] mb-6">
            <div className="w-full h-full bg-[#090D18] rounded-[14px] flex items-center justify-center">
              <Hexagon className="w-10 h-10 text-amber-400 fill-amber-400/20" />
            </div>
          </div>
          <h1 className="text-3xl font-black text-white tracking-wider mb-2">
            Przerwa techniczna
          </h1>
          <p className="text-slate-400 max-w-sm leading-relaxed text-sm">
            Platforma jest chwilowo niedostępna. Pracujemy nad ulepszeniami — wróć za chwilę!
          </p>
          <div className="mt-8 flex items-center gap-2 text-xs text-amber-400/60 font-mono">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            JACKPOT · Maintenance Mode
          </div>
        </div>
      )}
    </>
  );
};

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#05070D] flex flex-col items-center justify-center p-4">
        <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-pink-500 shadow-2xl shadow-purple-500/30 p-[2px] mb-4 animate-pulse">
          <div className="w-full h-full bg-[#090D18] rounded-[14px] flex items-center justify-center">
            <Hexagon className="w-8 h-8 text-purple-400 fill-purple-400/20" />
          </div>
        </div>
        <div className="flex items-center gap-1.5 mb-2">
          <span className="font-black text-xl tracking-wider text-white">JACK</span>
          <span className="font-black text-xl tracking-wider bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            POT
          </span>
        </div>
        <p className="text-xs text-slate-500 font-mono">Ładowanie platformy...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <GameProvider>
      <MainDashboardWithMaintenance currentUser={user} />
    </GameProvider>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
