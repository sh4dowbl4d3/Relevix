import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.coerce.number().default(5433),
  DB_NAME: z.string().default('relevix'),
  DB_USER: z.string().default('relevix'),
  DB_PASSWORD: z.string().default('changeme_in_production'),
  GEMINI_API_KEY: z.string().optional(),
  VISION_MODEL: z.string().default('gemini-1.5-flash'),
  EMBEDDING_MODEL: z.string().default('text-embedding-004'),
  OLLAMA_BASE_URL: z.string().default('http://localhost:11434'),
  OLLAMA_VISION_MODEL: z.string().default('llava'),
  OLLAMA_EMBEDDING_MODEL: z.string().default('all-minilm'),
  USE_LOCAL_AI: z.coerce.boolean().default(false),
  SIMILARITY_THRESHOLD: z.coerce.number().min(0).max(1).default(0.65),
  CONFIDENCE_THRESHOLD: z.coerce.number().min(0).max(1).default(0.5),
  LOW_CONFIDENCE_THRESHOLD: z.coerce.number().min(0).max(1).default(0.4),
  DAILY_BUDGET_LIMIT_USD: z.coerce.number().default(5.00),
  MAX_VISION_CALLS_PER_DAY: z.coerce.number().default(100),
  MAX_EMBEDDING_CALLS_PER_DAY: z.coerce.number().default(500),
  BATCH_SIZE: z.coerce.number().default(10),
  BATCH_DELAY_MS: z.coerce.number().default(1000),
  MAX_RETRIES: z.coerce.number().default(3),
});

export type Env = z.infer<typeof envSchema>;

let config: Env;

export function getConfig(): Env {
  if (!config) {
    const result = envSchema.safeParse(process.env);
    if (!result.success) {
      console.error('Invalid environment variables:', result.error.flatten());
      process.exit(1);
    }
    config = result.data;
  }
  return config;
}

export default getConfig;
