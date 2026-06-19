import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { requestRemoteAdminApi } from '@/lib/admin-remote';
import {
  errorResponse,
  successResponse,
  unauthorizedResponse
} from '@/service/response';

const SEND_PATH = '/api/v1/admin/messages/send';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token?.value) {
      return unauthorizedResponse('未授权访问');
    }

    const { id } = await params;
    const body = (await request.json()) as {
      channel?: string;
      title?: string;
      content?: string;
    };

    if (body.channel && body.channel !== 'in_app') {
      return errorResponse('当前仅支持站内信通知');
    }

    const remoteResponse = await requestRemoteAdminApi<{
      code?: number;
      message?: string;
      data?: unknown;
    }>({
      path: SEND_PATH,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token.value}`
      },
      body: JSON.stringify({
        user_id: Number(id),
        category: 'system',
        template_type: 'custom',
        priority: 'normal',
        title: body.title || '',
        body: body.content || ''
      })
    });

    if (!remoteResponse.ok) {
      if (remoteResponse.status === 401) {
        return unauthorizedResponse('认证失败，请重新登录');
      }
      return errorResponse(`远程API错误: ${remoteResponse.status}`);
    }

    const result = remoteResponse.data;
    if (!result || (result.code !== 0 && result.code !== 200)) {
      return errorResponse(result?.message || '发送通知失败');
    }

    return successResponse(result.data ?? null);
  } catch (error) {
    console.error('发送通知失败:', error);
    return errorResponse('发送通知失败');
  }
}

