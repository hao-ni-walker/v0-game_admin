import { GiftPackFilters } from './types';

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
 * 道具类别选项
 */
export const CATEGORY_OPTIONS = [
  { label: '全部', value: 'all' },
  { label: '系统礼包', value: 'bundle_system' },
  { label: '日历礼包', value: 'bundle_calendar' },
  { label: '随机礼包', value: 'bundle_random' },
  { label: '内购礼包', value: 'bundle_iap' },
  { label: '充值礼包', value: 'bundle_recharge' },
  { label: '货币', value: 'currency' },
  { label: '增益', value: 'buff' },
  { label: '票券', value: 'ticket' },
  { label: '皮肤', value: 'skin' },
  { label: '宝箱', value: 'box' },
  { label: '材料', value: 'material' },
  { label: '其他', value: 'other' }
] as const;

/**
 * 稀有度选项
 */
export const RARITY_OPTIONS = [
  { label: '全部', value: 'all' },
  { label: '普通', value: 'common' },
  { label: '稀有', value: 'rare' },
  { label: '史诗', value: 'epic' },
  { label: '传说', value: 'legendary' }
] as const;

/**
 * 状态选项
 */
export const STATUS_OPTIONS = [
  { label: '全部', value: 'all' },
  { label: '启用', value: 'active' },
  { label: '停用', value: 'disabled' },
  { label: '归档', value: 'archived' }
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
 * 语言选项
 */
export const LOCALE_OPTIONS = [
  { label: '默认', value: 'default' },
  { label: '简体中文', value: 'zh-CN' },
  { label: '繁体中文', value: 'zh-TW' },
  { label: '英语', value: 'en' },
  { label: '泰语', value: 'th' },
  { label: '越南语', value: 'vi' }
] as const;

/**
 * 排序字段选项
 */
export const SORT_OPTIONS = [
  { label: '权重排序', value: 'sort_weight' },
  { label: '稀有度', value: 'rarity' },
  { label: '创建时间', value: 'created_at' },
  { label: '更新时间', value: 'updated_at' },
  { label: '道具ID', value: 'item_id' }
] as const;

/**
 * 默认筛选条件
 */
export const DEFAULT_FILTERS: GiftPackFilters = {
  keyword: '',
  locale: 'default',
  categories: [],
  rarities: [],
  statuses: ['active'],
  is_consumable: undefined,
  bind_flag: undefined,
  sort_by: 'sort_weight',
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
    key: 'item_id',
    title: '道具ID',
    className: 'font-mono text-xs w-[100px] text-center'
  },
  {
    key: 'icon',
    title: '图标',
    className: 'w-[60px]'
  },
  {
    key: 'name',
    title: '名称',
    className: 'font-medium min-w-[150px]'
  },
  {
    key: 'category',
    title: '类别',
    className: 'w-[100px]'
  },
  {
    key: 'rarity',
    title: '稀有度',
    className: 'text-center w-[100px]'
  },
  {
    key: 'properties',
    title: '属性',
    className: 'w-[180px]'
  },
  {
    key: 'requirements',
    title: '要求',
    className: 'w-[140px]'
  },
  {
    key: 'limits',
    title: '限制',
    className: 'w-[140px]'
  },
  {
    key: 'status',
    title: '状态',
    className: 'text-center w-[80px]'
  },
  {
    key: 'sort_weight',
    title: '权重',
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
    className: 'text-center w-[120px]'
  }
] as const;

/**
 * 消息文案
 */
export const MESSAGES = {
  SUCCESS: {
    CREATE: '礼包创建成功',
    UPDATE: '礼包更新成功',
    DELETE: '礼包删除成功',
    ENABLE: '礼包启用成功',
    DISABLE: '礼包停用成功',
    ARCHIVE: '礼包归档成功'
  },
  ERROR: {
    CREATE: '创建礼包失败',
    UPDATE: '更新礼包失败',
    DELETE: '删除礼包失败',
    FETCH: '获取礼包列表失败'
  },
  EMPTY: {
    ITEMS: '暂无礼包数据'
  },
  CONFIRM: {
    DELETE: (name: string) => `确定要删除礼包 "${name}" 吗？此操作不可撤销。`,
    ARCHIVE: (name: string) => `确定要归档礼包 "${name}" 吗？`
  }
} as const;

/**
 * 类别标签映射
 */
export const CATEGORY_LABELS: Record<string, string> = {
  bundle_system: '系统礼包',
  bundle_calendar: '日历礼包',
  bundle_random: '随机礼包',
  bundle_iap: '内购礼包',
  bundle_recharge: '充值礼包',
  currency: '货币',
  buff: '增益',
  ticket: '票券',
  skin: '皮肤',
  box: '宝箱',
  material: '材料',
  other: '其他'
};

/**
 * 图片基础 URL
 */
export const IMAGE_BASE_URL = 'https://cdn.xreddeercasino.com/images/items/';

/**
 * 稀有度标签映射
 */
export const RARITY_LABELS: Record<string, string> = {
  common: '普通',
  rare: '稀有',
  epic: '史诗',
  legendary: '传说'
};

/**
 * 稀有度颜色映射
 */
export const RARITY_COLORS: Record<string, string> = {
  common: '#9CA3AF',
  rare: '#3B82F6',
  epic: '#A855F7',
  legendary: '#F59E0B'
};

/**
 * 状态标签映射
 */
export const STATUS_LABELS: Record<string, string> = {
  active: '启用',
  disabled: '停用',
  archived: '归档'
};
