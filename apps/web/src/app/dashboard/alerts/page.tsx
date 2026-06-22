'use client';

import { useEffect, useState } from 'react';
import { Check, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/data/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table';
import { formatDate } from '@/lib/utils';

interface Alert {
  id: string; type: string; severity: string; title: string; message: string;
  acknowledged: boolean; createdAt: string;
}

export default function AlertsPage() {
  const [items, setItems] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get<{ data: Alert[] }>('/alerts?pageSize=100');
      setItems(r.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const recompute = async () => {
    await api.post('/alerts/recompute');
    load();
  };
  const ack = async (id: string) => {
    await api.post(`/alerts/${id}/acknowledge`);
    load();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alertes opérationnelles"
        description="Stock bas, ruptures, péremptions et retards d'approvisionnement."
        actions={<Button variant="outline" onClick={recompute}><RefreshCw className="h-4 w-4" /> Recalculer</Button>}
      />

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <p className="p-6 text-sm text-muted-foreground">Chargement…</p>
          ) : items.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">Aucune alerte.</p>
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Date</TH>
                  <TH>Sévérité</TH>
                  <TH>Type</TH>
                  <TH>Message</TH>
                  <TH>Action</TH>
                </TR>
              </THead>
              <TBody>
                {items.map((a) => (
                  <TR key={a.id} className={a.acknowledged ? 'opacity-60' : undefined}>
                    <TD className="text-muted-foreground">{formatDate(a.createdAt)}</TD>
                    <TD>
                      <Badge variant={a.severity === 'CRITICAL' ? 'destructive' : a.severity === 'WARNING' ? 'warning' : 'secondary'}>
                        {a.severity}
                      </Badge>
                    </TD>
                    <TD><Badge variant="outline">{a.type}</Badge></TD>
                    <TD>
                      <div className="font-medium">{a.title}</div>
                      <div className="text-xs text-muted-foreground">{a.message}</div>
                    </TD>
                    <TD>
                      {!a.acknowledged && (
                        <Button size="sm" variant="ghost" onClick={() => ack(a.id)}>
                          <Check className="h-4 w-4" /> Acquitter
                        </Button>
                      )}
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
