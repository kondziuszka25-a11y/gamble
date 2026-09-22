import React from 'react';
import { useGame } from '../../context/GameContext';
import {
  Coins,
  Gem,
  CheckCircle2,
  XCircle,
  History,
  ShieldCheck,
} from 'lucide-react';

export const ProfileSection: React.FC = () => {
  const { currentUser, gameHistory } = useGame();

  const totalGames = gameHistory.length;
  const wins = gameHistory.filter((g) => g.result === 'WIN').length;
  const losses = gameHistory.filter((g) => g.result === 'LOSS').length;
  const biggestWin = gameHistory.reduce((max, g) => Math.max(max, g.payout || 0), 0);
  const highestMult = gameHistory.reduce((max, g) => Math.max(max, g.multiplier || 0), 0);

  return (
    <section id="profile-section" className="space-y-8">
      {/* Profile Header Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#12182B] via-[#0D1324] to-[#05070D] border border-white/[0.08] p-6 sm:p-8">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar with Ring */}
          <div className="relative shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-purple-500 via-pink-500 to-amber-400 p-[2px] shadow-2xl shadow-purple-600/30">
              <img
                src={currentUser.avatar}
                alt={currentUser.username}
                className="w-full h-full object-cover rounded-[22px]"
              />
            </div>
            <div className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-lg bg-[#05070D] border border-purple-400/60 text-xs font-mono font-black text-purple-300 shadow-md">
              LVL {currentUser.level}
            </div>
          </div>

          {/* User Details */}
          <div className="flex-1 text-center md:text-left space-y-3">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <h2 className="text-2xl sm:text-3xl font-black text-white">{currentUser.username}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-pink-500/20 text-pink-300 border border-pink-500/30">
                {currentUser.role}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Zweryfikowany
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Konto zarejestrowane: <strong className="text-slate-200">{currentUser.registeredAt}</strong> • Ostatnie logowanie: <strong className="text-slate-200">{currentUser.lastLogin}</strong>
            </p>

            {/* XP Level Bar */}
            <div className="max-w-md pt-2 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Postęp do Poziomu {currentUser.level + 1}</span>
                <span className="text-purple-300 font-mono font-bold">
                  {currentUser.xp.toLocaleString()} / {currentUser.xpRequired.toLocaleString()} XP
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 rounded-full"
                  style={{ width: `${(currentUser.xp / currentUser.xpRequired) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Balances Right Box */}
          <div className="flex flex-row md:flex-col gap-3 w-full md:w-auto shrink-0 justify-center">
            <div className="p-3.5 rounded-2xl bg-[#090D18] border border-amber-500/20 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                <Coins className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Saldo monet</span>
                <span className="text-sm font-mono font-black text-amber-300">
                  {currentUser.coins.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#090D18] border border-cyan-500/20 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Gem className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Saldo gemów</span>
                <span className="text-sm font-mono font-black text-cyan-300">
                  {currentUser.gems}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Performance KPIs — computed from real game history */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded-2xl bg-[#0D1324] border border-white/[0.08]">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Rozegrane gry</span>
          <span className="text-xl font-mono font-black text-white mt-1 block">{totalGames}</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0D1324] border border-white/[0.08]">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Wygrane gry</span>
          <span className="text-xl font-mono font-black text-emerald-400 mt-1 block">{wins}</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0D1324] border border-white/[0.08]">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Przegrane gry</span>
          <span className="text-xl font-mono font-black text-rose-400 mt-1 block">{losses}</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0D1324] border border-white/[0.08]">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Największa wygrana</span>
          <span className="text-xl font-mono font-black text-amber-300 mt-1 block">
            {biggestWin > 0 ? `+${biggestWin.toLocaleString()}` : '—'}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0D1324] border border-white/[0.08]">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Najwyższy mnożnik</span>
          <span className="text-xl font-mono font-black text-pink-400 mt-1 block">
            {highestMult > 0 ? `${highestMult.toFixed(2)}x` : '—'}
          </span>
        </div>
      </div>

      {/* Game History Table */}
      <div className="rounded-3xl bg-[#0D1324] border border-white/[0.08] p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <History className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-black text-white">Historia Ostatnich Gier</h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            {totalGames > 0 ? `Ostatnie ${Math.min(totalGames, 20)} sesji` : 'Brak historii'}
          </span>
        </div>

        {totalGames === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            Nie rozegrano jeszcze żadnych gier. Zagraj coś!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/[0.08] text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-3">Gra</th>
                  <th className="py-3 px-3">Stawka</th>
                  <th className="py-3 px-3">Mnożnik</th>
                  <th className="py-3 px-3">Wynik</th>
                  <th className="py-3 px-3">Wygrana</th>
                  <th className="py-3 px-3 text-right">Czas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {gameHistory.map((entry) => (
                  <tr key={entry.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-3 font-bold text-white">{entry.game}</td>
                    <td className="py-3.5 px-3 font-mono text-slate-300">
                      {entry.betAmount.toLocaleString()} monet
                    </td>
                    <td className="py-3.5 px-3 font-mono font-bold text-cyan-400">
                      {entry.multiplier > 0 ? `${entry.multiplier.toFixed(2)}x` : '—'}
                    </td>
                    <td className="py-3.5 px-3">
                      {entry.result === 'WIN' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" /> WYGRANA
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black bg-rose-500/20 text-rose-400 border border-rose-500/30">
                          <XCircle className="w-3 h-3" /> PRZEGRANA
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 font-mono font-black text-amber-300">
                      {entry.payout > 0 ? `+${entry.payout.toLocaleString()}` : '0'}
                    </td>
                    <td className="py-3.5 px-3 text-right text-slate-400">{entry.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};
