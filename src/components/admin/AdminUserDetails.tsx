import React, { useState } from 'react';
import type { User, UserRole } from '../../types';
import { useGame } from '../../context/GameContext';
import {
  X,
  Coins,
  Gem,
  Award,
  Shield,
  KeyRound,
  Ban,
  AlertTriangle,
  Mail,
  Calendar,
  Copy,
  Check,
} from 'lucide-react';

interface AdminUserDetailsProps {
  user: User;
  onClose: () => void;
}

export const AdminUserDetails: React.FC<AdminUserDetailsProps> = ({ user, onClose }) => {
  const {
    updateUserBalance,
    updateUserXP,
    updateUserRole,
    toggleUserStatus,
    resetUserPassword,
    currentUser,
  } = useGame();

  // Dialog & Form states
  const [coinInput, setCoinInput] = useState<string>('');
  const [gemInput, setGemInput] = useState<string>('');
  const [xpInput, setXpInput] = useState<string>('');
  const [levelInput, setLevelInput] = useState<string>(user.level.toString());
  const [selectedRole, setSelectedRole] = useState<UserRole>(user.role);
  const [reasonInput, setReasonInput] = useState<string>('');

  // Confirmation modal state
  const [confirmAction, setConfirmAction] = useState<{
    type: string;
    title: string;
    description: string;
    action: () => void;
  } | null>(null);

  // Generated One-Time Temp Password
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [hasCopied, setHasCopied] = useState<boolean>(false);

  const canModifyRole = currentUser.role === 'OWNER';

  const handleApplyBalanceChange = (type: 'coins' | 'gems', isAdd: boolean) => {
    const amount = parseInt(type === 'coins' ? coinInput : gemInput, 10);
    if (!amount || isNaN(amount) || amount <= 0) return;

    const delta = isAdd ? amount : -amount;
    const desc = `${isAdd ? 'Dopisanie' : 'Odjęcie'} ${amount.toLocaleString()} ${type === 'coins' ? 'monet' : 'gemów'}`;

    setConfirmAction({
      type: 'balance',
      title: `Zatwierdź zmianę salda: ${desc}`,
      description: `Czy na pewno chcesz zmienić saldo użytkownika ${user.username}? Akcja zostanie zarejestrowana w audycie.`,
      action: () => {
        if (type === 'coins') {
          updateUserBalance(user.id, delta, 0, reasonInput || 'Modyfikacja salda monet');
          setCoinInput('');
        } else {
          updateUserBalance(user.id, 0, delta, reasonInput || 'Modyfikacja salda gemów');
          setGemInput('');
        }
        setReasonInput('');
        setConfirmAction(null);
      },
    });
  };

  const handleApplyXPChange = (isAdd: boolean) => {
    const amount = parseInt(xpInput, 10);
    if (!amount || isNaN(amount) || amount <= 0) return;
    const delta = isAdd ? amount : -amount;

    setConfirmAction({
      type: 'xp',
      title: `${isAdd ? 'Dodanie' : 'Odjęcie'} ${amount} punktów XP`,
      description: `Czy chcesz zmienić XP użytkownika ${user.username}?`,
      action: () => {
        updateUserXP(user.id, delta, undefined, reasonInput || 'Korekta punktów doświadczenia');
        setXpInput('');
        setReasonInput('');
        setConfirmAction(null);
      },
    });
  };

  const handleApplyLevelChange = () => {
    const newLvl = parseInt(levelInput, 10);
    if (!newLvl || isNaN(newLvl) || newLvl < 1) return;

    setConfirmAction({
      type: 'level',
      title: `Ustawienie Poziomu ${newLvl}`,
      description: `Czy potwierdzasz bezpośrednie ustawienie poziomu ${newLvl} dla ${user.username}?`,
      action: () => {
        updateUserXP(user.id, 0, newLvl, reasonInput || `Ustawiono poziom ${newLvl}`);
        setReasonInput('');
        setConfirmAction(null);
      },
    });
  };

  const handleApplyRoleChange = () => {
    if (selectedRole === user.role) return;

    setConfirmAction({
      type: 'role',
      title: `Zmiana rangi z ${user.role} na ${selectedRole}`,
      description: `Czy potwierdzasz nadanie rangi ${selectedRole} użytkownikowi ${user.username}?`,
      action: () => {
        updateUserRole(user.id, selectedRole, reasonInput || `Zmiana rangi na ${selectedRole}`);
        setReasonInput('');
        setConfirmAction(null);
      },
    });
  };

  const handleToggleStatus = () => {
    const willBan = user.status === 'ACTIVE';

    setConfirmAction({
      type: 'status',
      title: willBan ? `Blokada konta (${user.username})` : `Odblokowanie konta (${user.username})`,
      description: willBan
        ? `Użytkownik utraci dostęp do platformy i możliwości gry.`
        : `Użytkownik odzyska pełny dostęp do konta.`,
      action: () => {
        toggleUserStatus(user.id, reasonInput || (willBan ? 'Blokada konta' : 'Odblokowanie konta'));
        setReasonInput('');
        setConfirmAction(null);
      },
    });
  };

  const handleResetPassword = () => {
    setConfirmAction({
      type: 'password',
      title: `Reset hasła dla ${user.username}`,
      description: `Zostanie wygenerowane nowe jednorazowe hasło tymczasowe. Poprzednie hasło użytkownika przestanie działać.`,
      action: () => {
        const pass = resetUserPassword(user.id);
        setTempPassword(pass);
        setConfirmAction(null);
      },
    });
  };

  const copyPasswordToClipboard = () => {
    if (tempPassword) {
      navigator.clipboard.writeText(tempPassword);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] rounded-3xl bg-[#0B0F1D] border border-white/[0.12] p-6 sm:p-8 shadow-2xl overflow-y-auto flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-white/[0.08]">
            <div className="flex items-center gap-4">
              <img
                src={user.avatar}
                alt={user.username}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-purple-500/40"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-white">{user.username}</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {user.role}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      user.status === 'ACTIVE'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {user.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                  <span>ID: #{user.id}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {user.email}</span>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Meta Details Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
            <div className="p-3.5 rounded-2xl bg-[#090D18] border border-white/[0.05]">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Saldo monet</span>
              <span className="text-base font-mono font-black text-amber-300 mt-0.5 flex items-center gap-1">
                <Coins className="w-4 h-4 text-amber-400" />
                {user.coins.toLocaleString()}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#090D18] border border-white/[0.05]">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Saldo gemów</span>
              <span className="text-base font-mono font-black text-cyan-300 mt-0.5 flex items-center gap-1">
                <Gem className="w-4 h-4 text-cyan-400" />
                {user.gems}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#090D18] border border-white/[0.05]">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Poziom & XP</span>
              <span className="text-base font-mono font-black text-purple-300 mt-0.5">
                LVL {user.level} ({user.xp} XP)
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#090D18] border border-white/[0.05]">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Data rejestracji</span>
              <span className="text-xs font-semibold text-slate-200 mt-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {user.registeredAt}
              </span>
            </div>
          </div>

          {/* Reason Input (Applies to any admin action) */}
          <div className="mb-6 p-3.5 rounded-2xl bg-[#090D18] border border-white/[0.08]">
            <label className="text-xs font-bold text-slate-300 block mb-1">
              Powód modyfikacji (zapisywany w oficjalnych logach audytu):
            </label>
            <input
              type="text"
              placeholder="np. Nagroda za event, Wykryty botting, Korekta zgłoszona na supporcie..."
              value={reasonInput}
              onChange={(e) => setReasonInput(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#0D1324] border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Action Blocks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Block 1: Monety & Gemy */}
            <div className="p-4 rounded-2xl bg-[#090D18] border border-white/[0.08] space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Coins className="w-4 h-4" /> Korekta Waluty
              </h4>

              {/* Coins Input & Buttons */}
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Ilość monet"
                  value={coinInput}
                  onChange={(e) => setCoinInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-xl bg-[#0D1324] border border-white/10 text-xs text-white font-mono"
                />
                <button
                  onClick={() => handleApplyBalanceChange('coins', true)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600 border border-emerald-500/40 text-emerald-200 hover:text-white text-xs font-bold transition-all"
                >
                  + Dodaj
                </button>
                <button
                  onClick={() => handleApplyBalanceChange('coins', false)}
                  className="px-3 py-1.5 rounded-xl bg-rose-600/30 hover:bg-rose-600 border border-rose-500/40 text-rose-200 hover:text-white text-xs font-bold transition-all"
                >
                  - Odejmij
                </button>
              </div>

              {/* Gems Input & Buttons */}
              <div className="flex gap-2 pt-1 border-t border-white/[0.05]">
                <input
                  type="number"
                  placeholder="Ilość gemów"
                  value={gemInput}
                  onChange={(e) => setGemInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-xl bg-[#0D1324] border border-white/10 text-xs text-white font-mono"
                />
                <button
                  onClick={() => handleApplyBalanceChange('gems', true)}
                  className="px-3 py-1.5 rounded-xl bg-cyan-600/30 hover:bg-cyan-600 border border-cyan-500/40 text-cyan-200 hover:text-white text-xs font-bold transition-all"
                >
                  + Dodaj
                </button>
                <button
                  onClick={() => handleApplyBalanceChange('gems', false)}
                  className="px-3 py-1.5 rounded-xl bg-rose-600/30 hover:bg-rose-600 border border-rose-500/40 text-rose-200 hover:text-white text-xs font-bold transition-all"
                >
                  - Odejmij
                </button>
              </div>
            </div>

            {/* Block 2: Poziom i Punkty XP */}
            <div className="p-4 rounded-2xl bg-[#090D18] border border-white/[0.08] space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <Award className="w-4 h-4" /> XP & Poziomy
              </h4>

              {/* XP Input */}
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Punkty XP"
                  value={xpInput}
                  onChange={(e) => setXpInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-xl bg-[#0D1324] border border-white/10 text-xs text-white font-mono"
                />
                <button
                  onClick={() => handleApplyXPChange(true)}
                  className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600 border border-purple-500/40 text-purple-200 hover:text-white text-xs font-bold transition-all"
                >
                  + XP
                </button>
                <button
                  onClick={() => handleApplyXPChange(false)}
                  className="px-3 py-1.5 rounded-xl bg-rose-600/30 hover:bg-rose-600 border border-rose-500/40 text-rose-200 hover:text-white text-xs font-bold transition-all"
                >
                  - XP
                </button>
              </div>

              {/* Level Input */}
              <div className="flex gap-2 pt-1 border-t border-white/[0.05]">
                <input
                  type="number"
                  placeholder="Dokładny poziom"
                  value={levelInput}
                  onChange={(e) => setLevelInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-xl bg-[#0D1324] border border-white/10 text-xs text-white font-mono"
                />
                <button
                  onClick={handleApplyLevelChange}
                  className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all"
                >
                  Ustaw Level
                </button>
              </div>
            </div>

            {/* Block 3: Ranga Użytkownika */}
            <div className="p-4 rounded-2xl bg-[#090D18] border border-white/[0.08] space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Shield className="w-4 h-4" /> Ranga & Uprawnienia
              </h4>

              <div className="flex gap-2">
                <select
                  disabled={!canModifyRole}
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                  className="flex-1 px-3 py-1.5 rounded-xl bg-[#0D1324] border border-white/10 text-xs text-white focus:outline-none"
                >
                  <option value="USER">USER (Zwykły gracz)</option>
                  <option value="MODERATOR">MODERATOR</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="OWNER">OWNER</option>
                </select>
                <button
                  disabled={!canModifyRole || selectedRole === user.role}
                  onClick={handleApplyRoleChange}
                  className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white text-xs font-bold transition-all"
                >
                  Zmień Rangę
                </button>
              </div>
              {!canModifyRole && (
                <span className="text-[10px] text-slate-500 block">
                  * Tylko ranga OWNER może zmieniać uprawnienia.
                </span>
              )}
            </div>

            {/* Block 4: Bezpieczeństwo i Blokady */}
            <div className="p-4 rounded-2xl bg-[#090D18] border border-white/[0.08] space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                <Ban className="w-4 h-4" /> Bezpieczeństwo Konta
              </h4>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleToggleStatus}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                    user.status === 'ACTIVE'
                      ? 'bg-rose-500/20 hover:bg-rose-500/30 border-rose-500/40 text-rose-300'
                      : 'bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-500/40 text-emerald-300'
                  }`}
                >
                  {user.status === 'ACTIVE' ? 'Zablokuj konto (Ban)' : 'Odblokuj konto'}
                </button>

                <button
                  onClick={handleResetPassword}
                  className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-xs font-bold text-slate-200 transition-all flex items-center gap-1.5"
                >
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  <span>Resetuj hasło</span>
                </button>
              </div>
            </div>
          </div>

          {/* Temp Password Dialog (Shown only once) */}
          {tempPassword && (
            <div className="mt-5 p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 animate-fade-in">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase text-amber-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> Wygenerowano nowe hasło tymczasowe
                </span>
                <span className="text-[10px] text-slate-400">Widoczne tylko jednorazowo!</span>
              </div>
              <p className="text-xs text-slate-300 mb-3">
                Przekaż poniższe hasło użytkownikowi {user.username}. Zostanie wymuszona zmiana hasła przy logowaniu.
              </p>
              <div className="flex items-center gap-2">
                <div className="px-4 py-2 rounded-xl bg-black/60 border border-white/10 font-mono font-bold text-amber-300 text-sm tracking-wider">
                  {tempPassword}
                </div>
                <button
                  onClick={copyPasswordToClipboard}
                  className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  {hasCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{hasCopied ? 'Skopiowano' : 'Kopiuj'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Close */}
        <div className="pt-6 mt-4 border-t border-white/[0.08] flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
          >
            Zamknij podgląd
          </button>
        </div>
      </div>

      {/* Confirmation Dialog Overlay */}
      {confirmAction && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl bg-[#0D1324] border border-pink-500/40 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h4 className="text-base font-black text-white">{confirmAction.title}</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {confirmAction.description}
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300"
              >
                Anuluj
              </button>
              <button
                onClick={confirmAction.action}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-purple-600/30"
              >
                Potwierdź
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
