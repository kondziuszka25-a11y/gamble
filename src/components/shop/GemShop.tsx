import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { SHOP_ITEMS } from '../../data/mockData';
import type { ShopItem, BoostCategory } from '../../types';
import {
  Gem,
  Coins,
  Zap,
  Flame,
  Star,
  Gift,
  Shield,
  Rocket,
  Sparkles,
  Crown,
  TrendingUp,
  CheckCircle2,
  Lock,
  Clock,
  ShoppingBag,
  Package,
  Filter,
} from 'lucide-react';

// ── Icon map ────────────────────────────────────────────────────────────────
const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Coins,
  Zap,
  Flame,
  Star,
  Gift,
  Shield,
  Rocket,
  Sparkles,
  Crown,
  TrendingUp,
  Gem,
};

function ItemIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICON_MAP[name] ?? Package;
  return <Icon className={className} />;
}

// ── Category filter config ───────────────────────────────────────────────────
const CATEGORIES: { id: BoostCategory | 'all'; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'all', label: 'Wszystkie', icon: Filter },
  { id: 'coins', label: 'Monety', icon: Coins },
  { id: 'xp', label: 'Doświadczenie', icon: Zap },
  { id: 'luck', label: 'Szczęście', icon: Star },
  { id: 'daily', label: 'Dzienne', icon: Gift },
  { id: 'cosmetic', label: 'Kosmetyczne', icon: Crown },
];

// ── Badge label/color map ────────────────────────────────────────────────────
function BadgeChip({ label }: { label: string }) {
  const colors: Record<string, string> = {
    POPULARNE: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    HOT: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    PREMIUM: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    CZAS: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    EKSKLUZYWNE: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  };
  const cls = colors[label] ?? 'bg-slate-500/20 text-slate-300 border-slate-500/30';
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${cls}`}>
      {label}
    </span>
  );
}

// ── Format time remaining ────────────────────────────────────────────────────
function useTimeLeft(expiresAt?: string) {
  const [now, setNow] = useState(Date.now());
  React.useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);
  if (!expiresAt) return null;
  const diff = new Date(expiresAt).getTime() - now;
  if (diff <= 0) return 'Wygasło';
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  return `${h}h ${m}m`;
}

// ── Single shop card ─────────────────────────────────────────────────────────
function ShopCard({ item, onBuy }: { item: ShopItem; onBuy: (id: string) => void }) {
  const { currentUser, hasBoost } = useGame();
  const owned = hasBoost(item.id);
  const canAfford = currentUser.gems >= item.cost;

  const boost = currentUser.ownedBoosts.find((b) => b.shopItemId === item.id);
  const timeLeft = useTimeLeft(boost?.expiresAt);

  const [flash, setFlash] = useState(false);

  const handleBuy = () => {
    if (owned || !canAfford) return;
    setFlash(true);
    setTimeout(() => setFlash(false), 600);
    onBuy(item.id);
  };

  return (
    <div
      className={`
        relative flex flex-col rounded-2xl border bg-gradient-to-br ${item.color}
        border-white/[0.08] p-5 gap-4 transition-all duration-300
        ${item.glowColor} hover:shadow-lg
        ${flash ? 'scale-[1.03] border-emerald-400/60 shadow-emerald-400/30 shadow-lg' : ''}
        ${owned ? 'opacity-90' : ''}
      `}
    >
      {/* Badge */}
      {item.badge && (
        <div className="absolute top-3 right-3">
          <BadgeChip label={item.badge} />
        </div>
      )}

      {/* Owned overlay tick */}
      {owned && (
        <div className="absolute top-3 left-3">
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            {item.type === 'timed' ? 'AKTYWNY' : 'POSIADASZ'}
          </span>
        </div>
      )}

      {/* Icon + name */}
      <div className="flex items-start gap-3 mt-1">
        <div className="w-12 h-12 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center shrink-0">
          <ItemIcon name={item.icon} className="w-6 h-6 text-white/80" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-black text-white text-sm leading-tight">{item.name}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>
        </div>
      </div>

      {/* Detail description */}
      <p className="text-[11px] text-slate-500 leading-relaxed">
        {item.detailDescription}
      </p>

      {/* Timed indicator */}
      {item.type === 'timed' && (
        <div className="flex items-center gap-1.5 text-cyan-400 text-[11px] font-semibold">
          <Clock className="w-3.5 h-3.5" />
          <span>Czasowy — {item.durationHours}h po aktywacji</span>
        </div>
      )}

      {/* Active timer for timed boosts */}
      {owned && item.type === 'timed' && timeLeft && (
        <div className="px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-center">
          <span className="text-xs font-mono font-bold text-cyan-400">
            ⏱ Pozostało: {timeLeft}
          </span>
        </div>
      )}

      {/* Footer: cost + buy button */}
      <div className="flex items-center justify-between gap-3 mt-auto">
        <div className="flex items-center gap-1.5">
          <Gem className="w-4 h-4 text-cyan-400" />
          <span className="font-mono font-black text-white text-base">{item.cost}</span>
          <span className="text-xs text-slate-400">gemów</span>
        </div>

        <button
          onClick={handleBuy}
          disabled={owned || !canAfford}
          className={`
            px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider
            transition-all duration-200 flex items-center gap-1.5
            ${owned
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 cursor-default'
              : canAfford
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500 hover:scale-105 active:scale-95 shadow-md shadow-purple-900/40'
              : 'bg-slate-800/60 text-slate-500 border border-slate-700/50 cursor-not-allowed'
            }
          `}
        >
          {owned ? (
            <><CheckCircle2 className="w-3.5 h-3.5" /> Posiadasz</>
          ) : canAfford ? (
            <><ShoppingBag className="w-3.5 h-3.5" /> Kup</>
          ) : (
            <><Lock className="w-3.5 h-3.5" /> Za mało gemów</>
          )}
        </button>
      </div>
    </div>
  );
}

// ── Active boosts summary panel ───────────────────────────────────────────────
function ActiveBoostsPanel() {
  const { getActiveBoosts, currentUser } = useGame();
  const active = getActiveBoosts();
  if (active.length === 0) return null;

  return (
    <div className="rounded-2xl bg-[#0D1324] border border-white/[0.08] p-5 space-y-3">
      <div className="flex items-center gap-2.5">
        <Sparkles className="w-5 h-5 text-amber-400" />
        <h3 className="text-base font-black text-white">Aktywne Ulepszenia</h3>
        <span className="px-2 py-0.5 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
          {active.length}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {active.map((boost) => {
          const shopItem = SHOP_ITEMS.find((s) => s.id === boost.shopItemId);
          if (!shopItem) return null;
          return (
            <div
              key={boost.shopItemId}
              className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]"
            >
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${shopItem.color} flex items-center justify-center`}>
                <ItemIcon name={shopItem.icon} className="w-4 h-4 text-white/80" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{shopItem.name}</p>
                <p className="text-[10px] text-slate-400">
                  {shopItem.type === 'permanent' ? 'Trwały' : boost.expiresAt ? `Wygasa wkrótce` : ''}
                </p>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            </div>
          );
        })}
      </div>

      {/* VIP Badge indicator */}
      {currentUser.ownedBoosts.some((b) => b.shopItemId === 'vip_badge' && b.isActive) && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <Crown className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold text-amber-300">Odznaka VIP jest aktywna — widoczna przy Twoim nicku</span>
        </div>
      )}
    </div>
  );
}

// ── Main GemShop component ───────────────────────────────────────────────────
export const GemShop: React.FC = () => {
  const { currentUser, purchaseBoost } = useGame();
  const [activeCategory, setActiveCategory] = useState<BoostCategory | 'all'>('all');
  const [lastPurchased, setLastPurchased] = useState<string | null>(null);

  const handleBuy = (shopItemId: string) => {
    const success = purchaseBoost(shopItemId);
    if (success) {
      setLastPurchased(shopItemId);
      setTimeout(() => setLastPurchased(null), 3000);
    }
  };

  const filteredItems =
    activeCategory === 'all'
      ? SHOP_ITEMS
      : SHOP_ITEMS.filter((i) => i.category === activeCategory);

  return (
    <section className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#12182B] via-[#0D1324] to-[#05070D] border border-white/[0.08] p-6 sm:p-8">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-500 flex items-center justify-center shadow-lg shadow-cyan-900/30">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">Sklep Ulepszeń</h1>
            </div>
            <p className="text-slate-400 text-sm max-w-lg">
              Wydaj gemy na trwałe lub czasowe bonusy, które ulepszą Twoje zarobki, tempo awansu i szczęście w grach.
            </p>
          </div>

          {/* Gem balance */}
          <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-[#090D18] border border-cyan-500/20 shadow-inner shrink-0">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 flex items-center justify-center">
              <Gem className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Twoje Gemy</span>
              <span className="text-2xl font-mono font-black text-cyan-300">{currentUser.gems}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Success toast */}
      {lastPurchased && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-emerald-900/90 border border-emerald-500/40 shadow-2xl shadow-emerald-900/50 backdrop-blur-sm animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <p className="text-sm font-black text-white">Zakup udany!</p>
            <p className="text-xs text-emerald-300">
              {SHOP_ITEMS.find((s) => s.id === lastPurchased)?.name} dodane do Twoich ulepszeń.
            </p>
          </div>
        </div>
      )}

      {/* Active boosts */}
      <ActiveBoostsPanel />

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as BoostCategory | 'all')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200
                ${isActive
                  ? 'bg-purple-600/30 text-purple-200 border border-purple-500/50 shadow-md shadow-purple-900/30'
                  : 'bg-[#0D1324] text-slate-400 border border-white/[0.06] hover:border-white/20 hover:text-white'
                }
              `}
            >
              <Icon className="w-3.5 h-3.5" />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Items grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredItems.map((item) => (
          <ShopCard key={item.id} item={item} onBuy={handleBuy} />
        ))}
      </div>

      {/* Bottom info */}
      <div className="rounded-2xl bg-[#0D1324] border border-white/[0.06] p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <Gem className="w-5 h-5 text-cyan-400 shrink-0" />
        <p className="text-xs text-slate-400 leading-relaxed">
          <strong className="text-slate-200">Jak zdobyć gemy?</strong> Odbieraj dzienne nagrody (Dzień 4 i 7),
          odblokowuj osiągnięcia z nagrodą w gemach, lub zdobądź je przez aktywność na platformie.
          Gemy nie mają wartości pieniężnej — to wyłącznie wirtualna waluta platformy rozrywkowej.
        </p>
      </div>
    </section>
  );
};
