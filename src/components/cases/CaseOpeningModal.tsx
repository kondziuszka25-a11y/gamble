import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../../context/GameContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { ArtifactVisual } from '../ui/ArtifactVisual';
import { getRarityStyle } from '../../utils/rarity';
import confetti from 'canvas-confetti';
import {
  X,
  Coins,
  Gem,
  Package,
  Sparkles,
  DollarSign,
  RotateCcw,
} from 'lucide-react';
import type { CollectibleItem } from '../../types';

export interface CaseDropItem {
  name: string;
  category: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  value: number;
  iconType: string;
  description: string;
  weight: number;
}

export interface CaseDefinition {
  id: string;
  name: string;
  description: string;
  priceCoins: number;
  priceGems: number;
  badge?: string;
  color: string;
  glowColor: string;
  items: CaseDropItem[];
}

interface CaseOpeningModalProps {
  caseDef: CaseDefinition;
  onClose: () => void;
}

const ITEM_WIDTH = 140; // width of each card in carousel in px
const WIN_INDEX = 35; // index where the winning item will land

export const CaseOpeningModal: React.FC<CaseOpeningModalProps> = ({ caseDef, onClose }) => {
  const { currentUser, playSound } = useGame();
  const { refreshUser } = useAuth();

  const [isSpinning, setIsSpinning] = useState(false);
  const [carouselItems, setCarouselItems] = useState<CaseDropItem[]>([]);
  const [carouselOffset, setCarouselOffset] = useState(0);
  const [wonItem, setWonItem] = useState<CollectibleItem | null>(null);
  const [hasSoldWonItem, setHasSoldWonItem] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Generate initial carousel strip
  useEffect(() => {
    generateInitialStrip();
  }, [caseDef]);

  const generateInitialStrip = () => {
    const pool = caseDef.items;
    const initial: CaseDropItem[] = [];
    for (let i = 0; i < 50; i++) {
      initial.push(pool[Math.floor(Math.random() * pool.length)]);
    }
    setCarouselItems(initial);
    setCarouselOffset(0);
    setWonItem(null);
    setHasSoldWonItem(false);
    setErrorMsg(null);
  };

  const handleOpenCase = async () => {
    if (isSpinning) return;
    setErrorMsg(null);

    // Validate balance
    if (caseDef.priceCoins > 0 && currentUser.coins < caseDef.priceCoins) {
      setErrorMsg('Niewystarczające saldo monet!');
      return;
    }
    if (caseDef.priceGems > 0 && currentUser.gems < caseDef.priceGems) {
      setErrorMsg('Niewystarczające saldo gemów!');
      return;
    }

    setIsSpinning(true);
    setWonItem(null);
    setHasSoldWonItem(false);

    try {
      // Call backend to determine drop and persist in SQLite
      const res = await api.cases.open(caseDef.id);
      const targetWon = res.wonItem;

      // Build roulette strip with targetWon at WIN_INDEX
      const pool = caseDef.items;
      const strip: CaseDropItem[] = [];
      for (let i = 0; i < 50; i++) {
        if (i === WIN_INDEX) {
          strip.push({
            name: targetWon.name,
            category: targetWon.category,
            rarity: targetWon.rarity,
            value: targetWon.value,
            iconType: targetWon.iconType,
            description: targetWon.description,
            weight: 1,
          });
        } else {
          strip.push(pool[Math.floor(Math.random() * pool.length)]);
        }
      }
      setCarouselItems(strip);

      // Sound ticks
      let tickCount = 0;
      const tickInterval = setInterval(() => {
        playSound('tick');
        tickCount++;
        if (tickCount > 25) clearInterval(tickInterval);
      }, 150);

      // Random offset within the winning card (-40px to +40px)
      const containerWidth = containerRef.current ? containerRef.current.clientWidth : 600;
      const centerTarget = containerWidth / 2;
      const randomJitter = (Math.random() - 0.5) * 60;
      const finalTranslate = WIN_INDEX * ITEM_WIDTH + ITEM_WIDTH / 2 - centerTarget + randomJitter;

      // Trigger spin
      setTimeout(() => {
        setCarouselOffset(finalTranslate);
      }, 50);

      // When spin finishes (~5s)
      setTimeout(() => {
        clearInterval(tickInterval);
        setIsSpinning(false);
        setWonItem({
          id: targetWon.id,
          name: targetWon.name,
          category: targetWon.category,
          rarity: targetWon.rarity,
          value: targetWon.value,
          iconType: targetWon.iconType,
          description: targetWon.description,
          obtainedAt: targetWon.obtainedAt,
        });

        playSound('win');
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });

        refreshUser();
      }, 5000);
    } catch (err: any) {
      setIsSpinning(false);
      setErrorMsg(err.message || 'Błąd podczas otwierania skrzynki');
    }
  };

  const handleInstantSell = async () => {
    if (!wonItem || hasSoldWonItem) return;
    try {
      await api.inventory.sell(wonItem.id);
      setHasSoldWonItem(true);
      playSound('cash');
      refreshUser();
    } catch (err: any) {
      setErrorMsg('Nie udało się sprzedać przedmiotu');
    }
  };

  const canAfford =
    (caseDef.priceCoins === 0 || currentUser.coins >= caseDef.priceCoins) &&
    (caseDef.priceGems === 0 || currentUser.gems >= caseDef.priceGems);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl rounded-3xl bg-[#0D1324] border border-purple-500/30 p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[95vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-pink-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white">{caseDef.name}</h2>
                {caseDef.badge && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {caseDef.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">{caseDef.description}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isSpinning}
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/10 text-slate-400 hover:text-white transition-colors disabled:opacity-30"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-center">
            {errorMsg}
          </div>
        )}

        {/* ── CS2/G4SKINS HORIZONTAL CAROUSEL REEL ── */}
        <div className="relative rounded-2xl bg-[#05070D] border border-white/[0.08] p-3 mb-6 overflow-hidden">
          {/* Top & Bottom Center Needle Marker */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30 w-0 h-0 border-x-8 border-x-transparent border-t-[14px] border-t-pink-500 drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-30 w-0 h-0 border-x-8 border-x-transparent border-b-[14px] border-b-pink-500 drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]" />

          {/* Center Guide Line */}
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 z-20 w-[2px] bg-gradient-to-b from-pink-500 via-purple-500 to-pink-500 opacity-70 pointer-events-none" />

          {/* Shadow gradients on edges */}
          <div className="absolute top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-[#05070D] to-transparent z-10 pointer-events-none" />
          <div className="absolute top-0 bottom-0 right-0 w-24 bg-gradient-to-l from-[#05070D] to-transparent z-10 pointer-events-none" />

          {/* Strip Carousel Container */}
          <div ref={containerRef} className="w-full overflow-hidden py-2">
            <div
              className="flex items-center gap-0 will-change-transform"
              style={{
                transform: `translateX(-${carouselOffset}px)`,
                transition: isSpinning ? 'transform 4900ms cubic-bezier(0.12, 0.8, 0.33, 1)' : 'none',
              }}
            >
              {carouselItems.map((item, idx) => {
                const rarityStyle = getRarityStyle(item.rarity);
                const mockItem: CollectibleItem = {
                  id: `strip-${idx}`,
                  name: item.name,
                  category: item.category,
                  rarity: item.rarity,
                  value: item.value,
                  iconType: item.iconType,
                  description: item.description,
                };

                return (
                  <div
                    key={idx}
                    className="shrink-0 flex flex-col items-center justify-center p-3 rounded-xl border border-white/[0.06] bg-[#090D18] mx-1 transition-all"
                    style={{
                      width: `${ITEM_WIDTH - 8}px`,
                      height: '140px',
                      boxShadow: `inset 0 -3px 0 ${rarityStyle.color}`,
                    }}
                  >
                    <div className="w-16 h-16 flex items-center justify-center mb-1">
                      <ArtifactVisual item={mockItem} size="sm" showGlow={false} />
                    </div>
                    <span className="text-[11px] font-bold text-white text-center truncate w-full">
                      {item.name}
                    </span>
                    <span
                      className="text-[9px] font-black uppercase tracking-wider mt-0.5"
                      style={{ color: rarityStyle.color }}
                    >
                      {rarityStyle.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── WON ITEM ANNOUNCEMENT CARD ── */}
        {wonItem && (
          <div className="mb-6 p-5 rounded-2xl bg-gradient-to-br from-purple-950/40 via-[#0D1324] to-[#05070D] border border-purple-500/40 animate-fade-in flex flex-col sm:flex-row items-center gap-5">
            <div className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 flex items-center justify-center bg-white/[0.03] rounded-2xl border border-white/[0.08]">
              <ArtifactVisual item={wonItem} size="md" />
            </div>

            <div className="flex-1 text-center sm:text-left">
              <span
                className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border inline-block mb-1"
                style={{
                  color: getRarityStyle(wonItem.rarity).color,
                  borderColor: `${getRarityStyle(wonItem.rarity).color}40`,
                  backgroundColor: `${getRarityStyle(wonItem.rarity).color}15`,
                }}
              >
                {getRarityStyle(wonItem.rarity).name} • {wonItem.category}
              </span>
              <h3 className="text-lg sm:text-xl font-black text-white">{wonItem.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5 mb-2">{wonItem.description}</p>
              <div className="flex items-center justify-center sm:justify-start gap-1 text-amber-300 font-mono font-bold text-sm">
                <Coins className="w-4 h-4 text-amber-400" />
                <span>Wartość: +{wonItem.value.toLocaleString()} monet</span>
              </div>
            </div>

            {/* Action buttons for won item */}
            <div className="flex flex-col gap-2 w-full sm:w-auto shrink-0">
              <button
                onClick={handleInstantSell}
                disabled={hasSoldWonItem}
                className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                  hasSoldWonItem
                    ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-default'
                    : 'bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 border border-amber-500/30'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>{hasSoldWonItem ? 'Sprzedano' : `Sprzedaj (+${wonItem.value.toLocaleString()})`}</span>
              </button>

              <button
                onClick={() => {
                  generateInitialStrip();
                }}
                className="px-4 py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Otwórz jeszcze raz</span>
              </button>
            </div>
          </div>
        )}

        {/* ── ACTION BUTTON: OPEN CASE ── */}
        {!wonItem && (
          <div className="flex items-center justify-between gap-4 mb-6 p-4 rounded-2xl bg-[#05070D] border border-white/[0.08]">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                Cena otwarcia
              </span>
              <div className="flex items-center gap-1.5 text-base font-mono font-black text-white">
                {caseDef.priceCoins > 0 && (
                  <span className="flex items-center gap-1 text-amber-400">
                    <Coins className="w-4 h-4" />
                    {caseDef.priceCoins.toLocaleString()} monet
                  </span>
                )}
                {caseDef.priceGems > 0 && (
                  <span className="flex items-center gap-1 text-cyan-400">
                    <Gem className="w-4 h-4" />
                    {caseDef.priceGems} gemów
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={handleOpenCase}
              disabled={isSpinning || !canAfford}
              className={`px-8 py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider shadow-xl transition-all flex items-center gap-2 ${
                isSpinning
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : canAfford
                  ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-900/40 hover:scale-105 active:scale-95'
                  : 'bg-slate-800/60 text-slate-500 border border-slate-700/50 cursor-not-allowed'
              }`}
            >
              {isSpinning ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Losowanie...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Otwórz skrzynię</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* ── PREVIEW OF POSSIBLE DROPS ── */}
        <div className="border-t border-white/[0.08] pt-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-3">
            Możliwy drop z tej skrzyni:
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 overflow-y-auto max-h-40 pr-1">
            {caseDef.items.map((drop, idx) => {
              const rarityStyle = getRarityStyle(drop.rarity);
              return (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center gap-2.5"
                >
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: rarityStyle.color }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate">{drop.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      +{drop.value.toLocaleString()} monet
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
