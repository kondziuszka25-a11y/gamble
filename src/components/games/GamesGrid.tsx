import React, { useState } from 'react';
import { GAMES_LIST } from '../../data/mockData';
import { GameCard } from './GameCard';
import { GameSessionModal } from './GameSessionModal';
import { Gamepad2, Flame, Sparkles, Trophy } from 'lucide-react';
import type { GameInfo } from '../../types';
import { useGame } from '../../context/GameContext';

interface GamesGridProps {
  searchFilter: string;
}

export const GamesGrid: React.FC<GamesGridProps> = ({ searchFilter }) => {
  const { playSound } = useGame();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeGameModal, setActiveGameModal] = useState<GameInfo | null>(null);

  const categories = [
    { id: 'all', label: 'Wszystkie gry', icon: Gamepad2 },
    { id: 'popular', label: 'Popularne', icon: Flame },
    { id: 'new', label: 'Nowości', icon: Sparkles },
    { id: 'classic', label: 'Klasyki', icon: Trophy },
  ];

  const filteredGames = GAMES_LIST.filter((game) => {
    const matchesCategory =
      selectedCategory === 'all' ||
      (selectedCategory === 'popular' && (game.badge === 'POPULARNE' || game.badge === 'HOT')) ||
      (selectedCategory === 'new' && game.badge === 'NOWE') ||
      (selectedCategory === 'classic' && game.badge === 'KLASYK');

    const matchesSearch =
      game.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      game.description.toLowerCase().includes(searchFilter.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const handleLaunchGame = (gameId: string) => {
    playSound('click');
    const found = GAMES_LIST.find((g) => g.id === gameId);
    if (found) {
      setActiveGameModal(found);
    }
  };

  return (
    <section id="games-section" className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              Popularne gry
            </h2>
            <p className="text-xs text-slate-400">
              Wybierz minigrę i sprawdź swoje szczęście w neonowym kasynie
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-[#0D1324] border border-white/[0.08] rounded-2xl overflow-x-auto no-scrollbar">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of 8 Games */}
      {filteredGames.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredGames.map((game) => (
            <GameCard key={game.id} game={game} onPlay={handleLaunchGame} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center rounded-3xl bg-[#0D1324]/50 border border-white/[0.08]">
          <Gamepad2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-300 font-medium">Brak gier pasujących do wyszukiwania.</p>
          <button
            onClick={() => setSelectedCategory('all')}
            className="mt-3 px-4 py-1.5 text-xs text-purple-400 hover:underline"
          >
            Pokaż wszystkie
          </button>
        </div>
      )}

      {/* Interactive Minigame Arena Modal */}
      {activeGameModal && (
        <GameSessionModal
          game={activeGameModal}
          onClose={() => setActiveGameModal(null)}
        />
      )}
    </section>
  );
};
