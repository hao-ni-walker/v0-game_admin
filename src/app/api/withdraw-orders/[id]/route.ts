import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { requestRemoteAdminApi } from '@/lib/admin-remote';
import {
  normalizeWithdrawOrder,
  normalizeWithdrawWallet,
  type BackendWithdrawDetail,
} from '@/lib/withdraw-order-adapter';
import {
  errorResponse,
  successResponse,
  unauthorizedResponse,
} from '@/service/response';

// GET /api/withdraw-orders/[id] — review-console detail drawer.
// Proxies backend GET /api/v1/admin/withdraw/{id} (pending list + review are
// the only withdraw admin endpoints; this detail view backs the drawer that
// previously fetched a non-existent route and always showed 订单不存在).
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get('token');
  if (!token?.value) return unauthorizedResponse('未授权访问');

  try {
    const remote = await requestRemoteAdminApi<{
      code?: number;
      message?: string;
      data?: BackendWithdrawDetail | null;
    }>({
      path: `/api/v1/admin/withdraw/${id}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token.value}`,
      },
    });

    if (!remote.ok) {
      if (remote.status === 401) return unauthorizedResponse('认证失败，请重新登录');
      return errorResponse(`远程API错误: ${remote.status}`);
    }

    const result = remote.data;
    if (!result || (result.code !== 0 && result.code !== 200)) {
      return errorResponse(result?.message || '获取订单详情失败');
    }
    if (!result.data) {
      return errorResponse(result.message || '提现记录不存在');
    }

    return successResponse({
      order: normalizeWithdrawOrder(result.data),
      userWallet: normalizeWithdrawWallet(result.data),
    });
  } catch (error) {
    console.error('[withdraw-orders/detail] 获取订单详情失败:', error);
    return errorResponse('获取订单详情失败');
  }
}
