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

    // 检查 HTTP 状态码
    if (!remoteResponse.ok) {
      const errorText = await remoteResponse.text();
      await logger.warn('用户认证', '用户登录', '登录失败：远程API HTTP错误', {
        username,
        status: remoteResponse.status,
        statusText: remoteResponse.statusText,
        errorText,
        timestamp: new Date().toISOString()
      });

      return unauthorizedResponse('登录失败，请检查用户名和密码');
    }

    const result = await remoteResponse.json();

    // 记录远程 API 响应（用于调试）
    await logger.info('用户认证', '用户登录', '远程API响应', {
      username,
      responseCode: result.code,
      hasData: !!result.data,
      timestamp: new Date().toISOString()
    });

    // 处理远程 API 响应 - 支持 code: 0 或 code: 200
    if (result.code === 0 || result.code === 200) {
      // 支持多种 token 字段名
      const token = result.data?.token || result.data?.access_token;
      const tokenType = result.data?.tokenType || result.data?.token_type || 'bearer';

      if (!token) {
        await logger.error('用户认证', '用户登录', '登录失败：token不存在', {
          username,
          result,
          timestamp: new Date().toISOString()
        });
        return errorResponse('登录失败：服务器响应异常');
      }

      // 记录登录成功日志
      await logger.info('用户认证', '用户登录', '用户登录成功', {
        username,
        loginTime: new Date().toISOString()
      });

      const response = successResponse({
        message: result.data?.message || '登录成功',
        token,
        tokenType
      });

      // 将 token 存储到 httpOnly cookie 中
      response.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 // 24小时
      });

      return response;
    } else {
      // 记录登录失败日志
      await logger.warn('用户认证', '用户登录', '登录失败：远程API返回错误', {
        username,
        responseCode: result.code,
        remoteError: result.message || result.msg || result.data?.message,
        result,
        timestamp: new Date().toISOString()
      });

      return unauthorizedResponse(result.message || result.msg || result.data?.message || '用户名或密码错误');
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
