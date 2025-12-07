import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse
} from '@/service/response';
import { logger } from '@/lib/logger';

const REMOTE_API_URL = 'https://api.xreddeercasino.com/api/admin/users/export';

/**
 * 导出玩家数据 API - 代理到远程 API
 * POST /api/players/export
 */
export async function POST(request: NextRequest) {
  try {
    // 从 cookie 中获取 token
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token || !token.value) {
      await logger.warn('玩家管理', '导出玩家', '未授权访问：缺少 token', {
        timestamp: new Date().toISOString()
      });
      return unauthorizedResponse('未授权访问');
    }

    // 解析请求体
    const body = await request.json().catch(() => ({}));

    // 将请求体参数转换为查询参数
    const queryParams = new URLSearchParams();

    // 用户基本信息
    if (body.id) queryParams.append('id', String(body.id));
    if (body.id_min) queryParams.append('id_min', String(body.id_min));
    if (body.id_max) queryParams.append('id_max', String(body.id_max));
    if (body.username) queryParams.append('username', body.username);
    if (body.email) queryParams.append('email', body.email);
    if (body.idname) queryParams.append('idname', body.idname);

    // 账户状态
    if (body.status !== undefined) {
      if (typeof body.status === 'boolean') {
        queryParams.append('status', body.status ? 'enabled' : 'disabled');
      } else if (typeof body.status === 'string') {
        queryParams.append('status', body.status);
      }
    }
    if (body.vip_level_min) queryParams.append('vip_level_min', String(body.vip_level_min));
    if (body.vip_level_max) queryParams.append('vip_level_max', String(body.vip_level_max));
    if (body.is_locked !== undefined) queryParams.append('is_locked', String(body.is_locked));

    // 代理关系
    if (body.agent) queryParams.append('agent', body.agent);
    if (body.direct_superior_id) queryParams.append('direct_superior_id', String(body.direct_superior_id));

    // 注册信息
    if (body.registration_method) queryParams.append('registration_method', body.registration_method);
    if (body.registration_source) queryParams.append('registration_source', body.registration_source);
    if (body.identity_category) queryParams.append('identity_category', body.identity_category);

    // 钱包信息范围
    if (body.balance_min) queryParams.append('balance_min', String(body.balance_min));
    if (body.balance_max) queryParams.append('balance_max', String(body.balance_max));

    // 时间范围
    if (body.created_at_start) queryParams.append('created_at_start', body.created_at_start);
    if (body.created_at_end) queryParams.append('created_at_end', body.created_at_end);
    if (body.last_login_start) queryParams.append('last_login_start', body.last_login_start);
    if (body.last_login_end) queryParams.append('last_login_end', body.last_login_end);

    // 构建远程 API URL
    const queryString = queryParams.toString();
    const remoteUrl = queryString ? `${REMOTE_API_URL}?${queryString}` : REMOTE_API_URL;

    // 转发请求到远程 API
    const remoteResponse = await fetch(remoteUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `bearer ${token.value}`
      }
    });

    // 检查 HTTP 状态码
    if (!remoteResponse.ok) {
      const errorText = await remoteResponse.text();
      await logger.error('玩家管理', '导出玩家', '远程API请求失败', {
        status: remoteResponse.status,
        statusText: remoteResponse.statusText,
        errorText,
        timestamp: new Date().toISOString()
      });

      if (remoteResponse.status === 401) {
        return unauthorizedResponse('认证失败，请重新登录');
      }

      return errorResponse(
        `远程API错误: ${remoteResponse.status} ${remoteResponse.statusText}`
      );
    }

    // 解析远程 API 响应
    const result = await remoteResponse.json();

    // 记录成功日志
    await logger.info('玩家管理', '导出玩家', '导出玩家成功', {
      timestamp: new Date().toISOString()
    });

    // 处理响应
    if ((result.code === 200 || result.code === 0)) {
      return successResponse(result.data || { success: true });
    }

    // 如果远程 API 返回错误
    if (result.code !== 200 && result.code !== 0) {
      await logger.warn('玩家管理', '导出玩家', '远程API返回错误', {
        code: result.code,
        msg: result.msg,
        timestamp: new Date().toISOString()
      });
      return errorResponse(result.msg || '导出玩家失败');
    }

    return successResponse(result.data || result);
  } catch (error) {
    await logger.error('玩家管理', '导出玩家', '导出玩家失败', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });

    return errorResponse('导出玩家失败');
  }
}

