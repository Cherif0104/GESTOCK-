'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, ArrowDownRight, ArrowUpRight, Boxes, Package, Truck, Wallet, Warehouse } from 'lucide-react';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table';
import { formatCurrency, formatDate, formatNumber } from '@/lib/utils';

interface Overview {
  kpis: {
    activeProducts: number;
    activeWarehouses: number;
    activeSuppliers: number;
    stockItems: number;
    openPurchaseOrders: number;
    criticalAlerts: number;
    monthlyPurchases: { count: number; total: number };
    stockValue: number;
  };
  recentMovements: Array<{
    id: string;
    type: string;
    quantity: number;
    occurredAt: string;
    product: { sku: string; name: string };
    fromWarehouse?: { code: string; name: string } | null;
    toWarehouse?: { code: string; name: string } | null;
  }>;
}

export default function DashboardHome() {
  const [data, setData] = useState<Overview | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    api.get<Overview>('/dashboard/overview').then(setData).catch((e) => setErr(e.message));
  }, []);

  if (err) return <div className="text-destructive">{err}</div>;
  if (!data) return <div className="text-muted-foreground">Chargement du tableau de bord…</div>;

  const kpis = data.kpis;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
        <p className="text-muted-foreground">Vue d'ensemble de votre activité supply chain.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          icon={<Wallet className="h-5 w-5" />}
          label="Valeur du stock"
          value={formatCurrency(kpis.stockValue, 'XOF')}
          trend="positive"
        />
        <Kpi
          icon={<Package className="h-5 w-5" />}
          label="Articles actifs"
          value={formatNumber(kpis.activeProducts)}
          hint={`${kpis.stockItems} positions de stock`}
        />
        <Kpi
          icon={<Truck className="h-5 w-5" />}
          label="Commandes ouvertes"
          value={formatNumber(kpis.openPurchaseOrders)}
          hint={`${kpis.monthlyPurchases.count} ce mois (${formatCurrency(kpis.monthlyPurchases.total, 'XOF')})`}
        />
        <Kpi
          icon={<AlertTriangle className="h-5 w-5" />}
          label="Alertes critiques"
          value={formatNumber(kpis.criticalAlerts)}
          trend={kpis.criticalAlerts > 0 ? 'negative' : 'neutral'}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Mouvements récents</CardTitle>
            <CardDescription>Les 10 dernières opérations de stock.</CardDescription>
          </CardHeader>
          <CardContent>
            {data.recentMovements.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun mouvement enregistré.</p>
            ) : (
              <Table>
                <THead>
                  <TR>
                    <TH>Date</TH>
                    <TH>Type</TH>
                    <TH>Article</TH>
                    <TH className="text-right">Qté</TH>
                    <TH>Origine → Destination</TH>
                  </TR>
                </THead>
                <TBody>
                  {data.recentMovements.map((m) => (
                    <TR key={m.id}>
                      <TD className="whitespace-nowrap text-muted-foreground">{formatDate(m.occurredAt)}</TD>
                      <TD><MovementBadge type={m.type} /></TD>
                      <TD>
                        <div className="font-medium">{m.product.name}</div>
                        <div className="text-xs text-muted-foreground">{m.product.sku}</div>
                      </TD>
                      <TD className="text-right font-semibold">{formatNumber(m.quantity)}</TD>
                      <TD className="text-xs text-muted-foreground">
                        {m.fromWarehouse?.code ?? '—'} → {m.toWarehouse?.code ?? '—'}
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Infrastructure</CardTitle>
            <CardDescription>Périmètre de votre organisation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfraLine icon={<Warehouse className="h-4 w-4" />} label="Entrepôts actifs" value={kpis.activeWarehouses} />
            <InfraLine icon={<Truck className="h-4 w-4" />} label="Fournisseurs actifs" value={kpis.activeSuppliers} />
            <InfraLine icon={<Boxes className="h-4 w-4" />} label="Articles" value={kpis.activeProducts} />
            <InfraLine icon={<Package className="h-4 w-4" />} label="Positions stock" value={kpis.stockItems} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Kpi({
  icon, label, value, hint, trend,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
  trend?: 'positive' | 'negative' | 'neutral';
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
          <span className="rounded-md bg-muted p-2 text-foreground">{icon}</span>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <p className="text-2xl font-bold">{value}</p>
          {trend === 'positive' && <ArrowUpRight className="h-4 w-4 text-success" />}
          {trend === 'negative' && <ArrowDownRight className="h-4 w-4 text-destructive" />}
        </div>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}

function InfraLine({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon} {label}
      </div>
      <span className="font-semibold">{formatNumber(value)}</span>
    </div>
  );
}

function MovementBadge({ type }: { type: string }) {
  const map: Record<string, { label: string; variant: any }> = {
    RECEIPT: { label: 'Réception', variant: 'success' },
    ISSUE: { label: 'Sortie', variant: 'destructive' },
    TRANSFER_IN: { label: 'Transfert ↓', variant: 'default' },
    TRANSFER_OUT: { label: 'Transfert ↑', variant: 'default' },
    ADJUSTMENT_IN: { label: 'Ajust. +', variant: 'warning' },
    ADJUSTMENT_OUT: { label: 'Ajust. -', variant: 'warning' },
    INVENTORY: { label: 'Inventaire', variant: 'secondary' },
    RETURN_SUPPLIER: { label: 'Retour fourn.', variant: 'secondary' },
    RETURN_CUSTOMER: { label: 'Retour client', variant: 'secondary' },
    SCRAP: { label: 'Rebut', variant: 'destructive' },
  };
  const entry = map[type] ?? { label: type, variant: 'outline' };
  return <Badge variant={entry.variant}>{entry.label}</Badge>;
}
