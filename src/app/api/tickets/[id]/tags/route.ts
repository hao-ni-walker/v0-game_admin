import { Logger } from '@/lib/logger';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse } from '@/service/response';
import { getRepositories } from '@/repository';

// POST /api/tickets/[id]/tags - 更新工单标签
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentUser = getCurrentUser(request);
  const logger = new Logger('工单管理', currentUser?.id);

  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return errorResponse('无效的工单ID');
    }

    const body = await request.json();
    const { tags } = body;

    if (!Array.isArray(tags)) {
      return errorResponse('标签必须是数组');
    }

    const repos = await getRepositories();
    const ticket = await repos.tickets.getById(id);

    if (!ticket) {
      return errorResponse('工单不存在', 404);
    }

    await repos.tickets.updateTags(id, tags, currentUser?.id);

    await logger.info('更新工单标签', '标签更新成功', {
      ticketId: id,
      oldTags: ticket.tags,
      newTags: tags,
      operatorId: currentUser?.id
    });

    return successResponse({ message: '标签更新成功' });
  } catch (error) {
    await logger.error('更新工单标签', '更新标签失败：系统错误', {
      error: error instanceof Error ? error.message : String(error),
      operatorId: currentUser?.id
    });

    console.error('更新工单标签失败:', error);
    return errorResponse('更新标签失败');
  }
}
