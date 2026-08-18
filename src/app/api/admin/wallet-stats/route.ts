import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { requestRemoteAdminApi } from '@/lib/admin-remote';
import { errorResponse, successResponse, unauthorizedResponse } from '@/service/response';

const OVERVIEW_PATH = '/api/v1/admin/wallet-stats/overview';
const REFRESH_PATH = '/api/v1/admin/wallet-stats/refresh';

async function proxy(remotePath: string, method: 'GET' | 'POST') {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');
  if (!token?.value) return unauthorizedResponse('未授权访问');

  const remoteResponse = await requestRemoteAdminApi<{
    code?: number;
    message?: string;
    data?: unknown;
  }>({
    path: remotePath,
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token.value}` },
  });
  if (!remoteResponse.ok) {
    if (remoteResponse.status === 401) return unauthorizedResponse('认证失败，请重新登录');
    return errorResponse(`远程API错误: ${remoteResponse.status}`);
  }
  const result = remoteResponse.data;
  if (!result || (result.code !== 0 && result.code !== 200)) {
    return errorResponse(result?.message || '获取钱包余额数据失败');
  }
  return successResponse(result.data);
}

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams.toString();
  try {
    return await proxy(`${OVERVIEW_PATH}${params ? `?${params}` : ''}`, 'GET');
  } catch (error) {
    console.error('获取钱包余额数据失败:', error);
    return errorResponse('获取钱包余额数据失败');
  }
}

export async function POST() {
  try {
    return await proxy(REFRESH_PATH, 'POST');
  } catch (error) {
    console.error('刷新钱包余额失败:', error);
    return errorResponse('刷新钱包余额失败');
  }
}
