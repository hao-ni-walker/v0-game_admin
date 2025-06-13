import { mockAuthAPI } from '@/mock';
import { isStaticDeployment, apiRequest } from './base';

// 认证相关 API
export class AuthAPI {
  // 用户登录
  static async login(credentials: { email: string; password: string }) {
    if (isStaticDeployment) {
      return mockAuthAPI.login(credentials);
    }
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }

  // 用户退出
  static async logout() {
    if (isStaticDeployment) {
      return mockAuthAPI.logout();
    }
    return apiRequest('/auth/logout', {
      method: 'POST'
    });
  }

  // 获取当前用户会话
  static async getSession() {
    if (isStaticDeployment) {
      return mockAuthAPI.getSession();
    }
    return apiRequest('/auth/session');
  }

  // 获取用户权限
  static async getPermissions() {
    if (isStaticDeployment) {
      return mockAuthAPI.getPermissions();
    }
    return apiRequest('/auth/permissions');
  }
}
