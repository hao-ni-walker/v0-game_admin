import { VipLevelFilters } from './types';

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
 * 排序字段选项
 */
export const SORT_OPTIONS = [
  { label: '默认排序', value: 'default' },
  { label: '等级', value: 'level' },
  { label: '所需经验', value: 'required_exp' },
  { label: '升级奖励', value: 'upgrade_reward' },
  { label: '每日奖励', value: 'daily_reward' },
  { label: '佣金比例', value: 'commission_rate' },
  { label: '更新时间', value: 'updated_at' },
  { label: '创建时间', value: 'created_at' },
  { label: 'ID', value: 'id' }
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
 * 默认筛选条件
 */
export const DEFAULT_FILTERS: VipLevelFilters = {
  keyword: '',
  disabled: false,
  show_removed: false,
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
    key: 'level',
    title: '等级',
    className: 'text-center w-[80px] font-medium'
  },
  {
    key: 'name',
    title: '等级名称',
    className: 'font-medium min-w-[120px]'
  },
  {
    key: 'required_exp',
    title: '所需经验',
    className: 'text-right w-[120px] font-mono'
  },
  {
    key: 'upgrade_reward',
    title: '升级奖励',
    className: 'text-right w-[120px] font-mono'
  },
  {
    key: 'daily_reward',
    title: '每日奖励',
    className: 'text-right w-[120px] font-mono'
  },
  {
    key: 'withdraw_limits',
    title: '提现限额',
    className: 'w-[160px]'
  },
  {
    key: 'commission_rate',
    title: '佣金比例',
    className: 'text-right w-[100px] font-mono'
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
    CREATE: 'VIP等级创建成功',
    UPDATE: 'VIP等级更新成功',
    DELETE: 'VIP等级删除成功',
    ENABLE: 'VIP等级启用成功',
    DISABLE: 'VIP等级禁用成功'
  },
  ERROR: {
    CREATE: '创建VIP等级失败',
    UPDATE: '更新VIP等级失败',
    DELETE: '删除VIP等级失败',
    FETCH: '获取VIP等级列表失败',
    VERSION_CONFLICT: '版本冲突，请刷新后重试',
    LEVEL_DUPLICATE: '等级数值重复',
    EXP_NOT_INCREASING: '所需经验值未严格递增'
  },
  EMPTY: {
    VIP_LEVELS: '暂无VIP等级数据'
  },
  CONFIRM: {
    DELETE: (name: string) => `确定要删除VIP等级 "${name}" 吗？此操作不可撤销。`,
    DISABLE: (name: string) => `确定要禁用VIP等级 "${name}" 吗？`,
    ENABLE: (name: string) => `确定要启用VIP等级 "${name}" 吗？`
  }
} as const;
