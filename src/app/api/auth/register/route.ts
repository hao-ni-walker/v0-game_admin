import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { encryptPassword } from '@/lib/crypto';
import {
  successResponse,
  errorResponse
} from '@/service/response';

const REMOTE_API_URL = 'https://api.xreddeercasino.com/api/admin/register';

interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  roleId: number;
  isSuperAdmin?: boolean;
}

export async function POST(request: Request) {
  try {
    const body: RegisterRequest = await request.json();
    const { username, email, password, roleId, isSuperAdmin = false } = body;

    // 验证必填字段
    if (!username || !email || !password) {
      await logger.warn('用户认证', '用户注册', '注册失败：缺少必填字段', {
        missingFields: {
          username: !username,
          email: !email,
          password: !password
        },
        timestamp: new Date().toISOString()
      });

      return errorResponse('请填写所有必填字段');
    }

    // 加密密码
    const encryptedPassword = await encryptPassword(password);

    // 转换字段格式并发送到远程 API
    const remotePayload = {
      username,
      email,
      password: encryptedPassword,
      role_id: roleId,
      is_super_admin: isSuperAdmin
    };

    const response = await fetch(REMOTE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(remotePayload)
    });

    const result = await response.json();

    // 处理远程 API 响应
    if (result.code === 200) {
      await logger.info('用户认证', '用户注册', '用户注册成功', {
        username,
        email,
        roleId,
        isSuperAdmin,
        timestamp: new Date().toISOString()
      });

      return successResponse({
        message: '注册成功',
        data: result.data
      });
    } else {
      await logger.warn('用户认证', '用户注册', '注册失败：远程API返回错误', {
        username,
        email,
        remoteError: result.msg,
        timestamp: new Date().toISOString()
      });

      return errorResponse(result.msg || '注册失败');
    }
  } catch (error) {
    await logger.error('用户认证', '用户注册', '注册过程发生服务器错误', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });

    return errorResponse('服务器错误');
  }
}

