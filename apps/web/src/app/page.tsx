import Link from 'next/link';
import { ArrowRight, Boxes, BarChart3, Globe2, ShieldCheck, Truck, Workflow } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted">
      <nav className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold">
            G
          </div>
          <span className="text-xl font-bold">GESTOCK</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Link href="/login" className="rounded-md px-3 py-2 hover:bg-muted">
            Se connecter
          </Link>
          <Link
            href="/register"
            className="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90"
          >
            Démarrer gratuitement
          </Link>
        </div>
      </nav>

      <section className="container py-20 text-center">
        <div className="mx-auto max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <Globe2 className="h-3.5 w-3.5" />
            Plateforme SaaS Cloud · Multi-tenant · Made for Africa
          </span>
          <h1 className="mt-6 text-5xl font-bold tracking-tight md:text-6xl">
            Pilotez vos stocks et votre <span className="gradient-text">supply chain</span> en
            temps réel.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            GESTOCK est la plateforme Enterprise moderne pour gérer vos articles, fournisseurs,
            achats, réceptions, entrepôts et inventaires — depuis une interface unique, pensée
            pour les organisations africaines de toutes tailles.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90"
            >
              Créer mon organisation
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-md border bg-card px-6 py-3 font-semibold hover:bg-muted"
            >
              Se connecter
            </Link>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Démo : <code className="rounded bg-muted px-1.5 py-0.5">admin@gestock.io</code> /{' '}
            <code className="rounded bg-muted px-1.5 py-0.5">Demo1234!</code>
          </p>
        </div>
      </section>

      <section className="container pb-24">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="card-surface p-6">
              <f.icon className="h-8 w-8 text-accent" />
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t bg-card/40 py-8">
        <div className="container text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} GESTOCK — Plateforme Enterprise de gestion des stocks et
          supply chain.
        </div>
      </footer>
    </main>
  );
}

const FEATURES = [
  {
    icon: Boxes,
    title: 'Stocks temps réel',
    description: 'Positions par article, par entrepôt, mouvements, transferts et ajustements traçés.',
  },
  {
    icon: Truck,
    title: 'Achats & approvisionnements',
    description: 'Workflow complet : brouillon → soumission → approbation → commande → réception.',
  },
  {
    icon: Workflow,
    title: 'Multi-sociétés & multi-entrepôts',
    description: 'Hiérarchie Organisation → Sociétés → Sites → Entrepôts → Emplacements.',
  },
  {
    icon: ShieldCheck,
    title: 'Sécurité Enterprise',
    description: 'JWT + refresh, rôles & permissions granulaires, audit trail, isolation des tenants.',
  },
  {
    icon: BarChart3,
    title: 'Dashboards exécutifs',
    description: 'KPIs en temps réel, valorisation du stock, top articles, performance fournisseurs.',
  },
  {
    icon: Globe2,
    title: 'Internationalisation',
    description: 'Multi-langues, multi-devises (XOF, XAF, EUR, USD…), multi-fuseaux horaires.',
  },
];
