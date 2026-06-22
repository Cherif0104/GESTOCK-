'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3, Boxes, Building2, ClipboardList, Cog, FileText, Home, LayoutGrid,
  Package, ShieldCheck, Truck, Warehouse,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/dashboard', label: 'Tableau de bord', icon: Home },
  { href: '/dashboard/stock', label: 'Stock', icon: Boxes },
  { href: '/dashboard/products', label: 'Articles', icon: Package },
  { href: '/dashboard/warehouses', label: 'Entrepôts', icon: Warehouse },
  { href: '/dashboard/suppliers', label: 'Fournisseurs', icon: Truck },
  { href: '/dashboard/purchase-orders', label: 'Achats', icon: ClipboardList },
  { href: '/dashboard/receipts', label: 'Réceptions', icon: FileText },
  { href: '/dashboard/inventories', label: 'Inventaires', icon: LayoutGrid },
  { href: '/dashboard/alerts', label: 'Alertes', icon: ShieldCheck },
  { href: '/dashboard/reports', label: 'Reporting', icon: BarChart3 },
  { href: '/dashboard/organization', label: 'Organisation', icon: Building2 },
  { href: '/dashboard/settings', label: 'Paramètres', icon: Cog },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-card/40 backdrop-blur">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold">
          G
        </div>
        <span className="text-lg font-bold tracking-tight">GESTOCK</span>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {NAV.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname?.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-4 text-xs text-muted-foreground">
        <p className="font-medium text-foreground">GESTOCK v0.1.0</p>
        <p>Plateforme SaaS Supply Chain</p>
      </div>
    </aside>
  );
}
