'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/data/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatNumber } from '@/lib/utils';

interface MovementStat { type: string; count: number; quantity: number; }
interface TopProduct { productId: string; sku: string; name: string; totalQty: number; }

export default function ReportsPage() {
  const [stats, setStats] = useState<MovementStat[]>([]);
  const [top, setTop] = useState<TopProduct[]>([]);

  useEffect(() => {
    api.get<MovementStat[]>('/dashboard/movements-by-type').then(setStats);
    api.get<TopProduct[]>('/dashboard/top-products?limit=10').then(setTop);
  }, []);

  const maxQty = Math.max(1, ...top.map((t) => t.totalQty));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reporting"
        description="Analyses opérationnelles et décisionnelles."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Mouvements (30 derniers jours)</CardTitle>
            <CardDescription>Répartition par type de mouvement.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune donnée.</p>
            ) : (
              stats.map((s) => {
                const max = Math.max(1, ...stats.map((x) => x.count));
                return (
                  <div key={s.type}>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{s.type}</span>
                      <span className="text-muted-foreground">{formatNumber(s.count)} mvt · {formatNumber(s.quantity)} u</span>
                    </div>
                    <div className="mt-1 h-2 w-full rounded-full bg-muted">
                      <div className="h-2 rounded-full bg-primary" style={{ width: `${(s.count / max) * 100}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 10 articles par quantité en stock</CardTitle>
            <CardDescription>Volumes cumulés tous entrepôts confondus.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {top.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune donnée.</p>
            ) : (
              top.map((t) => (
                <div key={t.productId}>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{t.name}</span>
                    <span className="text-muted-foreground">{formatNumber(t.totalQty)}</span>
                  </div>
                  <div className="mt-1 h-2 w-full rounded-full bg-muted">
                    <div className="h-2 rounded-full bg-accent" style={{ width: `${(t.totalQty / maxQty) * 100}%` }} />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
