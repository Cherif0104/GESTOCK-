import { loadEnv } from "./config/env.js";
import { buildApp } from "./app.js";

const run = async (): Promise<void> => {
  const env = loadEnv();
  const app = await buildApp({ env });

  try {
    await app.listen({ host: env.host, port: env.port });
    app.log.info(
      { host: env.host, port: env.port, prefix: env.apiPrefix },
      "GESTOCK backend API started"
    );
  } catch (error) {
    app.log.error({ error }, "Unable to boot API.");
    process.exit(1);
  }

  const shutdown = async (signal: NodeJS.Signals): Promise<void> => {
    app.log.info({ signal }, "Shutting down API...");
    await app.close();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
};

void run();
