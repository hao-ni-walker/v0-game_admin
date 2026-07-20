import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse
} from '@/service/response';
import { logger } from '@/lib/logger';
import { buildRemoteAdminUrl, requestRemoteAdminApi } from '@/lib/admin-remote';

/**
 * 获取管理员列表 API - 代理到远程 API
 * GET /api/admin/admins
 */
export async function GET(request: NextRequest) {
  const requestStartTime = Date.now();
  try {
    // 从 cookie 中获取 token
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token || !token.value) {
      await logger.warn(
        '管理员管理',
        '获取管理员列表',
        '未授权访问：缺少 token',
        {
          timestamp: new Date().toISOString()
        }
      );
      return unauthorizedResponse('未授权访问');
    }

    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();

    // 构建远程 API URL
    const remoteUrl = buildRemoteAdminUrl(
      '/api/v1/admin/admin/members',
      queryString
    );

    // 记录请求日志
    console.log('[管理员管理] 发送请求到远程API:', remoteUrl);

    // 转发请求到远程 API
    const remoteResponse = await fetch(remoteUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token.value}`
      }
    });

    // 检查 HTTP 状态码
    if (!remoteResponse.ok) {
      const errorText = await remoteResponse.text();
      await logger.error('管理员管理', '获取管理员列表', '远程API请求失败', {
        status: remoteResponse.status,
        statusText: remoteResponse.statusText,
        errorText,
        timestamp: new Date().toISOString()
      });

      if (remoteResponse.status === 401) {
        return unauthorizedResponse('认证失败，请重新登录');
      }

      return errorResponse(
        `远程API错误: ${remoteResponse.status} ${remoteResponse.statusText}`
      );
    }

    // 解析远程 API 响应
    const result = await remoteResponse.json();

    const requestDuration = Date.now() - requestStartTime;
    const remoteMembers = Array.isArray(result.data?.members)
      ? result.data.members
      : [];
    const items = remoteMembers.map((item: any) => ({
      id: Number.parseInt(String(item.admin_id), 10) || 0,
      username: item.username || '',
      email: item.display_name || item.username || '',
      avatar: null,
      role_id: item.role || '',
      role_name: item.role || '',
      is_super_admin: item.role === 'super_admin',
      status: item.status === 'active' ? 'active' : 'disabled',
      last_login_at: item.last_login_at
        ? new Date(item.last_login_at * 1000).toISOString()
        : '',
      login_error_count: 0,
      lock_time: null,
      created_at: item.created_at
        ? new Date(item.created_at * 1000).toISOString()
        : '',
      updated_at: item.created_at
        ? new Date(item.created_at * 1000).toISOString()
        : ''
    }));

    console.log(
      '[管理员管理] 远程API响应:',
      JSON.stringify(
        {
          code: result.code,
          msg: result.msg,
          dataInfo: {
            total: items.length,
            page: 1,
            page_size: items.length,
            itemsCount: items.length
          },
          requestDuration: `${requestDuration}ms`
        },
        null,
        2
      )
    );

    await logger.info('管理员管理', '获取管理员列表', '获取成功', {
      total: items.length,
      page: 1,
      page_size: items.length,
      itemsCount: items.length,
      requestDuration: `${requestDuration}ms`,
      timestamp: new Date().toISOString()
    });

    if (result.code !== 200 && result.code !== 0) {
      console.warn('[管理员管理] 远程API返回错误:', {
        code: result.code,
        msg: result.msg
      });
      return errorResponse(result.msg || '获取管理员列表失败');
    }

    return NextResponse.json({
      code: 0,
      message: result.msg || 'SUCCESS',
      success: true,
      data: {
        items,
        total: items.length,
        page: 1,
        page_size: items.length || 10
      }
    });
  } catch (error) {
    const requestDuration = Date.now() - requestStartTime;
    await logger.error('管理员管理', '获取管理员列表', '请求异常', {
      error: error instanceof Error ? error.message : String(error),
      requestDuration: `${requestDuration}ms`,
      timestamp: new Date().toISOString()
    });

    return errorResponse('获取管理员列表失败');
  }
}

/** Create an admin account through the backend admin-members API. */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token');
    if (!token?.value) return unauthorizedResponse('未授权访问');

    const body = await request.json();
    const remoteResponse = await requestRemoteAdminApi<{
      code?: number;
      message?: string;
      data?: unknown;
    }>({
      path: '/api/v1/admin/admin/members',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token.value}`
      },
      body: JSON.stringify({
        username: body.username,
        display_name: body.email || body.displayName || body.username,
        role: body.roleId,
        initial_password: body.password,
        is_active: body.status !== 'disabled'
      })
    });
    if (!remoteResponse.ok) {
      if (remoteResponse.status === 401) return unauthorizedResponse('认证失败，请重新登录');
      return errorResponse(remoteResponse.data?.message || '创建管理员失败');
    }
    const result = remoteResponse.data;
    if (!result || (result.code !== 0 && result.code !== 200)) {
      return errorResponse(result?.message || '创建管理员失败');
    }
    return successResponse(result.data);
  } catch (error) {
    console.error('创建管理员失败:', error);
    return errorResponse('创建管理员失败');
  }
}
