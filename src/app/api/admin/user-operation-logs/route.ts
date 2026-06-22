import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { requestRemoteAdminApi } from '@/lib/admin-remote';
import {
  successResponse,
  unauthorizedResponse,
} from '@/service/response';

const LIST_PATH = '/api/v1/admin/audit/operations';

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

function normalizeLogs(payload: any, page: number, pageSize: number) {
  const items = Array.isArray(payload?.items) ? payload.items : [];
  const pagination = payload?.pagination || {};
  const currentPage = Number(pagination.page || page || 1);
  const currentSize = Number(pagination.size || pageSize || 20);
  const total = Number(pagination.total || items.length || 0);

  return {
    items: items.map((item: any) => ({
      id: Number(item.log_id || item.id || 0),
      user_id: Number(item.operator_id || 0),
      username: item.operator_name || '',
      operation: item.operation_type || '',
      table_name: item.target_type || '',
      object_id: item.target_id || '',
      old_data: item.data_before || null,
      new_data: item.data_after || null,
      description: item.reason || item.operation_type || '',
      ip_address: item.operator_ip || '',
      source: 'admin',
      user_agent: '',
      operation_at: toIso(item.created_at),
      created_at: toIso(item.created_at),
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
    data?: any;
  }>({
    path: `${LIST_PATH}${sp.toString() ? `?${sp.toString()}` : ''}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token.value}`,
    },
  });

  if (remote.ok && remote.data && (remote.data.code === 0 || remote.data.code === 200)) {
    return successResponse(normalizeLogs(remote.data.data, page, pageSize));
  }

  console.warn('[admin/user-operation-logs] upstream unavailable, returning empty list', {
    status: remote.status,
    body: remote.text,
  });
  return successResponse(buildEmpty(page, pageSize));
}
