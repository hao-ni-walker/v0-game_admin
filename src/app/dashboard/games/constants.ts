import { GameFilters } from './types';

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
 * 游戏分类选项
 */
export const CATEGORY_OPTIONS = [
  { label: '全部', value: 'all' },
  { label: '老虎机', value: 'slot' },
  { label: '桌面游戏', value: 'table' },
  { label: '真人娱乐', value: 'live' },
  { label: '体育博彩', value: 'sports' },
  { label: '捕鱼游戏', value: 'fishing' },
  { label: '棋牌游戏', value: 'card' }
] as const;

/**
 * 供应商选项
 */
export const PROVIDER_OPTIONS = [
  { label: '全部', value: 'all' },
  { label: 'PG Soft', value: 'PG' },
  { label: 'Pragmatic Play', value: 'PP' },
  { label: 'Evolution', value: 'EVO' },
  { label: 'Microgaming', value: 'MG' },
  { label: 'NetEnt', value: 'NE' },
  { label: "Play'n GO", value: 'PNG' }
] as const;

/**
 * 语言选项
 */
export const LANGUAGE_OPTIONS = [
  { label: '全部', value: 'all' },
  { label: '英文', value: 'en' },
  { label: '简体中文', value: 'zh-CN' },
  { label: '繁体中文', value: 'zh-TW' },
  { label: '泰语', value: 'th' },
  { label: '越南语', value: 'vi' }
] as const;

/**
 * 货币选项
 */
export const CURRENCY_OPTIONS = [
  { label: '全部', value: 'all' },
  { label: '美元(USD)', value: 'USD' },
  { label: '人民币(CNY)', value: 'CNY' },
  { label: '泰铢(THB)', value: 'THB' },
  { label: '越南盾(VND)', value: 'VND' }
] as const;

/**
 * 状态选项
 */
export const STATUS_OPTIONS = [
  { label: '全部', value: 'all' },
  { label: '启用', value: 'true' },
  { label: '停用', value: 'false' }
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
  { label: '默认排序', value: 'sort_order' },
  { label: '游玩次数', value: 'play_count' },
  { label: '热度分', value: 'popularity_score' },
  { label: '返还率', value: 'rtp' },
  { label: '创建时间', value: 'created_at' },
  { label: '更新时间', value: 'updated_at' },
  { label: '最后游玩', value: 'last_played_at' }
] as const;

/**
 * 默认筛选条件
 */
export const DEFAULT_FILTERS: GameFilters = {
  keyword: '',
  provider_codes: [],
  categories: [],
  lang: '',
  status: 'all',
  is_new: undefined,
  is_featured: undefined,
  is_mobile_supported: undefined,
  is_demo_available: undefined,
  has_jackpot: undefined,
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
    key: 'icon',
    title: '图标',
    className: 'w-[60px]'
  },
  {
    key: 'game_id',
    title: '游戏标识',
    className: 'font-mono text-xs w-[140px]'
  },
  {
    key: 'name',
    title: '游戏名称',
    className: 'font-medium min-w-[150px]'
  },
  {
    key: 'category',
    title: '分类',
    className: 'w-[100px]'
  },
  {
    key: 'provider_code',
    title: '供应商',
    className: 'w-[100px]'
  },
  {
    key: 'min_bet',
    title: '最小下注',
    className: 'text-right w-[100px]'
  },
  {
    key: 'max_bet',
    title: '最大下注',
    className: 'text-right w-[100px]'
  },
  {
    key: 'rtp',
    title: 'RTP',
    className: 'text-center w-[80px]'
  },
  {
    key: 'features',
    title: '特性',
    className: 'w-[200px]'
  },
  {
    key: 'status',
    title: '状态',
    className: 'text-center w-[80px]'
  },
  {
    key: 'is_featured',
    title: '是否推荐',
    className: 'text-center w-[100px]'
  },
  {
    key: 'is_new',
    title: '是否新游',
    className: 'text-center w-[100px]'
  },
  {
    key: 'stats',
    title: '统计',
    className: 'text-right w-[120px]'
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
    CREATE: '游戏创建成功',
    UPDATE: '游戏更新成功',
    DELETE: '游戏删除成功',
    ENABLE: '游戏启用成功',
    DISABLE: '游戏停用成功',
    FEATURE: '设置推荐成功',
    UNFEATURE: '取消推荐成功',
    BATCH_ENABLE: '批量启用成功',
    BATCH_DISABLE: '批量停用成功',
    BATCH_FEATURE: '批量推荐成功',
    BATCH_UNFEATURE: '批量取消推荐成功'
  },
  ERROR: {
    CREATE: '创建游戏失败',
    UPDATE: '更新游戏失败',
    DELETE: '删除游戏失败',
    ENABLE: '启用游戏失败',
    DISABLE: '停用游戏失败',
    FETCH_GAMES: '获取游戏列表失败'
  },
  EMPTY: {
    GAMES: '暂无游戏数据',
    DESCRIPTION: '暂无描述',
    BET_RANGE: '—'
  },
  CONFIRM: {
    DELETE: (name: string) => `确定要删除游戏 "${name}" 吗？此操作不可撤销。`,
    ENABLE: (name: string) => `确定要启用游戏 "${name}" 吗？`,
    DISABLE: (name: string) => `确定要停用游戏 "${name}" 吗？`,
    BATCH_DELETE: (count: number) =>
      `确定要删除选中的 ${count} 个游戏吗？此操作不可撤销。`
  }
} as const;

/**
 * 分类标签映射
 */
export const CATEGORY_LABELS: Record<string, string> = {
  slot: '老虎机',
  table: '桌面游戏',
  live: '真人娱乐',
  sports: '体育博彩',
  fishing: '捕鱼游戏',
  card: '棋牌游戏'
};

/**
 * 供应商标签映射
 */
export const PROVIDER_LABELS: Record<string, string> = {
  PG: 'PG Soft',
  PP: 'Pragmatic Play',
  EVO: 'Evolution',
  MG: 'Microgaming',
  NE: 'NetEnt',
  PNG: "Play'n GO"
};
