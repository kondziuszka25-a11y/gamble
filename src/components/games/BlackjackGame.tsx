import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../../context/GameContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import confetti from 'canvas-confetti';
import { Play, Plus, Hand, Zap, Coins } from 'lucide-react';

// ===========================================
// TYPES & CONSTANTS
// ===========================================

type Suit = '♠' | '♥' | '♦' | '♣';

interface Card {
  id: string;
  suit: Suit;
  rank: string;
  value: number; // base value (Ace = 11)
  isAce: boolean;
}

type GameStage = 'betting' | 'player_turn' | 'dealer_turn' | 'result';

const SUITS: { suit: Suit; color: 'red' | 'black' }[] = [
  { suit: '♠', color: 'black' },
  { suit: '♥', color: 'red' },
  { suit: '♦', color: 'red' },
  { suit: '♣', color: 'black' },
];

const RANKS = [
  { rank: '2', val: 2 },
  { rank: '3', val: 3 },
  { rank: '4', val: 4 },
  { rank: '5', val: 5 },
  { rank: '6', val: 6 },
  { rank: '7', val: 7 },
  { rank: '8', val: 8 },
  { rank: '9', val: 9 },
  { rank: '10', val: 10 },
  { rank: 'J', val: 10 },
  { rank: 'Q', val: 10 },
  { rank: 'K', val: 10 },
  { rank: 'A', val: 11 },
];

function createDeck(): Card[] {
  const deck: Card[] = [];
  let counter = 0;
  // 4 decks for realistic shoe
  for (let d = 0; d < 4; d++) {
    for (const s of SUITS) {
      for (const r of RANKS) {
        deck.push({
          id: `${r.rank}-${s.suit}-${d}-${counter++}`,
          suit: s.suit,
          rank: r.rank,
          value: r.val,
          isAce: r.rank === 'A',
        });
      }
    }
  }
  // Shuffle
  return deck.sort(() => Math.random() - 0.5);
}

function calculateHand(cards: Card[]): { total: number; isSoft: boolean; isBlackjack: boolean } {
  let total = 0;
  let aces = 0;

  for (const c of cards) {
    total += c.value;
    if (c.isAce) aces++;
  }

  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }

  const isSoft = aces > 0;
  const isBlackjack = cards.length === 2 && total === 21;

  return { total, isSoft, isBlackjack };
}

// ===========================================
// COMPONENT
// ===========================================

export const BlackjackGame: React.FC = () => {
  const { currentUser, playSound } = useGame();
  const { refreshUser } = useAuth();

  // Betting
  const [bet, setBet] = useState<number>(100);
  const [currentBet, setCurrentBet] = useState<number>(100);

  // Deck & Hands
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [isDealerHoleCardRevealed, setIsDealerHoleCardRevealed] = useState<boolean>(false);

  // Game state
  const [stage, setStage] = useState<GameStage>('betting');
  const [resultText, setResultText] = useState<string>('');
  const [resultType, setResultType] = useState<'win' | 'lose' | 'push' | 'bj'>('lose');
  const [payoutAmount, setPayoutAmount] = useState<number>(0);

  // Animation & locks
  const [isDealing, setIsDealing] = useState<boolean>(false);
  const dealerIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup
  useEffect(() => {
    return () => {
      if (dealerIntervalRef.current) clearTimeout(dealerIntervalRef.current);
    };
  }, []);

  // Helper to draw a card
  const drawCard = (currentDeck: Card[]): { card: Card; remainingDeck: Card[] } => {
    let d = currentDeck;
    if (d.length < 15) {
      d = createDeck();
    }
    const [card, ...remainingDeck] = d;
    return { card, remainingDeck };
  };

  // -------------------------------------------
  // START DEAL
  // -------------------------------------------
  const startDeal = () => {
    if (!currentUser || currentUser.coins < bet || isDealing) return;

    playSound('click');
    setIsDealing(true);
    setCurrentBet(bet);
    setResultText('');
    setPayoutAmount(0);
    setIsDealerHoleCardRevealed(false);

    let currentDeck = deck.length > 20 ? [...deck] : createDeck();

    const d1 = drawCard(currentDeck);
    const pCard1 = d1.card;
    const d2 = drawCard(d1.remainingDeck);
    const dCard1 = d2.card;
    const d3 = drawCard(d2.remainingDeck);
    const pCard2 = d3.card;
    const d4 = drawCard(d3.remainingDeck);
    const dCard2 = d4.card; // hole card

    setDeck(d4.remainingDeck);

    // Staggered deal animation
    setPlayerHand([pCard1]);
    setDealerHand([]);

    setTimeout(() => {
      playSound('tick');
      setDealerHand([dCard1]);
    }, 250);

    setTimeout(() => {
      playSound('tick');
      setPlayerHand([pCard1, pCard2]);
    }, 500);

    setTimeout(() => {
      playSound('tick');
      setDealerHand([dCard1, dCard2]);
      setIsDealing(false);

      const pScore = calculateHand([pCard1, pCard2]);
      const dScore = calculateHand([dCard1, dCard2]);

      // Check initial Blackjacks
      if (pScore.isBlackjack) {
        setIsDealerHoleCardRevealed(true);
        if (dScore.isBlackjack) {
          endGame('push', [pCard1, pCard2], [dCard1, dCard2], bet, 'Remis — Obaj macie Blackjacka!');
        } else {
          endGame('bj', [pCard1, pCard2], [dCard1, dCard2], bet, 'BLACKJACK! Naturalne 21!');
        }
      } else {
        setStage('player_turn');
      }
    }, 750);
  };

  // -------------------------------------------
  // PLAYER ACTIONS
  // -------------------------------------------

  const handleHit = () => {
    if (stage !== 'player_turn' || isDealing) return;
    playSound('tick');

    const { card, remainingDeck } = drawCard(deck);
    setDeck(remainingDeck);
    const updatedHand = [...playerHand, card];
    setPlayerHand(updatedHand);

    const { total } = calculateHand(updatedHand);
    if (total > 21) {
      // Bust
      setIsDealerHoleCardRevealed(true);
      endGame('lose', updatedHand, dealerHand, currentBet, 'Fura! Przekroczyłeś 21.');
    } else if (total === 21) {
      // Auto stand on 21
      handleStand(updatedHand);
    }
  };

  const handleStand = (currentHand = playerHand) => {
    if (stage !== 'player_turn' && !currentHand) return;
    playSound('click');
    setStage('dealer_turn');
    setIsDealerHoleCardRevealed(true);

    // Run dealer AI
    runDealerTurn(currentHand, dealerHand, deck);
  };

  const handleDoubleDown = () => {
    if (stage !== 'player_turn' || playerHand.length !== 2 || isDealing) return;
    if (!currentUser || currentUser.coins < currentBet * 2) return;

    playSound('click');
    const doubledBet = currentBet * 2;
    setCurrentBet(doubledBet);

    const { card, remainingDeck } = drawCard(deck);
    setDeck(remainingDeck);
    const updatedHand = [...playerHand, card];
    setPlayerHand(updatedHand);

    const { total } = calculateHand(updatedHand);
    if (total > 21) {
      setIsDealerHoleCardRevealed(true);
      endGame('lose', updatedHand, dealerHand, doubledBet, 'Fura po podwojeniu! Przekroczyłeś 21.');
    } else {
      setIsDealerHoleCardRevealed(true);
      setStage('dealer_turn');
      runDealerTurn(updatedHand, dealerHand, remainingDeck, doubledBet);
    }
  };

  // -------------------------------------------
  // DEALER AI (Stands on 17+)
  // -------------------------------------------
  const runDealerTurn = (
    finalPlayerHand: Card[],
    currentDealerHand: Card[],
    activeDeck: Card[],
    finalBet = currentBet
  ) => {
    let dHand = [...currentDealerHand];
    let curDeck = [...activeDeck];

    const step = () => {
      const { total } = calculateHand(dHand);

      if (total < 17) {
        playSound('tick');
        const draw = drawCard(curDeck);
        curDeck = draw.remainingDeck;
        dHand = [...dHand, draw.card];
        setDealerHand(dHand);
        setDeck(curDeck);

        dealerIntervalRef.current = setTimeout(step, 650);
      } else {
        // Dealer finished
        evaluateWinner(finalPlayerHand, dHand, finalBet);
      }
    };

    dealerIntervalRef.current = setTimeout(step, 600);
  };

  // -------------------------------------------
  // EVALUATION & END GAME
  // -------------------------------------------
  const evaluateWinner = (pHand: Card[], dHand: Card[], activeBet: number) => {
    const p = calculateHand(pHand);
    const d = calculateHand(dHand);

    if (d.total > 21) {
      endGame('win', pHand, dHand, activeBet, `Krupier przekroczył 21 (${d.total})! Wygrałeś!`);
    } else if (p.total > d.total) {
      endGame('win', pHand, dHand, activeBet, `Wygrałeś! ${p.total} vs ${d.total}`);
    } else if (p.total < d.total) {
      endGame('lose', pHand, dHand, activeBet, `Krupier wygrywa: ${d.total} vs ${p.total}`);
    } else {
      endGame('push', pHand, dHand, activeBet, `Remis (${p.total} = ${d.total}) — zwrot stawki.`);
    }
  };

  const endGame = async (
    type: 'win' | 'lose' | 'push' | 'bj',
    _pHand: Card[],
    _dHand: Card[],
    activeBet: number,
    message: string
  ) => {
    setStage('result');
    setResultType(type);
    setResultText(message);

    let mult = 0;
    if (type === 'bj') mult = 2.4; // Slightly balanced from 2.5
    else if (type === 'win') mult = 2.0;
    else if (type === 'push') mult = 1.0;
    else mult = 0;

    const payout = Math.floor(activeBet * mult);
    setPayoutAmount(payout);

    if (type === 'win' || type === 'bj') {
      playSound('win');
      confetti({ particleCount: type === 'bj' ? 120 : 70, spread: 60, origin: { y: 0.6 } });
    }

    try {
      await api.games.play({
        game: 'Blackjack',
        betAmount: activeBet,
        multiplier: mult,
        payout,
        result: payout >= activeBet ? 'WIN' : 'LOSS',
      });
      refreshUser();
    } catch {
      // silent
    }
  };

  const pScore = calculateHand(playerHand);
  const dScore = calculateHand(isDealerHoleCardRevealed ? dealerHand : dealerHand.slice(0, 1));

  // -------------------------------------------
  // CARD RENDER COMPONENT
  // -------------------------------------------
  const renderCard = (card: Card, isHidden = false, key?: string) => {
    if (isHidden) {
      return (
        <div
          key={key || 'hidden'}
          className="w-16 sm:w-20 h-24 sm:h-28 rounded-xl bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 border-2 border-indigo-500/40 shadow-xl flex items-center justify-center select-none transform transition-transform hover:scale-105"
        >
          <div className="w-10 sm:w-14 h-18 sm:h-22 rounded-lg border border-indigo-400/20 flex items-center justify-center">
            <span className="text-xl text-indigo-400/60 font-black">?</span>
          </div>
        </div>
      );
    }

    const isRed = card.suit === '♥' || card.suit === '♦';

    return (
      <div
        key={key || card.id}
        className="w-16 sm:w-20 h-24 sm:h-28 rounded-xl bg-slate-50 text-slate-900 border-2 border-slate-200/80 shadow-2xl flex flex-col justify-between p-2 select-none font-bold transform transition-transform hover:-translate-y-1"
      >
        <div className="flex justify-between items-start leading-none">
          <span className={`text-sm sm:text-base font-black ${isRed ? 'text-rose-600' : 'text-slate-900'}`}>
            {card.rank}
          </span>
          <span className={`text-sm ${isRed ? 'text-rose-600' : 'text-slate-900'}`}>{card.suit}</span>
        </div>

        <div className={`text-2xl sm:text-3xl text-center leading-none ${isRed ? 'text-rose-600' : 'text-slate-900'}`}>
          {card.suit}
        </div>

        <div className="flex justify-between items-end leading-none rotate-180">
          <span className={`text-sm sm:text-base font-black ${isRed ? 'text-rose-600' : 'text-slate-900'}`}>
            {card.rank}
          </span>
          <span className={`text-sm ${isRed ? 'text-rose-600' : 'text-slate-900'}`}>{card.suit}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4 py-1">
      {/* ── TABLE FELT ARENA ── */}
      <div className="relative rounded-3xl bg-gradient-to-b from-[#091a13] via-[#0b241b] to-[#06140f] border-2 border-emerald-500/30 p-4 sm:p-6 shadow-2xl overflow-hidden min-h-[360px] flex flex-col justify-between">
        {/* Felt watermark & border ring */}
        <div className="absolute inset-4 rounded-2xl border border-emerald-500/10 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-500/[0.04] text-7xl sm:text-8xl font-black pointer-events-none select-none tracking-widest">
          BLACKJACK
        </div>

        {/* ── DEALER SECTION ── */}
        <div className="flex flex-col items-center gap-2 z-10">
          <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full border border-emerald-500/20 backdrop-blur-md">
            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">Krupier</span>
            {dealerHand.length > 0 && (
              <span className="text-xs font-black text-amber-400">
                {isDealerHoleCardRevealed ? dScore.total : dScore.total}
              </span>
            )}
          </div>

          <div className="flex gap-2 justify-center min-h-[100px] sm:min-h-[115px] items-center">
            {dealerHand.map((c, i) => {
              const isHole = i === 1 && !isDealerHoleCardRevealed;
              return renderCard(c, isHole, c.id);
            })}
            {dealerHand.length === 0 && (
              <div className="text-xs text-emerald-500/40 italic font-medium py-8">Czeka na rozdanie...</div>
            )}
          </div>
        </div>

        {/* ── CENTER RESULT BANNER ── */}
        {resultText && (
          <div className="my-2 z-20 flex flex-col items-center animate-fade-in">
            <div
              className={`px-5 py-2.5 rounded-2xl border text-center shadow-2xl backdrop-blur-md ${
                resultType === 'bj'
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-amber-500/30'
                  : resultType === 'win'
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-emerald-500/30'
                  : resultType === 'push'
                  ? 'bg-blue-500/20 border-blue-400 text-blue-300 shadow-blue-500/30'
                  : 'bg-rose-500/20 border-rose-400 text-rose-300 shadow-rose-500/30'
              }`}
            >
              <div className="text-sm sm:text-base font-black tracking-wide">{resultText}</div>
              {payoutAmount > 0 && (
                <div className="text-xs font-bold text-amber-400 mt-0.5">
                  +{payoutAmount.toLocaleString()} monet
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── PLAYER SECTION ── */}
        <div className="flex flex-col items-center gap-2 z-10">
          <div className="flex gap-2 justify-center min-h-[100px] sm:min-h-[115px] items-center">
            {playerHand.map((c) => renderCard(c, false, c.id))}
            {playerHand.length === 0 && (
              <div className="text-xs text-emerald-500/40 italic font-medium py-8">Twoje karty pojawią się tutaj</div>
            )}
          </div>

          <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full border border-emerald-500/20 backdrop-blur-md">
            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">Gracz</span>
            {playerHand.length > 0 && (
              <span
                className={`text-xs font-black ${
                  pScore.total > 21 ? 'text-rose-400' : pScore.total === 21 ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                {pScore.total} {pScore.isSoft && pScore.total < 21 ? '(Soft)' : ''}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── CONTROLS & BET PANEL ── */}
      {stage === 'betting' || stage === 'result' ? (
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
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setBet(isNaN(val) ? 0 : Math.max(0, val));
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-[#0D1324] border border-white/[0.08] rounded-xl text-sm font-mono font-bold text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <button
              type="button"
              onClick={() => setBet((b) => Math.max(10, Math.floor(b * 0.5)))}
              className="px-3 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-bold text-slate-300"
            >
              ½
            </button>
            <button
              type="button"
              onClick={() => setBet((b) => Math.min(currentUser?.coins ?? 100000, Math.floor(b * 2)))}
              className="px-3 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-bold text-slate-300"
            >
              2x
            </button>
            <button
              type="button"
              onClick={() => setBet(currentUser?.coins ?? 100)}
              className="px-3 py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold"
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
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    bet === v
                      ? 'bg-emerald-600 border-emerald-400 text-white shadow-md shadow-emerald-900/30'
                      : 'bg-slate-800/60 border-slate-700/50 text-slate-400 hover:border-emerald-500/40 hover:text-slate-200'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>

            <button
              onClick={startDeal}
              disabled={!currentUser || (currentUser.coins ?? 0) < bet || bet <= 0 || isDealing}
              className="flex-1 max-w-[200px] py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl font-black text-white text-sm uppercase tracking-wider transition-all shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              {stage === 'result' ? 'Rozdaj ponownie' : 'Rozdaj'}
            </button>
          </div>
        </div>
      ) : (
        /* ── IN-GAME PLAYER ACTION BUTTONS ── */
        <div className="grid grid-cols-3 gap-2">
          {/* HIT */}
          <button
            onClick={handleHit}
            disabled={stage !== 'player_turn' || isDealing}
            className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-gradient-to-b from-emerald-600/30 to-teal-700/30 hover:from-emerald-600/40 hover:to-teal-700/40 border border-emerald-500/50 text-white transition-all active:scale-95 disabled:opacity-40 shadow-lg shadow-emerald-950/40"
          >
            <div className="flex items-center gap-1.5 text-emerald-400 font-black text-sm sm:text-base">
              <Plus className="w-5 h-5 stroke-[3]" />
              <span>DOBIERZ</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5">Dodatkowa karta</span>
          </button>

          {/* STAND */}
          <button
            onClick={() => handleStand()}
            disabled={stage !== 'player_turn' || isDealing}
            className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-gradient-to-b from-amber-600/30 to-orange-700/30 hover:from-amber-600/40 hover:to-orange-700/40 border border-amber-500/50 text-white transition-all active:scale-95 disabled:opacity-40 shadow-lg shadow-amber-950/40"
          >
            <div className="flex items-center gap-1.5 text-amber-400 font-black text-sm sm:text-base">
              <Hand className="w-5 h-5 stroke-[3]" />
              <span>PAS</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5">Zakończ turę</span>
          </button>

          {/* DOUBLE DOWN */}
          <button
            onClick={handleDoubleDown}
            disabled={
              stage !== 'player_turn' ||
              playerHand.length !== 2 ||
              isDealing ||
              !currentUser ||
              currentUser.coins < currentBet * 2
            }
            className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-gradient-to-b from-purple-600/30 to-indigo-700/30 hover:from-purple-600/40 hover:to-indigo-700/40 border border-purple-500/50 text-white transition-all active:scale-95 disabled:opacity-40 shadow-lg shadow-purple-950/40"
          >
            <div className="flex items-center gap-1.5 text-purple-300 font-black text-sm sm:text-base">
              <Zap className="w-5 h-5 stroke-[3]" />
              <span>PODWÓJ</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5">1 karta i podwójny zakład</span>
          </button>
        </div>
      )}
    </div>
  );
};
