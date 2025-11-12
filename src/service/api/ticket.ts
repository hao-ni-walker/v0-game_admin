import { apiRequest } from './base';
import type { TicketStatus, TicketPriority } from '@/repository/models';

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
    return apiRequest('/tickets/list', {
      method: 'POST',
      body: JSON.stringify(params || {})
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
    return apiRequest(`/tickets/${id}/comment`, {
      method: 'POST',
      body: JSON.stringify({ content, isInternal })
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
}
