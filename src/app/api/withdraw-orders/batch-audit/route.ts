import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { requestRemoteAdminApi } from '@/lib/admin-remote';
import {
  errorResponse,
  successResponse,
  unauthorizedResponse,
} from '@/service/response';

// POST /api/withdraw-orders/batch-audit — body { orderIds: number[], action, remark }.
// The backend has no batch endpoint, so fan out sequential
// POST /api/v1/admin/withdraw/{id}/review calls and tally the outcomes.
export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');
  if (!token?.value) return unauthorizedResponse('未授权访问');

  let body: { orderIds?: unknown; action?: string; remark?: string };
  try {
    body = await req.json();
  } catch {
    return errorResponse('请求参数错误');
  }

  const orderIds = Array.isArray(body.orderIds)
    ? body.orderIds.map(Number).filter((n) => Number.isInteger(n) && n > 0)
    : [];
  if (orderIds.length === 0) return errorResponse('未选择要审核的订单');

  if (body.action !== 'approve' && body.action !== 'reject') {
    return errorResponse('无效的审核操作');
  }

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token.value}`,
  };
  const reviewBody = JSON.stringify({
    action: body.action,
    comment: (body.remark || '').slice(0, 200) || null,
  });

  let successCount = 0;
  let failedCount = 0;

  try {
    for (const id of orderIds) {
      const remote = await requestRemoteAdminApi<{
        code?: number;
        data?: unknown;
      }>({
        path: `/api/v1/admin/withdraw/${id}/review`,
        method: 'POST',
        headers,
        body: reviewBody,
      });
      // code:0 + non-null data = reviewed; code:0 + data:null means
      // 不存在/已处理 — count it as a failure for that row.
      if (remote.ok && remote.data?.code === 0 && remote.data.data) {
        successCount++;
      } else {
        failedCount++;
      }
    }

    return successResponse({ successCount, failedCount });
  } catch (error) {
    console.error('[withdraw-orders/batch-audit] 批量审核失败:', error);
    return errorResponse('批量审核失败');
  }
}
