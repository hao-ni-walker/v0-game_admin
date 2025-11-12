import { NextRequest } from 'next/server';
import { getUserFromRequest } from '@/lib/server-permissions';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  notFoundResponse
} from '@/service/response';
import { getRepositories } from '@/repository';
import type { ActivityStatus } from '@/repository/models';

/**
 * 更改活动状态 API
 * POST /api/activities/[id]/status
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserFromRequest();
    if (!userId) {
      return unauthorizedResponse('未授权');
    }

    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return errorResponse('无效的活动ID');
    }

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return errorResponse('请提供状态');
    }

    const validStatuses: ActivityStatus[] = [
      'draft',
      'scheduled',
      'active',
      'paused',
      'ended',
      'disabled'
    ];

    if (!validStatuses.includes(status)) {
      return errorResponse('无效的状态');
    }

    const repos = await getRepositories();

    const activity = await repos.activities.getById(id);
    if (!activity) {
      return notFoundResponse('活动不存在');
    }

    // 更改状态
    await repos.activities.changeStatus(id, status, userId);

    return successResponse({ message: '状态更新成功' });
  } catch (error) {
    console.error('更改活动状态失败:', error);
    return errorResponse('更改活动状态失败');
  }
}
