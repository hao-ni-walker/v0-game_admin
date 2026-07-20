import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { requestRemoteAdminApi } from '@/lib/admin-remote';
import { errorResponse, successResponse, unauthorizedResponse } from '@/service/response';

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: Context) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token');
    if (!token?.value) return unauthorizedResponse('未授权访问');

    const { id } = await context.params;
    const body = await request.json();
    const updates: Record<string, unknown> = {
      reason: body.reason || '管理员账号更新'
    };
    if (body.email !== undefined || body.displayName !== undefined) {
      updates.display_name = body.displayName || body.email;
    }
    if (body.roleId) updates.role = body.roleId;
    if (body.status) updates.is_active = body.status === 'active';

    const remoteResponse = await requestRemoteAdminApi<{
      code?: number;
      message?: string;
      data?: unknown;
    }>({
      path: `/api/v1/admin/admin/members/${id}`,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token.value}`
      },
      body: JSON.stringify(updates)
    });
    if (!remoteResponse.ok) {
      if (remoteResponse.status === 401) return unauthorizedResponse('认证失败，请重新登录');
      return errorResponse(remoteResponse.data?.message || '更新管理员失败');
    }
    const result = remoteResponse.data;
    if (!result || (result.code !== 0 && result.code !== 200)) {
      return errorResponse(result?.message || '更新管理员失败');
    }

    if (body.password) {
      const passwordResponse = await requestRemoteAdminApi<{
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
          new_password: body.password,
          reason: body.passwordReason || '管理员密码修改'
        })
      });
      if (!passwordResponse.ok || !passwordResponse.data || (passwordResponse.data.code !== 0 && passwordResponse.data.code !== 200)) {
        return errorResponse(passwordResponse.data?.message || '管理员资料已更新，但密码修改失败');
      }
    }
    return successResponse(result.data);
  } catch (error) {
    console.error('更新管理员失败:', error);
    return errorResponse('更新管理员失败');
  }
}

export async function DELETE(_request: NextRequest, context: Context) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token');
    if (!token?.value) return unauthorizedResponse('未授权访问');

    const { id } = await context.params;
    const remoteResponse = await requestRemoteAdminApi<{
      code?: number;
      message?: string;
      data?: unknown;
    }>({
      path: `/api/v1/admin/admin/members/${id}`,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token.value}`
      },
      body: JSON.stringify({ is_active: false, reason: '管理员账号停用' })
    });
    if (!remoteResponse.ok) {
      if (remoteResponse.status === 401) return unauthorizedResponse('认证失败，请重新登录');
      return errorResponse(remoteResponse.data?.message || '停用管理员失败');
    }
    const result = remoteResponse.data;
    if (!result || (result.code !== 0 && result.code !== 200)) {
      return errorResponse(result?.message || '停用管理员失败');
    }
    return successResponse(result.data);
  } catch (error) {
    console.error('停用管理员失败:', error);
    return errorResponse('停用管理员失败');
  }
}
