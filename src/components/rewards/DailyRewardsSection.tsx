import React from 'react';
import { useGame } from '../../context/GameContext';
import { Gift, Coins, Gem, Sparkles, Check, Flame, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';

export const DailyRewardsSection: React.FC = () => {
  const { dailyRewards, claimDailyReward, isDailyClaimed } = useGame();

  const handleClaim = () => {
    claimDailyReward();
    confetti({
      particleCount: 85,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#22d3ee', '#ec4899', '#a855f7', '#facc15'],
    });
  };

  return (
    <section id="daily-rewards" className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#101526] via-[#0C101D] to-[#05070D] border border-white/[0.08] p-6 sm:p-8">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-pink-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-pink-500/25">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-black text-white tracking-wide">
                Nagrody dzienne i passa
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-pink-500/20 text-pink-300 border border-pink-500/30 flex items-center gap-1">
                <Flame className="w-3 h-3 text-pink-400" />
                PASSA: 4 DNI
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Loguj się codziennie, aby odbierać darmowe monety, gemy oraz odblokować Kosmiczną Skrzynię
            </p>
          </div>
        </div>

        {/* Claim CTA Button */}
        <button
          onClick={handleClaim}
          disabled={isDailyClaimed}
          className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg ${
            isDailyClaimed
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-default'
              : 'bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 hover:from-pink-500 hover:to-purple-500 text-white shadow-pink-600/30 hover:scale-105 active:scale-95'
          }`}
        >
          {isDailyClaimed ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Odebrano nagrodę (+5 gemów)</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse" />
              <span>Odbierz nagrodę (+5 gemów)</span>
            </>
          )}
        </button>
      </div>

      {/* 7-Days Timeline Grid */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
        {dailyRewards.map((item) => {
          return (
            <div
              key={item.day}
              className={`relative flex flex-col items-center justify-between p-4 rounded-2xl border transition-all ${
                item.claimed
                  ? 'bg-[#0B0E18]/80 border-emerald-500/30 text-slate-400'
                  : item.isToday && !isDailyClaimed
                  ? 'bg-gradient-to-b from-purple-900/40 to-[#0D1324] border-pink-500/60 shadow-[0_0_25px_rgba(236,72,153,0.25)] scale-105'
                  : 'bg-[#090D18]/70 border-white/[0.08] text-slate-400'
              }`}
            >
              {/* Day Header */}
              <div className="w-full flex items-center justify-between text-[11px] font-bold">
                <span className={item.isToday ? 'text-pink-400' : 'text-slate-400'}>
                  Dzień {item.day}
                </span>
                {item.claimed ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : !item.isToday ? (
                  <Lock className="w-3 h-3 text-slate-600" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-pink-500 animate-ping" />
                )}
              </div>

              {/* Reward Icon Graphic */}
              <div className="my-3 flex flex-col items-center justify-center">
                {item.special ? (
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 flex items-center justify-center shadow-lg shadow-amber-500/30 animate-pulse">
                    <div className="w-full h-full bg-[#0B0F1D] rounded-[10px] flex items-center justify-center text-amber-300">
                      <Gift className="w-6 h-6" />
                    </div>
                  </div>
                ) : item.gems ? (
                  <div className="w-10 h-10 rounded-full bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <Gem className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Coins className="w-5 h-5" />
                  </div>
                )}
              </div>

              {/* Reward Value */}
              <div className="text-center">
                {item.coins && (
                  <span className="text-xs font-mono font-black text-amber-300 block">
                    +{item.coins} monet
                  </span>
                )}
                {item.gems && (
                  <span className="text-xs font-mono font-black text-cyan-400 flex items-center justify-center gap-0.5">
                    +{item.gems} gemów
                  </span>
                )}
                {item.special && (
                  <span className="text-[9px] font-bold uppercase text-amber-400 block mt-0.5">
                    Kosmiczna Skrzynia
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
