'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/data/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table';
import { formatCurrency, formatNumber } from '@/lib/utils';

interface Product {
  id: string; sku: string; name: string; brand?: string;
  costPrice: string; sellingPrice: string; currency: string;
  minStock: string; reorderPoint: string; isActive: boolean;
  unit?: { code: string; symbol: string };
  category?: { name: string } | null;
  totalStock?: number;
}

export default function ProductsPage() {
  const [data, setData] = useState<{ data: Product[]; meta: any } | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async (q = '') => {
    setLoading(true);
    try {
      const res = await api.get<{ data: Product[]; meta: any }>(
        `/products?pageSize=50${q ? `&search=${encodeURIComponent(q)}` : ''}`,
      );
      setData(res);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Articles"
        description="Catalogue des articles, prix, politiques de stock et fournisseurs."
        actions={<Button><Plus className="h-4 w-4" /> Nouvel article</Button>}
      />

      <Card>
        <CardContent className="p-4">
          <form
            onSubmit={(e) => { e.preventDefault(); load(search); }}
            className="flex gap-2"
          >
            <Input placeholder="Rechercher par SKU, nom, code-barres…"
                   value={search} onChange={(e) => setSearch(e.target.value)} />
            <Button type="submit" variant="secondary">Rechercher</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading && <p className="p-6 text-sm text-muted-foreground">Chargement…</p>}
          {!loading && data && data.data.length === 0 && (
            <p className="p-6 text-sm text-muted-foreground">Aucun article trouvé.</p>
          )}
          {!loading && data && data.data.length > 0 && (
            <Table>
              <THead>
                <TR>
                  <TH>SKU</TH>
                  <TH>Désignation</TH>
                  <TH>Catégorie</TH>
                  <TH className="text-right">Prix de revient</TH>
                  <TH className="text-right">Prix de vente</TH>
                  <TH className="text-right">Stock total</TH>
                  <TH>Statut</TH>
                </TR>
              </THead>
              <TBody>
                {data.data.map((p) => (
                  <TR key={p.id}>
                    <TD className="font-mono text-xs">{p.sku}</TD>
                    <TD>
                      <div className="font-medium">{p.name}</div>
                      {p.brand && <div className="text-xs text-muted-foreground">{p.brand}</div>}
                    </TD>
                    <TD className="text-muted-foreground">{p.category?.name ?? '—'}</TD>
                    <TD className="text-right">{formatCurrency(Number(p.costPrice), p.currency)}</TD>
                    <TD className="text-right">{formatCurrency(Number(p.sellingPrice), p.currency)}</TD>
                    <TD className="text-right font-semibold">
                      {formatNumber(p.totalStock ?? 0)} {p.unit?.symbol ?? ''}
                    </TD>
                    <TD>
                      <Badge variant={p.isActive ? 'success' : 'secondary'}>
                        {p.isActive ? 'Actif' : 'Désactivé'}
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
