import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GESTOCK — Pilotez vos stocks et votre supply chain',
  description:
    "Plateforme SaaS Cloud de gestion des stocks, des approvisionnements et de la supply chain pour l'Afrique francophone.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">{children}</body>
    </html>
  );
}
