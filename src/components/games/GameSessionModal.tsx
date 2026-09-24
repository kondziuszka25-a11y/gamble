import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../../context/GameContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import confetti from 'canvas-confetti';
import {
  X,
  Coins,
  Rocket,
  Bomb,
  CircleDollarSign,
  Trophy,
  RotateCcw,
  Dices,
  Building2,
  Rows3,
  CheckCircle2,
  XCircle,
  Layers,
  ChevronUp,
  ChevronDown,
  Equal,
  Shuffle,
  Ticket,
  Brain,
  Spade,
  TrainFront,
} from 'lucide-react';
import type { GameInfo } from '../../types';
import { ScratchCardGame } from './ScratchCardGame';
import { PuzzleRushGame } from './PuzzleRushGame';
import { BlackjackGame } from './BlackjackGame';
import { NeonTrainGame } from './NeonTrainGame';

interface GameSessionModalProps {
  game: GameInfo;
  onClose: () => void;
}

export interface HiLoCard {
  rank: string;
  value: number; // 1 (A) to 13 (K)
  suit: '♠' | '♥' | '♦' | '♣';
  color: 'red' | 'black';
}

const HILO_RANKS: { rank: string; value: number }[] = [
  { rank: 'A', value: 1 },
  { rank: '2', value: 2 },
  { rank: '3', value: 3 },
  { rank: '4', value: 4 },
  { rank: '5', value: 5 },
  { rank: '6', value: 6 },
  { rank: '7', value: 7 },
  { rank: '8', value: 8 },
  { rank: '9', value: 9 },
  { rank: '10', value: 10 },
  { rank: 'J', value: 11 },
  { rank: 'Q', value: 12 },
  { rank: 'K', value: 13 },
];

const HILO_SUITS: { suit: '♠' | '♥' | '♦' | '♣'; color: 'red' | 'black' }[] = [
  { suit: '♠', color: 'black' },
  { suit: '♥', color: 'red' },
  { suit: '♦', color: 'red' },
  { suit: '♣', color: 'black' },
];

const drawRandomCard = (): HiLoCard => {
  const r = HILO_RANKS[Math.floor(Math.random() * HILO_RANKS.length)];
  const s = HILO_SUITS[Math.floor(Math.random() * HILO_SUITS.length)];
  return { ...r, ...s };
};

export const GameSessionModal: React.FC<GameSessionModalProps> = ({ game, onClose }) => {
  const { currentUser, playSound } = useGame();
  const { refreshUser } = useAuth();

  // Common Bet State
  const [betAmount, setBetAmount] = useState<number>(100);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [lastResult, setLastResult] = useState<{
    result: 'WIN' | 'LOSS';
    payout: number;
    multiplier: number;
    message: string;
  } | null>(null);

  // Quick Bet presets
  const handlePreset = (multiplier: number) => {
    if (multiplier === 0.5) setBetAmount((prev) => Math.max(10, Math.floor(prev / 2)));
    else if (multiplier === 2) setBetAmount((prev) => Math.min(currentUser.coins, prev * 2));
    else if (multiplier === -1) setBetAmount(currentUser.coins);
  };

  // ── 1. CRASH GAME STATE ───────────────────────────────────────────────────
  const [crashMultiplier, setCrashMultiplier] = useState<number>(1.0);
  const [isCrashed, setIsCrashed] = useState<boolean>(false);
  const [hasCashedOut, setHasCashedOut] = useState<boolean>(false);
  const crashIntervalRef = useRef<any>(null);
  const crashPointRef = useRef<number>(1.0);

  const startCrashGame = async () => {
    if (betAmount <= 0 || betAmount > currentUser.coins) return;
    setLastResult(null);
    setIsPlaying(true);
    setIsCrashed(false);
    setHasCashedOut(false);
    setCrashMultiplier(1.0);

    // Provably fair crash point: ~86% RTP, tighter curve
    const rand = Math.random();
    // 10% instant crash at 1.00x
    const point = rand < 0.10 ? 1.0 : parseFloat(Math.max(1.01, 0.86 / (1 - rand)).toFixed(2));
    crashPointRef.current = point;

    playSound('tick');

    const startTime = Date.now();
    crashIntervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const current = parseFloat(Math.pow(Math.E, 0.16 * elapsed).toFixed(2));

      if (current >= crashPointRef.current) {
        // ROCKET CRASHED!
        clearInterval(crashIntervalRef.current);
        setCrashMultiplier(crashPointRef.current);
        setIsCrashed(true);
        setIsPlaying(false);
        playSound('tick');

        // Record loss on backend
        api.games.play({
          game: 'Crash',
          betAmount,
          multiplier: 0,
          payout: 0,
          result: 'LOSS',
        }).then(() => refreshUser()).catch(() => {});

        setLastResult({
          result: 'LOSS',
          multiplier: crashPointRef.current,
          payout: 0,
          message: `Rakieta eksplodowała na ${crashPointRef.current.toFixed(2)}x!`,
        });
      } else {
        setCrashMultiplier(current);
      }
    }, 50);
  };

  const cashOutCrash = async () => {
    if (!isPlaying || isCrashed || hasCashedOut) return;
    clearInterval(crashIntervalRef.current);
    setHasCashedOut(true);
    setIsPlaying(false);

    const winMult = crashMultiplier;
    const payout = Math.floor(betAmount * winMult);

    playSound('win');
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });

    // Record win on backend
    await api.games.play({
      game: 'Crash',
      betAmount,
      multiplier: winMult,
      payout,
      result: 'WIN',
    }).catch(() => {});
    refreshUser();

    setLastResult({
      result: 'WIN',
      multiplier: winMult,
      payout,
      message: `Wypłacono na ${winMult.toFixed(2)}x! Wygrana: +${payout.toLocaleString()} monet!`,
    });
  };

  useEffect(() => {
    return () => {
      if (crashIntervalRef.current) clearInterval(crashIntervalRef.current);
    };
  }, []);

  // ── 2. COINFLIP STATE ─────────────────────────────────────────────────────
  const [selectedSide, setSelectedSide] = useState<'ORZEŁ' | 'RESZKA'>('ORZEŁ');
  const [isFlipping, setIsFlipping] = useState<boolean>(false);
  const [coinResult, setCoinResult] = useState<'ORZEŁ' | 'RESZKA' | null>(null);

  const playCoinflip = async () => {
    if (betAmount <= 0 || betAmount > currentUser.coins || isFlipping) return;
    setLastResult(null);
    setIsFlipping(true);
    playSound('tick');

    setTimeout(async () => {
      const outcome: 'ORZEŁ' | 'RESZKA' = Math.random() < 0.5 ? 'ORZEŁ' : 'RESZKA';
      setCoinResult(outcome);
      setIsFlipping(false);

      const won = outcome === selectedSide;
      const payout = won ? Math.floor(betAmount * 1.85) : 0;
      const multiplier = won ? 1.85 : 0;

      if (won) {
        playSound('win');
        confetti({ particleCount: 60, spread: 70 });
      }

      await api.games.play({
        game: 'Coinflip',
        betAmount,
        multiplier,
        payout,
        result: won ? 'WIN' : 'LOSS',
      }).catch(() => {});
      refreshUser();

      setLastResult({
        result: won ? 'WIN' : 'LOSS',
        multiplier,
        payout,
        message: won
          ? `Wypadł ${outcome}! Wygrana 1.85x: +${payout.toLocaleString()} monet!`
          : `Wypadł ${outcome}. Straciłeś ${betAmount.toLocaleString()} monet.`,
      });
    }, 1200);
  };

  // ── 3. MINES (MINY) STATE ─────────────────────────────────────────────────
  const [minesCount, setMinesCount] = useState<number>(3);
  const [revealedTiles, setRevealedTiles] = useState<boolean[]>(Array(25).fill(false));
  const [bombTiles, setBombTiles] = useState<boolean[]>(Array(25).fill(false));
  const [minesActive, setMinesActive] = useState<boolean>(false);
  const [minesMultiplier, setMinesMultiplier] = useState<number>(1.0);

  const startMinesGame = () => {
    if (betAmount <= 0 || betAmount > currentUser.coins) return;
    setLastResult(null);

    // Place bombs
    const bombs = Array(25).fill(false);
    let placed = 0;
    while (placed < minesCount) {
      const idx = Math.floor(Math.random() * 25);
      if (!bombs[idx]) {
        bombs[idx] = true;
        placed++;
      }
    }

    setBombTiles(bombs);
    setRevealedTiles(Array(25).fill(false));
    setMinesActive(true);
    setMinesMultiplier(1.0);
    playSound('click');
  };

  const clickTile = async (idx: number) => {
    if (!minesActive || revealedTiles[idx]) return;

    const newRevealed = [...revealedTiles];
    newRevealed[idx] = true;
    setRevealedTiles(newRevealed);

    if (bombTiles[idx]) {
      // BOOM!
      setMinesActive(false);
      // Reveal all bombs
      setRevealedTiles(Array(25).fill(true));
      playSound('tick');

      await api.games.play({
        game: 'Miny',
        betAmount,
        multiplier: 0,
        payout: 0,
        result: 'LOSS',
      }).catch(() => {});
      refreshUser();

      setLastResult({
        result: 'LOSS',
        multiplier: 0,
        payout: 0,
        message: 'Trafiłeś na minę! Straciłeś stawkę.',
      });
    } else {
      // GEM!
      playSound('cash');
      const safeCount = newRevealed.filter((r, i) => r && !bombTiles[i]).length;
      const nextMult = parseFloat((1.0 + safeCount * (minesCount * 0.11)).toFixed(2));
      setMinesMultiplier(nextMult);
    }
  };

  const cashOutMines = async () => {
    if (!minesActive) return;
    setMinesActive(false);
    setRevealedTiles(Array(25).fill(true));

    const payout = Math.floor(betAmount * minesMultiplier);
    playSound('win');
    confetti({ particleCount: 50 });

    await api.games.play({
      game: 'Miny',
      betAmount,
      multiplier: minesMultiplier,
      payout,
      result: 'WIN',
    }).catch(() => {});
    refreshUser();

    setLastResult({
      result: 'WIN',
      multiplier: minesMultiplier,
      payout,
      message: `Wypłaciłeś ${minesMultiplier}x! Otrzymujesz +${payout.toLocaleString()} monet!`,
    });
  };

  // ── 4. KOŁO FORTUNY (WHEEL) STATE ─────────────────────────────────────────
  const [wheelRotation, setWheelRotation] = useState<number>(0);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);

  const WHEEL_SEGMENTS = [
    { mult: 0, label: '0x', color: '#ef4444' },
    { mult: 1.1, label: '1.1x', color: '#3b82f6' },
    { mult: 0.5, label: '0.5x', color: '#64748b' },
    { mult: 1.5, label: '1.5x', color: '#10b981' },
    { mult: 0, label: '0x', color: '#ef4444' },
    { mult: 2.0, label: '2x', color: '#8b5cf6' },
    { mult: 0, label: '0x', color: '#ef4444' },
    { mult: 5.0, label: '5x', color: '#f59e0b' },
  ];

  const spinWheel = async () => {
    if (betAmount <= 0 || betAmount > currentUser.coins || isSpinning) return;
    setLastResult(null);
    setIsSpinning(true);
    playSound('tick');

    const randomIndex = Math.floor(Math.random() * WHEEL_SEGMENTS.length);
    const segmentAngle = 360 / WHEEL_SEGMENTS.length;

    // Segment i is rendered at angle i * segmentAngle.
    // For segment i to land directly at the pointer (0 deg at the top),
    // the rotation modulo 360 must equal (360 - i * segmentAngle) % 360.
    const targetNormalized = (360 - randomIndex * segmentAngle) % 360;
    const currentNormalized = wheelRotation % 360;
    let diff = targetNormalized - currentNormalized;
    if (diff <= 0) {
      diff += 360;
    }
    const nextRotation = wheelRotation + 360 * 5 + diff;
    setWheelRotation(nextRotation);

    setTimeout(async () => {
      setIsSpinning(false);
      const segment = WHEEL_SEGMENTS[randomIndex];
      const won = segment.mult > 0;
      const payout = Math.floor(betAmount * segment.mult);

      if (won) {
        playSound('win');
        confetti({ particleCount: 70 });
      }

      await api.games.play({
        game: 'Koło Fortuny',
        betAmount,
        multiplier: segment.mult,
        payout,
        result: won ? 'WIN' : 'LOSS',
      }).catch(() => {});
      refreshUser();

      setLastResult({
        result: won ? 'WIN' : 'LOSS',
        multiplier: segment.mult,
        payout,
        message: won
          ? `Trafiłeś sektor ${segment.label}! Wygrywasz +${payout.toLocaleString()} monet!`
          : `Trafiłeś 0x. Przegrana ${betAmount.toLocaleString()} monet.`,
      });
    }, 3500);
  };

  // ── 5. HI-LO STATE ────────────────────────────────────────────────────────
  const [hiloActive, setHiloActive] = useState<boolean>(false);
  const [currentCard, setCurrentCard] = useState<HiLoCard | null>(null);
  const [hiloHistory, setHiloHistory] = useState<Array<{ card: HiLoCard; guess: 'HI' | 'LO' | 'SAME'; won: boolean }>>([]);
  const [hiloMultiplier, setHiloMultiplier] = useState<number>(1.0);
  const [hiloLockedBet, setHiloLockedBet] = useState<number>(100);
  const [isCardDealing, setIsCardDealing] = useState<boolean>(false);

  const startHiloGame = () => {
    if (betAmount <= 0 || betAmount > currentUser.coins) return;
    setLastResult(null);
    const initial = drawRandomCard();
    setCurrentCard(initial);
    setHiloHistory([]);
    setHiloMultiplier(1.0);
    setHiloLockedBet(betAmount);
    setHiloActive(true);
    playSound('tick');
  };

  const skipStartingCard = () => {
    if (!hiloActive || hiloHistory.length > 0 || isCardDealing) return;
    let newCard = drawRandomCard();
    while (newCard.value === currentCard?.value) {
      newCard = drawRandomCard();
    }
    setCurrentCard(newCard);
    playSound('tick');
  };

  const handleHiloGuess = async (guess: 'HI' | 'LO' | 'SAME') => {
    if (!hiloActive || !currentCard || isCardDealing) return;
    setIsCardDealing(true);
    playSound('tick');

    const drawn = drawRandomCard();

    setTimeout(async () => {
      let won = false;
      let stepMult = 1.0;

      const higherCount = 13 - currentCard.value;
      const lowerCount = currentCard.value - 1;

      if (guess === 'HI') {
        won = drawn.value > currentCard.value;
        stepMult = higherCount > 0 ? Number(((12 / higherCount) * 0.75).toFixed(2)) : 1;
      } else if (guess === 'LO') {
        won = drawn.value < currentCard.value;
        stepMult = lowerCount > 0 ? Number(((12 / lowerCount) * 0.75).toFixed(2)) : 1;
      } else {
        won = drawn.value === currentCard.value;
        stepMult = 8.0;
      }

      if (won) {
        playSound('win');
        const newMult = Number((hiloMultiplier * stepMult).toFixed(2));
        setHiloMultiplier(newMult);
        setHiloHistory((prev) => [...prev, { card: drawn, guess, won: true }]);
        setCurrentCard(drawn);
        setIsCardDealing(false);
      } else {
        playSound('tick');
        setHiloActive(false);
        setHiloHistory((prev) => [...prev, { card: drawn, guess, won: false }]);
        setCurrentCard(drawn);
        setIsCardDealing(false);

        await api.games.play({
          game: 'Hi-Lo',
          betAmount: hiloLockedBet,
          multiplier: 0,
          payout: 0,
          result: 'LOSS',
        }).catch(() => {});
        refreshUser();

        setLastResult({
          result: 'LOSS',
          multiplier: 0,
          payout: 0,
          message: `Wylosowano ${drawn.rank} ${drawn.suit}. Nietrafiony wybór! Przegrana: -${hiloLockedBet.toLocaleString()} monet.`,
        });
      }
    }, 450);
  };

  const cashoutHilo = async () => {
    if (!hiloActive || hiloHistory.length === 0 || isCardDealing) return;
    setHiloActive(false);
    const payout = Math.floor(hiloLockedBet * hiloMultiplier);

    playSound('win');
    confetti({ particleCount: 70, spread: 80 });

    await api.games.play({
      game: 'Hi-Lo',
      betAmount: hiloLockedBet,
      multiplier: hiloMultiplier,
      payout,
      result: 'WIN',
    }).catch(() => {});
    refreshUser();

    setLastResult({
      result: 'WIN',
      multiplier: hiloMultiplier,
      payout,
      message: `Sukces w Hi-Lo! Wypłacono ${payout.toLocaleString()} monet przy mnożniku ${hiloMultiplier.toFixed(2)}x!`,
    });
  };

  // Helper odds for UI
  const hiloHigherCount = currentCard ? 13 - currentCard.value : 0;
  const hiloLowerCount = currentCard ? currentCard.value - 1 : 0;
  const hiloHigherMult = hiloHigherCount > 0 ? Number(((12 / hiloHigherCount) * 0.96).toFixed(2)) : 0;
  const hiloLowerMult = hiloLowerCount > 0 ? Number(((12 / hiloLowerCount) * 0.96).toFixed(2)) : 0;
  const hiloHigherChance = hiloHigherCount > 0 ? Math.round((hiloHigherCount / 12) * 100) : 0;
  const hiloLowerChance = hiloLowerCount > 0 ? Math.round((hiloLowerCount / 12) * 100) : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-3xl bg-[#0D1324] border border-purple-500/30 p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[95vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background glow */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-pink-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
              {game.id === 'crash' && <Rocket className="w-6 h-6" />}
              {game.id === 'hilo' && <Layers className="w-6 h-6" />}
              {game.id === 'scratch' && <Ticket className="w-6 h-6" />}
              {game.id === 'puzzle' && <Brain className="w-6 h-6" />}
              {game.id === 'blackjack' && <Spade className="w-6 h-6" />}
              {game.id === 'train' && <TrainFront className="w-6 h-6" />}
              {game.id === 'coinflip' && <CircleDollarSign className="w-6 h-6" />}
              {game.id === 'mines' && <Bomb className="w-6 h-6" />}
              {game.id === 'wheel' && <RotateCcw className="w-6 h-6" />}
              {game.id === 'dice' && <Dices className="w-6 h-6" />}
              {game.id === 'jackpot' && <Trophy className="w-6 h-6" />}
              {game.id === 'tower' && <Building2 className="w-6 h-6" />}
              {game.id === 'plinko' && <Rows3 className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white">{game.name}</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  LIVE API
                </span>
              </div>
              <p className="text-xs text-slate-400">{game.description}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Game Arena Body */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-1">
          {/* ── 1. CRASH INTERFACE ── */}
          {game.id === 'crash' && (
            <div className="rounded-2xl bg-[#05070D] border border-white/[0.08] p-6 text-center relative overflow-hidden flex flex-col items-center justify-center min-h-[260px]">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent pointer-events-none" />

              {/* Multiplier display */}
              <div className="relative z-10 mb-4">
                <span
                  className={`font-mono text-5xl sm:text-6xl font-black tracking-tight transition-colors ${
                    isCrashed
                      ? 'text-rose-500 animate-bounce'
                      : hasCashedOut
                      ? 'text-emerald-400'
                      : 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300'
                  }`}
                >
                  {crashMultiplier.toFixed(2)}x
                </span>
                {isCrashed && (
                  <p className="text-sm font-black text-rose-400 uppercase tracking-widest mt-2">
                    💥 ROZBITO (CRASHED)!
                  </p>
                )}
                {hasCashedOut && (
                  <p className="text-sm font-black text-emerald-400 uppercase tracking-widest mt-2">
                    💰 WYPŁACONO!
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="relative z-10 w-full max-w-sm">
                {!isPlaying ? (
                  <button
                    onClick={startCrashGame}
                    disabled={betAmount <= 0 || betAmount > currentUser.coins}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-purple-900/40 transition-all flex items-center justify-center gap-2 disabled:opacity-40"
                  >
                    <Rocket className="w-5 h-5" />
                    <span>Wystartuj rakietę ({betAmount.toLocaleString()} monet)</span>
                  </button>
                ) : (
                  <button
                    onClick={cashOutCrash}
                    disabled={hasCashedOut || isCrashed}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-black text-base uppercase tracking-wider shadow-2xl shadow-emerald-500/40 transition-all flex items-center justify-center gap-2 animate-pulse"
                  >
                    <span>WYPŁAĆ +{(betAmount * crashMultiplier).toFixed(0)} MONET</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── 2. COINFLIP INTERFACE ── */}
          {game.id === 'coinflip' && (
            <div className="rounded-2xl bg-[#05070D] border border-white/[0.08] p-6 text-center flex flex-col items-center">
              {/* Coin visual */}
              <div
                className={`w-28 h-28 rounded-full border-4 border-amber-400 bg-gradient-to-tr from-amber-500 via-yellow-300 to-amber-600 flex items-center justify-center shadow-2xl shadow-amber-500/30 mb-6 transition-all duration-700 ${
                  isFlipping ? 'rotate-[720deg] scale-110' : ''
                }`}
              >
                <span className="font-black text-2xl text-slate-900 tracking-wider">
                  {isFlipping ? '?' : coinResult || selectedSide}
                </span>
              </div>

              {/* Side pickers */}
              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => setSelectedSide('ORZEŁ')}
                  disabled={isFlipping}
                  className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${
                    selectedSide === 'ORZEŁ'
                      ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30'
                      : 'bg-white/[0.04] text-slate-400 hover:text-white'
                  }`}
                >
                  🦅 ORZEŁ (1.85x)
                </button>
                <button
                  onClick={() => setSelectedSide('RESZKA')}
                  disabled={isFlipping}
                  className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${
                    selectedSide === 'RESZKA'
                      ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30'
                      : 'bg-white/[0.04] text-slate-400 hover:text-white'
                  }`}
                >
                  🪙 RESZKA (1.85x)
                </button>
              </div>

              <button
                onClick={playCoinflip}
                disabled={isFlipping || betAmount <= 0 || betAmount > currentUser.coins}
                className="w-full max-w-sm py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-500/30 transition-all disabled:opacity-40"
              >
                {isFlipping ? 'Rzut monetą...' : `Rzuć monetą (${betAmount.toLocaleString()} monet)`}
              </button>
            </div>
          )}

          {/* ── 3. MINES INTERFACE ── */}
          {game.id === 'mines' && (
            <div className="rounded-2xl bg-[#05070D] border border-white/[0.08] p-6 flex flex-col items-center">
              <div className="flex items-center justify-between w-full max-w-xs mb-4 text-xs">
                <span className="text-slate-400">Liczba min:</span>
                <div className="flex gap-1.5">
                  {[1, 3, 5, 10].map((m) => (
                    <button
                      key={m}
                      disabled={minesActive}
                      onClick={() => setMinesCount(m)}
                      className={`px-2.5 py-1 rounded-lg font-bold ${
                        minesCount === m
                          ? 'bg-rose-500 text-white'
                          : 'bg-white/[0.05] text-slate-400 hover:text-white'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* 5x5 Tiles Grid */}
              <div className="grid grid-cols-5 gap-2 w-full max-w-xs mb-6">
                {revealedTiles.map((isRev, i) => (
                  <button
                    key={i}
                    onClick={() => clickTile(i)}
                    disabled={!minesActive || isRev}
                    className={`h-12 rounded-xl flex items-center justify-center font-black transition-all ${
                      !isRev
                        ? 'bg-[#0D1324] hover:bg-purple-900/30 border border-white/[0.08] hover:border-purple-500/40 text-slate-500'
                        : bombTiles[i]
                        ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/40'
                        : 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/40'
                    }`}
                  >
                    {isRev ? (bombTiles[i] ? '💣' : '💎') : ''}
                  </button>
                ))}
              </div>

              {/* Controls */}
              {!minesActive ? (
                <button
                  onClick={startMinesGame}
                  disabled={betAmount <= 0 || betAmount > currentUser.coins}
                  className="w-full max-w-xs py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/30 transition-all disabled:opacity-40"
                >
                  Rozpocznij ({betAmount.toLocaleString()} monet)
                </button>
              ) : (
                <button
                  onClick={cashOutMines}
                  className="w-full max-w-xs py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-500/40 transition-all animate-pulse"
                >
                  Wypłać {minesMultiplier.toFixed(2)}x (+{Math.floor(betAmount * minesMultiplier)} monet)
                </button>
              )}
            </div>
          )}

          {/* ── 4. WHEEL INTERFACE ── */}
          {game.id === 'wheel' && (
            <div className="rounded-2xl bg-[#05070D] border border-white/[0.08] p-6 flex flex-col items-center">
              <div className="relative w-48 h-48 sm:w-56 sm:h-56 mb-6">
                {/* Pointer */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-20 w-0 h-0 border-x-8 border-x-transparent border-t-[16px] border-t-amber-400" />

                {/* Rotating wheel */}
                <div
                  className="w-full h-full rounded-full border-4 border-white/20 relative overflow-hidden transition-transform duration-[3500ms] ease-out shadow-2xl"
                  style={{ transform: `rotate(${wheelRotation}deg)` }}
                >
                  {WHEEL_SEGMENTS.map((seg, idx) => (
                    <div
                      key={idx}
                      className="absolute inset-0 flex items-start justify-center pt-2 font-black text-xs text-white"
                      style={{
                        transform: `rotate(${idx * (360 / WHEEL_SEGMENTS.length)}deg)`,
                        transformOrigin: '50% 50%',
                      }}
                    >
                      <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm border border-white/20">
                        {seg.label}
                      </span>
                    </div>
                  ))}
                  <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/30 to-pink-600/30 rounded-full" />
                </div>
              </div>

              <button
                onClick={spinWheel}
                disabled={isSpinning || betAmount <= 0 || betAmount > currentUser.coins}
                className="w-full max-w-sm py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-cyan-500/30 transition-all disabled:opacity-40"
              >
                {isSpinning ? 'Koło się kręci...' : `Zakręć kołem (${betAmount.toLocaleString()} monet)`}
              </button>
            </div>
          )}

          {/* ── 5. HI-LO INTERFACE ── */}
          {game.id === 'hilo' && (
            <div className="rounded-2xl bg-[#05070D] border border-white/[0.08] p-5 text-center flex flex-col items-center gap-5 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/15 via-transparent to-transparent pointer-events-none" />

              {/* Top status & multiplier banner */}
              <div className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400">Mnożnik:</span>
                  <span className="text-base font-black font-mono text-blue-400">
                    {hiloMultiplier.toFixed(2)}x
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400">Możliwa wygrana:</span>
                  <span className="text-sm font-black font-mono text-emerald-400 flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5 text-amber-400" />
                    {hiloActive ? Math.floor(hiloLockedBet * hiloMultiplier).toLocaleString() : betAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* History strip if cards were drawn */}
              {hiloHistory.length > 0 && (
                <div className="w-full flex items-center gap-2 overflow-x-auto py-1 px-1 no-scrollbar justify-center">
                  {hiloHistory.slice(-6).map((item, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono font-black ${
                        item.won
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                      }`}
                    >
                      <span>{item.guess === 'HI' ? '▲' : item.guess === 'LO' ? '▼' : '='}</span>
                      <span>{item.card.rank}{item.card.suit}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Main Card Display */}
              <div className="relative my-2">
                {hiloActive && currentCard ? (
                  <div
                    className={`w-40 h-56 rounded-2xl bg-gradient-to-br from-[#121b2d] to-[#0a0f1d] border-2 border-blue-500/40 p-3.5 flex flex-col justify-between shadow-2xl shadow-blue-500/20 select-none transform transition-all duration-300 ${
                      isCardDealing ? 'scale-95 opacity-70 rotate-3' : 'scale-100 opacity-100 rotate-0'
                    }`}
                  >
                    {/* Card Top Left */}
                    <div className="flex items-center gap-1">
                      <span
                        className={`text-xl font-black font-mono ${
                          currentCard.color === 'red' ? 'text-rose-500' : 'text-blue-300'
                        }`}
                      >
                        {currentCard.rank}
                      </span>
                      <span
                        className={`text-lg ${
                          currentCard.color === 'red' ? 'text-rose-500' : 'text-blue-300'
                        }`}
                      >
                        {currentCard.suit}
                      </span>
                    </div>

                    {/* Card Center Symbol */}
                    <div className="flex flex-col items-center justify-center -my-2">
                      <span
                        className={`text-5xl font-black font-mono tracking-tight drop-shadow-[0_0_12px_rgba(59,130,246,0.5)] ${
                          currentCard.color === 'red' ? 'text-rose-500' : 'text-blue-300'
                        }`}
                      >
                        {currentCard.rank}
                      </span>
                      <span
                        className={`text-3xl ${
                          currentCard.color === 'red' ? 'text-rose-500' : 'text-blue-300'
                        }`}
                      >
                        {currentCard.suit}
                      </span>
                    </div>

                    {/* Card Bottom Right */}
                    <div className="flex items-center gap-1 justify-end rotate-180">
                      <span
                        className={`text-xl font-black font-mono ${
                          currentCard.color === 'red' ? 'text-rose-500' : 'text-blue-300'
                        }`}
                      >
                        {currentCard.rank}
                      </span>
                      <span
                        className={`text-lg ${
                          currentCard.color === 'red' ? 'text-rose-500' : 'text-blue-300'
                        }`}
                      >
                        {currentCard.suit}
                      </span>
                    </div>

                    {/* Holographic sheen */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.05] to-transparent pointer-events-none rounded-2xl" />
                  </div>
                ) : (
                  /* Deck back */
                  <div className="w-40 h-56 rounded-2xl bg-gradient-to-br from-[#12192c] to-[#0a0d18] border-2 border-blue-500/30 p-3.5 flex flex-col items-center justify-center shadow-xl shadow-blue-500/10 relative overflow-hidden">
                    <div className="w-20 h-28 rounded-xl border border-blue-500/20 bg-blue-500/5 flex items-center justify-center">
                      <Layers className="w-10 h-10 text-blue-400 animate-pulse" />
                    </div>
                    <span className="text-[11px] font-black uppercase text-blue-300 mt-3 tracking-wider">
                      HI-LO DECK
                    </span>
                  </div>
                )}
              </div>

              {/* Controls Area */}
              {!hiloActive ? (
                <button
                  onClick={startHiloGame}
                  disabled={betAmount <= 0 || betAmount > currentUser.coins}
                  className="w-full max-w-sm py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40"
                >
                  Rozpocznij grę ({betAmount.toLocaleString()} monet)
                </button>
              ) : (
                <div className="w-full max-w-md space-y-3">
                  {/* 3 Guess Action Buttons */}
                  <div className="grid grid-cols-3 gap-2">
                    {/* WYŻEJ (▲) */}
                    <button
                      onClick={() => handleHiloGuess('HI')}
                      disabled={isCardDealing || hiloHigherCount === 0}
                      className="flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-b from-cyan-500/20 to-blue-600/20 hover:from-cyan-500/30 hover:to-blue-600/30 border border-cyan-500/40 text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <div className="flex items-center gap-1 text-cyan-400 font-black text-sm">
                        <ChevronUp className="w-4 h-4 stroke-[3]" />
                        <span>WYŻEJ</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-white mt-0.5">
                        {hiloHigherCount > 0 ? `+${hiloHigherMult.toFixed(2)}x` : '0x'}
                      </span>
                      <span className="text-[10px] text-slate-400">{hiloHigherChance}% szans</span>
                    </button>

                    {/* RÓWNA (=) */}
                    <button
                      onClick={() => handleHiloGuess('SAME')}
                      disabled={isCardDealing}
                      className="flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-b from-amber-500/20 to-orange-600/20 hover:from-amber-500/30 hover:to-orange-600/30 border border-amber-500/40 text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <div className="flex items-center gap-1 text-amber-400 font-black text-sm">
                        <Equal className="w-4 h-4 stroke-[3]" />
                        <span>RÓWNA</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-white mt-0.5">+12.00x</span>
                      <span className="text-[10px] text-slate-400">8% szans</span>
                    </button>

                    {/* NIŻEJ (▼) */}
                    <button
                      onClick={() => handleHiloGuess('LO')}
                      disabled={isCardDealing || hiloLowerCount === 0}
                      className="flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-b from-rose-500/20 to-pink-600/20 hover:from-rose-500/30 hover:to-pink-600/30 border border-rose-500/40 text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <div className="flex items-center gap-1 text-rose-400 font-black text-sm">
                        <ChevronDown className="w-4 h-4 stroke-[3]" />
                        <span>NIŻEJ</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-white mt-0.5">
                        {hiloLowerCount > 0 ? `+${hiloLowerMult.toFixed(2)}x` : '0x'}
                      </span>
                      <span className="text-[10px] text-slate-400">{hiloLowerChance}% szans</span>
                    </button>
                  </div>

                  {/* Secondary action: Skip Starting Card or Cashout */}
                  <div className="flex items-center gap-2 pt-1">
                    {hiloHistory.length === 0 ? (
                      <button
                        onClick={skipStartingCard}
                        disabled={isCardDealing}
                        className="w-full py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-40"
                      >
                        <Shuffle className="w-4 h-4 text-blue-400" />
                        <span>Wymień kartę startową</span>
                      </button>
                    ) : (
                      <button
                        onClick={cashoutHilo}
                        disabled={isCardDealing}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <Coins className="w-4 h-4 text-amber-300" />
                        <span>
                          Wypłać {Math.floor(hiloLockedBet * hiloMultiplier).toLocaleString()} monet ({hiloMultiplier.toFixed(2)}x)
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── 6. SCRATCHCARD INTERFACE ── */}
          {game.id === 'scratch' && <ScratchCardGame />}

          {/* ── 7. PUZZLE RUSH INTERFACE ── */}
          {game.id === 'puzzle' && <PuzzleRushGame />}

          {/* ── 8. BLACKJACK INTERFACE ── */}
          {game.id === 'blackjack' && <BlackjackGame />}

          {/* ── 9. NEON TRAIN INTERFACE ── */}
          {game.id === 'train' && <NeonTrainGame />}

          {/* Result Alert Toast */}
          {lastResult && game.id !== 'scratch' && game.id !== 'puzzle' && game.id !== 'blackjack' && game.id !== 'train' && (
            <div
              className={`p-4 rounded-2xl border flex items-center gap-3 animate-fade-in ${
                lastResult.result === 'WIN'
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
              }`}
            >
              {lastResult.result === 'WIN' ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              ) : (
                <XCircle className="w-6 h-6 text-rose-400 shrink-0" />
              )}
              <div className="flex-1 text-left">
                <p className="text-xs font-black uppercase tracking-wider">
                  {lastResult.result === 'WIN' ? 'WYGRANA!' : 'PRZEGRANA'}
                </p>
                <p className="text-xs font-medium">{lastResult.message}</p>
              </div>
            </div>
          )}

          {/* Bet Amount Controls Panel */}
          {game.id !== 'scratch' && game.id !== 'puzzle' && game.id !== 'blackjack' && game.id !== 'train' && (
            <div className="p-4 rounded-2xl bg-[#05070D] border border-white/[0.08] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Stawka zakładu
                </span>
                <span className="text-xs font-mono text-slate-300 flex items-center gap-1">
                  Saldo: <Coins className="w-3.5 h-3.5 text-amber-400" />
                  <strong className="text-white">{currentUser.coins.toLocaleString()}</strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Coins className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min={10}
                    max={currentUser.coins}
                    value={betAmount}
                    disabled={isPlaying || isFlipping || minesActive || isSpinning || hiloActive}
                    onChange={(e) => setBetAmount(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#0D1324] border border-white/[0.08] rounded-xl text-sm font-mono font-bold text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Preset buttons */}
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => handlePreset(0.5)}
                    disabled={isPlaying || isFlipping || minesActive || isSpinning || hiloActive}
                    className="px-3 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-bold text-slate-300"
                  >
                    ½
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePreset(2)}
                    disabled={isPlaying || isFlipping || minesActive || isSpinning || hiloActive}
                    className="px-3 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-bold text-slate-300"
                  >
                    2x
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePreset(-1)}
                    disabled={isPlaying || isFlipping || minesActive || isSpinning || hiloActive}
                    className="px-3 py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold"
                  >
                    MAX
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
