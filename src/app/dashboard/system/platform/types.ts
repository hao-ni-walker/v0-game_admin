/**
 * 平台数据类型
 */
export interface Platform {
  id: number;
  name: string;
  description: string;
  enabled: boolean;
  pre_url: string | null;
}

/**
 * 平台筛选条件
 */
export interface PlatformFilters {
  keyword?: string;
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
