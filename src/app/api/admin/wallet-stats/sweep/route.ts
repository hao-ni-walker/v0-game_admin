import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { requestRemoteAdminApi } from '@/lib/admin-remote';
import { errorResponse, successResponse, unauthorizedResponse } from '@/service/response';

const SWEEP_PATH = '/api/v1/admin/wallet-stats/sweep';

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');
  if (!token?.value) return unauthorizedResponse('未授权访问');

  let body: string | null = null;
  try {
    body = JSON.stringify(await req.json());
  } catch {
    body = null;
  }

  try {
    const remoteResponse = await requestRemoteAdminApi<{
      code?: number;
      message?: string;
      data?: unknown;
    }>({
      path: SWEEP_PATH,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token.value}`,
      },
      body: body ?? undefined,
    });
    if (!remoteResponse.ok) {
      if (remoteResponse.status === 401) return unauthorizedResponse('认证失败，请重新登录');
      return errorResponse(`远程API错误: ${remoteResponse.status}`);
    }
    const result = remoteResponse.data;
    if (!result || (result.code !== 0 && result.code !== 200)) {
      return errorResponse(result?.message || '启动归集失败');
    }
    return successResponse(result.data);
  } catch (error) {
    console.error('启动归集失败:', error);
    return errorResponse('启动归集失败');
  }
}
