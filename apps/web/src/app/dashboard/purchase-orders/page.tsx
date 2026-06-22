'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/data/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table';
import { formatCurrency, formatDate } from '@/lib/utils';

interface PO {
  id: string; reference: string; status: string; orderDate: string; expectedDate?: string | null;
  total: string; currency: string;
  supplier: { name: string; code: string };
  createdBy?: { firstName: string; lastName: string };
}

const STATUS: Record<string, { label: string; variant: any }> = {
  DRAFT: { label: 'Brouillon', variant: 'secondary' },
  SUBMITTED: { label: 'Soumise', variant: 'outline' },
  APPROVED: { label: 'Approuvée', variant: 'default' },
  ORDERED: { label: 'Commandée', variant: 'default' },
  PARTIALLY_RECEIVED: { label: 'Réceptionnée partielle', variant: 'warning' },
  RECEIVED: { label: 'Réceptionnée', variant: 'success' },
  CANCELLED: { label: 'Annulée', variant: 'destructive' },
  CLOSED: { label: 'Clôturée', variant: 'success' },
};

export default function PurchaseOrdersPage() {
  const [items, setItems] = useState<PO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ data: PO[] }>('/purchase-orders?pageSize=100')
      .then((r) => setItems(r.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Commandes d'achat"
        description="Workflow complet : brouillon → soumission → approbation → commande → réception."
        actions={<Button><Plus className="h-4 w-4" /> Nouvelle commande</Button>}
      />

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <p className="p-6 text-sm text-muted-foreground">Chargement…</p>
          ) : items.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">Aucune commande pour l'instant.</p>
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Référence</TH>
                  <TH>Fournisseur</TH>
                  <TH>Date</TH>
                  <TH>Échéance</TH>
                  <TH className="text-right">Total</TH>
                  <TH>Statut</TH>
                </TR>
              </THead>
              <TBody>
                {items.map((po) => {
                  const s = STATUS[po.status] ?? { label: po.status, variant: 'outline' };
                  return (
                    <TR key={po.id}>
                      <TD className="font-mono text-xs">{po.reference}</TD>
                      <TD>
                        <div className="font-medium">{po.supplier.name}</div>
                        <div className="text-xs text-muted-foreground">{po.supplier.code}</div>
                      </TD>
                      <TD className="text-muted-foreground">{formatDate(po.orderDate)}</TD>
                      <TD className="text-muted-foreground">
                        {po.expectedDate ? formatDate(po.expectedDate) : '—'}
                      </TD>
                      <TD className="text-right font-semibold">
                        {formatCurrency(Number(po.total), po.currency)}
                      </TD>
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
