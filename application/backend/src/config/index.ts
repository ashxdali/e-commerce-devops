import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load environment variables from .env file if available
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  DATABASE_URL: z.string().optional().default(''),
  JWT_SECRET: z.string().default('default-dev-secret-key-change-in-prod'),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
});

const parseResult = envSchema.safeParse(process.env);

if (!parseResult.success) {
  console.error('❌ Invalid Environment Configuration:', parseResult.error.flatten().fieldErrors);
  throw new Error('Invalid environment variables provided.');
}

export const config = parseResult.data;
