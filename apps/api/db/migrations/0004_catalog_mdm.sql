-- 0004_catalog_mdm.sql
-- Catalogue MDM : produits maitres, variantes, attributs, templates, kits, BOM et classifications.

BEGIN;

CREATE TABLE IF NOT EXISTS app.catalog_product_masters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
  organization_id text NOT NULL REFERENCES app.organizations(id) ON DELETE CASCADE,
  product_code text NOT NULL,
  product_name text NOT NULL,
  family text NOT NULL,
  brand text NOT NULL,
  product_type text NOT NULL CHECK (product_type IN ('standard', 'variant', 'kit', 'bom', 'logistics_service')),
  category_path text NOT NULL,
  template_code text NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('active', 'draft', 'archived')),
  data_quality_score numeric(5, 2) NOT NULL DEFAULT 0 CHECK (data_quality_score BETWEEN 0 AND 100),
  created_by text REFERENCES app.users(id),
  updated_by text REFERENCES app.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, product_code)
);

CREATE INDEX IF NOT EXISTS idx_catalog_product_masters_tenant_org
  ON app.catalog_product_masters (tenant_id, organization_id);

CREATE TABLE IF NOT EXISTS app.catalog_attributes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
  code text NOT NULL,
  label text NOT NULL,
  value_type text NOT NULL CHECK (value_type IN ('text', 'number', 'boolean', 'date', 'select')),
  unit text,
  is_required boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, code)
);

CREATE TABLE IF NOT EXISTS app.catalog_product_attributes (
  product_master_id uuid NOT NULL REFERENCES app.catalog_product_masters(id) ON DELETE CASCADE,
  attribute_id uuid NOT NULL REFERENCES app.catalog_attributes(id) ON DELETE CASCADE,
  value text NOT NULL,
  PRIMARY KEY (product_master_id, attribute_id)
);

CREATE TABLE IF NOT EXISTS app.catalog_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
  product_master_id uuid NOT NULL REFERENCES app.catalog_product_masters(id) ON DELETE CASCADE,
  variant_code text NOT NULL,
  variant_name text NOT NULL,
  attributes jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_master_id, variant_code)
);

CREATE TABLE IF NOT EXISTS app.catalog_templates (
  id text PRIMARY KEY,
  tenant_id text NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
  code text NOT NULL,
  label text NOT NULL,
  description text NOT NULL DEFAULT '',
  required_attribute_codes text[] NOT NULL DEFAULT ARRAY[]::text[],
  UNIQUE (tenant_id, code)
);

CREATE TABLE IF NOT EXISTS app.catalog_kits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
  organization_id text NOT NULL REFERENCES app.organizations(id) ON DELETE CASCADE,
  kit_code text NOT NULL,
  kit_name text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
  UNIQUE (organization_id, kit_code)
);

CREATE TABLE IF NOT EXISTS app.catalog_bom_components (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
  parent_product_master_id uuid REFERENCES app.catalog_product_masters(id) ON DELETE CASCADE,
  kit_id uuid REFERENCES app.catalog_kits(id) ON DELETE CASCADE,
  component_name text NOT NULL,
  component_code text NOT NULL,
  quantity numeric(14, 3) NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit text NOT NULL,
  CHECK (parent_product_master_id IS NOT NULL OR kit_id IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS app.catalog_classifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
  system_code text NOT NULL,
  class_code text NOT NULL,
  label text NOT NULL,
  description text NOT NULL DEFAULT '',
  UNIQUE (tenant_id, system_code, class_code)
);

CREATE TABLE IF NOT EXISTS app.catalog_product_classifications (
  product_master_id uuid NOT NULL REFERENCES app.catalog_product_masters(id) ON DELETE CASCADE,
  classification_id uuid NOT NULL REFERENCES app.catalog_classifications(id) ON DELETE CASCADE,
  PRIMARY KEY (product_master_id, classification_id)
);

CREATE TABLE IF NOT EXISTS app.catalog_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
  product_master_id uuid REFERENCES app.catalog_product_masters(id) ON DELETE CASCADE,
  document_scope text NOT NULL CHECK (document_scope IN ('product', 'template', 'classification', 'library')),
  file_name text NOT NULL,
  version text NOT NULL DEFAULT 'v1',
  storage_path text NOT NULL,
  uploaded_by text REFERENCES app.users(id),
  uploaded_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS app.catalog_history (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  tenant_id text NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
  organization_id text NOT NULL REFERENCES app.organizations(id) ON DELETE CASCADE,
  product_master_id uuid REFERENCES app.catalog_product_masters(id) ON DELETE SET NULL,
  actor_user_id text REFERENCES app.users(id),
  action text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE app.catalog_product_masters ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.catalog_product_masters FORCE ROW LEVEL SECURITY;
ALTER TABLE app.catalog_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.catalog_attributes FORCE ROW LEVEL SECURITY;
ALTER TABLE app.catalog_product_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.catalog_product_attributes FORCE ROW LEVEL SECURITY;
ALTER TABLE app.catalog_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.catalog_variants FORCE ROW LEVEL SECURITY;
ALTER TABLE app.catalog_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.catalog_templates FORCE ROW LEVEL SECURITY;
ALTER TABLE app.catalog_kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.catalog_kits FORCE ROW LEVEL SECURITY;
ALTER TABLE app.catalog_bom_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.catalog_bom_components FORCE ROW LEVEL SECURITY;
ALTER TABLE app.catalog_classifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.catalog_classifications FORCE ROW LEVEL SECURITY;
ALTER TABLE app.catalog_product_classifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.catalog_product_classifications FORCE ROW LEVEL SECURITY;
ALTER TABLE app.catalog_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.catalog_documents FORCE ROW LEVEL SECURITY;
ALTER TABLE app.catalog_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.catalog_history FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS catalog_product_masters_org_membership ON app.catalog_product_masters;
CREATE POLICY catalog_product_masters_org_membership
  ON app.catalog_product_masters
  USING (
    tenant_id = app.current_tenant_id()
    AND EXISTS (
      SELECT 1
      FROM app.user_organization_access access
      WHERE access.organization_id = catalog_product_masters.organization_id
        AND access.user_id = app.current_user_id()
        AND access.status = 'active'
    )
  )
  WITH CHECK (tenant_id = app.current_tenant_id());

DROP POLICY IF EXISTS catalog_attributes_tenant_isolation ON app.catalog_attributes;
CREATE POLICY catalog_attributes_tenant_isolation
  ON app.catalog_attributes
  USING (tenant_id = app.current_tenant_id())
  WITH CHECK (tenant_id = app.current_tenant_id());

DROP POLICY IF EXISTS catalog_templates_tenant_isolation ON app.catalog_templates;
CREATE POLICY catalog_templates_tenant_isolation
  ON app.catalog_templates
  USING (tenant_id = app.current_tenant_id())
  WITH CHECK (tenant_id = app.current_tenant_id());

DROP POLICY IF EXISTS catalog_classifications_tenant_isolation ON app.catalog_classifications;
CREATE POLICY catalog_classifications_tenant_isolation
  ON app.catalog_classifications
  USING (tenant_id = app.current_tenant_id())
  WITH CHECK (tenant_id = app.current_tenant_id());

DROP POLICY IF EXISTS catalog_variants_product_membership ON app.catalog_variants;
CREATE POLICY catalog_variants_product_membership
  ON app.catalog_variants
  USING (
    tenant_id = app.current_tenant_id()
    AND EXISTS (
      SELECT 1
      FROM app.catalog_product_masters product
      JOIN app.user_organization_access access
        ON access.organization_id = product.organization_id
      WHERE product.id = catalog_variants.product_master_id
        AND access.user_id = app.current_user_id()
        AND access.status = 'active'
    )
  )
  WITH CHECK (tenant_id = app.current_tenant_id());

DROP POLICY IF EXISTS catalog_kits_org_membership ON app.catalog_kits;
CREATE POLICY catalog_kits_org_membership
  ON app.catalog_kits
  USING (
    tenant_id = app.current_tenant_id()
    AND EXISTS (
      SELECT 1
      FROM app.user_organization_access access
      WHERE access.organization_id = catalog_kits.organization_id
        AND access.user_id = app.current_user_id()
        AND access.status = 'active'
    )
  )
  WITH CHECK (tenant_id = app.current_tenant_id());

DROP POLICY IF EXISTS catalog_documents_tenant_isolation ON app.catalog_documents;
CREATE POLICY catalog_documents_tenant_isolation
  ON app.catalog_documents
  USING (tenant_id = app.current_tenant_id())
  WITH CHECK (tenant_id = app.current_tenant_id());

DROP POLICY IF EXISTS catalog_history_org_membership ON app.catalog_history;
CREATE POLICY catalog_history_org_membership
  ON app.catalog_history
  USING (
    tenant_id = app.current_tenant_id()
    AND EXISTS (
      SELECT 1
      FROM app.user_organization_access access
      WHERE access.organization_id = catalog_history.organization_id
        AND access.user_id = app.current_user_id()
        AND access.status = 'active'
    )
  )
  WITH CHECK (tenant_id = app.current_tenant_id());

DROP POLICY IF EXISTS catalog_product_attributes_tenant_join ON app.catalog_product_attributes;
CREATE POLICY catalog_product_attributes_tenant_join
  ON app.catalog_product_attributes
  USING (
    EXISTS (
      SELECT 1
      FROM app.catalog_product_masters product
      WHERE product.id = catalog_product_attributes.product_master_id
        AND product.tenant_id = app.current_tenant_id()
    )
  );

DROP POLICY IF EXISTS catalog_bom_components_tenant_join ON app.catalog_bom_components;
CREATE POLICY catalog_bom_components_tenant_join
  ON app.catalog_bom_components
  USING (tenant_id = app.current_tenant_id())
  WITH CHECK (tenant_id = app.current_tenant_id());

DROP POLICY IF EXISTS catalog_product_classifications_tenant_join ON app.catalog_product_classifications;
CREATE POLICY catalog_product_classifications_tenant_join
  ON app.catalog_product_classifications
  USING (
    EXISTS (
      SELECT 1
      FROM app.catalog_product_masters product
      WHERE product.id = catalog_product_classifications.product_master_id
        AND product.tenant_id = app.current_tenant_id()
    )
  );

INSERT INTO app.catalog_templates (id, tenant_id, code, label, description, required_attribute_codes)
VALUES
  ('tpl-medication', 'tenant-dev', 'TPL-MED', 'Template Médicament', 'Produit médical avec dosage, forme, AMM et conservation.', ARRAY['dosage', 'form', 'storage']),
  ('tpl-material', 'tenant-dev', 'TPL-MAT', 'Template Matériaux', 'Matériaux avec poids, classe, conditionnement et douane.', ARRAY['weight', 'grade', 'palletization']),
  ('tpl-spare-part', 'tenant-dev', 'TPL-SPARE', 'Template Pièce détachée', 'Pièce technique avec compatibilités et nomenclature.', ARRAY['compatibility', 'power']),
  ('tpl-food', 'tenant-dev', 'TPL-FOOD', 'Template Produit alimentaire', 'Produit alimentaire avec péremption et conservation.', ARRAY['capacity', 'storage']),
  ('tpl-chemical', 'tenant-dev', 'TPL-CHEM', 'Template Produit chimique', 'Produit chimique avec FDS, danger et transport.', ARRAY['capacity', 'hazard_class'])
ON CONFLICT (id) DO UPDATE
SET label = EXCLUDED.label,
    description = EXCLUDED.description,
    required_attribute_codes = EXCLUDED.required_attribute_codes;

INSERT INTO app.catalog_attributes (tenant_id, code, label, value_type, unit, is_required)
VALUES
  ('tenant-dev', 'color', 'Couleur', 'select', NULL, false),
  ('tenant-dev', 'size', 'Taille', 'select', NULL, false),
  ('tenant-dev', 'weight', 'Poids', 'number', 'kg', true),
  ('tenant-dev', 'capacity', 'Capacité', 'number', 'L', false),
  ('tenant-dev', 'power', 'Puissance', 'number', 'W', false),
  ('tenant-dev', 'length', 'Longueur', 'number', 'cm', false),
  ('tenant-dev', 'width', 'Largeur', 'number', 'cm', false),
  ('tenant-dev', 'height', 'Hauteur', 'number', 'cm', false),
  ('tenant-dev', 'dosage', 'Dosage', 'text', NULL, false),
  ('tenant-dev', 'storage', 'Conservation', 'text', NULL, false)
ON CONFLICT (tenant_id, code) DO UPDATE
SET label = EXCLUDED.label,
    value_type = EXCLUDED.value_type,
    unit = EXCLUDED.unit,
    is_required = EXCLUDED.is_required;

INSERT INTO app.catalog_classifications (tenant_id, system_code, class_code, label, description)
VALUES
  ('tenant-dev', 'GS1', '51142000', 'Analgésiques', 'Classification GS1 santé'),
  ('tenant-dev', 'UNSPSC', '42132203', 'Gants médicaux', 'Consommables médicaux'),
  ('tenant-dev', 'OHADA', '30049000', 'Médicaments préparés', 'Classe douanière OHADA'),
  ('tenant-dev', 'ABC', 'A', 'Classe A', 'Forte valeur ou forte criticité'),
  ('tenant-dev', 'XYZ', 'X', 'Demande stable', 'Consommation régulière')
ON CONFLICT (tenant_id, system_code, class_code) DO UPDATE
SET label = EXCLUDED.label,
    description = EXCLUDED.description;

INSERT INTO app.catalog_product_masters (
  tenant_id,
  organization_id,
  product_code,
  product_name,
  family,
  brand,
  product_type,
  category_path,
  template_code,
  status,
  data_quality_score,
  created_by,
  updated_by
)
VALUES
  ('tenant-dev', 'org-gestock-sa', 'MDM-PARA-500', 'Paracétamol 500mg', 'Médicaments / Comprimés', 'BioPharma', 'standard', 'Consommables > Médicaments > Analgiques', 'TPL-MED', 'active', 98.5, 'usr-admin', 'usr-admin'),
  ('tenant-dev', 'org-gestock-sa', 'MDM-GANT-LATEX', 'Gants médicaux latex', 'Consommables / Protection', 'MediSafe', 'variant', 'Consommables > Protection > Gants', 'TPL-MED', 'active', 96.2, 'usr-admin', 'usr-admin'),
  ('tenant-dev', 'org-gestock-sa', 'KIT-EPI-STD', 'Kit EPI standard', 'Sécurité / Kits', 'Gestock Safety', 'kit', 'Kits > Sécurité > EPI', 'TPL-MAT', 'active', 94.8, 'usr-admin', 'usr-admin'),
  ('tenant-dev', 'org-gestock-sa', 'BOM-TABLE-BUREAU', 'Table de bureau', 'Mobilier / Bureau', 'OfficeLine', 'bom', 'Nomenclatures > Mobilier > Tables', 'TPL-SPARE', 'active', 93.4, 'usr-admin', 'usr-admin')
ON CONFLICT (organization_id, product_code) DO UPDATE
SET product_name = EXCLUDED.product_name,
    family = EXCLUDED.family,
    brand = EXCLUDED.brand,
    product_type = EXCLUDED.product_type,
    category_path = EXCLUDED.category_path,
    status = EXCLUDED.status,
    data_quality_score = EXCLUDED.data_quality_score,
    updated_at = now();

INSERT INTO app.catalog_variants (tenant_id, product_master_id, variant_code, variant_name, attributes, status)
SELECT 'tenant-dev', product.id, variant.variant_code, variant.variant_name, variant.attributes::jsonb, 'active'
FROM app.catalog_product_masters product
CROSS JOIN (
  VALUES
    ('GANT-LATEX-S', 'Gants latex S', '{"size":"S","material":"latex"}'),
    ('GANT-LATEX-M', 'Gants latex M', '{"size":"M","material":"latex"}'),
    ('GANT-LATEX-L', 'Gants latex L', '{"size":"L","material":"latex"}')
) AS variant(variant_code, variant_name, attributes)
WHERE product.organization_id = 'org-gestock-sa'
  AND product.product_code = 'MDM-GANT-LATEX'
ON CONFLICT (product_master_id, variant_code) DO NOTHING;

INSERT INTO app.catalog_kits (tenant_id, organization_id, kit_code, kit_name, status)
VALUES
  ('tenant-dev', 'org-gestock-sa', 'KIT-EPI-STD', 'Kit EPI standard', 'active'),
  ('tenant-dev', 'org-gestock-sa', 'KIT-BUREAU-STD', 'Kit Bureau standard', 'active')
ON CONFLICT (organization_id, kit_code) DO UPDATE
SET kit_name = EXCLUDED.kit_name,
    status = EXCLUDED.status;

INSERT INTO app.catalog_history (tenant_id, organization_id, actor_user_id, action, metadata)
VALUES
  ('tenant-dev', 'org-gestock-sa', 'usr-admin', 'catalog.product.created', '{"product_code":"MDM-PARA-500"}'),
  ('tenant-dev', 'org-gestock-sa', 'usr-admin', 'catalog.attribute.updated', '{"attribute":"dosage"}'),
  ('tenant-dev', 'org-gestock-sa', 'usr-admin', 'catalog.variant.created', '{"variant_code":"GANT-LATEX-L"}')
ON CONFLICT DO NOTHING;

COMMIT;
