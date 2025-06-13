import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { Logger } from '@/lib/logger';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse
} from '@/service/response';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user.length) {
      // 记录登录失败日志 - 用户不存在
      const logger = new Logger('用户认证');
      await logger.warn('用户登录', '登录失败：用户不存在', {
        reason: '用户不存在',
        email: email,
        timestamp: new Date().toISOString()
      });

      return unauthorizedResponse('邮箱或密码错误');
    }

    const isValid = await bcrypt.compare(password, user[0].password);
    if (!isValid) {
      // 记录登录失败日志 - 密码错误
      const logger = new Logger('用户认证', user[0].id);
      await logger.warn('用户登录', '登录失败：密码错误', {
        reason: '密码错误',
        email: email,
        userId: user[0].id,
        username: user[0].username,
        timestamp: new Date().toISOString()
      });

      return unauthorizedResponse('邮箱或密码错误');
    }

    const token = sign(
      {
        id: user[0].id,
        email: user[0].email,
        username: user[0].username,
        roleId: user[0].roleId,
        avatar: user[0].avatar,
        isSurperAdmin: user[0].isSuperAdmin
      },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1d' }
    );

    // 记录登录成功日志
    const logger = new Logger('用户认证', user[0].id);
    await logger.info('用户登录', '用户登录成功', {
      userId: user[0].id,
      username: user[0].username,
      email: user[0].email,
      roleId: user[0].roleId,
      loginTime: new Date().toISOString(),
      tokenExpiry: '24小时'
    });

    const response = successResponse({
      message: '登录成功',
      user: { id: user[0].id, email: user[0].email },
      token
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24
    });

    return response;
  } catch (error) {
    // 记录服务器错误日志
    const logger = new Logger('用户认证');
    await logger.error('用户登录', '登录过程发生服务器错误', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });

    return errorResponse('服务器错误');
  }
}
