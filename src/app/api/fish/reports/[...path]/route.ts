import { proxyFishAdmin } from '@/lib/fish-proxy';

// GET /api/fish/reports/<recharge-distribution|revenue|retention> → Go /admin/reports/<...>
export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyFishAdmin(request, `reports/${path.join('/')}`);
}
