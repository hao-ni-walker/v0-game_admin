export const PERIODS = ['30s', '1m', '3m', '5m', '10m'] as const;
export type Period = (typeof PERIODS)[number];

export const PERIOD_LABELS: Record<Period, string> = {
  '30s': '30 秒',
  '1m': '1 分钟',
  '3m': '3 分钟',
  '5m': '5 分钟',
  '10m': '10 分钟',
};

export const MESSAGES = {
  SUCCESS: {
    BASE_UPDATE: '基础收益率已更新',
    WINDOW_CREATE: '窗口收益率已添加',
    WINDOW_DELETE: '窗口收益率已删除',
    BATCH_UPDATE: (success: number, total: number, period: string) =>
      `已批量更新 ${success}/${total} 个币种的 ${PERIOD_LABELS[period as Period] ?? period} 基础收益率`,
  },
  ERROR: {
    FETCH: '获取收益率失败',
    BASE_UPDATE: '更新基础收益率失败',
    WINDOW_CREATE: '添加窗口收益率失败',
    WINDOW_DELETE: '删除窗口收益率失败',
    BATCH_UPDATE: '批量更新基础收益率失败',
  },
  EMPTY: '请先在币种管理添加币种',
};
