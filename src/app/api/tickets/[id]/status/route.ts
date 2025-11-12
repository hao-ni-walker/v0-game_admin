import { Logger } from '@/lib/logger';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse } from '@/service/response';
import { getRepositories } from '@/repository';
import type { TicketStatus } from '@/repository/models';

// POST /api/tickets/[id]/status - 更改工单状态
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const currentUser = getCurrentUser(request);
  const logger = new Logger('工单管理', currentUser?.id);

  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return errorResponse('无效的工单ID');
    }

    const body = await request.json();
    const { status, reason } = body;

    if (!status) {
      return errorResponse('请提供新状态');
    }

    const repos = await getRepositories();
    const ticket = await repos.tickets.getById(id);

    if (!ticket) {
      return errorResponse('工单不存在', 404);
    }

    await repos.tickets.changeStatus(
      id,
      status as TicketStatus,
      reason,
      currentUser?.id
    );

    await logger.info('更改工单状态', '工单状态更改成功', {
      ticketId: id,
      oldStatus: ticket.status,
      newStatus: status,
      reason,
      operatorId: currentUser?.id
    });

    return successResponse({ message: '工单状态更改成功' });
  } catch (error) {
    await logger.error('更改工单状态', '更改工单状态失败：系统错误', {
      error: error instanceof Error ? error.message : String(error),
      operatorId: currentUser?.id
    });

    console.error('更改工单状态失败:', error);
    return errorResponse('更改工单状态失败');
  }
}
