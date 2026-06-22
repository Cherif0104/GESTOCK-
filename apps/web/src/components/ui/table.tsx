import * as React from 'react';
import { cn } from '@/lib/utils';

export function Table({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-auto">
      <table className={cn('w-full caption-bottom text-sm', className)} {...props} />
    </div>
  );
}
export const THead = (p: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <thead {...p} className={cn('bg-muted/50 text-muted-foreground', p.className)} />
);
export const TBody = (p: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <tbody {...p} className={cn('[&_tr:last-child]:border-0', p.className)} />
);
export const TR = (p: React.HTMLAttributes<HTMLTableRowElement>) => (
  <tr {...p} className={cn('border-b transition-colors hover:bg-muted/30', p.className)} />
);
export const TH = (p: React.ThHTMLAttributes<HTMLTableCellElement>) => (
  <th {...p} className={cn('h-11 px-4 text-left align-middle text-xs font-semibold uppercase tracking-wide', p.className)} />
);
export const TD = (p: React.TdHTMLAttributes<HTMLTableCellElement>) => (
  <td {...p} className={cn('px-4 py-3 align-middle', p.className)} />
);
