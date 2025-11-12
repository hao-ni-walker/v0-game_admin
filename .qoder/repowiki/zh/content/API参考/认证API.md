# 认证API

<cite>
**本文档引用文件**  
- [login/route.ts](file://src/app/api/auth/login/route.ts)
- [logout/route.ts](file://src/app/api/auth/logout/route.ts)
- [session/route.ts](file://src/app/api/auth/session/route.ts)
- [permissions/route.ts](file://src/app/api/auth/permissions/route.ts)
- [auth.ts](file://src/service/api/auth.ts)
- [auth.ts](file://src/lib/auth.ts)
- [response.ts](file://src/service/response.ts)
- [logger.ts](file://src/lib/logger.ts)
- [server-permissions.ts](file://src/lib/server-permissions.ts)
- [types.ts](file://src/types/auth.ts)
</cite>

## 目录
1. [登录端点 (/auth/login)](#登录端点-authlogin)
2. [登出端点 (/auth/logout)](#登出端点-authlogout)
3. [会话端点 (/auth/session)](#会话端点-authsession)
4. [权限端点 (/auth/permissions)](#权限端点-authpermissions)
5. [JWT认证机制](#jwt认证机制)
6. [接口调用示例](#接口调用示例)
7. [错误处理](#错误处理)

## 登录端点 (/auth/login)

`/auth/login` 端点用于用户身份验证，通过POST请求接收JSON格式的用户名和密码，验证成功后返回包含JWT令牌的响应。

### 请求详情
- **HTTP方法**: POST
- **路径**: `/auth/login`
- **请求头**: `Content-Type: application/json`
- **请求体**: 包含 `email` 和 `password` 字段的JSON对象

### 成功响应
当认证成功时，服务器返回200状态码，并在响应体中包含JWT令牌和用户信息。同时，服务器会在响应头中设置名为 `token` 的HTTP-only Cookie，用于后续请求的身份验证。

响应格式：
```json
{
  "code": 0,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "admin@example.com"
    }
  },
  "message": "登录成功"
}
```

### 失败响应
当认证失败时（如邮箱或密码错误），服务器返回401状态码，并提供相应的错误信息。

响应格式：
```json
{
  "code": -1,
  "message": "邮箱或密码错误"
}
```

### 安全与日志
系统会记录所有登录尝试，包括成功和失败的事件。登录成功时，会更新用户的最后登录时间，并记录包含用户ID、用户名、邮箱和令牌有效期的详细日志。

**Section sources**
- [login/route.ts](file://src/app/api/auth/login/route.ts#L1-L87)
- [response.ts](file://src/service/response.ts#L57-L67)
- [logger.ts](file://src/lib/logger.ts#L129-L201)

## 登出端点 (/auth/logout)

`/auth/logout` 端点用于用户登出，通过POST请求清除用户的会话状态。

### 请求详情
- **HTTP方法**: POST
- **路径**: `/auth/logout`
- **认证要求**: 请求头中需包含有效的 `token` Cookie

### 响应
无论用户是否已登录，该端点都会返回成功响应（200状态码），表示登出操作已完成。服务器会记录登出事件，包括用户ID、用户名和登出时间。

响应格式：
```json
{
  "code": 0,
  "message": "退出成功"
}
```

### 安全与日志
系统会检查请求中的JWT令牌以获取用户信息，并记录登出日志。即使令牌无效，系统仍允许登出操作，以确保用户能够完全退出。

**Section sources**
- [logout/route.ts](file://src/app/api/auth/logout/route.ts#L1-L43)
- [logger.ts](file://src/lib/logger.ts#L129-L201)

## 会话端点 (/auth/session)

`/auth/session` 端点用于获取当前用户的会话信息，通过GET请求返回用户的身份数据。

### 请求详情
- **HTTP方法**: GET
- **路径**: `/auth/session`
- **认证要求**: 请求头中需包含有效的 `token` Bearer Token 或 Cookie

### 成功响应
当用户已登录且令牌有效时，服务器返回200状态码，并在响应体中包含用户会话信息。

响应格式：
```json
{
  "code": 0,
  "data": {
    "user": {
      "id": 1,
      "email": "admin@example.com",
      "username": "admin",
      "avatar": "/avatars/admin.jpg",
      "roleId": "1"
    }
  }
}
```

### 失败响应
当用户未登录或令牌无效时，服务器返回401状态码。

响应格式：
```json
{
  "code": -1,
  "message": "未登录"
}
```

### 实现机制
该端点依赖于 `auth()` 函数从Cookie中提取并验证JWT令牌，解析出用户信息后返回。

**Section sources**
- [session/route.ts](file://src/app/api/auth/session/route.ts#L1-L8)
- [auth.ts](file://src/lib/auth.ts#L18-L43)

## 权限端点 (/auth/permissions)

`/auth/permissions` 端点用于获取当前用户的权限列表，通过GET请求返回用户拥有的所有权限代码。

### 请求详情
- **HTTP方法**: GET
- **路径**: `/auth/permissions`
- **认证要求**: 请求头中需包含有效的 `token` Bearer Token 或 Cookie

### 成功响应
当用户已登录且令牌有效时，服务器返回200状态码，并在响应体中包含用户的权限代码数组。

响应格式：
```json
{
  "code": 0,
  "data": [
    "account.user.read",
    "account.role.read",
    "system.log.read"
  ]
}
```

### 失败响应
当用户未登录或令牌无效时，服务器返回401状态码。

响应格式：
```json
{
  "code": -1,
  "message": "未登录"
}
```

### 权限获取逻辑
系统根据用户的角色和权限分配来确定其权限。超级管理员拥有所有权限，普通用户则根据其角色关联的权限列表获取相应权限代码。

**Section sources**
- [permissions/route.ts](file://src/app/api/auth/permissions/route.ts#L1-L22)
- [server-permissions.ts](file://src/lib/server-permissions.ts#L27-L66)

## JWT认证机制

v0-game_admin系统采用JWT（JSON Web Token）作为主要的认证机制，确保API请求的安全性和无状态性。

### 令牌生成
当用户成功登录时，系统使用 `jsonwebtoken` 库的 `sign` 函数生成JWT令牌。令牌的载荷（payload）包含以下用户信息：
- `id`: 用户ID
- `email`: 用户邮箱
- `username`: 用户名
- `roleId`: 角色ID
- `avatar`: 头像URL
- `isSurperAdmin`: 是否为超级管理员

### 令牌有效期
JWT令牌的有效期设置为 **24小时**（`expiresIn: '1d'`）。过期后，用户需要重新登录以获取新的令牌。

### 令牌存储
服务器在成功登录的响应中，通过 `Set-Cookie` 头部将JWT令牌设置为HTTP-only Cookie，防止XSS攻击。Cookie的属性包括：
- `httpOnly`: true（防止JavaScript访问）
- `secure`: 生产环境为true（仅通过HTTPS传输）
- `sameSite`: strict（防止CSRF攻击）
- `maxAge`: 86400秒（24小时）

### 令牌验证
系统通过 `auth()` 函数验证JWT令牌：
1. 从请求的Cookie中提取 `token`
2. 使用 `jsonwebtoken` 的 `verify` 函数解码和验证令牌
3. 如果验证成功，返回包含用户信息的会话对象；否则返回 `null`

### 刷新策略
当前系统未实现令牌刷新机制。当令牌过期后，前端应用需引导用户重新登录。建议在未来的版本中实现刷新令牌（Refresh Token）机制，以提升用户体验。

**Section sources**
- [login/route.ts](file://src/app/api/auth/login/route.ts#L34-L44)
- [auth.ts](file://src/lib/auth.ts#L18-L43)
- [auth.ts](file://src/lib/auth.ts#L48-L61)

## 接口调用示例

以下示例展示了如何使用 `fetch` 和 `curl` 调用认证API。

### 使用 fetch 调用登录接口
```javascript
async function login(email, password) {
  try {
    const response = await fetch('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (data.code === 0) {
      console.log('登录成功');
      // 令牌已自动存储在Cookie中
    } else {
      console.error('登录失败:', data.message);
    }
  } catch (error) {
    console.error('请求失败:', error);
  }
}

// 调用示例
login('admin@example.com', 'Admin@123456');
```

### 使用 fetch 调用会话接口
```javascript
async function getSession() {
  try {
    const response = await fetch('/auth/session');
    const data = await response.json();
    if (data.code === 0) {
      console.log('当前用户:', data.data.user);
    } else {
      console.error('获取会话失败:', data.message);
    }
  } catch (error) {
    console.error('请求失败:', error);
  }
}

// 调用示例
getSession();
```

### 使用 fetch 调用权限接口
```javascript
async function getPermissions() {
  try {
    const response = await fetch('/auth/permissions');
    const data = await response.json();
    if (data.code === 0) {
      console.log('用户权限:', data.data);
    } else {
      console.error('获取权限失败:', data.message);
    }
  } catch (error) {
    console.error('请求失败:', error);
  }
}

// 调用示例
getPermissions();
```

### 使用 fetch 调用登出接口
```javascript
async function logout() {
  try {
    const response = await fetch('/auth/logout', {
      method: 'POST',
    });
    const data = await response.json();
    if (data.code === 0) {
      console.log('登出成功');
      // 前端应重定向到登录页
    } else {
      console.error('登出失败:', data.message);
    }
  } catch (error) {
    console.error('请求失败:', error);
  }
}

// 调用示例
logout();
```

### 使用 curl 调用登录接口
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin@123456"}' \
  -c cookies.txt
```

### 使用 curl 调用会话接口
```bash
curl http://localhost:3000/auth/session \
  -b cookies.txt
```

### 使用 curl 调用权限接口
```bash
curl http://localhost:3000/auth/permissions \
  -b cookies.txt
```

### 使用 curl 调用登出接口
```bash
curl -X POST http://localhost:3000/auth/logout \
  -b cookies.txt \
  -c cookies.txt
```

**Section sources**
- [auth.ts](file://src/service/api/auth.ts#L3-L28)
- [login/route.ts](file://src/app/api/auth/login/route.ts#L1-L87)

## 错误处理

系统实现了全面的错误处理机制，确保API的稳定性和安全性。

### HTTP状态码
- **200 OK**: 请求成功（包括业务逻辑错误，如401未授权）
- **401 Unauthorized**: 用户未登录或认证失败
- **500 Internal Server Error**: 服务器内部错误

### 统一响应格式
所有API响应遵循统一的格式，包含 `code`、`data` 和 `message` 字段：
- `code`: 0表示成功，非0表示失败
- `data`: 成功时的返回数据
- `message`: 人类可读的描述信息

### 异常捕获
每个API端点都使用 `try-catch` 块捕获潜在的运行时错误。对于服务器内部错误，系统会记录详细的错误日志（包括堆栈跟踪），并向客户端返回通用的错误消息，避免泄露敏感信息。

### 日志记录
系统使用 `logger` 模块记录所有关键操作：
- **登录**: 记录成功和失败的登录尝试
- **登出**: 记录用户的登出事件
- **错误**: 记录服务器内部错误的详细信息

日志条目包含时间戳、用户代理、IP地址和请求ID，便于审计和故障排查。

**Section sources**
- [response.ts](file://src/service/response.ts#L33-L43)
- [login/route.ts](file://src/app/api/auth/login/route.ts#L77-L86)
- [logout/route.ts](file://src/app/api/auth/logout/route.ts#L34-L41)
- [logger.ts](file://src/lib/logger.ts#L19-L49)