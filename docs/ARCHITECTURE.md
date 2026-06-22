# Architecture GESTOCK

## Vue d'ensemble

```
┌──────────────────────────────────────────────────────────────────────────┐
│                              Utilisateurs                                 │
│  (Navigateur web · futur Mobile React Native · Intégrations API tierces)  │
└─────────────────┬─────────────────────────────────────┬──────────────────┘
                  │                                     │
                  ▼                                     ▼
        ┌──────────────────┐                ┌────────────────────────┐
        │   Web (Next.js)  │                │  API REST (NestJS)     │
        │  · Auth UI       │                │  · DDD modulaire       │
        │  · Dashboards    │ ─── HTTPS ────▶│  · OpenAPI/Swagger     │
        │  · CRUD métiers  │  JWT Bearer    │  · Throttling/CORS     │
        └──────────────────┘                │  · Validation stricte  │
                                            └───────────┬────────────┘
                                                        │ Prisma
                                                        ▼
                                            ┌────────────────────────┐
                                            │  PostgreSQL (multi-    │
                                            │  tenant par org_id)    │
                                            └────────────────────────┘
                                                        │
                                            (Redis cache · MailHog · S3
                                             futurs : Kafka, ELK…)
```

## Couches DDD côté API

| Couche          | Responsabilité                                                  | Exemples                                       |
| --------------- | --------------------------------------------------------------- | ---------------------------------------------- |
| Présentation    | Validation, sérialisation, RBAC, Swagger                        | `*.controller.ts`, DTO `class-validator`       |
| Application     | Cas d'usage métier, transactions, orchestration                 | `*.service.ts`, services applicatifs           |
| Domaine         | Règles métier invariantes, types, énums                         | `enums.ts`, validations Prisma                 |
| Infrastructure  | Accès données, intégrations externes                            | `PrismaService`, futurs adaptateurs            |

## Multi-tenant

- Chaque entité métier porte `organizationId`.
- Le `JwtStrategy` injecte l'organisation dans `request.user`.
- Le décorateur `@OrgId()` expose l'ID dans les controllers.
- Tous les services filtrent les requêtes `findFirst`/`findMany` par `organizationId`.

## Sécurité

- **JWT** : access (15 min) + refresh (7j) stocké hashé en base.
- **RBAC** : matrice permissions/rôles (`packages/shared/permissions.ts`).
- **Audit** : table `audit_logs` indexée sur `(orgId, entityType, entityId)`.
- **Mots de passe** : bcrypt 12 rounds, configurable.
- **Throttling** : 200 req/min/IP, configurable par route.

## Évolutivité

- **Stateless** : aucune session serveur, scale horizontal trivial.
- **Cache** : Redis disponible (rate limiting distribué, BullMQ pour jobs).
- **Event sourcing optionnel** : table `audit_logs` peut servir de journal.
- **Modules désactivables** : chaque module Nest peut être activé/désactivé.
- **API First** : OpenAPI permet de générer des SDK clients automatiquement.
