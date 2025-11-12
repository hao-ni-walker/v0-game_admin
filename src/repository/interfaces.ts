// 定义仓储接口，便于后续替换实现（JSON/内存/远端 API/数据库）
// 设计目标：与现有 API 路由的筛选、分页、统计能力匹配

import {
  ID,
  PageQuery,
  PageResult,
  Permission,
  Role,
  RolePermission,
  SystemLog,
  User,
  Ticket,
  TicketComment,
  TicketEvent,
  TicketStatus,
  TicketPriority,
  PaymentChannel,
  PaymentChannelType,
  ChannelType,
  Activity,
  ActivityStatus,
  ActivityType,
  Player,
  RegistrationMethod,
  IdentityCategory
} from './models';

export interface UsersFilter extends PageQuery {
  username?: string;
  email?: string;
  roleId?: ID;
  status?: 'active' | 'disabled' | 'all';
  startDate?: string; // ISO
  endDate?: string; // ISO
}

export interface RolesFilter extends PageQuery {
  name?: string;
  startDate?: string;
  endDate?: string;
}

export interface PermissionsFilter extends PageQuery {
  name?: string;
  code?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}

export interface LogsFilter extends PageQuery {
  level?: 'info' | 'warn' | 'error' | 'debug';
  module?: string;
  action?: string;
  search?: string; // message like
  startDate?: string;
  endDate?: string;
}

export interface TicketsFilter extends PageQuery {
  keyword?: string;
  statuses?: TicketStatus[];
  priorities?: TicketPriority[];
  categories?: string[];
  tagsAny?: string[];
  tagsAll?: string[];
  userIds?: ID[];
  assigneeIds?: ID[];
  onlyUnassigned?: boolean;
  createdFrom?: string;
  createdTo?: string;
  updatedFrom?: string;
  updatedTo?: string;
  dueFrom?: string;
  dueTo?: string;
  resolvedFrom?: string;
  resolvedTo?: string;
  closedFrom?: string;
  closedTo?: string;
  onlyOverdue?: boolean;
  dueWithinMinutes?: number;
  myTickets?: boolean;
  currentUserId?: ID;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface PaymentChannelsFilter extends PageQuery {
  keyword?: string; // 匹配name、code
  types?: PaymentChannelType[]; // 1/2多选
  channelTypes?: ChannelType[]; // alipay/wechat等
  status?: 0 | 1; // 启用/停用
  disabled?: boolean; // 紧急禁用
  showRemoved?: boolean; // 显示已删除
  minAmountMaxlte?: number; // 筛选min_amount <= 此值
  maxAmountMingte?: number; // 筛选max_amount >= 此值
  feeRateMin?: number;
  feeRateMax?: number;
  fixedFeeMin?: number;
  fixedFeeMax?: number;
  dailyLimitMin?: number;
  dailyLimitMax?: number;
  createdFrom?: string;
  createdTo?: string;
  updatedFrom?: string;
  updatedTo?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface UsersRepository {
  list(
    filter: UsersFilter
  ): Promise<PageResult<User & { role?: Pick<Role, 'id' | 'name'> }>>;
  findByUsername(username: string): Promise<User | undefined>;
  findByEmail(email: string): Promise<User | undefined>;
  getById(id: ID): Promise<User | undefined>;
  create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<ID>;
  update(id: ID, patch: Partial<User>): Promise<void>;
  delete(id: ID): Promise<void>;
}

export interface RolesRepository {
  list(filter: RolesFilter): Promise<PageResult<Role & { userCount: number }>>;
  getById(id: ID): Promise<Role | undefined>;
  findByName(name: string): Promise<Role | undefined>;
  create(role: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>): Promise<ID>;
  update(id: ID, patch: Partial<Role>): Promise<void>;
  delete(id: ID): Promise<void>;
}

export interface PermissionsRepository {
  list(filter: PermissionsFilter): Promise<PageResult<Permission>>;
  getById(id: ID): Promise<Permission | undefined>;
  findByCode(code: string): Promise<Permission | undefined>;
  create(p: Omit<Permission, 'id' | 'createdAt' | 'updatedAt'>): Promise<ID>;
  update(id: ID, patch: Partial<Permission>): Promise<void>;
  delete(id: ID): Promise<void>;
}

export interface RolePermissionsRepository {
  listByRole(roleId: ID): Promise<RolePermission[]>;
  add(roleId: ID, permissionId: ID): Promise<ID>; // 去重
  remove(roleId: ID, permissionId: ID): Promise<void>;
}

export interface LogsRepository {
  list(
    filter: LogsFilter
  ): Promise<PageResult<SystemLog & { username?: string }>>;
  removeBefore(dateISO: string): Promise<void>;
  append(log: Omit<SystemLog, 'id' | 'createdAt'>): Promise<ID>;
}

export interface TicketsRepository {
  list(
    filter: TicketsFilter
  ): Promise<
    PageResult<
      Ticket & { sla?: { isOverdue: boolean; remainingMinutes: number } }
    >
  >;
  getById(
    id: ID
  ): Promise<
    | (Ticket & { comments?: TicketComment[]; events?: TicketEvent[] })
    | undefined
  >;
  create(ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>): Promise<ID>;
  update(id: ID, patch: Partial<Ticket>): Promise<void>;
  delete(id: ID): Promise<void>;
  assign(id: ID, assigneeId: ID | null, userId?: ID): Promise<void>;
  changeStatus(
    id: ID,
    status: TicketStatus,
    reason?: string,
    userId?: ID
  ): Promise<void>;
  addComment(comment: Omit<TicketComment, 'id' | 'createdAt'>): Promise<ID>;
  addEvent(event: Omit<TicketEvent, 'id' | 'createdAt'>): Promise<ID>;
  getComments(ticketId: ID): Promise<TicketComment[]>;
  getEvents(ticketId: ID): Promise<TicketEvent[]>;
  updateTags(id: ID, tags: string[], userId?: ID): Promise<void>;
  updateDueAt(id: ID, dueAt: string | null, userId?: ID): Promise<void>;
}

export interface PaymentChannelsRepository {
  list(filter: PaymentChannelsFilter): Promise<PageResult<PaymentChannel>>;
  getById(id: ID): Promise<PaymentChannel | undefined>;
  findByCode(code: string): Promise<PaymentChannel | undefined>;
  create(
    channel: Omit<PaymentChannel, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ID>;
  update(id: ID, patch: Partial<PaymentChannel>): Promise<void>;
  delete(id: ID): Promise<void>; // 逻辑删除
  getAvailable(type: PaymentChannelType): Promise<PaymentChannel[]>; // 前台可用渠道
}

export interface PlayersFilter extends PageQuery {
  keyword?: string; // username、email、idname 模糊匹配
  status?: boolean; // true/false
  vipLevels?: number[]; // VIP等级数组筛选
  vipMin?: number; // VIP最小等级
  vipMax?: number; // VIP最大等级
  balanceMin?: number; // 余额最小值
  balanceMax?: number; // 余额最大值
  agents?: string[]; // 代理商数组
  directSuperiorIds?: ID[]; // 直属上级数组
  registrationMethods?: RegistrationMethod[]; // 注册方式数组
  registrationSources?: string[]; // 注册来源数组
  loginSources?: string[]; // 登录来源数组
  identityCategories?: IdentityCategory[]; // 身份类别数组
  createdFrom?: string; // ISO时间
  createdTo?: string; // ISO时间
  updatedFrom?: string; // ISO时间
  updatedTo?: string; // ISO时间
  lastLoginFrom?: string; // ISO时间
  lastLoginTo?: string; // ISO时间
  sortBy?: string; // 排序字段
  sortDir?: 'asc' | 'desc'; // 排序方向
}

export interface ActivitiesFilter extends PageQuery {
  keyword?: string; // 对name、activityCode、activityType模糊匹配
  activityTypes?: ActivityType[]; // 活动类型数组筛选
  statuses?: ActivityStatus[]; // 状态数组筛选
  activeOnly?: boolean; // 仅返回当前可参与的活动
  availableForDisplay?: boolean; // 仅返回当前可见
  startFrom?: string; // 活动开始时间范围（起）
  startTo?: string; // 活动开始时间范围（止）
  endFrom?: string; // 活动结束时间范围（起）
  endTo?: string; // 活动结束时间范围（止）
  displayFrom?: string; // 展示时间范围（起）
  displayTo?: string; // 展示时间范围（止）
  participantsMin?: number; // 参与人数最小值
  participantsMax?: number; // 参与人数最大值
  rewardsMin?: number; // 发放奖励最小值
  rewardsMax?: number; // 发放奖励最大值
  updatedFrom?: string; // 更新时间范围（起）
  updatedTo?: string; // 更新时间范围（止）
  sortBy?: string; // 排序字段
  sortDir?: 'asc' | 'desc'; // 排序方向
}

export interface ActivitiesRepository {
  list(filter: ActivitiesFilter): Promise<PageResult<Activity>>;
  getById(id: ID): Promise<Activity | undefined>;
  findByCode(activityCode: string): Promise<Activity | undefined>;
  create(activity: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>): Promise<ID>;
  update(id: ID, patch: Partial<Activity>): Promise<void>;
  delete(id: ID): Promise<void>;
  changeStatus(
    id: ID,
    status: ActivityStatus,
    userId: ID
  ): Promise<void>;
  updateStats(
    id: ID,
    participants?: number,
    rewards?: number
  ): Promise<void>;
}

export interface PlayersRepository {
  list(filter: PlayersFilter): Promise<PageResult<Player>>;
  getById(id: ID): Promise<Player | undefined>;
  findByUsername(username: string): Promise<Player | undefined>;
  findByEmail(email: string): Promise<Player | undefined>;
  findByIdname(idname: string): Promise<Player | undefined>;
  create(player: Omit<Player, 'id' | 'createdAt' | 'updatedAt'>): Promise<ID>;
  update(id: ID, patch: Partial<Player>): Promise<void>;
  delete(id: ID): Promise<void>;
  updateBalance(id: ID, balance: number): Promise<void>;
  updateVipLevel(id: ID, vipLevel: number): Promise<void>;
  updateStatus(id: ID, status: boolean): Promise<void>;
}

export interface Repositories {
  users: UsersRepository;
  roles: RolesRepository;
  permissions: PermissionsRepository;
  rolePermissions: RolePermissionsRepository;
  logs: LogsRepository;
  tickets: TicketsRepository;
  paymentChannels: PaymentChannelsRepository;
  activities: ActivitiesRepository;
  players: PlayersRepository;
}
