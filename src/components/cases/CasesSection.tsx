import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { CaseOpeningModal } from './CaseOpeningModal';
import type { CaseDefinition } from './CaseOpeningModal';
import { Package, Coins, Gem, ArrowRight } from 'lucide-react';
import { getRarityStyle } from '../../utils/rarity';

// Fallback cases catalogue
const FALLBACK_CASES: CaseDefinition[] = [
  {
    id: 'starter_crate',
    name: 'Cybernetyczny Pakiet',
    description: 'Tania skrzynka na start dla każdego gracza.',
    priceCoins: 500,
    priceGems: 0,
    badge: 'START',
    color: 'from-blue-600/30 via-slate-800 to-transparent',
    glowColor: 'hover:border-blue-500/50 hover:shadow-blue-500/25',
    items: [
      { name: 'Krzemowy Chip Danych', category: 'Moduł', rarity: 'common', value: 180, iconType: 'Cube', description: 'Podstawowy układ scalony pamięci.', weight: 45 },
      { name: 'Miedziany Rezonator', category: 'Komponent', rarity: 'common', value: 320, iconType: 'Coin', description: 'Rezonator częstotliwości kwantowych.', weight: 35 },
      { name: 'Szafirowa Płytka Sieci', category: 'Kolekcja', rarity: 'rare', value: 850, iconType: 'Crystal', description: 'Światłowodowa płytka logiczna o podwyższonej przepustowości.', weight: 15 },
      { name: 'Szmaragdowe Kości Przeznaczenia', category: 'Kolekcja', rarity: 'rare', value: 1400, iconType: 'Dice', description: 'Zestaw cybernetycznych kości do gier losowych.', weight: 5 },
    ],
  },
  {
    id: 'neon_vault_crate',
    name: 'Neonowy Skarbiec',
    description: 'Najpopularniejsza skrzynka z solidnymi rzadkimi reliktami.',
    priceCoins: 2500,
    priceGems: 0,
    badge: 'POPULARNE',
    color: 'from-purple-600/30 via-slate-800 to-transparent',
    glowColor: 'hover:border-purple-500/50 hover:shadow-purple-500/25',
    items: [
      { name: 'Szafirowa Płytka Sieci', category: 'Kolekcja', rarity: 'rare', value: 950, iconType: 'Crystal', description: 'Światłowodowa płytka logiczna.', weight: 40 },
      { name: 'Szmaragdowe Kości Przeznaczenia', category: 'Kolekcja', rarity: 'rare', value: 1600, iconType: 'Dice', description: 'Cybernetyczne kości losowe.', weight: 30 },
      { name: 'Fioletowy Pulsator Czasu', category: 'Relikt', rarity: 'epic', value: 3800, iconType: 'Orb', description: 'Emituje ciągłe fale zakrzywiające percepcję czasu.', weight: 20 },
      { name: 'Cyber Smocza Kula', category: 'Relikt', rarity: 'epic', value: 6500, iconType: 'Dragon', description: 'Pozłacana kula energetyczna pulsująca neonowym blaskiem.', weight: 8 },
      { name: 'Kwantowy Kryształ Mocy', category: 'Relikt', rarity: 'legendary', value: 15000, iconType: 'Crystal', description: 'Krystaliczny nośnik czystej energii.', weight: 2 },
    ],
  },
  {
    id: 'quantum_capsule',
    name: 'Kwantowa Kapsuła',
    description: 'Epicka kapsuła z wysoką szansą na legendarne znaleziska.',
    priceCoins: 8000,
    priceGems: 0,
    badge: 'HOT',
    color: 'from-pink-600/30 via-slate-800 to-transparent',
    glowColor: 'hover:border-pink-500/50 hover:shadow-pink-500/25',
    items: [
      { name: 'Fioletowy Pulsator Czasu', category: 'Relikt', rarity: 'epic', value: 3800, iconType: 'Orb', description: 'Fale zakrzywiające percepcję czasu.', weight: 40 },
      { name: 'Cyber Smocza Kula', category: 'Relikt', rarity: 'epic', value: 7200, iconType: 'Dragon', description: 'Pozłacana kula pulsująca neonowym blaskiem.', weight: 35 },
      { name: 'Kwantowy Kryształ Mocy', category: 'Relikt', rarity: 'legendary', value: 19500, iconType: 'Crystal', description: 'Krystaliczny nośnik czystej energii.', weight: 20 },
      { name: 'Korona Władcy Cyberprzestrzeni', category: 'Artefakt', rarity: 'mythic', value: 55000, iconType: 'Crown', description: 'Mityczna korona elitarnych władców platformy.', weight: 5 },
    ],
  },
  {
    id: 'overlord_chest',
    name: 'Skarbiec Władcy',
    description: 'Ekskluzywna skrzynia dla VIP-ów z gwarancją epickiego lub lepszego dropu.',
    priceCoins: 25000,
    priceGems: 0,
    badge: 'VIP',
    color: 'from-amber-600/30 via-yellow-900/20 to-transparent',
    glowColor: 'hover:border-amber-400/60 hover:shadow-amber-400/30',
    items: [
      { name: 'Cyber Smocza Kula', category: 'Relikt', rarity: 'epic', value: 8500, iconType: 'Dragon', description: 'Pozłacana kula energetyczna.', weight: 40 },
      { name: 'Kwantowy Kryształ Mocy', category: 'Relikt', rarity: 'legendary', value: 24000, iconType: 'Crystal', description: 'Krystaliczny nośnik czystej energii.', weight: 40 },
      { name: 'Korona Władcy Cyberprzestrzeni', category: 'Artefakt', rarity: 'mythic', value: 85000, iconType: 'Crown', description: 'Mityczna korona elitarnych władców platformy.', weight: 20 },
    ],
  },
  {
    id: 'gem_crate',
    name: 'Kryształowa Skrzynia',
    description: 'Otwierana wyłącznie za gemy. Najwyższy współczynnik mitycznych artefaktów.',
    priceCoins: 0,
    priceGems: 20,
    badge: 'GEMY',
    color: 'from-cyan-600/30 via-blue-900/20 to-transparent',
    glowColor: 'hover:border-cyan-400/60 hover:shadow-cyan-400/30',
    items: [
      { name: 'Szmaragdowe Kości Przeznaczenia', category: 'Kolekcja', rarity: 'rare', value: 2500, iconType: 'Dice', description: 'Cybernetyczne kości losowe.', weight: 30 },
      { name: 'Cyber Smocza Kula', category: 'Relikt', rarity: 'epic', value: 9000, iconType: 'Dragon', description: 'Pozłacana kula energetyczna.', weight: 40 },
      { name: 'Kwantowy Kryształ Mocy', category: 'Relikt', rarity: 'legendary', value: 28000, iconType: 'Crystal', description: 'Krystaliczny nośnik czystej energii.', weight: 20 },
      { name: 'Korona Władcy Cyberprzestrzeni', category: 'Artefakt', rarity: 'mythic', value: 99000, iconType: 'Crown', description: 'Mityczna korona elitarnych władców.', weight: 10 },
    ],
  },
];

export const CasesSection: React.FC = () => {
  const [cases, setCases] = useState<CaseDefinition[]>(FALLBACK_CASES);
  const [filterType, setFilterType] = useState<'all' | 'coins' | 'gems'>('all');
  const [activeCase, setActiveCase] = useState<CaseDefinition | null>(null);

  useEffect(() => {
    api.cases.getAll().then((res) => {
      if (res && Array.isArray(res) && res.length > 0) {
        setCases(res);
      }
    }).catch(() => {});
  }, []);

  const filteredCases = cases.filter((c) => {
    if (filterType === 'coins') return c.priceCoins > 0;
    if (filterType === 'gems') return c.priceGems > 0;
    return true;
  });

  return (
    <section className="space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#12182B] via-[#0D1324] to-[#05070D] border border-white/[0.08] p-6 sm:p-8">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-pink-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-900/30 text-white">
                <Package className="w-5 h-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">Otwieranie Skrzyń</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md">
                CASE OPENING
              </span>
            </div>
            <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
              Otwieraj skrzynki z cybernetycznymi artefaktami i reliktami za wirtualne monety lub gemy. Wygrywaj unikalne przedmioty do ekwipunku lub sprzedawaj je od razu z zyskiem!
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex gap-2 shrink-0 bg-[#090D18] p-1.5 rounded-2xl border border-white/[0.08]">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterType === 'all'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Wszystkie
            </button>
            <button
              onClick={() => setFilterType('coins')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                filterType === 'coins'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Coins className="w-3.5 h-3.5" /> Monety
            </button>
            <button
              onClick={() => setFilterType('gems')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                filterType === 'gems'
                  ? 'bg-cyan-500 text-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Gem className="w-3.5 h-3.5" /> Gemy
            </button>
          </div>
        </div>
      </div>

      {/* Crates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCases.map((caseItem) => (
          <div
            key={caseItem.id}
            onClick={() => setActiveCase(caseItem)}
            className={`
              relative group rounded-3xl bg-gradient-to-br ${caseItem.color}
              border border-white/[0.08] p-6 cursor-pointer transition-all duration-300
              ${caseItem.glowColor} hover:-translate-y-1.5 hover:shadow-2xl flex flex-col justify-between
            `}
          >
            {/* Top Badge */}
            {caseItem.badge && (
              <div className="absolute top-4 right-4">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/10 text-white border border-white/20 backdrop-blur-sm">
                  {caseItem.badge}
                </span>
              </div>
            )}

            {/* Crate Visual Icon */}
            <div className="flex flex-col items-center text-center my-4">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-purple-600/30 via-pink-600/20 to-indigo-600/30 border border-white/10 flex items-center justify-center p-4 shadow-xl group-hover:scale-110 transition-transform duration-300">
                <Package className="w-14 h-14 text-purple-300 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
              </div>
              <h3 className="text-lg font-black text-white mt-4 tracking-wide group-hover:text-purple-300 transition-colors">
                {caseItem.name}
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">{caseItem.description}</p>
            </div>

            {/* Drop preview pills */}
            <div className="flex justify-center gap-1.5 mb-5">
              {caseItem.items.slice(0, 4).map((it, i) => (
                <span
                  key={i}
                  title={`${it.name} (${getRarityStyle(it.rarity).name})`}
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: getRarityStyle(it.rarity).color }}
                />
              ))}
              {caseItem.items.length > 4 && (
                <span className="text-[9px] font-bold text-slate-500 self-center">
                  +{caseItem.items.length - 4}
                </span>
              )}
            </div>

            {/* Footer Price + Open Button */}
            <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  Cena skrzyni
                </span>
                <div className="flex items-center gap-1 font-mono font-black text-sm text-white">
                  {caseItem.priceCoins > 0 ? (
                    <span className="flex items-center gap-1 text-amber-400">
                      <Coins className="w-3.5 h-3.5" />
                      {caseItem.priceCoins.toLocaleString()}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-cyan-400">
                      <Gem className="w-3.5 h-3.5" />
                      {caseItem.priceGems} gemów
                    </span>
                  )}
                </div>
              </div>

              <div className="px-3.5 py-2 rounded-xl bg-purple-600/20 group-hover:bg-purple-600 text-purple-300 group-hover:text-white border border-purple-500/30 group-hover:border-purple-500 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1">
                <span>Otwórz</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Active Case Opening Modal */}
      {activeCase && (
        <CaseOpeningModal caseDef={activeCase} onClose={() => setActiveCase(null)} />
      )}
    </section>
  );
};
