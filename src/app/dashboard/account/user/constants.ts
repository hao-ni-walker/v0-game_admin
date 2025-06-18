import { FilterField } from '@/components/custom-table';

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
  username: '',
  email: '',
  roleId: '',
  dateRange: undefined,
  page: 1,
  limit: 10
} as const;

/**
 * 筛选字段配置（已弃用，新组件直接内置配置）
 * @deprecated 使用新的 UserFilters 组件，不再需要此配置
 */

/**
 * 表格列配置
 */
export const TABLE_COLUMNS = [
  {
    key: 'id',
    title: 'ID',
    className: 'text-center w-[60px] font-mono text-sm font-medium'
  },
  {
    key: 'username',
    title: '用户名',
    className: 'font-medium'
  },
  {
    key: 'email',
    title: '邮箱',
    className: 'font-medium'
  },
  {
    key: 'role',
    title: '角色'
  },
  {
    key: 'createdAt',
    title: '创建时间',
    className: 'font-medium'
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
  CREATE: 'create',
  EDIT: 'edit'
} as const;

/**
 * 消息文案
 */
export const MESSAGES = {
  SUCCESS: {
    CREATE: '用户创建成功',
    UPDATE: '用户更新成功',
    DELETE: '用户删除成功'
  },
  ERROR: {
    CREATE: '创建用户失败',
    UPDATE: '更新用户失败',
    DELETE: '删除用户失败',
    FETCH_USERS: '获取用户列表失败',
    FETCH_ROLES: '获取角色列表失败'
  },
  EMPTY: {
    USERS: '暂无用户数据',
    ROLE: '未分配'
  },
  CONFIRM: {
    DELETE: (username: string) =>
      `确定要删除用户 "${username}" 吗？此操作不可撤销。`
  }
} as const;
