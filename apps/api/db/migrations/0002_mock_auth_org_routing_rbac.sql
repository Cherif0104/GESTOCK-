-- 0002_mock_auth_org_routing_rbac.sql
-- Prépare le routage post-login, les préférences d'organisation et le RBAC/RLS Supabase.

BEGIN;

CREATE OR REPLACE FUNCTION app.current_user_id()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(current_setting('app.user_id', true), '');
$$;

CREATE TABLE IF NOT EXISTS app.organizations (
  id text PRIMARY KEY,
  tenant_id text NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
  parent_organization_id text REFERENCES app.organizations(id) ON DELETE SET NULL,
  name text NOT NULL,
  country text NOT NULL,
  city text NOT NULL,
  domain text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'invited')),
  user_count integer NOT NULL DEFAULT 0 CHECK (user_count >= 0),
  warehouse_count integer NOT NULL DEFAULT 0 CHECK (warehouse_count >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_organizations_tenant_id
  ON app.organizations (tenant_id);

CREATE INDEX IF NOT EXISTS idx_organizations_parent_id
  ON app.organizations (parent_organization_id);

CREATE TABLE IF NOT EXISTS app.roles (
  id text PRIMARY KEY,
  code text NOT NULL UNIQUE,
  label text NOT NULL,
  level integer NOT NULL CHECK (level BETWEEN 1 AND 100),
  description text NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS app.permissions (
  id text PRIMARY KEY,
  code text NOT NULL UNIQUE,
  label text NOT NULL,
  module text NOT NULL,
  action text NOT NULL
);

CREATE TABLE IF NOT EXISTS app.role_permissions (
  role_id text NOT NULL REFERENCES app.roles(id) ON DELETE CASCADE,
  permission_id text NOT NULL REFERENCES app.permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS app.user_organization_access (
  organization_id text NOT NULL REFERENCES app.organizations(id) ON DELETE CASCADE,
  tenant_id text NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,
  role_id text NOT NULL REFERENCES app.roles(id),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'invited')),
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (organization_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_organization_access_user
  ON app.user_organization_access (user_id, status);

CREATE INDEX IF NOT EXISTS idx_user_organization_access_tenant
  ON app.user_organization_access (tenant_id, organization_id);

CREATE UNIQUE INDEX IF NOT EXISTS uq_user_default_organization
  ON app.user_organization_access (user_id)
  WHERE is_default;

CREATE TABLE IF NOT EXISTS app.user_login_preferences (
  user_id text PRIMARY KEY REFERENCES app.users(id) ON DELETE CASCADE,
  default_organization_id text REFERENCES app.organizations(id) ON DELETE SET NULL,
  first_login_required boolean NOT NULL DEFAULT true,
  mfa_required boolean NOT NULL DEFAULT false,
  last_selected_organization_id text REFERENCES app.organizations(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE app.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.organizations FORCE ROW LEVEL SECURITY;
ALTER TABLE app.user_organization_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.user_organization_access FORCE ROW LEVEL SECURITY;
ALTER TABLE app.user_login_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.user_login_preferences FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS organizations_visible_to_members ON app.organizations;
CREATE POLICY organizations_visible_to_members
  ON app.organizations
  USING (
    tenant_id = app.current_tenant_id()
    AND EXISTS (
      SELECT 1
      FROM app.user_organization_access access
      WHERE access.organization_id = organizations.id
        AND access.user_id = app.current_user_id()
        AND access.status = 'active'
    )
  )
  WITH CHECK (tenant_id = app.current_tenant_id());

DROP POLICY IF EXISTS user_organization_access_self ON app.user_organization_access;
CREATE POLICY user_organization_access_self
  ON app.user_organization_access
  USING (
    tenant_id = app.current_tenant_id()
    AND user_id = app.current_user_id()
  )
  WITH CHECK (tenant_id = app.current_tenant_id());

DROP POLICY IF EXISTS user_login_preferences_self ON app.user_login_preferences;
CREATE POLICY user_login_preferences_self
  ON app.user_login_preferences
  USING (user_id = app.current_user_id())
  WITH CHECK (user_id = app.current_user_id());

INSERT INTO app.roles (id, code, label, level, description)
VALUES
  ('role-direction', 'direction', 'Direction', 90, 'Pilotage consolidé et validation stratégique'),
  ('role-admin', 'admin', 'Administrateur', 100, 'Administration complète du tenant'),
  ('role-stock-manager', 'stock_manager', 'Responsable Stock', 70, 'Gestion des stocks et inventaires'),
  ('role-buyer', 'buyer', 'Acheteur', 60, 'Gestion des achats et fournisseurs'),
  ('role-warehouse', 'warehouse_operator', 'Magasinier', 40, 'Opérations entrepôt'),
  ('role-auditor', 'auditor', 'Auditeur', 30, 'Lecture et contrôle')
ON CONFLICT (id) DO UPDATE
SET label = EXCLUDED.label,
    level = EXCLUDED.level,
    description = EXCLUDED.description;

INSERT INTO app.permissions (id, code, label, module, action)
VALUES
  ('perm-dashboard-read', 'dashboard.read', 'Voir le tableau de bord', 'dashboard', 'read'),
  ('perm-stock-read', 'stock.read', 'Lire les stocks', 'stock', 'read'),
  ('perm-stock-write', 'stock.write', 'Modifier les stocks', 'stock', 'write'),
  ('perm-purchase-read', 'purchase.read', 'Lire les achats', 'purchase', 'read'),
  ('perm-purchase-write', 'purchase.write', 'Créer des achats', 'purchase', 'write'),
  ('perm-warehouse-operate', 'warehouse.operate', 'Opérer en entrepôt', 'warehouse', 'write'),
  ('perm-users-admin', 'users.admin', 'Administrer les utilisateurs', 'admin', 'write'),
  ('perm-audit-read', 'audit.read', 'Lire les journaux d audit', 'audit', 'read')
ON CONFLICT (id) DO UPDATE
SET label = EXCLUDED.label,
    module = EXCLUDED.module,
    action = EXCLUDED.action;

INSERT INTO app.role_permissions (role_id, permission_id)
VALUES
  ('role-direction', 'perm-dashboard-read'),
  ('role-direction', 'perm-stock-read'),
  ('role-direction', 'perm-purchase-read'),
  ('role-direction', 'perm-audit-read'),
  ('role-admin', 'perm-dashboard-read'),
  ('role-admin', 'perm-stock-read'),
  ('role-admin', 'perm-stock-write'),
  ('role-admin', 'perm-purchase-read'),
  ('role-admin', 'perm-purchase-write'),
  ('role-admin', 'perm-warehouse-operate'),
  ('role-admin', 'perm-users-admin'),
  ('role-admin', 'perm-audit-read'),
  ('role-stock-manager', 'perm-dashboard-read'),
  ('role-stock-manager', 'perm-stock-read'),
  ('role-stock-manager', 'perm-stock-write'),
  ('role-buyer', 'perm-dashboard-read'),
  ('role-buyer', 'perm-purchase-read'),
  ('role-buyer', 'perm-purchase-write'),
  ('role-warehouse', 'perm-dashboard-read'),
  ('role-warehouse', 'perm-warehouse-operate'),
  ('role-auditor', 'perm-dashboard-read'),
  ('role-auditor', 'perm-audit-read')
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO app.organizations (id, tenant_id, parent_organization_id, name, country, city, domain, status, user_count, warehouse_count)
VALUES
  ('org-gestock-sa', 'tenant-dev', NULL, 'GESTOCK SA', 'Sénégal', 'Dakar', 'gestock-sa.sn', 'active', 156, 8),
  ('org-gestock-ci', 'tenant-dev', 'org-gestock-sa', 'GESTOCK Côte d''Ivoire', 'Côte d''Ivoire', 'Abidjan', 'gestock-ci.ci', 'active', 87, 5),
  ('org-gestock-mali', 'tenant-dev', 'org-gestock-sa', 'GESTOCK Mali', 'Mali', 'Bamako', 'gestock-ml.ml', 'active', 64, 3),
  ('org-gestock-bf', 'tenant-dev', 'org-gestock-sa', 'GESTOCK Burkina Faso', 'Burkina Faso', 'Ouagadougou', 'gestock-bf.bf', 'active', 45, 2),
  ('org-gestock-bj', 'tenant-dev', 'org-gestock-sa', 'GESTOCK Bénin', 'Bénin', 'Cotonou', 'gestock-bj.bj', 'active', 38, 2)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    country = EXCLUDED.country,
    city = EXCLUDED.city,
    domain = EXCLUDED.domain,
    status = EXCLUDED.status,
    user_count = EXCLUDED.user_count,
    warehouse_count = EXCLUDED.warehouse_count,
    updated_at = now();

INSERT INTO app.users (id, email, display_name)
VALUES
  ('usr-direction', 'direction@gestock.local', 'Aminata Diop'),
  ('usr-admin', 'admin@gestock.local', 'Moussa Traoré'),
  ('usr-stock', 'stock@gestock.local', 'Nadia Kouamé'),
  ('usr-buyer', 'achats@gestock.local', 'Ibrahima Sow'),
  ('usr-warehouse', 'magasin@gestock.local', 'Grâce Mensah'),
  ('usr-auditor', 'audit@gestock.local', 'Jean-Baptiste Talla')
ON CONFLICT (id) DO UPDATE
SET email = EXCLUDED.email,
    display_name = EXCLUDED.display_name;

INSERT INTO app.user_organization_access (organization_id, tenant_id, user_id, role_id, status, is_default)
VALUES
  ('org-gestock-sa', 'tenant-dev', 'usr-direction', 'role-direction', 'active', false),
  ('org-gestock-ci', 'tenant-dev', 'usr-direction', 'role-direction', 'active', false),
  ('org-gestock-mali', 'tenant-dev', 'usr-direction', 'role-direction', 'active', false),
  ('org-gestock-bf', 'tenant-dev', 'usr-direction', 'role-direction', 'active', false),
  ('org-gestock-bj', 'tenant-dev', 'usr-direction', 'role-direction', 'active', false),
  ('org-gestock-sa', 'tenant-dev', 'usr-admin', 'role-admin', 'active', true),
  ('org-gestock-ci', 'tenant-dev', 'usr-stock', 'role-stock-manager', 'active', true),
  ('org-gestock-sa', 'tenant-dev', 'usr-buyer', 'role-buyer', 'active', false),
  ('org-gestock-bf', 'tenant-dev', 'usr-buyer', 'role-buyer', 'active', false),
  ('org-gestock-bj', 'tenant-dev', 'usr-warehouse', 'role-warehouse', 'active', true),
  ('org-gestock-sa', 'tenant-dev', 'usr-auditor', 'role-auditor', 'active', false)
ON CONFLICT (organization_id, user_id) DO UPDATE
SET role_id = EXCLUDED.role_id,
    status = EXCLUDED.status,
    is_default = EXCLUDED.is_default;

INSERT INTO app.user_login_preferences (user_id, default_organization_id, first_login_required, mfa_required, last_selected_organization_id)
VALUES
  ('usr-direction', NULL, false, true, NULL),
  ('usr-admin', 'org-gestock-sa', false, false, 'org-gestock-sa'),
  ('usr-stock', 'org-gestock-ci', false, false, 'org-gestock-ci'),
  ('usr-buyer', NULL, false, false, NULL),
  ('usr-warehouse', 'org-gestock-bj', false, false, 'org-gestock-bj'),
  ('usr-auditor', NULL, true, true, NULL)
ON CONFLICT (user_id) DO UPDATE
SET default_organization_id = EXCLUDED.default_organization_id,
    first_login_required = EXCLUDED.first_login_required,
    mfa_required = EXCLUDED.mfa_required,
    last_selected_organization_id = EXCLUDED.last_selected_organization_id,
    updated_at = now();

COMMIT;
