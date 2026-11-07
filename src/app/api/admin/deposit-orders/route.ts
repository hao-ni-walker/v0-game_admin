import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { requestRemoteAdminApi } from '@/lib/admin-remote';
import {
  successResponse,
  serviceUnavailableResponse,
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

// 非终态失败的后端状态（豆腐块统计口径：failed/expired 不计入）。
// 数字码与 toStatusCode/toBackendStatus 对齐：1=支付中 2=待支付 3=成功。
const COUNTED_BACKEND_STATUSES = [
  'awaiting_transfer',
  'broadcasting',
  'confirming',
  'completed',
];
const COUNTED_CODES = new Set(['1', '2', '3']);

// 构建第二查询参数：同筛选条件，但 status 收敛为「剔除终态失败」的正面
// 枚举，page=1&size=1 最小负载——只为拿 pagination.total。
// 返回 null 表示无需发请求（用户纯筛失败态，剔除后必然为 0）。
function buildCountParams(
  sp: URLSearchParams,
  rawStatusCodes: string[]
): URLSearchParams | null {
  const countSp = new URLSearchParams(sp);
  countSp.delete('page');
  countSp.delete('size');
  countSp.set('page', '1');
  countSp.set('size', '1');

  if (rawStatusCodes.length === 0) {
    countSp.set('status', COUNTED_BACKEND_STATUSES.join(','));
    return countSp;
  }
  const positive = rawStatusCodes
    .filter((c) => COUNTED_CODES.has(c))
    .map((c) => toBackendStatus(c))
    .filter((s): s is string => Boolean(s));
  if (positive.length === 0) return null;
  countSp.set('status', Array.from(new Set(positive)).join(','));
  return countSp;
}

async function fetchCountTotal(
  sp: URLSearchParams,
  rawStatusCodes: string[],
  token: string
): Promise<number | undefined> {
  try {
    const countParams = buildCountParams(sp, rawStatusCodes);
    if (!countParams) return 0;
    const remote = await requestRemoteAdminApi<{
      code?: number;
      data?: { pagination?: { total?: number } };
    }>({
      path: `${LIST_PATH}?${countParams.toString()}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    if (remote.ok && remote.data && (remote.data.code === 0 || remote.data.code === 200)) {
      const total = Number(remote.data.data?.pagination?.total);
      return Number.isFinite(total) ? total : undefined;
    }
    console.warn('[admin/deposit-orders] count_total upstream unavailable', {
      status: remote.status,
    });
    return undefined;
  } catch (error) {
    console.warn('[admin/deposit-orders] count_total request failed', error);
    return undefined;
  }
}

function normalizeList(payload: any, page: number, pageSize: number) {
  const items = Array.isArray(payload?.items) ? payload.items : [];
  const pagination = payload?.pagination || {};
  const currentPage = Number(pagination.page || page || 1);
  const currentSize = Number(pagination.size || pageSize || 20);
  const total = Number(pagination.total || items.length || 0);

  return {
    // 剔除终态失败后的全量笔数（豆腐块「订单数」口径）；由 GET 主流程
    // 按第二请求结果填充，上游不可用时保持 undefined 供前端回落
    count_total: undefined as number | undefined,
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
      platform_address: item.platform_address || null,
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
  const rawStatusCodes = sp.has('status') ? sp.getAll('status') : [];
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

  // 主列表与「剔除失败后全量笔数」并行请求：后者是统计豆腐块的
  // 「订单数」口径（count_total），失败时缺省、前端回落全量 total
  const [remote, countTotal] = await Promise.all([
    requestRemoteAdminApi<{
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
    }),
    fetchCountTotal(sp, rawStatusCodes, token.value),
  ]);

  if (remote.ok && remote.data && (remote.data.code === 0 || remote.data.code === 200)) {
    const payload = normalizeList(remote.data.data, page, pageSize);
    if (countTotal !== undefined) {
      payload.count_total = countTotal;
    }
    return successResponse(payload);
  }

  console.warn('[admin/deposit-orders] upstream unavailable, returning empty list', {
    status: remote.status,
    body: remote.text,
  });
  return serviceUnavailableResponse('充值订单服务暂不可用，列表未能刷新，请稍后重试');
}
