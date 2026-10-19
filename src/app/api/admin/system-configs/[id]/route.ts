import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { requestRemoteAdminApi } from '@/lib/admin-remote';
import { errorResponse, successResponse, unauthorizedResponse } from '@/service/response';

/**
 * 更新一条系统参数配置（整值写入 + 版本乐观锁），透传后端
 * PUT /api/v1/admin/system-configs/{id}。
 */
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token');
    if (!token?.value) return unauthorizedResponse('未授权访问');

    const { id } = await context.params;
    const body = await req.text();
    const remoteResponse = await requestRemoteAdminApi<{
      code?: number;
      message?: string;
      detail?: string;
      data?: unknown;
    }>({
      path: `/api/v1/admin/system-configs/${id}`,
      method: 'PUT',
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
      // FastAPI HTTPException 的 message 在 detail 字段
      const message = remoteResponse.data?.detail || remoteResponse.data?.message;
      return errorResponse(message || `远程API错误: ${remoteResponse.status}`);
    }

    const result = remoteResponse.data;
    if (!result || (result.code !== 0 && result.code !== 200)) {
      return errorResponse(result?.message || '更新系统配置失败');
    }
    return successResponse(result.data);
  } catch (error) {
    console.error('更新系统配置失败:', error);
    return errorResponse('更新系统配置失败');
  }
}
