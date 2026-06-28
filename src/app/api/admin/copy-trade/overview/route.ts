import { cookies } from 'next/headers';
import { requestRemoteAdminApi } from '@/lib/admin-remote';
import { errorResponse, successResponse, unauthorizedResponse } from '@/service/response';

const REMOTE_PATH = '/api/v1/admin/copy-trade/overview';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token');
    if (!token?.value) return unauthorizedResponse('未授权访问');

    const remoteResponse = await requestRemoteAdminApi<{ code?: number; message?: string; data?: unknown }>({
      path: REMOTE_PATH,
      method: 'GET',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token.value}` },
    });
    if (!remoteResponse.ok) {
      if (remoteResponse.status === 401) return unauthorizedResponse('认证失败，请重新登录');
      return errorResponse(`远程API错误: ${remoteResponse.status}`);
    }
    const result = remoteResponse.data;
    if (!result || (result.code !== 0 && result.code !== 200)) {
      return errorResponse(result?.message || '获取数据总览失败');
    }
    return successResponse(result.data);
  } catch (error) {
    console.error('获取数据总览失败:', error);
    return errorResponse('获取数据总览失败');
  }
}
