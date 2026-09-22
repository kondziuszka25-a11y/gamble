import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import {
  Search,
  Filter,
  Shield,
} from 'lucide-react';

export const AdminLogs: React.FC = () => {
  const { adminLogs } = useGame();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [adminFilter, setAdminFilter] = useState<string>('ALL');

  const filteredLogs = adminLogs.filter((log) => {
    const matchSearch =
      log.targetUser.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.value.toLowerCase().includes(searchQuery.toLowerCase());

    const matchAction =
      actionFilter === 'ALL' || log.action.toLowerCase().includes(actionFilter.toLowerCase());

    const matchAdmin =
      adminFilter === 'ALL' || log.adminName === adminFilter;

    return matchSearch && matchAction && matchAdmin;
  });

  const uniqueAdmins = Array.from(new Set(adminLogs.map((l) => l.adminName)));

  return (
    <div className="space-y-5">
      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#090D18] border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Szukaj gracza, powodu lub wartości..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0D1324] border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Action Filter */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0D1324] border border-white/10 text-xs">
            <Filter className="w-3.5 h-3.5 text-pink-400" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#0D1324]">Wszystkie akcje</option>
              <option value="monety" className="bg-[#0D1324]">Monety</option>
              <option value="gemy" className="bg-[#0D1324]">Gemy</option>
              <option value="konto" className="bg-[#0D1324]">Blokady kont</option>
              <option value="hasła" className="bg-[#0D1324]">Reset hasła</option>
              <option value="roli" className="bg-[#0D1324]">Zmiana roli</option>
            </select>
          </div>

          {/* Admin Filter */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0D1324] border border-white/10 text-xs">
            <Shield className="w-3.5 h-3.5 text-purple-400" />
            <select
              value={adminFilter}
              onChange={(e) => setAdminFilter(e.target.value)}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#0D1324]">Każdy administrator</option>
              {uniqueAdmins.map((adm) => (
                <option key={adm} value={adm} className="bg-[#0D1324]">{adm}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-2xl bg-[#090D18] border border-white/[0.08] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.08] text-slate-400 uppercase tracking-wider bg-white/[0.01]">
                <th className="py-3.5 px-4">Data i Czas</th>
                <th className="py-3.5 px-3">Administrator</th>
                <th className="py-3.5 px-3">Użytkownik</th>
                <th className="py-3.5 px-3">Akcja</th>
                <th className="py-3.5 px-3">Wartość</th>
                <th className="py-3.5 px-4">Powód</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-4 font-mono text-slate-400">{log.timestamp}</td>
                  <td className="py-3.5 px-3">
                    <span className="font-bold text-purple-300 flex items-center gap-1.5">
                      <Shield className="w-3 h-3 text-pink-400" /> {log.adminName}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-bold text-white">{log.targetUser}</td>
                  <td className="py-3.5 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/5 border border-white/10 text-slate-200">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-mono font-bold text-amber-300">
                    {log.value}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 italic max-w-xs truncate">
                    {log.reason}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-3 px-4 border-t border-white/[0.08] text-right text-[11px] text-slate-500 font-mono">
          Zarejestrowano {filteredLogs.length} wpisów w bazie audytu
        </div>
      </div>
    </div>
  );
};
