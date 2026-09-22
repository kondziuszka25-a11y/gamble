import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import confetti from 'canvas-confetti';
import {
  Coins,
  Sparkles,
  Crown,
  Diamond,
  Zap,
  Flame,
  CircleDollarSign,
  Clover,
  Skull,
  Wand2,
  RefreshCw,
  Trophy,
} from 'lucide-react';

interface ScratchTier {
  id: string;
  name: string;
  price: number;
  maxWin: number;
  badge: string;
  theme: {
    border: string;
    bg: string;
    accent: string;
    text: string;
    glow: string;
  };
}

const SCRATCH_TIERS: ScratchTier[] = [
  {
    id: 'cyber_chip',
    name: 'Cyber Chip',
    price: 100,
    maxWin: 10000,
    badge: 'STARTER',
    theme: {
      border: 'border-cyan-500/40',
      bg: 'from-cyan-950/30 via-[#0A1220] to-[#050B14]',
      accent: 'from-cyan-500 to-blue-600',
      text: 'text-cyan-400',
      glow: 'shadow-cyan-500/20',
    },
  },
  {
    id: 'neon_core',
    name: 'Neonowy Rdzeń',
    price: 500,
    maxWin: 50000,
    badge: 'POPULARNE',
    theme: {
      border: 'border-fuchsia-500/40',
      bg: 'from-fuchsia-950/30 via-[#150A20] to-[#080512]',
      accent: 'from-fuchsia-500 to-purple-600',
      text: 'text-fuchsia-400',
      glow: 'shadow-fuchsia-500/20',
    },
  },
  {
    id: 'matrix_vault',
    name: 'Matrix Vault',
    price: 2500,
    maxWin: 250000,
    badge: 'HIGH ROLLER',
    theme: {
      border: 'border-amber-500/40',
      bg: 'from-amber-950/30 via-[#1C1204] to-[#0A0702]',
      accent: 'from-amber-500 to-yellow-600',
      text: 'text-amber-400',
      glow: 'shadow-amber-500/20',
    },
  },
];

interface SymbolDef {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  multiplier: number;
  color: string;
  weight: number;
}

const SYMBOLS: SymbolDef[] = [
  { id: 'crown', name: 'Cyber Korona', icon: Crown, multiplier: 50, color: 'text-amber-300', weight: 4 },
  { id: 'diamond', name: 'Kwantowy Diament', icon: Diamond, multiplier: 25, color: 'text-cyan-300', weight: 8 },
  { id: 'zap', name: 'Plazmowy Piorun', icon: Zap, multiplier: 10, color: 'text-yellow-400', weight: 15 },
  { id: 'flame', name: 'Laserowy Płomień', icon: Flame, multiplier: 5, color: 'text-rose-400', weight: 25 },
  { id: 'coin', name: 'Złoty Token', icon: CircleDollarSign, multiplier: 2, color: 'text-emerald-400', weight: 45 },
  { id: 'clover', name: 'Neonowa Koniczyna', icon: Clover, multiplier: 1.2, color: 'text-green-400', weight: 70 },
  { id: 'skull', name: 'Cyber Czaszka', icon: Skull, multiplier: 0, color: 'text-slate-500', weight: 90 },
];

interface CellState {
  id: number;
  symbol: SymbolDef;
  scratched: boolean;
}

export const ScratchCardGame: React.FC = () => {
  const { currentUser, playSound } = useGame();
  const { refreshUser } = useAuth();

  const [selectedTier, setSelectedTier] = useState<ScratchTier>(SCRATCH_TIERS[0]);
  const [cells, setCells] = useState<CellState[]>([]);
  const [isBought, setIsBought] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [winResult, setWinResult] = useState<{
    won: boolean;
    winningSymbol: SymbolDef | null;
    payout: number;
    matchingIndices: number[];
  } | null>(null);

  const generateCard = (): { newCells: CellState[]; won: boolean; winSymbol: SymbolDef | null; winIndices: number[] } => {
    const isWin = Math.random() < 0.44;

    let chosenWinSymbol: SymbolDef | null = null;
    let winIndices: number[] = [];

    if (isWin) {
      const nonSkull = SYMBOLS.filter((s) => s.id !== 'skull');
      const totalWeight = nonSkull.reduce((acc, s) => acc + s.weight, 0);
      let rand = Math.random() * totalWeight;
      for (const s of nonSkull) {
        if (rand < s.weight) {
          chosenWinSymbol = s;
          break;
        }
        rand -= s.weight;
      }
      if (!chosenWinSymbol) chosenWinSymbol = nonSkull[nonSkull.length - 1];

      const positions = [0, 1, 2, 3, 4, 5, 6, 7, 8].sort(() => Math.random() - 0.5);
      winIndices = positions.slice(0, 3);
    }

    const availableFillers = SYMBOLS.filter((s) => s.id !== chosenWinSymbol?.id);
    const generated: CellState[] = [];
    const fillerCounts: Record<string, number> = {};

    for (let i = 0; i < 9; i++) {
      if (isWin && winIndices.includes(i)) {
        generated.push({
          id: i,
          symbol: chosenWinSymbol!,
          scratched: false,
        });
      } else {
        let filler: SymbolDef;
        let attempts = 0;
        do {
          filler = availableFillers[Math.floor(Math.random() * availableFillers.length)];
          attempts++;
        } while ((fillerCounts[filler.id] || 0) >= 2 && attempts < 20);

        fillerCounts[filler.id] = (fillerCounts[filler.id] || 0) + 1;
        generated.push({
          id: i,
          symbol: filler,
          scratched: false,
        });
      }
    }

    return {
      newCells: generated,
      won: isWin,
      winSymbol: chosenWinSymbol,
      winIndices,
    };
  };

  const buyCard = () => {
    if (currentUser.coins < selectedTier.price) return;
    playSound('click');

    const card = generateCard();
    setCells(card.newCells);
    setIsBought(true);
    setIsFinished(false);
    setWinResult({
      won: card.won,
      winningSymbol: card.winSymbol,
      payout: card.won && card.winSymbol ? Math.floor(selectedTier.price * card.winSymbol.multiplier) : 0,
      matchingIndices: card.winIndices,
    });
  };

  const finalizeGame = async (resultToFinalize = winResult) => {
    if (!resultToFinalize || isFinished) return;
    setIsFinished(true);

    const payout = resultToFinalize.won ? resultToFinalize.payout : 0;
    const multiplier = resultToFinalize.won && resultToFinalize.winningSymbol ? resultToFinalize.winningSymbol.multiplier : 0;

    if (resultToFinalize.won) {
      playSound('win');
      confetti({ particleCount: 75, spread: 80, origin: { y: 0.6 } });
    } else {
      playSound('tick');
    }

    await api.games
      .play({
        game: `Zdrapki (${selectedTier.name})`,
        betAmount: selectedTier.price,
        multiplier,
        payout,
        result: resultToFinalize.won ? 'WIN' : 'LOSS',
      })
      .catch(() => {});

    refreshUser();
  };

  const scratchCell = (index: number) => {
    if (!isBought || cells[index]?.scratched || isFinished) return;
    playSound('tick');

    const updated = cells.map((c, idx) => (idx === index ? { ...c, scratched: true } : c));
    setCells(updated);

    const allScratched = updated.every((c) => c.scratched);
    if (allScratched) {
      finalizeGame();
    }
  };

  const scratchAll = () => {
    if (!isBought || isFinished) return;
    playSound('tick');

    const updated = cells.map((c) => ({ ...c, scratched: true }));
    setCells(updated);
    finalizeGame();
  };

  return (
    <div className="rounded-2xl bg-[#05070D] border border-white/[0.08] p-4 sm:p-5 text-center flex flex-col items-center gap-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-fuchsia-900/15 via-transparent to-transparent pointer-events-none" />

      {/* Tier Selector Tabs */}
      <div className="w-full flex items-center justify-between gap-2 overflow-x-auto pb-1 no-scrollbar">
        {SCRATCH_TIERS.map((tier) => {
          const isSelected = selectedTier.id === tier.id;
          return (
            <button
              key={tier.id}
              onClick={() => {
                if (!isBought || isFinished) {
                  setSelectedTier(tier);
                  setIsBought(false);
                  setIsFinished(false);
                  setCells([]);
                  playSound('click');
                }
              }}
              disabled={isBought && !isFinished}
              className={`flex-1 min-w-[110px] p-2.5 sm:p-3 rounded-2xl border transition-all text-left relative overflow-hidden ${
                isSelected
                  ? `bg-gradient-to-b ${tier.theme.bg} ${tier.theme.border} ${tier.theme.glow} shadow-lg scale-[1.02]`
                  : 'bg-[#0D1324] border-white/[0.06] hover:border-white/20 opacity-70 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                  {tier.badge}
                </span>
                <span className="text-xs font-mono font-black text-amber-400 flex items-center gap-0.5">
                  <Coins className="w-3 h-3" />
                  {tier.price.toLocaleString()}
                </span>
              </div>
              <p className={`text-xs sm:text-sm font-black ${isSelected ? tier.theme.text : 'text-white'}`}>
                {tier.name}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Max: <strong className="text-emerald-400 font-mono">{tier.maxWin.toLocaleString()}</strong>
              </p>
            </button>
          );
        })}
      </div>

      {/* Main Scratch Card Area */}
      <div className="relative w-full max-w-sm">
        <div
          className={`rounded-3xl border-2 p-4 sm:p-5 bg-gradient-to-b ${selectedTier.theme.bg} ${selectedTier.theme.border} shadow-2xl ${selectedTier.theme.glow} transition-all duration-300 relative overflow-hidden`}
        >
          {/* Card Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.08] mb-3">
            <div className="text-left">
              <span className="text-[10px] font-black uppercase text-fuchsia-400 tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> CYBER ZDRAPKA 3×3
              </span>
              <h3 className="text-base font-black text-white">{selectedTier.name}</h3>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Cena</span>
              <p className="text-sm font-mono font-black text-amber-400 flex items-center justify-end gap-1">
                <Coins className="w-3.5 h-3.5" />
                {selectedTier.price.toLocaleString()}
              </p>
            </div>
          </div>

          {/* 3×3 Scratch Grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-2.5 my-2">
            {isBought && cells.length === 9
              ? cells.map((cell, idx) => {
                  const Icon = cell.symbol.icon;
                  const isWinningMatch = isFinished && winResult?.won && winResult.matchingIndices.includes(idx);

                  return (
                    <div
                      key={cell.id}
                      onClick={() => scratchCell(idx)}
                      className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 select-none overflow-hidden ${
                        cell.scratched
                          ? isWinningMatch
                            ? 'bg-amber-500/20 border-2 border-amber-400 shadow-lg shadow-amber-500/30 scale-105 z-10 animate-pulse'
                            : 'bg-[#080d19] border border-white/10'
                          : 'bg-gradient-to-br from-[#1b253b] via-[#121a2b] to-[#0d1322] border border-blue-500/30 hover:border-fuchsia-500/50 hover:scale-[1.02] shadow-md'
                      }`}
                    >
                      {cell.scratched ? (
                        <div className="flex flex-col items-center justify-center p-1 animate-fade-in">
                          <Icon className={`w-7 h-7 sm:w-8 sm:h-8 ${cell.symbol.color} drop-shadow-[0_0_8px_currentColor]`} />
                          <span className="text-[10px] font-mono font-black text-white mt-1">
                            {cell.symbol.multiplier > 0 ? `${cell.symbol.multiplier}x` : '0x'}
                          </span>
                        </div>
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-2 bg-gradient-to-tr from-fuchsia-950/40 via-purple-900/30 to-blue-900/30">
                          <div className="w-7 h-7 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-slate-400">
                            <Sparkles className="w-3.5 h-3.5 text-fuchsia-400 opacity-60" />
                          </div>
                          <span className="text-[8px] font-mono font-bold text-slate-400 mt-1 uppercase">
                            ZDRAP
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })
              : Array(9)
                  .fill(null)
                  .map((_, idx) => (
                    <div
                      key={idx}
                      className="aspect-square rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center opacity-50"
                    >
                      <Sparkles className="w-5 h-5 text-slate-600" />
                    </div>
                  ))}
          </div>

          {/* Rule banner */}
          <div className="mt-2.5 pt-2.5 border-t border-white/[0.08] text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Traf <strong>3 identyczne symbole</strong>, aby wygrać!</span>
          </div>
        </div>
      </div>

      {/* Result Toast */}
      {isFinished && winResult && (
        <div
          className={`w-full max-w-sm p-3.5 rounded-2xl border flex items-center gap-3 animate-fade-in ${
            winResult.won
              ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
          }`}
        >
          {winResult.won ? (
            <Trophy className="w-6 h-6 text-amber-400 shrink-0" />
          ) : (
            <Skull className="w-6 h-6 text-rose-400 shrink-0" />
          )}
          <div className="flex-1 text-left">
            <p className="text-xs font-black uppercase tracking-wider">
              {winResult.won ? 'GRATULACJE! WYGRANA!' : 'BRAK WYGRANEJ'}
            </p>
            <p className="text-xs font-medium text-slate-300">
              {winResult.won && winResult.winningSymbol
                ? `Trafiłeś 3x ${winResult.winningSymbol.name}! Wypłata: +${winResult.payout.toLocaleString()} monet (${winResult.winningSymbol.multiplier}x)!`
                : 'Brak 3 pasujących symboli w tej zdrapce. Spróbuj ponownie!'}
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="w-full max-w-sm space-y-2">
        {!isBought || isFinished ? (
          <button
            onClick={buyCard}
            disabled={currentUser.coins < selectedTier.price}
            className={`w-full py-3.5 rounded-2xl bg-gradient-to-r ${selectedTier.theme.accent} text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-fuchsia-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-2`}
          >
            {isFinished ? (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>Kup następną zdrapkę ({selectedTier.price.toLocaleString()} monet)</span>
              </>
            ) : (
              <>
                <Coins className="w-4 h-4 text-amber-300" />
                <span>Kup zdrapkę ({selectedTier.price.toLocaleString()} monet)</span>
              </>
            )}
          </button>
        ) : (
          <button
            onClick={scratchAll}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Wand2 className="w-4 h-4 text-cyan-300" />
            <span>Odkryj wszystko natychmiast</span>
          </button>
        )}
      </div>

      {/* Symbols Table */}
      <div className="w-full max-w-sm p-3 rounded-2xl bg-[#0D1324] border border-white/[0.06] text-left">
        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-2">
          Tabela symboli ({selectedTier.name})
        </span>
        <div className="grid grid-cols-3 gap-1.5 text-[11px] font-mono">
          {SYMBOLS.filter((s) => s.id !== 'skull').map((s) => {
            const Icon = s.icon;
            const payout = Math.floor(selectedTier.price * s.multiplier);
            return (
              <div key={s.id} className="flex items-center gap-1 p-1 rounded bg-white/[0.02] border border-white/[0.04]">
                <Icon className={`w-3.5 h-3.5 ${s.color} shrink-0`} />
                <span className="text-slate-300 font-bold">{s.multiplier}x</span>
                <span className="text-[10px] text-amber-400 font-bold ml-auto">{payout >= 1000 ? `${(payout / 1000).toFixed(0)}k` : payout}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
