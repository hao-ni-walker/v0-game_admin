import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const result = await query('SELECT NOW() as current_time, current_database() as db_name, current_user as user_name');
    return NextResponse.json({
      success: true,
      data: result.rows[0],
      env: {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        databaseUrlPattern: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 30) + '...' : 'not set'
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      env: {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        databaseUrlPattern: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 30) + '...' : 'not set'
      }
    }, { status: 500 });
  }
}
