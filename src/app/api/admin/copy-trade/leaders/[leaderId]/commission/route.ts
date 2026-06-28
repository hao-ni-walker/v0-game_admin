import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { requestRemoteAdminApi } from '@/lib/admin-remote';
import { errorResponse, successResponse, unauthorizedResponse } from '@/service/response';

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ leaderId: string }> },
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token');
    if (!token?.value) return unauthorizedResponse('未授权访问');

    const { leaderId } = await context.params;
    const body = await req.text();
    const remoteResponse = await requestRemoteAdminApi<{ code?: number; message?: string; data?: unknown }>({
      path: `/api/v1/admin/copy-trade/leaders/${leaderId}/commission`,
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token.value}` },
      body,
    });
    if (!remoteResponse.ok) {
      if (remoteResponse.status === 401) return unauthorizedResponse('认证失败，请重新登录');
      if (remoteResponse.status === 400) return errorResponse(remoteResponse.data?.message || '操作失败');
      return errorResponse(`远程API错误: ${remoteResponse.status}`);
    }
    const result = remoteResponse.data;
    if (!result || (result.code !== 0 && result.code !== 200)) {
      return errorResponse(result?.message || '调整佣金失败');
    }
    return successResponse(result.data);
  } catch (error) {
    console.error('调整佣金失败:', error);
    return errorResponse('调整佣金失败');
  }
}
