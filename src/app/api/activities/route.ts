import { NextRequest } from 'next/server';
import { getUserFromRequest } from '@/lib/server-permissions';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse
} from '@/service/response';
import { getRepositories } from '@/repository';
import type { Activity } from '@/repository/models';

/**
 * 创建活动 API
 * POST /api/activities
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserFromRequest();
    if (!userId) {
      return unauthorizedResponse('未授权');
    }

    const body = await request.json();
    const {
      activityCode,
      activityType,
      name,
      description,
      startTime,
      endTime,
      displayStartTime,
      displayEndTime,
      status = 'draft',
      priority = 100,
      participationConfig = {},
      extraConfig = {},
      iconUrl,
      bannerUrl
    } = body;

    // 验证必填字段
    if (!activityCode || !activityType || !name || !description || !startTime || !endTime) {
      return errorResponse('请填写所有必填字段');
    }

    const repos = await getRepositories();

    // 检查活动编码是否已存在
    const existing = await repos.activities.findByCode(activityCode);
    if (existing) {
      return errorResponse('活动编码已存在');
    }

    // 创建活动
    const id = await repos.activities.create({
      activityCode,
      activityType,
      name,
      description,
      startTime,
      endTime,
      displayStartTime: displayStartTime || null,
      displayEndTime: displayEndTime || null,
      status,
      priority,
      participationConfig,
      extraConfig,
      totalParticipants: 0,
      totalRewardsGiven: 0,
      iconUrl: iconUrl || null,
      bannerUrl: bannerUrl || null,
      createdBy: userId,
      updatedBy: userId
    });

    return successResponse({ id, message: '活动创建成功' });
  } catch (error) {
    console.error('创建活动失败:', error);
    return errorResponse('创建活动失败');
  }
}
