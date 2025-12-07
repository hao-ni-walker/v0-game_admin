import { cookies } from 'next/headers';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse
} from '@/service/response';
import { logger } from '@/lib/logger';

const REMOTE_API_URL = 'https://api.xreddeercasino.com/api/admin/users';

/**
 * 获取玩家列表 - 代理到远程 API
 * GET /api/admin/users
 */
export async function GET(request: Request) {
  try {
    // 从 cookie 中获取 token
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token || !token.value) {
      await logger.warn('用户管理', '获取玩家列表', '未授权访问：缺少 token', {
        timestamp: new Date().toISOString()
      });
      return unauthorizedResponse('未授权访问');
    }

    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();

    // 构建远程 API URL
    const remoteUrl = queryString
      ? `${REMOTE_API_URL}?${queryString}`
      : REMOTE_API_URL;

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
      await logger.error('用户管理', '获取玩家列表', '远程API请求失败', {
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
    await logger.info('用户管理', '获取玩家列表', '获取玩家列表成功', {
      queryParams: queryString,
      timestamp: new Date().toISOString()
    });

    // 返回远程 API 的响应
    return successResponse(result.data || result, result.pager);
  } catch (error) {
    // 记录错误日志
    await logger.error('用户管理', '获取玩家列表', '获取玩家列表失败', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });

    return errorResponse('获取玩家列表失败');
  }
}

