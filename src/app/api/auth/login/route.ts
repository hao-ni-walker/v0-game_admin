import { logger } from '@/lib/logger';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse
} from '@/service/response';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

// Mock 用户数据（当数据库中没有用户时使用）
const MOCK_USERS = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123', // 明文密码，用于 mock
    nickname: '系统管理员',
    role: 'admin',
    status: 'active'
  },
  {
    id: 2,
    username: 'operator',
    password: 'operator123',
    nickname: '运营人员',
    role: 'operator',
    status: 'active'
  }
];

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // 验证必填字段
    if (!username || !password) {
      await logger.warn('用户认证', '用户登录', '登录失败：缺少必填字段', {
        missingFields: {
          username: !username,
          password: !password
        },
        timestamp: new Date().toISOString()
      });

      return errorResponse('请填写用户名和密码');
    }

    let user = null;
    let isPasswordValid = false;

    // 尝试从数据库读取用户
    if (process.env.DATABASE_URL) {
      try {
        const sql = neon(process.env.DATABASE_URL);
        const users = await sql`SELECT * FROM admin_users WHERE username = ${username} LIMIT 1`;
        
        if (users.length > 0) {
          user = users[0];
          // 验证密码（假设数据库中存储的是 bcrypt 哈希）
          isPasswordValid = await bcrypt.compare(password, user.password_hash || user.password);
        }
      } catch (dbError) {
        // 数据库查询失败，回退到 mock 数据
        await logger.warn('用户认证', '用户登录', '数据库查询失败，使用 mock 数据', {
          error: dbError instanceof Error ? dbError.message : String(dbError),
          timestamp: new Date().toISOString()
        });
      }
    }

    // 如果数据库没有找到用户，使用 mock 数据
    if (!user) {
      const mockUser = MOCK_USERS.find(u => u.username === username);
      if (mockUser) {
        user = mockUser;
        isPasswordValid = mockUser.password === password;
      }
    }

    // 用户不存在
    if (!user) {
      await logger.warn('用户认证', '用户登录', '登录失败：用户不存在', {
        username,
        timestamp: new Date().toISOString()
      });
      return unauthorizedResponse('用户名或密码错误');
    }

    // 密码错误
    if (!isPasswordValid) {
      await logger.warn('用户认证', '用户登录', '登录失败：密码错误', {
        username,
        timestamp: new Date().toISOString()
      });
      return unauthorizedResponse('用户名或密码错误');
    }

    // 检查用户状态
    if (user.status !== 'active') {
      await logger.warn('用户认证', '用户登录', '登录失败：账号已禁用', {
        username,
        status: user.status,
        timestamp: new Date().toISOString()
      });
      return unauthorizedResponse('账号已被禁用');
    }

    // 生成 token
    const token = randomUUID();
    const tokenType = 'bearer';

    // 记录登录成功日志
    await logger.info('用户认证', '用户登录', '用户登录成功', {
      username,
      userId: user.id,
      loginTime: new Date().toISOString()
    });

    const response = successResponse({
      message: '登录成功',
      token,
      tokenType,
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname || user.username,
        role: user.role
      }
    });

    // 将 token 存储到 httpOnly cookie 中
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 // 24小时
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
