import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse
} from '@/service/response';

const REMOTE_API_URL = 'https://api.xreddeercasino.com/api/admin/games';

/**
 * 更新游戏状态 API - 代理到远程 API
 * PATCH /api/admin/games/[id]/status
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestStartTime = Date.now();
  try {
    // 从 cookie 中获取 token
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token || !token.value) {
      console.warn('[更新游戏状态] 未授权访问：缺少 token');
      return unauthorizedResponse('未授权访问');
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (status === undefined) {
      return errorResponse('缺少 status 参数');
    }

    // 构建远程 API URL
    const remoteUrl = `${REMOTE_API_URL}/${id}/status`;

    // 记录请求日志
    console.log('[更新游戏状态] 发送请求到远程API:', {
      gameId: id,
      status,
      remoteUrl
    });

    // 转发请求到远程 API
    const remoteResponse = await fetch(remoteUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token.value}`
      },
      body: JSON.stringify({ status })
    });

    // 检查 HTTP 状态码
    if (!remoteResponse.ok) {
      const errorText = await remoteResponse.text();
      console.error('[更新游戏状态] 远程API请求失败:', {
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
    console.log('[更新游戏状态] 远程API响应:', {
      duration: `${requestDuration}ms`,
      result
    });

    // 返回成功响应
    return successResponse(
      result.data || result,
      result.message || '游戏状态更新成功'
    );
  } catch (error) {
    console.error('[更新游戏状态] 处理请求失败:', error);
    return errorResponse(
      error instanceof Error ? error.message : '更新游戏状态失败'
    );
  }
}
