'use client';

import { PageHeader } from '@/components/data/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Paramètres"
        description="Configurations avancées de GESTOCK."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {SECTIONS.map((s) => (
          <Card key={s.title}>
            <CardHeader>
              <CardTitle>{s.title}</CardTitle>
              <CardDescription>{s.description}</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Cette section sera disponible dans une prochaine version.
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

const SECTIONS = [
  { title: 'Utilisateurs & rôles', description: 'Gérez les comptes, les rôles et les permissions granulaires.' },
  { title: 'Sociétés & sites', description: 'Configurez votre hiérarchie multi-sociétés et multi-sites.' },
  { title: 'Catégories & unités', description: 'Référentiels catalogue : catégories, unités de mesure.' },
  { title: 'Notifications', description: 'Canaux d\'alerte (e-mail, webhook, mobile push).' },
  { title: 'Intégrations', description: 'Connecteurs ERP, comptabilité, CRM, API publique.' },
  { title: 'Sécurité', description: 'SSO, MFA, politiques de mot de passe, journalisation.' },
];
