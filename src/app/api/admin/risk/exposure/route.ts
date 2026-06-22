import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { requestRemoteAdminApi } from '@/lib/admin-remote';
import { errorResponse, successResponse, unauthorizedResponse } from '@/service/response';

const EXPOSURE_PATH = '/api/v1/admin/risk/exposure';

export async function GET(_req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token');
    if (!token?.value) return unauthorizedResponse('未授权访问');

    const remoteResponse = await requestRemoteAdminApi<{ code?: number; message?: string; data?: unknown }>({
      path: EXPOSURE_PATH,
      method: 'GET',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token.value}` },
    });
    if (!remoteResponse.ok) {
      if (remoteResponse.status === 401) return unauthorizedResponse('认证失败，请重新登录');
      return errorResponse(`远程API错误: ${remoteResponse.status}`);
    }
    const result = remoteResponse.data;
    if (!result || (result.code !== 0 && result.code !== 200)) {
      return errorResponse(result?.message || '获取风险敞口数据失败');
    }
    return successResponse(result.data);
  } catch (error) {
    console.error('获取风险敞口数据失败:', error);
    return errorResponse('获取风险敞口数据失败');
  }
}
