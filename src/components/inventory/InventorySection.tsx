import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { ArtifactVisual } from '../ui/ArtifactVisual';
import { getRarityStyle } from '../../utils/rarity';
import {
  Briefcase,
  Coins,
  ArrowUpDown,
  Filter,
  DollarSign,
  Layers,
  Package,
} from 'lucide-react';

export const InventorySection: React.FC = () => {
  const { inventory, sellItem, setActiveTab } = useGame();
  const [filterRarity, setFilterRarity] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'high' | 'low'>('high');

  const totalInventoryValue = inventory.reduce((sum, item) => sum + item.value, 0);

  const filteredItems = inventory
    .filter((item) => filterRarity === 'all' || item.rarity === filterRarity)
    .sort((a, b) => (sortBy === 'high' ? b.value - a.value : a.value - b.value));

  return (
    <section id="inventory-section" className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                Twój Ekwipunek
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-white/5 text-slate-300 border border-white/10">
                {inventory.length} Artefaktów
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Kolekcjonuj unikalne cyfrowe artefakty, talizmany i trofea świata JACKPOT
            </p>
          </div>
        </div>

        {/* Valuation & Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setActiveTab('cases')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-purple-900/40 hover:scale-105 transition-all"
          >
            <Package className="w-4 h-4" />
            <span>Otwórz skrzynie</span>
          </button>
          {/* Total Value */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0D1324] border border-white/[0.08]">
            <span className="text-xs text-slate-400 uppercase font-bold">Łączna wartość:</span>
            <span className="font-mono font-black text-sm text-amber-300 flex items-center gap-1">
              <Coins className="w-4 h-4 text-amber-400" />
              {totalInventoryValue.toLocaleString()}
            </span>
          </div>

          {/* Rarity Filter */}
          <div className="flex items-center gap-1.5 p-1 bg-[#0D1324] border border-white/[0.08] rounded-xl text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-2" />
            <select
              value={filterRarity}
              onChange={(e) => setFilterRarity(e.target.value)}
              className="bg-transparent text-slate-300 font-semibold focus:outline-none pr-2 py-1 cursor-pointer"
            >
              <option value="all" className="bg-[#0D1324]">Wszystkie rzadkości</option>
              <option value="mythic" className="bg-[#0D1324]">Mityczny ★</option>
              <option value="legendary" className="bg-[#0D1324]">Legendarny</option>
              <option value="epic" className="bg-[#0D1324]">Epicki</option>
              <option value="rare" className="bg-[#0D1324]">Rzadki</option>
              <option value="common" className="bg-[#0D1324]">Zwykły</option>
            </select>
          </div>

          {/* Sort By Value */}
          <button
            onClick={() => setSortBy(sortBy === 'high' ? 'low' : 'high')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0D1324] border border-white/[0.08] hover:border-purple-500/40 text-xs font-semibold text-slate-300 transition-colors"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-purple-400" />
            <span>{sortBy === 'high' ? 'Najwyższa wartość' : 'Najniższa wartość'}</span>
          </button>
        </div>
      </div>

      {/* Grid of Collectibles */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
          {filteredItems.map((item) => {
            const rarity = getRarityStyle(item.rarity);

            return (
              <div
                key={item.id}
                className="group relative flex flex-col justify-between p-4 rounded-2xl bg-[#0D1324]/90 hover:bg-[#131B32] border transition-all duration-200 hover:-translate-y-1 hover:shadow-xl overflow-hidden"
                style={{
                  borderColor: rarity.borderColor,
                  boxShadow: `0 0 15px -3px ${rarity.glowColor}`,
                }}
              >
                {/* Top Rarity Accent Bar */}
                <div
                  className="absolute top-0 left-3 right-3 h-1 rounded-full"
                  style={{ background: rarity.color }}
                />

                {/* Top Details */}
                <div className="flex items-center justify-between z-10 pt-1">
                  <span className="text-[10px] font-mono text-slate-400">
                    {item.category}
                  </span>
                  <span
                    className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider"
                    style={{
                      background: rarity.bgSubtle,
                      color: rarity.color,
                      border: `1px solid ${rarity.borderColor}`,
                    }}
                  >
                    {rarity.name}
                  </span>
                </div>

                {/* Artifact Vector Center */}
                <div className="py-4 flex items-center justify-center">
                  <ArtifactVisual item={item} size="md" showGlow={false} />
                </div>

                {/* Bottom Details & Sell CTA */}
                <div className="space-y-2.5">
                  <div className="text-center">
                    <p className="text-sm font-black text-white group-hover:text-purple-300 transition-colors">
                      {item.name}
                    </p>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                      {item.description}
                    </p>
                    <span className="text-xs font-mono font-black text-amber-300 flex items-center justify-center gap-1 mt-1">
                      <Coins className="w-3.5 h-3.5 text-amber-400" />
                      {item.value.toLocaleString()} monet
                    </span>
                  </div>

                  {/* Sell for Coins Action */}
                  <button
                    onClick={() => sellItem(item.id, item.value)}
                    className="w-full py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-[11px] font-black uppercase tracking-wider text-amber-300 hover:text-amber-200 transition-all flex items-center justify-center gap-1 opacity-85 group-hover:opacity-100"
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Sprzedaj (+{item.value})</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : inventory.length === 0 ? (
        <div className="py-16 text-center rounded-3xl bg-[#0D1324]/50 border border-purple-500/20 p-6 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-3">
            <Package className="w-8 h-8" />
          </div>
          <p className="text-white text-base font-black">Twój ekwipunek jest pusty!</p>
          <p className="text-xs text-slate-400 max-w-sm mt-1 mb-5">
            Otwórz skrzynki z cyber-artefaktami, aby zdobyć legendarne i mityczne przedmioty, którymi możesz się pochwalić lub sprzedać je z zyskiem.
          </p>
          <button
            onClick={() => setActiveTab('cases')}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-xl shadow-purple-900/40 hover:scale-105 transition-all flex items-center gap-2"
          >
            <Package className="w-4 h-4" />
            <span>Otwórz swoją pierwszą skrzynię</span>
          </button>
        </div>
      ) : (
        <div className="py-14 text-center rounded-3xl bg-[#0D1324]/40 border border-white/[0.08]">
          <Layers className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <p className="text-slate-300 text-sm font-medium">Brak artefaktów w wybranej kategorii.</p>
          <p className="text-xs text-slate-500 mt-1">Zmień filtr rzadkości lub otwórz kolejne skrzynki!</p>
        </div>
      )}
    </section>
  );
};
