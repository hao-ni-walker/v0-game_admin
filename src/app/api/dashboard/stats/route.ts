import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const backendUrl = process.env.ADMIN_API_URL || 'http://localhost:8084';
    const res = await fetch(`${backendUrl}/admin/dashboard`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`backend ${res.status}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    // Fallback mock if backend unavailable
    return NextResponse.json({
      code: 'OK',
      data: { dau: 0, games_today: 0, revenue_today: '0' },
    });
  }
}
