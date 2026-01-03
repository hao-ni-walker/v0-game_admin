import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse
} from '@/service/response';

const REMOTE_API_BASE_URL =
  'https://api.xreddeercasino.com/api/admin/permissions';

/**
 * 获取权限详情 API - 代理到远程 API
 * GET /api/admin/permissions/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestStartTime = Date.now();
  try {
    const { id } = await params;

    // 从 cookie 中获取 token
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token || !token.value) {
      console.warn('[权限管理] 未授权访问：缺少 token');
      return unauthorizedResponse('未授权访问');
    }
    const remoteUrl = `${REMOTE_API_BASE_URL}/${id}`;

    // 记录请求日志
    console.log('[权限管理] 获取权限详情请求:', remoteUrl);

    // 转发请求到远程 API
    const remoteResponse = await fetch(remoteUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `bearer ${token.value}`
      }
    });

    // 检查 HTTP 状态码
    if (!remoteResponse.ok) {
      const errorText = await remoteResponse.text();
      console.error('[权限管理] 远程API请求失败:', {
        status: remoteResponse.status,
        statusText: remoteResponse.statusText,
        errorText
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

    // 直接返回远程 API 的响应格式
    return NextResponse.json(result);
  } catch (error) {
    const requestDuration = Date.now() - requestStartTime;
    console.error('[权限管理] 获取权限详情失败:', {
      error: error instanceof Error ? error.message : String(error),
      requestDuration: `${requestDuration}ms`
    });

    return errorResponse('获取权限详情失败');
  }
}

/**
 * 更新权限 API - 代理到远程 API
 * PUT /api/admin/permissions/[id]
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestStartTime = Date.now();
  try {
    const { id } = await params;

    // 从 cookie 中获取 token
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token || !token.value) {
      console.warn('[权限管理] 未授权访问：缺少 token');
      return unauthorizedResponse('未授权访问');
    }
    const remoteUrl = `${REMOTE_API_BASE_URL}/${id}`;

    // 获取请求体
    const body = await request.json();

    // 记录请求日志
    console.log('[权限管理] 更新权限请求:', { id, body });

    // 转发请求到远程 API
    const remoteResponse = await fetch(remoteUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `bearer ${token.value}`
      },
      body: JSON.stringify(body)
    });

    // 检查 HTTP 状态码
    if (!remoteResponse.ok) {
      const errorText = await remoteResponse.text();
      console.error('[权限管理] 远程API请求失败:', {
        status: remoteResponse.status,
        statusText: remoteResponse.statusText,
        errorText
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

    // 直接返回远程 API 的响应格式
    return NextResponse.json(result);
  } catch (error) {
    const requestDuration = Date.now() - requestStartTime;
    console.error('[权限管理] 更新权限失败:', {
      error: error instanceof Error ? error.message : String(error),
      requestDuration: `${requestDuration}ms`
    });

    return errorResponse('更新权限失败');
  }
}

/**
 * 删除权限 API - 代理到远程 API
 * DELETE /api/admin/permissions/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestStartTime = Date.now();
  try {
    const { id } = await params;

    // 从 cookie 中获取 token
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token || !token.value) {
      console.warn('[权限管理] 未授权访问：缺少 token');
      return unauthorizedResponse('未授权访问');
    }
    const remoteUrl = `${REMOTE_API_BASE_URL}/${id}`;

    // 记录请求日志
    console.log('[权限管理] 删除权限请求:', id);

    // 转发请求到远程 API
    const remoteResponse = await fetch(remoteUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `bearer ${token.value}`
      }
    });

    // 检查 HTTP 状态码
    if (!remoteResponse.ok) {
      const errorText = await remoteResponse.text();
      console.error('[权限管理] 远程API请求失败:', {
        status: remoteResponse.status,
        statusText: remoteResponse.statusText,
        errorText
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

    // 直接返回远程 API 的响应格式
    return NextResponse.json(result);
  } catch (error) {
    const requestDuration = Date.now() - requestStartTime;
    console.error('[权限管理] 删除权限失败:', {
      error: error instanceof Error ? error.message : String(error),
      requestDuration: `${requestDuration}ms`
    });

    return errorResponse('删除权限失败');
  }
}
