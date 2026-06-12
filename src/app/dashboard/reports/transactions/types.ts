import type { DateRange } from 'react-day-picker';

/**
 * 游戏流水项接口
 */
export interface GameFlowItem {
  bet_date: string;
  game_id: number;
  game_name: string;
  platform_id: number;
  platform_name: string;
  total_bet_amount: string;
  total_win_amount: string;
  profit_loss: string;
  rtp_rate: string;
}

/**
 * 游戏流水筛选条件
 */
export interface GameFlowFilters {
  bet_time_start?: string; // ISO 日期字符串
  bet_time_end?: string; // ISO 日期字符串
  game_id?: number;
  platform_id?: number;
  dateRange?: DateRange | undefined;
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
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
 * 游戏选项
 */
export interface GameOption {
  id: number;
  name: string;
}

/**
 * 平台选项
 */
export interface PlatformOption {
  id: number;
  name: string;
}
