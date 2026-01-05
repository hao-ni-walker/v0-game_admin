import type { UserRetentionFilters, PaginationInfo } from './types';

/**
 * 默认筛选条件
 */
export const DEFAULT_FILTERS: UserRetentionFilters = {
  start_date: undefined,
  end_date: undefined,
  dateRange: undefined,
  page: 1,
  page_size: 20
};

/**
 * 默认分页信息
 */
export const DEFAULT_PAGINATION: PaginationInfo = {
  page: 1,
  limit: 20,
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
    FETCH_RETENTION: '获取用户留存数据成功',
    REFRESH: '刷新成功'
  },
  ERROR: {
    FETCH_RETENTION: '获取用户留存数据失败'
  }
};
