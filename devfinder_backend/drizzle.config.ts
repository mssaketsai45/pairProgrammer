import type { Config } from 'drizzle-kit';

export default {
  schema: './src/config/schema.js',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:your_new_password@localhost:5432/devfinder',
  },
} satisfies Config;
