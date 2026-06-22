# Migrations SQL backend

## Migration initiale

- `migrations/0001_init_multi_tenant_rls.sql`

## Principes

- Schéma partagé `app` avec colonne `tenant_id`.
- Isolation via Row Level Security et policy basée sur `app.current_tenant_id()`.
- Le backend devra positionner `SET LOCAL app.tenant_id = '<tid>'` au début de chaque transaction.
- `app.audit_logs` est prévu pour recevoir les événements applicatifs sensibles.

## Exécution (exemple)

```bash
psql "$DATABASE_URL" -f apps/api/db/migrations/0001_init_multi_tenant_rls.sql
```
