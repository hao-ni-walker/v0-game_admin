import { Logger } from '@/lib/logger';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse } from '@/service/response';
import { getRepositories } from '@/repository';

// POST /api/tickets/[id]/comment - 添加评论
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
    const { content, isInternal = false } = body;

    if (!content) {
      return errorResponse('评论内容不能为空');
    }

    const repos = await getRepositories();
    const ticket = await repos.tickets.getById(id);

    if (!ticket) {
      return errorResponse('工单不存在', 404);
    }

    const commentId = await repos.tickets.addComment({
      ticketId: id,
      userId: currentUser?.id || 0,
      content,
      isInternal
    });

    await logger.info('添加工单评论', '评论添加成功', {
      ticketId: id,
      commentId,
      isInternal,
      operatorId: currentUser?.id
    });

    return successResponse({ id: commentId, message: '评论添加成功' });
  } catch (error) {
    await logger.error('添加工单评论', '添加评论失败：系统错误', {
      error: error instanceof Error ? error.message : String(error),
      operatorId: currentUser?.id
    });

    console.error('添加工单评论失败:', error);
    return errorResponse('添加评论失败');
  }
}
