import React from 'react';
import { useGame } from '../../context/GameContext';
import { Radio, Coins } from 'lucide-react';

export const LiveWinsFeed: React.FC = () => {
  const { liveWins } = useGame();

  return (
    <div className="w-full bg-[#05070D]/95 border-b border-white/[0.08] py-2.5 px-4 overflow-hidden relative">
      <div className="max-w-[1920px] mx-auto flex items-center gap-3">
        {/* Live Indicator Tag */}
        <div className="shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-950/40 border border-purple-500/20 shadow-sm">
          <Radio className="w-3.5 h-3.5 text-pink-500 animate-pulse" />
          <span className="text-[11px] font-black uppercase tracking-wider bg-gradient-to-r from-purple-300 to-pink-400 bg-clip-text text-transparent">
            Ostatnie wygrane
          </span>
        </div>

        {/* Scrolling Wins Stream */}
        <div className="flex-1 overflow-x-auto no-scrollbar scroll-smooth flex items-center gap-3 py-0.5">
          {liveWins.map((win) => {
            const isHighMult = win.multiplier >= 10.0;

            return (
              <div
                key={win.id}
                className={`shrink-0 flex items-center gap-3 px-3 py-1.5 rounded-xl bg-[#0D1324]/80 hover:bg-[#131B32] border transition-all duration-200 cursor-pointer ${
                  isHighMult
                    ? 'border-pink-500/40 shadow-[0_0_15px_-3px_rgba(236,72,153,0.3)]'
                    : 'border-white/[0.08] hover:border-purple-500/30'
                }`}
              >
                {/* Winner avatar bubble */}
                <div className="relative shrink-0">
                  <img
                    src={win.user.avatar}
                    alt={win.user.username}
                    className="w-6 h-6 rounded-full object-cover border border-white/10"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&h=60&fit=crop&crop=faces';
                    }}
                  />
                </div>

                {/* Win details */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-200 truncate max-w-[85px]">
                    {win.user.username}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {win.game}
                  </span>
                </div>

                {/* Multiplier & Coins Won */}
                <div className="flex items-center gap-2 pl-1 border-l border-white/[0.08]">
                  <span className={`text-[11px] font-mono font-black ${isHighMult ? 'text-pink-400' : 'text-cyan-400'}`}>
                    {win.multiplier.toFixed(2)}x
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-300 flex items-center gap-0.5">
                    <Coins className="w-3 h-3 text-amber-400" />
                    +{win.winAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
