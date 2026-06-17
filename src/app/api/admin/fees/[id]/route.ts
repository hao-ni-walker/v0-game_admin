import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { requestRemoteAdminApi } from '@/lib/admin-remote';
import { errorResponse, successResponse, unauthorizedResponse } from '@/service/response';

async function forward(req: NextRequest, context: { params: Promise<{ id: string }> }, method: 'PUT' | 'DELETE') {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');
  if (!token?.value) return unauthorizedResponse('未授权访问');

  const { id } = await context.params;
  const body = method === 'PUT' ? await req.text() : undefined;
  const remoteResponse = await requestRemoteAdminApi<{ code?: number; message?: string; data?: unknown }>({
    path: `/api/v1/admin/fees/${id}`,
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token.value}` },
    body,
  });
  if (!remoteResponse.ok) {
    if (remoteResponse.status === 401) return unauthorizedResponse('认证失败，请重新登录');
    if (remoteResponse.status === 400) return errorResponse(remoteResponse.data?.message || '操作失败');
    return errorResponse(`远程API错误: ${remoteResponse.status}`);
  }
  const result = remoteResponse.data;
  if (!result || (result.code !== 0 && result.code !== 200)) {
    return errorResponse(result?.message || '操作失败');
  }
  return successResponse(result.data);
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    return await forward(req, context, 'PUT');
  } catch (error) {
    console.error('更新费率配置失败:', error);
    return errorResponse('更新费率配置失败');
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    return await forward(req, context, 'DELETE');
  } catch (error) {
    console.error('删除费率配置失败:', error);
    return errorResponse('删除费率配置失败');
  }
}
