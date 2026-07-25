import { cookies } from 'next/headers';
import { verifyAdminToken } from '@/lib/jwt';

export interface User {
  id: number;
  email: string;
  username: string;
  avatar: string;
  roleId: string;
}

export interface Session {
  user: User;
}

/**
 * 从环境变量读取 JWT 密钥。缺密钥属于配置错误,应显式失败而非静默放行。
 */
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must be configured (>= 32 chars)');
  }
  return secret;
}

/**
 * 服务端认证函数 - 只能在服务端组件中使用。
 * 用 HS256 验签;签名无效/过期/alg=none 一律视为未登录。
 */
export async function auth(): Promise<Session | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  if (!token || !token.value) {
    return null;
  }

  const payload = await verifyAdminToken(token.value, getJwtSecret());
  if (!payload) {
    return null;
  }

  return {
    user: {
      id: payload.sub,
      username: payload.username,
      roleId: String(payload.roleId),
      email: '',
      avatar: ''
    }
  };
}

/**
 * 验证 token 的工具函数 - 可以在任何地方使用。
 * 注意:现在用 HS256 验签(之前模板直接 base64 解析 payload,可被伪造)。
 */
export async function verifyToken(token: string): Promise<User | null> {
  const payload = await verifyAdminToken(token, getJwtSecret());
  if (!payload) {
    return null;
  }

  return {
    id: payload.sub,
    username: payload.username,
    roleId: String(payload.roleId),
    email: payload.username || '',
    avatar: ''
  };
}

/**
 * 从 Request 中获取当前用户信息 - 用于 API routes。
 */
export async function getCurrentUser(request: Request): Promise<User | null> {
  try {
    const token = request.headers.get('cookie')?.match(/token=([^;]+)/)?.[1];
    if (!token) {
      return null;
    }
    return await verifyToken(token);
  } catch {
    return null;
  }
}
