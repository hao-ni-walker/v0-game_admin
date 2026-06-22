import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { requestRemoteAdminApi } from '@/lib/admin-remote';
import {
  successResponse,
  unauthorizedResponse,
} from '@/service/response';

const LIST_PATH = '/api/v1/admin/deposit/records';

function toStatusCode(status: string | null | undefined): number {
  switch ((status || '').toLowerCase()) {
    case 'completed':
    case 'confirmed':
    case 'success':
      return 3;
    case 'failed':
      return 4;
    case 'expired':
    case 'timeout':
      return 5;
    default:
      return 2;
  }
}

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
    items: [],
    total: 0,
    page,
    page_size: pageSize,
    total_pages: 1,
  };
}

function normalizeList(payload: any, page: number, pageSize: number) {
  const items = Array.isArray(payload?.items) ? payload.items : [];
  const pagination = payload?.pagination || {};
  const currentPage = Number(pagination.page || page || 1);
  const currentSize = Number(pagination.size || pageSize || 20);
  const total = Number(pagination.total || items.length || 0);

  return {
    items: items.map((item: any) => ({
      id: Number(item.deposit_id || item.id || 0),
      order_no: String(item.deposit_id || item.id || ''),
      user_id: Number(item.user_id || 0),
      username: item.username || undefined,
      channel_name: item.chain || item.method || item.asset || 'TON',
      amount: Number(item.amount || item.amount_usd || 0),
      fee: 0,
      bonus_amount: 0,
      actual_amount:
        toStatusCode(item.status) === 3 ? Number(item.amount || item.amount_usd || 0) : null,
      status: toStatusCode(item.status),
      status_text: item.status || '',
      created_at: toIso(item.created_at),
      completed_at: toStatusCode(item.status) === 3 ? toIso(item.created_at) : null,
      remark: item.tx_hash || item.external_tx_id || null,
    })),
    total,
    page: currentPage,
    page_size: currentSize,
    total_pages: Math.max(1, Math.ceil(total / Math.max(currentSize, 1))),
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

  console.warn('[admin/deposit-orders] upstream unavailable, returning empty list', {
    status: remote.status,
    body: remote.text,
  });
  return successResponse(buildEmpty(page, pageSize));
}
