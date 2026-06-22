/**
 * Catalogue centralisé des permissions GESTOCK.
 * Convention : <domaine>:<action>
 */

export const PERMISSIONS = {
  // Organisation
  ORG_READ: 'organization:read',
  ORG_UPDATE: 'organization:update',
  ORG_MANAGE_MEMBERS: 'organization:manage_members',

  // Utilisateurs
  USER_READ: 'user:read',
  USER_CREATE: 'user:create',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',

  // Rôles
  ROLE_READ: 'role:read',
  ROLE_MANAGE: 'role:manage',

  // Sociétés / Sites / Entrepôts
  COMPANY_MANAGE: 'company:manage',
  SITE_MANAGE: 'site:manage',
  WAREHOUSE_READ: 'warehouse:read',
  WAREHOUSE_MANAGE: 'warehouse:manage',

  // Articles & catalogue
  PRODUCT_READ: 'product:read',
  PRODUCT_MANAGE: 'product:manage',
  CATEGORY_MANAGE: 'category:manage',

  // Fournisseurs
  SUPPLIER_READ: 'supplier:read',
  SUPPLIER_MANAGE: 'supplier:manage',

  // Achats
  PURCHASE_READ: 'purchase:read',
  PURCHASE_CREATE: 'purchase:create',
  PURCHASE_APPROVE: 'purchase:approve',
  PURCHASE_CANCEL: 'purchase:cancel',

  // Réceptions
  RECEIPT_READ: 'receipt:read',
  RECEIPT_CREATE: 'receipt:create',
  RECEIPT_CONFIRM: 'receipt:confirm',

  // Stocks & mouvements
  STOCK_READ: 'stock:read',
  STOCK_MOVE: 'stock:move',
  STOCK_ADJUST: 'stock:adjust',
  STOCK_TRANSFER: 'stock:transfer',

  // Inventaires
  INVENTORY_READ: 'inventory:read',
  INVENTORY_MANAGE: 'inventory:manage',
  INVENTORY_VALIDATE: 'inventory:validate',

  // Reporting & dashboards
  DASHBOARD_READ: 'dashboard:read',
  REPORT_READ: 'report:read',
  REPORT_EXPORT: 'report:export',

  // Audit
  AUDIT_READ: 'audit:read',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ALL_PERMISSIONS: Permission[] = Object.values(PERMISSIONS);
