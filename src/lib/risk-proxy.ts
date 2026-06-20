import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { requestRemoteAdminApi } from '@/lib/admin-remote';
import { errorResponse, successResponse, unauthorizedResponse } from '@/service/response';

interface RemotePayload {
  code?: number;
  message?: string;
  data?: unknown;
}

/**
 * Shared proxy for /api/v1/admin/risk/* action endpoints. Forwards the admin
 * token cookie; GET forwards the querystring, POST forwards the JSON body.
 */
export async function forwardRisk(
  req: NextRequest,
  method: 'GET' | 'POST',
  path: string,
  opts: { body?: string } = {},
) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');
  if (!token?.value) return unauthorizedResponse('未授权访问');

  const qs = method === 'GET' ? req.nextUrl.searchParams.toString() : '';
  const remote = await requestRemoteAdminApi<RemotePayload>({
    path: qs ? `${path}?${qs}` : path,
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token.value}` },
    body: opts.body,
  });
  if (!remote.ok) {
    if (remote.status === 401) return unauthorizedResponse('认证失败，请重新登录');
    if (remote.status === 400) return errorResponse(remote.data?.message || '操作失败');
    return errorResponse(`远程API错误: ${remote.status}`);
  }
  const result = remote.data;
  if (!result || (result.code !== 0 && result.code !== 200)) {
    return errorResponse(result?.message || '操作失败');
  }
  return successResponse(result.data);
}

/** Forward a POST with a JSON body built from `payload`. */
export function forwardRiskPost(req: NextRequest, path: string, payload: unknown) {
  return forwardRisk(req, 'POST', path, { body: JSON.stringify(payload) });
}
