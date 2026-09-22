import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Award, Zap, CheckCircle2 } from 'lucide-react';

export const AdminXP: React.FC = () => {
  const { users, updateUserXP } = useGame();

  const [selectedUserId, setSelectedUserId] = useState<number>(users[0]?.id || 1);
  const [xpChange, setXpChange] = useState<string>('');
  const [targetLevel, setTargetLevel] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const selectedUser = users.find((u) => u.id === selectedUserId) || users[0];

  const handleApplyXP = (isAdd: boolean) => {
    const val = parseInt(xpChange, 10);
    if (!val || isNaN(val) || val <= 0) return;
    const delta = isAdd ? val : -val;

    updateUserXP(selectedUserId, delta, undefined, reason || 'Ręczna korekta XP');
    setSuccessMsg(`Pomyślnie ${isAdd ? 'dodano' : 'odjęto'} ${val} XP dla użytkownika ${selectedUser.username}.`);
    setXpChange('');
    setReason('');
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const handleSetLevelDirect = (e: React.FormEvent) => {
    e.preventDefault();
    const lvl = parseInt(targetLevel, 10);
    if (!lvl || isNaN(lvl) || lvl < 1) return;

    updateUserXP(selectedUserId, 0, lvl, reason || `Ustawiono Poziom ${lvl}`);
    setSuccessMsg(`Ustawiono poziom ${lvl} dla użytkownika ${selectedUser.username}.`);
    setTargetLevel('');
    setReason('');
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* User Selector Header */}
      <div className="p-4 rounded-2xl bg-[#090D18] border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold text-white uppercase tracking-wider block">
            Wybierz gracza do kalibracji poziomu:
          </span>
          <span className="text-[11px] text-slate-400">
            Modyfikacja rang poziomowych i punktów doświadczenia
          </span>
        </div>

        <select
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(parseInt(e.target.value, 10))}
          className="px-3 py-2 rounded-xl bg-[#0D1324] border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
        >
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.username} (#{u.id}) • Poziom {u.level}
            </option>
          ))}
        </select>
      </div>

      {/* Selected User XP Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-[#12182B] to-[#090D18] border border-purple-500/30 grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Aktualny Poziom</span>
          <span className="text-2xl font-mono font-black text-purple-300 mt-0.5 block">
            LVL {selectedUser.level}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Aktualne XP</span>
          <span className="text-2xl font-mono font-black text-white mt-0.5 block">
            {selectedUser.xp.toLocaleString()}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Wymagane do Następnego</span>
          <span className="text-2xl font-mono font-black text-cyan-300 mt-0.5 block">
            {selectedUser.xpRequired.toLocaleString()} XP
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Szacowane łączne XP</span>
          <span className="text-2xl font-mono font-black text-amber-300 mt-0.5 block">
            {(selectedUser.level * 8000 + selectedUser.xp).toLocaleString()}
          </span>
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Reason Field */}
      <div className="p-4 rounded-2xl bg-[#090D18] border border-white/[0.08]">
        <label className="text-xs font-bold text-slate-300 block mb-1">
          Powód operacji (wymagany):
        </label>
        <input
          type="text"
          placeholder="np. Nagroda specjalna, Korekta błędu poziomu..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-[#0D1324] border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
        />
      </div>

      {/* Action Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Add/Remove XP */}
        <div className="p-5 rounded-2xl bg-[#090D18] border border-white/[0.08] space-y-3">
          <h4 className="text-xs font-bold uppercase text-purple-400 flex items-center gap-1.5">
            <Zap className="w-4 h-4" /> Zmień Ilość XP
          </h4>
          <p className="text-xs text-slate-400">
            Dodaj lub odejmij wybraną liczbę punktów doświadczenia dla gracza.
          </p>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="np. 500"
              value={xpChange}
              onChange={(e) => setXpChange(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl bg-[#0D1324] border border-white/10 text-xs text-white font-mono"
            />
            <button
              onClick={() => handleApplyXP(true)}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors"
            >
              + Dodaj XP
            </button>
            <button
              onClick={() => handleApplyXP(false)}
              className="px-4 py-2 rounded-xl bg-rose-600/30 hover:bg-rose-600 border border-rose-500/40 text-rose-200 text-xs font-bold transition-colors"
            >
              - Odejmij
            </button>
          </div>
        </div>

        {/* Set Level Directly */}
        <form onSubmit={handleSetLevelDirect} className="p-5 rounded-2xl bg-[#090D18] border border-white/[0.08] space-y-3">
          <h4 className="text-xs font-bold uppercase text-pink-400 flex items-center gap-1.5">
            <Award className="w-4 h-4" /> Ustaw Dokładny Poziom
          </h4>
          <p className="text-xs text-slate-400">
            Wymuś konkretny poziom (np. 50 dla odblokowania rangi weterana).
          </p>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="np. 50"
              value={targetLevel}
              onChange={(e) => setTargetLevel(e.target.value)}
              required
              className="flex-1 px-3 py-2 rounded-xl bg-[#0D1324] border border-white/10 text-xs text-white font-mono"
            />
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold transition-colors"
            >
              Ustaw Level
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
