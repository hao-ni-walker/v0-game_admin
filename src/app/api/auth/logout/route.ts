import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { Logger } from '@/lib/logger';

export async function POST(request: Request) {
  try {
    // 获取token并解析用户信息
    const token = request.headers.get('cookie')?.match(/token=([^;]+)/)?.[1];
    let userId: number | undefined;
    let username: string | undefined;

    if (token) {
      try {
        const decoded = verify(
          token,
          process.env.JWT_SECRET || 'secret'
        ) as any;
        userId = decoded.id;
        username = decoded.username;
      } catch (error) {
        // Token无效，但仍然允许登出
      }
    }

    // 记录登出日志
    const logger = new Logger('用户认证', userId);
    await logger.info('用户登出', '用户退出系统', {
      userId,
      username,
      logoutTime: new Date().toISOString(),
      hasValidToken: !!token
    });

    const response = NextResponse.json(
      { message: '退出成功' },
      { status: 200 }
    );
    response.cookies.delete('token');

    return response;
  } catch (error) {
    // 记录登出错误日志
    const logger = new Logger('用户认证');
    await logger.error('用户登出', '登出过程发生错误', {
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    });

    // 即使发生错误也要清除token
    const response = NextResponse.json(
      { message: '退出成功' },
      { status: 200 }
    );
    response.cookies.delete('token');
    return response;
  }
}
