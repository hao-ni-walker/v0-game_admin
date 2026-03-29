/**
 * 轮播图数据类型
 */
export interface Banner {
  id: number;
  title?: string;
  image_url: string;
  link_url?: string;
  target: '_self' | '_blank';
  position: string;
  page?: string;
  sort_order: number;
  start_time?: string;
  end_time?: string;
  status: 0 | 1;
  status_text?: string;
  version: number;
  created_at: string;
  updated_at: string;
  removed: boolean;
  disabled: boolean;
}

/**
 * 轮播图筛选条件
 */
export interface BannerFilters {
  keyword?: string;
  positions?: string[];
  status?: 0 | 1 | 'all';
  disabled?: boolean;
  show_removed?: boolean;
  active_only?: boolean;
  desired_from?: string;
  desired_to?: string;
  start_from?: string;
  start_to?: string;
  end_from?: string;
  end_to?: string;
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
 * 轮播图表单数据
 */
export interface BannerFormData {
  title?: string;
  image_url: string;
  link_url?: string;
  target: '_self' | '_blank';
  page?: string;
  position: string;
  sort_order: number;
  start_time?: string;
  end_time?: string;
  status: 0 | 1;
  disabled: boolean;
}

/**
 * 对话框状态
 */
export type BannerDialogType = 'create' | 'edit' | 'view' | null;

export interface BannerDialogState {
  type: BannerDialogType;
  banner: Banner | null;
  open: boolean;
}

/**
 * 下拉选项
 */
export interface Option {
  label: string;
  value: string;
}
