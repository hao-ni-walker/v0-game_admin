import { describe, it, expect, beforeAll } from 'vitest';
import { createPgRepositories } from '@/repository/impl/pgRepos';
import { getAdminPool } from '@/db/client';
import { ADMIN_SCHEMA_DDL, ADMIN_TRUNCATE } from '../helpers/adminSchema';

// 默认指向本地 fish dev 栈(host 侧 15432)。CI 可覆盖。
const TEST_DB_URL =
  process.env.ADMIN_DATABASE_URL ??
  'postgresql://fish:dev_only_pg_appuser_change_me@127.0.0.1:15432/fish';

describe('pgRepos', () => {
  let repos: Awaited<ReturnType<typeof createPgRepositories>>;

  beforeAll(async () => {
    process.env.ADMIN_DATABASE_URL = TEST_DB_URL;
    const pool = getAdminPool();
    await pool.query(ADMIN_SCHEMA_DDL);
    await pool.query(ADMIN_TRUNCATE);
    repos = await createPgRepositories();
  });

  it('创建并按 email 查回管理员', async () => {
    const email = `t${Date.now()}@example.com`;
    const id = await repos.users.create({
      email,
      username: 'tester',
      password: 'hashed',
      roleId: 1,
      status: 'active'
    });
    expect(typeof id).toBe('number');
    const got = await repos.users.findByEmail(email);
    expect(got?.id).toBe(id);
    expect(got?.email).toBe(email);
  });

  it('email 唯一约束生效', async () => {
    const email = `dup${Date.now()}@example.com`;
    await repos.users.create({
      email,
      username: 'a',
      password: 'h',
      roleId: 1,
      status: 'active'
    });
    await expect(
      repos.users.create({
        email,
        username: 'b',
        password: 'h',
        roleId: 1,
        status: 'active'
      })
    ).rejects.toThrow();
  });

  it('新建管理员默认 mustChangePassword=true', async () => {
    const email = `mc${Date.now()}@example.com`;
    const id = await repos.users.create({
      email,
      username: 'x',
      password: 'h',
      roleId: 1,
      status: 'active'
    });
    const u = await repos.users.getById(id);
    expect(u?.mustChangePassword).toBe(true);
  });

  it('update 后 mustChangePassword 可置 false 且 updatedAt 前移', async () => {
    const email = `up${Date.now()}@example.com`;
    const id = await repos.users.create({
      email,
      username: 'y',
      password: 'h',
      roleId: 1,
      status: 'active'
    });
    await repos.users.update(id, { mustChangePassword: false });
    const u = await repos.users.getById(id);
    expect(u?.mustChangePassword).toBe(false);
  });
});
