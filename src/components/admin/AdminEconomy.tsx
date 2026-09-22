import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import {
  Coins,
  Gem,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  CheckCircle2,
} from 'lucide-react';

export const AdminEconomy: React.FC = () => {
  const { users, updateUserBalance } = useGame();

  const [selectedUserId, setSelectedUserId] = useState<number>(users[0]?.id || 1);
  const [currencyType, setCurrencyType] = useState<'coins' | 'gems'>('coins');
  const [operationType, setOperationType] = useState<'add' | 'subtract'>('add');
  const [amount, setAmount] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const stats = [
    { label: 'Łączna ilość monet w obiegu', value: '142 850 000', icon: Coins, color: 'text-amber-400' },
    { label: 'Łączna ilość gemów w obiegu', value: '48 200', icon: Gem, color: 'text-cyan-400' },
    { label: 'Monety rozdane dzisiaj (Eventy/Bonusy)', value: '+1 240 000', icon: TrendingUp, color: 'text-emerald-400' },
    { label: 'Monety zdobyte przez graczy', value: '+8 950 000', icon: TrendingUp, color: 'text-purple-400' },
    { label: 'Monety utracone w grach', value: '-7 710 000', icon: TrendingDown, color: 'text-rose-400' },
    { label: 'Średnie saldo gracza', value: '29 200 monet', icon: Coins, color: 'text-amber-300' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(amount, 10);
    if (!val || isNaN(val) || val <= 0) return;

    const delta = operationType === 'add' ? val : -val;
    const targetUser = users.find((u) => u.id === selectedUserId);

    if (currencyType === 'coins') {
      updateUserBalance(selectedUserId, delta, 0, reason || 'Dystrybucja waluty (Panel Ekonomii)');
    } else {
      updateUserBalance(selectedUserId, 0, delta, reason || 'Dystrybucja waluty (Panel Ekonomii)');
    }

    setSuccessMessage(
      `Pomyślnie ${operationType === 'add' ? 'dodano' : 'odjęto'} ${val.toLocaleString()} ${
        currencyType === 'coins' ? 'monet' : 'gemów'
      } dla konta ${targetUser?.username}.`
    );
    setAmount('');
    setReason('');

    setTimeout(() => {
      setSuccessMessage(null);
    }, 4000);
  };

  return (
    <div className="space-y-6">
      {/* Economy Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-[#090D18] border border-white/[0.08] flex items-center justify-between"
            >
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  {stat.label}
                </span>
                <span className="text-base font-mono font-black text-white mt-1 block">
                  {stat.value}
                </span>
              </div>
              <div className={`p-2.5 rounded-xl bg-white/[0.04] ${stat.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Currency Transfer / Modification Form */}
      <div className="p-6 rounded-2xl bg-[#090D18] border border-white/[0.08] space-y-4 max-w-2xl">
        <div className="flex items-center gap-2.5 pb-3 border-b border-white/[0.08]">
          <ArrowRightLeft className="w-5 h-5 text-purple-400" />
          <div>
            <h4 className="text-sm font-black text-white uppercase tracking-wider">
              Zarządzanie walutą graczy
            </h4>
            <p className="text-xs text-slate-400">
              Ręczne dopisywanie nagród lub korygowanie stanów kont w systemie
            </p>
          </div>
        </div>

        {successMessage && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* User Select */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Wybierz użytkownika:
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(parseInt(e.target.value, 10))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D1324] border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.username} (#{u.id} • {u.role}) - Saldo: {u.coins.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            {/* Currency Type */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Rodzaj waluty:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCurrencyType('coins')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                    currencyType === 'coins'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-[#0D1324] border-white/10 text-slate-400'
                  }`}
                >
                  <Coins className="w-3.5 h-3.5" /> Monety
                </button>
                <button
                  type="button"
                  onClick={() => setCurrencyType('gems')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                    currencyType === 'gems'
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                      : 'bg-[#0D1324] border-white/10 text-slate-400'
                  }`}
                >
                  <Gem className="w-3.5 h-3.5" /> Gemy
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Operation Type (Add / Subtract) */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Operacja:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setOperationType('add')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                    operationType === 'add'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-[#0D1324] border-white/10 text-slate-400'
                  }`}
                >
                  + Dodaj
                </button>
                <button
                  type="button"
                  onClick={() => setOperationType('subtract')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                    operationType === 'subtract'
                      ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                      : 'bg-[#0D1324] border-white/10 text-slate-400'
                  }`}
                >
                  - Odejmij
                </button>
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Kwota:
              </label>
              <input
                type="number"
                placeholder="np. 10000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full px-3.5 py-2 rounded-xl bg-[#0D1324] border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              Powód operacji (wymagany do audytu):
            </label>
            <input
              type="text"
              placeholder="np. Nagroda za turniej, Rekompensata techniczna, Wygrana w evencie Discord..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              className="w-full px-3.5 py-2 rounded-xl bg-[#0D1324] border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-purple-600/30 transition-all active:scale-95"
          >
            Zatwierdź i zarejestruj w logach
          </button>
        </form>
      </div>
    </div>
  );
};
