import type { OperationReportFilters } from './types';

function getLast30DaysRange() {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - 30);
  return { start, end };
}

/**
 * 默认筛选条件
 */
export const DEFAULT_FILTERS: OperationReportFilters = {
  start_date: formatDate(getLast30DaysRange().start),
  end_date: formatDate(getLast30DaysRange().end),
  dateRange: {
    from: getLast30DaysRange().start,
    to: getLast30DaysRange().end
  }
};

function formatDate(date: Date) {
  return date.toISOString().split('T')[0];
}

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
