<div align="center">

# GESTOCK

**Plateforme SaaS Cloud Enterprise de gestion des stocks, des approvisionnements et de la supply chain.**

_Conçue pour les organisations africaines, inspirée des standards d'Odoo, SAP Business One, Microsoft Dynamics 365, Oracle NetSuite et Zoho Inventory._

</div>

---

## Sommaire

1. [Vision](#vision)
2. [Architecture](#architecture)
3. [Stack technique](#stack-technique)
4. [Démarrage rapide](#démarrage-rapide)
5. [Structure du monorepo](#structure-du-monorepo)
6. [Modules métier](#modules-métier)
7. [Sécurité & multi-tenant](#sécurité--multi-tenant)
8. [API REST](#api-rest)
9. [Données de démonstration](#données-de-démonstration)
10. [Variables d'environnement](#variables-denvironnement)
11. [Scripts disponibles](#scripts-disponibles)
12. [Feuille de route](#feuille-de-route)

---

## Vision

GESTOCK est une **plateforme de pilotage opérationnel** permettant aux organisations
de maîtriser l'ensemble de leur chaîne logistique depuis une interface unique :
visibilité temps réel sur les stocks, mouvements, approvisionnements, fournisseurs,
inventaires et performances logistiques.

La solution est commercialisable aussi bien auprès de **PME**, **grandes entreprises**,
**ONG**, **institutions publiques**, **groupes industriels**, **structures de santé**,
**distributeurs** et **opérateurs logistiques**.

### Principes de conception

- Architecture **Enterprise** et **Cloud Native**
- **Multi-tenant**, **multi-sociétés**, **multi-sites**, **multi-entrepôts**
- **API First** (REST + OpenAPI/Swagger)
- **Mobile First** & **responsive design**
- **Sécurité Enterprise** (JWT, RBAC, audit trail, isolation)
- **Scalabilité horizontale** & **haute disponibilité**
- **Performance**, **journalisation complète**, **expérience utilisateur premium**

---

## Architecture

### Domain Driven Design

L'API est structurée en **modules métiers** correspondant aux bounded contexts :

```
apps/api/src/modules/
  auth/             Authentification & sessions
  users/            Utilisateurs
  organizations/    Tenants
  companies/        Sociétés
  sites/            Sites géographiques
  warehouses/       Entrepôts
  categories/       Catégories d'articles
  products/         Catalogue articles
  suppliers/        Fournisseurs
  purchase-orders/  Achats (workflow complet)
  receipts/         Réceptions (impact stock)
  stock/            Positions & mouvements
  inventories/      Inventaires & écarts
  alerts/           Alertes opérationnelles
  dashboard/        KPIs exécutifs
  audit/            Audit trail
  health/           Santé du service
```

Chaque module suit la séparation **Présentation (Controller) → Application (Service) →
Domaine (Prisma models) → Infrastructure (PrismaService)**.

### Multi-tenant strict

Toutes les entités métier portent un `organizationId`. Les contrôleurs récupèrent ce
champ via le décorateur `@OrgId()` lié au JWT, garantissant l'isolation stricte des
données entre tenants au niveau des services.

---

## Stack technique

| Couche      | Choix                                                                 |
| ----------- | --------------------------------------------------------------------- |
| Backend     | **NestJS 10** (TypeScript), **Prisma 5**, **PostgreSQL 16**           |
| Auth        | **JWT** + refresh tokens, **Passport**, **bcrypt** (12 rounds)        |
| Frontend    | **Next.js 14** (App Router), **React 18**, **TypeScript**             |
| UI          | **Tailwind CSS** + design system inspiré shadcn/ui, **lucide-react**  |
| Docs API    | **OpenAPI 3** via **@nestjs/swagger** (UI sur `/api/docs`)            |
| Sécurité    | **Helmet**, **CORS**, **Throttler**, **class-validator**              |
| DevOps      | **pnpm workspaces**, **Docker Compose** (Postgres + Redis + MailHog)  |

---

## Démarrage rapide

### Prérequis

- **Node.js ≥ 20**
- **pnpm ≥ 9**
- **Docker** (pour PostgreSQL, Redis, MailHog)

### 1. Installation

```bash
pnpm install
cp .env.example .env
cp apps/web/.env.local.example apps/web/.env.local
```

### 2. Démarrer l'infrastructure (PostgreSQL + Redis + MailHog)

```bash
pnpm docker:up
```

### 3. Initialiser la base de données

```bash
pnpm api:prisma generate
pnpm api:migrate -- --name init
pnpm api:seed
```

### 4. Lancer l'API et le Web en parallèle

```bash
pnpm dev
```

| Service        | URL                                |
| -------------- | ---------------------------------- |
| API REST       | http://localhost:4000/api/v1       |
| Swagger / docs | http://localhost:4000/api/docs     |
| Web (Next.js)  | http://localhost:3000              |
| MailHog UI     | http://localhost:8025              |

### 5. Comptes de démonstration

| Rôle              | Email                  | Mot de passe |
| ----------------- | ---------------------- | ------------ |
| Administrateur    | `admin@gestock.io`     | `Demo1234!`  |
| Manager           | `manager@gestock.io`   | `Demo1234!`  |
| Consultation      | `viewer@gestock.io`    | `Demo1234!`  |

---

## Structure du monorepo

```
gestock/
├── apps/
│   ├── api/                NestJS — backend Enterprise
│   │   ├── prisma/         schéma + migrations + seed
│   │   └── src/
│   │       ├── common/     filtres, guards, décorateurs, DTO partagés
│   │       ├── config/     configuration typée
│   │       ├── modules/    modules métier DDD
│   │       └── prisma/     PrismaService global
│   └── web/                Next.js 14 — frontend premium
│       └── src/
│           ├── app/        routes (App Router) : auth + dashboard
│           ├── components/ UI réutilisables (button, table, card, badge…)
│           └── lib/        client API typé, utilitaires
├── packages/
│   └── shared/             enums, permissions, types partagés
├── docker-compose.yml      Postgres + Redis + MailHog
├── .env.example
└── package.json            scripts orchestrateurs
```

---

## Modules métier

Le détail des modules, entités et endpoints est documenté dans
[`docs/MODULES.md`](./docs/MODULES.md). Vue d'ensemble :

| Domaine                | Capabilités principales                                                                 |
| ---------------------- | -------------------------------------------------------------------------------------- |
| **Organisations**      | Tenants, paramètres régionaux (langue, devise, fuseau), KPIs globaux                   |
| **Identités & accès**  | Utilisateurs, rôles, permissions granulaires, refresh tokens, audit trail              |
| **Structure**          | Sociétés → Sites → Entrepôts → Emplacements (multi-niveaux)                            |
| **Catalogue**          | Articles (SKU, code-barres, traçabilité lot/série/péremption), catégories, unités      |
| **Fournisseurs**       | Annuaire, liens article-fournisseur, conditions de paiement, notation                  |
| **Achats**             | Workflow brouillon → soumission → approbation → commande → réception → clôture        |
| **Réceptions**         | Saisie multi-lignes, impact stock à la confirmation, traçabilité lots/séries/péremptions |
| **Stock**              | Positions par entrepôt, mouvements typés, transferts inter-entrepôts, ajustements      |
| **Inventaires**        | Planification, comptage, validation, génération des écarts en mouvements INVENTORY     |
| **Alertes**            | Stock bas, ruptures, péremptions, retards d'approvisionnement                          |
| **Dashboards**         | KPIs temps réel, valorisation du stock, top articles, mouvements 30 jours              |
| **Reporting**          | Analyses opérationnelles & décisionnelles, fondations IA pour évolutions futures       |
| **Audit**              | Journalisation complète des actions sensibles                                          |

---

## Sécurité & multi-tenant

- **Authentification** : JWT (access ~15 min) + refresh token hash SHA-256 stocké en base
- **Autorisation** : RBAC par permissions granulaires (`product:manage`, `purchase:approve`…)
- **Isolation tenant** : chaque table métier porte un `organizationId` ; les services
  filtrent systématiquement dessus, et les contrôleurs récupèrent l'ID via le décorateur
  `@OrgId()` qui dérive du JWT validé.
- **Hashing mot de passe** : bcrypt 12 rounds (configurable)
- **Throttling** : 200 req/min/IP par défaut (NestJS Throttler)
- **CORS** : whitelist configurable via `CORS_ORIGINS`
- **Helmet** : entêtes HTTP sécurisés
- **Audit trail** : table dédiée `audit_logs` avec horodatage, IP, user-agent

---

## API REST

Documentation OpenAPI interactive : http://localhost:4000/api/docs

### Endpoints principaux

| Méthode | Endpoint                                  | Permission                |
| ------- | ----------------------------------------- | ------------------------- |
| POST    | `/auth/register`                          | public                    |
| POST    | `/auth/login`                             | public                    |
| POST    | `/auth/refresh`                           | public                    |
| GET     | `/auth/me`                                | authentifié               |
| GET     | `/dashboard/overview`                     | `dashboard:read`          |
| GET/POST/PATCH/DELETE | `/products`                 | `product:read`/`manage`   |
| GET/POST/PATCH/DELETE | `/suppliers`                | `supplier:read`/`manage`  |
| GET/POST/PATCH/DELETE | `/warehouses`               | `warehouse:read`/`manage` |
| GET     | `/stock/positions?lowStock=true`          | `stock:read`              |
| POST    | `/stock/transfers`                        | `stock:transfer`          |
| POST    | `/stock/adjustments`                      | `stock:adjust`            |
| POST    | `/purchase-orders` (+ `/submit/approve/order/cancel`) | `purchase:*`  |
| POST    | `/receipts/:id/confirm`                   | `receipt:confirm`         |
| POST    | `/inventories/:id/validate`               | `inventory:validate`      |
| GET     | `/alerts` · `POST /alerts/recompute`      | `dashboard:read`          |
| GET     | `/audit`                                  | `audit:read`              |
| GET     | `/health`                                 | public                    |

---

## Données de démonstration

La commande `pnpm api:seed` provisionne :

- 1 **organisation** `demo` (GESTOCK Démo SARL, Abidjan)
- 3 **utilisateurs** (admin/manager/viewer)
- 3 **rôles système** (ORG_ADMIN, MANAGER, VIEWER)
- 1 **société**, 2 **sites** (Abidjan + Dakar), 3 **entrepôts**
- 3 **catégories**, 3 **unités** (UN, KG, CT)
- 5 **articles** (smartphone, casque, riz, huile, savon)
- 3 **fournisseurs** (CI, SN, NG) avec liens article-fournisseur
- Stock initial avec mouvements `RECEIPT` historisés

---

## Variables d'environnement

Voir [`.env.example`](./.env.example) pour la liste exhaustive. Variables clés :

| Variable                  | Description                                          |
| ------------------------- | ---------------------------------------------------- |
| `DATABASE_URL`            | Chaîne de connexion PostgreSQL                       |
| `JWT_SECRET`              | Secret du token d'accès (**à changer** en production) |
| `JWT_REFRESH_SECRET`      | Secret du refresh token                              |
| `CORS_ORIGINS`            | Origines autorisées (csv)                            |
| `BCRYPT_ROUNDS`           | Coût bcrypt (12 par défaut)                          |
| `NEXT_PUBLIC_API_URL`     | URL API publique exposée au frontend                 |

---

## Scripts disponibles

À la racine du monorepo :

| Script                  | Effet                                                   |
| ----------------------- | ------------------------------------------------------- |
| `pnpm dev`              | Démarre API + Web en parallèle                          |
| `pnpm build`            | Build de tous les packages                              |
| `pnpm docker:up/down`   | Démarre / arrête l'infrastructure Docker                |
| `pnpm api:dev`          | API NestJS en mode watch                                |
| `pnpm api:migrate`      | Lance les migrations Prisma                             |
| `pnpm api:seed`         | Provisionne les données de démonstration                |
| `pnpm web:dev`          | Next.js en mode dev (port 3000)                         |
| `pnpm web:build`        | Build de production Next.js                             |
| `pnpm format`           | Formatage Prettier de tout le repo                      |

---

## Feuille de route

La roadmap détaillée est dans [`docs/ROADMAP.md`](./docs/ROADMAP.md). Prochaines
itérations envisagées :

- Modules **ventes**, **logistique**, **transport**, **CRM léger**
- Intégrations **comptabilité** (Sage, Odoo, SAP), **paiement mobile** (Wave, Orange Money)
- **Mobile app** terrain (React Native) : réception, picking, inventaire au scanner
- **IA** : prévisions de demande, recommandations de réapprovisionnement, anomalies
- **SSO** (SAML / OIDC), **MFA**, **chiffrement au repos** des champs sensibles
- **Webhooks**, **Event Bus** (RabbitMQ/Kafka), **GraphQL Gateway** optionnelle
- **Offline-first** mobile, support PWA

---

## Licence

Code propriétaire — © GESTOCK. Tous droits réservés.
