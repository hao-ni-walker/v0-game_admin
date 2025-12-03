import { sign } from 'jsonwebtoken';

/**
 * 使用 JWT 加密密码
 * 用于注册接口发送密码到后端
 * @param password 原始密码
 * @returns 加密后的密码字符串
 */
export async function encryptPassword(password: string): Promise<string> {
  const secret = process.env.JWT_SECRET || 'default-password-secret';

  const token = sign(
    {
      password,
      iat: Math.floor(Date.now() / 1000)
    },
    secret,
    { algorithm: 'HS256' }
  );

  return token;
}

