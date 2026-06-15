export const envConfig = () => ({
  port: parseInt(process.env.PORT ?? '4000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  databaseUrl: process.env.DATABASE_URL ?? '',
  defaultTenantSlug: process.env.DEFAULT_TENANT_SLUG ?? 'demo-bhatta',
  jwtSecret: process.env.JWT_SECRET ?? 'dev-jwt-secret-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  platformAdminEmail: process.env.PLATFORM_ADMIN_EMAIL ?? 'admin@tameer360.pk',
  platformAdminPassword: process.env.PLATFORM_ADMIN_PASSWORD ?? 'Tameer360!',
});

export type EnvConfig = ReturnType<typeof envConfig>;
