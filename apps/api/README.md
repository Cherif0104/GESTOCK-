# GESTOCK API (bootstrap backend)

Backend Fastify TypeScript initial avec tranche verticale multi-tenant.

## Endpoints disponibles

- `GET /health`
- `GET /ready`
- `GET /v1/me`
- `GET /v1/tenant`
- `GET /v1/tenant/snapshot`

## Contexte tenant / utilisateur en mode dev

Sans auth réelle, injecter le contexte via headers :

- `x-tenant-id`
- `x-user-id`
- `x-user-email`
- `x-user-roles` (CSV: `admin,viewer,...`)

Exemple:

```bash
curl -s http://localhost:4000/v1/me \
  -H "x-tenant-id: tenant-dev" \
  -H "x-user-id: user-1" \
  -H "x-user-email: admin@gestock.local" \
  -H "x-user-roles: admin"
```

## Variables d'environnement clés

- `API_PORT` (défaut `4000`)
- `API_PREFIX` (défaut `/v1`)
- `AUTH_MODE` (`mock` par défaut, `jwt` possible en passthrough non signé)
- `DB_MODE` (`mock` par défaut, `postgres` renvoie actuellement `ready=false`)
- `DEFAULT_TENANT_ID`, `DEFAULT_TENANT_CODE`, `DEFAULT_TENANT_NAME`

## SQL

Migration initiale: `apps/api/db/migrations/0001_init_multi_tenant_rls.sql`.
