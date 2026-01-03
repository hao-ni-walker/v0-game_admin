// 导出通用 API 工具
export { apiRequest, buildSearchParams } from './api/base';

// 导出所有 API 类
export { AuthAPI } from './api/auth';
export { UserAPI } from './api/user';
export { RoleAPI } from './api/role';
export { PermissionAPI } from './api/permission';
export { DashboardAPI } from './api/dashboard';
export { LogAPI, OperationLogAPI } from './api/log';
export { SystemConfigAPI } from './api/system-config';
export { PlatformAPI } from './api/platform';
