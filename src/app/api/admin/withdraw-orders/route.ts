import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { requestRemoteAdminApi } from '@/lib/admin-remote';
import {
  serviceUnavailableResponse,
  successResponse,
  unauthorizedResponse,
} from '@/service/response';

const LIST_PATH = '/api/v1/admin/withdraw/pending-review';
const RECORDS_PATH = '/api/v1/admin/withdraw/records';

// Backend Withdrawal.status → page WithdrawOrderStatus. The page could
// previously only ever see pending-review rows — broadcasting/completed/
// failed payouts were invisible (ops had to query the DB directly during the
// 2026-09-03 incident triage).
const STATUS_TO_PAGE: Record<string, string> = {
  validating: 'pending_audit',
  pending_review: 'pending_audit',
  processing: 'audit_passed',
  broadcasting: 'payout_processing',
  completed: 'success',
  refunded: 'rejected',
  failed: 'failed',
  rejected: 'rejected',
};

// Inverse map for the page's status filter (comma-joined backend statuses).
const PAGE_STATUS_TO_BACKEND: Record<string, string> = {
  pending_audit: 'validating,pending_review',
  audit_passed: 'processing',
  payout_processing: 'broadcasting',
  success: 'completed',
  rejected: 'refunded,rejected',
  failed: 'failed',
};

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
    const rawStatus = String(item.status || 'pending_review').toLowerCase();
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
      fee: Number(item.fee || 0),
      actualAmount:
        item.amount_asset !== undefined && item.amount_asset !== null
          ? Number(item.amount_asset)
          : null,
      status: STATUS_TO_PAGE[rawStatus] || 'pending_audit',
      currency: item.asset || 'USDT',
      accountNumber: item.to_address || '',
      auditStatus: rawStatus === 'pending_review' || rawStatus === 'validating'
        ? 'pending' : rawStatus === 'rejected' ? 'rejected' : 'approved',
      payoutStatus: rawStatus === 'broadcasting' || rawStatus === 'processing'
        ? 'processing'
        : rawStatus === 'completed'
          ? 'success'
          : rawStatus === 'failed' || rawStatus === 'refunded' || rawStatus === 'rejected'
            ? 'failed' : 'pending',
      createdAt: toIso(item.created_at),
      completedAt: rawStatus === 'completed' ? toIso(item.updated_at) : null,
      updatedAt: toIso(item.updated_at || item.created_at),
    };
  });

  return {
    data,
    stats: {
      totalAmount: data.reduce(
        (sum: number, row: { amount?: number }) => sum + Number(row.amount || 0),
        0
      ),
      totalFee: data.reduce(
        (sum: number, row: { fee?: number }) => sum + Number(row.fee || 0),
        0
      ),
      totalActualAmount: data.reduce(
        (sum: number, row: { actualAmount?: number | null }) => sum + Number(row.actualAmount || 0),
        0
      ),
      successCount: data.filter((row: { status?: string }) => row.status === 'success').length,
      failedCount: data.filter(
        (row: { status?: string }) => row.status === 'failed' || row.status === 'rejected'
      ).length,
    },
    pager: {
      page: currentPage,
      limit: currentSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / Math.max(currentSize, 1))),
    },
  };
}

function normalizeRecords(payload: any, page: number, pageSize: number) {
  const items = Array.isArray(payload?.items) ? payload.items : [];
  const pagination = payload?.pagination || {};
  const data = items.map((item: any) => ({
    id: Number(item.withdraw_id || item.id || 0),
    orderNo: `WD${item.withdraw_id || item.id || ''}`,
    channelOrderNo: item.tx_hash || null,
    userId: Number(item.user_id || 0),
    username: item.user_masked || item.username || undefined,
    paymentChannelId: 0,
    paymentChannelName: item.asset || 'USDT',
    paymentChannelCode: item.chain || item.asset || 'USDT',
    amount: Number(item.amount || 0),
    fee: Number(item.fee || 0),
    actualAmount:
      item.amount_asset !== undefined && item.amount_asset !== null
        ? Number(item.amount_asset)
        : null,
    status: STATUS_TO_PAGE[item.status] || 'pending_audit',
    statusText: item.status || '',
    currency: item.asset || 'USDT',
    accountNumber: item.to_address || '',
    auditStatus:
      item.status === 'pending_review' || item.status === 'validating' ? 'pending' : 'approved',
    payoutStatus:
      item.status === 'broadcasting' || item.status === 'processing'
        ? 'processing'
        : item.status === 'completed'
          ? 'success'
          : item.status === 'failed' || item.status === 'refunded' || item.status === 'rejected'
            ? 'failed'
            : 'pending',
    remark: item.reason || null,
    createdAt: toIso(item.created_at),
    completedAt: item.status === 'completed' ? toIso(item.updated_at) : null,
    updatedAt: toIso(item.updated_at),
  }));

  return {
    data,
    stats: {
      totalAmount: data.reduce(
        (sum: number, row: { amount?: number }) => sum + Number(row.amount || 0),
        0
      ),
      totalFee: 0,
      totalActualAmount: 0,
      successCount: data.filter((row: { status?: string }) => row.status === 'success').length,
      failedCount: data.filter(
        (row: { status?: string }) => row.status === 'failed' || row.status === 'rejected'
      ).length,
    },
    pager: {
      page: Number(pagination.page || page || 1),
      limit: Number(pagination.size || pageSize || 20),
      total: Number(pagination.total || items.length || 0),
      totalPages: Math.max(
        1,
        Math.ceil(Number(pagination.total || items.length || 0) / Math.max(pageSize, 1))
      ),
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

  // Default view = the FULL lifecycle via /records (was: pending-review only).
  // The page's status filter values are page-level codes — translate them to
  // backend statuses. No filter → all statuses.
  const recordsSp = new URLSearchParams();
  recordsSp.set('page', String(page));
  recordsSp.set('size', String(pageSize));
  if (sp.has('status')) {
    const backendStatus = PAGE_STATUS_TO_BACKEND[sp.get('status') as string];
    if (backendStatus) {
      recordsSp.set('status', backendStatus);
    }
    sp.delete('status');
  }
  if (sp.has('username')) {
    // pending-review proxy used username as a keyword; records filters by id.
    const kw = sp.get('username') as string;
    if (/^\d+$/.test(kw)) recordsSp.set('user_id', kw);
    sp.delete('username');
  }

  const remote = await requestRemoteAdminApi<{
    code?: number;
    message?: string;
    msg?: string;
    data?: unknown;
  }>({
    path: `${RECORDS_PATH}?${recordsSp.toString()}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token.value}`,
    },
  });

  if (remote.ok && remote.data && (remote.data.code === 0 || remote.data.code === 200)) {
    return successResponse(normalizeRecords(remote.data.data, page, pageSize));
  }

  // Fallback to the legacy pending-review proxy so the page still shows the
  // review queue if the records endpoint is unavailable (older backend).
  const legacy = await requestRemoteAdminApi<{
    code?: number;
    message?: string;
    msg?: string;
    data?: unknown;
  }>({
    path: `${LIST_PATH}?page=${page}&size=${pageSize}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token.value}`,
    },
  });

  if (legacy.ok && legacy.data && (legacy.data.code === 0 || legacy.data.code === 200)) {
    return successResponse(normalizeList(legacy.data.data, page, pageSize));
  }

  console.warn('[admin/withdraw-orders] upstream unavailable, returning empty list', {
    status: remote.status,
    body: remote.text,
  });
  return serviceUnavailableResponse('提现订单服务暂不可用，列表未能刷新，请稍后重试');
}
