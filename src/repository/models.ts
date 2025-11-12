// 与数据库 schema 对齐的领域模型类型定义
// 注意：这里是运行时数据模型（JSON 持久化），字段命名保持与原 schema 一致，便于无缝替换

export type ID = number;

export interface User {
  id: ID;
  email: string;
  username: string;
  password: string; // 已加密哈希
  avatar?: string | null;
  roleId: ID;
  isSuperAdmin?: boolean;
  status?: 'active' | 'disabled';
  lastLoginAt?: string | null; // ISO 字符串
  createdAt?: string; // ISO
  updatedAt?: string; // ISO
}

export interface Role {
  id: ID;
  name: string;
  isSuper?: boolean;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Permission {
  id: ID;
  name: string;
  code: string;
  description?: string | null;
  parentId?: ID | null;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface RolePermission {
  id: ID;
  roleId: ID;
  permissionId: ID;
  createdAt?: string;
}

export interface SystemLog {
  id: ID;
  level: 'info' | 'warn' | 'error' | 'debug';
  action: string;
  module: string;
  message: string;
  details?: unknown;
  userId?: ID | null;
  userAgent?: string | null;
  ip?: string | null;
  requestId?: string | null;
  duration?: number | null;
  createdAt?: string;
}

// 用户操作日志（审计日志）
export type OperationType =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'READ'
  | 'EXPORT'
  | 'LOGIN'
  | 'LOGOUT'
  | 'RESET_PWD';

export interface UserOperationLog {
  id: ID;
  userId: ID;
  username: string; // 冗余字段，便于检索
  operation: OperationType;
  tableName: string; // 被操作的表名
  objectId: string; // 被操作对象的ID
  oldData?: unknown | null; // JSON，变更前数据快照
  newData?: unknown | null; // JSON，变更后数据快照
  description?: string | null; // 操作说明
  ipAddress?: string | null; // IPv4/IPv6
  source?: string | null; // 来源：web/admin/api/cron
  userAgent?: string | null;
  operationAt: string; // 操作时间
  createdAt?: string;
}

// 工单相关模型
export type TicketStatus =
  | 'open'
  | 'in_progress'
  | 'pending'
  | 'resolved'
  | 'closed'
  | 'canceled';
export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Ticket {
  id: ID;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: string;
  tags: string[];
  userId: ID; // 提单人
  assigneeId?: ID | null; // 处理人
  attachmentsCount?: number;
  dueAt?: string | null; // ISO 字符串
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string | null;
  closedAt?: string | null;
}

export interface TicketComment {
  id: ID;
  ticketId: ID;
  userId: ID;
  content: string;
  isInternal: boolean; // 内部备注
  createdAt: string;
  updatedAt?: string;
}

export type TicketEventType =
  | 'created'
  | 'assigned'
  | 'status_changed'
  | 'priority_changed'
  | 'edited'
  | 'sla_changed'
  | 'comment_added'
  | 'tag_changed'
  | 'reopened'
  | 'automated_action';

export interface TicketEvent {
  id: ID;
  ticketId: ID;
  eventType: TicketEventType;
  userId?: ID | null; // 操作者
  oldValue?: unknown;
  newValue?: unknown;
  reason?: string | null;
  createdAt: string;
}

// 通用分页/查询类型
export interface PageQuery {
  page?: number; // 1-based
  limit?: number; // 默认 10
}

export interface PageResult<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
