interface FilterField {
  key: string;
  type: string;
  label: string;
  placeholder: string;
  width: string;
}

/**
 * 默认分页配置
 */
export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0
} as const;

/**
 * 分页大小选项
 */
export const PAGE_SIZE_OPTIONS = [10, 20, 30, 50, 100];

/**
 * 默认筛选条件
 */
export const DEFAULT_FILTERS = {
  name: '',
  code: '',
  parent_id: undefined,
  dateRange: undefined,
  page: 1,
  limit: 10,
  sort_by: 'sort_order',
  sort_dir: 'asc' as 'asc' | 'desc'
} as const;

/**
 * 筛选字段配置
 */
export const FILTER_FIELDS: FilterField[] = [
  {
    key: 'name',
    type: 'text',
    label: '权限名称',
    placeholder: '搜索权限名称...',
    width: 'w-60'
  },
  {
    key: 'code',
    type: 'text',
    label: '权限标识',
    placeholder: '搜索权限标识...',
    width: 'w-60'
  },
  {
    key: 'dateRange',
    type: 'dateRange',
    label: '创建时间',
    placeholder: '选择时间范围',
    width: 'w-60'
  }
];

/**
 * 表格列配置
 */
export const TABLE_COLUMNS = [
  {
    key: 'index',
    title: 'ID',
    className: 'text-center w-[60px] font-mono text-sm font-medium'
  },
  {
    key: 'name',
    title: '权限名称',
    className: 'font-medium'
  },
  {
    key: 'code',
    title: '权限编码',
    className: 'font-mono text-sm'
  },
  {
    key: 'description',
    title: '描述',
    className: 'text-muted-foreground max-w-xs'
  },
  {
    key: 'parent_id',
    title: '父级权限',
    className: 'text-muted-foreground w-[120px]'
  },
  {
    key: 'sort_order',
    title: '排序值',
    className: 'text-center w-[80px] font-mono text-sm'
  },
  {
    key: 'created_at',
    title: '创建时间',
    className: 'font-medium w-[140px]'
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
  EDIT: 'edit'
} as const;

/**
 * 消息文案
 */
export const MESSAGES = {
  SUCCESS: {
    CREATE: '权限创建成功',
    UPDATE: '权限更新成功',
    DELETE: '权限删除成功',
    BATCH_DELETE: '批量删除权限成功'
  },
  ERROR: {
    CREATE: '创建权限失败',
    UPDATE: '更新权限失败',
    DELETE: '删除权限失败',
    BATCH_DELETE: '批量删除权限失败',
    FETCH_PERMISSIONS: '获取权限列表失败'
  },
  EMPTY: {
    PERMISSIONS: '暂无权限数据',
    DESCRIPTION: '暂无描述'
  },
  CONFIRM: {
    DELETE: (name: string) => `确定要删除权限 "${name}" 吗？此操作不可撤销。`,
    BATCH_DELETE: (count: number) =>
      `确定要删除选中的 ${count} 个权限吗？此操作不可撤销，如果权限存在子权限，可能会影响权限层级结构。`
  }
} as const;
