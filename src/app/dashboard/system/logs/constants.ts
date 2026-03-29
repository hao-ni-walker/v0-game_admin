import type {
  LogFilters,
  PaginationInfo,
  UserOperationLogFilters
} from './types';

/**
 * 默认分页配置
 */
export const DEFAULT_PAGINATION: PaginationInfo = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0
};

/**
 * 分页大小选项
 */
export const PAGE_SIZE_OPTIONS = [20, 50, 100, 200];

/**
 * 默认筛选条件
 */
export const DEFAULT_FILTERS: LogFilters = {
  level: 'all',
  module: '',
  action: '',
  search: '',
  dateRange: undefined,
  page: 1,
  limit: 20
};

/**
 * 默认用户操作日志筛选条件
 */
export const DEFAULT_OPERATION_LOG_FILTERS: UserOperationLogFilters = {
  keyword: '',
  userIds: undefined,
  usernames: undefined,
  operations: undefined,
  tables: undefined,
  objectId: '',
  ipAddress: '',
  hasDiff: undefined,
  from: undefined,
  to: undefined,
  sortBy: 'operationAt',
  sortDir: 'desc',
  page: 1,
  pageSize: 20
};

/**
 * 日志级别选项
 */
export const LOG_LEVEL_OPTIONS = [
  { label: '全部级别', value: 'all' },
  { label: '信息', value: 'info' },
  { label: '警告', value: 'warn' },
  { label: '错误', value: 'error' },
  { label: '调试', value: 'debug' }
];

/**
 * 操作类型选项
 */
export const OPERATION_TYPE_OPTIONS = [
  { label: '全部操作', value: 'all' },
  { label: '创建', value: 'CREATE' },
  { label: '更新', value: 'UPDATE' },
  { label: '删除', value: 'DELETE' },
  { label: '读取', value: 'READ' },
  { label: '导出', value: 'EXPORT' },
  { label: '登录', value: 'LOGIN' },
  { label: '登出', value: 'LOGOUT' },
  { label: '重置密码', value: 'RESET_PWD' },
  { label: '插入', value: 'INSERT' },
  { label: '游戏启动', value: 'GAME_LAUNCH' },
  { label: '签到', value: 'CHECKIN' },
  { label: '抽奖', value: 'LOTTERY_DRAW' }
];

/**
 * 日志级别颜色映射
 */
export const LOG_LEVEL_COLORS = {
  info: 'bg-blue-100 text-blue-800',
  warn: 'bg-yellow-100 text-yellow-800',
  error: 'bg-red-100 text-red-800',
  debug: 'bg-gray-100 text-gray-800'
};

/**
 * 操作类型颜色映射
 */
export const OPERATION_TYPE_COLORS: Record<string, string> = {
  CREATE: 'bg-green-100 text-green-800',
  UPDATE: 'bg-blue-100 text-blue-800',
  DELETE: 'bg-red-100 text-red-800',
  READ: 'bg-gray-100 text-gray-800',
  EXPORT: 'bg-purple-100 text-purple-800',
  LOGIN: 'bg-cyan-100 text-cyan-800',
  LOGOUT: 'bg-slate-100 text-slate-800',
  RESET_PWD: 'bg-orange-100 text-orange-800',
  INSERT: 'bg-emerald-100 text-emerald-800',
  GAME_LAUNCH: 'bg-indigo-100 text-indigo-800',
  CHECKIN: 'bg-amber-100 text-amber-800',
  LOTTERY_DRAW: 'bg-pink-100 text-pink-800'
};

/**
 * 消息提示
 */
export const MESSAGES = {
  SUCCESS: {
    REFRESH: '数据刷新成功',
    EXPORT: '日志导出成功'
  },
  ERROR: {
    FETCH_LOGS: '获取日志列表失败',
    FETCH_STATS: '获取统计信息失败',
    EXPORT: '日志导出失败'
  }
};
