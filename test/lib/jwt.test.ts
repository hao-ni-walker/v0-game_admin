import { describe, it, expect } from 'vitest';
import { signAdminToken, verifyAdminToken } from '@/lib/jwt';

const SECRET = 'test_secret_at_least_32_chars_long_xxxxx';

describe('verifyAdminToken', () => {
  it('接受本方签发的有效 token', async () => {
    const t = await signAdminToken({ sub: 1, username: 'admin', roleId: 1 }, SECRET, 3600);
    const p = await verifyAdminToken(t, SECRET);
    expect(p?.sub).toBe(1);
    expect(p?.roleId).toBe(1);
  });

  it('拒绝签名被篡改的 token(这是 A1 修复的漏洞本体)', async () => {
    const t = await signAdminToken({ sub: 1, username: 'admin', roleId: 1 }, SECRET, 3600);
    const [h, , s] = t.split('.');
    // 伪造 payload:把自己提权成 roleId=1 的超管
    const forged = Buffer.from(
      JSON.stringify({
        sub: 999,
        username: 'attacker',
        roleId: 1,
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000)
      })
    ).toString('base64url');
    expect(await verifyAdminToken(`${h}.${forged}.${s}`, SECRET)).toBeNull();
  });

  it('拒绝用错误密钥签发的 token', async () => {
    const t = await signAdminToken(
      { sub: 1, username: 'admin', roleId: 1 },
      'another_secret_at_least_32_chars_xx',
      3600
    );
    expect(await verifyAdminToken(t, SECRET)).toBeNull();
  });

  it('拒绝已过期的 token', async () => {
    const t = await signAdminToken({ sub: 1, username: 'admin', roleId: 1 }, SECRET, -1);
    expect(await verifyAdminToken(t, SECRET)).toBeNull();
  });

  it('拒绝 alg=none 降级攻击', async () => {
    const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(
      JSON.stringify({ sub: 1, roleId: 1, exp: Math.floor(Date.now() / 1000) + 3600 })
    ).toString('base64url');
    expect(await verifyAdminToken(`${header}.${payload}.`, SECRET)).toBeNull();
  });
});
