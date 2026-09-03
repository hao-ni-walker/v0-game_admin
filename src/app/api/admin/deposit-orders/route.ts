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
    // Mid-flight states (seen on-chain, not finalized) — distinct from a
    // never-paid placeholder: lumping them into 待支付 hid stuck rows during
    // the 2026-09-03 incident diagnosis.
    case 'broadcasting':
    case 'confirming':
      return 1;
    default:
      return 2;
  }
}

// Inverse of toStatusCode: the admin filters send numeric status codes, but the
// backend `/admin/deposit/records` expects the raw Deposit.status STRING
// (comma-joined for multi-select). Returns undefined for unknown codes so we
// don't silently over-filter.
function toBackendStatus(code: number | string): string | undefined {
  switch (Number(code)) {
    case 3:
      return 'completed';
    case 4:
      return 'failed';
    case 5:
      return 'expired';
    case 2:
      return 'awaiting_transfer';
    case 1:
      return 'broadcasting,confirming';
    default:
      return undefined;
  }
}

// Normalize the deposit channel label for the admin "渠道" column. Fiat rows
// carry method = "fiat" / "paypal" / "apple pay" (chain is NULL), so collapse
// them to a single "Fiat" channel — the specific rail (PayPal/Apple Pay) is a
// sub-method, not a channel. Crypto chains pass through unchanged.
function toChannelLabel(item: any): string {
  const method = String(item.method || '').toLowerCase();
  if (method === 'fiat' || method === 'paypal' || method === 'apple pay') {
    return 'Fiat';
  }
  if (item.chain) return String(item.chain);
  if (item.method) return String(item.method);
  if (item.asset) return String(item.asset);
  return 'TON';
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
      channel_name: toChannelLabel(item),
      amount: Number(item.amount || item.amount_usd || 0),
      fee: 0,
      bonus_amount: 0,
      actual_amount:
        toStatusCode(item.status) === 3 ? Number(item.amount || item.amount_usd || 0) : null,
      status: toStatusCode(item.status),
      status_text: item.status || '',
      created_at: toIso(item.created_at),
      // Real completion time (backend updated_at = credit/expiry moment) for
      // completed rows ONLY — non-terminal rows render '—'. Never fabricate
      // from created_at: an awaiting placeholder showing a "completion time"
      // misled ops during the 2026-09-03 stuck-order investigation.
      completed_at: toStatusCode(item.status) === 3 ? toIso(item.updated_at) : null,
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
  // The admin filters send numeric status codes (status=3&status=4), but the
  // backend Deposit.status is a string ("completed"). Map each code back and
  // send a single comma-joined `status` value the backend understands.
  if (sp.has('status')) {
    const codes = sp.getAll('status');
    const mapped = codes
      .map((c) => toBackendStatus(c))
      .filter((s): s is string => Boolean(s));
    sp.delete('status');
    if (mapped.length) {
      sp.set('status', Array.from(new Set(mapped)).join(','));
    }
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
