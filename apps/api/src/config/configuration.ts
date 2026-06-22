export default () => ({
  env: process.env.NODE_ENV ?? 'development',
  api: {
    port: Number(process.env.API_PORT ?? 4000),
    host: process.env.API_HOST ?? '0.0.0.0',
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    accessSecret: process.env.JWT_SECRET ?? 'change-me',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'change-me-refresh',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },
  security: {
    bcryptRounds: Number(process.env.BCRYPT_ROUNDS ?? 12),
  },
  cors: {
    origins: (process.env.CORS_ORIGINS ?? 'http://localhost:3000')
      .split(',')
      .map((o) => o.trim()),
  },
  log: {
    level: process.env.LOG_LEVEL ?? 'info',
  },
});
