// 导出基础工具和类型
export * from './base';

// 导出所有数据模块
export * from './data';

// 导出API模块
export * from './api';

// Mock API 统一导出
export { MockUserAPI } from './api/user';
export { MockRoleAPI } from './api/role';
export { MockPermissionAPI } from './api/permission';
export { MockAuthAPI } from './api/auth';
export { MockDashboardAPI } from './api/dashboard';
export { MockLogAPI } from './api/log';

// Mock 数据导出
export * from './data/user';
export * from './data/role';
export * from './data/permission';
export * from './data/auth';
export * from './data/dashboard';
export * from './data/log';

// Mock API 实例
import { MockUserAPI } from './api/user';
import { MockRoleAPI } from './api/role';
import { MockPermissionAPI } from './api/permission';
import { MockAuthAPI } from './api/auth';
import { MockDashboardAPI } from './api/dashboard';
import { MockLogAPI } from './api/log';

export const mockUserAPI = new MockUserAPI();
export const mockRoleAPI = new MockRoleAPI();
export const mockPermissionAPI = new MockPermissionAPI();
export const mockAuthAPI = new MockAuthAPI();
export const mockDashboardAPI = new MockDashboardAPI();
export const mockLogAPI = new MockLogAPI();

// API 集合对象
export const mockAPI = {
  user: mockUserAPI,
  role: mockRoleAPI,
  permission: mockPermissionAPI,
  auth: mockAuthAPI,
  dashboard: mockDashboardAPI,
  log: mockLogAPI
} as const;
