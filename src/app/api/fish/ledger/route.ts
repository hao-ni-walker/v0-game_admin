import { proxyFishAdmin } from '@/lib/fish-proxy';

// GET /api/fish/ledger → Go /admin/ledger
export async function GET(request: Request) {
  return proxyFishAdmin(request, 'ledger');
}
