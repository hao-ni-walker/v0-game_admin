import { NextRequest, NextResponse } from 'next/server';
import { errorResponse } from '@/service/response';

const REMOTE_API_URL = 'https://api.xreddeercasino.com/api/admin/storage-configs';

async function forwardRequest(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  request: NextRequest
) {
  const queryString = new URL(request.url).searchParams.toString();
  const remoteUrl = queryString ? `${REMOTE_API_URL}?${queryString}` : REMOTE_API_URL;
  const body =
    method === 'POST' || method === 'PUT'
      ? JSON.stringify(await request.json())
      : undefined;

  const remoteResponse = await fetch(remoteUrl, {
    method,
    headers: {
      'Content-Type': 'application/json'
    },
    body
  });

  if (!remoteResponse.ok) {
    const errorText = await remoteResponse.text();
    return errorResponse(
      `远程API错误: ${remoteResponse.status} ${remoteResponse.statusText} ${errorText}`
    );
  }

  const result = await remoteResponse.json();
  const code = result?.code;
  const success = code === 0 || code === 200;
  const payload = result?.data ?? result;

  if (!success) {
    return errorResponse(result?.msg || result?.message || '存储配置操作失败');
  }

  return NextResponse.json({
    code: 0,
    message: result?.msg || result?.message || 'SUCCESS',
    success: true,
    data: payload
  });
}

export async function GET(request: NextRequest) {
  try {
    return await forwardRequest('GET', request);
  } catch (error) {
    return errorResponse(`获取存储配置失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function POST(request: NextRequest) {
  try {
    return await forwardRequest('POST', request);
  } catch (error) {
    return errorResponse(`创建存储配置失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function PUT(request: NextRequest) {
  try {
    return await forwardRequest('PUT', request);
  } catch (error) {
    return errorResponse(`更新存储配置失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    return await forwardRequest('DELETE', request);
  } catch (error) {
    return errorResponse(`删除存储配置失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}
