import { mockUserAPI } from '@/mock';
import { isStaticDeployment, apiRequest, buildSearchParams } from './base';

// 用户相关 API
export class UserAPI {
  // 获取用户列表
  static async getUsers(params: any = {}) {
    if (isStaticDeployment) {
      return mockUserAPI.getUsers(params);
    }

    const queryString = buildSearchParams(params);
    return apiRequest(`/users?${queryString}`);
  }

  // 根据 ID 获取用户
  static async getUserById(id: number) {
    if (isStaticDeployment) {
      return mockUserAPI.getUserById(id);
    }
    return apiRequest(`/users/${id}`);
  }

  // 创建用户
  static async createUser(userData: any) {
    if (isStaticDeployment) {
      return mockUserAPI.createUser(userData);
    }
    return apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  // 更新用户
  static async updateUser(id: number, userData: any) {
    if (isStaticDeployment) {
      return mockUserAPI.updateUser(id, userData);
    }
    return apiRequest(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  }

  // 删除用户
  static async deleteUser(id: number) {
    if (isStaticDeployment) {
      return mockUserAPI.deleteUser(id);
    }
    return apiRequest(`/users/${id}`, {
      method: 'DELETE'
    });
  }
}
