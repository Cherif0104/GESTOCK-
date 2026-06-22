import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = 'XOF', locale = 'fr-FR') {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: currency === 'XOF' || currency === 'XAF' ? 0 : 2,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString(locale)} ${currency}`;
  }
}

export function formatNumber(n: number, locale = 'fr-FR') {
  return new Intl.NumberFormat(locale).format(n);
}

export function formatDate(d: string | Date, locale = 'fr-FR') {
  const date = typeof d === 'string' ? new Date(d) : d;
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(date);
}
