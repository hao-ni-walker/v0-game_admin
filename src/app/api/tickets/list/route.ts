import { successResponse, errorResponse } from '@/service/response';
import { getRepositories } from '@/repository';
import { getCurrentUser } from '@/lib/auth';
import type { TicketStatus, TicketPriority } from '@/repository/models';

export async function POST(request: Request) {
  try {
    const currentUser = getCurrentUser(request);
    const body = await request.json();

    const {
      keyword,
      statuses,
      priorities,
      categories,
      tagsAny,
      tagsAll,
      userIds,
      assigneeIds,
      onlyUnassigned,
      createdFrom,
      createdTo,
      updatedFrom,
      updatedTo,
      dueFrom,
      dueTo,
      resolvedFrom,
      resolvedTo,
      closedFrom,
      closedTo,
      onlyOverdue,
      dueWithinMinutes,
      myTickets,
      sortBy,
      sortDir,
      page = 1,
      pageSize = 20
    } = body;

    const repos = await getRepositories();

    const result = await repos.tickets.list({
      keyword,
      statuses: statuses as TicketStatus[],
      priorities: priorities as TicketPriority[],
      categories,
      tagsAny,
      tagsAll,
      userIds,
      assigneeIds,
      onlyUnassigned,
      createdFrom,
      createdTo,
      updatedFrom,
      updatedTo,
      dueFrom,
      dueTo,
      resolvedFrom,
      resolvedTo,
      closedFrom,
      closedTo,
      onlyOverdue,
      dueWithinMinutes,
      myTickets,
      currentUserId: currentUser?.id,
      sortBy,
      sortDir: sortDir as 'asc' | 'desc',
      page,
      limit: pageSize
    });

    return successResponse({
      total: result.total,
      page: result.page,
      page_size: result.limit,
      list: result.data
    });
  } catch (error) {
    console.error('获取工单列表失败:', error);
    return errorResponse('获取工单列表失败');
  }
}
