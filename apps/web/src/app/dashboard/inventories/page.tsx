'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/data/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table';
import { formatDate } from '@/lib/utils';

interface Inventory {
  id: string; reference: string; status: string;
  startedAt?: string | null; completedAt?: string | null; validatedAt?: string | null;
  warehouse: { name: string; code: string };
}

const STATUS: Record<string, { label: string; variant: any }> = {
  PLANNED: { label: 'Planifié', variant: 'secondary' },
  IN_PROGRESS: { label: 'En cours', variant: 'warning' },
  COMPLETED: { label: 'Terminé', variant: 'default' },
  VALIDATED: { label: 'Validé', variant: 'success' },
  CANCELLED: { label: 'Annulé', variant: 'destructive' },
};

export default function InventoriesPage() {
  const [items, setItems] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ data: Inventory[] }>('/inventories?pageSize=100')
      .then((r) => setItems(r.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventaires"
        description="Planification, comptage, validation et écarts d'inventaire."
        actions={<Button><Plus className="h-4 w-4" /> Lancer un inventaire</Button>}
      />

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <p className="p-6 text-sm text-muted-foreground">Chargement…</p>
          ) : items.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">Aucun inventaire.</p>
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Référence</TH>
                  <TH>Entrepôt</TH>
                  <TH>Démarré</TH>
                  <TH>Validé</TH>
                  <TH>Statut</TH>
                </TR>
              </THead>
              <TBody>
                {items.map((i) => {
                  const s = STATUS[i.status] ?? { label: i.status, variant: 'outline' };
                  return (
                    <TR key={i.id}>
                      <TD className="font-mono text-xs">{i.reference}</TD>
                      <TD>{i.warehouse.name}</TD>
                      <TD className="text-muted-foreground">{i.startedAt ? formatDate(i.startedAt) : '—'}</TD>
                      <TD className="text-muted-foreground">{i.validatedAt ? formatDate(i.validatedAt) : '—'}</TD>
                      <TD><Badge variant={s.variant}>{s.label}</Badge></TD>
                    </TR>
                  );
                })}
              </TBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
