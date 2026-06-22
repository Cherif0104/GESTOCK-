# Contribuer à GESTOCK

Merci de votre intérêt ! Ce guide synthétise les conventions du projet.

## Prérequis

- Node.js ≥ 20, pnpm ≥ 9, Docker

## Mise en place

```bash
pnpm install
cp .env.example .env
pnpm docker:up
pnpm api:prisma generate && pnpm api:migrate -- --name init && pnpm api:seed
pnpm dev
```

## Conventions

- **Langue** : commentaires, libellés UI et documentation en **français**.
- **Code** : TypeScript strict, Prettier (config racine), nommage explicite.
- **Commits** : format Conventional Commits (`feat:`, `fix:`, `refactor:`, `chore:`).
- **Branches** : `feature/<sujet>`, `fix/<bug>`, etc.
- **Multi-tenant** : toute nouvelle entité métier **doit** porter `organizationId`
  et tout service **doit** filtrer dessus.
- **Permissions** : déclarer dans `packages/shared/permissions.ts` puis utiliser
  `@RequirePermissions(...)` sur les routes correspondantes.
- **DTO** : valider entrées via `class-validator`, documenter via `@nestjs/swagger`.
- **Migrations Prisma** : `pnpm api:migrate -- --name <nom>` puis commit du SQL généré.

## Structure d'un module métier

```
src/modules/<feature>/
  <feature>.module.ts
  <feature>.controller.ts
  <feature>.service.ts
  dto/
    create-<feature>.dto.ts
    update-<feature>.dto.ts
```

## Tests

- Tests unitaires (Jest) : `pnpm api:test`
- Tests e2e (à venir) : `pnpm --filter @gestock/api test:e2e`
