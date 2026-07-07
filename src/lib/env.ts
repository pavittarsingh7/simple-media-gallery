import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  MEDIA_ROOT: z.string().default("./media"),
  PHOTO_FOLDER: z.string().default("photos"),
  VIDEO_FOLDER: z.string().default("videos"),
  THUMBNAIL_FOLDER: z.string().default("./.thumbnails"),
  SCAN_ON_STARTUP: z
    .string()
    .default("true")
    .transform((v) => v === "true"),
  SCAN_SCHEDULE_ENABLED: z
    .string()
    .default("false")
    .transform((v) => v === "true"),
  SCAN_SCHEDULE_CRON: z.string().default("0 */6 * * *"),
  ADMIN_SECRET: z.string().min(8).default("change-me-in-production"),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),
  NEXT_PUBLIC_APP_NAME: z.string().default("Media Gallery"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
});

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

export function getEnv(): Env {
  if (cachedEnv) return cachedEnv;
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error("Invalid environment variables:", result.error.flatten().fieldErrors);
    throw new Error("Invalid environment configuration");
  }
  cachedEnv = result.data;
  return cachedEnv;
}

export function validateEnvAtStartup(): void {
  getEnv();
}
