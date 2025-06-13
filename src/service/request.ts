// 导出所有 API 类
export { UserAPI } from './api/user';
export { RoleAPI } from './api/role';
export { PermissionAPI } from './api/permission';
export { AuthAPI } from './api/auth';
export { DashboardAPI } from './api/dashboard';
export { LogAPI } from './api/log';

// 导出基础工具
export { isStaticDeployment, apiRequest, buildSearchParams } from './api/base';
