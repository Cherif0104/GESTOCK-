'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { api, setTokens } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@gestock.io');
  const [password, setPassword] = useState('Demo1234!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.post<{ accessToken: string; refreshToken: string }>(
        '/auth/login',
        { email, password },
        { auth: false },
      );
      setTokens(res.accessToken, res.refreshToken);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err?.message ?? 'Échec de la connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-primary via-primary to-accent p-12 text-primary-foreground">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/15 font-bold">G</div>
          <span className="text-xl font-bold">GESTOCK</span>
        </Link>
        <div>
          <h2 className="text-4xl font-bold leading-tight">
            La supply chain
            <br />sans frictions.
          </h2>
          <p className="mt-4 max-w-md text-primary-foreground/80">
            Pilotez vos stocks, vos approvisionnements et vos entrepôts depuis une plateforme
            Enterprise unique. Conçu pour les organisations africaines exigeantes.
          </p>
        </div>
        <div className="text-xs text-primary-foreground/60">
          © {new Date().getFullYear()} GESTOCK — Tous droits réservés.
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Se connecter</h1>
            <p className="text-sm text-muted-foreground">
              Accédez à votre espace GESTOCK.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Adresse e-mail</Label>
              <Input id="email" type="email" required value={email}
                     onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input id="password" type="password" required value={password}
                     onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
            </div>

            {error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Connexion…' : 'Se connecter'}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            Pas encore de compte ?{' '}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Créer une organisation
            </Link>
          </div>

          <div className="rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground">
            <p className="font-medium text-foreground">Compte de démonstration</p>
            <p>admin@gestock.io · Demo1234!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
