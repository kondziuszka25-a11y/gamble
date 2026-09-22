import React, { useState, useRef } from 'react';
import { useGame } from '../../context/GameContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import confetti from 'canvas-confetti';
import { TrainFront, TrendingUp, Play, Zap, AlertTriangle, CheckCircle2, Coins, ShieldCheck } from 'lucide-react';

interface Station {
  id: number;
  name: string;
  multiplier: number;
  successRate: number; // 0.0 to 1.0
  icon: string;
}

const STATIONS: Station[] = [
  { id: 1, name: 'Cyber Depot', multiplier: 1.18, successRate: 0.90, icon: '🏙️' },
  { id: 2, name: 'Neon District', multiplier: 1.45, successRate: 0.84, icon: '⚡' },
  { id: 3, name: 'Plasma Tunnel', multiplier: 1.90, successRate: 0.78, icon: '🚇' },
  { id: 4, name: 'Acid Docks', multiplier: 2.60, successRate: 0.72, icon: '🧪' },
  { id: 5, name: 'Quantum Viaduct', multiplier: 3.80, successRate: 0.65, icon: '🌉' },
  { id: 6, name: 'Sub-Zero Rails', multiplier: 5.80, successRate: 0.58, icon: '❄️' },
  { id: 7, name: 'Dark Highway', multiplier: 9.50, successRate: 0.50, icon: '🌌' },
  { id: 8, name: 'Neo Terminal', multiplier: 16.00, successRate: 0.42, icon: '👑' },
];

type GameState = 'idle' | 'traveling' | 'station_reached' | 'crashed' | 'cashed_out';

export const NeonTrainGame: React.FC = () => {
  const { currentUser, playSound } = useGame();
  const { refreshUser } = useAuth();

  const [bet, setBet] = useState<number>(100);
  const [currentBet, setCurrentBet] = useState<number>(100);
  const [currentStationIndex, setCurrentStationIndex] = useState<number>(-1);
  const [gameState, setGameState] = useState<GameState>('idle');
  const [crashMessage, setCrashMessage] = useState<string>('');
  const [finalPayout, setFinalPayout] = useState<number>(0);

  const travelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // -------------------------------------------
  // START NEW JOURNEY
  // -------------------------------------------
  const startJourney = () => {
    if (!currentUser || currentUser.coins < bet || bet <= 0 || gameState === 'traveling') return;

    playSound('click');
    setCurrentBet(bet);
    setCurrentStationIndex(-1);
    setCrashMessage('');
    setFinalPayout(0);

    // Proceed to Station 0
    travelToStation(0, bet);
  };

  // -------------------------------------------
  // TRAVEL TO NEXT STATION
  // -------------------------------------------
  const travelToStation = (targetIndex: number, activeBet = currentBet) => {
    setGameState('traveling');
    playSound('tick');

    if (travelTimerRef.current) clearTimeout(travelTimerRef.current);

    travelTimerRef.current = setTimeout(() => {
      const targetStation = STATIONS[targetIndex];
      const isSuccess = Math.random() < targetStation.successRate;

      if (isSuccess) {
        playSound('win');
        setCurrentStationIndex(targetIndex);

        if (targetIndex === STATIONS.length - 1) {
          // Reached Final Terminal!
          finishGame(true, targetStation.multiplier, activeBet, 'DOTARŁEŚ DO KOŃCOWEGO TERMINALA!');
        } else {
          setGameState('station_reached');
        }
      } else {
        // Derail / EMP blast
        playSound('tick');
        setCurrentStationIndex(targetIndex);
        finishGame(
          false,
          0,
          activeBet,
          `Wykolejenie na trasie do: ${targetStation.name}! Pociąg uległ awarii.`
        );
      }
    }, 850);
  };

  // -------------------------------------------
  // CASHOUT / FINISH GAME
  // -------------------------------------------
  const handleCashout = () => {
    if (gameState !== 'station_reached' || currentStationIndex < 0) return;
    const st = STATIONS[currentStationIndex];
    finishGame(true, st.multiplier, currentBet, `Bezpiecznie wysiadłeś na stacji ${st.name}!`);
  };

  const finishGame = async (
    won: boolean,
    mult: number,
    activeBet: number,
    message: string
  ) => {
    const payout = Math.floor(activeBet * mult);
    setFinalPayout(payout);
    setCrashMessage(message);

    if (won) {
      setGameState('cashed_out');
      playSound('win');
      confetti({ particleCount: mult >= 5 ? 120 : 60, spread: 65, origin: { y: 0.6 } });
    } else {
      setGameState('crashed');
    }

    try {
      await api.games.play({
        game: 'Neon Train',
        betAmount: activeBet,
        multiplier: mult,
        payout,
        result: won ? 'WIN' : 'LOSS',
      });
      refreshUser();
    } catch {
      // silent
    }
  };

  const currentStation = currentStationIndex >= 0 ? STATIONS[currentStationIndex] : null;
  const currentMult = currentStation ? currentStation.multiplier : 1.0;
  const currentPotentialPayout = Math.floor(currentBet * currentMult);
  const nextStation = currentStationIndex + 1 < STATIONS.length ? STATIONS[currentStationIndex + 1] : null;

  return (
    <div className="flex flex-col gap-4 py-1">
      {/* ── NEON METRO RAILWAY TRACK ── */}
      <div className="relative rounded-3xl bg-gradient-to-b from-[#060e17] via-[#091522] to-[#040910] border-2 border-cyan-500/30 p-4 sm:p-5 shadow-2xl overflow-hidden min-h-[320px] flex flex-col justify-between">
        {/* Glow & Track lines */}
        <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-amber-400 transition-all duration-700"
            style={{
              width: `${Math.max(5, ((currentStationIndex + 1) / STATIONS.length) * 100)}%`,
            }}
          />
        </div>

        {/* Header HUD */}
        <div className="flex items-center justify-between z-10">
          <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-full border border-cyan-500/30 backdrop-blur-md">
            <TrainFront className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-black tracking-wider text-cyan-300 uppercase">
              {gameState === 'idle'
                ? 'Gotowy do odjazdu'
                : gameState === 'traveling'
                ? 'Pociąg w ruchu...'
                : gameState === 'station_reached'
                ? `Stacja: ${currentStation?.name}`
                : gameState === 'cashed_out'
                ? 'Wypłacono zysk!'
                : 'Pociąg zniszczony!'}
            </span>
          </div>

          <div className="bg-slate-900/80 px-3 py-1.5 rounded-full border border-white/10 text-xs font-mono font-bold text-white">
            Mnożnik: <span className="text-amber-400">{currentStation ? `${currentMult}x` : '1.00x'}</span>
          </div>
        </div>

        {/* ── STATIONS NODE DISPLAY ── */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 my-6 z-10">
          {STATIONS.map((st, idx) => {
            const isPassed = currentStationIndex > idx;
            const isCurrent = currentStationIndex === idx;
            const isTarget = gameState === 'traveling' && currentStationIndex + 1 === idx;
            const isFailed = gameState === 'crashed' && isCurrent;

            return (
              <div
                key={st.id}
                className={`relative flex flex-col items-center p-2 rounded-2xl border transition-all duration-300 ${
                  isFailed
                    ? 'bg-rose-950/80 border-rose-500 text-rose-300 shadow-lg shadow-rose-950/50 scale-105 animate-pulse'
                    : isCurrent
                    ? 'bg-cyan-950/90 border-cyan-400 text-cyan-200 shadow-xl shadow-cyan-500/30 scale-105'
                    : isPassed
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 opacity-90'
                    : isTarget
                    ? 'bg-indigo-950/50 border-fuchsia-400/60 text-slate-300 animate-pulse'
                    : 'bg-slate-900/50 border-white/[0.06] text-slate-500 opacity-60'
                }`}
              >
                {/* Node icon & number */}
                <div className="text-base sm:text-lg mb-1">{st.icon}</div>
                <div className="text-[10px] font-mono font-black text-white">{st.multiplier}x</div>
                <div className="text-[8px] font-medium text-slate-400 text-center truncate max-w-full">
                  {st.name}
                </div>

                {/* Status Dot */}
                <div className="mt-1">
                  {isFailed ? (
                    <AlertTriangle className="w-3 h-3 text-rose-400" />
                  ) : isCurrent || isPassed ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-slate-700" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Status result banner */}
        <div className="z-10 text-center min-h-[50px] flex items-center justify-center">
          {gameState === 'crashed' && (
            <div className="p-2.5 rounded-2xl bg-rose-950/80 border border-rose-500 text-rose-200 text-xs sm:text-sm font-bold shadow-lg shadow-rose-950/40 animate-fade-in">
              💥 {crashMessage}
            </div>
          )}

          {gameState === 'cashed_out' && (
            <div className="p-2.5 rounded-2xl bg-emerald-950/80 border border-emerald-400 text-emerald-200 text-xs sm:text-sm font-bold shadow-lg shadow-emerald-950/40 animate-fade-in">
              🎉 {crashMessage} Wygrano:{' '}
              <span className="text-amber-300 font-black">+{finalPayout.toLocaleString()} monet</span>!
            </div>
          )}

          {gameState === 'station_reached' && (
            <div className="text-xs text-cyan-300 font-medium animate-fade-in flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>
                Pociąg czeka na stacji. Możesz wysiąść i zgarnąć{' '}
                <strong className="text-amber-400 font-mono font-bold">
                  {currentPotentialPayout.toLocaleString()}
                </strong>{' '}
                monet lub ryzykować dalszą trasę!
              </span>
            </div>
          )}

          {gameState === 'traveling' && (
            <div className="text-xs text-fuchsia-300 font-bold animate-pulse flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400 animate-spin" />
              <span>Pociąg mknie przez podziemne tunele...</span>
            </div>
          )}

          {gameState === 'idle' && (
            <div className="text-xs text-slate-400 italic">
              Wybierz stawkę i uruchom Cyber-Maglev, by rozpocząć podróż przez neonowe stacje.
            </div>
          )}
        </div>
      </div>

      {/* ── ACTION CONTROLS ── */}
      {gameState === 'station_reached' ? (
        <div className="grid grid-cols-2 gap-3">
          {/* CASHOUT BUTTON */}
          <button
            onClick={handleCashout}
            className="flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black transition-all shadow-xl shadow-emerald-950/50 hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="flex items-center gap-1.5 text-xs sm:text-sm uppercase tracking-wider text-emerald-100">
              <TrendingUp className="w-4 h-4" />
              <span>Wysiądź i wypłać</span>
            </div>
            <div className="text-base sm:text-lg font-mono text-amber-300 mt-0.5">
              +{currentPotentialPayout.toLocaleString()} monet ({currentMult}x)
            </div>
          </button>

          {/* NEXT STATION BUTTON */}
          <button
            onClick={() => travelToStation(currentStationIndex + 1)}
            className="flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-black transition-all shadow-xl shadow-purple-950/50 hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="flex items-center gap-1.5 text-xs sm:text-sm uppercase tracking-wider text-purple-100">
              <TrainFront className="w-4 h-4" />
              <span>Jedź do {nextStation?.name}</span>
            </div>
            <div className="text-base sm:text-lg font-mono text-cyan-200 mt-0.5">
              Cel: {nextStation?.multiplier}x
            </div>
          </button>
        </div>
      ) : (
        /* BETTING CONTROLS (IDLE, CRASHED, OR CASHED OUT) */
        <div className="p-4 rounded-2xl bg-[#05070D] border border-white/[0.08] space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-400 uppercase tracking-wider">Własna stawka</span>
            <span className="text-slate-300 font-mono flex items-center gap-1">
              Saldo: <Coins className="w-3.5 h-3.5 text-amber-400" />
              <strong className="text-white">{currentUser?.coins?.toLocaleString() ?? 0}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Coins className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                min={10}
                max={currentUser?.coins ?? 1000}
                value={bet}
                disabled={gameState === 'traveling'}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setBet(isNaN(val) ? 0 : Math.max(0, val));
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-[#0D1324] border border-white/[0.08] rounded-xl text-sm font-mono font-bold text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <button
              type="button"
              onClick={() => setBet((b) => Math.max(10, Math.floor(b * 0.5)))}
              disabled={gameState === 'traveling'}
              className="px-3 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-bold text-slate-300"
            >
              ½
            </button>
            <button
              type="button"
              onClick={() => setBet((b) => Math.min(currentUser?.coins ?? 100000, Math.floor(b * 2)))}
              disabled={gameState === 'traveling'}
              className="px-3 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-bold text-slate-300"
            >
              2x
            </button>
            <button
              type="button"
              onClick={() => setBet(currentUser?.coins ?? 100)}
              disabled={gameState === 'traveling'}
              className="px-3 py-2.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 text-xs font-bold"
            >
              MAX
            </button>
          </div>

          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="flex gap-1.5 flex-wrap">
              {[50, 100, 250, 500, 1000].map((v) => (
                <button
                  key={v}
                  onClick={() => setBet(v)}
                  disabled={gameState === 'traveling'}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    bet === v
                      ? 'bg-cyan-600 border-cyan-400 text-white shadow-md shadow-cyan-900/30'
                      : 'bg-slate-800/60 border-slate-700/50 text-slate-400 hover:border-cyan-500/40 hover:text-slate-200'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>

            <button
              onClick={startJourney}
              disabled={!currentUser || (currentUser.coins ?? 0) < bet || bet <= 0 || gameState === 'traveling'}
              className="flex-1 max-w-[220px] py-3 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl font-black text-white text-sm uppercase tracking-wider transition-all shadow-lg shadow-cyan-900/40 flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              {gameState === 'crashed' || gameState === 'cashed_out' ? 'Nowa trasa' : 'Ruszaj w trasę'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
