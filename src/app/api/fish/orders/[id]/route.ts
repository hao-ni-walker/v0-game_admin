import { proxyFishAdmin } from '@/lib/fish-proxy';

// GET /api/fish/orders/{id} → Go /admin/orders/{id}
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyFishAdmin(request, `orders/${id}`);
}
