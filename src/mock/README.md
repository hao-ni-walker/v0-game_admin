# Mock 数据模块

这个模块提供了完整的模拟数据和API接口，用于开发和静态部署。

## 目录结构

```
src/mock/
├── base.ts           # 基础工具和类型定义
├── data/            # 数据模块
│   ├── index.ts     # 数据统一导出
│   ├── user.ts      # 用户数据
│   ├── role.ts      # 角色数据
│   ├── permission.ts # 权限数据
│   ├── auth.ts      # 认证数据
│   ├── dashboard.ts # 仪表板数据
│   └── log.ts       # 日志数据
├── api/             # API模块
│   ├── index.ts     # API统一导出
│   ├── user.ts      # 用户API
│   ├── role.ts      # 角色API
│   ├── permission.ts # 权限API
│   ├── auth.ts      # 认证API
│   ├── dashboard.ts # 仪表板API
│   └── log.ts       # 日志API
└── index.ts         # 主导出文件
```

## 使用方式

### 基本用法

```typescript
import { mockAPI } from '@/mock';

// 用户相关
const users = await mockAPI.user.getUsers();
const user = await mockAPI.user.getUserById(1);

// 认证相关
const loginResult = await mockAPI.auth.login({
  email: 'admin@example.com',
  password: '123456'
});

const session = await mockAPI.auth.getSession();
const permissions = await mockAPI.auth.getPermissions();
```

### 单独导入API类

```typescript
import { MockUserAPI, MockAuthAPI } from '@/mock';

const userAPI = new MockUserAPI();
const authAPI = new MockAuthAPI();

// 使用API
const users = await userAPI.getUsers();
const session = await authAPI.getSession();
```

### 数据访问

```typescript
import { mockUsers, mockRoles, mockPermissions } from '@/mock';

// 直接访问数据
console.log(mockUsers);
console.log(mockRoles);
console.log(mockPermissions);
```

## 认证API说明

### 登录

```typescript
const result = await mockAPI.auth.login({
  email: 'admin@example.com',
  password: '123456'
});

// 返回格式
{
  code: 0,
  data: {
    token: "mock-jwt-token-xxx",
    user: {
      id: 1,
      name: "admin",
      email: "admin@example.com",
      role: "admin"
    }
  }
}
```

### 获取会话

```typescript
const session = await mockAPI.auth.getSession();

// 返回格式
{
  code: 0,
  data: {
    user: {
      id: 1,
      name: "admin",
      email: "admin@example.com",
      role: "admin"
    }
  }
}
```

### 获取权限

```typescript
const permissions = await mockAPI.auth.getPermissions();

// 返回格式
{
  code: 0,
  data: [
    "user:read", "user:write",
    "role:read", "role:write",
    "permission:read", "permission:write",
    "dashboard:read", "log:read", "log:write"
  ]
}
```

### 注销

```typescript
const result = await mockAPI.auth.logout();

// 返回格式
{
  code: 0,
  data: { message: "注销成功" }
}
```

## 预设用户账号

### 管理员账号

- 邮箱: `admin@example.com`
- 密码: `123456`
- 角色: `admin`
- 权限: 所有权限

### 编辑者账号

- 邮箱: `editor@example.com`
- 密码: `123456`
- 角色: `editor`
- 权限: 用户读写、角色读取、权限读取、仪表板读取

### 普通用户账号

- 邮箱: `user@example.com`
- 密码: `123456`
- 角色: `user`
- 权限: 用户读取、仪表板读取

## 统一响应格式

所有API都遵循统一的响应格式：

### 成功响应

```typescript
{
  code: 0,
  data: any,          // 响应数据
  pager?: {           // 分页信息（可选）
    page: number,
    limit: number,
    total: number,
    totalPages: number
  }
}
```

### 错误响应

```typescript
{
  code: -1,
  message: string     // 错误信息
}
```

## 特性

1. **完整的CRUD操作**: 支持创建、读取、更新、删除操作
2. **分页支持**: 内置分页功能，支持搜索和过滤
3. **数据持久化**: 在内存中保持数据状态
4. **类型安全**: 完整的TypeScript类型定义
5. **响应格式统一**: 与真实API保持一致的响应格式
6. **权限模拟**: 完整的用户权限和角色管理
7. **会话管理**: 模拟真实的用户会话和token管理

## 环境检测

```typescript
import { isStaticEnvironment } from '@/mock';

if (isStaticEnvironment()) {
  // 使用mock API
} else {
  // 使用真实API
}
```

这个函数会检测当前是否为静态部署环境（GitHub Pages、Vercel等）。
