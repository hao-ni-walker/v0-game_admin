import { successResponse, errorResponse } from '@/service/response';
import { getRepositories } from '@/repository';

// GET /api/tickets/[id]/events - 获取事件列表
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

    const events = await repos.tickets.getEvents(id);
    // 按时间倒序排列（最新的在前）
    events.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return successResponse(events);
  } catch (error) {
    console.error('获取事件列表失败:', error);
    return errorResponse('获取事件列表失败');
  }
}
