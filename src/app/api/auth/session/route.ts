import { auth } from '@/lib/auth';
import { successResponse } from '@/service/response';

export async function GET() {
  const session = await auth();
  console.log('[v0] Session API - session:', session);
  return successResponse(session);
}
