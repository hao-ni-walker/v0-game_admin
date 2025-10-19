// 与数据库 schema 对齐的领域模型类型定义
// 注意：这里是运行时数据模型（JSON 持久化），字段命名保持与原 schema 一致，便于无缝替换

export type ID = number;

export interface User {
  id: ID;
  email: string;
  username: string;
  password: string; // 已加密哈希
  avatar?: string | null;
  roleId: ID;
  isSuperAdmin?: boolean;
  status?: 'active' | 'disabled';
  lastLoginAt?: string | null; // ISO 字符串
  createdAt?: string; // ISO
  updatedAt?: string; // ISO
}

export interface Role {
  id: ID;
  name: string;
  isSuper?: boolean;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Permission {
  id: ID;
  name: string;
  code: string;
  description?: string | null;
  parentId?: ID | null;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface RolePermission {
  id: ID;
  roleId: ID;
  permissionId: ID;
  createdAt?: string;
}

export interface SystemLog {
  id: ID;
  level: 'info' | 'warn' | 'error' | 'debug';
  action: string;
  module: string;
  message: string;
  details?: unknown;
  userId?: ID | null;
  userAgent?: string | null;
  ip?: string | null;
  requestId?: string | null;
  duration?: number | null;
  createdAt?: string;
}

// 通用分页/查询类型
export interface PageQuery {
  page?: number; // 1-based
  limit?: number; // 默认 10
}

export interface PageResult<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}