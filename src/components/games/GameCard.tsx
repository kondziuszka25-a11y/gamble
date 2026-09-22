import React from 'react';
import type { GameInfo } from '../../types';
import {
  Rocket,
  Bomb,
  Coins,
  Diamond,
  Disc,
  Dices,
  Castle,
  CircleDot,
  Users,
  Play,
  Layers,
  Ticket,
  Brain,
  Spade,
  TrainFront,
} from 'lucide-react';

interface GameCardProps {
  game: GameInfo;
  onPlay: (gameId: string) => void;
}

export const GameCard: React.FC<GameCardProps> = ({ game, onPlay }) => {
  const getGameIcon = () => {
    switch (game.id) {
      case 'crash':
        return <Rocket className="w-6 h-6 text-purple-400 group-hover:scale-110 transition-transform" />;
      case 'hilo':
        return <Layers className="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform" />;
      case 'scratch':
        return <Ticket className="w-6 h-6 text-fuchsia-400 group-hover:scale-110 transition-transform" />;
      case 'puzzle':
        return <Brain className="w-6 h-6 text-violet-400 group-hover:scale-110 transition-transform" />;
      case 'blackjack':
        return <Spade className="w-6 h-6 text-emerald-400 group-hover:scale-110 transition-transform" />;
      case 'train':
        return <TrainFront className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform" />;
      case 'mines':
        return <Bomb className="w-6 h-6 text-pink-400 group-hover:scale-110 transition-transform" />;
      case 'coinflip':
        return <Coins className="w-6 h-6 text-amber-400 group-hover:scale-110 transition-transform" />;
      case 'jackpot':
        return <Diamond className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform" />;
      case 'wheel':
        return <Disc className="w-6 h-6 text-emerald-400 group-hover:scale-110 transition-transform" />;
      case 'dice':
        return <Dices className="w-6 h-6 text-indigo-400 group-hover:scale-110 transition-transform" />;
      case 'tower':
        return <Castle className="w-6 h-6 text-violet-400 group-hover:scale-110 transition-transform" />;
      case 'plinko':
      default:
        return <CircleDot className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform" />;
    }
  };

  const getBadgeStyle = (badge?: string) => {
    switch (badge) {
      case 'HOT':
        return 'bg-gradient-to-r from-red-500/20 to-pink-500/20 text-pink-400 border-pink-500/30';
      case 'POPULARNE':
        return 'bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-300 border-purple-500/30';
      case 'NOWE':
        return 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30';
      case 'SKILL':
        return 'bg-gradient-to-r from-violet-500/25 to-purple-500/25 text-violet-300 border-violet-500/40';
      case 'KLASYK':
      default:
        return 'bg-white/10 text-slate-300 border-white/10';
    }
  };

  return (
    <div
      onClick={() => onPlay(game.id)}
      className={`group relative flex flex-col justify-between p-6 rounded-3xl bg-[#0D1324] border border-white/[0.08] hover:border-purple-500/40 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl cursor-pointer overflow-hidden ${game.glowColor}`}
    >
      {/* Background Accent Gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${game.gradient} opacity-40 group-hover:opacity-75 transition-opacity`}
      />

      {/* Top Header: Icon and Badge */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center shadow-inner">
          {getGameIcon()}
        </div>

        {game.badge && (
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getBadgeStyle(
              game.badge
            )}`}
          >
            {game.badge}
          </span>
        )}
      </div>

      {/* Title & Description */}
      <div className="relative z-10 my-5 space-y-1.5">
        <h3 className="text-xl font-black text-white group-hover:text-purple-300 transition-colors tracking-wide">
          {game.name}
        </h3>
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-normal">
          {game.description}
        </p>
      </div>

      {/* Footer: Multiplier, Players & Play CTA */}
      <div className="relative z-10 pt-4 border-t border-white/[0.08] flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Maksymalny mnożnik
          </span>
          <span className="text-sm font-mono font-black text-amber-300">
            {game.maxMultiplier}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-slate-500" />
            {game.activePlayers}
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlay(game.id);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600/30 group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 text-purple-200 group-hover:text-white text-xs font-black uppercase tracking-wider transition-all shadow-md group-hover:shadow-purple-600/30"
          >
            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
            <span>Graj</span>
          </button>
        </div>
      </div>
    </div>
  );
};
