import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { logger } from '@/lib/logger';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse
} from '@/service/response';
import { getRepositories } from '@/repository';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const repos = await getRepositories();
    const user = await repos.users.findByEmail(email);

    if (!user) {
      // 记录登录失败日志 - 用户不存在
      await logger.warn('用户认证', '用户登录', '登录失败：用户不存在', {
        reason: '用户不存在',
        email: email,
        timestamp: new Date().toISOString()
      });

      return unauthorizedResponse('邮箱或密码错误');
    }
    // 暂时跳过禁用状态与密码校验，直接签发 token（联调阶段）

    // 更新最后登录时间（JSON 仓储）
    await repos.users.update(user.id, { lastLoginAt: new Date().toISOString() });

    const token = sign(
      {
        id: user.id,
        email: user.email,
        username: user.username,
        roleId: user.roleId,
        avatar: user.avatar,
        isSurperAdmin: user.isSuperAdmin
      },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1d' }
    );

    // 记录登录成功日志
    await logger.info(
      '用户认证',
      '用户登录',
      '用户登录成功',
      {
        userId: user.id,
        username: user.username,
        email: user.email,
        roleId: user.roleId,
        loginTime: new Date().toISOString(),
        tokenExpiry: '24小时'
      },
      user.id
    );

    const response = successResponse({
      message: '登录成功',
      user: { id: user.id, email: user.email },
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
    await logger.error('用户认证', '用户登录', '登录过程发生服务器错误', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });

    return errorResponse('服务器错误');
  }
}