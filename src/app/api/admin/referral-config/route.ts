import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { requestRemoteAdminApi } from '@/lib/admin-remote';
import {
  errorResponse,
  successResponse,
  unauthorizedResponse
} from '@/service/response';

const REMOTE_PATH = '/api/v1/admin/system/referral-config';

type RemoteResponse = { code?: number; message?: string; data?: unknown };

async function token() {
  const cookieStore = await cookies();
  return cookieStore.get('token')?.value;
}

export async function GET() {
  try {
    const authToken = await token();
    if (!authToken) return unauthorizedResponse('未授权访问');

    const remote = await requestRemoteAdminApi<RemoteResponse>({
      path: REMOTE_PATH,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      }
    });
    if (!remote.ok || !remote.data) {
      if (remote.status === 401)
        return unauthorizedResponse('认证失败，请重新登录');
      return errorResponse(`远程API错误: ${remote.status}`);
    }
    if (remote.data.code !== 0 && remote.data.code !== 200) {
      return errorResponse(remote.data.message || '获取邀请奖励配置失败');
    }
    return successResponse(remote.data.data);
  } catch (error) {
    console.error('获取邀请奖励配置失败:', error);
    return errorResponse('获取邀请奖励配置失败');
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authToken = await token();
    if (!authToken) return unauthorizedResponse('未授权访问');

    const remote = await requestRemoteAdminApi<RemoteResponse>({
      path: REMOTE_PATH,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: await request.text()
    });
    if (!remote.ok || !remote.data) {
      if (remote.status === 401)
        return unauthorizedResponse('认证失败，请重新登录');
      return errorResponse(`远程API错误: ${remote.status}`);
    }
    if (remote.data.code !== 0 && remote.data.code !== 200) {
      return errorResponse(remote.data.message || '保存邀请奖励配置失败');
    }
    return successResponse(remote.data.data);
  } catch (error) {
    console.error('保存邀请奖励配置失败:', error);
    return errorResponse('保存邀请奖励配置失败');
  }
}
