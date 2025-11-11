import { NotificationFilters } from './types';

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
 * 消息类型选项
 */
export const NOTIFICATION_TYPE_OPTIONS = [
  { label: '全部', value: 'all' },
  { label: '系统消息', value: 'system' },
  { label: '订单通知', value: 'order' },
  { label: '支付通知', value: 'payment' },
  { label: '活动通知', value: 'activity' },
  { label: '安全提醒', value: 'security' },
  { label: '互动消息', value: 'interactive' }
] as const;

/**
 * 优先级选项
 */
export const PRIORITY_OPTIONS = [
  { label: '全部', value: 'all' },
  { label: '低', value: 'low' },
  { label: '正常', value: 'normal' },
  { label: '高', value: 'high' },
  { label: '紧急', value: 'urgent' }
] as const;

/**
 * 状态选项
 */
export const STATUS_OPTIONS = [
  { label: '全部', value: 'all' },
  { label: '待处理', value: 'pending' },
  { label: '已发送', value: 'sent' },
  { label: '已送达', value: 'delivered' },
  { label: '已读', value: 'read' },
  { label: '失败', value: 'failed' }
] as const;

/**
 * 排序字段选项
 */
export const SORT_OPTIONS = [
  { label: '创建时间', value: 'created_at' },
  { label: '发送时间', value: 'sent_at' },
  { label: '阅读时间', value: 'read_at' },
  { label: '优先级', value: 'priority' },
  { label: '状态', value: 'status' },
  { label: 'ID', value: 'id' }
] as const;

/**
 * 默认筛选条件
 */
export const DEFAULT_FILTERS: NotificationFilters = {
  keyword: '',
  user_ids: [],
  types: [],
  priorities: [],
  statuses: [],
  is_read: undefined,
  only_failed: false,
  sort_by: 'created_at',
  sort_dir: 'desc',
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
    key: 'user_id',
    title: '用户ID',
    className: 'font-mono w-[80px]'
  },
  {
    key: 'title',
    title: '标题',
    className: 'font-medium min-w-[150px]'
  },
  {
    key: 'notification_type',
    title: '消息类型',
    className: 'w-[120px]'
  },
  {
    key: 'priority',
    title: '优先级',
    className: 'text-center w-[100px]'
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
    key: 'channels',
    title: '渠道统计',
    className: 'w-[150px] text-xs'
  },
  {
    key: 'created_at',
    title: '创建时间',
    className: 'font-medium w-[140px]'
  },
  {
    key: 'actions',
    title: '操作',
    className: 'text-center w-[100px]'
  }
] as const;

/**
 * 对话框类型
 */
export const DIALOG_TYPES = {
  VIEW: 'view'
} as const;

/**
 * 消息文案
 */
export const MESSAGES = {
  SUCCESS: {
    MARK_READ: '标记为已读',
    MARK_UNREAD: '标记为未读',
    RESEND: '重新发送成功',
    DELETE: '消息删除成功'
  },
  ERROR: {
    MARK_READ: '标记失败',
    MARK_UNREAD: '标记失败',
    RESEND: '重新发送失败',
    DELETE: '删除失败',
    FETCH_NOTIFICATIONS: '获取消息列表失败'
  },
  EMPTY: {
    NOTIFICATIONS: '暂无消息通知',
    CONTENT: '无内容'
  },
  CONFIRM: {
    MARK_READ: (title: string) => `确定要标记 "${title}" 为已读吗？`,
    MARK_UNREAD: (title: string) => `确定要标记 "${title}" 为未读吗？`,
    DELETE: (title: string) => `确定要删除消息 "${title}" 吗？此操作不可撤销。`
  }
} as const;

/**
 * 消息类型标签映射
 */
export const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
  system: '系统消息',
  order: '订单通知',
  payment: '支付通知',
  activity: '活动通知',
  security: '安全提醒',
  interactive: '互动消息'
};

/**
 * 优先级标签映射
 */
export const PRIORITY_LABELS: Record<string, { label: string; variant: string }> = {
  low: { label: '低', variant: 'outline' },
  normal: { label: '正常', variant: 'secondary' },
  high: { label: '高', variant: 'default' },
  urgent: { label: '紧急', variant: 'destructive' }
};

/**
 * 状态标签映射
 */
export const STATUS_LABELS: Record<string, { label: string; variant: string }> = {
  pending: { label: '待处理', variant: 'outline' },
  sent: { label: '已发送', variant: 'secondary' },
  delivered: { label: '已送达', variant: 'default' },
  read: { label: '已读', variant: 'default' },
  failed: { label: '失败', variant: 'destructive' }
};
