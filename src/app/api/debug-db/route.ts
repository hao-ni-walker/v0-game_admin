import pg from 'pg';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const results: Record<string, unknown> = {};

  try {
    const rawUrl = process.env.DATABASE_URL || 'NOT SET';
    results.rawUrl = rawUrl.replace(/:[^:@]+@/, ':****@');
    results.dbSchema = process.env.DB_SCHEMA || 'NOT SET';

    const cleanUrl = rawUrl.replace(/[?&]options=[^&]*/, '').replace(/\?$/, '');
    results.cleanUrl = cleanUrl.replace(/:[^:@]+@/, ':****@');

    const client = new pg.Client({
      connectionString: cleanUrl,
      connectionTimeoutMillis: 5000,
    });

    await client.connect();
    results.connected = true;

    const sp = await client.query('SHOW search_path');
    results.defaultSearchPath = sp.rows;

    await client.query('SET search_path TO "bot_1"');

    const sp2 = await client.query('SHOW search_path');
    results.afterSetSearchPath = sp2.rows;

    const tables = await client.query("SELECT tablename FROM pg_tables WHERE schemaname = 'bot_1'");
    results.tables = tables.rows;

    const users = await client.query('SELECT count(*) as cnt FROM users');
    results.usersCount = users.rows[0].cnt;

    await client.end();
  } catch (error: unknown) {
    const e = error as Error & { code?: string; detail?: string };
    results.error = e.message;
    results.errorCode = e.code;
    results.errorDetail = e.detail;
  }

  return NextResponse.json(results);
}
