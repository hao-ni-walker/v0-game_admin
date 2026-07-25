// admin schema 的 PG 连接(仅 n-admin 身份数据)。
// 业务数据走 Go /admin/* API,不在 n-admin 落库。
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema';

export type AdminDb = ReturnType<typeof drizzle<typeof schema>>;

let pool: pg.Pool | null = null;
let dbInstance: AdminDb | null = null;

/**
 * 返回 admin schema 的 drizzle 实例(单例)。需要 ADMIN_DATABASE_URL。
 */
export function getAdminDb(): AdminDb {
  if (dbInstance) return dbInstance;
  const url = process.env.ADMIN_DATABASE_URL;
  if (!url) {
    throw new Error('ADMIN_DATABASE_URL must be configured for PG persistence');
  }
  pool = new pg.Pool({ connectionString: url });
  dbInstance = drizzle(pool, { schema });
  return dbInstance;
}

/** 测试/脚本用:拿底层 pool 执行原生 SQL(建表、清理等)。 */
export function getAdminPool(): pg.Pool {
  getAdminDb();
  return pool!;
}

export { schema };
