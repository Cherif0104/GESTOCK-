'use client';

import { useEffect, useState } from 'react';
import { Plus, Star } from 'lucide-react';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/data/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table';

interface Supplier {
  id: string; code: string; name: string; email?: string | null; phone?: string | null;
  city?: string | null; country?: string | null; rating?: number; isActive: boolean;
  currency: string;
}

export default function SuppliersPage() {
  const [items, setItems] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ data: Supplier[] }>('/suppliers?pageSize=100')
      .then((r) => setItems(r.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fournisseurs"
        description="Annuaire fournisseurs, conditions de paiement, devises et notation."
        actions={<Button><Plus className="h-4 w-4" /> Nouveau fournisseur</Button>}
      />

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <p className="p-6 text-sm text-muted-foreground">Chargement…</p>
          ) : items.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">Aucun fournisseur.</p>
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Code</TH>
                  <TH>Nom</TH>
                  <TH>Contact</TH>
                  <TH>Localisation</TH>
                  <TH>Devise</TH>
                  <TH>Note</TH>
                  <TH>Statut</TH>
                </TR>
              </THead>
              <TBody>
                {items.map((s) => (
                  <TR key={s.id}>
                    <TD className="font-mono text-xs">{s.code}</TD>
                    <TD className="font-medium">{s.name}</TD>
                    <TD className="text-sm text-muted-foreground">
                      {s.email}{s.phone ? ` · ${s.phone}` : ''}
                    </TD>
                    <TD className="text-sm text-muted-foreground">
                      {[s.city, s.country].filter(Boolean).join(', ')}
                    </TD>
                    <TD><Badge variant="outline">{s.currency}</Badge></TD>
                    <TD>
                      <div className="flex items-center gap-0.5 text-warning">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-3.5 w-3.5 ${i < (s.rating ?? 0) ? 'fill-current' : 'opacity-30'}`} />
                        ))}
                      </div>
                    </TD>
                    <TD>
                      <Badge variant={s.isActive ? 'success' : 'secondary'}>
                        {s.isActive ? 'Actif' : 'Désactivé'}
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
