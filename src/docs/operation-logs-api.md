## 用户操作日志（审计日志）API 文档

### API 端点

#### 1. 获取操作日志列表

**端点**: `POST /api/user-operation-logs/list`

**请求体示例**:

```json
{
  "keyword": "tickets",
  "userIds": [1001, 1002],
  "usernames": ["admin", "ops_admin"],
  "operations": ["UPDATE", "DELETE"],
  "tables": ["tickets", "ticket_comments"],
  "objectId": "8800123",
  "ipAddress": "203.0.113.45",
  "hasDiff": true,
  "from": "2025-11-10T00:00:00Z",
  "to": "2025-11-12T23:59:59Z",
  "sortBy": "operationAt",
  "sortDir": "desc",
  "page": 1,
  "pageSize": 20
}
```

**响应体示例**:

```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": 912345,
      "userId": 1001,
      "username": "ops_admin",
      "operation": "UPDATE",
      "tableName": "tickets",
      "objectId": "8800123",
      "oldData": { "status": "open", "assigneeId": null },
      "newData": { "status": "in_progress", "assigneeId": 2001 },
      "description": "指派工单并开始处理",
      "ipAddress": "203.0.113.45",
      "source": "web",
      "userAgent": "Mozilla/5.0",
      "operationAt": "2025-11-12T03:41:20Z",
      "createdAt": "2025-11-12T03:41:20Z"
    }
  ],
  "pager": {
    "total": 421,
    "page": 1,
    "limit": 20,
    "totalPages": 22
  }
}
```

#### 2. 导出操作日志

**端点**: `POST /api/user-operation-logs/export`

**请求体**: 与列表查询相同的筛选参数（不含分页参数）

**响应体示例**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "message": "导出任务已创建，请稍后在下载中心查看",
    "taskId": "export_1699999999999"
  }
}
```

---

## 字段说明

### 核心字段

- **id**: 主键，自增，用于跳转详情与问题定位
- **userId**: 操作发起者的用户标识
- **username**: 用户名冗余字段，便于检索与审计导出
- **operation**: 操作类型枚举
  - `CREATE` - 创建
  - `UPDATE` - 更新
  - `DELETE` - 删除
  - `READ` - 读取
  - `EXPORT` - 导出
  - `LOGIN` - 登录
  - `LOGOUT` - 登出
  - `RESET_PWD` - 重置密码
- **tableName**: 被操作的数据表名
- **objectId**: 被操作记录的主键或业务唯一键
- **oldData**: JSON，变更前字段快照（仅 UPDATE/DELETE 填充）
- **newData**: JSON，变更后字段快照（INSERT/UPDATE 填充）
- **description**: 操作说明，记录业务动作原因、来源模块等
- **ipAddress**: IPv4/IPv6 地址（最长 45 字符）
- **source**: 来源标识（web/admin/api/cron）
- **userAgent**: 用户代理字符串
- **operationAt**: 操作时间戳

### 筛选参数

- **keyword**: 对 username、tableName、objectId、description 模糊匹配
- **userIds**: 用户ID数组筛选
- **usernames**: 用户名数组筛选
- **operations**: 操作类型数组筛选（多选）
- **tables**: 表名数组筛选（多选）
- **objectId**: 对象ID等值匹配
- **ipAddress**: IP地址等值或 CIDR 范围过滤
- **hasDiff**: 布尔值，为 true 时仅返回有数据变更的记录
- **from/to**: ISO 时间范围筛选

### 排序与分页

- **sortBy**: 排序字段（默认: operationAt）
  - 可选: operationAt, userId, username, tableName, operation, id
- **sortDir**: 排序方向（默认: desc）
  - asc - 升序
  - desc - 降序
- **page**: 页码（默认: 1）
- **pageSize**: 每页数量（默认: 20，最大: 100）

---

## 安全与性能建议

### 数据脱敏

- 对 oldData/newData 中的 PII、密钥、支付信息、手机号、邮箱做掩码
- 敏感字段使用黑名单，不入库或仅入库摘要
- 导出时同样需要脱敏处理

### 字段差异渲染

- 前端对 oldData/newData 做字段级 diff 高亮
- 后端可选择性预计算 changed_keys 字段提升性能
- 支持只显示有变化的键值对

### 来源追踪

- 在 source 字段记录来源（web/admin/api/cron）
- 保留 userAgent 便于追责和异常检测

### 保留策略

- 设置保留期（如 90/180 天）
- 冷数据定期归档到对象存储或 OLAP 系统
- 提供定期清理机制

### 索引优化

建议索引:

- userId
- username
- operation
- tableName
- objectId
- operationAt
- ipAddress（前缀索引）

### 性能优化

- 避免对 oldData/newData JSON 字段做全文模糊搜索
- 如需按键过滤，考虑存储 changed_keys 数组并建 GIN 索引
- 或将关键字段冗余到独立列

---

## 前端页面路径

- **系统日志列表**: `/dashboard/system/logs`
- **用户操作日志列表**: `/dashboard/system/logs/operation`

---

## 下一步实现建议

### 后端数据库实现

1. 创建 user_operation_logs 表
2. 实现数据库查询逻辑（支持所有筛选条件）
3. 添加触发器自动记录关键表的变更
4. 实现异步导出功能（CSV/Excel）
5. 添加数据归档和清理定时任务

### 告警与监控

1. 基于 operation、table、user 维度做速率阈值检测
2. 短时大量 DELETE/EXPORT 触发告警
3. 异常 IP 访问模式检测
4. 敏感操作实时通知

### 审计报表

1. 按用户统计操作频次
2. 按表统计变更热度
3. 按时间段统计操作趋势
4. 导出审计报告
