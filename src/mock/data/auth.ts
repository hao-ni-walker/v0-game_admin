import { faker } from '@faker-js/faker';

// 用户会话接口
export interface MockSession {
  id: string;
  userId: number;
  username: string;
  email: string;
  role: string;
  permissions: string[];
  token: string;
  refreshToken: string;
  loginAt: string;
  expiresAt: string;
  ip: string;
  userAgent: string;
}

// 登录历史接口
export interface MockLoginHistory {
  id: number;
  userId: number;
  username: string;
  ip: string;
  userAgent: string;
  location?: string;
  status: 'success' | 'failed';
  reason?: string;
  loginAt: string;
}

// 模拟用户凭据
export const mockCredentials = {
  admin: {
    username: 'admin',
    email: 'admin@example.com',
    password: '123456',
    userId: 1,
    role: 'admin',
    permissions: [
      'user:read',
      'user:write',
      'role:read',
      'role:write',
      'permission:read',
      'permission:write',
      'dashboard:read',
      'log:read',
      'log:write'
    ]
  },
  editor: {
    username: 'editor',
    email: 'editor@example.com',
    password: '123456',
    userId: 2,
    role: 'editor',
    permissions: [
      'user:read',
      'user:write',
      'role:read',
      'permission:read',
      'dashboard:read'
    ]
  },
  user: {
    username: 'user',
    email: 'user@example.com',
    password: '123456',
    userId: 3,
    role: 'user',
    permissions: ['user:read', 'dashboard:read']
  }
};

// 当前活跃会话存储
export const activeSessions = new Map<string, MockSession>();

// 生成 JWT Token
export function generateToken(userId: number): string {
  return `mock-jwt-token-${userId}-${Date.now()}-${faker.string.alphanumeric(16)}`;
}

// 生成刷新 Token
export function generateRefreshToken(userId: number): string {
  return `mock-refresh-token-${userId}-${Date.now()}-${faker.string.alphanumeric(24)}`;
}

// 创建用户会话
export function createSession(
  credential: (typeof mockCredentials)[keyof typeof mockCredentials],
  ip: string = '127.0.0.1',
  userAgent: string = 'Mock Browser'
): MockSession {
  const sessionId = faker.string.uuid();
  const token = generateToken(credential.userId);
  const refreshToken = generateRefreshToken(credential.userId);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24小时后过期

  const session: MockSession = {
    id: sessionId,
    userId: credential.userId,
    username: credential.username,
    email: credential.email,
    role: credential.role,
    permissions: credential.permissions,
    token,
    refreshToken,
    loginAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    ip,
    userAgent
  };

  activeSessions.set(token, session);
  return session;
}

// 验证 Token
export function validateToken(token: string): MockSession | null {
  const session = activeSessions.get(token);
  if (!session) return null;

  // 检查是否过期
  if (new Date() > new Date(session.expiresAt)) {
    activeSessions.delete(token);
    return null;
  }

  return session;
}

// 刷新 Token
export function refreshSession(refreshToken: string): MockSession | null {
  // 查找对应的会话
  for (const [token, session] of activeSessions.entries()) {
    if (session.refreshToken === refreshToken) {
      // 生成新的 tokens
      const newToken = generateToken(session.userId);
      const newRefreshToken = generateRefreshToken(session.userId);
      const newExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      // 删除旧会话
      activeSessions.delete(token);

      // 创建新会话
      const newSession: MockSession = {
        ...session,
        token: newToken,
        refreshToken: newRefreshToken,
        expiresAt: newExpiresAt.toISOString()
      };

      activeSessions.set(newToken, newSession);
      return newSession;
    }
  }

  return null;
}

// 注销会话
export function destroySession(token: string): boolean {
  return activeSessions.delete(token);
}

// 生成登录历史数据
export function generateLoginHistory(count: number = 50): MockLoginHistory[] {
  return Array.from({ length: count }, (_, index) => {
    const isSuccess = faker.datatype.boolean({ probability: 0.8 });
    const userId = faker.number.int({ min: 1, max: 50 });

    return {
      id: index + 1,
      userId,
      username: faker.person.fullName(),
      ip: faker.internet.ip(),
      userAgent: faker.internet.userAgent(),
      location: faker.location.city(),
      status: isSuccess ? 'success' : 'failed',
      reason: isSuccess
        ? undefined
        : faker.helpers.arrayElement([
            '密码错误',
            '用户不存在',
            '账户被锁定',
            '验证码错误',
            'IP被限制'
          ]),
      loginAt: faker.date.past({ years: 1 }).toISOString()
    };
  });
}

// Mock 登录历史
export const mockLoginHistory = generateLoginHistory();

// 权限检查
export function hasPermission(
  session: MockSession,
  permission: string
): boolean {
  return session.permissions.includes(permission);
}

// 角色检查
export function hasRole(session: MockSession, role: string): boolean {
  return session.role === role;
}

// 获取在线用户统计
export function getOnlineStats() {
  const sessions = Array.from(activeSessions.values());
  const now = new Date();

  // 过滤掉已过期的会话
  const validSessions = sessions.filter(
    (session) => new Date(session.expiresAt) > now
  );

  // 按角色统计
  const roleStats = validSessions.reduce(
    (acc, session) => {
      acc[session.role] = (acc[session.role] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return {
    total: validSessions.length,
    roles: roleStats,
    sessions: validSessions.map((session) => ({
      id: session.id,
      username: session.username,
      role: session.role,
      loginAt: session.loginAt,
      ip: session.ip
    }))
  };
}
