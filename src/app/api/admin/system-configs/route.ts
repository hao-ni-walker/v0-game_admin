import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { requestRemoteAdminApi } from '@/lib/admin-remote';
import { successResponse, unauthorizedResponse } from '@/service/response';

/**
 * 系统参数配置列表 — 透传后端 /admin/system-configs（真实 system_configs 表）。
 * 支持参数：page/page_size/keyword/config_types/config_keys/is_public/disabled/
 * sort_by/sort_dir，与后端端点一一对应。
 */
export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');
  if (!token?.value) {
    return unauthorizedResponse('未授权访问');
  }

  const query = request.nextUrl.searchParams;
  const remote = await requestRemoteAdminApi<{
    code?: number;
    message?: string;
    data?: unknown;
  }>({
    path: '/api/v1/admin/system-configs',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token.value}`,
    },
    query,
  });

  if (remote.status === 401) {
    return unauthorizedResponse('认证失败，请重新登录');
  }

  const result = remote.data;
  if (!remote.ok || !result || (result.code !== 0 && result.code !== 200)) {
    return successResponse({
      items: [],
      total: 0,
      page: 1,
      page_size: 20,
      total_pages: 1,
    });
  }

  return successResponse(result.data);
}
