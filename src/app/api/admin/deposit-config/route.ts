import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { remoteApiErrorMessage, requestRemoteAdminApi } from '@/lib/admin-remote';
import { errorResponse, successResponse, unauthorizedResponse } from '@/service/response';

const CONFIG_PATH = '/api/v1/admin/deposit/config';

async function proxy(method: 'GET' | 'PUT', req?: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');
  if (!token?.value) return unauthorizedResponse('未授权访问');

  let body: string | undefined;
  if (method === 'PUT' && req) {
    try {
      body = JSON.stringify(await req.json());
    } catch {
      body = undefined;
    }
  }

  try {
    const remoteResponse = await requestRemoteAdminApi<{
      code?: number;
      message?: string;
      data?: unknown;
    }>({
      path: CONFIG_PATH,
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token.value}`,
      },
      body,
    });
    if (!remoteResponse.ok) {
      if (remoteResponse.status === 401) return unauthorizedResponse('认证失败，请重新登录');
      return errorResponse(remoteApiErrorMessage(remoteResponse));
    }
    const result = remoteResponse.data;
    if (!result || (result.code !== 0 && result.code !== 200)) {
      return errorResponse(result?.message || '获取归集配置失败');
    }
    return successResponse(result.data);
  } catch (error) {
    console.error('deposit-config 代理失败:', error);
    return errorResponse('deposit-config 代理失败');
  }
}

export async function GET() {
  return proxy('GET');
}

export async function PUT(req: NextRequest) {
  return proxy('PUT', req);
}
