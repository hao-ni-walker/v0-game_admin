import { serviceUnavailableResponse } from '@/service/response';
import { requestRemoteAdminApi } from '@/lib/admin-remote';
import { verifyToken } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // 获取token并解析用户信息
    const token = request.headers.get('cookie')?.match(/token=([^;]+)/)?.[1];
    let userId: number | undefined;
    let username: string | undefined;

    if (token) {
      const remote = await requestRemoteAdminApi<{ code?: number }>({
        path: '/api/v1/admin/auth/logout',
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      // An already-invalid token needs no further revocation. Other failures
      // must remain retryable; clearing only the browser cookie is not logout.
      if (remote.status !== 401 && (!remote.ok || ![0, 200].includes(remote.data?.code ?? -1))) {
        return serviceUnavailableResponse('退出服务暂不可用，请重试');
      }
      const user = verifyToken(token);
      if (user) {
        userId = user.id;
        username = user.username;
      }
    }

    // 记录登出日志
    await logger.info('用户认证', '用户登出', '用户退出系统', {
      userId,
      username,
      logoutTime: new Date().toISOString(),
      hasValidToken: !!token
    });

    // 创建响应并清除 cookie
    const response = NextResponse.json({
      code: 0,
      message: '退出成功'
    });

    // 清除 token cookie（通过设置过期时间为过去的时间）
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0, // 立即过期
      expires: new Date(0) // 设置为1970年，确保立即过期
    });

    return response;
  } catch (error) {
    // 记录登出错误日志
    await logger.error('用户认证', '用户登出', '登出过程发生错误', {
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    });

    return serviceUnavailableResponse('退出服务暂不可用，请重试');
  }
}
