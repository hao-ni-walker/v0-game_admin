import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse
} from '@/service/response';
import { logger } from '@/lib/logger';

const REMOTE_API_URL = 'https://api.xreddeercasino.com/api/admin/users/batch';

/**
 * 批量操作玩家 API - 代理到远程 API
 * POST /api/players/batch
 */
export async function POST(request: NextRequest) {
  try {
    // 从 cookie 中获取 token
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token || !token.value) {
      await logger.warn('玩家管理', '批量操作', '未授权访问：缺少 token', {
        timestamp: new Date().toISOString()
      });
      return unauthorizedResponse('未授权访问');
    }

    // 解析请求体
    const body = await request.json();
    const { player_ids, operation } = body;

    // 转发请求到远程 API
    const remoteResponse = await fetch(REMOTE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `bearer ${token.value}`
      },
      body: JSON.stringify({ player_ids, operation })
    });

    // 检查 HTTP 状态码
    if (!remoteResponse.ok) {
      const errorText = await remoteResponse.text();
      await logger.error('玩家管理', '批量操作', '远程API请求失败', {
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

    // 记录成功日志
    await logger.info('玩家管理', '批量操作', '批量操作成功', {
      playerIds: player_ids,
      operation,
      timestamp: new Date().toISOString()
    });

    // 处理响应
    if ((result.code === 200 || result.code === 0)) {
      return successResponse(result.data || { success: true });
    }

    // 如果远程 API 返回错误
    if (result.code !== 200 && result.code !== 0) {
      await logger.warn('玩家管理', '批量操作', '远程API返回错误', {
        code: result.code,
        msg: result.msg,
        timestamp: new Date().toISOString()
      });
      return errorResponse(result.msg || '批量操作失败');
    }

    return successResponse(result.data || result);
  } catch (error) {
    await logger.error('玩家管理', '批量操作', '批量操作失败', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });

    return errorResponse('批量操作失败');
  }
}

