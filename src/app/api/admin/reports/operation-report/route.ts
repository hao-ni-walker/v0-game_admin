import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { requestRemoteAdminApi } from '@/lib/admin-remote';
import {
  errorResponse,
  successResponse,
  unauthorizedResponse
} from '@/service/response';

const REPORT_PATH = '/api/v1/admin/reports/operation-report';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token?.value) {
      return unauthorizedResponse('未授权访问');
    }

    const remote = await requestRemoteAdminApi<{
      code?: number;
      message?: string;
      msg?: string;
      data?: unknown;
    }>({
      path: REPORT_PATH,
      method: 'GET',
      query: request.nextUrl.searchParams,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token.value}`
      }
    });

    if (!remote.ok) {
      if (remote.status === 401) {
        return unauthorizedResponse('认证失败，请重新登录');
      }
      return errorResponse(remote.data?.message || `远程API错误: ${remote.status}`);
    }

    const result = remote.data;
    if (!result || (result.code !== 0 && result.code !== 200)) {
      return errorResponse(result?.message || '获取盈亏报表失败');
    }

    return successResponse(result.data);
  } catch (error) {
    console.error('获取盈亏报表失败:', error);
    return errorResponse('获取盈亏报表失败');
  }
}
