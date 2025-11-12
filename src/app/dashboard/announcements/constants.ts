import { AnnouncementFilters } from './types';

/**
 * 默认分页配置
 */
export const DEFAULT_PAGINATION = {
  page: 1,
  page_size: 20,
  total: 0,
  totalPages: 0
} as const;

/**
 * 分页大小选项
 */
export const PAGE_SIZE_OPTIONS = [20, 50, 100];

/**
 * 公告类型选项
 */
export const ANNOUNCEMENT_TYPE_OPTIONS = [
  { label: '全部', value: 'all' },
  { label: '系统公告', value: 1 },
  { label: '活动公告', value: 2 },
  { label: '维护公告', value: 3 }
] as const;

/**
 * 优先级选项
 */
export const PRIORITY_OPTIONS = [
  { label: '全部', value: 'all' },
  { label: '高', value: 1 },
  { label: '中', value: 2 },
  { label: '低', value: 3 }
] as const;

/**
 * 状态选项
 */
export const STATUS_OPTIONS = [
  { label: '全部', value: 'all' },
  { label: '上线', value: 1 },
  { label: '下线', value: 0 }
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
  { label: '默认排序', value: 'default' },
  { label: '优先级', value: 'priority' },
  { label: '开始时间', value: 'start_time' },
  { label: '结束时间', value: 'end_time' },
  { label: '创建时间', value: 'created_at' },
  { label: '更新时间', value: 'updated_at' },
  { label: 'ID', value: 'id' }
] as const;

/**
 * 默认筛选条件
 */
export const DEFAULT_FILTERS: AnnouncementFilters = {
  keyword: '',
  types: [],
  status: 'all',
  disabled: false,
  show_removed: false,
  active_only: false,
  sort_by: 'default',
  sort_dir: 'asc',
  page: 1,
  page_size: 20
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
    key: 'title',
    title: '标题',
    className: 'font-medium min-w-[200px]'
  },
  {
    key: 'type',
    title: '类型',
    className: 'w-[100px]'
  },
  {
    key: 'priority',
    title: '优先级',
    className: 'text-center w-[80px]'
  },
  {
    key: 'time_range',
    title: '有效期',
    className: 'w-[280px]'
  },
  {
    key: 'status',
    title: '状态',
    className: 'text-center w-[100px]'
  },
  {
    key: 'disabled',
    title: '禁用',
    className: 'text-center w-[80px]'
  },
  {
    key: 'version',
    title: '版本',
    className: 'text-center w-[60px] font-mono'
  },
  {
    key: 'updated_at',
    title: '更新时间',
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
    DISABLE: (title: string) => `确定要禁用公告 "${title}" 吗？紧急止投将立即生效。`,
    ENABLE: (title: string) => `确定要启用公告 "${title}" 吗？`
  }
} as const;

/**
 * 公告类型标签映射
 */
export const ANNOUNCEMENT_TYPE_LABELS: Record<number, string> = {
  1: '系统公告',
  2: '活动公告',
  3: '维护公告'
};

/**
 * 公告类型颜色映射
 */
export const ANNOUNCEMENT_TYPE_COLORS: Record<number, string> = {
  1: 'default',
  2: 'secondary',
  3: 'destructive'
};

/**
 * 优先级标签映射
 */
export const PRIORITY_LABELS: Record<number, { label: string; variant: string }> = {
  1: { label: '高', variant: 'destructive' },
  2: { label: '中', variant: 'default' },
  3: { label: '低', variant: 'secondary' }
};
