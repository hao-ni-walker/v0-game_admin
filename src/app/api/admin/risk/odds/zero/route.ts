import { NextRequest } from 'next/server';
import { forwardRisk } from '@/lib/risk-proxy';

export async function POST(req: NextRequest) {
  return forwardRisk(req, 'POST', '/api/v1/admin/risk/odds/zero', { body: await req.text() });
}
