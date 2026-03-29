import { PlatformFilters } from './types';

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
  { label: 'ID', value: 'id' },
  { label: '名称', value: 'name' },
  { label: '创建时间', value: 'created_at' }
] as const;

/**
 * 默认筛选条件
 */
export const DEFAULT_FILTERS: PlatformFilters = {
  keyword: '',
  sort_by: 'id',
  sort_dir: 'asc',
  page: 1,
  page_size: 20
} as const;

/**
 * 表格列配置
 */
export const TABLE_COLUMNS = [
  {
    key: 'id',
    title: 'ID',
    className: 'text-center w-[80px] font-mono'
  },
  {
    key: 'name',
    title: '名称',
    className: 'font-medium min-w-[150px]'
  },
  {
    key: 'description',
    title: '描述',
    className: 'min-w-[200px]'
  },
  {
    key: 'pre_url',
    title: '前置URL',
    className: 'min-w-[200px] font-mono text-sm'
  },
  {
    key: 'enabled',
    title: '状态',
    className: 'text-center w-[100px]'
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
    FETCH: '获取平台列表成功',
    REFRESH: '刷新成功',
    DELETE: '删除平台成功'
  },
  ERROR: {
    FETCH_PLATFORMS: '获取平台列表失败',
    DELETE: '删除平台失败'
  },
  EMPTY: {
    PLATFORMS: '暂无平台数据'
  },
  CONFIRM: {
    DELETE: (name: string) => `确定要删除平台 "${name}" 吗？此操作不可撤销。`
  }
} as const;
