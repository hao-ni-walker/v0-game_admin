// 基于 JSON 的仓储实现：在内存中维护数据与增长型自增ID，落盘时全量写入
// 适用场景：开发/小数据量，满足当前 API 的筛选/分页需求

import { JsonStore } from '../store/jsonStore';
import {
  ID,
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
  Activity,
  ActivityStatus,
  Player
} from '../models';
import {
  LogsFilter,
  PermissionsFilter,
  Repositories,
  RolesFilter,
  UsersFilter,
  TicketsFilter,
  ActivitiesFilter,
  PlayersFilter
} from '../interfaces';

type Tables = {
  users: User[];
  roles: Role[];
  permissions: Permission[];
  rolePermissions: RolePermission[];
  systemLogs: SystemLog[];
  tickets: Ticket[];
  ticketComments: TicketComment[];
  ticketEvents: TicketEvent[];
  activities: Activity[];
  players: Player[];
};

function nowISO() {
  return new Date().toISOString();
}

// 简单的 like（包含匹配）
function like(s: string | undefined | null, q: string | undefined): boolean {
  if (!q) return true;
  if (!s) return false;
  return s.toLowerCase().includes(q.toLowerCase());
}

// 时间范围过滤
function inRange(
  dateISO: string | null | undefined,
  start?: string,
  end?: string
): boolean {
  if (!dateISO) return true;
  const t = new Date(dateISO).getTime();
  if (start && t < new Date(start).getTime()) return false;
  if (end && t > new Date(end).getTime()) return false;
  return true;
}

export class JsonRepositories {
  private store: JsonStore;
  private tables: Tables;
  private seq: Record<keyof Tables, number>;

  constructor(store = new JsonStore()) {
    this.store = store;
    this.tables = {
      users: [],
      roles: [],
      permissions: [],
      rolePermissions: [],
      systemLogs: [],
      tickets: [],
      ticketComments: [],
      ticketEvents: [],
      activities: [],
      players: []
    };
    this.seq = {
      users: 0,
      roles: 0,
      permissions: 0,
      rolePermissions: 0,
      systemLogs: 0,
      tickets: 0,
      ticketComments: 0,
      ticketEvents: 0,
      activities: 0,
      players: 0
    };
  }

  // 初始化：加载或创建文件
  async init(seed?: Partial<Tables>): Promise<void> {
    const [
      users,
      roles,
      permissions,
      rolePermissions,
      systemLogs,
      tickets,
      ticketComments,
      ticketEvents,
      activities,
      players
    ] = await Promise.all([
      this.store.readJson<User[]>('users.json', seed?.users ?? []),
      this.store.readJson<Role[]>('roles.json', seed?.roles ?? []),
      this.store.readJson<Permission[]>(
        'permissions.json',
        seed?.permissions ?? []
      ),
      this.store.readJson<RolePermission[]>(
        'rolePermissions.json',
        seed?.rolePermissions ?? []
      ),
      this.store.readJson<SystemLog[]>(
        'systemLogs.json',
        seed?.systemLogs ?? []
      ),
      this.store.readJson<Ticket[]>('tickets.json', seed?.tickets ?? []),
      this.store.readJson<TicketComment[]>(
        'ticketComments.json',
        seed?.ticketComments ?? []
      ),
      this.store.readJson<TicketEvent[]>(
        'ticketEvents.json',
        seed?.ticketEvents ?? []
      ),
      this.store.readJson<Activity[]>(
        'activities.json',
        seed?.activities ?? []
      ),
      this.store.readJson<Player[]>('players.json', seed?.players ?? [])
    ]);

    this.tables = {
      users,
      roles,
      permissions,
      rolePermissions,
      systemLogs,
      tickets,
      ticketComments,
      ticketEvents,
      activities,
      players
    };
    // 初始化自增ID
    (Object.keys(this.tables) as (keyof Tables)[]).forEach((k) => {
      const arr = this.tables[k] as any[];
      this.seq[k] = arr.reduce(
        (m, it: any) => Math.max(m, Number(it.id || 0)),
        0
      );
    });
  }

  private async flush(): Promise<void> {
    const t = this.tables;
    await Promise.all([
      this.store.writeJson('users.json', t.users),
      this.store.writeJson('roles.json', t.roles),
      this.store.writeJson('permissions.json', t.permissions),
      this.store.writeJson('rolePermissions.json', t.rolePermissions),
      this.store.writeJson('systemLogs.json', t.systemLogs),
      this.store.writeJson('tickets.json', t.tickets),
      this.store.writeJson('ticketComments.json', t.ticketComments),
      this.store.writeJson('ticketEvents.json', t.ticketEvents),
      this.store.writeJson('activities.json', t.activities),
      this.store.writeJson('players.json', t.players)
    ]);
  }

  private nextId<K extends keyof Tables>(k: K): ID {
    this.seq[k] = (this.seq[k] || 0) + 1;
    return this.seq[k];
  }

  // Users
  async list(
    filter: UsersFilter
  ): Promise<PageResult<User & { role?: Pick<Role, 'id' | 'name'> }>> {
    const page = Math.max(1, filter.page ?? 1);
    const limit = Math.min(Math.max(1, filter.limit ?? 10), 100);
    const offset = (page - 1) * limit;

    const roleId = filter.roleId;
    const status =
      filter.status && filter.status !== 'all' ? filter.status : undefined;

    const rows = this.tables.users.filter(
      (u) =>
        like(u.username, filter.username) &&
        like(u.email, filter.email) &&
        (roleId ? u.roleId === roleId : true) &&
        (status ? u.status === status : true) &&
        inRange(u.createdAt, filter.startDate, filter.endDate)
    );

    const withRole = rows.map((u) => {
      const r = this.tables.roles.find((r) => r.id === u.roleId);
      return { ...u, role: r ? { id: r.id, name: r.name } : undefined };
    });

    const pageData = withRole.slice(offset, offset + limit);
    return {
      data: pageData,
      page,
      limit,
      total: withRole.length,
      totalPages: Math.ceil(withRole.length / limit)
    };
  }

  async findByUsername(username: string) {
    return this.tables.users.find((u) => u.username === username);
  }
  async findByEmail(email: string) {
    return this.tables.users.find((u) => u.email === email);
  }
  async getById(id: ID) {
    return this.tables.users.find((u) => u.id === id);
  }

  async create(
    user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ID> {
    const id = this.nextId('users');
    const row: User = {
      id,
      avatar: '/avatars/default.jpg',
      status: 'active',
      isSuperAdmin: false,
      createdAt: nowISO(),
      updatedAt: nowISO(),
      ...user
    };
    this.tables.users.push(row);
    await this.flush();
    return id;
  }

  async update(id: ID, patch: Partial<User>): Promise<void> {
    const idx = this.tables.users.findIndex((u) => u.id === id);
    if (idx < 0) return;
    this.tables.users[idx] = {
      ...this.tables.users[idx],
      ...patch,
      updatedAt: nowISO()
    };
    await this.flush();
  }

  async delete(id: ID): Promise<void> {
    const before = this.tables.users.length;
    this.tables.users = this.tables.users.filter((u) => u.id !== id);
    if (this.tables.users.length !== before) await this.flush();
  }

  // Roles
  async listRoles(
    filter: RolesFilter
  ): Promise<PageResult<Role & { userCount: number }>> {
    const page = Math.max(1, filter.page ?? 1);
    const limit = Math.min(Math.max(1, filter.limit ?? 10), 100);
    const offset = (page - 1) * limit;

    const rows = this.tables.roles.filter(
      (r) =>
        like(r.name, filter.name) &&
        inRange(r.createdAt, filter.startDate, filter.endDate)
    );

    // 聚合 userCount
    const agg = rows.map((r) => {
      const userCount = this.tables.users.filter(
        (u) => u.roleId === r.id
      ).length;
      return { ...r, userCount };
    });

    const pageData = agg.slice(offset, offset + limit);
    return {
      data: pageData,
      page,
      limit,
      total: agg.length,
      totalPages: Math.ceil(agg.length / limit)
    };
  }

  async getRoleById(id: ID) {
    return this.tables.roles.find((r) => r.id === id);
  }
  async findRoleByName(name: string) {
    return this.tables.roles.find((r) => r.name === name);
  }

  async createRole(
    role: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ID> {
    const id = this.nextId('roles');
    const row: Role = { id, createdAt: nowISO(), updatedAt: nowISO(), ...role };
    this.tables.roles.push(row);
    await this.flush();
    return id;
  }

  async updateRole(id: ID, patch: Partial<Role>): Promise<void> {
    const idx = this.tables.roles.findIndex((r) => r.id === id);
    if (idx < 0) return;
    this.tables.roles[idx] = {
      ...this.tables.roles[idx],
      ...patch,
      updatedAt: nowISO()
    };
    await this.flush();
  }

  async deleteRole(id: ID): Promise<void> {
    const before = this.tables.roles.length;
    this.tables.roles = this.tables.roles.filter((r) => r.id !== id);
    if (this.tables.roles.length !== before) {
      // 同时清理该角色的关联
      this.tables.rolePermissions = this.tables.rolePermissions.filter(
        (rp) => rp.roleId !== id
      );
      await this.flush();
    }
  }

  // Permissions
  async listPermissions(
    filter: PermissionsFilter
  ): Promise<PageResult<Permission>> {
    const page = Math.max(1, filter.page ?? 1);
    const limit = Math.min(Math.max(1, filter.limit ?? 10), 100);
    const offset = (page - 1) * limit;

    const rows = this.tables.permissions.filter(
      (p) =>
        like(p.name, filter.name) &&
        like(p.code, filter.code) &&
        like(p.description ?? '', filter.description) &&
        inRange(p.createdAt, filter.startDate, filter.endDate)
    );

    const pageData = rows.slice(offset, offset + limit);
    return {
      data: pageData,
      page,
      limit,
      total: rows.length,
      totalPages: Math.ceil(rows.length / limit)
    };
  }

  async getPermissionById(id: ID) {
    return this.tables.permissions.find((p) => p.id === id);
  }
  async findPermissionByCode(code: string) {
    return this.tables.permissions.find((p) => p.code === code);
  }

  async createPermission(
    p: Omit<Permission, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ID> {
    const id = this.nextId('permissions');
    const row: Permission = {
      id,
      createdAt: nowISO(),
      updatedAt: nowISO(),
      sortOrder: 0,
      ...p
    };
    this.tables.permissions.push(row);
    await this.flush();
    return id;
  }

  async updatePermission(id: ID, patch: Partial<Permission>): Promise<void> {
    const idx = this.tables.permissions.findIndex((p) => p.id === id);
    if (idx < 0) return;
    this.tables.permissions[idx] = {
      ...this.tables.permissions[idx],
      ...patch,
      updatedAt: nowISO()
    };
    await this.flush();
  }

  async deletePermission(id: ID): Promise<void> {
    const before = this.tables.permissions.length;
    this.tables.permissions = this.tables.permissions.filter(
      (p) => p.id !== id
    );
    if (this.tables.permissions.length !== before) {
      // 清理关联
      this.tables.rolePermissions = this.tables.rolePermissions.filter(
        (rp) => rp.permissionId !== id
      );
      await this.flush();
    }
  }

  // RolePermissions
  async listRolePermissionsByRole(roleId: ID): Promise<RolePermission[]> {
    return this.tables.rolePermissions.filter((rp) => rp.roleId === roleId);
  }

  async addRolePermission(roleId: ID, permissionId: ID): Promise<ID> {
    const exists = this.tables.rolePermissions.find(
      (rp) => rp.roleId === roleId && rp.permissionId === permissionId
    );
    if (exists) return exists.id;
    const id = this.nextId('rolePermissions');
    const row: RolePermission = {
      id,
      roleId,
      permissionId,
      createdAt: nowISO()
    };
    this.tables.rolePermissions.push(row);
    await this.flush();
    return id;
  }

  async removeRolePermission(roleId: ID, permissionId: ID): Promise<void> {
    const before = this.tables.rolePermissions.length;
    this.tables.rolePermissions = this.tables.rolePermissions.filter(
      (rp) => !(rp.roleId === roleId && rp.permissionId === permissionId)
    );
    if (this.tables.rolePermissions.length !== before) await this.flush();
  }

  // Logs
  async listLogs(
    filter: LogsFilter
  ): Promise<PageResult<SystemLog & { username?: string }>> {
    const page = Math.max(1, filter.page ?? 1);
    const limit = Math.min(Math.max(1, filter.limit ?? 10), 100);
    const offset = (page - 1) * limit;

    const rows = this.tables.systemLogs
      .filter((l) => !filter.level || l.level === filter.level)
      .filter((l) => !filter.module || l.module === filter.module)
      .filter(
        (l) => !filter.action || (l.action && l.action.includes(filter.action))
      )
      .filter(
        (l) =>
          !filter.search || (l.message && l.message.includes(filter.search!))
      )
      .filter((l) => inRange(l.createdAt, filter.startDate, filter.endDate))
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
      );

    const data = rows.slice(offset, offset + limit).map((l) => {
      const u = l.userId
        ? this.tables.users.find((u) => u.id === l.userId)
        : undefined;
      return { ...l, username: u?.username };
    });

    return {
      data,
      page,
      limit,
      total: rows.length,
      totalPages: Math.ceil(rows.length / limit)
    };
  }

  async removeBefore(dateISO: string): Promise<void> {
    const cutoff = new Date(dateISO).getTime();
    const before = this.tables.systemLogs.length;
    this.tables.systemLogs = this.tables.systemLogs.filter(
      (l) => new Date(l.createdAt || 0).getTime() > cutoff
    );
    if (this.tables.systemLogs.length !== before) await this.flush();
  }

  async appendLog(log: Omit<SystemLog, 'id' | 'createdAt'>): Promise<ID> {
    const id = this.nextId('systemLogs');
    const row: SystemLog = { id, createdAt: nowISO(), ...log };
    this.tables.systemLogs.push(row);
    await this.flush();
    return id;
  }

  // 导出给外部的统一访问器
  get usersRepo() {
    return {
      list: this.list.bind(this),
      findByUsername: this.findByUsername.bind(this),
      findByEmail: this.findByEmail.bind(this),
      getById: this.getById.bind(this),
      create: this.create.bind(this),
      update: this.update.bind(this),
      delete: this.delete.bind(this)
    };
  }

  get rolesRepo() {
    return {
      list: this.listRoles.bind(this),
      getById: this.getRoleById.bind(this),
      findByName: this.findRoleByName.bind(this),
      create: this.createRole.bind(this),
      update: this.updateRole.bind(this),
      delete: this.deleteRole.bind(this)
    };
  }

  get permissionsRepo() {
    return {
      list: this.listPermissions.bind(this),
      getById: this.getPermissionById.bind(this),
      findByCode: this.findPermissionByCode.bind(this),
      create: this.createPermission.bind(this),
      update: this.updatePermission.bind(this),
      delete: this.deletePermission.bind(this)
    };
  }

  get rolePermissionsRepo() {
    return {
      listByRole: this.listRolePermissionsByRole.bind(this),
      add: this.addRolePermission.bind(this),
      remove: this.removeRolePermission.bind(this)
    };
  }

  get logsRepo() {
    return {
      list: this.listLogs.bind(this),
      removeBefore: this.removeBefore.bind(this),
      append: this.appendLog.bind(this)
    };
  }

  // Tickets
  async listTickets(
    filter: TicketsFilter
  ): Promise<
    PageResult<
      Ticket & { sla?: { isOverdue: boolean; remainingMinutes: number } }
    >
  > {
    const page = Math.max(1, filter.page ?? 1);
    const limit = Math.min(Math.max(1, filter.limit ?? 20), 100);
    const offset = (page - 1) * limit;

    let rows = this.tables.tickets.filter((t) => {
      // keyword
      if (filter.keyword && !like(t.title, filter.keyword)) return false;

      // statuses
      if (filter.statuses?.length && !filter.statuses.includes(t.status))
        return false;

      // priorities
      if (filter.priorities?.length && !filter.priorities.includes(t.priority))
        return false;

      // categories
      if (filter.categories?.length && !filter.categories.includes(t.category))
        return false;

      // tags
      if (filter.tagsAny?.length) {
        if (!filter.tagsAny.some((tag) => t.tags.includes(tag))) return false;
      }
      if (filter.tagsAll?.length) {
        if (!filter.tagsAll.every((tag) => t.tags.includes(tag))) return false;
      }

      // user/assignee
      if (filter.userIds?.length && !filter.userIds.includes(t.userId))
        return false;
      if (filter.onlyUnassigned && t.assigneeId) return false;
      if (
        filter.assigneeIds?.length &&
        (!t.assigneeId || !filter.assigneeIds.includes(t.assigneeId))
      )
        return false;

      // myTickets
      if (filter.myTickets && filter.currentUserId) {
        if (
          t.userId !== filter.currentUserId &&
          t.assigneeId !== filter.currentUserId
        )
          return false;
      }

      // date ranges
      if (!inRange(t.createdAt, filter.createdFrom, filter.createdTo))
        return false;
      if (!inRange(t.updatedAt, filter.updatedFrom, filter.updatedTo))
        return false;
      if (!inRange(t.dueAt, filter.dueFrom, filter.dueTo)) return false;
      if (!inRange(t.resolvedAt, filter.resolvedFrom, filter.resolvedTo))
        return false;
      if (!inRange(t.closedAt, filter.closedFrom, filter.closedTo))
        return false;

      // overdue/due within
      if (filter.onlyOverdue && t.dueAt) {
        if (new Date(t.dueAt).getTime() >= Date.now()) return false;
      }
      if (filter.dueWithinMinutes !== undefined && t.dueAt) {
        const diff = (new Date(t.dueAt).getTime() - Date.now()) / 60000;
        if (diff < 0 || diff > filter.dueWithinMinutes) return false;
      }

      return true;
    });

    // sorting
    const sortBy = filter.sortBy || 'default';
    const sortDir = filter.sortDir || 'asc';
    const priorityWeight = { urgent: 4, high: 3, normal: 2, low: 1 };
    const statusWeight = (s: TicketStatus) =>
      ['open', 'in_progress', 'pending'].includes(s) ? 1 : 0;

    rows.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'default') {
        cmp = priorityWeight[b.priority] - priorityWeight[a.priority];
        if (cmp === 0) cmp = statusWeight(b.status) - statusWeight(a.status);
        if (cmp === 0) {
          const aD = a.dueAt ? new Date(a.dueAt).getTime() : Infinity;
          const bD = b.dueAt ? new Date(b.dueAt).getTime() : Infinity;
          cmp = aD - bD;
        }
        if (cmp === 0)
          cmp =
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        if (cmp === 0) cmp = b.id - a.id;
      } else {
        const aVal = (a as any)[sortBy];
        const bVal = (b as any)[sortBy];
        if (aVal == null && bVal == null) cmp = 0;
        else if (aVal == null) cmp = 1;
        else if (bVal == null) cmp = -1;
        else if (typeof aVal === 'string') cmp = aVal.localeCompare(bVal);
        else cmp = aVal - bVal;
        if (sortDir === 'desc') cmp = -cmp;
      }
      return cmp;
    });

    const withSla = rows.map((t) => {
      let sla: { isOverdue: boolean; remainingMinutes: number } | undefined;
      if (t.dueAt) {
        const remaining = (new Date(t.dueAt).getTime() - Date.now()) / 60000;
        sla = {
          isOverdue: remaining < 0,
          remainingMinutes: Math.round(remaining)
        };
      }
      return { ...t, sla };
    });

    const pageData = withSla.slice(offset, offset + limit);
    return {
      data: pageData,
      page,
      limit,
      total: withSla.length,
      totalPages: Math.ceil(withSla.length / limit)
    };
  }

  async getTicketById(id: ID) {
    const ticket = this.tables.tickets.find((t) => t.id === id);
    if (!ticket) return undefined;
    const comments = this.tables.ticketComments.filter(
      (c) => c.ticketId === id
    );
    const events = this.tables.ticketEvents.filter((e) => e.ticketId === id);
    return { ...ticket, comments, events };
  }

  async createTicket(
    ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ID> {
    const id = this.nextId('tickets');
    const row: Ticket = {
      id,
      createdAt: nowISO(),
      updatedAt: nowISO(),
      attachmentsCount: 0,
      ...ticket
    };
    this.tables.tickets.push(row);
    await this.addTicketEvent({
      ticketId: id,
      eventType: 'created',
      userId: ticket.userId
    });
    await this.flush();
    return id;
  }

  async updateTicket(id: ID, patch: Partial<Ticket>): Promise<void> {
    const idx = this.tables.tickets.findIndex((t) => t.id === id);
    if (idx < 0) return;
    const old = this.tables.tickets[idx];
    this.tables.tickets[idx] = { ...old, ...patch, updatedAt: nowISO() };
    await this.flush();
  }

  async deleteTicket(id: ID): Promise<void> {
    const before = this.tables.tickets.length;
    this.tables.tickets = this.tables.tickets.filter((t) => t.id !== id);
    if (this.tables.tickets.length !== before) {
      this.tables.ticketComments = this.tables.ticketComments.filter(
        (c) => c.ticketId !== id
      );
      this.tables.ticketEvents = this.tables.ticketEvents.filter(
        (e) => e.ticketId !== id
      );
      await this.flush();
    }
  }

  async assignTicket(
    id: ID,
    assigneeId: ID | null,
    userId?: ID
  ): Promise<void> {
    const idx = this.tables.tickets.findIndex((t) => t.id === id);
    if (idx < 0) return;
    const old = this.tables.tickets[idx];
    this.tables.tickets[idx] = { ...old, assigneeId, updatedAt: nowISO() };
    await this.addTicketEvent({
      ticketId: id,
      eventType: 'assigned',
      userId,
      oldValue: old.assigneeId,
      newValue: assigneeId
    });
    await this.flush();
  }

  async changeTicketStatus(
    id: ID,
    status: TicketStatus,
    reason?: string,
    userId?: ID
  ): Promise<void> {
    const idx = this.tables.tickets.findIndex((t) => t.id === id);
    if (idx < 0) return;
    const old = this.tables.tickets[idx];
    const now = nowISO();
    const updates: Partial<Ticket> = { status, updatedAt: now };
    if (status === 'resolved' && !old.resolvedAt) updates.resolvedAt = now;
    if (status === 'closed' && !old.closedAt) updates.closedAt = now;
    if (
      (status === 'open' || status === 'in_progress') &&
      old.status === 'closed'
    ) {
      updates.resolvedAt = null;
      updates.closedAt = null;
    }
    this.tables.tickets[idx] = { ...old, ...updates };
    await this.addTicketEvent({
      ticketId: id,
      eventType: 'status_changed',
      userId,
      oldValue: old.status,
      newValue: status,
      reason
    });
    await this.flush();
  }

  async addTicketComment(
    comment: Omit<TicketComment, 'id' | 'createdAt'>
  ): Promise<ID> {
    const id = this.nextId('ticketComments');
    const row: TicketComment = { id, createdAt: nowISO(), ...comment };
    this.tables.ticketComments.push(row);
    // update ticket updatedAt
    const ticketIdx = this.tables.tickets.findIndex(
      (t) => t.id === comment.ticketId
    );
    if (ticketIdx >= 0) {
      this.tables.tickets[ticketIdx].updatedAt = nowISO();
    }
    await this.addTicketEvent({
      ticketId: comment.ticketId,
      eventType: 'comment_added',
      userId: comment.userId
    });
    await this.flush();
    return id;
  }

  async addTicketEvent(
    event: Omit<TicketEvent, 'id' | 'createdAt'>
  ): Promise<ID> {
    const id = this.nextId('ticketEvents');
    const row: TicketEvent = { id, createdAt: nowISO(), ...event };
    this.tables.ticketEvents.push(row);
    // no flush here - will be flushed by caller
    return id;
  }

  async getTicketComments(ticketId: ID): Promise<TicketComment[]> {
    return this.tables.ticketComments.filter((c) => c.ticketId === ticketId);
  }

  async getTicketEvents(ticketId: ID): Promise<TicketEvent[]> {
    return this.tables.ticketEvents.filter((e) => e.ticketId === ticketId);
  }

  async updateTicketTags(id: ID, tags: string[], userId?: ID): Promise<void> {
    const idx = this.tables.tickets.findIndex((t) => t.id === id);
    if (idx < 0) return;
    const old = this.tables.tickets[idx];
    this.tables.tickets[idx] = { ...old, tags, updatedAt: nowISO() };
    await this.addTicketEvent({
      ticketId: id,
      eventType: 'tag_changed',
      userId,
      oldValue: old.tags,
      newValue: tags
    });
    await this.flush();
  }

  async updateTicketDueAt(
    id: ID,
    dueAt: string | null,
    userId?: ID
  ): Promise<void> {
    const idx = this.tables.tickets.findIndex((t) => t.id === id);
    if (idx < 0) return;
    const old = this.tables.tickets[idx];
    this.tables.tickets[idx] = { ...old, dueAt, updatedAt: nowISO() };
    await this.addTicketEvent({
      ticketId: id,
      eventType: 'sla_changed',
      userId,
      oldValue: old.dueAt,
      newValue: dueAt
    });
    await this.flush();
  }

  get ticketsRepo() {
    return {
      list: this.listTickets.bind(this),
      getById: this.getTicketById.bind(this),
      create: this.createTicket.bind(this),
      update: this.updateTicket.bind(this),
      delete: this.deleteTicket.bind(this),
      assign: this.assignTicket.bind(this),
      changeStatus: this.changeTicketStatus.bind(this),
      addComment: this.addTicketComment.bind(this),
      addEvent: this.addTicketEvent.bind(this),
      getComments: this.getTicketComments.bind(this),
      getEvents: this.getTicketEvents.bind(this),
      updateTags: this.updateTicketTags.bind(this),
      updateDueAt: this.updateTicketDueAt.bind(this)
    };
  }

  // Activities
  async listActivities(
    filter: ActivitiesFilter
  ): Promise<PageResult<Activity>> {
    const page = Math.max(1, filter.page ?? 1);
    const limit = Math.min(Math.max(1, filter.limit ?? 20), 100);
    const offset = (page - 1) * limit;

    let rows = this.tables.activities.filter((a) => {
      // 关键词筛选
      if (filter.keyword) {
        const kw = filter.keyword.toLowerCase();
        const match =
          a.name.toLowerCase().includes(kw) ||
          a.activityCode.toLowerCase().includes(kw) ||
          a.activityType.toLowerCase().includes(kw);
        if (!match) return false;
      }

      // 活动类型筛选
      if (
        filter.activityTypes &&
        filter.activityTypes.length > 0 &&
        !filter.activityTypes.includes(a.activityType)
      ) {
        return false;
      }

      // 状态筛选
      if (
        filter.statuses &&
        filter.statuses.length > 0 &&
        !filter.statuses.includes(a.status)
      ) {
        return false;
      }

      // 时间范围筛选
      if (!inRange(a.startTime, filter.startFrom, filter.startTo)) return false;
      if (!inRange(a.endTime, filter.endFrom, filter.endTo)) return false;
      if (
        !inRange(a.displayStartTime ?? undefined, filter.displayFrom, filter.displayTo)
      )
        return false;
      if (!inRange(a.updatedAt, filter.updatedFrom, filter.updatedTo))
        return false;

      // 统计数据筛选
      if (
        filter.participantsMin !== undefined &&
        a.totalParticipants < filter.participantsMin
      )
        return false;
      if (
        filter.participantsMax !== undefined &&
        a.totalParticipants > filter.participantsMax
      )
        return false;
      if (
        filter.rewardsMin !== undefined &&
        a.totalRewardsGiven < filter.rewardsMin
      )
        return false;
      if (
        filter.rewardsMax !== undefined &&
        a.totalRewardsGiven > filter.rewardsMax
      )
        return false;

      // 可参与筛选
      if (filter.activeOnly) {
        const now = new Date();
        const start = new Date(a.startTime);
        const end = new Date(a.endTime);
        if (a.status !== 'active' || now < start || now > end) return false;
      }

      // 可见筛选
      if (filter.availableForDisplay) {
        const now = new Date();
        const validStatuses: ActivityStatus[] = ['scheduled', 'active', 'paused'];
        if (!validStatuses.includes(a.status)) return false;
        if (a.displayStartTime && a.displayEndTime) {
          const dStart = new Date(a.displayStartTime);
          const dEnd = new Date(a.displayEndTime);
          if (now < dStart || now > dEnd) return false;
        }
      }

      return true;
    });

    // 排序
    const sortBy = filter.sortBy || 'priority';
    const sortDir = filter.sortDir || 'desc';

    // 状态权重映射
    const statusWeight: Record<ActivityStatus, number> = {
      active: 5,
      scheduled: 4,
      paused: 3,
      draft: 2,
      ended: 1,
      disabled: 0
    };

    rows.sort((a, b) => {
      let compareValue = 0;

      switch (sortBy) {
        case 'priority':
          // priority 降序，再status权重，再updated_at，再id
          compareValue = b.priority - a.priority;
          if (compareValue === 0) {
            compareValue = statusWeight[b.status] - statusWeight[a.status];
          }
          if (compareValue === 0) {
            compareValue =
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
          }
          if (compareValue === 0) {
            compareValue = b.id - a.id;
          }
          return compareValue;
        case 'status':
          compareValue = statusWeight[a.status] - statusWeight[b.status];
          break;
        case 'start_time':
        case 'startTime':
          compareValue =
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
          break;
        case 'end_time':
        case 'endTime':
          compareValue =
            new Date(a.endTime).getTime() - new Date(b.endTime).getTime();
          break;
        case 'updated_at':
        case 'updatedAt':
          compareValue =
            new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        case 'total_participants':
        case 'totalParticipants':
          compareValue = a.totalParticipants - b.totalParticipants;
          break;
        case 'total_rewards_given':
        case 'totalRewardsGiven':
          compareValue = a.totalRewardsGiven - b.totalRewardsGiven;
          break;
        case 'id':
          compareValue = a.id - b.id;
          break;
        default:
          compareValue = b.id - a.id;
      }

      return sortDir === 'asc' ? compareValue : -compareValue;
    });

    const total = rows.length;
    const pageData = rows.slice(offset, offset + limit);

    return {
      data: pageData,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getActivityById(id: ID): Promise<Activity | undefined> {
    return this.tables.activities.find((a) => a.id === id);
  }

  async findActivityByCode(activityCode: string): Promise<Activity | undefined> {
    return this.tables.activities.find((a) => a.activityCode === activityCode);
  }

  async createActivity(
    activity: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ID> {
    const id = this.nextId('activities');
    const now = nowISO();
    const newActivity: Activity = {
      ...activity,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.tables.activities.push(newActivity);
    await this.flush();
    return id;
  }

  async updateActivity(id: ID, patch: Partial<Activity>): Promise<void> {
    const idx = this.tables.activities.findIndex((a) => a.id === id);
    if (idx < 0) return;
    this.tables.activities[idx] = {
      ...this.tables.activities[idx],
      ...patch,
      updatedAt: nowISO()
    };
    await this.flush();
  }

  async deleteActivity(id: ID): Promise<void> {
    const idx = this.tables.activities.findIndex((a) => a.id === id);
    if (idx >= 0) {
      this.tables.activities.splice(idx, 1);
      await this.flush();
    }
  }

  async changeActivityStatus(
    id: ID,
    status: ActivityStatus,
    userId: ID
  ): Promise<void> {
    await this.updateActivity(id, { status, updatedBy: userId });
  }

  async updateActivityStats(
    id: ID,
    participants?: number,
    rewards?: number
  ): Promise<void> {
    const activity = this.tables.activities.find((a) => a.id === id);
    if (!activity) return;

    const updates: Partial<Activity> = {};
    if (participants !== undefined) {
      updates.totalParticipants = activity.totalParticipants + participants;
    }
    if (rewards !== undefined) {
      updates.totalRewardsGiven = activity.totalRewardsGiven + rewards;
    }

    await this.updateActivity(id, updates);
  }

  get activitiesRepo() {
    return {
      list: this.listActivities.bind(this),
      getById: this.getActivityById.bind(this),
      findByCode: this.findActivityByCode.bind(this),
      create: this.createActivity.bind(this),
      update: this.updateActivity.bind(this),
      delete: this.deleteActivity.bind(this),
      changeStatus: this.changeActivityStatus.bind(this),
      updateStats: this.updateActivityStats.bind(this)
    };
  }

  // Players
  async listPlayers(filter: PlayersFilter): Promise<PageResult<Player>> {
    const page = Math.max(1, filter.page ?? 1);
    const limit = Math.min(Math.max(1, filter.limit ?? 20), 100);
    const offset = (page - 1) * limit;

    const rows = this.tables.players.filter((p) => {
      // 关键词匹配：username、email、idname
      if (filter.keyword) {
        const kw = filter.keyword.toLowerCase();
        const matchKeyword = 
          p.username.toLowerCase().includes(kw) ||
          p.email.toLowerCase().includes(kw) ||
          p.idname.toLowerCase().includes(kw);
        if (!matchKeyword) return false;
      }

      // 状态筛选
      if (filter.status !== undefined && p.status !== filter.status) {
        return false;
      }

      // VIP等级数组
      if (filter.vipLevels && filter.vipLevels.length > 0) {
        if (!filter.vipLevels.includes(p.vipLevel)) return false;
      }

      // VIP等级范围
      if (filter.vipMin !== undefined && p.vipLevel < filter.vipMin) return false;
      if (filter.vipMax !== undefined && p.vipLevel > filter.vipMax) return false;

      // 余额范围
      if (filter.balanceMin !== undefined && p.balance < filter.balanceMin) return false;
      if (filter.balanceMax !== undefined && p.balance > filter.balanceMax) return false;

      // 代理商筛选
      if (filter.agents && filter.agents.length > 0) {
        if (!p.agent || !filter.agents.includes(p.agent)) return false;
      }

      // 直属上级筛选
      if (filter.directSuperiorIds && filter.directSuperiorIds.length > 0) {
        if (!p.directSuperiorId || !filter.directSuperiorIds.includes(p.directSuperiorId)) return false;
      }

      // 注册方式筛选
      if (filter.registrationMethods && filter.registrationMethods.length > 0) {
        if (!filter.registrationMethods.includes(p.registrationMethod)) return false;
      }

      // 注册来源筛选
      if (filter.registrationSources && filter.registrationSources.length > 0) {
        if (!p.registrationSource || !filter.registrationSources.includes(p.registrationSource)) return false;
      }

      // 登录来源筛选
      if (filter.loginSources && filter.loginSources.length > 0) {
        if (!p.loginSource || !filter.loginSources.includes(p.loginSource)) return false;
      }

      // 身份类别筛选
      if (filter.identityCategories && filter.identityCategories.length > 0) {
        if (!filter.identityCategories.includes(p.identityCategory)) return false;
      }

      // 时间范围筛选
      if (!inRange(p.createdAt, filter.createdFrom, filter.createdTo)) return false;
      if (!inRange(p.updatedAt, filter.updatedFrom, filter.updatedTo)) return false;
      if (!inRange(p.lastLogin, filter.lastLoginFrom, filter.lastLoginTo)) return false;

      return true;
    });

    // 排序
    const sortBy = filter.sortBy || 'updatedAt';
    const sortDir = filter.sortDir || 'desc';
    rows.sort((a, b) => {
      let compareValue = 0;
      switch (sortBy) {
        case 'id':
          compareValue = a.id - b.id;
          break;
        case 'username':
          compareValue = a.username.localeCompare(b.username);
          break;
        case 'email':
          compareValue = a.email.localeCompare(b.email);
          break;
        case 'balance':
          compareValue = a.balance - b.balance;
          break;
        case 'vipLevel':
          compareValue = a.vipLevel - b.vipLevel;
          break;
        case 'createdAt':
          compareValue = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'lastLogin':
          const aTime = a.lastLogin ? new Date(a.lastLogin).getTime() : 0;
          const bTime = b.lastLogin ? new Date(b.lastLogin).getTime() : 0;
          compareValue = aTime - bTime;
          break;
        case 'updatedAt':
        default:
          compareValue = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
      }
      return sortDir === 'asc' ? compareValue : -compareValue;
    });

    const total = rows.length;
    const data = rows.slice(offset, offset + limit);
    return {
      data,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getPlayerById(id: ID): Promise<Player | undefined> {
    return this.tables.players.find((p) => p.id === id);
  }

  async findPlayerByUsername(username: string): Promise<Player | undefined> {
    return this.tables.players.find((p) => p.username === username);
  }

  async findPlayerByEmail(email: string): Promise<Player | undefined> {
    return this.tables.players.find((p) => p.email === email);
  }

  async findPlayerByIdname(idname: string): Promise<Player | undefined> {
    return this.tables.players.find((p) => p.idname === idname);
  }

  async createPlayer(player: Omit<Player, 'id' | 'createdAt' | 'updatedAt'>): Promise<ID> {
    const id = this.nextId('players');
    const now = nowISO();
    const newPlayer: Player = {
      ...player,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.tables.players.push(newPlayer);
    await this.flush();
    return id;
  }

  async updatePlayer(id: ID, patch: Partial<Player>): Promise<void> {
    const player = this.tables.players.find((p) => p.id === id);
    if (!player) return;
    Object.assign(player, patch, { updatedAt: nowISO() });
    await this.flush();
  }

  async deletePlayer(id: ID): Promise<void> {
    const idx = this.tables.players.findIndex((p) => p.id === id);
    if (idx >= 0) {
      this.tables.players.splice(idx, 1);
      await this.flush();
    }
  }

  async updatePlayerBalance(id: ID, balance: number): Promise<void> {
    await this.updatePlayer(id, { balance });
  }

  async updatePlayerVipLevel(id: ID, vipLevel: number): Promise<void> {
    await this.updatePlayer(id, { vipLevel });
  }

  async updatePlayerStatus(id: ID, status: boolean): Promise<void> {
    await this.updatePlayer(id, { status });
  }

  get playersRepo() {
    return {
      list: this.listPlayers.bind(this),
      getById: this.getPlayerById.bind(this),
      findByUsername: this.findPlayerByUsername.bind(this),
      findByEmail: this.findPlayerByEmail.bind(this),
      findByIdname: this.findPlayerByIdname.bind(this),
      create: this.createPlayer.bind(this),
      update: this.updatePlayer.bind(this),
      delete: this.deletePlayer.bind(this),
      updateBalance: this.updatePlayerBalance.bind(this),
      updateVipLevel: this.updatePlayerVipLevel.bind(this),
      updateStatus: this.updatePlayerStatus.bind(this)
    };
  }
}

// 工厂方法：返回聚合仓储
export async function createJsonRepositories(seed?: Partial<Tables>) {
  const impl = new JsonRepositories();
  await impl.init(seed);
  return {
    users: impl.usersRepo,
    roles: impl.rolesRepo,
    permissions: impl.permissionsRepo,
    rolePermissions: impl.rolePermissionsRepo,
    logs: impl.logsRepo,
    tickets: impl.ticketsRepo,
    activities: impl.activitiesRepo,
    players: impl.playersRepo
  };
}
