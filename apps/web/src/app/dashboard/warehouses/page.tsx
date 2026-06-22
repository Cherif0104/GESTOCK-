'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/data/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table';

interface Warehouse {
  id: string; code: string; name: string; type: string;
  manager?: string | null; isActive: boolean;
  site?: { name: string; city?: string | null; company?: { name: string } };
}

export default function WarehousesPage() {
  const [items, setItems] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ data: Warehouse[] }>('/warehouses?pageSize=100')
      .then((r) => setItems(r.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Entrepôts"
        description="Gérez vos entrepôts par société et par site."
        actions={<Button><Plus className="h-4 w-4" /> Nouvel entrepôt</Button>}
      />

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <p className="p-6 text-sm text-muted-foreground">Chargement…</p>
          ) : items.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">Aucun entrepôt.</p>
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Code</TH>
                  <TH>Nom</TH>
                  <TH>Type</TH>
                  <TH>Société / Site</TH>
                  <TH>Responsable</TH>
                  <TH>Statut</TH>
                </TR>
              </THead>
              <TBody>
                {items.map((w) => (
                  <TR key={w.id}>
                    <TD className="font-mono text-xs">{w.code}</TD>
                    <TD className="font-medium">{w.name}</TD>
                    <TD><Badge variant="outline">{w.type}</Badge></TD>
                    <TD className="text-sm text-muted-foreground">
                      {w.site?.company?.name} · {w.site?.name}{w.site?.city ? `, ${w.site.city}` : ''}
                    </TD>
                    <TD>{w.manager ?? '—'}</TD>
                    <TD>
                      <Badge variant={w.isActive ? 'success' : 'secondary'}>
                        {w.isActive ? 'Actif' : 'Désactivé'}
                      </Badge>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
