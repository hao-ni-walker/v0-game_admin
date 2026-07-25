// admin schema 的 drizzle 定义(类型安全查询的"事实来源")。
// DDL 由 golang-migrate 统一管理(server/migrations/000011_admin_schema),
// 不走 drizzle-kit push——避免两套迁移工具打架。此文件描述的是已存在的表。
import { pgSchema, serial, text, integer, timestamp, boolean, uniqueIndex } from 'drizzle-orm/pg-core';

export const adminSchema = pgSchema('admin');

export const users = adminSchema.table('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull(),
  username: text('username').notNull(),
  password: text('password').notNull(), // bcrypt hash
  avatar: text('avatar'),
  roleId: integer('role_id').notNull(),
  isSuperAdmin: boolean('is_super_admin').notNull().default(false),
  status: text('status').notNull().default('active'), // active | disabled
  mustChangePassword: boolean('must_change_password').notNull().default(true),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
}, (t) => ({ emailIdx: uniqueIndex('users_email_uq').on(t.email) }));

export const roles = adminSchema.table('roles', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  isSuper: boolean('is_super').notNull().default(false),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
}, (t) => ({ nameIdx: uniqueIndex('roles_name_uq').on(t.name) }));

export const permissions = adminSchema.table('permissions', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  code: text('code').notNull(), // 点分三段:account.user.read
  description: text('description'),
  parentId: integer('parent_id'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
}, (t) => ({ codeIdx: uniqueIndex('permissions_code_uq').on(t.code) }));

export const rolePermissions = adminSchema.table('role_permissions', {
  id: serial('id').primaryKey(),
  roleId: integer('role_id').notNull(),
  permissionId: integer('permission_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
}, (t) => ({ pairIdx: uniqueIndex('role_perm_uq').on(t.roleId, t.permissionId) }));

export const systemLogs = adminSchema.table('system_logs', {
  id: serial('id').primaryKey(),
  level: text('level').notNull(), // info | warn | error | debug
  action: text('action').notNull(),
  module: text('module').notNull(),
  message: text('message').notNull(),
  details: text('details'), // JSON
  userId: integer('user_id'),
  userAgent: text('user_agent'),
  ip: text('ip'),
  requestId: text('request_id'),
  duration: integer('duration'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});
