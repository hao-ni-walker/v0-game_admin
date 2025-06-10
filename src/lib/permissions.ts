/**
 * 权限常量定义
 */
export const PERMISSIONS = {
  // 用户管理权限
  USER: {
    READ: 'system.user.read',
    CREATE: 'system.user.create',
    UPDATE: 'system.user.update',
    DELETE: 'system.user.delete'
  },
  // 角色管理权限
  ROLE: {
    READ: 'system.role.read',
    CREATE: 'system.role.create',
    UPDATE: 'system.role.update',
    DELETE: 'system.role.delete',
    ASSIGN: 'system.role.assign'
  },
  // 权限管理权限
  PERMISSION: {
    READ: 'system.permission.read',
    CREATE: 'system.permission.create',
    UPDATE: 'system.permission.update',
    DELETE: 'system.permission.delete'
  }
} as const;

/**
 * 路由权限映射
 */
export const ROUTE_PERMISSIONS = {
  '/dashboard/account/user': [PERMISSIONS.USER.READ],
  '/dashboard/account/role': [PERMISSIONS.ROLE.READ],
  '/dashboard/account/permission': [PERMISSIONS.PERMISSION.READ]
} as const;
