// admin schema 的 PG 仓储实现。
// 只实现"管理员身份"五件套(users/roles/permissions/rolePermissions/logs);
// 业务数据仓库(tickets/paymentChannels/activities/players)暂复用 JSON 实现,
// 阶段 B 起会改为调用 Go /admin/* API(n-admin 不持有业务数据)。
import { and, asc, count, desc, eq, ilike, isNotNull, isNull, sql } from 'drizzle-orm';
import { getAdminDb, getAdminPool } from '@/db/client';
import * as schema from '@/db/schema';
import {
  ID,
  PageResult,
  Permission,
  Role,
  RolePermission,
  SystemLog,
  User
} from '../models';
import {
  LogsFilter,
  PermissionsFilter,
  Repositories,
  RolesFilter,
  UsersFilter
} from '../interfaces';
import { createJsonRepositories } from './jsonRepos';

const { users, roles, permissions, rolePermissions, systemLogs } = schema;

// ---------- 行 → 模型映射(DB 返回 Date,模型用 ISO 字符串) ----------
function toUser(r: typeof users.$inferSelect): User {
  return {
    id: r.id,
    email: r.email,
    username: r.username,
    password: r.password,
    avatar: r.avatar ?? null,
    roleId: r.roleId,
    isSuperAdmin: r.isSuperAdmin,
    status: r.status as 'active' | 'disabled',
    mustChangePassword: r.mustChangePassword,
    lastLoginAt: r.lastLoginAt ? r.lastLoginAt.toISOString() : null,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString()
  };
}

function toRole(r: typeof roles.$inferSelect): Role {
  return {
    id: r.id,
    name: r.name,
    isSuper: r.isSuper,
    description: r.description ?? null,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString()
  };
}

function toPermission(r: typeof permissions.$inferSelect): Permission {
  return {
    id: r.id,
    name: r.name,
    code: r.code,
    description: r.description ?? null,
    parentId: r.parentId ?? null,
    sortOrder: r.sortOrder,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString()
  };
}

function toRolePermission(r: typeof rolePermissions.$inferSelect): RolePermission {
  return {
    id: r.id,
    roleId: r.roleId,
    permissionId: r.permissionId,
    createdAt: r.createdAt.toISOString()
  };
}

function toSystemLog(r: typeof systemLogs.$inferSelect): SystemLog {
  return {
    id: r.id,
    level: r.level as SystemLog['level'],
    action: r.action,
    module: r.module,
    message: r.message,
    details: r.details ? JSON.parse(r.details) : undefined,
    userId: r.userId ?? null,
    userAgent: r.userAgent ?? null,
    ip: r.ip ?? null,
    requestId: r.requestId ?? null,
    duration: r.duration ?? null,
    createdAt: r.createdAt.toISOString()
  };
}

function paginate(page?: number, limit?: number) {
  const p = Math.max(1, page ?? 1);
  const l = Math.min(Math.max(1, limit ?? 10), 100);
  return { page: p, limit: l, offset: (p - 1) * l };
}

// ---------- Users ----------
function buildUsersWhere(filter: UsersFilter) {
  const conds = [];
  if (filter.username) conds.push(ilike(users.username, `%${filter.username}%`));
  if (filter.email) conds.push(ilike(users.email, `%${filter.email}%`));
  if (filter.roleId) conds.push(eq(users.roleId, filter.roleId));
  if (filter.status && filter.status !== 'all')
    conds.push(eq(users.status, filter.status));
  if (filter.startDate)
    conds.push(sql`${users.createdAt} >= ${new Date(filter.startDate)}`);
  if (filter.endDate)
    conds.push(sql`${users.createdAt} <= ${new Date(filter.endDate)}`);
  return and(...conds);
}

export const usersRepo = {
  async list(
    filter: UsersFilter
  ): Promise<PageResult<User & { role?: Pick<Role, 'id' | 'name'> }>> {
    const db = getAdminDb();
    const { page, limit, offset } = paginate(filter.page, filter.limit);
    const where = buildUsersWhere(filter);
    const [totalRow, rows] = await Promise.all([
      db.select({ c: count() }).from(users).where(where),
      db
        .select()
        .from(users)
        .where(where)
        .orderBy(desc(users.id))
        .limit(limit)
        .offset(offset)
    ]);
    const roleIds = [...new Set(rows.map((r) => r.roleId))];
    const roleMap = new Map<number, Pick<Role, 'id' | 'name'>>();
    if (roleIds.length) {
      const rs = await db
        .select({ id: roles.id, name: roles.name })
        .from(roles)
        .where(sql`${roles.id} = ANY(${sql.raw(`ARRAY[${roleIds.join(',')}]::int[]`)})`);
      rs.forEach((r) => roleMap.set(r.id, r));
    }
    const data = rows.map((r) => {
      const u = toUser(r);
      return { ...u, role: roleMap.get(u.roleId) };
    });
    return {
      data,
      page,
      limit,
      total: Number(totalRow[0]?.c ?? 0),
      totalPages: Math.ceil(Number(totalRow[0]?.c ?? 0) / limit)
    };
  },
  async findByUsername(username: string) {
    const db = getAdminDb();
    const r = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return r[0] ? toUser(r[0]) : undefined;
  },
  async findByEmail(email: string) {
    const db = getAdminDb();
    const r = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return r[0] ? toUser(r[0]) : undefined;
  },
  async getById(id: ID) {
    const db = getAdminDb();
    const r = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return r[0] ? toUser(r[0]) : undefined;
  },
  async create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<ID> {
    const db = getAdminDb();
    const row = {
      email: user.email,
      username: user.username,
      password: user.password,
      avatar: user.avatar ?? null,
      roleId: user.roleId,
      isSuperAdmin: user.isSuperAdmin ?? false,
      status: user.status ?? 'active',
      mustChangePassword: user.mustChangePassword ?? true,
      lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt) : null
    };
    const r = await db
      .insert(users)
      .values(row)
      .returning({ id: users.id });
    return r[0].id;
  },
  async update(id: ID, patch: Partial<User>): Promise<void> {
    const db = getAdminDb();
    const upd: Record<string, unknown> = { updatedAt: new Date() };
    for (const [k, v] of Object.entries(patch)) {
      if (k === 'createdAt' || k === 'updatedAt' || k === 'id') continue;
      if (k === 'lastLoginAt') upd.lastLoginAt = v ? new Date(v as string) : null;
      else upd[k] = v;
    }
    await db.update(users).set(upd).where(eq(users.id, id));
  },
  async delete(id: ID): Promise<void> {
    const db = getAdminDb();
    await db.delete(users).where(eq(users.id, id));
  }
};

// ---------- Roles ----------
function buildRolesWhere(filter: RolesFilter) {
  const conds = [];
  if (filter.name) conds.push(ilike(roles.name, `%${filter.name}%`));
  if (filter.startDate) conds.push(sql`${roles.createdAt} >= ${new Date(filter.startDate)}`);
  if (filter.endDate) conds.push(sql`${roles.createdAt} <= ${new Date(filter.endDate)}`);
  return and(...conds);
}

export const rolesRepo = {
  async list(filter: RolesFilter): Promise<PageResult<Role & { userCount: number }>> {
    const db = getAdminDb();
    const { page, limit, offset } = paginate(filter.page, filter.limit);
    const where = buildRolesWhere(filter);
    const [totalRow, rows] = await Promise.all([
      db.select({ c: count() }).from(roles).where(where),
      db.select().from(roles).where(where).orderBy(desc(roles.id)).limit(limit).offset(offset)
    ]);
    const roleIds = rows.map((r) => r.id);
    const counts = new Map<number, number>();
    if (roleIds.length) {
      const agg = await db
        .select({ roleId: users.roleId, c: count() })
        .from(users)
        .where(sql`${users.roleId} = ANY(${sql.raw(`ARRAY[${roleIds.join(',')}]::int[]`)})`)
        .groupBy(users.roleId);
      agg.forEach((a) => counts.set(a.roleId, Number(a.c)));
    }
    const data = rows.map((r) => ({ ...toRole(r), userCount: counts.get(r.id) ?? 0 }));
    return {
      data,
      page,
      limit,
      total: Number(totalRow[0]?.c ?? 0),
      totalPages: Math.ceil(Number(totalRow[0]?.c ?? 0) / limit)
    };
  },
  async getById(id: ID) {
    const db = getAdminDb();
    const r = await db.select().from(roles).where(eq(roles.id, id)).limit(1);
    return r[0] ? toRole(r[0]) : undefined;
  },
  async findByName(name: string) {
    const db = getAdminDb();
    const r = await db.select().from(roles).where(eq(roles.name, name)).limit(1);
    return r[0] ? toRole(r[0]) : undefined;
  },
  async create(role: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>): Promise<ID> {
    const db = getAdminDb();
    const r = await db
      .insert(roles)
      .values({
        name: role.name,
        isSuper: role.isSuper ?? false,
        description: role.description ?? null
      })
      .returning({ id: roles.id });
    return r[0].id;
  },
  async update(id: ID, patch: Partial<Role>): Promise<void> {
    const db = getAdminDb();
    const upd: Record<string, unknown> = { updatedAt: new Date() };
    for (const [k, v] of Object.entries(patch)) {
      if (k === 'id' || k === 'createdAt' || k === 'updatedAt') continue;
      upd[k] = v;
    }
    await db.update(roles).set(upd).where(eq(roles.id, id));
  },
  async delete(id: ID): Promise<void> {
    const db = getAdminDb();
    await db.delete(rolePermissions).where(eq(rolePermissions.roleId, id));
    await db.delete(roles).where(eq(roles.id, id));
  }
};

// ---------- Permissions ----------
function buildPermsWhere(filter: PermissionsFilter) {
  const conds = [];
  if (filter.name) conds.push(ilike(permissions.name, `%${filter.name}%`));
  if (filter.code) conds.push(ilike(permissions.code, `%${filter.code}%`));
  if (filter.description)
    conds.push(ilike(permissions.description, `%${filter.description}%`));
  if (filter.startDate)
    conds.push(sql`${permissions.createdAt} >= ${new Date(filter.startDate)}`);
  if (filter.endDate)
    conds.push(sql`${permissions.createdAt} <= ${new Date(filter.endDate)}`);
  return and(...conds);
}

export const permissionsRepo = {
  async list(filter: PermissionsFilter): Promise<PageResult<Permission>> {
    const db = getAdminDb();
    const { page, limit, offset } = paginate(filter.page, filter.limit);
    const where = buildPermsWhere(filter);
    const [totalRow, rows] = await Promise.all([
      db.select({ c: count() }).from(permissions).where(where),
      db
        .select()
        .from(permissions)
        .where(where)
        .orderBy(asc(permissions.sortOrder), desc(permissions.id))
        .limit(limit)
        .offset(offset)
    ]);
    return {
      data: rows.map(toPermission),
      page,
      limit,
      total: Number(totalRow[0]?.c ?? 0),
      totalPages: Math.ceil(Number(totalRow[0]?.c ?? 0) / limit)
    };
  },
  async getById(id: ID) {
    const db = getAdminDb();
    const r = await db.select().from(permissions).where(eq(permissions.id, id)).limit(1);
    return r[0] ? toPermission(r[0]) : undefined;
  },
  async findByCode(code: string) {
    const db = getAdminDb();
    const r = await db.select().from(permissions).where(eq(permissions.code, code)).limit(1);
    return r[0] ? toPermission(r[0]) : undefined;
  },
  async create(p: Omit<Permission, 'id' | 'createdAt' | 'updatedAt'>): Promise<ID> {
    const db = getAdminDb();
    const r = await db
      .insert(permissions)
      .values({
        name: p.name,
        code: p.code,
        description: p.description ?? null,
        parentId: p.parentId ?? null,
        sortOrder: p.sortOrder ?? 0
      })
      .returning({ id: permissions.id });
    return r[0].id;
  },
  async update(id: ID, patch: Partial<Permission>): Promise<void> {
    const db = getAdminDb();
    const upd: Record<string, unknown> = { updatedAt: new Date() };
    for (const [k, v] of Object.entries(patch)) {
      if (k === 'id' || k === 'createdAt' || k === 'updatedAt') continue;
      upd[k] = v;
    }
    await db.update(permissions).set(upd).where(eq(permissions.id, id));
  },
  async delete(id: ID): Promise<void> {
    const db = getAdminDb();
    await db.delete(rolePermissions).where(eq(rolePermissions.permissionId, id));
    await db.delete(permissions).where(eq(permissions.id, id));
  }
};

// ---------- RolePermissions ----------
export const rolePermissionsRepo = {
  async listByRole(roleId: ID): Promise<RolePermission[]> {
    const db = getAdminDb();
    const rows = await db
      .select()
      .from(rolePermissions)
      .where(eq(rolePermissions.roleId, roleId))
      .orderBy(desc(rolePermissions.id));
    return rows.map(toRolePermission);
  },
  async add(roleId: ID, permissionId: ID): Promise<ID> {
    const db = getAdminDb();
    const existing = await db
      .select()
      .from(rolePermissions)
      .where(and(eq(rolePermissions.roleId, roleId), eq(rolePermissions.permissionId, permissionId)))
      .limit(1);
    if (existing[0]) return existing[0].id;
    const r = await db
      .insert(rolePermissions)
      .values({ roleId, permissionId })
      .returning({ id: rolePermissions.id });
    return r[0].id;
  },
  async remove(roleId: ID, permissionId: ID): Promise<void> {
    const db = getAdminDb();
    await db
      .delete(rolePermissions)
      .where(and(eq(rolePermissions.roleId, roleId), eq(rolePermissions.permissionId, permissionId)));
  }
};

// ---------- Logs ----------
function buildLogsWhere(filter: LogsFilter) {
  const conds = [];
  if (filter.level) conds.push(eq(systemLogs.level, filter.level));
  if (filter.module) conds.push(eq(systemLogs.module, filter.module));
  if (filter.action) conds.push(ilike(systemLogs.action, `%${filter.action}%`));
  if (filter.search) conds.push(ilike(systemLogs.message, `%${filter.search}%`));
  if (filter.startDate) conds.push(sql`${systemLogs.createdAt} >= ${new Date(filter.startDate)}`);
  if (filter.endDate) conds.push(sql`${systemLogs.createdAt} <= ${new Date(filter.endDate)}`);
  return and(...conds);
}

export const logsRepo = {
  async list(filter: LogsFilter): Promise<PageResult<SystemLog & { username?: string }>> {
    const db = getAdminDb();
    const { page, limit, offset } = paginate(filter.page, filter.limit);
    const where = buildLogsWhere(filter);
    const [totalRow, rows] = await Promise.all([
      db.select({ c: count() }).from(systemLogs).where(where),
      db
        .select()
        .from(systemLogs)
        .where(where)
        .orderBy(desc(systemLogs.createdAt), desc(systemLogs.id))
        .limit(limit)
        .offset(offset)
    ]);
    const userIds = [...new Set(rows.map((r) => r.userId).filter((x): x is number => x != null))];
    const nameMap = new Map<number, string>();
    if (userIds.length) {
      const us = await db
        .select({ id: users.id, username: users.username })
        .from(users)
        .where(sql`${users.id} = ANY(${sql.raw(`ARRAY[${userIds.join(',')}]::int[]`)})`);
      us.forEach((u) => nameMap.set(u.id, u.username));
    }
    return {
      data: rows.map((r) => ({
        ...toSystemLog(r),
        username: r.userId ? nameMap.get(r.userId) : undefined
      })),
      page,
      limit,
      total: Number(totalRow[0]?.c ?? 0),
      totalPages: Math.ceil(Number(totalRow[0]?.c ?? 0) / limit)
    };
  },
  async removeBefore(dateISO: string): Promise<void> {
    const db = getAdminDb();
    await db.delete(systemLogs).where(sql`${systemLogs.createdAt} <= ${new Date(dateISO)}`);
  },
  async append(log: Omit<SystemLog, 'id' | 'createdAt'>): Promise<ID> {
    const db = getAdminDb();
    const r = await db
      .insert(systemLogs)
      .values({
        level: log.level,
        action: log.action,
        module: log.module,
        message: log.message,
        details: log.details != null ? JSON.stringify(log.details) : null,
        userId: log.userId ?? null,
        userAgent: log.userAgent ?? null,
        ip: log.ip ?? null,
        requestId: log.requestId ?? null,
        duration: log.duration ?? null
      })
      .returning({ id: systemLogs.id });
    return r[0].id;
  }
};

// 工具标记,避免 lint 抱怨未使用的导入(isNull/isNotNull 预留给后续筛选扩展)
void isNull;
void isNotNull;

/**
 * 创建 PG 仓储:身份五件套走 admin schema,业务数据暂复用 JSON 实现。
 * 生产环境必须用此实现(ADMIN_DATABASE_URL 存在时)。
 */
export async function createPgRepositories(): Promise<Repositories> {
  // 触发单例初始化,连接不可用时尽早暴露
  getAdminPool();
  const json = await createJsonRepositories();
  return {
    users: usersRepo,
    roles: rolesRepo,
    permissions: permissionsRepo,
    rolePermissions: rolePermissionsRepo,
    logs: logsRepo,
    tickets: json.tickets,
    paymentChannels: json.paymentChannels,
    activities: json.activities,
    players: json.players
  };
}
