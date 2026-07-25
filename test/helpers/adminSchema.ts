// 测试用 DDL:创建 admin schema + 五张表,与 src/db/schema.ts 对齐。
// 线上 DDL 由 golang-migrate 管理(server/migrations/000011_admin_schema),
// 此常量仅用于测试环境建表,避免依赖 drizzle-kit push(两套迁移工具打架)。
export const ADMIN_SCHEMA_DDL = /* sql */ `
CREATE SCHEMA IF NOT EXISTS admin;

CREATE TABLE IF NOT EXISTS admin.users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  avatar TEXT,
  role_id INTEGER NOT NULL,
  is_super_admin BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'active',
  must_change_password BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS users_email_uq ON admin.users (email);

CREATE TABLE IF NOT EXISTS admin.roles (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  is_super BOOLEAN NOT NULL DEFAULT FALSE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS roles_name_uq ON admin.roles (name);

CREATE TABLE IF NOT EXISTS admin.permissions (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  parent_id INTEGER,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS permissions_code_uq ON admin.permissions (code);

CREATE TABLE IF NOT EXISTS admin.role_permissions (
  id SERIAL PRIMARY KEY,
  role_id INTEGER NOT NULL,
  permission_id INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS role_perm_uq ON admin.role_permissions (role_id, permission_id);

CREATE TABLE IF NOT EXISTS admin.system_logs (
  id SERIAL PRIMARY KEY,
  level TEXT NOT NULL,
  action TEXT NOT NULL,
  module TEXT NOT NULL,
  message TEXT NOT NULL,
  details TEXT,
  user_id INTEGER,
  user_agent TEXT,
  ip TEXT,
  request_id TEXT,
  duration INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;

export const ADMIN_TRUNCATE = /* sql */ `
TRUNCATE admin.role_permissions, admin.system_logs, admin.users, admin.permissions, admin.roles RESTART IDENTITY CASCADE;
`;
