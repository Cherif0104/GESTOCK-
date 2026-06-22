import type { Tenant, TenantSnapshotResponse } from "@gestock/contracts/http";
import type { ApiEnv } from "../../config/env.js";

export interface TenantRepository {
  getTenantById(tenantId: string): Promise<Tenant | null>;
  getSnapshotByTenantId(tenantId: string): Promise<TenantSnapshotResponse["snapshot"]>;
}

export class InMemoryTenantRepository implements TenantRepository {
  private readonly tenants: Map<string, Tenant>;

  constructor(private readonly env: ApiEnv) {
    this.tenants = new Map([
      [
        env.defaultTenantId,
        {
          id: env.defaultTenantId,
          code: env.defaultTenantCode,
          name: env.defaultTenantName,
          plan: "business",
          region: "af-south-1"
        }
      ]
    ]);
  }

  async getTenantById(tenantId: string): Promise<Tenant | null> {
    const tenant = this.tenants.get(tenantId) ?? null;
    return tenant;
  }

  async getSnapshotByTenantId(_tenantId: string): Promise<TenantSnapshotResponse["snapshot"]> {
    return {
      generatedAt: new Date().toISOString(),
      inventory: {
        skuCount: 1240,
        lowStockCount: 18,
        outOfStockCount: 4
      },
      procurement: {
        openPurchaseOrders: 12,
        pendingReceipts: 5
      },
      compliance: {
        lastAuditEventAt: new Date(Date.now() - 1000 * 60 * 7).toISOString()
      }
    };
  }
}
