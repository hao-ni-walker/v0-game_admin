import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import {
  errorResponse,
  successResponse,
  unauthorizedResponse
} from '@/service/response';

const REMOTE_API_URL =
  (process.env.NEXT_PUBLIC_ADMIN_API_URL ||
    'https://apiexchange.haohaotest.xyz') + '/api/admin/system-configs';

async function proxyRequest(
  request: NextRequest,
  id: string,
  method: 'GET' | 'PUT' | 'DELETE'
) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  if (!token?.value) {
    return unauthorizedResponse('未授权访问');
  }

  const remoteResponse = await fetch(`${REMOTE_API_URL}/${id}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token.value}`
    },
    body: method === 'PUT' ? await request.text() : undefined
  });

  if (!remoteResponse.ok) {
    const errorText = await remoteResponse.text();
    console.error('[系统参数配置] 详情代理失败:', {
      method,
      id,
      status: remoteResponse.status,
      statusText: remoteResponse.statusText,
      errorText
    });

    if (remoteResponse.status === 401) {
      return unauthorizedResponse('认证失败，请重新登录');
    }

    return errorResponse(
      `远程API错误: ${remoteResponse.status} ${remoteResponse.statusText}`
    );
  }

  const result = await remoteResponse.json();
  if (result.code !== 0 && result.code !== 200) {
    return errorResponse(result.msg || result.message || '系统配置操作失败');
  }

  return NextResponse.json({
    code: 0,
    message: result.msg || result.message || 'SUCCESS',
    success: true,
    data: result.data ?? null
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    return await proxyRequest(request, id, 'GET');
  } catch (error) {
    console.error('[系统参数配置] 获取详情失败:', error);
    return errorResponse('获取系统配置详情失败');
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    return await proxyRequest(request, id, 'PUT');
  } catch (error) {
    console.error('[系统参数配置] 更新失败:', error);
    return errorResponse('更新系统配置失败');
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    return await proxyRequest(request, id, 'DELETE');
  } catch (error) {
    console.error('[系统参数配置] 删除失败:', error);
    return errorResponse('删除系统配置失败');
  }
}

