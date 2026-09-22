import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, setAccessToken } from '../lib/api';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = useCallback(async () => {
    try {
      const me = await api.auth.me();
      setUser({
        id: me.id,
        username: me.username,
        email: me.email,
        avatar: me.avatar,
        role: me.role,
        level: me.level,
        xp: me.xp,
        xpRequired: me.xpRequired,
        coins: me.coins,
        gems: me.gems,
        online: me.online,
        status: me.status,
        registeredAt: new Date(me.createdAt).toLocaleDateString('pl-PL'),
        lastLogin: 'Teraz',
        ownedBoosts: me.ownedBoosts || [],
      });
    } catch {
      setUser(null);
      setAccessToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();

    const handleExpired = () => {
      setUser(null);
    };

    window.addEventListener('auth:expired', handleExpired);
    return () => window.removeEventListener('auth:expired', handleExpired);
  }, [refreshUser]);

  const login = async (username: string, password: string) => {
    const res = await api.auth.login({ username, password });
    setAccessToken(res.accessToken);
    setUser({
      id: res.user.id,
      username: res.user.username,
      email: res.user.email,
      avatar: res.user.avatar,
      role: res.user.role,
      level: res.user.level,
      xp: res.user.xp,
      xpRequired: res.user.xpRequired,
      coins: res.user.coins,
      gems: res.user.gems,
      online: true,
      status: res.user.status,
      registeredAt: new Date(res.user.createdAt).toLocaleDateString('pl-PL'),
      lastLogin: 'Teraz',
      ownedBoosts: res.user.ownedBoosts || [],
    });
  };

  const register = async (username: string, email: string, password: string) => {
    const res = await api.auth.register({ username, email, password });
    setAccessToken(res.accessToken);
    setUser({
      id: res.user.id,
      username: res.user.username,
      email: res.user.email,
      avatar: res.user.avatar,
      role: res.user.role,
      level: res.user.level,
      xp: res.user.xp,
      xpRequired: res.user.xpRequired,
      coins: res.user.coins,
      gems: res.user.gems,
      online: true,
      status: res.user.status,
      registeredAt: new Date(res.user.createdAt).toLocaleDateString('pl-PL'),
      lastLogin: 'Teraz',
      ownedBoosts: [],
    });
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch {
      // ignore
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
