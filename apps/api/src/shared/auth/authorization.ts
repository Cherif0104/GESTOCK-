import type { AuthenticatedUser } from "../context/request-context.js";

export type Permission =
  | "me.read"
  | "tenant.read"
  | "tenant.snapshot.read";

type RoleMatrix = Record<string, Permission[]>;

const ROLE_MATRIX: RoleMatrix = {
  owner: ["me.read", "tenant.read", "tenant.snapshot.read"],
  admin: ["me.read", "tenant.read", "tenant.snapshot.read"],
  manager: ["me.read", "tenant.read", "tenant.snapshot.read"],
  viewer: ["me.read", "tenant.read"],
  auditor: ["me.read", "tenant.read", "tenant.snapshot.read"]
};

export const isAllowed = (
  user: AuthenticatedUser,
  permission: Permission,
  resourceTenantId: string
): boolean => {
  // ABAC guardrail: impossible d'accéder à une ressource d'un autre tenant.
  if (user.tenantId !== resourceTenantId) {
    return false;
  }

  return user.roles.some((role) => ROLE_MATRIX[role]?.includes(permission) ?? false);
};
