import { successResponse, errorResponse } from '@/service/response';
import { getRepositories } from '@/repository';

// GET /api/tickets/[id]/comments - 获取评论列表
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return errorResponse('无效的工单ID');
    }

    const repos = await getRepositories();
    const ticket = await repos.tickets.getById(id);

    if (!ticket) {
      return errorResponse('工单不存在', 404);
    }

    const comments = await repos.tickets.getComments(id);
    // 按时间正序排列（最早的在前）
    comments.sort((a, b) => {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    return successResponse(comments);
  } catch (error) {
    console.error('获取评论列表失败:', error);
    return errorResponse('获取评论列表失败');
  }
}
