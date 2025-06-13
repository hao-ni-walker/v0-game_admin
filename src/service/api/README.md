# API 服务层说明

本目录包含了项目的所有 API 接口封装，按功能模块进行分类管理。

## 📁 目录结构

```
src/service/api/
├── base.ts          # 基础配置和通用请求函数
├── user.ts          # 用户相关 API
├── role.ts          # 角色相关 API
├── permission.ts    # 权限相关 API
├── auth.ts          # 认证相关 API
├── dashboard.ts     # 仪表板相关 API
├── log.ts           # 日志相关 API
├── index.ts         # 统一导出文件
└── README.md        # 本说明文档
```

## 🚀 使用方式

### 方式一：使用分类 API（推荐）

```typescript
import { UserAPI, RoleAPI, AuthAPI } from '@/service/api';

// 用户相关操作
const users = await UserAPI.getUsers({ page: 1, limit: 10 });
const user = await UserAPI.getUserById(1);
await UserAPI.createUser(userData);

// 角色相关操作
const roles = await RoleAPI.getRoles();
const roleLabels = await RoleAPI.getRoleLabels();

// 认证相关操作
const loginResult = await AuthAPI.login({ email, password });
await AuthAPI.logout();
```

### 方式二：使用统一 ApiClient（向后兼容）

```typescript
import { ApiClient } from '@/service/request';

// 保持原有使用方式不变
const users = await ApiClient.getUsers({ page: 1, limit: 10 });
const roles = await ApiClient.getRoles();
await ApiClient.login({ email, password });
```

## 📋 API 分类说明

### UserAPI - 用户管理

- `getUsers(params)` - 获取用户列表
- `getUserById(id)` - 获取单个用户
- `createUser(userData)` - 创建用户
- `updateUser(id, userData)` - 更新用户
- `deleteUser(id)` - 删除用户

### RoleAPI - 角色管理

- `getRoles(params)` - 获取角色列表
- `getRoleLabels()` - 获取角色标签（用于下拉选择）
- `getRoleById(id)` - 获取单个角色
- `createRole(roleData)` - 创建角色
- `updateRole(id, roleData)` - 更新角色
- `deleteRole(id)` - 删除角色

### PermissionAPI - 权限管理

- `getPermissions(params)` - 获取权限列表
- `getPermissionById(id)` - 获取单个权限
- `createPermission(permissionData)` - 创建权限
- `updatePermission(id, permissionData)` - 更新权限
- `deletePermission(id)` - 删除权限

### AuthAPI - 认证管理

- `login(credentials)` - 用户登录
- `logout()` - 用户退出
- `getSession()` - 获取当前会话
- `getPermissions()` - 获取用户权限

### DashboardAPI - 仪表板

- `getStats()` - 获取统计数据
- `getUserGrowth(params)` - 获取用户增长数据
- `getOverview()` - 获取系统概览

### LogAPI - 日志管理

- `getLogs(params)` - 获取日志列表
- `getLogStats(params)` - 获取日志统计
- `deleteLogs(params)` - 删除日志

## 🔧 统一响应格式

所有 API 接口都遵循统一的响应格式：

### 成功响应

```typescript
{
  code: 0,
  data: any,           // 实际数据
  pager?: {            // 分页信息（可选）
    page: number,
    limit: number,
    total: number,
    totalPages: number
  }
}
```

### 失败响应

```typescript
{
  code: -1,            // 错误码
  message: string      // 错误信息
}
```

## 🌐 环境适配

API 层自动检测运行环境：

- **开发/生产环境**：调用真实 API 接口
- **静态部署环境**（GitHub Pages）：使用 Mock 数据

检测逻辑：

```typescript
const isStaticDeployment =
  (typeof window !== 'undefined' &&
    window.location.hostname.includes('github.io')) ||
  process.env.STATIC_EXPORT === 'true';
```

## 🛠️ 工具函数

### buildSearchParams

构建 URL 查询参数：

```typescript
import { buildSearchParams } from '@/service/api';

const params = { name: 'admin', page: 1, limit: 10 };
const queryString = buildSearchParams(params);
// 结果: "name=admin&page=1&limit=10"
```

### apiRequest

通用请求函数：

```typescript
import { apiRequest } from '@/service/api';

const result = await apiRequest('/users', {
  method: 'POST',
  body: JSON.stringify(userData)
});
```

## 📝 开发建议

1. **优先使用分类 API**：新代码建议使用 `UserAPI`、`RoleAPI` 等分类 API，代码更清晰
2. **保持向后兼容**：现有代码可以继续使用 `ApiClient`，无需修改
3. **错误处理**：所有 API 调用都应该包装在 try-catch 中
4. **类型安全**：建议为 API 参数和返回值定义 TypeScript 类型

## 🔄 迁移指南

如果要从 `ApiClient` 迁移到分类 API：

```typescript
// 旧方式
import { ApiClient } from '@/service/request';
const users = await ApiClient.getUsers();

// 新方式
import { UserAPI } from '@/service/api';
const users = await UserAPI.getUsers();
```

迁移是可选的，两种方式可以并存使用。
