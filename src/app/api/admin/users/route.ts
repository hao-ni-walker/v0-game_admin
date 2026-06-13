import { cookies } from 'next/headers';
import { requestRemoteAdminApi } from '@/lib/admin-remote';
import {
  errorResponse,
  successResponse,
  unauthorizedResponse,
} from '@/service/response';
import { logger } from '@/lib/logger';

function mapUserListQuery(searchParams: URLSearchParams) {
  const remote = new URLSearchParams();

  for (const [key, value] of searchParams.entries()) {
    if (!value) {
      continue;
    }

    if (key === 'page_size') {
      remote.set('size', value);
      continue;
    }

    if (key === 'sort_by' && value === 'register_at') {
      remote.set('sort_by', 'created_at');
      continue;
    }

    remote.set(key, value);
  }

  return remote;
}

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token?.value) {
      await logger.warn('用户管理', '获取玩家列表', '未授权访问：缺少 token', {
        timestamp: new Date().toISOString(),
      });
      return unauthorizedResponse('未授权访问');
    }

    const { searchParams } = new URL(request.url);
    const remoteResponse = await requestRemoteAdminApi<{
      code?: number;
      message?: string;
      data?: {
        items?: Array<Record<string, unknown>>;
        pagination?: {
          page?: number;
          size?: number;
          total?: number;
        };
      } | null;
    }>({
      path: '/api/v1/admin/users',
      method: 'GET',
      query: mapUserListQuery(searchParams),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token.value}`,
      },
    });

    if (!remoteResponse.ok) {
      await logger.error('用户管理', '获取玩家列表', '远程API请求失败', {
        status: remoteResponse.status,
        errorText: remoteResponse.text,
        timestamp: new Date().toISOString(),
      });

      if (remoteResponse.status === 401) {
        return unauthorizedResponse('认证失败，请重新登录');
      }

      return errorResponse(
        `远程API错误: ${remoteResponse.status}`
      );
    }

    const result = remoteResponse.data;
    if (!result || (result.code !== 0 && result.code !== 200) || !result.data) {
      return errorResponse(result?.message || '获取玩家列表失败');
    }

    const items = (result.data.items || []).map((item) => ({
      id: Number(item.user_id || 0),
      idname: item.display_name || '',
      username: item.tg_username || item.display_name || `user_${item.user_id}`,
      email: '',
      status: item.status === 'normal' ? 'active' : item.status,
      vip_level: Number(item.vip_level || 0),
      registration_method: 'other',
      registration_source: '',
      identity_category: 'user',
      agent: '',
      direct_superior_id: undefined,
      created_at: item.registered_at
        ? new Date(Number(item.registered_at) * 1000).toISOString()
        : new Date(0).toISOString(),
      updated_at: item.last_active_at
        ? new Date(Number(item.last_active_at) * 1000).toISOString()
        : new Date(0).toISOString(),
      last_login: item.last_active_at
        ? new Date(Number(item.last_active_at) * 1000).toISOString()
        : undefined,
      login_failure_count: 0,
      locked_at: undefined,
      wallet: {
        balance: Number(item.balance || 0),
        frozen_balance: 0,
        bonus: 0,
        credit: 0,
        withdrawable: Number(item.balance || 0),
        total_deposit: Number(item.total_deposit || 0),
        total_withdraw: Number(item.total_withdraw || 0),
        total_bet: Number(item.total_bet || 0),
        total_win: Number(item.total_bet || 0) + Number(item.net_pnl || 0),
        currency: 'USD',
        status: 'active',
        version: 1,
      },
    }));
    const pagination = result.data.pagination || {};

    await logger.info('用户管理', '获取玩家列表', '获取玩家列表成功', {
      total: pagination.total || 0,
      page: pagination.page || 1,
      timestamp: new Date().toISOString(),
    });

    return successResponse({
      items,
      page: pagination.page || 1,
      page_size: pagination.size || 20,
      total: pagination.total || 0,
    });
  } catch (error) {
    await logger.error('用户管理', '获取玩家列表', '获取玩家列表失败', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    return errorResponse('获取玩家列表失败');
  }
}
