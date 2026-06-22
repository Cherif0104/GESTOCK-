-- 0003_inventory_articles_catalog.sql
-- Module Articles : catalogue, codes-barres, stock, lots, documents et RLS.

BEGIN;

CREATE TABLE IF NOT EXISTS app.article_categories (
  id text PRIMARY KEY,
  tenant_id text NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
  parent_category_id text REFERENCES app.article_categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  code text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, code)
);

CREATE INDEX IF NOT EXISTS idx_article_categories_tenant
  ON app.article_categories (tenant_id);

CREATE TABLE IF NOT EXISTS app.articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
  organization_id text NOT NULL REFERENCES app.organizations(id) ON DELETE CASCADE,
  reference text NOT NULL,
  designation text NOT NULL,
  category_id text REFERENCES app.article_categories(id) ON DELETE SET NULL,
  family text NOT NULL DEFAULT '',
  brand text NOT NULL DEFAULT '',
  laboratory text NOT NULL DEFAULT '',
  base_unit text NOT NULL,
  sales_unit text NOT NULL,
  purchase_unit text NOT NULL,
  average_purchase_price numeric(14, 2) NOT NULL DEFAULT 0,
  sales_price numeric(14, 2) NOT NULL DEFAULT 0,
  vat_rate numeric(5, 2) NOT NULL DEFAULT 0,
  customs_code text,
  origin_country text,
  shelf_life_months integer CHECK (shelf_life_months IS NULL OR shelf_life_months >= 0),
  storage_temperature text,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'low_stock', 'out_of_stock', 'disabled')),
  created_by text REFERENCES app.users(id),
  updated_by text REFERENCES app.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, reference)
);

CREATE INDEX IF NOT EXISTS idx_articles_tenant_org
  ON app.articles (tenant_id, organization_id);

CREATE INDEX IF NOT EXISTS idx_articles_reference
  ON app.articles (tenant_id, reference);

CREATE TABLE IF NOT EXISTS app.article_barcodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
  article_id uuid NOT NULL REFERENCES app.articles(id) ON DELETE CASCADE,
  barcode text NOT NULL,
  format text NOT NULL CHECK (format IN ('ean13', 'ean14', 'qr', 'internal')),
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, barcode)
);

CREATE INDEX IF NOT EXISTS idx_article_barcodes_article
  ON app.article_barcodes (article_id);

CREATE TABLE IF NOT EXISTS app.article_stocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
  organization_id text NOT NULL REFERENCES app.organizations(id) ON DELETE CASCADE,
  article_id uuid NOT NULL REFERENCES app.articles(id) ON DELETE CASCADE,
  warehouse_id text NOT NULL,
  location_code text NOT NULL,
  available_quantity numeric(14, 3) NOT NULL DEFAULT 0,
  reserved_quantity numeric(14, 3) NOT NULL DEFAULT 0,
  blocked_quantity numeric(14, 3) NOT NULL DEFAULT 0,
  reorder_threshold numeric(14, 3) NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (article_id, warehouse_id, location_code)
);

CREATE INDEX IF NOT EXISTS idx_article_stocks_org_article
  ON app.article_stocks (organization_id, article_id);

CREATE TABLE IF NOT EXISTS app.article_lots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
  organization_id text NOT NULL REFERENCES app.organizations(id) ON DELETE CASCADE,
  article_id uuid NOT NULL REFERENCES app.articles(id) ON DELETE CASCADE,
  lot_number text NOT NULL,
  quantity numeric(14, 3) NOT NULL DEFAULT 0,
  expires_at date,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'quarantine', 'expired', 'blocked')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (article_id, lot_number)
);

CREATE INDEX IF NOT EXISTS idx_article_lots_expiry
  ON app.article_lots (tenant_id, organization_id, expires_at);

CREATE TABLE IF NOT EXISTS app.article_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
  organization_id text NOT NULL REFERENCES app.organizations(id) ON DELETE CASCADE,
  article_id uuid NOT NULL REFERENCES app.articles(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  document_type text NOT NULL,
  storage_path text NOT NULL,
  size_kb integer NOT NULL DEFAULT 0 CHECK (size_kb >= 0),
  uploaded_by text REFERENCES app.users(id),
  uploaded_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_article_documents_article
  ON app.article_documents (article_id);

ALTER TABLE app.article_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.article_categories FORCE ROW LEVEL SECURITY;
ALTER TABLE app.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.articles FORCE ROW LEVEL SECURITY;
ALTER TABLE app.article_barcodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.article_barcodes FORCE ROW LEVEL SECURITY;
ALTER TABLE app.article_stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.article_stocks FORCE ROW LEVEL SECURITY;
ALTER TABLE app.article_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.article_lots FORCE ROW LEVEL SECURITY;
ALTER TABLE app.article_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.article_documents FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS article_categories_tenant_isolation ON app.article_categories;
CREATE POLICY article_categories_tenant_isolation
  ON app.article_categories
  USING (tenant_id = app.current_tenant_id())
  WITH CHECK (tenant_id = app.current_tenant_id());

DROP POLICY IF EXISTS articles_org_membership ON app.articles;
CREATE POLICY articles_org_membership
  ON app.articles
  USING (
    tenant_id = app.current_tenant_id()
    AND EXISTS (
      SELECT 1
      FROM app.user_organization_access access
      WHERE access.organization_id = articles.organization_id
        AND access.user_id = app.current_user_id()
        AND access.status = 'active'
    )
  )
  WITH CHECK (tenant_id = app.current_tenant_id());

DROP POLICY IF EXISTS article_barcodes_article_membership ON app.article_barcodes;
CREATE POLICY article_barcodes_article_membership
  ON app.article_barcodes
  USING (
    tenant_id = app.current_tenant_id()
    AND EXISTS (
      SELECT 1
      FROM app.articles article
      JOIN app.user_organization_access access
        ON access.organization_id = article.organization_id
      WHERE article.id = article_barcodes.article_id
        AND access.user_id = app.current_user_id()
        AND access.status = 'active'
    )
  )
  WITH CHECK (tenant_id = app.current_tenant_id());

DROP POLICY IF EXISTS article_stocks_org_membership ON app.article_stocks;
CREATE POLICY article_stocks_org_membership
  ON app.article_stocks
  USING (
    tenant_id = app.current_tenant_id()
    AND EXISTS (
      SELECT 1
      FROM app.user_organization_access access
      WHERE access.organization_id = article_stocks.organization_id
        AND access.user_id = app.current_user_id()
        AND access.status = 'active'
    )
  )
  WITH CHECK (tenant_id = app.current_tenant_id());

DROP POLICY IF EXISTS article_lots_org_membership ON app.article_lots;
CREATE POLICY article_lots_org_membership
  ON app.article_lots
  USING (
    tenant_id = app.current_tenant_id()
    AND EXISTS (
      SELECT 1
      FROM app.user_organization_access access
      WHERE access.organization_id = article_lots.organization_id
        AND access.user_id = app.current_user_id()
        AND access.status = 'active'
    )
  )
  WITH CHECK (tenant_id = app.current_tenant_id());

DROP POLICY IF EXISTS article_documents_org_membership ON app.article_documents;
CREATE POLICY article_documents_org_membership
  ON app.article_documents
  USING (
    tenant_id = app.current_tenant_id()
    AND EXISTS (
      SELECT 1
      FROM app.user_organization_access access
      WHERE access.organization_id = article_documents.organization_id
        AND access.user_id = app.current_user_id()
        AND access.status = 'active'
    )
  )
  WITH CHECK (tenant_id = app.current_tenant_id());

INSERT INTO app.article_categories (id, tenant_id, parent_category_id, name, code)
VALUES
  ('cat-medicaments', 'tenant-dev', NULL, 'Médicaments', 'MED'),
  ('cat-consommables', 'tenant-dev', NULL, 'Consommables', 'CONS'),
  ('cat-materiaux', 'tenant-dev', NULL, 'Matériaux', 'MAT'),
  ('cat-alimentaire', 'tenant-dev', NULL, 'Alimentaire', 'FOOD'),
  ('cat-electricite', 'tenant-dev', NULL, 'Électricité', 'ELEC')
ON CONFLICT (tenant_id, code) DO UPDATE
SET name = EXCLUDED.name;

WITH article_seed AS (
  INSERT INTO app.articles (
    tenant_id,
    organization_id,
    reference,
    designation,
    category_id,
    family,
    brand,
    laboratory,
    base_unit,
    sales_unit,
    purchase_unit,
    average_purchase_price,
    sales_price,
    vat_rate,
    customs_code,
    origin_country,
    shelf_life_months,
    storage_temperature,
    description,
    status,
    created_by,
    updated_by
  )
  VALUES (
    'tenant-dev',
    'org-gestock-sa',
    'PARA-500',
    'Paracétamol 500mg',
    'cat-medicaments',
    'Comprimés',
    'BIOPHARMA',
    'BIOPHARMA',
    'Boîte',
    'Boîte (20)',
    'Carton (50 boîtes)',
    850,
    1250,
    18,
    '30049000',
    'France',
    36,
    'Ambiante',
    'Analgésique et antipyrétique indiqué dans le traitement symptomatique des douleurs légères à modérées et/ou de la fièvre.',
    'active',
    'usr-admin',
    'usr-admin'
  )
  ON CONFLICT (organization_id, reference) DO UPDATE
  SET designation = EXCLUDED.designation,
      status = EXCLUDED.status,
      updated_at = now()
  RETURNING id
)
INSERT INTO app.article_barcodes (tenant_id, article_id, barcode, format, is_primary)
SELECT 'tenant-dev', id, barcode, format, is_primary
FROM article_seed
CROSS JOIN (
  VALUES
    ('6161101234567', 'ean13', true),
    ('6161101234564', 'ean14', false),
    ('ART-2024-001256', 'internal', false)
) AS barcodes(barcode, format, is_primary)
ON CONFLICT (tenant_id, barcode) DO NOTHING;

INSERT INTO app.article_stocks (tenant_id, organization_id, article_id, warehouse_id, location_code, available_quantity, reserved_quantity, blocked_quantity, reorder_threshold)
SELECT 'tenant-dev', 'org-gestock-sa', article.id, 'wh-dkr-central', 'A-12', 2500, 350, 120, 500
FROM app.articles article
WHERE article.organization_id = 'org-gestock-sa'
  AND article.reference = 'PARA-500'
ON CONFLICT (article_id, warehouse_id, location_code) DO UPDATE
SET available_quantity = EXCLUDED.available_quantity,
    reserved_quantity = EXCLUDED.reserved_quantity,
    blocked_quantity = EXCLUDED.blocked_quantity,
    updated_at = now();

INSERT INTO app.article_lots (tenant_id, organization_id, article_id, lot_number, quantity, expires_at, status)
SELECT 'tenant-dev', 'org-gestock-sa', article.id, 'LOT-240501', 720, DATE '2024-08-15', 'active'
FROM app.articles article
WHERE article.organization_id = 'org-gestock-sa'
  AND article.reference = 'PARA-500'
ON CONFLICT (article_id, lot_number) DO UPDATE
SET quantity = EXCLUDED.quantity,
    expires_at = EXCLUDED.expires_at,
    status = EXCLUDED.status;

INSERT INTO app.article_documents (tenant_id, organization_id, article_id, file_name, document_type, storage_path, size_kb, uploaded_by)
SELECT 'tenant-dev', 'org-gestock-sa', article.id, document.file_name, document.document_type, document.storage_path, document.size_kb, 'usr-admin'
FROM app.articles article
CROSS JOIN (
  VALUES
    ('Fiche technique.pdf', 'technical_sheet', 'articles/para-500/fiche-technique.pdf', 245),
    ('Certificat d analyse.pdf', 'certificate', 'articles/para-500/certificat-analyse.pdf', 320),
    ('Notice utilisation.pdf', 'notice', 'articles/para-500/notice-utilisation.pdf', 512),
    ('Autorisation mise sur marché.pdf', 'authorization', 'articles/para-500/amm.pdf', 780)
) AS document(file_name, document_type, storage_path, size_kb)
WHERE article.organization_id = 'org-gestock-sa'
  AND article.reference = 'PARA-500'
ON CONFLICT DO NOTHING;

COMMIT;
