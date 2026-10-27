import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { remoteApiErrorMessage, requestRemoteAdminApi } from '@/lib/admin-remote';
import {
  errorResponse,
  successResponse,
  unauthorizedResponse
} from '@/service/response';

const REMOTE_PATH = '/api/v1/admin/alert/config/test';

type RemoteResponse = { code?: number; message?: string; data?: unknown };

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('token')?.value;
    if (!authToken) return unauthorizedResponse('未授权访问');

    const remote = await requestRemoteAdminApi<RemoteResponse>({
      path: REMOTE_PATH,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: await request.text()
    });
    if (!remote.ok || !remote.data) {
      if (remote.status === 401)
        return unauthorizedResponse('认证失败，请重新登录');
      return errorResponse(remoteApiErrorMessage(remote));
    }
    if (remote.data.code !== 0 && remote.data.code !== 200) {
      return errorResponse(remote.data.message || '发送测试消息失败');
    }
    return successResponse(remote.data.data);
  } catch (error) {
    console.error('发送测试消息失败:', error);
    return errorResponse('发送测试消息失败');
  }
}
