export interface Permission {
  id: number;
  name: string;
  code: string;
  description?: string;
  parent_id?: number | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  children?: Permission[]; // 用于树形结构展示（可选）
  // 兼容旧字段名（用于向后兼容）
  parentId?: number | null;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PermissionFilters {
  name?: string;
  code?: string;
  parent_id?: number | null;
  dateRange?: { from: Date; to: Date } | undefined;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PermissionFormData {
  name: string;
  code: string;
  description?: string;
  parent_id?: number | null;
  sort_order: number;
}

export interface PermissionManagementState {
  permissions: Permission[];
  loading: boolean;
  pagination: PaginationInfo;
  filters: PermissionFilters;
}

export interface PermissionManagementActions {
  fetchPermissions: (filters: PermissionFilters) => Promise<void>;
  createPermission: (data: PermissionFormData) => Promise<boolean>;
  updatePermission: (id: number, data: PermissionFormData) => Promise<boolean>;
  deletePermission: (id: number) => Promise<boolean>;
  batchDeletePermissions: (ids: number[]) => Promise<boolean>;
  updateFilters: (newFilters: Partial<PermissionFilters>) => void;
  clearFilters: () => void;
}

export type PermissionDialogType = 'create' | 'edit' | null;

export interface PermissionDialogState {
  type: PermissionDialogType;
  permission: Permission | null;
  open: boolean;
}
