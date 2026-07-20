import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { requestRemoteAdminApi } from '@/lib/admin-remote';
import { errorResponse, successResponse, unauthorizedResponse } from '@/service/response';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token');
    if (!token?.value) return unauthorizedResponse('未授权访问');

    const { id } = await context.params;
    const body = await request.json();
    if (!body.newPassword || body.newPassword !== body.confirmPassword) {
      return errorResponse('两次输入的密码不一致');
    }
    const remoteResponse = await requestRemoteAdminApi<{
      code?: number;
      message?: string;
      data?: unknown;
    }>({
      path: `/api/v1/admin/admin/members/${id}/password`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token.value}`
      },
      body: JSON.stringify({
        new_password: body.newPassword,
        reason: body.reason || '管理员密码修改'
      })
    });
    if (!remoteResponse.ok) {
      if (remoteResponse.status === 401) return unauthorizedResponse('认证失败，请重新登录');
      return errorResponse(remoteResponse.data?.message || '修改密码失败');
    }
    const result = remoteResponse.data;
    if (!result || (result.code !== 0 && result.code !== 200)) {
      return errorResponse(result?.message || '修改密码失败');
    }
    return successResponse(result.data);
  } catch (error) {
    console.error('修改管理员密码失败:', error);
    return errorResponse('修改管理员密码失败');
  }
}
