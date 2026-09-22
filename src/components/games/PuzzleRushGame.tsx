import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../../context/GameContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import confetti from 'canvas-confetti';
import { Brain, Heart, TrendingUp, Play, Check, X, Coins } from 'lucide-react';

// ===========================================
// TYPES
// ===========================================

type PuzzleType = 'MATH' | 'ODD_ONE_OUT' | 'SEQUENCE' | 'MEMORY' | 'STROOP';
type GamePhase = 'idle' | 'playing' | 'result';
type PuzzlePhase = 'show' | 'active' | 'correct' | 'wrong';

interface ColorDef {
  id: string;
  name: string;
  tw: string;
  hex: string;
}

const COLORS: ColorDef[] = [
  { id: 'red', name: 'CZERWONY', tw: 'bg-red-500', hex: '#ef4444' },
  { id: 'blue', name: 'NIEBIESKI', tw: 'bg-blue-500', hex: '#3b82f6' },
  { id: 'green', name: 'ZIELONY', tw: 'bg-green-500', hex: '#22c55e' },
  { id: 'yellow', name: 'ŻÓŁTY', tw: 'bg-yellow-400', hex: '#eab308' },
  { id: 'purple', name: 'FIOLETOWY', tw: 'bg-purple-500', hex: '#a855f7' },
  { id: 'orange', name: 'POMARAŃCZOWY', tw: 'bg-orange-500', hex: '#f97316' },
  { id: 'pink', name: 'RÓŻOWY', tw: 'bg-pink-500', hex: '#ec4899' },
  { id: 'cyan', name: 'TURKUSOWY', tw: 'bg-cyan-500', hex: '#06b6d4' },
];

interface MathPuzzle {
  type: 'MATH';
  a: number;
  b: number;
  op: string;
  answer: number;
  choices: number[];
  timeLimit: number;
}

interface OddPuzzle {
  type: 'ODD_ONE_OUT';
  items: ColorDef[];
  oddIndex: number;
  timeLimit: number;
}

interface SeqPuzzle {
  type: 'SEQUENCE';
  nums: number[];
  answer: number;
  choices: number[];
  timeLimit: number;
}

interface MemoryPuzzle {
  type: 'MEMORY';
  sequence: ColorDef[];
  displaySeq: ColorDef[];
  correctClickOrder: number[];
  timeLimit: number;
}

interface StroopPuzzle {
  type: 'STROOP';
  wordColor: ColorDef;
  inkColor: ColorDef;
  choices: ColorDef[];
  timeLimit: number;
}

type Puzzle = MathPuzzle | OddPuzzle | SeqPuzzle | MemoryPuzzle | StroopPuzzle;

// ===========================================
// HELPERS & GENERATORS
// ===========================================

const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pickN = <T,>(arr: T[], n: number): T[] => shuffle(arr).slice(0, n);

function genMath(round: number): MathPuzzle {
  let a: number, b: number, op: string, answer: number;
  if (round < 5) {
    a = rand(5, 15);
    b = rand(3, 12);
    op = '+';
    answer = a + b;
  } else if (round < 10) {
    a = rand(15, 40);
    b = rand(5, 15);
    op = Math.random() < 0.5 ? '+' : '-';
    answer = op === '+' ? a + b : a - b;
  } else {
    a = rand(3, 12);
    b = rand(2, 9);
    op = '×';
    answer = a * b;
  }
  const ws = new Set<number>();
  while (ws.size < 3) {
    const w = answer + rand(-8, 8);
    if (w !== answer && w > 0) ws.add(w);
  }
  return {
    type: 'MATH',
    a,
    b,
    op,
    answer,
    choices: shuffle([...ws, answer]),
    timeLimit: Math.max(3000, 9000 - round * 130),
  };
}

function genOdd(round: number): OddPuzzle {
  const count = Math.min(6 + Math.floor(round / 3), 9);
  const [main, odd] = pickN(COLORS, 2);
  const oddIndex = rand(0, count - 1);
  const items = Array.from({ length: count }, (_, i) => (i === oddIndex ? odd : main));
  return { type: 'ODD_ONE_OUT', items, oddIndex, timeLimit: Math.max(2500, 7000 - round * 120) };
}

function genSeq(round: number): SeqPuzzle {
  let nums: number[], answer: number;
  const t = rand(0, 2);
  if (t === 0) {
    const s = rand(1, 10),
      d = rand(2, 7);
    nums = [s, s + d, s + 2 * d];
    answer = s + 3 * d;
  } else if (t === 1) {
    const s = rand(2, 4),
      m = rand(2, 3);
    nums = [s, s * m, s * m * m];
    answer = s * m * m * m;
  } else {
    const a = rand(1, 5),
      b = rand(3, 8);
    nums = [a, b, a + b];
    answer = b + a + b;
  }
  const ws = new Set<number>();
  while (ws.size < 3) {
    const w = answer + rand(-6, 9);
    if (w !== answer && w > 0) ws.add(w);
  }
  return {
    type: 'SEQUENCE',
    nums,
    answer,
    choices: shuffle([...ws, answer]),
    timeLimit: Math.max(4000, 10000 - round * 150),
  };
}

function genMemory(round: number): MemoryPuzzle {
  const len = Math.min(3 + Math.floor(round / 3), 6);
  const sequence = pickN(COLORS, len);
  const displaySeq = shuffle([...sequence]);
  const correctClickOrder = sequence.map((c) => displaySeq.findIndex((d) => d.id === c.id));
  return {
    type: 'MEMORY',
    sequence,
    displaySeq,
    correctClickOrder,
    timeLimit: Math.max(4000, 9000 - round * 150),
  };
}

function genStroop(round: number): StroopPuzzle {
  const [wordColor, inkColor] = pickN(COLORS, 2);
  const others = pickN(
    COLORS.filter((c) => c.id !== inkColor.id),
    3
  );
  const choices = shuffle([inkColor, ...others]);
  return { type: 'STROOP', wordColor, inkColor, choices, timeLimit: Math.max(2500, 7000 - round * 100) };
}

function genPuzzle(round: number): Puzzle {
  const types: PuzzleType[] = ['MATH', 'ODD_ONE_OUT', 'SEQUENCE', 'MEMORY', 'STROOP'];
  const type = types[rand(0, types.length - 1)];
  switch (type) {
    case 'MATH':
      return genMath(round);
    case 'ODD_ONE_OUT':
      return genOdd(round);
    case 'SEQUENCE':
      return genSeq(round);
    case 'MEMORY':
      return genMemory(round);
    case 'STROOP':
      return genStroop(round);
  }
}

function comboMult(combo: number): number {
  if (combo < 3) return 1;
  if (combo < 6) return 1.5;
  if (combo < 10) return 2;
  if (combo < 15) return 3;
  return 5;
}

function scoreToMult(score: number): number {
  if (score < 300) return 0;
  if (score < 800) return 0.5;
  if (score < 2000) return 1.0;
  if (score < 5000) return 1.5;
  if (score < 10000) return 2.2;
  if (score < 18000) return 3.5;
  return 5.0;
}

const PUZZLE_META: Record<PuzzleType, { icon: string; title: string; desc: string }> = {
  MATH: { icon: '🔢', title: 'Szybka Matematyka', desc: 'Oblicz wynik!' },
  ODD_ONE_OUT: { icon: '🎯', title: 'Znajdź Intruza', desc: 'Który kolor nie pasuje?' },
  SEQUENCE: { icon: '🔮', title: 'Wzorzec Liczbowy', desc: 'Jaka jest kolejna liczba?' },
  MEMORY: { icon: '🧠', title: 'Pamięć Sekwencji', desc: 'Zapamiętaj kolejność!' },
  STROOP: { icon: '🌈', title: 'Efekt Stroopa', desc: 'Jakiego koloru jest NAPIS?' },
};

export const PuzzleRushGame: React.FC = () => {
  const { currentUser, playSound } = useGame();
  const { refreshUser } = useAuth();

  const [gamePhase, setGamePhase] = useState<GamePhase>('idle');
  const [bet, setBet] = useState(100);

  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [lives, setLives] = useState(3);
  const [round, setRound] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [responseTimes, setResponseTimes] = useState<number[]>([]);

  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [puzzlePhase, setPuzzlePhase] = useState<PuzzlePhase>('active');
  const [timeLeft, setTimeLeft] = useState(1);

  const [memClicks, setMemClicks] = useState<number[]>([]);

  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const livesRef = useRef(3);
  const roundRef = useRef(0);
  const timeLeftRef = useRef(1);
  const puzzleRef = useRef<Puzzle | null>(null);
  const roundStartRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resolvingRef = useRef(false);

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    if (gamePhase !== 'playing' || puzzlePhase !== 'active' || !puzzle) return;
    if (timerRef.current) clearInterval(timerRef.current);
    resolvingRef.current = false;
    const end = Date.now() + puzzle.timeLimit;
    timerRef.current = setInterval(() => {
      const rem = end - Date.now();
      const fraction = Math.max(0, rem / puzzle.timeLimit);
      timeLeftRef.current = fraction;
      if (rem <= 0) {
        clearInterval(timerRef.current!);
        setTimeLeft(0);
        resolveAnswer(false);
      } else {
        setTimeLeft(fraction);
      }
    }, 50);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [puzzle, puzzlePhase, gamePhase]);

  function resolveAnswer(isCorrect: boolean) {
    if (resolvingRef.current) return;
    resolvingRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);

    const rt = Date.now() - roundStartRef.current;
    setTotalCount((t) => t + 1);

    if (isCorrect) {
      playSound('win');
      const newCombo = comboRef.current + 1;
      comboRef.current = newCombo;
      const mult = comboMult(newCombo);
      const bonus = timeLeftRef.current > 0.5 ? 75 : 0;
      const gained = Math.round((150 + bonus) * mult);
      scoreRef.current += gained;
      setScore(scoreRef.current);
      setCombo(newCombo);
      setMaxCombo((m) => Math.max(m, newCombo));
      setCorrectCount((c) => c + 1);
      setResponseTimes((rt2) => [...rt2, rt]);
      setPuzzlePhase('correct');
      setTimeout(() => loadNext(), 500);
    } else {
      playSound('tick');
      comboRef.current = 0;
      setCombo(0);
      livesRef.current -= 1;
      setLives(livesRef.current);
      setPuzzlePhase('wrong');
      if (livesRef.current <= 0) {
        setTimeout(() => doEndGame(), 800);
      } else {
        setTimeout(() => loadNext(), 700);
      }
    }
  }

  function loadNext() {
    resolvingRef.current = false;
    const nextRound = roundRef.current + 1;
    roundRef.current = nextRound;
    setRound(nextRound);
    const p = genPuzzle(nextRound);
    puzzleRef.current = p;
    setPuzzle(p);
    setMemClicks([]);

    if (p.type === 'MEMORY') {
      setPuzzlePhase('show');
      const showMs = (p as MemoryPuzzle).sequence.length * 800 + 600;
      setTimeout(() => {
        roundStartRef.current = Date.now();
        setPuzzlePhase('active');
      }, showMs);
    } else {
      roundStartRef.current = Date.now();
      setPuzzlePhase('active');
    }
  }

  function startGame() {
    if (!currentUser || currentUser.coins < bet) return;
    scoreRef.current = 0;
    comboRef.current = 0;
    livesRef.current = 3;
    roundRef.current = 0;
    resolvingRef.current = false;

    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setLives(3);
    setRound(1);
    setCorrectCount(0);
    setTotalCount(0);
    setResponseTimes([]);
    setGamePhase('playing');

    const p = genPuzzle(1);
    roundRef.current = 1;
    puzzleRef.current = p;
    setPuzzle(p);
    setMemClicks([]);

    if (p.type === 'MEMORY') {
      setPuzzlePhase('show');
      const showMs = (p as MemoryPuzzle).sequence.length * 800 + 600;
      setTimeout(() => {
        roundStartRef.current = Date.now();
        setPuzzlePhase('active');
      }, showMs);
    } else {
      roundStartRef.current = Date.now();
      setPuzzlePhase('active');
    }
  }

  async function doEndGame() {
    if (timerRef.current) clearInterval(timerRef.current);
    setGamePhase('result');
    const finalScore = scoreRef.current;
    const mult = scoreToMult(finalScore);
    const payout = Math.round(bet * mult);
    try {
      await api.games.play({
        game: 'Puzzle Rush',
        betAmount: bet,
        multiplier: mult,
        payout,
        result: payout > bet ? 'WIN' : 'LOSS',
      });
      await refreshUser();
      if (payout > bet) confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    } catch {
      // silent
    }
  }

  function cashout() {
    if (resolvingRef.current) return;
    resolvingRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    doEndGame();
  }

  function handleMemoryClick(displayIdx: number) {
    if (!puzzle || puzzle.type !== 'MEMORY' || puzzlePhase !== 'active') return;
    const p = puzzle as MemoryPuzzle;
    if (memClicks.includes(displayIdx)) return;

    const expected = p.correctClickOrder[memClicks.length];
    if (displayIdx === expected) {
      const next = [...memClicks, displayIdx];
      setMemClicks(next);
      if (next.length === p.sequence.length) {
        resolveAnswer(true);
      }
    } else {
      resolveAnswer(false);
    }
  }

  const currentMult = scoreToMult(score);
  const payout = Math.round(bet * currentMult);
  const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 100;
  const avgRT =
    responseTimes.length > 0
      ? (responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length / 1000).toFixed(2)
      : '—';

  if (gamePhase === 'idle') {
    return (
      <div className="flex flex-col items-center gap-5 py-2">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Brain className="w-7 h-7 text-violet-400" />
            <h2 className="text-2xl font-black text-white">Puzzle Rush</h2>
          </div>
          <p className="text-slate-400 text-sm">Gra czysto logiczna — zero losowości, liczy się refleks i pamięć!</p>
        </div>

        <div className="grid grid-cols-3 gap-2 w-full max-w-xs">
          {(['MATH', 'ODD_ONE_OUT', 'SEQUENCE', 'MEMORY', 'STROOP'] as PuzzleType[]).map((t) => (
            <div key={t} className="bg-slate-800/50 border border-slate-700/40 rounded-xl p-2.5 text-center">
              <div className="text-xl mb-0.5">{PUZZLE_META[t].icon}</div>
              <div className="text-[10px] text-slate-400 leading-tight font-medium">{PUZZLE_META[t].title}</div>
            </div>
          ))}
          <div className="bg-slate-800/50 border border-slate-700/40 rounded-xl p-2.5 text-center">
            <div className="text-xl mb-0.5">❤️</div>
            <div className="text-[10px] text-slate-400 leading-tight font-medium">3 Życia</div>
          </div>
        </div>

        <div className="w-full max-w-xs bg-slate-800/40 border border-slate-700/50 rounded-xl p-3">
          <div className="text-[10px] text-slate-500 font-bold tracking-widest mb-2 text-center">PROGI WYPŁAT</div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            {[
              { pts: '< 300 pkt', m: '0x', neg: true },
              { pts: '300–799', m: '0.5x', neg: true },
              { pts: '800–1 999', m: '1.0x', neg: false },
              { pts: '2 000–4 999', m: '1.5x', neg: false },
              { pts: '5 000–9 999', m: '2.2x', neg: false },
              { pts: '10 000–17 999', m: '3.5x', neg: false },
              { pts: '18 000+', m: '5.0x 🏆', neg: false },
            ].map(({ pts, m, neg }) => (
              <React.Fragment key={pts}>
                <div className="text-slate-500">{pts}</div>
                <div
                  className={`font-bold ${
                    neg ? 'text-red-400' : parseFloat(m) >= 2 ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {m}
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="w-full max-w-xs space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-bold uppercase tracking-wider">Własna stawka</span>
            <span className="text-slate-400">
              Saldo: <span className="text-amber-400 font-semibold">{currentUser?.coins?.toLocaleString() ?? 0}</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="relative flex-1">
              <Coins className="w-4 h-4 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                min={10}
                max={currentUser?.coins ?? 1000}
                value={bet}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setBet(isNaN(val) ? 0 : Math.max(0, val));
                }}
                className="w-full pl-9 pr-2 py-2 bg-slate-800/80 border border-slate-700/60 rounded-xl text-sm font-mono font-bold text-white focus:outline-none focus:border-violet-500"
              />
            </div>
            <button
              type="button"
              onClick={() => setBet((b) => Math.max(10, Math.floor(b * 0.5)))}
              className="px-2.5 py-2 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/50 text-xs font-bold text-slate-300"
            >
              ½
            </button>
            <button
              type="button"
              onClick={() => setBet((b) => Math.min(currentUser?.coins ?? 100000, Math.floor(b * 2)))}
              className="px-2.5 py-2 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/50 text-xs font-bold text-slate-300"
            >
              2x
            </button>
            <button
              type="button"
              onClick={() => setBet(currentUser?.coins ?? 100)}
              className="px-2.5 py-2 rounded-xl bg-violet-600/30 hover:bg-violet-600/40 border border-violet-500/40 text-xs font-bold text-violet-300"
            >
              MAX
            </button>
          </div>

          <div className="flex gap-1.5 justify-center flex-wrap">
            {[50, 100, 250, 500, 1000].map((v) => (
              <button
                key={v}
                onClick={() => setBet(v)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                  bet === v
                    ? 'bg-violet-600 border-violet-400 text-white shadow-md shadow-violet-900/30'
                    : 'bg-slate-800/60 border-slate-700/50 text-slate-400 hover:border-violet-500/40 hover:text-slate-200'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={startGame}
          disabled={!currentUser || (currentUser.coins ?? 0) < bet || bet <= 0}
          className="flex items-center gap-2 px-8 py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl font-bold text-white text-base transition-all shadow-lg shadow-violet-900/40"
        >
          <Play className="w-5 h-5 fill-current" />
          Rozpocznij Rush — {bet.toLocaleString()} monet
        </button>
      </div>
    );
  }

  if (gamePhase === 'result') {
    const finalMult = scoreToMult(score);
    const finalPayout = Math.round(bet * finalMult);
    const profit = finalPayout - bet;
    const won = profit > 0;
    const lost = finalMult === 0;

    return (
      <div className="flex flex-col items-center gap-5 py-2">
        <div className={`text-3xl font-black ${lost ? 'text-red-400' : won ? 'text-emerald-400' : 'text-slate-400'}`}>
          {lost ? '💀 KONIEC GRY' : won ? '🏆 WYGRAŁEŚ!' : '😬 ZWROT STAWKI'}
        </div>

        <div className="w-full max-w-sm bg-gradient-to-br from-violet-950/60 via-slate-900/80 to-slate-900/60 border border-violet-500/30 rounded-2xl p-5 shadow-xl">
          <div className="text-center mb-4">
            <div className="text-[10px] text-violet-400 font-bold tracking-widest mb-1 uppercase">IQ Rush Score</div>
            <div className="text-5xl font-black text-white tracking-tight">{score.toLocaleString()}</div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {[
              { label: 'Ukończone rundy', value: String(round), color: 'text-white' },
              { label: 'Najlepsza seria', value: `×${maxCombo}`, color: 'text-amber-400' },
              { label: 'Poprawność', value: `${accuracy}%`, color: 'text-emerald-400' },
              { label: 'Śr. czas odp.', value: `${avgRT}s`, color: 'text-blue-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-slate-800/50 rounded-xl p-3 text-center">
                <div className="text-slate-500 text-[10px] mb-1 font-medium">{label}</div>
                <div className={`${color} font-bold text-lg`}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        <div
          className={`w-full max-w-sm rounded-xl p-4 text-center border ${
            won
              ? 'bg-emerald-900/25 border-emerald-500/40'
              : lost
              ? 'bg-red-900/20 border-red-500/30'
              : 'bg-slate-800/40 border-slate-700/40'
          }`}
        >
          <div className="text-slate-400 text-sm mb-1">
            Mnożnik wygranej: <span className="text-white font-bold">{finalMult}x</span>
          </div>
          <div className={`text-3xl font-black ${won ? 'text-emerald-400' : lost ? 'text-red-400' : 'text-slate-400'}`}>
            {won ? '+' : ''}
            {profit.toLocaleString()} monet
          </div>
          <div className="text-slate-600 text-xs mt-1">Wypłata całkowita: {finalPayout.toLocaleString()} monet</div>
        </div>

        <button
          onClick={() => setGamePhase('idle')}
          className="px-7 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl text-white font-semibold transition-all"
        >
          Zagraj ponownie
        </button>
      </div>
    );
  }

  if (!puzzle) return null;

  const meta = PUZZLE_META[puzzle.type];
  const timerBg = timeLeft > 0.5 ? 'bg-emerald-500' : timeLeft > 0.25 ? 'bg-amber-400' : 'bg-red-500';
  const cardBorder =
    puzzlePhase === 'correct'
      ? 'border-emerald-500/70'
      : puzzlePhase === 'wrong'
      ? 'border-red-500/70'
      : 'border-violet-500/25';

  return (
    <div className="flex flex-col gap-3 py-1">
      {/* HUD */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-sm">
          <div className="text-center">
            <div className="text-[10px] text-slate-500 font-medium">PUNKTY</div>
            <div className="text-white font-bold">{score.toLocaleString()}</div>
          </div>
          <div className="w-px h-8 bg-slate-700" />
          <div className="text-center">
            <div className="text-[10px] text-slate-500 font-medium">COMBO</div>
            <div
              className={`font-bold ${
                combo >= 10 ? 'text-violet-400' : combo >= 5 ? 'text-amber-400' : 'text-white'
              }`}
            >
              ×{comboMult(combo)}
            </div>
          </div>
          <div className="w-px h-8 bg-slate-700" />
          <div className="text-center">
            <div className="text-[10px] text-slate-500 font-medium">RUNDA</div>
            <div className="text-white font-bold">{round}</div>
          </div>
          <div className="w-px h-8 bg-slate-700" />
          <div className="text-center">
            <div className="text-[10px] text-slate-500 font-medium">ACCURACY</div>
            <div className="text-emerald-400 font-bold">{accuracy}%</div>
          </div>
        </div>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <Heart
              key={i}
              className={`w-5 h-5 transition-all ${
                i < lives ? 'text-red-500 fill-red-500' : 'text-slate-700'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Timer */}
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${timerBg}`}
          style={{ width: `${timeLeft * 100}%`, transition: 'width 0.05s linear' }}
        />
      </div>

      {/* Puzzle Card */}
      <div
        className={`relative bg-slate-800/60 border-2 ${cardBorder} rounded-2xl p-5 min-h-[230px] flex flex-col items-center justify-center gap-4 transition-colors duration-150 overflow-hidden`}
      >
        {puzzlePhase === 'correct' && (
          <div className="absolute inset-0 bg-emerald-500/10 flex items-center justify-center rounded-2xl pointer-events-none">
            <Check className="w-16 h-16 text-emerald-400 drop-shadow-lg" />
          </div>
        )}
        {puzzlePhase === 'wrong' && (
          <div className="absolute inset-0 bg-red-500/10 flex items-center justify-center rounded-2xl pointer-events-none">
            <X className="w-16 h-16 text-red-400 drop-shadow-lg" />
          </div>
        )}

        <div className="text-center">
          <div className="text-2xl mb-1">{meta.icon}</div>
          <div className="text-sm font-bold text-violet-300">{meta.title}</div>
          <div className="text-[11px] text-slate-500">{meta.desc}</div>
        </div>

        {/* MATH */}
        {puzzle.type === 'MATH' && (() => {
          const p = puzzle as MathPuzzle;
          return (
            <div className="flex flex-col items-center gap-3 w-full">
              <div className="text-3xl font-black text-white tracking-wide">
                {p.a} {p.op} {p.b} = <span className="text-violet-400">?</span>
              </div>
              <div className="grid grid-cols-4 gap-2 w-full">
                {p.choices.map((c) => (
                  <button
                    key={c}
                    disabled={puzzlePhase !== 'active'}
                    onClick={() => resolveAnswer(c === p.answer)}
                    className="py-3 bg-slate-700/80 hover:bg-violet-700 active:scale-95 border border-slate-600/50 hover:border-violet-500 rounded-xl text-white font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-default"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          );
        })()}

        {/* ODD ONE OUT */}
        {puzzle.type === 'ODD_ONE_OUT' && (() => {
          const p = puzzle as OddPuzzle;
          const cols = Math.ceil(Math.sqrt(p.items.length));
          return (
            <div className="flex flex-col items-center gap-2 w-full">
              <div
                className="grid gap-2 w-full"
                style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
              >
                {p.items.map((color, i) => (
                  <button
                    key={i}
                    disabled={puzzlePhase !== 'active'}
                    onClick={() => resolveAnswer(i === p.oddIndex)}
                    className={`h-14 rounded-xl border-2 border-transparent hover:border-white/60 active:scale-95 transition-all ${color.tw} disabled:cursor-default`}
                  />
                ))}
              </div>
            </div>
          );
        })()}

        {/* SEQUENCE */}
        {puzzle.type === 'SEQUENCE' && (() => {
          const p = puzzle as SeqPuzzle;
          return (
            <div className="flex flex-col items-center gap-3 w-full">
              <div className="flex items-center gap-2 text-2xl font-black text-white">
                {p.nums.map((n, i) => (
                  <React.Fragment key={i}>
                    <span>{n}</span>
                    <span className="text-slate-600 text-lg">→</span>
                  </React.Fragment>
                ))}
                <span className="text-violet-400 text-3xl">?</span>
              </div>
              <div className="grid grid-cols-4 gap-2 w-full">
                {p.choices.map((c) => (
                  <button
                    key={c}
                    disabled={puzzlePhase !== 'active'}
                    onClick={() => resolveAnswer(c === p.answer)}
                    className="py-3 bg-slate-700/80 hover:bg-violet-700 active:scale-95 border border-slate-600/50 hover:border-violet-500 rounded-xl text-white font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-default"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          );
        })()}

        {/* MEMORY — SHOW */}
        {puzzle.type === 'MEMORY' && puzzlePhase === 'show' && (() => {
          const p = puzzle as MemoryPuzzle;
          return (
            <div className="flex flex-col items-center gap-3">
              <div className="text-xs text-amber-400 font-bold tracking-widest animate-pulse">
                ZAPAMIĘTAJ KOLEJNOŚĆ
              </div>
              <div className="flex gap-2 flex-wrap justify-center">
                {p.sequence.map((c, i) => (
                  <div
                    key={i}
                    className={`w-14 h-14 rounded-xl ${c.tw} flex items-center justify-center text-white font-black text-xl border-2 border-white/30 shadow-lg`}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* MEMORY — ACTIVE */}
        {puzzle.type === 'MEMORY' && puzzlePhase === 'active' && (() => {
          const p = puzzle as MemoryPuzzle;
          return (
            <div className="flex flex-col items-center gap-3 w-full">
              <div className="text-xs text-slate-400">
                Wybierz symbol nr <span className="text-violet-300 font-bold text-sm">{memClicks.length + 1}</span> / {p.sequence.length}
              </div>
              <div className="flex gap-2 flex-wrap justify-center">
                {p.displaySeq.map((c, i) => {
                  const clickedPos = memClicks.indexOf(i);
                  return (
                    <button
                      key={i}
                      onClick={() => handleMemoryClick(i)}
                      disabled={memClicks.includes(i) || puzzlePhase !== 'active'}
                      className={`w-14 h-14 rounded-xl border-2 transition-all font-black text-white text-lg ${
                        clickedPos >= 0
                          ? `${c.tw} border-white/50 opacity-50 cursor-default`
                          : `${c.tw} border-transparent hover:border-white/70 active:scale-95`
                      }`}
                    >
                      {clickedPos >= 0 ? clickedPos + 1 : ''}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* STROOP */}
        {puzzle.type === 'STROOP' && (() => {
          const p = puzzle as StroopPuzzle;
          return (
            <div className="flex flex-col items-center gap-4 w-full">
              <div
                className="text-4xl font-black tracking-widest select-none"
                style={{ color: p.inkColor.hex }}
              >
                {p.wordColor.name}
              </div>
              <div className="grid grid-cols-4 gap-2 w-full">
                {p.choices.map((c) => (
                  <button
                    key={c.id}
                    disabled={puzzlePhase !== 'active'}
                    onClick={() => resolveAnswer(c.id === p.inkColor.id)}
                    className={`h-12 rounded-xl border-2 border-transparent hover:border-white/60 active:scale-95 transition-all ${c.tw} disabled:opacity-60 disabled:cursor-default`}
                  />
                ))}
              </div>
            </div>
          );
        })()}
      </div>

      {/* Cashout */}
      <button
        onClick={cashout}
        disabled={puzzlePhase === 'correct' || puzzlePhase === 'wrong'}
        className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-40 ${
          currentMult >= 1.5
            ? 'bg-emerald-700/80 hover:bg-emerald-600 border border-emerald-500/50 text-white shadow-lg shadow-emerald-900/20'
            : currentMult >= 1
            ? 'bg-slate-700/70 hover:bg-slate-600 border border-slate-600/50 text-slate-200'
            : 'bg-slate-800/50 border border-slate-700/40 text-slate-500'
        }`}
      >
        <TrendingUp className="w-4 h-4" />
        Wypłać — {currentMult}x ({payout.toLocaleString()} monet)
      </button>
    </div>
  );
};
