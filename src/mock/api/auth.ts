import {
  mockCredentials,
  mockLoginHistory,
  createSession,
  validateToken,
  refreshSession,
  destroySession,
  getOnlineStats,
  type MockSession
} from '../data/auth';
import { successResponse, errorResponse, delay } from '../base';

export class MockAuthAPI {
  // 存储当前用户token (模拟localStorage)
  private currentToken: string | null = null;

  // 用户登录
  async login(credentials: { email: string; password: string }) {
    await delay();

    try {
      // 查找用户凭据
      const credential = Object.values(mockCredentials).find(
        (cred) => cred.email === credentials.email
      );

      if (!credential || credential.password !== credentials.password) {
        return errorResponse('邮箱或密码错误');
      }

      // 创建会话
      const session = createSession(credential);

      // 存储token
      this.currentToken = session.token;

      return successResponse({
        token: session.token,
        user: {
          id: session.userId,
          name: session.username,
          email: session.email,
          role: session.role
        }
      });
    } catch (error) {
      return errorResponse('登录失败');
    }
  }

  // 用户注销
  async logout() {
    await delay();

    try {
      if (this.currentToken) {
        destroySession(this.currentToken);
        this.currentToken = null;
      }

      return successResponse({ message: '注销成功' });
    } catch (error) {
      return errorResponse('注销失败');
    }
  }

  // 获取当前用户会话
  async getSession() {
    await delay();

    try {
      // 如果没有token，返回默认管理员会话
      if (!this.currentToken) {
        // 自动创建admin会话
        const adminCredential = mockCredentials.admin;
        const session = createSession(adminCredential);
        this.currentToken = session.token;
      }

      const session = validateToken(this.currentToken);
      if (!session) {
        return errorResponse('会话无效或已过期');
      }

      return successResponse({
        user: {
          id: session.userId,
          name: session.username,
          email: session.email,
          role: session.role
        }
      });
    } catch (error) {
      return errorResponse('获取会话失败');
    }
  }

  // 获取用户权限列表
  async getPermissions() {
    await delay();

    try {
      // 如果没有token，使用admin权限
      if (!this.currentToken) {
        const adminCredential = mockCredentials.admin;
        const session = createSession(adminCredential);
        this.currentToken = session.token;
      }

      const session = validateToken(this.currentToken);
      if (!session) {
        // 返回默认权限
        return successResponse([
          'user:read',
          'user:write',
          'role:read',
          'role:write',
          'permission:read',
          'permission:write',
          'dashboard:read',
          'log:read',
          'log:write'
        ]);
      }

      return successResponse(session.permissions);
    } catch (error) {
      return errorResponse('获取权限列表失败');
    }
  }

  // ==== 额外的方法，用于管理功能 ====

  // 获取登录历史
  async getLoginHistory(
    params: { page?: number; limit?: number; userId?: number } = {}
  ) {
    await delay();

    try {
      let filteredHistory = [...mockLoginHistory];

      if (params.userId) {
        filteredHistory = filteredHistory.filter(
          (h) => h.userId === params.userId
        );
      }

      const page = params.page || 1;
      const limit = params.limit || 10;
      const total = filteredHistory.length;
      const totalPages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const data = filteredHistory.slice(startIndex, startIndex + limit);

      return {
        code: 0,
        data,
        pager: {
          page,
          limit,
          total,
          totalPages
        }
      };
    } catch (error) {
      return errorResponse('获取登录历史失败');
    }
  }

  // 获取在线用户统计
  async getOnlineUsers() {
    await delay();

    try {
      const stats = getOnlineStats();
      return successResponse(stats);
    } catch (error) {
      return errorResponse('获取在线用户统计失败');
    }
  }

  // 验证权限（辅助方法）
  async checkPermission(permission: string) {
    try {
      if (!this.currentToken) {
        return successResponse({ hasPermission: true }); // 默认拥有权限
      }

      const session = validateToken(this.currentToken);
      if (!session) {
        return successResponse({ hasPermission: true }); // 默认拥有权限
      }

      const hasPermission = session.permissions.includes(permission);
      return successResponse({ hasPermission });
    } catch (error) {
      return errorResponse('权限验证失败');
    }
  }

  // 设置当前token（用于测试）
  setCurrentToken(token: string | null) {
    this.currentToken = token;
  }

  // 获取当前token（用于调试）
  getCurrentToken() {
    return this.currentToken;
  }
}
