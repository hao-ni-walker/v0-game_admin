import { describe, it, expect, beforeAll } from 'vitest';
import { NextRequest } from 'next/server';
import { signAdminToken } from '@/lib/jwt';

const JWT_SECRET = 'test_secret_at_least_32_chars_long_xxxxx';

// middleware 命名导出
async function run(req: NextRequest) {
  const mod = await import('@/middleware');
  return mod.middleware(req);
}

function makeReq(pathname: string, token?: string) {
  const url = new URL(pathname, 'http://localhost');
  const req = new NextRequest(url, {
    headers: token ? { cookie: `token=${token}` } : undefined
  });
  return req;
}

describe('middleware: mustChangePassword 闸门', () => {
  let pendingToken: string;
  let okToken: string;

  beforeAll(async () => {
    process.env.JWT_SECRET = JWT_SECRET;
    pendingToken = await signAdminToken(
      { sub: 1, username: 'admin', roleId: 1, mustChangePassword: true },
      JWT_SECRET,
      3600
    );
    okToken = await signAdminToken(
      { sub: 1, username: 'admin', roleId: 1, mustChangePassword: false },
      JWT_SECRET,
      3600
    );
  });

  it('mustChangePassword=true 访问业务 API 返回 428', async () => {
    const res = await run(makeReq('/api/users', pendingToken));
    expect(res.status).toBe(428);
  });

  it('mustChangePassword=true 访问 dashboard 页面被重定向到改密页', async () => {
    const res = await run(makeReq('/dashboard/players', pendingToken));
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toMatch(/\/change-password/);
  });

  it('mustChangePassword=true 仍可访问 login/change-password/logout', async () => {
    for (const p of [
      '/api/auth/login',
      '/api/auth/change-password',
      '/api/auth/logout'
    ]) {
      const res = await run(makeReq(p, pendingToken));
      expect(res.status).toBe(200);
    }
  });

  it('mustChangePassword=false 时一切放行', async () => {
    const res = await run(makeReq('/api/users', okToken));
    expect(res.status).toBe(200);
  });

  it('无 token 或伪 token 不拦截(交给路由处理)', async () => {
    const res1 = await run(makeReq('/api/users'));
    expect(res1.status).toBe(200);
    const res2 = await run(makeReq('/api/users', 'forged.garbage.here'));
    expect(res2.status).toBe(200);
  });
});
