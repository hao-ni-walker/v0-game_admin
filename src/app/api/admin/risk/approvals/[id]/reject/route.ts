import { NextRequest } from 'next/server';
import { forwardRisk } from '@/lib/risk-proxy';

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return forwardRisk(req, 'POST', `/api/v1/admin/risk/approvals/${id}/reject`, { body: await req.text() });
}
