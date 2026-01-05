import type { GameFlowFilters, PaginationInfo } from './types';

/**
 * 默认筛选条件
 */
export const DEFAULT_FILTERS: GameFlowFilters = {
  bet_time_start: undefined,
  bet_time_end: undefined,
  game_id: undefined,
  platform_id: undefined,
  dateRange: undefined,
  page: 1,
  page_size: 10,
  sort_by: undefined,
  sort_order: undefined
};

/**
 * 默认分页信息
 */
export const DEFAULT_PAGINATION: PaginationInfo = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0
};

/**
 * 每页显示选项
 */
export const PAGE_SIZE_OPTIONS = [10, 20, 30, 50, 100];

/**
 * 消息提示
 */
export const MESSAGES = {
  SUCCESS: {
    FETCH_FLOWS: '获取游戏流水成功',
    REFRESH: '刷新成功'
  },
  ERROR: {
    FETCH_FLOWS: '获取游戏流水失败',
    FETCH_GAMES: '获取游戏列表失败',
    FETCH_PLATFORMS: '获取平台列表失败'
  }
};
