import { apiRequest, buildSearchParams } from './base';
import {
  Admin,
  AdminDetail,
  AdminRole,
  AdminListResponse,
  AdminStatistics,
  AdminFilters,
  CreateAdminFormData,
  EditAdminFormData,
  StatusChangeData,
  PasswordResetFormData
} from '@/app/dashboard/admin/system/admins/types';

// 管理员管理相关 API
export class AdminAPI {
  /**
   * 获取管理员列表
   * GET /api/admin/admins
   */
  static async getAdmins(params?: {
    id?: number;
    username?: string;
    email?: string;
    status?: string;
    role_id?: number;
    is_super_admin?: boolean | '';
    created_at_start?: string;
    created_at_end?: string;
    last_login_start?: string;
    last_login_end?: string;
    page?: number;
    page_size?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }): Promise<{
    success: boolean;
    data?: AdminListResponse;
    message?: string;
  }> {
    const searchParams = buildSearchParams(params || {});
    return apiRequest(`/admin/admins${searchParams ? `?${searchParams}` : ''}`);
  }

  /**
   * 获取管理员详情
   * GET /api/admin/admins/{admin_id}
   */
  static async getAdmin(adminId: number): Promise<{
    success: boolean;
    data?: AdminDetail;
    message?: string;
  }> {
    return apiRequest(`/admin/admins/${adminId}`);
  }

  /**
   * 创建管理员
   * POST /api/admin/admins
   */
  static async createAdmin(
    data: CreateAdminFormData
  ): Promise<{ success: boolean; data?: Admin; message?: string }> {
    return apiRequest('/admin/admins', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  /**
   * 更新管理员基本信息
   * PATCH /api/admin/admins/{admin_id}
   */
  static async updateAdmin(
    adminId: number,
    data: EditAdminFormData
  ): Promise<{ success: boolean; data?: Admin; message?: string }> {
    return apiRequest(`/admin/admins/${adminId}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  /**
   * 修改管理员状态/锁定/解锁
   * PATCH /api/admin/admins/{admin_id}/status
   */
  static async updateAdminStatus(
    adminId: number,
    data: StatusChangeData
  ): Promise<{ success: boolean; data?: Admin; message?: string }> {
    return apiRequest(`/admin/admins/${adminId}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  /**
   * 重置/修改密码
   * PATCH /api/admin/admins/{admin_id}/password
   */
  static async updateAdminPassword(
    adminId: number,
    data: PasswordResetFormData
  ): Promise<{ success: boolean; message?: string }> {
    return apiRequest(`/admin/admins/${adminId}/password`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  /**
   * 删除管理员（逻辑删除/禁用）
   * DELETE /api/admin/admins/{admin_id}
   */
  static async deleteAdmin(
    adminId: number
  ): Promise<{ success: boolean; message?: string }> {
    return apiRequest(`/admin/admins/${adminId}`, {
      method: 'DELETE'
    });
  }

  /**
   * 获取角色列表
   * GET /api/admin/admin-roles
   */
  static async getAdminRoles(params?: {
    page?: number;
    page_size?: number;
  }): Promise<{
    success: boolean;
    data?: {
      items: AdminRole[];
      total: number;
      page: number;
      page_size: number;
    };
    message?: string;
  }> {
    const searchParams = buildSearchParams(params || {});
    return apiRequest(
      `/admin/admin-roles${searchParams ? `?${searchParams}` : ''}`
    );
  }

  /**
   * 获取角色详情（含权限）
   * GET /api/admin/admin-roles/{role_id}
   */
  static async getAdminRole(roleId: number): Promise<{
    success: boolean;
    data?: AdminRole;
    message?: string;
  }> {
    return apiRequest(`/admin/admin-roles/${roleId}`);
  }

  /**
   * 获取管理员统计信息
   * GET /api/admin/admins/statistics
   */
  static async getAdminStatistics(
    filters?: Partial<AdminFilters>
  ): Promise<{ success: boolean; data?: AdminStatistics; message?: string }> {
    const searchParams = buildSearchParams(filters || {});
    return apiRequest(
      `/admin/admins/statistics${searchParams ? `?${searchParams}` : ''}`
    );
  }
}
