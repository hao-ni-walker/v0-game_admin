import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { requestRemoteAdminApi } from '@/lib/admin-remote';
import {
  errorResponse,
  successResponse,
  unauthorizedResponse,
} from '@/service/response';

const BASE_PATH = '/api/v1/admin/messages/broadcasts';

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token?.value) {
      return unauthorizedResponse('未授权访问');
    }

    const sp = new URLSearchParams(req.nextUrl.searchParams);
    if (sp.has('page_size')) {
      sp.set('size', sp.get('page_size') as string);
      sp.delete('page_size');
    }
    const qs = sp.toString();
    const remoteResponse = await requestRemoteAdminApi<{
      code?: number;
      message?: string;
      data?: unknown;
    }>({
      path: `${BASE_PATH}${qs ? `?${qs}` : ''}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token.value}`,
      },
    });

    if (!remoteResponse.ok) {
      if (remoteResponse.status === 401) {
        return unauthorizedResponse('认证失败，请重新登录');
      }
      return errorResponse(`远程API错误: ${remoteResponse.status}`);
    }

    const result = remoteResponse.data;
    if (!result || (result.code !== 0 && result.code !== 200)) {
      return errorResponse(result?.message || '获取群发列表失败');
    }

    return successResponse(result.data);
  } catch (error) {
    console.error('获取群发列表失败:', error);
    return errorResponse('获取群发列表失败');
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token?.value) {
      return unauthorizedResponse('未授权访问');
    }

    const body = await req.text();
    const remoteResponse = await requestRemoteAdminApi<{
      code?: number;
      message?: string;
      data?: unknown;
    }>({
      path: BASE_PATH,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token.value}`,
      },
      body,
    });

    if (!remoteResponse.ok) {
      if (remoteResponse.status === 401) {
        return unauthorizedResponse('认证失败，请重新登录');
      }
      return errorResponse(`远程API错误: ${remoteResponse.status}`);
    }

    const result = remoteResponse.data;
    if (!result || (result.code !== 0 && result.code !== 200)) {
      return errorResponse(result?.message || '创建群发失败');
    }

    return successResponse(result.data);
  } catch (error) {
    console.error('创建群发失败:', error);
    return errorResponse('创建群发失败');
  }
}
