# Gouvernance multi-agents GESTOCK

Ce document formalise la manière dont les agents IA sont affectés au projet
GESTOCK. L'objectif est de conserver une coordination claire entre architecture,
backend, logique métier, front-end et déploiement GitHub/Vercel.

## Principe de pilotage

Chaque instruction doit être analysée puis orientée vers l'agent le plus adapté.
L'agent coordinateur conserve la responsabilité finale de l'intégration :

1. comprendre l'objectif métier ;
2. affecter le bon agent ;
3. récupérer le livrable ;
4. intégrer le code ou la documentation ;
5. exécuter les vérifications ;
6. committer et pousser vers GitHub pour déclencher Vercel.

## Affectation des agents

| Agent | Responsabilité principale | Livrables prioritaires |
| --- | --- | --- |
| Claude Opus 4.7 Thinking | Architecture Enterprise, sécurité, DDD, multi-tenant | ADR, modèle de tenancy, matrice RBAC, stratégie audit trail |
| GPT 5.3 Codex Hackfast | Backend, API, base de données, tests, CI | API REST v1, PostgreSQL, migrations, auth, endpoints métier |
| GPT 5.5 Hackfast | Produit, logique métier, front-end, UX | Pages métier, workflows, design system, documentation fonctionnelle |

## Lots de travail

### Phase 1 - Architecture cible

Responsable : **Claude Opus 4.7 Thinking**

- Définir le modèle multi-tenant.
- Définir les frontières DDD.
- Définir les rôles et permissions.
- Définir l'audit trail.
- Rédiger les ADR structurants.

### Phase 2 - Backend MVP

Responsable : **GPT 5.3 Codex Hackfast**

- Créer l'API versionnée `/v1`.
- Ajouter PostgreSQL et les migrations.
- Implémenter les entités de base : organizations, users, roles, sites,
  warehouses, items, stock_movements, purchase_orders.
- Ajouter l'authentification et le middleware tenant.
- Ajouter les tests backend et la CI.

### Phase 3 - Application métier

Responsable : **GPT 5.5 Hackfast**

- Transformer le dashboard en application avec routes.
- Créer les pages Articles, Stocks, Achats, Fournisseurs et Entrepôts.
- Implémenter le workflow rupture vers demande d'achat.
- Ajouter filtres, formulaires, états vides et erreurs.
- Préparer le front à consommer l'API backend.

### Phase 4 - Industrialisation

Responsable : **Coordination multi-agents**

- Vérifier build, tests et qualité.
- Pousser les commits vers GitHub.
- Maintenir la compatibilité Vercel.
- Mettre à jour la documentation et la PR.

## Règles GitHub et Vercel

- Chaque lot livré doit être committé avec un message explicite.
- Chaque push vers GitHub peut déclencher un déploiement Vercel selon la
  configuration du projet.
- Les changements visibles côté utilisateur doivent rester dans l'application
  front tant que le backend n'est pas déployé.
- Les fondations backend doivent être ajoutées sans casser le build Vite actuel.

## Priorité immédiate

La priorité opérationnelle est de rendre visible le pilotage multi-agents dans
l'interface GESTOCK, puis de préparer le prochain chantier : backend MVP
multi-tenant avec API, persistance, auth et RBAC.
