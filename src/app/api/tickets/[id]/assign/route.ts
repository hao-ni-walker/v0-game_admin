import { Logger } from '@/lib/logger';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse } from '@/service/response';
import { getRepositories } from '@/repository';

// POST /api/tickets/[id]/assign - 指派工单
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
    const { assigneeId } = body;

    const repos = await getRepositories();
    const ticket = await repos.tickets.getById(id);

    if (!ticket) {
      return errorResponse('工单不存在', 404);
    }

    await repos.tickets.assign(id, assigneeId, currentUser?.id);

    await logger.info('指派工单', '工单指派成功', {
      ticketId: id,
      assigneeId,
      operatorId: currentUser?.id
    });

    return successResponse({ message: '工单指派成功' });
  } catch (error) {
    await logger.error('指派工单', '指派工单失败：系统错误', {
      error: error instanceof Error ? error.message : String(error),
      operatorId: currentUser?.id
    });

    console.error('指派工单失败:', error);
    return errorResponse('指派工单失败');
  }
}
