/**
 * 权限常量定义
 */
export const PERMISSIONS = {
  // 用户管理权限
  USER: {
    READ: 'account.user.read',
    CREATE: 'account.user.create',
    UPDATE: 'account.user.update',
    DELETE: 'account.user.delete'
  },
  // 角色管理权限
  ROLE: {
    READ: 'account.role.read',
    CREATE: 'account.role.create',
    UPDATE: 'account.role.update',
    DELETE: 'account.role.delete',
    ASSIGN: 'account.role.assign'
  },
  // 权限管理权限
  PERMISSION: {
    READ: 'account.permission.read',
    CREATE: 'account.permission.create',
    UPDATE: 'account.permission.update',
    DELETE: 'account.permission.delete'
  },
  // 日志管理权限
  LOG: {
    READ: 'system.log.read',
    DELETE: 'system.log.delete',
    EXPORT: 'system.log.export'
  },
  // 站内信管理权限
  MESSAGE: {
    READ: 'message:read',
    WRITE: 'message:write',
    RECALL: 'message:recall'
  },
  // 群发管理权限
  BROADCAST: {
    READ: 'message:read',
    APPROVE: 'message:approve'
  },
  // 跟单管理权限
  COPYTRADE: {
    READ: 'copytrade:read',
    WRITE: 'copytrade:write'
  }
} as const;

/**
 * 路由权限映射
 */
export const ROUTE_PERMISSIONS = {
  '/dashboard/messages': ['message:read'],
  '/dashboard/messages/broadcasts': ['message:read'],
  '/dashboard/orders/trade-orders': ['risk:read'],
  '/dashboard/risk/trade-failures': ['risk:read'],
  '/dashboard/risk/intervention-log': ['risk:read'],
  '/dashboard/copy-trade/leaders': ['copytrade:read'],
  '/dashboard/copy-trade/applications': ['copytrade:read'],
  '/dashboard/copy-trade/commissions': ['copytrade:read'],
  '/dashboard/copy-trade/overview': ['copytrade:read'],
  '/dashboard/copy-trade/config': ['copytrade:read'],
  '/dashboard/system/referral': ['risk:read']
} as const;
