/**
 * Énumérations métier partagées entre l'API et le Web.
 */

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INVITED = 'INVITED',
  DISABLED = 'DISABLED',
}

export enum SystemRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ORG_ADMIN = 'ORG_ADMIN',
  MANAGER = 'MANAGER',
  PURCHASER = 'PURCHASER',
  WAREHOUSE_OPERATOR = 'WAREHOUSE_OPERATOR',
  ACCOUNTANT = 'ACCOUNTANT',
  VIEWER = 'VIEWER',
}

export enum StockMovementType {
  RECEIPT = 'RECEIPT',
  ISSUE = 'ISSUE',
  TRANSFER_IN = 'TRANSFER_IN',
  TRANSFER_OUT = 'TRANSFER_OUT',
  ADJUSTMENT_IN = 'ADJUSTMENT_IN',
  ADJUSTMENT_OUT = 'ADJUSTMENT_OUT',
  INVENTORY = 'INVENTORY',
  RETURN_SUPPLIER = 'RETURN_SUPPLIER',
  RETURN_CUSTOMER = 'RETURN_CUSTOMER',
  SCRAP = 'SCRAP',
}

export enum PurchaseOrderStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  ORDERED = 'ORDERED',
  PARTIALLY_RECEIVED = 'PARTIALLY_RECEIVED',
  RECEIVED = 'RECEIVED',
  CANCELLED = 'CANCELLED',
  CLOSED = 'CLOSED',
}

export enum ReceiptStatus {
  DRAFT = 'DRAFT',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

export enum InventoryStatus {
  PLANNED = 'PLANNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  VALIDATED = 'VALIDATED',
  CANCELLED = 'CANCELLED',
}

export enum AlertSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
}

export enum AlertType {
  LOW_STOCK = 'LOW_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  OVER_STOCK = 'OVER_STOCK',
  EXPIRY_SOON = 'EXPIRY_SOON',
  EXPIRED = 'EXPIRED',
  PURCHASE_OVERDUE = 'PURCHASE_OVERDUE',
}

export enum SupportedLocale {
  FR = 'fr',
  EN = 'en',
}

export enum SupportedCurrency {
  XOF = 'XOF',
  XAF = 'XAF',
  EUR = 'EUR',
  USD = 'USD',
  MAD = 'MAD',
  NGN = 'NGN',
}
