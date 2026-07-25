// drizzle-kit 配置:仅用于 schema 自省/差异比对,不用于线上迁移。
// 线上 DDL 由 golang-migrate 统一管理(server/migrations/000011_admin_schema)。
import { defineConfig } from 'drizzle-kit';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  schema: path.resolve(dirname, './src/db/schema.ts'),
  out: path.resolve(dirname, './drizzle'),
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.ADMIN_DATABASE_URL ?? ''
  }
});
