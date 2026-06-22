import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { requestRemoteAdminApi } from '@/lib/admin-remote';
import {
  successResponse,
  unauthorizedResponse,
} from '@/service/response';

const CONFIG_PATH = '/api/v1/admin/system/config';

const FALLBACK_CONFIG = {
  risk_thresholds: {
    exposure_warning: 3000,
    exposure_high: 6000,
    exposure_extreme: 10000,
  },
  single_side_detection: {
    price_window_minutes: 5,
    price_change_threshold_pct: 1.5,
    direction_ratio_threshold_pct: 75,
    auto_restore_cool_minutes: 3,
  },
  price_source: {
    primary: 'Binance',
    backup: 'Coinbase',
    switch_threshold_pct: 0.1,
    timeout_seconds: 5,
  },
  withdraw: {
    min_amount_usd: 5,
    max_daily_usd: 10000,
    fee_rate: 0.001,
  },
};

function detectType(value: unknown): 'string' | 'number' | 'boolean' | 'json' {
  if (typeof value === 'number') return 'number';
  if (typeof value === 'boolean') return 'boolean';
  if (value && typeof value === 'object') return 'json';
  return 'string';
}

function serializeValue(value: unknown): string {
  return typeof value === 'object' && value !== null
    ? JSON.stringify(value)
    : String(value ?? '');
}

function buildRows(config: Record<string, unknown>) {
  const now = new Date().toISOString();
  return Object.entries(config).map(([key, value], index) => ({
    id: index + 1,
    config_key: `system.${key}`,
    config_value: serializeValue(value),
    config_type: detectType(value),
    description: `System config: ${key}`,
    is_public: false,
    version: 1,
    created_at: now,
    updated_at: now,
    removed: false,
    disabled: false,
  }));
}

function applyFilters(rows: any[], request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const keyword = (searchParams.get('keyword') || '').trim().toLowerCase();
  const configTypes = (searchParams.get('config_types') || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  const page = Math.max(1, Number(searchParams.get('page') || '1'));
  const pageSize = Math.max(1, Number(searchParams.get('page_size') || '20'));
  const sortBy = searchParams.get('sort_by') || 'updated_at';
  const sortDir = searchParams.get('sort_dir') || 'desc';

  let filtered = rows.slice();
  if (keyword) {
    filtered = filtered.filter(
      (row) =>
        row.config_key.toLowerCase().includes(keyword) ||
        row.description.toLowerCase().includes(keyword)
    );
  }
  if (configTypes.length > 0) {
    filtered = filtered.filter((row) => configTypes.includes(row.config_type));
  }

  filtered.sort((a, b) => {
    const av = a[sortBy] ?? '';
    const bv = b[sortBy] ?? '';
    const compare = String(av).localeCompare(String(bv));
    return sortDir === 'asc' ? compare : -compare;
  });

  const total = filtered.length;
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  return {
    items: pageRows,
    total,
    page,
    page_size: pageSize,
    total_pages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');
  if (!token?.value) {
    return unauthorizedResponse('未授权访问');
  }

  const remote = await requestRemoteAdminApi<{
    code?: number;
    data?: Record<string, unknown>;
  }>({
    path: CONFIG_PATH,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token.value}`,
    },
  });

  const config =
    remote.ok && remote.data && (remote.data.code === 0 || remote.data.code === 200)
      ? remote.data.data || FALLBACK_CONFIG
      : FALLBACK_CONFIG;

  return successResponse(applyFilters(buildRows(config), request));
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');
  if (!token?.value) {
    return unauthorizedResponse('未授权访问');
  }

  const body = await request.json();
  return successResponse({
    id: Date.now(),
    ...body,
    version: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    removed: false,
    disabled: Boolean(body.disabled),
  });
}
