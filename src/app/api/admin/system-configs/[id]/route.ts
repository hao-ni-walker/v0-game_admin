import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import {
  notFoundResponse,
  successResponse,
  unauthorizedResponse,
} from '@/service/response';

const FALLBACK_ROWS = [
  {
    id: 1,
    config_key: 'system.risk_thresholds',
    config_value:
      '{"exposure_warning":3000,"exposure_high":6000,"exposure_extreme":10000}',
    config_type: 'json',
    description: 'System config: risk_thresholds',
    is_public: false,
    version: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    removed: false,
    disabled: false,
  },
];

async function requireAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');
  return token?.value || null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAuth())) {
    return unauthorizedResponse('未授权访问');
  }

  const { id } = await params;
  const row = FALLBACK_ROWS.find((item) => item.id === Number(id));
  return row ? successResponse(row) : notFoundResponse('系统配置不存在');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAuth())) {
    return unauthorizedResponse('未授权访问');
  }

  const { id } = await params;
  const body = await request.json();
  return successResponse({
    id: Number(id),
    ...body,
    updated_at: new Date().toISOString(),
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAuth())) {
    return unauthorizedResponse('未授权访问');
  }

  const { id } = await params;
  return successResponse({
    id: Number(id),
    deleted: true,
  });
}
