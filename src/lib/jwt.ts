import { SignJWT, jwtVerify } from 'jose';

export interface AdminTokenPayload {
  sub: number;
  username: string;
  roleId: number;
  mustChangePassword: boolean;
  exp: number;
  iat: number;
}

const ALG = 'HS256';

function key(secret: string): Uint8Array {
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 chars');
  }
  return new TextEncoder().encode(secret);
}

/**
 * 用 HS256 签发管理员 JWT。sub=admin_id,roleId 为角色 id。
 * mustChangePassword 写进 token,这样 Next middleware(edge runtime,无法连 PG)
 * 可在不查库的情况下对未改密会话返回 428。
 * jose 默认拒绝 alg:none,不要手写 HMAC 比较。
 */
export async function signAdminToken(
  payload: Omit<AdminTokenPayload, 'exp' | 'iat'>,
  secret: string,
  ttlSec: number
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({
    username: payload.username,
    roleId: payload.roleId,
    mustChangePassword: payload.mustChangePassword ?? false
  })
    .setProtectedHeader({ alg: ALG })
    .setSubject(String(payload.sub))
    .setIssuedAt(now)
    .setExpirationTime(now + ttlSec)
    .sign(key(secret));
}

/**
 * 用 HS256 验签并解析管理员 JWT。
 * 签名无效/过期/格式错/alg=none 一律返回 null。
 * 绝不因为"远程 API secret 可能不同"就跳过验签——那正是被修复的漏洞。
 */
export async function verifyAdminToken(
  token: string,
  secret: string
): Promise<AdminTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, key(secret), { algorithms: [ALG] });
    if (!payload.sub || typeof payload.roleId !== 'number') return null;
    return {
      sub: Number(payload.sub),
      username: String(payload.username ?? ''),
      roleId: payload.roleId,
      mustChangePassword: Boolean(payload.mustChangePassword),
      exp: payload.exp!,
      iat: payload.iat!
    };
  } catch {
    return null;
  }
}
