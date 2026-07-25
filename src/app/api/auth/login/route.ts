import bcrypt from 'bcryptjs';
import { getRepositories } from '@/repository';
import { signAdminToken } from '@/lib/jwt';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse
} from '@/service/response';
import { logger } from '@/lib/logger';

// 管理员会话有效期。生产应通过 JWT_TTL_SEC 覆盖。
const TOKEN_TTL_SEC = Number(process.env.JWT_TTL_SEC ?? 60 * 60 * 8); // 默认 8h

function cookieSecure() {
  return process.env.NODE_ENV === 'production';
}

/**
 * 本地管理员登录(不再转发远程 API)。
 * 验证 bcrypt 口令 → 签发 HS256 JWT(httpOnly cookie)。
 * mustChangePassword 写进 token,中间件据此对未改密会话返回 428。
 */
export async function POST(request: Request) {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    return errorResponse('服务端未正确配置 JWT_SECRET', 500);
  }

  const body = await request.json().catch(() => ({}));
  const { username, password } = body as { username?: string; password?: string };

  if (!username || !password) {
    return errorResponse('请填写用户名和密码');
  }

  const repos = await getRepositories();
  const user =
    (await repos.users.findByUsername(String(username))) ??
    (await repos.users.findByEmail(String(username)));

  // 用户不存在/停用/口令错误统一返回相同文案,避免账号枚举。
  if (!user || user.status === 'disabled') {
    await logger.warn('用户认证', '用户登录', '登录失败:账号不存在或已停用', {
      username,
      timestamp: new Date().toISOString()
    });
    return unauthorizedResponse('用户名或密码错误');
  }

  const ok = await bcrypt.compare(String(password), user.password);
  if (!ok) {
    await logger.warn('用户认证', '用户登录', '登录失败:口令错误', {
      username,
      timestamp: new Date().toISOString()
    });
    return unauthorizedResponse('用户名或密码错误');
  }

  const mustChangePassword = !!user.mustChangePassword;
  const token = await signAdminToken(
    {
      sub: user.id,
      username: user.username,
      roleId: Number(user.roleId),
      mustChangePassword
    },
    secret,
    TOKEN_TTL_SEC
  );

  // 记录最后登录时间(不阻塞响应)
  await repos.users
    .update(user.id, { lastLoginAt: new Date().toISOString() })
    .catch(() => undefined);

  await logger.info('用户认证', '用户登录', '用户登录成功', {
    userId: user.id,
    username: user.username,
    timestamp: new Date().toISOString()
  });

  const response = successResponse({
    message: '登录成功',
    mustChangePassword,
    token // 便于前端读取;真正携带靠 httpOnly cookie
  });

  response.cookies.set('token', token, {
    httpOnly: true,
    secure: cookieSecure(),
    sameSite: 'strict',
    path: '/',
    maxAge: TOKEN_TTL_SEC
  });

  return response;
}
