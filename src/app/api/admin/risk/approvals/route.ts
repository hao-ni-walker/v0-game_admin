import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { requestRemoteAdminApi } from '@/lib/admin-remote';
import {
  successResponse,
  unauthorizedResponse,
} from '@/service/response';

const LIST_PATH = '/api/v1/admin/risk/approvals';

function buildEmpty(page: number, size: number) {
  return {
    items: [],
    pagination: {
      page,
      size,
      total: 0,
    },
  };
}

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  if (!token?.value) {
    return unauthorizedResponse('未授权访问');
  }

  const sp = new URLSearchParams(req.nextUrl.searchParams);
  const page = Number(sp.get('page') || '1');
  const size = Number(sp.get('size') || '20');
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
    return successResponse(remote.data.data);
  }

  console.warn('[admin/risk/approvals] upstream unavailable, returning empty list', {
    status: remote.status,
    body: remote.text,
  });
  return successResponse(buildEmpty(page, size));
}
