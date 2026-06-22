import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { requestRemoteAdminApi } from '@/lib/admin-remote';
import {
  successResponse,
  unauthorizedResponse,
} from '@/service/response';

const LIST_PATH = '/api/v1/admin/withdraw/pending-review';

function toIso(value: unknown): string {
  if (typeof value === 'number') {
    return new Date(value * 1000).toISOString();
  }
  if (typeof value === 'string' && value) {
    const ts = Date.parse(value);
    return Number.isNaN(ts) ? new Date().toISOString() : new Date(ts).toISOString();
  }
  return new Date().toISOString();
}

function buildEmpty(page: number, pageSize: number) {
  return {
    data: [],
    stats: {
      totalAmount: 0,
      totalFee: 0,
      totalActualAmount: 0,
      successCount: 0,
      failedCount: 0,
    },
    pager: {
      page,
      limit: pageSize,
      total: 0,
      totalPages: 1,
    },
  };
}

function normalizeList(payload: any, page: number, pageSize: number) {
  const items = Array.isArray(payload?.items) ? payload.items : [];
  const pagination = payload?.pagination || {};
  const currentPage = Number(pagination.page || page || 1);
  const currentSize = Number(pagination.size || pageSize || 20);
  const total = Number(pagination.total || items.length || 0);
  const data = items.map((item: any) => {
    const amount = Number(item.amount_usd || item.amount || 0);
    return {
      id: Number(item.withdraw_id || item.id || 0),
      orderNo: `WD${item.withdraw_id || item.id || ''}`,
      channelOrderNo: item.tx_hash || null,
      userId: Number(item.user_id || 0),
      username: item.user_masked || item.username || undefined,
      paymentChannelId: 0,
      paymentChannelName: item.asset || 'USDT',
      paymentChannelCode: item.asset || 'USDT',
      amount,
      fee: 0,
      actualAmount: null,
      status: 'pending_audit',
      currency: item.asset || 'USDT',
      accountNumber: item.to_address || '',
      auditStatus: 'pending',
      payoutStatus: 'pending',
      createdAt: toIso(item.created_at),
      completedAt: null,
      updatedAt: toIso(item.created_at),
    };
  });

  return {
    data,
    stats: {
      totalAmount: data.reduce(
        (sum: number, row: { amount?: number }) => sum + Number(row.amount || 0),
        0
      ),
      totalFee: 0,
      totalActualAmount: 0,
      successCount: 0,
      failedCount: 0,
    },
    pager: {
      page: currentPage,
      limit: currentSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / Math.max(currentSize, 1))),
    },
  };
}

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  if (!token?.value) {
    return unauthorizedResponse('未授权访问');
  }

  const sp = new URLSearchParams(request.nextUrl.searchParams);
  const page = Number(sp.get('page') || '1');
  const pageSize = Number(sp.get('page_size') || '20');
  if (sp.has('page_size')) {
    sp.set('size', sp.get('page_size') as string);
    sp.delete('page_size');
  }

  const remote = await requestRemoteAdminApi<{
    code?: number;
    message?: string;
    msg?: string;
    data?: unknown;
  }>({
    path: `${LIST_PATH}${sp.size ? `?${sp.toString()}` : ''}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token.value}`,
    },
  });

  if (remote.ok && remote.data && (remote.data.code === 0 || remote.data.code === 200)) {
    return successResponse(normalizeList(remote.data.data, page, pageSize));
  }

  console.warn('[admin/withdraw-orders] upstream unavailable, returning empty list', {
    status: remote.status,
    body: remote.text,
  });
  return successResponse(buildEmpty(page, pageSize));
}
