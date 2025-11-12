import { NextRequest } from 'next/server';
import { getUserFromRequest } from '@/lib/server-permissions';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse
} from '@/service/response';
import { getRepositories } from '@/repository';
import type { ActivityStatus, ActivityType } from '@/repository/models';

/**
 * 活动列表 API
 * POST /api/activities/list
 */
export async function POST(request: NextRequest) {
  try {
    // 检查用户权限
    const userId = await getUserFromRequest();
    if (!userId) {
      return unauthorizedResponse('未授权');
    }

    // 解析请求体
    const body = await request.json();
    const {
      keyword,
      activityTypes,
      statuses,
      activeOnly,
      availableForDisplay,
      startFrom,
      startTo,
      endFrom,
      endTo,
      displayFrom,
      displayTo,
      participantsMin,
      participantsMax,
      rewardsMin,
      rewardsMax,
      updatedFrom,
      updatedTo,
      sortBy = 'priority',
      sortDir = 'desc',
      page = 1,
      pageSize = 20
    } = body;

    const repos = await getRepositories();

    // 调用仓储层查询
    const result = await repos.activities.list({
      keyword,
      activityTypes,
      statuses,
      activeOnly,
      availableForDisplay,
      startFrom,
      startTo,
      endFrom,
      endTo,
      displayFrom,
      displayTo,
      participantsMin,
      participantsMax,
      rewardsMin,
      rewardsMax,
      updatedFrom,
      updatedTo,
      sortBy,
      sortDir,
      page,
      limit: pageSize
    });

    // 返回符合规范的响应结构
    return successResponse({
      total: result.total,
      page: result.page,
      page_size: result.limit,
      list: result.data
    });
  } catch (error) {
    console.error('获取活动列表失败:', error);
    return errorResponse('获取活动列表失败');
  }
}
