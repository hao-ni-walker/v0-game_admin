import pg from 'pg';

// Serverless 环境优化：每次请求创建独立客户端，请求结束后关闭
// 使用 TELEGRAM_DATABASE_URL 避免被 Vercel Neon 集成覆盖
const DB_SCHEMA = process.env.DB_SCHEMA || 'bot_1';

export async function query(text: string, params?: any[]) {
  const connectionString = process.env.TELEGRAM_DATABASE_URL || process.env.DATABASE_URL || '';

  const client = new pg.Client({
    connectionString,
    connectionTimeoutMillis: 5000,
    query_timeout: 10000,
    statement_timeout: 10000,
  });

  const start = Date.now();
  try {
    await client.connect();
    await client.query(`SET search_path TO "${DB_SCHEMA}"`);
    const res = await client.query(text, params);
    const duration = Date.now() - start;
    console.log('executed query', { text: text.substring(0, 100), duration, rows: res.rowCount });
    return res;
  } finally {
    await client.end().catch(() => {});
  }
}
