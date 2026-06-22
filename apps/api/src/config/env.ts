export type AuthenticationMode = "mock" | "jwt";
export type DatabaseMode = "mock" | "postgres";

export type ApiEnv = {
  nodeEnv: string;
  host: string;
  port: number;
  apiPrefix: `/${string}`;
  serviceName: string;
  authenticationMode: AuthenticationMode;
  databaseMode: DatabaseMode;
  defaultTenantId: string;
  defaultTenantCode: string;
  defaultTenantName: string;
};

const toNumber = (value: string | undefined, fallback: number): number => {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

export const loadEnv = (): ApiEnv => {
  const apiPrefixRaw = process.env.API_PREFIX ?? "/v1";
  const apiPrefix = apiPrefixRaw.startsWith("/")
    ? (apiPrefixRaw as `/${string}`)
    : (`/${apiPrefixRaw}` as `/${string}`);

  return {
    nodeEnv: process.env.NODE_ENV ?? "development",
    host: process.env.API_HOST ?? "0.0.0.0",
    port: toNumber(process.env.API_PORT, 4000),
    apiPrefix,
    serviceName: process.env.API_SERVICE_NAME ?? "gestock-api",
    authenticationMode: (process.env.AUTH_MODE as AuthenticationMode | undefined) ?? "mock",
    databaseMode: (process.env.DB_MODE as DatabaseMode | undefined) ?? "mock",
    defaultTenantId: process.env.DEFAULT_TENANT_ID ?? "tenant-dev",
    defaultTenantCode: process.env.DEFAULT_TENANT_CODE ?? "GESTOCK-DEV",
    defaultTenantName: process.env.DEFAULT_TENANT_NAME ?? "Gestock Démo"
  };
};
