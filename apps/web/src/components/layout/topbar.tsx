'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Bell, LogOut, Moon, Search, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api, clearTokens } from '@/lib/api';

interface SessionUser {
  firstName: string;
  lastName: string;
  email: string;
  organization: { displayName: string; defaultCurrency: string };
  roles: string[];
}

export function Topbar() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    api.get<SessionUser>('/auth/me')
      .then(setUser)
      .catch(() => router.replace('/login'));
  }, [router]);

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const saved = localStorage.getItem('gestock_theme');
    const enabled = saved ? saved === 'dark' : prefersDark;
    setDark(enabled);
    document.documentElement.classList.toggle('dark', enabled);
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('gestock_theme', next ? 'dark' : 'light');
  };

  const onLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('gestock_refresh_token') ?? undefined;
      await api.post('/auth/logout', { refreshToken }).catch(() => undefined);
    } finally {
      clearTokens();
      router.replace('/login');
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur md:px-6">
      <div className="relative flex-1 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Rechercher articles, commandes, fournisseurs…" className="pl-9" />
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Thème">
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-4 w-4" />
        </Button>
        <div className="hidden md:flex items-center gap-3 pl-3">
          <div className="text-right">
            <p className="text-sm font-medium">
              {user ? `${user.firstName} ${user.lastName}` : '—'}
            </p>
            <p className="text-xs text-muted-foreground">
              {user?.organization.displayName ?? ''}
            </p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
            {user ? user.firstName[0] + user.lastName[0] : '·'}
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onLogout} aria-label="Se déconnecter">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
