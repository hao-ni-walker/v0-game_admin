// 基于 JSON 的仓储实现：在内存中维护数据与增长型自增ID，落盘时全量写入
// 适用场景：开发/小数据量，满足当前 API 的筛选/分页需求

import { JsonStore } from '../store/jsonStore';
import { ID, PageResult, Permission, Role, RolePermission, SystemLog, User } from '../models';
import { LogsFilter, PermissionsFilter, Repositories, RolesFilter, UsersFilter } from '../interfaces';

type Tables = {
  users: User[];
  roles: Role[];
  permissions: Permission[];
  rolePermissions: RolePermission[];
  systemLogs: SystemLog[];
};

function nowISO() { return new Date().toISOString(); }

// 简单的 like（包含匹配）
function like(s: string | undefined | null, q: string | undefined): boolean {
  if (!q) return true;
  if (!s) return false;
  return s.toLowerCase().includes(q.toLowerCase());
}

// 时间范围过滤
function inRange(dateISO: string | undefined, start?: string, end?: string): boolean {
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
    this.tables = { users: [], roles: [], permissions: [], rolePermissions: [], systemLogs: [] };
    this.seq = { users: 0, roles: 0, permissions: 0, rolePermissions: 0, systemLogs: 0 };
  }

  // 初始化：加载或创建文件
  async init(seed?: Partial<Tables>): Promise<void> {
    const [users, roles, permissions, rolePermissions, systemLogs] = await Promise.all([
      this.store.readJson<User[]>('users.json', seed?.users ?? []),
      this.store.readJson<Role[]>('roles.json', seed?.roles ?? []),
      this.store.readJson<Permission[]>('permissions.json', seed?.permissions ?? []),
      this.store.readJson<RolePermission[]>('rolePermissions.json', seed?.rolePermissions ?? []),
      this.store.readJson<SystemLog[]>('systemLogs.json', seed?.systemLogs ?? []),
    ]);

    this.tables = { users, roles, permissions, rolePermissions, systemLogs };
    // 初始化自增ID
    (Object.keys(this.tables) as (keyof Tables)[]).forEach((k) => {
      const arr = this.tables[k] as any[];
      this.seq[k] = arr.reduce((m, it: any) => Math.max(m, Number(it.id || 0)), 0);
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
    ]);
  }

  private nextId<K extends keyof Tables>(k: K): ID {
    this.seq[k] = (this.seq[k] || 0) + 1;
    return this.seq[k];
  }

  // Users
  async list(filter: UsersFilter): Promise<PageResult<(User & { role?: Pick<Role, 'id' | 'name'> })>> {
    const page = Math.max(1, filter.page ?? 1);
    const limit = Math.min(Math.max(1, filter.limit ?? 10), 100);
    const offset = (page - 1) * limit;

    const roleId = filter.roleId;
    const status = filter.status && filter.status !== 'all' ? filter.status : undefined;

    const rows = this.tables.users.filter(u =>
      like(u.username, filter.username) &&
      like(u.email, filter.email) &&
      (roleId ? u.roleId === roleId : true) &&
      (status ? u.status === status : true) &&
      inRange(u.createdAt, filter.startDate, filter.endDate)
    );

    const withRole = rows.map(u => {
      const r = this.tables.roles.find(r => r.id === u.roleId);
      return { ...u, role: r ? { id: r.id, name: r.name } : undefined };
    });

    const pageData = withRole.slice(offset, offset + limit);
    return {
      data: pageData,
      page, limit,
      total: withRole.length,
      totalPages: Math.ceil(withRole.length / limit),
    };
  }

  async findByUsername(username: string) { return this.tables.users.find(u => u.username === username); }
  async findByEmail(email: string) { return this.tables.users.find(u => u.email === email); }
  async getById(id: ID) { return this.tables.users.find(u => u.id === id); }

  async create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<ID> {
    const id = this.nextId('users');
    const row: User = {
      id,
      avatar: '/avatars/default.jpg',
      status: 'active',
      isSuperAdmin: false,
      createdAt: nowISO(),
      updatedAt: nowISO(),
      ...user,
    };
    this.tables.users.push(row);
    await this.flush();
    return id;
  }

  async update(id: ID, patch: Partial<User>): Promise<void> {
    const idx = this.tables.users.findIndex(u => u.id === id);
    if (idx < 0) return;
    this.tables.users[idx] = { ...this.tables.users[idx], ...patch, updatedAt: nowISO() };
    await this.flush();
  }

  async delete(id: ID): Promise<void> {
    const before = this.tables.users.length;
    this.tables.users = this.tables.users.filter(u => u.id !== id);
    if (this.tables.users.length !== before) await this.flush();
  }

  // Roles
  async listRoles(filter: RolesFilter): Promise<PageResult<(Role & { userCount: number })>> {
    const page = Math.max(1, filter.page ?? 1);
    const limit = Math.min(Math.max(1, filter.limit ?? 10), 100);
    const offset = (page - 1) * limit;

    const rows = this.tables.roles.filter(r =>
      like(r.name, filter.name) &&
      inRange(r.createdAt, filter.startDate, filter.endDate)
    );

    // 聚合 userCount
    const agg = rows.map(r => {
      const userCount = this.tables.users.filter(u => u.roleId === r.id).length;
      return { ...r, userCount };
    });

    const pageData = agg.slice(offset, offset + limit);
    return {
      data: pageData,
      page, limit,
      total: agg.length,
      totalPages: Math.ceil(agg.length / limit),
    };
  }

  async getRoleById(id: ID) { return this.tables.roles.find(r => r.id === id); }
  async findRoleByName(name: string) { return this.tables.roles.find(r => r.name === name); }

  async createRole(role: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>): Promise<ID> {
    const id = this.nextId('roles');
    const row: Role = { id, createdAt: nowISO(), updatedAt: nowISO(), ...role };
    this.tables.roles.push(row);
    await this.flush();
    return id;
  }

  async updateRole(id: ID, patch: Partial<Role>): Promise<void> {
    const idx = this.tables.roles.findIndex(r => r.id === id);
    if (idx < 0) return;
    this.tables.roles[idx] = { ...this.tables.roles[idx], ...patch, updatedAt: nowISO() };
    await this.flush();
  }

  async deleteRole(id: ID): Promise<void> {
    const before = this.tables.roles.length;
    this.tables.roles = this.tables.roles.filter(r => r.id !== id);
    if (this.tables.roles.length !== before) {
      // 同时清理该角色的关联
      this.tables.rolePermissions = this.tables.rolePermissions.filter(rp => rp.roleId !== id);
      await this.flush();
    }
  }

  // Permissions
  async listPermissions(filter: PermissionsFilter): Promise<PageResult<Permission>> {
    const page = Math.max(1, filter.page ?? 1);
    const limit = Math.min(Math.max(1, filter.limit ?? 10), 100);
    const offset = (page - 1) * limit;

    const rows = this.tables.permissions.filter(p =>
      like(p.name, filter.name) &&
      like(p.code, filter.code) &&
      like(p.description ?? '', filter.description) &&
      inRange(p.createdAt, filter.startDate, filter.endDate)
    );

    const pageData = rows.slice(offset, offset + limit);
    return {
      data: pageData,
      page, limit,
      total: rows.length,
      totalPages: Math.ceil(rows.length / limit),
    };
  }

  async getPermissionById(id: ID) { return this.tables.permissions.find(p => p.id === id); }
  async findPermissionByCode(code: string) { return this.tables.permissions.find(p => p.code === code); }

  async createPermission(p: Omit<Permission, 'id' | 'createdAt' | 'updatedAt'>): Promise<ID> {
    const id = this.nextId('permissions');
    const row: Permission = { id, createdAt: nowISO(), updatedAt: nowISO(), sortOrder: 0, ...p };
    this.tables.permissions.push(row);
    await this.flush();
    return id;
  }

  async updatePermission(id: ID, patch: Partial<Permission>): Promise<void> {
    const idx = this.tables.permissions.findIndex(p => p.id === id);
    if (idx < 0) return;
    this.tables.permissions[idx] = { ...this.tables.permissions[idx], ...patch, updatedAt: nowISO() };
    await this.flush();
  }

  async deletePermission(id: ID): Promise<void> {
    const before = this.tables.permissions.length;
    this.tables.permissions = this.tables.permissions.filter(p => p.id !== id);
    if (this.tables.permissions.length !== before) {
      // 清理关联
      this.tables.rolePermissions = this.tables.rolePermissions.filter(rp => rp.permissionId !== id);
      await this.flush();
    }
  }

  // RolePermissions
  async listRolePermissionsByRole(roleId: ID): Promise<RolePermission[]> {
    return this.tables.rolePermissions.filter(rp => rp.roleId === roleId);
  }

  async addRolePermission(roleId: ID, permissionId: ID): Promise<ID> {
    const exists = this.tables.rolePermissions.find(rp => rp.roleId === roleId && rp.permissionId === permissionId);
    if (exists) return exists.id;
    const id = this.nextId('rolePermissions');
    const row: RolePermission = { id, roleId, permissionId, createdAt: nowISO() };
    this.tables.rolePermissions.push(row);
    await this.flush();
    return id;
  }

  async removeRolePermission(roleId: ID, permissionId: ID): Promise<void> {
    const before = this.tables.rolePermissions.length;
    this.tables.rolePermissions = this.tables.rolePermissions.filter(rp => !(rp.roleId === roleId && rp.permissionId === permissionId));
    if (this.tables.rolePermissions.length !== before) await this.flush();
  }

  // Logs
  async listLogs(filter: LogsFilter): Promise<PageResult<(SystemLog & { username?: string })>> {
    const page = Math.max(1, filter.page ?? 1);
    const limit = Math.min(Math.max(1, filter.limit ?? 10), 100);
    const offset = (page - 1) * limit;

    const rows = this.tables.systemLogs
      .filter(l => (!filter.level || l.level === filter.level))
      .filter(l => (!filter.module || l.module === filter.module))
      .filter(l => (!filter.action || (l.action && l.action.includes(filter.action))))
      .filter(l => (!filter.search || (l.message && l.message.includes(filter.search!))))
      .filter(l => inRange(l.createdAt, filter.startDate, filter.endDate))
      .sort((a, b) => (new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()));

    const data = rows.slice(offset, offset + limit).map(l => {
      const u = l.userId ? this.tables.users.find(u => u.id === l.userId) : undefined;
      return { ...l, username: u?.username };
    });

    return {
      data,
      page, limit,
      total: rows.length,
      totalPages: Math.ceil(rows.length / limit),
    };
  }

  async removeBefore(dateISO: string): Promise<void> {
    const cutoff = new Date(dateISO).getTime();
    const before = this.tables.systemLogs.length;
    this.tables.systemLogs = this.tables.systemLogs.filter(l => new Date(l.createdAt || 0).getTime() > cutoff);
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
      delete: this.delete.bind(this),
    };
  }

  get rolesRepo() {
    return {
      list: this.listRoles.bind(this),
      getById: this.getRoleById.bind(this),
      findByName: this.findRoleByName.bind(this),
      create: this.createRole.bind(this),
      update: this.updateRole.bind(this),
      delete: this.deleteRole.bind(this),
    };
  }

  get permissionsRepo() {
    return {
      list: this.listPermissions.bind(this),
      getById: this.getPermissionById.bind(this),
      findByCode: this.findPermissionByCode.bind(this),
      create: this.createPermission.bind(this),
      update: this.updatePermission.bind(this),
      delete: this.deletePermission.bind(this),
    };
  }

  get rolePermissionsRepo() {
    return {
      listByRole: this.listRolePermissionsByRole.bind(this),
      add: this.addRolePermission.bind(this),
      remove: this.removeRolePermission.bind(this),
    };
  }

  get logsRepo() {
    return {
      list: this.listLogs.bind(this),
      removeBefore: this.removeBefore.bind(this),
      append: this.appendLog.bind(this),
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
  };
}