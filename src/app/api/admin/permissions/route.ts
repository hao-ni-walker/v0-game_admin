import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse
} from '@/service/response';

const REMOTE_API_URL = 'https://api.xreddeercasino.com/api/admin/permissions';

/**
 * 获取权限列表 API - 代理到远程 API
 * GET /api/admin/permissions
 */
export async function GET(request: NextRequest) {
  const requestStartTime = Date.now();
  try {
    // 从 cookie 中获取 token
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token || !token.value) {
      console.warn('[权限管理] 未授权访问：缺少 token');
      return unauthorizedResponse('未授权访问');
    }

    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();

    // 构建远程 API URL
    const remoteUrl = queryString
      ? `${REMOTE_API_URL}?${queryString}`
      : REMOTE_API_URL;

    // 记录请求日志
    console.log('[权限管理] 发送请求到远程API:', remoteUrl);

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

    // 控制台打印响应
    const requestDuration = Date.now() - requestStartTime;
    console.log(
      '[权限管理] 远程API响应:',
      JSON.stringify(
        {
          code: result.code,
          msg: result.msg,
          dataInfo: {
            total: result.data?.total,
            page: result.data?.page,
            page_size: result.data?.page_size,
            itemsCount: Array.isArray(result.data?.items)
              ? result.data.items.length
              : 0
          },
          requestDuration: `${requestDuration}ms`
        },
        null,
        2
      )
    );

    // 直接返回远程 API 的响应格式，保持一致性
    return NextResponse.json(result);
  } catch (error) {
    const requestDuration = Date.now() - requestStartTime;
    console.error('[权限管理] 获取权限列表失败:', {
      error: error instanceof Error ? error.message : String(error),
      requestDuration: `${requestDuration}ms`
    });

    return errorResponse('获取权限列表失败');
  }
}

/**
 * 创建权限 API - 代理到远程 API
 * POST /api/admin/permissions
 */
export async function POST(request: NextRequest) {
  const requestStartTime = Date.now();
  try {
    // 从 cookie 中获取 token
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token || !token.value) {
      console.warn('[权限管理] 未授权访问：缺少 token');
      return unauthorizedResponse('未授权访问');
    }

    // 获取请求体
    const body = await request.json();

    // 记录请求日志
    console.log('[权限管理] 创建权限请求:', body);

    // 转发请求到远程 API
    const remoteResponse = await fetch(REMOTE_API_URL, {
      method: 'POST',
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
    console.error('[权限管理] 创建权限失败:', {
      error: error instanceof Error ? error.message : String(error),
      requestDuration: `${requestDuration}ms`
    });

    return errorResponse('创建权限失败');
  }
}

/**
 * 批量删除权限 API - 代理到远程 API
 * DELETE /api/admin/permissions
 */
export async function DELETE(request: NextRequest) {
  const requestStartTime = Date.now();
  try {
    // 从 cookie 中获取 token
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token || !token.value) {
      console.warn('[权限管理] 未授权访问：缺少 token');
      return unauthorizedResponse('未授权访问');
    }

    // 获取请求体
    const body = await request.json();

    // 记录请求日志
    console.log('[权限管理] 批量删除权限请求:', body);

    // 转发请求到远程 API
    const remoteResponse = await fetch(REMOTE_API_URL, {
      method: 'DELETE',
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
    console.error('[权限管理] 批量删除权限失败:', {
      error: error instanceof Error ? error.message : String(error),
      requestDuration: `${requestDuration}ms`
    });

    return errorResponse('批量删除权限失败');
  }
}
