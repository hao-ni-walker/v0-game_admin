import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { requestRemoteAdminApi } from '@/lib/admin-remote';
import { errorResponse, successResponse, unauthorizedResponse } from '@/service/response';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('token');
    if (!token?.value) return unauthorizedResponse('未授权访问');

    const body = await req.text();
    const remoteResponse = await requestRemoteAdminApi<{ code?: number; message?: string; data?: unknown }>({
      path: `/api/v1/admin/users/${id}/freeze`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token.value}` },
      body,
    });
    if (!remoteResponse.ok) {
      if (remoteResponse.status === 401) return unauthorizedResponse('认证失败，请重新登录');
      return errorResponse(remoteResponse.data?.message || `远程API错误: ${remoteResponse.status}`);
    }
    const result = remoteResponse.data;
    if (!result || (result.code !== 0 && result.code !== 200)) {
      return errorResponse(result?.message || '冻结失败');
    }
    return successResponse(result.data);
  } catch (error) {
    console.error('冻结用户失败:', error);
    return errorResponse('冻结用户失败');
  }
}
