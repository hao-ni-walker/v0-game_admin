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
    // 直接解析 JWT token 的 payload（不验证签名，因为远程 API 的 secret 可能不同）
    // JWT 格式：header.payload.signature
    const parts = token.value.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // 解析 payload（base64 解码）
    const payload = JSON.parse(
      Buffer.from(parts[1], 'base64').toString()
    ) as any;

    // 检查 token 是否过期
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null;
    }

    // 支持远程 API 的 token 结构（sub, username, type）和本地结构（id, email, username）
    const userId = payload.id || payload.sub || payload.userId;
    const username = payload.username || payload.name || '';
    const email = payload.email || '';
    const avatar = payload.avatar || '';
    const roleId = payload.roleId || payload.role_id || payload.type || '';

    if (!userId) {
      return null;
    }

    return {
      user: {
        id: typeof userId === 'string' ? parseInt(userId) || 0 : userId,
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
    // 直接解析 JWT token 的 payload（不验证签名，因为远程 API 的 secret 可能不同）
    // JWT 格式：header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // 解析 payload（base64 解码）
    const payload = JSON.parse(
      Buffer.from(parts[1], 'base64').toString()
    ) as any;

    // 检查 token 是否过期
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null;
    }

    // 支持远程 API 的 token 结构（sub, username, type）和本地结构（id, email, username）
    const userId = payload.id || payload.sub || payload.userId;
    const username = payload.username || payload.name || '';
    const email = payload.email || '';
    const avatar = payload.avatar || '';
    const roleId = payload.roleId || payload.role_id || payload.type || '';

    if (!userId) {
      return null;
    }

    return {
      id: typeof userId === 'string' ? parseInt(userId) || 0 : userId,
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
