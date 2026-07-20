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
 * 用户状态选项
 */
export const STATUS_OPTIONS = [
  { label: '全部', value: 'all' },
  { label: '正常', value: 'active' },
  { label: '禁用', value: 'disabled' }
] as const;

/**
 * 用户状态映射
 */
export const STATUS_MAP = {
  active: { label: '正常', variant: 'default' as const },
  disabled: { label: '禁用', variant: 'destructive' as const }
} as const;

/**
 * 默认筛选条件
 */
export const DEFAULT_FILTERS = {
  username: '',
  email: '',
  roleId: '',
  status: 'all' as const,
  dateRange: undefined,
  page: 1,
  limit: 10
} as const;

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
    key: 'username',
    title: '用户名',
    className: 'font-medium'
  },
  {
    key: 'email',
    title: '显示名称',
    className: 'font-medium'
  },
  {
    key: 'role',
    title: '角色'
  },
  {
    key: 'status',
    title: '状态',
    className: 'text-center'
  },
  {
    key: 'lastLoginAt',
    title: '最近登录时间',
    className: 'font-medium w-[140px]'
  },
  {
    key: 'createdAt',
    title: '创建时间',
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
    CREATE: '管理员创建成功',
    UPDATE: '管理员更新成功',
    DELETE: '管理员停用成功',
    ENABLE: '管理员启用成功',
    DISABLE: '管理员停用成功'
  },
  ERROR: {
    CREATE: '创建管理员失败',
    UPDATE: '更新管理员失败',
    DELETE: '停用管理员失败',
    ENABLE: '启用管理员失败',
    DISABLE: '停用管理员失败',
    FETCH_USERS: '获取管理员列表失败',
    FETCH_ROLES: '获取角色列表失败'
  },
  EMPTY: {
    USERS: '暂无管理员数据',
    ROLE: '未分配',
    LAST_LOGIN: '从未登录'
  },
  CONFIRM: {
    DELETE: (username: string) =>
      `确定要停用管理员 "${username}" 吗？`,
    ENABLE: (username: string) => `确定要启用管理员 "${username}" 吗？`,
    DISABLE: (username: string) =>
      `确定要停用管理员 "${username}" 吗？停用后该账号无法登录后台。`
  }
} as const;
