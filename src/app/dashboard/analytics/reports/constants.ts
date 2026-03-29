import type { OperationReportFilters } from './types';

/**
 * 默认筛选条件
 */
export const DEFAULT_FILTERS: OperationReportFilters = {
  start_date: undefined,
  end_date: undefined,
  dateRange: undefined
};

/**
 * 消息提示
 */
export const MESSAGES = {
  SUCCESS: {
    FETCH_REPORTS: '获取运营报表成功',
    REFRESH: '刷新成功'
  },
  ERROR: {
    FETCH_REPORTS: '获取运营报表失败'
  }
};
