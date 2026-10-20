import { SystemConfigFilters } from './types';

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
 * 配置类型选项
 */
export const CONFIG_TYPE_OPTIONS = [
  { label: '全部', value: 'all' },
  { label: '字符串', value: 'string' },
  { label: '数字', value: 'number' },
  { label: '布尔值', value: 'boolean' },
  { label: 'JSON', value: 'json' }
] as const;

/**
 * 排序字段选项
 */
export const SORT_OPTIONS = [
  { label: '更新时间', value: 'updated_at' },
  { label: '创建时间', value: 'created_at' },
  { label: '配置键', value: 'config_key' },
  { label: 'ID', value: 'id' }
] as const;

/**
 * 默认筛选条件
 */
export const DEFAULT_FILTERS: SystemConfigFilters = {
  keyword: '',
  category: 'all',
  config_types: [],
  is_public: undefined,
  disabled: false,
  show_removed: false,
  sort_by: 'updated_at',
  sort_dir: 'desc',
  page: 1,
  page_size: 20
};

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
    key: 'config_key',
    title: '配置项',
    className: 'min-w-[220px]'
  },
  {
    key: 'config_value',
    title: '参数一览',
    className: 'min-w-[280px] max-w-[420px]'
  },
  {
    key: 'description',
    title: '业务说明',
    className: 'min-w-[180px] max-w-[280px]'
  },
  {
    key: 'is_public',
    title: '公开',
    className: 'text-center w-[80px]'
  },
  {
    key: 'status',
    title: '状态',
    className: 'text-center w-[80px]'
  },
  {
    key: 'version',
    title: '版本',
    className: 'text-center w-[70px] font-mono'
  },
  {
    key: 'updated_at',
    title: '更新时间',
    className: 'font-medium w-[140px]'
  },
  {
    key: 'actions',
    title: '操作',
    className: 'text-center w-[100px]'
  }
] as const;

/**
 * 消息文案
 */
export const MESSAGES = {
  SUCCESS: {
    UPDATE: '配置更新成功'
  },
  ERROR: {
    UPDATE: '更新配置失败',
    FETCH_CONFIGS: '获取配置列表失败'
  },
  EMPTY: {
    CONFIGS: '暂无配置数据'
  }
} as const;

/**
 * 配置类型标签映射
 */
export const CONFIG_TYPE_LABELS: Record<string, string> = {
  string: '字符串',
  number: '数字',
  boolean: '布尔',
  json: 'JSON'
};

/**
 * 配置类型颜色映射
 */
export const CONFIG_TYPE_VARIANTS: Record<string, string> = {
  string: 'outline',
  number: 'secondary',
  boolean: 'default',
  json: 'default'
};
