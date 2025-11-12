/**
 * 日志项接口
 */
export interface LogItem {
  id: number;
  level: string;
  action: string;
  module: string;
  message: string;
  details?: any;
  userId?: number;
  username?: string;
  userAgent?: string;
  ip?: string;
  requestId?: string;
  duration?: number;
  createdAt: string;
  updatedAt?: string;
}

/**
 * 操作类型
 */
export type OperationType =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'READ'
  | 'EXPORT'
  | 'LOGIN'
  | 'LOGOUT'
  | 'RESET_PWD';

/**
 * 用户操作日志（审计日志）
 */
export interface UserOperationLog {
  id: number;
  userId: number;
  username: string;
  operation: OperationType;
  tableName: string;
  objectId: string;
  oldData?: any;
  newData?: any;
  description?: string;
  ipAddress?: string;
  source?: string; // web/admin/api/cron
  userAgent?: string;
  operationAt: string;
  createdAt?: string;
}

/**
 * 日志筛选条件
 */
export interface LogFilters {
  level?: string;
  module?: string;
  action?: string;
  search?: string;
  dateRange?: { from: Date; to: Date } | undefined;
  page?: number;
  limit?: number;
}

/**
 * 用户操作日志筛选条件
 */
export interface UserOperationLogFilters {
  keyword?: string; // 对 username、tableName、objectId、description 模糊匹配
  userIds?: number[]; // 用户ID数组
  usernames?: string[]; // 用户名数组
  operations?: OperationType[]; // 操作类型数组
  tables?: string[]; // 表名数组
  objectId?: string; // 对象ID
  ipAddress?: string; // IP地址
  hasDiff?: boolean; // 是否有数据变更
  from?: string; // ISO时间
  to?: string; // ISO时间
  sortBy?: string; // 排序字段
  sortDir?: 'asc' | 'desc'; // 排序方向
  page?: number;
  pageSize?: number;
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
 * 日志统计信息
 */
export interface LogStats {
  overview: {
    total: number;
    today: number;
    week: number;
  };
  levelStats: Array<{
    level: string;
    count: number;
  }>;
  moduleStats: Array<{
    module: string;
    count: number;
  }>;
}

/**
 * 日志对话框状态
 */
export interface LogDialogState {
  type: 'detail' | null;
  log: LogItem | null;
  open: boolean;
}
