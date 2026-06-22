import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-5xl font-bold">404</h1>
      <p className="text-muted-foreground">Cette page n'existe pas ou a été déplacée.</p>
      <Link href="/dashboard" className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90">
        Retour au tableau de bord
      </Link>
    </div>
  );
}
