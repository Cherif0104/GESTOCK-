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

interface Receipt {
  id: string; reference: string; status: string; receivedAt: string;
  warehouse: { name: string; code: string };
  purchaseOrder?: { reference: string; supplier: { name: string } } | null;
}

export default function ReceiptsPage() {
  const [items, setItems] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ data: Receipt[] }>('/receipts?pageSize=100')
      .then((r) => setItems(r.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Réceptions"
        description="Saisie et confirmation des réceptions de marchandises (avec impact stock)."
        actions={<Button><Plus className="h-4 w-4" /> Nouvelle réception</Button>}
      />

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <p className="p-6 text-sm text-muted-foreground">Chargement…</p>
          ) : items.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">Aucune réception.</p>
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Référence</TH>
                  <TH>Entrepôt</TH>
                  <TH>Commande liée</TH>
                  <TH>Date</TH>
                  <TH>Statut</TH>
                </TR>
              </THead>
              <TBody>
                {items.map((r) => (
                  <TR key={r.id}>
                    <TD className="font-mono text-xs">{r.reference}</TD>
                    <TD>{r.warehouse.name}</TD>
                    <TD>
                      {r.purchaseOrder ? (
                        <>
                          <div className="font-mono text-xs">{r.purchaseOrder.reference}</div>
                          <div className="text-xs text-muted-foreground">{r.purchaseOrder.supplier.name}</div>
                        </>
                      ) : '—'}
                    </TD>
                    <TD className="text-muted-foreground">{formatDate(r.receivedAt)}</TD>
                    <TD>
                      <Badge variant={r.status === 'CONFIRMED' ? 'success' : r.status === 'CANCELLED' ? 'destructive' : 'secondary'}>
                        {r.status === 'DRAFT' ? 'Brouillon' : r.status === 'CONFIRMED' ? 'Confirmée' : 'Annulée'}
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
