import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { requestRemoteAdminApi } from '@/lib/admin-remote';
import {
  errorResponse,
  successResponse,
  unauthorizedResponse
} from '@/service/response';

async function forward(req?: NextRequest) {
  try {
    const token = (await cookies()).get('token');
    if (!token?.value) return unauthorizedResponse('未授权访问');
    const response = await requestRemoteAdminApi<{
      code: number;
      message?: string;
      data?: unknown;
    }>({
      path: '/api/v1/admin/prediction/markets/trading-config',
      method: req ? 'PUT' : 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token.value}`
      },
      ...(req ? { body: await req.text() } : {})
    });
    if (response.status === 401)
      return unauthorizedResponse('认证失败，请重新登录');
    if (
      !response.ok ||
      !response.data ||
      ![0, 200].includes(response.data.code)
    )
      return errorResponse(response.data?.message || '预测交易配置请求失败');
    return successResponse(response.data.data);
  } catch {
    return errorResponse('预测交易配置请求失败');
  }
}
export async function GET() {
  return forward();
}
export async function PUT(req: NextRequest) {
  return forward(req);
}
