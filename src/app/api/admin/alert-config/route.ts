import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { remoteApiErrorMessage, requestRemoteAdminApi } from '@/lib/admin-remote';
import {
  errorResponse,
  successResponse,
  unauthorizedResponse
} from '@/service/response';

const REMOTE_PATH = '/api/v1/admin/alert/config';

type RemoteResponse = { code?: number; message?: string; data?: unknown };

async function token() {
  const cookieStore = await cookies();
  return cookieStore.get('token')?.value;
}

async function forward(
  method: 'GET' | 'PUT',
  body: string | undefined,
  failMessage: string
) {
  try {
    const authToken = await token();
    if (!authToken) return unauthorizedResponse('未授权访问');

    const remote = await requestRemoteAdminApi<RemoteResponse>({
      path: REMOTE_PATH,
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body
    });
    if (!remote.ok || !remote.data) {
      if (remote.status === 401)
        return unauthorizedResponse('认证失败，请重新登录');
      return errorResponse(remoteApiErrorMessage(remote));
    }
    if (remote.data.code !== 0 && remote.data.code !== 200) {
      return errorResponse(remote.data.message || failMessage);
    }
    return successResponse(remote.data.data);
  } catch (error) {
    console.error(`${failMessage}:`, error);
    return errorResponse(failMessage);
  }
}

export async function GET() {
  return forward('GET', undefined, '获取告警通知配置失败');
}

export async function PUT(request: NextRequest) {
  return forward('PUT', await request.text(), '保存告警通知配置失败');
}
