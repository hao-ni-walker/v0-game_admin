import { proxyFishAdmin } from '@/lib/fish-proxy';

// 玩家详情:GET /api/fish/players/{id} → Go /admin/players/{id}
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyFishAdmin(request, `players/${id}`);
}
