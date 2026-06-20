import { NextRequest } from 'next/server';
import { forwardRisk } from '@/lib/risk-proxy';

export async function GET(req: NextRequest) {
  return forwardRisk(req, 'GET', '/api/v1/admin/risk/events');
}
