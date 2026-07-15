import { logger } from '@/lib/logger';
import { requestRemoteAdminApi } from '@/lib/admin-remote';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  serviceUnavailableResponse,
  tooManyRequestsResponse
} from '@/service/response';

export async function POST(request: Request) {
  try {
    const { username, password, totpCode } = await request.json();

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

    const remotePayload = {
      username,
      password,
      totp_code: totpCode || '000000'
    };

    const remoteResponse = await requestRemoteAdminApi<{
      code?: number;
      message?: string;
      msg?: string;
      data?: {
        token?: string;
        access_token?: string;
        tokenType?: string;
        token_type?: string;
        message?: string;
      } | null;
    }>({
      path: '/api/v1/admin/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(remotePayload)
    });

    // 检查 HTTP 状态码 —— 区分“上游不可用”与“凭据/请求问题”，避免误导成 401
    const status = remoteResponse.status;

    if (status === 0 || status >= 500) {
      // 上游异常（500/502/503/504/超时）——不是密码问题，别提示检查密码
      await logger.warn('用户认证', '用户登录', '登录失败：登录服务不可用', {
        username,
        status,
        errorText: remoteResponse.text,
        timestamp: new Date().toISOString()
      });

      return serviceUnavailableResponse('登录服务暂不可用，请稍后重试');
    }

    if (status === 429) {
      await logger.warn('用户认证', '用户登录', '登录失败：触发限流', {
        username,
        status,
        timestamp: new Date().toISOString()
      });

      return tooManyRequestsResponse('尝试过于频繁，请稍后再试');
    }

    if (!remoteResponse.ok) {
      // 其他非 2xx（401/403/422 等）——按凭据/请求问题处理
      await logger.warn('用户认证', '用户登录', '登录失败：远程API HTTP错误', {
        username,
        status,
        errorText: remoteResponse.text,
        timestamp: new Date().toISOString()
      });

      return unauthorizedResponse('登录失败，请检查用户名和密码');
    }

    const result = remoteResponse.data || {};

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
        // 后端返回 200 + code:0 但无 token = 认证失败（用户名/密码/验证码错误）
        await logger.warn('用户认证', '用户登录', '登录失败：后端拒绝凭据', {
          username,
          remoteMessage: result.message || result.msg,
          timestamp: new Date().toISOString()
        });
        return unauthorizedResponse(
          result.message || result.msg || '用户名、密码或验证码错误'
        );
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

    return serviceUnavailableResponse('登录服务暂不可用，请稍后重试');
  }
}
