import type { DateRange } from 'react-day-picker';

/**
 * 留存数据项接口
 */
export interface RetentionData {
  retention_count: number;
  retention_rate: number;
  deposit_count: number;
  deposit_rate: number;
}

/**
 * 用户留存项接口
 */
export interface UserRetentionItem {
  stat_date: string;
  register_count: number;
  deposit_count: number;
  day1_retention: RetentionData;
  day3_retention: RetentionData;
  day5_retention: RetentionData;
  day7_retention: RetentionData;
  day15_retention: RetentionData;
  day30_retention: RetentionData;
}

/**
 * 用户留存筛选条件
 */
export interface UserRetentionFilters {
  start_date?: string; // ISO 日期字符串
  end_date?: string; // ISO 日期字符串
  dateRange?: DateRange | undefined;
  page?: number;
  page_size?: number;
}

/**
 * 分页信息
 */
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * API 响应数据
 */
export interface UserRetentionResponse {
  items: UserRetentionItem[];
  total: number;
  start_date?: string;
  end_date?: string;
}
