import { mockPermissionAPI } from '@/mock';
import { isStaticDeployment, apiRequest, buildSearchParams } from './base';

// 权限相关 API
export class PermissionAPI {
  // 获取所有权限
  static async getAllPermissions() {
    if (isStaticDeployment) {
      return mockPermissionAPI.getAllPermissions();
    }
    return apiRequest('/permissions/all');
  }
  // 获取权限列表
  static async getPermissions(params: any = {}) {
    if (isStaticDeployment) {
      return mockPermissionAPI.getPermissions(params);
    }

    const queryString = buildSearchParams(params);
    return apiRequest(`/permissions?${queryString}`);
  }

  // 根据 ID 获取权限
  static async getPermissionById(id: number) {
    if (isStaticDeployment) {
      return mockPermissionAPI.getPermissionById(id);
    }
    return apiRequest(`/permissions/${id}`);
  }

  // 创建权限
  static async createPermission(permissionData: any) {
    if (isStaticDeployment) {
      return mockPermissionAPI.createPermission(permissionData);
    }
    return apiRequest('/permissions', {
      method: 'POST',
      body: JSON.stringify(permissionData)
    });
  }

  // 更新权限
  static async updatePermission(id: number, permissionData: any) {
    if (isStaticDeployment) {
      return mockPermissionAPI.updatePermission(id, permissionData);
    }
    return apiRequest(`/permissions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(permissionData)
    });
  }

  // 删除权限
  static async deletePermission(id: number) {
    if (isStaticDeployment) {
      return mockPermissionAPI.deletePermission(id);
    }
    return apiRequest(`/permissions/${id}`, {
      method: 'DELETE'
    });
  }

  // 获取权限树结构
  static async getPermissionTree() {
    if (isStaticDeployment) {
      return mockPermissionAPI.getPermissionTree();
    }
    return apiRequest('/permissions/tree');
  }

  // 根据父级ID获取子权限
  static async getPermissionsByParent(parentId: number | null) {
    if (isStaticDeployment) {
      return mockPermissionAPI.getPermissionsByParent(parentId);
    }
    return apiRequest(`/permissions/children?parentId=${parentId}`);
  }
}
