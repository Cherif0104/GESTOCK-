'use client';

import { useEffect, useState } from 'react';
import { ArrowRightLeft, Sliders } from 'lucide-react';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/data/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table';
import { formatCurrency, formatNumber } from '@/lib/utils';

interface Position {
  id: string; quantity: number; reservedQty: number; available: number; avgCost: string;
  product: { sku: string; name: string; currency: string; reorderPoint: string; unit?: { symbol: string } };
  warehouse: { code: string; name: string };
}

export default function StockPage() {
  const [items, setItems] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [lowOnly, setLowOnly] = useState(false);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    const qs = new URLSearchParams({ pageSize: '100' });
    if (lowOnly) qs.set('lowStock', 'true');
    try {
      const res = await api.get<{ data: Position[] }>(`/stock/positions?${qs.toString()}`);
      const filtered = search
        ? res.data.filter((p) =>
            (p.product.sku + p.product.name + p.warehouse.code).toLowerCase().includes(search.toLowerCase()),
          )
        : res.data;
      setItems(filtered);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [lowOnly]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock"
        description="Positions de stock par article et par entrepôt."
        actions={
          <>
            <Button variant="outline"><Sliders className="h-4 w-4" /> Ajustement</Button>
            <Button><ArrowRightLeft className="h-4 w-4" /> Transfert</Button>
          </>
        }
      />

      <Card>
        <CardContent className="p-4">
          <form onSubmit={(e) => { e.preventDefault(); load(); }} className="flex flex-wrap gap-2">
            <Input className="max-w-md" placeholder="Filtrer par article ou entrepôt…"
                   value={search} onChange={(e) => setSearch(e.target.value)} />
            <Button type="submit" variant="secondary">Filtrer</Button>
            <Button
              type="button"
              variant={lowOnly ? 'default' : 'outline'}
              onClick={() => setLowOnly((v) => !v)}
            >
              Stock bas uniquement
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <p className="p-6 text-sm text-muted-foreground">Chargement…</p>
          ) : items.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">Aucune position.</p>
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Article</TH>
                  <TH>Entrepôt</TH>
                  <TH className="text-right">Quantité</TH>
                  <TH className="text-right">Réservé</TH>
                  <TH className="text-right">Disponible</TH>
                  <TH className="text-right">Coût moyen</TH>
                  <TH>Statut</TH>
                </TR>
              </THead>
              <TBody>
                {items.map((p) => {
                  const reorder = Number(p.product.reorderPoint ?? 0);
                  const isLow = reorder > 0 && p.quantity <= reorder;
                  return (
                    <TR key={p.id}>
                      <TD>
                        <div className="font-medium">{p.product.name}</div>
                        <div className="text-xs text-muted-foreground">{p.product.sku}</div>
                      </TD>
                      <TD>
                        <div className="font-medium">{p.warehouse.name}</div>
                        <div className="text-xs text-muted-foreground">{p.warehouse.code}</div>
                      </TD>
                      <TD className="text-right font-semibold">
                        {formatNumber(p.quantity)} {p.product.unit?.symbol ?? ''}
                      </TD>
                      <TD className="text-right text-muted-foreground">{formatNumber(p.reservedQty)}</TD>
                      <TD className="text-right">{formatNumber(p.available)}</TD>
                      <TD className="text-right">{formatCurrency(Number(p.avgCost), p.product.currency)}</TD>
                      <TD>
                        {p.quantity <= 0 ? (
                          <Badge variant="destructive">Rupture</Badge>
                        ) : isLow ? (
                          <Badge variant="warning">Stock bas</Badge>
                        ) : (
                          <Badge variant="success">OK</Badge>
                        )}
                      </TD>
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
