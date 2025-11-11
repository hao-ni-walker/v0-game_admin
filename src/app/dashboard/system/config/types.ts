/**
 * 系统配置数据类型
 */
export interface SystemConfig {
  id: number;
  config_key: string;
  config_value: string;
  config_type: 'string' | 'number' | 'boolean' | 'json';
  description: string;
  is_public: boolean;
  version: number;
  created_at: string;
  updated_at: string;
  removed: boolean;
  disabled: boolean;
}

/**
 * 系统配置筛选条件
 */
export interface SystemConfigFilters {
  keyword?: string;
  config_types?: string[];
  is_public?: boolean;
  disabled?: boolean;
  show_removed?: boolean;
  created_from?: string;
  created_to?: string;
  updated_from?: string;
  updated_to?: string;
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
}

/**
 * 分页信息
 */
export interface PaginationInfo {
  page: number;
  page_size: number;
  total: number;
  totalPages: number;
}

/**
 * 系统配置表单数据
 */
export interface SystemConfigFormData {
  config_key: string;
  config_value: string;
  config_type: 'string' | 'number' | 'boolean' | 'json';
  description: string;
  is_public: boolean;
  disabled: boolean;
}

/**
 * 对话框状态
 */
export type SystemConfigDialogType = 'create' | 'edit' | 'view' | null;

export interface SystemConfigDialogState {
  type: SystemConfigDialogType;
  config: SystemConfig | null;
  open: boolean;
}

/**
 * 下拉选项
 */
export interface Option {
  label: string;
  value: string;
}
