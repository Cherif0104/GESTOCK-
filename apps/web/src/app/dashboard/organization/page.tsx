'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/data/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input, Label } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Org {
  id: string; slug: string; legalName: string; displayName: string;
  country: string; defaultLocale: string; defaultCurrency: string; timezone: string;
  taxId?: string | null;
}

export default function OrganizationPage() {
  const [org, setOrg] = useState<Org | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => { api.get<Org>('/organizations/current').then(setOrg); }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!org) return;
    setSaving(true);
    setStatus(null);
    try {
      const updated = await api.patch<Org>('/organizations/current', {
        displayName: org.displayName,
        legalName: org.legalName,
        country: org.country,
        defaultLocale: org.defaultLocale,
        defaultCurrency: org.defaultCurrency,
        timezone: org.timezone,
        taxId: org.taxId ?? '',
      });
      setOrg(updated);
      setStatus('Modifications enregistrées.');
    } catch (e: any) {
      setStatus(`Erreur : ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (!org) return <p className="text-muted-foreground">Chargement…</p>;

  return (
    <div className="space-y-6">
      <PageHeader title="Organisation" description="Paramètres généraux de votre tenant." />

      <Card>
        <CardHeader>
          <CardTitle>Identité</CardTitle>
          <CardDescription>Coordonnées légales et paramètres régionaux.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={save} className="grid gap-4 md:grid-cols-2">
            <Field label="Nom commercial">
              <Input value={org.displayName} onChange={(e) => setOrg({ ...org, displayName: e.target.value })} />
            </Field>
            <Field label="Raison sociale">
              <Input value={org.legalName} onChange={(e) => setOrg({ ...org, legalName: e.target.value })} />
            </Field>
            <Field label="Pays"><Input value={org.country} onChange={(e) => setOrg({ ...org, country: e.target.value })} /></Field>
            <Field label="Identifiant fiscal">
              <Input value={org.taxId ?? ''} onChange={(e) => setOrg({ ...org, taxId: e.target.value })} />
            </Field>
            <Field label="Langue par défaut">
              <Input value={org.defaultLocale} onChange={(e) => setOrg({ ...org, defaultLocale: e.target.value })} />
            </Field>
            <Field label="Devise par défaut">
              <Input value={org.defaultCurrency} onChange={(e) => setOrg({ ...org, defaultCurrency: e.target.value })} />
            </Field>
            <Field label="Fuseau horaire">
              <Input value={org.timezone} onChange={(e) => setOrg({ ...org, timezone: e.target.value })} />
            </Field>

            <div className="md:col-span-2 flex items-center justify-between">
              {status && <p className="text-sm text-muted-foreground">{status}</p>}
              <Button type="submit" disabled={saving} className="ml-auto">
                {saving ? 'Enregistrement…' : 'Enregistrer'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
