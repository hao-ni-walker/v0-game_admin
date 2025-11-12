import { Logger } from '@/lib/logger';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse } from '@/service/response';
import { getRepositories } from '@/repository';
import type { TicketStatus, TicketPriority } from '@/repository/models';

// POST /api/tickets - 创建工单
export async function POST(request: Request) {
  const currentUser = getCurrentUser(request);
  const logger = new Logger('工单管理', currentUser?.id);

  try {
    const body = await request.json();
    const {
      title,
      description,
      priority = 'normal',
      category,
      tags = [],
      userId,
      dueAt
    } = body;

    // 验证必填字段
    if (!title || !description || !category || !userId) {
      await logger.warn('创建工单', '创建工单失败：缺少必填字段', {
        missingFields: {
          title: !title,
          description: !description,
          category: !category,
          userId: !userId
        },
        operatorId: currentUser?.id
      });
      return errorResponse('请填写所有必填字段');
    }

    const repos = await getRepositories();

    // 创建工单
    const id = await repos.tickets.create({
      title,
      description,
      status: 'open',
      priority: priority as TicketPriority,
      category,
      tags: Array.isArray(tags) ? tags : [],
      userId,
      dueAt: dueAt || null
    });

    await logger.info('创建工单', '工单创建成功', {
      ticketId: id,
      title,
      category,
      priority,
      userId,
      operatorId: currentUser?.id
    });

    return successResponse({ id, message: '工单创建成功' });
  } catch (error) {
    await logger.error('创建工单', '创建工单失败：系统错误', {
      error: error instanceof Error ? error.message : String(error),
      operatorId: currentUser?.id
    });

    console.error('创建工单失败:', error);
    return errorResponse('创建工单失败');
  }
}
