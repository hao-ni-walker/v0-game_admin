// 用户相关数据
export * from './user';

// 角色相关数据
export * from './role';

// 权限相关数据
export * from './permission';

// 仪表板相关数据
export * from './dashboard';

// 日志相关数据
export * from './log';

// 认证相关数据
export * from './auth';

// 重新导出基础类型（保持向后兼容）
import { mockUsers } from './user';
import { mockRoles } from './role';
import { mockPermissions } from './permission';
import { mockDashboardStats } from './dashboard';
import { mockLogs } from './log';
import { mockLoginHistory } from './auth';

// 向后兼容的导出
export {
  mockUsers,
  mockRoles,
  mockPermissions,
  mockDashboardStats,
  mockLogs,
  mockLoginHistory
};

// 全局数据对象（保持向后兼容）
export const mockData = {
  users: mockUsers,
  roles: mockRoles,
  permissions: mockPermissions,
  dashboard: mockDashboardStats,
  logs: mockLogs,
  loginHistory: mockLoginHistory
};
