import { cookies } from 'next/headers';
import { requestRemoteAdminApi } from '@/lib/admin-remote';
import { successResponse, unauthorizedResponse } from '@/service/response';

const STATUS_PATH = '/api/v1/admin/risk/status';
const PERIODS = ['30s', '1m', '3m', '5m', '10m'] as const;
const REQUEST_TIMEOUT_MS = 1200;

interface RiskStatusPayload {
  overall_level?: string;
  periods?: Array<{
    period?: string;
    net_exposure?: number;
    long_amount?: number;
    short_amount?: number;
    risk_level?: string;
    odds_status?: string;
    is_accepting?: boolean;
    dominant_side?: string | null;
  }>;
  single_side_triggered?: boolean;
}

function buildFallbackStatus() {
  return {
    overall_level: 'normal',
    periods: PERIODS.map((period) => ({
      period,
      net_exposure: 0,
      long_amount: 0,
      short_amount: 0,
      risk_level: 'normal',
      odds_status: 'active',
      is_accepting: true,
      dominant_side: null,
    })),
    single_side_triggered: false,
  };
}

function normalizeStatus(payload?: RiskStatusPayload | null) {
  const fallback = buildFallbackStatus();
  if (!payload) {
    return fallback;
  }

  const periodMap = new Map(
    (payload.periods || [])
      .filter((item): item is NonNullable<RiskStatusPayload['periods']>[number] & { period: string } => !!item?.period)
      .map((item) => [item.period, item]),
  );

  return {
    overall_level: payload.overall_level || fallback.overall_level,
    periods: PERIODS.map((period) => {
      const current = periodMap.get(period);
      return {
        period,
        net_exposure: Number(current?.net_exposure ?? 0),
        long_amount: Number(current?.long_amount ?? 0),
        short_amount: Number(current?.short_amount ?? 0),
        risk_level: current?.risk_level || 'normal',
        odds_status: current?.odds_status || 'active',
        is_accepting: current?.is_accepting ?? true,
        dominant_side: current?.dominant_side ?? null,
      };
    }),
    single_side_triggered: payload.single_side_triggered ?? false,
  };
}

async function fetchRemoteStatus(token: string) {
  return Promise.race([
    requestRemoteAdminApi<{ code?: number; data?: RiskStatusPayload }>({
      path: STATUS_PATH,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }),
    new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), REQUEST_TIMEOUT_MS);
    }),
  ]);
}

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  if (!token?.value) {
    return unauthorizedResponse('未授权访问');
  }

  try {
    const remote = await fetchRemoteStatus(token.value);
    if (remote && remote.ok && remote.data && (remote.data.code === 0 || remote.data.code === 200)) {
      return successResponse(normalizeStatus(remote.data.data));
    }
  } catch (error) {
    console.warn('[admin/risk/status] upstream request failed, returning fallback', error);
  }

  return successResponse(buildFallbackStatus());
}
