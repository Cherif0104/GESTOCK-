import { Static, Type } from "@sinclair/typebox";
import { IsoDateStringSchema } from "./common.js";

export const RoleSchema = Type.String({ minLength: 1 });

export const MeResponseSchema = Type.Object({
  user: Type.Object({
    id: Type.String(),
    email: Type.String({ format: "email" }),
    roles: Type.Array(RoleSchema),
    tenantId: Type.String()
  }),
  auth: Type.Object({
    authenticationMode: Type.Union([Type.Literal("mock"), Type.Literal("jwt")]),
    tokenSource: Type.Union([Type.Literal("header"), Type.Literal("bearer-jwt"), Type.Literal("none")])
  })
});

export type MeResponse = Static<typeof MeResponseSchema>;

export const TenantSchema = Type.Object({
  id: Type.String(),
  code: Type.String(),
  name: Type.String(),
  plan: Type.Union([Type.Literal("starter"), Type.Literal("business"), Type.Literal("enterprise")]),
  region: Type.String()
});

export type Tenant = Static<typeof TenantSchema>;

export const TenantResponseSchema = Type.Object({
  tenant: TenantSchema
});

export type TenantResponse = Static<typeof TenantResponseSchema>;

export const TenantSnapshotResponseSchema = Type.Object({
  tenant: TenantSchema,
  snapshot: Type.Object({
    generatedAt: IsoDateStringSchema,
    inventory: Type.Object({
      skuCount: Type.Integer({ minimum: 0 }),
      lowStockCount: Type.Integer({ minimum: 0 }),
      outOfStockCount: Type.Integer({ minimum: 0 })
    }),
    procurement: Type.Object({
      openPurchaseOrders: Type.Integer({ minimum: 0 }),
      pendingReceipts: Type.Integer({ minimum: 0 })
    }),
    compliance: Type.Object({
      lastAuditEventAt: IsoDateStringSchema
    })
  })
});

export type TenantSnapshotResponse = Static<typeof TenantSnapshotResponseSchema>;
