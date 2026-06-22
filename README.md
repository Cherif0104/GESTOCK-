# GESTOCK

GESTOCK est une plateforme SaaS Enterprise dédiée à la gestion des stocks, des
achats, des approvisionnements, des entrepôts et de la supply chain. Cette base
applicative pose une première expérience produit moderne, responsive et
extensible, adaptée aux organisations africaines multi-sites et multi-sociétés.

## Objectif de cette livraison

Cette version initialise le socle front-end de GESTOCK avec :

- une application React + TypeScript + Vite ;
- une architecture inspirée Domain Driven Design ;
- un modèle de données multi-tenant, multi-sites et multi-entrepôts ;
- un tableau de bord exécutif avec KPI, alertes et pipeline achats ;
- une vue des modules applicatifs activables ;
- des sections sécurité, reporting, intégrations, mobile et fondations IA ;
- un design responsive premium destiné aux décideurs et équipes opérationnelles ;
- un cockpit d'exécution multi-agents pour piloter les responsabilités IA.

## Architecture

```text
src/
  domain/          Contrats métier et types centraux
  application/     Construction des vues applicatives et indicateurs dérivés
  infrastructure/  Données d'exemple et futurs adaptateurs API
  presentation/    Composants React et styles de l'interface
```

La séparation des couches prépare l'évolution vers une architecture Cloud Native :

- **Domaine** : organisations, sites, entrepôts, modules, KPI, alertes, achats,
  contrôles de sécurité, intégrations et capacités mobiles.
- **Application** : agrégation des données métier en view model consommable par
  la présentation.
- **Infrastructure** : source de données actuelle sous forme de seed, remplaçable
  par des API REST, GraphQL ou connecteurs externes.
- **Présentation** : expérience SaaS responsive, sans dépendance UI lourde.

## Modules représentés

- Articles & catalogues
- Stocks & inventaires
- Approvisionnements
- Achats fournisseurs
- Entrepôts & mouvements
- Reporting & BI
- Finance & coûts
- Fondations IA

Chaque module dispose d'un statut (`active`, `available`, `planned`) afin de
préparer une activation fonctionnelle par tenant.

## Principes Enterprise intégrés

- Multi-tenant et isolation par organisation
- Multi-pays, multi-devises, multi-sites et multi-entrepôts
- RBAC, permissions et audit trail comme capacités natives
- API-first pour ERP, comptabilité, CRM, douane, transitaires et applications terrain
- Mobile-first avec scénario faible connectivité
- Préparation aux usages IA : prévisions, scoring rupture, recommandations achat
- Reporting décisionnel et exports futurs

## Gouvernance multi-agents

Le projet est désormais organisé avec une affectation claire des agents IA :

- **Claude Opus 4.7 Thinking** : architecture Enterprise, DDD, multi-tenant,
  sécurité, RBAC et audit trail.
- **GPT 5.3 Codex Hackfast** : backend, API, base de données, tests, CI et
  intégrations techniques.
- **GPT 5.5 Hackfast** : logique métier, workflows, front-end, UX et
  documentation fonctionnelle.

La section **Exécution IA** de l'application rend cette organisation visible
dans l'interface déployée. Les règles de coordination sont documentées dans :

- [`docs/agent-responsibilities.md`](docs/agent-responsibilities.md)
- [`docs/adr/0001-orchestration-multi-agents.md`](docs/adr/0001-orchestration-multi-agents.md)

## Document maître UI

Le document de référence pour générer les maquettes haute fidélité Enterprise
de GESTOCK est disponible ici :

- [`docs/gestock-master-ui-spec.md`](docs/gestock-master-ui-spec.md)

Il couvre le design system, les règles responsive, les workflows, les API,
l'audit trail, les notifications et la matrice complète des écrans métier.

La simulation des comptes de test et du routage post-login est documentée ici :

- [`docs/mock-auth-routing.md`](docs/mock-auth-routing.md)

Les frontières fonctionnelles définitives entre Article, Catalogue, Stock,
Entrées, Sorties, Transferts, Inventaires et Lots & Séries sont verrouillées
ici :

- [`docs/functional-boundaries.md`](docs/functional-boundaries.md)

## Commandes

```bash
npm install
npm run dev
npm run build
npm run preview
```

### Commandes backend (bootstrap)

```bash
npm run contracts:build
npm run api:dev
npm run api:build
```

Le build front reste inchangé : `npm run build` à la racine.

## Prochaines extensions recommandées

1. Ajouter une API backend multi-tenant avec persistance relationnelle.
2. Implémenter authentification, RBAC et audit trail réels.
3. Remplacer les seeds par des endpoints applicatifs versionnés.
4. Ajouter tests unitaires, tests d'intégration et tests end-to-end.
5. Introduire les workflows achats, réceptions, transferts et inventaires.
6. Ajouter i18n, multi-devises, fuseaux horaires et formats locaux.
7. Préparer la synchronisation mobile offline-first.
