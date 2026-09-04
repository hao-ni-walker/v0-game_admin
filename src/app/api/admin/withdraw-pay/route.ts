import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { requestRemoteAdminApi } from '@/lib/admin-remote';
import {
  successResponse,
  unauthorizedResponse,
} from '@/service/response';

/**
 * 打款(TRON USDT TRC20):admin 控制台一次性触发,后端签名广播后由
 * WithdrawProcessor 扫链确认。返回 tx hash + tronscan 直链供截图留证。
 */
export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  if (!token?.value) {
    return unauthorizedResponse('未授权访问');
  }

  let withdrawId = '';
  try {
    const body = await request.json();
    withdrawId = String(body.withdraw_id || '').trim();
  } catch {
    return Response.json({ code: 1, message: '请求体无效' }, { status: 400 });
  }
  if (!/^\d+$/.test(withdrawId)) {
    return Response.json({ code: 1, message: '缺少有效的 withdraw_id' }, { status: 400 });
  }

  const remote = await requestRemoteAdminApi<{
    code?: number;
    message?: string;
    msg?: string;
    data?: unknown;
  }>({
    path: `/api/v1/admin/withdraw/${withdrawId}/pay`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token.value}`,
    },
    body: JSON.stringify({}),
  });

  if (remote.ok && remote.data && (remote.data.code === 0 || remote.data.code === 200)) {
    return successResponse(remote.data.data);
  }

  return Response.json(
    {
      code: 1,
      message:
        remote.data?.message || remote.data?.msg || `上游打款失败(${remote.status})`,
    },
    { status: 502 },
  );
}
