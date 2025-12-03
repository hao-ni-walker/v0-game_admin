// 管理员管理相关类型定义

// 管理员状态枚举
export type AdminStatus = 'active' | 'disabled' | 'locked';

// 管理员基本信息
export interface Admin {
  id: number;
  email: string;
  username: string;
  avatar?: string;
  role_id: number;
  role_name: string;
  is_super_admin: boolean;
  status: AdminStatus;
  last_login_at?: string;
  login_error_count: number;
  lock_time?: string;
  created_at: string;
  updated_at: string;
}

// 管理员详情（包含角色和权限信息）
export interface AdminDetail extends Admin {
  role?: AdminRole;
  permissions?: Permission[];
}

// 管理员角色
export interface AdminRole {
  id: number;
  name: string;
  is_super: boolean;
  description?: string;
  created_at: string;
  updated_at: string;
}

// 权限信息
export interface Permission {
  code: string;
  name: string;
  module?: string;
}

// 筛选条件
export interface AdminFilters {
  // 管理员基本信息
  id?: number;
  username?: string;
  email?: string;
  // 状态
  status?: AdminStatus | '';
  // 角色
  role_id?: number;
  // 超管标识
  is_super_admin?: boolean | '';
  // 时间范围
  created_at_start?: string;
  created_at_end?: string;
  last_login_start?: string;
  last_login_end?: string;
}

// 分页信息
export interface PaginationInfo {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

// 排序信息
export interface SortInfo {
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// 管理员列表响应
export interface AdminListResponse {
  items: Admin[];
  total: number;
  page: number;
  page_size: number;
}

// 统计信息
export interface AdminStatistics {
  total_admins: number;
  active_admins: number;
  disabled_admins: number;
  locked_admins: number;
  super_admins: number;
}

// 创建管理员表单数据
export interface CreateAdminFormData {
  email: string;
  username: string;
  password: string;
  role_id: number;
  avatar?: string;
  is_super_admin?: boolean;
}

// 编辑管理员表单数据
export interface EditAdminFormData {
  email?: string;
  username?: string;
  avatar?: string;
  role_id?: number;
  is_super_admin?: boolean;
}

// 状态变更数据
export interface StatusChangeData {
  status?: AdminStatus;
  lock_action?: 'lock' | 'unlock';
  lock_until?: string;
}

// 密码重置表单数据
export interface PasswordResetFormData {
  new_password: string;
  require_logout?: boolean;
}

