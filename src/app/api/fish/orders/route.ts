import { proxyFishAdmin } from '@/lib/fish-proxy';

// GET /api/fish/orders → Go /admin/orders
export async function GET(request: Request) {
  return proxyFishAdmin(request, 'orders');
}
