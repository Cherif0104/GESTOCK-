import cors from "@fastify/cors";
import sensible from "@fastify/sensible";
import type { FastifyInstance } from "fastify";
import type { ApiEnv } from "../../config/env.js";
import type { TokenVerifier } from "../../shared/auth/token-verifier.js";
import { requestContextPlugin } from "./request-context.js";

type RegisterPluginsOptions = {
  env: ApiEnv;
  tokenVerifier: TokenVerifier;
};

export const registerPlugins = async (
  app: FastifyInstance,
  options: RegisterPluginsOptions
): Promise<void> => {
  await app.register(cors, {
    origin: true,
    credentials: true
  });
  await app.register(sensible);
  await app.register(requestContextPlugin, options);
};
