# 用户管理API

<cite>
**本文档引用的文件**  
- [users.json](file://data/users.json)
- [route.ts](file://src/app/api/users/route.ts)
- [user.ts](file://src/service/api/user.ts)
- [response.ts](file://src/service/response.ts)
- [models.ts](file://src/repository/models.ts)
- [types.ts](file://src/app/dashboard/account/user/types.ts)
</cite>

## 目录
1. [简介](#简介)
2. [API概览](#api概览)
3. [接口详细说明](#接口详细说明)
   - [GET /api/users - 获取用户列表](#get-apiusers---获取用户列表)
   - [POST /api/users - 创建用户](#post-apiusers---创建用户)
   - [GET /api/users/[id] - 获取单个用户](#get-apiusersid---获取单个用户)
   - [PUT /api/users/[id] - 更新用户信息](#put-apiusersid---更新用户信息)
   - [DELETE /api/users/[id] - 删除用户](#delete-apiusersid---删除用户)
4. [数据结构定义](#数据结构定义)
5. [请求响应示例](#请求响应示例)
6. [错误处理](#错误处理)

## 简介

用户管理API提供了对系统用户进行增删改查的完整功能，支持分页、搜索和状态管理。该API是系统权限和用户体系的核心组成部分，所有操作均记录操作日志并进行权限校验。

**Section sources**
- [route.ts](file://src/app/api/users/route.ts#L1-L120)

## API概览

用户管理API提供以下五个核心接口：

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/users | 获取用户列表（支持分页和搜索） |
| POST | /api/users | 创建新用户 |
| GET | /api/users/[id] | 获取单个用户信息 |
| PUT | /api/users/[id] | 更新用户信息 |
| DELETE | /api/users/[id] | 删除用户 |

所有接口均返回统一的响应格式，包含code、data、message和分页信息。

**Section sources**
- [user.ts](file://src/service/api/user.ts#L4-L42)
- [response.ts](file://src/service/response.ts#L3-L14)

## 接口详细说明

### GET /api/users - 获取用户列表

获取用户列表，支持分页、搜索和条件过滤。

**请求信息**
- **方法**: GET
- **路径**: `/api/users`
- **请求头**: 
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>`

**查询参数**
| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| page | number | 否 | 页码（默认1） |
| limit | number | 否 | 每页数量（默认10） |
| username | string | 否 | 用户名模糊搜索 |
| email | string | 否 | 邮箱精确搜索 |
| roleId | number | 否 | 角色ID过滤 |
| status | string | 否 | 状态过滤（active/disabled） |
| startDate | string | 否 | 创建时间起始（ISO格式） |
| endDate | string | 否 | 创建时间结束（ISO格式） |

**响应结构**
```json
{
  "code": 0,
  "data": [...],
  "pager": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

**HTTP状态码**
- 200: 成功获取用户列表
- 500: 服务器错误

**Section sources**
- [route.ts](file://src/app/api/users/route.ts#L8-L39)

### POST /api/users - 创建用户

创建新用户。

**请求信息**
- **方法**: POST
- **路径**: `/api/users`
- **请求头**: 
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>`

**请求体**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "roleId": "string",
  "status": "active|disabled"
}
```

| 字段 | 类型 | 必填 | 描述 |
|------|------|------|------|
| username | string | 是 | 用户名 |
| email | string | 是 | 邮箱 |
| password | string | 是 | 密码（明文，服务端加密） |
| roleId | string | 是 | 角色ID |
| status | string | 否 | 状态（默认active） |

**响应结构**
```json
{
  "code": 0,
  "data": {
    "message": "用户创建成功"
  }
}
```

**HTTP状态码**
- 200: 用户创建成功
- 400: 缺少必填字段或用户名已存在
- 500: 服务器错误

**Section sources**
- [route.ts](file://src/app/api/users/route.ts#L45-L118)

### GET /api/users/[id] - 获取单个用户

获取指定ID的用户信息。

**请求信息**
- **方法**: GET
- **路径**: `/api/users/[id]`
- **请求头**: 
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>`

**路径参数**
| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| id | number | 是 | 用户ID |

**响应结构**
```json
{
  "code": 0,
  "data": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "roleId": "1",
    "status": "active",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "lastLoginAt": "2025-11-11T13:06:59.744Z",
    "isSuperAdmin": true
  }
}
```

**HTTP状态码**
- 200: 成功获取用户信息
- 404: 用户不存在
- 500: 服务器错误

**Section sources**
- [user.ts](file://src/service/api/user.ts#L16-L18)

### PUT /api/users/[id] - 更新用户信息

更新指定ID的用户信息。

**请求信息**
- **方法**: PUT
- **路径**: `/api/users/[id]`
- **请求头**: 
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>`

**路径参数**
| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| id | number | 是 | 用户ID |

**请求体**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "roleId": "string",
  "status": "active|disabled"
}
```

| 字段 | 类型 | 必填 | 描述 |
|------|------|------|------|
| username | string | 否 | 用户名 |
| email | string | 否 | 邮箱 |
| password | string | 否 | 新密码（明文，服务端加密） |
| roleId | string | 否 | 角色ID |
| status | string | 否 | 状态 |

**特殊规则**
- 超级管理员用户不能被禁用
- 超级管理员用户的基本信息不能被修改

**响应结构**
```json
{
  "code": 0,
  "data": {
    "message": "用户更新成功"
  }
}
```

**HTTP状态码**
- 200: 用户更新成功
- 400: 用户不存在
- 403: 尝试修改超级管理员
- 500: 服务器错误

**Section sources**
- [route.ts](file://src/app/api/users/[id]/route.ts#L15-L103)

### DELETE /api/users/[id] - 删除用户

删除指定ID的用户。

**请求信息**
- **方法**: DELETE
- **路径**: `/api/users/[id]`
- **请求头**: 
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>`

**路径参数**
| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| id | number | 是 | 用户ID |

**特殊规则**
- 超级管理员用户不能被删除

**响应结构**
```json
{
  "code": 0,
  "data": {
    "message": "用户删除成功"
  }
}
```

**HTTP状态码**
- 200: 用户删除成功
- 404: 用户不存在
- 403: 尝试删除超级管理员
- 500: 服务器错误

**Section sources**
- [route.ts](file://src/app/api/users/[id]/route.ts#L115-L154)

## 数据结构定义

### User对象

用户数据结构定义。

```typescript
interface User {
  id: number;
  username: string;
  email: string;
  roleId: string;
  createdAt: string;
  lastLoginAt?: string;
  status: 'active' | 'disabled';
  isSuperAdmin?: boolean;
  role?: {
    id: number;
    name: string;
  };
}
```

**字段说明**
| 字段 | 类型 | 描述 |
|------|------|------|
| id | number | 用户唯一标识 |
| username | string | 用户名 |
| email | string | 邮箱地址 |
| roleId | string | 角色ID |
| createdAt | string | 创建时间（ISO格式） |
| lastLoginAt | string | 最后登录时间 |
| status | string | 状态（active/disabled） |
| isSuperAdmin | boolean | 是否为超级管理员 |
| role | object | 角色信息（包含id和name） |

**Section sources**
- [types.ts](file://src/app/dashboard/account/user/types.ts#L1-L13)
- [models.ts](file://src/repository/models.ts#L6-L17)

## 请求响应示例

### 获取用户列表示例

**请求**
```
GET /api/users?page=1&limit=10&username=admin HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**响应**
```json
{
  "code": 0,
  "data": [
    {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com",
      "roleId": "1",
      "status": "active",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "lastLoginAt": "2025-11-11T13:06:59.744Z",
      "isSuperAdmin": true
    }
  ],
  "pager": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

### 创建用户示例

**请求**
```json
POST /api/users HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "password123",
  "roleId": "2",
  "status": "active"
}
```

**响应**
```json
{
  "code": 0,
  "data": {
    "message": "用户创建成功"
  }
}
```

### 获取单个用户示例

**请求**
```
GET /api/users/1 HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**响应**
```json
{
  "code": 0,
  "data": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "roleId": "1",
    "status": "active",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "lastLoginAt": "2025-11-11T13:06:59.744Z",
    "isSuperAdmin": true
  }
}
```

**Section sources**
- [users.json](file://data/users.json#L1-L15)

## 错误处理

### 统一响应格式

所有API响应遵循统一格式：

```typescript
interface ApiResponse<T = any> {
  code: number;
  data?: T;
  message?: string;
  pager?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

### 常见错误码

| code | HTTP状态码 | message | 说明 |
|------|-----------|---------|------|
| 0 | 200 | - | 成功 |
| -1 | 200/404/500 | 具体错误信息 | 失败 |

### 错误响应示例

**缺少必填字段**
```json
{
  "code": -1,
  "message": "请填写所有必填字段"
}
```

**用户名已存在**
```json
{
  "code": -1,
  "message": "用户名已存在"
}
```

**用户不存在**
```json
{
  "code": -1,
  "message": "用户不存在"
}
```

**Section sources**
- [response.ts](file://src/service/response.ts#L3-L80)