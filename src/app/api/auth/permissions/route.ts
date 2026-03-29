import {
  successResponse,
  errorResponse,
  unauthorizedResponse
} from '@/service/response';
import { auth } from '@/lib/auth';

// Mock 模式：返回所有权限
const MOCK_PERMISSIONS = [
  'dashboard:view',
  'user:view',
  'user:create',
  'user:edit',
  'user:delete',
  'role:view',
  'role:create',
  'role:edit',
  'role:delete',
  'permission:view',
  'permission:create',
  'permission:edit',
  'permission:delete',
  'log:view',
  'system:config',
  'player:view',
  'announcement:view',
  'announcement:create',
  'announcement:edit',
  'announcement:delete',
  'banner:view',
  'banner:create',
  'banner:edit',
  'banner:delete'
];

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return unauthorizedResponse('未登录');
    }
    // Mock 模式：直接返回所有权限
    return successResponse(MOCK_PERMISSIONS);
  } catch (error) {
    console.error('获取用户权限失败:', error);
    return errorResponse('获取权限失败');
  }
}
