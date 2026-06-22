import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { requestRemoteAdminApi } from '@/lib/admin-remote';
import {
  successResponse,
  unauthorizedResponse,
} from '@/service/response';

const LIST_PATH = '/api/v1/admin/games';

function buildEmpty(page: number, pageSize: number) {
  return {
    items: [],
    total: 0,
    page,
    page_size: pageSize,
    total_pages: 1,
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
  const pageSize = Number(sp.get('page_size') || '1000');
  const remote = await requestRemoteAdminApi<{
    code?: number;
    data?: any;
  }>({
    path: `${LIST_PATH}${sp.size ? `?${sp.toString()}` : sp.toString() ? `?${sp.toString()}` : ''}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token.value}`,
    },
  });

  if (remote.ok && remote.data && (remote.data.code === 0 || remote.data.code === 200)) {
    const data = remote.data.data;
    if (data && Array.isArray(data.items)) {
      return successResponse(data);
    }
  }

  return successResponse(buildEmpty(page, pageSize));
}
