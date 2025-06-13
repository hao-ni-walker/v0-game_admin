// 导出所有 API 类
export { MockUserAPI } from './user';
export { MockRoleAPI } from './role';
export { MockPermissionAPI } from './permission';
export { MockAuthAPI } from './auth';
export { MockDashboardAPI } from './dashboard';
export { MockLogAPI } from './log';

// 创建API实例
import { MockUserAPI } from './user';
import { MockRoleAPI } from './role';
import { MockPermissionAPI } from './permission';
import { MockAuthAPI } from './auth';
import { MockDashboardAPI } from './dashboard';
import { MockLogAPI } from './log';

export const userAPI = new MockUserAPI();
export const roleAPI = new MockRoleAPI();
export const permissionAPI = new MockPermissionAPI();
export const authAPI = new MockAuthAPI();
export const dashboardAPI = new MockDashboardAPI();
export const logAPI = new MockLogAPI();

// 统一的API对象（保持向后兼容）
export const mockAPI = {
  user: userAPI,
  role: roleAPI,
  permission: permissionAPI,
  auth: authAPI,
  dashboard: dashboardAPI,
  log: logAPI
};

// 环境检测函数
export function isStaticEnvironment(): boolean {
  if (typeof window === 'undefined') return false;

  return (
    process.env.STATIC_EXPORT === 'true' ||
    window.location.hostname.includes('github.io') ||
    window.location.hostname.includes('pages.dev') ||
    window.location.hostname === 'localhost'
  );
}
