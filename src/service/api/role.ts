import { mockRoleAPI } from '@/mock';
import { isStaticDeployment, apiRequest, buildSearchParams } from './base';

// 角色相关 API
export class RoleAPI {
  // 获取角色列表
  static async getRoles(params: any = {}) {
    if (isStaticDeployment) {
      return mockRoleAPI.getRoles(params);
    }

    const queryString = buildSearchParams(params);
    return apiRequest(`/roles?${queryString}`);
  }

  // 获取角色的权限列表
  static async getRolePermissions(roleId: number) {
    if (isStaticDeployment) {
      return mockRoleAPI.getRolePermissions(roleId);
    }
    return apiRequest(`/roles/${roleId}/permissions`);
  }

  // 更新角色的权限列表
  static async updateRolePermissions(roleId: number, permissionIds: number[]) {
    if (isStaticDeployment) {
      return mockRoleAPI.updateRolePermissions(roleId, permissionIds);
    }
    return apiRequest(`/roles/${roleId}/permissions`, {
      method: 'PUT',
      body: JSON.stringify({ permissionIds })
    });
  }

  // 获取角色标签列表（用于下拉选择）
  static async getRoleLabels() {
    if (isStaticDeployment) {
      return mockRoleAPI.getRoleLabels();
    }
    return apiRequest('/roles/label');
  }

  // 根据 ID 获取角色
  static async getRoleById(id: number) {
    if (isStaticDeployment) {
      return mockRoleAPI.getRoleById(id);
    }
    return apiRequest(`/roles/${id}`);
  }

  // 创建角色
  static async createRole(roleData: any) {
    if (isStaticDeployment) {
      return mockRoleAPI.createRole(roleData);
    }
    return apiRequest('/roles', {
      method: 'POST',
      body: JSON.stringify(roleData)
    });
  }

  // 更新角色
  static async updateRole(id: number, roleData: any) {
    if (isStaticDeployment) {
      return mockRoleAPI.updateRole(id, roleData);
    }
    return apiRequest(`/roles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(roleData)
    });
  }

  // 删除角色
  static async deleteRole(id: number) {
    if (isStaticDeployment) {
      return mockRoleAPI.deleteRole(id);
    }
    return apiRequest(`/roles/${id}`, {
      method: 'DELETE'
    });
  }
}
