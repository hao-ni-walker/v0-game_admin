import { proxyFishAdmin } from '@/lib/fish-proxy';

// GET /api/fish/anticheat/<related/..|hit-audit|anomalies> → Go /admin/anticheat/<...>  (只读)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyFishAdmin(request, `anticheat/${path.join('/')}`);
}
