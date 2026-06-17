export const PERIODS = ['1m', '3m', '5m', '10m'] as const;
export type Period = (typeof PERIODS)[number];

export const PERIOD_LABELS: Record<Period, string> = {
  '1m': '1 分钟',
  '3m': '3 分钟',
  '5m': '5 分钟',
  '10m': '10 分钟',
};

export const MESSAGES = {
  SUCCESS: {
    BASE_UPDATE: '基础赔率已更新',
    WINDOW_CREATE: '窗口赔率已添加',
    WINDOW_DELETE: '窗口赔率已删除',
  },
  ERROR: {
    FETCH: '获取赔率失败',
    BASE_UPDATE: '更新基础赔率失败',
    WINDOW_CREATE: '添加窗口赔率失败',
    WINDOW_DELETE: '删除窗口赔率失败',
  },
  EMPTY: '请先在币种管理添加币种',
};
