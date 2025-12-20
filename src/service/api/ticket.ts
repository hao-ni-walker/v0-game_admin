import { apiRequest, buildSearchParams } from './base';
import type {
  TicketStatus,
  TicketPriority,
  TicketComment,
  TicketAttachment,
  TicketEvent
} from '@/repository/models';

export interface TicketListParams {
  keyword?: string;
  statuses?: TicketStatus[];
  priorities?: TicketPriority[];
  categories?: string[];
  tagsAny?: string[];
  tagsAll?: string[];
  userIds?: number[];
  assigneeIds?: number[];
  onlyUnassigned?: boolean;
  createdFrom?: string;
  createdTo?: string;
  updatedFrom?: string;
  updatedTo?: string;
  dueFrom?: string;
  dueTo?: string;
  resolvedFrom?: string;
  resolvedTo?: string;
  closedFrom?: string;
  closedTo?: string;
  onlyOverdue?: boolean;
  dueWithinMinutes?: number;
  myTickets?: boolean;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface CreateTicketParams {
  title: string;
  description: string;
  priority?: TicketPriority;
  category: string;
  tags?: string[];
  userId: number;
  dueAt?: string;
}

export interface UpdateTicketParams {
  title?: string;
  description?: string;
  priority?: TicketPriority;
  category?: string;
  tags?: string[];
  dueAt?: string;
}

// 工单相关 API
export class TicketAPI {
  // 获取工单列表
  static async getTickets(params?: TicketListParams) {
    // 将参数转换为查询参数
    const queryParams: Record<string, any> = {};

    if (params) {
      // 分页参数
      if (params.page !== undefined) {
        queryParams.page = params.page;
      }
      if (params.pageSize !== undefined) {
        queryParams.page_size = params.pageSize;
      }

      // 其他可能的查询参数
      if (params.keyword) {
        queryParams.keyword = params.keyword;
      }
      if (params.statuses && params.statuses.length > 0) {
        queryParams.status = params.statuses.join(',');
      }
      if (params.priorities && params.priorities.length > 0) {
        queryParams.priority = params.priorities.join(',');
      }
      if (params.categories && params.categories.length > 0) {
        queryParams.category = params.categories.join(',');
      }
      if (params.userIds && params.userIds.length > 0) {
        queryParams.user_id = params.userIds.join(',');
      }
      if (params.assigneeIds && params.assigneeIds.length > 0) {
        queryParams.assignee_id = params.assigneeIds.join(',');
      }
      if (params.onlyUnassigned !== undefined) {
        queryParams.only_unassigned = params.onlyUnassigned;
      }
      if (params.sortBy) {
        queryParams.sort_by = params.sortBy;
      }
      if (params.sortDir) {
        queryParams.sort_dir = params.sortDir;
      }
    }

    const searchParams = buildSearchParams(queryParams);
    const endpoint = `/admin/tickets${searchParams ? `?${searchParams}` : ''}`;

    return apiRequest(endpoint, {
      method: 'GET'
    });
  }

  // 获取工单详情
  static async getTicket(id: number) {
    return apiRequest(`/tickets/${id}`);
  }

  // 创建工单
  static async createTicket(ticketData: CreateTicketParams) {
    return apiRequest('/tickets', {
      method: 'POST',
      body: JSON.stringify(ticketData)
    });
  }

  // 更新工单
  static async updateTicket(id: number, ticketData: UpdateTicketParams) {
    return apiRequest(`/tickets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(ticketData)
    });
  }

  // 删除工单
  static async deleteTicket(id: number) {
    return apiRequest(`/tickets/${id}`, {
      method: 'DELETE'
    });
  }

  // 指派工单
  static async assignTicket(id: number, assigneeId: number | null) {
    return apiRequest(`/tickets/${id}/assign`, {
      method: 'POST',
      body: JSON.stringify({ assigneeId })
    });
  }

  // 更改工单状态
  static async changeTicketStatus(
    id: number,
    status: TicketStatus,
    reason?: string
  ) {
    return apiRequest(`/tickets/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status, reason })
    });
  }

  // 添加评论
  static async addComment(
    id: number,
    content: string,
    isInternal: boolean = false
  ) {
    // 注意：远程 API 只支持 content 字段，isInternal 参数暂不支持
    // 如果未来需要支持 isInternal，可能需要使用不同的端点或字段
    return apiRequest(`/tickets/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content })
    });
  }

  // 更新标签
  static async updateTags(id: number, tags: string[]) {
    return apiRequest(`/tickets/${id}/tags`, {
      method: 'POST',
      body: JSON.stringify({ tags })
    });
  }

  // 更新截止时间
  static async updateDueAt(id: number, dueAt: string | null) {
    return apiRequest(`/tickets/${id}/due`, {
      method: 'POST',
      body: JSON.stringify({ dueAt })
    });
  }

  // 获取评论列表
  static async getComments(ticketId: number): Promise<{
    code: number;
    data?: TicketComment[];
    message?: string;
    success: boolean;
  }> {
    const response = await apiRequest(`/tickets/${ticketId}/comments`);
    // 处理返回的数据格式：可能直接是数组，也可能在 data.items 中
    if (response.success && response.data) {
      // 如果 data 是数组，直接返回；如果不是，尝试从 data.items 获取
      const comments = Array.isArray(response.data)
        ? response.data
        : (response.data as any)?.items || response.data || [];
      return {
        ...response,
        data: comments
      };
    }
    return response;
  }

  // 获取附件列表
  static async getAttachments(ticketId: number): Promise<{
    code: number;
    data?: TicketAttachment[];
    message?: string;
    success: boolean;
  }> {
    return apiRequest(`/tickets/${ticketId}/attachments`);
  }

  // 上传附件
  static async uploadAttachment(ticketId: number, file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return apiRequest(`/tickets/${ticketId}/attachments`, {
      method: 'POST',
      body: formData
      // 注意：不要设置 Content-Type，让浏览器自动设置 multipart/form-data
    }) as Promise<
      | { success: true; data: TicketAttachment }
      | { success: false; message: string }
    >;
  }

  // 删除附件
  static async deleteAttachment(attachmentId: number) {
    return apiRequest(`/ticket-attachments/${attachmentId}`, {
      method: 'DELETE'
    });
  }

  // 获取事件列表
  static async getEvents(ticketId: number): Promise<{
    code: number;
    data?: TicketEvent[];
    message?: string;
    success: boolean;
  }> {
    return apiRequest(`/tickets/${ticketId}/events`);
  }
}
