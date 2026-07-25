import { proxyFishAdmin } from '@/lib/fish-proxy';

// GET /api/fish/economy/<rtp|robot-netflow> → Go /admin/economy/<...>  (只读)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyFishAdmin(request, `economy/${path.join('/')}`);
}
