import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getRepositories } from '@/repository';
import { signAdminToken, verifyAdminToken } from '@/lib/jwt';
import { logger } from '@/lib/logger';

const SALT_ROUNDS = Number(process.env.SALT_ROUNDS ?? 12);
const MIN_PASSWORD_LEN = 12;
const TOKEN_TTL_SEC = Number(process.env.JWT_TTL_SEC ?? 60 * 60 * 8);

// .env.example 里的默认口令与常见弱口令一律禁止。
const FORBIDDEN_PASSWORDS = new Set([
  'Admin@123456',
  'admin@123456',
  'Administrator@123456',
  '12345678',
  'password',
  'password123',
  'admin123',
  'qwerty123'
]);

function readToken(request: Request): string | null {
  return request.headers.get('cookie')?.match(/token=([^;]+)/)?.[1] ?? null;
}

function reject(status: number, message: string) {
  return NextResponse.json({ code: status, message }, { status });
}

/**
 * 强制改密。读 token(即使 mustChangePassword=true 也放行,中间件对本端点豁免),
 * 校验旧口令,拒绝弱口令/默认口令,成功后重签 token(mustChangePassword=false)。
 */
export async function POST(request: Request) {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    return reject(500, '服务端未正确配置 JWT_SECRET');
  }

  const token = readToken(request);
  const payload = token ? await verifyAdminToken(token, secret) : null;
  if (!payload) {
    return reject(401, '未登录或会话已过期');
  }

  const body = await request.json().catch(() => ({}));
  const { oldPassword, newPassword } = body as {
    oldPassword?: string;
    newPassword?: string;
  };
  if (!oldPassword || !newPassword) {
    return reject(400, '请填写旧密码与新密码');
  }

  if (newPassword.length < MIN_PASSWORD_LEN) {
    return reject(400, `新密码至少 ${MIN_PASSWORD_LEN} 位`);
  }
  if (FORBIDDEN_PASSWORDS.has(newPassword)) {
    return reject(400, '不能使用默认或常见弱口令');
  }
  if (oldPassword === newPassword) {
    return reject(400, '新密码不能与旧密码相同');
  }

  const repos = await getRepositories();
  const user = await repos.users.getById(payload.sub);
  if (!user) {
    return reject(404, '用户不存在');
  }

  const ok = await bcrypt.compare(oldPassword, user.password);
  if (!ok) {
    return reject(401, '旧密码错误');
  }

  const hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await repos.users.update(user.id, {
    password: hash,
    mustChangePassword: false
  });

  await logger.info('用户认证', '修改密码', '管理员修改密码成功', {
    userId: user.id,
    username: user.username,
    timestamp: new Date().toISOString()
  });

  // 重签 token:从此刻起不再强制改密。
  const fresh = await signAdminToken(
    {
      sub: user.id,
      username: user.username,
      roleId: Number(user.roleId),
      mustChangePassword: false
    },
    secret,
    TOKEN_TTL_SEC
  );

  const response = NextResponse.json({
    code: 0,
    data: { message: '改密成功' }
  });
  response.cookies.set('token', fresh, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: TOKEN_TTL_SEC
  });
  return response;
}
