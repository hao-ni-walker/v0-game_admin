import { BannerFilters } from './types';

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
 * 位置选项
 */
export const POSITION_OPTIONS = [
  { label: '全部', value: 'all' },
  { label: '首页', value: 'home' },
  { label: '活动页', value: 'promo' },
  { label: '游戏页顶部', value: 'games_top' },
  { label: '游戏页底部', value: 'games_bottom' },
  { label: '页脚', value: 'footer' },
  { label: '侧边栏', value: 'sidebar' },
  { label: '弹窗', value: 'popup' }
] as const;

/**
 * 状态选项
 */
export const STATUS_OPTIONS = [
  { label: '全部', value: 'all' },
  { label: '上线', value: '1' },
  { label: '下线', value: '0' }
] as const;

/**
 * 打开方式选项
 */
export const TARGET_OPTIONS = [
  { label: '当前标签页', value: '_self' },
  { label: '新标签页', value: '_blank' }
] as const;

/**
 * 排序字段选项
 */
export const SORT_OPTIONS = [
  { label: '排序权重', value: 'sort_order' },
  { label: '开始时间', value: 'start_time' },
  { label: '结束时间', value: 'end_time' },
  { label: '更新时间', value: 'updated_at' },
  { label: '创建时间', value: 'created_at' }
] as const;

/**
 * 默认筛选条件
 */
export const DEFAULT_FILTERS: BannerFilters = {
  keyword: '',
  positions: [],
  status: 'all',
  disabled: false,
  show_removed: false,
  active_only: false,
  sort_by: 'sort_order',
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
    key: 'image',
    title: '图片',
    className: 'w-[100px]'
  },
  {
    key: 'title',
    title: '标题',
    className: 'font-medium min-w-[150px]'
  },
  {
    key: 'position',
    title: '位置',
    className: 'w-[120px]'
  },
  {
    key: 'link',
    title: '链接',
    className: 'min-w-[150px] font-mono text-xs'
  },
  {
    key: 'sort_order',
    title: '排序',
    className: 'text-center w-[80px]'
  },
  {
    key: 'validity',
    title: '有效期',
    className: 'w-[200px] text-xs'
  },
  {
    key: 'status',
    title: '状态',
    className: 'text-center w-[100px]'
  },
  {
    key: 'updated_at',
    title: '更新时间',
    className: 'font-medium w-[140px]'
  },
  {
    key: 'actions',
    title: '操作',
    className: 'text-center w-[120px]'
  }
] as const;

/**
 * 对话框类型
 */
export const DIALOG_TYPES = {
  CREATE: 'create',
  EDIT: 'edit',
  VIEW: 'view'
} as const;

/**
 * 消息文案
 */
export const MESSAGES = {
  SUCCESS: {
    CREATE: '轮播图创建成功',
    UPDATE: '轮播图更新成功',
    DELETE: '轮播图删除成功',
    ENABLE: '轮播图上线成功',
    DISABLE: '轮播图下线成功',
    RESTORE: '轮播图恢复成功',
    BATCH_ENABLE: '批量上线成功',
    BATCH_DISABLE: '批量下线成功',
    BATCH_DELETE: '批量删除成功'
  },
  ERROR: {
    CREATE: '创建轮播图失败',
    UPDATE: '更新轮播图失败',
    DELETE: '删除轮播图失败',
    ENABLE: '上线轮播图失败',
    DISABLE: '下线轮播图失败',
    FETCH_BANNERS: '获取轮播图列表失败',
    VERSION_CONFLICT: '版本冲突，请刷新后重试'
  },
  EMPTY: {
    BANNERS: '暂无轮播图数据',
    TITLE: '未设置标题'
  },
  CONFIRM: {
    DELETE: (title: string) => `确定要删除轮播图 "${title || '未命名'}" 吗？此操作不可撤销。`,
    ENABLE: (title: string) => `确定要上线轮播图 "${title || '未命名'}" 吗？`,
    DISABLE: (title: string) => `确定要下线轮播图 "${title || '未命名'}" 吗？`
  }
} as const;

/**
 * 位置标签映射
 */
export const POSITION_LABELS: Record<string, string> = {
  home: '首页',
  promo: '活动页',
  games_top: '游戏页顶部',
  games_bottom: '游戏页底部',
  footer: '页脚',
  sidebar: '侧边栏',
  popup: '弹窗'
};

/**
 * 状态标签映射
 */
export const STATUS_LABELS: Record<number, { label: string; variant: string }> = {
  0: { label: '下线', variant: 'destructive' },
  1: { label: '上线', variant: 'default' }
};
