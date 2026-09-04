import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { requestRemoteAdminApi } from '@/lib/admin-remote';
import {
  normalizeWithdrawOrder,
  type BackendWithdrawDetail,
} from '@/lib/withdraw-order-adapter';
import {
  errorResponse,
  successResponse,
  unauthorizedResponse,
} from '@/service/response';

// POST /api/withdraw-orders/[id]/audit — body { action: 'approve'|'reject', remark }.
// Maps onto backend POST /api/v1/admin/withdraw/{id}/review { action, comment }
// and returns the refreshed order so the drawer updates in place.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get('token');
  if (!token?.value) return unauthorizedResponse('未授权访问');

  let body: { action?: string; remark?: string };
  try {
    body = await req.json();
  } catch {
    return errorResponse('请求参数错误');
  }

  const action = body.action;
  if (action !== 'approve' && action !== 'reject') {
    return errorResponse('无效的审核操作');
  }

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token.value}`,
  };

  try {
    const remote = await requestRemoteAdminApi<{
      code?: number;
      message?: string;
      data?: { withdraw_id?: string | number } | null;
    }>({
      path: `/api/v1/admin/withdraw/${id}/review`,
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        action,
        comment: (body.remark || '').slice(0, 200) || null,
      }),
    });

    if (!remote.ok) {
      if (remote.status === 401) return unauthorizedResponse('认证失败，请重新登录');
      return errorResponse(`远程API错误: ${remote.status}`);
    }

    const result = remote.data;
    const remoteOk =
      result && (result.code === 0 || result.code === 200) && result.data;
    // Backend answers code:0 + data:null + message for 记录不存在/已处理 —
    // forward that message instead of pretending success.
    if (!remoteOk) {
      return errorResponse(result?.message || '审核失败');
    }

    // Re-fetch so the drawer renders post-review state (status, auditor, tx).
    const detail = await requestRemoteAdminApi<{
      code?: number;
      data?: BackendWithdrawDetail | null;
    }>({
      path: `/api/v1/admin/withdraw/${id}`,
      method: 'GET',
      headers: authHeaders,
    });

    const detailData =
      detail.ok && detail.data?.data ? detail.data.data : null;
    if (detailData) {
      return successResponse(normalizeWithdrawOrder(detailData));
    }

    // Review itself succeeded but the detail re-fetch failed — synthesize the
    // post-review state so the drawer renders a complete order (a partial
    // object would render $NaN amount / blank fields).
    const approved = action === 'approve';
    return successResponse({
      id: Number(id),
      orderNo: `WD${id}`,
      userId: 0,
      paymentChannelId: 0,
      amount: 0,
      fee: 0,
      actualAmount: null,
      status: approved ? 'success' : 'rejected',
      currency: 'USDT',
      auditStatus: approved ? 'approved' : 'rejected',
      payoutStatus: approved ? 'success' : 'failed',
      payoutMethod: 'manual',
      payoutAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[withdraw-orders/audit] 审核失败:', error);
    return errorResponse('审核失败');
  }
}
