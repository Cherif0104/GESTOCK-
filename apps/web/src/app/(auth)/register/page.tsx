'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { api, setTokens } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    organizationName: '',
    organizationSlug: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    country: 'CI',
    currency: 'XOF',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onChange = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.post<{ accessToken: string; refreshToken: string }>(
        '/auth/register',
        form,
        { auth: false },
      );
      setTokens(res.accessToken, res.refreshToken);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err?.message ?? 'Échec de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted px-4 py-12">
      <div className="w-full max-w-2xl card-surface p-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold">G</div>
          <span className="text-xl font-bold">GESTOCK</span>
        </Link>

        <div className="mt-6">
          <h1 className="text-2xl font-bold">Créer votre organisation</h1>
          <p className="text-sm text-muted-foreground">
            Initialisez votre espace GESTOCK en quelques secondes.
          </p>
        </div>

        <form onSubmit={onSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label>Nom de l'organisation</Label>
            <Input required placeholder="Ma Société SARL" value={form.organizationName}
                   onChange={onChange('organizationName')} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Identifiant (slug)</Label>
            <Input required placeholder="ma-societe" value={form.organizationSlug}
                   onChange={onChange('organizationSlug')} />
          </div>
          <div className="space-y-2">
            <Label>Prénom</Label>
            <Input required value={form.firstName} onChange={onChange('firstName')} />
          </div>
          <div className="space-y-2">
            <Label>Nom</Label>
            <Input required value={form.lastName} onChange={onChange('lastName')} />
          </div>
          <div className="space-y-2">
            <Label>E-mail</Label>
            <Input required type="email" value={form.email} onChange={onChange('email')} />
          </div>
          <div className="space-y-2">
            <Label>Mot de passe</Label>
            <Input required type="password" minLength={8} value={form.password} onChange={onChange('password')} />
          </div>
          <div className="space-y-2">
            <Label>Pays</Label>
            <Input value={form.country} onChange={onChange('country')} />
          </div>
          <div className="space-y-2">
            <Label>Devise par défaut</Label>
            <Input value={form.currency} onChange={onChange('currency')} />
          </div>

          {error && (
            <div className="md:col-span-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="md:col-span-2 flex flex-col items-center gap-3">
            <Button type="submit" className="w-full md:w-auto" size="lg" disabled={loading}>
              {loading ? 'Création…' : 'Créer mon organisation'}
            </Button>
            <Link href="/login" className="text-sm text-muted-foreground hover:underline">
              J'ai déjà un compte
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
