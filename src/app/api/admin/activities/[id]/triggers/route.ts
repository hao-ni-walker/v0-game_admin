import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  errorResponse,
  unauthorizedResponse
} from '@/service/response';

const REMOTE_API_BASE_URL = 'https://api.xreddeercasino.com/api/admin/activities';

/**
 * 获取活动触发规则列表 API - 代理到远程 API
 * GET /api/admin/activities/[id]/triggers
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 从 cookie 中获取 token
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token || !token.value) {
      return unauthorizedResponse('未授权访问');
    }

    // 转发请求到远程 API
    const remoteUrl = `${REMOTE_API_BASE_URL}/${id}/triggers`;
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
      console.error('[活动管理] 获取触发规则失败:', {
        activityId: id,
        status: remoteResponse.status,
        errorText
      });

      if (remoteResponse.status === 401) {
        return unauthorizedResponse('认证失败，请重新登录');
      }

      if (remoteResponse.status === 404) {
        return errorResponse('活动不存在');
      }

      return errorResponse(
        `远程API错误: ${remoteResponse.status} ${remoteResponse.statusText}`
      );
    }

    // 解析远程 API 响应
    const result = await remoteResponse.json();

    console.log('[活动管理] 获取触发规则响应:', JSON.stringify({
      code: result.code,
      activityId: id,
      triggersCount: Array.isArray(result.data?.items) ? result.data.items.length : 0
    }));

    if ((result.code === 200 || result.code === 0)) {
      return NextResponse.json({
        code: 0,
        message: result.msg || 'SUCCESS',
        success: true,
        data: result.data
      });
    }

    return errorResponse(result.msg || '获取触发规则失败');
  } catch (error) {
    console.error('[活动管理] 获取触发规则失败:', error);
    return errorResponse('获取触发规则失败');
  }
}

/**
 * 创建触发规则 API - 代理到远程 API
 * POST /api/admin/activities/[id]/triggers
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 从 cookie 中获取 token
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token || !token.value) {
      return unauthorizedResponse('未授权访问');
    }

    // 解析请求体
    const body = await request.json();

    console.log('[活动管理] 创建触发规则请求:', {
      activityId: id,
      body: JSON.stringify(body, null, 2)
    });

    // 转发请求到远程 API
    const remoteUrl = `${REMOTE_API_BASE_URL}/${id}/triggers`;
    const remoteResponse = await fetch(remoteUrl, {
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
      console.error('[活动管理] 创建触发规则失败:', {
        activityId: id,
        status: remoteResponse.status,
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

    console.log('[活动管理] 创建触发规则响应:', JSON.stringify(result, null, 2));

    if ((result.code === 200 || result.code === 0)) {
      return NextResponse.json({
        code: 0,
        message: result.msg || 'SUCCESS',
        success: true,
        data: result.data
      });
    }

    return errorResponse(result.msg || '创建触发规则失败');
  } catch (error) {
    console.error('[活动管理] 创建触发规则失败:', error);
    return errorResponse('创建触发规则失败');
  }
}

