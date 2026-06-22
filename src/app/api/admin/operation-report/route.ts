import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { requestRemoteAdminApi } from '@/lib/admin-remote';
import {
  successResponse,
  unauthorizedResponse,
} from '@/service/response';

const REPORT_PATH = '/api/v1/admin/reports/daily';

function buildEmpty() {
  return {
    items: [],
    total: 0,
    summary: null,
  };
}

function normalizeReport(payload: any, date: string) {
  if (!payload) {
    return buildEmpty();
  }

  return {
    items: [
      {
        stat_date: payload.date || date,
        visit_count: 0,
        register_count: Number(payload.users?.new_registered || 0),
        new_user_paid_conversion_rate: null,
        new_user_deposit_amount: '0',
        new_user_deposit_count: 0,
        first_deposit_amount: '0',
        first_deposit_count: Number(payload.users?.first_deposit || 0),
        first_deposit_user_amount: '0',
        deposit_amount: String(payload.cashflow?.total_deposit || 0),
        deposit_count: 0,
        deposit_order_count: Number(payload.orders?.total_count || 0),
        arpu_first_deposit: null,
        arpu: null,
        withdraw_amount: String(payload.cashflow?.total_withdraw || 0),
        withdraw_count: 0,
        total_revenue: String(payload.orders?.platform_income || 0),
        profit_ratio: null,
      },
    ],
    total: 1,
    summary: null,
  };
}

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  if (!token?.value) {
    return unauthorizedResponse('未授权访问');
  }

  const endDate =
    request.nextUrl.searchParams.get('end_date') ||
    request.nextUrl.searchParams.get('start_date') ||
    new Date().toISOString().slice(0, 10);
  const qs = new URLSearchParams({ date: endDate }).toString();

  const remote = await requestRemoteAdminApi<{
    code?: number;
    message?: string;
    msg?: string;
    data?: unknown;
  }>({
    path: `${REPORT_PATH}?${qs}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token.value}`,
    },
  });

  if (remote.ok && remote.data && (remote.data.code === 0 || remote.data.code === 200)) {
    return successResponse(normalizeReport(remote.data.data, endDate));
  }

  console.warn('[admin/operation-report] upstream unavailable, returning empty report', {
    status: remote.status,
    body: remote.text,
  });
  return successResponse(buildEmpty());
}
