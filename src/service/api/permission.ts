import { apiRequest, buildSearchParams } from './base';

// 权限列表查询参数
export interface PermissionListParams {
  name?: string;
  code?: string;
  parent_id?: number | null;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
}

// 权限表单数据
export interface PermissionFormData {
  name: string;
  code: string;
  description?: string;
  parent_id?: number | null;
  sort_order: number;
}

// 权限相关 API
export class PermissionAPI {
  // 获取权限列表（支持筛选、分页、排序）
  static async getPermissions(params?: PermissionListParams) {
    const searchParams = buildSearchParams(params || {});
    return apiRequest(`/permissions${searchParams ? `?${searchParams}` : ''}`);
  }

  // 获取权限树结构
  static async getPermissionTree() {
    return apiRequest('/permissions/tree');
  }

  // 获取权限详情
  static async getPermission(id: number) {
    return apiRequest(`/permissions/${id}`);
  }

  // 创建权限
  static async createPermission(permissionData: PermissionFormData) {
    return apiRequest('/permissions', {
      method: 'POST',
      body: JSON.stringify(permissionData)
    });
  }

  // 更新权限
  static async updatePermission(
    id: number,
    permissionData: PermissionFormData
  ) {
    return apiRequest(`/permissions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(permissionData)
    });
  }

  // 删除单个权限
  static async deletePermission(id: number) {
    return apiRequest(`/permissions/${id}`, {
      method: 'DELETE'
    });
  }

  // 批量删除权限
  static async batchDeletePermissions(ids: number[]) {
    return apiRequest('/permissions', {
      method: 'DELETE',
      body: JSON.stringify({ ids })
    });
  }

  // 获取权限子节点
  static async getPermissionChildren(parentId: number) {
    return apiRequest(`/permissions/${parentId}/children`);
  }

  // 获取所有权限（用于下拉选择）
  static async getAllPermissions() {
    return apiRequest('/permissions/all');
  }
}
