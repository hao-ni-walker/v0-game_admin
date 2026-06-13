import { cookies } from 'next/headers';

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

function parseTokenPayload(token: string): Record<string, any> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    return JSON.parse(Buffer.from(parts[1], 'base64').toString()) as Record<
      string,
      any
    >;
  } catch {
    return null;
  }
}

function parseUserId(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value !== 'string' || !value) {
    return null;
  }

  const normalized = value.startsWith('admin:') ? value.slice(6) : value;
  const parsed = Number.parseInt(normalized, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

/**
 * 服务端认证函数 - 只能在服务端组件中使用
 */
export async function auth(): Promise<Session | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  if (!token || !token.value) {
    return null;
  }

  try {
    const payload = parseTokenPayload(token.value);
    if (!payload) {
      return null;
    }

    // 检查 token 是否过期
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null;
    }

    // 支持远程 API 的 token 结构（sub=admin:1, role, permissions）和本地结构
    const userId = parseUserId(payload.id || payload.sub || payload.userId);
    const username = payload.username || payload.name || '';
    const email = payload.email || '';
    const avatar = payload.avatar || '';
    const roleId =
      payload.role || payload.roleId || payload.role_id || payload.type || '';

    if (!userId) {
      return null;
    }

    return {
      user: {
        id: userId,
        email: email || username || '',
        username: username || email || '用户',
        avatar: avatar || '/avatars/default.jpg',
        roleId: String(roleId)
      }
    };
  } catch (error) {
    // 解析失败，返回 null
    return null;
  }
}

/**
 * 验证token的工具函数 - 可以在任何地方使用
 * 注意：不验证签名，因为远程 API 的 token 可能使用不同的 secret
 */
export function verifyToken(token: string): User | null {
  try {
    const payload = parseTokenPayload(token);
    if (!payload) {
      return null;
    }

    // 检查 token 是否过期
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null;
    }

    const userId = parseUserId(payload.id || payload.sub || payload.userId);
    const username = payload.username || payload.name || '';
    const email = payload.email || '';
    const avatar = payload.avatar || '';
    const roleId =
      payload.role || payload.roleId || payload.role_id || payload.type || '';

    if (!userId) {
      return null;
    }

    return {
      id: userId,
      email: email || username || '',
      username: username || email || '用户',
      avatar: avatar || '/avatars/default.jpg',
      roleId: String(roleId)
    };
  } catch (error) {
    // 解析失败，返回 null
    console.error('verifyToken error:', error);
    return null;
  }
}

/**
 * 从Request中获取当前用户信息 - 用于API routes
 */
export function getCurrentUser(request: Request): User | null {
  try {
    const token = request.headers.get('cookie')?.match(/token=([^;]+)/)?.[1];
    if (!token) {
      return null;
    }
    return verifyToken(token);
  } catch {
    return null;
  }
}
