import { Logger } from '@/lib/logger';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse } from '@/service/response';
import { getRepositories } from '@/repository';

// GET /api/tickets/[id] - 获取工单详情
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return errorResponse('无效的工单ID');
    }

    const repos = await getRepositories();
    const ticket = await repos.tickets.getById(id);

    if (!ticket) {
      return errorResponse('工单不存在', 404);
    }

    return successResponse(ticket);
  } catch (error) {
    console.error('获取工单详情失败:', error);
    return errorResponse('获取工单详情失败');
  }
}

// PATCH /api/tickets/[id] - 更新工单
export async function PATCH(
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
    const repos = await getRepositories();

    const ticket = await repos.tickets.getById(id);
    if (!ticket) {
      return errorResponse('工单不存在', 404);
    }

    await repos.tickets.update(id, body);

    await logger.info('更新工单', '工单更新成功', {
      ticketId: id,
      updates: body,
      operatorId: currentUser?.id
    });

    return successResponse({ message: '工单更新成功' });
  } catch (error) {
    await logger.error('更新工单', '更新工单失败：系统错误', {
      error: error instanceof Error ? error.message : String(error),
      operatorId: currentUser?.id
    });

    console.error('更新工单失败:', error);
    return errorResponse('更新工单失败');
  }
}

// DELETE /api/tickets/[id] - 删除工单
export async function DELETE(
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

    const repos = await getRepositories();
    const ticket = await repos.tickets.getById(id);

    if (!ticket) {
      return errorResponse('工单不存在', 404);
    }

    await repos.tickets.delete(id);

    await logger.info('删除工单', '工单删除成功', {
      ticketId: id,
      operatorId: currentUser?.id
    });

    return successResponse({ message: '工单删除成功' });
  } catch (error) {
    await logger.error('删除工单', '删除工单失败：系统错误', {
      error: error instanceof Error ? error.message : String(error),
      operatorId: currentUser?.id
    });

    console.error('删除工单失败:', error);
    return errorResponse('删除工单失败');
  }
}
