import { proxyFishAdmin } from '@/lib/fish-proxy';

// 玩家列表:GET /api/fish/players?q=&page=&size= → Go /admin/players
export async function GET(request: Request) {
  return proxyFishAdmin(request, 'players');
}
