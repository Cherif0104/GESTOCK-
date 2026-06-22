import type { AuthenticationMode } from "../../config/env.js";

export type TokenSource = "none" | "header" | "bearer-jwt";

export type AuthenticatedUser = {
  id: string;
  email: string;
  roles: string[];
  tenantId: string;
};

export type TenantContext = {
  id: string;
  code: string;
  name: string;
};

export type RequestContext = {
  authenticationMode: AuthenticationMode;
  tokenSource: TokenSource;
  tenant: TenantContext;
  user: AuthenticatedUser | null;
};

declare module "fastify" {
  interface FastifyRequest {
    context: RequestContext;
  }
}
