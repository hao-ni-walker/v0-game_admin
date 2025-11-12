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
  TicketPriority
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

export interface Repositories {
  users: UsersRepository;
  roles: RolesRepository;
  permissions: PermissionsRepository;
  rolePermissions: RolePermissionsRepository;
  logs: LogsRepository;
  tickets: TicketsRepository;
}
