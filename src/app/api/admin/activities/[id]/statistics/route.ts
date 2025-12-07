import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  errorResponse,
  unauthorizedResponse
} from '@/service/response';

const REMOTE_API_BASE_URL = 'https://api.xreddeercasino.com/api/admin/activities';

/**
 * 获取活动统计信息 API - 代理到远程 API
 * GET /api/admin/activities/[id]/statistics
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
    const remoteUrl = `${REMOTE_API_BASE_URL}/${id}/statistics`;
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
      console.error('[活动管理] 获取活动统计失败:', {
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

    console.log('[活动管理] 获取活动统计响应:', JSON.stringify({
      code: result.code,
      activityId: id
    }));

    if ((result.code === 200 || result.code === 0)) {
      return NextResponse.json({
        code: 0,
        message: result.msg || 'SUCCESS',
        success: true,
        data: result.data
      });
    }

    return errorResponse(result.msg || '获取活动统计失败');
  } catch (error) {
    console.error('[活动管理] 获取活动统计失败:', error);
    return errorResponse('获取活动统计失败');
  }
}

