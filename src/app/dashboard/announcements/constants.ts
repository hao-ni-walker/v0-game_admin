import { AnnouncementFilters } from './types';

/**
 * 默认分页配置
 */
export const DEFAULT_PAGINATION = {
  page: 1,
  page_size: 10,
  total: 0,
  totalPages: 0
} as const;

/**
 * 分页大小选项
 */
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

/**
 * 通知类型选项
 */
export const ANNOUNCEMENT_TYPE_OPTIONS = [
  { label: '全部', value: 'all' },
  { label: '系统通知', value: 'system' },
  { label: '奖励通知', value: 'REWARD' }
] as const;

/**
 * 优先级选项
 */
export const PRIORITY_OPTIONS = [
  { label: '全部', value: 'all' },
  { label: '高', value: 'high' },
  { label: '普通', value: 'normal' },
  { label: '低', value: 'low' }
] as const;

/**
 * 状态选项
 */
export const STATUS_OPTIONS = [
  { label: '全部', value: 'all' },
  { label: '待发送', value: 'pending' },
  { label: '已发送', value: 'sent' },
  { label: '已读', value: 'read' }
] as const;

/**
 * 布尔筛选选项
 */
export const BOOLEAN_OPTIONS = [
  { label: '全部', value: 'all' },
  { label: '是', value: 'true' },
  { label: '否', value: 'false' }
] as const;

/**
 * 排序字段选项
 */
export const SORT_OPTIONS = [
  { label: '创建时间', value: 'created_at' },
  { label: '发送时间', value: 'sent_at' },
  { label: '阅读时间', value: 'read_at' },
  { label: 'ID', value: 'id' },
  { label: '用户ID', value: 'user_id' }
] as const;

/**
 * 默认筛选条件
 */
export const DEFAULT_FILTERS: AnnouncementFilters = {
  keyword: '',
  notification_type: undefined,
  status: 'all',
  is_read: undefined,
  user_id: undefined,
  sort_by: 'created_at',
  sort_dir: 'desc',
  page: 1,
  page_size: 10
} as const;

/**
 * 表格列配置
 */
export const TABLE_COLUMNS = [
  {
    key: 'index',
    title: '#',
    className: 'text-center w-[50px] font-mono text-sm'
  },
  {
    key: 'id',
    title: 'ID',
    className: 'font-mono text-xs w-[80px] text-center'
  },
  {
    key: 'user_id',
    title: '用户ID',
    className: 'font-mono text-xs w-[80px] text-center'
  },
  {
    key: 'title',
    title: '标题',
    className: 'font-medium min-w-[200px]'
  },
  {
    key: 'notification_type',
    title: '通知类型',
    className: 'w-[120px]'
  },
  {
    key: 'priority',
    title: '优先级',
    className: 'text-center w-[80px]'
  },
  {
    key: 'status',
    title: '状态',
    className: 'text-center w-[100px]'
  },
  {
    key: 'is_read',
    title: '已读',
    className: 'text-center w-[80px]'
  },
  {
    key: 'created_at',
    title: '创建时间',
    className: 'font-medium w-[140px]'
  },
  {
    key: 'sent_at',
    title: '发送时间',
    className: 'font-medium w-[140px]'
  },
  {
    key: 'read_at',
    title: '阅读时间',
    className: 'font-medium w-[140px]'
  },
  {
    key: 'actions',
    title: '操作',
    className: 'text-center w-[140px]'
  }
] as const;

/**
 * 消息文案
 */
export const MESSAGES = {
  SUCCESS: {
    CREATE: '公告创建成功',
    UPDATE: '公告更新成功',
    DELETE: '公告删除成功',
    PUBLISH: '公告发布成功',
    OFFLINE: '公告下线成功',
    ENABLE: '公告启用成功',
    DISABLE: '公告禁用成功',
    SEND_NOTIFICATION: '站内通知发送成功'
  },
  ERROR: {
    CREATE: '创建公告失败',
    UPDATE: '更新公告失败',
    DELETE: '删除公告失败',
    FETCH: '获取公告列表失败',
    VERSION_CONFLICT: '版本冲突，请刷新后重试'
  },
  EMPTY: {
    ANNOUNCEMENTS: '暂无公告数据'
  },
  CONFIRM: {
    DELETE: (title: string) => `确定要删除公告 "${title}" 吗？此操作不可撤销。`,
    OFFLINE: (title: string) => `确定要下线公告 "${title}" 吗？`,
    DISABLE: (title: string) =>
      `确定要禁用公告 "${title}" 吗？紧急止投将立即生效。`,
    ENABLE: (title: string) => `确定要启用公告 "${title}" 吗？`
  }
} as const;

/**
 * 通知类型标签映射
 */
export const ANNOUNCEMENT_TYPE_LABELS: Record<string, string> = {
  system: '系统通知',
  REWARD: '奖励通知'
};

/**
 * 通知类型颜色映射
 */
export const ANNOUNCEMENT_TYPE_COLORS: Record<string, string> = {
  system: 'default',
  REWARD: 'secondary'
};

/**
 * 优先级标签映射
 */
export const PRIORITY_LABELS: Record<
  string,
  { label: string; variant: string }
> = {
  high: { label: '高', variant: 'destructive' },
  normal: { label: '普通', variant: 'default' },
  low: { label: '低', variant: 'secondary' }
};
