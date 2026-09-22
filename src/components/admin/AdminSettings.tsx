import React, { useState } from 'react';
import { GAMES_LIST } from '../../data/mockData';
import {
  Shield,
  CheckCircle2,
  Server,
  Lock,
  Gamepad2,
} from 'lucide-react';

interface AdminSettingsProps {
  mode?: 'games' | 'settings';
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ mode = 'settings' }) => {
  const [gamesState, setGamesState] = useState<Record<string, boolean>>({
    crash: true,
    mines: true,
    coinflip: true,
    jackpot: true,
    wheel: true,
    dice: true,
    tower: true,
    plinko: true,
  });

  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(false);
  const [fairnessSha, setFairnessSha] = useState<string>('sha256-standard-v2.6.4');
  const [notification, setNotification] = useState<string | null>(null);

  const toggleGame = (id: string) => {
    setGamesState((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
    setNotification(`Zaktualizowano status dostępności gry ${id.toUpperCase()}`);
    setTimeout(() => setNotification(null), 3000);
  };

  if (mode === 'games') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <Gamepad2 className="w-5 h-5 text-purple-400" />
            <div>
              <h3 className="text-base font-black text-white uppercase tracking-wider">
                Konfiguracja Minigier Platformy
              </h3>
              <p className="text-xs text-slate-400">
                Włączanie, wyłączanie oraz monitorowanie parametrów 8 minigier
              </p>
            </div>
          </div>
        </div>

        {notification && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{notification}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {GAMES_LIST.map((game) => {
            const isEnabled = gamesState[game.id] ?? true;

            return (
              <div
                key={game.id}
                className="p-4 rounded-2xl bg-[#090D18] border border-white/[0.08] flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">{game.name}</h4>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-white/10 text-slate-300">
                      {game.maxMultiplier}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">{game.activePlayers} aktywnych graczy</span>
                </div>

                <button
                  onClick={() => toggleGame(game.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isEnabled
                      ? 'bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300'
                  }`}
                >
                  {isEnabled ? 'Dostępna (ON)' : 'Wyłączona (OFF)'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-2.5 pb-3 border-b border-white/[0.08]">
        <Shield className="w-5 h-5 text-purple-400" />
        <div>
          <h3 className="text-base font-black text-white uppercase tracking-wider">
            Uprawnienia i Ustawienia Platformy
          </h3>
          <p className="text-xs text-slate-400">
            Zarządzanie poziomem zabezpieczeń i globalnymi parametrami Jackpot
          </p>
        </div>
      </div>

      {/* Role Matrix */}
      <div className="p-5 rounded-2xl bg-[#090D18] border border-white/[0.08] space-y-3">
        <h4 className="text-xs font-bold uppercase text-white tracking-wider flex items-center gap-2">
          <Lock className="w-4 h-4 text-cyan-400" /> Matryca Uprawnień Ról
        </h4>

        <div className="space-y-2 text-xs">
          <div className="p-3 rounded-xl bg-[#0D1324] border border-white/5 flex items-center justify-between">
            <div>
              <span className="font-bold text-pink-400 block">OWNER</span>
              <span className="text-[11px] text-slate-400">Pełny dostęp do platformy, uprawnień ról, bazy i ekonomii.</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-pink-500/20 text-pink-300 border border-pink-500/30">
              POZIOM 4
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#0D1324] border border-white/5 flex items-center justify-between">
            <div>
              <span className="font-bold text-purple-400 block">ADMIN</span>
              <span className="text-[11px] text-slate-400">Zarządzanie graczami, saldami, reset hasła, XP oraz audyt logów.</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/30">
              POZIOM 3
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#0D1324] border border-white/5 flex items-center justify-between">
            <div>
              <span className="font-bold text-cyan-400 block">MODERATOR</span>
              <span className="text-[11px] text-slate-400">Podgląd graczy, nakładanie i zdejmowanie blokad kont (bany).</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              POZIOM 2
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#0D1324] border border-white/5 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-300 block">USER</span>
              <span className="text-[11px] text-slate-400">Standardowy dostęp do minigier, ekwipunku, rankingu i nagród.</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-slate-800 text-slate-400">
              POZIOM 1
            </span>
          </div>
        </div>
      </div>

      {/* Security & Maintenance Switch */}
      <div className="p-5 rounded-2xl bg-[#090D18] border border-white/[0.08] space-y-4">
        <h4 className="text-xs font-bold uppercase text-white tracking-wider flex items-center gap-2">
          <Server className="w-4 h-4 text-emerald-400" /> Parametry Serwera
        </h4>

        <div className="flex items-center justify-between p-3 rounded-xl bg-[#0D1324] border border-white/5">
          <div>
            <span className="text-xs font-bold text-white block">Tryb prac konserwacyjnych (Maintenance)</span>
            <span className="text-[11px] text-slate-400">Blokuje wstęp zwykłym graczom, wpuszcza tylko kadrę.</span>
          </div>
          <button
            onClick={() => setMaintenanceMode(!maintenanceMode)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
              maintenanceMode
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'bg-slate-800 text-slate-400 border-white/10'
            }`}
          >
            {maintenanceMode ? 'WŁĄCZONY' : 'WYŁĄCZONY'}
          </button>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-300 block mb-1">
            Aktywny algorytm Provably Fair:
          </label>
          <input
            type="text"
            value={fairnessSha}
            onChange={(e) => setFairnessSha(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-[#0D1324] border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>
    </div>
  );
};
