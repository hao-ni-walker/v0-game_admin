import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { requestRemoteAdminApi } from '@/lib/admin-remote';
import { errorResponse, successResponse, unauthorizedResponse } from '@/service/response';

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token');
    if (!token?.value) return unauthorizedResponse('未授权访问');

    const qs = req.nextUrl.searchParams.toString();
    const remoteResponse = await requestRemoteAdminApi<{ code?: number; message?: string; data?: unknown }>({
      path: `/api/v1/admin/odds/config${qs ? `?${qs}` : ''}`,
      method: 'GET',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token.value}` },
    });
    if (!remoteResponse.ok) {
      if (remoteResponse.status === 401) return unauthorizedResponse('认证失败，请重新登录');
      return errorResponse(`远程API错误: ${remoteResponse.status}`);
    }
    const result = remoteResponse.data;
    if (!result || (result.code !== 0 && result.code !== 200)) {
      return errorResponse(result?.message || '获取生效收益率失败');
    }
    return successResponse(result.data);
  } catch (error) {
    console.error('获取生效收益率失败:', error);
    return errorResponse('获取生效收益率失败');
  }
}
