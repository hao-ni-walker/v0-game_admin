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
  /** 业务分类（映射为 config_keys 精确键集下发） */
  category?: string;
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
 * 更新配置请求体（整值写入 + 版本乐观锁）
 */
export interface SystemConfigUpdatePayload {
  config_value?: string;
  description?: string;
  disabled?: boolean;
  version: number;
  reason?: string;
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
 * 对话框状态
 */
export type SystemConfigDialogType = 'edit' | null;

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
