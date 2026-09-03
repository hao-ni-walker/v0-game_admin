import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { requestRemoteAdminApi } from '@/lib/admin-remote';
import {
  successResponse,
  unauthorizedResponse,
} from '@/service/response';

const CHAIN_CHECK_PATH = '/api/v1/admin/deposit/chain-check';

/**
 * 客诉排查:单用户 TON 链上到账 ⇄ 已入账对比(单用户版对账)。
 * 直接透传后端数据结构:address / chain[] / uncredited_count。
 */
export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  if (!token?.value) {
    return unauthorizedResponse('未授权访问');
  }

  const userId = request.nextUrl.searchParams.get('user_id');
  if (!userId || !/^\d+$/.test(userId)) {
    return Response.json({ code: 1, message: '缺少有效的 user_id' }, { status: 400 });
  }

  const remote = await requestRemoteAdminApi<{
    code?: number;
    message?: string;
    msg?: string;
    data?: unknown;
  }>({
    path: `${CHAIN_CHECK_PATH}?user_id=${userId}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token.value}`,
    },
  });

  if (remote.ok && remote.data && (remote.data.code === 0 || remote.data.code === 200)) {
    return successResponse(remote.data.data);
  }

  return Response.json(
    {
      code: 1,
      message:
        remote.data?.message || remote.data?.msg || `上游查询失败(${remote.status})`,
    },
    { status: 502 },
  );
}
