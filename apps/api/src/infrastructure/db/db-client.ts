import type { DatabaseMode } from "../../config/env.js";

export interface DatabaseClient {
  ping(): Promise<boolean>;
}

class MockDatabaseClient implements DatabaseClient {
  async ping(): Promise<boolean> {
    return true;
  }
}

class PostgresPlaceholderClient implements DatabaseClient {
  async ping(): Promise<boolean> {
    // Placeholder volontaire: le wiring PostgreSQL réel est repoussé à une
    // prochaine itération pour garder la tranche verticale simple.
    return false;
  }
}

export const createDatabaseClient = (mode: DatabaseMode): DatabaseClient => {
  if (mode === "postgres") {
    return new PostgresPlaceholderClient();
  }

  return new MockDatabaseClient();
};
