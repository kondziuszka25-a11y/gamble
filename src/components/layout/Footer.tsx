import React from 'react';
import { Hexagon, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-16 border-t border-white/[0.08] bg-[#05070D] pt-12 pb-8 px-6 lg:px-12 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
        {/* Brand Col */}
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white">
              <Hexagon className="w-5 h-5 text-purple-200 fill-purple-300/20" />
            </div>
            <div className="flex items-center gap-1">
              <span className="font-black text-lg text-white">JACK</span>
              <span className="font-black text-lg bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                POT
              </span>
            </div>
          </div>
          <p className="text-slate-400 max-w-md leading-relaxed text-xs">
            Jackpot to autorska platforma gamingowa z minigrami losowymi.
            Wszystkie monety, gemy i przedmioty są wyłącznie fikcyjnymi elementami gry.
            Brak prawdziwych płatności, wpłat i wypłat.
          </p>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold pt-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Platforma Rozrywkowa 100% Free-to-Play • Czysta Wirtualna Waluta</span>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-2.5">
          <h5 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
            Nawigacja
          </h5>
          <ul className="space-y-1.5 text-slate-400">
            <li><a href="#games-section" className="hover:text-purple-400 transition-colors">Gry kasynowe</a></li>
            <li><a href="#inventory-section" className="hover:text-purple-400 transition-colors">Ekwipunek artefaktów</a></li>
            <li><a href="#daily-rewards" className="hover:text-purple-400 transition-colors">Nagrody dzienne</a></li>
            <li><a href="#leaderboard-section" className="hover:text-purple-400 transition-colors">Ranking graczy</a></li>
          </ul>
        </div>

        {/* Legal & Community */}
        <div className="space-y-2.5">
          <h5 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
            Informacje
          </h5>
          <ul className="space-y-1.5 text-slate-400">
            <li><a href="#" className="hover:text-purple-400 transition-colors">Regulamin platformy</a></li>
            <li><a href="#" className="hover:text-purple-400 transition-colors">Polityka wirtualnych punktów</a></li>
            <li><a href="#" className="hover:text-purple-400 transition-colors">Weryfikator Provably Fair</a></li>
            <li><a href="#" className="hover:text-purple-400 transition-colors">Pomoc i kontakt</a></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400">
        <p>© 2026 Jackpot. Wszystkie prawa zastrzeżone. Projekt o charakterze pokazowym i rozrywkowym.</p>
        <div className="flex items-center gap-1 text-slate-400">
          <span>Stworzone z</span>
          <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />
          <span>dla społeczności graczy</span>
        </div>
      </div>
    </footer>
  );
};
