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

export interface TicketAttachment {
  id: ID;
  ticketId: ID;
  filename: string;
  filePath: string;
  fileSize: number; // 字节
  contentType: string;
  uploadedAt: string;
  uploadedBy?: ID | null; // 上传人
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

// 支付渠道模型
export type PaymentChannelType = 1 | 2; // 1=充值 2=提现
export type ChannelType = 'alipay' | 'wechat' | 'bank' | 'usdt' | 'other';

export interface PaymentChannel {
  id: ID;
  name: string; // 运营展示名称
  code: string; // 全局唯一渠道代码
  type: PaymentChannelType; // 1=充值 2=提现
  channelType: ChannelType; // alipay/wechat/bank/usdt等
  config: Record<string, unknown>; // JSON配置：商户号、密钥、回调URL等
  minAmount: number; // 最小金额
  maxAmount: number; // 最大金额
  dailyLimit: number; // 每日限额
  feeRate: number; // 费率(如0.0065表示0.65%)
  fixedFee: number; // 固定费用
  sortOrder: number; // 排序
  status: 0 | 1; // 1=启用 0=停用
  version: number; // 乐观锁版本
  createdAt: string; // ISO
  updatedAt: string; // ISO
  removed: boolean; // 逻辑删除
  disabled: boolean; // 紧急禁用开关
}

// 活动管理模型
export type ActivityStatus =
  | 'draft'
  | 'scheduled'
  | 'active'
  | 'paused'
  | 'ended'
  | 'disabled';

export type ActivityType =
  | 'first_deposit'
  | 'daily_signin'
  | 'vip_reward'
  | 'limited_pack'
  | 'lottery'
  | 'leaderboard'
  | 'cashback'
  | 'referral'
  | 'other';

export interface Activity {
  id: ID;
  activityCode: string; // 唯一业务主键
  activityType: ActivityType; // 活动类型
  name: string; // 活动标题
  description: string; // 活动说明
  startTime: string; // 生效时间（ISO字符串）
  endTime: string; // 结束时间
  displayStartTime?: string | null; // 展示开始时间
  displayEndTime?: string | null; // 展示结束时间
  status: ActivityStatus; // 状态
  priority: number; // 展示优先级（数值越大越靠前）
  participationConfig: Record<string, unknown>; // 参与配置 JSONB
  extraConfig: Record<string, unknown>; // 扩展配置 JSONB
  totalParticipants: number; // 累计参与人次
  totalRewardsGiven: number; // 累计发放奖励
  iconUrl?: string | null; // 图标资源
  bannerUrl?: string | null; // 横幅资源
  createdBy: ID; // 创建者ID
  updatedBy: ID; // 更新者ID
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

// 玩家管理模型
export type RegistrationMethod =
  | 'email'
  | 'google'
  | 'apple'
  | 'phone'
  | 'facebook'
  | 'other';
export type IdentityCategory = 'user' | 'agent' | 'internal' | 'test';

export interface Player {
  id: ID;
  idname: string; // 邮箱哈希16位，用于对外标识
  username: string; // 登录标识
  email: string; // 登录与找回渠道
  balance: number; // 账户余额 Numeric(10,2)
  vipLevel: number; // VIP等级
  status: boolean; // true=启用 false=停用
  agent?: string | null; // 代理商标识
  directSuperiorId?: ID | null; // 直属上级ID
  registrationMethod: RegistrationMethod; // 注册方式
  registrationSource?: string | null; // 注册来源
  loginSource?: string | null; // 最新登录来源
  identityCategory: IdentityCategory; // 身份类别
  lastLogin?: string | null; // 最后登录时间 ISO
  createdAt: string; // ISO
  updatedAt: string; // ISO
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
