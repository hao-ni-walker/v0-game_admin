import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: 'mysql', // 'mysql' | 'sqlite' | 'turso'
  schema: './src/db/schema.ts',
  dbCredentials: {
    host: process.env.DATABASE_HOST!,
    user: process.env.DATABASE_USERNAME!,
    password: process.env.DATABASE_PASSWORD!,
    database: process.env.DATABASE_NAME!,
  },
})
