import { cookies } from 'next/headers';
import { requestRemoteAdminApi } from '@/lib/admin-remote';
import { errorResponse, successResponse, unauthorizedResponse } from '@/service/response';

function toUnixSeconds(value?: string) {
  if (!value) {
    return undefined;
  }

  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) {
    return undefined;
  }

  return Math.floor(timestamp / 1000);
}

function buildBaseQuery(filters: Record<string, unknown>) {
  const query = new URLSearchParams();

  if (typeof filters.username === 'string' && filters.username) {
    query.set('keyword', filters.username);
  }
  if (typeof filters.status === 'string' && filters.status) {
    query.set('status', filters.status);
  }
  if (typeof filters.balance_min === 'number') {
    query.set('balance_min', String(filters.balance_min));
  }
  if (typeof filters.balance_max === 'number') {
    query.set('balance_max', String(filters.balance_max));
  }

  const registerStart = toUnixSeconds(
    typeof filters.created_at_start === 'string'
      ? filters.created_at_start
      : undefined
  );
  const registerEnd = toUnixSeconds(
    typeof filters.created_at_end === 'string' ? filters.created_at_end : undefined
  );
  if (registerStart) {
    query.set('register_start', String(registerStart));
  }
  if (registerEnd) {
    query.set('register_end', String(registerEnd));
  }

  query.set('size', '1');
  query.set('page', '1');
  return query;
}

async function fetchUserTotal(token: string, query: URLSearchParams) {
  const response = await requestRemoteAdminApi<{
    code?: number;
    data?: {
      pagination?: {
        total?: number;
      };
    } | null;
  }>({
    path: '/api/v1/admin/users',
    method: 'GET',
    query,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok || !response.data || response.data.code !== 0) {
    throw new Error('fetch user total failed');
  }

  return response.data.data?.pagination?.total || 0;
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token');
    if (!token?.value) {
      return unauthorizedResponse('未授权访问');
    }

    const filters = (await request.json()) as Record<string, unknown>;
    const baseQuery = buildBaseQuery(filters || {});
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayQuery = new URLSearchParams(baseQuery);
    todayQuery.set('register_start', String(Math.floor(todayStart.getTime() / 1000)));

    const [totalUsers, todayNewUsers] = await Promise.all([
      fetchUserTotal(token.value, baseQuery),
      fetchUserTotal(token.value, todayQuery),
    ]);

    return successResponse({
      total_users: totalUsers,
      active_users: totalUsers,
      disabled_users: 0,
      total_balance: 0,
      today_new_users: todayNewUsers,
    });
  } catch (error) {
    return errorResponse('获取统计信息失败');
  }
}
