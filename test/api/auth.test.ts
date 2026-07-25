import { describe, it, expect, beforeAll } from 'vitest';
import bcrypt from 'bcryptjs';
import { createPgRepositories } from '@/repository/impl/pgRepos';
import { getAdminPool } from '@/db/client';
import { ADMIN_SCHEMA_DDL, ADMIN_TRUNCATE } from '../helpers/adminSchema';

const TEST_DB_URL =
  process.env.ADMIN_DATABASE_URL ??
  'postgresql://fish:dev_only_pg_appuser_change_me@127.0.0.1:15432/fish';
const JWT_SECRET = 'test_secret_at_least_32_chars_long_xxxxx';
const GOOD_PASSWORD = 'a-very-strong-pw-2026';

function parseToken(setCookie: string | null): string | null {
  const m = setCookie?.match(/token=([^;]+)/);
  return m ? m[1] : null;
}

function loginReq(username: string, password: string) {
  return new Request('http://localhost/api/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
}

async function login(username: string, password: string) {
  const { POST } = await import('@/app/api/auth/login/route');
  return POST(loginReq(username, password));
}

describe('auth: login + change-password', () => {
  let username: string;

  beforeAll(async () => {
    process.env.ADMIN_DATABASE_URL = TEST_DB_URL;
    process.env.JWT_SECRET = JWT_SECRET;
    process.env.NODE_ENV = 'production'; // 验证 cookie 带 Secure
    const pool = getAdminPool();
    await pool.query(ADMIN_SCHEMA_DDL);
    await pool.query(ADMIN_TRUNCATE);

    const repos = await createPgRepositories();
    username = `admin_${Date.now()}`;
    const hash = await bcrypt.hash(GOOD_PASSWORD, 12);
    await repos.users.create({
      email: `${username}@example.com`,
      username,
      password: hash,
      roleId: 1,
      status: 'active',
      mustChangePassword: true
    });
  });

  it('口令错误返回 401 且不设置 cookie', async () => {
    const res = await login(username, 'wrong-password');
    expect(res.status).toBe(401);
    expect(parseToken(res.headers.get('set-cookie'))).toBeNull();
  });

  it('口令正确返回 200 并设置 httpOnly+secure+sameSite=strict 的 cookie', async () => {
    const res = await login(username, GOOD_PASSWORD);
    expect(res.status).toBe(200);
    const sc = res.headers.get('set-cookie') ?? '';
    expect(sc).toMatch(/HttpOnly/i);
    expect(sc).toMatch(/SameSite=Strict/i);
    expect(sc).toMatch(/Secure/i);
    const body = await res.json();
    expect(body.data?.mustChangePassword).toBe(true);
    expect(parseToken(sc)).not.toBeNull();
  });

  it('改密拒绝弱口令(长度 < 12 或等于 .env.example 里的默认口令)', async () => {
    const loginRes = await login(username, GOOD_PASSWORD);
    const token = parseToken(loginRes.headers.get('set-cookie'));
    expect(token).not.toBeNull();

    const { POST } = await import('@/app/api/auth/change-password/route');
    const call = (newPassword: string) =>
      POST(
        new Request('http://localhost/api/auth/change-password', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            cookie: `token=${token}`
          },
          body: JSON.stringify({ oldPassword: GOOD_PASSWORD, newPassword })
        })
      );

    expect((await call('short')).status).toBe(400);
    expect((await call('Admin@123456')).status).toBe(400);
  });

  it('改密成功后 mustChangePassword 置 false,旧口令失效', async () => {
    const loginRes = await login(username, GOOD_PASSWORD);
    const token = parseToken(loginRes.headers.get('set-cookie'));

    const { POST } = await import('@/app/api/auth/change-password/route');
    const newPassword = 'brand-new-strong-pw-2026';
    const res = await POST(
      new Request('http://localhost/api/auth/change-password', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          cookie: `token=${token}`
        },
        body: JSON.stringify({ oldPassword: GOOD_PASSWORD, newPassword })
      })
    );
    expect(res.status).toBe(200);
    // 新 cookie 不再要求改密
    const sc = res.headers.get('set-cookie') ?? '';
    const newToken = parseToken(sc);
    expect(newToken).not.toBeNull();
    expect(sc).not.toMatch(/mustChangePassword/i); // 仅作为存在性提示,真实断言在 DB

    // DB 中已置 false
    const repos = await createPgRepositories();
    const u = await repos.users.findByEmail(`${username}@example.com`);
    expect(u?.mustChangePassword).toBe(false);

    // 旧口令失效
    const oldLogin = await login(username, GOOD_PASSWORD);
    expect(oldLogin.status).toBe(401);
    // 新口令可用
    const newLogin = await login(username, newPassword);
    expect(newLogin.status).toBe(200);
  });
});
