import fp from "fastify-plugin";
import type { FastifyPluginAsync } from "fastify";
import type { ApiEnv } from "../../config/env.js";
import type { AuthenticatedUser, TokenSource } from "../../shared/context/request-context.js";
import type { TokenVerifier } from "../../shared/auth/token-verifier.js";

type RequestContextPluginOptions = {
  env: ApiEnv;
  tokenVerifier: TokenVerifier;
};

const splitRoles = (raw: string | string[] | undefined): string[] => {
  const value = Array.isArray(raw) ? raw.join(",") : raw;
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((role) => role.trim())
    .filter((role) => role.length > 0);
};

const bearerTokenFromAuthorization = (authorizationHeader: string | undefined): string | null => {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(" ");
  if (!scheme || !token || scheme.toLowerCase() !== "bearer") {
    return null;
  }

  return token;
};

const requestContextPluginRaw: FastifyPluginAsync<RequestContextPluginOptions> = async (
  app,
  options
) => {
  const { env, tokenVerifier } = options;

  app.addHook("onRequest", async (request) => {
    const bearerToken = bearerTokenFromAuthorization(
      typeof request.headers.authorization === "string" ? request.headers.authorization : undefined
    );

    const headerTenantId = request.headers["x-tenant-id"];
    const headerUserId = request.headers["x-user-id"];
    const headerUserEmail = request.headers["x-user-email"];
    const headerUserRoles = request.headers["x-user-roles"];

    let tokenSource: TokenSource = "none";
    let user: AuthenticatedUser | null = null;
    let tokenTenantId: string | null = null;

    if (bearerToken) {
      tokenSource = "bearer-jwt";
      try {
        const claims = await tokenVerifier.verify(bearerToken);
        tokenTenantId = claims.tid ?? null;

        if (claims.sub && claims.email && claims.tid) {
          user = {
            id: claims.sub,
            email: claims.email,
            roles: claims.roles ?? ["viewer"],
            tenantId: claims.tid
          };
        }
      } catch (error) {
        request.log.warn({ error }, "Unable to decode bearer token in current mode.");
      }
    }

    if (!user && (headerUserId || headerUserEmail || headerUserRoles)) {
      tokenSource = "header";
      const rolesFromHeaders = splitRoles(headerUserRoles);
      user = {
        id: typeof headerUserId === "string" ? headerUserId : "dev-user",
        email: typeof headerUserEmail === "string" ? headerUserEmail : "dev.user@gestock.local",
        roles: rolesFromHeaders.length > 0 ? rolesFromHeaders : ["admin"],
        tenantId:
          typeof headerTenantId === "string" && headerTenantId.length > 0
            ? headerTenantId
            : env.defaultTenantId
      };
    }

    const effectiveTenantId =
      tokenTenantId ??
      (typeof headerTenantId === "string" && headerTenantId.length > 0
        ? headerTenantId
        : env.defaultTenantId);

    if (tokenTenantId && typeof headerTenantId === "string" && headerTenantId !== tokenTenantId) {
      request.log.warn(
        {
          tokenTenantId,
          headerTenantId
        },
        "Header tenant ID ignored because it differs from JWT tid claim."
      );
    }

    if (user && user.tenantId !== effectiveTenantId) {
      // ABAC guardrail: on force le tenant de session sur le contexte effectif.
      user = { ...user, tenantId: effectiveTenantId };
    }

    request.context = {
      authenticationMode: env.authenticationMode,
      tokenSource,
      tenant: {
        id: effectiveTenantId,
        code: env.defaultTenantCode,
        name: env.defaultTenantName
      },
      user
    };
  });
};

export const requestContextPlugin = fp(requestContextPluginRaw, {
  name: "request-context-plugin"
});
