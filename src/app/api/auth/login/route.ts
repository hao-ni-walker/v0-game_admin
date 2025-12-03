import { logger } from '@/lib/logger';
import { encryptPassword } from '@/lib/crypto';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse
} from '@/service/response';

const REMOTE_API_URL = 'https://api.xreddeercasino.com/api/admin/login';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // 验证必填字段
    if (!username || !password) {
      await logger.warn('用户认证', '用户登录', '登录失败：缺少必填字段', {
        missingFields: {
          username: !username,
          password: !password
        },
        timestamp: new Date().toISOString()
      });

      return errorResponse('请填写用户名和密码');
    }

    // 加密密码
    const encryptedPassword = await encryptPassword(password);

    // 转发请求到远程 API
    const remotePayload = {
      username,
      password: encryptedPassword
    };

    const remoteResponse = await fetch(REMOTE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(remotePayload)
    });

    const result = await remoteResponse.json();

    // 处理远程 API 响应
    if (result.code === 200) {
      const token = result.data.access_token;

      // 记录登录成功日志
      await logger.info(
        '用户认证',
        '用户登录',
        '用户登录成功',
        {
          username,
          loginTime: new Date().toISOString()
        }
      );

      const response = successResponse({
        message: '登录成功',
        token,
        tokenType: result.data.token_type
      });

      response.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24
      });

      return response;
    } else {
      // 记录登录失败日志
      await logger.warn('用户认证', '用户登录', '登录失败：远程API返回错误', {
        username,
        remoteError: result.msg,
        timestamp: new Date().toISOString()
      });

      return unauthorizedResponse(result.msg || '用户名或密码错误');
    }
  } catch (error) {
    // 记录服务器错误日志
    await logger.error('用户认证', '用户登录', '登录过程发生服务器错误', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });

    return errorResponse('服务器错误');
  }
}
