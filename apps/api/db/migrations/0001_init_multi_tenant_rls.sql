-- 0001_init_multi_tenant_rls.sql
-- Bootstrap PostgreSQL shared-schema + tenant_id + RLS.
-- Cette migration suppose PostgreSQL 14+.

BEGIN;

CREATE SCHEMA IF NOT EXISTS app;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION app.current_tenant_id()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(current_setting('app.tenant_id', true), '');
$$;

CREATE TABLE IF NOT EXISTS app.tenants (
  id text PRIMARY KEY,
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  plan text NOT NULL CHECK (plan IN ('starter', 'business', 'enterprise')),
  region text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS app.users (
  id text PRIMARY KEY,
  email text NOT NULL UNIQUE,
  display_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS app.tenant_users (
  tenant_id text NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,
  roles text[] NOT NULL DEFAULT ARRAY['viewer']::text[],
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, user_id)
);

CREATE TABLE IF NOT EXISTS app.inventory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
  sku text NOT NULL,
  quantity integer NOT NULL DEFAULT 0,
  reorder_threshold integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, sku),
  CHECK (quantity >= 0),
  CHECK (reorder_threshold >= 0)
);

CREATE INDEX IF NOT EXISTS idx_inventory_items_tenant_id
  ON app.inventory_items (tenant_id);

CREATE TABLE IF NOT EXISTS app.purchase_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
  po_number text NOT NULL,
  status text NOT NULL CHECK (status IN ('draft', 'approved', 'sent', 'received', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, po_number)
);

CREATE INDEX IF NOT EXISTS idx_purchase_orders_tenant_id
  ON app.purchase_orders (tenant_id);

CREATE TABLE IF NOT EXISTS app.audit_logs (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  tenant_id text NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
  actor_user_id text REFERENCES app.users(id),
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_created_at
  ON app.audit_logs (tenant_id, created_at DESC);

ALTER TABLE app.tenant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.tenant_users FORCE ROW LEVEL SECURITY;
ALTER TABLE app.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.inventory_items FORCE ROW LEVEL SECURITY;
ALTER TABLE app.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.purchase_orders FORCE ROW LEVEL SECURITY;
ALTER TABLE app.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.audit_logs FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_users_isolation ON app.tenant_users;
CREATE POLICY tenant_users_isolation
  ON app.tenant_users
  USING (tenant_id = app.current_tenant_id())
  WITH CHECK (tenant_id = app.current_tenant_id());

DROP POLICY IF EXISTS inventory_items_isolation ON app.inventory_items;
CREATE POLICY inventory_items_isolation
  ON app.inventory_items
  USING (tenant_id = app.current_tenant_id())
  WITH CHECK (tenant_id = app.current_tenant_id());

DROP POLICY IF EXISTS purchase_orders_isolation ON app.purchase_orders;
CREATE POLICY purchase_orders_isolation
  ON app.purchase_orders
  USING (tenant_id = app.current_tenant_id())
  WITH CHECK (tenant_id = app.current_tenant_id());

DROP POLICY IF EXISTS audit_logs_isolation ON app.audit_logs;
CREATE POLICY audit_logs_isolation
  ON app.audit_logs
  USING (tenant_id = app.current_tenant_id())
  WITH CHECK (tenant_id = app.current_tenant_id());

-- Données seed minimales pour la tranche verticale de dev.
INSERT INTO app.tenants (id, code, name, plan, region)
VALUES ('tenant-dev', 'GESTOCK-DEV', 'Gestock Démo', 'business', 'af-south-1')
ON CONFLICT (id) DO NOTHING;

INSERT INTO app.users (id, email, display_name)
VALUES ('dev-user', 'dev.user@gestock.local', 'Dev User')
ON CONFLICT (id) DO NOTHING;

INSERT INTO app.tenant_users (tenant_id, user_id, roles)
VALUES ('tenant-dev', 'dev-user', ARRAY['admin']::text[])
ON CONFLICT (tenant_id, user_id) DO NOTHING;

COMMIT;
