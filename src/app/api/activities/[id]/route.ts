import { NextRequest } from 'next/server';
import { getUserFromRequest } from '@/lib/server-permissions';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  notFoundResponse
} from '@/service/response';
import { getRepositories } from '@/repository';

/**
 * 获取活动详情 API
 * GET /api/activities/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserFromRequest();
    if (!userId) {
      return unauthorizedResponse('未授权');
    }

    const { id: idParam } = await params;
    const id = parseInt(idParam, 10);
    if (isNaN(id)) {
      return errorResponse('无效的活动ID');
    }

    const repos = await getRepositories();
    const activity = await repos.activities.getById(id);

    if (!activity) {
      return notFoundResponse('活动不存在');
    }

    return successResponse(activity);
  } catch (error) {
    console.error('获取活动详情失败:', error);
    return errorResponse('获取活动详情失败');
  }
}

/**
 * 更新活动 API
 * PUT /api/activities/[id]
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserFromRequest();
    if (!userId) {
      return unauthorizedResponse('未授权');
    }

    const { id: idParam } = await params;
    const id = parseInt(idParam, 10);
    if (isNaN(id)) {
      return errorResponse('无效的活动ID');
    }

    const body = await request.json();
    const repos = await getRepositories();

    const activity = await repos.activities.getById(id);
    if (!activity) {
      return notFoundResponse('活动不存在');
    }

    // 更新活动
    await repos.activities.update(id, {
      ...body,
      updatedBy: userId
    });

    return successResponse({ message: '活动更新成功' });
  } catch (error) {
    console.error('更新活动失败:', error);
    return errorResponse('更新活动失败');
  }
}

/**
 * 删除活动 API
 * DELETE /api/activities/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserFromRequest();
    if (!userId) {
      return unauthorizedResponse('未授权');
    }

    const { id: idParam } = await params;
    const id = parseInt(idParam, 10);
    if (isNaN(id)) {
      return errorResponse('无效的活动ID');
    }

    const repos = await getRepositories();

    const activity = await repos.activities.getById(id);
    if (!activity) {
      return notFoundResponse('活动不存在');
    }

    await repos.activities.delete(id);

    return successResponse({ message: '活动删除成功' });
  } catch (error) {
    console.error('删除活动失败:', error);
    return errorResponse('删除活动失败');
  }
}
