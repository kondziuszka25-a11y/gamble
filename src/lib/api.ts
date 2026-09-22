// API Client with automatic token refresh and cookie credentials

let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
  if (token) {
    sessionStorage.setItem('jp_token', token);
  } else {
    sessionStorage.removeItem('jp_token');
  }
};

export const getAccessToken = (): string | null => {
  if (!accessToken) {
    accessToken = sessionStorage.getItem('jp_token');
  }
  return accessToken;
};

const API_BASE = import.meta.env.VITE_API_URL
  ? String(import.meta.env.VITE_API_URL).replace(/\/$/, '')
  : '';

const getFullUrl = (path: string) => (path.startsWith('http') ? path : `${API_BASE}${path}`);

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const token = getAccessToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = getFullUrl(path);
  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // sends refresh token cookie
  });

  if (response.status === 401 && !path.includes('/auth/login') && !path.includes('/auth/refresh')) {
    // Attempt token refresh
    try {
      const refreshRes = await fetch(getFullUrl('/api/auth/refresh'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        setAccessToken(refreshData.accessToken);
        headers['Authorization'] = `Bearer ${refreshData.accessToken}`;
        const retryRes = await fetch(path, { ...options, headers, credentials: 'include' });
        if (!retryRes.ok) {
          const err = await retryRes.json().catch(() => ({ error: 'Błąd żądania' }));
          throw new Error(err.error || 'Błąd żądania');
        }
        return retryRes.json();
      } else {
        setAccessToken(null);
        window.dispatchEvent(new CustomEvent('auth:expired'));
      }
    } catch {
      setAccessToken(null);
      window.dispatchEvent(new CustomEvent('auth:expired'));
    }
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Wystąpił błąd serwera' }));
    throw new Error(err.error || 'Wystąpił nieoczekiwany błąd');
  }

  return response.json();
}

export const api = {
  auth: {
    login: (body: { username: string; password: string }) =>
      request<{ accessToken: string; user: any }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    register: (body: { username: string; email: string; password: string }) =>
      request<{ accessToken: string; user: any }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    logout: () =>
      request<{ message: string }>('/api/auth/logout', {
        method: 'POST',
      }),
    me: () => request<any>('/api/auth/me'),
  },
  users: {
    getAll: () => request<any[]>('/api/users'),
    getById: (id: number) => request<any>(`/api/users/${id}`),
    updateBalance: (id: number, coinDiff: number, gemDiff: number, reason: string) =>
      request<any>(`/api/users/${id}/balance`, {
        method: 'PATCH',
        body: JSON.stringify({ coinDiff, gemDiff, reason }),
      }),
    updateXP: (id: number, xpDiff: number, targetLevel?: number, reason?: string) =>
      request<any>(`/api/users/${id}/xp`, {
        method: 'PATCH',
        body: JSON.stringify({ xpDiff, targetLevel, reason }),
      }),
    updateRole: (id: number, role: string, reason: string) =>
      request<any>(`/api/users/${id}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role, reason }),
      }),
    updateStatus: (id: number, reason: string) =>
      request<any>(`/api/users/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ reason }),
      }),
    resetPassword: (id: number) =>
      request<{ tempPassword: string }>(`/api/users/${id}/reset-password`, {
        method: 'POST',
      }),
  },
  shop: {
    getItems: () => request<any[]>('/api/shop/items'),
    getOwned: () => request<any[]>('/api/shop/owned'),
    purchase: (shopItemId: string) =>
      request<{ boost: any; gems: number }>('/api/shop/purchase', {
        method: 'POST',
        body: JSON.stringify({ shopItemId }),
      }),
  },
  inventory: {
    get: () => request<any[]>('/api/inventory'),
    sell: (id: string) =>
      request<{ coinsGained: number; coins: number }>(`/api/inventory/${id}`, {
        method: 'DELETE',
      }),
  },
  rewards: {
    get: () => request<{ rewards: any[]; claimedToday: boolean }>('/api/rewards'),
    claim: () =>
      request<{ day: number; reward: any; coins: number; gems: number }>('/api/rewards/claim', {
        method: 'POST',
      }),
  },
  leaderboard: {
    get: (by: string = 'coins') => request<any[]>(`/api/leaderboard?by=${by}`),
  },
  games: {
    get: () => request<any[]>('/api/games'),
    getHistory: () => request<any[]>('/api/games/history'),
    getLiveWins: () => request<any[]>('/api/games/live-wins'),
    play: (data: { game: string; betAmount: number; multiplier: number; payout: number; result: 'WIN' | 'LOSS' }) =>
      request<{ entry: any; coins: number; xp: number }>('/api/games/play', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },
  admin: {
    getLogs: (page = 1, limit = 50) =>
      request<{ logs: any[]; total: number; page: number; pages: number }>(`/api/admin/logs?page=${page}&limit=${limit}`),
    getStats: () => request<any>('/api/admin/stats'),
  },
  cases: {
    getAll: () => request<any[]>('/api/cases'),
    open: (caseId: string) =>
      request<{ wonItem: any; coins: number; gems: number; xp: number }>('/api/cases/open', {
        method: 'POST',
        body: JSON.stringify({ caseId }),
      }),
  },
};
