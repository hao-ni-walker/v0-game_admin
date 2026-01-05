import type { DateRange } from 'react-day-picker';

/**
 * 储值分布范围项接口
 */
export interface DepositRange {
  range_label: string;
  min_amount: string | null;
  max_amount: string | null;
  order_count: number;
}

/**
 * 储值分布筛选条件
 */
export interface DepositDistributionFilters {
  start_date?: string; // ISO 日期字符串
  end_date?: string; // ISO 日期字符串
  dateRange?: DateRange | undefined;
}

/**
 * API 响应数据
 */
export interface DepositDistributionResponse {
  start_date: string;
  end_date: string;
  ranges: DepositRange[];
  total_orders: number;
}
