import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { remoteApiErrorMessage, requestRemoteAdminApi } from '@/lib/admin-remote';
import { errorResponse, successResponse, unauthorizedResponse } from '@/service/response';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) return errorResponse('充值订单编号无效');
  const token = (await cookies()).get('token');
  if (!token?.value) return unauthorizedResponse('未授权访问');
  let body: { reason?: unknown };
  try { body = await req.json(); } catch { return errorResponse('请求参数错误'); }
  const reason = typeof body.reason === 'string' ? body.reason.trim() : '';
  if (!reason || reason.length > 500) return errorResponse('请填写不超过 500 字的判定依据');
  try {
    const remote = await requestRemoteAdminApi<{ code?: number; message?: string; data?: unknown }>({
      path: `/api/v1/admin/deposit/records/${id}/invalidate-reward`, method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token.value}` },
      body: JSON.stringify({ reason }),
    });
    if (!remote.ok) return errorResponse(remoteApiErrorMessage(remote));
    if (remote.data?.code !== 0 || !remote.data.data) return errorResponse(remote.data?.message || '处理失败');
    return successResponse(remote.data.data);
  } catch { return errorResponse('处理失败，请稍后重试'); }
}
