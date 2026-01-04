import { TemplateFilters } from './types';

/**
 * 默认分页配置
 */
export const DEFAULT_PAGINATION = {
  page: 1,
  page_size: 10,
  total: 0,
  total_pages: 0
} as const;

/**
 * 分页大小选项
 */
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

/**
 * 通知类型选项
 */
export const NOTIFICATION_TYPE_OPTIONS = [
  { label: '全部', value: 'all' },
  { label: 'REWARD', value: 'REWARD' },
  { label: 'security', value: 'security' },
  { label: 'activity', value: 'activity' },
  { label: 'payment', value: 'payment' },
  { label: 'system', value: 'system' }
] as const;

/**
 * 优先级选项
 */
export const PRIORITY_OPTIONS = [
  { label: '全部', value: 'all' },
  { label: 'HIGH', value: 'HIGH' },
  { label: 'urgent', value: 'urgent' },
  { label: 'high', value: 'high' },
  { label: 'normal', value: 'normal' }
] as const;

/**
 * 状态选项
 */
export const STATUS_OPTIONS = [
  { label: '全部', value: 'all' },
  { label: '启用', value: true },
  { label: '禁用', value: false }
] as const;

/**
 * 默认筛选条件
 */
export const DEFAULT_FILTERS: TemplateFilters = {
  keyword: '',
  notification_type: 'all',
  priority: 'all',
  is_active: 'all',
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
    key: 'template_code',
    title: '模板编码',
    className: 'font-mono text-xs w-[150px]'
  },
  {
    key: 'template_name',
    title: '模板名称',
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
    className: 'text-center w-[100px]'
  },
  {
    key: 'supported_channels',
    title: '支持渠道',
    className: 'w-[150px]'
  },
  {
    key: 'is_active',
    title: '状态',
    className: 'text-center w-[80px]'
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
    FETCH: '获取模板列表成功',
    REFRESH: '刷新成功'
  },
  ERROR: {
    FETCH: '获取模板列表失败'
  },
  EMPTY: {
    TEMPLATES: '暂无模板数据'
  }
} as const;

/**
 * 通知类型标签映射
 */
export const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
  REWARD: '奖励',
  security: '安全',
  activity: '活动',
  payment: '支付',
  system: '系统'
};

/**
 * 优先级标签映射
 */
export const PRIORITY_LABELS: Record<
  string,
  { label: string; variant: string }
> = {
  HIGH: { label: '高', variant: 'destructive' },
  urgent: { label: '紧急', variant: 'destructive' },
  high: { label: '高', variant: 'default' },
  normal: { label: '普通', variant: 'secondary' }
};
