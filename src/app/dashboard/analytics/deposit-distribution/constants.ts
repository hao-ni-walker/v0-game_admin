import type { DepositDistributionFilters } from './types';

/**
 * 默认筛选条件
 */
export const DEFAULT_FILTERS: DepositDistributionFilters = {
  start_date: undefined,
  end_date: undefined,
  dateRange: undefined
};

/**
 * 消息提示
 */
export const MESSAGES = {
  SUCCESS: {
    FETCH_DISTRIBUTION: '获取储值分布数据成功',
    REFRESH: '刷新成功'
  },
  ERROR: {
    FETCH_DISTRIBUTION: '获取储值分布数据失败'
  }
};
