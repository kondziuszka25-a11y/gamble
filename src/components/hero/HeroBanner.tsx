import React from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Flame,
  Gift,
  Gamepad2,
} from 'lucide-react';
import { useGame } from '../../context/GameContext';

interface HeroBannerProps {
  onPlayNowClick: () => void;
  onClaimBonusClick: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onPlayNowClick,
  onClaimBonusClick,
}) => {
  const { liveWins } = useGame();
  // Use total live wins count as a live-updated platform games counter
  const platformGamesPlayed = liveWins.length;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#12182B] via-[#0D1324] to-[#05070D] border border-white/[0.08] p-6 sm:p-10 lg:p-12 shadow-2xl shadow-purple-950/20">
      {/* Background Neon Glow Orbs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 -right-20 w-96 h-96 bg-pink-600/15 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute -bottom-20 left-1/3 w-80 h-80 bg-cyan-600/15 rounded-full blur-[90px] pointer-events-none" />

      {/* Cyber Grid Texture */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Hero Text & Actions */}
        <div className="lg:col-span-7 space-y-6">
          {/* Top Tag Badges */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              CYBER MINIGAMES HUB
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              100% Wirtualna Waluta
            </span>
          </div>

          {/* Main Headline */}
          <div>
            <span className="text-xs sm:text-sm font-mono font-bold uppercase tracking-widest text-purple-400 block mb-1">
              JACKPOT
            </span>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.15]">
              Graj. Ryzykuj.{' '}
              <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-amber-300 bg-clip-text text-transparent">
                Wygrywaj.
              </span>
            </h1>
          </div>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed font-normal">
            Sprawdź swoje szczęście w neonowym świecie minigier z wysokimi mnożnikami.
            Graj w Crash, Miny, Plinko czy Jackpot w oparciu o weryfikowalny algorytm Provably Fair.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onPlayNowClick}
              className="group relative inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white font-bold text-sm sm:text-base shadow-xl shadow-purple-600/30 hover:shadow-purple-600/50 hover:scale-[1.02] active:scale-95 transition-all duration-300"
            >
              <Gamepad2 className="w-4 h-4 text-white group-hover:rotate-12 transition-transform" />
              <span>Graj teraz</span>
              <ArrowRight className="w-4 h-4 text-purple-200 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onClaimBonusClick}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] hover:border-purple-500/30 text-white font-semibold text-sm sm:text-base transition-all active:scale-95"
            >
              <Gift className="w-4 h-4 text-pink-400" />
              <span>Bonus dzienny</span>
            </button>
          </div>

          {/* Platform Stats Counters */}
          <div className="pt-4 grid grid-cols-3 gap-3 border-t border-white/[0.08]">
            <div>
              <span className="text-xs text-slate-400 block font-medium">Rozegrane gry</span>
              <span className="text-base sm:text-lg font-black font-mono text-white tracking-wider">
                {platformGamesPlayed > 0 ? platformGamesPlayed.toLocaleString() : '—'}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">Najwyższy mnożnik</span>
              <span className="text-base sm:text-lg font-black font-mono text-pink-400 tracking-wider flex items-center gap-1">
                <Flame className="w-4 h-4 text-pink-500" />
                500x
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">Współczynnik RTP</span>
              <span className="text-base sm:text-lg font-black font-mono text-cyan-300 tracking-wider flex items-center gap-1">
                <Zap className="w-4 h-4 text-cyan-400" />
                99.0% Fair
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Abstract Neon Portal / Cyber Casino Vault Graphic */}
        <div className="lg:col-span-5 relative flex items-center justify-center min-h-[300px]">
          <div className="relative w-full max-w-sm flex items-center justify-center">
            {/* Glowing Ground Disk */}
            <div className="absolute -bottom-4 w-4/5 h-16 bg-gradient-to-r from-purple-600/30 via-pink-600/30 to-cyan-500/30 rounded-full blur-2xl pointer-events-none" />

            {/* Cyber Vault Portal Core (No weapons) */}
            <div className="relative z-10 w-64 h-64 flex items-center justify-center">
              <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_0_30px_rgba(168,85,247,0.4)]">
                <defs>
                  <linearGradient id="portal-ring" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#c084fc" />
                    <stop offset="50%" stopColor="#ec4899" />
                    <stop offset="100%" stopColor="#22d3ee" />
                  </linearGradient>
                  <linearGradient id="vault-core" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#090D18" />
                    <stop offset="100%" stopColor="#1E1B4B" />
                  </linearGradient>
                </defs>

                {/* Outer rotating circuit ring */}
                <circle cx="100" cy="100" r="90" stroke="url(#portal-ring)" strokeWidth="2.5" strokeDasharray="8 6" fill="none" opacity="0.8" />
                <circle cx="100" cy="100" r="78" stroke="#ffffff" strokeWidth="1" strokeDasharray="3 8" fill="none" opacity="0.4" />

                {/* Octagonal Cyber Vault Gate */}
                <polygon
                  points="65,25 135,25 175,65 175,135 135,175 65,175 25,135 25,65"
                  fill="url(#vault-core)"
                  stroke="url(#portal-ring)"
                  strokeWidth="3"
                />

                {/* Inner Hexagon Core */}
                <polygon
                  points="100,45 150,75 150,125 100,155 50,125 50,75"
                  fill="#05070D"
                  stroke="#22d3ee"
                  strokeWidth="2"
                />

                {/* Center Neon Crystal / Star */}
                <circle cx="100" cy="100" r="24" fill="#a855f7" filter="drop-shadow(0 0 10px #ec4899)" />
                <polygon points="100,80 106,94 120,100 106,106 100,120 94,106 80,100 94,94" fill="#ffffff" />

                {/* Corner Bolts */}
                <circle cx="65" cy="25" r="3.5" fill="#facc15" />
                <circle cx="135" cy="25" r="3.5" fill="#facc15" />
                <circle cx="175" cy="65" r="3.5" fill="#facc15" />
                <circle cx="175" cy="135" r="3.5" fill="#facc15" />
                <circle cx="135" cy="175" r="3.5" fill="#facc15" />
                <circle cx="65" cy="175" r="3.5" fill="#facc15" />
                <circle cx="25" cy="135" r="3.5" fill="#facc15" />
                <circle cx="25" cy="65" r="3.5" fill="#facc15" />
              </svg>
            </div>

            {/* Floating Multiplier Badge Top Left */}
            <div className="absolute -top-3 -left-4 sm:top-2 sm:-left-6 z-20 px-3.5 py-2 rounded-2xl bg-[#0D1324]/95 border border-pink-500/40 shadow-xl shadow-pink-500/20 backdrop-blur-md animate-float flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-pink-500/20 flex items-center justify-center text-pink-400 font-bold text-xs">
                🚀
              </div>
              <div className="text-left">
                <span className="text-[9px] font-bold text-pink-400 uppercase block">Najwyższa wygrana</span>
                <span className="text-xs font-mono font-black text-white">+92 450 MONET</span>
              </div>
            </div>

            {/* Floating RNG Badge Bottom Right */}
            <div
              className="absolute -bottom-2 -right-2 sm:bottom-4 sm:-right-4 z-20 px-3.5 py-2.5 rounded-2xl bg-[#0D1324]/95 border border-purple-500/40 shadow-xl shadow-purple-500/20 backdrop-blur-md flex items-center gap-2.5"
              style={{ animation: 'floatSlow 4s ease-in-out infinite 2s' }}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <div className="text-left">
                <span className="text-[9px] text-slate-400 uppercase font-bold block">Provably Fair</span>
                <span className="text-xs font-bold text-purple-300">Algorytm SHA-256</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
