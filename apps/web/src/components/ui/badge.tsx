import * as React from 'react';
import { cn } from '@/lib/utils';

type Variant = 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline';
const variants: Record<Variant, string> = {
  default: 'bg-primary/10 text-primary border-primary/20',
  secondary: 'bg-muted text-muted-foreground border-transparent',
  success: 'bg-success/10 text-success border-success/30',
  warning: 'bg-warning/15 text-warning border-warning/30',
  destructive: 'bg-destructive/10 text-destructive border-destructive/30',
  outline: 'border-border text-foreground',
};

export function Badge({
  className, variant = 'default', ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        variants[variant], className,
      )}
      {...props}
    />
  );
}
