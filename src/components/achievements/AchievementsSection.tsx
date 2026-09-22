import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import {
  Award,
  Trophy,
  Play,
  Flame,
  Crown,
  Diamond,
  Coins,
  Gem,
  CheckCircle2,
  Lock,
  Timer,
  RotateCcw,
} from 'lucide-react';

export const AchievementsSection: React.FC = () => {
  const { achievements, achievementsNextReset } = useGame();
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 48,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = Date.now();
      const diff = Math.max(0, achievementsNextReset - now);
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ hours, minutes, seconds });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [achievementsNextReset]);

  const getAchievementIcon = (icon: string) => {
    switch (icon) {
      case 'Play':
        return <Play className="w-5 h-5 text-purple-400" />;
      case 'Trophy':
        return <Trophy className="w-5 h-5 text-amber-400" />;
      case 'Flame':
        return <Flame className="w-5 h-5 text-pink-400" />;
      case 'Crown':
        return <Crown className="w-5 h-5 text-yellow-400" />;
      case 'Diamond':
        return <Diamond className="w-5 h-5 text-cyan-400" />;
      case 'Award':
      default:
        return <Award className="w-5 h-5 text-indigo-400" />;
    }
  };

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <section id="achievements-section" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                Osiągnięcia Platformy
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30">
                {unlockedCount} / {achievements.length}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Wypełniaj wyzwania w cyklu 48h, zdobywaj nagrody i rywalizuj o nagrody
            </p>
          </div>
        </div>

        {/* 48h Season Timer & Overall Completion Progress */}
        <div className="flex flex-wrap items-center gap-3">
          {/* 48h Reset Countdown */}
          <div className="p-2.5 px-4 rounded-2xl bg-gradient-to-r from-purple-900/30 to-pink-900/20 border border-purple-500/30 flex items-center gap-2.5 shadow-lg shadow-purple-950/20">
            <div className="w-7 h-7 rounded-lg bg-pink-500/20 flex items-center justify-center text-pink-400">
              <Timer className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-purple-300 tracking-wider block">
                Reset co 48h za:
              </span>
              <span className="text-sm font-mono font-black text-white">
                {String(timeLeft.hours).padStart(2, '0')}g {String(timeLeft.minutes).padStart(2, '0')}m {String(timeLeft.seconds).padStart(2, '0')}s
              </span>
            </div>
          </div>

          {/* Completion Bar */}
          <div className="p-3 px-4 rounded-2xl bg-[#0D1324] border border-white/[0.08] flex items-center gap-3">
            <span className="text-xs font-bold text-slate-300">Ukończono:</span>
            <div className="w-28 sm:w-32 h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                style={{ width: `${achievements.length > 0 ? (unlockedCount / achievements.length) * 100 : 0}%` }}
              />
            </div>
            <span className="text-xs font-mono font-bold text-pink-400">
              {achievements.length > 0 ? Math.round((unlockedCount / achievements.length) * 100) : 0}%
            </span>
          </div>
        </div>
      </div>

      {/* 48h Reset Alert Info Banner */}
      <div className="p-3.5 px-4 rounded-2xl bg-[#0D1324]/80 border border-cyan-500/20 flex items-center justify-between gap-3 text-xs text-slate-300">
        <div className="flex items-center gap-2.5">
          <RotateCcw className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            Wszystkie osiągnięcia platformy i postęp resetują się globalnie dla każdego gracza <strong>co 48 godzin</strong>. Masz 48h na odebranie wszystkich nagród przed kolejnym cyklem!
          </span>
        </div>
        <span className="hidden md:inline-block px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-[11px] font-bold shrink-0">
          CYKL 48H
        </span>
      </div>

      {/* Grid of Achievements */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {achievements.map((ach) => {
          const progressPercent = Math.min(100, Math.round((ach.progress / ach.maxProgress) * 100));

          return (
            <div
              key={ach.id}
              className={`relative flex flex-col justify-between p-6 rounded-3xl border transition-all ${
                ach.unlocked
                  ? 'bg-gradient-to-b from-[#12182B] to-[#0D1324] border-purple-500/40 shadow-xl shadow-purple-950/20'
                  : 'bg-[#0D1324]/70 border-white/[0.08] opacity-85'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${
                      ach.unlocked
                        ? 'bg-purple-500/20 border-purple-500/40'
                        : 'bg-slate-800/60 border-white/5 text-slate-500'
                    }`}
                  >
                    {getAchievementIcon(ach.icon)}
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">{ach.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">{ach.description}</p>
                  </div>
                </div>

                {ach.unlocked ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 ml-2" />
                ) : (
                  <Lock className="w-4 h-4 text-slate-600 shrink-0 ml-2" />
                )}
              </div>

              {/* Progress & Reward */}
              <div className="mt-6 pt-4 border-t border-white/[0.08] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Postęp</span>
                  <span className="font-mono font-bold text-slate-300">
                    {ach.progress} / {ach.maxProgress}
                  </span>
                </div>

                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      ach.unlocked
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        : 'bg-gradient-to-r from-purple-500 to-pink-500'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {/* Reward Tags */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Nagroda</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-amber-300 flex items-center gap-1">
                      <Coins className="w-3 h-3 text-amber-400" />
                      +{ach.rewardCoins.toLocaleString()}
                    </span>
                    {ach.rewardGems && (
                      <span className="text-xs font-mono font-bold text-cyan-400 flex items-center gap-1">
                        <Gem className="w-3 h-3 text-cyan-400" />
                        +{ach.rewardGems}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
