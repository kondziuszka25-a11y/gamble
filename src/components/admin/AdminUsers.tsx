import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { AdminUserDetails } from './AdminUserDetails';
import type { User } from '../../types';
import {
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Shield,
  Ban,
  CheckCircle2,
} from 'lucide-react';

export const AdminUsers: React.FC = () => {
  const { users } = useGame();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'id' | 'level' | 'coins'>('id');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 6;

  // Selected user for details modal
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Filter & Sort
  const filteredUsers = users
    .filter((u) => {
      const matchSearch =
        u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.id.toString().includes(searchQuery);

      const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
      const matchStatus = statusFilter === 'ALL' || u.status === statusFilter;

      return matchSearch && matchRole && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'level') return b.level - a.level;
      if (sortBy === 'coins') return b.coins - a.coins;
      return a.id - b.id;
    });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-5">
      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-[#090D18] border border-white/[0.08]">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Szukaj nicku, ID lub emaila..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0D1324] border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Role Filter */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0D1324] border border-white/10 text-xs">
            <Shield className="w-3.5 h-3.5 text-purple-400" />
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#0D1324]">Wszystkie role</option>
              <option value="USER" className="bg-[#0D1324]">USER</option>
              <option value="MODERATOR" className="bg-[#0D1324]">MODERATOR</option>
              <option value="ADMIN" className="bg-[#0D1324]">ADMIN</option>
              <option value="OWNER" className="bg-[#0D1324]">OWNER</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0D1324] border border-white/10 text-xs">
            <Filter className="w-3.5 h-3.5 text-pink-400" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#0D1324]">Każdy status</option>
              <option value="ACTIVE" className="bg-[#0D1324]">Aktywny</option>
              <option value="BANNED" className="bg-[#0D1324]">Zablokowany</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0D1324] border border-white/10 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="id" className="bg-[#0D1324]">Sortuj: ID</option>
              <option value="level" className="bg-[#0D1324]">Sortuj: Poziom</option>
              <option value="coins" className="bg-[#0D1324]">Sortuj: Monety</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl bg-[#090D18] border border-white/[0.08] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.08] text-slate-400 uppercase tracking-wider bg-white/[0.01]">
                <th className="py-3 px-4">Użytkownik</th>
                <th className="py-3 px-3">ID</th>
                <th className="py-3 px-3">Rola</th>
                <th className="py-3 px-3">Poziom (XP)</th>
                <th className="py-3 px-3">Monety</th>
                <th className="py-3 px-3">Gemy</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Ostatnio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {paginatedUsers.map((u) => (
                <tr
                  key={u.id}
                  onClick={() => setSelectedUser(u)}
                  className="hover:bg-purple-950/20 cursor-pointer transition-colors"
                >
                  {/* Avatar & Username */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={u.avatar}
                        alt={u.username}
                        className="w-8 h-8 rounded-xl object-cover border border-white/10"
                      />
                      <div>
                        <span className="font-bold text-white block">{u.username}</span>
                        <span className="text-[10px] text-slate-500">{u.email}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-3 font-mono text-slate-400">#{u.id}</td>

                  {/* Role Badge */}
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        u.role === 'OWNER'
                          ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30'
                          : u.role === 'ADMIN'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : u.role === 'MODERATOR'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : 'bg-slate-800 text-slate-300 border border-white/10'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>

                  {/* Level & XP */}
                  <td className="py-3 px-3 font-mono">
                    <span className="text-white font-bold">LVL {u.level}</span>{' '}
                    <span className="text-[10px] text-slate-400">({u.xp} XP)</span>
                  </td>

                  {/* Coins */}
                  <td className="py-3 px-3 font-mono font-bold text-amber-300">
                    {u.coins.toLocaleString()}
                  </td>

                  {/* Gems */}
                  <td className="py-3 px-3 font-mono font-bold text-cyan-300">
                    {u.gems}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-3">
                    {u.status === 'ACTIVE' ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400 text-[11px] font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Aktywny
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-400 text-[11px] font-semibold">
                        <Ban className="w-3.5 h-3.5" /> Zablokowany
                      </span>
                    )}
                  </td>

                  {/* Last Activity */}
                  <td className="py-3 px-3 text-right text-slate-400">
                    {u.lastLogin}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 border-t border-white/[0.08] flex items-center justify-between text-xs text-slate-400">
          <span>
            Wyświetlanie {paginatedUsers.length} z {filteredUsers.length} użytkowników
          </span>

          <div className="flex items-center gap-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 text-slate-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-slate-200">
              {currentPage} / {totalPages}
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 text-slate-300"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <AdminUserDetails
          user={users.find((u) => u.id === selectedUser.id) || selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
};
