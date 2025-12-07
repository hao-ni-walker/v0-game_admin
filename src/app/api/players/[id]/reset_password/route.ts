import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse
} from '@/service/response';
import { logger } from '@/lib/logger';

const REMOTE_API_BASE_URL = 'https://api.xreddeercasino.com/api/admin/users';

/**
 * 重置玩家密码 API - 代理到远程 API
 * POST /api/players/[id]/reset_password
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
      await logger.warn('玩家管理', '重置密码', '未授权访问：缺少 token', {
        playerId: id,
        timestamp: new Date().toISOString()
      });
      return unauthorizedResponse('未授权访问');
    }

    // 转发请求到远程 API
    const remoteUrl = `${REMOTE_API_BASE_URL}/${id}/reset_password`;
    const remoteResponse = await fetch(remoteUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `bearer ${token.value}`
      }
    });

    // 检查 HTTP 状态码
    if (!remoteResponse.ok) {
      const errorText = await remoteResponse.text();
      await logger.error('玩家管理', '重置密码', '远程API请求失败', {
        playerId: id,
        status: remoteResponse.status,
        statusText: remoteResponse.statusText,
        errorText,
        timestamp: new Date().toISOString()
      });

      if (remoteResponse.status === 401) {
        return unauthorizedResponse('认证失败，请重新登录');
      }

      if (remoteResponse.status === 404) {
        return errorResponse('玩家不存在');
      }

      return errorResponse(
        `远程API错误: ${remoteResponse.status} ${remoteResponse.statusText}`
      );
    }

    // 解析远程 API 响应
    const result = await remoteResponse.json();

    // 记录成功日志
    await logger.info('玩家管理', '重置密码', '重置密码成功', {
      playerId: id,
      timestamp: new Date().toISOString()
    });

    // 处理响应
    if ((result.code === 200 || result.code === 0)) {
      return successResponse(result.data || { success: true });
    }

    // 如果远程 API 返回错误
    if (result.code !== 200 && result.code !== 0) {
      await logger.warn('玩家管理', '重置密码', '远程API返回错误', {
        playerId: id,
        code: result.code,
        msg: result.msg,
        timestamp: new Date().toISOString()
      });
      return errorResponse(result.msg || '重置密码失败');
    }

    return successResponse(result.data || result);
  } catch (error) {
    await logger.error('玩家管理', '重置密码', '重置密码失败', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });

    return errorResponse('重置密码失败');
  }
}

