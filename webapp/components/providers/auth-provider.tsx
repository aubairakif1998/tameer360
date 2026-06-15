'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import type { AuthUser } from '@/lib/auth/types';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (payload: {
    email: string;
    password: string;
    tenantSlug?: string;
  }) => Promise<AuthUser>;
  logout: (options?: { redirect?: boolean }) => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const refresh = useCallback(async () => {
    const response = await fetch('/api/auth/session', { cache: 'no-store' });
    const body = await response.json();
    setUser(body.data?.user ?? null);
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void refresh().finally(() => setIsLoading(false));
    });
  }, [refresh]);

  const login = useCallback(
    async (payload: { email: string; password: string; tenantSlug?: string }) => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const body = await response.json();
      if (!response.ok || !body.success) {
        throw new Error(body.error?.message ?? 'Login failed');
      }

      const loggedInUser = body.data.user as AuthUser;
      setUser(loggedInUser);
      return loggedInUser;
    },
    [],
  );

  const logout = useCallback(
    async (options?: { redirect?: boolean }) => {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      if (options?.redirect !== false) {
        router.push('/login');
      }
    },
    [router],
  );

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
